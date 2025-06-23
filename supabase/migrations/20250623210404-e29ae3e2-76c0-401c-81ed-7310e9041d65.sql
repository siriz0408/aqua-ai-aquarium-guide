
-- First, let's check if we have a profiles table (not profile)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  full_name TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add the new required fields to profiles table
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'user' CHECK (role IN ('user', 'admin')),
ADD COLUMN IF NOT EXISTS subscription_status TEXT DEFAULT 'expired' CHECK (subscription_status IN ('expired', 'active')),
ADD COLUMN IF NOT EXISTS stripe_customer_id TEXT,
ADD COLUMN IF NOT EXISTS stripe_subscription_id TEXT;

-- Drop the old profile table if it exists (singular)
DROP TABLE IF EXISTS public.profile CASCADE;

-- Update existing users to have default values
UPDATE public.profiles 
SET 
  role = COALESCE(role, 'user'),
  subscription_status = COALESCE(subscription_status, 'expired')
WHERE role IS NULL OR subscription_status IS NULL;

-- Enable RLS on profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for profiles
DROP POLICY IF EXISTS "users_manage_own_profile" ON public.profiles;
DROP POLICY IF EXISTS "service_role_full_access" ON public.profiles;

CREATE POLICY "users_manage_own_profile" 
  ON public.profiles FOR ALL 
  USING (auth.uid() = id);

CREATE POLICY "service_role_full_access" 
  ON public.profiles FOR ALL 
  USING (auth.jwt() ->> 'role' = 'service_role');

-- Update the handle_new_user function to use the new structure
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO profiles (id, email, full_name, role, subscription_status)
  VALUES (
    NEW.id, 
    NEW.email, 
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''), 
    'user', 
    'expired'
  );
  RETURN NEW;
END;
$$;

-- Update the sync function to use the simplified model
CREATE OR REPLACE FUNCTION public.sync_stripe_subscription(
  customer_email TEXT,
  stripe_customer_id TEXT,
  stripe_subscription_id TEXT DEFAULT NULL,
  subscription_status TEXT DEFAULT 'expired'
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  user_id UUID;
  new_status TEXT;
BEGIN
  -- Find user by email
  SELECT id INTO user_id FROM profiles WHERE email = customer_email;
  
  IF user_id IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'User not found');
  END IF;
  
  -- Determine new status (active for active/trialing, expired for everything else)
  IF subscription_status = 'active' OR subscription_status = 'trialing' THEN
    new_status := 'active';
  ELSE
    new_status := 'expired';
  END IF;
  
  -- Update user profile
  UPDATE profiles SET
    stripe_customer_id = sync_stripe_subscription.stripe_customer_id,
    stripe_subscription_id = sync_stripe_subscription.stripe_subscription_id,
    subscription_status = new_status,
    updated_at = NOW()
  WHERE id = user_id;
  
  RETURN jsonb_build_object(
    'success', true, 
    'user_id', user_id,
    'new_status', new_status
  );
END;
$$;
