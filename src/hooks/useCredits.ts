
import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

export interface UserProfile {
  id: string;
  subscription_status: 'free' | 'active';
  subscription_tier: 'free' | 'pro';
  subscription_start_date?: string;
  subscription_end_date?: string;
  is_admin?: boolean;
  admin_role?: string;
}

export const useCredits = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch user profile with subscription info
  const { data: profile, isLoading: profileLoading, error: profileError } = useQuery({
    queryKey: ['userProfile', user?.id],
    queryFn: async () => {
      if (!user) return null;
      
      console.log('Fetching user profile for:', user.id);
      
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select(`
            id,
            email,
            full_name,
            subscription_status,
            subscription_tier,
            subscription_start_date,
            subscription_end_date,
            is_admin,
            admin_role
          `)
          .eq('id', user.id)
          .maybeSingle();

        if (error) {
          console.error('Error fetching user profile:', error);
          
          // Return a safe default profile to prevent app from breaking
          return {
            id: user.id,
            subscription_status: 'free',
            subscription_tier: 'free',
            is_admin: false
          } as UserProfile;
        }

        if (!data) {
          console.log('No profile found, returning default');
          return {
            id: user.id,
            subscription_status: 'free',
            subscription_tier: 'free',
            is_admin: false
          } as UserProfile;
        }

        console.log('User profile fetched successfully:', data);
        return data as UserProfile;
      } catch (err) {
        console.error('Exception in profile fetch:', err);
        // Return a safe default to prevent app breakage
        return {
          id: user.id,
          subscription_status: 'free',
          subscription_tier: 'free',
          is_admin: false
        } as UserProfile;
      }
    },
    enabled: !!user,
    retry: 2,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 5000),
    staleTime: 30000,
  });

  // Check if user can use AI features
  const canUseFeature = (feature: string = 'chat') => {
    if (!profile) {
      console.log('No profile available, denying feature access');
      return false;
    }
    
    console.log('Checking feature access for profile:', profile);
    
    // Admins can always use features
    if (profile.is_admin) {
      console.log('Admin user, allowing feature access');
      return true;
    }
    
    // Pro users with active subscription can use features
    if (profile.subscription_tier === 'pro' && profile.subscription_status === 'active') {
      console.log('Pro user with active subscription, allowing feature access');
      return true;
    }
    
    console.log('Free user or inactive subscription, denying feature access');
    return false;
  };

  // Check if user needs to upgrade
  const needsUpgrade = () => {
    if (!profile) return false;
    
    // Admins never need to upgrade
    if (profile.is_admin) return false;
    
    // Free users or inactive pro users need to upgrade to access AI features
    return profile.subscription_tier === 'free' || profile.subscription_status !== 'active';
  };

  // Get subscription info for display
  const getSubscriptionInfo = () => {
    if (!profile) return { tier: 'free', status: 'free', hasAccess: false, displayTier: 'Free' };
    
    // Determine display tier
    let displayTier = 'Free';
    if (profile.is_admin) {
      displayTier = profile.admin_role === 'super_admin' ? 'Super Admin' : 'Admin';
    } else if (profile.subscription_tier === 'pro' && profile.subscription_status === 'active') {
      displayTier = 'Pro';
    }
    
    return {
      tier: profile.subscription_tier,
      status: profile.subscription_status,
      hasAccess: canUseFeature(),
      isAdmin: profile.is_admin,
      displayTier: displayTier
    };
  };

  // Auto-refresh subscription status
  useEffect(() => {
    const refreshSubscription = async () => {
      if (!user) return;
      
      try {
        await supabase.functions.invoke('check-subscription');
        queryClient.invalidateQueries({ queryKey: ['userProfile', user.id] });
      } catch (error) {
        console.error('Error refreshing subscription:', error);
      }
    };

    // Refresh on component mount and periodically
    refreshSubscription();
    const interval = setInterval(refreshSubscription, 60000); // Every minute

    return () => clearInterval(interval);
  }, [user, queryClient]);

  return {
    profile,
    profileLoading,
    canUseFeature,
    needsUpgrade,
    getSubscriptionInfo,
    profileError,
  };
};
