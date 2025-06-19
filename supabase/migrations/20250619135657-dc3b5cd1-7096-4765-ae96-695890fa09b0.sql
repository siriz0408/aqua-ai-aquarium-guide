
-- Create maintenance templates table for default task templates
CREATE TABLE public.maintenance_templates (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  tank_type TEXT NOT NULL, -- 'FOWLR', 'Mixed', 'Reef', 'all'
  frequency TEXT NOT NULL, -- 'weekly', 'bi_weekly', 'monthly', 'quarterly'
  base_interval_days INTEGER NOT NULL, -- base number of days between tasks
  task_type TEXT NOT NULL DEFAULT 'maintenance',
  priority TEXT NOT NULL DEFAULT 'medium',
  required_tools TEXT[] DEFAULT '{}',
  estimated_time TEXT,
  difficulty TEXT DEFAULT 'beginner',
  instructions TEXT,
  tips TEXT[] DEFAULT '{}',
  warnings TEXT[] DEFAULT '{}',
  equipment_dependent BOOLEAN DEFAULT false, -- if task depends on specific equipment
  equipment_types TEXT[] DEFAULT '{}', -- which equipment types this applies to
  size_dependent BOOLEAN DEFAULT false, -- if task frequency depends on tank size
  bioload_dependent BOOLEAN DEFAULT false, -- if task frequency depends on bioload
  experience_modifier JSONB DEFAULT '{"beginner": 1.5, "intermediate": 1.0, "advanced": 0.8}', -- frequency multipliers
  maturity_modifier JSONB DEFAULT '{"new": 1.5, "established": 1.0, "mature": 0.8}', -- frequency multipliers based on tank age
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create maintenance schedule table to track user's customized schedules
CREATE TABLE public.maintenance_schedules (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  tank_id UUID, -- reference to aquariums table, null means applies to all tanks
  template_id UUID REFERENCES maintenance_templates(id),
  name TEXT NOT NULL,
  description TEXT,
  frequency_days INTEGER NOT NULL, -- actual days between tasks after adjustments
  next_due_date DATE,
  last_completed_date DATE,
  is_active BOOLEAN DEFAULT true,
  is_custom BOOLEAN DEFAULT false, -- true if user created/modified this schedule
  custom_instructions TEXT,
  custom_priority TEXT,
  notifications_enabled BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create maintenance calendar events table for tracking scheduled and completed tasks
CREATE TABLE public.maintenance_events (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  schedule_id UUID REFERENCES maintenance_schedules(id) ON DELETE CASCADE,
  tank_id UUID, -- reference to aquariums table
  scheduled_date DATE NOT NULL,
  completed_date DATE,
  status TEXT NOT NULL DEFAULT 'scheduled', -- 'scheduled', 'completed', 'skipped', 'overdue'
  notes TEXT,
  actual_duration INTEGER, -- minutes spent on task
  difficulty_rating INTEGER, -- 1-5 user rating
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add RLS policies
ALTER TABLE public.maintenance_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.maintenance_schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.maintenance_events ENABLE ROW LEVEL SECURITY;

-- Templates are public read-only
CREATE POLICY "Anyone can view maintenance templates" 
  ON public.maintenance_templates 
  FOR SELECT 
  USING (true);

-- Users can only access their own schedules
CREATE POLICY "Users can view their own maintenance schedules" 
  ON public.maintenance_schedules 
  FOR SELECT 
  USING (user_id = auth.uid());

CREATE POLICY "Users can create their own maintenance schedules" 
  ON public.maintenance_schedules 
  FOR INSERT 
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own maintenance schedules" 
  ON public.maintenance_schedules 
  FOR UPDATE 
  USING (user_id = auth.uid());

CREATE POLICY "Users can delete their own maintenance schedules" 
  ON public.maintenance_schedules 
  FOR DELETE 
  USING (user_id = auth.uid());

-- Users can only access their own events
CREATE POLICY "Users can view their own maintenance events" 
  ON public.maintenance_events 
  FOR SELECT 
  USING (user_id = auth.uid());

CREATE POLICY "Users can create their own maintenance events" 
  ON public.maintenance_events 
  FOR INSERT 
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own maintenance events" 
  ON public.maintenance_events 
  FOR UPDATE 
  USING (user_id = auth.uid());

CREATE POLICY "Users can delete their own maintenance events" 
  ON public.maintenance_events 
  FOR DELETE 
  USING (user_id = auth.uid());

-- Insert default maintenance templates
INSERT INTO public.maintenance_templates (name, description, tank_type, frequency, base_interval_days, task_type, priority, required_tools, estimated_time, difficulty, instructions, tips, warnings, equipment_dependent, size_dependent, bioload_dependent) VALUES

-- Weekly tasks
('Water Parameter Testing', 'Test essential water parameters including pH, salinity, ammonia, nitrite, and nitrate', 'all', 'weekly', 7, 'testing', 'high', ARRAY['Test kits', 'Logbook'], '15-20 minutes', 'beginner', 'Use quality test kits and record all results. Test at the same time each week for consistency.', ARRAY['Test before feeding for accurate results', 'Keep test kits stored properly', 'Replace expired reagents'], ARRAY['Never test immediately after water changes'], false, false, true),

('Glass Cleaning', 'Clean aquarium glass inside and out for optimal viewing', 'all', 'weekly', 7, 'cleaning', 'medium', ARRAY['Algae scraper', 'Glass cleaner', 'Microfiber cloth'], '10-15 minutes', 'beginner', 'Clean inside glass with algae scraper, outside with aquarium-safe glass cleaner.', ARRAY['Use magnetic cleaners for easier maintenance', 'Clean in circular motions'], ARRAY['Never use household glass cleaners on inside'], false, false, true),

('Skimmer Cup Cleaning', 'Empty and clean protein skimmer collection cup', 'Mixed,Reef', 'weekly', 7, 'equipment', 'medium', ARRAY['Cleaning brush', 'Vinegar solution'], '5-10 minutes', 'beginner', 'Remove skimmer cup, empty contents, scrub with brush and rinse thoroughly.', ARRAY['Clean when cup is 3/4 full', 'Use vinegar for stubborn buildup'], ARRAY['Never use soap or detergents'], true, false, true),

-- Bi-weekly tasks
('Water Change (10-15%)', 'Partial water change to maintain water quality', 'FOWLR', 'bi_weekly', 14, 'water_management', 'high', ARRAY['Siphon/pump', 'Mixing container', 'Salt mix', 'Heater'], '30-45 minutes', 'beginner', 'Remove 10-15% of tank water, replace with properly mixed and temperature-matched new saltwater.', ARRAY['Pre-mix saltwater 24 hours ahead', 'Match temperature and salinity', 'Vacuum substrate during removal'], ARRAY['Never add unmixed salt directly to tank'], false, true, true),

('Water Change (15-20%)', 'Partial water change for reef tanks requiring higher water quality', 'Mixed,Reef', 'bi_weekly', 14, 'water_management', 'high', ARRAY['Siphon/pump', 'Mixing container', 'Salt mix', 'Heater', 'Powerhead'], '45-60 minutes', 'intermediate', 'Remove 15-20% of tank water, replace with properly mixed and temperature-matched new saltwater.', ARRAY['Pre-mix saltwater 24-48 hours ahead', 'Test new water parameters', 'Clean mixing equipment'], ARRAY['Larger changes may stress sensitive corals'], false, true, true),

-- Monthly tasks
('Filter Media Replacement', 'Replace mechanical filter media and clean equipment', 'all', 'monthly', 30, 'equipment', 'high', ARRAY['Replacement media', 'Cleaning brush', 'Tank water'], '20-30 minutes', 'beginner', 'Replace mechanical filter pads, rinse biological media in tank water only.', ARRAY['Never replace all media at once', 'Rinse in tank water to preserve bacteria', 'Replace media in rotation'], ARRAY['Never use tap water on biological media'], true, false, false),

('Powerhead Cleaning', 'Clean and maintain circulation pumps', 'all', 'monthly', 30, 'equipment', 'medium', ARRAY['Cleaning brush', 'Vinegar solution', 'Toothbrush'], '15-25 minutes', 'intermediate', 'Disassemble powerheads, clean impeller and housing, remove algae buildup.', ARRAY['Take photos before disassembly', 'Lubricate O-rings with silicone', 'Check for wear on impeller'], ARRAY['Handle impeller carefully - they break easily'], true, false, false),

('Equipment Inspection', 'Check all equipment for proper operation and signs of wear', 'all', 'monthly', 30, 'equipment', 'medium', ARRAY['Flashlight', 'Multimeter', 'Notepad'], '20-30 minutes', 'intermediate', 'Inspect heaters, pumps, lights, and other equipment for damage, unusual noises, or performance issues.', ARRAY['Document equipment serial numbers', 'Check electrical connections', 'Test backup equipment'], ARRAY['Turn off power before inspecting electrical equipment'], false, false, false),

-- Quarterly tasks
('Deep Substrate Cleaning', 'Thorough cleaning of substrate and removal of detritus', 'all', 'quarterly', 90, 'cleaning', 'medium', ARRAY['Siphon', 'Substrate vacuum', 'Powerhead'], '45-60 minutes', 'intermediate', 'Use substrate vacuum to remove deep detritus, dead spots, and accumulated waste from sand bed.', ARRAY['Work in sections', 'Go slowly to avoid sand storms', 'May need multiple sessions'], ARRAY['Be gentle with live sand beds', 'Avoid disturbing beneficial bacteria'], false, true, true),

('Light Bulb/LED Inspection', 'Check and replace lighting as needed', 'all', 'quarterly', 90, 'equipment', 'medium', ARRAY['Replacement bulbs/LEDs', 'Light meter', 'Cleaning cloth'], '30-45 minutes', 'intermediate', 'Inspect lighting for reduced output, clean fixtures, replace bulbs or check LED performance.', ARRAY['Document light hours and intensity', 'Clean reflectors and covers', 'Check timer programming'], ARRAY['Allow lights to cool before handling'], true, false, false),

('Complete System Check', 'Comprehensive review of entire aquarium system', 'all', 'quarterly', 90, 'maintenance', 'high', ARRAY['Test kits', 'Notebook', 'Camera'], '60-90 minutes', 'advanced', 'Complete system evaluation including water quality, equipment performance, livestock health, and coral growth.', ARRAY['Document with photos', 'Update maintenance logs', 'Plan upcoming purchases'], ARRAY['Schedule during low-stress periods'], false, false, false);

-- Create function to generate maintenance schedules for a new tank
CREATE OR REPLACE FUNCTION public.generate_tank_maintenance_schedule(
  p_user_id UUID,
  p_tank_id UUID,
  p_tank_type TEXT,
  p_tank_size_gallons INTEGER,
  p_user_experience TEXT DEFAULT 'beginner',
  p_tank_age_months INTEGER DEFAULT 0
) RETURNS VOID AS $$
DECLARE
  template_record RECORD;
  adjusted_interval INTEGER;
  experience_mult NUMERIC;
  maturity_mult NUMERIC;
  maturity_level TEXT;
  next_due DATE;
BEGIN
  -- Determine tank maturity level
  IF p_tank_age_months < 6 THEN
    maturity_level := 'new';
  ELSIF p_tank_age_months < 18 THEN
    maturity_level := 'established';
  ELSE
    maturity_level := 'mature';
  END IF;

  -- Loop through applicable templates
  FOR template_record IN 
    SELECT * FROM maintenance_templates 
    WHERE tank_type = 'all' OR tank_type = p_tank_type
  LOOP
    -- Get experience multiplier
    experience_mult := COALESCE((template_record.experience_modifier->>p_user_experience)::NUMERIC, 1.0);
    
    -- Get maturity multiplier
    maturity_mult := COALESCE((template_record.maturity_modifier->>maturity_level)::NUMERIC, 1.0);
    
    -- Calculate adjusted interval
    adjusted_interval := ROUND(template_record.base_interval_days * experience_mult * maturity_mult);
    
    -- Ensure minimum interval
    IF adjusted_interval < 1 THEN
      adjusted_interval := 1;
    END IF;
    
    -- Calculate next due date (start with different offsets to spread tasks)
    CASE template_record.frequency
      WHEN 'weekly' THEN
        next_due := CURRENT_DATE + (template_record.id::TEXT ~ '.*1$')::INTEGER + 1;
      WHEN 'bi_weekly' THEN
        next_due := CURRENT_DATE + 3 + (template_record.id::TEXT ~ '.*2$')::INTEGER * 2;
      WHEN 'monthly' THEN
        next_due := CURRENT_DATE + 7 + (template_record.id::TEXT ~ '.*3$')::INTEGER * 3;
      WHEN 'quarterly' THEN
        next_due := CURRENT_DATE + 14 + (template_record.id::TEXT ~ '.*4$')::INTEGER * 7;
      ELSE
        next_due := CURRENT_DATE + adjusted_interval;
    END CASE;
    
    -- Insert schedule
    INSERT INTO maintenance_schedules (
      user_id,
      tank_id,
      template_id,
      name,
      description,
      frequency_days,
      next_due_date,
      is_active,
      is_custom
    ) VALUES (
      p_user_id,
      p_tank_id,
      template_record.id,
      template_record.name,
      template_record.description,
      adjusted_interval,
      next_due,
      true,
      false
    );
  END LOOP;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to update next due dates after task completion
CREATE OR REPLACE FUNCTION public.complete_maintenance_task(
  p_schedule_id UUID,
  p_completion_date DATE DEFAULT CURRENT_DATE,
  p_notes TEXT DEFAULT NULL
) RETURNS VOID AS $$
DECLARE
  schedule_record RECORD;
BEGIN
  -- Get schedule details
  SELECT * INTO schedule_record FROM maintenance_schedules WHERE id = p_schedule_id;
  
  IF schedule_record IS NULL THEN
    RAISE EXCEPTION 'Schedule not found';
  END IF;
  
  -- Create completion event
  INSERT INTO maintenance_events (
    user_id,
    schedule_id,
    tank_id,
    scheduled_date,
    completed_date,
    status,
    notes
  ) VALUES (
    schedule_record.user_id,
    p_schedule_id,
    schedule_record.tank_id,
    schedule_record.next_due_date,
    p_completion_date,
    'completed',
    p_notes
  );
  
  -- Update schedule with next due date
  UPDATE maintenance_schedules 
  SET 
    last_completed_date = p_completion_date,
    next_due_date = p_completion_date + INTERVAL '1 day' * frequency_days,
    updated_at = NOW()
  WHERE id = p_schedule_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Add trigger to automatically update updated_at timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_maintenance_schedules_updated_at 
  BEFORE UPDATE ON maintenance_schedules 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_maintenance_events_updated_at 
  BEFORE UPDATE ON maintenance_events 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
