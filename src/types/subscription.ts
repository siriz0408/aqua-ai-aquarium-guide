
export interface UserProfile {
  id: string;
  full_name?: string;
  subscription_status: 'free' | 'active' | 'cancelled';
  subscription_tier: 'free' | 'pro';
  subscription_start_date?: string;
  is_admin?: boolean;
  admin_role?: string;
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
}
