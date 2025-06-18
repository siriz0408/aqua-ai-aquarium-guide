
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

      // If no profile exists, create one with trial status
      if (!profileData) {
        console.log('No profile found, creating trial profile...');
        const { data: newProfile, error: createError } = await supabase
          .from('profiles')
          .insert({
            id: user.id,
            email: user.email,
            subscription_status: 'trial',
            subscription_tier: 'free',
            subscription_type: 'trial',
            trial_start_date: new Date().toISOString(),
            trial_end_date: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
          })
          .select()
          .single();

        if (createError) {
          console.error('Error creating profile:', createError);
          // Return default profile if creation fails
          return {
            id: user.id,
            subscription_status: 'trial',
            subscription_tier: 'free',
            trial_start_date: new Date().toISOString(),
            trial_end_date: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
            subscription_start_date: undefined,
            subscription_end_date: undefined,
            is_admin: isAdmin || false,
            admin_role: undefined,
          };
        }
        
        console.log('Created new trial profile:', newProfile);
        return {
          id: user.id,
          subscription_status: newProfile.subscription_status as any,
          subscription_tier: newProfile.subscription_tier as any,
          trial_start_date: newProfile.trial_start_date,
          trial_end_date: newProfile.trial_end_date,
          subscription_start_date: newProfile.subscription_start_date,
          subscription_end_date: newProfile.subscription_end_date,
          is_admin: isAdmin || false,
          admin_role: isAdmin ? 'admin' : undefined,
        };
      }

      // Determine subscription status based on database fields
      let subscriptionStatus = profileData.subscription_status || 'free';
      let subscriptionTier = profileData.subscription_tier || 'free';

      // Admin users always have active pro access
      if (isAdmin) {
        subscriptionStatus = 'active';
        subscriptionTier = 'pro';
      } else {
        // For non-admin users, check the current subscription state
        if (profileData.stripe_subscription_id && 
            profileData.subscription_status === 'active' && 
            profileData.subscription_tier === 'pro') {
          // User has active paid subscription via Stripe
          subscriptionStatus = 'active';
          subscriptionTier = 'pro';
        } else if (profileData.subscription_type === 'paid' && 
                   profileData.subscription_status === 'active') {
          // User has active paid subscription
          subscriptionStatus = 'active';
          subscriptionTier = 'pro';
        } else if (profileData.subscription_type === 'trial') {
          // Check if trial is still valid
          const trialEndDate = new Date(profileData.trial_end_date);
          const now = new Date();
          
          if (trialEndDate > now) {
            subscriptionStatus = 'trial';
            subscriptionTier = 'free';
          } else {
            // Trial has expired, update the profile
            await supabase
              .from('profiles')
              .update({
                subscription_status: 'expired',
                subscription_type: 'expired',
                updated_at: new Date().toISOString()
              })
              .eq('id', user.id);
              
            subscriptionStatus = 'expired';
            subscriptionTier = 'free';
          }
        } else {
          // Default to expired/free for unclear states
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
      console.log('Raw profile data:', profileData);
      return profile;
    },
    enabled: !!user?.id,
    retry: 2,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};
