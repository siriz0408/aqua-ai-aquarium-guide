
import React from 'react';

interface TrialBannerProps {
  hoursRemaining: number;
  isExpired: boolean;
}

// Trial banner is no longer needed with 100% paywall
export const TrialBanner: React.FC<TrialBannerProps> = ({ 
  hoursRemaining, 
  isExpired 
}) => {
  return null;
};
