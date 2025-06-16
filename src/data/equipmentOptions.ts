
export interface EquipmentOption {
  value: string;
  label: string;
  category: string;
  description?: string;
}

export const equipmentOptions: EquipmentOption[] = [
  // Lighting
  { value: 'led-reef-light', label: 'LED Reef Light', category: 'Lighting', description: 'Full spectrum LED lighting for corals' },
  { value: 't5-fluorescent', label: 'T5 Fluorescent Fixture', category: 'Lighting', description: 'Traditional T5 tube lighting' },
  { value: 'metal-halide', label: 'Metal Halide Fixture', category: 'Lighting', description: 'High intensity discharge lighting' },
  { value: 'hybrid-lighting', label: 'Hybrid LED/T5 Fixture', category: 'Lighting', description: 'Combination lighting system' },

  // Filtration
  { value: 'protein-skimmer', label: 'Protein Skimmer', category: 'Filtration', description: 'Removes dissolved organics' },
  { value: 'canister-filter', label: 'Canister Filter', category: 'Filtration', description: 'Mechanical and biological filtration' },
  { value: 'hob-filter', label: 'Hang-on-Back Filter', category: 'Filtration', description: 'External hang-on filter' },
  { value: 'sump', label: 'Sump System', category: 'Filtration', description: 'Additional water volume and filtration' },
  { value: 'refugium', label: 'Refugium', category: 'Filtration', description: 'Macroalgae and copepod cultivation' },
  { value: 'uv-sterilizer', label: 'UV Sterilizer', category: 'Filtration', description: 'Kills bacteria and parasites' },

  // Circulation
  { value: 'powerhead', label: 'Powerhead/Wavemaker', category: 'Circulation', description: 'Water movement and circulation' },
  { value: 'return-pump', label: 'Return Pump', category: 'Circulation', description: 'Main circulation pump' },
  { value: 'wave-maker', label: 'Controllable Wave Maker', category: 'Circulation', description: 'Programmable water movement' },

  // Heating & Cooling
  { value: 'aquarium-heater', label: 'Aquarium Heater', category: 'Heating', description: 'Maintains water temperature' },
  { value: 'titanium-heater', label: 'Titanium Heater', category: 'Heating', description: 'Corrosion-resistant heater' },
  { value: 'chiller', label: 'Aquarium Chiller', category: 'Cooling', description: 'Cools water temperature' },
  { value: 'cooling-fan', label: 'Cooling Fan', category: 'Cooling', description: 'Evaporative cooling' },

  // Testing & Monitoring
  { value: 'test-kit-master', label: 'Master Test Kit', category: 'Testing', description: 'Complete water parameter testing' },
  { value: 'ph-meter', label: 'Digital pH Meter', category: 'Testing', description: 'Accurate pH measurement' },
  { value: 'refractometer', label: 'Refractometer', category: 'Testing', description: 'Salinity measurement' },
  { value: 'tds-meter', label: 'TDS Meter', category: 'Testing', description: 'Total dissolved solids meter' },
  { value: 'thermometer', label: 'Digital Thermometer', category: 'Testing', description: 'Temperature monitoring' },

  // Dosing & Supplementation
  { value: 'dosing-pump', label: 'Dosing Pump', category: 'Supplementation', description: 'Automated chemical dosing' },
  { value: 'ato-system', label: 'Auto Top-Off (ATO)', category: 'Supplementation', description: 'Automatic water level maintenance' },
  { value: 'calcium-reactor', label: 'Calcium Reactor', category: 'Supplementation', description: 'Maintains calcium and alkalinity' },
  { value: 'kalkwasser-reactor', label: 'Kalkwasser Reactor', category: 'Supplementation', description: 'Calcium hydroxide dosing' },

  // Automation & Control
  { value: 'aquarium-controller', label: 'Aquarium Controller', category: 'Automation', description: 'Central system control' },
  { value: 'ph-controller', label: 'pH Controller', category: 'Automation', description: 'Automated pH regulation' },
  { value: 'timer-outlet', label: 'Digital Timer Outlet', category: 'Automation', description: 'Programmable power control' },

  // Substrate & Hardscape
  { value: 'live-sand', label: 'Live Sand', category: 'Substrate', description: 'Biological substrate' },
  { value: 'aragonite-sand', label: 'Aragonite Sand', category: 'Substrate', description: 'Calcium carbonate substrate' },
  { value: 'live-rock', label: 'Live Rock', category: 'Substrate', description: 'Biological filtration and structure' },
  { value: 'dry-rock', label: 'Dry Rock/Base Rock', category: 'Substrate', description: 'Aquascaping foundation' },

  // Maintenance
  { value: 'algae-scraper', label: 'Algae Scraper/Magnet', category: 'Maintenance', description: 'Glass cleaning tool' },
  { value: 'gravel-vacuum', label: 'Gravel Vacuum', category: 'Maintenance', description: 'Substrate cleaning' },
  { value: 'water-pump', label: 'Water Change Pump', category: 'Maintenance', description: 'Water change equipment' },
  { value: 'ro-di-system', label: 'RO/DI Water System', category: 'Maintenance', description: 'Pure water production' },
];

export const equipmentCategories = [
  'Lighting',
  'Filtration', 
  'Circulation',
  'Heating',
  'Cooling',
  'Testing',
  'Supplementation',
  'Automation',
  'Substrate',
  'Maintenance'
] as const;
