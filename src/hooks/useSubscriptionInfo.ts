
import type { UserProfile, TrialStatus, SubscriptionInfo } from '@/types/subscription';

export const useSubscriptionInfo = (
  profile: UserProfile | undefined | null,
  trialStatus: TrialStatus | undefined | null
) => {
  const getSubscriptionInfo = (): SubscriptionInfo => {
    if (profile?.is_admin) {
      return {
        tier: 'unlimited',
        status: 'active',
        hasAccess: true,
        isAdmin: true,
        isTrial: false,
        trialHoursRemaining: 0,
        displayTier: 'Admin'
      };
    }

    if (profile?.subscription_status === 'active' && profile?.subscription_tier === 'pro') {
      return {
        tier: 'pro',
        status: 'active',
        hasAccess: true,
        isAdmin: false,
        isTrial: false,
        trialHoursRemaining: 0,
        displayTier: 'Pro'
      };
    }

    return {
      tier: 'free',
      status: 'active',
      hasAccess: true, // All features are now free
      isAdmin: false,
      isTrial: false,
      trialHoursRemaining: 0,
      displayTier: 'Free'
    };
  };

  return { getSubscriptionInfo };
};
