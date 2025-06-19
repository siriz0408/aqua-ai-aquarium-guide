
import { useMemo } from 'react';
import { WaterParameters } from '@/contexts/AquariumContext';
import { ParameterAnalytics, PredictedValue, ParameterTrend, TestingPattern, AlertLevel, ParameterStats } from '@/utils/parameterAnalytics';

export interface UseParameterPredictionReturn {
  predictions: PredictedValue[];
  trends: ParameterTrend[];
  stats: ParameterStats[];
  testingPattern: TestingPattern;
  alerts: AlertLevel[];
  dataQuality: { score: number; issues: string[] };
  getPrediction: (parameter: keyof WaterParameters) => PredictedValue | undefined;
  getTrend: (parameter: keyof WaterParameters) => ParameterTrend | undefined;
  getStats: (parameter: keyof WaterParameters) => ParameterStats | undefined;
  isParameterUnusual: (parameter: keyof WaterParameters, value: number) => boolean;
  shouldShowAlert: (parameter: keyof WaterParameters) => AlertLevel | undefined;
  getConfidenceColor: (confidence: number) => string;
  formatPrediction: (prediction: PredictedValue) => string;
  isTestingOverdue: boolean;
  hasEnoughData: boolean;
}

export const useParameterPrediction = (
  parameters: WaterParameters[]
): UseParameterPredictionReturn => {
  const analytics = useMemo(() => {
    return new ParameterAnalytics(parameters);
  }, [parameters]);

  const analysis = useMemo(() => {
    return analytics.getAnalysisSummary();
  }, [analytics]);

  const getPrediction = (parameter: keyof WaterParameters): PredictedValue | undefined => {
    return analysis.predictions.find(p => p.parameter === parameter);
  };

  const getTrend = (parameter: keyof WaterParameters): ParameterTrend | undefined => {
    return analysis.trends.find(t => t.parameter === parameter);
  };

  const getStats = (parameter: keyof WaterParameters): ParameterStats | undefined => {
    return analysis.stats.find(s => s.parameter === parameter);
  };

  const isParameterUnusual = (parameter: keyof WaterParameters, value: number): boolean => {
    const stats = getStats(parameter);
    if (!stats || stats.standardDeviation === 0) return false;
    
    const deviationFromAverage = Math.abs(value - stats.average);
    return deviationFromAverage > stats.standardDeviation * 2;
  };

  const shouldShowAlert = (parameter: keyof WaterParameters): AlertLevel | undefined => {
    return analysis.alerts.find(a => a.parameter === parameter);
  };

  const getConfidenceColor = (confidence: number): string => {
    if (confidence >= 80) return 'text-green-600';
    if (confidence >= 60) return 'text-yellow-600';
    if (confidence >= 40) return 'text-orange-600';
    return 'text-red-600';
  };

  const formatPrediction = (prediction: PredictedValue): string => {
    const { predictedValue, confidence, trend } = prediction;
    const trendIcon = trend === 'up' ? '↗' : trend === 'down' ? '↘' : '→';
    return `${predictedValue} ${trendIcon} (${confidence}% confident)`;
  };

  return {
    predictions: analysis.predictions,
    trends: analysis.trends,
    stats: analysis.stats,
    testingPattern: analysis.testingPattern,
    alerts: analysis.alerts,
    dataQuality: analysis.dataQuality,
    getPrediction,
    getTrend,
    getStats,
    isParameterUnusual,
    shouldShowAlert,
    getConfidenceColor,
    formatPrediction,
    isTestingOverdue: analysis.testingPattern.isOverdue,
    hasEnoughData: parameters.length >= 3
  };
};

// Helper hook for real-time parameter validation during entry
export const useParameterValidation = (
  parameters: WaterParameters[],
  currentValues: Record<string, string>
) => {
  const prediction = useParameterPrediction(parameters);
  
  const validationResults = useMemo(() => {
    const results: Record<string, {
      isUnusual: boolean;
      prediction?: PredictedValue;
      suggestion: string;
      confidence: number;
    }> = {};

    Object.entries(currentValues).forEach(([key, value]) => {
      const numValue = parseFloat(value);
      if (isNaN(numValue) || !value) return;

      const paramKey = key as keyof WaterParameters;
      const pred = prediction.getPrediction(paramKey);
      const isUnusual = prediction.isParameterUnusual(paramKey, numValue);
      
      let suggestion = '';
      let confidence = 0;

      if (pred) {
        confidence = pred.confidence;
        const diff = Math.abs(numValue - pred.predictedValue);
        const threshold = pred.range.max - pred.range.min;
        
        if (diff > threshold) {
          suggestion = `Unusual reading. Expected around ${pred.predictedValue}`;
        } else if (confidence > 70) {
          suggestion = `Looks good! Close to predicted value`;
        }
      }

      results[key] = {
        isUnusual,
        prediction: pred,
        suggestion,
        confidence
      };
    });

    return results;
  }, [currentValues, prediction]);

  return {
    validationResults,
    hasUnusualReadings: Object.values(validationResults).some(r => r.isUnusual),
    getFieldValidation: (field: string) => validationResults[field],
    ...prediction
  };
};
