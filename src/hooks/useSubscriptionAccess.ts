
import { useUserSubscriptionAccess } from './useUserSubscriptionAccess';
import { useAuth } from '@/contexts/AuthContext';

export const useSubscriptionAccess = () => {
  const { user } = useAuth();
  const { data: accessData, isLoading, error } = useUserSubscriptionAccess();

  console.log('useSubscriptionAccess - Access Data:', accessData);

  const canAccessFeature = (featureType: 'basic' | 'premium' = 'basic') => {
    if (isLoading || !accessData) return false;
    
    // Admin always has access
    if (accessData.access_type === 'admin') return true;
    
    // All features require subscription access (trial, paid, or admin)
    return accessData.has_access;
  };

  const requiresUpgrade = (featureType: 'basic' | 'premium' = 'premium') => {
    if (!accessData) return true;
    if (accessData.access_type === 'admin') return false;
    return !accessData.has_access;
  };

  const shouldShowPaywall = () => {
    if (isLoading || !accessData) return false;
    if (accessData.access_type === 'admin') return false;
    
    // Show paywall if trial is expired or user is free with no trial option
    return accessData.access_type === 'trial_expired' || 
           (accessData.access_type === 'free' && !accessData.can_start_trial);
  };

  const shouldShowSubscriptionPrompt = () => {
    if (isLoading || !accessData) return false;
    if (accessData.access_type === 'admin') return false;
    
    // Show subscription prompt if user is free and can start trial OR has no access
    return accessData.access_type === 'free' || !accessData.has_access;
  };

  const shouldShowTrialBanner = () => {
    if (isLoading || !accessData) return false;
    if (accessData.access_type === 'admin') return false;
    
    // Show trial banner for active trials, expired trials, or free users who can start trial
    return accessData.access_type === 'trial' || 
           accessData.access_type === 'trial_expired' ||
           (accessData.access_type === 'free' && accessData.can_start_trial);
  };

  return {
    profile: user,
    subscriptionInfo: {
      tier: accessData?.subscription_tier || 'free',
      status: accessData?.access_type || 'free',
      hasAccess: accessData?.has_access || false,
      isAdmin: accessData?.access_type === 'admin',
      isTrial: accessData?.access_type === 'trial',
      trialHoursRemaining: accessData?.trial_hours_remaining || 0,
      displayTier: accessData?.access_type === 'admin' ? 'Admin' : 
                   accessData?.access_type === 'trial' ? 'Trial' :
                   accessData?.access_type === 'paid' ? 'Pro' : 'Free'
    },
    trialStatus: {
      isTrialActive: accessData?.access_type === 'trial',
      hoursRemaining: accessData?.trial_hours_remaining || 0,
      isTrialExpired: accessData?.access_type === 'trial_expired'
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
    isTrialActive: accessData?.access_type === 'trial',
    isTrialExpired: accessData?.access_type === 'trial_expired',
    isAdmin: accessData?.access_type === 'admin',
    canStartTrial: accessData?.can_start_trial || false,
    hasUsedTrial: !accessData?.can_start_trial && accessData?.access_type !== 'admin'
  };
};
