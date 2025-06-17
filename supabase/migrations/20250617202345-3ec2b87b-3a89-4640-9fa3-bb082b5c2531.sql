
-- Fix the admin_get_all_profiles function to resolve ambiguous column references
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
AS $function$
BEGIN
  -- Check if the requesting user is an admin using explicit table qualification
  IF NOT EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.id = requesting_admin_id AND p.is_admin = true
  ) THEN
    RAISE EXCEPTION 'Access denied: User is not an admin';
  END IF;
  
  -- Return all profiles with explicit column qualification and default values for credit columns
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
$function$
