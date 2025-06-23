
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

      // Since we removed the check_user_access function, just update the profile
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();
      
      if (profileError) {
        console.error('Error checking profile:', profileError);
        toast({
          title: "Access Check Failed",
          description: profileError.message,
          variant: "destructive",
        });
        return { success: false, message: profileError.message };
      }
      
      console.log('Profile data:', profileData);
      
      toast({
        title: "Access Refreshed",
        description: `User access updated. Status: ${profileData?.subscription_status || 'free'}`,
      });
      
      return { 
        success: true, 
        message: 'User access refreshed successfully',
        details: profileData 
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
