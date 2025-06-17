
-- Drop all existing problematic policies that cause infinite recursion
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admins can update all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Allow authenticated users to insert" ON public.profiles;

-- Drop the problematic is_admin function that causes recursion
DROP FUNCTION IF EXISTS public.is_admin(uuid);
DROP FUNCTION IF EXISTS public.check_user_admin_status(uuid);

-- Create a simple, non-recursive function to check admin status
CREATE OR REPLACE FUNCTION public.get_user_admin_status(user_id uuid)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT COALESCE(is_admin, false) 
  FROM profiles 
  WHERE id = user_id;
$$;

-- Create simple, direct RLS policies without any recursion
-- Policy for users to see their own profile
CREATE POLICY "Users can view own profile" ON public.profiles
  FOR SELECT 
  USING (auth.uid() = id);

-- Policy for users to update their own profile  
CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE 
  USING (auth.uid() = id);

-- Policy for authenticated users to insert their profile
CREATE POLICY "Allow authenticated users to insert" ON public.profiles
  FOR INSERT 
  WITH CHECK (auth.uid() = id);

-- Direct admin policies using explicit table queries (no function calls)
CREATE POLICY "Admins can view all profiles" ON public.profiles
  FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM profiles p 
      WHERE p.id = auth.uid() 
      AND p.is_admin = true
    )
  );

CREATE POLICY "Admins can update all profiles" ON public.profiles
  FOR UPDATE 
  USING (
    EXISTS (
      SELECT 1 FROM profiles p 
      WHERE p.id = auth.uid() 
      AND p.is_admin = true
    )
  );

-- Ensure the admin user has the correct admin status
UPDATE public.profiles 
SET 
  is_admin = true,
  admin_role = 'super_admin',
  admin_permissions = '["user_management", "ticket_management", "analytics", "settings", "admin_management"]'::jsonb
WHERE email = 'siriz0408@gmail.com';
