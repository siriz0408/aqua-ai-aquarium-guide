
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface SubscriptionAccess {
  has_access: boolean;
  access_type: 'admin' | 'paid' | 'free';
  subscription_tier: string;
  subscription_type: string;
  trial_hours_remaining: number;
  trial_type: string | null;
  can_start_trial: boolean;
  subscription_start_date: string | null;
  subscription_end_date: string | null;
  is_admin: boolean;
  admin_role: string | null;
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
        return {
          has_access: true,
          access_type: 'free',
          subscription_tier: 'free',
          subscription_type: 'monthly',
          trial_hours_remaining: 0,
          trial_type: null,
          can_start_trial: false,
          subscription_start_date: null,
          subscription_end_date: null,
          is_admin: false,
          admin_role: null
        };
      }

      console.log('Subscription access data:', profileData);

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
        subscription_type: profileData.subscription_type || 'monthly',
        trial_hours_remaining: 0,
        trial_type: null,
        can_start_trial: false,
        subscription_start_date: profileData.subscription_start_date,
        subscription_end_date: profileData.subscription_end_date,
        is_admin: profileData.is_admin || false,
        admin_role: profileData.admin_role
      };
    },
    enabled: !!user?.id,
    staleTime: 2 * 60 * 1000,
    refetchOnWindowFocus: true,
  });
};
