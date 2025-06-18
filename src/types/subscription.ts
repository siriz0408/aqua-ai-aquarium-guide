
export interface UserProfile {
  id: string;
  subscription_status: 'trial' | 'active' | 'expired' | 'free';
  subscription_tier: 'free' | 'pro';
  subscription_start_date?: string;
  subscription_end_date?: string;
  trial_start_date?: string;
  trial_end_date?: string;
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
