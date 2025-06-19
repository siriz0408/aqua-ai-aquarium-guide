
-- Fix any remaining RLS policy issues that might cause infinite recursion
-- First, drop any problematic policies
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

-- Create clean, simple RLS policies that won't cause recursion
CREATE POLICY "profiles_user_access" ON public.profiles
  FOR ALL USING (auth.uid() = id);

CREATE POLICY "profiles_service_access" ON public.profiles
  FOR ALL USING (
    current_setting('role') = 'service_role' OR
    auth.jwt() ->> 'role' = 'service_role'
  );

-- Add missing CHECK constraints if they don't exist
DO $$
BEGIN
  -- Add subscription_status constraint if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE table_name = 'profiles' 
    AND constraint_name = 'check_subscription_status'
  ) THEN
    ALTER TABLE public.profiles 
    ADD CONSTRAINT check_subscription_status 
    CHECK (subscription_status IN ('free', 'trial', 'active', 'past_due', 'canceled', 'expired'));
  END IF;

  -- Add subscription_tier constraint if it doesn't exist  
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE table_name = 'profiles' 
    AND constraint_name = 'check_subscription_tier'
  ) THEN
    ALTER TABLE public.profiles 
    ADD CONSTRAINT check_subscription_tier 
    CHECK (subscription_tier IN ('free', 'pro'));
  END IF;
END $$;

-- Ensure proper indexes exist for performance
CREATE INDEX IF NOT EXISTS idx_profiles_email ON public.profiles(email);
CREATE INDEX IF NOT EXISTS idx_profiles_stripe_customer_id ON public.profiles(stripe_customer_id);
CREATE INDEX IF NOT EXISTS idx_profiles_stripe_subscription_id ON public.profiles(stripe_subscription_id);
CREATE INDEX IF NOT EXISTS idx_profiles_subscription_status ON public.profiles(subscription_status);
CREATE INDEX IF NOT EXISTS idx_profiles_subscription_tier ON public.profiles(subscription_tier);

-- Ensure webhook_events indexes exist
CREATE INDEX IF NOT EXISTS idx_webhook_events_stripe_event_id ON public.webhook_events(stripe_event_id);
CREATE INDEX IF NOT EXISTS idx_webhook_events_processing_status ON public.webhook_events(processing_status);
CREATE INDEX IF NOT EXISTS idx_webhook_events_user_email ON public.webhook_events(user_email);
CREATE INDEX IF NOT EXISTS idx_webhook_events_created_at ON public.webhook_events(created_at);

-- Verify the sync_stripe_subscription function signature and update if needed
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
