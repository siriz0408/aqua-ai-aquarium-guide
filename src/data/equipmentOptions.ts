
export interface EquipmentOption {
  value: string;
  label: string;
  category: string;
  subcategory?: string;
  description?: string;
  difficulty?: 'Beginner' | 'Intermediate' | 'Advanced' | 'Expert';
  tankType?: 'Saltwater' | 'Freshwater' | 'Both';
  priceRange?: 'Budget' | 'Mid-Range' | 'Premium' | 'Luxury';
}

export const equipmentOptions: EquipmentOption[] = [
  // === BASIC SYSTEM COMPONENTS ===
  { value: 'glass-aquarium', label: 'Glass Aquarium Tank', category: 'Tank System', subcategory: 'Tank', description: 'Standard glass aquarium tank', difficulty: 'Beginner', tankType: 'Both', priceRange: 'Budget' },
  { value: 'acrylic-aquarium', label: 'Acrylic Aquarium Tank', category: 'Tank System', subcategory: 'Tank', description: 'Lightweight acrylic tank', difficulty: 'Beginner', tankType: 'Both', priceRange: 'Mid-Range' },
  { value: 'aquarium-stand', label: 'Aquarium Stand', category: 'Tank System', subcategory: 'Support', description: 'Sturdy aquarium cabinet or stand', difficulty: 'Beginner', tankType: 'Both', priceRange: 'Budget' },
  { value: 'tank-lid', label: 'Tank Lid/Canopy', category: 'Tank System', subcategory: 'Cover', description: 'Protective tank cover', difficulty: 'Beginner', tankType: 'Both', priceRange: 'Budget' },
  { value: 'sump-tank', label: 'Sump Tank', category: 'Tank System', subcategory: 'Filtration Chamber', description: 'Additional filtration volume', difficulty: 'Advanced', tankType: 'Both', priceRange: 'Mid-Range' },

  // === FILTRATION ===
  { value: 'hob-filter', label: 'Hang-on-Back (HOB) Filter', category: 'Filtration', subcategory: 'Mechanical', description: 'External hang-on filter', difficulty: 'Beginner', tankType: 'Both', priceRange: 'Budget' },
  { value: 'canister-filter', label: 'Canister Filter', category: 'Filtration', subcategory: 'Mechanical', description: 'High-capacity external filter', difficulty: 'Intermediate', tankType: 'Both', priceRange: 'Mid-Range' },
  { value: 'sponge-filter', label: 'Sponge Filter', category: 'Filtration', subcategory: 'Biological', description: 'Gentle biological filtration', difficulty: 'Beginner', tankType: 'Both', priceRange: 'Budget' },
  { value: 'internal-filter', label: 'Internal Power Filter', category: 'Filtration', subcategory: 'Mechanical', description: 'Submersible internal filter', difficulty: 'Beginner', tankType: 'Both', priceRange: 'Budget' },
  { value: 'protein-skimmer', label: 'Protein Skimmer', category: 'Filtration', subcategory: 'Protein Removal', description: 'Removes dissolved organics', difficulty: 'Intermediate', tankType: 'Saltwater', priceRange: 'Mid-Range' },
  { value: 'media-reactor', label: 'Media Reactor', category: 'Filtration', subcategory: 'Chemical', description: 'Carbon, GFO, biopellet reactor', difficulty: 'Intermediate', tankType: 'Both', priceRange: 'Mid-Range' },
  { value: 'uv-sterilizer', label: 'UV Sterilizer', category: 'Filtration', subcategory: 'Sterilization', description: 'Kills bacteria and parasites', difficulty: 'Intermediate', tankType: 'Both', priceRange: 'Mid-Range' },

  // Filter Media
  { value: 'activated-carbon', label: 'Activated Carbon', category: 'Filter Media', subcategory: 'Chemical', description: 'Removes chemicals and odors', difficulty: 'Beginner', tankType: 'Both', priceRange: 'Budget' },
  { value: 'ceramic-rings', label: 'Ceramic Bio Media', category: 'Filter Media', subcategory: 'Biological', description: 'Biological filtration media', difficulty: 'Beginner', tankType: 'Both', priceRange: 'Budget' },
  { value: 'filter-floss', label: 'Filter Floss/Pad', category: 'Filter Media', subcategory: 'Mechanical', description: 'Mechanical filtration media', difficulty: 'Beginner', tankType: 'Both', priceRange: 'Budget' },
  { value: 'purigen', label: 'Purigen', category: 'Filter Media', subcategory: 'Chemical', description: 'Organic waste removal resin', difficulty: 'Intermediate', tankType: 'Both', priceRange: 'Mid-Range' },

  // === WATER MOVEMENT ===
  { value: 'air-pump', label: 'Air Pump', category: 'Water Movement', subcategory: 'Aeration', description: 'Provides air for stones and sponges', difficulty: 'Beginner', tankType: 'Both', priceRange: 'Budget' },
  { value: 'air-stone', label: 'Air Stone', category: 'Water Movement', subcategory: 'Aeration', description: 'Creates fine air bubbles', difficulty: 'Beginner', tankType: 'Both', priceRange: 'Budget' },
  { value: 'powerhead', label: 'Powerhead', category: 'Water Movement', subcategory: 'Circulation', description: 'Water movement pump', difficulty: 'Beginner', tankType: 'Both', priceRange: 'Budget' },
  { value: 'wave-maker', label: 'Wave Maker', category: 'Water Movement', subcategory: 'Circulation', description: 'Programmable water movement', difficulty: 'Intermediate', tankType: 'Both', priceRange: 'Mid-Range' },
  { value: 'return-pump', label: 'Return Pump', category: 'Water Movement', subcategory: 'Circulation', description: 'Main sump circulation pump', difficulty: 'Advanced', tankType: 'Both', priceRange: 'Mid-Range' },

  // === HEATING & COOLING ===
  { value: 'submersible-heater', label: 'Submersible Heater', category: 'Temperature Control', subcategory: 'Heating', description: 'Maintains water temperature', difficulty: 'Beginner', tankType: 'Both', priceRange: 'Budget' },
  { value: 'titanium-heater', label: 'Titanium Heater', category: 'Temperature Control', subcategory: 'Heating', description: 'Corrosion-resistant heater', difficulty: 'Intermediate', tankType: 'Saltwater', priceRange: 'Mid-Range' },
  { value: 'inline-heater', label: 'Inline Heater', category: 'Temperature Control', subcategory: 'Heating', description: 'External inline heating', difficulty: 'Advanced', tankType: 'Both', priceRange: 'Premium' },
  { value: 'aquarium-chiller', label: 'Aquarium Chiller', category: 'Temperature Control', subcategory: 'Cooling', description: 'Cools water temperature', difficulty: 'Advanced', tankType: 'Both', priceRange: 'Luxury' },
  { value: 'cooling-fan', label: 'Cooling Fan', category: 'Temperature Control', subcategory: 'Cooling', description: 'Evaporative cooling', difficulty: 'Beginner', tankType: 'Both', priceRange: 'Budget' },
  { value: 'temperature-controller', label: 'Temperature Controller', category: 'Temperature Control', subcategory: 'Automation', description: 'Automated temperature control', difficulty: 'Intermediate', tankType: 'Both', priceRange: 'Mid-Range' },

  // === LIGHTING ===
  { value: 'led-aquarium-light', label: 'LED Aquarium Light', category: 'Lighting', subcategory: 'LED', description: 'Energy-efficient LED lighting', difficulty: 'Beginner', tankType: 'Both', priceRange: 'Mid-Range' },
  { value: 'led-reef-light', label: 'LED Reef Light', category: 'Lighting', subcategory: 'LED', description: 'Full spectrum LED for corals', difficulty: 'Intermediate', tankType: 'Saltwater', priceRange: 'Premium' },
  { value: 't5-fluorescent', label: 'T5 Fluorescent Fixture', category: 'Lighting', subcategory: 'Fluorescent', description: 'Traditional T5 tube lighting', difficulty: 'Intermediate', tankType: 'Both', priceRange: 'Mid-Range' },
  { value: 'metal-halide', label: 'Metal Halide Fixture', category: 'Lighting', subcategory: 'HID', description: 'High intensity discharge lighting', difficulty: 'Advanced', tankType: 'Saltwater', priceRange: 'Premium' },
  { value: 'hybrid-lighting', label: 'Hybrid LED/T5 Fixture', category: 'Lighting', subcategory: 'Hybrid', description: 'Combination lighting system', difficulty: 'Advanced', tankType: 'Both', priceRange: 'Premium' },
  { value: 'par-meter', label: 'PAR Meter', category: 'Lighting', subcategory: 'Testing', description: 'Measures light intensity for corals', difficulty: 'Advanced', tankType: 'Saltwater', priceRange: 'Luxury' },

  // === WATER QUALITY & TESTING ===
  { value: 'ammonia-test-kit', label: 'Ammonia Test Kit', category: 'Water Testing', subcategory: 'Basic Parameters', description: 'Tests for toxic ammonia', difficulty: 'Beginner', tankType: 'Both', priceRange: 'Budget' },
  { value: 'nitrite-test-kit', label: 'Nitrite Test Kit', category: 'Water Testing', subcategory: 'Basic Parameters', description: 'Tests for nitrite levels', difficulty: 'Beginner', tankType: 'Both', priceRange: 'Budget' },
  { value: 'nitrate-test-kit', label: 'Nitrate Test Kit', category: 'Water Testing', subcategory: 'Basic Parameters', description: 'Tests for nitrate accumulation', difficulty: 'Beginner', tankType: 'Both', priceRange: 'Budget' },
  { value: 'ph-test-kit', label: 'pH Test Kit', category: 'Water Testing', subcategory: 'Basic Parameters', description: 'Measures water acidity/alkalinity', difficulty: 'Beginner', tankType: 'Both', priceRange: 'Budget' },
  { value: 'master-test-kit', label: 'Master Test Kit', category: 'Water Testing', subcategory: 'Complete Testing', description: 'Complete water parameter testing', difficulty: 'Beginner', tankType: 'Both', priceRange: 'Mid-Range' },
  { value: 'refractometer', label: 'Refractometer', category: 'Water Testing', subcategory: 'Salinity', description: 'Accurate salinity measurement', difficulty: 'Intermediate', tankType: 'Saltwater', priceRange: 'Mid-Range' },
  { value: 'hydrometer', label: 'Hydrometer', category: 'Water Testing', subcategory: 'Salinity', description: 'Basic salinity measurement', difficulty: 'Beginner', tankType: 'Saltwater', priceRange: 'Budget' },
  { value: 'digital-ph-meter', label: 'Digital pH Meter', category: 'Water Testing', subcategory: 'Advanced Testing', description: 'Precise pH measurement', difficulty: 'Intermediate', tankType: 'Both', priceRange: 'Mid-Range' },
  { value: 'tds-meter', label: 'TDS Meter', category: 'Water Testing', subcategory: 'Water Quality', description: 'Total dissolved solids meter', difficulty: 'Intermediate', tankType: 'Both', priceRange: 'Budget' },
  { value: 'ro-di-system', label: 'RO/DI Water System', category: 'Water Testing', subcategory: 'Water Purification', description: 'Pure water production', difficulty: 'Intermediate', tankType: 'Both', priceRange: 'Mid-Range' },

  // === MAINTENANCE TOOLS ===
  { value: 'gravel-vacuum', label: 'Gravel Vacuum', category: 'Maintenance', subcategory: 'Cleaning', description: 'Substrate cleaning tool', difficulty: 'Beginner', tankType: 'Both', priceRange: 'Budget' },
  { value: 'python-system', label: 'Python Water Change System', category: 'Maintenance', subcategory: 'Water Changes', description: 'No-spill water change system', difficulty: 'Intermediate', tankType: 'Both', priceRange: 'Mid-Range' },
  { value: 'algae-scraper', label: 'Algae Scraper/Magnet', category: 'Maintenance', subcategory: 'Cleaning', description: 'Glass cleaning tool', difficulty: 'Beginner', tankType: 'Both', priceRange: 'Budget' },
  { value: 'razor-scraper', label: 'Razor Blade Scraper', category: 'Maintenance', subcategory: 'Cleaning', description: 'Removes stubborn algae', difficulty: 'Beginner', tankType: 'Both', priceRange: 'Budget' },
  { value: 'aquarium-net', label: 'Aquarium Net', category: 'Maintenance', subcategory: 'Fish Handling', description: 'Fish catching and moving', difficulty: 'Beginner', tankType: 'Both', priceRange: 'Budget' },
  { value: 'water-conditioner', label: 'Water Conditioner', category: 'Maintenance', subcategory: 'Water Treatment', description: 'Dechlorinator for tap water', difficulty: 'Beginner', tankType: 'Both', priceRange: 'Budget' },

  // === AUTOMATION & MONITORING ===
  { value: 'ato-system', label: 'Auto Top-Off (ATO)', category: 'Automation', subcategory: 'Water Level', description: 'Automatic water level maintenance', difficulty: 'Intermediate', tankType: 'Both', priceRange: 'Mid-Range' },
  { value: 'dosing-pump', label: 'Dosing Pump', category: 'Automation', subcategory: 'Chemical Dosing', description: 'Automated chemical dosing', difficulty: 'Advanced', tankType: 'Both', priceRange: 'Premium' },
  { value: 'aquarium-controller', label: 'Aquarium Controller', category: 'Automation', subcategory: 'System Control', description: 'Central system control hub', difficulty: 'Expert', tankType: 'Both', priceRange: 'Luxury' },
  { value: 'ph-controller', label: 'pH Controller', category: 'Automation', subcategory: 'Chemical Control', description: 'Automated pH regulation', difficulty: 'Advanced', tankType: 'Both', priceRange: 'Premium' },
  { value: 'timer-outlet', label: 'Digital Timer Outlet', category: 'Automation', subcategory: 'Power Control', description: 'Programmable power control', difficulty: 'Beginner', tankType: 'Both', priceRange: 'Budget' },
  { value: 'automatic-feeder', label: 'Automatic Feeder', category: 'Automation', subcategory: 'Feeding', description: 'Scheduled fish feeding', difficulty: 'Intermediate', tankType: 'Both', priceRange: 'Mid-Range' },

  // === FOOD & FEEDING ===
  { value: 'flake-food', label: 'Flake Food', category: 'Food & Feeding', subcategory: 'Dry Food', description: 'Basic staple fish food', difficulty: 'Beginner', tankType: 'Both', priceRange: 'Budget' },
  { value: 'pellet-food', label: 'Pellet Food', category: 'Food & Feeding', subcategory: 'Dry Food', description: 'Sinking or floating pellets', difficulty: 'Beginner', tankType: 'Both', priceRange: 'Budget' },
  { value: 'frozen-food', label: 'Frozen Foods', category: 'Food & Feeding', subcategory: 'Frozen Food', description: 'Brine shrimp, mysis, bloodworms', difficulty: 'Intermediate', tankType: 'Both', priceRange: 'Mid-Range' },
  { value: 'coral-food', label: 'Coral Food', category: 'Food & Feeding', subcategory: 'Coral Nutrition', description: 'Reef-Roids, phytoplankton', difficulty: 'Intermediate', tankType: 'Saltwater', priceRange: 'Mid-Range' },
  { value: 'seaweed-sheets', label: 'Seaweed Sheets', category: 'Food & Feeding', subcategory: 'Herbivore Food', description: 'Nori for tangs and algae eaters', difficulty: 'Beginner', tankType: 'Both', priceRange: 'Budget' },
  { value: 'feeding-tongs', label: 'Feeding Tongs', category: 'Food & Feeding', subcategory: 'Feeding Tools', description: 'Precise food placement', difficulty: 'Beginner', tankType: 'Both', priceRange: 'Budget' },
  { value: 'target-feeder', label: 'Target Feeder', category: 'Food & Feeding', subcategory: 'Feeding Tools', description: 'Pipette or turkey baster', difficulty: 'Beginner', tankType: 'Both', priceRange: 'Budget' },

  // === SUBSTRATE & HARDSCAPE ===
  { value: 'aragonite-sand', label: 'Aragonite Sand', category: 'Substrate & Hardscape', subcategory: 'Marine Substrate', description: 'Calcium carbonate substrate', difficulty: 'Beginner', tankType: 'Saltwater', priceRange: 'Budget' },
  { value: 'live-sand', label: 'Live Sand', category: 'Substrate & Hardscape', subcategory: 'Marine Substrate', description: 'Biological substrate with bacteria', difficulty: 'Intermediate', tankType: 'Saltwater', priceRange: 'Mid-Range' },
  { value: 'aquarium-gravel', label: 'Aquarium Gravel', category: 'Substrate & Hardscape', subcategory: 'Freshwater Substrate', description: 'Colored or natural gravel', difficulty: 'Beginner', tankType: 'Freshwater', priceRange: 'Budget' },
  { value: 'aqua-soil', label: 'Aqua Soil', category: 'Substrate & Hardscape', subcategory: 'Plant Substrate', description: 'Nutrient-rich planted tank substrate', difficulty: 'Intermediate', tankType: 'Freshwater', priceRange: 'Mid-Range' },
  { value: 'live-rock', label: 'Live Rock', category: 'Substrate & Hardscape', subcategory: 'Marine Hardscape', description: 'Biological filtration and structure', difficulty: 'Intermediate', tankType: 'Saltwater', priceRange: 'Premium' },
  { value: 'dry-rock', label: 'Dry Rock/Base Rock', category: 'Substrate & Hardscape', subcategory: 'Marine Hardscape', description: 'Aquascaping foundation', difficulty: 'Beginner', tankType: 'Saltwater', priceRange: 'Mid-Range' },
  { value: 'driftwood', label: 'Driftwood', category: 'Substrate & Hardscape', subcategory: 'Natural Decor', description: 'Natural wood decoration', difficulty: 'Beginner', tankType: 'Freshwater', priceRange: 'Mid-Range' },
  { value: 'dragon-stone', label: 'Dragon Stone', category: 'Substrate & Hardscape', subcategory: 'Natural Decor', description: 'Ohko stone for aquascaping', difficulty: 'Beginner', tankType: 'Freshwater', priceRange: 'Mid-Range' },

  // === SPECIALIZED MARINE EQUIPMENT ===
  { value: 'calcium-reactor', label: 'Calcium Reactor', category: 'Marine Specialized', subcategory: 'Reef Chemistry', description: 'Maintains calcium and alkalinity', difficulty: 'Expert', tankType: 'Saltwater', priceRange: 'Luxury' },
  { value: 'kalkwasser-reactor', label: 'Kalkwasser Reactor', category: 'Marine Specialized', subcategory: 'Reef Chemistry', description: 'Calcium hydroxide dosing', difficulty: 'Advanced', tankType: 'Saltwater', priceRange: 'Premium' },
  { value: 'salt-mix', label: 'Marine Salt Mix', category: 'Marine Specialized', subcategory: 'Water Preparation', description: 'Instant Ocean, Red Sea salt', difficulty: 'Beginner', tankType: 'Saltwater', priceRange: 'Budget' },
  { value: 'mixing-container', label: 'Salt Mixing Container', category: 'Marine Specialized', subcategory: 'Water Preparation', description: 'Container with heater and powerhead', difficulty: 'Intermediate', tankType: 'Saltwater', priceRange: 'Mid-Range' },
  { value: 'coral-glue', label: 'Coral Glue/Epoxy', category: 'Marine Specialized', subcategory: 'Coral Care', description: 'Underwater adhesive for corals', difficulty: 'Intermediate', tankType: 'Saltwater', priceRange: 'Budget' },
  { value: 'frag-tools', label: 'Coral Frag Tools', category: 'Marine Specialized', subcategory: 'Coral Care', description: 'Bone cutters, plugs, racks', difficulty: 'Advanced', tankType: 'Saltwater', priceRange: 'Mid-Range' },

  // === PLANTED TANK EQUIPMENT ===
  { value: 'co2-system', label: 'CO2 System', category: 'Planted Tank', subcategory: 'Plant Growth', description: 'Carbon dioxide injection system', difficulty: 'Advanced', tankType: 'Freshwater', priceRange: 'Premium' },
  { value: 'co2-diffuser', label: 'CO2 Diffuser', category: 'Planted Tank', subcategory: 'Plant Growth', description: 'Dissolves CO2 into water', difficulty: 'Intermediate', tankType: 'Freshwater', priceRange: 'Budget' },
  { value: 'bubble-counter', label: 'CO2 Bubble Counter', category: 'Planted Tank', subcategory: 'Plant Growth', description: 'Monitors CO2 flow rate', difficulty: 'Intermediate', tankType: 'Freshwater', priceRange: 'Budget' },
  { value: 'plant-fertilizer', label: 'Liquid Plant Fertilizer', category: 'Planted Tank', subcategory: 'Plant Nutrition', description: 'Essential nutrients for plants', difficulty: 'Beginner', tankType: 'Freshwater', priceRange: 'Budget' },
  { value: 'root-tabs', label: 'Root Tabs', category: 'Planted Tank', subcategory: 'Plant Nutrition', description: 'Substrate fertilizer tablets', difficulty: 'Beginner', tankType: 'Freshwater', priceRange: 'Budget' }
];

export const equipmentCategories = [
  'Tank System',
  'Filtration',
  'Filter Media',
  'Water Movement',
  'Temperature Control',
  'Lighting',
  'Water Testing',
  'Maintenance',
  'Automation',
  'Food & Feeding',
  'Substrate & Hardscape',
  'Marine Specialized',
  'Planted Tank'
] as const;

export const equipmentSubcategories = {
  'Tank System': ['Tank', 'Support', 'Cover', 'Filtration Chamber'],
  'Filtration': ['Mechanical', 'Biological', 'Chemical', 'Protein Removal', 'Sterilization'],
  'Filter Media': ['Mechanical', 'Biological', 'Chemical'],
  'Water Movement': ['Aeration', 'Circulation'],
  'Temperature Control': ['Heating', 'Cooling', 'Automation'],
  'Lighting': ['LED', 'Fluorescent', 'HID', 'Hybrid', 'Testing'],
  'Water Testing': ['Basic Parameters', 'Complete Testing', 'Salinity', 'Advanced Testing', 'Water Quality', 'Water Purification'],
  'Maintenance': ['Cleaning', 'Water Changes', 'Fish Handling', 'Water Treatment'],
  'Automation': ['Water Level', 'Chemical Dosing', 'System Control', 'Chemical Control', 'Power Control', 'Feeding'],
  'Food & Feeding': ['Dry Food', 'Frozen Food', 'Coral Nutrition', 'Herbivore Food', 'Feeding Tools'],
  'Substrate & Hardscape': ['Marine Substrate', 'Freshwater Substrate', 'Plant Substrate', 'Marine Hardscape', 'Natural Decor'],
  'Marine Specialized': ['Reef Chemistry', 'Water Preparation', 'Coral Care'],
  'Planted Tank': ['Plant Growth', 'Plant Nutrition']
};

export const difficultyLevels = ['Beginner', 'Intermediate', 'Advanced', 'Expert'] as const;
export const priceRanges = ['Budget', 'Mid-Range', 'Premium', 'Luxury'] as const;
