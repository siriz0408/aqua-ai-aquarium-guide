
-- Remove unused/redundant subscription tracking tables that are no longer needed
-- These were replaced by the simplified approach in the profiles table
DROP TABLE IF EXISTS public.subscribers CASCADE;
DROP TABLE IF EXISTS public.subscriptions CASCADE;
DROP TABLE IF EXISTS public.customers CASCADE;
DROP TABLE IF EXISTS public.subscription_events CASCADE;

-- Clean up redundant webhook tracking - keep only webhook_events, remove webhook_logs
DROP TABLE IF EXISTS public.webhook_logs CASCADE;

-- Remove unused GBIF import functionality that appears to be unused
DROP TABLE IF EXISTS public.gbif_import_jobs CASCADE;
DROP TABLE IF EXISTS public.species_images CASCADE;

-- Consolidate similar fields in profiles table
-- Remove redundant trial tracking fields since we have trial_start_date/trial_end_date
-- Remove stripe_price_id as it's not used consistently
ALTER TABLE public.profiles 
DROP COLUMN IF EXISTS trial_started_at;

-- Add missing indexes for better performance on commonly queried fields
CREATE INDEX IF NOT EXISTS idx_profiles_email ON public.profiles(email);
CREATE INDEX IF NOT EXISTS idx_profiles_subscription_status ON public.profiles(subscription_status);
CREATE INDEX IF NOT EXISTS idx_profiles_is_admin ON public.profiles(is_admin);
CREATE INDEX IF NOT EXISTS idx_webhook_events_stripe_event_id ON public.webhook_events(stripe_event_id);
CREATE INDEX IF NOT EXISTS idx_webhook_events_processing_status ON public.webhook_events(processing_status);

-- Clean up unused functions that reference dropped tables
DROP FUNCTION IF EXISTS public.expire_trials();
DROP FUNCTION IF EXISTS public.check_trial_status(uuid);

-- Update the sync function to remove references to dropped fields
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

-- Remove unused check constraint validation functions that are no longer needed
DROP FUNCTION IF EXISTS public.process_stripe_webhook(text, text, text, text, jsonb);
DROP FUNCTION IF EXISTS public.update_expired_trials();
DROP FUNCTION IF EXISTS public.refresh_subscription_status(uuid);

-- Clean up any orphaned admin activity logs references
DELETE FROM public.admin_activity_logs 
WHERE target_type IN ('subscription', 'trial', 'gbif_job') 
   OR action LIKE '%subscription%' 
   OR action LIKE '%trial%';

-- Update webhook processing function to work with simplified schema
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
