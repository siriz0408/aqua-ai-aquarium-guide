
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Check, Zap, AlertTriangle, Star } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';

export const ExpiredTrialPaywall: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = React.useState(false);

  const handleUpgrade = async () => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to upgrade to Pro.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      // Call your n8n webhook or edge function to create Stripe checkout
      const response = await fetch('/api/create-checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`
        },
        body: JSON.stringify({ 
          userId: user.id,
          email: user.email,
          priceId: 'price_1QKjQKP7WqSJWlZCmXQq5Hzi' // Your Stripe price ID
        })
      });

      const data = await response.json();

      if (data.url) {
        window.location.href = data.url;
      } else {
        throw new Error(data.error || 'Failed to create checkout session');
      }
    } catch (error) {
      console.error('Checkout error:', error);
      toast({
        title: "Error",
        description: "Failed to start checkout. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const features = [
    "Unlimited AI-Powered AquaBot Assistant",
    "Advanced Setup Planner & Recommendations", 
    "Unlimited Tank Management",
    "Parameter Analysis & Tracking",
    "Species Compatibility Checker",
    "Maintenance Scheduling & Reminders",
    "Priority Support"
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50 dark:from-gray-900 dark:to-orange-900 flex items-center justify-center p-4">
      <Card className="max-w-md w-full shadow-xl">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 h-16 w-16 rounded-full bg-orange-100 dark:bg-orange-900/20 flex items-center justify-center">
            <AlertTriangle className="h-8 w-8 text-orange-600" />
          </div>
          <CardTitle className="text-2xl text-orange-800 dark:text-orange-200">
            Subscription Required
          </CardTitle>
          <CardDescription className="text-orange-600 dark:text-orange-300">
            AquaAI requires an active subscription to access all features
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-6">
          <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-lg border">
            <div className="flex items-center justify-center mb-2">
              <Badge variant="secondary" className="bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-200">
                <Star className="h-3 w-3 mr-1" />
                Best Value
              </Badge>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">$9.99</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">per month</div>
            </div>
          </div>

          <div className="space-y-3">
            <h3 className="font-semibold text-gray-900 dark:text-white">
              What you'll get:
            </h3>
            {features.map((feature, index) => (
              <div key={index} className="flex items-center gap-3">
                <Check className="h-4 w-4 text-green-500 flex-shrink-0" />
                <span className="text-sm text-gray-700 dark:text-gray-300">{feature}</span>
              </div>
            ))}
          </div>

          <Button 
            onClick={handleUpgrade} 
            disabled={isLoading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white"
            size="lg"
          >
            <Zap className="h-4 w-4 mr-2" />
            {isLoading ? "Processing..." : "Subscribe Now - $9.99/month"}
          </Button>

          <div className="text-center">
            <p className="text-xs text-gray-500 dark:text-gray-400">
              🔒 Secure payment with Stripe • Cancel anytime
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
