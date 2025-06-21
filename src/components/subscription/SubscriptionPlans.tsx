
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Check, Crown, Zap } from 'lucide-react';
import { useSubscriptionAccess } from '@/hooks/useSubscriptionAccess';

interface SubscriptionPlansProps {
  onSelectPlan?: (planId: string) => void;
}

const PLANS = [
  {
    id: 'free',
    name: 'Free',
    price: '$0',
    period: 'forever',
    description: 'Get started with basic aquarium management',
    features: [
      'Basic tank tracking',
      'Simple maintenance reminders',
      'Community access',
      'Basic water parameter logging'
    ],
    limitations: [
      'No AI assistance',
      'Limited tank capacity (2 tanks)',
      'Basic reporting only'
    ],
    icon: <Zap className="h-6 w-6" />,
    popular: false
  },
  {
    id: 'pro',
    name: 'Pro',
    price: '$9.99',
    period: 'month',
    description: 'Complete aquarium management with AI assistance',
    features: [
      'Unlimited tanks',
      'AI-powered assistance and diagnostics',
      'Advanced water chemistry tracking',
      'Predictive maintenance schedules',
      'Detailed analytics and reports',
      'Species compatibility checking',
      'Priority support',
      'Export data capabilities'
    ],
    limitations: [],
    icon: <Crown className="h-6 w-6" />,
    popular: true
  }
];

export const SubscriptionPlans: React.FC<SubscriptionPlansProps> = ({ onSelectPlan }) => {
  const { tier, isActive, isAdmin } = useSubscriptionAccess();

  const isCurrentPlan = (planId: string) => {
    if (isAdmin) return false; // Admins don't have a specific plan
    return tier === planId && (planId === 'free' || isActive);
  };

  return (
    <div className="grid md:grid-cols-2 gap-6">
      {PLANS.map((plan) => (
        <Card 
          key={plan.id} 
          className={`relative ${plan.popular ? 'border-2 border-blue-500' : ''}`}
        >
          {plan.popular && (
            <Badge className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-blue-500">
              Most Popular
            </Badge>
          )}
          
          <CardHeader>
            <CardTitle className="flex items-center gap-3">
              {plan.icon}
              <div>
                <h3 className="text-xl font-bold">{plan.name}</h3>
                <div className="flex items-baseline gap-1">
                  <span className="text-2xl font-bold text-blue-600">{plan.price}</span>
                  <span className="text-gray-500">/{plan.period}</span>
                </div>
              </div>
            </CardTitle>
            <p className="text-gray-600">{plan.description}</p>
          </CardHeader>

          <CardContent className="space-y-6">
            <div>
              <h4 className="font-semibold mb-3 text-green-700">Included:</h4>
              <ul className="space-y-2">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-2">
                    <Check className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                    <span className="text-sm">{feature}</span>
                  </li>
                ))}
              </ul>
            </div>

            {plan.limitations.length > 0 && (
              <div>
                <h4 className="font-semibold mb-3 text-gray-600">Limitations:</h4>
                <ul className="space-y-2">
                  {plan.limitations.map((limitation) => (
                    <li key={limitation} className="flex items-start gap-2">
                      <span className="text-gray-400 mt-0.5">•</span>
                      <span className="text-sm text-gray-600">{limitation}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div className="pt-4">
              {isCurrentPlan(plan.id) ? (
                <Button disabled className="w-full">
                  Current Plan
                </Button>
              ) : (
                <Button 
                  onClick={() => onSelectPlan?.(plan.id)}
                  variant={plan.popular ? 'default' : 'outline'}
                  className="w-full"
                  disabled={plan.id === 'free'} // Free plan doesn't need selection
                >
                  {plan.id === 'free' ? 'Current Plan' : 'Upgrade to Pro'}
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
