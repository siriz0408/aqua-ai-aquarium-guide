
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
}

export const calculateTankHealth = (tank: Tank): HealthScore => {
  const parameterStability = calculateParameterStability(tank.parameters);
  const maintenanceAdherence = calculateMaintenanceAdherence(tank.parameters);
  const timeSinceLastIssue = calculateTimeSinceLastIssue(tank.parameters);

  // Weighted calculation: Parameter stability (40%), Maintenance (30%), Time since issue (30%)
  const overall = Math.round(
    parameterStability * 0.4 + 
    maintenanceAdherence * 0.3 + 
    timeSinceLastIssue * 0.3
  );

  const factors: HealthFactors = {
    parameterStability,
    maintenanceAdherence,
    timeSinceLastIssue
  };

  const { status, color } = getHealthStatus(overall);

  return {
    overall,
    factors,
    status,
    color
  };
};

const calculateParameterStability = (parameters: WaterParameters[]): number => {
  if (parameters.length === 0) return 0;
  if (parameters.length === 1) return 70; // Default for single reading

  // Get recent parameters (last 5 tests or all if less than 5)
  const recentParams = parameters.slice(-5);
  
  // Calculate stability scores for key parameters
  const phStability = calculateStabilityScore(recentParams.map(p => p.ph), { min: 7.8, max: 8.5, ideal: 8.2 });
  const salinityStability = calculateStabilityScore(recentParams.map(p => p.salinity), { min: 1.020, max: 1.026, ideal: 1.025 });
  const tempStability = calculateStabilityScore(recentParams.map(p => p.temperature), { min: 74, max: 82, ideal: 78 });
  const ammoniaStability = calculateStabilityScore(recentParams.map(p => p.ammonia), { min: 0, max: 0.25, ideal: 0 });
  const nitrateStability = calculateStabilityScore(recentParams.map(p => p.nitrate), { min: 0, max: 20, ideal: 5 });

  // Average all stability scores
  return Math.round((phStability + salinityStability + tempStability + ammoniaStability + nitrateStability) / 5);
};

const calculateStabilityScore = (values: number[], range: { min: number; max: number; ideal: number }): number => {
  if (values.length === 0) return 0;

  // Calculate variance and range adherence
  const variance = calculateVariance(values);
  const rangeScore = values.reduce((score, value) => {
    if (value >= range.min && value <= range.max) {
      // Bonus points for being close to ideal
      const distanceFromIdeal = Math.abs(value - range.ideal);
      const maxDistance = Math.max(range.ideal - range.min, range.max - range.ideal);
      const idealScore = 100 - (distanceFromIdeal / maxDistance) * 30;
      return score + Math.max(70, idealScore);
    }
    return score + 30; // Lower score for out-of-range values
  }, 0);

  const avgRangeScore = rangeScore / values.length;
  
  // Lower variance = higher stability (max variance penalty of 20 points)
  const varianceScore = Math.max(0, 100 - variance * 10);
  
  return Math.min(100, Math.round((avgRangeScore + varianceScore) / 2));
};

const calculateVariance = (values: number[]): number => {
  if (values.length <= 1) return 0;
  const mean = values.reduce((sum, val) => sum + val, 0) / values.length;
  const squaredDiffs = values.map(val => Math.pow(val - mean, 2));
  return squaredDiffs.reduce((sum, diff) => sum + diff, 0) / values.length;
};

const calculateMaintenanceAdherence = (parameters: WaterParameters[]): number => {
  if (parameters.length === 0) return 0;

  const now = new Date();
  const sortedParams = [...parameters].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  
  if (sortedParams.length === 0) return 0;

  const lastTestDate = new Date(sortedParams[0].date);
  const daysSinceLastTest = Math.floor((now.getTime() - lastTestDate.getTime()) / (1000 * 60 * 60 * 24));

  // Score based on testing frequency
  let maintenanceScore = 100;
  
  if (daysSinceLastTest > 30) {
    maintenanceScore = 20; // Very poor maintenance
  } else if (daysSinceLastTest > 21) {
    maintenanceScore = 40; // Poor maintenance
  } else if (daysSinceLastTest > 14) {
    maintenanceScore = 60; // Below average
  } else if (daysSinceLastTest > 7) {
    maintenanceScore = 80; // Good maintenance
  }
  // Excellent maintenance (tested within 7 days) = 100

  // Bonus for consistent testing pattern
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
    
    // Consistent testing pattern bonus (up to 10 points)
    if (avgInterval <= 14 && intervalVariance < 25) {
      maintenanceScore = Math.min(100, maintenanceScore + 10);
    }
  }

  return Math.round(maintenanceScore);
};

const calculateTimeSinceLastIssue = (parameters: WaterParameters[]): number => {
  if (parameters.length === 0) return 50; // Neutral score for no data

  const recentParams = parameters.slice(-10); // Check last 10 tests
  let issueScore = 100;
  let daysSinceLastIssue = Infinity;

  // Check for parameter issues in recent history
  recentParams.forEach((param, index) => {
    const testDate = new Date(param.date);
    const daysAgo = Math.floor((Date.now() - testDate.getTime()) / (1000 * 60 * 60 * 24));
    
    // Define what constitutes an "issue"
    const hasIssue = 
      param.ph < 7.8 || param.ph > 8.5 ||
      param.salinity < 1.020 || param.salinity > 1.026 ||
      param.ammonia > 0.25 ||
      param.nitrite > 0.1 ||
      param.nitrate > 25 ||
      param.temperature < 74 || param.temperature > 82;

    if (hasIssue && daysAgo < daysSinceLastIssue) {
      daysSinceLastIssue = daysAgo;
    }
  });

  // Score based on time since last issue
  if (daysSinceLastIssue === Infinity) {
    issueScore = 100; // No recent issues
  } else if (daysSinceLastIssue < 7) {
    issueScore = 30; // Recent issue
  } else if (daysSinceLastIssue < 14) {
    issueScore = 60; // Issue within 2 weeks
  } else if (daysSinceLastIssue < 30) {
    issueScore = 80; // Issue within a month
  } else {
    issueScore = 95; // Old issue
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
