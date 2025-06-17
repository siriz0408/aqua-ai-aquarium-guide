
-- Fix infinite recursion in profiles table RLS policies
-- Drop existing policies that might be causing recursion
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admins can update all profiles" ON public.profiles;

-- Create simple, non-recursive policies for profiles table
CREATE POLICY "Users can view own profile" ON public.profiles
FOR SELECT TO authenticated
USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.profiles
FOR UPDATE TO authenticated
USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON public.profiles
FOR INSERT TO authenticated
WITH CHECK (auth.uid() = id);

-- Create a simple admin policy that doesn't reference other tables
CREATE POLICY "Service role can manage all profiles" ON public.profiles
FOR ALL TO service_role
USING (true)
WITH CHECK (true);

-- Create a policy for admin functions that use security definer
CREATE POLICY "Admin functions can access all profiles" ON public.profiles
FOR ALL TO authenticated
USING (
  -- Allow if called from a security definer function
  current_setting('role', true) = 'service_role' OR
  -- Allow own profile access
  auth.uid() = id
)
WITH CHECK (
  -- Allow if called from a security definer function  
  current_setting('role', true) = 'service_role' OR
  -- Allow own profile updates
  auth.uid() = id
);
