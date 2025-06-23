
import React from 'react';
import { SubscriptionBanner } from './subscription/SubscriptionBanner';

interface TrialBannerProps {
  hoursRemaining: number;
  isExpired: boolean;
}

export const TrialBanner: React.FC<TrialBannerProps> = ({ 
  hoursRemaining, 
  isExpired 
}) => {
  return (
    <SubscriptionBanner
      subscriptionStatus={isExpired ? 'expired' : 'trial'}
      subscriptionTier="free"
      trialHoursRemaining={hoursRemaining}
      isTrialExpired={isExpired}
    />
  );
};
