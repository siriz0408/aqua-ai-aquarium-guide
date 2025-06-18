
import { supabase } from '@/integrations/supabase/client';
import type { UserProfile, TrialStatus } from '@/types/subscription';

export const fetchUserProfile = async (userId: string): Promise<UserProfile | null> => {
  if (!userId) return null;
  
  console.log('Fetching user profile for credits hook...');
  
  // Check if user is admin using the safe function
  const { data: isAdmin, error: adminError } = await supabase
    .rpc('check_user_admin_status', { user_id: userId });

  if (adminError) {
    console.error('Error checking admin status:', adminError);
    // Continue with non-admin profile instead of throwing
  }

  // Get profile data from profiles table
  const { data: profileData, error: profileError } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();

  if (profileError && profileError.code !== 'PGRST116') {
    console.error('Error fetching profile:', profileError);
  }

  // Get trial status if not admin
  let trialStatus: TrialStatus | null = null;
  if (!isAdmin) {
    const { data: trialData, error: trialError } = await supabase
      .rpc('check_user_trial_status', { user_id: userId });
    
    if (!trialError && trialData && trialData.length > 0) {
      trialStatus = trialData[0];
    }
  }

  // Determine subscription status and tier
  let subscriptionStatus = 'free';
  let subscriptionTier = 'free';

  if (isAdmin) {
    subscriptionStatus = 'active';
    subscriptionTier = 'pro';
  } else if (profileData) {
    // Use profile data from database
    subscriptionStatus = profileData.subscription_status || 'free';
    subscriptionTier = profileData.subscription_tier || 'free';
    
    // Override with trial status if applicable
    if (trialStatus && trialStatus.subscription_status === 'trial') {
      subscriptionStatus = 'trial';
    }
  } else if (trialStatus) {
    subscriptionStatus = trialStatus.subscription_status;
  }

  const profile: UserProfile = {
    id: userId,
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
};
