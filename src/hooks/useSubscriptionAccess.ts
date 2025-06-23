
import { useUserSubscriptionAccess } from './useUserSubscriptionAccess';
import { useAuth } from '@/contexts/AuthContext';

export const useSubscriptionAccess = () => {
  const { user } = useAuth();
  const { data: accessData, isLoading, error } = useUserSubscriptionAccess();

  console.log('useSubscriptionAccess - Access Data:', accessData);

  const canAccessFeature = (featureType: 'basic' | 'premium' = 'basic') => {
    if (!user) return false;
    
    // Admins always have access
    if (accessData?.access_type === 'admin') return true;
    
    // Require active subscription for all features
    return accessData?.access_type === 'paid';
  };

  const requiresUpgrade = (featureType: 'basic' | 'premium' = 'premium') => {
    if (!user) return true;
    if (accessData?.access_type === 'admin') return false;
    return accessData?.access_type !== 'paid';
  };

  const shouldShowPaywall = () => {
    if (!user) return true;
    if (accessData?.access_type === 'admin') return false;
    return accessData?.access_type !== 'paid';
  };

  const shouldShowSubscriptionPrompt = () => {
    return shouldShowPaywall();
  };

  const shouldShowTrialBanner = () => {
    return false; // Trial is handled in checkout flow
  };

  return {
    profile: user,
    subscriptionInfo: {
      tier: accessData?.subscription_tier || 'free',
      status: accessData?.access_type || 'free',
      hasAccess: accessData?.access_type === 'paid' || accessData?.access_type === 'admin',
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
