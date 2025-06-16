
import React, { useState } from 'react';
import { Layout } from '@/components/Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { RotateCcw, Sparkles } from 'lucide-react';
import SetupWizard from '@/components/setup-wizard/SetupWizard';
import PlanGenerationLoading from '@/components/setup-wizard/PlanGenerationLoading';
import SetupPlanDisplay from '@/components/setup-wizard/SetupPlanDisplay';
import { generateSetupPlan } from '@/components/setup-wizard/PlanGenerationLogic';

const SetupPlanner = () => {
  const { toast } = useToast();
  const [isGenerating, setIsGenerating] = useState(false);
  const [setupPlan, setSetupPlan] = useState<any>(null);

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
              {setupPlan && (
                <Button variant="outline" onClick={resetPlan}>
                  <RotateCcw className="mr-2 h-4 w-4" />
                  Start Over
                </Button>
              )}
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
          <div className="space-y-4">
            <SetupPlanDisplay setupPlan={setupPlan} />
          </div>
        )}
      </div>
    </Layout>
  );
};

export default SetupPlanner;
