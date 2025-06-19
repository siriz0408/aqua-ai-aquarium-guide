
import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ReferenceLine } from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { FeatureTooltip } from '@/components/ui/feature-tooltip';
import { ReefChemistryTooltip } from './ReefChemistryTooltip';
import { ReefChemistryLegend } from './ReefChemistryLegend';
import { ReefChemistryEmptyState } from './ReefChemistryEmptyState';
import { transformParametersToChartData, hasReefChemistryData } from '@/utils/reefChemistryUtils';
import { ReefChemistryChartProps } from '@/types/reefChemistry';

const ReefChemistryChart: React.FC<ReefChemistryChartProps> = ({ 
  parameters, 
  title = "Reef Chemistry Trends" 
}) => {
  const chartData = transformParametersToChartData(parameters);

  if (chartData.length === 0) {
    return <ReefChemistryEmptyState title={title} hasData={false} />;
  }

  if (!hasReefChemistryData(chartData)) {
    return <ReefChemistryEmptyState title={title} hasData={true} />;
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>{title}</CardTitle>
            <CardDescription>
              Last {chartData.length} test{chartData.length !== 1 ? 's' : ''} - Essential for coral health
            </CardDescription>
          </div>
          <FeatureTooltip
            title="Reef Chemistry Tracking"
            description="Monitor calcium, alkalinity, and magnesium levels. These parameters work together to maintain coral health and proper calcification."
          />
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-80 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis 
                dataKey="displayDate" 
                stroke="hsl(var(--muted-foreground))"
                fontSize={12}
              />
              <YAxis 
                stroke="hsl(var(--muted-foreground))"
                fontSize={12}
              />
              <Tooltip content={<ReefChemistryTooltip />} />
              <Legend />
              
              {/* Ideal range reference lines */}
              <ReferenceLine y={380} stroke="hsl(142, 76%, 36%)" strokeDasharray="2 2" />
              <ReferenceLine y={450} stroke="hsl(142, 76%, 36%)" strokeDasharray="2 2" />
              
              {/* Parameter lines */}
              <Line
                type="monotone"
                dataKey="calcium"
                stroke="hsl(24, 95%, 53%)"
                strokeWidth={2}
                dot={{ fill: "hsl(24, 95%, 53%)", strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6, stroke: "hsl(24, 95%, 53%)", strokeWidth: 2 }}
                name="Calcium"
                connectNulls={false}
              />
              <Line
                type="monotone"
                dataKey="kh"
                stroke="hsl(271, 91%, 65%)"
                strokeWidth={2}
                dot={{ fill: "hsl(271, 91%, 65%)", strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6, stroke: "hsl(271, 91%, 65%)", strokeWidth: 2 }}
                name="Alkalinity (KH)"
                connectNulls={false}
              />
              <Line
                type="monotone"
                dataKey="magnesium"
                stroke="hsl(186, 83%, 40%)"
                strokeWidth={2}
                dot={{ fill: "hsl(186, 83%, 40%)", strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6, stroke: "hsl(186, 83%, 40%)", strokeWidth: 2 }}
                name="Magnesium"
                connectNulls={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
        
        <ReefChemistryLegend />
      </CardContent>
    </Card>
  );
};

export default ReefChemistryChart;
