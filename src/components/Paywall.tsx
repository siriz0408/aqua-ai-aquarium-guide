import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Zap, Star, Crown, Check, Clock, AlertTriangle } from 'lucide-react';
import { useCredits } from '@/hooks/useCredits';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface PaywallProps {
  isOpen: boolean;
  onClose: () => void;
  showUpgradeOnly?: boolean;
}

// Updated with your actual Stripe price ID
const STRIPE_PRICE_ID = "price_1Rb8vR1d1AvgoBGoNIjxLKRR";

const PaywallModal: React.FC<PaywallProps> = ({ 
  isOpen, 
  onClose, 
  showUpgradeOnly = false 
}) => {
  const { getSubscriptionInfo, trialStatus } = useCredits();
  const { toast } = useToast();

  if (!isOpen) return null;

  const subscriptionInfo = getSubscriptionInfo();
  const handleUpgrade = async (plan: string) => {
    try {
      console.log('Starting upgrade process for plan:', plan);
      console.log('Using Stripe Price ID:', STRIPE_PRICE_ID);
      
      const { data, error } = await supabase.functions.invoke('create-checkout', {
        body: { priceId: STRIPE_PRICE_ID }
      });

      if (error) {
        console.error('Supabase function error:', error);
        
        // Provide more specific error messages
        if (error.message?.includes('No such price')) {
          toast({
            title: "Configuration Error",
            description: "The subscription plan is not properly configured. Please contact support.",
            variant: "destructive",
          });
        } else {
          toast({
            title: "Error",
            description: error.message || "Failed to start checkout process. Please try again.",
            variant: "destructive",
          });
        }
        return;
      }

      console.log('Checkout session response:', data);

      if (data?.url) {
        // Open Stripe checkout in a new tab
        window.open(data.url, '_blank');
        onClose();
      } else {
        throw new Error('No checkout URL received');
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

  const getHeaderMessage = () => {
    if (subscriptionInfo.isTrial) {
      const hoursRemaining = Math.max(0, subscriptionInfo.trialHoursRemaining);
      const isExpired = hoursRemaining <= 0;
      
      if (isExpired) {
        return {
          title: 'Trial Expired - Upgrade to Continue',
          description: 'Your 1-day trial has ended. Upgrade now to keep using AquaBot and premium features!',
          icon: AlertTriangle,
          color: 'text-red-600'
        };
      } else {
        return {
          title: `${Math.floor(hoursRemaining)} Hours Left in Trial`,
          description: 'Upgrade now to ensure uninterrupted access to all premium features.',
          icon: Clock,
          color: 'text-orange-600'
        };
      }
    }
    
    return {
      title: showUpgradeOnly ? 'Upgrade to Continue' : 'Choose Your Plan',
      description: showUpgradeOnly 
        ? 'Upgrade to unlimited access to AquaBot and premium features!'
        : 'Get unlimited access to AquaBot and premium features',
      icon: Zap,
      color: 'text-blue-600'
    };
  };

  const headerInfo = getHeaderMessage();

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-background rounded-lg border border-border max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="text-center mb-8">
            <div className={`h-16 w-16 rounded-full ocean-gradient flex items-center justify-center mx-auto mb-4`}>
              <headerInfo.icon className="h-8 w-8 text-white" />
            </div>
            <h2 className="text-2xl font-bold mb-2">
              {headerInfo.title}
            </h2>
            <p className="text-muted-foreground">
              {headerInfo.description}
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 mb-8">
            {/* Free Plan */}
            <Card className={`relative ${!showUpgradeOnly ? 'border-muted' : 'opacity-50'}`}>
              <CardHeader className="text-center">
                <CardTitle className="flex items-center justify-center gap-2">
                  <Zap className="h-5 w-5" />
                  Free Trial
                </CardTitle>
                <CardDescription>Try AquaBot risk-free</CardDescription>
                <div className="text-3xl font-bold">$0</div>
                <div className="text-sm text-muted-foreground">1-day trial included</div>
              </CardHeader>
              <CardContent className="space-y-4">
                <ul className="space-y-2">
                  <li className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-green-500" />
                    <span className="text-sm">24-hour full access</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-green-500" />
                    <span className="text-sm">Unlimited AI chat messages</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-green-500" />
                    <span className="text-sm">All premium features</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-green-500" />
                    <span className="text-sm">Water parameter tracking</span>
                  </li>
                </ul>
                <Button 
                  variant="outline" 
                  className="w-full"
                  disabled={true}
                >
                  {subscriptionInfo.isTrial ? 'Current Trial' : 'Trial Used'}
                </Button>
              </CardContent>
            </Card>

            {/* Pro Plan */}
            <Card className="relative border-primary">
              <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                <Badge variant="default" className="bg-primary">
                  <Star className="h-3 w-3 mr-1" />
                  Best Value
                </Badge>
              </div>
              <CardHeader className="text-center pt-8">
                <CardTitle className="flex items-center justify-center gap-2">
                  <Star className="h-5 w-5" />
                  Pro
                </CardTitle>
                <CardDescription>Unlimited access for serious aquarists</CardDescription>
                <div className="text-3xl font-bold">$4.99</div>
                <div className="text-sm text-muted-foreground">per month</div>
              </CardHeader>
              <CardContent className="space-y-4">
                <ul className="space-y-2">
                  <li className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-green-500" />
                    <span className="text-sm">Unlimited AI chat messages</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-green-500" />
                    <span className="text-sm">Advanced aquarium analysis</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-green-500" />
                    <span className="text-sm">Priority support</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-green-500" />
                    <span className="text-sm">Image analysis</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-green-500" />
                    <span className="text-sm">Web search integration</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-green-500" />
                    <span className="text-sm">Custom maintenance plans</span>
                  </li>
                </ul>
                <Button 
                  className="w-full" 
                  onClick={() => handleUpgrade('pro')}
                >
                  Upgrade to Pro
                </Button>
              </CardContent>
            </Card>

            {/* Premium Plan - Hidden for now, keeping original structure */}
            <Card className="relative border-yellow-500 opacity-50">
              <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                <Badge variant="secondary" className="bg-yellow-500 text-yellow-50">
                  <Crown className="h-3 w-3 mr-1" />
                  Coming Soon
                </Badge>
              </div>
              <CardHeader className="text-center pt-8">
                <CardTitle className="flex items-center justify-center gap-2">
                  <Crown className="h-5 w-5" />
                  Premium
                </CardTitle>
                <CardDescription>Everything + exclusive features</CardDescription>
                <div className="text-3xl font-bold">$9.99</div>
                <div className="text-sm text-muted-foreground">per month</div>
              </CardHeader>
              <CardContent className="space-y-4">
                <ul className="space-y-2">
                  <li className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-green-500" />
                    <span className="text-sm">Everything in Pro</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-green-500" />
                    <span className="text-sm">Advanced analytics</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-green-500" />
                    <span className="text-sm">Early access to features</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-green-500" />
                    <span className="text-sm">1-on-1 consultation</span>
                  </li>
                </ul>
                <Button 
                  variant="secondary" 
                  className="w-full" 
                  disabled
                >
                  Coming Soon
                </Button>
              </CardContent>
            </Card>
          </div>

          <div className="text-center">
            <Button variant="ghost" onClick={onClose}>
              Maybe Later
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaywallModal;
