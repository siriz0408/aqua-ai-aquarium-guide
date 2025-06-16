
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import TankSpecsStep from './TankSpecsStep';
import BudgetTimelineStep from './BudgetTimelineStep';

interface SetupWizardProps {
  onPlanGenerated: (planData: any) => void;
}

const SetupWizard: React.FC<SetupWizardProps> = ({ onPlanGenerated }) => {
  const [currentStep, setCurrentStep] = useState<number>(0);
  const [formData, setFormData] = useState({
    tankSpecs: {
      size: '',
      type: '',
      experience: '',
      goals: ''
    },
    budgetTimeline: {
      budget: '',
      timeline: '',
      hasEquipment: false,
      priorityFeatures: [] as string[]
    }
  });

  const steps = [
    {
      title: 'Tank Specifications',
      description: 'Tell us about your tank setup',
      component: TankSpecsStep
    },
    {
      title: 'Budget & Timeline',
      description: 'Set your budget and timeline preferences',
      component: BudgetTimelineStep
    }
  ];

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      // Generate plan
      onPlanGenerated(formData);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const updateFormData = (stepData: any) => {
    setFormData(prev => ({
      ...prev,
      ...stepData
    }));
  };

  const isStepValid = () => {
    switch (currentStep) {
      case 0:
        return formData.tankSpecs.size && formData.tankSpecs.type && formData.tankSpecs.experience;
      case 1:
        return formData.budgetTimeline.budget && formData.budgetTimeline.timeline;
      default:
        return false;
    }
  };

  const CurrentStepComponent = steps[currentStep].component;

  return (
    <div className="space-y-6">
      {/* Progress indicator */}
      <div className="flex items-center justify-between mb-8">
        {steps.map((step, index) => (
          <div key={index} className="flex items-center">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
              index <= currentStep 
                ? 'bg-primary text-primary-foreground' 
                : 'bg-muted text-muted-foreground'
            }`}>
              {index + 1}
            </div>
            {index < steps.length - 1 && (
              <div className={`w-12 h-0.5 mx-2 ${
                index < currentStep ? 'bg-primary' : 'bg-muted'
              }`} />
            )}
          </div>
        ))}
      </div>

      {/* Current step */}
      <Card>
        <CardHeader>
          <CardTitle>{steps[currentStep].title}</CardTitle>
          <CardDescription>{steps[currentStep].description}</CardDescription>
        </CardHeader>
        <CardContent>
          <CurrentStepComponent
            data={currentStep === 0 ? formData.tankSpecs : formData.budgetTimeline}
            onUpdate={updateFormData}
          />
        </CardContent>
      </Card>

      {/* Navigation */}
      <div className="flex justify-between">
        <Button
          variant="outline"
          onClick={handlePrevious}
          disabled={currentStep === 0}
        >
          <ChevronLeft className="mr-2 h-4 w-4" />
          Previous
        </Button>
        
        <Button
          onClick={handleNext}
          disabled={!isStepValid()}
        >
          {currentStep === steps.length - 1 ? 'Generate Plan' : 'Next'}
          {currentStep < steps.length - 1 && <ChevronRight className="ml-2 h-4 w-4" />}
        </Button>
      </div>
    </div>
  );
};

export default SetupWizard;
