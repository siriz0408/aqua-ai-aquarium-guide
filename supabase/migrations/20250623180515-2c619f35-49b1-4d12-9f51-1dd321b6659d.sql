
-- COMPLETE DATABASE RESET FOR SUBSCRIPTION SYSTEM
-- Run this entire script at once in Supabase SQL Editor

-- 1. Create backup first
CREATE TABLE IF NOT EXISTS public._backup_profiles_before_overhaul AS 
SELECT * FROM public.profiles;

-- 2. Drop all subscription-related tables
DROP TABLE IF EXISTS public.subscribers CASCADE;
DROP TABLE IF EXISTS public.subscriptions CASCADE;
DROP TABLE IF EXISTS public.customers CASCADE;
DROP TABLE IF EXISTS public.subscription_events CASCADE;
DROP TABLE IF EXISTS public.manual_sync_operations CASCADE;

-- 3. Remove ALL trial and subscription complexity from profiles
ALTER TABLE public.profiles 
DROP COLUMN IF EXISTS trial_started_at,
DROP COLUMN IF EXISTS trial_start_date,
DROP COLUMN IF EXISTS trial_end_date,
DROP COLUMN IF EXISTS trial_type,
DROP COLUMN IF EXISTS has_used_trial,
DROP COLUMN IF EXISTS trial_stripe_subscription_id,
DROP COLUMN IF EXISTS subscription_metadata,
DROP COLUMN IF EXISTS last_trial_start,
DROP COLUMN IF EXISTS total_trial_count,
DROP COLUMN IF EXISTS subscription_type,
DROP COLUMN IF EXISTS subscription_end_date,
DROP COLUMN IF EXISTS stripe_price_id,
DROP COLUMN IF EXISTS free_credits_remaining,
DROP COLUMN IF EXISTS total_credits_used,
DROP COLUMN IF EXISTS monthly_credits_limit,
DROP COLUMN IF EXISTS monthly_credits_used,
DROP COLUMN IF EXISTS last_credit_reset;

-- 4. Reset all users to free tier
UPDATE public.profiles SET
  subscription_status = 'free',
  subscription_tier = 'free',
  stripe_customer_id = NULL,
  stripe_subscription_id = NULL
WHERE true;

-- 5. Add simple constraints
ALTER TABLE public.profiles 
DROP CONSTRAINT IF EXISTS check_subscription_status,
DROP CONSTRAINT IF EXISTS check_subscription_tier;

ALTER TABLE public.profiles 
ADD CONSTRAINT check_subscription_status 
  CHECK (subscription_status IN ('free', 'active', 'cancelled')),
ADD CONSTRAINT check_subscription_tier 
  CHECK (subscription_tier IN ('free', 'pro'));

-- 6. Drop ALL RLS policies and create simple ones
DO $$ 
DECLARE
    pol RECORD;
BEGIN
    FOR pol IN SELECT policyname FROM pg_policies WHERE tablename = 'profiles'
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON public.profiles', pol.policyname);
    END LOOP;
END $$;

CREATE POLICY "users_manage_own_profile" 
  ON public.profiles FOR ALL 
  USING (auth.uid() = id);

CREATE POLICY "service_role_full_access" 
  ON public.profiles FOR ALL 
  USING (auth.jwt() ->> 'role' = 'service_role');

-- 7. Simplify handle_new_user function
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO profiles (id, email, full_name, subscription_status, subscription_tier)
  VALUES (NEW.id, NEW.email, COALESCE(NEW.raw_user_meta_data->>'full_name', ''), 'free', 'free');
  RETURN NEW;
END;
$$;

-- 8. Simple sync function for Stripe webhook
CREATE OR REPLACE FUNCTION public.sync_stripe_subscription(
  customer_email TEXT,
  stripe_customer_id TEXT,
  stripe_subscription_id TEXT DEFAULT NULL,
  subscription_status TEXT DEFAULT 'cancelled'
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  user_id UUID;
BEGIN
  SELECT id INTO user_id FROM profiles WHERE email = customer_email;
  
  IF user_id IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'User not found');
  END IF;
  
  UPDATE profiles SET
    stripe_customer_id = sync_stripe_subscription.stripe_customer_id,
    stripe_subscription_id = sync_stripe_subscription.stripe_subscription_id,
    subscription_status = CASE 
      WHEN sync_stripe_subscription.subscription_status = 'active' THEN 'active'
      ELSE 'free'
    END,
    subscription_tier = CASE 
      WHEN sync_stripe_subscription.subscription_status = 'active' THEN 'pro'
      ELSE 'free'
    END,
    updated_at = NOW()
  WHERE id = user_id;
  
  RETURN jsonb_build_object('success', true, 'user_id', user_id);
END;
$$;

-- 9. Drop ALL complex access check functions
DROP FUNCTION IF EXISTS public.check_user_access CASCADE;
DROP FUNCTION IF EXISTS public.check_trial_status CASCADE;
DROP FUNCTION IF EXISTS public.check_user_subscription_access CASCADE;
DROP FUNCTION IF EXISTS public.start_user_trial CASCADE;
DROP FUNCTION IF EXISTS public.start_user_trial_safe CASCADE;
DROP FUNCTION IF EXISTS public.admin_extend_user_trial CASCADE;
DROP FUNCTION IF EXISTS public.expire_trials CASCADE;
DROP FUNCTION IF EXISTS public.refresh_subscription_status CASCADE;
