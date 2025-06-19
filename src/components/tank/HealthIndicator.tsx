
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { calculateTankHealth, HealthScore } from '@/utils/tankHealthCalculator';
import { Tank } from '@/contexts/AquariumContext';
import { Circle, TrendingUp, Calendar, AlertTriangle } from 'lucide-react';

interface HealthIndicatorProps {
  tank: Tank;
  showDetails?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export const HealthIndicator: React.FC<HealthIndicatorProps> = ({ 
  tank, 
  showDetails = false, 
  size = 'md' 
}) => {
  const healthScore = calculateTankHealth(tank);

  const getHealthIcon = () => {
    switch (healthScore.status) {
      case 'excellent':
        return <Circle className="h-3 w-3 fill-green-500 text-green-500" />;
      case 'good':
        return <Circle className="h-3 w-3 fill-blue-500 text-blue-500" />;
      case 'warning':
        return <Circle className="h-3 w-3 fill-yellow-500 text-yellow-500" />;
      case 'critical':
        return <Circle className="h-3 w-3 fill-red-500 text-red-500" />;
    }
  };

  const getHealthBadgeVariant = () => {
    switch (healthScore.status) {
      case 'excellent':
        return 'default';
      case 'good':
        return 'secondary';
      case 'warning':
        return 'outline';
      case 'critical':
        return 'destructive';
    }
  };

  const getHealthLabel = () => {
    switch (healthScore.status) {
      case 'excellent':
        return 'Excellent';
      case 'good':
        return 'Good';
      case 'warning':
        return 'Needs Attention';
      case 'critical':
        return 'Critical';
    }
  };

  if (!showDetails) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <div className="flex items-center gap-2">
              {getHealthIcon()}
              <span className={`text-sm font-medium ${healthScore.color}`}>
                {healthScore.overall}
              </span>
              {size !== 'sm' && (
                <Badge variant={getHealthBadgeVariant()} className="text-xs">
                  {getHealthLabel()}
                </Badge>
              )}
            </div>
          </TooltipTrigger>
          <TooltipContent>
            <div className="space-y-1">
              <p className="font-medium">Tank Health: {healthScore.overall}/100</p>
              <p className="text-xs">Parameter Stability: {healthScore.factors.parameterStability}/100</p>
              <p className="text-xs">Maintenance: {healthScore.factors.maintenanceAdherence}/100</p>
              <p className="text-xs">Time Since Issue: {healthScore.factors.timeSinceLastIssue}/100</p>
            </div>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  return (
    <Card>
      <CardContent className="p-4">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="font-medium flex items-center gap-2">
              {getHealthIcon()}
              Tank Health Score
            </h4>
            <div className="text-right">
              <div className={`text-2xl font-bold ${healthScore.color}`}>
                {healthScore.overall}
              </div>
              <Badge variant={getHealthBadgeVariant()} className="text-xs">
                {getHealthLabel()}
              </Badge>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-blue-500" />
                <span className="text-sm">Parameter Stability</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-16 bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-blue-500 h-2 rounded-full" 
                    style={{ width: `${healthScore.factors.parameterStability}%` }}
                  />
                </div>
                <span className="text-sm font-medium w-8 text-right">
                  {healthScore.factors.parameterStability}
                </span>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-green-500" />
                <span className="text-sm">Maintenance Schedule</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-16 bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-green-500 h-2 rounded-full" 
                    style={{ width: `${healthScore.factors.maintenanceAdherence}%` }}
                  />
                </div>
                <span className="text-sm font-medium w-8 text-right">
                  {healthScore.factors.maintenanceAdherence}
                </span>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-orange-500" />
                <span className="text-sm">Time Since Issue</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-16 bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-orange-500 h-2 rounded-full" 
                    style={{ width: `${healthScore.factors.timeSinceLastIssue}%` }}
                  />
                </div>
                <span className="text-sm font-medium w-8 text-right">
                  {healthScore.factors.timeSinceLastIssue}
                </span>
              </div>
            </div>
          </div>

          <div className="text-xs text-muted-foreground pt-2 border-t">
            Score based on: Parameter stability (40%), Maintenance adherence (30%), Time since last issue (30%)
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
