
export interface SyncStripeSubscriptionResponse {
  success: boolean;
  error?: string;
  user_id?: string;
  email?: string;
  status_updated?: string;
}
