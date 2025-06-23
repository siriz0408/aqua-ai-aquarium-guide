
import { Tank } from '@/contexts/AquariumContext';
import { 
  WaterParameterValues, 
  parseParameterValues, 
  validateParameterRanges 
} from './waterParameter/parameterValidation';
import { 
  analyzePH, 
  analyzeSalinity, 
  analyzeTemperature, 
  analyzeNitrogenCycle, 
  analyzeReefChemistry 
} from './waterParameter/parameterAnalysis';
import { 
  generateTankSpecificRecommendations, 
  assessTankHealth 
} from './waterParameter/tankSpecificAnalysis';
import { 
  formatInsightsForDisplay, 
  prioritizeInsights 
} from './waterParameter/insightFormatting';

export type { WaterParameterValues };

export const generateEnhancedAIInsights = async (
  params: WaterParameterValues, 
  tank?: Tank
): Promise<string> => {
  // Parse and validate input parameters
  const values = parseParameterValues(params);
  const validationIssues = validateParameterRanges(values);
  
  if (validationIssues.length > 0) {
    console.warn('Parameter validation issues:', validationIssues);
  }
  
  // Analyze each parameter category
  const allInsights = [
    analyzePH(values.ph),
    analyzeSalinity(values.salinity),
    analyzeTemperature(values.temperature),
    ...analyzeNitrogenCycle(values),
    ...analyzeReefChemistry(values)
  ];
  
  // Prioritize insights by severity and importance
  const prioritizedInsights = prioritizeInsights(allInsights);
  
  // Generate tank-specific recommendations
  const tankRecommendations = generateTankSpecificRecommendations(tank);
  
  // Assess overall tank health
  const { healthSummary } = assessTankHealth(prioritizedInsights);
  
  // Format insights for display
  const finalInsights = formatInsightsForDisplay(
    healthSummary,
    prioritizedInsights,
    tankRecommendations
  );
  
  return finalInsights;
};
