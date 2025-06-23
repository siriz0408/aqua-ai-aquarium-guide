
import { useAuth } from '@/contexts/AuthContext';
import { useUserProfile } from './useUserProfile';

export const useCredits = () => {
  const { user } = useAuth();
  const { data: profile, isLoading: profileLoading, error: profileError } = useUserProfile();

  const canUseFeature = async (feature: string = 'chat') => {
    // All features are now available to everyone
    return true;
  };

  const needsUpgrade = () => {
    // No upgrades needed - all features are free
    return false;
  };

  const forceRefreshAccess = async () => {
    // Always return true since all features are free
    return true;
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
