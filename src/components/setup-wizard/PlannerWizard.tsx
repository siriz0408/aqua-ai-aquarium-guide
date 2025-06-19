
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import TankSizeStep from './steps/TankSizeStep';
import ExperienceLevelStep from './steps/ExperienceLevelStep';
import BudgetRangeStep from './steps/BudgetRangeStep';
import TankTypeGoalsStep from './steps/TankTypeGoalsStep';
import AestheticPreferencesStep from './steps/AestheticPreferencesStep';

interface PlannerWizardProps {
  onPlanGenerated: (planData: any) => void;
}

export interface WizardData {
  tankSize: string;
  customSize?: {
    length: string;
    width: string;
    height: string;
    gallons: string;
  };
  experienceLevel: string;
  budgetRange: string;
  tankTypeGoals: string;
  aestheticPreferences: string;
}

const PlannerWizard: React.FC<PlannerWizardProps> = ({ onPlanGenerated }) => {
  const { toast } = useToast();
  const [currentStep, setCurrentStep] = useState(0);
  const [wizardData, setWizardData] = useState<WizardData>({
    tankSize: '',
    experienceLevel: '',
    budgetRange: '',
    tankTypeGoals: '',
    aestheticPreferences: ''
  });

  const steps = [
    { title: 'Tank Size', description: 'Choose your tank dimensions', key: 'tankSize' },
    { title: 'Experience Level', description: 'Tell us about your expertise', key: 'experienceLevel' },
    { title: 'Budget Range', description: 'Set your budget expectations', key: 'budgetRange' },
    { title: 'Tank Goals', description: 'What type of reef do you want?', key: 'tankTypeGoals' },
    { title: 'Aesthetic Style', description: 'Choose your preferred look', key: 'aestheticPreferences' }
  ];

  // Load saved data on mount
  useEffect(() => {
    const savedData = localStorage.getItem('planner-wizard-data');
    const savedStep = localStorage.getItem('planner-wizard-step');
    
    if (savedData) {
      try {
        const parsed = JSON.parse(savedData);
        setWizardData(parsed);
        
        if (savedStep) {
          setCurrentStep(parseInt(savedStep));
        }
        
        toast({
          title: "Progress restored",
          description: "Your setup wizard progress has been restored",
        });
      } catch (error) {
        console.error('Error loading saved wizard data:', error);
      }
    }
  }, [toast]);

  // Save data when it changes
  useEffect(() => {
    localStorage.setItem('planner-wizard-data', JSON.stringify(wizardData));
    localStorage.setItem('planner-wizard-step', currentStep.toString());
  }, [wizardData, currentStep]);

  const updateWizardData = (key: keyof WizardData, value: any) => {
    setWizardData(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const isStepValid = () => {
    const currentStepKey = steps[currentStep].key as keyof WizardData;
    const value = wizardData[currentStepKey];
    
    if (currentStepKey === 'tankSize') {
      if (value === 'custom') {
        return wizardData.customSize && 
               wizardData.customSize.length && 
               wizardData.customSize.width && 
               wizardData.customSize.height;
      }
      return !!value;
    }
    
    return !!value;
  };

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      // Generate plan
      localStorage.removeItem('planner-wizard-data');
      localStorage.removeItem('planner-wizard-step');
      onPlanGenerated(wizardData);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const progressPercentage = ((currentStep + 1) / steps.length) * 100;

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 0:
        return (
          <TankSizeStep
            value={wizardData.tankSize}
            customSize={wizardData.customSize}
            onChange={(value, customSize) => {
              updateWizardData('tankSize', value);
              if (customSize) {
                updateWizardData('customSize', customSize);
              }
            }}
          />
        );
      case 1:
        return (
          <ExperienceLevelStep
            value={wizardData.experienceLevel}
            onChange={(value) => updateWizardData('experienceLevel', value)}
          />
        );
      case 2:
        return (
          <BudgetRangeStep
            value={wizardData.budgetRange}
            onChange={(value) => updateWizardData('budgetRange', value)}
          />
        );
      case 3:
        return (
          <TankTypeGoalsStep
            value={wizardData.tankTypeGoals}
            onChange={(value) => updateWizardData('tankTypeGoals', value)}
          />
        );
      case 4:
        return (
          <AestheticPreferencesStep
            value={wizardData.aestheticPreferences}
            onChange={(value) => updateWizardData('aestheticPreferences', value)}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      {/* Progress indicator */}
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

      {/* Current step content */}
      <Card className="animate-fade-in">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {steps[currentStep].title}
          </CardTitle>
          <CardDescription>{steps[currentStep].description}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="animate-scale-in">
            {renderCurrentStep()}
          </div>
        </CardContent>
      </Card>

      {/* Navigation */}
      <div className="flex justify-between">
        <Button
          variant="outline"
          onClick={handlePrevious}
          disabled={currentStep === 0}
          className="gap-2"
        >
          <ChevronLeft className="h-4 w-4" />
          Previous
        </Button>
        
        <Button
          onClick={handleNext}
          disabled={!isStepValid()}
          className="gap-2"
        >
          {currentStep === steps.length - 1 ? 'Generate Plan' : 'Next'}
          {currentStep < steps.length - 1 && <ChevronRight className="h-4 w-4" />}
        </Button>
      </div>
    </div>
  );
};

export default PlannerWizard;
