
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Crown, Star, Clock, Shield } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useTrialManagement } from '@/hooks/useTrialManagement';
import { PlanSelector } from './PlanSelector';
import { PRICING_PLANS, type PricingPlan, formatPrice } from '@/config/pricing';

interface EnhancedSubscriptionPromptProps {
  isFullScreen?: boolean;
  canStartTrial: boolean;
  hasUsedTrial: boolean;
}

export const EnhancedSubscriptionPrompt: React.FC<EnhancedSubscriptionPromptProps> = ({ 
  isFullScreen = false,
  canStartTrial,
  hasUsedTrial
}) => {
  const { user } = useAuth();
  const { startDatabaseTrial, startStripeTrial, isLoading } = useTrialManagement();
  const [selectedPlan, setSelectedPlan] = useState<PricingPlan>(
    PRICING_PLANS.find(p => p.popular) || PRICING_PLANS[0]
  );
  const [trialType, setTrialType] = useState<'database' | 'stripe'>('database');

  const handleTrialStart = async () => {
    if (!user?.id) return;

    if (trialType === 'database') {
      await startDatabaseTrial(3);
    } else {
      await startStripeTrial(selectedPlan.priceId, 3);
    }
  };

  const handleDirectPurchase = async () => {
    if (!user?.id) return;
    await startStripeTrial(selectedPlan.priceId, 0); // No trial, direct purchase
  };

  const content = (
    <Card className="border-blue-200 bg-gradient-to-br from-blue-50 to-cyan-50 dark:border-blue-800 dark:bg-gradient-to-br dark:from-blue-900/20 dark:to-cyan-900/20 max-w-5xl mx-auto">
      <CardHeader className="text-center">
        <div className="mx-auto mb-4 h-16 w-16 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
          <Star className="h-8 w-8 text-blue-600" />
        </div>
        <CardTitle className="text-3xl text-blue-800 dark:text-blue-200 flex items-center justify-center gap-2">
          <Crown className="h-7 w-7" />
          Welcome to AquaAI Pro
        </CardTitle>
        <CardDescription className="text-blue-600 dark:text-blue-300 text-lg">
          {canStartTrial ? 
            "Choose your plan and start your 3-day free trial to access all premium features." :
            hasUsedTrial ?
            "You've already used your free trial. Choose a plan to continue with full access." :
            "Subscribe to unlock all premium features and tools."
          }
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-8">
        <PlanSelector
          selectedPlan={selectedPlan}
          onPlanSelect={setSelectedPlan}
          showFeatures={true}
        />
        
        {canStartTrial && (
          <div className="bg-blue-50 dark:bg-blue-950/50 p-6 rounded-lg border border-blue-200 dark:border-blue-800">
            <div className="flex items-center gap-2 mb-4">
              <Clock className="h-5 w-5 text-blue-600" />
              <h4 className="font-semibold text-blue-800 dark:text-blue-200">Trial Options</h4>
            </div>
            
            <Tabs value={trialType} onValueChange={(value) => setTrialType(value as 'database' | 'stripe')} className="space-y-4">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="database" className="flex items-center gap-2">
                  <Shield className="h-4 w-4" />
                  Instant Trial
                </TabsTrigger>
                <TabsTrigger value="stripe" className="flex items-center gap-2">
                  <Crown className="h-4 w-4" />
                  Premium Trial
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="database" className="space-y-3">
                <div className="bg-white dark:bg-gray-800 p-4 rounded border">
                  <h5 className="font-medium text-green-700 dark:text-green-300 mb-2">✨ Instant 3-Day Trial</h5>
                  <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                    <li>• Start immediately - no payment info required</li>
                    <li>• Full access to all AI features</li>
                    <li>• Upgrade to continue after trial</li>
                  </ul>
                </div>
              </TabsContent>
              
              <TabsContent value="stripe" className="space-y-3">
                <div className="bg-white dark:bg-gray-800 p-4 rounded border">
                  <h5 className="font-medium text-blue-700 dark:text-blue-300 mb-2">🎯 Premium Trial with Auto-Continue</h5>
                  <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                    <li>• 3-day free trial via Stripe</li>
                    <li>• Automatic billing after trial: {formatPrice(selectedPlan.amount)}/{selectedPlan.interval}</li>
                    <li>• Cancel anytime during trial - no charges</li>
                    <li>• Seamless transition to paid plan</li>
                  </ul>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        )}
        
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          {canStartTrial && (
            <Button 
              onClick={handleTrialStart}
              disabled={isLoading}
              className="bg-blue-600 hover:bg-blue-700 text-white text-lg py-6 px-8 flex-1 max-w-sm"
            >
              {isLoading ? "Starting..." : `Start 3-Day Free Trial`}
            </Button>
          )}
          
          <Button 
            onClick={handleDirectPurchase}
            disabled={isLoading}
            variant={canStartTrial ? "outline" : "default"}
            className={`text-lg py-6 px-8 flex-1 max-w-sm ${!canStartTrial ? 'bg-blue-600 hover:bg-blue-700 text-white' : ''}`}
          >
            {isLoading ? "Processing..." : `Subscribe to ${selectedPlan.name} - ${formatPrice(selectedPlan.amount)}/${selectedPlan.interval}`}
          </Button>
        </div>
        
        {hasUsedTrial && !canStartTrial && (
          <div className="bg-orange-50 dark:bg-orange-900/20 p-4 rounded-lg border border-orange-200 dark:border-orange-800 text-center">
            <p className="text-orange-700 dark:text-orange-300 font-medium">
              You've already used your free trial. Subscribe now to continue enjoying AquaAI's features!
            </p>
          </div>
        )}
        
        <div className="text-center">
          <p className="text-xs text-blue-600 dark:text-blue-400">
            No commitment • Cancel anytime • Secure payment via Stripe
          </p>
          {canStartTrial && (
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Choose "Instant Trial" for immediate access or "Premium Trial" for seamless billing
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );

  if (isFullScreen) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-gray-900 dark:to-blue-900">
        {content}
      </div>
    );
  }

  return content;
};
