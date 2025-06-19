
import { useUserProfile } from './useUserProfile';
import { useTrialStatus } from './useTrialStatus';
import { useSubscriptionInfo } from './useSubscriptionInfo';

export const useSubscriptionAccess = () => {
  const { data: profile, isLoading: profileLoading, error: profileError } = useUserProfile();
  const { data: trialStatus, isLoading: trialLoading, error: trialError } = useTrialStatus(profile);
  const { getSubscriptionInfo } = useSubscriptionInfo(profile, trialStatus);
  
  console.log('useSubscriptionAccess - Profile:', profile);
  console.log('useSubscriptionAccess - Trial Status:', trialStatus);
  
  const subscriptionInfo = getSubscriptionInfo();
  console.log('useSubscriptionAccess - Subscription Info:', subscriptionInfo);
  
  const isLoading = profileLoading || trialLoading;
  const hasError = profileError || trialError;

  const canAccessFeature = (featureType: 'basic' | 'premium' = 'basic') => {
    if (isLoading) return false;
    
    // Admin always has access to everything
    if (subscriptionInfo.isAdmin) return true;
    
    // For the new model, ALL features require subscription access
    // No more free tier - only trial, paid, or admin
    return subscriptionInfo.hasAccess;
  };

  const requiresUpgrade = (featureType: 'basic' | 'premium' = 'premium') => {
    if (subscriptionInfo.isAdmin) return false;
    return !subscriptionInfo.hasAccess;
  };

  const shouldShowPaywall = () => {
    if (isLoading) return false;
    if (subscriptionInfo.isAdmin) return false;
    
    // Show paywall if trial is expired or user has no access
    return trialStatus?.isTrialExpired || !subscriptionInfo.hasAccess;
  };

  const shouldShowSubscriptionPrompt = () => {
    if (isLoading) return false;
    if (subscriptionInfo.isAdmin) return false;
    
    // Show subscription prompt if user has no trial and no active subscription
    return !subscriptionInfo.hasAccess && !trialStatus?.isTrialActive;
  };

  return {
    profile,
    subscriptionInfo,
    trialStatus,
    isLoading,
    hasError,
    canAccessFeature,
    requiresUpgrade,
    shouldShowPaywall,
    shouldShowSubscriptionPrompt,
    hasActiveSubscription: subscriptionInfo.status === 'active',
    isTrialActive: subscriptionInfo.isTrial,
    isTrialExpired: trialStatus?.isTrialExpired || false,
    isAdmin: subscriptionInfo.isAdmin
  };
};
