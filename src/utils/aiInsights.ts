
export const generateAIInsights = (params: any): string => {
  const insights = [];
  
  // pH Analysis
  if (parseFloat(params.ph) < 8.0) {
    insights.push("pH is lower than ideal for saltwater tanks (8.1-8.4)");
  } else if (parseFloat(params.ph) > 8.4) {
    insights.push("pH is higher than ideal range");
  }
  
  // Salinity Analysis
  if (parseFloat(params.salinity) < 1.024) {
    insights.push("Salinity is too low for coral health (ideal: 1.025-1.026)");
  } else if (parseFloat(params.salinity) > 1.027) {
    insights.push("Salinity is slightly high");
  }
  
  // Nitrogen Cycle Analysis
  if (parseFloat(params.ammonia) > 0) {
    insights.push("Ammonia detected - check filtration and reduce feeding");
  }
  
  if (parseFloat(params.nitrate) > 20) {
    insights.push("Nitrates are elevated - consider water changes");
  }
  
  if (parseFloat(params.nitrite) > 0) {
    insights.push("Nitrites detected - check biological filtration");
  }
  
  // Reef Chemistry Analysis
  const calcium = parseFloat(params.calcium);
  const kh = parseFloat(params.kh);
  const magnesium = parseFloat(params.magnesium);
  
  if (calcium > 0) {
    if (calcium < 380) {
      insights.push("Calcium levels low for coral growth (ideal: 380-450 ppm)");
    } else if (calcium > 450) {
      insights.push("Calcium levels high - monitor alkalinity and magnesium balance");
    }
  }
  
  if (kh > 0) {
    if (kh < 8) {
      insights.push("Alkalinity too low - may cause pH instability (ideal: 8-12 dKH)");
    } else if (kh > 12) {
      insights.push("Alkalinity too high - may inhibit coral calcification");
    }
  }
  
  if (magnesium > 0) {
    if (magnesium < 1250) {
      insights.push("Magnesium low - may cause calcium/alkalinity precipitation (ideal: 1250-1350 ppm)");
    } else if (magnesium > 1400) {
      insights.push("Magnesium elevated - monitor other reef parameters");
    }
  }
  
  // Ca/Alk Balance Analysis
  if (calcium > 0 && kh > 0) {
    const caAlkRatio = calcium / (kh * 20);
    if (caAlkRatio < 0.8) {
      insights.push("Calcium low relative to alkalinity - consider dosing calcium");
    } else if (caAlkRatio > 1.2) {
      insights.push("Calcium high relative to alkalinity - monitor for precipitation");
    }
  }
  
  // Phosphate Analysis
  if (parseFloat(params.phosphate) > 0.1) {
    insights.push("Phosphate levels elevated - may promote algae growth and inhibit coral calcification");
  }

  if (insights.length === 0) {
    insights.push("Parameters look good! Keep up the great maintenance routine.");
  }
  
  return insights.join(". ");
};
