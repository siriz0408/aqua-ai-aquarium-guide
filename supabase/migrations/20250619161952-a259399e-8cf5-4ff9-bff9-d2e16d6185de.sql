
-- Step 1: Create backup of profiles table with all current data
CREATE TABLE public._backup_profiles AS 
SELECT * FROM public.profiles;

-- Step 2: Drop redundant subscription tracking tables
DROP TABLE IF EXISTS public.subscribers CASCADE;
DROP TABLE IF EXISTS public.subscriptions CASCADE;
DROP TABLE IF EXISTS public.customers CASCADE;
DROP TABLE IF EXISTS public.subscription_events CASCADE;

-- Step 3: Clean up unused/redundant fields from profiles table
-- Based on your requirements, removing: subscription_type, trial_started_at, stripe_price_id
ALTER TABLE public.profiles 
DROP COLUMN IF EXISTS subscription_type,
DROP COLUMN IF EXISTS trial_started_at,
DROP COLUMN IF EXISTS stripe_price_id;

-- Step 4: Ensure essential Stripe fields exist (add if missing)
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS stripe_customer_id CHARACTER VARYING,
ADD COLUMN IF NOT EXISTS stripe_subscription_id CHARACTER VARYING;

-- Step 5: Add performance indexes
CREATE INDEX IF NOT EXISTS idx_profiles_email ON public.profiles(email);
CREATE INDEX IF NOT EXISTS idx_profiles_stripe_customer_id ON public.profiles(stripe_customer_id);
CREATE INDEX IF NOT EXISTS idx_profiles_stripe_subscription_id ON public.profiles(stripe_subscription_id);
CREATE INDEX IF NOT EXISTS idx_profiles_subscription_status ON public.profiles(subscription_status);
CREATE INDEX IF NOT EXISTS idx_profiles_is_admin ON public.profiles(is_admin);

-- Step 6: Add indexes to webhook_events for better performance
CREATE INDEX IF NOT EXISTS idx_webhook_events_stripe_event_id ON public.webhook_events(stripe_event_id);
CREATE INDEX IF NOT EXISTS idx_webhook_events_processing_status ON public.webhook_events(processing_status);
CREATE INDEX IF NOT EXISTS idx_webhook_events_user_email ON public.webhook_events(user_email);

-- Step 7: Fix RLS policies to prevent infinite recursion
-- Drop all existing problematic RLS policies
DROP POLICY IF EXISTS "profiles_users_own_data" ON public.profiles;
DROP POLICY IF EXISTS "profiles_service_role_full_access" ON public.profiles;
DROP POLICY IF EXISTS "profiles_select_policy" ON public.profiles;
DROP POLICY IF EXISTS "profiles_update_policy" ON public.profiles;
DROP POLICY IF EXISTS "profiles_insert_policy" ON public.profiles;
DROP POLICY IF EXISTS "profiles_service_role_policy" ON public.profiles;
DROP POLICY IF EXISTS "profiles_select_own" ON public.profiles;
DROP POLICY IF EXISTS "profiles_update_own" ON public.profiles;
DROP POLICY IF EXISTS "profiles_insert_own" ON public.profiles;
DROP POLICY IF EXISTS "profiles_service_role_access" ON public.profiles;

-- Create simple, non-recursive RLS policies for profiles
CREATE POLICY "profiles_select_own" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "profiles_update_own" ON public.profiles  
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "profiles_insert_own" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Create service role policy that bypasses RLS for webhooks and admin functions
CREATE POLICY "profiles_service_role_access" ON public.profiles
  FOR ALL USING (
    current_setting('role') = 'service_role' OR
    current_setting('request.jwt.claims', true)::json->>'role' = 'service_role'
  );

-- Step 8: Create simplified sync function for Stripe subscriptions
CREATE OR REPLACE FUNCTION public.sync_stripe_subscription(
  customer_email TEXT,
  stripe_customer_id TEXT,
  stripe_subscription_id TEXT DEFAULT NULL,
  subscription_status TEXT DEFAULT 'expired',
  price_id TEXT DEFAULT NULL
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  user_id UUID;
  result jsonb;
BEGIN
  -- Find user by email
  SELECT id INTO user_id 
  FROM profiles 
  WHERE email = customer_email;
  
  IF user_id IS NULL THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'User not found with email: ' || customer_email
    );
  END IF;
  
  -- Update user profile with Stripe data
  UPDATE profiles SET
    stripe_customer_id = sync_stripe_subscription.stripe_customer_id,
    stripe_subscription_id = sync_stripe_subscription.stripe_subscription_id,
    subscription_status = CASE 
      WHEN subscription_status IN ('active', 'trialing') THEN 'active'
      WHEN subscription_status = 'canceled' THEN 'expired'
      WHEN subscription_status IN ('past_due', 'unpaid', 'incomplete') THEN 'expired'
      ELSE 'expired'
    END,
    subscription_tier = CASE 
      WHEN subscription_status IN ('active', 'trialing') THEN 'pro'
      ELSE 'free'
    END,
    subscription_end_date = CASE 
      WHEN subscription_status IN ('canceled', 'past_due', 'unpaid', 'incomplete') THEN NOW()
      ELSE subscription_end_date
    END,
    updated_at = NOW()
  WHERE id = user_id;
  
  RETURN jsonb_build_object(
    'success', true,
    'user_id', user_id,
    'email', customer_email,
    'status_updated', subscription_status
  );
END;
$$;

-- Grant necessary permissions
GRANT EXECUTE ON FUNCTION public.sync_stripe_subscription TO anon, authenticated, service_role;

-- Step 9: Update webhook processing function to work with simplified schema
CREATE OR REPLACE FUNCTION public.process_webhook_event(
  event_id text, 
  event_type text, 
  event_data jsonb
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  customer_id TEXT;
  subscription_id TEXT;
  customer_email TEXT;
  subscription_status TEXT;
  current_period_end TIMESTAMP WITH TIME ZONE;
  sync_result JSONB;
BEGIN
  -- Update webhook event tracking
  INSERT INTO webhook_events (
    stripe_event_id, event_type, raw_data, processing_status
  ) VALUES (
    event_id, event_type, event_data, 'processing'
  ) ON CONFLICT (stripe_event_id) DO UPDATE SET
    processing_status = 'processing',
    raw_data = event_data;
  
  -- Extract data based on event type
  CASE event_type
    WHEN 'customer.subscription.created', 'customer.subscription.updated', 'customer.subscription.deleted' THEN
      customer_id := event_data->'data'->'object'->>'customer';
      subscription_id := event_data->'data'->'object'->>'id';
      subscription_status := event_data->'data'->'object'->>'status';
      current_period_end := TO_TIMESTAMP((event_data->'data'->'object'->>'current_period_end')::bigint);
      
    WHEN 'invoice.payment_succeeded', 'invoice.payment_failed' THEN
      customer_id := event_data->'data'->'object'->>'customer';
      subscription_id := event_data->'data'->'object'->>'subscription';
      
    ELSE
      -- Update webhook event as unsupported
      UPDATE webhook_events SET
        processing_status = 'skipped',
        error_message = 'Unsupported event type',
        processed_at = NOW()
      WHERE stripe_event_id = event_id;
      
      RETURN jsonb_build_object('success', true, 'action', 'skipped', 'reason', 'unsupported_event_type');
  END CASE;
  
  -- Find customer email
  SELECT email INTO customer_email
  FROM profiles
  WHERE stripe_customer_id = customer_id
  LIMIT 1;
  
  IF customer_email IS NULL THEN
    UPDATE webhook_events SET
      processing_status = 'failed',
      error_message = 'Customer email not found for customer_id: ' || customer_id,
      processed_at = NOW()
    WHERE stripe_event_id = event_id;
    
    RETURN jsonb_build_object('success', false, 'error', 'Customer not found');
  END IF;
  
  -- Sync subscription using the updated function
  SELECT sync_stripe_subscription(
    customer_email,
    customer_id,
    subscription_id,
    subscription_status,
    NULL
  ) INTO sync_result;
  
  -- Update webhook event status
  IF sync_result->>'success' = 'true' THEN
    UPDATE webhook_events SET
      processing_status = 'completed',
      customer_id = customer_id,
      subscription_id = subscription_id,
      user_email = customer_email,
      user_id = (sync_result->>'user_id')::UUID,
      processed_at = NOW()
    WHERE stripe_event_id = event_id;
  ELSE
    UPDATE webhook_events SET
      processing_status = 'failed',
      error_message = sync_result->>'error',
      processed_at = NOW()
    WHERE stripe_event_id = event_id;
  END IF;
  
  RETURN sync_result;
END;
$$;

-- Grant execute permission for webhook processing
GRANT EXECUTE ON FUNCTION public.process_webhook_event TO anon, authenticated, service_role;
