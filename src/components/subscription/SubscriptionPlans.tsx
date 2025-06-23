
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Check, Star, Zap } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';

interface PlanFeature {
  text: string;
  included: boolean;
}

interface Plan {
  id: string;
  name: string;
  description: string;
  price: number;
  period: string;
  priceId: string;
  features: PlanFeature[];
  popular?: boolean;
  type: 'subscription' | 'onetime';
}

const plans: Plan[] = [
  {
    id: 'free',
    name: 'Free Plan',
    description: 'Perfect for getting started',
    price: 0,
    period: 'forever',
    priceId: '',
    type: 'subscription',
    features: [
      { text: 'Basic tank management', included: true },
      { text: 'Water parameter tracking', included: true },
      { text: 'AI aquarium assistant', included: true },
      { text: 'Task reminders', included: true },
      { text: 'Priority support', included: false },
      { text: 'Advanced analytics', included: false },
    ]
  },
  {
    id: 'pro-monthly',
    name: 'Pro Monthly',
    description: 'Full access with monthly billing',
    price: 4.99,
    period: 'month',
    priceId: 'price_1QP9nZ1d1AvgoBGoGhpT6Nqg',
    type: 'subscription',
    popular: true,
    features: [
      { text: 'Everything in Free', included: true },
      { text: 'Priority support', included: true },
      { text: 'Advanced analytics', included: true },
      { text: 'Unlimited tanks', included: true },
      { text: 'Export data', included: true },
      { text: '3-day free trial', included: true },
    ]
  },
  {
    id: 'pro-yearly',
    name: 'Pro Yearly',
    description: 'Full access with yearly billing (17% savings)',
    price: 49.99,
    period: 'year',
    priceId: 'price_1QP9o91d1AvgoBGoLCTKfWn5',
    type: 'subscription',
    features: [
      { text: 'Everything in Free', included: true },
      { text: 'Priority support', included: true },
      { text: 'Advanced analytics', included: true },
      { text: 'Unlimited tanks', included: true },
      { text: 'Export data', included: true },
      { text: '17% savings vs monthly', included: true },
    ]
  },
  {
    id: 'lifetime',
    name: 'Lifetime Access',
    description: 'One-time payment for lifetime access',
    price: 99.99,
    period: 'lifetime',
    priceId: 'prod_SWBItVMEChp6DI',
    type: 'onetime',
    features: [
      { text: 'Everything in Pro', included: true },
      { text: 'Lifetime updates', included: true },
      { text: 'No recurring fees', included: true },
      { text: 'Priority support', included: true },
      { text: 'Advanced analytics', included: true },
      { text: 'Best value', included: true },
    ]
  }
];

export const SubscriptionPlans: React.FC = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null);

  const handleSubscribe = async (plan: Plan) => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to subscribe to a plan.",
        variant: "destructive",
      });
      return;
    }

    if (plan.price === 0) {
      toast({
        title: "Free Plan Active",
        description: "You're already on the free plan with full access!",
      });
      return;
    }

    setLoadingPlan(plan.id);
    try {
      console.log(`Starting ${plan.type} process for plan:`, plan.name);
      
      if (plan.type === 'subscription') {
        // Handle subscription plans
        const { data, error } = await supabase.functions.invoke('create-checkout', {
          body: { priceId: plan.priceId }
        });

        if (error) throw error;

        if (data?.url) {
          window.open(data.url, '_blank');
        } else {
          throw new Error('No checkout URL received');
        }
      } else {
        // Handle one-time payment
        const { data, error } = await supabase.functions.invoke('create-payment', {
          body: { productId: plan.priceId }
        });

        if (error) throw error;

        if (data?.url) {
          window.open(data.url, '_blank');
        } else {
          throw new Error('No payment URL received');
        }
      }
    } catch (error) {
      console.error(`Error creating ${plan.type}:`, error);
      toast({
        title: "Error",
        description: `Failed to start ${plan.type === 'subscription' ? 'subscription' : 'payment'} process. Please try again.`,
        variant: "destructive",
      });
    } finally {
      setLoadingPlan(null);
    }
  };

  return (
    <div className="py-12 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">Choose Your Plan</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            All features are available for free! Upgrade to Pro to support development and get priority support.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {plans.map((plan) => (
            <Card 
              key={plan.id} 
              className={`relative ${
                plan.popular 
                  ? 'border-2 border-blue-500 shadow-lg scale-105' 
                  : 'border border-gray-200'
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <Badge className="bg-blue-500 text-white px-3 py-1">
                    <Star className="w-3 h-3 mr-1" />
                    Most Popular
                  </Badge>
                </div>
              )}
              
              <CardHeader className="text-center pb-4">
                <CardTitle className="text-xl mb-2">{plan.name}</CardTitle>
                <CardDescription className="text-sm">
                  {plan.description}
                </CardDescription>
                <div className="mt-4">
                  <span className="text-4xl font-bold">
                    ${plan.price}
                  </span>
                  {plan.period !== 'forever' && (
                    <span className="text-gray-600">/{plan.period}</span>
                  )}
                </div>
              </CardHeader>
              
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  {plan.features.map((feature, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <Check 
                        className={`w-4 h-4 ${
                          feature.included 
                            ? 'text-green-500' 
                            : 'text-gray-300'
                        }`} 
                      />
                      <span className={`text-sm ${
                        feature.included 
                          ? 'text-gray-900' 
                          : 'text-gray-400'
                      }`}>
                        {feature.text}
                      </span>
                    </div>
                  ))}
                </div>
                
                <Button 
                  onClick={() => handleSubscribe(plan)}
                  disabled={loadingPlan === plan.id}
                  className={`w-full mt-6 ${
                    plan.popular 
                      ? 'bg-blue-600 hover:bg-blue-700' 
                      : plan.price === 0
                      ? 'bg-gray-600 hover:bg-gray-700'
                      : 'bg-green-600 hover:bg-green-700'
                  }`}
                >
                  {loadingPlan === plan.id ? (
                    "Processing..."
                  ) : plan.price === 0 ? (
                    "Current Plan"
                  ) : plan.type === 'subscription' ? (
                    <>
                      <Zap className="w-4 h-4 mr-2" />
                      Start Free Trial
                    </>
                  ) : (
                    "Buy Lifetime"
                  )}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="text-center mt-12">
          <div className="bg-blue-50 p-6 rounded-lg border max-w-2xl mx-auto">
            <h4 className="font-medium text-blue-800 mb-2">🐠 All Features Available Free</h4>
            <p className="text-sm text-blue-600">
              Every feature in AquaAI is available for free! Pro subscriptions help support development 
              and provide priority customer support. Cancel anytime during your free trial.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
