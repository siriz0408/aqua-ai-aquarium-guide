
export interface CachedSpeciesData {
  data: any[];
  timestamp: number;
  expires: number;
}

export class SpeciesCache {
  private static readonly CACHE_KEY = 'aquabot_species_cache';
  private static readonly CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours

  static setCacheData(data: any[]): void {
    const cacheObject: CachedSpeciesData = {
      data: data,
      timestamp: Date.now(),
      expires: Date.now() + this.CACHE_DURATION
    };
    
    try {
      localStorage.setItem(this.CACHE_KEY, JSON.stringify(cacheObject));
      console.log('Species data cached successfully');
    } catch (error) {
      console.warn('Failed to cache species data:', error);
    }
  }

  static getCacheData(): any[] | null {
    try {
      const cached = localStorage.getItem(this.CACHE_KEY);
      if (!cached) return null;

      const cacheObject: CachedSpeciesData = JSON.parse(cached);
      
      if (cacheObject.expires > Date.now()) {
        console.log('Using cached species data');
        return cacheObject.data;
      } else {
        console.log('Cache expired, will fetch fresh data');
        this.clearCache();
        return null;
      }
    } catch (error) {
      console.warn('Cache read error:', error);
      this.clearCache();
      return null;
    }
  }

  static isCacheExpired(): boolean {
    try {
      const cached = localStorage.getItem(this.CACHE_KEY);
      if (!cached) return true;

      const cacheObject: CachedSpeciesData = JSON.parse(cached);
      return cacheObject.expires <= Date.now();
    } catch (error) {
      return true;
    }
  }

  static clearCache(): void {
    try {
      localStorage.removeItem(this.CACHE_KEY);
      console.log('Species cache cleared');
    } catch (error) {
      console.warn('Failed to clear cache:', error);
    }
  }

  static getCacheInfo(): { size: number; lastUpdated: Date | null; expiresAt: Date | null } {
    try {
      const cached = localStorage.getItem(this.CACHE_KEY);
      if (!cached) {
        return { size: 0, lastUpdated: null, expiresAt: null };
      }

      const cacheObject: CachedSpeciesData = JSON.parse(cached);
      return {
        size: cacheObject.data.length,
        lastUpdated: new Date(cacheObject.timestamp),
        expiresAt: new Date(cacheObject.expires)
      };
    } catch (error) {
      return { size: 0, lastUpdated: null, expiresAt: null };
    }
  }
}
