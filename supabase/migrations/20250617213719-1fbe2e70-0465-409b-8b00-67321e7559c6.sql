
-- Create equipment table to store tank equipment
CREATE TABLE public.equipment (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  aquarium_id UUID REFERENCES public.aquariums(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  type TEXT NOT NULL,
  model TEXT,
  image_url TEXT,
  maintenance_tips TEXT,
  upgrade_notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create livestock table to store tank livestock
CREATE TABLE public.livestock (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  aquarium_id UUID REFERENCES public.aquariums(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  species TEXT NOT NULL,
  care_level TEXT NOT NULL DEFAULT 'Beginner',
  compatibility TEXT,
  image_url TEXT,
  health_notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add Row Level Security (RLS) policies for equipment
ALTER TABLE public.equipment ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view equipment for their aquariums" 
  ON public.equipment 
  FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM public.aquariums 
      WHERE aquariums.id = equipment.aquarium_id 
      AND aquariums.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert equipment for their aquariums" 
  ON public.equipment 
  FOR INSERT 
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.aquariums 
      WHERE aquariums.id = equipment.aquarium_id 
      AND aquariums.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update equipment for their aquariums" 
  ON public.equipment 
  FOR UPDATE 
  USING (
    EXISTS (
      SELECT 1 FROM public.aquariums 
      WHERE aquariums.id = equipment.aquarium_id 
      AND aquariums.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete equipment for their aquariums" 
  ON public.equipment 
  FOR DELETE 
  USING (
    EXISTS (
      SELECT 1 FROM public.aquariums 
      WHERE aquariums.id = equipment.aquarium_id 
      AND aquariums.user_id = auth.uid()
    )
  );

-- Add Row Level Security (RLS) policies for livestock
ALTER TABLE public.livestock ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view livestock for their aquariums" 
  ON public.livestock 
  FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM public.aquariums 
      WHERE aquariums.id = livestock.aquarium_id 
      AND aquariums.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert livestock for their aquariums" 
  ON public.livestock 
  FOR INSERT 
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.aquariums 
      WHERE aquariums.id = livestock.aquarium_id 
      AND aquariums.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update livestock for their aquariums" 
  ON public.livestock 
  FOR UPDATE 
  USING (
    EXISTS (
      SELECT 1 FROM public.aquariums 
      WHERE aquariums.id = livestock.aquarium_id 
      AND aquariums.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete livestock for their aquariums" 
  ON public.livestock 
  FOR DELETE 
  USING (
    EXISTS (
      SELECT 1 FROM public.aquariums 
      WHERE aquariums.id = livestock.aquarium_id 
      AND aquariums.user_id = auth.uid()
    )
  );
