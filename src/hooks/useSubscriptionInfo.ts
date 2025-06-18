
import type { UserProfile, TrialStatus, SubscriptionInfo } from '@/types/subscription';

export const useSubscriptionInfo = (
  profile: UserProfile | undefined | null,
  trialStatus: TrialStatus | undefined | null
) => {
  const getSubscriptionInfo = (): SubscriptionInfo => {
    // All users now have full access regardless of subscription status
    return {
      tier: 'unlimited',
      status: 'active',
      hasAccess: true,
      isAdmin: profile?.is_admin || false,
      isTrial: false,
      trialHoursRemaining: 0,
      displayTier: profile?.is_admin ? 'Admin' : 'Free'
    };
  };

  return { getSubscriptionInfo };
};
