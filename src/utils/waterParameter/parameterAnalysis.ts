
import { ParsedParameterValues } from './parameterValidation';

export interface ParameterInsight {
  parameter: string;
  value: number;
  status: 'critical' | 'warning' | 'good';
  message: string;
  recommendation?: string;
}

export const analyzePH = (ph: number): ParameterInsight => {
  if (ph < 7.8) {
    return {
      parameter: 'pH',
      value: ph,
      status: 'critical',
      message: `pH of ${ph} is critically low for marine life`,
      recommendation: 'Immediately check alkalinity and consider emergency pH buffer'
    };
  } else if (ph < 8.0) {
    return {
      parameter: 'pH',
      value: ph,
      status: 'warning',
      message: `pH of ${ph} is below optimal range (8.1-8.4)`,
      recommendation: 'Increase alkalinity with reef buffer or kalkwasser'
    };
  } else if (ph > 8.5) {
    return {
      parameter: 'pH',
      value: ph,
      status: 'warning',
      message: `pH of ${ph} is above safe range`,
      recommendation: 'Check for excessive CO2 consumption or alkalinity overdose'
    };
  } else {
    return {
      parameter: 'pH',
      value: ph,
      status: 'good',
      message: `pH ${ph} is within acceptable range`
    };
  }
};

export const analyzeSalinity = (salinity: number): ParameterInsight => {
  if (salinity < 1.020) {
    return {
      parameter: 'salinity',
      value: salinity,
      status: 'critical',
      message: `Salinity ${salinity} is dangerously low for coral health`,
      recommendation: 'Gradually increase salinity to 1.025-1.026 over several days'
    };
  } else if (salinity < 1.023) {
    return {
      parameter: 'salinity',
      value: salinity,
      status: 'warning',
      message: `Salinity ${salinity} is below optimal for coral growth`,
      recommendation: 'Slowly raise salinity to 1.025 for optimal coral health'
    };
  } else if (salinity > 1.027) {
    return {
      parameter: 'salinity',
      value: salinity,
      status: 'warning',
      message: `Salinity ${salinity} is above recommended range`,
      recommendation: 'Consider water change with RO/DI water to lower salinity'
    };
  } else {
    return {
      parameter: 'salinity',
      value: salinity,
      status: 'good',
      message: `Salinity ${salinity} is excellent for reef health`
    };
  }
};

export const analyzeTemperature = (temperature: number): ParameterInsight => {
  if (temperature < 72 || temperature > 82) {
    return {
      parameter: 'temperature',
      value: temperature,
      status: 'warning',
      message: `Temperature ${temperature}°F is outside safe range (74-78°F optimal)`,
      recommendation: 'Adjust heater/chiller to maintain 76-78°F'
    };
  } else {
    return {
      parameter: 'temperature',
      value: temperature,
      status: 'good',
      message: `Temperature ${temperature}°F is within safe range`
    };
  }
};

export const analyzeNitrogenCycle = (values: ParsedParameterValues): ParameterInsight[] => {
  const insights: ParameterInsight[] = [];
  
  // Ammonia analysis
  if (values.ammonia > 0.25) {
    insights.push({
      parameter: 'ammonia',
      value: values.ammonia,
      status: 'critical',
      message: `Ammonia ${values.ammonia} ppm is toxic to marine life`,
      recommendation: 'Emergency: Reduce feeding, increase water changes, check filtration'
    });
  } else if (values.ammonia > 0) {
    insights.push({
      parameter: 'ammonia',
      value: values.ammonia,
      status: 'warning',
      message: `Trace ammonia ${values.ammonia} ppm indicates bioload stress`,
      recommendation: 'Monitor closely, reduce feeding, check biological filtration'
    });
  } else {
    insights.push({
      parameter: 'ammonia',
      value: values.ammonia,
      status: 'good',
      message: 'Ammonia levels are safe (undetectable)'
    });
  }
  
  // Nitrite analysis
  if (values.nitrite > 0.5) {
    insights.push({
      parameter: 'nitrite',
      value: values.nitrite,
      status: 'critical',
      message: `Nitrite ${values.nitrite} ppm indicates serious biological filtration issues`,
      recommendation: 'Emergency water changes needed, check biological filter media'
    });
  } else if (values.nitrite > 0) {
    insights.push({
      parameter: 'nitrite',
      value: values.nitrite,
      status: 'warning',
      message: `Nitrite ${values.nitrite} ppm suggests incomplete nitrogen cycle`,
      recommendation: 'Monitor biological filtration, consider beneficial bacteria supplement'
    });
  } else {
    insights.push({
      parameter: 'nitrite',
      value: values.nitrite,
      status: 'good',
      message: 'Nitrite levels are safe'
    });
  }
  
  // Nitrate analysis
  if (values.nitrate > 50) {
    insights.push({
      parameter: 'nitrate',
      value: values.nitrate,
      status: 'critical',
      message: `Nitrate ${values.nitrate} ppm can stress fish and promote algae`,
      recommendation: 'Immediate large water change (30-50%) and review feeding/filtration'
    });
  } else if (values.nitrate > 20) {
    insights.push({
      parameter: 'nitrate',
      value: values.nitrate,
      status: 'warning',
      message: `Nitrate ${values.nitrate} ppm may promote nuisance algae growth`,
      recommendation: 'Increase water change frequency and consider nitrate reduction methods'
    });
  } else if (values.nitrate <= 10) {
    insights.push({
      parameter: 'nitrate',
      value: values.nitrate,
      status: 'good',
      message: `Excellent nitrate control (${values.nitrate} ppm)`
    });
  } else {
    insights.push({
      parameter: 'nitrate',
      value: values.nitrate,
      status: 'good',
      message: `Good nitrate levels (${values.nitrate} ppm)`
    });
  }
  
  return insights;
};

export const analyzeReefChemistry = (values: ParsedParameterValues): ParameterInsight[] => {
  const insights: ParameterInsight[] = [];
  
  // Alkalinity analysis
  if (values.kh > 0) {
    if (values.kh < 7) {
      insights.push({
        parameter: 'alkalinity',
        value: values.kh,
        status: 'warning',
        message: `Alkalinity ${values.kh} dKH is too low for stable pH and coral growth`,
        recommendation: 'Dose alkalinity supplement to raise to 8-12 dKH range'
      });
    } else if (values.kh > 13) {
      insights.push({
        parameter: 'alkalinity',
        value: values.kh,
        status: 'warning',
        message: `Alkalinity ${values.kh} dKH is too high and may precipitate calcium`,
        recommendation: 'Reduce alkalinity dosing and monitor calcium levels'
      });
    } else {
      insights.push({
        parameter: 'alkalinity',
        value: values.kh,
        status: 'good',
        message: `Alkalinity ${values.kh} dKH supports stable reef chemistry`
      });
    }
  }
  
  // Calcium analysis
  if (values.calcium > 0) {
    if (values.calcium < 380) {
      insights.push({
        parameter: 'calcium',
        value: values.calcium,
        status: 'warning',
        message: `Calcium ${values.calcium} ppm is too low for coral skeletal growth`,
        recommendation: 'Increase calcium dosing to 420-450 ppm range'
      });
    } else if (values.calcium > 470) {
      insights.push({
        parameter: 'calcium',
        value: values.calcium,
        status: 'warning',
        message: `Calcium ${values.calcium} ppm may precipitate with high alkalinity`,
        recommendation: 'Reduce calcium dosing and check magnesium levels'
      });
    } else {
      insights.push({
        parameter: 'calcium',
        value: values.calcium,
        status: 'good',
        message: `Calcium ${values.calcium} ppm supports healthy coral growth`
      });
    }
  }
  
  // Magnesium analysis
  if (values.magnesium > 0) {
    if (values.magnesium < 1200) {
      insights.push({
        parameter: 'magnesium',
        value: values.magnesium,
        status: 'warning',
        message: `Magnesium ${values.magnesium} ppm may cause calcium/alkalinity precipitation`,
        recommendation: 'Raise magnesium to 1300-1400 ppm before adjusting Ca/Alk'
      });
    } else if (values.magnesium > 1500) {
      insights.push({
        parameter: 'magnesium',
        value: values.magnesium,
        status: 'warning',
        message: `Magnesium ${values.magnesium} ppm is above natural seawater levels`,
        recommendation: 'Reduce magnesium supplementation'
      });
    } else {
      insights.push({
        parameter: 'magnesium',
        value: values.magnesium,
        status: 'good',
        message: `Magnesium ${values.magnesium} ppm maintains proper ionic balance`
      });
    }
  }
  
  return insights;
};
