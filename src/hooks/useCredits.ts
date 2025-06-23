
import { useAuth } from '@/contexts/AuthContext';
import { useUserProfile } from './useUserProfile';

export const useCredits = () => {
  const { user } = useAuth();
  const { data: profile, isLoading: profileLoading, error: profileError } = useUserProfile();

  const canUseFeature = async (feature: string = 'chat') => {
    if (!user || !profile) return false;
    
    // Admins always have access
    if (profile.role === 'admin') return true;
    
    // Users with active subscription have access
    return profile.subscription_status === 'active';
  };

  const needsUpgrade = () => {
    if (!user || !profile) return true;
    if (profile.role === 'admin') return false;
    return profile.subscription_status !== 'active';
  };

  const forceRefreshAccess = async () => {
    return canUseFeature();
  };

  return {
    profile,
    profileLoading,
    subscriptionInfo: {
      hasAccess: profile?.subscription_status === 'active' || profile?.role === 'admin',
      status: profile?.subscription_status || 'expired',
      isAdmin: profile?.role === 'admin',
      displayTier: profile?.role === 'admin' ? 'Admin' : 
                   profile?.subscription_status === 'active' ? 'Pro' : 'Expired'
    },
    canUseFeature,
    needsUpgrade,
    forceRefreshAccess,
    profileError,
  };
};
