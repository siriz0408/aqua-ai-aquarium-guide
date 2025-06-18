
-- Add stripe_customer_id column if not exists
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS stripe_customer_id text UNIQUE;

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_profiles_stripe_customer 
ON public.profiles(stripe_customer_id);

-- Update the get_user_by_stripe_customer function
CREATE OR REPLACE FUNCTION public.get_user_by_stripe_customer(customer_id text)
RETURNS TABLE(user_id uuid, email text)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT p.id as user_id, p.email
  FROM public.profiles p
  WHERE p.stripe_customer_id = customer_id
  LIMIT 1;
END;
$$;

-- Function to get user by email
CREATE OR REPLACE FUNCTION public.get_user_by_email(user_email text)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  user_id uuid;
BEGIN
  SELECT id INTO user_id
  FROM public.profiles
  WHERE email = user_email
  LIMIT 1;
  
  RETURN user_id;
END;
$$;

-- Function to manually refresh subscription status
CREATE OR REPLACE FUNCTION public.refresh_subscription_status(user_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Update expired trials
  UPDATE public.profiles
  SET subscription_status = 'expired'
  WHERE id = user_id
    AND subscription_status = 'trial'
    AND trial_end_date < now();
END;
$$;
