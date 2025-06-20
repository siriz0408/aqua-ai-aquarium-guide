
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { PRICING_PLANS } from '@/config/pricing';

interface DatabaseTrialResponse {
  success: boolean;
  error?: string;
  trial_end_date?: string;
  trial_type?: string;
  message?: string;
}

interface StripeCheckoutResponse {
  success: boolean;
  url?: string;
  error?: string;
}

export const useSimpleTrialManagement = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [lastError, setLastError] = useState<string | null>(null);
  const { toast } = useToast();
  const { user } = useAuth();

  const clearError = () => setLastError(null);

  const startDatabaseTrial = async (trialLengthDays: number = 3) => {
    if (!user?.id) {
      const error = 'Please sign in to start your trial.';
      setLastError(error);
      toast({
        title: "Authentication Required",
        description: error,
        variant: "destructive",
      });
      return { success: false, error };
    }

    setIsLoading(true);
    setLastError(null);

    try {
      console.log('Starting database trial for user:', user.id, 'days:', trialLengthDays);
      
      const { data, error } = await supabase.rpc('start_user_trial_safe', {
        user_id: user.id,
        trial_length_days: trialLengthDays,
        trial_type: 'database'
      });

      if (error) {
        console.error('Database trial start error:', error);
        setLastError(error.message);
        throw error;
      }

      console.log('Database trial start result:', data);

      // Type assertion for the response
      const result = data as DatabaseTrialResponse;

      if (result?.success) {
        toast({
          title: "Trial Started! 🎉",
          description: `Your ${trialLengthDays}-day free trial has begun. Enjoy full access to all features!`,
        });
        return { success: true, data: result };
      } else {
        const errorMsg = result?.error || "Unable to start trial";
        setLastError(errorMsg);
        toast({
          title: "Trial Not Available",
          description: errorMsg,
          variant: "destructive",
        });
        return { success: false, error: errorMsg };
      }
    } catch (error) {
      console.error('Trial start exception:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      setLastError(errorMessage);
      toast({
        title: "Trial Start Failed",
        description: errorMessage,
        variant: "destructive",
      });
      return { success: false, error: errorMessage };
    } finally {
      setIsLoading(false);
    }
  };

  const startStripeTrial = async (planId?: string) => {
    if (!user?.id) {
      const error = 'Please sign in to start your trial.';
      setLastError(error);
      toast({
        title: "Authentication Required",
        description: error,
        variant: "destructive",
      });
      return { success: false, error };
    }

    const plan = PRICING_PLANS.find(p => p.id === planId) || PRICING_PLANS[0];
    
    setIsLoading(true);
    setLastError(null);

    try {
      console.log('Starting Stripe trial with plan:', plan);
      
      const { data, error } = await supabase.functions.invoke('create-checkout', {
        body: { 
          priceId: plan.priceId,
          trialPeriodDays: plan.trialDays || 3
        }
      });

      if (error) {
        console.error('Stripe trial creation error:', error);
        const errorMsg = error.message || 'Failed to create checkout session';
        setLastError(errorMsg);
        toast({
          title: "Trial Setup Failed",
          description: errorMsg,
          variant: "destructive",
        });
        return { success: false, error: errorMsg };
      }

      // Type assertion for the response
      const result = data as StripeCheckoutResponse;

      if (result?.success && result?.url) {
        console.log('Redirecting to Stripe checkout for trial:', result.url);
        
        toast({
          title: "Redirecting to Checkout",
          description: `Starting your ${plan.trialDays || 3}-day free trial for ${plan.name}`,
        });

        // Open in new tab
        window.open(result.url, '_blank');
        return { success: true, data: result };
      } else {
        const errorMsg = result?.error || 'No checkout URL received from Stripe';
        setLastError(errorMsg);
        throw new Error(errorMsg);
      }
    } catch (error) {
      console.error('Stripe trial exception:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      setLastError(errorMessage);
      toast({
        title: "Trial Setup Failed",
        description: errorMessage,
        variant: "destructive",
      });
      return { success: false, error: errorMessage };
    } finally {
      setIsLoading(false);
    }
  };

  return {
    startDatabaseTrial,
    startStripeTrial,
    isLoading,
    lastError,
    clearError
  };
};
