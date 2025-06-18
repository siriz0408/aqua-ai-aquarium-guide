
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Crown, Star, Clock, AlertTriangle, Settings } from 'lucide-react';
import { useCredits } from '@/hooks/useCredits';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';

const PRICE_IDS = {
  pro: "price_1Rb8vR1d1AvgoBGoNIjxLKRR",  // Replace with your actual Stripe price ID
};

export const SubscriptionBanner: React.FC = () => {
  const { profile, profileLoading, getSubscriptionInfo, trialStatus } = useCredits();
  const { toast } = useToast();
  const navigate = useNavigate();

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

  // Admin users - show admin access banner
  if (subscriptionInfo.isAdmin) {
    return (
      <Card className="mb-6 border-green-200 bg-green-50">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Crown className="h-5 w-5 text-green-600" />
              <div>
                <h3 className="font-semibold text-green-800">
                  Admin Access
                </h3>
                <p className="text-sm text-green-600">
                  All features and premium functionality are available
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge className="bg-green-600">
                Admin
              </Badge>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => navigate('/settings')}
              >
                <Settings className="h-4 w-4 mr-1" />
                Settings
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Pro subscribers - show pro status banner
  if (subscriptionInfo.tier === 'pro' && subscriptionInfo.status === 'active') {
    return (
      <Card className="mb-6 border-blue-200 bg-blue-50">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Star className="h-5 w-5 text-blue-600" />
              <div>
                <h3 className="font-semibold text-blue-800">
                  Pro Plan Active
                </h3>
                <p className="text-sm text-blue-600">
                  Enjoying unlimited access to all premium features
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge className="bg-blue-600">
                Pro
              </Badge>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => navigate('/settings')}
              >
                <Settings className="h-4 w-4 mr-1" />
                Settings
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Trial users - show countdown and upgrade option
  if (subscriptionInfo.isTrial) {
    const hoursRemaining = Math.max(0, subscriptionInfo.trialHoursRemaining);
    const isExpired = hoursRemaining <= 0;
    
    return (
      <Card className={`mb-6 ${isExpired ? 'border-red-200 bg-red-50' : 'border-orange-200 bg-orange-50'}`}>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {isExpired ? (
                <AlertTriangle className="h-5 w-5 text-red-600" />
              ) : (
                <Clock className="h-5 w-5 text-orange-600" />
              )}
              <div>
                <h3 className={`font-semibold ${isExpired ? 'text-red-800' : 'text-orange-800'}`}>
                  {isExpired ? 'Trial Expired' : 'Free Trial Active'}
                </h3>
                <p className={`text-sm ${isExpired ? 'text-red-600' : 'text-orange-600'}`}>
                  {isExpired 
                    ? 'Your trial has ended. Upgrade to continue using premium features.'
                    : `${Math.floor(hoursRemaining)} hours remaining in your trial`
                  }
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant={isExpired ? "destructive" : "secondary"}>
                {isExpired ? 'Expired' : 'Trial'}
              </Badge>
              <Button 
                size="sm"
                onClick={() => handleUpgrade(PRICE_IDS.pro)}
                className={isExpired ? 'bg-red-600 hover:bg-red-700' : ''}
              >
                {isExpired ? 'Upgrade Now' : 'Upgrade to Pro'}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Free users - show upgrade option
  return (
    <Card className="mb-6 border-gray-200 bg-gray-50">
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Star className="h-5 w-5 text-gray-600" />
            <div>
              <h3 className="font-semibold text-gray-800">
                Free Plan
              </h3>
              <p className="text-sm text-gray-600">
                Limited access to features. Upgrade for unlimited access.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline">
              Free
            </Badge>
            <Button 
              size="sm"
              onClick={() => handleUpgrade(PRICE_IDS.pro)}
            >
              Upgrade to Pro
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
