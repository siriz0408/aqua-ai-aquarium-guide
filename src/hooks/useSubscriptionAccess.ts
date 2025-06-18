
import { useUserProfile } from './useUserProfile';
import { useTrialStatus } from './useTrialStatus';
import { useSubscriptionInfo } from './useSubscriptionInfo';

export const useSubscriptionAccess = () => {
  const { data: profile, isLoading: profileLoading } = useUserProfile();
  const { data: trialStatus, isLoading: trialLoading } = useTrialStatus(profile);
  const { getSubscriptionInfo } = useSubscriptionInfo(profile, trialStatus);
  
  const subscriptionInfo = getSubscriptionInfo();
  const isLoading = profileLoading || trialLoading;

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
    canAccessFeature,
    requiresUpgrade,
    hasActiveSubscription: subscriptionInfo.status === 'active',
    isTrialActive: subscriptionInfo.isTrial,
    isTrialExpired: trialStatus?.isTrialExpired || false
  };
};
