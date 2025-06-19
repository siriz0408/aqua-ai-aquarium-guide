
-- Add recurrence fields to tasks table
ALTER TABLE public.tasks ADD COLUMN is_recurring BOOLEAN DEFAULT false;
ALTER TABLE public.tasks ADD COLUMN recurrence_pattern JSONB DEFAULT NULL;
ALTER TABLE public.tasks ADD COLUMN parent_task_id UUID REFERENCES public.tasks(id) ON DELETE CASCADE;
ALTER TABLE public.tasks ADD COLUMN occurrence_date DATE DEFAULT NULL;
ALTER TABLE public.tasks ADD COLUMN series_id UUID DEFAULT NULL;
ALTER TABLE public.tasks ADD COLUMN completion_count INTEGER DEFAULT 0;
ALTER TABLE public.tasks ADD COLUMN skip_count INTEGER DEFAULT 0;

-- Create index for performance
CREATE INDEX idx_tasks_series_id ON public.tasks(series_id);
CREATE INDEX idx_tasks_parent_id ON public.tasks(parent_task_id);
CREATE INDEX idx_tasks_recurring ON public.tasks(is_recurring, series_id);

-- Create function to generate next occurrence
CREATE OR REPLACE FUNCTION generate_next_task_occurrence(
  task_id UUID,
  completion_date DATE DEFAULT CURRENT_DATE
) RETURNS UUID AS $$
DECLARE
  original_task RECORD;
  next_due_date DATE;
  next_task_id UUID;
  pattern JSONB;
  interval_days INTEGER;
  day_of_week INTEGER;
  occurrence_count INTEGER;
  max_occurrences INTEGER;
  end_date DATE;
BEGIN
  -- Get the original task details
  SELECT * INTO original_task FROM tasks WHERE id = task_id;
  
  IF NOT original_task.is_recurring OR original_task.recurrence_pattern IS NULL THEN
    RETURN NULL;
  END IF;
  
  pattern := original_task.recurrence_pattern;
  
  -- Check if we've reached the maximum occurrences
  max_occurrences := (pattern->>'maxOccurrences')::INTEGER;
  IF max_occurrences IS NOT NULL THEN
    SELECT COUNT(*) INTO occurrence_count 
    FROM tasks 
    WHERE series_id = COALESCE(original_task.series_id, original_task.id);
    
    IF occurrence_count >= max_occurrences THEN
      RETURN NULL;
    END IF;
  END IF;
  
  -- Check if we've passed the end date
  end_date := (pattern->>'endDate')::DATE;
  IF end_date IS NOT NULL AND completion_date >= end_date THEN
    RETURN NULL;
  END IF;
  
  -- Calculate next due date based on pattern
  CASE pattern->>'type'
    WHEN 'daily' THEN
      interval_days := COALESCE((pattern->>'interval')::INTEGER, 1);
      next_due_date := completion_date + INTERVAL '1 day' * interval_days;
      
    WHEN 'weekly' THEN
      interval_days := COALESCE((pattern->>'interval')::INTEGER, 1) * 7;
      next_due_date := completion_date + INTERVAL '1 day' * interval_days;
      
    WHEN 'bi_weekly' THEN
      next_due_date := completion_date + INTERVAL '14 days';
      
    WHEN 'monthly' THEN
      interval_days := COALESCE((pattern->>'interval')::INTEGER, 1);
      next_due_date := completion_date + INTERVAL '1 month' * interval_days;
      
    WHEN 'custom' THEN
      interval_days := (pattern->>'customDays')::INTEGER;
      next_due_date := completion_date + INTERVAL '1 day' * interval_days;
      
    WHEN 'weekly_days' THEN
      -- For specific days of week, find next occurrence
      interval_days := 1;
      next_due_date := completion_date + INTERVAL '1 day';
      -- This is simplified - would need more complex logic for specific days
      
    ELSE
      RETURN NULL;
  END CASE;
  
  -- Create the next occurrence
  INSERT INTO tasks (
    user_id,
    title,
    description,
    task_type,
    priority,
    status,
    due_date,
    list_id,
    is_recurring,
    recurrence_pattern,
    parent_task_id,
    series_id,
    occurrence_date,
    created_at,
    updated_at
  ) VALUES (
    original_task.user_id,
    original_task.title,
    original_task.description,
    original_task.task_type,
    original_task.priority,
    'pending',
    next_due_date,
    original_task.list_id,
    true,
    original_task.recurrence_pattern,
    COALESCE(original_task.parent_task_id, original_task.id),
    COALESCE(original_task.series_id, original_task.id),
    next_due_date,
    NOW(),
    NOW()
  ) RETURNING id INTO next_task_id;
  
  RETURN next_task_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to complete recurring task
CREATE OR REPLACE FUNCTION complete_recurring_task(
  task_id UUID,
  completion_date DATE DEFAULT CURRENT_DATE,
  skip_occurrence BOOLEAN DEFAULT false
) RETURNS JSONB AS $$
DECLARE
  task_record RECORD;
  next_task_id UUID;
  result JSONB;
BEGIN
  -- Get task details
  SELECT * INTO task_record FROM tasks WHERE id = task_id;
  
  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'error', 'Task not found');
  END IF;
  
  -- Update the current task
  IF skip_occurrence THEN
    -- Increment skip count for the series
    UPDATE tasks 
    SET skip_count = skip_count + 1
    WHERE series_id = COALESCE(task_record.series_id, task_record.id) 
       OR id = COALESCE(task_record.series_id, task_record.id);
  ELSE
    -- Mark as completed
    UPDATE tasks 
    SET status = 'completed', 
        updated_at = NOW()
    WHERE id = task_id;
    
    -- Increment completion count for the series
    UPDATE tasks 
    SET completion_count = completion_count + 1
    WHERE series_id = COALESCE(task_record.series_id, task_record.id) 
       OR id = COALESCE(task_record.series_id, task_record.id);
  END IF;
  
  -- Generate next occurrence if it's a recurring task
  IF task_record.is_recurring THEN
    next_task_id := generate_next_task_occurrence(task_id, completion_date);
  END IF;
  
  RETURN jsonb_build_object(
    'success', true,
    'task_id', task_id,
    'next_task_id', next_task_id,
    'skipped', skip_occurrence
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
