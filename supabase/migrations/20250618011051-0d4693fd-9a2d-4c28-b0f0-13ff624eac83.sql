
-- Create subscription_events table for tracking all subscription changes
CREATE TABLE public.subscription_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL, -- 'subscription_created', 'subscription_updated', 'subscription_canceled', 'payment_succeeded', 'payment_failed', etc.
  stripe_event_id TEXT UNIQUE NOT NULL,
  stripe_customer_id TEXT,
  stripe_subscription_id TEXT,
  event_data JSONB NOT NULL,
  processed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS on subscription_events
ALTER TABLE public.subscription_events ENABLE ROW LEVEL SECURITY;

-- Create policy for users to view their own subscription events
CREATE POLICY "Users can view their own subscription events" ON public.subscription_events
  FOR SELECT 
  USING (user_id = auth.uid());

-- Create policy for edge functions to insert subscription events
CREATE POLICY "Edge functions can insert subscription events" ON public.subscription_events
  FOR INSERT 
  WITH CHECK (true);

-- Create policy for edge functions to update subscription events
CREATE POLICY "Edge functions can update subscription events" ON public.subscription_events
  FOR UPDATE 
  USING (true);

-- Create webhook_logs table for debugging webhook issues
CREATE TABLE public.webhook_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  stripe_event_id TEXT,
  event_type TEXT NOT NULL,
  processing_status TEXT NOT NULL DEFAULT 'pending', -- 'pending', 'success', 'error'
  error_message TEXT,
  raw_payload JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  processed_at TIMESTAMPTZ
);

-- Enable RLS on webhook_logs (admin only access)
ALTER TABLE public.webhook_logs ENABLE ROW LEVEL SECURITY;

-- Create policy for admins to view webhook logs
CREATE POLICY "Admins can view webhook logs" ON public.webhook_logs
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles p 
      WHERE p.id = auth.uid() 
      AND p.is_admin = true
    )
  );

-- Create policy for edge functions to insert/update webhook logs
CREATE POLICY "Edge functions can manage webhook logs" ON public.webhook_logs
  FOR ALL
  USING (true);

-- Create function to handle webhook processing
CREATE OR REPLACE FUNCTION public.process_stripe_webhook(
  event_id TEXT,
  event_type TEXT,
  customer_id TEXT DEFAULT NULL,
  subscription_id TEXT DEFAULT NULL,
  event_data JSONB DEFAULT '{}'::jsonb
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  target_user_id UUID;
  subscription_data JSONB;
  price_id TEXT;
  subscription_status TEXT;
  current_period_end TIMESTAMPTZ;
BEGIN
  -- Log the webhook processing attempt
  INSERT INTO public.webhook_logs (
    stripe_event_id, 
    event_type, 
    raw_payload,
    processing_status
  ) VALUES (
    event_id, 
    event_type, 
    event_data,
    'pending'
  );

  -- Find user by stripe customer ID
  IF customer_id IS NOT NULL THEN
    SELECT id INTO target_user_id 
    FROM public.profiles 
    WHERE stripe_customer_id = customer_id;
  END IF;

  -- Process different event types
  CASE event_type
    WHEN 'customer.subscription.created', 'customer.subscription.updated' THEN
      IF target_user_id IS NOT NULL AND subscription_id IS NOT NULL THEN
        -- Extract subscription details from event data
        subscription_data := event_data->'data'->'object';
        subscription_status := subscription_data->>'status';
        price_id := subscription_data->'items'->'data'->0->'price'->>'id';
        current_period_end := TO_TIMESTAMP((subscription_data->>'current_period_end')::bigint);
        
        -- Update user profile
        UPDATE public.profiles SET
          subscription_status = CASE 
            WHEN subscription_status = 'active' THEN 'active'
            ELSE 'expired'
          END,
          subscription_tier = 'pro',
          stripe_subscription_id = subscription_id,
          stripe_price_id = price_id,
          subscription_start_date = COALESCE(subscription_start_date, now()),
          subscription_end_date = current_period_end,
          updated_at = now()
        WHERE id = target_user_id;
        
        -- Log the subscription event
        INSERT INTO public.subscription_events (
          user_id, event_type, stripe_event_id, stripe_customer_id, 
          stripe_subscription_id, event_data, processed
        ) VALUES (
          target_user_id, event_type, event_id, customer_id, 
          subscription_id, event_data, true
        );
      END IF;
      
    WHEN 'customer.subscription.deleted' THEN
      IF target_user_id IS NOT NULL THEN
        -- Cancel subscription
        UPDATE public.profiles SET
          subscription_status = 'expired',
          subscription_end_date = now(),
          updated_at = now()
        WHERE id = target_user_id;
        
        -- Log the cancellation event
        INSERT INTO public.subscription_events (
          user_id, event_type, stripe_event_id, stripe_customer_id, 
          stripe_subscription_id, event_data, processed
        ) VALUES (
          target_user_id, event_type, event_id, customer_id, 
          subscription_id, event_data, true
        );
      END IF;
      
    WHEN 'invoice.payment_succeeded' THEN
      -- Handle successful payment
      IF target_user_id IS NOT NULL THEN
        INSERT INTO public.subscription_events (
          user_id, event_type, stripe_event_id, stripe_customer_id, 
          stripe_subscription_id, event_data, processed
        ) VALUES (
          target_user_id, event_type, event_id, customer_id, 
          subscription_id, event_data, true
        );
      END IF;
      
    WHEN 'invoice.payment_failed' THEN
      -- Handle failed payment
      IF target_user_id IS NOT NULL THEN
        INSERT INTO public.subscription_events (
          user_id, event_type, stripe_event_id, stripe_customer_id, 
          stripe_subscription_id, event_data, processed
        ) VALUES (
          target_user_id, event_type, event_id, customer_id, 
          subscription_id, event_data, true
        );
      END IF;
  END CASE;

  -- Update webhook log status
  UPDATE public.webhook_logs SET
    processing_status = 'success',
    processed_at = now()
  WHERE stripe_event_id = event_id;

  RETURN TRUE;

EXCEPTION WHEN OTHERS THEN
  -- Log the error
  UPDATE public.webhook_logs SET
    processing_status = 'error',
    error_message = SQLERRM,
    processed_at = now()
  WHERE stripe_event_id = event_id;
  
  RETURN FALSE;
END;
$$;
