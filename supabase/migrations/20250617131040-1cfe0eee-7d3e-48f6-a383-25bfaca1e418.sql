
-- Add admin fields to existing profiles table (extending current structure)
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS is_admin BOOLEAN DEFAULT FALSE;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS admin_role VARCHAR(50) DEFAULT NULL;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS admin_permissions JSONB DEFAULT NULL;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS last_admin_login TIMESTAMPTZ NULL;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS created_by_admin_id UUID NULL;

-- Create admin activity logs table
CREATE TABLE public.admin_activity_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  action VARCHAR(100) NOT NULL,
  target_type VARCHAR(50), -- 'user', 'subscription', 'content', 'system'
  target_id UUID,
  details JSONB,
  ip_address VARCHAR(45),
  user_agent TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create support tickets table
CREATE TABLE public.support_tickets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  subject VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  status VARCHAR(20) DEFAULT 'open', -- 'open', 'in_progress', 'resolved', 'closed'
  priority VARCHAR(20) DEFAULT 'medium', -- 'low', 'medium', 'high', 'urgent'
  assigned_admin_id UUID REFERENCES auth.users(id),
  response_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  resolved_at TIMESTAMPTZ NULL
);

-- Create support ticket responses table
CREATE TABLE public.support_ticket_responses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_id UUID REFERENCES public.support_tickets(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  message TEXT NOT NULL,
  from_admin BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create admin notes table for user notes
CREATE TABLE public.admin_notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  admin_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  note TEXT NOT NULL,
  note_type VARCHAR(20) DEFAULT 'general', -- 'general', 'billing', 'support', 'warning'
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create impersonation tokens table
CREATE TABLE public.impersonation_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  token VARCHAR(255) UNIQUE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  admin_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  expires_at TIMESTAMPTZ NOT NULL,
  used BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS on all new tables
ALTER TABLE public.admin_activity_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.support_tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.support_ticket_responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.impersonation_tokens ENABLE ROW LEVEL SECURITY;

-- Create policies for admin access (admins can access everything)
CREATE POLICY "admins_full_access_admin_logs" ON public.admin_activity_logs FOR ALL USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND is_admin = TRUE)
);

CREATE POLICY "admins_full_access_support_tickets" ON public.support_tickets FOR ALL USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND is_admin = TRUE)
);

CREATE POLICY "users_can_create_support_tickets" ON public.support_tickets FOR INSERT WITH CHECK (
  auth.uid() = user_id
);

CREATE POLICY "users_can_view_own_support_tickets" ON public.support_tickets FOR SELECT USING (
  auth.uid() = user_id OR EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND is_admin = TRUE)
);

CREATE POLICY "admins_full_access_ticket_responses" ON public.support_ticket_responses FOR ALL USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND is_admin = TRUE)
);

CREATE POLICY "users_can_view_own_ticket_responses" ON public.support_ticket_responses FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.support_tickets st WHERE st.id = ticket_id AND st.user_id = auth.uid()) OR
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND is_admin = TRUE)
);

CREATE POLICY "admins_full_access_admin_notes" ON public.admin_notes FOR ALL USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND is_admin = TRUE)
);

CREATE POLICY "admins_full_access_impersonation_tokens" ON public.impersonation_tokens FOR ALL USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND is_admin = TRUE)
);

-- Create function to update support ticket updated_at timestamp
CREATE OR REPLACE FUNCTION update_support_ticket_timestamp()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE public.support_tickets 
  SET updated_at = now(), response_count = response_count + 1
  WHERE id = NEW.ticket_id;
  RETURN NEW;
END;
$$;

-- Create trigger to update support ticket when response is added
CREATE TRIGGER update_support_ticket_on_response
  AFTER INSERT ON public.support_ticket_responses
  FOR EACH ROW
  EXECUTE FUNCTION update_support_ticket_timestamp();

-- Add index for performance on admin queries
CREATE INDEX idx_profiles_is_admin ON public.profiles(is_admin) WHERE is_admin = TRUE;
CREATE INDEX idx_admin_activity_logs_admin_user ON public.admin_activity_logs(admin_user_id);
CREATE INDEX idx_admin_activity_logs_created_at ON public.admin_activity_logs(created_at DESC);
CREATE INDEX idx_support_tickets_status ON public.support_tickets(status);
CREATE INDEX idx_support_tickets_created_at ON public.support_tickets(created_at DESC);
CREATE INDEX idx_impersonation_tokens_token ON public.impersonation_tokens(token) WHERE used = FALSE;
