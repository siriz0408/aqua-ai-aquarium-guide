
import React, { useState } from 'react';
import WizardStep from './WizardStep';
import TankSpecsStep from './TankSpecsStep';
import BudgetTimelineStep from './BudgetTimelineStep';

interface SetupWizardProps {
  onPlanGenerated: (planData: any) => void;
}

const SetupWizard: React.FC<SetupWizardProps> = ({ onPlanGenerated }) => {
  const [currentStep, setCurrentStep] = useState<number>(1);
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

  const handleSpecChange = (key: keyof typeof tankSpecs, value: string) => {
    setTankSpecs(prev => ({ ...prev, [key]: value }));
  };

  const handleBudgetChange = (key: keyof typeof budgetTimeline, value: string) => {
    setBudgetTimeline(prev => ({ ...prev, [key]: value }));
  };

  const isTankSpecsValid = () => {
    return tankSpecs.length && tankSpecs.width && tankSpecs.height && 
           tankSpecs.tankType && tankSpecs.experience && tankSpecs.goals;
  };

  const isBudgetValid = () => {
    return budgetTimeline.totalBudget && budgetTimeline.setupBudget && 
           budgetTimeline.timeline && budgetTimeline.priority;
  };

  const generatePlan = () => {
    const planData = {
      tankSpecs,
      budgetTimeline,
      timestamp: new Date().toISOString()
    };
    onPlanGenerated(planData);
  };

  const goToStep = (step: number) => {
    setCurrentStep(step);
  };

  const steps = [
    {
      number: 1,
      title: "Tank Specifications",
      description: "Define your tank size, type, and goals"
    },
    {
      number: 2,
      title: "Budget & Timeline",
      description: "Set your budget and timeline preferences"
    }
  ];

  return (
    <div className="space-y-6">
      {/* Progress Steps */}
      <div className="grid grid-cols-2 gap-4">
        {steps.map((step) => (
          <div
            key={step.number}
            className={`p-4 rounded-lg border-2 transition-all ${
              currentStep === step.number
                ? 'border-primary bg-primary/5'
                : currentStep > step.number
                ? 'border-green-500 bg-green-50 dark:bg-green-900/20'
                : 'border-muted bg-muted/20'
            }`}
          >
            <div className="flex items-center gap-3">
              <div className={`flex items-center justify-center w-6 h-6 rounded-full text-xs font-medium ${
                currentStep > step.number
                  ? 'bg-green-500 text-white'
                  : currentStep === step.number
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted text-muted-foreground'
              }`}>
                {currentStep > step.number ? '✓' : step.number}
              </div>
              <div>
                <h4 className="font-medium text-sm">{step.title}</h4>
                <p className="text-xs text-muted-foreground">{step.description}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Step Content */}
      <WizardStep
        title={steps[0].title}
        description={steps[0].description}
        stepNumber={1}
        isActive={currentStep === 1}
        isCompleted={currentStep > 1}
      >
        <TankSpecsStep
          specs={tankSpecs}
          onSpecChange={handleSpecChange}
          onNext={() => goToStep(2)}
          isValid={isTankSpecsValid()}
        />
      </WizardStep>

      <WizardStep
        title={steps[1].title}
        description={steps[1].description}
        stepNumber={2}
        isActive={currentStep === 2}
        isCompleted={currentStep > 2}
      >
        <BudgetTimelineStep
          budget={budgetTimeline}
          onBudgetChange={handleBudgetChange}
          onNext={generatePlan}
          onPrev={() => goToStep(1)}
          isValid={isBudgetValid()}
        />
      </WizardStep>
    </div>
  );
};

export default SetupWizard;
