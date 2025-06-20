
-- Comprehensive Trial Checkout Fix Migration
-- This migration addresses all the issues identified in the trial checkout flow

-- 1. Drop and recreate the check_user_subscription_access function with proper error handling
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
  -- Get comprehensive user profile with better error handling
  BEGIN
    SELECT 
      id, is_admin, subscription_status, subscription_tier, stripe_subscription_id,
      trial_end_date, trial_started_at, has_used_trial, trial_type,
      subscription_end_date as sub_end_date
    INTO user_record
    FROM profiles
    WHERE id = user_id;
  EXCEPTION
    WHEN OTHERS THEN
      -- Log error and return safe defaults
      RAISE WARNING 'Error fetching user profile for user_id %: %', user_id, SQLERRM;
      RETURN QUERY SELECT FALSE, 'error'::TEXT, 'free'::TEXT, 0::NUMERIC, NULL::TEXT, FALSE, NULL::TIMESTAMP WITH TIME ZONE;
      RETURN;
  END;
  
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
  
  -- Check active trial with improved logic
  IF user_record.subscription_status = 'trial' AND user_record.trial_end_date IS NOT NULL THEN
    hours_remaining := EXTRACT(EPOCH FROM (user_record.trial_end_date - now_timestamp)) / 3600;
    
    IF hours_remaining > 0 THEN
      RETURN QUERY SELECT TRUE, 'trial'::TEXT, 'trial'::TEXT, hours_remaining, user_record.trial_type, FALSE, user_record.trial_end_date;
      RETURN;
    ELSE
      -- Trial expired, update status atomically
      BEGIN
        UPDATE profiles 
        SET subscription_status = 'expired', updated_at = now_timestamp
        WHERE id = user_id AND subscription_status = 'trial';
      EXCEPTION
        WHEN OTHERS THEN
          RAISE WARNING 'Error updating expired trial for user_id %: %', user_id, SQLERRM;
      END;
      
      RETURN QUERY SELECT FALSE, 'trial_expired'::TEXT, 'free'::TEXT, 0::NUMERIC, user_record.trial_type, FALSE, user_record.trial_end_date;
      RETURN;
    END IF;
  END IF;
  
  -- Check if user can start a trial (improved logic)
  IF COALESCE(user_record.has_used_trial, FALSE) = FALSE THEN
    RETURN QUERY SELECT FALSE, 'free'::TEXT, 'free'::TEXT, 0::NUMERIC, NULL::TEXT, TRUE, NULL::TIMESTAMP WITH TIME ZONE;
    RETURN;
  END IF;
  
  -- Default: free user who has already used trial
  RETURN QUERY SELECT FALSE, 'free'::TEXT, 'free'::TEXT, 0::NUMERIC, NULL::TEXT, FALSE, NULL::TIMESTAMP WITH TIME ZONE;
END;
$$;

-- 2. Enhanced trial start function with better error handling
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
  now_timestamp TIMESTAMP WITH TIME ZONE := NOW();
BEGIN
  -- Validate inputs
  IF trial_length_days < 1 OR trial_length_days > 14 THEN
    RETURN jsonb_build_object(
      'success', false, 
      'error', 'Invalid trial length. Must be between 1 and 14 days.'
    );
  END IF;
  
  IF trial_type NOT IN ('database', 'stripe') THEN
    RETURN jsonb_build_object(
      'success', false, 
      'error', 'Invalid trial type. Must be either "database" or "stripe".'
    );
  END IF;
  
  -- Get user data with error handling
  BEGIN
    SELECT * INTO user_record FROM profiles WHERE id = user_id;
  EXCEPTION
    WHEN OTHERS THEN
      RETURN jsonb_build_object(
        'success', false, 
        'error', 'Failed to fetch user data: ' || SQLERRM
      );
  END;
  
  IF user_record IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'User not found');
  END IF;
  
  -- Check if user has already used trial
  IF COALESCE(user_record.has_used_trial, FALSE) = TRUE THEN
    RETURN jsonb_build_object(
      'success', false, 
      'error', 'User has already used their free trial',
      'details', jsonb_build_object(
        'has_used_trial', user_record.has_used_trial,
        'last_trial_start', user_record.last_trial_start
      )
    );
  END IF;
  
  -- Check if user already has active subscription
  IF user_record.subscription_status = 'active' AND user_record.subscription_tier = 'pro' THEN
    RETURN jsonb_build_object(
      'success', false, 
      'error', 'User already has active subscription',
      'details', jsonb_build_object(
        'current_status', user_record.subscription_status,
        'current_tier', user_record.subscription_tier
      )
    );
  END IF;
  
  -- Check if user already has active trial
  IF user_record.subscription_status = 'trial' AND user_record.trial_end_date > now_timestamp THEN
    RETURN jsonb_build_object(
      'success', false, 
      'error', 'User already has an active trial',
      'details', jsonb_build_object(
        'trial_end_date', user_record.trial_end_date,
        'hours_remaining', EXTRACT(EPOCH FROM (user_record.trial_end_date - now_timestamp)) / 3600
      )
    );
  END IF;
  
  -- Start trial with atomic update
  trial_end := now_timestamp + INTERVAL '1 day' * trial_length_days;
  
  BEGIN
    UPDATE profiles 
    SET 
      subscription_status = 'trial',
      trial_started_at = now_timestamp,
      trial_end_date = trial_end,
      has_used_trial = TRUE,
      trial_type = start_user_trial_safe.trial_type,
      last_trial_start = now_timestamp,
      total_trial_count = COALESCE(total_trial_count, 0) + 1,
      updated_at = now_timestamp
    WHERE id = user_id;
    
    -- Verify the update was successful
    IF NOT FOUND THEN
      RETURN jsonb_build_object(
        'success', false, 
        'error', 'Failed to update user trial status'
      );
    END IF;
  EXCEPTION
    WHEN OTHERS THEN
      RETURN jsonb_build_object(
        'success', false, 
        'error', 'Database error while starting trial: ' || SQLERRM
      );
  END;
  
  -- Log the trial start event
  BEGIN
    INSERT INTO subscription_events (user_id, event_type, event_data)
    VALUES (user_id, 'trial_started', jsonb_build_object(
      'trial_type', trial_type,
      'trial_length_days', trial_length_days,
      'trial_end_date', trial_end,
      'started_at', now_timestamp
    ));
  EXCEPTION
    WHEN OTHERS THEN
      -- Log error but don't fail the trial start
      RAISE WARNING 'Failed to log trial start event for user %: %', user_id, SQLERRM;
  END;
  
  RETURN jsonb_build_object(
    'success', true,
    'trial_end_date', trial_end,
    'trial_type', trial_type,
    'trial_length_days', trial_length_days,
    'message', 'Trial started successfully'
  );
END;
$$;

-- 3. Enhanced sync function with better error handling and validation
CREATE OR REPLACE FUNCTION public.sync_stripe_subscription(
  customer_email TEXT, 
  stripe_customer_id TEXT, 
  stripe_subscription_id TEXT DEFAULT NULL, 
  subscription_status TEXT DEFAULT 'expired', 
  price_id TEXT DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  user_id UUID;
  old_status TEXT;
  old_tier TEXT;
  new_status TEXT;
  new_tier TEXT;
  now_timestamp TIMESTAMP WITH TIME ZONE := NOW();
  valid_price_ids TEXT[] := ARRAY['price_1Rb8vR1d1AvgoBGoNIjxLKRR', 'price_1Rb8wD1d1AvgoBGoC8nfQXNK'];
BEGIN
  -- Validate inputs
  IF customer_email IS NULL OR customer_email = '' THEN
    RETURN jsonb_build_object('success', false, 'error', 'Customer email is required');
  END IF;
  
  IF stripe_customer_id IS NULL OR stripe_customer_id = '' THEN
    RETURN jsonb_build_object('success', false, 'error', 'Stripe customer ID is required');
  END IF;
  
  -- Validate price_id if provided
  IF price_id IS NOT NULL AND NOT (price_id = ANY(valid_price_ids)) THEN
    RETURN jsonb_build_object(
      'success', false, 
      'error', 'Invalid price ID: ' || price_id || '. Valid options: ' || array_to_string(valid_price_ids, ', ')
    );
  END IF;
  
  -- Find user by email with error handling
  BEGIN
    SELECT id, subscription_status, subscription_tier 
    INTO user_id, old_status, old_tier
    FROM profiles 
    WHERE email = customer_email;
  EXCEPTION
    WHEN OTHERS THEN
      RETURN jsonb_build_object(
        'success', false,
        'error', 'Database error while finding user: ' || SQLERRM
      );
  END;
  
  IF user_id IS NULL THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'User not found with email: ' || customer_email
    );
  END IF;
  
  -- Determine new status and tier based on subscription_status
  CASE subscription_status
    WHEN 'active', 'trialing' THEN
      new_status := 'active';
      new_tier := 'pro';
    WHEN 'canceled', 'past_due', 'unpaid', 'incomplete', 'incomplete_expired' THEN
      new_status := 'expired';
      new_tier := 'free';
    ELSE
      new_status := 'expired';
      new_tier := 'free';
  END CASE;
  
  -- Update user profile with atomic operation
  BEGIN
    UPDATE profiles SET
      stripe_customer_id = sync_stripe_subscription.stripe_customer_id,
      stripe_subscription_id = sync_stripe_subscription.stripe_subscription_id,
      stripe_price_id = price_id,
      subscription_status = new_status,
      subscription_tier = new_tier,
      subscription_start_date = CASE 
        WHEN old_status != 'active' AND new_status = 'active' THEN now_timestamp
        ELSE subscription_start_date
      END,
      subscription_end_date = CASE
        WHEN new_status = 'expired' THEN now_timestamp
        ELSE subscription_end_date
      END,
      updated_at = now_timestamp
    WHERE id = user_id;
    
    IF NOT FOUND THEN
      RETURN jsonb_build_object(
        'success', false,
        'error', 'Failed to update user subscription'
      );
    END IF;
  EXCEPTION
    WHEN OTHERS THEN
      RETURN jsonb_build_object(
        'success', false,
        'error', 'Database error while updating subscription: ' || SQLERRM
      );
  END;
  
  -- Log subscription event
  BEGIN
    INSERT INTO subscription_events (
      user_id, event_type, stripe_subscription_id, stripe_customer_id, event_data
    ) VALUES (
      user_id, 
      CASE 
        WHEN new_status = 'active' AND old_status != 'active' THEN 'subscription_activated'
        WHEN new_status != 'active' AND old_status = 'active' THEN 'subscription_deactivated'
        ELSE 'subscription_updated'
      END,
      stripe_subscription_id,
      stripe_customer_id,
      jsonb_build_object(
        'old_status', old_status,
        'new_status', new_status,
        'old_tier', old_tier,
        'new_tier', new_tier,
        'stripe_status', subscription_status,
        'price_id', price_id
      )
    );
  EXCEPTION
    WHEN OTHERS THEN
      RAISE WARNING 'Failed to log subscription event for user %: %', user_id, SQLERRM;
  END;
  
  RETURN jsonb_build_object(
    'success', true,
    'user_id', user_id,
    'email', customer_email,
    'old_status', old_status,
    'new_status', new_status,
    'old_tier', old_tier,
    'new_tier', new_tier,
    'stripe_subscription_id', stripe_subscription_id,
    'updated_at', now_timestamp
  );
END;
$$;

-- 4. Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_profiles_subscription_lookup 
ON profiles(email, subscription_status, subscription_tier);

CREATE INDEX IF NOT EXISTS idx_profiles_trial_status 
ON profiles(subscription_status, trial_end_date) 
WHERE subscription_status = 'trial';

CREATE INDEX IF NOT EXISTS idx_webhook_events_processing 
ON webhook_events(processing_status, created_at);

-- 5. Grant permissions
GRANT EXECUTE ON FUNCTION public.check_user_subscription_access TO authenticated;
GRANT EXECUTE ON FUNCTION public.start_user_trial_safe TO authenticated;
GRANT EXECUTE ON FUNCTION public.sync_stripe_subscription TO authenticated;

-- 6. Add helpful comments
COMMENT ON FUNCTION public.check_user_subscription_access IS 'Enhanced function to check user subscription access with proper error handling';
COMMENT ON FUNCTION public.start_user_trial_safe IS 'Safe trial start function with comprehensive validation and error handling';
COMMENT ON FUNCTION public.sync_stripe_subscription IS 'Enhanced Stripe subscription sync with improved error handling and validation';
