
import { useAuth } from '@/contexts/AuthContext';
import { useUserProfile } from './useUserProfile';

export const useCredits = () => {
  const { user } = useAuth();
  const { data: profile, isLoading: profileLoading, error: profileError } = useUserProfile();

  const canUseFeature = async (feature: string = 'chat') => {
    if (!user) return false;
    
    // Check if user has active subscription
    if (profile?.subscription_status === 'active' && profile?.subscription_tier === 'pro') {
      return true;
    }
    
    // Check if user is admin
    if (profile?.is_admin) {
      return true;
    }
    
    return false; // Require subscription for all features
  };

  const needsUpgrade = () => {
    if (!user) return true;
    if (profile?.is_admin) return false;
    return profile?.subscription_status !== 'active' || profile?.subscription_tier !== 'pro';
  };

  const forceRefreshAccess = async () => {
    return canUseFeature();
  };

  return {
    profile,
    profileLoading,
    subscriptionInfo: {
      tier: profile?.subscription_tier || 'free',
      status: profile?.subscription_status || 'inactive',
      hasAccess: profile?.subscription_status === 'active' && profile?.subscription_tier === 'pro',
      isAdmin: profile?.is_admin || false,
      isTrial: false,
      trialHoursRemaining: 0,
      displayTier: profile?.is_admin ? 'Admin' : 
                   profile?.subscription_status === 'active' && profile?.subscription_tier === 'pro' ? 'Pro' : 'Free'
    },
    canUseFeature,
    needsUpgrade,
    forceRefreshAccess,
    profileError,
  };
};
