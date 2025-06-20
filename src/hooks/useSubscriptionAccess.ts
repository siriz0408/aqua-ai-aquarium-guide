
import { useProSubscriptionAccess } from './useProSubscriptionAccess';
import { useAuth } from '@/contexts/AuthContext';

export const useSubscriptionAccess = () => {
  const { user } = useAuth();
  const { 
    status, 
    isLoading, 
    error, 
    refresh,
    hasAccess,
    isAdmin,
    isPaidSubscriber,
    subscriptionTier,
    subscriptionStatus
  } = useProSubscriptionAccess();

  console.log('useSubscriptionAccess - 100% Paywall Status:', status);

  // 100% PAYWALL: Only admins and paid subscribers have access
  const canAccessFeature = () => {
    if (isLoading || !status) return false;
    return hasAccess; // Only true for admins or paid subscribers
  };

  const requiresUpgrade = () => {
    if (!status) return true;
    if (isAdmin) return false;
    return !isPaidSubscriber; // Anyone who isn't a paid subscriber needs to upgrade
  };

  const shouldShowPaywall = () => {
    if (isLoading || !status) return false;
    if (isAdmin) return false;
    return !isPaidSubscriber; // Show paywall to anyone who isn't a paid subscriber
  };

  const shouldShowSubscriptionPrompt = () => {
    if (isLoading || !status) return false;
    if (isAdmin) return false;
    return !isPaidSubscriber; // Show subscription prompt to non-subscribers
  };

  // No trial banner needed in 100% paywall
  const shouldShowTrialBanner = () => false;

  return {
    profile: user,
    subscriptionInfo: {
      tier: subscriptionTier,
      status: subscriptionStatus,
      hasAccess: hasAccess,
      isAdmin: isAdmin,
      isTrial: false, // No trials in 100% paywall
      trialHoursRemaining: 0,
      displayTier: isAdmin ? 'Admin' : 
                   isPaidSubscriber ? 'Pro' : 'Free'
    },
    trialStatus: {
      isTrialActive: false,
      hoursRemaining: 0,
      isTrialExpired: false,
      canStartTrial: false, // No trials allowed
      trialType: null
    },
    accessData: status,
    isLoading,
    hasError: !!error,
    accessError: error,
    canAccessFeature,
    requiresUpgrade,
    shouldShowPaywall,
    shouldShowSubscriptionPrompt,
    shouldShowTrialBanner,
    hasActiveSubscription: isPaidSubscriber,
    isTrialActive: false, // No trials
    isTrialExpired: false,
    isAdmin: isAdmin,
    canStartTrial: false, // No trials allowed
    hasUsedTrial: false, // Not relevant
    refreshAccess: refresh,
  };
};
