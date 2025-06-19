
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Check, Star, RefreshCw } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { useSubscriptionStatus } from '@/hooks/useSubscriptionStatus';

const SUBSCRIPTION_PRICE_ID = "price_1Rb8vR1d1AvgoBGoNIjxLKRR"; // Monthly subscription

export const PricingSection: React.FC = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const { checkSubscriptionStatus, isLoading: isCheckingStatus } = useSubscriptionStatus();

  const handleSubscriptionUpgrade = async () => {
    if (!user) {
      toast({
        title: "Sign In Required",
        description: "Please sign in to start your free trial.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('create-checkout', {
        body: { priceId: SUBSCRIPTION_PRICE_ID }
      });

      if (error) throw error;

      if (data?.url) {
        window.open(data.url, '_blank');
      }
    } catch (error) {
      console.error('Error creating checkout session:', error);
      toast({
        title: "Error",
        description: "Failed to start checkout process. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <section id="pricing" className="py-16 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">Get Full Access to AquaAI</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Start your 3-day free trial today. Cancel anytime within 3 days to avoid charges.
          </p>
          
          {user && (
            <div className="mt-4">
              <Button
                variant="outline"
                size="sm"
                onClick={checkSubscriptionStatus}
                disabled={isCheckingStatus}
                className="gap-2"
              >
                <RefreshCw className={`h-4 w-4 ${isCheckingStatus ? 'animate-spin' : ''}`} />
                {isCheckingStatus ? 'Checking...' : 'Refresh Subscription Status'}
              </Button>
            </div>
          )}
        </div>

        <div className="flex justify-center">
          <Card className="relative border-blue-200 shadow-lg max-w-md w-full">
            <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
              <div className="bg-blue-600 text-white px-4 py-1 rounded-full text-sm font-medium">
                3-Day Free Trial
              </div>
            </div>
            <CardHeader className="text-center">
              <CardTitle className="flex items-center justify-center gap-2 text-2xl">
                <Star className="h-6 w-6 text-blue-600" />
                AquaAI Pro
              </CardTitle>
              <CardDescription>
                Full access to all features and AI-powered tools
              </CardDescription>
              <div className="text-4xl font-bold text-center">
                $4.99<span className="text-base font-normal text-gray-600">/month</span>
              </div>
              <p className="text-sm text-gray-500">
                3-day free trial • Cancel anytime
              </p>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-green-600" />
                  <span className="text-sm font-medium">AI-Powered AquaBot Chat</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-green-600" />
                  <span className="text-sm">Advanced Setup Planner</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-green-600" />
                  <span className="text-sm">Unlimited tank tracking</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-green-600" />
                  <span className="text-sm">Water parameter logging</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-green-600" />
                  <span className="text-sm">Equipment management</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-green-600" />
                  <span className="text-sm">Educational resources</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-green-600" />
                  <span className="text-sm">All future updates</span>
                </div>
              </div>
              
              <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                <h4 className="font-medium text-blue-800 mb-2">How it works:</h4>
                <ol className="text-sm text-blue-700 space-y-1">
                  <li>1. Start your 3-day free trial</li>
                  <li>2. Enjoy full access to all features</li>
                  <li>3. Cancel within 3 days to avoid charges</li>
                  <li>4. Or continue at $4.99/month</li>
                </ol>
              </div>
              
              <Button 
                onClick={handleSubscriptionUpgrade}
                disabled={isLoading}
                className="w-full bg-blue-600 hover:bg-blue-700 text-lg py-6"
              >
                {isLoading ? "Starting Trial..." : "Start 3-Day Free Trial"}
              </Button>
              
              <p className="text-xs text-gray-500 text-center">
                No commitment • Cancel anytime • Secure payment via Stripe
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="text-center mt-8 text-sm text-gray-600">
          <p>
            Questions? All features are included with your subscription.
          </p>
        </div>
      </div>
    </section>
  );
};
