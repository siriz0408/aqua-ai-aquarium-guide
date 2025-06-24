
-- Create missing admin_extend_user_trial function
CREATE OR REPLACE FUNCTION public.admin_extend_user_trial(
  admin_user_id UUID,
  target_user_id UUID,
  extension_days INTEGER DEFAULT 3
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  user_record RECORD;
  trial_end TIMESTAMP WITH TIME ZONE;
BEGIN
  -- Check if requesting user is admin
  IF NOT EXISTS (
    SELECT 1 FROM profiles WHERE id = admin_user_id AND is_admin = true
  ) THEN
    RETURN jsonb_build_object('success', false, 'error', 'Access denied: User is not an admin');
  END IF;
  
  -- Get target user data
  SELECT * INTO user_record FROM profiles WHERE id = target_user_id;
  
  IF user_record IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'Target user not found');
  END IF;
  
  -- Calculate new trial end date
  IF user_record.trial_end_date IS NOT NULL THEN
    -- Extend existing trial
    trial_end := user_record.trial_end_date + INTERVAL '1 day' * extension_days;
  ELSE
    -- Start new trial
    trial_end := NOW() + INTERVAL '1 day' * extension_days;
  END IF;
  
  -- Update user profile
  UPDATE profiles 
  SET 
    subscription_status = 'trial',
    trial_end_date = trial_end,
    trial_started_at = CASE WHEN trial_started_at IS NULL THEN NOW() ELSE trial_started_at END,
    has_used_trial = true,
    updated_at = NOW()
  WHERE id = target_user_id;
  
  RETURN jsonb_build_object(
    'success', true,
    'extension_days', extension_days,
    'new_trial_end', trial_end
  );
END;
$$;

-- Create missing check_user_access function
CREATE OR REPLACE FUNCTION public.check_user_access(user_id UUID)
RETURNS TABLE(
  has_access BOOLEAN,
  access_reason TEXT,
  trial_hours_remaining NUMERIC
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  user_record RECORD;
  hours_remaining NUMERIC;
  now_timestamp TIMESTAMP WITH TIME ZONE := NOW();
BEGIN
  -- Get user profile
  SELECT * INTO user_record FROM profiles WHERE id = user_id;
  
  IF user_record IS NULL THEN
    RETURN QUERY SELECT FALSE, 'no_user'::TEXT, 0::NUMERIC;
    RETURN;
  END IF;
  
  -- Admin always has access
  IF user_record.is_admin = TRUE THEN
    RETURN QUERY SELECT TRUE, 'admin'::TEXT, 0::NUMERIC;
    RETURN;
  END IF;
  
  -- Active paid subscription
  IF user_record.subscription_status = 'active' AND user_record.subscription_tier = 'pro' THEN
    RETURN QUERY SELECT TRUE, 'active_subscription'::TEXT, 0::NUMERIC;
    RETURN;
  END IF;
  
  -- Active trial
  IF user_record.subscription_status = 'trial' AND user_record.trial_end_date IS NOT NULL THEN
    hours_remaining := EXTRACT(EPOCH FROM (user_record.trial_end_date - now_timestamp)) / 3600;
    
    IF hours_remaining > 0 THEN
      RETURN QUERY SELECT TRUE, 'trial'::TEXT, hours_remaining;
      RETURN;
    ELSE
      -- Trial expired
      UPDATE profiles SET subscription_status = 'expired' WHERE id = user_id;
      RETURN QUERY SELECT FALSE, 'trial_expired'::TEXT, 0::NUMERIC;
      RETURN;
    END IF;
  END IF;
  
  -- No access
  RETURN QUERY SELECT FALSE, 'no_access'::TEXT, 0::NUMERIC;
END;
$$;

-- Create admin_invitations table
CREATE TABLE IF NOT EXISTS public.admin_invitations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL,
  admin_role TEXT NOT NULL DEFAULT 'admin',
  permissions JSONB DEFAULT '[]'::jsonb,
  invited_by UUID REFERENCES profiles(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() + INTERVAL '7 days',
  used BOOLEAN DEFAULT FALSE
);

-- Enable RLS on admin_invitations
ALTER TABLE public.admin_invitations ENABLE ROW LEVEL SECURITY;

-- Create RLS policy for admin_invitations
CREATE POLICY "Admins can manage invitations" 
  ON public.admin_invitations FOR ALL 
  USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true)
  );

-- Grant permissions
GRANT EXECUTE ON FUNCTION public.admin_extend_user_trial TO authenticated;
GRANT EXECUTE ON FUNCTION public.check_user_access TO authenticated;
GRANT ALL ON TABLE public.admin_invitations TO authenticated;
