
-- Create test users with different subscription types and profiles (safe version)
DO $$
DECLARE
  user_id1 uuid;
  user_id2 uuid;
  user_id3 uuid;
  user_id4 uuid;
  user_id5 uuid;
  user_id6 uuid;
BEGIN
  -- Check and create Test User 1: Free Tier Basic User
  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'john.doe@aquatest.com') THEN
    INSERT INTO auth.users (id, email, encrypted_password, email_confirmed_at, created_at, updated_at, raw_user_meta_data)
    VALUES (
      gen_random_uuid(),
      'john.doe@aquatest.com',
      crypt('testuser123', gen_salt('bf')),
      now(),
      now(),
      now(),
      '{"full_name": "John Doe"}'::jsonb
    ) RETURNING id INTO user_id1;
  ELSE
    SELECT id INTO user_id1 FROM auth.users WHERE email = 'john.doe@aquatest.com';
  END IF;

  -- Update the profile for user 1
  UPDATE public.profiles SET
    full_name = 'John Doe',
    is_admin = false,
    admin_role = null,
    subscription_status = 'free',
    subscription_tier = 'basic',
    free_credits_remaining = 3,
    total_credits_used = 2,
    created_at = now() - interval '30 days'
  WHERE id = user_id1;

  -- Check and create Test User 2: Active Pro Subscription
  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'sarah.smith@aquatest.com') THEN
    INSERT INTO auth.users (id, email, encrypted_password, email_confirmed_at, created_at, updated_at, raw_user_meta_data)
    VALUES (
      gen_random_uuid(),
      'sarah.smith@aquatest.com',
      crypt('testuser123', gen_salt('bf')),
      now(),
      now(),
      now(),
      '{"full_name": "Sarah Smith"}'::jsonb
    ) RETURNING id INTO user_id2;
  ELSE
    SELECT id INTO user_id2 FROM auth.users WHERE email = 'sarah.smith@aquatest.com';
  END IF;

  -- Update the profile for user 2
  UPDATE public.profiles SET
    full_name = 'Sarah Smith',
    is_admin = false,
    admin_role = null,
    subscription_status = 'active',
    subscription_tier = 'pro',
    free_credits_remaining = 50,
    total_credits_used = 125,
    created_at = now() - interval '90 days',
    last_active = now() - interval '2 days'
  WHERE id = user_id2;

  -- Check and create Test User 3: Enterprise Subscription Admin
  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'michael.chen@aquatest.com') THEN
    INSERT INTO auth.users (id, email, encrypted_password, email_confirmed_at, created_at, updated_at, raw_user_meta_data)
    VALUES (
      gen_random_uuid(),
      'michael.chen@aquatest.com',
      crypt('testuser123', gen_salt('bf')),
      now(),
      now(),
      now(),
      '{"full_name": "Michael Chen"}'::jsonb
    ) RETURNING id INTO user_id3;
  ELSE
    SELECT id INTO user_id3 FROM auth.users WHERE email = 'michael.chen@aquatest.com';
  END IF;

  -- Update the profile for user 3
  UPDATE public.profiles SET
    full_name = 'Michael Chen',
    is_admin = true,
    admin_role = 'admin',
    admin_permissions = '["user_management", "ticket_management"]'::jsonb,
    subscription_status = 'active',
    subscription_tier = 'premium',
    free_credits_remaining = 500,
    total_credits_used = 1250,
    created_at = now() - interval '180 days',
    last_active = now() - interval '1 hour'
  WHERE id = user_id3;

  -- Check and create Test User 4: Expired Subscription
  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'emily.wilson@aquatest.com') THEN
    INSERT INTO auth.users (id, email, encrypted_password, email_confirmed_at, created_at, updated_at, raw_user_meta_data)
    VALUES (
      gen_random_uuid(),
      'emily.wilson@aquatest.com',
      crypt('testuser123', gen_salt('bf')),
      now(),
      now(),
      now(),
      '{"full_name": "Emily Wilson"}'::jsonb
    ) RETURNING id INTO user_id4;
  ELSE
    SELECT id INTO user_id4 FROM auth.users WHERE email = 'emily.wilson@aquatest.com';
  END IF;

  -- Update the profile for user 4
  UPDATE public.profiles SET
    full_name = 'Emily Wilson',
    is_admin = false,
    admin_role = null,
    subscription_status = 'expired',
    subscription_tier = 'pro',
    free_credits_remaining = 0,
    total_credits_used = 75,
    created_at = now() - interval '60 days',
    last_active = now() - interval '14 days'
  WHERE id = user_id4;

  -- Check and create Test User 5: Cancelled Subscription
  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'david.johnson@aquatest.com') THEN
    INSERT INTO auth.users (id, email, encrypted_password, email_confirmed_at, created_at, updated_at, raw_user_meta_data)
    VALUES (
      gen_random_uuid(),
      'david.johnson@aquatest.com',
      crypt('testuser123', gen_salt('bf')),
      now(),
      now(),
      now(),
      '{"full_name": "David Johnson"}'::jsonb
    ) RETURNING id INTO user_id5;
  ELSE
    SELECT id INTO user_id5 FROM auth.users WHERE email = 'david.johnson@aquatest.com';
  END IF;

  -- Update the profile for user 5
  UPDATE public.profiles SET
    full_name = 'David Johnson',
    is_admin = false,
    admin_role = null,
    subscription_status = 'cancelled',
    subscription_tier = 'basic',
    free_credits_remaining = 1,
    total_credits_used = 4,
    created_at = now() - interval '45 days',
    last_active = now() - interval '7 days'
  WHERE id = user_id5;

  -- Check and create Test User 6: New User (Never Active)
  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'lisa.brown@aquatest.com') THEN
    INSERT INTO auth.users (id, email, encrypted_password, email_confirmed_at, created_at, updated_at, raw_user_meta_data)
    VALUES (
      gen_random_uuid(),
      'lisa.brown@aquatest.com',
      crypt('testuser123', gen_salt('bf')),
      now(),
      now(),
      now(),
      '{"full_name": "Lisa Brown"}'::jsonb
    ) RETURNING id INTO user_id6;
  ELSE
    SELECT id INTO user_id6 FROM auth.users WHERE email = 'lisa.brown@aquatest.com';
  END IF;

  -- Update the profile for user 6
  UPDATE public.profiles SET
    full_name = 'Lisa Brown',
    is_admin = false,
    admin_role = null,
    subscription_status = 'free',
    subscription_tier = 'basic',
    free_credits_remaining = 5,
    total_credits_used = 0,
    created_at = now() - interval '2 days',
    last_active = NULL
  WHERE id = user_id6;

  -- Update or create profile setup records for all test users
  INSERT INTO public.user_profile_setup (user_id, completed)
  VALUES 
    (user_id1, true),
    (user_id2, true),
    (user_id3, true),
    (user_id4, true),
    (user_id5, true),
    (user_id6, false)
  ON CONFLICT (user_id) DO UPDATE SET
    completed = EXCLUDED.completed;

END $$;

-- Create function for super admins to impersonate users
CREATE OR REPLACE FUNCTION public.admin_impersonate_user(
  requesting_admin_id uuid,
  target_user_id uuid
)
RETURNS TABLE (
  access_token text,
  refresh_token text,
  user_data jsonb
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  admin_role_var text;
  target_user_email text;
  target_user_data jsonb;
BEGIN
  -- Check if requesting user is a super admin
  SELECT admin_role INTO admin_role_var
  FROM profiles 
  WHERE id = requesting_admin_id AND is_admin = true;
  
  IF admin_role_var != 'super_admin' THEN
    RAISE EXCEPTION 'Access denied: Only super admins can impersonate users';
  END IF;
  
  -- Get target user data
  SELECT email, 
    jsonb_build_object(
      'id', p.id,
      'email', p.email,
      'full_name', p.full_name,
      'is_admin', p.is_admin,
      'admin_role', p.admin_role
    ) INTO target_user_email, target_user_data
  FROM profiles p
  WHERE p.id = target_user_id;
  
  IF target_user_email IS NULL THEN
    RAISE EXCEPTION 'Target user not found';
  END IF;
  
  -- Log the impersonation
  INSERT INTO public.admin_activity_logs (
    admin_user_id,
    action,
    target_id,
    details,
    created_at
  ) VALUES (
    requesting_admin_id,
    'user_impersonation',
    target_user_id,
    jsonb_build_object(
      'target_email', target_user_email,
      'timestamp', now()
    ),
    now()
  );
  
  -- Return user data for frontend handling
  RETURN QUERY
  SELECT 
    NULL::text as access_token,  -- Will be handled by frontend
    NULL::text as refresh_token, -- Will be handled by frontend
    target_user_data as user_data;
END;
$$;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION public.admin_impersonate_user(uuid, uuid) TO authenticated;

-- Ensure admin_activity_logs table has proper RLS (if not already enabled)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'admin_activity_logs' 
    AND policyname = 'Admins can view activity logs'
  ) THEN
    ALTER TABLE public.admin_activity_logs ENABLE ROW LEVEL SECURITY;
    
    CREATE POLICY "Admins can view activity logs" 
    ON public.admin_activity_logs FOR SELECT 
    USING (
      EXISTS (
        SELECT 1 FROM public.profiles 
        WHERE id = auth.uid() AND is_admin = true
      )
    );
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'admin_activity_logs' 
    AND policyname = 'System can insert activity logs'
  ) THEN
    CREATE POLICY "System can insert activity logs" 
    ON public.admin_activity_logs FOR INSERT 
    WITH CHECK (true);
  END IF;
END $$;
