
import React from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Check, Zap, Star, Shield } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useSimpleTrialManagement } from '@/hooks/useSimpleTrialManagement';
import { PRICING_PLANS, formatPrice, getDefaultPlan } from '@/config/pricing';

interface ProSubscriptionPromptProps {
  isFullScreen?: boolean;
  onClose?: () => void;
}

export const ProSubscriptionPrompt: React.FC<ProSubscriptionPromptProps> = ({ 
  isFullScreen = false, 
  onClose 
}) => {
  const { user } = useAuth();
  const { startStripeTrial, isLoading, lastError } = useSimpleTrialManagement();
  const defaultPlan = getDefaultPlan();

  const handleUpgrade = async () => {
    if (!user?.id || !user?.email) {
      console.error('Missing user information for checkout:', { userId: user?.id, email: user?.email });
      return;
    }

    console.log('Starting Pro upgrade with:', { 
      planId: defaultPlan.id, 
      priceId: defaultPlan.priceId,
      userId: user.id,
      email: user.email 
    });

    const result = await startStripeTrial(defaultPlan.id);
    
    if (result.success && result.url) {
      window.location.href = result.url;
    }
  };

  const features = [
    "Unlimited AI-Powered AquaBot Assistant",
    "Advanced Setup Planner & Recommendations", 
    "Unlimited Tank Management",
    "Parameter Analysis & Tracking",
    "Species Compatibility Checker",
    "Maintenance Scheduling & Reminders",
    "Priority Support"
  ];

  const content = (
    <div className="p-6 max-w-md mx-auto">
      <div className="text-center mb-6">
        <div className="mx-auto mb-4 h-16 w-16 rounded-full bg-blue-100 dark:bg-blue-900/20 flex items-center justify-center">
          <Zap className="h-8 w-8 text-blue-600" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          Upgrade to AquaAI Pro
        </h2>
        <p className="text-gray-600 dark:text-gray-300">
          Get unlimited access to all premium features
        </p>
      </div>

      <div className="mb-6 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-lg border">
        <div className="flex items-center justify-center mb-2">
          <Badge variant="secondary" className="bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-200">
            <Star className="h-3 w-3 mr-1" />
            Most Popular
          </Badge>
        </div>
        <div className="text-center">
          <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">
            {formatPrice(defaultPlan.price)}
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400">
            per {defaultPlan.interval}
          </div>
        </div>
      </div>

      {lastError && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-800 text-sm">
            <strong>Error:</strong> {lastError}
          </p>
        </div>
      )}

      <div className="space-y-3 mb-6">
        {features.map((feature, index) => (
          <div key={index} className="flex items-center gap-3">
            <Check className="h-4 w-4 text-green-500 flex-shrink-0" />
            <span className="text-sm text-gray-700 dark:text-gray-300">{feature}</span>
          </div>
        ))}
      </div>

      <div className="space-y-3">
        <Button 
          onClick={handleUpgrade} 
          disabled={isLoading || !user}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white"
          size="lg"
        >
          {isLoading ? "Processing..." : `Upgrade to Pro - ${formatPrice(defaultPlan.price)}/${defaultPlan.interval}`}
        </Button>
        
        {onClose && (
          <Button 
            variant="outline" 
            onClick={onClose}
            className="w-full"
          >
            Maybe Later
          </Button>
        )}
      </div>

      <div className="mt-4 text-center">
        <div className="flex items-center justify-center gap-2 text-xs text-gray-500 dark:text-gray-400">
          <Shield className="h-3 w-3" />
          Secure payment with Stripe • Cancel anytime
        </div>
      </div>
    </div>
  );

  if (isFullScreen) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-gray-900 dark:to-blue-900 flex items-center justify-center p-4">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full">
          {content}
        </div>
      </div>
    );
  }

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="sr-only">Upgrade to Pro</DialogTitle>
          <DialogDescription className="sr-only">
            Upgrade to AquaAI Pro for unlimited access
          </DialogDescription>
        </DialogHeader>
        {content}
      </DialogContent>
    </Dialog>
  );
};
