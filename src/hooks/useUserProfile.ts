
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
      
      console.log('Fetching user profile with improved function...');
      
      // First ensure the profile exists using the new function
      const { error: ensureError } = await supabase.rpc('ensure_user_profile', {
        user_id: user.id
      });
      
      if (ensureError) {
        console.error('Error ensuring profile exists:', ensureError);
      }

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
        console.log('No profile found even after ensuring it exists');
        return null;
      }

      console.log('Raw profile data from database:', profileData);

      const profile: UserProfile = {
        id: user.id,
        subscription_status: (profileData.subscription_status || 'free') as 'free' | 'trial' | 'active' | 'expired',
        subscription_tier: (profileData.subscription_tier || 'free') as 'free' | 'pro',
        trial_start_date: profileData.trial_start_date,
        trial_end_date: profileData.trial_end_date,
        subscription_start_date: profileData.subscription_start_date,
        subscription_end_date: profileData.subscription_end_date,
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
