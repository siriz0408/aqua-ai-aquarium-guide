
-- Update the handle_new_user function to implement 1-day trial for new users
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
  VALUES (NEW.id);
  
  RETURN NEW;
END;
$$;

-- Create a function to check and update expired trials
CREATE OR REPLACE FUNCTION public.update_expired_trials()
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  updated_count integer;
BEGIN
  -- Update users whose trial has expired
  UPDATE public.profiles 
  SET 
    subscription_status = 'expired',
    updated_at = now()
  WHERE 
    subscription_status = 'trial' 
    AND trial_end_date < now();
  
  GET DIAGNOSTICS updated_count = ROW_COUNT;
  RETURN updated_count;
END;
$$;

-- Create a function that can be called to check trial status for a specific user
CREATE OR REPLACE FUNCTION public.check_user_trial_status(user_id uuid)
RETURNS TABLE(
  subscription_status text,
  trial_hours_remaining numeric,
  is_trial_expired boolean
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    p.subscription_status::text,
    CASE 
      WHEN p.trial_end_date IS NOT NULL THEN 
        EXTRACT(EPOCH FROM (p.trial_end_date - now())) / 3600
      ELSE 0
    END as trial_hours_remaining,
    CASE 
      WHEN p.subscription_status = 'trial' AND p.trial_end_date < now() THEN true
      ELSE false
    END as is_trial_expired
  FROM public.profiles p
  WHERE p.id = user_id;
END;
$$;
