
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { RefreshCw, Heart, Star, Check } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { useSubscriptionStatus } from '@/hooks/useSubscriptionStatus';

export const PricingSection: React.FC = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const { checkSubscriptionStatus, isLoading: isCheckingStatus } = useSubscriptionStatus();

  const handleSubscriptionUpgrade = async () => {
    if (!user) {
      toast({
        title: "Sign In Required",
        description: "Please sign in to upgrade to Pro.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('create-checkout', {
        body: { 
          priceId: 'price_1Rb8vR1d1AvgoBGoNIjxLKRR'
        }
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
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <section id="pricing" className="py-16 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">Simple, Fair Pricing</h2>
          <p className="text-gray-600 max-w-2xl mx-auto mb-6">
            All core features are completely free. Upgrade to Pro to support development and get priority features.
          </p>
          
          {user && (
            <div className="mt-4">
              <Button
                variant="outline"
                size="sm"
                onClick={checkSubscriptionStatus}
                disabled={isCheckingStatus}
                className="gap-2"
              >
                <RefreshCw className={`h-4 w-4 ${isCheckingStatus ? 'animate-spin' : ''}`} />
                {isCheckingStatus ? 'Checking...' : 'Refresh Status'}
              </Button>
            </div>
          )}
        </div>

        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {/* Free Plan */}
          <Card className="relative border-2 border-green-200 bg-green-50">
            <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
              <Badge className="bg-green-600 text-white px-3 py-1">
                Always Free
              </Badge>
            </div>
            <CardHeader className="text-center pt-8">
              <Heart className="h-12 w-12 text-green-600 mx-auto mb-4" />
              <CardTitle className="text-2xl">Free Plan</CardTitle>
              <CardDescription>
                Everything you need to manage your aquarium
              </CardDescription>
              <div className="text-4xl font-bold text-green-600 mt-4">
                $0<span className="text-lg font-normal text-gray-600">/forever</span>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Check className="h-5 w-5 text-green-600" />
                  <span>AI-powered aquarium assistant</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="h-5 w-5 text-green-600" />
                  <span>Tank management & planning</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="h-5 w-5 text-green-600" />
                  <span>Water parameter tracking</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="h-5 w-5 text-green-600" />
                  <span>Disease diagnosis tool</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="h-5 w-5 text-green-600" />
                  <span>Task management</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="h-5 w-5 text-green-600" />
                  <span>Complete knowledge base</span>
                </div>
              </div>
              <Button disabled className="w-full mt-6">
                Current Plan
              </Button>
            </CardContent>
          </Card>

          {/* Pro Plan */}
          <Card className="relative border-2 border-blue-200 bg-blue-50">
            <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
              <Badge className="bg-blue-600 text-white px-3 py-1">
                Support Development
              </Badge>
            </div>
            <CardHeader className="text-center pt-8">
              <Star className="h-12 w-12 text-blue-600 mx-auto mb-4" />
              <CardTitle className="text-2xl">Pro Plan</CardTitle>
              <CardDescription>
                Support AquaAI development and get priority features
              </CardDescription>
              <div className="text-4xl font-bold text-blue-600 mt-4">
                $9.99<span className="text-lg font-normal text-gray-600">/month</span>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Check className="h-5 w-5 text-blue-600" />
                  <span>Everything in Free plan</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="h-5 w-5 text-blue-600" />
                  <span>Priority support</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="h-5 w-5 text-blue-600" />
                  <span>Early access to new features</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="h-5 w-5 text-blue-600" />
                  <span>Support ongoing development</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="h-5 w-5 text-blue-600" />
                  <span>Pro badge in community</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="h-5 w-5 text-blue-600" />
                  <span>Advanced analytics (coming soon)</span>
                </div>
              </div>
              <Button 
                onClick={handleSubscriptionUpgrade}
                disabled={isLoading}
                className="w-full mt-6 bg-blue-600 hover:bg-blue-700"
              >
                {isLoading ? "Processing..." : "Upgrade to Pro"}
              </Button>
            </CardContent>
          </Card>
        </div>

        <div className="text-center mt-12">
          <div className="bg-gray-50 p-6 rounded-lg border max-w-2xl mx-auto">
            <h4 className="font-medium text-gray-800 mb-2">🐠 Our Philosophy</h4>
            <p className="text-sm text-gray-600">
              We believe aquarium management tools should be accessible to everyone. 
              That's why all core features are completely free. Pro subscriptions help us 
              continue development and add new features for the entire community.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

const Badge: React.FC<{ className: string; children: React.ReactNode }> = ({ className, children }) => (
  <span className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${className}`}>
    {children}
  </span>
);
