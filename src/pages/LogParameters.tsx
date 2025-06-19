
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Layout } from '@/components/Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAquarium, WaterParameters } from '@/contexts/AquariumContext';
import { useToast } from '@/hooks/use-toast';
import { useAutoSave } from '@/hooks/useAutoSave';
import { AutoSaveIndicator } from '@/components/ui/auto-save-indicator';
import { Save } from 'lucide-react';

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
  });

  // Auto-save configuration
  const autoSave = useAutoSave(parameters, {
    key: `water-parameters-${tankId}`,
    delay: 2000,
    onSave: async (data) => {
      // Only auto-save if we have some essential data
      if (data.ph || data.salinity || data.temperature) {
        console.log('Auto-saving parameters:', data);
        // This is just for backup - we don't actually save to database until manual save
      }
    },
    enabled: true
  });

  // Load saved data on mount
  useEffect(() => {
    const savedData = autoSave.loadFromLocalStorage();
    if (savedData) {
      setParameters(savedData);
      toast({
        title: "Draft restored",
        description: "Your previous water test data has been restored",
      });
    }
  }, []);

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
        aiInsights,
      };

      await addParameters(tankId!, newParameters);
      
      // Clear auto-save backup after successful save
      autoSave.clearLocalStorage();
      
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
        <div className="flex items-center gap-3">
          <AutoSaveIndicator status={autoSave.status} />
          <Button 
            onClick={handleSave} 
            disabled={isLoading}
            className="ocean-gradient text-white"
          >
            <Save className="mr-1 h-3 w-3" />
            {isLoading ? 'Analyzing...' : 'Save & Analyze'}
          </Button>
        </div>
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
                  <Label htmlFor="ph">pH Level</Label>
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
                  <Label htmlFor="salinity">Salinity (specific gravity)</Label>
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
                  <Label htmlFor="temperature">Temperature (°F)</Label>
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
                  <Label htmlFor="ammonia">Ammonia (ppm)</Label>
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
                  <Label htmlFor="nitrite">Nitrite (ppm)</Label>
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
                  <Label htmlFor="nitrate">Nitrate (ppm)</Label>
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
                  <Label htmlFor="kh">KH (Alkalinity) dKH</Label>
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
                  <Label htmlFor="calcium">Calcium (ppm)</Label>
                  <Input
                    id="calcium"
                    type="number"
                    placeholder="420"
                    value={parameters.calcium}
                    onChange={(e) => updateParameter('calcium', e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="magnesium">Magnesium (ppm)</Label>
                  <Input
                    id="magnesium"
                    type="number"
                    placeholder="1300"
                    value={parameters.magnesium}
                    onChange={(e) => updateParameter('magnesium', e.target.value)}
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
