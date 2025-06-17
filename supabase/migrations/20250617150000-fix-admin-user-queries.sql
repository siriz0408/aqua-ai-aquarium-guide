
-- Create a function that allows admins to safely query all profiles
-- This function bypasses RLS by using SECURITY DEFINER and explicit admin check
CREATE OR REPLACE FUNCTION public.admin_get_all_profiles(requesting_admin_id uuid)
RETURNS TABLE (
  id uuid,
  email text,
  full_name text,
  is_admin boolean,
  admin_role character varying,
  subscription_status character varying,
  subscription_tier character varying,
  free_credits_remaining integer,
  total_credits_used integer,
  created_at timestamp with time zone,
  last_active timestamp with time zone,
  admin_permissions jsonb
)
LANGUAGE plpgsql
SECURITY DEFINER
STABLE
AS $$
BEGIN
  -- First check if the requesting user is an admin
  IF NOT EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = requesting_admin_id AND is_admin = true
  ) THEN
    RAISE EXCEPTION 'Access denied: User is not an admin';
  END IF;
  
  -- If admin, return all profiles
  RETURN QUERY
  SELECT p.id, p.email, p.full_name, p.is_admin, p.admin_role, 
         p.subscription_status, p.subscription_tier, p.free_credits_remaining, 
         p.total_credits_used, p.created_at, p.last_active, p.admin_permissions
  FROM public.profiles p;
END;
$$;

-- Create a function to safely update user profiles for admins
CREATE OR REPLACE FUNCTION public.admin_update_profile(
  requesting_admin_id uuid,
  target_user_id uuid,
  new_full_name text,
  new_is_admin boolean,
  new_admin_role character varying,
  new_subscription_status character varying,
  new_subscription_tier character varying,
  new_free_credits_remaining integer
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Check if requesting user is admin
  IF NOT EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = requesting_admin_id AND is_admin = true
  ) THEN
    RAISE EXCEPTION 'Access denied: User is not an admin';
  END IF;
  
  -- Update the target user's profile
  UPDATE public.profiles 
  SET 
    full_name = new_full_name,
    is_admin = new_is_admin,
    admin_role = new_admin_role,
    subscription_status = new_subscription_status,
    subscription_tier = new_subscription_tier,
    free_credits_remaining = new_free_credits_remaining
  WHERE id = target_user_id;
  
  RETURN FOUND;
END;
$$;

-- Create a function to safely delete user profiles for admins
CREATE OR REPLACE FUNCTION public.admin_delete_profile(
  requesting_admin_id uuid,
  target_user_id uuid
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Check if requesting user is admin
  IF NOT EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = requesting_admin_id AND is_admin = true
  ) THEN
    RAISE EXCEPTION 'Access denied: User is not an admin';
  END IF;
  
  -- Delete the target user's profile (will cascade to auth.users)
  DELETE FROM public.profiles WHERE id = target_user_id;
  
  RETURN FOUND;
END;
$$;
