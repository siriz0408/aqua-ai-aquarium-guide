
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
        hasAccess: true, // Always true now
        isAdmin: false,
        isTrial: false,
        trialHoursRemaining: 0,
        displayTier: 'Free'
      };
    }

    const isTrial = profile.subscription_status === 'trial';
    const hasAccess = true; // Always true now

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

  return { getSubscriptionInfo };
};
