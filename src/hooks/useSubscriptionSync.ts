
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface SyncResult {
  success: boolean;
  error?: string;
  user_id?: string;
  email?: string;
  old_status?: string;
  new_status?: string;
  updated_at?: string;
}

export const useSubscriptionSync = () => {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const syncUserSubscription = async (
    email: string,
    stripeCustomerId: string,
    stripeSubscriptionId?: string,
    subscriptionStatus: string = 'active'
  ): Promise<SyncResult> => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.rpc('sync_stripe_subscription', {
        customer_email: email,
        stripe_customer_id: stripeCustomerId,
        stripe_subscription_id: stripeSubscriptionId || null,
        subscription_status: subscriptionStatus
      });

      if (error) {
        throw error;
      }

      const result = data as SyncResult;
      if (result?.success) {
        toast({
          title: "Sync Successful",
          description: `Updated subscription for ${email}`,
        });
        return result;
      } else {
        throw new Error(result?.error || 'Sync failed');
      }
    } catch (error) {
      console.error('Sync error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      toast({
        title: "Sync Failed",
        description: errorMessage,
        variant: "destructive",
      });
      return { success: false, error: errorMessage };
    } finally {
      setIsLoading(false);
    }
  };

  return {
    syncUserSubscription,
    isLoading
  };
};
