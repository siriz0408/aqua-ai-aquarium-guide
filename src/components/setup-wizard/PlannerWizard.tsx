
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { WizardProgress } from './WizardProgress';
import { WizardNavigation } from './WizardNavigation';
import { WizardStepRenderer } from './WizardStepRenderer';
import { useWizardData } from '@/hooks/useWizardData';

interface PlannerWizardProps {
  onPlanGenerated: (planData: any) => void;
}

const PlannerWizard: React.FC<PlannerWizardProps> = ({ onPlanGenerated }) => {
  const {
    currentStep,
    setCurrentStep,
    wizardData,
    updateWizardData,
    steps,
    isStepValid,
    clearSavedData
  } = useWizardData();

  const handleNext = async () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      // Generate plan - this is the final step
      console.log('Generating plan with wizard data:', wizardData);
      clearSavedData();
      
      try {
        await onPlanGenerated(wizardData);
      } catch (error) {
        console.error('Error in plan generation:', error);
      }
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

  return (
    <div className="space-y-6">
      <WizardProgress currentStep={currentStep} steps={steps} />

      <Card className="animate-fade-in">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {steps[currentStep].title}
          </CardTitle>
          <CardDescription>{steps[currentStep].description}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="animate-scale-in">
            <WizardStepRenderer
              currentStep={currentStep}
              wizardData={wizardData}
              onUpdateData={updateWizardData}
            />
          </div>
        </CardContent>
      </Card>

      <WizardNavigation
        currentStep={currentStep}
        totalSteps={steps.length}
        isStepValid={isStepValid()}
        onPrevious={handlePrevious}
        onNext={handleNext}
      />
    </div>
  );
};

export default PlannerWizard;
