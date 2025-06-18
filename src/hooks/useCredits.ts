
import { useAuth } from '@/contexts/AuthContext';
import { useUserProfile } from './useUserProfile';
import { useTrialStatus } from './useTrialStatus';
import { useSubscriptionInfo } from './useSubscriptionInfo';

// Re-export types for backward compatibility
export type { UserProfile, TrialStatus } from '@/types/subscription';

export const useCredits = () => {
  const { user } = useAuth();
  const { data: profile, isLoading: profileLoading, error: profileError } = useUserProfile();
  const { data: trialStatus, isLoading: trialLoading } = useTrialStatus(profile);
  const { getSubscriptionInfo } = useSubscriptionInfo(profile, trialStatus);

  const canUseFeature = (feature: string = 'chat') => {
    if (!profile) {
      console.log('No profile found, denying access');
      return false;
    }
    
    console.log('Checking feature access for profile:', profile);
    
    // Admins always have access
    if (profile.is_admin) {
      console.log('User is admin, granting access');
      return true;
    }
    
    // Check subscription type and status
    const subscriptionInfo = getSubscriptionInfo();
    console.log('Subscription info:', subscriptionInfo);
    
    // Users with active pro subscription have access
    if (subscriptionInfo.tier === 'pro' && subscriptionInfo.status === 'active') {
      console.log('User has active pro subscription, granting access');
      return true;
    }
    
    // Trial users have access if trial is still active
    if (subscriptionInfo.isTrial && subscriptionInfo.trialHoursRemaining > 0) {
      console.log('User has active trial, granting access');
      return true;
    }
    
    console.log('User does not have access - Status:', subscriptionInfo.status, 'Tier:', subscriptionInfo.tier, 'Trial Hours:', subscriptionInfo.trialHoursRemaining);
    return false;
  };

  const needsUpgrade = () => {
    if (!profile) return true;
    
    // Admins never need upgrade
    if (profile.is_admin) return false;
    
    const subscriptionInfo = getSubscriptionInfo();
    
    // Users with active pro subscription don't need upgrade
    if (subscriptionInfo.tier === 'pro' && subscriptionInfo.status === 'active') {
      return false;
    }
    
    // Trial users with time remaining don't need upgrade yet
    if (subscriptionInfo.isTrial && subscriptionInfo.trialHoursRemaining > 0) {
      return false;
    }
    
    // Everyone else needs upgrade
    return true;
  };

  return {
    profile,
    profileLoading: profileLoading || trialLoading,
    trialStatus,
    canUseFeature,
    needsUpgrade,
    getSubscriptionInfo,
    profileError,
  };
};
