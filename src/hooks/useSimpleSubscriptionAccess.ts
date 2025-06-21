
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

interface SimpleSubscriptionAccess {
  hasAccess: boolean;
  isActive: boolean;
  isAdmin: boolean;
  tier: 'free' | 'pro';
  loading: boolean;
}

export const useSimpleSubscriptionAccess = () => {
  const { user } = useAuth();
  const [access, setAccess] = useState<SimpleSubscriptionAccess>({
    hasAccess: false,
    isActive: false,
    isAdmin: false,
    tier: 'free',
    loading: true
  });

  const checkAccess = async () => {
    if (!user) {
      setAccess({
        hasAccess: false,
        isActive: false,
        isAdmin: false,
        tier: 'free',
        loading: false
      });
      return;
    }

    try {
      setAccess(prev => ({ ...prev, loading: true }));

      const { data: profile, error } = await supabase
        .from('profiles')
        .select('subscription_status, subscription_tier, is_admin, stripe_subscription_id')
        .eq('id', user.id)
        .single();

      if (error) {
        console.error('Error fetching subscription status:', error);
        setAccess(prev => ({ ...prev, loading: false }));
        return;
      }

      const isAdmin = profile?.is_admin || false;
      const isActive = profile?.subscription_status === 'active' && 
                      profile?.stripe_subscription_id && 
                      profile?.stripe_subscription_id.length > 0;
      const tier = profile?.subscription_tier || 'free';
      const hasAccess = isAdmin || isActive;

      setAccess({
        hasAccess,
        isActive,
        isAdmin,
        tier: tier as 'free' | 'pro',
        loading: false
      });
    } catch (error) {
      console.error('Error checking subscription access:', error);
      setAccess(prev => ({ ...prev, loading: false }));
    }
  };

  useEffect(() => {
    checkAccess();
  }, [user]);

  return {
    ...access,
    refresh: checkAccess
  };
};
