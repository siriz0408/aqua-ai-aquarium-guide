
import { Tank } from '@/contexts/AquariumContext';

interface WaterParameterValues {
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

export const generateEnhancedAIInsights = async (
  params: WaterParameterValues, 
  tank?: Tank
): Promise<string> => {
  const insights = [];
  const recommendations = [];
  const priorities = [];
  
  // Convert string values to numbers for analysis
  const values = {
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

  // pH Analysis
  if (values.ph < 7.8) {
    priorities.push("🔴 CRITICAL: pH dangerously low");
    insights.push("pH of " + values.ph + " is critically low for marine life");
    recommendations.push("Immediately check alkalinity and consider emergency pH buffer");
  } else if (values.ph < 8.0) {
    priorities.push("⚠️ LOW pH detected");
    insights.push("pH of " + values.ph + " is below optimal range (8.1-8.4)");
    recommendations.push("Increase alkalinity with reef buffer or kalkwasser");
  } else if (values.ph > 8.5) {
    priorities.push("⚠️ HIGH pH detected");
    insights.push("pH of " + values.ph + " is above safe range");
    recommendations.push("Check for excessive CO2 consumption or alkalinity overdose");
  } else {
    insights.push("✅ pH " + values.ph + " is within acceptable range");
  }

  // Salinity Analysis
  if (values.salinity < 1.020) {
    priorities.push("🔴 CRITICAL: Salinity too low");
    insights.push("Salinity " + values.salinity + " is dangerously low for coral health");
    recommendations.push("Gradually increase salinity to 1.025-1.026 over several days");
  } else if (values.salinity < 1.023) {
    priorities.push("⚠️ Low salinity");
    insights.push("Salinity " + values.salinity + " is below optimal for coral growth");
    recommendations.push("Slowly raise salinity to 1.025 for optimal coral health");
  } else if (values.salinity > 1.027) {
    priorities.push("⚠️ High salinity");
    insights.push("Salinity " + values.salinity + " is above recommended range");
    recommendations.push("Consider water change with RO/DI water to lower salinity");
  } else {
    insights.push("✅ Salinity " + values.salinity + " is excellent for reef health");
  }

  // Temperature Analysis
  if (values.temperature < 72 || values.temperature > 82) {
    priorities.push("⚠️ Temperature out of range");
    insights.push("Temperature " + values.temperature + "°F is outside safe range (74-78°F optimal)");
    recommendations.push("Adjust heater/chiller to maintain 76-78°F");
  } else {
    insights.push("✅ Temperature " + values.temperature + "°F is within safe range");
  }

  // Nitrogen Cycle Analysis
  if (values.ammonia > 0.25) {
    priorities.push("🔴 CRITICAL: Toxic ammonia detected");
    insights.push("Ammonia " + values.ammonia + " ppm is toxic to marine life");
    recommendations.push("Emergency: Reduce feeding, increase water changes, check filtration");
  } else if (values.ammonia > 0) {
    priorities.push("⚠️ Ammonia detected");
    insights.push("Trace ammonia " + values.ammonia + " ppm indicates bioload stress");
    recommendations.push("Monitor closely, reduce feeding, check biological filtration");
  } else {
    insights.push("✅ Ammonia levels are safe (undetectable)");
  }

  if (values.nitrite > 0.5) {
    priorities.push("🔴 CRITICAL: High nitrite levels");
    insights.push("Nitrite " + values.nitrite + " ppm indicates serious biological filtration issues");
    recommendations.push("Emergency water changes needed, check biological filter media");
  } else if (values.nitrite > 0) {
    priorities.push("⚠️ Nitrite detected");
    insights.push("Nitrite " + values.nitrite + " ppm suggests incomplete nitrogen cycle");
    recommendations.push("Monitor biological filtration, consider beneficial bacteria supplement");
  } else {
    insights.push("✅ Nitrite levels are safe");
  }

  if (values.nitrate > 50) {
    priorities.push("🔴 Very high nitrates");
    insights.push("Nitrate " + values.nitrate + " ppm can stress fish and promote algae");
    recommendations.push("Immediate large water change (30-50%) and review feeding/filtration");
  } else if (values.nitrate > 20) {
    priorities.push("⚠️ Elevated nitrates");
    insights.push("Nitrate " + values.nitrate + " ppm may promote nuisance algae growth");
    recommendations.push("Increase water change frequency and consider nitrate reduction methods");
  } else if (values.nitrate <= 10) {
    insights.push("✅ Excellent nitrate control (" + values.nitrate + " ppm)");
  } else {
    insights.push("✅ Good nitrate levels (" + values.nitrate + " ppm)");
  }

  // Reef Chemistry Analysis (if values provided)
  if (values.kh > 0) {
    if (values.kh < 7) {
      priorities.push("⚠️ Low alkalinity");
      insights.push("Alkalinity " + values.kh + " dKH is too low for stable pH and coral growth");
      recommendations.push("Dose alkalinity supplement to raise to 8-12 dKH range");
    } else if (values.kh > 13) {
      priorities.push("⚠️ High alkalinity");
      insights.push("Alkalinity " + values.kh + " dKH is too high and may precipitate calcium");
      recommendations.push("Reduce alkalinity dosing and monitor calcium levels");
    } else {
      insights.push("✅ Alkalinity " + values.kh + " dKH supports stable reef chemistry");
    }
  }

  if (values.calcium > 0) {
    if (values.calcium < 380) {
      priorities.push("⚠️ Low calcium");
      insights.push("Calcium " + values.calcium + " ppm is too low for coral skeletal growth");
      recommendations.push("Increase calcium dosing to 420-450 ppm range");
    } else if (values.calcium > 470) {
      priorities.push("⚠️ High calcium");
      insights.push("Calcium " + values.calcium + " ppm may precipitate with high alkalinity");
      recommendations.push("Reduce calcium dosing and check magnesium levels");
    } else {
      insights.push("✅ Calcium " + values.calcium + " ppm supports healthy coral growth");
    }
  }

  if (values.magnesium > 0) {
    if (values.magnesium < 1200) {
      priorities.push("⚠️ Low magnesium");
      insights.push("Magnesium " + values.magnesium + " ppm may cause calcium/alkalinity precipitation");
      recommendations.push("Raise magnesium to 1300-1400 ppm before adjusting Ca/Alk");
    } else if (values.magnesium > 1500) {
      priorities.push("⚠️ High magnesium");
      insights.push("Magnesium " + values.magnesium + " ppm is above natural seawater levels");
      recommendations.push("Reduce magnesium supplementation");
    } else {
      insights.push("✅ Magnesium " + values.magnesium + " ppm maintains proper ionic balance");
    }
  }

  // Tank-specific recommendations
  if (tank) {
    if (tank.livestock && tank.livestock.length > 0) {
      const sensitiveSpecies = tank.livestock.filter(l => 
        l.species.toLowerCase().includes('sps') || 
        l.species.toLowerCase().includes('acropora') ||
        l.care_level === 'Expert' // Fixed: using care_level instead of careLevel
      );
      
      if (sensitiveSpecies.length > 0) {
        recommendations.push("🪸 Your SPS corals require ultra-stable parameters - maintain consistency");
      }
    }
  }

  // Overall health assessment
  const criticalIssues = priorities.filter(p => p.includes('🔴')).length;
  const warnings = priorities.filter(p => p.includes('⚠️')).length;
  
  let healthSummary = "";
  if (criticalIssues > 0) {
    healthSummary = "🔴 IMMEDIATE ACTION REQUIRED: " + criticalIssues + " critical issue(s) detected. ";
  } else if (warnings > 0) {
    healthSummary = "⚠️ ATTENTION NEEDED: " + warnings + " parameter(s) need adjustment. ";
  } else {
    healthSummary = "✅ EXCELLENT: All parameters within optimal ranges! ";
  }

  // Compile final insights
  const finalInsights = [
    healthSummary,
    ...priorities.slice(0, 3), // Top 3 priorities
    ...insights.slice(0, 5),   // Top 5 insights
    "",
    "🎯 RECOMMENDED ACTIONS:",
    ...recommendations.slice(0, 4) // Top 4 recommendations
  ].filter(Boolean).join(" • ");

  return finalInsights;
};
