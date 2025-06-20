
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
    priceId: 'price_1Rb8vR1d1AvgoBGoNIjxLKRR', // Monthly Pro ($9.99/month)
    amount: 999, // $9.99
    currency: 'usd',
    interval: 'month',
    intervalCount: 1,
    trialDays: 3,
    popular: true, // Monthly is now the popular choice
  },
  {
    id: 'annual',
    name: 'Annual Pro',
    description: 'Full access to all features - Save 10%',
    priceId: 'price_1Rb8wD1d1AvgoBGoC8nfQXNK', // Annual Pro ($107.88/year)
    amount: 10788, // $107.88 (equivalent to $8.99/month)
    currency: 'usd',
    interval: 'year',
    intervalCount: 1,
    trialDays: 3,
    popular: false,
    savings: 'Save 10%',
  },
];

// Enhanced price ID validation with detailed error messages
export const VALID_PRICE_IDS = [
  'price_1Rb8vR1d1AvgoBGoNIjxLKRR', // Monthly Pro
  'price_1Rb8wD1d1AvgoBGoC8nfQXNK', // Annual Pro
];

// Price ID to plan mapping for better error messages and validation
export const PRICE_ID_DETAILS = {
  'price_1Rb8vR1d1AvgoBGoNIjxLKRR': { 
    name: 'Monthly Pro', 
    amount: 999, 
    interval: 'month',
    description: '$9.99/month with 3-day trial'
  },
  'price_1Rb8wD1d1AvgoBGoC8nfQXNK': { 
    name: 'Annual Pro', 
    amount: 10788, 
    interval: 'year',
    description: '$107.88/year (save 10%) with 3-day trial'
  },
} as const;

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

// Enhanced validation helpers
export const isValidPriceId = (priceId: string): boolean => {
  return VALID_PRICE_IDS.includes(priceId);
};

export const getPriceIdDetails = (priceId: string) => {
  return PRICE_ID_DETAILS[priceId as keyof typeof PRICE_ID_DETAILS];
};

export const validatePriceId = (priceId: string): { valid: boolean; error?: string; details?: any } => {
  if (!priceId) {
    return { valid: false, error: 'Price ID is required' };
  }
  
  if (!isValidPriceId(priceId)) {
    return { 
      valid: false, 
      error: `Invalid price ID: ${priceId}. Valid options are: ${VALID_PRICE_IDS.join(', ')}`,
      details: { validPriceIds: VALID_PRICE_IDS, availableDetails: Object.keys(PRICE_ID_DETAILS) }
    };
  }
  
  return { valid: true, details: getPriceIdDetails(priceId) };
};

export const getDefaultPlan = (): PricingPlan => {
  return PRICING_PLANS.find(plan => plan.popular) || PRICING_PLANS[0];
};

// Enhanced trial configuration
export const TRIAL_CONFIG = {
  defaultTrialDays: 3,
  maxTrialDays: 14,
  supportedTrialTypes: ['stripe', 'database'] as const,
} as const;

export type TrialType = typeof TRIAL_CONFIG.supportedTrialTypes[number];
