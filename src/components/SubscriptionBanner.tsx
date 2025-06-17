
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Crown, Star } from 'lucide-react';
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

  // Always show as Pro user with full access
  return (
    <Card className="mb-6 border-green-200 bg-green-50">
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Crown className="h-5 w-5 text-green-600" />
            <div>
              <h3 className="font-semibold text-green-800">
                Full Access Enabled
              </h3>
              <p className="text-sm text-green-600">
                All features and premium functionality are available
              </p>
            </div>
          </div>
          <Badge className="bg-green-600">
            Pro Access
          </Badge>
        </div>
      </CardContent>
    </Card>
  );
};
