
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';

export const useUserProfileSetup = () => {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();

  const setupMonthlyProPlan = async (userId: string) => {
    if (!user?.id) {
      throw new Error('User not authenticated');
    }

    setIsLoading(true);
    try {
      console.log('Setting up monthly pro plan for user:', userId);
      
      // Update user profile to pro tier with monthly subscription
      const { error: updateError } = await supabase
        .from('profiles')
        .update({
          subscription_status: 'active',
          subscription_tier: 'pro',
          subscription_start_date: new Date().toISOString(),
          subscription_end_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days from now
          updated_at: new Date().toISOString()
        })
        .eq('id', userId);

      if (updateError) {
        console.error('Error updating user profile:', updateError);
        throw updateError;
      }

      console.log('Monthly pro plan setup completed');
      
      toast({
        title: "Success",
        description: "Monthly Pro plan has been activated successfully!",
      });

      return { success: true };
    } catch (error) {
      console.error('Error setting up monthly pro plan:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      
      toast({
        title: "Error",
        description: `Failed to setup pro plan: ${errorMessage}`,
        variant: "destructive",
      });
      
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    setupMonthlyProPlan,
    isLoading
  };
};
