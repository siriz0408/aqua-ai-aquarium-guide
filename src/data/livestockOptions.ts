export interface LivestockOption {
  value: string;
  label: string;
  category: 'Fish' | 'Coral' | 'Invertebrate' | 'Cleanup Crew' | 'Plant';
  subcategory?: string;
  careLevel: 'Beginner' | 'Intermediate' | 'Advanced' | 'Expert';
  compatibility: string;
  scientificName?: string;
  tankType: 'Saltwater' | 'Freshwater' | 'Both';
  size?: string;
  minTankSize?: number;
}

export const livestockOptions: LivestockOption[] = [
  // === SALTWATER FISH ===
  // Clownfish
  { value: 'ocellaris-clownfish', label: 'Ocellaris Clownfish', category: 'Fish', subcategory: 'Clownfish', careLevel: 'Beginner', compatibility: 'Peaceful, reef safe', scientificName: 'Amphiprion ocellaris', tankType: 'Saltwater', size: '3"', minTankSize: 20 },
  { value: 'percula-clownfish', label: 'Percula Clownfish', category: 'Fish', subcategory: 'Clownfish', careLevel: 'Beginner', compatibility: 'Peaceful, reef safe', scientificName: 'Amphiprion percula', tankType: 'Saltwater', size: '3"', minTankSize: 20 },
  { value: 'tomato-clownfish', label: 'Tomato Clownfish', category: 'Fish', subcategory: 'Clownfish', careLevel: 'Beginner', compatibility: 'Semi-aggressive, reef safe', scientificName: 'Amphiprion frenatus', tankType: 'Saltwater', size: '5"', minTankSize: 30 },
  { value: 'clarkii-clownfish', label: 'Clarkii Clownfish', category: 'Fish', subcategory: 'Clownfish', careLevel: 'Beginner', compatibility: 'Semi-aggressive, reef safe', scientificName: 'Amphiprion clarkii', tankType: 'Saltwater', size: '6"', minTankSize: 40 },
  { value: 'maroon-clownfish', label: 'Maroon Clownfish', category: 'Fish', subcategory: 'Clownfish', careLevel: 'Intermediate', compatibility: 'Aggressive, reef safe', scientificName: 'Premnas biaculeatus', tankType: 'Saltwater', size: '6"', minTankSize: 50 },

  // Tangs
  { value: 'yellow-tang', label: 'Yellow Tang', category: 'Fish', subcategory: 'Tang', careLevel: 'Intermediate', compatibility: 'Semi-aggressive, reef safe', scientificName: 'Zebrasoma flavescens', tankType: 'Saltwater', size: '8"', minTankSize: 75 },
  { value: 'blue-hippo-tang', label: 'Blue Hippo Tang', category: 'Fish', subcategory: 'Tang', careLevel: 'Advanced', compatibility: 'Semi-aggressive, reef safe', scientificName: 'Paracanthurus hepatus', tankType: 'Saltwater', size: '12"', minTankSize: 125 },
  { value: 'powder-blue-tang', label: 'Powder Blue Tang', category: 'Fish', subcategory: 'Tang', careLevel: 'Advanced', compatibility: 'Semi-aggressive, reef safe', scientificName: 'Acanthurus leucosternon', tankType: 'Saltwater', size: '9"', minTankSize: 100 },
  { value: 'kole-tang', label: 'Kole Tang', category: 'Fish', subcategory: 'Tang', careLevel: 'Intermediate', compatibility: 'Semi-aggressive, reef safe', scientificName: 'Ctenochaetus strigosus', tankType: 'Saltwater', size: '7"', minTankSize: 70 },

  // Wrasses
  { value: 'six-line-wrasse', label: 'Six Line Wrasse', category: 'Fish', subcategory: 'Wrasse', careLevel: 'Intermediate', compatibility: 'Semi-aggressive, reef safe', scientificName: 'Pseudocheilinus hexataenia', tankType: 'Saltwater', size: '3"', minTankSize: 30 },
  { value: 'melanurus-wrasse', label: 'Melanurus Wrasse', category: 'Fish', subcategory: 'Wrasse', careLevel: 'Intermediate', compatibility: 'Semi-aggressive, reef safe', scientificName: 'Halichoeres melanurus', tankType: 'Saltwater', size: '5"', minTankSize: 55 },
  { value: 'fairy-wrasse', label: 'Fairy Wrasse', category: 'Fish', subcategory: 'Wrasse', careLevel: 'Intermediate', compatibility: 'Peaceful, reef safe', scientificName: 'Cirrhilabrus spp.', tankType: 'Saltwater', size: '4"', minTankSize: 40 },

  // Gobies
  { value: 'watchman-goby', label: 'Yellow Watchman Goby', category: 'Fish', subcategory: 'Goby', careLevel: 'Beginner', compatibility: 'Peaceful, reef safe', scientificName: 'Cryptocentrus cinctus', tankType: 'Saltwater', size: '4"', minTankSize: 20 },
  { value: 'firefish-goby', label: 'Firefish Goby', category: 'Fish', subcategory: 'Goby', careLevel: 'Beginner', compatibility: 'Peaceful, reef safe', scientificName: 'Nemateleotris magnifica', tankType: 'Saltwater', size: '3"', minTankSize: 20 },
  { value: 'clown-goby', label: 'Clown Goby', category: 'Fish', subcategory: 'Goby', careLevel: 'Beginner', compatibility: 'Peaceful, reef safe', scientificName: 'Gobiodon spp.', tankType: 'Saltwater', size: '1.5"', minTankSize: 10 },

  // Other Popular Marine Fish
  { value: 'royal-gramma', label: 'Royal Gramma', category: 'Fish', subcategory: 'Basslet', careLevel: 'Beginner', compatibility: 'Peaceful, reef safe', scientificName: 'Gramma loreto', tankType: 'Saltwater', size: '3"', minTankSize: 30 },
  { value: 'banggai-cardinal', label: 'Banggai Cardinal', category: 'Fish', subcategory: 'Cardinal', careLevel: 'Beginner', compatibility: 'Peaceful, reef safe', scientificName: 'Pterapogon kauderni', tankType: 'Saltwater', size: '3"', minTankSize: 30 },
  { value: 'mandarin-dragonet', label: 'Mandarin Dragonet', category: 'Fish', subcategory: 'Dragonet', careLevel: 'Expert', compatibility: 'Peaceful, reef safe', scientificName: 'Synchiropus splendidus', tankType: 'Saltwater', size: '3"', minTankSize: 30 },
  { value: 'flame-angelfish', label: 'Flame Angelfish', category: 'Fish', subcategory: 'Dwarf Angel', careLevel: 'Intermediate', compatibility: 'Semi-aggressive, reef safe with caution', scientificName: 'Centropyge loricula', tankType: 'Saltwater', size: '4"', minTankSize: 70 },

  // === SALTWATER CORALS ===
  // Soft Corals
  { value: 'green-star-polyps', label: 'Green Star Polyps (GSP)', category: 'Coral', subcategory: 'Soft Coral', careLevel: 'Beginner', compatibility: 'Low to moderate lighting, medium flow', scientificName: 'Briareum violacea', tankType: 'Saltwater' },
  { value: 'pulsing-xenia', label: 'Pulsing Xenia', category: 'Coral', subcategory: 'Soft Coral', careLevel: 'Beginner', compatibility: 'Moderate lighting, medium flow', scientificName: 'Xenia elongata', tankType: 'Saltwater' },
  { value: 'kenya-tree', label: 'Kenya Tree Coral', category: 'Coral', subcategory: 'Soft Coral', careLevel: 'Beginner', compatibility: 'Low to moderate lighting, medium flow', scientificName: 'Capnella sp.', tankType: 'Saltwater' },
  { value: 'leather-coral', label: 'Leather Coral (Sarcophyton)', category: 'Coral', subcategory: 'Soft Coral', careLevel: 'Beginner', compatibility: 'Low to moderate lighting, medium flow', scientificName: 'Sarcophyton sp.', tankType: 'Saltwater' },
  { value: 'mushroom-coral', label: 'Mushroom Coral (Rhodactis)', category: 'Coral', subcategory: 'Soft Coral', careLevel: 'Beginner', compatibility: 'Low to moderate lighting, low flow', scientificName: 'Rhodactis sp.', tankType: 'Saltwater' },
  { value: 'zoanthids', label: 'Zoanthids (Zoas)', category: 'Coral', subcategory: 'Soft Coral', careLevel: 'Beginner', compatibility: 'Moderate lighting, medium flow', scientificName: 'Zoanthus sp.', tankType: 'Saltwater' },

  // LPS Corals
  { value: 'hammer-coral', label: 'Hammer Coral (Euphyllia)', category: 'Coral', subcategory: 'LPS', careLevel: 'Intermediate', compatibility: 'Moderate lighting, medium flow', scientificName: 'Euphyllia ancora', tankType: 'Saltwater' },
  { value: 'torch-coral', label: 'Torch Coral (Euphyllia)', category: 'Coral', subcategory: 'LPS', careLevel: 'Intermediate', compatibility: 'Moderate lighting, medium flow', scientificName: 'Euphyllia glabrescens', tankType: 'Saltwater' },
  { value: 'frogspawn-coral', label: 'Frogspawn Coral (Euphyllia)', category: 'Coral', subcategory: 'LPS', careLevel: 'Intermediate', compatibility: 'Moderate lighting, medium flow', scientificName: 'Euphyllia divisa', tankType: 'Saltwater' },
  { value: 'candy-cane-coral', label: 'Candy Cane Coral', category: 'Coral', subcategory: 'LPS', careLevel: 'Beginner', compatibility: 'Low to moderate lighting, low flow', scientificName: 'Caulastrea furcata', tankType: 'Saltwater' },
  { value: 'duncan-coral', label: 'Duncan Coral', category: 'Coral', subcategory: 'LPS', careLevel: 'Beginner', compatibility: 'Low to moderate lighting, low flow', scientificName: 'Duncanopsammia axifuga', tankType: 'Saltwater' },
  { value: 'blastomussa-coral', label: 'Blastomussa Coral', category: 'Coral', subcategory: 'LPS', careLevel: 'Beginner', compatibility: 'Low lighting, low flow', scientificName: 'Blastomussa merleti', tankType: 'Saltwater' },

  // SPS Corals
  { value: 'acropora-coral', label: 'Acropora (Staghorn)', category: 'Coral', subcategory: 'SPS', careLevel: 'Expert', compatibility: 'High lighting, high flow', scientificName: 'Acropora sp.', tankType: 'Saltwater' },
  { value: 'montipora-coral', label: 'Montipora Coral', category: 'Coral', subcategory: 'SPS', careLevel: 'Advanced', compatibility: 'High lighting, medium to high flow', scientificName: 'Montipora sp.', tankType: 'Saltwater' },
  { value: 'birdsnest-coral', label: 'Birdsnest Coral', category: 'Coral', subcategory: 'SPS', careLevel: 'Intermediate', compatibility: 'Moderate to high lighting, medium flow', scientificName: 'Seriatopora hystrix', tankType: 'Saltwater' },

  // === SALTWATER INVERTEBRATES ===
  { value: 'cleaner-shrimp', label: 'Scarlet Skunk Cleaner Shrimp', category: 'Invertebrate', subcategory: 'Shrimp', careLevel: 'Beginner', compatibility: 'Peaceful, reef safe', scientificName: 'Lysmata amboinensis', tankType: 'Saltwater' },
  { value: 'fire-shrimp', label: 'Blood Red Fire Shrimp', category: 'Invertebrate', subcategory: 'Shrimp', careLevel: 'Intermediate', compatibility: 'Peaceful, reef safe', scientificName: 'Lysmata debelius', tankType: 'Saltwater' },
  { value: 'peppermint-shrimp', label: 'Peppermint Shrimp', category: 'Invertebrate', subcategory: 'Shrimp', careLevel: 'Beginner', compatibility: 'Peaceful, reef safe, eats Aiptasia', scientificName: 'Lysmata wurdemanni', tankType: 'Saltwater' },

  // === SALTWATER CLEANUP CREW ===
  { value: 'emerald-crab', label: 'Emerald Crab', category: 'Cleanup Crew', subcategory: 'Crab', careLevel: 'Beginner', compatibility: 'Generally reef safe', scientificName: 'Mithraculus sculptus', tankType: 'Saltwater' },
  { value: 'hermit-crab', label: 'Blue Leg Hermit Crab', category: 'Cleanup Crew', subcategory: 'Crab', careLevel: 'Beginner', compatibility: 'Reef safe', scientificName: 'Clibanarius tricolor', tankType: 'Saltwater' },
  { value: 'astrea-snail', label: 'Astrea Snail', category: 'Cleanup Crew', subcategory: 'Snail', careLevel: 'Beginner', compatibility: 'Reef safe', scientificName: 'Astraea tecta', tankType: 'Saltwater' },
  { value: 'turbo-snail', label: 'Turbo Snail', category: 'Cleanup Crew', subcategory: 'Snail', careLevel: 'Beginner', compatibility: 'Reef safe', scientificName: 'Turbo fluctuosus', tankType: 'Saltwater' },
  { value: 'nassarius-snail', label: 'Nassarius Snail', category: 'Cleanup Crew', subcategory: 'Snail', careLevel: 'Beginner', compatibility: 'Reef safe', scientificName: 'Nassarius vibex', tankType: 'Saltwater' },
  { value: 'serpent-star', label: 'Serpent Star', category: 'Cleanup Crew', subcategory: 'Starfish', careLevel: 'Intermediate', compatibility: 'Generally reef safe', scientificName: 'Ophioderma sp.', tankType: 'Saltwater' },

  // === FRESHWATER FISH ===
  // Community Fish
  { value: 'neon-tetra', label: 'Neon Tetra', category: 'Fish', subcategory: 'Tetra', careLevel: 'Beginner', compatibility: 'Peaceful, schooling fish', scientificName: 'Paracheirodon innesi', tankType: 'Freshwater', size: '1.2"', minTankSize: 10 },
  { value: 'cardinal-tetra', label: 'Cardinal Tetra', category: 'Fish', subcategory: 'Tetra', careLevel: 'Beginner', compatibility: 'Peaceful, schooling fish', scientificName: 'Paracheirodon axelrodi', tankType: 'Freshwater', size: '1.5"', minTankSize: 20 },
  { value: 'ember-tetra', label: 'Ember Tetra', category: 'Fish', subcategory: 'Tetra', careLevel: 'Beginner', compatibility: 'Peaceful, schooling fish', scientificName: 'Hyphessobrycon amandae', tankType: 'Freshwater', size: '0.8"', minTankSize: 10 },
  { value: 'harlequin-rasbora', label: 'Harlequin Rasbora', category: 'Fish', subcategory: 'Rasbora', careLevel: 'Beginner', compatibility: 'Peaceful, schooling fish', scientificName: 'Trigonostigma heteromorpha', tankType: 'Freshwater', size: '2"', minTankSize: 10 },
  { value: 'zebra-danio', label: 'Zebra Danio', category: 'Fish', subcategory: 'Danio', careLevel: 'Beginner', compatibility: 'Peaceful, active schooling fish', scientificName: 'Danio rerio', tankType: 'Freshwater', size: '2"', minTankSize: 10 },
  { value: 'guppy', label: 'Guppy', category: 'Fish', subcategory: 'Livebearer', careLevel: 'Beginner', compatibility: 'Peaceful, community fish', scientificName: 'Poecilia reticulata', tankType: 'Freshwater', size: '2.5"', minTankSize: 10 },
  { value: 'molly', label: 'Molly', category: 'Fish', subcategory: 'Livebearer', careLevel: 'Beginner', compatibility: 'Peaceful, community fish', scientificName: 'Poecilia sphenops', tankType: 'Freshwater', size: '4"', minTankSize: 20 },
  { value: 'platy', label: 'Platy', category: 'Fish', subcategory: 'Livebearer', careLevel: 'Beginner', compatibility: 'Peaceful, community fish', scientificName: 'Xiphophorus maculatus', tankType: 'Freshwater', size: '2.5"', minTankSize: 10 },

  // Centerpiece Fish
  { value: 'betta-fish', label: 'Betta Fish', category: 'Fish', subcategory: 'Betta', careLevel: 'Beginner', compatibility: 'Aggressive to other bettas, peaceful with others', scientificName: 'Betta splendens', tankType: 'Freshwater', size: '3"', minTankSize: 5 },
  { value: 'dwarf-gourami', label: 'Dwarf Gourami', category: 'Fish', subcategory: 'Gourami', careLevel: 'Intermediate', compatibility: 'Peaceful, community fish', scientificName: 'Trichogaster lalius', tankType: 'Freshwater', size: '3.5"', minTankSize: 20 },
  { value: 'angelfish', label: 'Angelfish', category: 'Fish', subcategory: 'Cichlid', careLevel: 'Intermediate', compatibility: 'Semi-aggressive, community with larger fish', scientificName: 'Pterophyllum scalare', tankType: 'Freshwater', size: '6"', minTankSize: 55 },

  // Cichlids
  { value: 'german-blue-ram', label: 'German Blue Ram', category: 'Fish', subcategory: 'Cichlid', careLevel: 'Intermediate', compatibility: 'Peaceful dwarf cichlid', scientificName: 'Mikrogeophagus ramirezi', tankType: 'Freshwater', size: '3"', minTankSize: 20 },
  { value: 'bolivian-ram', label: 'Bolivian Ram', category: 'Fish', subcategory: 'Cichlid', careLevel: 'Intermediate', compatibility: 'Peaceful dwarf cichlid', scientificName: 'Mikrogeophagus altispinosus', tankType: 'Freshwater', size: '3.5"', minTankSize: 30 },
  { value: 'kribensis', label: 'Kribensis', category: 'Fish', subcategory: 'Cichlid', careLevel: 'Intermediate', compatibility: 'Semi-aggressive dwarf cichlid', scientificName: 'Pelvicachromis pulcher', tankType: 'Freshwater', size: '4"', minTankSize: 40 },

  // Bottom Dwellers
  { value: 'cory-catfish', label: 'Corydoras Catfish', category: 'Fish', subcategory: 'Catfish', careLevel: 'Beginner', compatibility: 'Peaceful, bottom dweller', scientificName: 'Corydoras sp.', tankType: 'Freshwater', size: '3"', minTankSize: 20 },
  { value: 'bristlenose-pleco', label: 'Bristlenose Pleco', category: 'Fish', subcategory: 'Pleco', careLevel: 'Beginner', compatibility: 'Peaceful, algae eater', scientificName: 'Ancistrus cirrhosus', tankType: 'Freshwater', size: '6"', minTankSize: 40 },
  { value: 'otocinclus', label: 'Otocinclus', category: 'Fish', subcategory: 'Catfish', careLevel: 'Intermediate', compatibility: 'Peaceful, algae eater', scientificName: 'Otocinclus affinis', tankType: 'Freshwater', size: '2"', minTankSize: 10 },
  { value: 'kuhli-loach', label: 'Kuhli Loach', category: 'Fish', subcategory: 'Loach', careLevel: 'Intermediate', compatibility: 'Peaceful, bottom dweller', scientificName: 'Pangio kuhlii', tankType: 'Freshwater', size: '4"', minTankSize: 20 },

  // === FRESHWATER PLANTS ===
  { value: 'java-fern', label: 'Java Fern', category: 'Plant', subcategory: 'Low Light', careLevel: 'Beginner', compatibility: 'Low light, slow growing', scientificName: 'Microsorum pteropus', tankType: 'Freshwater' },
  { value: 'anubias-nana', label: 'Anubias Nana', category: 'Plant', subcategory: 'Low Light', careLevel: 'Beginner', compatibility: 'Low light, rhizome plant', scientificName: 'Anubias barteri var. nana', tankType: 'Freshwater' },
  { value: 'java-moss', label: 'Java Moss', category: 'Plant', subcategory: 'Low Light', careLevel: 'Beginner', compatibility: 'Low light, carpeting moss', scientificName: 'Taxiphyllum barbieri', tankType: 'Freshwater' },
  { value: 'amazon-sword', label: 'Amazon Sword', category: 'Plant', subcategory: 'Moderate Light', careLevel: 'Intermediate', compatibility: 'Moderate light, background plant', scientificName: 'Echinodorus amazonicus', tankType: 'Freshwater' },
  { value: 'vallisneria', label: 'Vallisneria', category: 'Plant', subcategory: 'Moderate Light', careLevel: 'Beginner', compatibility: 'Moderate light, background plant', scientificName: 'Vallisneria spiralis', tankType: 'Freshwater' },

  // === FRESHWATER INVERTEBRATES ===
  { value: 'cherry-shrimp', label: 'Cherry Shrimp', category: 'Invertebrate', subcategory: 'Shrimp', careLevel: 'Beginner', compatibility: 'Peaceful, algae eater', scientificName: 'Neocaridina davidi', tankType: 'Freshwater' },
  { value: 'amano-shrimp', label: 'Amano Shrimp', category: 'Invertebrate', subcategory: 'Shrimp', careLevel: 'Intermediate', compatibility: 'Peaceful, excellent algae eater', scientificName: 'Caridina multidentata', tankType: 'Freshwater' },
  { value: 'nerite-snail', label: 'Nerite Snail', category: 'Cleanup Crew', subcategory: 'Snail', careLevel: 'Beginner', compatibility: 'Peaceful, algae eater', scientificName: 'Neritina natalensis', tankType: 'Both' },
  { value: 'mystery-snail', label: 'Mystery Snail', category: 'Cleanup Crew', subcategory: 'Snail', careLevel: 'Beginner', compatibility: 'Peaceful, scavenger', scientificName: 'Pomacea bridgesii', tankType: 'Freshwater' }
];

export const livestockCategories = ['Fish', 'Coral', 'Invertebrate', 'Cleanup Crew', 'Plant'] as const;

export const livestockSubcategories = {
  Fish: ['Clownfish', 'Tang', 'Wrasse', 'Goby', 'Basslet', 'Cardinal', 'Dragonet', 'Dwarf Angel', 'Tetra', 'Rasbora', 'Danio', 'Livebearer', 'Betta', 'Gourami', 'Cichlid', 'Catfish', 'Pleco', 'Loach'],
  Coral: ['Soft Coral', 'LPS', 'SPS', 'Non-Photosynthetic'],
  Invertebrate: ['Shrimp', 'Crab', 'Other'],
  'Cleanup Crew': ['Snail', 'Crab', 'Starfish', 'Urchin'],
  Plant: ['Low Light', 'Moderate Light', 'High Light', 'Floating', 'Carpeting']
};

export const tankTypes = ['Saltwater', 'Freshwater', 'Both'] as const;
