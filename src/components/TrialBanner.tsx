
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Clock, AlertTriangle, Crown } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

const STRIPE_PRICE_ID = "price_1Rb8vR1d1AvgoBGoNIjxLKRR";

interface TrialBannerProps {
  hoursRemaining: number;
  isExpired: boolean;
}

export const TrialBanner: React.FC<TrialBannerProps> = ({ 
  hoursRemaining, 
  isExpired 
}) => {
  const { toast } = useToast();

  const handleUpgrade = async () => {
    try {
      console.log('Starting upgrade process');
      
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({
          title: "Authentication Required",
          description: "Please sign in to upgrade your subscription.",
          variant: "destructive",
        });
        return;
      }
      
      const { data, error } = await supabase.functions.invoke('create-checkout', {
        body: { priceId: STRIPE_PRICE_ID }
      });

      if (error) {
        console.error('Supabase function error:', error);
        toast({
          title: "Error",
          description: "Failed to start checkout process. Please try again.",
          variant: "destructive",
        });
        return;
      }

      if (data?.url) {
        window.open(data.url, '_blank');
      } else {
        throw new Error('No checkout URL received');
      }
    } catch (error) {
      console.error('Error creating checkout session:', error);
      toast({
        title: "Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <Card className={`mb-6 ${isExpired ? 'border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-900/20' : 'border-orange-200 bg-orange-50 dark:border-orange-800 dark:bg-orange-900/20'}`}>
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {isExpired ? (
              <AlertTriangle className="h-5 w-5 text-red-600" />
            ) : (
              <Clock className="h-5 w-5 text-orange-600" />
            )}
            <div>
              <h3 className={`font-semibold ${isExpired ? 'text-red-800 dark:text-red-200' : 'text-orange-800 dark:text-orange-200'}`}>
                {isExpired ? 'Trial Expired' : 'Free Trial Active'}
              </h3>
              <p className={`text-sm ${isExpired ? 'text-red-600 dark:text-red-300' : 'text-orange-600 dark:text-orange-300'}`}>
                {isExpired 
                  ? 'Your 24-hour trial has ended. Upgrade to continue using premium features.'
                  : `${Math.floor(hoursRemaining)} hours remaining in your 24-hour trial`
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
              onClick={handleUpgrade}
              className={`${isExpired ? 'bg-red-600 hover:bg-red-700' : 'bg-blue-600 hover:bg-blue-700'} text-white`}
            >
              <Crown className="mr-1 h-4 w-4" />
              {isExpired ? 'Upgrade Now' : 'Upgrade to Pro'}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
