
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import type { UserProfile, TrialStatus } from '@/types/subscription';

export const useTrialStatus = (profile: UserProfile | undefined | null) => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['trial-status', user?.id],
    queryFn: async (): Promise<TrialStatus | null> => {
      if (!user?.id || profile?.is_admin) return null;
      
      console.log('Checking trial status with improved function...');
      
      // Use the new access check function
      const { data, error } = await supabase.rpc('check_user_access', { 
        user_id: user.id 
      });
      
      if (error) {
        console.error('Error checking user access:', error);
        return null;
      }
      
      console.log('User access check result:', data);
      
      if (data && data.length > 0) {
        const accessData = data[0];
        return {
          subscription_status: accessData.access_reason === 'trial' ? 'trial' : 'expired',
          trial_hours_remaining: accessData.trial_hours_remaining || 0,
          is_trial_expired: accessData.access_reason === 'trial_expired'
        };
      }
      
      return null;
    },
    enabled: !!user?.id && !!profile && !profile.is_admin,
    refetchInterval: 60000, // Refetch every minute to update trial countdown
  });
};
