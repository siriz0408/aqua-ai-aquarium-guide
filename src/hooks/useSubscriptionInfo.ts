
import type { UserProfile, TrialStatus, SubscriptionInfo } from '@/types/subscription';

export const useSubscriptionInfo = (
  profile: UserProfile | undefined | null,
  trialStatus: TrialStatus | undefined | null
) => {
  const getSubscriptionInfo = (): SubscriptionInfo => {
    // Admin users always have full access
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

    // Check for active trial
    if (trialStatus?.isTrialActive && trialStatus?.hoursRemaining > 0) {
      return {
        tier: 'trial',
        status: 'trial',
        hasAccess: true,
        isAdmin: false,
        isTrial: true,
        trialHoursRemaining: trialStatus.hoursRemaining,
        displayTier: 'Trial'
      };
    }

    // Check for expired trial
    if (trialStatus?.isTrialExpired) {
      return {
        tier: 'free',
        status: 'expired',
        hasAccess: false,
        isAdmin: false,
        isTrial: false,
        trialHoursRemaining: 0,
        displayTier: 'Free (Trial Expired)'
      };
    }

    // Default to free tier with no access to premium features
    return {
      tier: 'free',
      status: 'free',
      hasAccess: false,
      isAdmin: false,
      isTrial: false,
      trialHoursRemaining: 0,
      displayTier: 'Free'
    };
  };

  return { getSubscriptionInfo };
};
