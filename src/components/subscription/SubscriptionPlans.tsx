
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Check, Star, Crown } from 'lucide-react';
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
  savings?: string;
}

const plans: Plan[] = [
  {
    id: 'pro-monthly',
    name: 'Monthly Pro',
    description: 'Full access with monthly billing',
    price: 4.99,
    period: 'month',
    priceId: 'price_1QP9nZ1d1AvgoBGoGhpT6Nqg',
    features: [
      { text: 'AI-Powered AquaBot Chat', included: true },
      { text: 'Advanced Setup Planner', included: true },
      { text: 'Unlimited tank tracking', included: true },
      { text: 'Water parameter logging', included: true },
      { text: 'Equipment management', included: true },
      { text: 'Educational resources', included: true },
      { text: 'Disease diagnosis tool', included: true },
      { text: 'Task management & reminders', included: true },
      { text: 'Priority customer support', included: true },
    ]
  },
  {
    id: 'pro-yearly',
    name: 'Annual Pro',
    description: 'Full access with yearly billing',
    price: 49.99,
    period: 'year',
    priceId: 'price_1QP9o91d1AvgoBGoLCTKfWn5',
    popular: true,
    savings: '17% savings vs monthly',
    features: [
      { text: 'AI-Powered AquaBot Chat', included: true },
      { text: 'Advanced Setup Planner', included: true },
      { text: 'Unlimited tank tracking', included: true },
      { text: 'Water parameter logging', included: true },
      { text: 'Equipment management', included: true },
      { text: 'Educational resources', included: true },
      { text: 'Disease diagnosis tool', included: true },
      { text: 'Task management & reminders', included: true },
      { text: 'Priority customer support', included: true },
      { text: '17% savings vs monthly', included: true },
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

    setLoadingPlan(plan.id);
    try {
      console.log(`Starting subscription process for plan:`, plan.name);
      
      const { data, error } = await supabase.functions.invoke('create-checkout', {
        body: { priceId: plan.priceId }
      });

      if (error) throw error;

      if (data?.url) {
        window.open(data.url, '_blank');
      } else {
        throw new Error('No checkout URL received');
      }
    } catch (error) {
      console.error(`Error creating subscription:`, error);
      toast({
        title: "Error",
        description: "Failed to start subscription process. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoadingPlan(null);
    }
  };

  return (
    <div className="py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">Choose Your Plan</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Get full access to AquaAI's powerful aquarium management features with our affordable subscription plans.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 max-w-3xl mx-auto">
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
                <div className="flex items-center justify-center gap-2 mb-2">
                  <Crown className="w-5 h-5 text-blue-600" />
                  <CardTitle className="text-xl">{plan.name}</CardTitle>
                </div>
                <CardDescription className="text-sm">
                  {plan.description}
                </CardDescription>
                <div className="mt-4">
                  <span className="text-4xl font-bold">
                    ${plan.price}
                  </span>
                  <span className="text-gray-600">/{plan.period}</span>
                </div>
                {plan.period === 'year' && (
                  <div className="text-sm text-green-600 font-medium mt-1">
                    ${(plan.price / 12).toFixed(2)}/month • {plan.savings}
                  </div>
                )}
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
                      : 'bg-green-600 hover:bg-green-700'
                  }`}
                >
                  {loadingPlan === plan.id ? (
                    "Processing..."
                  ) : (
                    <>
                      <Crown className="w-4 h-4 mr-2" />
                      Subscribe Now
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="text-center mt-12">
          <div className="bg-blue-50 p-6 rounded-lg border max-w-2xl mx-auto">
            <h4 className="font-medium text-blue-800 mb-2">🐠 Professional Aquarium Management</h4>
            <p className="text-sm text-blue-600">
              Join thousands of aquarists who trust AquaAI to manage their aquariums. 
              Cancel anytime with just a few clicks.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
