
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Crown, Star, Check } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { PlanSelector } from './PlanSelector';
import { PRICING_PLANS, type PricingPlan, formatPrice } from '@/config/pricing';

interface ProSubscriptionPromptProps {
  isFullScreen?: boolean;
}

export const ProSubscriptionPrompt: React.FC<ProSubscriptionPromptProps> = ({ 
  isFullScreen = false 
}) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [selectedPlan, setSelectedPlan] = React.useState<PricingPlan>(
    PRICING_PLANS.find(p => p.popular) || PRICING_PLANS[0]
  );
  const [isLoading, setIsLoading] = React.useState(false);

  const handleSubscribe = async () => {
    if (!user?.id) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to subscribe to AquaBotAI Pro.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('create-checkout', {
        body: { priceId: selectedPlan.priceId }
      });

      if (error) {
        console.error('Checkout error:', error);
        toast({
          title: "Error",
          description: "Failed to start checkout process. Please try again.",
          variant: "destructive",
        });
        return;
      }

      if (data?.url) {
        // Redirect to Stripe Checkout
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
      setIsLoading(false);
    }
  };

  const proFeatures = [
    'AI-Powered AquaBot Assistant',
    'Advanced Setup Planner',
    'Unlimited Tank Management',
    'Water Parameter Tracking',
    'Equipment & Livestock Database',
    'Maintenance Scheduling',
    'Expert Recommendations',
    'Priority Support'
  ];

  // Get display price based on selected plan
  const getDisplayPrice = () => {
    if (selectedPlan.interval === 'month') {
      return '$4.99';
    } else {
      return '$49.00';
    }
  };

  const content = (
    <Card className="border-blue-200 bg-gradient-to-br from-blue-50 to-cyan-50 dark:border-blue-800 dark:bg-gradient-to-br dark:from-blue-900/20 dark:to-cyan-900/20 max-w-4xl mx-auto">
      <CardHeader className="text-center">
        <div className="mx-auto mb-4 h-16 w-16 rounded-full bg-gradient-to-r from-blue-600 to-cyan-600 flex items-center justify-center">
          <Crown className="h-8 w-8 text-white" />
        </div>
        <CardTitle className="text-3xl text-blue-800 dark:text-blue-200 flex items-center justify-center gap-2">
          <Star className="h-7 w-7" />
          Upgrade to AquaBotAI Pro
        </CardTitle>
        <CardDescription className="text-lg text-blue-600 dark:text-blue-300">
          Unlock the full power of AI-driven aquarium management
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-8">
        {/* Features Grid */}
        <div className="grid md:grid-cols-2 gap-4">
          {proFeatures.map((feature, index) => (
            <div key={index} className="flex items-center gap-3 p-3 bg-white/50 dark:bg-gray-800/50 rounded-lg">
              <Check className="h-5 w-5 text-green-600 flex-shrink-0" />
              <span className="text-gray-700 dark:text-gray-300">{feature}</span>
            </div>
          ))}
        </div>
        
        {/* Plan Selection */}
        <div className="space-y-4">
          <h3 className="text-xl font-semibold text-center text-blue-800 dark:text-blue-200">
            Choose Your Plan
          </h3>
          <PlanSelector
            selectedPlan={selectedPlan}
            onPlanSelect={setSelectedPlan}
            showFeatures={false}
          />
        </div>
        
        {/* Subscribe Button */}
        <div className="text-center space-y-4">
          <Button 
            onClick={handleSubscribe}
            disabled={isLoading}
            className="w-full bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white text-lg py-6 max-w-md mx-auto"
          >
            {isLoading ? "Processing..." : `Subscribe for ${getDisplayPrice()}/${selectedPlan.interval}`}
          </Button>
          
          <p className="text-sm text-blue-600 dark:text-blue-400">
            Cancel anytime • Secure payment via Stripe • Instant access
          </p>
        </div>

        {/* Value Proposition */}
        <div className="bg-blue-100 dark:bg-blue-950/30 p-6 rounded-lg border border-blue-200 dark:border-blue-800 text-center">
          <h4 className="font-semibold text-blue-800 dark:text-blue-200 mb-2">
            🐠 Join Thousands of Successful Aquarists
          </h4>
          <p className="text-blue-700 dark:text-blue-300 text-sm">
            Get expert AI guidance, prevent costly mistakes, and keep your aquatic friends thriving with professional-grade tools.
          </p>
        </div>
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
