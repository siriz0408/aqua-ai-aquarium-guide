
-- Add missing foreign key constraints to establish proper relationships

-- Add foreign key constraint for support_tickets.user_id -> profiles.id
ALTER TABLE public.support_tickets 
ADD CONSTRAINT fk_support_tickets_user_id 
FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;

-- Add foreign key constraint for support_ticket_responses.user_id -> profiles.id  
ALTER TABLE public.support_ticket_responses
ADD CONSTRAINT fk_support_ticket_responses_user_id
FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;

-- Add foreign key constraint for admin_activity_logs.admin_user_id -> profiles.id
ALTER TABLE public.admin_activity_logs
ADD CONSTRAINT fk_admin_activity_logs_admin_user_id
FOREIGN KEY (admin_user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;

-- Add foreign key constraint for admin_notes.user_id -> profiles.id
ALTER TABLE public.admin_notes
ADD CONSTRAINT fk_admin_notes_user_id
FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;

-- Add foreign key constraint for admin_notes.admin_id -> profiles.id
ALTER TABLE public.admin_notes
ADD CONSTRAINT fk_admin_notes_admin_id
FOREIGN KEY (admin_id) REFERENCES public.profiles(id) ON DELETE CASCADE;

-- Add foreign key constraint for impersonation_tokens.user_id -> profiles.id
ALTER TABLE public.impersonation_tokens
ADD CONSTRAINT fk_impersonation_tokens_user_id
FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;

-- Add foreign key constraint for impersonation_tokens.admin_id -> profiles.id
ALTER TABLE public.impersonation_tokens
ADD CONSTRAINT fk_impersonation_tokens_admin_id
FOREIGN KEY (admin_id) REFERENCES public.profiles(id) ON DELETE CASCADE;
