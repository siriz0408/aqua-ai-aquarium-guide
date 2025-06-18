
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

  // Set up real-time subscription to profile changes
  useEffect(() => {
    if (!user?.id) return;

    const channel = supabase
      .channel('profile-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'profiles',
          filter: `id=eq.${user.id}`,
        },
        (payload) => {
          console.log('Profile updated via webhook:', payload);
          // Invalidate and refetch profile data when it changes
          queryClient.invalidateQueries({ queryKey: ['user-profile', user.id] });
          
          // Show toast notification for subscription changes
          if (payload.eventType === 'UPDATE') {
            const oldRecord = payload.old;
            const newRecord = payload.new;
            
            if (oldRecord?.subscription_status !== newRecord?.subscription_status) {
              if (newRecord?.subscription_status === 'active') {
                toast({
                  title: "Subscription Activated!",
                  description: "Your Pro subscription is now active. Enjoy all features!",
                });
              } else if (newRecord?.subscription_status === 'expired') {
                toast({
                  title: "Subscription Status Changed",
                  description: "Your subscription status has been updated.",
                  variant: "destructive",
                });
              }
            }
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user?.id, queryClient, toast]);

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

      // FIXED: Determine subscription status and tier with better logic
      let subscriptionStatus = 'free';
      let subscriptionTier = 'free';

      if (isAdmin) {
        subscriptionStatus = 'active';
        subscriptionTier = 'pro';
      } else if (profileData) {
        // Use profile data from database
        subscriptionStatus = profileData.subscription_status || 'free';
        subscriptionTier = profileData.subscription_tier || 'free';
        
        // IMPORTANT FIX: If user has stripe_customer_id and active subscription, they should be Pro
        if (profileData.stripe_customer_id && subscriptionStatus === 'active') {
          subscriptionTier = 'pro';
          console.log('User has Stripe customer ID and active status - upgrading to Pro tier');
        }
        
        // Override with trial status if applicable (but don't downgrade Pro users)
        if (trialStatus && trialStatus.subscription_status === 'trial' && subscriptionTier !== 'pro') {
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
      console.log('Raw profile data:', profileData);
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

  // FIXED: Improved access control logic
  const canUseFeature = (feature: string = 'chat') => {
    if (!profile) {
      console.log('Feature access denied: No profile found');
      return false;
    }
    
    // Admins always have access
    if (profile.is_admin) {
      console.log('Feature access granted: User is admin');
      return true;
    }
    
    // CRITICAL FIX: Pro users with active subscription always have access
    if (profile.subscription_tier === 'pro' && profile.subscription_status === 'active') {
      console.log('Feature access granted: Active Pro subscription', {
        tier: profile.subscription_tier,
        status: profile.subscription_status
      });
      return true;
    }
    
    // Users in active trial period have access (only if not already Pro)
    if (profile.subscription_status === 'trial' && trialStatus && !trialStatus.is_trial_expired && trialStatus.trial_hours_remaining > 0) {
      console.log('Feature access granted: Active trial');
      return true;
    }
    
    console.log('Feature access denied: No valid subscription, trial, or admin status', {
      subscriptionStatus: profile.subscription_status,
      subscriptionTier: profile.subscription_tier,
      isTrialExpired: trialStatus?.is_trial_expired,
      trialHoursRemaining: trialStatus?.trial_hours_remaining,
      hasStripeCustomer: profile.subscription_status === 'active'
    });
    return false;
  };

  // FIXED: Updated upgrade logic
  const needsUpgrade = () => {
    if (!profile) return true;
    
    // Admins never need upgrade
    if (profile.is_admin) return false;
    
    // Pro users with active subscription don't need upgrade
    if (profile.subscription_tier === 'pro' && profile.subscription_status === 'active') {
      return false;
    }
    
    // Users in active trial don't need upgrade
    if (profile.subscription_status === 'trial' && trialStatus && !trialStatus.is_trial_expired && trialStatus.trial_hours_remaining > 0) {
      return false;
    }
    
    return true;
  };

  // FIXED: Updated subscription info display
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
    const isPro = profile.subscription_tier === 'pro' && profile.subscription_status === 'active';
    const hasAccess = profile.is_admin || isPro ||
      (isTrial && trialStatus && !trialStatus.is_trial_expired && trialStatus.trial_hours_remaining > 0);

    return {
      tier: profile.subscription_tier || 'free',
      status: profile.subscription_status || 'free',
      hasAccess,
      isAdmin: profile.is_admin || false,
      isTrial,
      trialHoursRemaining: trialStatus?.trial_hours_remaining || 0,
      displayTier: profile.is_admin ? 'Admin' : 
        (isPro ? 'Pro' : 
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
