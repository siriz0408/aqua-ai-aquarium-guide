
export const generateAIInsights = (params: any): string => {
  const insights = [];
  
  if (parseFloat(params.ph) < 8.0) {
    insights.push("pH is lower than ideal for saltwater tanks (8.1-8.4)");
  } else if (parseFloat(params.ph) > 8.4) {
    insights.push("pH is higher than ideal range");
  }
  
  if (parseFloat(params.salinity) < 1.024) {
    insights.push("Salinity is too low for coral health (ideal: 1.025-1.026)");
  } else if (parseFloat(params.salinity) > 1.027) {
    insights.push("Salinity is slightly high");
  }
  
  if (parseFloat(params.ammonia) > 0) {
    insights.push("Ammonia detected - check filtration and reduce feeding");
  }
  
  if (parseFloat(params.nitrate) > 20) {
    insights.push("Nitrates are elevated - consider water changes");
  }
  
  if (parseFloat(params.calcium) < 380) {
    insights.push("Calcium levels low for coral growth (ideal: 380-450 ppm)");
  }

  if (insights.length === 0) {
    insights.push("Parameters look good! Keep up the great maintenance routine.");
  }
  
  return insights.join(". ");
};
