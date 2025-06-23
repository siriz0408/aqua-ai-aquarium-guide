
import { useQuery } from '@tanstack/react-query';
import type { UserProfile } from '@/types/subscription';

interface TrialStatus {
  isTrialActive: boolean;
  hoursRemaining: number;
  isTrialExpired: boolean;
}

export const useTrialStatus = (profile: UserProfile | undefined | null) => {
  return useQuery({
    queryKey: ['trial-status', profile?.id],
    queryFn: async (): Promise<TrialStatus> => {
      // No trials in simplified model
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
