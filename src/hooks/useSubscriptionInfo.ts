
import type { UserProfile, TrialStatus, SubscriptionInfo } from '@/types/subscription';

export const useSubscriptionInfo = (
  profile: UserProfile | undefined | null,
  trialStatus: TrialStatus | undefined | null
) => {
  const getSubscriptionInfo = (): SubscriptionInfo => {
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
    const isActive = profile.subscription_status === 'active';
    const trialHoursRemaining = trialStatus?.trial_hours_remaining || 0;
    
    // Access logic: Admin always has access, paid users have access, trial users have access if time remaining
    const hasAccess = profile.is_admin || 
                     (isActive && profile.subscription_tier === 'pro') || 
                     (isTrial && trialHoursRemaining > 0);

    return {
      tier: profile.subscription_tier || 'free',
      status: profile.subscription_status || 'free',
      hasAccess,
      isAdmin: profile.is_admin || false,
      isTrial,
      trialHoursRemaining,
      displayTier: profile.is_admin ? 'Admin' : 
        (profile.subscription_tier === 'pro' && isActive ? 'Pro' : 
        (isTrial ? 'Trial' : 'Free'))
    };
  };

  return { getSubscriptionInfo };
};
