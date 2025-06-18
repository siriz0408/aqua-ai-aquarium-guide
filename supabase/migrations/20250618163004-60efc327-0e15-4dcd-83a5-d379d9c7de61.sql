
-- First, let's clean up the database schema by removing redundant subscription tables
-- and fixing the RLS policies that are causing infinite recursion

-- Drop redundant subscription tracking tables
DROP TABLE IF EXISTS public.subscribers CASCADE;
DROP TABLE IF EXISTS public.subscriptions CASCADE;
DROP TABLE IF EXISTS public.customers CASCADE;
DROP TABLE IF EXISTS public.subscription_events CASCADE;

-- Keep only the essential webhook tracking
-- webhook_events table is good for monitoring

-- Simplify the profiles table by removing confusing subscription fields
-- and keep only what's essential for the integration
ALTER TABLE public.profiles 
DROP COLUMN IF EXISTS subscription_type,
DROP COLUMN IF EXISTS trial_started_at,
DROP COLUMN IF EXISTS stripe_price_id;

-- Add missing essential fields if they don't exist
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS stripe_customer_id TEXT,
ADD COLUMN IF NOT EXISTS stripe_subscription_id TEXT;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_profiles_stripe_customer_id 
ON public.profiles(stripe_customer_id);

CREATE INDEX IF NOT EXISTS idx_profiles_stripe_subscription_id 
ON public.profiles(stripe_subscription_id);

-- Fix the RLS policies to prevent infinite recursion
-- Drop all existing problematic policies
DROP POLICY IF EXISTS "profiles_select_own" ON public.profiles;
DROP POLICY IF EXISTS "profiles_update_own" ON public.profiles;
DROP POLICY IF EXISTS "profiles_insert_own" ON public.profiles;
DROP POLICY IF EXISTS "profiles_service_role_access" ON public.profiles;

-- Create simple, non-recursive policies
CREATE POLICY "profiles_users_own_data" 
ON public.profiles FOR ALL 
USING (auth.uid() = id);

CREATE POLICY "profiles_service_role_full_access" 
ON public.profiles FOR ALL 
USING (auth.jwt() ->> 'role' = 'service_role');

-- Create a simple sync function that the webhook can use
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

-- Grant execute permission
GRANT EXECUTE ON FUNCTION public.sync_stripe_subscription TO anon;
GRANT EXECUTE ON FUNCTION public.sync_stripe_subscription TO authenticated;
