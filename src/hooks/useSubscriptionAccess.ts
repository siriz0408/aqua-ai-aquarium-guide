
import { useUserSubscriptionAccess } from './useUserSubscriptionAccess';
import { useAuth } from '@/contexts/AuthContext';

export const useSubscriptionAccess = () => {
  const { user } = useAuth();
  const { data: accessData, isLoading, error } = useUserSubscriptionAccess();

  console.log('useSubscriptionAccess - Access Data:', accessData);

  const canAccessFeature = (featureType: 'basic' | 'premium' = 'basic') => {
    // All features are now accessible to everyone
    return true;
  };

  const requiresUpgrade = (featureType: 'basic' | 'premium' = 'premium') => {
    // No upgrades required - all features are free
    return false;
  };

  const shouldShowPaywall = () => {
    // Never show paywall since all features are free
    return false;
  };

  const shouldShowSubscriptionPrompt = () => {
    // Never show subscription prompts since all features are free
    return false;
  };

  const shouldShowTrialBanner = () => {
    // Never show trial banner since trials are removed
    return false;
  };

  return {
    profile: user,
    subscriptionInfo: {
      tier: accessData?.subscription_tier || 'free',
      status: accessData?.access_type || 'free',
      hasAccess: true, // Always true now
      isAdmin: accessData?.access_type === 'admin',
      isTrial: false, // No trials anymore
      trialHoursRemaining: 0,
      displayTier: accessData?.access_type === 'admin' ? 'Admin' : 
                   accessData?.access_type === 'paid' ? 'Pro' : 'Free'
    },
    trialStatus: {
      isTrialActive: false,
      hoursRemaining: 0,
      isTrialExpired: false
    },
    accessData,
    isLoading,
    hasError: !!error,
    canAccessFeature,
    requiresUpgrade,
    shouldShowPaywall,
    shouldShowSubscriptionPrompt,
    shouldShowTrialBanner,
    hasActiveSubscription: accessData?.access_type === 'paid',
    isTrialActive: false,
    isTrialExpired: false,
    isAdmin: accessData?.access_type === 'admin',
    canStartTrial: false,
    hasUsedTrial: false
  };
};
