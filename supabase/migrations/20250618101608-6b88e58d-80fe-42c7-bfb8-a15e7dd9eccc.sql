
-- Add trial tracking columns to profiles table
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS trial_started_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS subscription_type VARCHAR(20) DEFAULT 'trial' 
CHECK (subscription_type IN ('trial', 'paid', 'expired'));

-- Update existing users to expired state (they're past any trial period)
UPDATE public.profiles 
SET subscription_type = 'expired'
WHERE subscription_status = 'free' OR subscription_status IS NULL;

-- Update paid users
UPDATE public.profiles 
SET subscription_type = 'paid'
WHERE subscription_status = 'active' AND subscription_tier = 'pro';

-- Create function to check trial status
CREATE OR REPLACE FUNCTION public.check_trial_status(user_id UUID)
RETURNS TABLE(is_trial_active BOOLEAN, hours_remaining NUMERIC)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  user_trial_start TIMESTAMP WITH TIME ZONE;
  hours_elapsed NUMERIC;
BEGIN
  SELECT trial_started_at INTO user_trial_start
  FROM public.profiles
  WHERE id = user_id;
  
  IF user_trial_start IS NULL THEN
    RETURN QUERY SELECT FALSE, 0::NUMERIC;
    RETURN;
  END IF;
  
  hours_elapsed := EXTRACT(EPOCH FROM (NOW() - user_trial_start)) / 3600;
  
  IF hours_elapsed < 24 THEN
    RETURN QUERY SELECT TRUE, (24 - hours_elapsed)::NUMERIC;
  ELSE
    RETURN QUERY SELECT FALSE, 0::NUMERIC;
  END IF;
END;
$$;

-- Update handle_new_user function to set trial
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  admin_invitation RECORD;
BEGIN
  -- Check if there's an admin invitation for this email
  SELECT * INTO admin_invitation 
  FROM public.admin_invitations 
  WHERE email = NEW.email AND NOT accepted AND expires_at > now();
  
  -- Insert the basic profile with trial setup for non-admin users
  INSERT INTO public.profiles (
    id, 
    email, 
    full_name, 
    subscription_status, 
    subscription_tier, 
    subscription_type,
    trial_started_at,
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
      WHEN admin_invitation.admin_role IS NOT NULL THEN 'paid'
      ELSE 'trial'
    END,
    CASE 
      WHEN admin_invitation.admin_role IS NOT NULL THEN NULL
      ELSE NOW()
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

-- Create scheduled job function to expire trials
CREATE OR REPLACE FUNCTION public.expire_trials()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE public.profiles
  SET 
    subscription_type = 'expired',
    subscription_status = 'free',
    subscription_tier = 'free'
  WHERE 
    subscription_type = 'trial'
    AND trial_started_at < NOW() - INTERVAL '24 hours';
END;
$$;

-- Update RPC function for subscription updates
CREATE OR REPLACE FUNCTION public.update_subscription_status(
  target_user_id uuid,
  new_subscription_status text,
  new_subscription_tier text,
  new_subscription_type text DEFAULT NULL,
  new_stripe_customer_id text DEFAULT NULL,
  new_stripe_subscription_id text DEFAULT NULL
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE public.profiles
  SET
    subscription_status = new_subscription_status,
    subscription_tier = new_subscription_tier,
    subscription_type = COALESCE(new_subscription_type, subscription_type),
    stripe_customer_id = COALESCE(new_stripe_customer_id, stripe_customer_id),
    stripe_subscription_id = COALESCE(new_stripe_subscription_id, stripe_subscription_id),
    updated_at = NOW()
  WHERE id = target_user_id;
  
  RETURN FOUND;
END;
$$;
