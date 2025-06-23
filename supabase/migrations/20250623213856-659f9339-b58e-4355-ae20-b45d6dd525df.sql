
-- Fix the handle_new_user function to use valid subscription_status values
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $$
BEGIN
  -- Insert the basic profile with proper subscription status
  INSERT INTO public.profiles (
    id, 
    email, 
    full_name, 
    subscription_status, 
    subscription_tier,
    created_at,
    updated_at
  )
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data ->> 'full_name',
    'free',  -- Use 'free' instead of 'trial' as it's a valid value
    'free',
    now(),
    now()
  );
  
  RETURN NEW;
END;
$$;
