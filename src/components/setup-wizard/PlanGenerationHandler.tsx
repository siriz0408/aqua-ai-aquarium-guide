
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { generateSetupPlan } from '@/components/setup-wizard/PlanGenerationLogic';

export const usePlanGeneration = () => {
  const { toast } = useToast();
  const [isGenerating, setIsGenerating] = useState(false);

  const handlePlanGeneration = async (wizardData: any) => {
    setIsGenerating(true);
    
    try {
      // Convert wizard data to the expected format for plan generation
      const planData = {
        tankSpecs: {
          tankSize: wizardData.tankSize,
          customSize: wizardData.customSize,
          experienceLevel: wizardData.experienceLevel,
          goals: wizardData.tankTypeGoals
        },
        budgetTimeline: {
          budgetRange: wizardData.budgetRange,
          aestheticPreferences: wizardData.aestheticPreferences
        }
      };

      const mockPlan = await generateSetupPlan(planData);
      
      toast({
        title: "Setup plan generated!",
        description: "Your custom aquarium plan is ready with step-by-step guidance",
      });

      return mockPlan;
    } catch (error) {
      toast({
        title: "Error generating plan",
        description: "Please try again",
        variant: "destructive",
      });
      throw error;
    } finally {
      setIsGenerating(false);
    }
  };

  return {
    isGenerating,
    handlePlanGeneration,
  };
};
