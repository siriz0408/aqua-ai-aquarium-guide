
-- Grant admin access to all existing users
UPDATE public.profiles 
SET 
  is_admin = true,
  admin_role = 'admin',
  admin_permissions = '["user_management", "ticket_management", "analytics", "settings"]'::jsonb
WHERE is_admin IS NULL OR is_admin = false;

-- Also ensure any new users will automatically get admin access by updating the trigger function
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $$
DECLARE
  admin_invitation RECORD;
BEGIN
  -- Check if there's an admin invitation for this email
  SELECT * INTO admin_invitation 
  FROM public.admin_invitations 
  WHERE email = NEW.email AND NOT accepted AND expires_at > now();
  
  -- Insert the basic profile with admin access for everyone
  INSERT INTO public.profiles (
    id, 
    email, 
    full_name, 
    subscription_status, 
    subscription_tier, 
    free_credits_remaining, 
    total_credits_used,
    is_admin,
    admin_role,
    admin_permissions
  )
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data ->> 'full_name',
    'free',
    'basic',
    5,
    0,
    true, -- Give everyone admin access
    COALESCE(admin_invitation.admin_role, 'admin'),
    COALESCE(admin_invitation.permissions, '["user_management", "ticket_management", "analytics", "settings"]'::jsonb)
  );
  
  -- Mark invitation as accepted if it exists
  IF admin_invitation.email IS NOT NULL THEN
    UPDATE public.admin_invitations 
    SET accepted = true 
    WHERE email = NEW.email;
  END IF;
  
  -- Also create a profile setup record
  INSERT INTO public.user_profile_setup (user_id)
  VALUES (NEW.id);
  
  RETURN NEW;
END;
$$;
