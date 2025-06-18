
-- First, let's check and fix any invalid subscription statuses in existing data
UPDATE public.profiles 
SET subscription_status = 'free' 
WHERE subscription_status NOT IN ('trial', 'active', 'expired', 'free');

-- Update any rows that have 'free' status to use the new constraint values
UPDATE public.profiles 
SET subscription_status = 'expired' 
WHERE subscription_status = 'free';

-- Now let's add the corrected constraint that includes 'free' as a valid status
ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS check_subscription_status;
ALTER TABLE public.profiles ADD CONSTRAINT check_subscription_status 
CHECK (subscription_status IN ('trial', 'active', 'expired', 'free'));

-- Ensure subscription tier is properly constrained
ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS check_subscription_tier;
ALTER TABLE public.profiles ADD CONSTRAINT check_subscription_tier 
CHECK (subscription_tier IN ('free', 'pro'));

-- Update the admin update function to handle all necessary fields properly
CREATE OR REPLACE FUNCTION public.admin_update_profile(
  requesting_admin_id uuid, 
  target_user_id uuid, 
  new_full_name text, 
  new_is_admin boolean, 
  new_admin_role character varying, 
  new_subscription_status character varying, 
  new_subscription_tier character varying, 
  new_free_credits_remaining integer DEFAULT NULL
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  -- Check if requesting user is admin
  IF NOT EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.id = requesting_admin_id AND p.is_admin = true
  ) THEN
    RAISE EXCEPTION 'Access denied: User is not an admin';
  END IF;
  
  -- Update the target user's profile with proper trial date handling
  UPDATE public.profiles 
  SET 
    full_name = new_full_name,
    is_admin = new_is_admin,
    admin_role = new_admin_role,
    subscription_status = new_subscription_status,
    subscription_tier = new_subscription_tier,
    -- Set trial dates when status is changed to trial
    trial_start_date = CASE 
      WHEN new_subscription_status = 'trial' AND subscription_status != 'trial' THEN now()
      WHEN new_subscription_status = 'trial' THEN COALESCE(trial_start_date, now())
      ELSE trial_start_date
    END,
    trial_end_date = CASE 
      WHEN new_subscription_status = 'trial' AND subscription_status != 'trial' THEN now() + INTERVAL '1 day'
      WHEN new_subscription_status = 'trial' THEN COALESCE(trial_end_date, now() + INTERVAL '1 day')
      ELSE trial_end_date
    END,
    -- Set subscription dates for active status
    subscription_start_date = CASE 
      WHEN new_subscription_status = 'active' AND subscription_status != 'active' THEN now()
      ELSE subscription_start_date
    END,
    subscription_end_date = CASE 
      WHEN new_subscription_status = 'active' AND new_subscription_tier = 'pro' THEN now() + INTERVAL '1 month'
      WHEN new_subscription_status = 'expired' THEN now()
      ELSE subscription_end_date
    END,
    updated_at = now()
  WHERE id = target_user_id;
  
  RETURN FOUND;
END;
$$;

-- Create a function to automatically expire trials
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

-- Ensure the handle_new_user function sets up trials correctly
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
  
  -- Insert the basic profile with proper trial setup for non-admin users
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
      WHEN admin_invitation.admin_role IS NOT NULL THEN 'active'
      ELSE 'trial'
    END,
    CASE 
      WHEN admin_invitation.admin_role IS NOT NULL THEN 'pro'
      ELSE 'free'
    END,
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
