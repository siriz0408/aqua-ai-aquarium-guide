
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
    
    // For the simplified model, all features are now available to everyone
    return true;
  };

  const needsUpgrade = () => {
    if (!user) return false; // Changed to false since features are free
    if (profile?.is_admin) return false;
    // For the simplified model, no upgrade needed
    return false;
  };

  const forceRefreshAccess = async () => {
    return canUseFeature();
  };

  return {
    profile,
    profileLoading,
    subscriptionInfo: {
      tier: profile?.subscription_tier || 'free',
      status: profile?.subscription_status || 'free',
      hasAccess: true, // All features are now available
      isAdmin: profile?.is_admin || false,
      isTrial: false,
      trialHoursRemaining: 0,
      displayTier: profile?.is_admin ? 'Admin' : 
                   profile?.subscription_status === 'active' && profile?.subscription_tier === 'pro' ? 'Pro' : 'Free',
      subscriptionType: profile?.subscription_type,
      startDate: profile?.subscription_start_date,
      endDate: profile?.subscription_end_date
    },
    canUseFeature,
    needsUpgrade,
    forceRefreshAccess,
    profileError,
  };
};
