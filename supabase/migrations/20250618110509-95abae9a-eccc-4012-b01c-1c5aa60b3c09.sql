
-- Comprehensive Paywall Fix: Enhanced Database Functions and Webhook Management

-- 1. Create webhook events tracking table for better monitoring
CREATE TABLE IF NOT EXISTS public.webhook_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  stripe_event_id TEXT UNIQUE NOT NULL,
  event_type TEXT NOT NULL,
  processing_status TEXT DEFAULT 'pending',
  customer_id TEXT,
  subscription_id TEXT,
  user_email TEXT,
  user_id UUID,
  raw_data JSONB,
  error_message TEXT,
  processed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Create manual sync operations log
CREATE TABLE IF NOT EXISTS public.manual_sync_operations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_user_id UUID REFERENCES profiles(id),
  operation_type TEXT NOT NULL, -- 'sync_user', 'sync_all', 'fix_subscription'
  target_user_id UUID,
  target_email TEXT,
  stripe_customer_id TEXT,
  before_state JSONB,
  after_state JSONB,
  success BOOLEAN DEFAULT FALSE,
  error_message TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Enhanced function to sync user subscription from Stripe data
CREATE OR REPLACE FUNCTION public.sync_user_subscription_from_stripe(
  user_email TEXT,
  stripe_customer_id TEXT,
  stripe_subscription_id TEXT,
  subscription_status TEXT,
  subscription_tier TEXT DEFAULT 'pro',
  current_period_end TIMESTAMP WITH TIME ZONE DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  target_user_id UUID;
  before_state JSONB;
  after_state JSONB;
  result JSONB;
BEGIN
  -- Find user by email
  SELECT id INTO target_user_id
  FROM profiles
  WHERE email = user_email;
  
  IF target_user_id IS NULL THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'User not found with email: ' || user_email
    );
  END IF;
  
  -- Capture before state
  SELECT jsonb_build_object(
    'subscription_status', p.subscription_status,
    'subscription_tier', p.subscription_tier,
    'stripe_customer_id', p.stripe_customer_id,
    'stripe_subscription_id', p.stripe_subscription_id,
    'subscription_end_date', p.subscription_end_date
  ) INTO before_state
  FROM profiles p
  WHERE p.id = target_user_id;
  
  -- Update subscription
  UPDATE profiles
  SET
    subscription_status = CASE 
      WHEN subscription_status = 'active' THEN 'active'
      WHEN subscription_status = 'canceled' THEN 'expired'
      WHEN subscription_status = 'past_due' THEN 'expired'
      WHEN subscription_status = 'unpaid' THEN 'expired'
      ELSE 'active'
    END,
    subscription_tier = subscription_tier,
    stripe_customer_id = sync_user_subscription_from_stripe.stripe_customer_id,
    stripe_subscription_id = sync_user_subscription_from_stripe.stripe_subscription_id,
    subscription_start_date = COALESCE(subscription_start_date, NOW()),
    subscription_end_date = current_period_end,
    updated_at = NOW()
  WHERE id = target_user_id;
  
  -- Capture after state
  SELECT jsonb_build_object(
    'subscription_status', p.subscription_status,
    'subscription_tier', p.subscription_tier,
    'stripe_customer_id', p.stripe_customer_id,
    'stripe_subscription_id', p.stripe_subscription_id,
    'subscription_end_date', p.subscription_end_date
  ) INTO after_state
  FROM profiles p
  WHERE p.id = target_user_id;
  
  result := jsonb_build_object(
    'success', true,
    'user_id', target_user_id,
    'user_email', user_email,
    'before_state', before_state,
    'after_state', after_state,
    'updated_at', NOW()
  );
  
  RETURN result;
END;
$$;

-- 4. Function to process webhook events with better error handling
CREATE OR REPLACE FUNCTION public.process_webhook_event(
  event_id TEXT,
  event_type TEXT,
  event_data JSONB
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  customer_id TEXT;
  subscription_id TEXT;
  customer_email TEXT;
  subscription_status TEXT;
  current_period_end TIMESTAMP WITH TIME ZONE;
  sync_result JSONB;
BEGIN
  -- Insert or update webhook event tracking
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
  
  -- Find customer email (this would normally come from Stripe API call)
  -- For now, we'll extract from existing data or skip
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
  
  -- Sync subscription
  SELECT sync_user_subscription_from_stripe(
    customer_email,
    customer_id,
    subscription_id,
    subscription_status,
    'pro',
    current_period_end
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

-- 5. Admin function to manually sync a user's subscription
CREATE OR REPLACE FUNCTION public.admin_manual_sync_user(
  requesting_admin_id UUID,
  target_email TEXT,
  stripe_customer_id TEXT,
  stripe_subscription_id TEXT,
  subscription_status TEXT DEFAULT 'active'
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  sync_result JSONB;
  operation_id UUID;
BEGIN
  -- Check admin permissions
  IF NOT EXISTS (
    SELECT 1 FROM profiles
    WHERE id = requesting_admin_id AND is_admin = true
  ) THEN
    RAISE EXCEPTION 'Access denied: User is not an admin';
  END IF;
  
  -- Create operation log entry
  INSERT INTO manual_sync_operations (
    admin_user_id, operation_type, target_email, stripe_customer_id
  ) VALUES (
    requesting_admin_id, 'sync_user', target_email, stripe_customer_id
  ) RETURNING id INTO operation_id;
  
  -- Perform sync
  SELECT sync_user_subscription_from_stripe(
    target_email,
    stripe_customer_id,
    stripe_subscription_id,
    subscription_status,
    'pro',
    NOW() + INTERVAL '1 month'
  ) INTO sync_result;
  
  -- Update operation log
  UPDATE manual_sync_operations SET
    success = (sync_result->>'success')::boolean,
    error_message = sync_result->>'error',
    before_state = sync_result->'before_state',
    after_state = sync_result->'after_state'
  WHERE id = operation_id;
  
  RETURN jsonb_build_object(
    'success', sync_result->>'success',
    'operation_id', operation_id,
    'sync_result', sync_result
  );
END;
$$;

-- 6. Grant necessary permissions
GRANT EXECUTE ON FUNCTION public.sync_user_subscription_from_stripe TO authenticated;
GRANT EXECUTE ON FUNCTION public.process_webhook_event TO authenticated;
GRANT EXECUTE ON FUNCTION public.admin_manual_sync_user TO authenticated;

-- 7. Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_webhook_events_stripe_event_id ON webhook_events(stripe_event_id);
CREATE INDEX IF NOT EXISTS idx_webhook_events_event_type ON webhook_events(event_type);
CREATE INDEX IF NOT EXISTS idx_webhook_events_processing_status ON webhook_events(processing_status);
CREATE INDEX IF NOT EXISTS idx_manual_sync_operations_admin_user_id ON manual_sync_operations(admin_user_id);
CREATE INDEX IF NOT EXISTS idx_manual_sync_operations_target_email ON manual_sync_operations(target_email);
