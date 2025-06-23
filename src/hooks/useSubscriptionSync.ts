
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';

interface ManualSyncResult {
  success: boolean;
  message: string;
  details?: any;
}

export const useSubscriptionSync = () => {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();

  const syncUserSubscription = async (
    targetEmail: string,
    stripeCustomerId: string,
    stripeSubscriptionId: string,
    subscriptionStatus: string = 'active'
  ): Promise<ManualSyncResult> => {
    if (!user?.id) {
      return { success: false, message: 'User not authenticated' };
    }

    setIsLoading(true);
    try {
      console.log('Starting subscription sync:', {
        targetEmail,
        stripeCustomerId,
        stripeSubscriptionId,
        subscriptionStatus
      });
      
      const { data, error } = await supabase.rpc('sync_stripe_subscription', {
        customer_email: targetEmail,
        stripe_customer_id: stripeCustomerId,
        stripe_subscription_id: stripeSubscriptionId || null,
        subscription_status: subscriptionStatus
      });

      if (error) {
        console.error('Subscription sync error:', error);
        const errorMessage = error.message || 'Failed to sync user subscription';
        toast({
          title: "Sync Failed",
          description: errorMessage,
          variant: "destructive",
        });
        return { success: false, message: errorMessage };
      }

      console.log('Subscription sync result:', data);
      
      if (data?.success) {
        toast({
          title: "Sync Successful",
          description: `Successfully synced subscription for ${targetEmail}`,
        });
        return { 
          success: true, 
          message: 'Subscription synced successfully',
          details: data 
        };
      } else {
        const errorMessage = data?.error || 'Unknown sync error';
        toast({
          title: "Sync Failed",
          description: errorMessage,
          variant: "destructive",
        });
        return { success: false, message: errorMessage, details: data };
      }
    } catch (error) {
      console.error('Subscription sync exception:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      toast({
        title: "Sync Error",
        description: errorMessage,
        variant: "destructive",
      });
      return { success: false, message: errorMessage };
    } finally {
      setIsLoading(false);
    }
  };

  return {
    syncUserSubscription,
    isLoading
  };
};
