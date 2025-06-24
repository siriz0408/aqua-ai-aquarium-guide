
export interface ManualSyncResult {
  success: boolean;
  message: string;
  details?: any;
}

export interface SyncUserSubscriptionParams {
  targetEmail: string;
  stripeCustomerId: string;
  stripeSubscriptionId: string;
  subscriptionStatus?: string;
}
