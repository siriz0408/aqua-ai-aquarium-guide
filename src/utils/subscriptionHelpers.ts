
import { supabase } from '@/integrations/supabase/client';

export interface UserSubscriptionData {
  id: string;
  email: string;
  subscription_status: 'inactive' | 'active';
  subscription_tier: 'free' | 'pro';
  stripe_customer_id?: string;
  stripe_subscription_id?: string;
  is_admin?: boolean;
}

/**
 * Get current user's subscription data
 */
export const getUserSubscriptionData = async (): Promise<UserSubscriptionData | null> => {
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) return null;

  const { data: profile, error } = await supabase
    .from('profiles')
    .select('id, email, subscription_status, subscription_tier, stripe_customer_id, stripe_subscription_id, is_admin')
    .eq('id', user.id)
    .single();

  if (error) {
    console.error('Error fetching user subscription data:', error);
    return null;
  }

  // Ensure proper typing
  return {
    id: profile.id,
    email: profile.email || '',
    subscription_status: (profile.subscription_status === 'active' ? 'active' : 'inactive') as 'inactive' | 'active',
    subscription_tier: (profile.subscription_tier || 'free') as 'free' | 'pro',
    stripe_customer_id: profile.stripe_customer_id || undefined,
    stripe_subscription_id: profile.stripe_subscription_id || undefined,
    is_admin: profile.is_admin || false,
  };
};

/**
 * Check if user has active subscription or admin access
 */
export const userHasAccess = async (): Promise<boolean> => {
  try {
    const { data, error } = await supabase.rpc('user_has_active_subscription', {
      user_id: (await supabase.auth.getUser()).data.user?.id
    });

    if (error) {
      console.error('Error checking subscription access:', error);
      return false;
    }

    return data || false;
  } catch (error) {
    console.error('Error in userHasAccess:', error);
    return false;
  }
};

/**
 * Update user subscription status (typically called by webhooks)
 */
export const updateUserSubscription = async (
  userId: string,
  status: 'inactive' | 'active',
  tier: 'free' | 'pro' = 'free',
  stripeCustomerId?: string,
  stripeSubscriptionId?: string
) => {
  const { error } = await supabase
    .from('profiles')
    .update({
      subscription_status: status,
      subscription_tier: tier,
      stripe_customer_id: stripeCustomerId,
      stripe_subscription_id: stripeSubscriptionId,
      updated_at: new Date().toISOString()
    })
    .eq('id', userId);

  if (error) {
    console.error('Error updating user subscription:', error);
    throw error;
  }
};

/**
 * Log webhook events for audit trail
 */
export const logWebhookEvent = async (
  stripeEventId: string,
  eventType: string,
  customerId?: string,
  subscriptionId?: string,
  userEmail?: string,
  userId?: string,
  rawData?: any,
  status: 'pending' | 'processed' | 'failed' = 'pending',
  errorMessage?: string
) => {
  const { error } = await supabase
    .from('webhook_events')
    .insert({
      stripe_event_id: stripeEventId,
      event_type: eventType,
      customer_id: customerId,
      subscription_id: subscriptionId,
      user_email: userEmail,
      user_id: userId,
      raw_data: rawData,
      processing_status: status,
      error_message: errorMessage,
      processed_at: status !== 'pending' ? new Date().toISOString() : null
    });

  if (error) {
    console.error('Error logging webhook event:', error);
    throw error;
  }
};
