
import { supabase } from '@/integrations/supabase/client';
import type { UserProfile, TrialStatus } from '@/types/subscription';

export const fetchUserProfile = async (userId: string): Promise<UserProfile | null> => {
  if (!userId) return null;
  
  console.log('Fetching user profile for userId:', userId);
  
  // Check if user is admin using the safe function
  const { data: isAdmin, error: adminError } = await supabase
    .rpc('check_user_admin_status', { user_id: userId });

  if (adminError) {
    console.error('Error checking admin status:', adminError);
    // Continue with non-admin profile instead of throwing
  }

  console.log('Admin status check result:', isAdmin);

  // Get profile data from profiles table
  const { data: profileData, error: profileError } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();

  if (profileError && profileError.code !== 'PGRST116') {
    console.error('Error fetching profile:', profileError);
  }

  console.log('Raw profile data from database:', profileData);

  // Get trial status if not admin and not already a pro user with active subscription
  let trialStatus: TrialStatus | null = null;
  const hasActiveProSubscription = profileData?.subscription_tier === 'pro' && profileData?.subscription_status === 'active';
  
  console.log('Has active pro subscription check:', {
    subscription_tier: profileData?.subscription_tier,
    subscription_status: profileData?.subscription_status,
    hasActiveProSubscription
  });

  if (!isAdmin && !hasActiveProSubscription) {
    const { data: trialData, error: trialError } = await supabase
      .rpc('check_user_trial_status', { user_id: userId });
    
    if (!trialError && trialData && trialData.length > 0) {
      trialStatus = trialData[0];
      console.log('Trial status retrieved:', trialStatus);
    }
  }

  // Determine subscription status and tier
  let subscriptionStatus = 'free';
  let subscriptionTier = 'free';

  if (isAdmin) {
    subscriptionStatus = 'active';
    subscriptionTier = 'pro';
    console.log('User is admin, setting to active pro');
  } else if (profileData) {
    // For pro users with active subscription, use their actual status
    if (profileData.subscription_tier === 'pro' && profileData.subscription_status === 'active') {
      subscriptionStatus = 'active';
      subscriptionTier = 'pro';
      console.log('User has active pro subscription, using database values');
    } else {
      // Use profile data from database for non-pro users
      subscriptionStatus = profileData.subscription_status || 'free';
      subscriptionTier = profileData.subscription_tier || 'free';
      
      // Only override with trial status if user is NOT a pro user
      if (trialStatus && trialStatus.subscription_status === 'trial') {
        subscriptionStatus = 'trial';
        console.log('User is in trial, overriding status');
      }
    }
  } else if (trialStatus) {
    subscriptionStatus = trialStatus.subscription_status;
    console.log('No profile data, using trial status');
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

  console.log('Final user profile constructed:', profile);
  return profile;
};
