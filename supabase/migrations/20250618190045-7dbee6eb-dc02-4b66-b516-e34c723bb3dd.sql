
-- Fix the handle_new_user function to use correct column names and implement proper 1-day trial
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
  
  -- Insert the basic profile with 1-day trial for non-admin users
  INSERT INTO public.profiles (
    id, 
    email, 
    full_name, 
    subscription_status, 
    subscription_tier, 
    trial_start_date,
    trial_end_date,
    is_admin,
    admin_role,
    admin_permissions
  )
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data ->> 'full_name',
    CASE 
      WHEN admin_invitation.admin_role IS NOT NULL THEN 'free'
      ELSE 'trial'
    END,
    'free',
    CASE 
      WHEN admin_invitation.admin_role IS NOT NULL THEN NULL
      ELSE now()
    END,
    CASE 
      WHEN admin_invitation.admin_role IS NOT NULL THEN NULL
      ELSE now() + INTERVAL '1 day'
    END,
    COALESCE(admin_invitation.admin_role IS NOT NULL, false),
    admin_invitation.admin_role,
    admin_invitation.permissions
  );
  
  -- Mark invitation as accepted if it exists
  IF admin_invitation.email IS NOT NULL THEN
    UPDATE public.admin_invitations 
    SET accepted = true 
    WHERE email = NEW.email;
  END IF;
  
  -- Also create a profile setup record
  INSERT INTO public.user_profile_setup (user_id)
  VALUES (NEW.id)
  ON CONFLICT (user_id) DO NOTHING;
  
  RETURN NEW;
END;
$$;
