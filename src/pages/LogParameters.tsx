
import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Layout } from '@/components/Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAquarium, WaterParameters } from '@/contexts/AquariumContext';
import { useToast } from '@/hooks/use-toast';
import { Save, Brain, TrendingUp } from 'lucide-react';
import { ParameterTooltip } from '@/components/ui/parameter-tooltip';
import { useParameterValidation } from '@/hooks/useParameterPrediction';
import ParameterPredictions from '@/components/tank/ParameterPredictions';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';

const LogParameters = () => {
  const { tankId } = useParams<{ tankId: string }>();
  const navigate = useNavigate();
  const { getTank, addParameters } = useAquarium();
  const { toast } = useToast();
  
  const tank = tankId ? getTank(tankId) : undefined;
  const [isLoading, setIsLo ading] = useState(false);
  const [showPredictions, setShowPredictions] = useState(true);
  const [parameters, setParameters] = useState({
    ph: '',
    salinity: '',
    temperature: '',
    ammonia: '',
    nitrate: '',
    nitrite: '',
    kh: '',
    calcium: '',
    magnesium: '',
    phosphate: '',
  });

  // Use prediction validation hook
  const validation = useParameterValidation(tank?.parameters || [], parameters);

  if (!tank) {
    return (
      <Layout title="Tank Not Found" showBackButton>
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold mb-4">Tank not found</h2>
          <Button onClick={() => navigate('/')}>Go Home</Button>
        </div>
      </Layout>
    );
  }

  const generateAIInsights = (params: any) => {
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
    } else if (parseFloat(params.calcium) > 450) {
      insights.push("Calcium levels high - monitor and adjust dosing");
    }

    if (parseFloat(params.kh) < 7) {
      insights.push("Alkalinity is low - may cause pH instability (ideal: 8-12 dKH)");
    } else if (parseFloat(params.kh) > 12) {
      insights.push("Alkalinity is high - reduce alkalinity supplementation");
    }

    if (parseFloat(params.magnesium) < 1250) {
      insights.push("Magnesium is low - essential for calcium/alkalinity balance");
    } else if (parseFloat(params.magnesium) > 1350) {
      insights.push("Magnesium levels are elevated");
    }

    if (parseFloat(params.phosphate) > 0.10) {
      insights.push("Phosphate levels elevated - may cause algae growth");
    } else if (parseFloat(params.phosphate) < 0.03) {
      insights.push("Phosphate levels very low - corals may need supplementation");
    }

    if (insights.length === 0) {
      insights.push("Parameters look good! Keep up the great maintenance routine.");
    }
    
    return insights.join(". ");
  };

  const handleSave = async () => {
    // Validate required fields
    const requiredFields = ['ph', 'salinity', 'temperature'];
    const missing = requiredFields.filter(field => !parameters[field as keyof typeof parameters]);
    
    if (missing.length > 0) {
      toast({
        title: "Missing required fields",
        description: "Please fill in pH, salinity, and temperature at minimum",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    
    try {
      // Simulate AI analysis
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const aiInsights = generateAIInsights(parameters);
      
      const newParameters: Omit<WaterParameters, 'id'> = {
        date: new Date().toISOString(),
        ph: parseFloat(parameters.ph),
        salinity: parseFloat(parameters.salinity),
        temperature: parseFloat(parameters.temperature),
        ammonia: parseFloat(parameters.ammonia) || 0,
        nitrate: parseFloat(parameters.nitrate) || 0,
        nitrite: parseFloat(parameters.nitrite) || 0,
        kh: parseFloat(parameters.kh) || 0,
        calcium: parseFloat(parameters.calcium) || 0,
        magnesium: parseFloat(parameters.magnesium) || 0,
        phosphate: parseFloat(parameters.phosphate) || 0,
        aiInsights,
      };

      await addParameters(tankId!, newParameters);
      
      toast({
        title: "Parameters logged successfully!",
        description: "AI analysis complete. Your test data has been saved.",
      });
      
      navigate(`/tank/${tankId}`);
    } catch (error) {
      toast({
        title: "Error saving parameters",
        description: "Please try again",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const updateParameter = (key: string, value: string) => {
    setParameters(prev => ({ ...prev, [key]: value }));
  };

  const applyPrediction = (parameter: keyof WaterParameters, value: number) => {
    setParameters(prev => ({ ...prev, [parameter]: value.toString() }));
    toast({
      title: "Prediction applied",
      description: `Set ${parameter} to predicted value: ${value}`,
    });
  };

  const getInputClassName = (field: string) => {
    const fieldValidation = validation.getFieldValidation(field);
    if (!fieldValidation) return "";
    
    if (fieldValidation.isUnusual) {
      return "border-orange-300 focus:border-orange-500";
    }
    if (fieldValidation.confidence > 70) {
      return "border-green-300 focus:border-green-500";
    }
    return "";
  };

  const renderParameterInput = (
    key: keyof typeof parameters,
    label: string,
    placeholder: string,
    step?: string,
    tooltip?: { parameter: string; normalRange: string; description: string }
  ) => {
    const fieldValidation = validation.getFieldValidation(key);
    const prediction = validation.getPrediction(key);
    
    return (
      <div>
        <div className="flex items-center gap-2 mb-2">
          <Label htmlFor={key}>{label}</Label>
          {tooltip && (
            <ParameterTooltip
              parameter={tooltip.parameter}
              normalRange={tooltip.normalRange}
              description={tooltip.description}
            />
          )}
          {prediction && prediction.confidence > 50 && (
            <Badge 
              variant="outline" 
              className="text-xs cursor-pointer hover:bg-blue-50"
              onClick={() => applyPrediction(key, prediction.predictedValue)}
            >
              <Brain className="h-3 w-3 mr-1" />
              {prediction.predictedValue}
            </Badge>
          )}
        </div>
        <Input
          id={key}
          type="number"
          step={step}
          placeholder={placeholder}
          value={parameters[key]}
          onChange={(e) => updateParameter(key, e.target.value)}
          className={getInputClassName(key)}
        />
        {fieldValidation?.suggestion && (
          <p className={`text-xs mt-1 ${
            fieldValidation.isUnusual ? 'text-orange-600' : 'text-blue-600'
          }`}>
            {fieldValidation.suggestion}
          </p>
        )}
      </div>
    );
  };

  return (
    <Layout 
      title="Log Water Parameters" 
      showBackButton
      actions={
        <div className="flex gap-2">
          <Button 
            variant="outline"
            size="sm"
            onClick={() => setShowPredictions(!showPredictions)}
            className="gap-1"
          >
            <TrendingUp className="h-3 w-3" />
            Predictions
          </Button>
          <Button 
            onClick={handleSave} 
            disabled={isLoading}
            className="ocean-gradient text-white gap-1"
          >
            <Save className="mr-1 h-3 w-3" />
            {isLoading ? 'Analyzing...' : 'Save & Analyze'}
          </Button>
        </div>
      }
    >
      <div className="space-y-6 pb-20">
        {/* Smart Predictions */}
        {showPredictions && (
          <ParameterPredictions
            parameters={tank.parameters}
            onApplyPrediction={applyPrediction}
            showDetailedAnalysis={false}
          />
        )}

        {/* Unusual Readings Alert */}
        {validation.hasUnusualReadings && (
          <Alert className="border-orange-200 bg-orange-50">
            <AlertDescription>
              Some readings appear unusual compared to your history. 
              Double-check these values or add notes explaining any changes.
            </AlertDescription>
          </Alert>
        )}

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              Water Test Results
              {validation.hasEnoughData && (
                <Badge variant="secondary" className="text-xs">
                  AI-Enhanced
                </Badge>
              )}
            </CardTitle>
            <CardDescription>
              Enter your test results for AI-powered analysis and recommendations
              {validation.hasEnoughData && " • Click prediction badges to use suggested values"}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Essential Parameters */}
            <div className="space-y-4">
              <h3 className="font-medium text-primary">Essential Parameters *</h3>
              <div className="grid grid-cols-1 gap-4">
                {renderParameterInput(
                  'ph',
                  'pH Level',
                  '8.2',
                  '0.1',
                  {
                    parameter: "pH Level",
                    normalRange: "8.1 - 8.4",
                    description: "Measures acidity/alkalinity. Stable pH is crucial for coral health and fish well-being."
                  }
                )}
                {renderParameterInput(
                  'salinity',
                  'Salinity (specific gravity)',
                  '1.025',
                  '0.001',
                  {
                    parameter: "Salinity",
                    normalRange: "1.025 - 1.026",
                    description: "Measures salt concentration. Critical for osmotic balance in marine organisms."
                  }
                )}
                {renderParameterInput(
                  'temperature',
                  'Temperature (°F)',
                  '78',
                  undefined,
                  {
                    parameter: "Temperature",
                    normalRange: "76 - 82°F",
                    description: "Water temperature affects metabolism, oxygen levels, and overall tank stability."
                  }
                )}
              </div>
            </div>

            {/* Nitrogen Cycle */}
            <div className="space-y-4">
              <h3 className="font-medium text-accent">Nitrogen Cycle</h3>
              <div className="grid grid-cols-1 gap-4">
                {renderParameterInput(
                  'ammonia',
                  'Ammonia (ppm)',
                  '0.0',
                  '0.01',
                  {
                    parameter: "Ammonia",
                    normalRange: "0.0 ppm",
                    description: "Toxic waste product. Should always be 0 in established tanks. Presence indicates cycle issues."
                  }
                )}
                {renderParameterInput(
                  'nitrite',
                  'Nitrite (ppm)',
                  '0.0',
                  '0.01',
                  {
                    parameter: "Nitrite",
                    normalRange: "0.0 ppm",
                    description: "Intermediate nitrogen compound. Should be 0 in established tanks. Toxic to fish."
                  }
                )}
                {renderParameterInput(
                  'nitrate',
                  'Nitrate (ppm)',
                  '5',
                  undefined,
                  {
                    parameter: "Nitrate",
                    normalRange: "5 - 20 ppm",
                    description: "End product of nitrogen cycle. Keep low to prevent algae growth. Remove through water changes."
                  }
                )}
              </div>
            </div>

            {/* Reef Chemistry */}
            <div className="space-y-4">
              <h3 className="font-medium text-green-600">Reef Chemistry</h3>
              <div className="grid grid-cols-1 gap-4">
                {renderParameterInput(
                  'kh',
                  'KH (Alkalinity) dKH',
                  '8.5',
                  '0.1',
                  {
                    parameter: "Alkalinity (KH)",
                    normalRange: "8 - 12 dKH",
                    description: "Buffering capacity that stabilizes pH. Essential for coral skeleton formation and pH stability."
                  }
                )}
                {renderParameterInput(
                  'calcium',
                  'Calcium (ppm)',
                  '420',
                  undefined,
                  {
                    parameter: "Calcium",
                    normalRange: "380 - 450 ppm",
                    description: "Building block for coral skeletons and shells. Must be balanced with alkalinity and magnesium."
                  }
                )}
                {renderParameterInput(
                  'magnesium',
                  'Magnesium (ppm)',
                  '1300',
                  undefined,
                  {
                    parameter: "Magnesium",
                    normalRange: "1250 - 1350 ppm",
                    description: "Essential for calcium and alkalinity balance. Prevents calcium carbonate precipitation."
                  }
                )}
                {renderParameterInput(
                  'phosphate',
                  'Phosphate (ppm)',
                  '0.05',
                  '0.01',
                  {
                    parameter: "Phosphate",
                    normalRange: "0.03 - 0.10 ppm",
                    description: "Nutrient for coral growth. Too high causes algae, too low starves corals. Balance is key."
                  }
                )}
              </div>
            </div>

            {isLoading && (
              <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <div className="flex items-center justify-center space-x-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
                  <span className="text-sm">AI is analyzing your water parameters...</span>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default LogParameters;
