
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
import type { SyncStripeSubscriptionResponse } from '@/types/syncResponse';

export const ManualSyncForm: React.FC = () => {
  const [email, setEmail] = useState('');
  const [stripeCustomerId, setStripeCustomerId] = useState('');
  const [stripeSubscriptionId, setStripeSubscriptionId] = useState('');
  const [subscriptionStatus, setSubscriptionStatus] = useState('active');
  const [isLoading, setIsLoading] = useState(false);
  const [lastResult, setLastResult] = useState<SyncStripeSubscriptionResponse | null>(null);
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
      console.log('Starting manual sync with simplified function...');
      
      // Use the simplified sync function
      const { data, error } = await supabase.rpc('sync_stripe_subscription', {
        customer_email: email,
        stripe_customer_id: stripeCustomerId,
        stripe_subscription_id: stripeSubscriptionId || null,
        subscription_status: subscriptionStatus,
        price_id: null
      });

      if (error) {
        console.error('Manual sync error:', error);
        toast({
          title: "Sync Failed",
          description: error.message,
          variant: "destructive",
        });
        setLastResult({ success: false, error: error.message });
        return;
      }

      console.log('Manual sync result:', data);
      
      // Cast the data to the expected type
      const syncResult = data as SyncStripeSubscriptionResponse;
      
      if (syncResult?.success) {
        toast({
          title: "Sync Successful",
          description: `Successfully synced subscription for ${email}`,
        });
        setLastResult(syncResult);
        
        // Clear form on success
        setEmail('');
        setStripeCustomerId('');
        setStripeSubscriptionId('');
        setSubscriptionStatus('active');
      } else {
        const errorMessage = syncResult?.error || 'Unknown sync error';
        toast({
          title: "Sync Failed",
          description: errorMessage,
          variant: "destructive",
        });
        setLastResult({ success: false, error: errorMessage });
      }
    } catch (error) {
      console.error('Manual sync exception:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      toast({
        title: "Sync Error",
        description: errorMessage,
        variant: "destructive",
      });
      setLastResult({ success: false, error: errorMessage });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <RefreshCw className="h-4 w-4" />
            Manual Subscription Sync
          </CardTitle>
          <CardDescription>
            Manually sync a user's subscription from Stripe data using the simplified schema
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">User Email *</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="user@example.com"
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="stripeCustomerId">Stripe Customer ID *</Label>
            <Input
              id="stripeCustomerId"
              value={stripeCustomerId}
              onChange={(e) => setStripeCustomerId(e.target.value)}
              placeholder="cus_xxxxxxxxxxxx"
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="stripeSubscriptionId">Stripe Subscription ID</Label>
            <Input
              id="stripeSubscriptionId"
              value={stripeSubscriptionId}
              onChange={(e) => setStripeSubscriptionId(e.target.value)}
              placeholder="sub_xxxxxxxxxxxx (optional)"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="subscriptionStatus">Subscription Status</Label>
            <Select value={subscriptionStatus} onValueChange={setSubscriptionStatus}>
              <SelectTrigger>
                <SelectValue />
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
          
          <Button 
            onClick={handleManualSync} 
            disabled={isLoading || !email || !stripeCustomerId}
            className="w-full"
          >
            {isLoading ? (
              <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <UserPlus className="h-4 w-4 mr-2" />
            )}
            {isLoading ? 'Syncing...' : 'Sync Subscription'}
          </Button>
        </CardContent>
      </Card>

      {/* Result Display */}
      {lastResult && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {lastResult.success ? (
                <div className="h-4 w-4 rounded-full bg-green-500" />
              ) : (
                <AlertCircle className="h-4 w-4 text-red-500" />
              )}
              Sync Result
            </CardTitle>
          </CardHeader>
          <CardContent>
            {lastResult.success ? (
              <div className="space-y-2">
                <p className="text-sm text-green-600 font-medium">✅ Sync completed successfully!</p>
                <div className="text-sm text-muted-foreground">
                  <p><strong>User ID:</strong> {lastResult.user_id}</p>
                  <p><strong>Email:</strong> {lastResult.email}</p>
                  <p><strong>Status:</strong> {lastResult.status_updated}</p>
                </div>
              </div>
            ) : (
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  <strong>Error:</strong> {lastResult.error}
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};
