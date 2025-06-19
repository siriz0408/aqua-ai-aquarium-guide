
import React from 'react';
import { Progress } from '@/components/ui/progress';
import { WizardStep } from './types/wizardTypes';

interface WizardProgressProps {
  currentStep: number;
  steps: WizardStep[];
}

export const WizardProgress: React.FC<WizardProgressProps> = ({ currentStep, steps }) => {
  const progressPercentage = ((currentStep + 1) / steps.length) * 100;

  return (
    <div className="space-y-2">
      <div className="flex justify-between text-sm text-muted-foreground">
        <span>Step {currentStep + 1} of {steps.length}</span>
        <span>{Math.round(progressPercentage)}% Complete</span>
      </div>
      <Progress value={progressPercentage} className="h-2" />
      
      {/* Step indicators */}
      <div className="flex items-center justify-between mt-4">
        {steps.map((step, index) => (
          <div key={index} className="flex flex-col items-center space-y-2">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-all duration-300 ${
              index < currentStep 
                ? 'bg-green-500 text-white' 
                : index === currentStep
                  ? 'bg-primary text-primary-foreground ring-2 ring-primary/20'
                  : 'bg-muted text-muted-foreground'
            }`}>
              {index < currentStep ? '✓' : index + 1}
            </div>
            <span className={`text-xs text-center max-w-16 ${
              index === currentStep ? 'text-primary font-medium' : 'text-muted-foreground'
            }`}>
              {step.title}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};
