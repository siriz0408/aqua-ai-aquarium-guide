
-- Add Row Level Security to water_test_logs table so users can only see their own test results
ALTER TABLE public.water_test_logs ENABLE ROW LEVEL SECURITY;

-- Create policy for users to view their own water test logs
CREATE POLICY "Users can view their own water test logs" 
  ON public.water_test_logs 
  FOR SELECT 
  USING (
    aquarium_id IN (
      SELECT id FROM public.aquariums WHERE user_id = auth.uid()
    )
  );

-- Create policy for users to insert their own water test logs
CREATE POLICY "Users can create water test logs for their aquariums" 
  ON public.water_test_logs 
  FOR INSERT 
  WITH CHECK (
    aquarium_id IN (
      SELECT id FROM public.aquariums WHERE user_id = auth.uid()
    )
  );

-- Create policy for users to update their own water test logs
CREATE POLICY "Users can update their own water test logs" 
  ON public.water_test_logs 
  FOR UPDATE 
  USING (
    aquarium_id IN (
      SELECT id FROM public.aquariums WHERE user_id = auth.uid()
    )
  );

-- Create policy for users to delete their own water test logs
CREATE POLICY "Users can delete their own water test logs" 
  ON public.water_test_logs 
  FOR DELETE 
  USING (
    aquarium_id IN (
      SELECT id FROM public.aquariums WHERE user_id = auth.uid()
    )
  );
