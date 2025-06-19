
-- Update profiles table to properly handle trial workflow
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS trial_started_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS stripe_price_id TEXT;

-- Update the handle_new_user function to properly set up new users
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  admin_invitation RECORD;
BEGIN
  -- Check for admin invitation
  SELECT * INTO admin_invitation 
  FROM admin_invitations 
  WHERE email = NEW.email AND NOT accepted AND expires_at > now();
  
  -- Insert profile
  INSERT INTO profiles (
    id, 
    email, 
    full_name, 
    subscription_status, 
    subscription_tier,
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
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    CASE 
      WHEN admin_invitation.email IS NOT NULL THEN 'free'
      ELSE 'free'  -- Don't auto-start trial, require explicit action
    END,
    'free',
    NULL,  -- Don't auto-start trial
    NULL,
    NULL,
    COALESCE(admin_invitation.admin_role IS NOT NULL, false),
    admin_invitation.admin_role,
    admin_invitation.permissions
  );
  
  -- Mark invitation as accepted
  IF admin_invitation.email IS NOT NULL THEN
    UPDATE admin_invitations 
    SET accepted = true 
    WHERE email = NEW.email;
  END IF;
  
  -- Create profile setup record
  INSERT INTO user_profile_setup (user_id)
  VALUES (NEW.id)
  ON CONFLICT (user_id) DO NOTHING;
  
  RETURN NEW;
END;
$$;

-- Create function to start trial for a user
CREATE OR REPLACE FUNCTION public.start_user_trial(user_id UUID)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Update user to trial status
  UPDATE profiles 
  SET 
    subscription_status = 'trial',
    trial_started_at = NOW(),
    trial_start_date = NOW(),
    trial_end_date = NOW() + INTERVAL '3 days',
    updated_at = NOW()
  WHERE id = user_id;
  
  RETURN jsonb_build_object(
    'success', true,
    'trial_end_date', (NOW() + INTERVAL '3 days'),
    'message', 'Trial started successfully'
  );
END;
$$;

-- Update the check_user_access function to handle the new trial logic
CREATE OR REPLACE FUNCTION public.check_user_access(user_id UUID)
RETURNS TABLE(
  has_access BOOLEAN,
  access_reason TEXT,
  trial_hours_remaining NUMERIC
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  user_record RECORD;
  hours_elapsed NUMERIC;
BEGIN
  -- Get user profile
  SELECT 
    id,
    is_admin,
    subscription_status,
    subscription_tier,
    trial_started_at,
    trial_end_date,
    stripe_subscription_id
  INTO user_record
  FROM profiles
  WHERE id = user_id;
  
  -- No user found
  IF user_record IS NULL THEN
    RETURN QUERY SELECT FALSE, 'no_user'::TEXT, 0::NUMERIC;
    RETURN;
  END IF;
  
  -- Admin always has access
  IF user_record.is_admin = TRUE THEN
    RETURN QUERY SELECT TRUE, 'admin'::TEXT, 0::NUMERIC;
    RETURN;
  END IF;
  
  -- Check for active Stripe subscription (most reliable)
  IF user_record.stripe_subscription_id IS NOT NULL AND user_record.stripe_subscription_id != '' THEN
    RETURN QUERY SELECT TRUE, 'paid'::TEXT, 0::NUMERIC;
    RETURN;
  END IF;
  
  -- Check subscription status fields for active pro
  IF user_record.subscription_status = 'active' AND user_record.subscription_tier = 'pro' THEN
    RETURN QUERY SELECT TRUE, 'paid'::TEXT, 0::NUMERIC;
    RETURN;
  END IF;
  
  -- Check trial status using trial_end_date
  IF user_record.subscription_status = 'trial' AND user_record.trial_end_date IS NOT NULL THEN
    hours_elapsed := EXTRACT(EPOCH FROM (user_record.trial_end_date - NOW())) / 3600;
    
    IF hours_elapsed > 0 THEN
      RETURN QUERY SELECT TRUE, 'trial'::TEXT, hours_elapsed::NUMERIC;
      RETURN;
    ELSE
      -- Trial expired, update status
      UPDATE profiles 
      SET subscription_status = 'expired', updated_at = NOW()
      WHERE id = user_id;
      
      RETURN QUERY SELECT FALSE, 'trial_expired'::TEXT, 0::NUMERIC;
      RETURN;
    END IF;
  END IF;
  
  -- Default to free user (no access)
  RETURN QUERY SELECT FALSE, 'free'::TEXT, 0::NUMERIC;
END;
$$;

-- Grant permissions
GRANT EXECUTE ON FUNCTION public.start_user_trial TO authenticated;
GRANT EXECUTE ON FUNCTION public.check_user_access TO authenticated;
