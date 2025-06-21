
-- First, remove the check constraint that's causing issues
ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS check_subscription_status;

-- Clean up and consolidate user/subscription tables
DROP TABLE IF EXISTS public.subscribers CASCADE;
DROP TABLE IF EXISTS public.subscriptions CASCADE;
DROP TABLE IF EXISTS public.customers CASCADE;
DROP TABLE IF EXISTS public.subscription_events CASCADE;
DROP TABLE IF EXISTS public.subscription_usage_logs CASCADE;
DROP TABLE IF EXISTS public.orders CASCADE;

-- Clean up the profiles table to have only essential fields
ALTER TABLE public.profiles 
DROP COLUMN IF EXISTS trial_started_at,
DROP COLUMN IF EXISTS trial_end_date,
DROP COLUMN IF EXISTS trial_start_date,
DROP COLUMN IF EXISTS has_used_trial,
DROP COLUMN IF EXISTS subscription_metadata,
DROP COLUMN IF EXISTS last_trial_start,
DROP COLUMN IF EXISTS total_trial_count,
DROP COLUMN IF EXISTS stripe_price_id,
DROP COLUMN IF EXISTS trial_type,
DROP COLUMN IF EXISTS trial_stripe_subscription_id;

-- Ensure essential fields exist
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS subscription_status VARCHAR DEFAULT 'inactive',
ADD COLUMN IF NOT EXISTS subscription_tier VARCHAR DEFAULT 'free',
ADD COLUMN IF NOT EXISTS stripe_customer_id VARCHAR,
ADD COLUMN IF NOT EXISTS stripe_subscription_id VARCHAR;

-- Update subscription_status values to be consistent
UPDATE public.profiles 
SET subscription_status = CASE 
  WHEN subscription_status IN ('trial', 'expired') THEN 'inactive'
  WHEN subscription_status = 'free' THEN 'inactive'
  WHEN subscription_status = 'active' THEN 'active'
  ELSE 'inactive'
END;

-- Create webhook_events table for audit logging
CREATE TABLE IF NOT EXISTS public.webhook_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  stripe_event_id TEXT UNIQUE NOT NULL,
  event_type TEXT NOT NULL,
  processing_status TEXT DEFAULT 'pending',
  customer_id TEXT,
  subscription_id TEXT,
  user_email TEXT,
  user_id UUID REFERENCES public.profiles(id),
  raw_data JSONB,
  error_message TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  processed_at TIMESTAMPTZ
);

-- Enable RLS on webhook_events (admin only)
ALTER TABLE public.webhook_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "webhook_events_admin_only" ON public.webhook_events
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND is_admin = true
  )
);

-- Update the handle_new_user function to set proper defaults
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  admin_invitation RECORD;
BEGIN
  -- Check for admin invitation
  SELECT * INTO admin_invitation 
  FROM admin_invitations 
  WHERE email = NEW.email AND NOT accepted AND expires_at > now();
  
  -- Insert profile with inactive status
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
  
  -- Create profile setup record if needed
  INSERT INTO user_profile_setup (user_id)
  VALUES (NEW.id)
  ON CONFLICT (user_id) DO NOTHING;
  
  RETURN NEW;
END;
$$;

-- Create a simple function to check if user has active subscription
CREATE OR REPLACE FUNCTION public.user_has_active_subscription(user_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  user_status VARCHAR;
BEGIN
  SELECT subscription_status INTO user_status
  FROM profiles
  WHERE id = user_id;
  
  RETURN COALESCE(user_status = 'active', false);
END;
$$;

-- Grant permissions
GRANT EXECUTE ON FUNCTION public.user_has_active_subscription TO authenticated;

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_profiles_subscription_status ON public.profiles(subscription_status);
CREATE INDEX IF NOT EXISTS idx_profiles_stripe_customer ON public.profiles(stripe_customer_id);
CREATE INDEX IF NOT EXISTS idx_webhook_events_stripe_id ON public.webhook_events(stripe_event_id);
CREATE INDEX IF NOT EXISTS idx_webhook_events_user_id ON public.webhook_events(user_id);

-- Clean up unused functions related to trials and old subscription logic
DROP FUNCTION IF EXISTS public.start_user_trial CASCADE;
DROP FUNCTION IF EXISTS public.start_user_trial_safe CASCADE;
DROP FUNCTION IF EXISTS public.start_comprehensive_trial CASCADE;
DROP FUNCTION IF EXISTS public.check_user_trial_status CASCADE;
DROP FUNCTION IF EXISTS public.admin_extend_user_trial CASCADE;
DROP FUNCTION IF EXISTS public.check_comprehensive_subscription_access CASCADE;
DROP FUNCTION IF EXISTS public.check_user_subscription_access CASCADE;
DROP FUNCTION IF EXISTS public.sync_stripe_subscription CASCADE;
DROP FUNCTION IF EXISTS public.sync_stripe_subscription_enhanced CASCADE;
DROP FUNCTION IF EXISTS public.sync_stripe_subscription_comprehensive CASCADE;
DROP FUNCTION IF EXISTS public.sync_user_subscription_from_stripe CASCADE;
DROP FUNCTION IF EXISTS public.process_webhook_event CASCADE;
