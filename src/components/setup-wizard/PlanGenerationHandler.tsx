
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { generateSetupPlan } from '@/components/setup-wizard/PlanGenerationLogic';

export const usePlanGeneration = () => {
  const { toast } = useToast();
  const [isGenerating, setIsGenerating] = useState(false);

  const handlePlanGeneration = async (wizardData: any) => {
    setIsGenerating(true);
    
    try {
      console.log('Starting plan generation with data:', wizardData);
      
      // Convert wizard data to the expected format for plan generation
      const planData = {
        tankSpecs: {
          length: wizardData.customSize?.length || '48',
          width: wizardData.customSize?.width || '18', 
          height: wizardData.customSize?.height || '20',
          tankSize: wizardData.tankSize,
          experienceLevel: wizardData.experienceLevel,
          goals: wizardData.tankTypeGoals
        },
        budgetTimeline: {
          budgetRange: wizardData.budgetRange,
          aestheticPreferences: wizardData.aestheticPreferences
        }
      };

      console.log('Formatted plan data:', planData);
      
      const generatedPlan = await generateSetupPlan(planData);
      console.log('Generated plan:', generatedPlan);
      
      toast({
        title: "Setup plan generated!",
        description: "Your custom aquarium plan is ready with step-by-step guidance",
      });

      return generatedPlan;
    } catch (error) {
      console.error('Plan generation error:', error);
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
