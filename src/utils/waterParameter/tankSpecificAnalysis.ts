
import { Tank } from '@/contexts/AquariumContext';
import { ParameterInsight } from './parameterAnalysis';

export const generateTankSpecificRecommendations = (tank?: Tank): string[] => {
  const recommendations: string[] = [];
  
  if (!tank) return recommendations;
  
  if (tank.livestock && tank.livestock.length > 0) {
    const sensitiveSpecies = tank.livestock.filter(l => 
      l.species.toLowerCase().includes('sps') || 
      l.species.toLowerCase().includes('acropora') ||
      l.careLevel === 'Expert'
    );
    
    if (sensitiveSpecies.length > 0) {
      recommendations.push("🪸 Your SPS corals require ultra-stable parameters - maintain consistency");
    }
    
    const fishCount = tank.livestock.filter(l => l.type === 'fish').length;
    const coralCount = tank.livestock.filter(l => l.type === 'coral').length;
    
    if (fishCount > 5) {
      recommendations.push("🐟 High fish bioload - monitor nitrogen levels closely");
    }
    
    if (coralCount > 10) {
      recommendations.push("🪸 Coral-dominant tank - focus on stable calcium and alkalinity");
    }
  }
  
  // Tank size considerations
  if (tank.size) {
    const sizeNum = parseInt(tank.size);
    if (sizeNum < 30) {
      recommendations.push("📏 Small tank volume - parameters can change rapidly, test frequently");
    } else if (sizeNum > 100) {
      recommendations.push("📏 Large tank volume - changes should be gradual and well-planned");
    }
  }
  
  return recommendations;
};

export const assessTankHealth = (insights: ParameterInsight[]): {
  healthSummary: string;
  criticalCount: number;
  warningCount: number;
} => {
  const criticalIssues = insights.filter(insight => insight.status === 'critical').length;
  const warnings = insights.filter(insight => insight.status === 'warning').length;
  
  let healthSummary = "";
  if (criticalIssues > 0) {
    healthSummary = `🔴 IMMEDIATE ACTION REQUIRED: ${criticalIssues} critical issue(s) detected. `;
  } else if (warnings > 0) {
    healthSummary = `⚠️ ATTENTION NEEDED: ${warnings} parameter(s) need adjustment. `;
  } else {
    healthSummary = "✅ EXCELLENT: All parameters within optimal ranges! ";
  }
  
  return {
    healthSummary,
    criticalCount: criticalIssues,
    warningCount: warnings
  };
};
