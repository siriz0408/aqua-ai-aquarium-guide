
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import type { UserProfile } from '@/types/subscription';

export const useUserProfile = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['user-profile', user?.id],
    queryFn: async (): Promise<UserProfile | null> => {
      if (!user?.id) return null;
      
      console.log('Fetching user profile for:', user.id);

      // Get profile data from profiles table
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (profileError) {
        console.error('Error fetching profile:', profileError);
        return null;
      }

      if (!profileData) {
        console.log('No profile found');
        return null;
      }

      console.log('Raw profile data from database:', profileData);

      const profile: UserProfile = {
        id: user.id,
        full_name: profileData.full_name,
        subscription_status: (profileData.subscription_status === 'active' ? 'active' : 
                             profileData.subscription_status === 'cancelled' ? 'cancelled' : 'free') as 'free' | 'active' | 'cancelled',
        subscription_tier: (profileData.subscription_tier || 'free') as 'free' | 'pro',
        subscription_start_date: profileData.subscription_start_date,
        is_admin: profileData.is_admin || false,
        admin_role: profileData.admin_role,
      };

      console.log('Constructed user profile:', profile);
      return profile;
    },
    enabled: !!user?.id,
    retry: 2,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};
