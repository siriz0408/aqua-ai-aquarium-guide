
import { Tank, WaterParameters } from '@/contexts/AquariumContext';

export interface HealthFactors {
  parameterStability: number;
  maintenanceAdherence: number;
  timeSinceLastIssue: number;
}

export interface HealthScore {
  overall: number;
  factors: HealthFactors;
  status: 'excellent' | 'good' | 'warning' | 'critical';
  color: string;
  description: string;
}

export const calculateTankHealth = (tank: Tank): HealthScore => {
  const parameterStability = calculateParameterStability(tank.parameters || [], tank.type);
  const maintenanceAdherence = calculateMaintenanceAdherence(tank.parameters || [], tank.type);
  const timeSinceLastIssue = calculateTimeSinceLastIssue(tank.parameters || []);

  // Base calculation with weighted scoring
  let overall = Math.round(
    parameterStability * 0.4 + 
    maintenanceAdherence * 0.3 + 
    timeSinceLastIssue * 0.3
  );

  // Tank age bonus - mature tanks get stability bonus
  const tankAge = tank.createdAt ? 
    Math.floor((Date.now() - new Date(tank.createdAt).getTime()) / (1000 * 60 * 60 * 24 * 30)) : 0;
  
  if (tankAge > 6) {
    overall = Math.min(100, overall + 10);
  }

  const factors: HealthFactors = {
    parameterStability,
    maintenanceAdherence,
    timeSinceLastIssue
  };

  const { status, color } = getHealthStatus(overall);
  const description = getHealthDescription(overall, factors, tank.parameters || [], tank.type);

  return {
    overall,
    factors,
    status,
    color,
    description
  };
};

const calculateParameterStability = (parameters: WaterParameters[], tankType: string = 'Mixed'): number => {
  if (parameters.length === 0) return 0;
  if (parameters.length === 1) return 70;

  const recentParams = parameters.slice(-5);
  const isReefTank = tankType === 'Reef' || tankType === 'Mixed';
  const isFOWLRTank = tankType === 'FOWLR';

  // Critical parameters (40% weight) - always important
  const ammoniaStability = calculateStabilityScore(
    recentParams.map(p => p.ammonia).filter((val): val is number => val !== undefined), 
    { min: 0, max: 0.25, ideal: 0 }
  );
  const nitriteStability = calculateStabilityScore(
    recentParams.map(p => p.nitrite).filter((val): val is number => val !== undefined), 
    { min: 0, max: 0.1, ideal: 0 }
  );

  // Reef-specific parameters (30% weight for reef tanks, 10% for FOWLR)
  const calciumStability = calculateStabilityScore(
    recentParams.map(p => p.calcium).filter((val): val is number => val !== undefined), 
    { min: 380, max: 450, ideal: 420 }
  );
  const alkalinityStability = calculateStabilityScore(
    recentParams.map(p => p.kh).filter((val): val is number => val !== undefined), 
    { min: 7, max: 12, ideal: 9 }
  );
  const magnesiumStability = calculateStabilityScore(
    recentParams.map(p => p.magnesium).filter((val): val is number => val !== undefined), 
    { min: 1250, max: 1350, ideal: 1300 }
  );

  // General parameters (30% weight)
  const phStability = calculateStabilityScore(
    recentParams.map(p => p.ph).filter((val): val is number => val !== undefined), 
    { min: 7.8, max: 8.5, ideal: 8.2 }
  );
  const salinityStability = calculateStabilityScore(
    recentParams.map(p => p.salinity).filter((val): val is number => val !== undefined), 
    { min: 1.020, max: 1.026, ideal: 1.025 }
  );
  const tempStability = calculateStabilityScore(
    recentParams.map(p => p.temperature).filter((val): val is number => val !== undefined), 
    { min: 74, max: 82, ideal: 78 }
  );
  const nitrateStability = calculateStabilityScore(
    recentParams.map(p => p.nitrate).filter((val): val is number => val !== undefined), 
    { min: 0, max: 20, ideal: 5 }
  );

  // Calculate variance penalties
  const variancePenalty = calculateParameterVariance(parameters);

  // Weight differently based on tank type
  let weightedScore: number;
  
  if (isReefTank) {
    // Reef tanks: Critical 40%, Reef-specific 30%, General 30%
    const criticalScore = (ammoniaStability + nitriteStability) / 2;
    const reefScore = (calciumStability + alkalinityStability + magnesiumStability) / 3;
    const generalScore = (phStability + salinityStability + tempStability + nitrateStability) / 4;
    
    weightedScore = (criticalScore * 0.4) + (reefScore * 0.3) + (generalScore * 0.3);
  } else if (isFOWLRTank) {
    // FOWLR tanks: Critical 40%, General 50%, Reef-specific 10%
    const criticalScore = (ammoniaStability + nitriteStability) / 2;
    const reefScore = (calciumStability + alkalinityStability + magnesiumStability) / 3;
    const generalScore = (phStability + salinityStability + tempStability + nitrateStability) / 4;
    
    weightedScore = (criticalScore * 0.4) + (generalScore * 0.5) + (reefScore * 0.1);
  } else {
    // Mixed tanks: Balanced approach
    const criticalScore = (ammoniaStability + nitriteStability) / 2;
    const reefScore = (calciumStability + alkalinityStability + magnesiumStability) / 3;
    const generalScore = (phStability + salinityStability + tempStability + nitrateStability) / 4;
    
    weightedScore = (criticalScore * 0.4) + (reefScore * 0.25) + (generalScore * 0.35);
  }

  // Apply variance penalty
  const finalScore = Math.max(0, weightedScore - variancePenalty);
  
  return Math.round(finalScore);
};

const calculateParameterVariance = (parameters: WaterParameters[]): number => {
  if (parameters.length < 3) return 0;

  const recent = parameters.slice(-10);
  let totalVariancePenalty = 0;
  let parameterCount = 0;

  // Check variance for key parameters
  const parameterChecks = [
    { values: recent.map(p => p.ph).filter((val): val is number => val !== undefined), weight: 1 },
    { values: recent.map(p => p.salinity).filter((val): val is number => val !== undefined), weight: 1 },
    { values: recent.map(p => p.temperature).filter((val): val is number => val !== undefined), weight: 1 },
    { values: recent.map(p => p.ammonia).filter((val): val is number => val !== undefined), weight: 2 },
    { values: recent.map(p => p.nitrite).filter((val): val is number => val !== undefined), weight: 2 },
    { values: recent.map(p => p.calcium).filter((val): val is number => val !== undefined), weight: 1.5 },
    { values: recent.map(p => p.kh).filter((val): val is number => val !== undefined), weight: 1.5 },
    { values: recent.map(p => p.magnesium).filter((val): val is number => val !== undefined), weight: 1.5 },
  ];

  parameterChecks.forEach(({ values, weight }) => {
    if (values.length >= 3) {
      const standardDev = calculateStandardDeviation(values);
      // Normalize standard deviation to a 0-20 penalty scale
      const variancePenalty = Math.min(20, standardDev * 5) * weight;
      totalVariancePenalty += variancePenalty;
      parameterCount += weight;
    }
  });

  return parameterCount > 0 ? totalVariancePenalty / parameterCount : 0;
};

const calculateStandardDeviation = (values: number[]): number => {
  if (values.length <= 1) return 0;
  const mean = values.reduce((sum, val) => sum + val, 0) / values.length;
  const squaredDiffs = values.map(val => Math.pow(val - mean, 2));
  const variance = squaredDiffs.reduce((sum, diff) => sum + diff, 0) / values.length;
  return Math.sqrt(variance);
};

const calculateStabilityScore = (values: number[], range: { min: number; max: number; ideal: number }): number => {
  if (values.length === 0) return 0;

  const variance = calculateVariance(values);
  const rangeScore = values.reduce((score, value) => {
    if (value >= range.min && value <= range.max) {
      const distanceFromIdeal = Math.abs(value - range.ideal);
      const maxDistance = Math.max(range.ideal - range.min, range.max - range.ideal);
      const idealScore = 100 - (distanceFromIdeal / maxDistance) * 30;
      return score + Math.max(70, idealScore);
    }
    return score + 30;
  }, 0);

  const avgRangeScore = rangeScore / values.length;
  const varianceScore = Math.max(0, 100 - variance * 10);
  
  return Math.min(100, Math.round((avgRangeScore + varianceScore) / 2));
};

const calculateVariance = (values: number[]): number => {
  if (values.length <= 1) return 0;
  const mean = values.reduce((sum, val) => sum + val, 0) / values.length;
  const squaredDiffs = values.map(val => Math.pow(val - mean, 2));
  return squaredDiffs.reduce((sum, diff) => sum + diff, 0) / values.length;
};

const calculateMaintenanceAdherence = (parameters: WaterParameters[], tankType: string = 'Mixed'): number => {
  if (parameters.length === 0) return 0;

  const now = new Date();
  const sortedParams = [...parameters].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  
  if (sortedParams.length === 0) return 0;

  const lastTestDate = new Date(sortedParams[0].date);
  const daysSinceLastTest = Math.floor((now.getTime() - lastTestDate.getTime()) / (1000 * 60 * 60 * 24));

  // Different testing frequency requirements by tank type
  const isReefTank = tankType === 'Reef' || tankType === 'Mixed';
  let maintenanceScore = 100;
  
  if (isReefTank) {
    // Reef tanks need more frequent testing
    if (daysSinceLastTest > 21) {
      maintenanceScore = 20;
    } else if (daysSinceLastTest > 14) {
      maintenanceScore = 40;
    } else if (daysSinceLastTest > 10) {
      maintenanceScore = 60;
    } else if (daysSinceLastTest > 7) {
      maintenanceScore = 80;
    }
  } else {
    // FOWLR tanks can go longer between tests
    if (daysSinceLastTest > 30) {
      maintenanceScore = 20;
    } else if (daysSinceLastTest > 21) {
      maintenanceScore = 40;
    } else if (daysSinceLastTest > 14) {
      maintenanceScore = 60;
    } else if (daysSinceLastTest > 10) {
      maintenanceScore = 80;
    }
  }

  // Consistency bonus
  if (parameters.length >= 3) {
    const testIntervals = [];
    for (let i = 1; i < Math.min(parameters.length, 5); i++) {
      const current = new Date(sortedParams[i-1].date);
      const previous = new Date(sortedParams[i].date);
      const interval = Math.floor((current.getTime() - previous.getTime()) / (1000 * 60 * 60 * 24));
      testIntervals.push(interval);
    }
    
    const avgInterval = testIntervals.reduce((sum, interval) => sum + interval, 0) / testIntervals.length;
    const intervalVariance = calculateVariance(testIntervals);
    
    const targetInterval = isReefTank ? 10 : 14;
    if (avgInterval <= targetInterval && intervalVariance < 25) {
      maintenanceScore = Math.min(100, maintenanceScore + 10);
    }
  }

  return Math.round(maintenanceScore);
};

const calculateTimeSinceLastIssue = (parameters: WaterParameters[]): number => {
  if (parameters.length === 0) return 50;

  const recentParams = parameters.slice(-10);
  let issueScore = 100;
  let daysSinceLastIssue = Infinity;

  recentParams.forEach((param) => {
    const testDate = new Date(param.date);
    const daysAgo = Math.floor((Date.now() - testDate.getTime()) / (1000 * 60 * 60 * 24));
    
    const hasIssue = 
      (param.ph !== undefined && (param.ph < 7.8 || param.ph > 8.5)) ||
      (param.salinity !== undefined && (param.salinity < 1.020 || param.salinity > 1.026)) ||
      (param.ammonia !== undefined && param.ammonia > 0.25) ||
      (param.nitrite !== undefined && param.nitrite > 0.1) ||
      (param.nitrate !== undefined && param.nitrate > 25) ||
      (param.temperature !== undefined && (param.temperature < 74 || param.temperature > 82)) ||
      (param.calcium !== undefined && (param.calcium < 380 || param.calcium > 450)) ||
      (param.kh !== undefined && (param.kh < 7 || param.kh > 12)) ||
      (param.magnesium !== undefined && (param.magnesium < 1250 || param.magnesium > 1350));

    if (hasIssue && daysAgo < daysSinceLastIssue) {
      daysSinceLastIssue = daysAgo;
    }
  });

  if (daysSinceLastIssue === Infinity) {
    issueScore = 100;
  } else if (daysSinceLastIssue < 7) {
    issueScore = 30;
  } else if (daysSinceLastIssue < 14) {
    issueScore = 60;
  } else if (daysSinceLastIssue < 30) {
    issueScore = 80;
  } else {
    issueScore = 95;
  }

  return Math.round(issueScore);
};

const getHealthStatus = (score: number): { status: 'excellent' | 'good' | 'warning' | 'critical'; color: string } => {
  if (score >= 85) {
    return { status: 'excellent', color: 'text-green-600' };
  } else if (score >= 70) {
    return { status: 'good', color: 'text-blue-600' };
  } else if (score >= 50) {
    return { status: 'warning', color: 'text-yellow-600' };
  } else {
    return { status: 'critical', color: 'text-red-600' };
  }
};

const getHealthDescription = (score: number, factors: HealthFactors, parameters: WaterParameters[], tankType: string = 'Mixed'): string => {
  const isReefTank = tankType === 'Reef' || tankType === 'Mixed';
  const problematicParams = identifyProblematicParameters(parameters);
  
  if (score >= 85) {
    return "Excellent tank health! Parameters are stable, maintenance is consistent, and no recent issues detected.";
  } else if (score >= 70) {
    return "Good tank health with minor areas for improvement. Continue regular maintenance and monitoring.";
  } else if (score >= 50) {
    if (factors.parameterStability < 60) {
      let advice = "Water parameter instability detected. ";
      if (problematicParams.length > 0) {
        advice += `Focus on stabilizing: ${problematicParams.join(', ')}. `;
      }
      advice += isReefTank ? 
        "Consider more frequent testing (every 7-10 days) and gradual adjustments." :
        "Consider more frequent testing (every 10-14 days) and gradual adjustments.";
      return advice;
    } else if (factors.maintenanceAdherence < 60) {
      const testingFreq = isReefTank ? "weekly" : "bi-weekly";
      return `Maintenance schedule needs improvement. More frequent water changes and ${testingFreq} testing recommended.`;
    } else {
      return "Recent water quality issues detected. Monitor closely and consider corrective actions.";
    }
  } else {
    let advice = "Critical tank health issues require immediate attention. ";
    if (problematicParams.length > 0) {
      advice += `Urgent: Address ${problematicParams.join(', ')} immediately. `;
    }
    advice += "Check water parameters daily and consider emergency measures.";
    return advice;
  }
};

const identifyProblematicParameters = (parameters: WaterParameters[]): string[] => {
  if (parameters.length === 0) return [];
  
  const latest = parameters[parameters.length - 1];
  const problems: string[] = [];
  
  if (latest.ammonia !== undefined && latest.ammonia > 0.25) problems.push('ammonia');
  if (latest.nitrite !== undefined && latest.nitrite > 0.1) problems.push('nitrite');
  if (latest.ph !== undefined && (latest.ph < 7.8 || latest.ph > 8.5)) problems.push('pH');
  if (latest.salinity !== undefined && (latest.salinity < 1.020 || latest.salinity > 1.026)) problems.push('salinity');
  if (latest.calcium !== undefined && (latest.calcium < 380 || latest.calcium > 450)) problems.push('calcium');
  if (latest.kh !== undefined && (latest.kh < 7 || latest.kh > 12)) problems.push('alkalinity');
  if (latest.magnesium !== undefined && (latest.magnesium < 1250 || latest.magnesium > 1350)) problems.push('magnesium');
  if (latest.nitrate !== undefined && latest.nitrate > 25) problems.push('nitrate');
  if (latest.temperature !== undefined && (latest.temperature < 74 || latest.temperature > 82)) problems.push('temperature');
  
  return problems;
};

