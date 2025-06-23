
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Clock, AlertTriangle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

const PRICE_IDS = {
  pro: "price_pro_monthly",  // Replace with your actual Stripe price ID
};

interface TrialSubscriptionBannerProps {
  hoursRemaining: number;
}

export const TrialSubscriptionBanner: React.FC<TrialSubscriptionBannerProps> = ({ 
  hoursRemaining 
}) => {
  const { toast } = useToast();
  const isExpired = hoursRemaining <= 0;

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
};
