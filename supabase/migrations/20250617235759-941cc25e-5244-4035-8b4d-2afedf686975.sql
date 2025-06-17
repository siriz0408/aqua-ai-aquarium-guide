
-- Add a safe function to update subscription status via webhooks
CREATE OR REPLACE FUNCTION public.update_subscription_status(
  target_user_id uuid,
  new_subscription_status character varying,
  new_subscription_tier character varying,
  new_stripe_customer_id character varying,
  new_stripe_subscription_id character varying,
  new_stripe_price_id text,
  new_subscription_start_date timestamp with time zone,
  new_subscription_end_date timestamp with time zone
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Update the user's profile with subscription information
  UPDATE public.profiles 
  SET 
    subscription_status = new_subscription_status,
    subscription_tier = new_subscription_tier,
    stripe_customer_id = new_stripe_customer_id,
    stripe_subscription_id = new_stripe_subscription_id,
    stripe_price_id = new_stripe_price_id,
    subscription_start_date = new_subscription_start_date,
    subscription_end_date = new_subscription_end_date,
    updated_at = now()
  WHERE id = target_user_id;
  
  RETURN FOUND;
END;
$$;

-- Create a function to find user by customer ID
CREATE OR REPLACE FUNCTION public.get_user_by_stripe_customer(
  customer_id character varying
)
RETURNS TABLE(user_id uuid, email text)
LANGUAGE plpgsql
SECURITY DEFINER
STABLE
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    p.id as user_id,
    p.email
  FROM public.profiles p
  WHERE p.stripe_customer_id = customer_id;
END;
$$;
