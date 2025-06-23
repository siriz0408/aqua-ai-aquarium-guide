
-- Add new columns to profiles table for comprehensive subscription and admin management
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS subscription_tier VARCHAR(20) DEFAULT 'free' CHECK (subscription_tier IN ('free', 'pro'));

ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS is_admin BOOLEAN DEFAULT false;

ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS admin_role VARCHAR(50);

ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS admin_permissions JSONB DEFAULT '[]'::jsonb;

ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS last_admin_login TIMESTAMP WITH TIME ZONE;

ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS stripe_price_id TEXT;

ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS subscription_start_date TIMESTAMP WITH TIME ZONE;

ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS subscription_end_date TIMESTAMP WITH TIME ZONE;

ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS trial_start_date TIMESTAMP WITH TIME ZONE;

ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS trial_end_date TIMESTAMP WITH TIME ZONE;

ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS subscription_type VARCHAR(20) DEFAULT 'monthly' CHECK (subscription_type IN ('monthly', 'yearly', 'lifetime'));

ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS last_active TIMESTAMP WITH TIME ZONE;

ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS request_admin_access BOOLEAN DEFAULT false;

-- Update existing rows to have consistent default values
UPDATE public.profiles 
SET 
  subscription_tier = COALESCE(subscription_tier, 'free'),
  is_admin = COALESCE(is_admin, false),
  subscription_type = COALESCE(subscription_type, 'monthly'),
  request_admin_access = COALESCE(request_admin_access, false),
  admin_permissions = COALESCE(admin_permissions, '[]'::jsonb)
WHERE subscription_tier IS NULL 
   OR is_admin IS NULL 
   OR subscription_type IS NULL 
   OR request_admin_access IS NULL 
   OR admin_permissions IS NULL;

-- Create index for performance on subscription queries
CREATE INDEX IF NOT EXISTS idx_profiles_subscription_status ON public.profiles(subscription_status);
CREATE INDEX IF NOT EXISTS idx_profiles_admin_status ON public.profiles(is_admin) WHERE is_admin = true;
CREATE INDEX IF NOT EXISTS idx_profiles_stripe_customer ON public.profiles(stripe_customer_id) WHERE stripe_customer_id IS NOT NULL;

-- Update the handle_new_user function to set proper defaults
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO public.profiles (
    id, 
    email, 
    full_name, 
    role, 
    subscription_status,
    subscription_tier,
    is_admin,
    admin_permissions,
    request_admin_access,
    subscription_type,
    created_at,
    updated_at
  )
  VALUES (
    NEW.id, 
    NEW.email, 
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''), 
    'user', 
    'free',
    'free',
    false,
    '[]'::jsonb,
    COALESCE((NEW.raw_user_meta_data->>'request_admin_access')::boolean, false),
    'monthly',
    now(),
    now()
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    full_name = COALESCE(EXCLUDED.full_name, profiles.full_name),
    updated_at = now();
  
  RETURN NEW;
END;
$$;
