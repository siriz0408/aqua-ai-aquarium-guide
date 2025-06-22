import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RefreshCw, CheckCircle, Clock, AlertCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { useSimpleSubscriptionCheck } from '@/hooks/useSimpleSubscriptionCheck';
import { useSimpleTrialManagement } from '@/hooks/useSimpleTrialManagement';
import { PlanSelector } from './PlanSelector';
import { PRICING_PLANS, type PricingPlan, formatPrice, getDefaultPlan } from '@/config/pricing';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface PricingSectionProps {
  onPlanSelect?: (planId: string) => void;
}

export const PricingSection: React.FC<PricingSectionProps> = ({ onPlanSelect }) => {
  const { user } = useAuth();
  const { refresh: refreshSubscription, isLoading: isCheckingStatus } = useSimpleSubscriptionCheck();
  const { startStripeTrial, isLoading, lastError } = useSimpleTrialManagement();
  const [selectedPlan, setSelectedPlan] = React.useState<PricingPlan>(getDefaultPlan());

  const handleSubscriptionUpgrade = async () => {
    if (!user) {
      toast({
        title: "Sign In Required",
        description: "Please sign in to start your free trial.",
        variant: "destructive",
      });
      return;
    }

    const result = await startStripeTrial(selectedPlan.id);
    
    if (result.success) {
      // Refresh subscription status after successful trial start
      setTimeout(() => {
        refreshSubscription();
      }, 2000);
    }
  };

  return (
    <section id="pricing" className="py-16 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">Choose Your AquaAI Plan</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Start your {selectedPlan.trialDays || 3}-day free trial today. Cancel anytime within {selectedPlan.trialDays || 3} days to avoid charges.
          </p>
          
          {user && (
            <div className="mt-4">
              <Button
                variant="outline"
                size="sm"
                onClick={refreshSubscription}
                disabled={isCheckingStatus}
                className="gap-2"
              >
                <RefreshCw className={`h-4 w-4 ${isCheckingStatus ? 'animate-spin' : ''}`} />
                {isCheckingStatus ? 'Checking...' : 'Refresh Subscription Status'}
              </Button>
            </div>
          )}
        </div>

        {/* Error Display */}
        {lastError && (
          <div className="mb-6">
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                <strong>Checkout Error:</strong> {lastError}
                <br />
                <span className="text-sm mt-2 block">
                  Please try again or contact support if the issue persists.
                </span>
              </AlertDescription>
            </Alert>
          </div>
        )}

        <div className="max-w-4xl mx-auto">
          <PlanSelector
            selectedPlan={selectedPlan}
            onPlanSelect={(plan) => {
              setSelectedPlan(plan);
            }}
            showFeatures={true}
          />
          
          <div className="mt-8 text-center">
            <div className="bg-blue-50 p-6 rounded-lg border border-blue-200 mb-6">
              <h4 className="font-medium text-blue-800 mb-3 flex items-center justify-center gap-2">
                <Clock className="h-5 w-5" />
                How Your {selectedPlan.trialDays || 3}-Day Free Trial Works:
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm text-blue-700">
                <div className="flex flex-col items-center gap-2">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center font-semibold">1</div>
                  <p>Click "Start Free Trial"</p>
                </div>
                <div className="flex flex-col items-center gap-2">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center font-semibold">2</div>
                  <p>Enter payment info (not charged)</p>
                </div>
                <div className="flex flex-col items-center gap-2">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center font-semibold">3</div>
                  <p>Enjoy {selectedPlan.trialDays || 3} days of full access</p>
                </div>
                <div className="flex flex-col items-center gap-2">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center font-semibold">4</div>
                  <p>Cancel anytime or continue at {formatPrice(selectedPlan.amount)}/{selectedPlan.interval}</p>
                </div>
              </div>
            </div>
            
            <Button 
              onClick={handleSubscriptionUpgrade}
              disabled={isLoading}
              className="bg-blue-600 hover:bg-blue-700 text-lg py-6 px-8 min-w-64"
            >
              {isLoading ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  Starting Trial...
                </>
              ) : (
                <>
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Start {selectedPlan.trialDays || 3}-Day Free Trial - {selectedPlan.name}
                </>
              )}
            </Button>
            
            <div className="mt-6 space-y-2">
              <p className="text-xs text-gray-500">
                <strong>No commitment</strong> • Cancel anytime during trial • Secure payment via Stripe
              </p>
              <p className="text-xs text-gray-600">
                After trial: {formatPrice(selectedPlan.amount)}/{selectedPlan.interval} • 
                {selectedPlan.interval === 'year' && ' Save 10% vs monthly'}
              </p>
              {selectedPlan.priceId && (
                <p className="text-xs text-gray-500 font-mono">
                  Plan ID: {selectedPlan.priceId}
                </p>
              )}
            </div>
          </div>
        </div>

        <div className="text-center mt-12 text-sm text-gray-600">
          <p>
            Questions about pricing? All features are included with your subscription.
          </p>
        </div>
      </div>
    </section>
  );
};
