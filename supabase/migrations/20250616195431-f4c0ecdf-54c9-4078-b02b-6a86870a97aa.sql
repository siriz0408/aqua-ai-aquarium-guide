
-- Create a table to store setup plans
CREATE TABLE public.setup_plans (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users,
  plan_name TEXT NOT NULL,
  tank_specs JSONB NOT NULL,
  budget_timeline JSONB NOT NULL,
  equipment JSONB NOT NULL,
  compatible_livestock JSONB NOT NULL,
  timeline JSONB NOT NULL,
  total_estimate TEXT,
  monthly_maintenance TEXT,
  recommendations JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add Row Level Security (RLS)
ALTER TABLE public.setup_plans ENABLE ROW LEVEL SECURITY;

-- Create policies for setup plans
CREATE POLICY "Users can view their own setup plans" 
  ON public.setup_plans 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own setup plans" 
  ON public.setup_plans 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own setup plans" 
  ON public.setup_plans 
  FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own setup plans" 
  ON public.setup_plans 
  FOR DELETE 
  USING (auth.uid() = user_id);
