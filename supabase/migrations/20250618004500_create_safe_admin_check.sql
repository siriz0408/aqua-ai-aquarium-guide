
-- Create a safe function to check admin status without causing infinite recursion
CREATE OR REPLACE FUNCTION public.check_user_admin_status(user_id uuid)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path TO 'public'
AS $$
  SELECT COALESCE(is_admin, false) 
  FROM public.profiles 
  WHERE id = user_id;
$$;
