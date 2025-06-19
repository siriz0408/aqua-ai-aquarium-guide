
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useAutoSave } from '@/hooks/useAutoSave';
import { AutoSaveIndicator } from '@/components/ui/auto-save-indicator';
import { useToast } from '@/hooks/use-toast';
import TankSpecsStep from './TankSpecsStep';
import BudgetTimelineStep from './BudgetTimelineStep';

interface SetupWizardProps {
  onPlanGenerated: (planData: any) => void;
}

const SetupWizard: React.FC<SetupWizardProps> = ({ onPlanGenerated }) => {
  const { toast } = useToast();
  const [currentStep, setCurrentStep] = useState<number>(0);
  const [tankSpecs, setTankSpecs] = useState({
    length: '',
    width: '',
    height: '',
    tankType: '',
    experience: '',
    location: '',
    goals: ''
  });
  
  const [budgetTimeline, setBudgetTimeline] = useState({
    totalBudget: '',
    setupBudget: '',
    timeline: '',
    priority: '',
    monthlyBudget: ''
  });

  // Auto-save for the entire wizard data
  const wizardData = { currentStep, tankSpecs, budgetTimeline };
  const autoSave = useAutoSave(wizardData, {
    key: 'setup-wizard',
    delay: 2000,
    onSave: async (data) => {
      console.log('Auto-saving wizard progress:', data);
    },
    enabled: true
  });

  // Load saved wizard data on mount
  useEffect(() => {
    const savedData = autoSave.loadFromLocalStorage();
    if (savedData) {
      setCurrentStep(savedData.currentStep || 0);
      setTankSpecs(savedData.tankSpecs || tankSpecs);
      setBudgetTimeline(savedData.budgetTimeline || budgetTimeline);
      toast({
        title: "Draft restored",
        description: "Your setup wizard progress has been restored",
      });
    }
  }, []);

  const steps = [
    {
      title: 'Tank Specifications',
      description: 'Tell us about your tank setup'
    },
    {
      title: 'Budget & Timeline',
      description: 'Set your budget and timeline preferences'
    }
  ];

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      // Generate plan with the collected data
      const formData = {
        tankSpecs,
        budgetTimeline
      };
      
      // Clear auto-save data after successful plan generation
      autoSave.clearLocalStorage();
      onPlanGenerated(formData);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleTankSpecChange = (key: string, value: string) => {
    setTankSpecs(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleBudgetChange = (key: string, value: string) => {
    setBudgetTimeline(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const isStepValid = () => {
    switch (currentStep) {
      case 0:
        return !!(tankSpecs.length && tankSpecs.width && tankSpecs.height && tankSpecs.tankType && tankSpecs.experience && tankSpecs.goals);
      case 1:
        return !!(budgetTimeline.totalBudget && budgetTimeline.setupBudget && budgetTimeline.timeline && budgetTimeline.priority);
      default:
        return false;
    }
  };

  return (
    <div className="space-y-6">
      {/* Auto-save indicator */}
      <div className="flex justify-end">
        <AutoSaveIndicator status={autoSave.status} />
      </div>

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
          {currentStep === 0 && (
            <TankSpecsStep
              specs={tankSpecs}
              onSpecChange={handleTankSpecChange}
              onNext={handleNext}
              isValid={isStepValid()}
            />
          )}
          
          {currentStep === 1 && (
            <BudgetTimelineStep
              budget={budgetTimeline}
              onBudgetChange={handleBudgetChange}
              onNext={handleNext}
              onPrev={handlePrevious}
              isValid={isStepValid()}
            />
          )}
        </CardContent>
      </Card>

      {/* Navigation - only show for first step since other steps handle their own navigation */}
      {currentStep === 0 && (
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
      )}
    </div>
  );
};

export default SetupWizard;
