
-- Create a safe function to get user profile that bypasses RLS
CREATE OR REPLACE FUNCTION public.get_user_profile_safe(user_id uuid)
RETURNS TABLE(
  id uuid,
  subscription_status character varying,
  subscription_tier character varying,
  free_credits_remaining integer,
  total_credits_used integer,
  monthly_credits_limit integer,
  monthly_credits_used integer,
  last_credit_reset date,
  subscription_start_date timestamp with time zone,
  subscription_end_date timestamp with time zone,
  is_admin boolean
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  -- Only allow users to fetch their own profile
  IF auth.uid() != user_id THEN
    RAISE EXCEPTION 'Access denied: Cannot access other users profiles';
  END IF;
  
  -- Return the user's profile using security definer privileges
  RETURN QUERY
  SELECT p.id, p.subscription_status, p.subscription_tier, p.free_credits_remaining,
         p.total_credits_used, p.monthly_credits_limit, p.monthly_credits_used,
         p.last_credit_reset, p.subscription_start_date, p.subscription_end_date,
         p.is_admin
  FROM public.profiles p
  WHERE p.id = user_id;
END;
$$;
