
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Crown, Zap, Star } from 'lucide-react';
import { useCredits } from '@/hooks/useCredits';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

const PRICE_IDS = {
  pro_limited: "price_pro_limited_monthly",  // Replace with your actual Stripe price ID
  pro_unlimited: "price_pro_unlimited_monthly", // Replace with your actual Stripe price ID
};

export const SubscriptionBanner: React.FC = () => {
  const { profile, profileLoading } = useCredits();
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

  const isProUser = profile.subscription_status === 'active' && 
                   (profile.subscription_tier === 'pro_limited' || profile.subscription_tier === 'pro_unlimited');

  if (isProUser) {
    return (
      <Card className="mb-6 border-green-200 bg-green-50">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Crown className="h-5 w-5 text-green-600" />
              <div>
                <h3 className="font-semibold text-green-800">
                  {profile.subscription_tier === 'pro_unlimited' ? 'Pro Unlimited' : 'Pro Limited'} Active
                </h3>
                <p className="text-sm text-green-600">
                  {profile.subscription_tier === 'pro_unlimited' 
                    ? 'Unlimited AI conversations' 
                    : `${50 - (profile.monthly_credits_used || 0)} conversations remaining this month`
                  }
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
            You have {profile.free_credits_remaining || 0} free conversations remaining
          </p>
          
          <div className="grid md:grid-cols-2 gap-4 mt-6">
            {/* Pro Limited Plan */}
            <Card className="border-blue-300">
              <CardContent className="p-4 text-center">
                <Zap className="h-8 w-8 text-blue-600 mx-auto mb-3" />
                <h3 className="font-bold text-lg mb-2">Pro Limited</h3>
                <div className="text-2xl font-bold text-blue-600 mb-2">$9.99/month</div>
                <ul className="text-sm text-gray-600 space-y-1 mb-4">
                  <li>50 AI conversations per month</li>
                  <li>Advanced aquarium insights</li>
                  <li>Priority support</li>
                </ul>
                <Button 
                  onClick={() => handleUpgrade(PRICE_IDS.pro_limited)}
                  className="w-full"
                  variant="outline"
                >
                  Upgrade to Pro Limited
                </Button>
              </CardContent>
            </Card>

            {/* Pro Unlimited Plan */}
            <Card className="border-purple-300 relative">
              <Badge className="absolute -top-2 left-1/2 transform -translate-x-1/2 bg-purple-600">
                Most Popular
              </Badge>
              <CardContent className="p-4 text-center">
                <Star className="h-8 w-8 text-purple-600 mx-auto mb-3" />
                <h3 className="font-bold text-lg mb-2">Pro Unlimited</h3>
                <div className="text-2xl font-bold text-purple-600 mb-2">$19.99/month</div>
                <ul className="text-sm text-gray-600 space-y-1 mb-4">
                  <li>Unlimited AI conversations</li>
                  <li>Advanced aquarium insights</li>
                  <li>Priority support</li>
                  <li>Early access to new features</li>
                </ul>
                <Button 
                  onClick={() => handleUpgrade(PRICE_IDS.pro_unlimited)}
                  className="w-full bg-purple-600 hover:bg-purple-700"
                >
                  Upgrade to Pro Unlimited
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
