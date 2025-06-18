
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
    
    // Admin always has access
    if (subscriptionInfo.isAdmin) return true;
    
    // Basic features are always available
    if (featureType === 'basic') return true;
    
    // Premium features require subscription or active trial
    return subscriptionInfo.hasAccess;
  };

  const requiresUpgrade = (featureType: 'basic' | 'premium' = 'premium') => {
    if (featureType === 'basic') return false;
    return !canAccessFeature('premium');
  };

  return {
    profile,
    subscriptionInfo,
    trialStatus,
    isLoading,
    hasError,
    canAccessFeature,
    requiresUpgrade,
    hasActiveSubscription: subscriptionInfo.status === 'active',
    isTrialActive: subscriptionInfo.isTrial,
    isTrialExpired: trialStatus?.isTrialExpired || false
  };
};
