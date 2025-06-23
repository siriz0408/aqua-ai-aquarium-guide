
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface SubscriptionAccess {
  has_access: boolean;
  access_type: 'admin' | 'paid' | 'trial' | 'trial_expired' | 'free' | 'no_user';
  subscription_tier: string;
  trial_hours_remaining: number;
  trial_type: string | null;
  can_start_trial: boolean;
  subscription_end_date: string | null;
}

export const useUserSubscriptionAccess = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['user-subscription-access', user?.id],
    queryFn: async (): Promise<SubscriptionAccess | null> => {
      if (!user?.id) return null;
      
      console.log('Checking comprehensive subscription access for user:', user.id);
      
      // Since we removed trial functionality, we'll use a simplified access check
      const { data, error } = await supabase.rpc('check_user_access', {
        user_id: user.id
      });

      if (error) {
        console.error('Error checking subscription access:', error);
        return null;
      }

      const accessData = data?.[0];
      if (!accessData) {
        // Default to free access since all features are now free
        return {
          has_access: true,
          access_type: 'free',
          subscription_tier: 'free',
          trial_hours_remaining: 0,
          trial_type: null,
          can_start_trial: false,
          subscription_end_date: null
        };
      }

      console.log('Subscription access data:', accessData);

      // Map the access_reason to access_type
      let accessType: SubscriptionAccess['access_type'] = 'free';
      switch (accessData.access_reason) {
        case 'admin':
          accessType = 'admin';
          break;
        case 'paid':
          accessType = 'paid';
          break;
        default:
          accessType = 'free';
      }

      return {
        has_access: true, // All features are now free
        access_type: accessType,
        subscription_tier: accessType === 'admin' ? 'pro' : 'free',
        trial_hours_remaining: 0,
        trial_type: null,
        can_start_trial: false,
        subscription_end_date: null
      };
    },
    enabled: !!user?.id,
    staleTime: 2 * 60 * 1000, // 2 minutes
    refetchOnWindowFocus: true,
  });
};
