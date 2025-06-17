
-- First, let's make sure we have the admin fields properly set up in profiles
-- Update the specific user to be an admin
UPDATE public.profiles 
SET 
  is_admin = true,
  admin_role = 'super_admin',
  admin_permissions = '["user_management", "ticket_management", "analytics", "settings"]'::jsonb
WHERE email = 'siriz0408@gmail.com';

-- If the user doesn't exist yet, we'll handle it in the trigger
-- Let's also create a function to easily promote users to admin
CREATE OR REPLACE FUNCTION public.promote_user_to_admin(user_email TEXT, role TEXT DEFAULT 'admin')
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE public.profiles 
  SET 
    is_admin = true,
    admin_role = role,
    admin_permissions = CASE 
      WHEN role = 'super_admin' THEN '["user_management", "ticket_management", "analytics", "settings", "admin_management"]'::jsonb
      ELSE '["ticket_management", "analytics"]'::jsonb
    END,
    last_admin_login = now()
  WHERE email = user_email;
  
  RETURN FOUND;
END;
$$;

-- Create an admin management table for better tracking
CREATE TABLE IF NOT EXISTS public.admin_invitations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL UNIQUE,
  invited_by UUID REFERENCES public.profiles(id),
  admin_role TEXT NOT NULL DEFAULT 'admin',
  permissions JSONB DEFAULT '["ticket_management"]'::jsonb,
  accepted BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  expires_at TIMESTAMPTZ DEFAULT (now() + interval '7 days')
);

-- Enable RLS on admin invitations
ALTER TABLE public.admin_invitations ENABLE ROW LEVEL SECURITY;

-- Policy for admins to manage invitations
CREATE POLICY "Super admins can manage invitations" ON public.admin_invitations
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() 
      AND is_admin = true 
      AND admin_role = 'super_admin'
    )
  );

-- Update the handle_new_user function to check for admin invitations
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
  
  -- Insert the basic profile
  INSERT INTO public.profiles (
    id, 
    email, 
    full_name, 
    subscription_status, 
    subscription_tier, 
    free_credits_remaining, 
    total_credits_used,
    is_admin,
    admin_role,
    admin_permissions
  )
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data ->> 'full_name',
    'free',
    'basic',
    5,
    0,
    COALESCE(admin_invitation.email IS NOT NULL, false),
    admin_invitation.admin_role,
    admin_invitation.permissions
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

-- Ensure the specific admin user is set up correctly
-- This will work even if they're already in the system
SELECT public.promote_user_to_admin('siriz0408@gmail.com', 'super_admin');
