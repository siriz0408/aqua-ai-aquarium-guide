
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { FeatureTooltip } from '@/components/ui/feature-tooltip';

interface ReefChemistryEmptyStateProps {
  title: string;
  hasData: boolean;
}

export const ReefChemistryEmptyState: React.FC<ReefChemistryEmptyStateProps> = ({ 
  title, 
  hasData 
}) => {
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
          <p>
            {hasData 
              ? "Add calcium, alkalinity, and magnesium tests to see trends"
              : "No reef chemistry test data to display"
            }
          </p>
        </div>
      </CardContent>
    </Card>
  );
};
