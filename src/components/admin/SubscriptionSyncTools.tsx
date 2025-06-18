
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { RefreshCw, UserPlus, AlertCircle } from 'lucide-react';

export const SubscriptionSyncTools: React.FC = () => {
  const [email, setEmail] = useState('');
  const [stripeCustomerId, setStripeCustomerId] = useState('');
  const [stripeSubscriptionId, setStripeSubscriptionId] = useState('');
  const [subscriptionStatus, setSubscriptionStatus] = useState('active');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleManualSync = async () => {
    if (!email || !stripeCustomerId) {
      toast({
        title: "Validation Error",
        description: "Email and Stripe Customer ID are required",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      console.log('Starting manual sync with data:', {
        email,
        stripeCustomerId,
        stripeSubscriptionId,
        subscriptionStatus
      });

      // Use the simplified sync function
      const { data, error } = await supabase.rpc('sync_stripe_subscription', {
        customer_email: email,
        stripe_customer_id: stripeCustomerId,
        stripe_subscription_id: stripeSubscriptionId || null,
        subscription_status: subscriptionStatus,
        price_id: null
      });

      if (error) {
        console.error('Sync error:', error);
        throw error;
      }

      console.log('Sync result:', data);

      if (data?.success) {
        toast({
          title: "Sync Successful",
          description: `User ${email} has been synced successfully`,
        });

        // Clear form
        setEmail('');
        setStripeCustomerId('');
        setStripeSubscriptionId('');
        setSubscriptionStatus('active');
      } else {
        throw new Error(data?.error || 'Sync failed');
      }
    } catch (error) {
      console.error('Manual sync error:', error);
      toast({
        title: "Sync Failed",
        description: error instanceof Error ? error.message : 'An error occurred during sync',
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserPlus className="h-5 w-5" />
            Manual Subscription Sync
          </CardTitle>
          <CardDescription>
            Manually sync a user's subscription status with Stripe data
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="email">User Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="user@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="customer-id">Stripe Customer ID</Label>
              <Input
                id="customer-id"
                placeholder="cus_..."
                value={stripeCustomerId}
                onChange={(e) => setStripeCustomerId(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="subscription-id">Stripe Subscription ID (Optional)</Label>
              <Input
                id="subscription-id"
                placeholder="sub_..."
                value={stripeSubscriptionId}
                onChange={(e) => setStripeSubscriptionId(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="status">Subscription Status</Label>
              <Select value={subscriptionStatus} onValueChange={setSubscriptionStatus}>
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="trialing">Trialing</SelectItem>
                  <SelectItem value="canceled">Canceled</SelectItem>
                  <SelectItem value="past_due">Past Due</SelectItem>
                  <SelectItem value="unpaid">Unpaid</SelectItem>
                  <SelectItem value="incomplete">Incomplete</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              This will update the user's subscription status in our database based on the provided Stripe data. 
              Make sure the information is accurate as this directly affects user access.
            </AlertDescription>
          </Alert>

          <Button 
            onClick={handleManualSync} 
            disabled={isLoading || !email || !stripeCustomerId}
            className="w-full"
          >
            {isLoading ? (
              <>
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                Syncing...
              </>
            ) : (
              'Sync Subscription'
            )}
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Sync Instructions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 text-sm">
            <div>
              <strong>1. Get Stripe Customer ID:</strong>
              <p className="text-gray-600">
                Go to your Stripe Dashboard → Customers → Search by email → Copy Customer ID (starts with "cus_")
              </p>
            </div>
            <div>
              <strong>2. Get Subscription ID (if applicable):</strong>
              <p className="text-gray-600">
                In the customer's details, find their subscription and copy the ID (starts with "sub_")
              </p>
            </div>
            <div>
              <strong>3. Choose Status:</strong>
              <p className="text-gray-600">
                Select the current status of the subscription as shown in Stripe
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
