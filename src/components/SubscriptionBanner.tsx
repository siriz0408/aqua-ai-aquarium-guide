
import React from 'react';
import { useCredits } from '@/hooks/useCredits';
import { AdminAccessBanner } from './subscription/AdminAccessBanner';
import { ProSubscriptionBanner } from './subscription/ProSubscriptionBanner';
import { TrialSubscriptionBanner } from './subscription/TrialSubscriptionBanner';
import { FreeSubscriptionBanner } from './subscription/FreeSubscriptionBanner';

export const SubscriptionBanner: React.FC = () => {
  const { profile, profileLoading, getSubscriptionInfo } = useCredits();

  if (profileLoading || !profile) {
    return null;
  }

  const subscriptionInfo = getSubscriptionInfo();

  // Admin users - show full access
  if (subscriptionInfo.isAdmin) {
    return <AdminAccessBanner />;
  }

  // Pro subscribers - show manage subscription
  if (subscriptionInfo.tier === 'pro' && subscriptionInfo.status === 'active') {
    return <ProSubscriptionBanner />;
  }

  // Trial users - show countdown and upgrade option
  if (subscriptionInfo.isTrial) {
    const hoursRemaining = Math.max(0, subscriptionInfo.trialHoursRemaining);
    return <TrialSubscriptionBanner hoursRemaining={hoursRemaining} />;
  }

  // Free users - show upgrade option
  return <FreeSubscriptionBanner />;
};
