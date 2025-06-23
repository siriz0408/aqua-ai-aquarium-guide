
import { useUserProfile } from './useUserProfile';
import { useAuth } from '@/contexts/AuthContext';

export const useSubscriptionAccess = () => {
  const { user } = useAuth();
  const { data: profile, isLoading, error } = useUserProfile();

  console.log('useSubscriptionAccess - Profile:', profile);

  const canAccessFeature = () => {
    if (!user || !profile) return false;
    
    // Admins always have access
    if (profile.role === 'admin') return true;
    
    // Users with active subscription have access
    return profile.subscription_status === 'active';
  };

  const requiresUpgrade = () => {
    if (!user || !profile) return true;
    if (profile.role === 'admin') return false;
    return profile.subscription_status !== 'active';
  };

  const shouldShowPaywall = () => {
    if (!user || !profile) return true;
    if (profile.role === 'admin') return false;
    return profile.subscription_status !== 'active';
  };

  return {
    profile,
    subscriptionInfo: {
      hasAccess: profile?.subscription_status === 'active' || profile?.role === 'admin',
      status: profile?.subscription_status || 'expired',
      isAdmin: profile?.role === 'admin',
      displayTier: profile?.role === 'admin' ? 'Admin' : 
                   profile?.subscription_status === 'active' ? 'Pro' : 'Expired'
    },
    isLoading,
    hasError: !!error,
    canAccessFeature,
    requiresUpgrade,
    shouldShowPaywall,
    hasActiveSubscription: profile?.subscription_status === 'active',
    isAdmin: profile?.role === 'admin'
  };
};
