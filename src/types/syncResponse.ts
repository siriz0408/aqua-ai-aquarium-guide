
export interface SyncStripeSubscriptionResponse {
  success: boolean;
  user_id?: string;
  email?: string;
  status_updated?: string;
  error?: string;
}

export interface ManualSyncResult {
  success: boolean;
  message: string;
  details?: any;
}
