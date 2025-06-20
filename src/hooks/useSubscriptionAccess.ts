
import { useSimpleSubscriptionCheck } from './useSimpleSubscriptionCheck';
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
    isPaid,
    isTrial,
    canStartTrial,
    trialHoursRemaining 
  } = useSimpleSubscriptionCheck();

  console.log('useSubscriptionAccess - Access Data:', status);

  const canAccessFeature = (featureType: 'basic' | 'premium' = 'basic') => {
    if (isLoading || !status) return false;
    
    // Admin always has access
    if (isAdmin) return true;
    
    // All premium features require subscription access
    return hasAccess;
  };

  const requiresUpgrade = (featureType: 'basic' | 'premium' = 'premium') => {
    if (!status) return true;
    if (isAdmin) return false;
    return !hasAccess;
  };

  const shouldShowPaywall = () => {
    if (isLoading || !status) return false;
    if (isAdmin) return false;
    
    // Show paywall if trial is expired or user is free with no trial option
    return status.access_type === 'trial_expired' || 
           (status.access_type === 'free' && !canStartTrial);
  };

  const shouldShowSubscriptionPrompt = () => {
    if (isLoading || !status) return false;
    if (isAdmin) return false;
    
    // Show subscription prompt if user is free and can start trial OR has no access
    return status.access_type === 'free' || !hasAccess;
  };

  const shouldShowTrialBanner = () => {
    if (isLoading || !status) return false;
    if (isAdmin) return false;
    
    // Show trial banner for active trials, expired trials, or free users who can start trial
    return status.access_type === 'trial' || 
           status.access_type === 'trial_expired' ||
           (status.access_type === 'free' && canStartTrial);
  };

  return {
    profile: user,
    subscriptionInfo: {
      tier: status?.subscription_tier || 'free',
      status: status?.access_type || 'free',
      hasAccess: hasAccess,
      isAdmin: isAdmin,
      isTrial: isTrial,
      trialHoursRemaining: trialHoursRemaining,
      displayTier: isAdmin ? 'Admin' : 
                   isTrial ? 'Trial' :
                   isPaid ? 'Pro' : 'Free'
    },
    trialStatus: {
      isTrialActive: isTrial,
      hoursRemaining: trialHoursRemaining,
      isTrialExpired: status?.access_type === 'trial_expired',
      canStartTrial: canStartTrial,
      trialType: status?.trial_type
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
    hasActiveSubscription: isPaid,
    isTrialActive: isTrial,
    isTrialExpired: status?.access_type === 'trial_expired',
    isAdmin: isAdmin,
    canStartTrial: canStartTrial,
    hasUsedTrial: !canStartTrial && !isAdmin,
    refreshAccess: refresh,
  };
};
