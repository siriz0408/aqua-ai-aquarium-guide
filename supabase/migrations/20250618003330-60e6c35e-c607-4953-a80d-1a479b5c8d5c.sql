
-- Fix the update_subscription_status function with proper search_path
CREATE OR REPLACE FUNCTION public.update_subscription_status(
  target_user_id uuid,
  new_subscription_status character varying,
  new_subscription_tier character varying,
  new_stripe_customer_id character varying DEFAULT NULL,
  new_stripe_subscription_id character varying DEFAULT NULL,
  new_stripe_price_id text DEFAULT NULL,
  new_subscription_start_date timestamp with time zone DEFAULT NULL,
  new_subscription_end_date timestamp with time zone DEFAULT NULL
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  -- Update the user's profile with subscription information
  UPDATE public.profiles 
  SET 
    subscription_status = new_subscription_status,
    subscription_tier = new_subscription_tier,
    stripe_customer_id = COALESCE(new_stripe_customer_id, stripe_customer_id),
    stripe_subscription_id = COALESCE(new_stripe_subscription_id, stripe_subscription_id),
    stripe_price_id = COALESCE(new_stripe_price_id, stripe_price_id),
    subscription_start_date = COALESCE(new_subscription_start_date, subscription_start_date),
    subscription_end_date = COALESCE(new_subscription_end_date, subscription_end_date),
    updated_at = now()
  WHERE id = target_user_id;
  
  RETURN FOUND;
END;
$$;
