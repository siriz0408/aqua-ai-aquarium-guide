
import type { UserProfile, SubscriptionInfo } from '@/types/subscription';

interface TrialStatus {
  isTrialActive: boolean;
  hoursRemaining: number;
  isTrialExpired: boolean;
}

export const useSubscriptionInfo = (
  profile: UserProfile | undefined | null,
  trialStatus: TrialStatus | undefined | null
) => {
  const getSubscriptionInfo = (): SubscriptionInfo => {
    if (!profile) {
      return {
        hasAccess: false,
        status: 'expired',
        isAdmin: false,
        displayTier: 'Expired'
      };
    }

    if (profile.role === 'admin') {
      return {
        hasAccess: true,
        status: 'active',
        isAdmin: true,
        displayTier: 'Admin'
      };
    }

    return {
      hasAccess: profile.subscription_status === 'active',
      status: profile.subscription_status,
      isAdmin: false,
      displayTier: profile.subscription_status === 'active' ? 'Pro' : 'Expired'
    };
  };

  return { getSubscriptionInfo };
};
