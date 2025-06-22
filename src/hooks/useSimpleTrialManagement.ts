
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface TrialResult {
  success: boolean;
  url?: string;
  error?: string;
}

export const useSimpleTrialManagement = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [lastError, setLastError] = useState<string | null>(null);
  const { toast } = useToast();
  const { user } = useAuth();

  const startStripeTrial = async (planId: string): Promise<TrialResult> => {
    if (!user?.id || !user?.email) {
      const error = "Please sign in to start your subscription.";
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
      // Get the price ID based on plan ID - using the correct price IDs from config
      const priceId = planId === 'annual' ? 'price_1Rb8wD1d1AvgoBGoC8nfQXNK' : 'price_1Rb8vR1d1AvgoBGoNIjxLKRR';
      
      console.log('Calling create-checkout with:', {
        userId: user.id,
        email: user.email,
        priceId: priceId,
        planId: planId
      });

      const { data, error } = await supabase.functions.invoke('create-checkout', {
        body: { 
          userId: user.id,
          email: user.email,
          priceId: priceId
        }
      });

      if (error) {
        console.error('Supabase function error:', error);
        throw error;
      }

      if (data?.url) {
        console.log('Checkout URL received:', data.url);
        return { success: true, url: data.url };
      } else {
        console.error('No checkout URL in response:', data);
        throw new Error('No checkout URL returned');
      }
    } catch (error) {
      console.error('Trial start error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to start checkout';
      setLastError(errorMessage);
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
      return { success: false, error: errorMessage };
    } finally {
      setIsLoading(false);
    }
  };

  return {
    startStripeTrial,
    isLoading,
    lastError
  };
};
