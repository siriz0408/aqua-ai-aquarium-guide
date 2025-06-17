
-- First, let's drop the problematic check constraint that's blocking trial users
ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS check_subscription_status;

-- Create a new check constraint that includes 'trial' as a valid subscription status
ALTER TABLE public.profiles ADD CONSTRAINT check_subscription_status 
CHECK (subscription_status IN ('free', 'trial', 'active', 'expired', 'cancelled'));

-- Also ensure subscription_tier allows 'free' which is what we're setting for trial users
ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS check_subscription_tier;
ALTER TABLE public.profiles ADD CONSTRAINT check_subscription_tier 
CHECK (subscription_tier IN ('free', 'pro', 'enterprise'));
