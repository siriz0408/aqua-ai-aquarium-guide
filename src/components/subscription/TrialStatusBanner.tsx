
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Clock, AlertTriangle, Star, Crown } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { PRICING_PLANS } from '@/config/pricing';

interface TrialStatusBannerProps {
  accessType: 'trial' | 'trial_expired' | 'free';
  hoursRemaining: number;
  trialType?: string | null;
  canStartTrial: boolean;
}

export const TrialStatusBanner: React.FC<TrialStatusBannerProps> = ({ 
  accessType,
  hoursRemaining,
  trialType,
  canStartTrial
}) => {
  const { toast } = useToast();
  const isTrialActive = accessType === 'trial' && hoursRemaining > 0;
  const isTrialExpired = accessType === 'trial_expired';
  const canStartNewTrial = accessType === 'free' && canStartTrial;

  const handleUpgrade = async () => {
    try {
      const priceId = PRICING_PLANS[0].priceId; // Default to monthly
      
      const { data, error } = await supabase.functions.invoke('create-checkout', {
        body: { priceId }
      });

      if (error) {
        console.error('Checkout creation error:', error);
        toast({
          title: "Error",
          description: "Failed to start checkout process. Please try again.",
          variant: "destructive",
        });
        return;
      }

      if (data?.url) {
        window.location.href = data.url;
      }
    } catch (error) {
      console.error('Unexpected error:', error);
      toast({
        title: "Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
    }
  };

  if (isTrialActive) {
    const daysLeft = Math.ceil(hoursRemaining / 24);
    const hoursLeft = Math.floor(hoursRemaining % 24);
    
    return (
      <Card className="mb-6 border-blue-200 bg-gradient-to-r from-blue-50 to-cyan-50 dark:border-blue-800 dark:from-blue-900/20 dark:to-cyan-900/20">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <Star className="h-5 w-5 text-blue-600 animate-pulse" />
                <Clock className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <h3 className="font-semibold text-blue-800 dark:text-blue-200">
                  Free Trial Active! 🎉
                </h3>
                <p className="text-sm text-blue-600 dark:text-blue-300">
                  {daysLeft > 0 ? `${daysLeft} day${daysLeft > 1 ? 's' : ''} ` : ''}
                  {hoursLeft}h remaining • {trialType === 'stripe' ? 'Stripe' : 'Instant'} trial
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge className="bg-blue-600 text-white">
                Trial Active
              </Badge>
              <Button 
                size="sm"
                onClick={handleUpgrade}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                <Crown className="mr-1 h-4 w-4" />
                Upgrade Now
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (isTrialExpired) {
    return (
      <Card className="mb-6 border-red-200 bg-gradient-to-r from-red-50 to-orange-50 dark:border-red-800 dark:from-red-900/20 dark:to-orange-900/20">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <AlertTriangle className="h-5 w-5 text-red-600" />
              <div>
                <h3 className="font-semibold text-red-800 dark:text-red-200">
                  Trial Expired
                </h3>
                <p className="text-sm text-red-600 dark:text-red-300">
                  Your {trialType === 'stripe' ? 'Stripe' : 'instant'} trial has ended. Subscribe to continue.
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="destructive">
                Expired
              </Badge>
              <Button 
                size="sm"
                onClick={handleUpgrade}
                className="bg-red-600 hover:bg-red-700 text-white"
              >
                <Crown className="mr-1 h-4 w-4" />
                Subscribe Now
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (canStartNewTrial) {
    return (
      <Card className="mb-6 border-green-200 bg-gradient-to-r from-green-50 to-emerald-50 dark:border-green-800 dark:from-green-900/20 dark:to-emerald-900/20">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Star className="h-5 w-5 text-green-600" />
              <div>
                <h3 className="font-semibold text-green-800 dark:text-green-200">
                  Start Your Free Trial!
                </h3>
                <p className="text-sm text-green-600 dark:text-green-300">
                  Get 3 days of full access to all AquaAI features - no payment required.
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge className="bg-green-600 text-white">
                Available
              </Badge>
              <Button 
                size="sm"
                onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                className="bg-green-600 hover:bg-green-700 text-white"
              >
                <Star className="mr-1 h-4 w-4" />
                Start Trial
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return null;
};
