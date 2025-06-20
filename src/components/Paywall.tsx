
import React from 'react';
import { SubscriptionPrompt } from '@/components/subscription/SubscriptionPrompt';
import { ExpiredTrialPaywall } from '@/components/subscription/ExpiredTrialPaywall';
import { useSubscriptionAccess } from '@/hooks/useSubscriptionAccess';

interface PaywallProps {
  isOpen: boolean;
  onClose: () => void;
  showUpgradeOnly?: boolean;
}

const PaywallModal: React.FC<PaywallProps> = ({ 
  isOpen, 
  onClose, 
  showUpgradeOnly = false 
}) => {
  const {
    shouldShowPaywall,
    shouldShowSubscriptionPrompt,
    canStartTrial,
    hasUsedTrial
  } = useSubscriptionAccess();

  if (!isOpen) return null;

  // Show expired trial paywall if appropriate
  if (shouldShowPaywall() || showUpgradeOnly) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
        <div className="relative max-w-4xl w-full">
          <button
            onClick={onClose}
            className="absolute -top-2 -right-2 bg-white rounded-full p-2 shadow-lg hover:bg-gray-100 z-10"
          >
            ✕
          </button>
          <ExpiredTrialPaywall />
        </div>
      </div>
    );
  }

  // Show subscription prompt for new users who can start trial
  if (shouldShowSubscriptionPrompt()) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
        <div className="relative max-w-4xl w-full">
          <button
            onClick={onClose}
            className="absolute -top-2 -right-2 bg-white rounded-full p-2 shadow-lg hover:bg-gray-100 z-10"
          >
            ✕
          </button>
          <SubscriptionPrompt />
        </div>
      </div>
    );
  }

  return null;
};

export default PaywallModal;
