
import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ReferenceLine } from 'recharts';
import { format } from 'date-fns';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { WaterParameters } from '@/contexts/AquariumContext';
import { ParameterTooltip } from '@/components/ui/parameter-tooltip';
import { FeatureTooltip } from '@/components/ui/feature-tooltip';

interface ParameterChartProps {
  parameters: WaterParameters[];
  title?: string;
}

interface ChartData {
  date: string;
  displayDate: string;
  ph: number | null;
  ammonia: number | null;
  nitrite: number | null;
  nitrate: number | null;
}

const ParameterChart: React.FC<ParameterChartProps> = ({ 
  parameters, 
  title = "Water Parameter Trends" 
}) => {
  // Get last 30 days of data
  const last30Days = parameters
    .slice(0, 30)
    .reverse(); // Reverse to show chronological order

  // Transform data for the chart
  const chartData: ChartData[] = last30Days.map(param => ({
    date: param.date,
    displayDate: format(new Date(param.date), 'MMM dd'),
    ph: param.ph,
    ammonia: param.ammonia,
    nitrite: param.nitrite,
    nitrate: param.nitrate,
  }));

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-background border border-border rounded-lg p-3 shadow-lg">
          <p className="font-medium">{format(new Date(label), 'MMM dd, yyyy')}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} style={{ color: entry.color }} className="text-sm">
              {entry.name}: {entry.value !== null ? entry.value.toFixed(2) : 'N/A'}
              {entry.name === 'pH' ? '' : ' ppm'}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  if (chartData.length === 0) {
    return (
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>{title}</CardTitle>
              <CardDescription>No parameter data available</CardDescription>
            </div>
            <FeatureTooltip
              title="Parameter Trends"
              description="Visual charts help you track water quality over time and identify patterns or issues before they become serious problems."
            />
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-64 text-muted-foreground">
            <p>No water test data to display</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>{title}</CardTitle>
            <CardDescription>
              Last {chartData.length} test{chartData.length !== 1 ? 's' : ''} - Click points for exact values
            </CardDescription>
          </div>
          <FeatureTooltip
            title="Parameter Trends"
            description="Visual charts help you track water quality over time and identify patterns or issues before they become serious problems."
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
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              
              {/* Safe zones - pH */}
              <ReferenceLine y={8.1} stroke="hsl(var(--destructive))" strokeDasharray="2 2" />
              <ReferenceLine y={8.4} stroke="hsl(var(--destructive))" strokeDasharray="2 2" />
              
              {/* Parameter lines */}
              <Line
                type="monotone"
                dataKey="ph"
                stroke="hsl(217, 91%, 60%)"
                strokeWidth={2}
                dot={{ fill: "hsl(217, 91%, 60%)", strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6, stroke: "hsl(217, 91%, 60%)", strokeWidth: 2 }}
                name="pH"
                connectNulls={false}
              />
              <Line
                type="monotone"
                dataKey="ammonia"
                stroke="hsl(47, 96%, 53%)"
                strokeWidth={2}
                dot={{ fill: "hsl(47, 96%, 53%)", strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6, stroke: "hsl(47, 96%, 53%)", strokeWidth: 2 }}
                name="Ammonia"
                connectNulls={false}
              />
              <Line
                type="monotone"
                dataKey="nitrite"
                stroke="hsl(346, 87%, 43%)"
                strokeWidth={2}
                dot={{ fill: "hsl(346, 87%, 43%)", strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6, stroke: "hsl(346, 87%, 43%)", strokeWidth: 2 }}
                name="Nitrite"
                connectNulls={false}
              />
              <Line
                type="monotone"
                dataKey="nitrate"
                stroke="hsl(142, 76%, 36%)"
                strokeWidth={2}
                dot={{ fill: "hsl(142, 76%, 36%)", strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6, stroke: "hsl(142, 76%, 36%)", strokeWidth: 2 }}
                name="Nitrate"
                connectNulls={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
        
        {/* Parameter status indicators with tooltips */}
        <div className="mt-4 grid grid-cols-2 gap-2 text-xs">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-blue-500"></div>
            <ParameterTooltip
              parameter="pH"
              normalRange="8.1 - 8.4"
              description="Measures water acidity/alkalinity. Stable pH is crucial for fish health and biological processes."
            >
              <span className="cursor-help">pH (8.1-8.4 ideal)</span>
            </ParameterTooltip>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
            <ParameterTooltip
              parameter="Ammonia (NH₃)"
              normalRange="0 ppm"
              description="Toxic waste product from fish and decomposing matter. Should always be 0 in established tanks."
            >
              <span className="cursor-help">Ammonia (0 ppm ideal)</span>
            </ParameterTooltip>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-red-500"></div>
            <ParameterTooltip
              parameter="Nitrite (NO₂)"
              normalRange="0 ppm"
              description="Intermediate product in nitrogen cycle. Highly toxic to fish, should always be 0 in established tanks."
            >
              <span className="cursor-help">Nitrite (0 ppm ideal)</span>
            </ParameterTooltip>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-green-600"></div>
            <ParameterTooltip
              parameter="Nitrate (NO₃)"
              normalRange="< 20 ppm"
              description="End product of nitrogen cycle. Less toxic but should be kept low through water changes and maintenance."
            >
              <span className="cursor-help">Nitrate (&lt;20 ppm ideal)</span>
            </ParameterTooltip>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ParameterChart;
