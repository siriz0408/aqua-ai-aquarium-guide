
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Layout } from '@/components/Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAquarium, WaterParameters } from '@/contexts/AquariumContext';
import { useToast } from '@/hooks/use-toast';
import { useAutoSave } from '@/hooks/useAutoSave';
import { AutoSaveIndicator } from '@/components/ui/auto-save-indicator';
import { Save } from 'lucide-react';
import { EssentialParametersForm } from '@/components/water-parameters/EssentialParametersForm';
import { NitrogenCycleForm } from '@/components/water-parameters/NitrogenCycleForm';
import { ReefChemistryForm } from '@/components/water-parameters/ReefChemistryForm';
import { AnalysisLoadingIndicator } from '@/components/water-parameters/AnalysisLoadingIndicator';
import { generateAIInsights } from '@/utils/aiInsights';
import { useWaterParameterValidation, WaterParameters as ParameterState } from '@/hooks/useWaterParameterValidation';

const LogParameters = () => {
  const { tankId } = useParams<{ tankId: string }>();
  const navigate = useNavigate();
  const { getTank, addParameters } = useAquarium();
  const { toast } = useToast();
  const { validateParameters } = useWaterParameterValidation();
  
  const tank = tankId ? getTank(tankId) : undefined;
  const [isLoading, setIsLoading] = useState(false);
  const [parameters, setParameters] = useState<ParameterState>({
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

  const handleSave = async () => {
    if (!validateParameters(parameters)) {
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
            <EssentialParametersForm
              parameters={{
                ph: parameters.ph,
                salinity: parameters.salinity,
                temperature: parameters.temperature
              }}
              onParameterChange={updateParameter}
            />

            <NitrogenCycleForm
              parameters={{
                ammonia: parameters.ammonia,
                nitrite: parameters.nitrite,
                nitrate: parameters.nitrate
              }}
              onParameterChange={updateParameter}
            />

            <ReefChemistryForm
              parameters={{
                kh: parameters.kh,
                calcium: parameters.calcium,
                magnesium: parameters.magnesium
              }}
              onParameterChange={updateParameter}
            />

            <AnalysisLoadingIndicator isLoading={isLoading} />
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default LogParameters;
