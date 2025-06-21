
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

interface SubscriptionStatus {
  hasAccess: boolean;
  isActive: boolean;
  isAdmin: boolean;
  tier: 'free' | 'pro';
  status: 'inactive' | 'active';
  loading: boolean;
}

export const useSubscriptionAccess = () => {
  const { user } = useAuth();
  const [subscriptionStatus, setSubscriptionStatus] = useState<SubscriptionStatus>({
    hasAccess: false,
    isActive: false,
    isAdmin: false,
    tier: 'free',
    status: 'inactive',
    loading: true
  });

  const checkAccess = async () => {
    if (!user) {
      setSubscriptionStatus({
        hasAccess: false,
        isActive: false,
        isAdmin: false,
        tier: 'free',
        status: 'inactive',
        loading: false
      });
      return;
    }

    try {
      setSubscriptionStatus(prev => ({ ...prev, loading: true }));

      const { data: profile, error } = await supabase
        .from('profiles')
        .select('subscription_status, subscription_tier, is_admin')
        .eq('id', user.id)
        .single();

      if (error) {
        console.error('Error fetching subscription status:', error);
        setSubscriptionStatus(prev => ({ ...prev, loading: false }));
        return;
      }

      const isAdmin = profile?.is_admin || false;
      const isActive = profile?.subscription_status === 'active';
      const tier = profile?.subscription_tier || 'free';
      const hasAccess = isAdmin || isActive;

      setSubscriptionStatus({
        hasAccess,
        isActive,
        isAdmin,
        tier: tier as 'free' | 'pro',
        status: isActive ? 'active' : 'inactive',
        loading: false
      });
    } catch (error) {
      console.error('Error checking subscription access:', error);
      setSubscriptionStatus(prev => ({ ...prev, loading: false }));
    }
  };

  useEffect(() => {
    checkAccess();
  }, [user]);

  return {
    ...subscriptionStatus,
    refresh: checkAccess
  };
};
