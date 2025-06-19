
export interface SaltMix {
  id: string;
  name: string;
  brand: string;
  parameters: {
    salinity: number;
    calcium: number;
    alkalinity: number;
    magnesium: number;
    ph: number;
  };
  costPerGallon: number;
  description?: string;
}

export const saltMixes: SaltMix[] = [
  {
    id: 'red-sea-coral-pro',
    name: 'Coral Pro Salt',
    brand: 'Red Sea',
    parameters: {
      salinity: 1.025,
      calcium: 440,
      alkalinity: 12.2,
      magnesium: 1340,
      ph: 8.3
    },
    costPerGallon: 0.52,
    description: 'Enhanced levels for SPS corals'
  },
  {
    id: 'instant-ocean-reef',
    name: 'Reef Crystals',
    brand: 'Instant Ocean',
    parameters: {
      salinity: 1.025,
      calcium: 420,
      alkalinity: 11.5,
      magnesium: 1320,
      ph: 8.2
    },
    costPerGallon: 0.38,
    description: 'Enhanced calcium and trace elements'
  },
  {
    id: 'tropic-marin-pro',
    name: 'Pro-Reef Salt',
    brand: 'Tropic Marin',
    parameters: {
      salinity: 1.025,
      calcium: 430,
      alkalinity: 8.5,
      magnesium: 1340,
      ph: 8.1
    },
    costPerGallon: 0.65,
    description: 'Premium German salt mix'
  },
  {
    id: 'aquaforest-reef',
    name: 'Reef Salt',
    brand: 'Aquaforest',
    parameters: {
      salinity: 1.025,
      calcium: 440,
      alkalinity: 8.0,
      magnesium: 1380,
      ph: 8.2
    },
    costPerGallon: 0.58,
    description: 'Low alkalinity for SPS systems'
  },
  {
    id: 'hw-marinemix',
    name: 'Reefer Salt',
    brand: 'Hw Marinemix',
    parameters: {
      salinity: 1.025,
      calcium: 450,
      alkalinity: 7.5,
      magnesium: 1350,
      ph: 8.1
    },
    costPerGallon: 0.48,
    description: 'Ultra-low nutrient formula'
  },
  {
    id: 'fritz-rpm',
    name: 'RPM Salt',
    brand: 'Fritz Aquatics',
    parameters: {
      salinity: 1.025,
      calcium: 415,
      alkalinity: 10.5,
      magnesium: 1280,
      ph: 8.2
    },
    costPerGallon: 0.42,
    description: 'Pharmaceutical grade purity'
  }
];

export const getDefaultSaltMix = (): SaltMix => saltMixes[1]; // Instant Ocean as default
