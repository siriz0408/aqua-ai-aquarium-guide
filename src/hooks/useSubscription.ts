
import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

export function useSubscription() {
  const { user } = useAuth();
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setIsSubscribed(false);
      setLoading(false);
      return;
    }

    const checkSubscription = async () => {
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('subscription_status, subscription_tier')
          .eq('id', user.id)
          .single();

        if (!error && data) {
          setIsSubscribed(data.subscription_status === 'active' && data.subscription_tier === 'pro');
        } else {
          console.error('Error fetching subscription:', error);
          setIsSubscribed(false);
        }
      } catch (error) {
        console.error('Subscription check failed:', error);
        setIsSubscribed(false);
      } finally {
        setLoading(false);
      }
    };

    checkSubscription();
  }, [user]);

  return { isSubscribed, loading };
}
