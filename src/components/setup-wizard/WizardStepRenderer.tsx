
import React from 'react';
import { WizardData } from './types/wizardTypes';
import TankSizeStep from './steps/TankSizeStep';
import ExperienceLevelStep from './steps/ExperienceLevelStep';
import BudgetRangeStep from './steps/BudgetRangeStep';
import TankTypeGoalsStep from './steps/TankTypeGoalsStep';
import AestheticPreferencesStep from './steps/AestheticPreferencesStep';

interface WizardStepRendererProps {
  currentStep: number;
  wizardData: WizardData;
  onUpdateData: (key: keyof WizardData, value: any) => void;
}

export const WizardStepRenderer: React.FC<WizardStepRendererProps> = ({
  currentStep,
  wizardData,
  onUpdateData
}) => {
  switch (currentStep) {
    case 0:
      return (
        <TankSizeStep
          value={wizardData.tankSize}
          customSize={wizardData.customSize}
          onChange={(value, customSize) => {
            onUpdateData('tankSize', value);
            if (customSize) {
              onUpdateData('customSize', customSize);
            }
          }}
        />
      );
    case 1:
      return (
        <ExperienceLevelStep
          value={wizardData.experienceLevel}
          onChange={(value) => onUpdateData('experienceLevel', value)}
        />
      );
    case 2:
      return (
        <BudgetRangeStep
          value={wizardData.budgetRange}
          onChange={(value) => onUpdateData('budgetRange', value)}
        />
      );
    case 3:
      return (
        <TankTypeGoalsStep
          value={wizardData.tankTypeGoals}
          onChange={(value) => onUpdateData('tankTypeGoals', value)}
        />
      );
    case 4:
      return (
        <AestheticPreferencesStep
          value={wizardData.aestheticPreferences}
          onChange={(value) => onUpdateData('aestheticPreferences', value)}
        />
      );
    default:
      return null;
  }
};
