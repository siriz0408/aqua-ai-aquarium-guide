
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface SubscriptionAccess {
  has_access: boolean;
  access_type: 'admin' | 'paid' | 'free';
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
      
      console.log('Checking subscription access for user:', user.id);
      
      const { data: profileData, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (error) {
        console.error('Error checking subscription access:', error);
        return null;
      }

      if (!profileData) {
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

      console.log('Subscription access data:', profileData);

      // Determine access type
      let accessType: SubscriptionAccess['access_type'] = 'free';
      if (profileData.is_admin) {
        accessType = 'admin';
      } else if (profileData.subscription_status === 'active' && profileData.subscription_tier === 'pro') {
        accessType = 'paid';
      }

      return {
        has_access: true, // All features are now free
        access_type: accessType,
        subscription_tier: profileData.subscription_tier || 'free',
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
