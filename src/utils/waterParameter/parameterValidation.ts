
export interface WaterParameterValues {
  ph: string;
  salinity: string;
  temperature: string;
  ammonia: string;
  nitrate: string;
  nitrite: string;
  kh: string;
  calcium: string;
  magnesium: string;
}

export interface ParsedParameterValues {
  ph: number;
  salinity: number;
  temperature: number;
  ammonia: number;
  nitrite: number;
  nitrate: number;
  kh: number;
  calcium: number;
  magnesium: number;
}

export const parseParameterValues = (params: WaterParameterValues): ParsedParameterValues => {
  return {
    ph: parseFloat(params.ph),
    salinity: parseFloat(params.salinity),
    temperature: parseFloat(params.temperature),
    ammonia: parseFloat(params.ammonia) || 0,
    nitrite: parseFloat(params.nitrite) || 0,
    nitrate: parseFloat(params.nitrate) || 0,
    kh: parseFloat(params.kh) || 0,
    calcium: parseFloat(params.calcium) || 0,
    magnesium: parseFloat(params.magnesium) || 0,
  };
};

export const validateParameterRanges = (values: ParsedParameterValues) => {
  const issues = [];
  
  // pH validation
  if (values.ph < 7.0 || values.ph > 9.0) {
    issues.push('pH value seems unrealistic for marine aquarium');
  }
  
  // Salinity validation
  if (values.salinity < 1.015 || values.salinity > 1.030) {
    issues.push('Salinity value seems outside normal marine range');
  }
  
  // Temperature validation
  if (values.temperature < 65 || values.temperature > 90) {
    issues.push('Temperature value seems outside safe range');
  }
  
  return issues;
};
