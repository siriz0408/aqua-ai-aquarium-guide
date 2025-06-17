
-- Create educational content tables for fish, corals, and equipment

-- Enhanced fish/livestock table for educational content
CREATE TABLE public.educational_fish (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  scientific_name TEXT,
  category TEXT NOT NULL DEFAULT 'Fish',
  summary TEXT,
  care_level TEXT NOT NULL DEFAULT 'Beginner' CHECK (care_level IN ('Beginner', 'Intermediate', 'Advanced')),
  diet_type TEXT CHECK (diet_type IN ('Herbivore', 'Carnivore', 'Omnivore')),
  food_details TEXT,
  tank_size_minimum INTEGER, -- in gallons
  water_temperature_range TEXT, -- e.g., "72-78°F"
  ph_range TEXT, -- e.g., "8.1-8.4"
  compatibility_notes TEXT,
  similar_species UUID[], -- array of fish IDs
  image_url TEXT,
  image_gallery TEXT[], -- array of image URLs
  reef_safe BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Educational equipment table
CREATE TABLE public.educational_equipment (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  summary TEXT,
  difficulty_level TEXT NOT NULL DEFAULT 'Easy' CHECK (difficulty_level IN ('Easy', 'Moderate', 'Advanced')),
  recommended_tank_sizes TEXT[], -- array like ["20-50 gallons", "50+ gallons"]
  installation_notes TEXT,
  maintenance_frequency TEXT,
  compatibility_equipment TEXT[],
  price_range TEXT, -- e.g., "$50-$200"
  image_url TEXT,
  image_gallery TEXT[],
  specifications JSONB, -- technical specs as JSON
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- User's personal lists/collections
CREATE TABLE public.user_fish_lists (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  fish_id UUID REFERENCES public.educational_fish(id) NOT NULL,
  list_type TEXT NOT NULL DEFAULT 'wishlist', -- wishlist, owned, planning
  notes TEXT,
  added_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, fish_id, list_type)
);

CREATE TABLE public.user_equipment_lists (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  equipment_id UUID REFERENCES public.educational_equipment(id) NOT NULL,
  list_type TEXT NOT NULL DEFAULT 'wishlist',
  notes TEXT,
  added_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, equipment_id, list_type)
);

-- Add Row Level Security (RLS)
ALTER TABLE public.educational_fish ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.educational_equipment ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_fish_lists ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_equipment_lists ENABLE ROW LEVEL SECURITY;

-- Create policies for educational content (public read access)
CREATE POLICY "Anyone can view educational fish" 
  ON public.educational_fish 
  FOR SELECT 
  TO public
  USING (true);

CREATE POLICY "Anyone can view educational equipment" 
  ON public.educational_equipment 
  FOR SELECT 
  TO public
  USING (true);

-- Create policies for user lists (users can only see their own)
CREATE POLICY "Users can view their own fish lists" 
  ON public.user_fish_lists 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own fish lists" 
  ON public.user_fish_lists 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own fish lists" 
  ON public.user_fish_lists 
  FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own fish lists" 
  ON public.user_fish_lists 
  FOR DELETE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can view their own equipment lists" 
  ON public.user_equipment_lists 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own equipment lists" 
  ON public.user_equipment_lists 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own equipment lists" 
  ON public.user_equipment_lists 
  FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own equipment lists" 
  ON public.user_equipment_lists 
  FOR DELETE 
  USING (auth.uid() = user_id);

-- Create indexes for better performance
CREATE INDEX idx_educational_fish_category ON public.educational_fish(category);
CREATE INDEX idx_educational_fish_care_level ON public.educational_fish(care_level);
CREATE INDEX idx_educational_fish_name ON public.educational_fish(name);
CREATE INDEX idx_educational_equipment_category ON public.educational_equipment(category);
CREATE INDEX idx_educational_equipment_difficulty ON public.educational_equipment(difficulty_level);
CREATE INDEX idx_user_fish_lists_user_type ON public.user_fish_lists(user_id, list_type);
CREATE INDEX idx_user_equipment_lists_user_type ON public.user_equipment_lists(user_id, list_type);

-- Insert some sample educational content
INSERT INTO public.educational_fish (name, scientific_name, category, summary, care_level, diet_type, food_details, tank_size_minimum, water_temperature_range, ph_range, compatibility_notes, reef_safe, image_url) VALUES
('Ocellaris Clownfish', 'Amphiprion ocellaris', 'Fish', 'Hardy, peaceful clownfish perfect for beginners. Known for their symbiotic relationship with anemones.', 'Beginner', 'Omnivore', 'Flakes, pellets, frozen mysis shrimp, marine algae', 20, '72-78°F', '8.1-8.4', 'Peaceful, reef safe, good with most community fish. Can be territorial with other clownfish.', true, 'https://images.unsplash.com/photo-1583212292454-1fe6229603b7'),
('Yellow Tang', 'Zebrasoma flavescens', 'Fish', 'Bright yellow surgeon fish that helps control algae. Active swimmer requiring larger tanks.', 'Intermediate', 'Herbivore', 'Marine algae, seaweed sheets, herbivore pellets', 75, '72-78°F', '8.1-8.4', 'Generally peaceful but can be aggressive to other tangs. Reef safe.', true, 'https://images.unsplash.com/photo-1559827260-dc66d52bef19'),
('Royal Gramma', 'Gramma loreto', 'Fish', 'Beautiful purple and yellow fish with peaceful temperament. Great for smaller reef tanks.', 'Beginner', 'Carnivore', 'Frozen mysis shrimp, brine shrimp, marine pellets', 30, '72-78°F', '8.1-8.4', 'Very peaceful, hides in caves and overhangs. Excellent reef fish.', true, 'https://images.unsplash.com/photo-1583212292454-1fe6229603b7');

INSERT INTO public.educational_equipment (name, category, summary, difficulty_level, recommended_tank_sizes, installation_notes, maintenance_frequency, price_range, image_url) VALUES
('Protein Skimmer', 'Filtration', 'Essential equipment that removes organic waste before it breaks down into harmful compounds.', 'Moderate', ARRAY['30+ gallons'], 'Requires sump or hang-on-back installation. Proper water level crucial for operation.', 'Weekly cleaning of collection cup, monthly deep clean', '$100-$500', 'https://images.unsplash.com/photo-1559827260-dc66d52bef19'),
('LED Reef Light', 'Lighting', 'Full spectrum LED lighting system designed for coral growth and fish coloration.', 'Easy', ARRAY['Any size'], 'Mount securely above tank. Programmable timer recommended for natural light cycles.', 'Monthly dust cleaning, annual bulb replacement', '$150-$800', 'https://images.unsplash.com/photo-1583212292454-1fe6229603b7'),
('Wave Maker', 'Water Movement', 'Creates natural water flow patterns essential for coral health and debris removal.', 'Easy', ARRAY['20+ gallons'], 'Mount on glass with magnetic holder. Position for optimal flow without dead spots.', 'Monthly cleaning of impeller and housing', '$50-$300', 'https://images.unsplash.com/photo-1559827260-dc66d52bef19');
