
import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { WizardData, WizardStep } from '@/components/setup-wizard/types/wizardTypes';

const STORAGE_KEY = 'planner-wizard-data';
const STEP_KEY = 'planner-wizard-step';

export const useWizardData = () => {
  const { toast } = useToast();
  const [currentStep, setCurrentStep] = useState(0);
  const [wizardData, setWizardData] = useState<WizardData>({
    tankSize: '',
    experienceLevel: '',
    budgetRange: '',
    tankTypeGoals: '',
    aestheticPreferences: ''
  });

  const steps: WizardStep[] = [
    { title: 'Tank Size', description: 'Choose your tank dimensions', key: 'tankSize' },
    { title: 'Experience Level', description: 'Tell us about your expertise', key: 'experienceLevel' },
    { title: 'Budget Range', description: 'Set your budget expectations', key: 'budgetRange' },
    { title: 'Tank Goals', description: 'What type of reef do you want?', key: 'tankTypeGoals' },
    { title: 'Aesthetic Style', description: 'Choose your preferred look', key: 'aestheticPreferences' }
  ];

  // Load saved data on mount
  useEffect(() => {
    const savedData = localStorage.getItem(STORAGE_KEY);
    const savedStep = localStorage.getItem(STEP_KEY);
    
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
    localStorage.setItem(STORAGE_KEY, JSON.stringify(wizardData));
    localStorage.setItem(STEP_KEY, currentStep.toString());
  }, [wizardData, currentStep]);

  const updateWizardData = (key: keyof WizardData, value: any) => {
    setWizardData(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const isStepValid = () => {
    const currentStepKey = steps[currentStep].key;
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

  const clearSavedData = () => {
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(STEP_KEY);
  };

  return {
    currentStep,
    setCurrentStep,
    wizardData,
    updateWizardData,
    steps,
    isStepValid,
    clearSavedData
  };
};
