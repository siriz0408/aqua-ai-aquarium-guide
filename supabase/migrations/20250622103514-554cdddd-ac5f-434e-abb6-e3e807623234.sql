
-- 100% Paywall Migration: Remove All Trial Functionality
-- This migration removes all trial-related columns, functions, and data

-- 1. Remove trial-related columns from profiles table
ALTER TABLE profiles 
DROP COLUMN IF EXISTS trial_start_date,
DROP COLUMN IF EXISTS trial_end_date,
DROP COLUMN IF EXISTS has_used_trial,
DROP COLUMN IF EXISTS trial_type,
DROP COLUMN IF EXISTS trial_stripe_subscription_id,
DROP COLUMN IF EXISTS last_trial_start,
DROP COLUMN IF EXISTS total_trial_count,
DROP COLUMN IF EXISTS trial_started_at,
DROP COLUMN IF EXISTS stripe_price_id;

-- 2. Drop all trial-related functions
DROP FUNCTION IF EXISTS public.start_user_trial(uuid);
DROP FUNCTION IF EXISTS public.start_user_trial_safe(uuid, integer, text);
DROP FUNCTION IF EXISTS public.admin_extend_user_trial(uuid, uuid, integer);
DROP FUNCTION IF EXISTS public.check_user_trial_status(uuid);
DROP FUNCTION IF EXISTS public.check_user_subscription_access(uuid);

-- 3. Create simplified subscription sync function
CREATE OR REPLACE FUNCTION public.sync_stripe_subscription(
  customer_email TEXT, 
  stripe_customer_id TEXT, 
  stripe_subscription_id TEXT DEFAULT NULL, 
  subscription_status TEXT DEFAULT 'expired', 
  price_id TEXT DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  user_id UUID;
  old_status TEXT;
  old_tier TEXT;
  new_status TEXT;
  new_tier TEXT;
  now_timestamp TIMESTAMP WITH TIME ZONE := NOW();
  valid_price_ids TEXT[] := ARRAY['price_1Rb8vR1d1AvgoBGoNIjxLKRR', 'price_1Rb8wD1d1AvgoBGoC8nfQXNK'];
BEGIN
  -- Validate inputs
  IF customer_email IS NULL OR customer_email = '' THEN
    RETURN jsonb_build_object('success', false, 'error', 'Customer email is required');
  END IF;
  
  -- Find user by email
  SELECT id, subscription_status, subscription_tier 
  INTO user_id, old_status, old_tier
  FROM profiles 
  WHERE email = customer_email;
  
  IF user_id IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'User not found');
  END IF;
  
  -- Determine new status and tier
  CASE subscription_status
    WHEN 'active', 'trialing' THEN
      new_status := 'active';
      new_tier := 'pro';
    ELSE
      new_status := 'inactive';
      new_tier := 'free';
  END CASE;
  
  -- Update user profile
  UPDATE profiles SET
    stripe_customer_id = sync_stripe_subscription.stripe_customer_id,
    stripe_subscription_id = sync_stripe_subscription.stripe_subscription_id,
    subscription_status = new_status,
    subscription_tier = new_tier,
    subscription_start_date = CASE 
      WHEN old_status != 'active' AND new_status = 'active' THEN now_timestamp
      ELSE subscription_start_date
    END,
    subscription_end_date = CASE
      WHEN new_status = 'inactive' THEN now_timestamp
      ELSE subscription_end_date
    END,
    updated_at = now_timestamp
  WHERE id = user_id;
  
  RETURN jsonb_build_object(
    'success', true,
    'user_id', user_id,
    'email', customer_email,
    'old_status', old_status,
    'new_status', new_status,
    'updated_at', now_timestamp
  );
END;
$$;

-- 4. Update handle_new_user to always start as inactive (100% paywall)
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
  
  -- Insert profile with inactive status (100% paywall)
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
    'inactive',  -- Always start as inactive
    'free',      -- Default tier
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

-- Grant permissions
GRANT EXECUTE ON FUNCTION public.sync_stripe_subscription TO authenticated;
