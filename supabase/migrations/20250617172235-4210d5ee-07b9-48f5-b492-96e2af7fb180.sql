
-- Fix the infinite recursion in RLS policies by updating the security definer function
-- and fixing the admin functions to work with the simplified schema

-- First, fix the is_admin function to avoid recursion
DROP FUNCTION IF EXISTS public.is_admin(uuid);
CREATE OR REPLACE FUNCTION public.is_admin(user_id uuid)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path TO 'public'
AS $$
  SELECT COALESCE(is_admin, false) FROM profiles WHERE id = user_id;
$$;

-- Update the admin_get_all_profiles function to work with simplified schema
CREATE OR REPLACE FUNCTION public.admin_get_all_profiles(requesting_admin_id uuid)
RETURNS TABLE(
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
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  -- Check if the requesting user is an admin
  IF NOT public.is_admin(requesting_admin_id) THEN
    RAISE EXCEPTION 'Access denied: User is not an admin';
  END IF;
  
  -- Return all profiles with default values for removed columns
  RETURN QUERY
  SELECT 
    p.id, 
    p.email, 
    p.full_name, 
    p.is_admin, 
    p.admin_role,
    p.subscription_status, 
    p.subscription_tier, 
    0 as free_credits_remaining,  -- Default value since column was removed
    0 as total_credits_used,      -- Default value since column was removed
    p.created_at, 
    p.last_active, 
    p.admin_permissions
  FROM public.profiles p;
END;
$$;

-- Update the admin_update_profile function to work with simplified schema
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
SET search_path TO 'public'
AS $$
BEGIN
  -- Check if requesting user is admin
  IF NOT public.is_admin(requesting_admin_id) THEN
    RAISE EXCEPTION 'Access denied: User is not an admin';
  END IF;
  
  -- Update the target user's profile (ignore credit fields since they don't exist)
  UPDATE public.profiles 
  SET 
    full_name = new_full_name,
    is_admin = new_is_admin,
    admin_role = new_admin_role,
    subscription_status = new_subscription_status,
    subscription_tier = new_subscription_tier,
    updated_at = now()
  WHERE id = target_user_id;
  
  RETURN FOUND;
END;
$$;

-- Fix RLS policies to avoid recursion
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admins can update all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Allow authenticated users to insert" ON public.profiles;

-- Create simple, non-recursive policies
CREATE POLICY "Users can view own profile" ON public.profiles
  FOR SELECT 
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE 
  USING (auth.uid() = id);

-- Create a separate admin check function that doesn't cause recursion
CREATE OR REPLACE FUNCTION public.check_is_admin()
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
STABLE
AS $$
DECLARE
  user_is_admin boolean := false;
BEGIN
  SELECT COALESCE(is_admin, false) INTO user_is_admin 
  FROM public.profiles 
  WHERE id = auth.uid();
  
  RETURN user_is_admin;
END;
$$;

-- Admin policies using the separate function
CREATE POLICY "Admins can view all profiles" ON public.profiles
  FOR SELECT 
  USING (public.check_is_admin());

CREATE POLICY "Admins can update all profiles" ON public.profiles
  FOR UPDATE 
  USING (public.check_is_admin());

CREATE POLICY "Allow authenticated users to insert" ON public.profiles
  FOR INSERT 
  WITH CHECK (auth.uid() = id);
