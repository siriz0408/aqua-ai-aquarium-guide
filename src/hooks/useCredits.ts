
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

  const canUseFeature = async (feature: string = 'chat') => {
    // Remove all paywall restrictions - all users can access all features
    return true;
  };

  const needsUpgrade = () => {
    // No one needs to upgrade - all features are free
    return false;
  };

  const forceRefreshAccess = async () => {
    // Always return true since there are no access restrictions
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
    forceRefreshAccess,
  };
};
