
-- Drop all existing policies on profiles table to start fresh
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admins can update all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Allow authenticated users to insert" ON public.profiles;

-- Create a completely non-recursive function for checking admin status
CREATE OR REPLACE FUNCTION public.check_user_admin_status(check_user_id uuid)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path TO 'public'
AS $$
  SELECT COALESCE(is_admin, false) 
  FROM profiles 
  WHERE id = check_user_id 
  LIMIT 1;
$$;

-- Create simple, direct policies without any recursion
CREATE POLICY "Users can view own profile" ON public.profiles
  FOR SELECT 
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE 
  USING (auth.uid() = id);

-- Admin policies using direct table lookup to avoid recursion
CREATE POLICY "Admins can view all profiles" ON public.profiles
  FOR SELECT 
  USING (
    auth.uid() IN (
      SELECT id FROM profiles WHERE is_admin = true
    )
  );

CREATE POLICY "Admins can update all profiles" ON public.profiles
  FOR UPDATE 
  USING (
    auth.uid() IN (
      SELECT id FROM profiles WHERE is_admin = true
    )
  );

CREATE POLICY "Allow authenticated users to insert" ON public.profiles
  FOR INSERT 
  WITH CHECK (auth.uid() = id);

-- Update the is_admin function to use the new helper
CREATE OR REPLACE FUNCTION public.is_admin(user_id uuid)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path TO 'public'
AS $$
  SELECT public.check_user_admin_status(user_id);
$$;
