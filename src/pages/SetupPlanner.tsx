
import React, { useState, useEffect } from 'react';
import { Layout } from '@/components/Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { RotateCcw, Sparkles } from 'lucide-react';
import SetupWizard from '@/components/setup-wizard/SetupWizard';
import PlanGenerationLoading from '@/components/setup-wizard/PlanGenerationLoading';
import EnhancedPlanDisplay from '@/components/setup-wizard/EnhancedPlanDisplay';
import SavePlanDialog from '@/components/setup-wizard/SavePlanDialog';
import { generateSetupPlan } from '@/components/setup-wizard/PlanGenerationLogic';

const SetupPlanner = () => {
  const { toast } = useToast();
  const [isGenerating, setIsGenerating] = useState(false);
  const [setupPlan, setSetupPlan] = useState<any>(null);

  // Check if we should load a saved plan for viewing
  useEffect(() => {
    const viewPlan = sessionStorage.getItem('viewPlan');
    if (viewPlan) {
      const savedPlan = JSON.parse(viewPlan);
      // Convert the saved plan format to the display format
      const planForDisplay = {
        tankSize: savedPlan.tank_specs?.size || 'Unknown',
        estimatedGallons: savedPlan.tank_specs?.gallons || 'Unknown',
        equipment: savedPlan.equipment || [],
        compatibleLivestock: savedPlan.compatible_livestock || [],
        timeline: savedPlan.timeline || [],
        totalEstimate: savedPlan.total_estimate || 'N/A',
        monthlyMaintenance: savedPlan.monthly_maintenance || 'N/A',
        recommendations: savedPlan.recommendations || {},
        // Include original data for saving
        tankSpecs: savedPlan.tank_specs,
        budgetTimeline: savedPlan.budget_timeline,
      };
      setSetupPlan(planForDisplay);
      sessionStorage.removeItem('viewPlan');
    }
  }, []);

  const handlePlanGeneration = async (planData: any) => {
    setIsGenerating(true);
    
    try {
      const mockPlan = await generateSetupPlan(planData);
      setSetupPlan(mockPlan);
      
      toast({
        title: "Setup plan generated!",
        description: "Your custom aquarium plan is ready with step-by-step guidance",
      });
    } catch (error) {
      toast({
        title: "Error generating plan",
        description: "Please try again",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handlePlanUpdate = (updatedPlan: any) => {
    setSetupPlan(updatedPlan);
    toast({
      title: "Plan updated",
      description: "Your changes have been saved",
    });
  };

  const resetPlan = () => {
    setSetupPlan(null);
    toast({
      title: "Plan reset",
      description: "Start over with new specifications",
    });
  };

  return (
    <Layout title="Smart Setup Planner">
      <div className="space-y-6 pb-20">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-primary" />
                  Enhanced Setup Planner
                </CardTitle>
                <CardDescription>
                  Step-by-step guidance for your perfect saltwater aquarium setup
                </CardDescription>
              </div>
              <div className="flex items-center gap-2">
                {setupPlan && (
                  <>
                    <SavePlanDialog setupPlan={setupPlan} />
                    <Button variant="outline" onClick={resetPlan}>
                      <RotateCcw className="mr-2 h-4 w-4" />
                      Start Over
                    </Button>
                  </>
                )}
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {!setupPlan && !isGenerating && (
              <SetupWizard onPlanGenerated={handlePlanGeneration} />
            )}

            {isGenerating && <PlanGenerationLoading />}
          </CardContent>
        </Card>

        {setupPlan && (
          <EnhancedPlanDisplay 
            setupPlan={setupPlan} 
            onPlanUpdate={handlePlanUpdate}
          />
        )}
      </div>
    </Layout>
  );
};

export default SetupPlanner;
