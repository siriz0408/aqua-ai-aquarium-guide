
import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ReferenceLine } from 'recharts';
import { format } from 'date-fns';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { WaterParameters } from '@/contexts/AquariumContext';
import { ParameterTooltip } from '@/components/ui/parameter-tooltip';
import { FeatureTooltip } from '@/components/ui/feature-tooltip';

interface ReefChemistryChartProps {
  parameters: WaterParameters[];
  title?: string;
}

interface ChartData {
  date: string;
  displayDate: string;
  calcium: number | null;
  kh: number | null;
  magnesium: number | null;
  caAlkRatio: number | null;
}

const ReefChemistryChart: React.FC<ReefChemistryChartProps> = ({ 
  parameters, 
  title = "Reef Chemistry Trends" 
}) => {
  // Get last 30 days of data
  const last30Days = parameters
    .slice(0, 30)
    .reverse(); // Reverse to show chronological order

  // Transform data for the chart
  const chartData: ChartData[] = last30Days.map(param => {
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

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-background border border-border rounded-lg p-3 shadow-lg">
          <p className="font-medium">{format(new Date(label), 'MMM dd, yyyy')}</p>
          {payload.map((entry: any, index: number) => {
            if (entry.dataKey === 'caAlkRatio') {
              return (
                <p key={index} style={{ color: entry.color }} className="text-sm">
                  Ca/Alk Ratio: {entry.value !== null ? entry.value.toFixed(2) : 'N/A'}
                </p>
              );
            }
            return (
              <p key={index} style={{ color: entry.color }} className="text-sm">
                {entry.name}: {entry.value !== null ? entry.value.toFixed(1) : 'N/A'}
                {entry.dataKey === 'kh' ? ' dKH' : ' ppm'}
              </p>
            );
          })}
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
              <CardDescription>No reef chemistry data available</CardDescription>
            </div>
            <FeatureTooltip
              title="Reef Chemistry Tracking"
              description="Monitor calcium, alkalinity, and magnesium levels. These parameters work together to maintain coral health and proper calcification."
            />
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-64 text-muted-foreground">
            <p>No reef chemistry test data to display</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Check if we have any reef chemistry data
  const hasReefData = chartData.some(d => d.calcium > 0 || d.kh > 0 || d.magnesium > 0);

  if (!hasReefData) {
    return (
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>{title}</CardTitle>
              <CardDescription>No reef chemistry data available</CardDescription>
            </div>
            <FeatureTooltip
              title="Reef Chemistry Tracking"
              description="Monitor calcium, alkalinity, and magnesium levels. These parameters work together to maintain coral health and proper calcification."
            />
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-64 text-muted-foreground">
            <p>Add calcium, alkalinity, and magnesium tests to see trends</p>
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
              <Tooltip content={<CustomTooltip />} />
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
        
        {/* Parameter status indicators with tooltips */}
        <div className="mt-4 grid grid-cols-2 gap-2 text-xs">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-orange-500"></div>
            <ParameterTooltip
              parameter="Calcium (Ca)"
              normalRange="380 - 450 ppm"
              description="Essential for coral skeleton formation and shell development. Works closely with alkalinity and magnesium."
            >
              <span className="cursor-help">Calcium (380-450 ppm)</span>
            </ParameterTooltip>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-purple-500"></div>
            <ParameterTooltip
              parameter="Alkalinity (KH)"
              normalRange="8 - 12 dKH"
              description="Measures carbonate buffering capacity. Critical for coral calcification and pH stability."
            >
              <span className="cursor-help">Alkalinity (8-12 dKH)</span>
            </ParameterTooltip>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-teal-600"></div>
            <ParameterTooltip
              parameter="Magnesium (Mg)"
              normalRange="1250 - 1350 ppm"
              description="Supports calcium and alkalinity balance. Prevents precipitation and aids coral growth."
            >
              <span className="cursor-help">Magnesium (1250-1350 ppm)</span>
            </ParameterTooltip>
          </div>
          <div className="flex items-center gap-2 col-span-1">
            <div className="w-3 h-3 rounded-full bg-gradient-to-r from-orange-500 to-purple-500"></div>
            <ParameterTooltip
              parameter="Ca/Alk Balance"
              normalRange="~1.0 ratio"
              description="Ideal calcium to alkalinity ratio helps maintain stable reef chemistry. Ca ÷ (Alk × 20) should be close to 1.0."
            >
              <span className="cursor-help">Ca/Alk Balance</span>
            </ParameterTooltip>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ReefChemistryChart;
