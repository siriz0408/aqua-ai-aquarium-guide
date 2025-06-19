
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

export interface WizardStep {
  title: string;
  description: string;
  key: keyof WizardData;
}
