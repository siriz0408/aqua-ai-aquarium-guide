
import { useState, useEffect, useCallback } from 'react';
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

  const checkAccess = useCallback(async () => {
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
      
      // Use the enhanced check-subscription function
      const { data, error } = await supabase.functions.invoke('check-subscription');
      
      if (error) {
        console.error('Subscription check error:', error);
        
        // Fallback: try to get user data directly from profiles table
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('subscription_status, subscription_tier, is_admin, subscription_end_date')
          .eq('id', user.id)
          .single();
          
        if (profileError) {
          throw profileError;
        }
        
        console.log('Fallback profile data:', profileData);
        
        const accessStatus: ProSubscriptionStatus = {
          hasAccess: profileData.is_admin || 
                    (profileData.subscription_status === 'active' && profileData.subscription_tier === 'pro'),
          accessType: profileData.is_admin ? 'admin' : 
                     (profileData.subscription_status === 'active' && profileData.subscription_tier === 'pro') ? 'paid' : 'no_access',
          subscriptionTier: profileData.subscription_tier || 'free',
          subscriptionStatus: profileData.subscription_status || 'free',
          subscriptionEndDate: profileData.subscription_end_date
        };
        
        setStatus(accessStatus);
        return;
      }
      
      console.log('Enhanced Pro subscription check result:', data);
      
      const accessStatus: ProSubscriptionStatus = {
        hasAccess: data.has_access || false,
        accessType: data.access_type === 'admin' ? 'admin' : 
                   data.access_type === 'paid' ? 'paid' : 'no_access',
        subscriptionTier: data.subscription_tier || 'free',
        subscriptionStatus: data.subscription_status || 'free',
        subscriptionEndDate: data.subscription_end_date
      };
      
      setStatus(accessStatus);
      
      // If user should have access but doesn't, try to get detailed profile info
      if (!accessStatus.hasAccess && user.email) {
        console.log('Access denied, checking profile directly for:', user.email);
        
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('subscription_status, subscription_tier, is_admin, subscription_end_date, stripe_subscription_id, stripe_customer_id')
          .eq('email', user.email)
          .single();
        
        if (!profileError && profileData) {
          console.log('Direct profile lookup:', profileData);
          
          if (profileData.subscription_status === 'active' && profileData.subscription_tier === 'pro') {
            console.log('Profile shows active subscription, updating status');
            setStatus({
              hasAccess: true,
              accessType: 'paid',
              subscriptionTier: 'pro',
              subscriptionStatus: 'active',
              subscriptionEndDate: profileData.subscription_end_date
            });
          }
        }
      }
      
    } catch (err) {
      console.error('Failed to check Pro subscription:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
      
      // Set fallback status
      setStatus({
        hasAccess: false,
        accessType: 'no_access',
        subscriptionTier: 'free',
        subscriptionStatus: 'free'
      });
    } finally {
      setIsLoading(false);
    }
  }, [user?.id, user?.email]);

  useEffect(() => {
    checkAccess();
  }, [checkAccess]);

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
