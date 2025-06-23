
import { Tank } from '@/contexts/AquariumContext';
import { ParameterInsight } from './parameterAnalysis';

export const generateTankSpecificRecommendations = (tank?: Tank): string[] => {
  if (!tank) return [];
  
  const recommendations: string[] = [];
  
  // Tank size-based recommendations
  if (tank.size_gallons && tank.size_gallons < 20) {
    recommendations.push("Small tanks require more frequent monitoring");
  }
  
  // Livestock-based recommendations
  if (tank.livestock && tank.livestock.length > 0) {
    const highMaintenanceFish = tank.livestock.filter(fish => 
      fish.care_level === 'Advanced' || fish.care_level === 'Expert'
    );
    
    if (highMaintenanceFish.length > 0) {
      recommendations.push("High-maintenance livestock requires daily monitoring");
    }
  }
  
  // Equipment-based recommendations
  if (tank.equipment && tank.equipment.length > 0) {
    const hasSkimmer = tank.equipment.some(eq => 
      eq.name.toLowerCase().includes('skimmer')
    );
    
    if (!hasSkimmer) {
      recommendations.push("Consider adding a protein skimmer for better water quality");
    }
  }
  
  return recommendations;
};

export const assessTankHealth = (insights: ParameterInsight[]) => {
  const criticalIssues = insights.filter(i => i.status === 'critical').length;
  const warnings = insights.filter(i => i.status === 'warning').length;
  
  let healthSummary = "";
  
  if (criticalIssues > 0) {
    healthSummary = `🔴 CRITICAL: Your tank needs immediate attention (${criticalIssues} critical issues)`;
  } else if (warnings > 2) {
    healthSummary = `⚠️ CAUTION: Multiple parameters need adjustment (${warnings} warnings)`;
  } else if (warnings > 0) {
    healthSummary = `⚠️ ATTENTION: Some parameters could be improved (${warnings} warnings)`;
  } else {
    healthSummary = "✅ HEALTHY: Your tank parameters look good!";
  }
  
  return { healthSummary, criticalCount: criticalIssues, warningCount: warnings };
};
