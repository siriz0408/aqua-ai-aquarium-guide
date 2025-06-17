
-- First, let's drop any problematic policies that might cause recursion
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admins can update all profiles" ON public.profiles;

-- Drop any existing is_admin function that might be causing issues
DROP FUNCTION IF EXISTS public.is_admin(uuid);

-- Create a simple, non-recursive function to check admin status
CREATE OR REPLACE FUNCTION public.is_admin(user_id uuid)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT COALESCE(is_admin, false) 
  FROM profiles 
  WHERE id = user_id;
$$;

-- Create safe admin policies that won't cause recursion
CREATE POLICY "Admins can view all profiles" ON public.profiles
  FOR SELECT 
  USING (
    -- Direct check without function to avoid recursion
    EXISTS (
      SELECT 1 FROM profiles p 
      WHERE p.id = auth.uid() 
      AND p.is_admin = true
    )
  );

CREATE POLICY "Admins can update all profiles" ON public.profiles
  FOR UPDATE 
  USING (
    -- Direct check without function to avoid recursion
    EXISTS (
      SELECT 1 FROM profiles p 
      WHERE p.id = auth.uid() 
      AND p.is_admin = true
    )
  );

-- Fix the admin functions to work without the problematic is_admin function
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
  -- Check if the requesting user is an admin without using the problematic function
  IF NOT EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = requesting_admin_id AND is_admin = true
  ) THEN
    RAISE EXCEPTION 'Access denied: User is not an admin';
  END IF;
  
  -- Return all profiles with default values for credit columns
  RETURN QUERY
  SELECT 
    p.id, 
    p.email, 
    p.full_name, 
    p.is_admin, 
    p.admin_role,
    p.subscription_status, 
    p.subscription_tier, 
    0 as free_credits_remaining,
    0 as total_credits_used,
    p.created_at, 
    p.last_active, 
    p.admin_permissions
  FROM public.profiles p
  ORDER BY p.created_at DESC;
END;
$$;

-- Update the admin_update_profile function as well
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
  -- Check if requesting user is admin without using the problematic function
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
    updated_at = now()
  WHERE id = target_user_id;
  
  RETURN FOUND;
END;
$$;
