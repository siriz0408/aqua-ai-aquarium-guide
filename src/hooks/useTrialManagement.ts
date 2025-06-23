
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';

interface TrialStartResponse {
  success: boolean;
  error?: string;
  trial_length_days?: number;
  trial_end_date?: string;
}

export const useTrialManagement = () => {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();

  const startDatabaseTrial = async (trialLengthDays: number = 3) => {
    if (!user?.id) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to start your trial.",
        variant: "destructive",
      });
      return { success: false, error: 'Not authenticated' };
    }

    toast({
      title: "Feature Disabled",
      description: "Trial functionality has been disabled. All features are now free.",
      variant: "destructive",
    });
    
    return { success: false, error: 'Trial functionality disabled' };
  };

  const startStripeTrial = async (priceId: string, trialDays: number = 3) => {
    if (!user?.id) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to start your trial.",
        variant: "destructive",
      });
      return { success: false, error: 'Not authenticated' };
    }

    toast({
      title: "Feature Disabled",
      description: "Trial functionality has been disabled. All features are now free.",
      variant: "destructive",
    });
    
    return { success: false, error: 'Trial functionality disabled' };
  };

  return {
    startDatabaseTrial,
    startStripeTrial,
    isLoading
  };
};
