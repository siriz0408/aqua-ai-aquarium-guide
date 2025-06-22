
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Crown, Star } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { PlanSelector } from './PlanSelector';
import { PRICING_PLANS, type PricingPlan, formatPrice } from '@/config/pricing';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface SubscriptionPromptProps {
  isFullScreen?: boolean;
}

export const SubscriptionPrompt: React.FC<SubscriptionPromptProps> = ({ 
  isFullScreen = false 
}) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [selectedPlan, setSelectedPlan] = React.useState<PricingPlan>(
    PRICING_PLANS.find(p => p.popular) || PRICING_PLANS[0]
  );
  const [isLoading, setIsLoading] = React.useState(false);

  const handleSubscribe = async () => {
    if (!user?.id || !user?.email) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to subscribe.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('create-checkout', {
        body: { 
          userId: user.id,
          email: user.email,
          priceId: selectedPlan.priceId
        }
      });

      if (error) throw error;

      if (data?.url) {
        window.location.href = data.url;
      } else {
        throw new Error('No checkout URL returned');
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

  const content = (
    <Card className="border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-900/20 max-w-4xl mx-auto">
      <CardHeader className="text-center">
        <div className="mx-auto mb-4 h-16 w-16 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
          <Star className="h-8 w-8 text-blue-600" />
        </div>
        <CardTitle className="text-2xl text-blue-800 dark:text-blue-200 flex items-center justify-center gap-2">
          <Crown className="h-6 w-6" />
          Subscribe to AquaAI Pro
        </CardTitle>
        <CardDescription className="text-blue-600 dark:text-blue-300">
          Get unlimited access to all premium aquarium management features.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <PlanSelector
          selectedPlan={selectedPlan}
          onPlanSelect={setSelectedPlan}
          showFeatures={true}
        />
        
        <div className="bg-blue-50 dark:bg-blue-950/50 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
          <h4 className="font-medium text-blue-800 dark:text-blue-200 mb-2">What's included:</h4>
          <ol className="text-sm text-blue-700 dark:text-blue-300 space-y-1 text-left">
            <li>• Unlimited AI-powered aquarium assistance</li>
            <li>• Advanced setup planning tools</li>
            <li>• Complete tank management dashboard</li>
            <li>• Water parameter tracking & analysis</li>
            <li>• Species compatibility checker</li>
            <li>• Maintenance scheduling & reminders</li>
            <li>• Priority customer support</li>
          </ol>
        </div>
        
        <Button 
          onClick={handleSubscribe}
          disabled={isLoading}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white text-lg py-6"
        >
          {isLoading ? "Processing..." : `Subscribe Now - ${formatPrice(selectedPlan.price)}/${selectedPlan.interval}`}
        </Button>
        
        <p className="text-xs text-blue-600 dark:text-blue-400 text-center">
          Cancel anytime • Full access to all features • Secure payment via Stripe
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
