
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import type { ManualSyncResult } from './types/manualSyncTypes';

export const useUserAccessRefresh = () => {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const refreshUserAccess = async (userId: string): Promise<ManualSyncResult> => {
    setIsLoading(true);
    try {
      console.log('Refreshing user access:', userId);
      
      // Ensure the user profile exists
      const { error: ensureError } = await supabase.rpc('ensure_user_profile', {
        user_id: userId
      });
      
      if (ensureError) {
        console.error('Error ensuring profile:', ensureError);
      }

      // Check their access status using the updated function
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
    refreshUserAccess,
    isLoading
  };
};
