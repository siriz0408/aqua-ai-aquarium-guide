
-- Add the missing admin_delete_profile function that's referenced in AdminUserManagement
CREATE OR REPLACE FUNCTION public.admin_delete_profile(requesting_admin_id uuid, target_user_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  -- Check if requesting user is admin using the safe function
  IF NOT (SELECT public.check_user_admin_status(requesting_admin_id)) THEN
    RAISE EXCEPTION 'Access denied: User is not an admin';
  END IF;
  
  -- Delete the target user's profile (will cascade to auth.users if configured)
  DELETE FROM public.profiles WHERE id = target_user_id;
  
  RETURN FOUND;
END;
$$;
