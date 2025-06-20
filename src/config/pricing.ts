
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

// 100% PAYWALL: AquaBotAI Pro Plan Only
export const PRICING_PLANS: PricingPlan[] = [
  {
    id: 'monthly_pro',
    name: 'AquaBotAI Pro',
    description: 'Full access to AI-powered aquarium management',
    priceId: 'price_1Rb8vR1d1AvgoBGoNIjxLKRR', // Monthly Pro ($9.99/month)
    amount: 999, // $9.99
    currency: 'usd',
    interval: 'month',
    intervalCount: 1,
    popular: true,
  },
  {
    id: 'annual_pro',
    name: 'AquaBotAI Pro (Annual)',
    description: 'Full access to AI-powered aquarium management - Save 17%',
    priceId: 'price_1Rb8wD1d1AvgoBGoC8nfQXNK', // Annual Pro ($99/year)
    amount: 9900, // $99.00 (save $20/year)
    currency: 'usd',
    interval: 'year',
    intervalCount: 1,
    savings: 'Save 17%',
  },
];

// Enhanced price ID validation
export const VALID_PRICE_IDS = [
  'price_1Rb8vR1d1AvgoBGoNIjxLKRR', // Monthly Pro
  'price_1Rb8wD1d1AvgoBGoC8nfQXNK', // Annual Pro
];

// Price ID to plan mapping
export const PRICE_ID_DETAILS = {
  'price_1Rb8vR1d1AvgoBGoNIjxLKRR': { 
    name: 'AquaBotAI Pro (Monthly)', 
    amount: 999, 
    interval: 'month',
    description: '$9.99/month - AI-powered aquarium management'
  },
  'price_1Rb8wD1d1AvgoBGoC8nfQXNK': { 
    name: 'AquaBotAI Pro (Annual)', 
    amount: 9900, 
    interval: 'year',
    description: '$99/year (save 17%) - AI-powered aquarium management'
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

// 100% Paywall Configuration
export const PAYWALL_CONFIG = {
  enforceStrict: true,
  allowTrials: false,
  freeFeatures: [], // No free features
  requiresSubscription: true,
} as const;
