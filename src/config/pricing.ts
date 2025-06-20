
export interface PricingPlan {
  id: string;
  name: string;
  description: string;
  priceId: string;
  amount: number; // in cents
  currency: string;
  interval: 'month' | 'year';
  intervalCount: number;
  trialDays?: number;
  popular?: boolean;
  savings?: string;
}

export const PRICING_PLANS: PricingPlan[] = [
  {
    id: 'monthly',
    name: 'Monthly Pro',
    description: 'Full access to all features',
    priceId: 'price_1Rb8vR1d1AvgoBGoNIjxLKRR',
    amount: 499, // $4.99
    currency: 'usd',
    interval: 'month',
    intervalCount: 1,
    trialDays: 3,
  },
  {
    id: 'annual',
    name: 'Annual Pro',
    description: 'Full access to all features - Save 10%',
    priceId: 'price_ANNUAL_PRO_PLACEHOLDER', // User needs to create this in Stripe
    amount: 5388, // $53.88 (equivalent to $4.49/month)
    currency: 'usd',
    interval: 'year',
    intervalCount: 1,
    trialDays: 3,
    popular: true,
    savings: 'Save 10%',
  },
];

export const getPlanById = (planId: string): PricingPlan | undefined => {
  return PRICING_PLANS.find(plan => plan.id === planId);
};

export const getPlanByPriceId = (priceId: string): PricingPlan | undefined => {
  return PRICING_PLANS.find(plan => plan.priceId === priceId);
};

export const formatPrice = (amount: number, currency: string = 'usd'): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency.toUpperCase(),
  }).format(amount / 100);
};

export const getMonthlyEquivalent = (plan: PricingPlan): string => {
  if (plan.interval === 'month') {
    return formatPrice(plan.amount);
  }
  const monthlyAmount = plan.amount / 12;
  return formatPrice(monthlyAmount);
};
