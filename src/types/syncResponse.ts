
export interface SyncStripeSubscriptionResponse {
  success: boolean;
  user_id?: string;
  email?: string;
  old_status?: string;
  new_status?: string;
  stripe_subscription_id?: string;
  error?: string;
  updated_at?: string;
  status_updated?: string; // Add missing property
}
