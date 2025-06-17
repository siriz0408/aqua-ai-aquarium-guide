
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Crown, Zap, Star } from 'lucide-react';
import { useCredits } from '@/hooks/useCredits';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

const PRICE_IDS = {
  pro: "price_pro_monthly",  // Replace with your actual Stripe price ID
};

export const SubscriptionBanner: React.FC = () => {
  const { profile, profileLoading, getSubscriptionInfo } = useCredits();
  const { toast } = useToast();

  const handleUpgrade = async (priceId: string) => {
    try {
      const { data, error } = await supabase.functions.invoke('create-checkout', {
        body: { priceId }
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
    }
  };

  const handleManageSubscription = async () => {
    try {
      const { data, error } = await supabase.functions.invoke('customer-portal');

      if (error) throw error;

      if (data?.url) {
        window.open(data.url, '_blank');
      }
    } catch (error) {
      console.error('Error opening customer portal:', error);
      toast({
        title: "Error",
        description: "Failed to open subscription management. Please try again.",
        variant: "destructive",
      });
    }
  };

  if (profileLoading || !profile) {
    return null;
  }

  const subscriptionInfo = getSubscriptionInfo();
  const isProUser = subscriptionInfo.tier === 'pro' && subscriptionInfo.status === 'active';

  if (isProUser) {
    return (
      <Card className="mb-6 border-green-200 bg-green-50">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Crown className="h-5 w-5 text-green-600" />
              <div>
                <h3 className="font-semibold text-green-800">
                  Pro Plan Active
                </h3>
                <p className="text-sm text-green-600">
                  Unlimited AI conversations and premium features
                </p>
              </div>
            </div>
            <Button onClick={handleManageSubscription} variant="outline" size="sm">
              Manage Subscription
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="mb-6 border-blue-200 bg-blue-50">
      <CardContent className="p-6">
        <div className="text-center space-y-4">
          <h2 className="text-xl font-bold text-blue-900">Upgrade to Pro</h2>
          <p className="text-blue-700">
            Get unlimited access to AquaBot's AI-powered aquarium assistance
          </p>
          
          <div className="max-w-md mx-auto">
            <Card className="border-purple-300 relative">
              <Badge className="absolute -top-2 left-1/2 transform -translate-x-1/2 bg-purple-600">
                Best Value
              </Badge>
              <CardContent className="p-6 text-center">
                <Star className="h-8 w-8 text-purple-600 mx-auto mb-3" />
                <h3 className="font-bold text-lg mb-2">Pro Plan</h3>
                <div className="text-3xl font-bold text-purple-600 mb-2">$9.99/month</div>
                <ul className="text-sm text-gray-600 space-y-2 mb-6">
                  <li>✓ Unlimited AI conversations</li>
                  <li>✓ Advanced aquarium insights</li>
                  <li>✓ Real-time web search integration</li>
                  <li>✓ Priority support</li>
                  <li>✓ Early access to new features</li>
                </ul>
                <Button 
                  onClick={() => handleUpgrade(PRICE_IDS.pro)}
                  className="w-full bg-purple-600 hover:bg-purple-700"
                >
                  Upgrade to Pro
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
