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

  // Check if user can use features
  const canUseFeature = (feature: string = 'chat') => {
    if (!profile) return false;
    
    const isPaidUser = profile.subscription_status === 'active';
    const hasCredits = profile.free_credits_remaining > 0;
    
    return isPaidUser || hasCredits;
  };

  // Get remaining credits for display
  const getRemainingCredits = () => {
    if (!profile) return 0;
    
    const isPaidUser = profile.subscription_status === 'active';
    return isPaidUser ? null : profile.free_credits_remaining; // null means unlimited
  };

  // Check if user needs to upgrade
  const needsUpgrade = () => {
    if (!profile) return false;
    
    const isPaidUser = profile.subscription_status === 'active';
    const hasCredits = profile.free_credits_remaining > 0;
    
    return !isPaidUser && !hasCredits;
  };

  // Update credits after a successful operation (called from frontend)
  const updateCreditsAfterUse = useMutation({
    mutationFn: async () => {
      if (!user || !profile) throw new Error('User or profile not available');
      
      const isPaidUser = profile.subscription_status === 'active';
      if (isPaidUser) return; // Paid users don't consume credits
      
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
          description: "You've used all your free credits. Upgrade to continue using AquaBot!",
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
