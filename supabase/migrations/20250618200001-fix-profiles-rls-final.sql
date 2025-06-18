
-- Drop all existing problematic RLS policies
DROP POLICY IF EXISTS "profiles_users_own_data" ON public.profiles;
DROP POLICY IF EXISTS "profiles_service_role_full_access" ON public.profiles;
DROP POLICY IF EXISTS "profiles_select_policy" ON public.profiles;
DROP POLICY IF EXISTS "profiles_update_policy" ON public.profiles;
DROP POLICY IF EXISTS "profiles_insert_policy" ON public.profiles;
DROP POLICY IF EXISTS "profiles_service_role_policy" ON public.profiles;

-- Create simple, non-recursive RLS policies for profiles
CREATE POLICY "profiles_select_own" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "profiles_update_own" ON public.profiles  
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "profiles_insert_own" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Create service role policy that bypasses RLS for webhooks and admin functions
CREATE POLICY "profiles_service_role_access" ON public.profiles
  FOR ALL USING (
    current_setting('role') = 'service_role' OR
    current_setting('request.jwt.claims', true)::json->>'role' = 'service_role'
  );

-- Recreate the ensure_user_profile function with better error handling
CREATE OR REPLACE FUNCTION public.ensure_user_profile(user_id UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  -- Use INSERT ... ON CONFLICT to avoid race conditions
  INSERT INTO profiles (
    id, 
    email, 
    subscription_status,
    subscription_tier,
    created_at, 
    updated_at
  )
  SELECT 
    user_id,
    (SELECT email FROM auth.users WHERE id = user_id),
    'free',
    'free',
    NOW(),
    NOW()
  WHERE NOT EXISTS (
    SELECT 1 FROM profiles WHERE id = user_id
  )
  ON CONFLICT (id) DO NOTHING;
END;
$$;

-- Update the check_user_access function to work with the new schema
CREATE OR REPLACE FUNCTION public.check_user_access(user_id UUID)
RETURNS TABLE(
  has_access BOOLEAN,
  access_reason TEXT,
  subscription_tier TEXT,
  subscription_status TEXT,
  is_admin BOOLEAN,
  trial_hours_remaining INTEGER
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  profile_record RECORD;
  trial_hours INTEGER := 0;
BEGIN
  -- Ensure profile exists first
  PERFORM ensure_user_profile(user_id);
  
  -- Get profile data
  SELECT * INTO profile_record
  FROM profiles 
  WHERE id = user_id;
  
  -- If no profile found, return default values
  IF profile_record IS NULL THEN
    RETURN QUERY SELECT
      false as has_access,
      'no_profile' as access_reason,
      'free' as subscription_tier,
      'free' as subscription_status,
      false as is_admin,
      0 as trial_hours_remaining;
    RETURN;
  END IF;
  
  -- Calculate trial hours remaining
  IF profile_record.trial_start_date IS NOT NULL AND profile_record.trial_end_date IS NOT NULL THEN
    trial_hours := GREATEST(0, EXTRACT(EPOCH FROM (profile_record.trial_end_date - NOW())) / 3600);
  END IF;
  
  -- Return access information
  RETURN QUERY SELECT
    CASE 
      WHEN profile_record.is_admin = true THEN true
      WHEN profile_record.subscription_status = 'active' THEN true
      WHEN trial_hours > 0 THEN true
      ELSE false
    END as has_access,
    CASE 
      WHEN profile_record.is_admin = true THEN 'admin'
      WHEN profile_record.subscription_status = 'active' THEN 'subscription'
      WHEN trial_hours > 0 THEN 'trial'
      ELSE 'free'
    END as access_reason,
    COALESCE(profile_record.subscription_tier, 'free') as subscription_tier,
    COALESCE(profile_record.subscription_status, 'free') as subscription_status,
    COALESCE(profile_record.is_admin, false) as is_admin,
    trial_hours::INTEGER as trial_hours_remaining;
END;
$$;

-- Grant necessary permissions
GRANT EXECUTE ON FUNCTION public.ensure_user_profile TO anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.check_user_access TO anon, authenticated, service_role;
