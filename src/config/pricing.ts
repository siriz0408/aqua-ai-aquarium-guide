
export interface PricingPlan {
  id: string;
  name: string;
  priceId: string;
  price: number;
  interval: 'month' | 'year';
  trialDays?: number;
  features: string[];
}

export const PRICING_PLANS: PricingPlan[] = [
  {
    id: 'monthly',
    name: 'AquaAI Pro Monthly',
    priceId: 'price_1Rb8vR1d1AvgoBGoNIjxLKRR',
    price: 9.99,
    interval: 'month',
    features: [
      'Unlimited AI-Powered AquaBot Assistant',
      'Advanced Setup Planner & Recommendations',
      'Unlimited Tank Management',
      'Parameter Analysis & Tracking',
      'Species Compatibility Checker',
      'Maintenance Scheduling & Reminders',
      'Priority Support'
    ]
  },
  {
    id: 'annual',
    name: 'AquaAI Pro Annual',
    priceId: 'price_1Rb8wD1d1AvgoBGoC8nfQXNK',
    price: 79.99,
    interval: 'year',
    features: [
      'All Monthly Features',
      '2 months free (save 33%)',
      'Priority Feature Requests',
      'Exclusive Beta Access'
    ]
  }
];

export const validatePriceId = (priceId: string) => {
  const validPriceIds = PRICING_PLANS.map(plan => plan.priceId);
  return {
    valid: validPriceIds.includes(priceId),
    error: validPriceIds.includes(priceId) ? null : `Invalid price ID. Valid options: ${validPriceIds.join(', ')}`
  };
};
