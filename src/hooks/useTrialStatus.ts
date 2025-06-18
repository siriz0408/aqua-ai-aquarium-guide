
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import type { UserProfile, TrialStatus } from '@/types/subscription';

export const useTrialStatus = (profile: UserProfile | undefined | null) => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['trial-status', user?.id],
    queryFn: async (): Promise<TrialStatus | null> => {
      if (!user?.id || profile?.is_admin) return null;
      
      const { data, error } = await supabase
        .rpc('check_user_trial_status', { user_id: user.id });
      
      if (error) {
        console.error('Error fetching trial status:', error);
        return null;
      }
      
      return data && data.length > 0 ? data[0] : null;
    },
    enabled: !!user?.id && !!profile && !profile.is_admin,
    refetchInterval: 60000, // Refetch every minute to update trial countdown
  });
};
