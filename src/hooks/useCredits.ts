
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
          
          // Return a default profile with full access
          return {
            id: user.id,
            subscription_status: 'active',
            subscription_tier: 'pro',
            is_admin: true
          } as UserProfile;
        }

        if (!data) {
          console.log('No profile found, returning default with full access');
          return {
            id: user.id,
            subscription_status: 'active',
            subscription_tier: 'pro',
            is_admin: true
          } as UserProfile;
        }

        console.log('User profile fetched successfully:', data);
        // Override any restrictions and give full access
        return {
          ...data,
          subscription_status: 'active',
          subscription_tier: 'pro',
          is_admin: true
        } as UserProfile;
      } catch (err) {
        console.error('Exception in profile fetch:', err);
        // Return full access on any error
        return {
          id: user.id,
          subscription_status: 'active',
          subscription_tier: 'pro',
          is_admin: true
        } as UserProfile;
      }
    },
    enabled: !!user,
    retry: 2,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 5000),
    staleTime: 30000,
  });

  // Always allow feature access
  const canUseFeature = (feature: string = 'chat') => {
    console.log('Feature access granted for all users');
    return true;
  };

  // Never require upgrade
  const needsUpgrade = () => {
    return false;
  };

  // Get subscription info for display - always show as Pro
  const getSubscriptionInfo = () => {
    return {
      tier: 'pro',
      status: 'active',
      hasAccess: true,
      isAdmin: true,
      displayTier: 'Pro'
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
