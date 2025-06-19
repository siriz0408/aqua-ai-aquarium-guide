
import { SaltMix } from '@/data/saltMixes';
import { WaterParameters } from '@/contexts/AquariumContext';

export interface WaterChangeCalculation {
  recommendedPercentage: number;
  predictedParameters: Partial<WaterParameters>;
  warnings: string[];
  saltNeeded: number; // in pounds
  estimatedCost: number;
  safetyScore: number; // 0-100, higher is safer
}

export interface ParameterTargets {
  ph?: number;
  salinity?: number;
  calcium?: number;
  alkalinity?: number;
  magnesium?: number;
  nitrate?: number;
  nitrite?: number;
  ammonia?: number;
}

export const calculateWaterChange = (
  currentParams: WaterParameters,
  targets: ParameterTargets,
  saltMix: SaltMix,
  tankVolumeGallons: number,
  changePercentage: number
): WaterChangeCalculation => {
  const warnings: string[] = [];
  const changeRatio = changePercentage / 100;
  
  // Calculate predicted parameters
  const predictedParameters: Partial<WaterParameters> = {};
  
  // Calculate new values using mixing formula: New = Current × (1 - %) + SaltMix × %
  predictedParameters.ph = calculateNewParameter(
    currentParams.ph, saltMix.parameters.ph, changeRatio
  );
  predictedParameters.salinity = calculateNewParameter(
    currentParams.salinity, saltMix.parameters.salinity, changeRatio
  );
  predictedParameters.calcium = Math.round(calculateNewParameter(
    currentParams.calcium, saltMix.parameters.calcium, changeRatio
  ));
  predictedParameters.kh = calculateNewParameter(
    currentParams.kh, saltMix.parameters.alkalinity, changeRatio
  );
  predictedParameters.magnesium = Math.round(calculateNewParameter(
    currentParams.magnesium, saltMix.parameters.magnesium, changeRatio
  ));
  
  // Nitrate reduction (water changes primarily reduce nitrates)
  predictedParameters.nitrate = currentParams.nitrate * (1 - changeRatio * 0.9);
  predictedParameters.nitrite = currentParams.nitrite * (1 - changeRatio * 0.8);
  predictedParameters.ammonia = currentParams.ammonia * (1 - changeRatio * 0.7);
  
  // Check for dangerous parameter shifts
  checkParameterShift('pH', currentParams.ph, predictedParameters.ph!, 0.2, warnings);
  checkParameterShift('Salinity', currentParams.salinity, predictedParameters.salinity!, 0.002, warnings);
  checkParameterShift('Calcium', currentParams.calcium, predictedParameters.calcium!, 50, warnings);
  checkParameterShift('Alkalinity', currentParams.kh, predictedParameters.kh!, 2, warnings);
  checkParameterShift('Magnesium', currentParams.magnesium, predictedParameters.magnesium!, 100, warnings);
  
  // Calculate salt needed (assuming 0.86 lbs per 5 gallons mixed)
  const waterToMix = (tankVolumeGallons * changePercentage) / 100;
  const saltNeeded = (waterToMix / 5) * 0.86;
  
  // Calculate cost
  const estimatedCost = waterToMix * saltMix.costPerGallon;
  
  // Calculate safety score (0-100)
  const safetyScore = calculateSafetyScore(warnings.length, changePercentage);
  
  // Calculate recommended percentage to reach targets
  const recommendedPercentage = calculateRecommendedPercentage(
    currentParams, targets, saltMix
  );
  
  return {
    recommendedPercentage,
    predictedParameters,
    warnings,
    saltNeeded,
    estimatedCost,
    safetyScore
  };
};

const calculateNewParameter = (
  current: number, 
  saltMixValue: number, 
  changeRatio: number
): number => {
  return current * (1 - changeRatio) + saltMixValue * changeRatio;
};

const checkParameterShift = (
  paramName: string,
  current: number,
  predicted: number,
  maxSafeChange: number,
  warnings: string[]
): void => {
  const change = Math.abs(predicted - current);
  if (change > maxSafeChange) {
    warnings.push(
      `${paramName} will change by ${change.toFixed(2)} - consider smaller water change`
    );
  }
};

const calculateSafetyScore = (warningCount: number, changePercentage: number): number => {
  let score = 100;
  score -= warningCount * 20; // -20 points per warning
  if (changePercentage > 30) score -= 15; // Large changes are riskier
  if (changePercentage > 40) score -= 15;
  return Math.max(0, score);
};

const calculateRecommendedPercentage = (
  current: WaterParameters,
  targets: ParameterTargets,
  saltMix: SaltMix
): number => {
  const recommendations: number[] = [];
  
  // Calculate needed change percentage for each target
  if (targets.nitrate && current.nitrate > targets.nitrate) {
    const reductionNeeded = (current.nitrate - targets.nitrate) / current.nitrate;
    recommendations.push(Math.min(50, reductionNeeded * 100 / 0.9)); // 90% efficiency
  }
  
  if (targets.ph && Math.abs(current.ph - targets.ph) > 0.1) {
    const pHDiff = targets.ph - current.ph;
    const saltMixDiff = saltMix.parameters.ph - current.ph;
    if (saltMixDiff !== 0) {
      const neededPercentage = Math.abs((pHDiff / saltMixDiff) * 100);
      recommendations.push(Math.min(50, neededPercentage));
    }
  }
  
  if (targets.salinity && Math.abs(current.salinity - targets.salinity) > 0.001) {
    const salinityDiff = targets.salinity - current.salinity;
    const saltMixDiff = saltMix.parameters.salinity - current.salinity;
    if (saltMixDiff !== 0) {
      const neededPercentage = Math.abs((salinityDiff / saltMixDiff) * 100);
      recommendations.push(Math.min(50, neededPercentage));
    }
  }
  
  return recommendations.length > 0 
    ? Math.max(5, Math.min(...recommendations))
    : 15; // Default 15% if no specific targets
};

export const getPresetTargets = (presetName: string): ParameterTargets => {
  switch (presetName) {
    case 'reduce-nitrates':
      return { nitrate: 5 };
    case 'raise-ph':
      return { ph: 8.2 };
    case 'lower-salinity':
      return { salinity: 1.025 };
    case 'reef-optimal':
      return {
        ph: 8.2,
        salinity: 1.025,
        calcium: 420,
        alkalinity: 9,
        magnesium: 1300,
        nitrate: 5
      };
    default:
      return {};
  }
};
