
import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

export interface UserProfile {
  id: string;
  subscription_status: string;
  subscription_tier: string;
  free_credits_remaining: number;
  total_credits_used: number;
  monthly_credits_limit?: number;
  monthly_credits_used?: number;
  last_credit_reset?: string;
  subscription_start_date?: string;
  subscription_end_date?: string;
  is_admin?: boolean;
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
          subscription_status,
          subscription_tier,
          free_credits_remaining,
          total_credits_used,
          monthly_credits_limit,
          monthly_credits_used,
          last_credit_reset,
          subscription_start_date,
          subscription_end_date,
          is_admin
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

  // Check if user can use features - Updated logic for admin privileges
  const canUseFeature = (feature: string = 'chat') => {
    if (!profile) return false;
    
    // Admins can always use features regardless of credit count
    if (profile.is_admin) {
      return true;
    }
    
    // For non-admin users, check if they have credits remaining
    const hasCredits = profile.free_credits_remaining > 0;
    return hasCredits;
  };

  // Get remaining credits for display - Always return actual database value
  const getRemainingCredits = () => {
    if (!profile) return 0;
    
    // Always return the actual credit count from database
    return profile.free_credits_remaining;
  };

  // Check if user needs to upgrade - Only for non-admin users
  const needsUpgrade = () => {
    if (!profile) return false;
    
    // Admins never need to upgrade
    if (profile.is_admin) return false;
    
    const hasCredits = profile.free_credits_remaining > 0;
    return !hasCredits;
  };

  // Update credits after a successful operation - Now applies to ALL users
  const updateCreditsAfterUse = useMutation({
    mutationFn: async () => {
      if (!user || !profile) throw new Error('User or profile not available');
      
      // Deduct 1 credit for ALL users (including admins and paid users)
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
      
      // Only show upgrade prompts for non-admin users
      if (!profile?.is_admin) {
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
    usageLogs,
    profileLoading,
    logsLoading,
    canUseFeature,
    getRemainingCredits,
    needsUpgrade,
    updateCreditsAfterUse: updateCreditsAfterUse.mutate,
    isUpdatingCredits: updateCreditsAfterUse.isPending,
  };
};
