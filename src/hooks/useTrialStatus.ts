
import { useQuery } from '@tanstack/react-query';
import type { UserProfile, TrialStatus } from '@/types/subscription';

export const useTrialStatus = (profile: UserProfile | undefined | null) => {
  return useQuery({
    queryKey: ['trial-status', profile?.id],
    queryFn: async (): Promise<TrialStatus> => {
      // No trials exist anymore - all features are free
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
