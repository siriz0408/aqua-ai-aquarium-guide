
-- Make siriz0408@gmail.com a super admin
UPDATE public.profiles 
SET 
  is_admin = true,
  admin_role = 'super_admin',
  admin_permissions = '["user_management", "ticket_management", "analytics", "settings", "admin_management"]'::jsonb,
  last_admin_login = now()
WHERE id = 'e8bc1833-a25d-46cf-8116-fba1bc7ea770';

-- Verify the update
SELECT email, is_admin, admin_role, admin_permissions 
FROM public.profiles 
WHERE id = 'e8bc1833-a25d-46cf-8116-fba1bc7ea770';
