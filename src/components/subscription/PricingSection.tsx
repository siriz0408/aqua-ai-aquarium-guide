
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { RefreshCw, Check } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { useSubscriptionStatus } from '@/hooks/useSubscriptionStatus';
import { PRICING_PLANS, formatPrice } from '@/config/pricing';

export const PricingSection: React.FC = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState<string | null>(null);
  const { checkSubscriptionStatus, isLoading: isCheckingStatus } = useSubscriptionStatus();

  const handleSubscriptionUpgrade = async (priceId: string, planName: string) => {
    if (!user) {
      toast({
        title: "Sign In Required",
        description: "Please sign in to upgrade to Pro.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(priceId);
    try {
      const { data, error } = await supabase.functions.invoke('create-checkout', {
        body: { priceId }
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
      setIsLoading(null);
    }
  };

  return (
    <section id="pricing" className="py-16 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">Choose Your Plan</h2>
          <p className="text-gray-600 max-w-2xl mx-auto mb-6">
            Get full access to AquaAI's powerful aquarium management features with our affordable subscription plans.
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
                {isCheckingStatus ? 'Checking...' : 'Refresh Status'}
              </Button>
            </div>
          )}
        </div>

        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {PRICING_PLANS.map((plan) => (
            <Card 
              key={plan.id} 
              className={`relative border-2 ${
                plan.popular 
                  ? 'border-blue-200 bg-blue-50' 
                  : 'border-gray-200 bg-gray-50'
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <Badge className="bg-blue-600 text-white px-3 py-1">
                    Most Popular
                  </Badge>
                </div>
              )}
              <CardHeader className="text-center pt-8">
                <CardTitle className="text-2xl">{plan.name}</CardTitle>
                <CardDescription>
                  {plan.description}
                </CardDescription>
                <div className={`text-4xl font-bold mt-4 ${
                  plan.popular ? 'text-blue-600' : 'text-gray-600'
                }`}>
                  {formatPrice(plan.amount)}
                  <span className="text-lg font-normal text-gray-600">
                    /{plan.interval}
                  </span>
                </div>
                {plan.savings && (
                  <div className="text-green-600 font-medium">{plan.savings}</div>
                )}
                {plan.interval === 'year' && (
                  <div className="text-sm text-gray-500">
                    Equivalent to ${(plan.amount / 100 / 12).toFixed(2)}/month
                  </div>
                )}
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Check className={`h-5 w-5 ${plan.popular ? 'text-blue-600' : 'text-gray-600'}`} />
                    <span>AI-powered aquarium assistant</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className={`h-5 w-5 ${plan.popular ? 'text-blue-600' : 'text-gray-600'}`} />
                    <span>Complete tank management</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className={`h-5 w-5 ${plan.popular ? 'text-blue-600' : 'text-gray-600'}`} />
                    <span>Water parameter tracking</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className={`h-5 w-5 ${plan.popular ? 'text-blue-600' : 'text-gray-600'}`} />
                    <span>Disease diagnosis tool</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className={`h-5 w-5 ${plan.popular ? 'text-blue-600' : 'text-gray-600'}`} />
                    <span>Task management & reminders</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className={`h-5 w-5 ${plan.popular ? 'text-blue-600' : 'text-gray-600'}`} />
                    <span>Complete knowledge base</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className={`h-5 w-5 ${plan.popular ? 'text-blue-600' : 'text-gray-600'}`} />
                    <span>Priority customer support</span>
                  </div>
                  {plan.trialDays && (
                    <div className="flex items-center gap-2">
                      <Check className={`h-5 w-5 ${plan.popular ? 'text-blue-600' : 'text-gray-600'}`} />
                      <span className="font-medium text-green-600">
                        {plan.trialDays}-day free trial
                      </span>
                    </div>
                  )}
                </div>
                <Button 
                  onClick={() => handleSubscriptionUpgrade(plan.priceId, plan.name)}
                  disabled={isLoading === plan.priceId}
                  className={`w-full mt-6 ${
                    plan.popular 
                      ? 'bg-blue-600 hover:bg-blue-700' 
                      : 'bg-gray-600 hover:bg-gray-700'
                  }`}
                >
                  {isLoading === plan.priceId ? "Processing..." : `Start ${plan.trialDays}-Day Free Trial`}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="text-center mt-12">
          <div className="bg-gray-50 p-6 rounded-lg border max-w-2xl mx-auto">
            <h4 className="font-medium text-gray-800 mb-2">🐠 Start Your Free Trial</h4>
            <p className="text-sm text-gray-600">
              Try AquaAI risk-free with our 3-day free trial. Cancel anytime during the trial period 
              and you won't be charged. No setup fees, no hidden costs.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

const Badge: React.FC<{ className: string; children: React.ReactNode }> = ({ className, children }) => (
  <span className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${className}`}>
    {children}
  </span>
);
