
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, Crown, Lock } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

const STRIPE_PRICE_ID = "price_1Rb8vR1d1AvgoBGoNIjxLKRR";

interface ExpiredTrialPaywallProps {
  isFullScreen?: boolean;
}

export const ExpiredTrialPaywall: React.FC<ExpiredTrialPaywallProps> = ({ 
  isFullScreen = false 
}) => {
  const { toast } = useToast();
  const [loading, setLoading] = React.useState(false);

  const handleUpgrade = async () => {
    setLoading(true);
    try {
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
    } finally {
      setLoading(false);
    }
  };

  const content = (
    <Card className="border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-900/20 max-w-md mx-auto">
      <CardHeader className="text-center">
        <div className="mx-auto mb-4 h-16 w-16 rounded-full bg-red-100 dark:bg-red-900 flex items-center justify-center">
          <AlertTriangle className="h-8 w-8 text-red-600" />
        </div>
        <CardTitle className="text-2xl text-red-800 dark:text-red-200 flex items-center justify-center gap-2">
          <Lock className="h-6 w-6" />
          Trial Expired
        </CardTitle>
        <CardDescription className="text-red-600 dark:text-red-300">
          Your 3-day free trial has ended. Upgrade to continue using AquaAI's powerful features.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6 text-center">
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border">
          <h3 className="font-semibold text-lg mb-2 flex items-center justify-center gap-2">
            <Crown className="h-5 w-5 text-blue-600" />
            AquaAI Pro
          </h3>
          <div className="text-3xl font-bold mb-2">
            $4.99<span className="text-base font-normal text-gray-600">/month</span>
          </div>
          <Badge className="mb-4">New 3-Day Free Trial Available</Badge>
          
          <div className="space-y-2 text-sm text-left">
            <div className="flex items-center gap-2">
              <Crown className="h-4 w-4 text-green-600" />
              <span>AI-Powered AquaBot Chat</span>
            </div>
            <div className="flex items-center gap-2">
              <Crown className="h-4 w-4 text-green-600" />
              <span>Advanced Setup Planner</span>
            </div>
            <div className="flex items-center gap-2">
              <Crown className="h-4 w-4 text-green-600" />
              <span>Unlimited tank tracking</span>
            </div>
            <div className="flex items-center gap-2">
              <Crown className="h-4 w-4 text-green-600" />
              <span>Water parameter logging</span>
            </div>
            <div className="flex items-center gap-2">
              <Crown className="h-4 w-4 text-green-600" />
              <span>Equipment management</span>
            </div>
          </div>
        </div>
        
        <Button 
          onClick={handleUpgrade}
          disabled={loading}
          className="w-full bg-red-600 hover:bg-red-700 text-white text-lg py-6"
        >
          {loading ? "Starting New Trial..." : "Start New 3-Day Free Trial"}
        </Button>
        
        <p className="text-xs text-red-600 dark:text-red-400">
          Cancel anytime within 3 days to avoid charges • Secure payment via Stripe
        </p>
      </CardContent>
    </Card>
  );

  if (isFullScreen) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-red-50 to-orange-50 dark:from-gray-900 dark:to-red-900">
        {content}
      </div>
    );
  }

  return content;
};
