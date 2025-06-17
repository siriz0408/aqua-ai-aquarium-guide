
-- First, let's enhance the educational_fish table to support GBIF data
-- Add GBIF-specific columns for comprehensive species information

ALTER TABLE educational_fish 
ADD COLUMN IF NOT EXISTS gbif_species_key INTEGER,
ADD COLUMN IF NOT EXISTS gbif_usage_key INTEGER,
ADD COLUMN IF NOT EXISTS scientific_name_authorship TEXT,
ADD COLUMN IF NOT EXISTS taxonomic_status TEXT DEFAULT 'accepted',
ADD COLUMN IF NOT EXISTS kingdom TEXT,
ADD COLUMN IF NOT EXISTS phylum TEXT,
ADD COLUMN IF NOT EXISTS class TEXT,
ADD COLUMN IF NOT EXISTS order_name TEXT,
ADD COLUMN IF NOT EXISTS family TEXT,
ADD COLUMN IF NOT EXISTS genus TEXT,
ADD COLUMN IF NOT EXISTS species_name TEXT,
ADD COLUMN IF NOT EXISTS common_names JSONB DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS synonyms JSONB DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS habitat_notes TEXT,
ADD COLUMN IF NOT EXISTS geographic_distribution JSONB DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS conservation_status TEXT,
ADD COLUMN IF NOT EXISTS gbif_last_updated TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS data_source TEXT DEFAULT 'manual',
ADD COLUMN IF NOT EXISTS water_type TEXT DEFAULT 'Saltwater';

-- Create an index on GBIF species key for faster lookups
CREATE INDEX IF NOT EXISTS idx_educational_fish_gbif_species_key ON educational_fish(gbif_species_key);

-- Create an index on data source for filtering
CREATE INDEX IF NOT EXISTS idx_educational_fish_data_source ON educational_fish(data_source);

-- Create a new table for GBIF import jobs and tracking
CREATE TABLE IF NOT EXISTS gbif_import_jobs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  job_type TEXT NOT NULL, -- 'single_species', 'bulk_import', 'family_import'
  status TEXT NOT NULL DEFAULT 'pending', -- 'pending', 'running', 'completed', 'failed'
  search_query TEXT,
  total_species INTEGER DEFAULT 0,
  imported_species INTEGER DEFAULT 0,
  failed_species INTEGER DEFAULT 0,
  error_details JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  completed_at TIMESTAMP WITH TIME ZONE
);

-- Add RLS policies for the import jobs table
ALTER TABLE gbif_import_jobs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own import jobs" 
  ON gbif_import_jobs 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own import jobs" 
  ON gbif_import_jobs 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own import jobs" 
  ON gbif_import_jobs 
  FOR UPDATE 
  USING (auth.uid() = user_id);

-- Create a table to track species image URLs from various sources
CREATE TABLE IF NOT EXISTS species_images (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  species_id UUID REFERENCES educational_fish(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  image_source TEXT NOT NULL, -- 'gbif', 'wikimedia', 'inaturalist', 'manual'
  attribution TEXT,
  license TEXT,
  is_primary BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add index for faster image lookups
CREATE INDEX IF NOT EXISTS idx_species_images_species_id ON species_images(species_id);
CREATE INDEX IF NOT EXISTS idx_species_images_primary ON species_images(species_id, is_primary);
