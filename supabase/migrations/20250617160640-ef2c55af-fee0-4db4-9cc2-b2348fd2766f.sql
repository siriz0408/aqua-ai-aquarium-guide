
-- Fix the promote_user_to_admin function with proper search_path
CREATE OR REPLACE FUNCTION public.promote_user_to_admin(user_email text, role text DEFAULT 'admin'::text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  UPDATE public.profiles 
  SET 
    is_admin = true,
    admin_role = role,
    admin_permissions = CASE 
      WHEN role = 'super_admin' THEN '["user_management", "ticket_management", "analytics", "settings", "admin_management"]'::jsonb
      ELSE '["ticket_management", "analytics"]'::jsonb
    END,
    last_admin_login = now()
  WHERE email = user_email;
  
  RETURN FOUND;
END;
$$;

-- Fix the admin_update_profile function with proper search_path
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
SET search_path = 'public'
AS $$
BEGIN
  -- Check if requesting user is admin with explicit table alias
  IF NOT EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.id = requesting_admin_id AND p.is_admin = true
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
    free_credits_remaining = new_free_credits_remaining
  WHERE id = target_user_id;
  
  RETURN FOUND;
END;
$$;

-- Fix the admin_delete_profile function with proper search_path
CREATE OR REPLACE FUNCTION public.admin_delete_profile(requesting_admin_id uuid, target_user_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  -- Check if requesting user is admin with explicit table alias
  IF NOT EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.id = requesting_admin_id AND p.is_admin = true
  ) THEN
    RAISE EXCEPTION 'Access denied: User is not an admin';
  END IF;
  
  -- Delete the target user's profile (will cascade to auth.users)
  DELETE FROM public.profiles WHERE id = target_user_id;
  
  RETURN FOUND;
END;
$$;

-- Fix the admin_get_all_profiles function with proper search_path
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
SET search_path = 'public'
AS $$
BEGIN
  -- First check if the requesting user is an admin
  -- Use table alias to avoid ambiguous column reference
  IF NOT EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.id = requesting_admin_id AND p.is_admin = true
  ) THEN
    RAISE EXCEPTION 'Access denied: User is not an admin';
  END IF;
  
  -- If admin, return all profiles with explicit table alias
  RETURN QUERY
  SELECT p.id, p.email, p.full_name, p.is_admin, p.admin_role, 
         p.subscription_status, p.subscription_tier, p.free_credits_remaining, 
         p.total_credits_used, p.created_at, p.last_active, p.admin_permissions
  FROM public.profiles p;
END;
$$;

-- Fix the update_last_active function with proper search_path
CREATE OR REPLACE FUNCTION public.update_last_active()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  UPDATE public.profiles 
  SET last_active = now()
  WHERE id = NEW.user_id;
  RETURN NEW;
END;
$$;

-- Fix the update_support_ticket_timestamp function with proper search_path
CREATE OR REPLACE FUNCTION public.update_support_ticket_timestamp()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  UPDATE public.support_tickets 
  SET updated_at = now(), response_count = response_count + 1
  WHERE id = NEW.ticket_id;
  RETURN NEW;
END;
$$;

-- Fix the is_admin function with proper search_path
CREATE OR REPLACE FUNCTION public.is_admin(user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = 'public'
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = user_id AND is_admin = true
  );
$$;
