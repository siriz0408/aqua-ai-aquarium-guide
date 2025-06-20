
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Check, Crown, Zap } from 'lucide-react';
import { PRICING_PLANS, formatPrice, getMonthlyEquivalent, type PricingPlan } from '@/config/pricing';

interface PlanSelectorProps {
  selectedPlan: PricingPlan;
  onPlanSelect: (plan: PricingPlan) => void;
  showFeatures?: boolean;
}

export const PlanSelector: React.FC<PlanSelectorProps> = ({
  selectedPlan,
  onPlanSelect,
  showFeatures = true
}) => {
  const features = [
    'AI-Powered AquaBot Chat',
    'Advanced Setup Planner',
    'Unlimited tank tracking',
    'Water parameter logging',
    'Equipment management',
    'Educational resources'
  ];

  return (
    <div className="space-y-4">
      <div className="grid gap-4 md:grid-cols-2">
        {PRICING_PLANS.map((plan) => {
          const isRecommended = plan.id === 'monthly'; // Monthly is now recommended
          const isSelected = selectedPlan.id === plan.id;
          
          return (
            <Card
              key={plan.id}
              className={`relative cursor-pointer transition-all ${
                isSelected
                  ? 'border-blue-500 ring-2 ring-blue-200 shadow-lg'
                  : 'border-gray-200 hover:border-blue-300 hover:shadow-md'
              } ${isRecommended ? 'border-green-500 shadow-md' : ''}`}
              onClick={() => onPlanSelect(plan)}
            >
              {isRecommended && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <Badge className="bg-green-600 text-white flex items-center gap-1">
                    <Zap className="h-3 w-3" />
                    Most Popular
                  </Badge>
                </div>
              )}
              
              <CardHeader className="text-center pb-4">
                <CardTitle className="text-xl flex items-center justify-center gap-2">
                  <Crown className="h-5 w-5 text-blue-600" />
                  {plan.name}
                </CardTitle>
                <CardDescription>{plan.description}</CardDescription>
                
                <div className="space-y-1">
                  <div className="text-3xl font-bold">
                    {formatPrice(plan.amount)}
                    <span className="text-base font-normal text-gray-600">
                      /{plan.interval}
                    </span>
                  </div>
                  
                  {plan.interval === 'year' && (
                    <div className="text-sm text-green-600 font-medium">
                      {getMonthlyEquivalent(plan)}/month • {plan.savings}
                    </div>
                  )}
                  
                  {plan.trialDays && (
                    <div className="text-sm text-blue-600 font-medium">
                      {plan.trialDays}-day free trial included
                    </div>
                  )}
                </div>
              </CardHeader>
              
              {showFeatures && (
                <CardContent className="pt-0">
                  <div className="space-y-2">
                    {features.map((feature, index) => (
                      <div key={index} className="flex items-center gap-2 text-sm">
                        <Check className="h-4 w-4 text-green-600 flex-shrink-0" />
                        <span>{feature}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              )}
              
              {isSelected && (
                <div className="absolute top-2 right-2">
                  <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center">
                    <Check className="h-4 w-4 text-white" />
                  </div>
                </div>
              )}
            </Card>
          );
        })}
      </div>
      
      <div className="text-center">
        <p className="text-sm text-gray-600">
          Both plans include the same features. Annual plan saves you 10% compared to monthly billing.
        </p>
      </div>
    </div>
  );
};
