
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';

export interface GBIFSpecies {
  key: number;
  usageKey: number;
  scientificName: string;
  canonicalName: string;
  authorship?: string;
  taxonomicStatus: string;
  rank: string;
  kingdom?: string;
  phylum?: string;
  class?: string;
  order?: string;
  family?: string;
  genus?: string;
  species?: string;
  vernacularNames?: Array<{
    vernacularName: string;
    language: string;
    source: string;
  }>;
  media?: Array<{
    identifier: string;
    type: string;
    format: string;
    title?: string;
    creator?: string;
    license?: string;
    rightsHolder?: string;
  }>;
}

export interface GBIFSearchResult {
  results: GBIFSpecies[];
  count: number;
  limit: number;
  offset: number;
}

export const useGBIFApi = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const searchSpecies = async (query: string, limit = 20): Promise<GBIFSearchResult | null> => {
    setIsLoading(true);
    setError(null);

    try {
      console.log('Searching GBIF for:', query);
      
      // Search for species in GBIF
      const searchUrl = `https://api.gbif.org/v1/species/search?q=${encodeURIComponent(query)}&limit=${limit}&rank=SPECIES&status=ACCEPTED`;
      const searchResponse = await fetch(searchUrl);
      
      if (!searchResponse.ok) {
        throw new Error(`GBIF search failed: ${searchResponse.status}`);
      }

      const searchData = await searchResponse.json();
      console.log('GBIF search results:', searchData);

      // Enhance results with additional data
      const enhancedResults = await Promise.all(
        searchData.results.map(async (species: any) => {
          try {
            // Get detailed species information
            const detailResponse = await fetch(`https://api.gbif.org/v1/species/${species.key}`);
            const detailData = detailResponse.ok ? await detailResponse.json() : species;

            // Get vernacular names
            const vernacularResponse = await fetch(`https://api.gbif.org/v1/species/${species.key}/vernacularNames`);
            const vernacularData = vernacularResponse.ok ? await vernacularResponse.json() : { results: [] };

            // Get media/images
            const mediaResponse = await fetch(`https://api.gbif.org/v1/species/${species.key}/media`);
            const mediaData = mediaResponse.ok ? await mediaResponse.json() : { results: [] };

            return {
              ...detailData,
              vernacularNames: vernacularData.results || [],
              media: mediaData.results || []
            };
          } catch (err) {
            console.warn(`Failed to enhance species ${species.key}:`, err);
            return species;
          }
        })
      );

      return {
        results: enhancedResults,
        count: searchData.count,
        limit: searchData.limit,
        offset: searchData.offset
      };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to search GBIF database';
      setError(errorMessage);
      toast({
        title: "GBIF Search Error",
        description: errorMessage,
        variant: "destructive",
      });
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const getSpeciesDetails = async (speciesKey: number): Promise<GBIFSpecies | null> => {
    setIsLoading(true);
    setError(null);

    try {
      const [detailResponse, vernacularResponse, mediaResponse] = await Promise.all([
        fetch(`https://api.gbif.org/v1/species/${speciesKey}`),
        fetch(`https://api.gbif.org/v1/species/${speciesKey}/vernacularNames`),
        fetch(`https://api.gbif.org/v1/species/${speciesKey}/media`)
      ]);

      if (!detailResponse.ok) {
        throw new Error(`Failed to fetch species details: ${detailResponse.status}`);
      }

      const [detailData, vernacularData, mediaData] = await Promise.all([
        detailResponse.json(),
        vernacularResponse.ok ? vernacularResponse.json() : { results: [] },
        mediaResponse.ok ? mediaResponse.json() : { results: [] }
      ]);

      return {
        ...detailData,
        vernacularNames: vernacularData.results || [],
        media: mediaData.results || []
      };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch species details';
      setError(errorMessage);
      toast({
        title: "GBIF API Error",
        description: errorMessage,
        variant: "destructive",
      });
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const searchByFamily = async (familyName: string, limit = 100): Promise<GBIFSearchResult | null> => {
    return searchSpecies(`family:${familyName}`, limit);
  };

  const searchMarineSpecies = async (limit = 50): Promise<GBIFSearchResult | null> => {
    // Search for common marine families
    const marineFamilies = [
      'Pomacentridae', // Damselfishes
      'Labridae', // Wrasses
      'Serranidae', // Groupers
      'Chaetodontidae', // Butterflyfishes
      'Pomacanthidae', // Angelfishes
      'Acanthuridae', // Tangs/Surgeonfish
      'Gobiidae', // Gobies
      'Blenniidae', // Blennies
    ];

    try {
      const familyQuery = marineFamilies.map(family => `family:${family}`).join(' OR ');
      return searchSpecies(familyQuery, limit);
    } catch (err) {
      console.error('Failed to search marine species:', err);
      return null;
    }
  };

  return {
    searchSpecies,
    getSpeciesDetails,
    searchByFamily,
    searchMarineSpecies,
    isLoading,
    error
  };
};
