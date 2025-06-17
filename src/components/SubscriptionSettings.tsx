
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { CreditCard, Calendar, Star, Crown, Settings } from 'lucide-react';
import { useCredits } from '@/hooks/useCredits';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export const SubscriptionSettings: React.FC = () => {
  const { getSubscriptionInfo, profileLoading } = useCredits();
  const { toast } = useToast();

  const subscriptionInfo = getSubscriptionInfo();

  const handleManageSubscription = async () => {
    try {
      console.log('Opening customer portal...');
      
      const { data, error } = await supabase.functions.invoke('customer-portal');

      if (error) {
        console.error('Error opening customer portal:', error);
        toast({
          title: "Error",
          description: "Failed to open subscription management. Please try again.",
          variant: "destructive",
        });
        return;
      }

      if (data?.url) {
        window.open(data.url, '_blank');
      } else {
        throw new Error('No portal URL received');
      }
    } catch (error) {
      console.error('Error opening customer portal:', error);
      toast({
        title: "Error",
        description: "Failed to open subscription management. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleRefreshStatus = async () => {
    try {
      console.log('Refreshing subscription status...');
      
      const { data, error } = await supabase.functions.invoke('check-subscription');

      if (error) {
        console.error('Error refreshing subscription:', error);
        toast({
          title: "Error",
          description: "Failed to refresh subscription status. Please try again.",
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "Status Updated",
        description: "Your subscription status has been refreshed.",
      });
    } catch (error) {
      console.error('Error refreshing subscription:', error);
      toast({
        title: "Error",
        description: "Failed to refresh subscription status. Please try again.",
        variant: "destructive",
      });
    }
  };

  if (profileLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
        </CardContent>
      </Card>
    );
  }

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString();
  };

  const getPlanIcon = () => {
    if (subscriptionInfo.isAdmin) return Crown;
    if (subscriptionInfo.tier === 'pro') return Star;
    return CreditCard;
  };

  const PlanIcon = getPlanIcon();

  return (
    <div className="space-y-6">
      {/* Current Plan */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <PlanIcon className="h-5 w-5" />
            Current Plan
          </CardTitle>
          <CardDescription>
            Manage your subscription and billing information
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-lg">
                {subscriptionInfo.displayTier}
              </h3>
              <p className="text-muted-foreground">
                {subscriptionInfo.isAdmin 
                  ? 'Full administrative access to all features'
                  : subscriptionInfo.tier === 'pro' 
                  ? 'Unlimited access to all premium features'
                  : subscriptionInfo.isTrial
                  ? `Trial with ${Math.floor(subscriptionInfo.trialHoursRemaining)} hours remaining`
                  : 'Limited access to basic features'
                }
              </p>
            </div>
            <Badge 
              variant={
                subscriptionInfo.isAdmin ? "default" :
                subscriptionInfo.tier === 'pro' ? "default" :
                subscriptionInfo.isTrial ? "secondary" : "outline"
              }
              className={
                subscriptionInfo.isAdmin ? "bg-purple-600" :
                subscriptionInfo.tier === 'pro' ? "bg-blue-600" :
                ""
              }
            >
              {subscriptionInfo.displayTier}
            </Badge>
          </div>

          <Separator />

          {/* Plan Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-muted-foreground">Status</label>
              <p className="font-medium capitalize">{subscriptionInfo.status}</p>
            </div>
            
            {subscriptionInfo.tier === 'pro' && (
              <div>
                <label className="text-sm font-medium text-muted-foreground">Billing Cycle</label>
                <p className="font-medium">Monthly</p>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 pt-4">
            {subscriptionInfo.tier === 'pro' && subscriptionInfo.status === 'active' && (
              <Button onClick={handleManageSubscription} className="flex items-center gap-2">
                <Settings className="h-4 w-4" />
                Manage Subscription
              </Button>
            )}
            
            <Button variant="outline" onClick={handleRefreshStatus}>
              Refresh Status
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Billing History */}
      {subscriptionInfo.tier === 'pro' && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Billing Information
            </CardTitle>
            <CardDescription>
              View and manage your billing details
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">
              Access your billing history, update payment methods, and download invoices 
              through the Stripe Customer Portal.
            </p>
            <Button variant="outline" onClick={handleManageSubscription}>
              View Billing Details
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Plan Features */}
      <Card>
        <CardHeader>
          <CardTitle>Plan Features</CardTitle>
          <CardDescription>
            What's included in your current plan
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {subscriptionInfo.isAdmin ? (
              <>
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 bg-green-500 rounded-full"></div>
                  <span>Full administrative access</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 bg-green-500 rounded-full"></div>
                  <span>User management</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 bg-green-500 rounded-full"></div>
                  <span>All premium features</span>
                </div>
              </>
            ) : subscriptionInfo.tier === 'pro' ? (
              <>
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 bg-green-500 rounded-full"></div>
                  <span>Unlimited AI chat messages</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 bg-green-500 rounded-full"></div>
                  <span>Advanced aquarium analysis</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 bg-green-500 rounded-full"></div>
                  <span>Priority support</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 bg-green-500 rounded-full"></div>
                  <span>Image analysis</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 bg-green-500 rounded-full"></div>
                  <span>Web search integration</span>
                </div>
              </>
            ) : (
              <>
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 bg-gray-400 rounded-full"></div>
                  <span className="text-muted-foreground">Limited chat messages</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 bg-gray-400 rounded-full"></div>
                  <span className="text-muted-foreground">Basic features only</span>
                </div>
              </>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
