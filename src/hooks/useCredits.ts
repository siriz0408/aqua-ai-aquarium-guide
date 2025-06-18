
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import { fetchUserProfile } from '@/services/profileService';
import { fetchTrialStatus } from '@/services/trialService';
import { canUserAccessFeature, doesUserNeedUpgrade, buildSubscriptionInfo } from '@/services/subscriptionService';
import type { UserProfile, TrialStatus, SubscriptionInfo } from '@/types/subscription';

// Re-export types for backward compatibility
export type { UserProfile, TrialStatus };

export const useCredits = () => {
  const { user } = useAuth();

  // Fetch user profile using the profile service
  const { data: profile, isLoading: profileLoading, error: profileError } = useQuery({
    queryKey: ['user-profile', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      return fetchUserProfile(user.id);
    },
    enabled: !!user?.id,
    retry: 2,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  // Fetch detailed trial status for non-admin users
  const { data: trialStatus, isLoading: trialLoading } = useQuery({
    queryKey: ['trial-status', user?.id],
    queryFn: async () => {
      if (!user?.id || profile?.is_admin) return null;
      return fetchTrialStatus(user.id, profile?.is_admin || false);
    },
    enabled: !!user?.id && !!profile && !profile.is_admin,
    refetchInterval: 60000, // Refetch every minute to update trial countdown
  });

  // Check if user can use features (trial, subscription, or admin)
  const canUseFeature = (feature: string = 'chat') => {
    return canUserAccessFeature(profile, trialStatus, feature);
  };

  // Check if user needs upgrade (trial expired or no access)
  const needsUpgrade = () => {
    return doesUserNeedUpgrade(profile, trialStatus);
  };

  // Get subscription info for display
  const getSubscriptionInfo = (): SubscriptionInfo => {
    return buildSubscriptionInfo(profile, trialStatus);
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
