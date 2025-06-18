
import type { UserProfile, TrialStatus, SubscriptionInfo } from '@/types/subscription';

export const canUserAccessFeature = (profile: UserProfile | null, trialStatus: TrialStatus | null, feature: string = 'chat'): boolean => {
  console.log('=== CHECKING FEATURE ACCESS ===');
  console.log('Profile:', profile);
  console.log('Trial Status:', trialStatus);
  console.log('Feature:', feature);
  
  if (!profile) {
    console.log('❌ Feature access denied: No profile found');
    return false;
  }
  
  // Admins always have access
  if (profile.is_admin) {
    console.log('✅ Feature access granted: User is admin');
    return true;
  }
  
  // Users with active PRO subscription have access
  if (profile.subscription_tier === 'pro' && profile.subscription_status === 'active') {
    console.log('✅ Feature access granted: Active pro subscription');
    console.log('Subscription details:', {
      tier: profile.subscription_tier,
      status: profile.subscription_status
    });
    return true;
  }
  
  // Users in active trial period have access
  if (profile.subscription_status === 'trial' && trialStatus && !trialStatus.is_trial_expired && trialStatus.trial_hours_remaining > 0) {
    console.log('✅ Feature access granted: Active trial');
    return true;
  }
  
  console.log('❌ Feature access denied: No valid subscription, trial, or admin status');
  console.log('Current state:', {
    subscriptionStatus: profile.subscription_status,
    subscriptionTier: profile.subscription_tier,
    isAdmin: profile.is_admin,
    isTrialExpired: trialStatus?.is_trial_expired,
    trialHoursRemaining: trialStatus?.trial_hours_remaining
  });
  return false;
};

export const doesUserNeedUpgrade = (profile: UserProfile | null, trialStatus: TrialStatus | null): boolean => {
  console.log('=== CHECKING IF USER NEEDS UPGRADE ===');
  console.log('Profile:', profile);
  console.log('Trial Status:', trialStatus);
  
  if (!profile) {
    console.log('✅ Upgrade needed: No profile');
    return true;
  }
  
  // Admins never need upgrade
  if (profile.is_admin) {
    console.log('❌ No upgrade needed: User is admin');
    return false;
  }
  
  // Check if user has active pro subscription
  if (profile.subscription_tier === 'pro' && profile.subscription_status === 'active') {
    console.log('❌ No upgrade needed: Active pro subscription');
    console.log('Subscription details:', {
      tier: profile.subscription_tier,
      status: profile.subscription_status
    });
    return false;
  }
  
  // Check if user is in active trial
  if (profile.subscription_status === 'trial' && trialStatus && !trialStatus.is_trial_expired && trialStatus.trial_hours_remaining > 0) {
    console.log('❌ No upgrade needed: Active trial');
    return false;
  }
  
  console.log('✅ Upgrade needed');
  return true;
};

export const buildSubscriptionInfo = (profile: UserProfile | null, trialStatus: TrialStatus | null): SubscriptionInfo => {
  console.log('=== BUILDING SUBSCRIPTION INFO ===');
  console.log('Profile:', profile);
  console.log('Trial Status:', trialStatus);
  
  if (!profile) {
    const info = {
      tier: 'free',
      status: 'free',
      hasAccess: false,
      isAdmin: false,
      isTrial: false,
      trialHoursRemaining: 0,
      displayTier: 'Free'
    };
    console.log('No profile, returning default info:', info);
    return info;
  }

  const isTrial = profile.subscription_status === 'trial';
  const hasAccess = profile.is_admin || 
    (profile.subscription_tier === 'pro' && profile.subscription_status === 'active') ||
    (isTrial && trialStatus && !trialStatus.is_trial_expired && trialStatus.trial_hours_remaining > 0);

  const subscriptionInfo = {
    tier: profile.subscription_tier || 'free',
    status: profile.subscription_status || 'free',
    hasAccess,
    isAdmin: profile.is_admin || false,
    isTrial,
    trialHoursRemaining: trialStatus?.trial_hours_remaining || 0,
    displayTier: profile.is_admin ? 'Admin' : 
      (profile.subscription_tier === 'pro' ? 'Pro' : 
      (isTrial ? 'Trial' : 'Free'))
  };

  console.log('Built subscription info:', subscriptionInfo);
  return subscriptionInfo;
};
