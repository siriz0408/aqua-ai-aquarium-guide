
import { useQuery } from '@tanstack/react-query';
import type { UserProfile, TrialStatus } from '@/types/subscription';

export const useTrialStatus = (profile: UserProfile | undefined | null) => {
  return useQuery({
    queryKey: ['trial-status', profile?.id],
    queryFn: async (): Promise<TrialStatus> => {
      return {
        isTrialActive: false,
        hoursRemaining: 0,
        isTrialExpired: false
      };
    },
    enabled: !!profile?.id,
    staleTime: 5 * 60 * 1000,
  });
};
