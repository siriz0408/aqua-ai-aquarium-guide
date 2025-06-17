
export interface EducationalSpecies {
  id: string;
  name: string;
  scientific_name?: string;
  category: 'Fish' | 'Coral' | 'Invertebrate' | 'Plant';
  summary: string;
  care_level: 'Beginner' | 'Intermediate' | 'Advanced';
  diet_type?: 'Herbivore' | 'Carnivore' | 'Omnivore';
  tank_size_minimum?: number;
  water_type: 'Saltwater' | 'Freshwater';
  reef_safe?: boolean;
  compatibility_notes?: string;
  ph_range?: string;
  water_temperature_range?: string;
}

export interface EducationalEquipmentData {
  id: string;
  name: string;
  category: string;
  summary: string;
  difficulty_level: 'Easy' | 'Moderate' | 'Advanced';
  recommended_tank_sizes?: string[];
  price_range?: string;
  maintenance_frequency?: string;
  compatibility_equipment?: string[];
  installation_notes?: string;
}

export const educationalSpecies: EducationalSpecies[] = [
  // Saltwater Corals - Soft Corals
  { id: '1', name: 'Green Star Polyps', scientific_name: 'Pachyclavularia violacea', category: 'Coral', summary: 'Fast-growing soft coral that forms a mat of bright green polyps. Excellent beginner coral.', care_level: 'Beginner', water_type: 'Saltwater', reef_safe: true, ph_range: '8.1-8.4', water_temperature_range: '72-78°F' },
  { id: '2', name: 'Pulsing Xenia', scientific_name: 'Heteroxenia fuscescens', category: 'Coral', summary: 'Soft coral known for its pulsing motion. Fast-growing and hardy.', care_level: 'Beginner', water_type: 'Saltwater', reef_safe: true, ph_range: '8.1-8.4', water_temperature_range: '72-78°F' },
  { id: '3', name: 'Kenya Tree Coral', scientific_name: 'Capnella sp.', category: 'Coral', summary: 'Tree-like soft coral that reproduces easily. Great for beginners.', care_level: 'Beginner', water_type: 'Saltwater', reef_safe: true, ph_range: '8.1-8.4', water_temperature_range: '72-78°F' },
  { id: '4', name: 'Toadstool Leather', scientific_name: 'Sarcophyton sp.', category: 'Coral', summary: 'Large, mushroom-shaped leather coral. Hardy and forgiving.', care_level: 'Beginner', water_type: 'Saltwater', reef_safe: true, tank_size_minimum: 30, ph_range: '8.1-8.4', water_temperature_range: '72-78°F' },
  { id: '5', name: 'Zoanthids', scientific_name: 'Zoanthus sp.', category: 'Coral', summary: 'Colorful colonial polyps available in many varieties. Very hardy.', care_level: 'Beginner', water_type: 'Saltwater', reef_safe: true, ph_range: '8.1-8.4', water_temperature_range: '72-78°F' },

  // LPS Corals
  { id: '6', name: 'Hammer Coral', scientific_name: 'Euphyllia ancora', category: 'Coral', summary: 'Popular LPS coral with hammer-shaped tentacles. Moderate lighting needs.', care_level: 'Intermediate', water_type: 'Saltwater', reef_safe: true, tank_size_minimum: 30, ph_range: '8.1-8.4', water_temperature_range: '72-78°F' },
  { id: '7', name: 'Torch Coral', scientific_name: 'Euphyllia glabrescens', category: 'Coral', summary: 'Flowing tentacles that look like torches. Stunning under blue light.', care_level: 'Intermediate', water_type: 'Saltwater', reef_safe: true, tank_size_minimum: 30, ph_range: '8.1-8.4', water_temperature_range: '72-78°F' },
  { id: '8', name: 'Frogspawn Coral', scientific_name: 'Euphyllia divisa', category: 'Coral', summary: 'Branching coral with tentacles that split at the tips like frog eggs.', care_level: 'Intermediate', water_type: 'Saltwater', reef_safe: true, tank_size_minimum: 30, ph_range: '8.1-8.4', water_temperature_range: '72-78°F' },

  // SPS Corals
  { id: '9', name: 'Acropora', scientific_name: 'Acropora sp.', category: 'Coral', summary: 'Fast-growing branching coral. Requires stable water parameters and strong lighting.', care_level: 'Advanced', water_type: 'Saltwater', reef_safe: true, tank_size_minimum: 50, ph_range: '8.1-8.4', water_temperature_range: '76-82°F' },
  { id: '10', name: 'Montipora', scientific_name: 'Montipora sp.', category: 'Coral', summary: 'Encrusting or plating SPS coral. Easier than Acropora for beginners to SPS.', care_level: 'Intermediate', water_type: 'Saltwater', reef_safe: true, tank_size_minimum: 40, ph_range: '8.1-8.4', water_temperature_range: '76-82°F' },

  // Saltwater Fish - Clownfish
  { id: '11', name: 'Ocellaris Clownfish', scientific_name: 'Amphiprion ocellaris', category: 'Fish', summary: 'The classic "Nemo" fish. Hardy, peaceful, and great for beginners.', care_level: 'Beginner', diet_type: 'Omnivore', tank_size_minimum: 20, water_type: 'Saltwater', reef_safe: true, ph_range: '8.1-8.4', water_temperature_range: '72-78°F' },
  { id: '12', name: 'Percula Clownfish', scientific_name: 'Amphiprion percula', category: 'Fish', summary: 'True Percula clownfish with thicker black bands than Ocellaris. Hardy and colorful.', care_level: 'Beginner', diet_type: 'Omnivore', tank_size_minimum: 20, water_type: 'Saltwater', reef_safe: true, ph_range: '8.1-8.4', water_temperature_range: '72-78°F' },
  { id: '13', name: 'Maroon Clownfish', scientific_name: 'Premnas biaculeatus', category: 'Fish', summary: 'Largest clownfish species. Can be aggressive but stunning in color.', care_level: 'Intermediate', diet_type: 'Omnivore', tank_size_minimum: 30, water_type: 'Saltwater', reef_safe: true, ph_range: '8.1-8.4', water_temperature_range: '72-78°F' },

  // Tangs
  { id: '14', name: 'Yellow Tang', scientific_name: 'Zebrasoma flavescens', category: 'Fish', summary: 'Bright yellow surgeonfish. Active algae eater, needs swimming space.', care_level: 'Intermediate', diet_type: 'Herbivore', tank_size_minimum: 75, water_type: 'Saltwater', reef_safe: true, ph_range: '8.1-8.4', water_temperature_range: '72-78°F' },
  { id: '15', name: 'Blue Hippo Tang', scientific_name: 'Paracanthurus hepatus', category: 'Fish', summary: 'Beautiful blue tang made famous by "Dory". Prone to ich, needs excellent water quality.', care_level: 'Intermediate', diet_type: 'Herbivore', tank_size_minimum: 100, water_type: 'Saltwater', reef_safe: true, ph_range: '8.1-8.4', water_temperature_range: '72-78°F' },
  { id: '16', name: 'Purple Tang', scientific_name: 'Zebrasoma xanthurum', category: 'Fish', summary: 'Striking purple coloration. Can be territorial with other tangs.', care_level: 'Intermediate', diet_type: 'Herbivore', tank_size_minimum: 100, water_type: 'Saltwater', reef_safe: true, ph_range: '8.1-8.4', water_temperature_range: '72-78°F' },

  // Gobies
  { id: '17', name: 'Watchman Goby', scientific_name: 'Cryptocentrus cinctus', category: 'Fish', summary: 'Bottom-dwelling fish that pairs with pistol shrimp. Great sand sifter.', care_level: 'Beginner', diet_type: 'Carnivore', tank_size_minimum: 30, water_type: 'Saltwater', reef_safe: true, ph_range: '8.1-8.4', water_temperature_range: '72-78°F' },
  { id: '18', name: 'Firefish Goby', scientific_name: 'Nemateleotris magnifica', category: 'Fish', summary: 'Peaceful fish with beautiful coloration. Tends to jump, needs tight lid.', care_level: 'Beginner', diet_type: 'Carnivore', tank_size_minimum: 20, water_type: 'Saltwater', reef_safe: true, ph_range: '8.1-8.4', water_temperature_range: '72-78°F' },

  // Marine Invertebrates
  { id: '19', name: 'Cleaner Shrimp', scientific_name: 'Lysmata amboinensis', category: 'Invertebrate', summary: 'Beneficial shrimp that cleans fish and removes parasites. Hardy and useful.', care_level: 'Beginner', diet_type: 'Omnivore', tank_size_minimum: 20, water_type: 'Saltwater', reef_safe: true, ph_range: '8.1-8.4', water_temperature_range: '72-78°F' },
  { id: '20', name: 'Blood Red Fire Shrimp', scientific_name: 'Lysmata debelius', category: 'Invertebrate', summary: 'Stunning red shrimp with white antennae. More shy than cleaner shrimp.', care_level: 'Beginner', diet_type: 'Omnivore', tank_size_minimum: 30, water_type: 'Saltwater', reef_safe: true, ph_range: '8.1-8.4', water_temperature_range: '72-78°F' },
  { id: '21', name: 'Emerald Crab', scientific_name: 'Mithraculus sculptus', category: 'Invertebrate', summary: 'Algae-eating crab, particularly good for bubble algae control.', care_level: 'Beginner', diet_type: 'Herbivore', tank_size_minimum: 20, water_type: 'Saltwater', reef_safe: true, ph_range: '8.1-8.4', water_temperature_range: '72-78°F' },

  // Freshwater Fish - Community
  { id: '22', name: 'Neon Tetra', scientific_name: 'Paracheirodon innesi', category: 'Fish', summary: 'Classic schooling fish with bright blue and red stripes. Peaceful community fish.', care_level: 'Beginner', diet_type: 'Omnivore', tank_size_minimum: 10, water_type: 'Freshwater', ph_range: '6.0-7.0', water_temperature_range: '70-78°F' },
  { id: '23', name: 'Cardinal Tetra', scientific_name: 'Paracheirodon axelrodi', category: 'Fish', summary: 'Similar to neon tetra but with red extending full length of body. Slightly more sensitive.', care_level: 'Beginner', diet_type: 'Omnivore', tank_size_minimum: 10, water_type: 'Freshwater', ph_range: '5.0-7.0', water_temperature_range: '73-81°F' },
  { id: '24', name: 'Guppy', scientific_name: 'Poecilia reticulata', category: 'Fish', summary: 'Colorful, easy-to-breed livebearers. Great for beginners.', care_level: 'Beginner', diet_type: 'Omnivore', tank_size_minimum: 5, water_type: 'Freshwater', ph_range: '6.8-7.8', water_temperature_range: '72-82°F' },
  { id: '25', name: 'Betta Fish', scientific_name: 'Betta splendens', category: 'Fish', summary: 'Stunning male fighting fish with flowing fins. Males must be kept alone.', care_level: 'Beginner', diet_type: 'Carnivore', tank_size_minimum: 5, water_type: 'Freshwater', ph_range: '6.5-7.5', water_temperature_range: '76-82°F' },
  
  // Freshwater Centerpiece Fish
  { id: '26', name: 'Angelfish', scientific_name: 'Pterophyllum scalare', category: 'Fish', summary: 'Elegant tall-bodied cichlid. Can be territorial when breeding.', care_level: 'Intermediate', diet_type: 'Omnivore', tank_size_minimum: 30, water_type: 'Freshwater', ph_range: '6.8-7.8', water_temperature_range: '76-84°F' },
  { id: '27', name: 'Discus', scientific_name: 'Symphysodon sp.', category: 'Fish', summary: 'King of the aquarium. Requires pristine water conditions and higher temperatures.', care_level: 'Advanced', diet_type: 'Carnivore', tank_size_minimum: 50, water_type: 'Freshwater', ph_range: '6.0-7.0', water_temperature_range: '82-88°F' },

  // Freshwater Bottom Dwellers
  { id: '28', name: 'Corydoras Catfish', scientific_name: 'Corydoras sp.', category: 'Fish', summary: 'Peaceful bottom-dwelling catfish that clean up leftover food. Keep in groups.', care_level: 'Beginner', diet_type: 'Omnivore', tank_size_minimum: 20, water_type: 'Freshwater', ph_range: '6.0-8.0', water_temperature_range: '72-78°F' },
  { id: '29', name: 'Bristlenose Pleco', scientific_name: 'Ancistrus sp.', category: 'Fish', summary: 'Small algae-eating catfish with bristles on nose. Good algae control.', care_level: 'Beginner', diet_type: 'Herbivore', tank_size_minimum: 30, water_type: 'Freshwater', ph_range: '6.5-7.5', water_temperature_range: '73-81°F' },

  // Freshwater Plants
  { id: '30', name: 'Java Fern', scientific_name: 'Microsorum pteropus', category: 'Plant', summary: 'Hardy low-light plant that attaches to rocks and driftwood. Great for beginners.', care_level: 'Beginner', water_type: 'Freshwater', ph_range: '6.0-7.5', water_temperature_range: '68-82°F' },
  { id: '31', name: 'Anubias Nana', scientific_name: 'Anubias barteri var. nana', category: 'Plant', summary: 'Slow-growing, low-light plant with thick leaves. Very hardy.', care_level: 'Beginner', water_type: 'Freshwater', ph_range: '6.0-7.5', water_temperature_range: '72-82°F' },
  { id: '32', name: 'Amazon Sword', scientific_name: 'Echinodorus amazonicus', category: 'Plant', summary: 'Large background plant that needs root tabs for nutrition. Moderate lighting.', care_level: 'Intermediate', water_type: 'Freshwater', ph_range: '6.5-7.5', water_temperature_range: '72-82°F' },

  // Freshwater Invertebrates
  { id: '33', name: 'Cherry Shrimp', scientific_name: 'Neocaridina davidi', category: 'Invertebrate', summary: 'Colorful freshwater shrimp that breed easily. Great algae eaters.', care_level: 'Beginner', diet_type: 'Omnivore', tank_size_minimum: 5, water_type: 'Freshwater', ph_range: '6.5-8.0', water_temperature_range: '65-78°F' },
  { id: '34', name: 'Amano Shrimp', scientific_name: 'Caridina multidentata', category: 'Invertebrate', summary: 'Excellent algae eaters, especially for hair algae. Cannot breed in freshwater.', care_level: 'Beginner', diet_type: 'Herbivore', tank_size_minimum: 10, water_type: 'Freshwater', ph_range: '6.0-7.5', water_temperature_range: '70-78°F' },
  { id: '35', name: 'Nerite Snail', scientific_name: 'Neritina sp.', category: 'Invertebrate', summary: 'Excellent algae-eating snails that cannot reproduce in freshwater. Very effective cleaners.', care_level: 'Beginner', diet_type: 'Herbivore', tank_size_minimum: 5, water_type: 'Freshwater', ph_range: '6.5-8.5', water_temperature_range: '72-78°F' }
];

export const educationalEquipment: EducationalEquipmentData[] = [
  // Filtration
  { id: 'eq1', name: 'Hang-On-Back Filter', category: 'Filtration', summary: 'Easy-to-maintain external filter that hangs on the back of the tank. Great for beginners.', difficulty_level: 'Easy', recommended_tank_sizes: ['10-50 gallons'], price_range: '$20-80', maintenance_frequency: 'Monthly media replacement' },
  { id: 'eq2', name: 'Canister Filter', category: 'Filtration', summary: 'External filter with multiple media chambers. Excellent biological and mechanical filtration.', difficulty_level: 'Moderate', recommended_tank_sizes: ['30-200+ gallons'], price_range: '$100-400', maintenance_frequency: 'Every 2-3 months' },
  { id: 'eq3', name: 'Sump System', category: 'Filtration', summary: 'Separate tank below main display for equipment and filtration. Ultimate filtration solution.', difficulty_level: 'Advanced', recommended_tank_sizes: ['40+ gallons'], price_range: '$200-1000+', maintenance_frequency: 'Weekly water changes' },
  { id: 'eq4', name: 'Protein Skimmer', category: 'Filtration', summary: 'Essential for saltwater tanks. Removes organic compounds before they break down.', difficulty_level: 'Moderate', recommended_tank_sizes: ['Saltwater 20+ gallons'], price_range: '$100-500', maintenance_frequency: 'Weekly cleaning' },

  // Lighting
  { id: 'eq5', name: 'LED Aquarium Light', category: 'Lighting', summary: 'Energy-efficient lighting with customizable spectrum. Good for fish and some corals.', difficulty_level: 'Easy', recommended_tank_sizes: ['All sizes'], price_range: '$50-300', maintenance_frequency: 'Minimal - LED bulbs last years' },
  { id: 'eq6', name: 'T5 Fluorescent Fixture', category: 'Lighting', summary: 'High-output fluorescent lighting. Excellent for planted tanks and LPS corals.', difficulty_level: 'Moderate', recommended_tank_sizes: ['20+ gallons'], price_range: '$100-400', maintenance_frequency: 'Bulb replacement every 8-12 months' },
  { id: 'eq7', name: 'Metal Halide', category: 'Lighting', summary: 'Intense lighting for SPS corals and deep tanks. Produces significant heat.', difficulty_level: 'Advanced', recommended_tank_sizes: ['50+ gallons deep tanks'], price_range: '$200-600', maintenance_frequency: 'Bulb replacement every 6-10 months' },

  // Heating/Cooling
  { id: 'eq8', name: 'Submersible Heater', category: 'Heating', summary: 'Fully submersible heater with built-in thermostat. Most common heating solution.', difficulty_level: 'Easy', recommended_tank_sizes: ['5-100 gallons'], price_range: '$15-50', maintenance_frequency: 'Check monthly, replace every 2-3 years' },
  { id: 'eq9', name: 'Aquarium Chiller', category: 'Cooling', summary: 'Cools water for species requiring lower temperatures or to combat heat from lighting.', difficulty_level: 'Advanced', recommended_tank_sizes: ['20+ gallons'], price_range: '$300-800', maintenance_frequency: 'Annual servicing recommended' },

  // Water Movement
  { id: 'eq10', name: 'Powerhead', category: 'Water Movement', summary: 'Creates water circulation and flow. Essential for coral health and preventing dead spots.', difficulty_level: 'Easy', recommended_tank_sizes: ['10+ gallons'], price_range: '$20-100', maintenance_frequency: 'Monthly cleaning' },
  { id: 'eq11', name: 'Wave Maker', category: 'Water Movement', summary: 'Advanced flow device that creates natural wave patterns. Great for reef tanks.', difficulty_level: 'Moderate', recommended_tank_sizes: ['30+ gallons'], price_range: '$80-300', maintenance_frequency: 'Quarterly deep cleaning' },

  // Water Testing
  { id: 'eq12', name: 'API Test Kit', category: 'Testing', summary: 'Liquid test kit for ammonia, nitrite, nitrate, and pH. Essential for monitoring water quality.', difficulty_level: 'Easy', recommended_tank_sizes: ['All tanks'], price_range: '$10-30', maintenance_frequency: 'Replace when expired or empty' },
  { id: 'eq13', name: 'Refractometer', category: 'Testing', summary: 'Precise instrument for measuring salinity in saltwater tanks. More accurate than hydrometers.', difficulty_level: 'Moderate', recommended_tank_sizes: ['Saltwater tanks'], price_range: '$30-100', maintenance_frequency: 'Calibrate monthly' },
  { id: 'eq14', name: 'Digital pH Meter', category: 'Testing', summary: 'Electronic pH meter for precise readings. Useful for sensitive species and planted tanks.', difficulty_level: 'Moderate', recommended_tank_sizes: ['All tanks'], price_range: '$20-80', maintenance_frequency: 'Calibrate monthly, replace probe annually' },

  // Maintenance
  { id: 'eq15', name: 'Gravel Vacuum', category: 'Maintenance', summary: 'Siphon device for cleaning substrate and performing water changes. Essential maintenance tool.', difficulty_level: 'Easy', recommended_tank_sizes: ['All tanks'], price_range: '$15-40', maintenance_frequency: 'Clean after each use' },
  { id: 'eq16', name: 'Algae Scraper', category: 'Maintenance', summary: 'Tool for removing algae from glass walls. Magnetic versions work from outside the tank.', difficulty_level: 'Easy', recommended_tank_sizes: ['All tanks'], price_range: '$10-50', maintenance_frequency: 'Rinse after each use' },
  { id: 'eq17', name: 'Auto Top Off System', category: 'Automation', summary: 'Automatically replaces evaporated water to maintain water level. Great for reef tanks.', difficulty_level: 'Moderate', recommended_tank_sizes: ['20+ gallons'], price_range: '$50-200', maintenance_frequency: 'Monthly reservoir refill' },

  // Specialized Equipment
  { id: 'eq18', name: 'RO/DI Water System', category: 'Water Treatment', summary: 'Produces pure water by removing impurities. Essential for sensitive marine life.', difficulty_level: 'Moderate', recommended_tank_sizes: ['All tanks benefit'], price_range: '$100-300', maintenance_frequency: 'Filter replacement every 6-12 months' },
  { id: 'eq19', name: 'UV Sterilizer', category: 'Disease Prevention', summary: 'Uses UV light to kill pathogens and algae. Helps maintain water clarity and fish health.', difficulty_level: 'Moderate', recommended_tank_sizes: ['30+ gallons'], price_range: '$80-250', maintenance_frequency: 'Annual UV bulb replacement' },
  { id: 'eq20', name: 'Calcium Reactor', category: 'Reef Equipment', summary: 'Maintains calcium and alkalinity in reef tanks. Essential for SPS coral growth.', difficulty_level: 'Advanced', recommended_tank_sizes: ['Reef tanks 50+ gallons'], price_range: '$300-800', maintenance_frequency: 'Monthly media top-off' }
];
