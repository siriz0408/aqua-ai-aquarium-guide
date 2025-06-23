
import { useAuth } from '@/contexts/AuthContext';
import { useUserProfile } from './useUserProfile';

export const useCredits = () => {
  const { user } = useAuth();
  const { data: profile, isLoading: profileLoading, error: profileError } = useUserProfile();

  const canUseFeature = async (feature: string = 'chat') => {
    return true; // All features are now available to everyone
  };

  const needsUpgrade = () => {
    return false; // No upgrades needed
  };

  const forceRefreshAccess = async () => {
    return true; // Always return true since all features are free
  };

  return {
    profile,
    profileLoading,
    subscriptionInfo: {
      tier: 'free',
      status: 'active',
      hasAccess: true,
      isAdmin: profile?.is_admin || false,
      isTrial: false,
      trialHoursRemaining: 0,
      displayTier: profile?.is_admin ? 'Admin' : 'Free'
    },
    canUseFeature,
    needsUpgrade,
    forceRefreshAccess,
    profileError,
  };
};
