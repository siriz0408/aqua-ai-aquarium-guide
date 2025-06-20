
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

  const subscriptionInfo = getSubscriptionInfo();

  const canUseFeature = async (feature: string = 'chat') => {
    // Check if user has access based on subscription status
    return subscriptionInfo.hasAccess;
  };

  const needsUpgrade = () => {
    // Returns true if user needs to upgrade (no access)
    return !subscriptionInfo.hasAccess;
  };

  const forceRefreshAccess = async () => {
    // Refresh subscription status
    return subscriptionInfo.hasAccess;
  };

  return {
    profile,
    profileLoading: profileLoading || trialLoading,
    trialStatus,
    subscriptionInfo,
    canUseFeature,
    needsUpgrade,
    getSubscriptionInfo,
    profileError,
    forceRefreshAccess,
  };
};
