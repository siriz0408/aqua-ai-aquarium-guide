
import { WaterParameters } from '@/contexts/AquariumContext';
import { differenceInDays, parseISO, format } from 'date-fns';

export interface ParameterTrend {
  parameter: keyof WaterParameters;
  trend: 'increasing' | 'decreasing' | 'stable';
  confidence: number;
  changeRate: number;
  recommendation?: string;
}

export interface PredictedValue {
  parameter: keyof WaterParameters;
  predictedValue: number;
  confidence: number;
  range: { min: number; max: number };
  lastValue: number;
  trend: 'up' | 'down' | 'stable';
}

export interface TestingPattern {
  averageInterval: number;
  consistency: number;
  nextSuggestedTest: string;
  isOverdue: boolean;
}

export interface ParameterStats {
  parameter: keyof WaterParameters;
  average: number;
  min: number;
  max: number;
  standardDeviation: number;
  stability: 'stable' | 'fluctuating' | 'volatile';
  lastChange: number;
}

export interface AlertLevel {
  parameter: keyof WaterParameters;
  level: 'normal' | 'warning' | 'critical';
  message: string;
  currentValue: number;
  expectedRange: { min: number; max: number };
}

const PARAMETER_RANGES = {
  ph: { min: 8.0, max: 8.4, critical: { min: 7.8, max: 8.6 } },
  salinity: { min: 1.024, max: 1.026, critical: { min: 1.020, max: 1.030 } },
  temperature: { min: 76, max: 82, critical: { min: 70, max: 86 } },
  ammonia: { min: 0, max: 0, critical: { min: 0, max: 0.25 } },
  nitrite: { min: 0, max: 0, critical: { min: 0, max: 0.25 } },
  nitrate: { min: 0, max: 20, critical: { min: 0, max: 40 } },
  kh: { min: 8, max: 12, critical: { min: 6, max: 15 } },
  calcium: { min: 380, max: 450, critical: { min: 350, max: 500 } },
  magnesium: { min: 1250, max: 1350, critical: { min: 1200, max: 1400 } },
  phosphate: { min: 0.03, max: 0.10, critical: { min: 0, max: 0.20 } }
};

export class ParameterAnalytics {
  private parameters: WaterParameters[];

  constructor(parameters: WaterParameters[]) {
    this.parameters = parameters.sort((a, b) => 
      new Date(b.date).getTime() - new Date(a.date).getTime()
    );
  }

  // Calculate basic statistics for a parameter
  calculateParameterStats(parameterName: keyof WaterParameters): ParameterStats {
    const values = this.parameters
      .map(p => p[parameterName] as number)
      .filter(v => v !== undefined && v !== null && !isNaN(v));

    if (values.length === 0) {
      return {
        parameter: parameterName,
        average: 0,
        min: 0,
        max: 0,
        standardDeviation: 0,
        stability: 'stable',
        lastChange: 0
      };
    }

    const average = values.reduce((sum, val) => sum + val, 0) / values.length;
    const min = Math.min(...values);
    const max = Math.max(...values);
    
    const variance = values.reduce((sum, val) => sum + Math.pow(val - average, 2), 0) / values.length;
    const standardDeviation = Math.sqrt(variance);
    
    // Calculate coefficient of variation for stability assessment
    const coefficientOfVariation = average > 0 ? (standardDeviation / average) * 100 : 0;
    
    let stability: 'stable' | 'fluctuating' | 'volatile';
    if (coefficientOfVariation < 5) stability = 'stable';
    else if (coefficientOfVariation < 15) stability = 'fluctuating';
    else stability = 'volatile';

    const lastChange = values.length > 1 ? values[0] - values[1] : 0;

    return {
      parameter: parameterName,
      average,
      min,
      max,
      standardDeviation,
      stability,
      lastChange
    };
  }

  // Analyze trends using linear regression
  analyzeTrend(parameterName: keyof WaterParameters, periods: number = 10): ParameterTrend {
    const recentData = this.parameters.slice(0, periods);
    const values = recentData
      .map(p => p[parameterName] as number)
      .filter(v => v !== undefined && v !== null && !isNaN(v));

    if (values.length < 3) {
      return {
        parameter: parameterName,
        trend: 'stable',
        confidence: 0,
        changeRate: 0
      };
    }

    // Simple linear regression
    const n = values.length;
    const x = Array.from({ length: n }, (_, i) => i);
    const y = values.reverse(); // Reverse to get chronological order

    const sumX = x.reduce((sum, val) => sum + val, 0);
    const sumY = y.reduce((sum, val) => sum + val, 0);
    const sumXY = x.reduce((sum, val, i) => sum + val * y[i], 0);
    const sumXX = x.reduce((sum, val) => sum + val * val, 0);

    const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
    const intercept = (sumY - slope * sumX) / n;

    // Calculate R-squared for confidence
    const yMean = sumY / n;
    const totalSumSquares = y.reduce((sum, val) => sum + Math.pow(val - yMean, 2), 0);
    const residualSumSquares = y.reduce((sum, val, i) => {
      const predicted = slope * x[i] + intercept;
      return sum + Math.pow(val - predicted, 2);
    }, 0);

    const rSquared = 1 - (residualSumSquares / totalSumSquares);
    const confidence = Math.max(0, Math.min(100, rSquared * 100));

    let trend: 'increasing' | 'decreasing' | 'stable';
    const threshold = 0.01; // Adjust based on parameter sensitivity
    
    if (Math.abs(slope) < threshold) {
      trend = 'stable';
    } else if (slope > 0) {
      trend = 'increasing';
    } else {
      trend = 'decreasing';
    }

    return {
      parameter: parameterName,
      trend,
      confidence,
      changeRate: slope,
      recommendation: this.generateTrendRecommendation(parameterName, trend, slope)
    };
  }

  // Predict next likely value
  predictNextValue(parameterName: keyof WaterParameters): PredictedValue {
    const stats = this.calculateParameterStats(parameterName);
    const trend = this.analyzeTrend(parameterName, 5);
    
    const lastValue = this.parameters.length > 0 ? 
      (this.parameters[0][parameterName] as number) || stats.average : stats.average;

    let predictedValue = lastValue;
    
    if (trend.confidence > 50 && trend.changeRate !== 0) {
      // Use trend for prediction
      predictedValue = lastValue + trend.changeRate;
    } else {
      // Fall back to moving average
      const recentValues = this.parameters
        .slice(0, 3)
        .map(p => p[parameterName] as number)
        .filter(v => v !== undefined && v !== null && !isNaN(v));
      
      if (recentValues.length > 0) {
        predictedValue = recentValues.reduce((sum, val) => sum + val, 0) / recentValues.length;
      }
    }

    // Calculate confidence based on stability and trend confidence
    const stabilityFactor = stats.stability === 'stable' ? 0.8 : 
                           stats.stability === 'fluctuating' ? 0.5 : 0.3;
    const confidence = Math.min(90, (trend.confidence * 0.7 + stabilityFactor * 30));

    // Calculate reasonable range
    const variance = stats.standardDeviation * 1.5;
    const range = {
      min: Math.max(0, predictedValue - variance),
      max: predictedValue + variance
    };

    return {
      parameter: parameterName,
      predictedValue: Math.round(predictedValue * 100) / 100,
      confidence: Math.round(confidence),
      range,
      lastValue,
      trend: trend.trend === 'increasing' ? 'up' : 
             trend.trend === 'decreasing' ? 'down' : 'stable'
    };
  }

  // Detect testing patterns
  detectTestingPattern(): TestingPattern {
    if (this.parameters.length < 2) {
      return {
        averageInterval: 7,
        consistency: 0,
        nextSuggestedTest: format(new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), 'yyyy-MM-dd'),
        isOverdue: false
      };
    }

    const intervals: number[] = [];
    for (let i = 0; i < this.parameters.length - 1; i++) {
      const current = parseISO(this.parameters[i].date);
      const next = parseISO(this.parameters[i + 1].date);
      intervals.push(differenceInDays(current, next));
    }

    const averageInterval = intervals.reduce((sum, val) => sum + val, 0) / intervals.length;
    
    // Calculate consistency (how consistent the intervals are)
    const intervalVariance = intervals.reduce((sum, val) => 
      sum + Math.pow(val - averageInterval, 2), 0) / intervals.length;
    const consistency = Math.max(0, 100 - (Math.sqrt(intervalVariance) / averageInterval) * 100);

    const lastTestDate = parseISO(this.parameters[0].date);
    const daysSinceLastTest = differenceInDays(new Date(), lastTestDate);
    const nextSuggestedDate = new Date(lastTestDate.getTime() + averageInterval * 24 * 60 * 60 * 1000);
    
    return {
      averageInterval: Math.round(averageInterval),
      consistency: Math.round(consistency),
      nextSuggestedTest: format(nextSuggestedDate, 'yyyy-MM-dd'),
      isOverdue: daysSinceLastTest > averageInterval * 1.2
    };
  }

  // Check for unusual readings
  checkForAlerts(): AlertLevel[] {
    if (this.parameters.length === 0) return [];

    const alerts: AlertLevel[] = [];
    const latestParams = this.parameters[0];

    Object.keys(PARAMETER_RANGES).forEach(paramKey => {
      const key = paramKey as keyof WaterParameters;
      const value = latestParams[key] as number;
      
      if (value === undefined || value === null || isNaN(value)) return;

      const ranges = PARAMETER_RANGES[key];
      const stats = this.calculateParameterStats(key);
      
      let level: 'normal' | 'warning' | 'critical' = 'normal';
      let message = '';

      // Check critical ranges first
      if (value < ranges.critical.min || value > ranges.critical.max) {
        level = 'critical';
        message = `${key} is at critical levels (${value}). Immediate attention required!`;
      }
      // Check ideal ranges
      else if (value < ranges.min || value > ranges.max) {
        level = 'warning';
        message = `${key} is outside ideal range (${value}). Consider adjustment.`;
      }
      // Check for unusual deviation from personal average
      else if (stats.standardDeviation > 0) {
        const deviationFromAverage = Math.abs(value - stats.average);
        if (deviationFromAverage > stats.standardDeviation * 2) {
          level = 'warning';
          message = `${key} deviates significantly from your average (${value} vs ${stats.average.toFixed(2)}).`;
        }
      }

      if (level !== 'normal') {
        alerts.push({
          parameter: key,
          level,
          message,
          currentValue: value,
          expectedRange: { min: ranges.min, max: ranges.max }
        });
      }
    });

    return alerts;
  }

  private generateTrendRecommendation(
    parameter: keyof WaterParameters, 
    trend: 'increasing' | 'decreasing' | 'stable', 
    rate: number
  ): string {
    if (trend === 'stable') return `${parameter} levels are stable - good job!`;

    const recommendations: Record<string, { up: string; down: string }> = {
      ph: {
        up: 'pH rising - check alkalinity buffer, reduce feeding',
        down: 'pH dropping - increase alkalinity, check CO2 levels'
      },
      salinity: {
        up: 'Salinity increasing - check for evaporation, top off with fresh water',
        down: 'Salinity decreasing - check for leaks, reduce fresh water addition'
      },
      nitrate: {
        up: 'Nitrates rising - increase water changes, reduce feeding',
        down: 'Nitrates decreasing - maintain current maintenance routine'
      },
      ammonia: {
        up: 'Ammonia rising - check filtration, reduce feeding immediately',
        down: 'Ammonia levels improving - continue current routine'
      }
    };

    const paramRec = recommendations[parameter as string];
    if (!paramRec) return `${parameter} is ${trend}`;

    return trend === 'increasing' ? paramRec.up : paramRec.down;
  }

  // Get comprehensive analysis summary
  getAnalysisSummary() {
    const parameterKeys = Object.keys(PARAMETER_RANGES) as (keyof WaterParameters)[];
    
    return {
      stats: parameterKeys.map(key => this.calculateParameterStats(key)),
      trends: parameterKeys.map(key => this.analyzeTrend(key)),
      predictions: parameterKeys.map(key => this.predictNextValue(key)),
      testingPattern: this.detectTestingPattern(),
      alerts: this.checkForAlerts(),
      totalTests: this.parameters.length,
      dataQuality: this.assessDataQuality()
    };
  }

  private assessDataQuality(): { score: number; issues: string[] } {
    const issues: string[] = [];
    let score = 100;

    if (this.parameters.length < 5) {
      issues.push('Limited historical data - predictions will improve with more tests');
      score -= 20;
    }

    const testingPattern = this.detectTestingPattern();
    if (testingPattern.consistency < 50) {
      issues.push('Inconsistent testing schedule affects trend accuracy');
      score -= 15;
    }

    if (testingPattern.isOverdue) {
      issues.push('Testing overdue - current predictions may be less accurate');
      score -= 10;
    }

    return { score: Math.max(0, score), issues };
  }
}
