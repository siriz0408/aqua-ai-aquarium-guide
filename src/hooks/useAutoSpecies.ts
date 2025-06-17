
import { useState, useEffect } from 'react';
import { AutoSpeciesService, AutoPopulatedSpecies } from '@/services/AutoSpeciesService';
import { SpeciesCache } from '@/services/SpeciesCache';
import { useGBIFApi } from '@/hooks/useGBIFApi';
import { useToast } from '@/hooks/use-toast';

export const useAutoSpecies = () => {
  const [species, setSpecies] = useState<AutoPopulatedSpecies[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const gbifApi = useGBIFApi();
  const { toast } = useToast();

  useEffect(() => {
    initializeSpecies();
  }, []);

  const initializeSpecies = async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Check for cached data first
      const cachedData = SpeciesCache.getCacheData();
      
      if (cachedData && cachedData.length > 0) {
        console.log('Loading species from cache');
        setSpecies(cachedData);
        setIsLoading(false);
        
        // Optionally refresh in background if cache is older than 12 hours
        const cacheInfo = SpeciesCache.getCacheInfo();
        const twelveHoursAgo = Date.now() - (12 * 60 * 60 * 1000);
        
        if (cacheInfo.lastUpdated && cacheInfo.lastUpdated.getTime() < twelveHoursAgo) {
          console.log('Cache is old, refreshing in background');
          refreshSpeciesInBackground();
        }
        
        return;
      }

      // No cache, fetch fresh data
      console.log('No cache found, fetching fresh species data');
      await fetchFreshSpecies();
      
    } catch (err) {
      console.error('Failed to initialize species:', err);
      setError(err instanceof Error ? err.message : 'Failed to load species data');
      toast({
        title: "Error loading species",
        description: "Failed to load species data. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const fetchFreshSpecies = async () => {
    const autoService = new AutoSpeciesService(gbifApi);
    const freshData = await autoService.loadPopularSpecies();
    
    if (freshData.length > 0) {
      setSpecies(freshData);
      SpeciesCache.setCacheData(freshData);
      console.log(`Loaded ${freshData.length} species and cached them`);
      
      toast({
        title: "Species data updated",
        description: `Loaded ${freshData.length} species from GBIF database.`,
      });
    } else {
      throw new Error('No species data could be loaded');
    }
  };

  const refreshSpeciesInBackground = async () => {
    try {
      const autoService = new AutoSpeciesService(gbifApi);
      const freshData = await autoService.loadPopularSpecies();
      
      if (freshData.length > 0) {
        setSpecies(freshData);
        SpeciesCache.setCacheData(freshData);
        console.log('Background refresh completed');
      }
    } catch (err) {
      console.warn('Background refresh failed:', err);
    }
  };

  const manualRefresh = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      await fetchFreshSpecies();
    } catch (err) {
      console.error('Manual refresh failed:', err);
      setError(err instanceof Error ? err.message : 'Failed to refresh species data');
      toast({
        title: "Refresh failed",
        description: "Failed to refresh species data. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const clearCacheAndRefresh = async () => {
    SpeciesCache.clearCache();
    await manualRefresh();
  };

  const searchSpecies = (query: string): AutoPopulatedSpecies[] => {
    if (!query.trim()) return species;
    
    const searchTerm = query.toLowerCase();
    return species.filter(fish => 
      fish.name.toLowerCase().includes(searchTerm) ||
      fish.scientific_name.toLowerCase().includes(searchTerm) ||
      fish.family?.toLowerCase().includes(searchTerm) ||
      fish.common_names.some((name: any) => 
        name.name?.toLowerCase().includes(searchTerm)
      )
    );
  };

  const getSpeciesByCategory = (category: string): AutoPopulatedSpecies[] => {
    return species.filter(fish => fish.category === category);
  };

  const getCacheInfo = () => SpeciesCache.getCacheInfo();

  return {
    species,
    isLoading,
    error,
    manualRefresh,
    clearCacheAndRefresh,
    searchSpecies,
    getSpeciesByCategory,
    getCacheInfo
  };
};
