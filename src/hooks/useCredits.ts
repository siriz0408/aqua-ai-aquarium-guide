
import { useAuth } from '@/contexts/AuthContext';
import { useUserProfile } from './useUserProfile';
import { useTrialStatus } from './useTrialStatus';
import { useSubscriptionInfo } from './useSubscriptionInfo';
import { supabase } from '@/integrations/supabase/client';

// Re-export types for backward compatibility
export type { UserProfile, TrialStatus } from '@/types/subscription';

export const useCredits = () => {
  const { user } = useAuth();
  const { data: profile, isLoading: profileLoading, error: profileError } = useUserProfile();
  const { data: trialStatus, isLoading: trialLoading } = useTrialStatus(profile);
  const { getSubscriptionInfo } = useSubscriptionInfo(profile, trialStatus);

  const canUseFeature = async (feature: string = 'chat') => {
    if (!user?.id) {
      console.log('No user ID found, denying access');
      return false;
    }
    
    console.log('Checking feature access using improved database function...');
    
    // Use the new database function for reliable access checking
    const { data, error } = await supabase.rpc('check_user_access', {
      user_id: user.id
    });
    
    if (error) {
      console.error('Error checking user access:', error);
      return false;
    }
    
    if (data && data.length > 0) {
      const accessResult = data[0];
      console.log('Database access check result:', accessResult);
      return accessResult.has_access;
    }
    
    console.log('No access data returned, denying access');
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
