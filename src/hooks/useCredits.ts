import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

export interface UserProfile {
  id: string;
  email?: string;
  full_name?: string;
  subscription_status: 'trial' | 'active' | 'expired' | 'free';
  subscription_tier: 'free' | 'pro';
  subscription_start_date?: string;
  subscription_end_date?: string;
  trial_start_date?: string;
  trial_end_date?: string;
  is_admin?: boolean;
  admin_role?: string;
  created_at?: string;
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

      // Get trial status if not admin
      let trialStatus: TrialStatus | null = null;
      if (!isAdmin) {
        const { data: trialData, error: trialError } = await supabase
          .rpc('check_user_trial_status', { user_id: user.id });
        
        if (!trialError && trialData && trialData.length > 0) {
          trialStatus = trialData[0];
        }
      }

      // Return a profile based on admin status and trial information
      const profile: UserProfile = {
        id: user.id,
        email: user.email,
        full_name: user.full_name,
        subscription_status: isAdmin ? 'active' : (trialStatus?.subscription_status as any || 'free'),
        subscription_tier: isAdmin ? 'pro' : 'free',
        trial_start_date: trialStatus && !isAdmin ? undefined : undefined,
        trial_end_date: trialStatus && !isAdmin ? undefined : undefined,
        is_admin: isAdmin || false,
        admin_role: isAdmin ? 'admin' : undefined,
        created_at: user.created_at,
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

  // Check if user can use features (trial, subscription, or admin)
  const canUseFeature = (feature: string = 'chat') => {
    if (!profile) return false;
    
    // Admins always have access
    if (profile.is_admin) {
      console.log('Feature access granted: User is admin');
      return true;
    }
    
    // Users with active subscription have access
    if (profile.subscription_tier === 'pro' && profile.subscription_status === 'active') {
      console.log('Feature access granted: Active pro subscription');
      return true;
    }
    
    // Users in trial period have access
    if (profile.subscription_status === 'trial' && trialStatus && !trialStatus.is_trial_expired) {
      console.log('Feature access granted: Active trial');
      return true;
    }
    
    console.log('Feature access denied: No valid subscription, trial, or admin status');
    return false;
  };

  // Check if user needs upgrade (trial expired or no access)
  const needsUpgrade = () => {
    if (!profile) return true;
    
    // Admins never need upgrade
    if (profile.is_admin) return false;
    
    // Check if user has active pro subscription
    if (profile.subscription_tier === 'pro' && profile.subscription_status === 'active') {
      return false;
    }
    
    // Check if user is in active trial
    if (profile.subscription_status === 'trial' && trialStatus && !trialStatus.is_trial_expired) {
      return false;
    }
    
    return true;
  };

  // Get subscription info for display
  const getSubscriptionInfo = () => {
    if (!profile) {
      return {
        tier: 'free',
        status: 'free',
        hasAccess: false,
        isAdmin: false,
        isTrial: false,
        trialHoursRemaining: 0,
        displayTier: 'Free'
      };
    }

    const isTrial = profile.subscription_status === 'trial';
    const hasAccess = profile.is_admin || 
      (profile.subscription_tier === 'pro' && profile.subscription_status === 'active') ||
      (isTrial && trialStatus && !trialStatus.is_trial_expired);

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
