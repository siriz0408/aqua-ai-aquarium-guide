
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Zap, Star, Crown, Check, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useState } from 'react';

interface PaywallProps {
  isOpen: boolean;
  onClose: () => void;
  currentCredits?: number;
  showUpgradeOnly?: boolean;
}

const PaywallModal: React.FC<PaywallProps> = ({ 
  isOpen, 
  onClose, 
  currentCredits = 0,
  showUpgradeOnly = false 
}) => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleUpgrade = async (plan: string) => {
    setIsLoading(plan);
    try {
      const { data, error } = await supabase.functions.invoke('create-checkout', {
        body: { plan }
      });

      if (error) {
        console.error('Error creating checkout:', error);
        toast({
          title: "Error",
          description: "Failed to create checkout session. Please try again.",
          variant: "destructive",
        });
        return;
      }

      if (data.url) {
        // Open Stripe checkout in a new tab
        window.open(data.url, '_blank');
        onClose();
      }
    } catch (error) {
      console.error('Error:', error);
      toast({
        title: "Error",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(null);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-background rounded-lg border border-border max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="text-center mb-8">
            <div className="h-16 w-16 rounded-full ocean-gradient flex items-center justify-center mx-auto mb-4">
              <Zap className="h-8 w-8 text-white" />
            </div>
            <h2 className="text-2xl font-bold mb-2">
              {showUpgradeOnly ? 'Upgrade to Continue' : 'Choose Your Plan'}
            </h2>
            <p className="text-muted-foreground">
              {showUpgradeOnly 
                ? `You've used all ${currentCredits} free credits. Upgrade to unlimited access!`
                : 'Get unlimited access to AquaBot and premium features'
              }
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 mb-8">
            {/* Free Plan */}
            <Card className={`relative ${!showUpgradeOnly ? 'border-muted' : 'opacity-50'}`}>
              <CardHeader className="text-center">
                <CardTitle className="flex items-center justify-center gap-2">
                  <Zap className="h-5 w-5" />
                  Free
                </CardTitle>
                <CardDescription>Perfect for trying out AquaBot</CardDescription>
                <div className="text-3xl font-bold">$0</div>
                <div className="text-sm text-muted-foreground">5 messages included</div>
              </CardHeader>
              <CardContent className="space-y-4">
                <ul className="space-y-2">
                  <li className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-green-500" />
                    <span className="text-sm">5 AI chat messages</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-green-500" />
                    <span className="text-sm">Basic aquarium advice</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-green-500" />
                    <span className="text-sm">Water parameter tracking</span>
                  </li>
                </ul>
                <Button 
                  variant="outline" 
                  className="w-full"
                  disabled={showUpgradeOnly}
                >
                  Current Plan
                </Button>
              </CardContent>
            </Card>

            {/* Pro Plan */}
            <Card className="relative border-primary">
              <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                <Badge variant="default" className="bg-primary">
                  <Star className="h-3 w-3 mr-1" />
                  Most Popular
                </Badge>
              </div>
              <CardHeader className="text-center pt-8">
                <CardTitle className="flex items-center justify-center gap-2">
                  <Star className="h-5 w-5" />
                  Pro
                </CardTitle>
                <CardDescription>Unlimited access for serious aquarists</CardDescription>
                <div className="text-3xl font-bold">$9.99</div>
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
                </ul>
                <Button 
                  className="w-full" 
                  onClick={() => handleUpgrade('pro')}
                  disabled={isLoading === 'pro'}
                >
                  {isLoading === 'pro' ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Loading...
                    </>
                  ) : (
                    'Upgrade to Pro'
                  )}
                </Button>
              </CardContent>
            </Card>

            {/* Premium Plan */}
            <Card className="relative border-yellow-500">
              <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                <Badge variant="secondary" className="bg-yellow-500 text-yellow-50">
                  <Crown className="h-3 w-3 mr-1" />
                  Premium
                </Badge>
              </div>
              <CardHeader className="text-center pt-8">
                <CardTitle className="flex items-center justify-center gap-2">
                  <Crown className="h-5 w-5" />
                  Premium
                </CardTitle>
                <CardDescription>Everything + exclusive features</CardDescription>
                <div className="text-3xl font-bold">$19.99</div>
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
                    <span className="text-sm">Custom tank setup plans</span>
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
                  onClick={() => handleUpgrade('premium')}
                  disabled={isLoading === 'premium'}
                >
                  {isLoading === 'premium' ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Loading...
                    </>
                  ) : (
                    'Upgrade to Premium'
                  )}
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
