
-- Fix for Paywall Issues: Complete Database Migration (Corrected)

-- 1. Drop ALL existing policies to start fresh
DO $$ 
BEGIN
    -- Drop all existing policies on profiles table
    DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
    DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
    DROP POLICY IF EXISTS "Users can view their own profiles" ON public.profiles;
    DROP POLICY IF EXISTS "Users can update their own profiles" ON public.profiles;
    DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
    DROP POLICY IF EXISTS "Admins can update all profiles" ON public.profiles;
    DROP POLICY IF EXISTS "Service role has full access" ON public.profiles;
    DROP POLICY IF EXISTS "Enable read access for all users" ON public.profiles;
    DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON public.profiles;
    DROP POLICY IF EXISTS "Enable update for users based on email" ON public.profiles;
EXCEPTION
    WHEN OTHERS THEN
        -- Continue if policies don't exist
        NULL;
END $$;

-- 2. Create clean, non-recursive RLS policies
CREATE POLICY "profiles_select_own" 
  ON public.profiles FOR SELECT 
  USING (auth.uid() = id);

CREATE POLICY "profiles_update_own" 
  ON public.profiles FOR UPDATE 
  USING (auth.uid() = id);

CREATE POLICY "profiles_insert_own" 
  ON public.profiles FOR INSERT 
  WITH CHECK (auth.uid() = id);

CREATE POLICY "profiles_service_role_access" 
  ON public.profiles FOR ALL 
  USING (auth.jwt()->>'role' = 'service_role');

-- 3. Add trial tracking column if it doesn't exist
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS trial_started_at TIMESTAMP WITH TIME ZONE;

-- 4. Fix existing user data - ensure paid users are properly marked
UPDATE public.profiles 
SET 
  subscription_status = 'active',
  subscription_tier = 'pro'
WHERE 
  stripe_subscription_id IS NOT NULL 
  AND stripe_subscription_id != '';

-- 5. Create improved access check function
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
  
  -- Check subscription status fields
  IF user_record.subscription_status = 'active' AND user_record.subscription_tier = 'pro' THEN
    RETURN QUERY SELECT TRUE, 'paid'::TEXT, 0::NUMERIC;
    RETURN;
  END IF;
  
  -- Check trial status
  IF user_record.trial_started_at IS NOT NULL THEN
    hours_elapsed := EXTRACT(EPOCH FROM (NOW() - user_record.trial_started_at)) / 3600;
    
    IF hours_elapsed < 24 THEN
      RETURN QUERY SELECT TRUE, 'trial'::TEXT, (24 - hours_elapsed)::NUMERIC;
      RETURN;
    ELSE
      RETURN QUERY SELECT FALSE, 'trial_expired'::TEXT, 0::NUMERIC;
      RETURN;
    END IF;
  END IF;
  
  -- Default to free user
  RETURN QUERY SELECT FALSE, 'free'::TEXT, 0::NUMERIC;
END;
$$;

-- 6. Update handle_new_user function to properly set trial
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
    is_admin,
    admin_role,
    admin_permissions
  )
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    'free',
    'free',
    CASE 
      WHEN admin_invitation.email IS NOT NULL THEN NULL
      ELSE NOW()
    END,
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

-- 7. Create function to ensure profile exists
CREATE OR REPLACE FUNCTION public.ensure_user_profile(user_id UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Check if profile exists
  IF NOT EXISTS (SELECT 1 FROM profiles WHERE id = user_id) THEN
    -- Get user data from auth.users
    INSERT INTO profiles (id, email, subscription_status, subscription_tier, trial_started_at)
    SELECT 
      id, 
      email,
      'free',
      'free',
      NOW()
    FROM auth.users
    WHERE id = user_id
    ON CONFLICT (id) DO NOTHING;
  END IF;
END;
$$;

-- 8. Grant necessary permissions
GRANT EXECUTE ON FUNCTION public.check_user_access TO authenticated;
GRANT EXECUTE ON FUNCTION public.ensure_user_profile TO authenticated;

-- 9. Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_profiles_stripe_subscription_id ON profiles(stripe_subscription_id);
CREATE INDEX IF NOT EXISTS idx_profiles_subscription_status ON profiles(subscription_status, subscription_tier);
