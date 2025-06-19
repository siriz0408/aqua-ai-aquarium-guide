
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Crown, Star, Check } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';

const STRIPE_PRICE_ID = "price_1Rb8vR1d1AvgoBGoNIjxLKRR";

interface SubscriptionPromptProps {
  isFullScreen?: boolean;
}

export const SubscriptionPrompt: React.FC<SubscriptionPromptProps> = ({ 
  isFullScreen = false 
}) => {
  const { toast } = useToast();
  const { user } = useAuth();
  const [loading, setLoading] = React.useState(false);

  const handleStartTrial = async () => {
    if (!user?.id) {
      toast({
        title: "Authentication Required",
        description: "Please sign in first.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      console.log('Starting Stripe checkout with trial...');

      // Create the Stripe checkout session with trial period
      const { data, error } = await supabase.functions.invoke('create-checkout', {
        body: { 
          priceId: STRIPE_PRICE_ID,
          trialPeriodDays: 3
        }
      });

      if (error) {
        console.error('Supabase function error:', error);
        toast({
          title: "Error",
          description: "Failed to start trial process. Please try again.",
          variant: "destructive",
        });
        return;
      }

      if (data?.url) {
        console.log('Redirecting to Stripe checkout:', data.url);
        // Redirect to Stripe checkout
        window.location.href = data.url;
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
    <Card className="border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-900/20 max-w-md mx-auto">
      <CardHeader className="text-center">
        <div className="mx-auto mb-4 h-16 w-16 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
          <Star className="h-8 w-8 text-blue-600" />
        </div>
        <CardTitle className="text-2xl text-blue-800 dark:text-blue-200 flex items-center justify-center gap-2">
          <Crown className="h-6 w-6" />
          Welcome to AquaAI
        </CardTitle>
        <CardDescription className="text-blue-600 dark:text-blue-300">
          Start your 3-day free trial to access all premium features and AI-powered aquarium management.
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
          <Badge className="mb-4 bg-green-100 text-green-800">3-Day Free Trial</Badge>
          
          <div className="space-y-2 text-sm text-left">
            <div className="flex items-center gap-2">
              <Check className="h-4 w-4 text-green-600" />
              <span className="font-medium">AI-Powered AquaBot Chat</span>
            </div>
            <div className="flex items-center gap-2">
              <Check className="h-4 w-4 text-green-600" />
              <span>Advanced Setup Planner</span>
            </div>
            <div className="flex items-center gap-2">
              <Check className="h-4 w-4 text-green-600" />
              <span>Unlimited tank tracking</span>
            </div>
            <div className="flex items-center gap-2">
              <Check className="h-4 w-4 text-green-600" />
              <span>Water parameter logging</span>
            </div>
            <div className="flex items-center gap-2">
              <Check className="h-4 w-4 text-green-600" />
              <span>Equipment management</span>
            </div>
            <div className="flex items-center gap-2">
              <Check className="h-4 w-4 text-green-600" />
              <span>Educational resources</span>
            </div>
          </div>
        </div>
        
        <div className="bg-blue-50 dark:bg-blue-950/50 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
          <h4 className="font-medium text-blue-800 dark:text-blue-200 mb-2">How it works:</h4>
          <ol className="text-sm text-blue-700 dark:text-blue-300 space-y-1 text-left">
            <li>1. Start your 3-day free trial now</li>
            <li>2. Enjoy full access to all features</li>
            <li>3. Cancel anytime during trial - no charges</li>
            <li>4. After trial: $4.99/month (cancel anytime)</li>
          </ol>
        </div>
        
        <Button 
          onClick={handleStartTrial}
          disabled={loading}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white text-lg py-6"
        >
          {loading ? "Starting Trial..." : "Start 3-Day Free Trial"}
        </Button>
        
        <p className="text-xs text-blue-600 dark:text-blue-400">
          No commitment • Cancel anytime • Secure payment via Stripe
        </p>
      </CardContent>
    </Card>
  );

  if (isFullScreen) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-gray-900 dark:to-blue-900">
        {content}
      </div>
    );
  }

  return content;
};
