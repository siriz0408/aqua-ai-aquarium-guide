
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';

export interface ManualSyncResult {
  success: boolean;
  message: string;
  details?: any;
}

export const useManualSync = () => {
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
      console.log('Starting manual sync for user:', targetEmail);
      
      const { data, error } = await supabase.rpc('admin_manual_sync_user', {
        requesting_admin_id: user.id,
        target_email: targetEmail,
        stripe_customer_id: stripeCustomerId,
        stripe_subscription_id: stripeSubscriptionId,
        subscription_status: subscriptionStatus
      });

      if (error) {
        console.error('Manual sync error:', error);
        const errorMessage = error.message || 'Failed to sync user subscription';
        toast({
          title: "Sync Failed",
          description: errorMessage,
          variant: "destructive",
        });
        return { success: false, message: errorMessage };
      }

      console.log('Manual sync result:', data);
      
      // Fix TypeScript errors by properly typing the response
      const syncData = data as any;
      
      if (syncData?.success) {
        toast({
          title: "Sync Successful",
          description: `Successfully synced subscription for ${targetEmail}`,
        });
        return { 
          success: true, 
          message: 'Subscription synced successfully',
          details: syncData 
        };
      } else {
        const errorMessage = syncData?.sync_result?.error || syncData?.error || 'Unknown sync error';
        toast({
          title: "Sync Failed",
          description: errorMessage,
          variant: "destructive",
        });
        return { success: false, message: errorMessage, details: syncData };
      }
    } catch (error) {
      console.error('Manual sync exception:', error);
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

  const refreshUserAccess = async (userId: string): Promise<ManualSyncResult> => {
    setIsLoading(true);
    try {
      console.log('Refreshing user access:', userId);
      
      // First ensure the user profile exists
      const { error: ensureError } = await supabase.rpc('ensure_user_profile', {
        user_id: userId
      });
      
      if (ensureError) {
        console.error('Error ensuring profile:', ensureError);
      }

      // Then check their access status
      const { data: accessData, error: accessError } = await supabase.rpc('check_user_access', {
        user_id: userId
      });
      
      if (accessError) {
        console.error('Error checking access:', accessError);
        toast({
          title: "Access Check Failed",
          description: accessError.message,
          variant: "destructive",
        });
        return { success: false, message: accessError.message };
      }
      
      console.log('Access check result:', accessData);
      
      toast({
        title: "Access Refreshed",
        description: `User access updated. Status: ${accessData?.[0]?.access_reason || 'unknown'}`,
      });
      
      return { 
        success: true, 
        message: 'User access refreshed successfully',
        details: accessData?.[0] 
      };
    } catch (error) {
      console.error('Refresh access exception:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      toast({
        title: "Refresh Error",
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
    refreshUserAccess,
    isLoading
  };
};
