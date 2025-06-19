
import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Layout } from '@/components/Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAquarium, WaterParameters } from '@/contexts/AquariumContext';
import { useToast } from '@/hooks/use-toast';
import { Save } from 'lucide-react';
import { ParameterTooltip } from '@/components/ui/parameter-tooltip';

const LogParameters = () => {
  const { tankId } = useParams<{ tankId: string }>();
  const navigate = useNavigate();
  const { getTank, addParameters } = useAquarium();
  const { toast } = useToast();
  
  const tank = tankId ? getTank(tankId) : undefined;
  const [isLoading, setIsLoading] = useState(false);
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

  return (
    <Layout 
      title="Log Water Parameters" 
      showBackButton
      actions={
        <Button 
          onClick={handleSave} 
          disabled={isLoading}
          className="ocean-gradient text-white"
        >
          <Save className="mr-1 h-3 w-3" />
          {isLoading ? 'Analyzing...' : 'Save & Analyze'}
        </Button>
      }
    >
      <div className="space-y-6 pb-20">
        <Card>
          <CardHeader>
            <CardTitle>Water Test Results</CardTitle>
            <CardDescription>
              Enter your test results for AI-powered analysis and recommendations
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Essential Parameters */}
            <div className="space-y-4">
              <h3 className="font-medium text-primary">Essential Parameters *</h3>
              <div className="grid grid-cols-1 gap-4">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Label htmlFor="ph">pH Level</Label>
                    <ParameterTooltip
                      parameter="pH Level"
                      normalRange="8.1 - 8.4"
                      description="Measures acidity/alkalinity. Stable pH is crucial for coral health and fish well-being."
                    />
                  </div>
                  <Input
                    id="ph"
                    type="number"
                    step="0.1"
                    placeholder="8.2"
                    value={parameters.ph}
                    onChange={(e) => updateParameter('ph', e.target.value)}
                  />
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Label htmlFor="salinity">Salinity (specific gravity)</Label>
                    <ParameterTooltip
                      parameter="Salinity"
                      normalRange="1.025 - 1.026"
                      description="Measures salt concentration. Critical for osmotic balance in marine organisms."
                    />
                  </div>
                  <Input
                    id="salinity"
                    type="number"
                    step="0.001"
                    placeholder="1.025"
                    value={parameters.salinity}
                    onChange={(e) => updateParameter('salinity', e.target.value)}
                  />
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Label htmlFor="temperature">Temperature (°F)</Label>
                    <ParameterTooltip
                      parameter="Temperature"
                      normalRange="76 - 82°F"
                      description="Water temperature affects metabolism, oxygen levels, and overall tank stability."
                    />
                  </div>
                  <Input
                    id="temperature"
                    type="number"
                    placeholder="78"
                    value={parameters.temperature}
                    onChange={(e) => updateParameter('temperature', e.target.value)}
                  />
                </div>
              </div>
            </div>

            {/* Nitrogen Cycle */}
            <div className="space-y-4">
              <h3 className="font-medium text-accent">Nitrogen Cycle</h3>
              <div className="grid grid-cols-1 gap-4">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Label htmlFor="ammonia">Ammonia (ppm)</Label>
                    <ParameterTooltip
                      parameter="Ammonia"
                      normalRange="0.0 ppm"
                      description="Toxic waste product. Should always be 0 in established tanks. Presence indicates cycle issues."
                    />
                  </div>
                  <Input
                    id="ammonia"
                    type="number"
                    step="0.01"
                    placeholder="0.0"
                    value={parameters.ammonia}
                    onChange={(e) => updateParameter('ammonia', e.target.value)}
                  />
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Label htmlFor="nitrite">Nitrite (ppm)</Label>
                    <ParameterTooltip
                      parameter="Nitrite"
                      normalRange="0.0 ppm"
                      description="Intermediate nitrogen compound. Should be 0 in established tanks. Toxic to fish."
                    />
                  </div>
                  <Input
                    id="nitrite"
                    type="number"
                    step="0.01"
                    placeholder="0.0"
                    value={parameters.nitrite}
                    onChange={(e) => updateParameter('nitrite', e.target.value)}
                  />
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Label htmlFor="nitrate">Nitrate (ppm)</Label>
                    <ParameterTooltip
                      parameter="Nitrate"
                      normalRange="5 - 20 ppm"
                      description="End product of nitrogen cycle. Keep low to prevent algae growth. Remove through water changes."
                    />
                  </div>
                  <Input
                    id="nitrate"
                    type="number"
                    placeholder="5"
                    value={parameters.nitrate}
                    onChange={(e) => updateParameter('nitrate', e.target.value)}
                  />
                </div>
              </div>
            </div>

            {/* Reef Chemistry */}
            <div className="space-y-4">
              <h3 className="font-medium text-green-600">Reef Chemistry</h3>
              <div className="grid grid-cols-1 gap-4">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Label htmlFor="kh">KH (Alkalinity) dKH</Label>
                    <ParameterTooltip
                      parameter="Alkalinity (KH)"
                      normalRange="8 - 12 dKH"
                      description="Buffering capacity that stabilizes pH. Essential for coral skeleton formation and pH stability."
                    />
                  </div>
                  <Input
                    id="kh"
                    type="number"
                    step="0.1"
                    placeholder="8.5"
                    value={parameters.kh}
                    onChange={(e) => updateParameter('kh', e.target.value)}
                  />
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Label htmlFor="calcium">Calcium (ppm)</Label>
                    <ParameterTooltip
                      parameter="Calcium"
                      normalRange="380 - 450 ppm"
                      description="Building block for coral skeletons and shells. Must be balanced with alkalinity and magnesium."
                    />
                  </div>
                  <Input
                    id="calcium"
                    type="number"
                    placeholder="420"
                    value={parameters.calcium}
                    onChange={(e) => updateParameter('calcium', e.target.value)}
                  />
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Label htmlFor="magnesium">Magnesium (ppm)</Label>
                    <ParameterTooltip
                      parameter="Magnesium"
                      normalRange="1250 - 1350 ppm"
                      description="Essential for calcium and alkalinity balance. Prevents calcium carbonate precipitation."
                    />
                  </div>
                  <Input
                    id="magnesium"
                    type="number"
                    placeholder="1300"
                    value={parameters.magnesium}
                    onChange={(e) => updateParameter('magnesium', e.target.value)}
                  />
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Label htmlFor="phosphate">Phosphate (ppm)</Label>
                    <ParameterTooltip
                      parameter="Phosphate"
                      normalRange="0.03 - 0.10 ppm"
                      description="Nutrient for coral growth. Too high causes algae, too low starves corals. Balance is key."
                    />
                  </div>
                  <Input
                    id="phosphate"
                    type="number"
                    step="0.01"
                    placeholder="0.05"
                    value={parameters.phosphate}
                    onChange={(e) => updateParameter('phosphate', e.target.value)}
                  />
                </div>
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
