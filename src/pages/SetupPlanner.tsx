
import React from 'react';
import { Layout } from '@/components/Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Sparkles } from 'lucide-react';
import PlannerWizard from '@/components/setup-wizard/PlannerWizard';
import PlanGenerationLoading from '@/components/setup-wizard/PlanGenerationLoading';
import EnhancedPlanDisplay from '@/components/setup-wizard/EnhancedPlanDisplay';
import PlanActions from '@/components/setup-wizard/PlanActions';
import { FeatureTooltip } from '@/components/ui/feature-tooltip';
import { usePlanManager } from '@/components/setup-wizard/PlanManager';
import { usePlanGeneration } from '@/components/setup-wizard/PlanGenerationHandler';

const SetupPlanner = () => {
  const { toast } = useToast();
  const { planState, updatePlan, saveEditedPlan, setPlan, resetPlan } = usePlanManager();
  const { isGenerating, handlePlanGeneration } = usePlanGeneration();

  const onPlanGenerated = async (wizardData: any) => {
    try {
      const generatedPlan = await handlePlanGeneration(wizardData);
      setPlan(generatedPlan);
    } catch (error) {
      // Error handling is done in the hook
    }
  };

  const handlePlanSaved = () => {
    toast({
      title: "Plan saved successfully!",
      description: "You can find it in your saved plans",
    });
  };

  return (
    <Layout title="Smart Setup Planner">
      <div className="space-y-6 pb-20">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Sparkles className="h-5 w-5 text-primary" />
                    {planState.isEditMode ? 'Edit Setup Plan' : 'Enhanced Setup Planner'}
                  </CardTitle>
                  <CardDescription>
                    {planState.isEditMode 
                      ? `Editing: ${planState.setupPlan?.planName || 'Your plan'}` 
                      : 'Step-by-step guidance for your perfect saltwater aquarium setup'
                    }
                  </CardDescription>
                </div>
                <FeatureTooltip
                  title="AI Setup Planner"
                  description="Our intelligent planner creates customized aquarium setups based on your budget, experience level, and goals. Get equipment recommendations, compatibility checks, and step-by-step timelines."
                  isPremium={true}
                />
              </div>
              <PlanActions
                setupPlan={planState.setupPlan}
                isEditMode={planState.isEditMode}
                onSaveEdited={saveEditedPlan}
                onReset={resetPlan}
                onPlanSaved={handlePlanSaved}
              />
            </div>
          </CardHeader>
          <CardContent>
            {!planState.setupPlan && !isGenerating && (
              <PlannerWizard onPlanGenerated={onPlanGenerated} />
            )}

            {isGenerating && <PlanGenerationLoading />}
          </CardContent>
        </Card>

        {planState.setupPlan && (
          <EnhancedPlanDisplay 
            setupPlan={planState.setupPlan} 
            onPlanUpdate={updatePlan}
          />
        )}
      </div>
    </Layout>
  );
};

export default SetupPlanner;
