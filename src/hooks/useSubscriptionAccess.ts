
import { useUserSubscriptionAccess } from './useUserSubscriptionAccess';
import { useAuth } from '@/contexts/AuthContext';

export const useSubscriptionAccess = () => {
  const { user } = useAuth();
  const { data: accessData, isLoading, error } = useUserSubscriptionAccess();

  console.log('useSubscriptionAccess - Access Data:', accessData);

  const canAccessFeature = (featureType: 'basic' | 'premium' = 'basic') => {
    return true; // All features are now free
  };

  const requiresUpgrade = (featureType: 'basic' | 'premium' = 'premium') => {
    return false; // No upgrades required
  };

  const shouldShowPaywall = () => {
    return false; // Never show paywall
  };

  const shouldShowSubscriptionPrompt = () => {
    return false; // Never show subscription prompts
  };

  const shouldShowTrialBanner = () => {
    return false; // Never show trial banner
  };

  return {
    profile: user,
    subscriptionInfo: {
      tier: accessData?.subscription_tier || 'free',
      status: accessData?.access_type || 'free',
      hasAccess: true,
      isAdmin: accessData?.access_type === 'admin',
      isTrial: false,
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
