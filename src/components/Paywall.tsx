
import React from 'react';

interface PaywallProps {
  isOpen: boolean;
  onClose: () => void;
  showUpgradeOnly?: boolean;
}

// Paywall is no longer needed since all features are free
const PaywallModal: React.FC<PaywallProps> = ({ 
  isOpen, 
  onClose, 
  showUpgradeOnly = false 
}) => {
  return null;
};

export default PaywallModal;
