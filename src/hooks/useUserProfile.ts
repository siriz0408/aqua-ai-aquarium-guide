
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

      console.log('Profile data:', profileData);

      const profile: UserProfile = {
        id: user.id,
        email: profileData.email,
        full_name: profileData.full_name,
        role: profileData.role || 'user',
        subscription_status: profileData.subscription_status || 'expired',
        stripe_customer_id: profileData.stripe_customer_id,
        stripe_subscription_id: profileData.stripe_subscription_id,
        created_at: profileData.created_at,
        updated_at: profileData.updated_at,
      };

      console.log('Constructed user profile:', profile);
      return profile;
    },
    enabled: !!user?.id,
    retry: 2,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};
