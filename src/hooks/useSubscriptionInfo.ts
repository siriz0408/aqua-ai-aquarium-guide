
import type { UserProfile, TrialStatus, SubscriptionInfo } from '@/types/subscription';

export const useSubscriptionInfo = (
  profile: UserProfile | undefined | null,
  trialStatus: TrialStatus | undefined | null
) => {
  const getSubscriptionInfo = (): SubscriptionInfo => {
    // Admin users have admin status
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

    // Check for active paid subscription
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

    // Everyone else gets free access (all features are now free)
    return {
      tier: 'free',
      status: 'active',
      hasAccess: true,
      isAdmin: false,
      isTrial: false,
      trialHoursRemaining: 0,
      displayTier: 'Free'
    };
  };

  return { getSubscriptionInfo };
};
