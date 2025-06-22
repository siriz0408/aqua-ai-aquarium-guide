
export interface PricingPlan {
  id: string;
  name: string;
  priceId: string;
  price: number;
  amount: number; // Price in cents for Stripe
  interval: 'month' | 'year';
  trialDays?: number;
  features: string[];
  description?: string;
  popular?: boolean;
  savings?: string;
}

export const PRICING_PLANS: PricingPlan[] = [
  {
    id: 'monthly',
    name: 'AquaAI Pro Monthly',
    priceId: 'price_1Rb8vR1d1AvgoBGoNIjxLKRR',
    price: 9.99,
    amount: 999, // Price in cents
    interval: 'month',
    description: 'Full access to all premium features',
    popular: true,
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
    amount: 7999, // Price in cents
    interval: 'year',
    description: 'Best value - 2 months free',
    savings: 'Save 33%',
    features: [
      'All Monthly Features',
      '2 months free (save 33%)',
      'Priority Feature Requests',
      'Exclusive Beta Access'
    ]
  }
];

export const formatPrice = (amount: number): string => {
  return `$${amount.toFixed(2)}`;
};

export const getMonthlyEquivalent = (plan: PricingPlan): string => {
  if (plan.interval === 'year') {
    const monthlyPrice = plan.price / 12;
    return `$${monthlyPrice.toFixed(2)}`;
  }
  return formatPrice(plan.price);
};

export const getDefaultPlan = (): PricingPlan => {
  return PRICING_PLANS.find(p => p.popular) || PRICING_PLANS[0];
};

export const validatePriceId = (priceId: string) => {
  const validPriceIds = PRICING_PLANS.map(plan => plan.priceId);
  return {
    valid: validPriceIds.includes(priceId),
    error: validPriceIds.includes(priceId) ? null : `Invalid price ID. Valid options: ${validPriceIds.join(', ')}`
  };
};
