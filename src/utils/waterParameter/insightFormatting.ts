
import { ParameterInsight } from './parameterAnalysis';

export const formatInsightsForDisplay = (
  healthSummary: string,
  insights: ParameterInsight[],
  tankRecommendations: string[]
): string => {
  const priorities: string[] = [];
  const messages: string[] = [];
  const recommendations: string[] = [];
  
  // Collect priorities and messages from insights
  insights.forEach(insight => {
    if (insight.status === 'critical') {
      priorities.push(`🔴 CRITICAL: ${insight.message}`);
    } else if (insight.status === 'warning') {
      priorities.push(`⚠️ ${insight.parameter.toUpperCase()}: ${insight.message}`);
    } else {
      messages.push(`✅ ${insight.message}`);
    }
    
    if (insight.recommendation) {
      recommendations.push(insight.recommendation);
    }
  });
  
  // Add tank-specific recommendations
  recommendations.push(...tankRecommendations);
  
  // Compile final insights
  const finalInsights = [
    healthSummary,
    ...priorities.slice(0, 3), // Top 3 priorities
    ...messages.slice(0, 5),   // Top 5 insights
    "",
    "🎯 RECOMMENDED ACTIONS:",
    ...recommendations.slice(0, 4) // Top 4 recommendations
  ].filter(Boolean).join(" • ");

  return finalInsights;
};

export const prioritizeInsights = (insights: ParameterInsight[]): ParameterInsight[] => {
  return insights.sort((a, b) => {
    // Critical issues first
    if (a.status === 'critical' && b.status !== 'critical') return -1;
    if (b.status === 'critical' && a.status !== 'critical') return 1;
    
    // Warning issues second
    if (a.status === 'warning' && b.status === 'good') return -1;
    if (b.status === 'warning' && a.status === 'good') return 1;
    
    // Within same priority, sort by parameter importance
    const parameterOrder = ['ammonia', 'nitrite', 'ph', 'salinity', 'temperature', 'nitrate', 'alkalinity', 'calcium', 'magnesium'];
    const aIndex = parameterOrder.indexOf(a.parameter);
    const bIndex = parameterOrder.indexOf(b.parameter);
    
    return aIndex - bIndex;
  });
};
