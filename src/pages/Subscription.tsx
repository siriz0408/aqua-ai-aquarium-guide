
import React from 'react';
import { Layout } from '@/components/Layout';
import { SubscriptionStatus } from '@/components/subscription/SubscriptionStatus';
import { SubscriptionPlans } from '@/components/subscription/SubscriptionPlans';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';

const Subscription = () => {
  const { toast } = useToast();

  const handleUpgrade = () => {
    // This will be connected to Stripe later
    toast({
      title: "Coming Soon",
      description: "Stripe integration will be added to handle subscriptions.",
    });
  };

  const handlePlanSelection = (planId: string) => {
    if (planId === 'pro') {
      handleUpgrade();
    }
  };

  return (
    <Layout title="Subscription Management">
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Subscription Management</h1>
          <p className="text-muted-foreground mt-2">
            Manage your AquaAI subscription and access premium features
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1">
            <SubscriptionStatus onUpgrade={handleUpgrade} />
          </div>

          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Choose Your Plan</CardTitle>
              </CardHeader>
              <CardContent>
                <SubscriptionPlans onSelectPlan={handlePlanSelection} />
              </CardContent>
            </Card>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Frequently Asked Questions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h4 className="font-semibold">What happens to my data if I cancel?</h4>
              <p className="text-gray-600 text-sm mt-1">
                Your data remains safe. You'll keep access to basic features and can export your data anytime.
              </p>
            </div>
            <div>
              <h4 className="font-semibold">Can I change plans anytime?</h4>
              <p className="text-gray-600 text-sm mt-1">
                Yes, you can upgrade or downgrade your plan at any time. Changes take effect at your next billing cycle.
              </p>
            </div>
            <div>
              <h4 className="font-semibold">Is my payment information secure?</h4>
              <p className="text-gray-600 text-sm mt-1">
                We use Stripe for secure payment processing. We never store your payment information on our servers.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default Subscription;
