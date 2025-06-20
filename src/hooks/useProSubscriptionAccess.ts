
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface ProSubscriptionStatus {
  hasAccess: boolean;
  accessType: 'admin' | 'paid' | 'no_access';
  subscriptionTier: string;
  subscriptionStatus: string;
  subscriptionEndDate?: string;
}

export const useProSubscriptionAccess = () => {
  const [status, setStatus] = useState<ProSubscriptionStatus | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  const checkAccess = async () => {
    if (!user) {
      setStatus({
        hasAccess: false,
        accessType: 'no_access',
        subscriptionTier: 'free',
        subscriptionStatus: 'free'
      });
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      
      console.log('Checking Pro subscription access for user:', user.id);
      
      const { data, error } = await supabase.functions.invoke('check-subscription');
      
      if (error) {
        console.error('Subscription check error:', error);
        throw error;
      }
      
      console.log('Pro subscription check result:', data);
      
      const accessStatus: ProSubscriptionStatus = {
        hasAccess: data.has_access || false,
        accessType: data.access_type === 'admin' ? 'admin' : 
                   data.access_type === 'paid' ? 'paid' : 'no_access',
        subscriptionTier: data.subscription_tier || 'free',
        subscriptionStatus: data.subscription_status || 'free',
        subscriptionEndDate: data.subscription_end_date
      };
      
      setStatus(accessStatus);
    } catch (err) {
      console.error('Failed to check Pro subscription:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
      setStatus({
        hasAccess: false,
        accessType: 'no_access',
        subscriptionTier: 'free',
        subscriptionStatus: 'free'
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    checkAccess();
  }, [user?.id]);

  return {
    status,
    isLoading,
    error,
    refresh: checkAccess,
    hasAccess: status?.hasAccess || false,
    isAdmin: status?.accessType === 'admin',
    isPaidSubscriber: status?.accessType === 'paid',
    subscriptionTier: status?.subscriptionTier || 'free',
    subscriptionStatus: status?.subscriptionStatus || 'free'
  };
};
