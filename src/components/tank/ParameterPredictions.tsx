
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { TrendingUp, TrendingDown, Minus, AlertTriangle, CheckCircle } from 'lucide-react';
import { useParameterPrediction } from '@/hooks/useParameterPrediction';
import { WaterParameters } from '@/contexts/AquariumContext';

interface ParameterPredictionsProps {
  parameters: WaterParameters[];
  onApplyPrediction?: (parameter: keyof WaterParameters, value: number) => void;
  showDetailedAnalysis?: boolean;
}

const ParameterPredictions: React.FC<ParameterPredictionsProps> = ({
  parameters,
  onApplyPrediction,
  showDetailedAnalysis = false
}) => {
  const prediction = useParameterPrediction(parameters);

  if (!prediction.hasEnoughData) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            Smart Predictions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Add more test results to see intelligent predictions and trend analysis.
            (Need at least 3 tests)
          </p>
        </CardContent>
      </Card>
    );
  }

  const getTrendIcon = (trend: 'up' | 'down' | 'stable') => {
    switch (trend) {
      case 'up': return <TrendingUp className="h-3 w-3 text-green-600" />;
      case 'down': return <TrendingDown className="h-3 w-3 text-red-600" />;
      default: return <Minus className="h-3 w-3 text-gray-600" />;
    }
  };

  const getConfidenceBadge = (confidence: number) => {
    const variant = confidence >= 80 ? 'default' : 
                   confidence >= 60 ? 'secondary' : 'outline';
    return (
      <Badge variant={variant} className="text-xs">
        {confidence}% confident
      </Badge>
    );
  };

  return (
    <div className="space-y-4">
      {/* Alerts */}
      {prediction.alerts.length > 0 && (
        <Alert className="border-orange-200 bg-orange-50">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            <div className="space-y-1">
              {prediction.alerts.map((alert, index) => (
                <div key={index} className="text-sm">
                  <span className="font-medium">{alert.parameter}:</span> {alert.message}
                </div>
              ))}
            </div>
          </AlertDescription>
        </Alert>
      )}

      {/* Testing Pattern Alert */}
      {prediction.isTestingOverdue && (
        <Alert className="border-blue-200 bg-blue-50">
          <CheckCircle className="h-4 w-4" />
          <AlertDescription>
            Testing overdue! You typically test every {prediction.testingPattern.averageInterval} days.
            Next suggested test: {prediction.testingPattern.nextSuggestedTest}
          </AlertDescription>
        </Alert>
      )}

      {/* Main Predictions Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Predicted Values
            </span>
            <Badge variant="outline" className="text-xs">
              Data Quality: {prediction.dataQuality.score}%
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {prediction.predictions
              .filter(pred => pred.confidence > 30) // Only show confident predictions
              .map((pred) => (
                <div 
                  key={pred.parameter}
                  className="p-3 border rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="font-medium capitalize">
                        {pred.parameter === 'kh' ? 'KH' : pred.parameter}
                      </span>
                      {getTrendIcon(pred.trend)}
                    </div>
                    {getConfidenceBadge(pred.confidence)}
                  </div>
                  
                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Predicted:</span>
                      <span className="font-mono font-medium">
                        {pred.predictedValue}
                        {onApplyPrediction && (
                          <button
                            onClick={() => onApplyPrediction(pred.parameter, pred.predictedValue)}
                            className="ml-2 text-xs text-blue-600 hover:underline"
                          >
                            Use
                          </button>
                        )}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Range:</span>
                      <span className="text-xs font-mono">
                        {pred.range.min.toFixed(2)} - {pred.range.max.toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
          </div>

          {showDetailedAnalysis && (
            <div className="mt-6 pt-4 border-t">
              <h4 className="font-medium mb-3">Analysis Summary</h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">Total Tests:</span>
                  <div className="font-medium">{prediction.stats[0] ? parameters.length : 0}</div>
                </div>
                <div>
                  <span className="text-muted-foreground">Test Frequency:</span>
                  <div className="font-medium">
                    Every {prediction.testingPattern.averageInterval} days
                  </div>
                </div>
                <div>
                  <span className="text-muted-foreground">Consistency:</span>
                  <div className="font-medium">
                    {Math.round(prediction.testingPattern.consistency)}%
                  </div>
                </div>
                <div>
                  <span className="text-muted-foreground">Active Alerts:</span>
                  <div className="font-medium text-orange-600">
                    {prediction.alerts.length}
                  </div>
                </div>
              </div>

              {prediction.dataQuality.issues.length > 0 && (
                <div className="mt-4 p-3 bg-yellow-50 rounded-lg">
                  <h5 className="text-sm font-medium text-yellow-800 mb-2">
                    Data Quality Notes:
                  </h5>
                  <ul className="text-xs text-yellow-700 space-y-1">
                    {prediction.dataQuality.issues.map((issue, index) => (
                      <li key={index}>• {issue}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ParameterPredictions;
