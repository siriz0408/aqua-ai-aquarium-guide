
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
        email: profileData.email,
        full_name: profileData.full_name,
        subscription_status: (profileData.subscription_status === 'active' ? 'active' : 
                             profileData.subscription_status === 'cancelled' ? 'cancelled' : 
                             profileData.subscription_status === 'expired' ? 'expired' : 'free') as 'free' | 'active' | 'cancelled' | 'expired',
        subscription_tier: (profileData.subscription_tier || 'free') as 'free' | 'pro',
        subscription_type: profileData.subscription_type as 'monthly' | 'yearly' | 'lifetime',
        subscription_start_date: profileData.subscription_start_date,
        subscription_end_date: profileData.subscription_end_date,
        trial_start_date: profileData.trial_start_date,
        trial_end_date: profileData.trial_end_date,
        stripe_customer_id: profileData.stripe_customer_id,
        stripe_subscription_id: profileData.stripe_subscription_id,
        stripe_price_id: profileData.stripe_price_id,
        is_admin: profileData.is_admin || false,
        admin_role: profileData.admin_role,
        admin_permissions: profileData.admin_permissions || [],
        last_admin_login: profileData.last_admin_login,
        last_active: profileData.last_active,
        request_admin_access: profileData.request_admin_access || false,
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
