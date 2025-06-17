
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

  // Always return full access profile without database queries
  const profile: UserProfile = user ? {
    id: user.id,
    subscription_status: 'active',
    subscription_tier: 'pro',
    is_admin: true,
    admin_role: 'super_admin'
  } : null;

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

  return {
    profile,
    profileLoading: false,
    canUseFeature,
    needsUpgrade,
    getSubscriptionInfo,
    profileError: null,
  };
};
