
-- Add subscription and credit tracking fields to profiles table
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS subscription_status VARCHAR(20) DEFAULT 'free';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS subscription_tier VARCHAR(20) DEFAULT 'basic';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS subscription_start_date TIMESTAMPTZ NULL;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS subscription_end_date TIMESTAMPTZ NULL;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS stripe_customer_id VARCHAR(255) NULL;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS stripe_subscription_id VARCHAR(255) NULL;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS free_credits_remaining INTEGER DEFAULT 5;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS total_credits_used INTEGER DEFAULT 0;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS trial_start_date TIMESTAMPTZ NULL;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS trial_end_date TIMESTAMPTZ NULL;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS last_active TIMESTAMPTZ DEFAULT now();

-- Create subscription usage logs table for analytics
CREATE TABLE public.subscription_usage_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  feature_used TEXT NOT NULL,
  credits_before INTEGER,
  credits_after INTEGER,
  subscription_status TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS on subscription usage logs
ALTER TABLE public.subscription_usage_logs ENABLE ROW LEVEL SECURITY;

-- Create policy for users to view their own usage logs
CREATE POLICY "select_own_usage_logs" ON public.subscription_usage_logs
  FOR SELECT
  USING (user_id = auth.uid());

-- Create policy for edge functions to insert usage logs
CREATE POLICY "insert_usage_logs" ON public.subscription_usage_logs
  FOR INSERT
  WITH CHECK (true);

-- Create a function to update last_active timestamp
CREATE OR REPLACE FUNCTION public.update_last_active()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE public.profiles 
  SET last_active = now()
  WHERE id = NEW.user_id;
  RETURN NEW;
END;
$$;

-- Create trigger to update last_active when usage is logged
CREATE TRIGGER update_last_active_trigger
  AFTER INSERT ON public.subscription_usage_logs
  FOR EACH ROW
  EXECUTE FUNCTION public.update_last_active();

-- Update the existing handle_new_user function to include the new fields
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $function$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, subscription_status, subscription_tier, free_credits_remaining, total_credits_used)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data ->> 'full_name',
    'free',
    'basic',
    5,
    0
  );
  
  -- Also create a profile setup record
  INSERT INTO public.user_profile_setup (user_id)
  VALUES (NEW.id);
  
  RETURN NEW;
END;
$function$;
