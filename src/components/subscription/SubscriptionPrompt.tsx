
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Crown, Star } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { PlanSelector } from './PlanSelector';
import { PRICING_PLANS, type PricingPlan, formatPrice } from '@/config/pricing';

interface SubscriptionPromptProps {
  isFullScreen?: boolean;
}

export const SubscriptionPrompt: React.FC<SubscriptionPromptProps> = ({ 
  isFullScreen = false 
}) => {
  const { toast } = useToast();
  const { user } = useAuth();
  const [loading, setLoading] = React.useState(false);
  const [selectedPlan, setSelectedPlan] = React.useState<PricingPlan>(
    PRICING_PLANS.find(p => p.popular) || PRICING_PLANS[0]
  );

  const handleStartTrial = async () => {
    if (!user?.id) {
      toast({
        title: "Authentication Required",
        description: "Please sign in first.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      console.log('Starting Stripe checkout with trial...');
      console.log('User ID:', user.id);
      console.log('Selected Plan:', selectedPlan);

      // Create the Stripe checkout session with trial period
      const { data, error } = await supabase.functions.invoke('create-checkout', {
        body: { 
          priceId: selectedPlan.priceId,
          trialPeriodDays: selectedPlan.trialDays || 3
        }
      });

      console.log('Checkout response:', { data, error });

      if (error) {
        console.error('Supabase function error:', error);
        toast({
          title: "Error",
          description: "Failed to start trial process. Please try again.",
          variant: "destructive",
        });
        return;
      }

      if (data?.url) {
        console.log('Redirecting to Stripe checkout:', data.url);
        
        // Use window.location.href for more reliable redirect
        window.location.href = data.url;
      } else {
        console.error('No checkout URL received:', data);
        throw new Error('No checkout URL received from Stripe');
      }
    } catch (error) {
      console.error('Error creating checkout session:', error);
      toast({
        title: "Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const content = (
    <Card className="border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-900/20 max-w-4xl mx-auto">
      <CardHeader className="text-center">
        <div className="mx-auto mb-4 h-16 w-16 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
          <Star className="h-8 w-8 text-blue-600" />
        </div>
        <CardTitle className="text-2xl text-blue-800 dark:text-blue-200 flex items-center justify-center gap-2">
          <Crown className="h-6 w-6" />
          Welcome to AquaAI
        </CardTitle>
        <CardDescription className="text-blue-600 dark:text-blue-300">
          Choose your plan and start your 3-day free trial to access all premium features.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <PlanSelector
          selectedPlan={selectedPlan}
          onPlanSelect={setSelectedPlan}
          showFeatures={true}
        />
        
        <div className="bg-blue-50 dark:bg-blue-950/50 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
          <h4 className="font-medium text-blue-800 dark:text-blue-200 mb-2">How it works:</h4>
          <ol className="text-sm text-blue-700 dark:text-blue-300 space-y-1 text-left">
            <li>1. Start your 3-day free trial now</li>
            <li>2. Enjoy full access to all features</li>
            <li>3. Cancel anytime during trial - no charges</li>
            <li>4. After trial: {formatPrice(selectedPlan.amount)}/{selectedPlan.interval} (cancel anytime)</li>
          </ol>
        </div>
        
        <Button 
          onClick={handleStartTrial}
          disabled={loading}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white text-lg py-6"
        >
          {loading ? "Starting Trial..." : `Start 3-Day Free Trial - ${selectedPlan.name}`}
        </Button>
        
        <p className="text-xs text-blue-600 dark:text-blue-400 text-center">
          No commitment • Cancel anytime • Secure payment via Stripe
        </p>
      </CardContent>
    </Card>
  );

  if (isFullScreen) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-gray-900 dark:to-blue-900">
        {content}
      </div>
    );
  }

  return content;
};
