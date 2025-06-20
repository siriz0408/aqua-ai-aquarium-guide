
-- Fix the sync_stripe_subscription function to be more robust
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
  old_status TEXT;
  old_tier TEXT;
  new_status TEXT;
  new_tier TEXT;
  result jsonb;
BEGIN
  -- Enhanced logging
  RAISE LOG 'sync_stripe_subscription called with: email=%, customer_id=%, subscription_id=%, status=%', 
    customer_email, stripe_customer_id, stripe_subscription_id, subscription_status;
  
  -- Find user by email with better error handling
  SELECT id, subscription_status, subscription_tier 
  INTO user_id, old_status, old_tier
  FROM profiles 
  WHERE email = customer_email;
  
  IF user_id IS NULL THEN
    RAISE LOG 'User not found with email: %', customer_email;
    RETURN jsonb_build_object(
      'success', false,
      'error', 'User not found with email: ' || customer_email,
      'email', customer_email
    );
  END IF;
  
  RAISE LOG 'User found: id=%, old_status=%, old_tier=%', user_id, old_status, old_tier;
  
  -- Determine new status and tier based on Stripe subscription status
  CASE subscription_status
    WHEN 'active', 'trialing' THEN
      new_status := 'active';
      new_tier := 'pro';
    WHEN 'canceled', 'cancelled' THEN
      new_status := 'expired';
      new_tier := 'free';
    WHEN 'past_due', 'unpaid', 'incomplete', 'incomplete_expired' THEN
      new_status := 'expired';
      new_tier := 'free';
    WHEN 'paused' THEN
      new_status := 'paused';
      new_tier := 'free';
    ELSE
      new_status := 'expired';
      new_tier := 'free';
  END CASE;
  
  RAISE LOG 'Determined new status: %, new tier: %', new_status, new_tier;
  
  -- Update user profile with comprehensive data
  UPDATE profiles SET
    stripe_customer_id = sync_stripe_subscription.stripe_customer_id,
    stripe_subscription_id = CASE 
      WHEN sync_stripe_subscription.stripe_subscription_id IS NOT NULL 
      THEN sync_stripe_subscription.stripe_subscription_id
      ELSE stripe_subscription_id
    END,
    stripe_price_id = COALESCE(price_id, stripe_price_id),
    subscription_status = new_status,
    subscription_tier = new_tier,
    subscription_start_date = CASE 
      WHEN old_status != 'active' AND new_status = 'active' THEN NOW()
      ELSE subscription_start_date
    END,
    subscription_end_date = CASE 
      WHEN new_status = 'expired' THEN NOW()
      WHEN new_status = 'active' THEN NOW() + INTERVAL '1 month'
      ELSE subscription_end_date
    END,
    updated_at = NOW()
  WHERE id = user_id;
  
  -- Verify the update worked
  IF NOT FOUND THEN
    RAISE LOG 'Failed to update user profile for user_id: %', user_id;
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Failed to update user profile',
      'user_id', user_id
    );
  END IF;
  
  RAISE LOG 'Successfully updated user profile: id=%, new_status=%, new_tier=%', 
    user_id, new_status, new_tier;
  
  -- Log the subscription event for audit trail
  INSERT INTO subscription_events (
    user_id, 
    event_type, 
    stripe_subscription_id, 
    stripe_customer_id, 
    event_data
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
      'price_id', price_id,
      'sync_timestamp', NOW()
    )
  );
  
  result := jsonb_build_object(
    'success', true,
    'user_id', user_id,
    'email', customer_email,
    'old_status', old_status,
    'new_status', new_status,
    'old_tier', old_tier,
    'new_tier', new_tier,
    'stripe_customer_id', stripe_customer_id,
    'stripe_subscription_id', stripe_subscription_id
  );
  
  RAISE LOG 'sync_stripe_subscription completed successfully: %', result;
  RETURN result;
  
EXCEPTION
  WHEN OTHERS THEN
    RAISE LOG 'Error in sync_stripe_subscription: % %', SQLSTATE, SQLERRM;
    RETURN jsonb_build_object(
      'success', false,
      'error', SQLERRM,
      'sqlstate', SQLSTATE,
      'email', customer_email
    );
END;
$$;

-- Create a function to check subscription sync status for debugging
CREATE OR REPLACE FUNCTION public.debug_user_subscription(user_email TEXT)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  user_data RECORD;
  recent_events JSONB;
  result JSONB;
BEGIN
  -- Get user profile data
  SELECT 
    id, email, subscription_status, subscription_tier,
    stripe_customer_id, stripe_subscription_id, stripe_price_id,
    subscription_start_date, subscription_end_date,
    created_at, updated_at
  INTO user_data
  FROM profiles
  WHERE email = user_email;
  
  IF user_data IS NULL THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'User not found with email: ' || user_email
    );
  END IF;
  
  -- Get recent subscription events
  SELECT jsonb_agg(
    jsonb_build_object(
      'event_type', event_type,
      'stripe_subscription_id', stripe_subscription_id,
      'stripe_customer_id', stripe_customer_id,
      'event_data', event_data,
      'created_at', created_at
    ) ORDER BY created_at DESC
  ) INTO recent_events
  FROM subscription_events
  WHERE user_id = user_data.id
  AND created_at > NOW() - INTERVAL '24 hours'
  LIMIT 10;
  
  result := jsonb_build_object(
    'success', true,
    'user_profile', to_jsonb(user_data),
    'recent_events', COALESCE(recent_events, '[]'::jsonb),
    'debug_timestamp', NOW()
  );
  
  RETURN result;
END;
$$;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION public.sync_stripe_subscription TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.debug_user_subscription TO anon, authenticated;
