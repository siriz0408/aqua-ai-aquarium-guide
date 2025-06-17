
-- PHASE 1: DATABASE SCHEMA SIMPLIFICATION

-- Step 1: Clean up subscription tiers and statuses
UPDATE public.profiles 
SET 
  subscription_tier = CASE 
    WHEN subscription_tier IN ('pro_limited', 'pro_unlimited', 'premium') THEN 'pro'
    WHEN subscription_tier = 'basic' THEN 'free'
    ELSE 'free'
  END,
  subscription_status = CASE 
    WHEN subscription_status = 'active' THEN 'active'
    ELSE 'free'
  END;

-- Step 2: Remove credit tracking columns from profiles table
ALTER TABLE public.profiles 
DROP COLUMN IF EXISTS free_credits_remaining,
DROP COLUMN IF EXISTS total_credits_used,
DROP COLUMN IF EXISTS monthly_credits_limit,
DROP COLUMN IF EXISTS monthly_credits_used,
DROP COLUMN IF EXISTS last_credit_reset;

-- Step 3: Add constraints to ensure only valid subscription values
ALTER TABLE public.profiles 
ADD CONSTRAINT check_subscription_tier 
CHECK (subscription_tier IN ('free', 'pro'));

ALTER TABLE public.profiles 
ADD CONSTRAINT check_subscription_status 
CHECK (subscription_status IN ('free', 'active'));

-- Set default values for new users
ALTER TABLE public.profiles 
ALTER COLUMN subscription_tier SET DEFAULT 'free',
ALTER COLUMN subscription_status SET DEFAULT 'free';

-- Step 4: Drop the subscription_usage_logs table entirely
DROP TABLE IF EXISTS public.subscription_usage_logs;

-- Step 5: Update the handle_new_user function to use simplified model
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
  
  -- Insert the basic profile with simplified subscription model
  INSERT INTO public.profiles (
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
    NEW.raw_user_meta_data ->> 'full_name',
    'free',
    'free',
    COALESCE(admin_invitation.admin_role IS NOT NULL, false), -- Only admin if invited
    admin_invitation.admin_role, -- NULL unless invited
    admin_invitation.permissions -- NULL unless invited
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

-- Step 6: Remove credit-related functions
DROP FUNCTION IF EXISTS public.reset_monthly_credits();
DROP FUNCTION IF EXISTS public.can_use_feature(uuid);

-- Step 7: Create new simplified access control function
CREATE OR REPLACE FUNCTION public.can_access_ai_features(user_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  user_profile RECORD;
BEGIN
  SELECT * INTO user_profile 
  FROM public.profiles 
  WHERE id = user_id;
  
  IF user_profile IS NULL THEN
    RETURN false;
  END IF;
  
  -- Admins always have access
  IF user_profile.is_admin = true THEN
    RETURN true;
  END IF;
  
  -- Pro users with active subscription have access
  IF user_profile.subscription_tier = 'pro' AND user_profile.subscription_status = 'active' THEN
    RETURN true;
  END IF;
  
  -- Free users don't have access to AI features
  RETURN false;
END;
$$;

-- Step 8: Update subscribers table to match simplified model
UPDATE public.subscribers 
SET 
  subscription_tier = CASE 
    WHEN subscription_tier IN ('pro_limited', 'pro_unlimited', 'premium') THEN 'pro'
    WHEN subscription_tier = 'basic' THEN 'free'
    ELSE 'free'
  END;

-- Add constraints to subscribers table as well
ALTER TABLE public.subscribers 
ADD CONSTRAINT check_subscriber_tier 
CHECK (subscription_tier IN ('free', 'pro'));
