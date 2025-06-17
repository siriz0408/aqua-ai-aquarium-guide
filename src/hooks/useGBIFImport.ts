
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { GBIFSpecies } from './useGBIFApi';

export interface ImportJob {
  id: string;
  user_id: string;
  job_type: string;
  status: string;
  search_query?: string;
  total_species: number;
  imported_species: number;
  failed_species: number;
  error_details?: any;
  created_at: string;
  updated_at: string;
  completed_at?: string;
}

export const useGBIFImport = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch import jobs for current user
  const { data: importJobs = [], isLoading: jobsLoading } = useQuery({
    queryKey: ['gbif_import_jobs'],
    queryFn: async () => {
      if (!user) return [];
      
      const { data, error } = await supabase
        .from('gbif_import_jobs')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching import jobs:', error);
        return [];
      }

      return data as ImportJob[];
    },
    enabled: !!user,
  });

  // Convert GBIF species to our database format
  const convertGBIFToEducationalFish = (gbifSpecies: GBIFSpecies) => {
    const commonNames = gbifSpecies.vernacularNames?.filter(vn => vn.language === 'en') || [];
    const primaryName = commonNames.find(cn => cn.vernacularName)?.vernacularName || gbifSpecies.canonicalName;
    
    // Find images from media
    const images = gbifSpecies.media?.filter(m => m.type === 'StillImage') || [];
    const primaryImage = images.find(img => img.identifier)?.identifier;
    
    return {
      name: primaryName,
      scientific_name: gbifSpecies.scientificName,
      scientific_name_authorship: gbifSpecies.authorship,
      category: 'Fish',
      care_level: 'Intermediate', // Default, can be updated manually
      gbif_species_key: gbifSpecies.key,
      gbif_usage_key: gbifSpecies.usageKey,
      taxonomic_status: gbifSpecies.taxonomicStatus,
      kingdom: gbifSpecies.kingdom,
      phylum: gbifSpecies.phylum,
      class: gbifSpecies.class,
      order_name: gbifSpecies.order,
      family: gbifSpecies.family,
      genus: gbifSpecies.genus,
      species_name: gbifSpecies.species,
      common_names: commonNames.map(cn => ({
        name: cn.vernacularName,
        language: cn.language,
        source: cn.source
      })),
      image_url: primaryImage,
      image_gallery: images.slice(0, 5).map(img => img.identifier).filter(Boolean),
      data_source: 'gbif',
      water_type: 'Saltwater',
      gbif_last_updated: new Date().toISOString(),
      summary: `${gbifSpecies.scientificName} is a marine species from the ${gbifSpecies.family} family.`
    };
  };

  // Import single species
  const importSpeciesMutation = useMutation({
    mutationFn: async (gbifSpecies: GBIFSpecies) => {
      if (!user) throw new Error('User not authenticated');

      console.log('Importing species:', gbifSpecies);

      // Create import job
      const { data: job, error: jobError } = await supabase
        .from('gbif_import_jobs')
        .insert({
          user_id: user.id,
          job_type: 'single_species',
          status: 'running',
          search_query: gbifSpecies.scientificName,
          total_species: 1,
        })
        .select()
        .single();

      if (jobError) throw jobError;

      try {
        // Convert and insert species
        const educationalFish = convertGBIFToEducationalFish(gbifSpecies);
        
        // Check if species already exists
        const { data: existing } = await supabase
          .from('educational_fish')
          .select('id')
          .eq('gbif_species_key', gbifSpecies.key)
          .single();

        let speciesId: string;

        if (existing) {
          // Update existing species
          const { data: updated, error: updateError } = await supabase
            .from('educational_fish')
            .update(educationalFish)
            .eq('id', existing.id)
            .select()
            .single();

          if (updateError) throw updateError;
          speciesId = updated.id;
        } else {
          // Insert new species
          const { data: inserted, error: insertError } = await supabase
            .from('educational_fish')
            .insert(educationalFish)
            .select()
            .single();

          if (insertError) throw insertError;
          speciesId = inserted.id;
        }

        // Insert images if available
        if (gbifSpecies.media && gbifSpecies.media.length > 0) {
          const imageInserts = gbifSpecies.media
            .filter(m => m.type === 'StillImage' && m.identifier)
            .map((media, index) => ({
              species_id: speciesId,
              image_url: media.identifier,
              image_source: 'gbif',
              attribution: media.creator || media.rightsHolder,
              license: media.license,
              is_primary: index === 0
            }));

          if (imageInserts.length > 0) {
            await supabase.from('species_images').insert(imageInserts);
          }
        }

        // Update job as completed
        await supabase
          .from('gbif_import_jobs')
          .update({
            status: 'completed',
            imported_species: 1,
            completed_at: new Date().toISOString()
          })
          .eq('id', job.id);

        return { success: true, speciesId };
      } catch (error) {
        // Update job as failed
        await supabase
          .from('gbif_import_jobs')
          .update({
            status: 'failed',
            failed_species: 1,
            error_details: { error: error instanceof Error ? error.message : 'Unknown error' },
            completed_at: new Date().toISOString()
          })
          .eq('id', job.id);

        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['educational_fish'] });
      queryClient.invalidateQueries({ queryKey: ['gbif_import_jobs'] });
      toast({
        title: "Species imported successfully",
        description: "The species has been added to the educational database.",
      });
    },
    onError: (error) => {
      console.error('Import error:', error);
      toast({
        title: "Import failed",
        description: error instanceof Error ? error.message : "Failed to import species",
        variant: "destructive",
      });
    },
  });

  // Bulk import species
  const bulkImportMutation = useMutation({
    mutationFn: async ({ species, jobType = 'bulk_import' }: { species: GBIFSpecies[], jobType?: string }) => {
      if (!user) throw new Error('User not authenticated');

      console.log('Starting bulk import of', species.length, 'species');

      // Create import job
      const { data: job, error: jobError } = await supabase
        .from('gbif_import_jobs')
        .insert({
          user_id: user.id,
          job_type: jobType,
          status: 'running',
          total_species: species.length,
        })
        .select()
        .single();

      if (jobError) throw jobError;

      let imported = 0;
      let failed = 0;
      const errors: any[] = [];

      for (const gbifSpecies of species) {
        try {
          const educationalFish = convertGBIFToEducationalFish(gbifSpecies);
          
          // Check if species already exists
          const { data: existing } = await supabase
            .from('educational_fish')
            .select('id')
            .eq('gbif_species_key', gbifSpecies.key)
            .single();

          let speciesId: string;

          if (existing) {
            // Update existing species
            const { data: updated, error: updateError } = await supabase
              .from('educational_fish')
              .update(educationalFish)
              .eq('id', existing.id)
              .select()
              .single();

            if (updateError) throw updateError;
            speciesId = updated.id;
          } else {
            // Insert new species
            const { data: inserted, error: insertError } = await supabase
              .from('educational_fish')
              .insert(educationalFish)
              .select()
              .single();

            if (insertError) throw insertError;
            speciesId = inserted.id;
          }

          // Insert images if available
          if (gbifSpecies.media && gbifSpecies.media.length > 0) {
            const imageInserts = gbifSpecies.media
              .filter(m => m.type === 'StillImage' && m.identifier)
              .map((media, index) => ({
                species_id: speciesId,
                image_url: media.identifier,
                image_source: 'gbif',
                attribution: media.creator || media.rightsHolder,
                license: media.license,
                is_primary: index === 0
              }));

            if (imageInserts.length > 0) {
              await supabase.from('species_images').insert(imageInserts);
            }
          }

          imported++;
          
          // Update progress periodically
          if (imported % 10 === 0) {
            await supabase
              .from('gbif_import_jobs')
              .update({
                imported_species: imported,
                failed_species: failed
              })
              .eq('id', job.id);
          }
        } catch (error) {
          failed++;
          errors.push({
            species: gbifSpecies.scientificName,
            error: error instanceof Error ? error.message : 'Unknown error'
          });
          console.error(`Failed to import ${gbifSpecies.scientificName}:`, error);
        }
      }

      // Update final job status
      await supabase
        .from('gbif_import_jobs')
        .update({
          status: failed === 0 ? 'completed' : 'completed',
          imported_species: imported,
          failed_species: failed,
          error_details: errors.length > 0 ? { errors } : null,
          completed_at: new Date().toISOString()
        })
        .eq('id', job.id);

      return { imported, failed, total: species.length };
    },
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ['educational_fish'] });
      queryClient.invalidateQueries({ queryKey: ['gbif_import_jobs'] });
      toast({
        title: "Bulk import completed",
        description: `Imported ${result.imported} species successfully. ${result.failed} failed.`,
      });
    },
    onError: (error) => {
      console.error('Bulk import error:', error);
      toast({
        title: "Bulk import failed",
        description: error instanceof Error ? error.message : "Failed to import species",
        variant: "destructive",
      });
    },
  });

  return {
    importJobs,
    jobsLoading,
    importSpecies: importSpeciesMutation.mutate,
    bulkImport: bulkImportMutation.mutate,
    isImporting: importSpeciesMutation.isPending || bulkImportMutation.isPending,
    convertGBIFToEducationalFish,
  };
};
