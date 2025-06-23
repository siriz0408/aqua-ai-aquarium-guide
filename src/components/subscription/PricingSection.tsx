
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { RefreshCw } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { useSubscriptionStatus } from '@/hooks/useSubscriptionStatus';
import { PlanSelector } from './PlanSelector';
import { PRICING_PLANS, type PricingPlan, formatPrice } from '@/config/pricing';

export const PricingSection: React.FC = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const { checkSubscriptionStatus, isLoading: isCheckingStatus } = useSubscriptionStatus();
  const [selectedPlan, setSelectedPlan] = useState<PricingPlan>(
    PRICING_PLANS.find(p => p.popular) || PRICING_PLANS[0]
  );

  const handleSubscriptionUpgrade = async () => {
    if (!user) {
      toast({
        title: "Sign In Required",
        description: "Please sign in to start your free trial.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('create-checkout', {
        body: { 
          priceId: selectedPlan.priceId,
          trialPeriodDays: selectedPlan.trialDays || 3
        }
      });

      if (error) throw error;

      if (data?.url) {
        window.open(data.url, '_blank');
      }
    } catch (error) {
      console.error('Error creating checkout session:', error);
      toast({
        title: "Error",
        description: "Failed to start checkout process. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <section id="pricing" className="py-16 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">Choose Your AquaAI Plan</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Start your 3-day free trial today. Cancel anytime within 3 days to avoid charges.
          </p>
          
          {user && (
            <div className="mt-4">
              <Button
                variant="outline"
                size="sm"
                onClick={checkSubscriptionStatus}
                disabled={isCheckingStatus}
                className="gap-2"
              >
                <RefreshCw className={`h-4 w-4 ${isCheckingStatus ? 'animate-spin' : ''}`} />
                {isCheckingStatus ? 'Checking...' : 'Refresh Subscription Status'}
              </Button>
            </div>
          )}
        </div>

        <div className="max-w-4xl mx-auto">
          <PlanSelector
            selectedPlan={selectedPlan}
            onPlanSelect={setSelectedPlan}
            showFeatures={true}
          />
          
          <div className="mt-8 text-center">
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-200 mb-6">
              <h4 className="font-medium text-blue-800 mb-2">How it works:</h4>
              <ol className="text-sm text-blue-700 space-y-1">
                <li>1. Start your 3-day free trial</li>
                <li>2. Enjoy full access to all features</li>
                <li>3. Cancel within 3 days to avoid charges</li>
                <li>4. Or continue at {formatPrice(selectedPlan.amount)}/{selectedPlan.interval}</li>
              </ol>
            </div>
            
            <Button 
              onClick={handleSubscriptionUpgrade}
              disabled={isLoading}
              className="bg-blue-600 hover:bg-blue-700 text-lg py-6 px-8"
            >
              {isLoading ? "Starting Trial..." : `Start 3-Day Free Trial - ${selectedPlan.name}`}
            </Button>
            
            <p className="text-xs text-gray-500 text-center mt-4">
              No commitment • Cancel anytime • Secure payment via Stripe
            </p>
          </div>
        </div>

        <div className="text-center mt-8 text-sm text-gray-600">
          <p>
            Questions? All features are included with your subscription.
          </p>
        </div>
      </div>
    </section>
  );
};
