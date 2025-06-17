
-- Drop the problematic RLS policies that cause infinite recursion
DROP POLICY IF EXISTS "Users can read own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admins can update all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Allow authenticated users to insert" ON public.profiles;

-- Create a simple, safe function to check admin status without recursion
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

-- Create simple, non-recursive RLS policies
-- Users can always read their own profile
CREATE POLICY "Users can read own profile" ON public.profiles
  FOR SELECT 
  USING (auth.uid() = id);

-- Users can update their own profile
CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE 
  USING (auth.uid() = id);

-- Admins can view all profiles using the safe function
CREATE POLICY "Admins can view all profiles" ON public.profiles
  FOR SELECT 
  USING (public.check_user_admin_status(auth.uid()) = true);

-- Admins can update all profiles using the safe function
CREATE POLICY "Admins can update all profiles" ON public.profiles
  FOR UPDATE 
  USING (public.check_user_admin_status(auth.uid()) = true);

-- Allow authenticated users to insert profiles
CREATE POLICY "Allow authenticated users to insert" ON public.profiles
  FOR INSERT 
  WITH CHECK (auth.uid() = id);
