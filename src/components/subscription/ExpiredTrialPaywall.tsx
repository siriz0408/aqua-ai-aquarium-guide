
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertTriangle, Lock } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { PlanSelector } from './PlanSelector';
import { PRICING_PLANS, type PricingPlan, formatPrice } from '@/config/pricing';

interface ExpiredTrialPaywallProps {
  isFullScreen?: boolean;
}

export const ExpiredTrialPaywall: React.FC<ExpiredTrialPaywallProps> = ({ 
  isFullScreen = false 
}) => {
  const { toast } = useToast();
  const [loading, setLoading] = React.useState(false);
  const [selectedPlan, setSelectedPlan] = React.useState<PricingPlan>(
    PRICING_PLANS.find(p => p.popular) || PRICING_PLANS[0]
  );

  const handleUpgrade = async () => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({
          title: "Authentication Required",
          description: "Please sign in to upgrade your subscription.",
          variant: "destructive",
        });
        return;
      }
      
      const { data, error } = await supabase.functions.invoke('create-checkout', {
        body: { priceId: selectedPlan.priceId }
      });

      if (error) {
        console.error('Supabase function error:', error);
        toast({
          title: "Error",
          description: "Failed to start checkout process. Please try again.",
          variant: "destructive",
        });
        return;
      }

      if (data?.url) {
        window.location.href = data.url;
      } else {
        throw new Error('No checkout URL received');
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
    <Card className="border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-900/20 max-w-4xl mx-auto">
      <CardHeader className="text-center">
        <div className="mx-auto mb-4 h-16 w-16 rounded-full bg-red-100 dark:bg-red-900 flex items-center justify-center">
          <AlertTriangle className="h-8 w-8 text-red-600" />
        </div>
        <CardTitle className="text-2xl text-red-800 dark:text-red-200 flex items-center justify-center gap-2">
          <Lock className="h-6 w-6" />
          Trial Expired
        </CardTitle>
        <CardDescription className="text-red-600 dark:text-red-300">
          Your 3-day free trial has ended. Subscribe to continue using AquaAI's powerful features.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <PlanSelector
          selectedPlan={selectedPlan}
          onPlanSelect={setSelectedPlan}
          showFeatures={true}
        />
        
        <div className="text-center">
          <Button 
            onClick={handleUpgrade}
            disabled={loading}
            className="w-full bg-red-600 hover:bg-red-700 text-white text-lg py-6 max-w-md mx-auto"
          >
            {loading ? "Processing..." : `Subscribe to ${selectedPlan.name} - ${formatPrice(selectedPlan.amount)}/${selectedPlan.interval}`}
          </Button>
          
          <p className="text-xs text-red-600 dark:text-red-400 mt-4">
            Cancel anytime • Secure payment via Stripe
          </p>
        </div>
      </CardContent>
    </Card>
  );

  if (isFullScreen) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-red-50 to-orange-50 dark:from-gray-900 dark:to-red-900">
        {content}
      </div>
    );
  }

  return content;
};
