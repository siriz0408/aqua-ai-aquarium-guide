
-- Phase 1: Database Foundation Recovery
-- Critical missing functions and schema fixes

-- 1. Create check_user_admin_status function (used by AdminProtectedRoute)
CREATE OR REPLACE FUNCTION public.check_user_admin_status(user_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COALESCE(is_admin, false) 
  FROM public.profiles 
  WHERE id = user_id;
$$;

-- 2. Create comprehensive subscription access function
CREATE OR REPLACE FUNCTION public.check_user_subscription_access(user_id UUID)
RETURNS TABLE(
  has_access BOOLEAN,
  access_type TEXT,
  subscription_tier TEXT,
  trial_hours_remaining NUMERIC,
  trial_type TEXT,
  can_start_trial BOOLEAN,
  subscription_end_date TIMESTAMP WITH TIME ZONE
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  user_record RECORD;
  hours_remaining NUMERIC;
  now_timestamp TIMESTAMP WITH TIME ZONE := NOW();
BEGIN
  -- Get comprehensive user profile
  SELECT 
    id, is_admin, subscription_status, subscription_tier, stripe_subscription_id,
    trial_end_date, trial_started_at, has_used_trial, trial_type,
    subscription_end_date as sub_end_date
  INTO user_record
  FROM profiles
  WHERE id = user_id;
  
  -- User not found
  IF user_record IS NULL THEN
    RETURN QUERY SELECT FALSE, 'no_user'::TEXT, 'free'::TEXT, 0::NUMERIC, NULL::TEXT, FALSE, NULL::TIMESTAMP WITH TIME ZONE;
    RETURN;
  END IF;
  
  -- Admin always has access
  IF user_record.is_admin = TRUE THEN
    RETURN QUERY SELECT TRUE, 'admin'::TEXT, 'unlimited'::TEXT, 0::NUMERIC, NULL::TEXT, FALSE, NULL::TIMESTAMP WITH TIME ZONE;
    RETURN;
  END IF;
  
  -- Active paid subscription (most reliable check)
  IF user_record.stripe_subscription_id IS NOT NULL 
     AND user_record.stripe_subscription_id != '' 
     AND user_record.subscription_status = 'active' 
     AND user_record.subscription_tier = 'pro' THEN
    RETURN QUERY SELECT TRUE, 'paid'::TEXT, 'pro'::TEXT, 0::NUMERIC, NULL::TEXT, FALSE, user_record.sub_end_date;
    RETURN;
  END IF;
  
  -- Check active trial
  IF user_record.subscription_status = 'trial' AND user_record.trial_end_date IS NOT NULL THEN
    hours_remaining := EXTRACT(EPOCH FROM (user_record.trial_end_date - now_timestamp)) / 3600;
    
    IF hours_remaining > 0 THEN
      RETURN QUERY SELECT TRUE, 'trial'::TEXT, 'trial'::TEXT, hours_remaining, user_record.trial_type, FALSE, user_record.trial_end_date;
      RETURN;
    ELSE
      -- Trial expired, update status
      UPDATE profiles 
      SET subscription_status = 'expired', updated_at = now_timestamp
      WHERE id = user_id;
      
      RETURN QUERY SELECT FALSE, 'trial_expired'::TEXT, 'free'::TEXT, 0::NUMERIC, user_record.trial_type, FALSE, user_record.trial_end_date;
      RETURN;
    END IF;
  END IF;
  
  -- Check if user can start a trial (hasn't used one before)
  IF user_record.has_used_trial = FALSE OR user_record.has_used_trial IS NULL THEN
    RETURN QUERY SELECT FALSE, 'free'::TEXT, 'free'::TEXT, 0::NUMERIC, NULL::TEXT, TRUE, NULL::TIMESTAMP WITH TIME ZONE;
    RETURN;
  END IF;
  
  -- Default: free user who has already used trial
  RETURN QUERY SELECT FALSE, 'free'::TEXT, 'free'::TEXT, 0::NUMERIC, NULL::TEXT, FALSE, NULL::TIMESTAMP WITH TIME ZONE;
END;
$$;

-- 3. Add missing trial tracking columns to profiles table
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS has_used_trial BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS trial_type VARCHAR(20) DEFAULT NULL,
ADD COLUMN IF NOT EXISTS trial_stripe_subscription_id VARCHAR(255) DEFAULT NULL,
ADD COLUMN IF NOT EXISTS trial_started_at TIMESTAMP WITH TIME ZONE DEFAULT NULL,
ADD COLUMN IF NOT EXISTS last_trial_start TIMESTAMP WITH TIME ZONE DEFAULT NULL,
ADD COLUMN IF NOT EXISTS total_trial_count INTEGER DEFAULT 0;

-- 4. Create subscription events tracking table
CREATE TABLE IF NOT EXISTS public.subscription_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  event_type VARCHAR(50) NOT NULL,
  stripe_event_id VARCHAR(255) UNIQUE,
  stripe_subscription_id VARCHAR(255),
  stripe_customer_id VARCHAR(255),
  event_data JSONB DEFAULT '{}',
  processed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. Create trial start function with prevention logic
CREATE OR REPLACE FUNCTION public.start_user_trial_safe(
  user_id UUID,
  trial_length_days INTEGER DEFAULT 3,
  trial_type TEXT DEFAULT 'database'
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  user_record RECORD;
  trial_end TIMESTAMP WITH TIME ZONE;
BEGIN
  -- Get user data
  SELECT * INTO user_record FROM profiles WHERE id = user_id;
  
  IF user_record IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'User not found');
  END IF;
  
  -- Check if user has already used trial
  IF user_record.has_used_trial = TRUE THEN
    RETURN jsonb_build_object('success', false, 'error', 'User has already used their free trial');
  END IF;
  
  -- Check if user already has active subscription
  IF user_record.subscription_status = 'active' AND user_record.subscription_tier = 'pro' THEN
    RETURN jsonb_build_object('success', false, 'error', 'User already has active subscription');
  END IF;
  
  -- Start trial
  trial_end := NOW() + INTERVAL '1 day' * trial_length_days;
  
  UPDATE profiles 
  SET 
    subscription_status = 'trial',
    trial_started_at = NOW(),
    trial_end_date = trial_end,
    has_used_trial = TRUE,
    trial_type = start_user_trial_safe.trial_type,
    last_trial_start = NOW(),
    total_trial_count = COALESCE(total_trial_count, 0) + 1,
    updated_at = NOW()
  WHERE id = user_id;
  
  -- Log the trial start event
  INSERT INTO subscription_events (user_id, event_type, event_data)
  VALUES (user_id, 'trial_started', jsonb_build_object(
    'trial_type', trial_type,
    'trial_length_days', trial_length_days,
    'trial_end_date', trial_end
  ));
  
  RETURN jsonb_build_object(
    'success', true,
    'trial_end_date', trial_end,
    'trial_type', trial_type,
    'message', 'Trial started successfully'
  );
END;
$$;

-- 6. Enhanced sync function for webhooks
CREATE OR REPLACE FUNCTION public.sync_stripe_subscription_enhanced(
  customer_email TEXT,
  stripe_customer_id TEXT,
  stripe_subscription_id TEXT DEFAULT NULL,
  subscription_status TEXT DEFAULT 'expired',
  price_id TEXT DEFAULT NULL,
  current_period_end TIMESTAMP WITH TIME ZONE DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  user_id UUID;
  old_status TEXT;
  new_status TEXT;
  new_tier TEXT;
BEGIN
  -- Find user by email
  SELECT id, subscription_status INTO user_id, old_status 
  FROM profiles 
  WHERE email = customer_email;
  
  IF user_id IS NULL THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'User not found with email: ' || customer_email
    );
  END IF;
  
  -- Determine new status and tier
  IF subscription_status IN ('active', 'trialing') THEN
    new_status := 'active';
    new_tier := 'pro';
  ELSE
    new_status := 'expired';
    new_tier := 'free';
  END IF;
  
  -- Update user profile
  UPDATE profiles SET
    stripe_customer_id = sync_stripe_subscription_enhanced.stripe_customer_id,
    stripe_subscription_id = sync_stripe_subscription_enhanced.stripe_subscription_id,
    stripe_price_id = price_id,
    subscription_status = new_status,
    subscription_tier = new_tier,
    subscription_end_date = current_period_end,
    subscription_start_date = CASE 
      WHEN old_status != 'active' AND new_status = 'active' THEN NOW()
      ELSE subscription_start_date
    END,
    updated_at = NOW()
  WHERE id = user_id;
  
  -- Log subscription event
  INSERT INTO subscription_events (
    user_id, event_type, stripe_subscription_id, stripe_customer_id, event_data
  ) VALUES (
    user_id, 
    CASE 
      WHEN new_status = 'active' THEN 'subscription_activated'
      ELSE 'subscription_deactivated'
    END,
    stripe_subscription_id,
    stripe_customer_id,
    jsonb_build_object(
      'old_status', old_status,
      'new_status', new_status,
      'stripe_status', subscription_status,
      'price_id', price_id,
      'period_end', current_period_end
    )
  );
  
  RETURN jsonb_build_object(
    'success', true,
    'user_id', user_id,
    'email', customer_email,
    'old_status', old_status,
    'new_status', new_status,
    'stripe_subscription_id', stripe_subscription_id
  );
END;
$$;

-- 7. Grant necessary permissions
GRANT EXECUTE ON FUNCTION public.check_user_admin_status TO authenticated;
GRANT EXECUTE ON FUNCTION public.check_user_subscription_access TO authenticated;
GRANT EXECUTE ON FUNCTION public.start_user_trial_safe TO authenticated;
GRANT EXECUTE ON FUNCTION public.sync_stripe_subscription_enhanced TO authenticated;

-- 8. Enable RLS on new table
ALTER TABLE public.subscription_events ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for subscription_events
CREATE POLICY "Users can view own subscription events" 
  ON public.subscription_events FOR SELECT 
  USING (user_id = auth.uid());

CREATE POLICY "Service role can manage subscription events" 
  ON public.subscription_events FOR ALL 
  USING (auth.jwt()->>'role' = 'service_role');

-- 9. Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_subscription_events_user_id ON subscription_events(user_id);
CREATE INDEX IF NOT EXISTS idx_subscription_events_type ON subscription_events(event_type);
CREATE INDEX IF NOT EXISTS idx_profiles_trial_status ON profiles(subscription_status, trial_end_date);
CREATE INDEX IF NOT EXISTS idx_profiles_subscription_active ON profiles(subscription_status, subscription_tier, stripe_subscription_id);
