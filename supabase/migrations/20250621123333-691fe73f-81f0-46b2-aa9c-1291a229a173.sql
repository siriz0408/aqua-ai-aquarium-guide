
-- Remove redundant fields from profiles table
ALTER TABLE public.profiles 
DROP COLUMN IF EXISTS subscription_type,
DROP COLUMN IF EXISTS monthly_credits_limit,
DROP COLUMN IF EXISTS monthly_credits_used,
DROP COLUMN IF EXISTS last_credit_reset,
DROP COLUMN IF EXISTS free_credits_remaining,
DROP COLUMN IF EXISTS total_credits_used;
