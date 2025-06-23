
import { useUserSubscriptionAccess } from './useUserSubscriptionAccess';
import { useAuth } from '@/contexts/AuthContext';

export const useSubscriptionAccess = () => {
  const { user } = useAuth();
  const { data: accessData, isLoading, error } = useUserSubscriptionAccess();

  console.log('useSubscriptionAccess - Access Data:', accessData);

  const canAccessFeature = (featureType: 'basic' | 'premium' = 'basic') => {
    if (!user) return false;
    
    // All features are now available to everyone
    return true;
  };

  const requiresUpgrade = (featureType: 'basic' | 'premium' = 'premium') => {
    if (!user) return true;
    if (accessData?.access_type === 'admin') return false;
    // No upgrade required for any features now
    return false;
  };

  const shouldShowPaywall = () => {
    if (!user) return true;
    if (accessData?.access_type === 'admin') return false;
    // No paywall needed since features are free
    return false;
  };

  const shouldShowSubscriptionPrompt = () => {
    return false; // No subscription prompts needed
  };

  const shouldShowTrialBanner = () => {
    return false; // No trial banner needed
  };

  return {
    profile: user,
    subscriptionInfo: {
      tier: accessData?.subscription_tier || 'free',
      status: accessData?.access_type || 'free',
      hasAccess: true, // All features available
      isAdmin: accessData?.access_type === 'admin',
      isTrial: false,
      trialHoursRemaining: 0,
      displayTier: accessData?.access_type === 'admin' ? 'Admin' : 
                   accessData?.access_type === 'paid' ? 'Pro' : 'Free',
      subscriptionType: accessData?.subscription_type,
      startDate: accessData?.subscription_start_date,
      endDate: accessData?.subscription_end_date
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
