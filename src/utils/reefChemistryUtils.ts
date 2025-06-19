
import { format } from 'date-fns';
import { ReefChemistryData } from '@/types/reefChemistry';

export const transformParametersToChartData = (parameters: any[]): ReefChemistryData[] => {
  // Get last 30 days of data
  const last30Days = parameters
    .slice(0, 30)
    .reverse(); // Reverse to show chronological order

  // Transform data for the chart
  return last30Days.map(param => {
    const calcium = param.calcium;
    const kh = param.kh;
    const magnesium = param.magnesium;
    
    // Calculate Ca/Alk ratio (ideal is around 20:1, so Ca ÷ (Alk × 20))
    const caAlkRatio = calcium > 0 && kh > 0 ? calcium / (kh * 20) : null;
    
    return {
      date: param.date,
      displayDate: format(new Date(param.date), 'MMM dd'),
      calcium,
      kh,
      magnesium,
      caAlkRatio,
    };
  });
};

export const hasReefChemistryData = (chartData: ReefChemistryData[]): boolean => {
  return chartData.some(d => d.calcium > 0 || d.kh > 0 || d.magnesium > 0);
};
