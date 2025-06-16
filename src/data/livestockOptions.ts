
export interface LivestockOption {
  value: string;
  label: string;
  category: 'Fish' | 'Coral' | 'Invertebrate' | 'Cleanup Crew';
  careLevel: 'Beginner' | 'Intermediate' | 'Advanced' | 'Expert';
  compatibility: string;
}

export const livestockOptions: LivestockOption[] = [
  // Popular Fish
  { value: 'ocellaris-clownfish', label: 'Ocellaris Clownfish', category: 'Fish', careLevel: 'Beginner', compatibility: 'Peaceful, reef safe' },
  { value: 'yellow-tang', label: 'Yellow Tang', category: 'Fish', careLevel: 'Intermediate', compatibility: 'Semi-aggressive, reef safe' },
  { value: 'royal-gramma', label: 'Royal Gramma', category: 'Fish', careLevel: 'Beginner', compatibility: 'Peaceful, reef safe' },
  { value: 'cardinals-fish', label: 'Banggai Cardinal', category: 'Fish', careLevel: 'Beginner', compatibility: 'Peaceful, reef safe' },
  { value: 'mandarin-dragonet', label: 'Mandarin Dragonet', category: 'Fish', careLevel: 'Expert', compatibility: 'Peaceful, reef safe' },
  { value: 'six-line-wrasse', label: 'Six Line Wrasse', category: 'Fish', careLevel: 'Intermediate', compatibility: 'Semi-aggressive, reef safe' },
  { value: 'flame-angelfish', label: 'Flame Angelfish', category: 'Fish', careLevel: 'Intermediate', compatibility: 'Semi-aggressive, reef safe with caution' },
  { value: 'powder-blue-tang', label: 'Powder Blue Tang', category: 'Fish', careLevel: 'Advanced', compatibility: 'Semi-aggressive, reef safe' },
  { value: 'firefish-goby', label: 'Firefish Goby', category: 'Fish', careLevel: 'Beginner', compatibility: 'Peaceful, reef safe' },
  { value: 'watchman-goby', label: 'Yellow Watchman Goby', category: 'Fish', careLevel: 'Beginner', compatibility: 'Peaceful, reef safe' },

  // Popular Corals - LPS
  { value: 'hammer-coral', label: 'Hammer Coral (Euphyllia)', category: 'Coral', careLevel: 'Intermediate', compatibility: 'Moderate lighting, medium flow' },
  { value: 'torch-coral', label: 'Torch Coral (Euphyllia)', category: 'Coral', careLevel: 'Intermediate', compatibility: 'Moderate lighting, medium flow' },
  { value: 'frogspawn-coral', label: 'Frogspawn Coral (Euphyllia)', category: 'Coral', careLevel: 'Intermediate', compatibility: 'Moderate lighting, medium flow' },
  { value: 'duncan-coral', label: 'Duncan Coral', category: 'Coral', careLevel: 'Beginner', compatibility: 'Low to moderate lighting, low flow' },
  { value: 'candy-cane-coral', label: 'Candy Cane Coral', category: 'Coral', careLevel: 'Beginner', compatibility: 'Low to moderate lighting, low flow' },
  { value: 'blastomussa-coral', label: 'Blastomussa Coral', category: 'Coral', careLevel: 'Beginner', compatibility: 'Low lighting, low flow' },

  // Popular Corals - SPS
  { value: 'acropora-coral', label: 'Acropora (Staghorn)', category: 'Coral', careLevel: 'Expert', compatibility: 'High lighting, high flow' },
  { value: 'montipora-coral', label: 'Montipora Coral', category: 'Coral', careLevel: 'Advanced', compatibility: 'High lighting, medium to high flow' },
  { value: 'birdsnest-coral', label: 'Birdsnest Coral', category: 'Coral', careLevel: 'Intermediate', compatibility: 'Moderate to high lighting, medium flow' },

  // Popular Corals - Soft
  { value: 'leather-coral', label: 'Leather Coral (Sarcophyton)', category: 'Coral', careLevel: 'Beginner', compatibility: 'Low to moderate lighting, medium flow' },
  { value: 'xenia-coral', label: 'Xenia Coral', category: 'Coral', careLevel: 'Beginner', compatibility: 'Moderate lighting, medium flow' },
  { value: 'mushroom-coral', label: 'Mushroom Coral (Rhodactis)', category: 'Coral', careLevel: 'Beginner', compatibility: 'Low to moderate lighting, low flow' },
  { value: 'zoanthids', label: 'Zoanthids (Zoas)', category: 'Coral', careLevel: 'Beginner', compatibility: 'Moderate lighting, medium flow' },
  { value: 'kenya-tree', label: 'Kenya Tree Coral', category: 'Coral', careLevel: 'Beginner', compatibility: 'Low to moderate lighting, medium flow' },

  // Invertebrates
  { value: 'cleaner-shrimp', label: 'Scarlet Skunk Cleaner Shrimp', category: 'Invertebrate', careLevel: 'Beginner', compatibility: 'Peaceful, reef safe' },
  { value: 'emerald-crab', label: 'Emerald Crab', category: 'Cleanup Crew', careLevel: 'Beginner', compatibility: 'Generally reef safe' },
  { value: 'hermit-crab', label: 'Blue Leg Hermit Crab', category: 'Cleanup Crew', careLevel: 'Beginner', compatibility: 'Reef safe' },
  { value: 'astrea-snail', label: 'Astrea Snail', category: 'Cleanup Crew', careLevel: 'Beginner', compatibility: 'Reef safe' },
  { value: 'turbo-snail', label: 'Turbo Snail', category: 'Cleanup Crew', careLevel: 'Beginner', compatibility: 'Reef safe' },
  { value: 'nassarius-snail', label: 'Nassarius Snail', category: 'Cleanup Crew', careLevel: 'Beginner', compatibility: 'Reef safe' },
  { value: 'serpent-star', label: 'Serpent Star', category: 'Invertebrate', careLevel: 'Intermediate', compatibility: 'Generally reef safe' },
];

export const livestockCategories = ['Fish', 'Coral', 'Invertebrate', 'Cleanup Crew'] as const;
