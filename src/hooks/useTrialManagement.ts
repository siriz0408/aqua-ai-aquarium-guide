
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
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

    setIsLoading(true);
    try {
      console.log('Starting database trial for user:', user.id);
      
      const { data, error } = await supabase.rpc('start_user_trial_safe', {
        user_id: user.id,
        trial_length_days: trialLengthDays,
        trial_type: 'database'
      });

      if (error) {
        console.error('Database trial start error:', error);
        throw error;
      }

      console.log('Database trial start result:', data);

      // Type cast the response properly
      const result = data as unknown as TrialStartResponse;

      if (result?.success) {
        toast({
          title: "Trial Started! 🎉",
          description: `Your ${trialLengthDays}-day free trial has begun. Enjoy full access to all features!`,
        });
        return { success: true, data: result };
      } else {
        toast({
          title: "Trial Not Available",
          description: result?.error || "Unable to start trial",
          variant: "destructive",
        });
        return { success: false, error: result?.error || "Unknown error" };
      }
    } catch (error) {
      console.error('Trial start exception:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
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

  const startStripeTrial = async (priceId: string, trialDays: number = 3) => {
    if (!user?.id) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to start your trial.",
        variant: "destructive",
      });
      return { success: false, error: 'Not authenticated' };
    }

    setIsLoading(true);
    try {
      console.log('Starting Stripe trial with price ID:', priceId);
      
      const { data, error } = await supabase.functions.invoke('create-checkout', {
        body: { 
          priceId: priceId,
          trialPeriodDays: trialDays
        }
      });

      if (error) {
        console.error('Stripe trial creation error:', error);
        toast({
          title: "Trial Setup Failed",
          description: "Unable to setup trial. Please try again.",
          variant: "destructive",
        });
        return { success: false, error: error.message };
      }

      if (data?.url) {
        console.log('Redirecting to Stripe checkout for trial:', data.url);
        window.location.href = data.url;
        return { success: true, data };
      } else {
        throw new Error('No checkout URL received from Stripe');
      }
    } catch (error) {
      console.error('Stripe trial exception:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
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
    isLoading
  };
};
