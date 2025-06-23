
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
      
      const { data, error } = await supabase.rpc('check_user_subscription_access', {
        user_id: user.id
      });

      if (error) {
        console.error('Error checking subscription access:', error);
        return null;
      }

      const accessData = data?.[0];
      if (!accessData) return null;

      console.log('Subscription access data:', accessData);

      // Ensure access_type is properly typed
      const validAccessTypes = ['admin', 'paid', 'trial', 'trial_expired', 'free', 'no_user'] as const;
      const accessType = validAccessTypes.includes(accessData.access_type as any) 
        ? accessData.access_type as SubscriptionAccess['access_type']
        : 'free' as const;

      return {
        has_access: accessData.has_access,
        access_type: accessType,
        subscription_tier: accessData.subscription_tier,
        trial_hours_remaining: accessData.trial_hours_remaining || 0,
        trial_type: accessData.trial_type,
        can_start_trial: accessData.can_start_trial,
        subscription_end_date: accessData.subscription_end_date
      };
    },
    enabled: !!user?.id,
    staleTime: 2 * 60 * 1000, // 2 minutes
    refetchOnWindowFocus: true,
  });
};
