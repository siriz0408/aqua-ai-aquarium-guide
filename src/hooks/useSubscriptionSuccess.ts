
import { useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useCredits } from '@/hooks/useCredits';

export const useSubscriptionSuccess = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { getSubscriptionInfo } = useCredits();

  useEffect(() => {
    const success = searchParams.get('success');
    const sessionId = searchParams.get('session_id');

    if (success === 'true' && sessionId) {
      handleSubscriptionSuccess(sessionId);
    }
  }, [searchParams]);

  const handleSubscriptionSuccess = async (sessionId: string) => {
    try {
      console.log('Processing successful subscription:', sessionId);

      // Give Stripe webhook a moment to process
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Refresh subscription status
      const { data, error } = await supabase.functions.invoke('check-subscription');
      
      if (error) {
        console.error('Error checking subscription:', error);
      } else {
        console.log('Subscription status refreshed:', data);
      }

      // Show success message
      toast({
        title: "Subscription Activated!",
        description: "Welcome to AquaBot Pro! You now have unlimited access to all features.",
        duration: 5000,
      });

      // Clear URL parameters and redirect to home
      navigate('/', { replace: true });

    } catch (error) {
      console.error('Error handling subscription success:', error);
      toast({
        title: "Subscription Processing",
        description: "Your subscription is being processed. Please refresh the page in a moment.",
        variant: "default",
      });
    }
  };

  return {
    subscriptionInfo: getSubscriptionInfo(),
  };
};
