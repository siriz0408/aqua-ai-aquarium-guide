
import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

export interface UserProfile {
  id: string;
  subscription_status: 'trial' | 'active' | 'expired' | 'free';
  subscription_tier: 'free' | 'pro';
  subscription_start_date?: string;
  subscription_end_date?: string;
  trial_start_date?: string;
  trial_end_date?: string;
  is_admin?: boolean;
  admin_role?: string;
}

export interface TrialStatus {
  subscription_status: string;
  trial_hours_remaining: number;
  is_trial_expired: boolean;
}

export const useCredits = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch user profile using the safe admin check function
  const { data: profile, isLoading: profileLoading, error: profileError } = useQuery({
    queryKey: ['user-profile', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      
      console.log('Fetching user profile for credits hook...');
      
      // Check if user is admin using the safe function
      const { data: isAdmin, error: adminError } = await supabase
        .rpc('check_user_admin_status', { user_id: user.id });

      if (adminError) {
        console.error('Error checking admin status:', adminError);
        // Continue with non-admin profile instead of throwing
      }

      // Get profile data from profiles table
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (profileError && profileError.code !== 'PGRST116') {
        console.error('Error fetching profile:', profileError);
      }

      // Get trial status if not admin
      let trialStatus: TrialStatus | null = null;
      if (!isAdmin) {
        const { data: trialData, error: trialError } = await supabase
          .rpc('check_user_trial_status', { user_id: user.id });
        
        if (!trialError && trialData && trialData.length > 0) {
          trialStatus = trialData[0];
        }
      }

      // Determine subscription status and tier
      let subscriptionStatus = 'free';
      let subscriptionTier = 'free';

      if (isAdmin) {
        subscriptionStatus = 'active';
        subscriptionTier = 'pro';
      } else if (profileData) {
        // Use profile data from database
        subscriptionStatus = profileData.subscription_status || 'free';
        subscriptionTier = profileData.subscription_tier || 'free';
        
        // Override with trial status if applicable
        if (trialStatus && trialStatus.subscription_status === 'trial') {
          subscriptionStatus = 'trial';
        }
      } else if (trialStatus) {
        subscriptionStatus = trialStatus.subscription_status;
      }

      const profile: UserProfile = {
        id: user.id,
        subscription_status: subscriptionStatus as any,
        subscription_tier: subscriptionTier as any,
        trial_start_date: profileData?.trial_start_date,
        trial_end_date: profileData?.trial_end_date,
        subscription_start_date: profileData?.subscription_start_date,
        subscription_end_date: profileData?.subscription_end_date,
        is_admin: isAdmin || false,
        admin_role: isAdmin ? 'admin' : undefined,
      };

      console.log('User profile constructed:', profile);
      return profile;
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
      
      const { data, error } = await supabase
        .rpc('check_user_trial_status', { user_id: user.id });
      
      if (error) {
        console.error('Error fetching trial status:', error);
        return null;
      }
      
      return data && data.length > 0 ? data[0] : null;
    },
    enabled: !!user?.id && !!profile && !profile.is_admin,
    refetchInterval: 60000, // Refetch every minute to update trial countdown
  });

  // PAYWALL REMOVED: Always allow access to features
  const canUseFeature = (feature: string = 'chat') => {
    console.log('Feature access granted: Paywall disabled for all users');
    return true;
  };

  // PAYWALL REMOVED: No users need upgrade
  const needsUpgrade = () => {
    console.log('No upgrade needed: Paywall disabled for all users');
    return false;
  };

  // Get subscription info for display
  const getSubscriptionInfo = () => {
    if (!profile) {
      return {
        tier: 'free',
        status: 'free',
        hasAccess: true, // Always true now
        isAdmin: false,
        isTrial: false,
        trialHoursRemaining: 0,
        displayTier: 'Free'
      };
    }

    const isTrial = profile.subscription_status === 'trial';
    const hasAccess = true; // Always true now

    return {
      tier: profile.subscription_tier || 'free',
      status: profile.subscription_status || 'free',
      hasAccess,
      isAdmin: profile.is_admin || false,
      isTrial,
      trialHoursRemaining: trialStatus?.trial_hours_remaining || 0,
      displayTier: profile.is_admin ? 'Admin' : 
        (profile.subscription_tier === 'pro' ? 'Pro' : 
        (isTrial ? 'Trial' : 'Free'))
    };
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
