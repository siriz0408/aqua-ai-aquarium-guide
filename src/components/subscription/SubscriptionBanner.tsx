
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Star, Crown, Heart } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface SubscriptionBannerProps {
  subscriptionStatus: 'free' | 'active' | 'cancelled' | 'admin';
  subscriptionTier: 'free' | 'pro';
  isAdmin?: boolean;
}

export const SubscriptionBanner: React.FC<SubscriptionBannerProps> = ({
  subscriptionStatus,
  subscriptionTier,
  isAdmin = false
}) => {
  const { toast } = useToast();

  const handleUpgrade = async () => {
    try {
      const { data, error } = await supabase.functions.invoke('create-checkout', {
        body: { priceId: 'price_1Rb8vR1d1AvgoBGoNIjxLKRR' }
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

  if (isAdmin) {
    return (
      <Card className="mb-6 border-green-200 bg-green-50">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Crown className="h-5 w-5 text-green-600" />
              <div>
                <h3 className="font-semibold text-green-800">Admin Access</h3>
                <p className="text-sm text-green-600">All features and premium functionality are available</p>
              </div>
            </div>
            <Badge className="bg-green-600">Admin</Badge>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (subscriptionStatus === 'active' && subscriptionTier === 'pro') {
    return (
      <Card className="mb-6 border-blue-200 bg-blue-50">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Star className="h-5 w-5 text-blue-600" />
              <div>
                <h3 className="font-semibold text-blue-800">Pro Subscription Active</h3>
                <p className="text-sm text-blue-600">Thank you for supporting AquaAI! You have access to all features.</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge className="bg-blue-600">Pro</Badge>
              <Button variant="outline" size="sm" onClick={handleManageSubscription}>
                Manage
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="mb-6 border-gray-200 bg-gray-50">
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Heart className="h-5 w-5 text-gray-600" />
            <div>
              <h3 className="font-semibold text-gray-800">Free Plan - All Features Available!</h3>
              <p className="text-sm text-gray-600">Enjoy full access to AquaAI. Consider upgrading to Pro to support development.</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline">Free</Badge>
            <Button size="sm" onClick={handleUpgrade}>
              Support Us - Go Pro
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
