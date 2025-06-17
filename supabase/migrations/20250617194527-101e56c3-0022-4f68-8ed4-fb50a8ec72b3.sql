
-- First, let's safely grant admin access to siriz0408@gmail.com
-- This uses a direct UPDATE without triggering RLS policies
UPDATE public.profiles 
SET 
  is_admin = true,
  admin_role = 'super_admin',
  admin_permissions = '["user_management", "ticket_management", "analytics", "settings", "admin_management"]'::jsonb,
  last_admin_login = now()
WHERE email = 'siriz0408@gmail.com';

-- Drop any existing problematic RLS policies that cause recursion
DROP POLICY IF EXISTS "Users can read own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admins can update all profiles" ON public.profiles;

-- Create simple, non-recursive RLS policies
-- Users can always read their own profile
CREATE POLICY "Users can read own profile" ON public.profiles
  FOR SELECT 
  USING (auth.uid() = id);

-- Users can update their own profile
CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE 
  USING (auth.uid() = id);

-- Create a safe function to check admin status without recursion
CREATE OR REPLACE FUNCTION public.check_user_admin_status(user_id uuid)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT COALESCE(is_admin, false) 
  FROM public.profiles 
  WHERE id = user_id;
$$;

-- Admins can view all profiles using the safe function
CREATE POLICY "Admins can view all profiles" ON public.profiles
  FOR SELECT 
  USING (public.check_user_admin_status(auth.uid()) = true);

-- Admins can update all profiles using the safe function
CREATE POLICY "Admins can update all profiles" ON public.profiles
  FOR UPDATE 
  USING (public.check_user_admin_status(auth.uid()) = true);

-- Verify the admin user was updated correctly
SELECT id, email, full_name, is_admin, admin_role, admin_permissions 
FROM public.profiles 
WHERE email = 'siriz0408@gmail.com';
