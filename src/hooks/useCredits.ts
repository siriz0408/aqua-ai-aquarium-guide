
import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

export interface UserProfile {
  id: string;
  full_name?: string;
  subscription_status: string;
  subscription_tier: string;
  free_credits_remaining: number;
  total_credits_used: number;
  subscription_start_date?: string;
  subscription_end_date?: string;
  is_admin?: boolean;
  admin_role?: string;
}

export interface UsageLog {
  id: string;
  feature_used: string;
  credits_before: number;
  credits_after: number;
  subscription_status: string;
  created_at: string;
}

export const useCredits = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch user profile with subscription info
  const { data: profile, isLoading: profileLoading } = useQuery({
    queryKey: ['userProfile', user?.id],
    queryFn: async () => {
      if (!user) return null;
      
      const { data, error } = await supabase
        .from('profiles')
        .select(`
          id,
          full_name,
          subscription_status,
          subscription_tier,
          free_credits_remaining,
          total_credits_used,
          subscription_start_date,
          subscription_end_date,
          is_admin,
          admin_role
        `)
        .eq('id', user.id)
        .single();

      if (error) {
        console.error('Error fetching user profile:', error);
        throw error;
      }

      return data as UserProfile;
    },
    enabled: !!user,
  });

  // Fetch usage logs
  const { data: usageLogs = [], isLoading: logsLoading } = useQuery({
    queryKey: ['usageLogs', user?.id],
    queryFn: async () => {
      if (!user) return [];

      const { data, error } = await supabase
        .from('subscription_usage_logs')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) {
        console.error('Error fetching usage logs:', error);
        return [];
      }

      return data as UsageLog[];
    },
    enabled: !!user,
  });

  // Check if user can use features based on new subscription logic
  const canUseFeature = (feature: string = 'chat') => {
    if (!profile) return false;
    
    // Super admins have unlimited access to everything
    if (profile.is_admin && profile.admin_role === 'super_admin') {
      return true;
    }
    
    // Regular admins have unlimited access to chat
    if (profile.is_admin) {
      return true;
    }
    
    // Premium users (subscription_status = 'active' and subscription_tier = 'premium') have unlimited access
    if (profile.subscription_status === 'active' && profile.subscription_tier === 'premium') {
      return true;
    }
    
    // Basic users (subscription_status = 'active' and subscription_tier = 'basic') have 100 credits per month
    if (profile.subscription_status === 'active' && profile.subscription_tier === 'basic') {
      // For now, we'll use free_credits_remaining to track basic user credits
      // In a full implementation, we'd track monthly usage separately
      return profile.free_credits_remaining > 0;
    }
    
    // Free users have 5 credits total
    if (profile.subscription_status === 'free') {
      if (feature === 'chat') {
        return profile.free_credits_remaining > 0;
      }
      // Free users can access planner and learn without credits
      if (feature === 'planner' || feature === 'learn') {
        return true;
      }
    }
    
    return false;
  };

  // Get remaining credits for display
  const getRemainingCredits = () => {
    if (!profile) return 0;
    
    // Super admins and regular admins have unlimited
    if (profile.is_admin) {
      return null; // null means unlimited
    }
    
    // Premium users have unlimited
    if (profile.subscription_status === 'active' && profile.subscription_tier === 'premium') {
      return null; // null means unlimited
    }
    
    // Basic and free users show actual credits
    return profile.free_credits_remaining;
  };

  // Check if user needs to upgrade
  const needsUpgrade = () => {
    if (!profile) return false;
    
    // Admins never need to upgrade
    if (profile.is_admin) return false;
    
    // Premium users never need to upgrade
    if (profile.subscription_status === 'active' && profile.subscription_tier === 'premium') {
      return false;
    }
    
    // Basic users need upgrade if they run out of credits
    if (profile.subscription_status === 'active' && profile.subscription_tier === 'basic') {
      return profile.free_credits_remaining <= 0;
    }
    
    // Free users need upgrade if they run out of credits
    return profile.subscription_status === 'free' && profile.free_credits_remaining <= 0;
  };

  // Update credits after a successful operation
  const updateCreditsAfterUse = useMutation({
    mutationFn: async () => {
      if (!user || !profile) throw new Error('User or profile not available');
      
      // Admins and premium users don't consume credits
      if (profile.is_admin || 
          (profile.subscription_status === 'active' && profile.subscription_tier === 'premium')) {
        return { creditsRemaining: null }; // Unlimited
      }
      
      const newCreditsRemaining = Math.max(0, profile.free_credits_remaining - 1);
      const newTotalUsed = profile.total_credits_used + 1;

      const { error } = await supabase
        .from('profiles')
        .update({
          free_credits_remaining: newCreditsRemaining,
          total_credits_used: newTotalUsed
        })
        .eq('id', user.id);

      if (error) throw error;

      return { creditsRemaining: newCreditsRemaining };
    },
    onSuccess: (data) => {
      // Invalidate queries to refresh the UI
      queryClient.invalidateQueries({ queryKey: ['userProfile', user?.id] });
      queryClient.invalidateQueries({ queryKey: ['usageLogs', user?.id] });
      
      if (data?.creditsRemaining === 0) {
        toast({
          title: "Credits Exhausted",
          description: "You've used all your credits. Upgrade to continue using AquaBot!",
          variant: "destructive",
        });
      } else if (data?.creditsRemaining && data.creditsRemaining <= 2) {
        toast({
          title: "Low Credits",
          description: `Only ${data.creditsRemaining} credits remaining. Consider upgrading soon.`,
        });
      }
    },
    onError: (error) => {
      console.error('Error updating credits:', error);
      toast({
        title: "Error",
        description: "Failed to update credit usage.",
        variant: "destructive",
      });
    },
  });

  const getUserPlanType = () => {
    if (!profile) return 'free';
    
    if (profile.is_admin && profile.admin_role === 'super_admin') return 'super_admin';
    if (profile.is_admin) return 'admin';
    if (profile.subscription_status === 'active' && profile.subscription_tier === 'premium') return 'premium';
    if (profile.subscription_status === 'active' && profile.subscription_tier === 'basic') return 'basic';
    return 'free';
  };

  return {
    profile,
    usageLogs,
    profileLoading,
    logsLoading,
    canUseFeature,
    getRemainingCredits,
    needsUpgrade,
    updateCreditsAfterUse: updateCreditsAfterUse.mutate,
    isUpdatingCredits: updateCreditsAfterUse.isPending,
    getUserPlanType,
  };
};
