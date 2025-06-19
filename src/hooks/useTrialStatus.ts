
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { UserProfile, TrialStatus } from '@/types/subscription';

export const useTrialStatus = (profile: UserProfile | undefined | null) => {
  return useQuery({
    queryKey: ['trial-status', profile?.id],
    queryFn: async (): Promise<TrialStatus> => {
      if (!profile?.id) {
        return {
          isTrialActive: false,
          hoursRemaining: 0,
          isTrialExpired: false
        };
      }

      // Use the database function to check user access and trial status
      const { data, error } = await supabase.rpc('check_user_access', {
        user_id: profile.id
      });

      if (error) {
        console.error('Error checking user access:', error);
        return {
          isTrialActive: false,
          hoursRemaining: 0,
          isTrialExpired: false
        };
      }

      const accessData = data?.[0];
      if (!accessData) {
        return {
          isTrialActive: false,
          hoursRemaining: 0,
          isTrialExpired: false
        };
      }

      const isTrialActive = accessData.access_reason === 'trial' && accessData.has_access;
      const isTrialExpired = accessData.access_reason === 'trial_expired';
      const hoursRemaining = accessData.trial_hours_remaining || 0;

      return {
        isTrialActive,
        hoursRemaining,
        isTrialExpired
      };
    },
    enabled: !!profile?.id,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};
