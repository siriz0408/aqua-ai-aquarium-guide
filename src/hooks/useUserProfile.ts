
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
      
      console.log('Fetching user profile...');
      
      // Check if user is admin using the safe function
      const { data: isAdmin, error: adminError } = await supabase
        .rpc('check_user_admin_status', { user_id: user.id });

      if (adminError) {
        console.error('Error checking admin status:', adminError);
      }

      // Get profile data from profiles table
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (profileError && profileError.code !== 'PGRST116') {
        console.error('Error fetching profile:', profileError);
      }

      // Get trial status using new function
      let trialStatus = null;
      if (!isAdmin) {
        const { data: trialData, error: trialError } = await supabase
          .rpc('check_trial_status', { user_id: user.id });
        
        if (!trialError && trialData && trialData.length > 0) {
          trialStatus = trialData[0];
        }
      }

      // Determine subscription status based on new subscription_type field
      let subscriptionStatus = 'free';
      let subscriptionTier = 'free';

      if (isAdmin) {
        subscriptionStatus = 'active';
        subscriptionTier = 'pro';
      } else if (profileData) {
        // Use the new subscription_type field
        const subType = profileData.subscription_type || 'expired';
        
        if (subType === 'trial') {
          subscriptionStatus = 'trial';
          subscriptionTier = 'free';
        } else if (subType === 'paid') {
          subscriptionStatus = 'active';
          subscriptionTier = 'pro';
        } else {
          subscriptionStatus = 'expired';
          subscriptionTier = 'free';
        }
      }

      const profile: UserProfile = {
        id: user.id,
        subscription_status: subscriptionStatus as any,
        subscription_tier: subscriptionTier as any,
        trial_start_date: profileData?.trial_start_date,
        trial_end_date: profileData?.trial_end_date,
        subscription_start_date: profileData?.subscription_start_date,
        subscription_end_date: profileData?.subscription_end_date,
        is_admin: isAdmin || false,
        admin_role: isAdmin ? 'admin' : undefined,
      };

      console.log('User profile constructed:', profile);
      return profile;
    },
    enabled: !!user?.id,
    retry: 2,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};
