
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

  // Fetch user profile using the safe admin check function
  const { data: profile, isLoading: profileLoading, error: profileError } = useQuery({
    queryKey: ['user-profile', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      
      console.log('Fetching user profile for credits hook...');
      
      // First check if user is admin using the safe function
      const { data: isAdmin, error: adminError } = await supabase
        .rpc('check_user_admin_status', { user_id: user.id });

      if (adminError) {
        console.error('Error checking admin status:', adminError);
      }

      // Then get the profile data
      const { data, error } = await supabase
        .from('profiles')
        .select('id, subscription_status, subscription_tier, subscription_start_date, subscription_end_date, is_admin, admin_role')
        .eq('id', user.id)
        .single();

      if (error) {
        console.error('Error fetching user profile:', error);
        throw error;
      }

      console.log('User profile fetched:', data);
      return data as UserProfile;
    },
    enabled: !!user?.id,
    retry: 2,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  // Always allow feature access for admins and active users
  const canUseFeature = (feature: string = 'chat') => {
    if (!profile) return false;
    
    // Admins always have access
    if (profile.is_admin) {
      console.log('Feature access granted: User is admin');
      return true;
    }
    
    // Pro users with active subscription have access
    if (profile.subscription_tier === 'pro' && profile.subscription_status === 'active') {
      console.log('Feature access granted: Active pro subscription');
      return true;
    }
    
    console.log('Feature access denied: No valid subscription or admin status');
    return false;
  };

  // Check if user needs upgrade
  const needsUpgrade = () => {
    if (!profile) return true;
    
    // Admins never need upgrade
    if (profile.is_admin) return false;
    
    // Check if user has active pro subscription
    return !(profile.subscription_tier === 'pro' && profile.subscription_status === 'active');
  };

  // Get subscription info for display
  const getSubscriptionInfo = () => {
    if (!profile) {
      return {
        tier: 'free',
        status: 'free',
        hasAccess: false,
        isAdmin: false,
        displayTier: 'Free'
      };
    }

    return {
      tier: profile.subscription_tier || 'free',
      status: profile.subscription_status || 'free',
      hasAccess: profile.is_admin || (profile.subscription_tier === 'pro' && profile.subscription_status === 'active'),
      isAdmin: profile.is_admin || false,
      displayTier: profile.is_admin ? 'Admin' : (profile.subscription_tier === 'pro' ? 'Pro' : 'Free')
    };
  };

  return {
    profile,
    profileLoading,
    canUseFeature,
    needsUpgrade,
    getSubscriptionInfo,
    profileError,
  };
};
