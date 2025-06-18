
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
    
    // Access logic: 
    // 1. Admin always has access
    // 2. Active pro subscription has access (this covers paid Stripe users)
    // 3. Trial users have access if time remaining
    const hasAccess = profile.is_admin || 
                     (isActive && profile.subscription_tier === 'pro') || 
                     (isTrial && trialHoursRemaining > 0);

    // Log the access decision for debugging
    console.log('Subscription access check:', {
      isAdmin: profile.is_admin,
      isActive,
      tier: profile.subscription_tier,
      isTrial,
      trialHoursRemaining,
      hasAccess
    });

    return {
      tier: profile.subscription_tier || 'free',
      status: profile.subscription_status || 'free',
      hasAccess,
      isAdmin: profile.is_admin || false,
      isTrial,
      trialHoursRemaining,
      displayTier: profile.is_admin ? 'Admin' : 
        (isActive && profile.subscription_tier === 'pro' ? 'Pro' : 
        (isTrial ? 'Trial' : 'Free'))
    };
  };

  return { getSubscriptionInfo };
};
