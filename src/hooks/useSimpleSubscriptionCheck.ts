
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface SubscriptionStatus {
  subscribed: boolean;
  subscription_tier: string;
  subscription_status: string;
  has_access: boolean;
  access_type: string;
  trial_hours_remaining?: number;
  can_start_trial?: boolean;
  trial_type?: string;
}

export const useSimpleSubscriptionCheck = () => {
  const [status, setStatus] = useState<SubscriptionStatus | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  const checkSubscription = async () => {
    if (!user) {
      setStatus(null);
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      
      console.log('Checking subscription status for user:', user.id);
      
      const { data, error } = await supabase.functions.invoke('check-subscription');
      
      if (error) {
        console.error('Subscription check error:', error);
        throw error;
      }
      
      console.log('Subscription check result:', data);
      setStatus(data);
    } catch (err) {
      console.error('Failed to check subscription:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
      setStatus({
        subscribed: false,
        subscription_tier: 'free',
        subscription_status: 'free',
        has_access: false,
        access_type: 'free',
        can_start_trial: true
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    checkSubscription();
  }, [user?.id]);

  return {
    status,
    isLoading,
    error,
    refresh: checkSubscription,
    hasAccess: status?.has_access || false,
    isAdmin: status?.access_type === 'admin',
    isPaid: status?.access_type === 'paid',
    isTrial: status?.access_type === 'trial',
    canStartTrial: status?.can_start_trial || false,
    trialHoursRemaining: status?.trial_hours_remaining || 0
  };
};
