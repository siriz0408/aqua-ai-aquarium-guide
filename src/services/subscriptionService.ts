
import type { UserProfile, TrialStatus, SubscriptionInfo } from '@/types/subscription';

export const canUserAccessFeature = (profile: UserProfile | null, trialStatus: TrialStatus | null, feature: string = 'chat'): boolean => {
  if (!profile) {
    console.log('Feature access denied: No profile found');
    return false;
  }
  
  // Admins always have access
  if (profile.is_admin) {
    console.log('Feature access granted: User is admin');
    return true;
  }
  
  // Users with active PRO subscription have access (don't check trial status for pro users)
  if (profile.subscription_tier === 'pro' && profile.subscription_status === 'active') {
    console.log('Feature access granted: Active pro subscription');
    return true;
  }
  
  // Users in active trial period have access (only check trial if not pro)
  if (profile.subscription_status === 'trial' && trialStatus && !trialStatus.is_trial_expired && trialStatus.trial_hours_remaining > 0) {
    console.log('Feature access granted: Active trial');
    return true;
  }
  
  console.log('Feature access denied: No valid subscription, trial, or admin status', {
    subscriptionStatus: profile.subscription_status,
    subscriptionTier: profile.subscription_tier,
    isTrialExpired: trialStatus?.is_trial_expired,
    trialHoursRemaining: trialStatus?.trial_hours_remaining
  });
  return false;
};

export const doesUserNeedUpgrade = (profile: UserProfile | null, trialStatus: TrialStatus | null): boolean => {
  if (!profile) return true;
  
  // Admins never need upgrade
  if (profile.is_admin) return false;
  
  // Check if user has active pro subscription
  if (profile.subscription_tier === 'pro' && profile.subscription_status === 'active') {
    return false;
  }
  
  // Check if user is in active trial
  if (profile.subscription_status === 'trial' && trialStatus && !trialStatus.is_trial_expired && trialStatus.trial_hours_remaining > 0) {
    return false;
  }
  
  return true;
};

export const buildSubscriptionInfo = (profile: UserProfile | null, trialStatus: TrialStatus | null): SubscriptionInfo => {
  if (!profile) {
    return {
      tier: 'free',
      status: 'free',
      hasAccess: false,
      isAdmin: false,
      isTrial: false,
      trialHoursRemaining: 0,
      displayTier: 'Free'
    };
  }

  const isTrial = profile.subscription_status === 'trial';
  const hasAccess = profile.is_admin || 
    (profile.subscription_tier === 'pro' && profile.subscription_status === 'active') ||
    (isTrial && trialStatus && !trialStatus.is_trial_expired && trialStatus.trial_hours_remaining > 0);

  return {
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
};
