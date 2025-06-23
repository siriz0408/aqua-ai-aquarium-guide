
export interface UserProfile {
  id: string;
  email?: string;
  full_name?: string;
  role: 'user' | 'admin';
  subscription_status: 'expired' | 'active';
  stripe_customer_id?: string;
  stripe_subscription_id?: string;
  created_at?: string;
  updated_at?: string;
}

export interface SubscriptionInfo {
  hasAccess: boolean;
  status: 'expired' | 'active';
  isAdmin: boolean;
  displayTier: string;
}
