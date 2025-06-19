
import React from 'react';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface WizardNavigationProps {
  currentStep: number;
  totalSteps: number;
  isStepValid: boolean;
  onPrevious: () => void;
  onNext: () => void;
}

export const WizardNavigation: React.FC<WizardNavigationProps> = ({
  currentStep,
  totalSteps,
  isStepValid,
  onPrevious,
  onNext
}) => {
  return (
    <div className="flex justify-between">
      <Button
        variant="outline"
        onClick={onPrevious}
        disabled={currentStep === 0}
        className="gap-2"
      >
        <ChevronLeft className="h-4 w-4" />
        Previous
      </Button>
      
      <Button
        onClick={onNext}
        disabled={!isStepValid}
        className="gap-2"
      >
        {currentStep === totalSteps - 1 ? 'Generate Plan' : 'Next'}
        {currentStep < totalSteps - 1 && <ChevronRight className="h-4 w-4" />}
      </Button>
    </div>
  );
};
