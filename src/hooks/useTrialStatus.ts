
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

      // Since we simplified the schema, we'll check trial status directly from profile
      if (profile.trial_start_date && profile.trial_end_date) {
        const now = new Date();
        const trialEnd = new Date(profile.trial_end_date);
        const isExpired = now > trialEnd;
        const hoursRemaining = isExpired ? 0 : Math.max(0, (trialEnd.getTime() - now.getTime()) / (1000 * 60 * 60));

        return {
          isTrialActive: !isExpired && profile.subscription_status === 'trial',
          hoursRemaining,
          isTrialExpired: isExpired
        };
      }

      return {
        isTrialActive: false,
        hoursRemaining: 0,
        isTrialExpired: false
      };
    },
    enabled: !!profile?.id,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};
