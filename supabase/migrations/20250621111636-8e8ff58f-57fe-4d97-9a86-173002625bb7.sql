
-- 100% Paywall Implementation: Remove Trial Logic and Enforce Subscription-Only Access

-- 1. Update the comprehensive subscription access function to remove trial logic
CREATE OR REPLACE FUNCTION public.check_user_subscription_access(user_id uuid)
RETURNS TABLE(
  has_access boolean, 
  access_type text, 
  subscription_tier text, 
  trial_hours_remaining numeric, 
  trial_type text, 
  can_start_trial boolean, 
  subscription_end_date timestamp with time zone
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  user_record RECORD;
BEGIN
  -- Get user profile
  SELECT 
    id, is_admin, subscription_status, subscription_tier, 
    stripe_subscription_id, subscription_end_date as sub_end_date
  INTO user_record
  FROM profiles
  WHERE id = user_id;
  
  -- User not found
  IF user_record IS NULL THEN
    RETURN QUERY SELECT FALSE, 'no_user'::TEXT, 'free'::TEXT, 0::NUMERIC, NULL::TEXT, FALSE, NULL::TIMESTAMP WITH TIME ZONE;
    RETURN;
  END IF;
  
  -- Admin always has access
  IF user_record.is_admin = TRUE THEN
    RETURN QUERY SELECT TRUE, 'admin'::TEXT, 'unlimited'::TEXT, 0::NUMERIC, NULL::TEXT, FALSE, NULL::TIMESTAMP WITH TIME ZONE;
    RETURN;
  END IF;
  
  -- Check for active paid subscription (ONLY way to get access)
  IF user_record.stripe_subscription_id IS NOT NULL 
     AND user_record.stripe_subscription_id != '' 
     AND user_record.subscription_status = 'active' 
     AND user_record.subscription_tier = 'pro' THEN
    RETURN QUERY SELECT TRUE, 'paid'::TEXT, 'pro'::TEXT, 0::NUMERIC, NULL::TEXT, FALSE, user_record.sub_end_date;
    RETURN;
  END IF;
  
  -- Everyone else has NO ACCESS (100% paywall)
  RETURN QUERY SELECT FALSE, 'free'::TEXT, 'free'::TEXT, 0::NUMERIC, NULL::TEXT, FALSE, NULL::TIMESTAMP WITH TIME ZONE;
END;
$$;

-- 2. Update the simple access check function
CREATE OR REPLACE FUNCTION public.check_user_access(user_id uuid)
RETURNS TABLE(has_access boolean, access_reason text, trial_hours_remaining numeric)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  user_record RECORD;
BEGIN
  -- Get user profile
  SELECT 
    id, is_admin, subscription_status, subscription_tier, stripe_subscription_id
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
  
  -- Check for active Stripe subscription (ONLY way to get access)
  IF user_record.stripe_subscription_id IS NOT NULL 
     AND user_record.stripe_subscription_id != '' 
     AND user_record.subscription_status = 'active' 
     AND user_record.subscription_tier = 'pro' THEN
    RETURN QUERY SELECT TRUE, 'paid'::TEXT, 0::NUMERIC;
    RETURN;
  END IF;
  
  -- Everyone else is blocked (100% paywall)
  RETURN QUERY SELECT FALSE, 'free'::TEXT, 0::NUMERIC;
END;
$$;

-- 3. Update handle_new_user to not start any trials
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
  
  -- Insert profile with NO trial (100% paywall)
  INSERT INTO profiles (
    id, 
    email, 
    full_name, 
    subscription_status, 
    subscription_tier,
    is_admin,
    admin_role,
    admin_permissions
  )
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    'free',  -- Always start as free
    'free',  -- Always start as free
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

-- Grant necessary permissions
GRANT EXECUTE ON FUNCTION public.check_user_subscription_access TO authenticated;
GRANT EXECUTE ON FUNCTION public.check_user_access TO authenticated;
