
-- Add new columns to profiles table for enhanced subscription management
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS monthly_credits_limit INTEGER,
ADD COLUMN IF NOT EXISTS monthly_credits_used INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS last_credit_reset DATE DEFAULT CURRENT_DATE,
ADD COLUMN IF NOT EXISTS stripe_price_id TEXT;

-- Update existing users to use the new subscription structure
-- Change "basic" tier to "free" for existing users
UPDATE public.profiles 
SET subscription_tier = 'free' 
WHERE subscription_tier = 'basic';

-- Set monthly_credits_limit based on subscription status
UPDATE public.profiles 
SET monthly_credits_limit = CASE 
    WHEN subscription_tier = 'free' THEN 5
    WHEN subscription_tier = 'pro' THEN NULL  -- NULL means unlimited
    ELSE NULL
END;

-- Rename existing "pro" tier to "pro_unlimited" for clarity
UPDATE public.profiles 
SET subscription_tier = 'pro_unlimited' 
WHERE subscription_tier = 'pro';

-- Create function to reset monthly credits daily
CREATE OR REPLACE FUNCTION reset_monthly_credits()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE public.profiles 
  SET 
    monthly_credits_used = 0,
    last_credit_reset = CURRENT_DATE
  WHERE 
    subscription_tier = 'pro_limited' 
    AND (last_credit_reset IS NULL OR last_credit_reset < CURRENT_DATE);
END;
$$;

-- Create function to check if user can use a feature based on their subscription
CREATE OR REPLACE FUNCTION can_use_feature(user_id uuid)
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
  
  -- Pro unlimited users have unlimited access
  IF user_profile.subscription_tier = 'pro_unlimited' AND user_profile.subscription_status = 'active' THEN
    RETURN true;
  END IF;
  
  -- Pro limited users check monthly limit
  IF user_profile.subscription_tier = 'pro_limited' AND user_profile.subscription_status = 'active' THEN
    RETURN COALESCE(user_profile.monthly_credits_used, 0) < COALESCE(user_profile.monthly_credits_limit, 50);
  END IF;
  
  -- Free users check remaining credits
  IF user_profile.subscription_tier = 'free' THEN
    RETURN COALESCE(user_profile.free_credits_remaining, 0) > 0;
  END IF;
  
  RETURN false;
END;
$$;

-- Create subscribers table for Stripe integration
CREATE TABLE IF NOT EXISTS public.subscribers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL UNIQUE,
  stripe_customer_id TEXT,
  stripe_subscription_id TEXT,
  subscribed BOOLEAN NOT NULL DEFAULT false,
  subscription_tier TEXT,
  subscription_end TIMESTAMPTZ,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable Row Level Security on subscribers table
ALTER TABLE public.subscribers ENABLE ROW LEVEL SECURITY;

-- Create policies for subscribers table
CREATE POLICY "Users can view their own subscription" 
ON public.subscribers FOR SELECT 
USING (user_id = auth.uid() OR email = auth.email());

CREATE POLICY "Users can update their own subscription" 
ON public.subscribers FOR UPDATE 
USING (user_id = auth.uid() OR email = auth.email());

CREATE POLICY "Users can insert their own subscription" 
ON public.subscribers FOR INSERT 
WITH CHECK (user_id = auth.uid() OR email = auth.email());
