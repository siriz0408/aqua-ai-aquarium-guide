
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import { useUserProfile } from './useUserProfile';

export const useUserSubscriptionAccess = () => {
  const { user } = useAuth();
  const { data: profile } = useUserProfile();

  return useQuery({
    queryKey: ['user-subscription-access', user?.id],
    queryFn: async () => {
      if (!user?.id || !profile) return {
        has_access: false,
        access_type: 'expired' as const,
        subscription_tier: 'free',
        trial_hours_remaining: 0,
        trial_type: null,
        can_start_trial: false,
        subscription_end_date: null
      };
      
      const accessType = profile.role === 'admin' ? 'admin' : 
                        profile.subscription_status === 'active' ? 'paid' : 'expired';

      return {
        has_access: profile.subscription_status === 'active' || profile.role === 'admin',
        access_type: accessType,
        subscription_tier: profile.subscription_status === 'active' ? 'pro' : 'free',
        trial_hours_remaining: 0,
        trial_type: null,
        can_start_trial: false,
        subscription_end_date: null
      };
    },
    enabled: !!user?.id && !!profile,
    staleTime: 2 * 60 * 1000,
    refetchOnWindowFocus: true,
  });
};
