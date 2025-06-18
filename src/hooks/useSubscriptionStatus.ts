
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';

export const useSubscriptionStatus = () => {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();

  const checkSubscriptionStatus = async () => {
    if (!user?.id) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to check subscription status.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      console.log('Checking subscription status...');
      
      const { data, error } = await supabase.functions.invoke('check-subscription');

      if (error) {
        console.error('Subscription check error:', error);
        throw error;
      }

      console.log('Subscription check result:', data);
      
      toast({
        title: "Subscription Status Updated",
        description: data.subscribed ? 
          `Active subscription found (${data.subscription_tier})` : 
          "No active subscription found",
      });

      return data;
    } catch (error) {
      console.error('Error checking subscription:', error);
      toast({
        title: "Error",
        description: "Failed to check subscription status. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return {
    checkSubscriptionStatus,
    isLoading
  };
};
