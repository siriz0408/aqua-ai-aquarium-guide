
export interface UserProfile {
  id: string;
  full_name?: string;
  email?: string;
  subscription_status: 'free' | 'active' | 'cancelled' | 'expired';
  subscription_tier: 'free' | 'pro';
  subscription_type?: 'monthly' | 'yearly' | 'lifetime';
  subscription_start_date?: string;
  subscription_end_date?: string;
  trial_start_date?: string;
  trial_end_date?: string;
  stripe_customer_id?: string;
  stripe_subscription_id?: string;
  stripe_price_id?: string;
  is_admin?: boolean;
  admin_role?: string;
  admin_permissions?: string[];
  last_admin_login?: string;
  last_active?: string;
  request_admin_access?: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface TrialStatus {
  isTrialActive: boolean;
  hoursRemaining: number;
  isTrialExpired: boolean;
}

export interface SubscriptionInfo {
  tier: string;
  status: string;
  hasAccess: boolean;
  isAdmin: boolean;
  isTrial: boolean;
  trialHoursRemaining: number;
  displayTier: string;
  subscriptionType?: string;
  startDate?: string;
  endDate?: string;
}
