import { GBIFSpecies, useGBIFApi } from '@/hooks/useGBIFApi';

export interface AutoPopulatedSpecies {
  id: string;
  name: string;
  scientific_name: string;
  category: string;
  summary: string;
  care_level: 'Beginner' | 'Intermediate' | 'Advanced';
  diet_type: 'Herbivore' | 'Carnivore' | 'Omnivore';
  tank_size_minimum: number;
  water_temperature_range: string;
  ph_range: string;
  reef_safe: boolean;
  water_type: string;
  family?: string;
  common_names: any[];
  image_url?: string;
  data_source: string;
  gbif_species_key: number;
}

export class AutoSpeciesService {
  private popularAquariumSpecies = [
    // Clownfish family
    'Amphiprion ocellatus',
    'Amphiprion percula',
    'Amphiprion clarkii',
    
    // Tangs
    'Zebrasoma flavescens', // Yellow Tang
    'Paracanthurus hepatus', // Blue Tang
    'Zebrasoma xanthurum', // Purple Tang
    
    // Angels
    'Centropyge bicolor', // Bicolor Angelfish
    'Centropyge loriculus', // Flame Angelfish
    'Pomacanthus imperator', // Emperor Angelfish
    
    // Wrasses
    'Halichoeres chrysus', // Yellow Wrasse
    'Thalassoma bifasciatum', // Bluehead Wrasse
    
    // Gobies
    'Gobiodon okinawae', // Yellow Coral Goby
    'Valenciennea strigata', // Golden Head Sleeper Goby
    
    // Others
    'Gramma loreto', // Royal Gramma
    'Pseudanthias squamipinnis', // Anthias
    'Synchiropus splendidus', // Mandarin Fish
    'Chrysiptera parasema', // Yellowtail Damselfish
    'Banggai cardinalfish',
    'Pterapogon kauderni'
  ];

  private gbifApi: ReturnType<typeof useGBIFApi>;

  constructor(gbifApi: ReturnType<typeof useGBIFApi>) {
    this.gbifApi = gbifApi;
  }

  async loadPopularSpecies(): Promise<AutoPopulatedSpecies[]> {
    const speciesData: AutoPopulatedSpecies[] = [];
    
    for (const scientificName of this.popularAquariumSpecies) {
      try {
        console.log(`Loading species: ${scientificName}`);
        const searchResult = await this.gbifApi.searchSpecies(scientificName, 1);
        
        if (searchResult && searchResult.results.length > 0) {
          const gbifSpecies = searchResult.results[0];
          const enhancedSpecies = this.enhanceWithAquariumData(gbifSpecies);
          speciesData.push(enhancedSpecies);
        }
        
        // Add delay to respect rate limits
        await this.delay(600);
      } catch (error) {
        console.warn(`Failed to load ${scientificName}:`, error);
      }
    }
    
    console.log(`Loaded ${speciesData.length} species`);
    return speciesData;
  }

  private enhanceWithAquariumData(gbifSpecies: GBIFSpecies): AutoPopulatedSpecies {
    const commonNames = gbifSpecies.vernacularNames || [];
    const primaryName = commonNames.find(cn => cn.language === 'en')?.vernacularName || 
                       gbifSpecies.canonicalName || 
                       gbifSpecies.scientificName;

    return {
      id: `gbif-${gbifSpecies.key}`,
      name: primaryName,
      scientific_name: gbifSpecies.scientificName,
      category: 'Fish',
      summary: this.generateDescription(gbifSpecies),
      care_level: this.inferCareLevel(gbifSpecies),
      diet_type: this.inferDietType(gbifSpecies),
      tank_size_minimum: this.inferTankSize(gbifSpecies),
      water_temperature_range: '72-78°F',
      ph_range: '8.0-8.4',
      reef_safe: this.inferReefSafety(gbifSpecies),
      water_type: 'Saltwater',
      family: gbifSpecies.family,
      common_names: commonNames.map(cn => ({
        name: cn.vernacularName,
        language: cn.language
      })),
      image_url: this.findBestImage(gbifSpecies),
      data_source: 'gbif-auto',
      gbif_species_key: gbifSpecies.key
    };
  }

  private inferCareLevel(species: GBIFSpecies): 'Beginner' | 'Intermediate' | 'Advanced' {
    const family = species.family?.toLowerCase() || '';
    const genus = species.genus?.toLowerCase() || '';
    
    // Beginner-friendly families
    if (['pomacentridae', 'gobiidae', 'grammatidae'].includes(family)) {
      return 'Beginner';
    }
    
    // Advanced families
    if (['zanclidae', 'pomacanthidae', 'syngnathidae'].includes(family)) {
      return 'Advanced';
    }
    
    // Intermediate for most others
    return 'Intermediate';
  }

  private inferDietType(species: GBIFSpecies): 'Herbivore' | 'Carnivore' | 'Omnivore' {
    const family = species.family?.toLowerCase() || '';
    
    if (['acanthuridae', 'siganidae'].includes(family)) return 'Herbivore';
    if (['serranidae', 'scorpaenidae', 'syngnathidae'].includes(family)) return 'Carnivore';
    return 'Omnivore';
  }

  private inferTankSize(species: GBIFSpecies): number {
    const family = species.family?.toLowerCase() || '';
    
    if (['gobiidae', 'grammatidae'].includes(family)) return 20;
    if (['pomacentridae'].includes(family)) return 30;
    if (['acanthuridae', 'pomacanthidae'].includes(family)) return 75;
    return 40;
  }

  private inferReefSafety(species: GBIFSpecies): boolean {
    const family = species.family?.toLowerCase() || '';
    
    // Generally reef-unsafe families
    if (['balistidae', 'tetraodontidae'].includes(family)) return false;
    
    // Most others are generally reef safe with caution
    return true;
  }

  private generateDescription(species: GBIFSpecies): string {
    const family = species.family || 'unknown family';
    const habitat = species.kingdom === 'Animalia' ? 'marine species' : 'species';
    
    return `${species.scientificName} is a ${habitat} from the ${family} family. This species is commonly kept in marine aquariums and requires proper care and water conditions to thrive.`;
  }

  private findBestImage(species: GBIFSpecies): string | undefined {
    if (species.media && species.media.length > 0) {
      const images = species.media.filter(m => m.type === 'StillImage');
      if (images.length > 0) {
        return images[0].identifier;
      }
    }
    return undefined;
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}
