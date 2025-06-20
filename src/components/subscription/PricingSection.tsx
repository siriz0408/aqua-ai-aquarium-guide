
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { RefreshCw, CheckCircle, Clock } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { useSubscriptionStatus } from '@/hooks/useSubscriptionStatus';
import { PlanSelector } from './PlanSelector';
import { PRICING_PLANS, type PricingPlan, formatPrice, getDefaultPlan } from '@/config/pricing';

export const PricingSection: React.FC = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const { checkSubscriptionStatus, isLoading: isCheckingStatus } = useSubscriptionStatus();
  const [selectedPlan, setSelectedPlan] = useState<PricingPlan>(getDefaultPlan());

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
      console.log('Starting checkout process', { 
        planId: selectedPlan.id,
        priceId: selectedPlan.priceId,
        trialDays: selectedPlan.trialDays
      });

      const { data, error } = await supabase.functions.invoke('create-checkout', {
        body: { 
          priceId: selectedPlan.priceId,
          trialPeriodDays: selectedPlan.trialDays || 3
        }
      });

      if (error) {
        console.error('Checkout creation error:', error);
        throw error;
      }

      console.log('Checkout session created:', data);

      if (data?.url) {
        // Show success message before redirect
        toast({
          title: "Redirecting to Checkout",
          description: `Starting your ${selectedPlan.trialDays}-day free trial for ${selectedPlan.name}`,
        });
        
        // Small delay to show the toast
        setTimeout(() => {
          window.open(data.url, '_blank');
        }, 1000);
      } else {
        throw new Error('No checkout URL received');
      }
    } catch (error) {
      console.error('Error creating checkout session:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      toast({
        title: "Checkout Failed",
        description: `Failed to start checkout: ${errorMessage}`,
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
            Start your {selectedPlan.trialDays || 3}-day free trial today. Cancel anytime within {selectedPlan.trialDays || 3} days to avoid charges.
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
            <div className="bg-blue-50 p-6 rounded-lg border border-blue-200 mb-6">
              <h4 className="font-medium text-blue-800 mb-3 flex items-center justify-center gap-2">
                <Clock className="h-5 w-5" />
                How Your {selectedPlan.trialDays || 3}-Day Free Trial Works:
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm text-blue-700">
                <div className="flex flex-col items-center gap-2">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center font-semibold">1</div>
                  <p>Click "Start Free Trial"</p>
                </div>
                <div className="flex flex-col items-center gap-2">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center font-semibold">2</div>
                  <p>Enter payment info (not charged)</p>
                </div>
                <div className="flex flex-col items-center gap-2">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center font-semibold">3</div>
                  <p>Enjoy {selectedPlan.trialDays || 3} days of full access</p>
                </div>
                <div className="flex flex-col items-center gap-2">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center font-semibold">4</div>
                  <p>Cancel anytime or continue at {formatPrice(selectedPlan.amount)}/{selectedPlan.interval}</p>
                </div>
              </div>
            </div>
            
            <Button 
              onClick={handleSubscriptionUpgrade}
              disabled={isLoading}
              className="bg-blue-600 hover:bg-blue-700 text-lg py-6 px-8 min-w-64"
            >
              {isLoading ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  Starting Trial...
                </>
              ) : (
                <>
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Start {selectedPlan.trialDays || 3}-Day Free Trial - {selectedPlan.name}
                </>
              )}
            </Button>
            
            <div className="mt-6 space-y-2">
              <p className="text-xs text-gray-500">
                <strong>No commitment</strong> • Cancel anytime during trial • Secure payment via Stripe
              </p>
              <p className="text-xs text-gray-600">
                After trial: {formatPrice(selectedPlan.amount)}/{selectedPlan.interval} • 
                {selectedPlan.interval === 'year' && ' Save 10% vs monthly'}
              </p>
            </div>
          </div>
        </div>

        <div className="text-center mt-12 text-sm text-gray-600">
          <p>
            Questions about pricing? All features are included with your subscription.
          </p>
        </div>
      </div>
    </section>
  );
};
