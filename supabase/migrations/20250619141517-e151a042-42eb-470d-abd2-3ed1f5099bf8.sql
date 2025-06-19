
-- Create notification_preferences table
CREATE TABLE public.notification_preferences (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  enabled BOOLEAN NOT NULL DEFAULT true,
  time_of_day TEXT NOT NULL DEFAULT '09:00',
  task_priority_threshold TEXT NOT NULL DEFAULT 'medium' CHECK (task_priority_threshold IN ('low', 'medium', 'high', 'urgent')),
  group_notifications BOOLEAN NOT NULL DEFAULT true,
  due_tasks_enabled BOOLEAN NOT NULL DEFAULT true,
  overdue_tasks_enabled BOOLEAN NOT NULL DEFAULT true,
  critical_alerts_enabled BOOLEAN NOT NULL DEFAULT true,
  ai_insights_enabled BOOLEAN NOT NULL DEFAULT true,
  snooze_duration_hours INTEGER NOT NULL DEFAULT 24,
  escalation_intervals INTEGER[] NOT NULL DEFAULT ARRAY[24, 48, 72],
  quiet_hours_start TEXT DEFAULT '22:00',
  quiet_hours_end TEXT DEFAULT '07:00',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.notification_preferences ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view their own notification preferences"
  ON public.notification_preferences
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own notification preferences"
  ON public.notification_preferences
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own notification preferences"
  ON public.notification_preferences
  FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own notification preferences"
  ON public.notification_preferences
  FOR DELETE
  USING (auth.uid() = user_id);

-- Create trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_notification_preferences_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_notification_preferences_updated_at
  BEFORE UPDATE ON public.notification_preferences
  FOR EACH ROW
  EXECUTE FUNCTION update_notification_preferences_updated_at();
