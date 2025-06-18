
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { RefreshCw, Search, User, CreditCard, AlertTriangle, CheckCircle } from 'lucide-react';
import { useManualSync } from '@/hooks/useManualSync';
import { useToast } from '@/hooks/use-toast';

export const SubscriptionSyncTools: React.FC = () => {
  const [userEmail, setUserEmail] = useState('');
  const [stripeCustomerId, setStripeCustomerId] = useState('');
  const [stripeSubscriptionId, setStripeSubscriptionId] = useState('');
  const [subscriptionStatus, setSubscriptionStatus] = useState('active');
  const [syncResults, setSyncResults] = useState<any>(null);
  
  const { syncUserSubscription, refreshUserAccess, isLoading } = useManualSync();
  const { toast } = useToast();

  const handleManualSync = async () => {
    if (!userEmail || !stripeCustomerId || !stripeSubscriptionId) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    const result = await syncUserSubscription(
      userEmail,
      stripeCustomerId,
      stripeSubscriptionId,
      subscriptionStatus
    );

    setSyncResults(result);
  };

  const handleAccessRefresh = async () => {
    if (!userEmail) {
      toast({
        title: "Missing Email",
        description: "Please enter a user email address",
        variant: "destructive",
      });
      return;
    }

    // For now, we'll use a placeholder user ID - in a real implementation,
    // you'd look up the user ID by email first
    const result = await refreshUserAccess(userEmail);
    setSyncResults(result);
  };

  const clearForm = () => {
    setUserEmail('');
    setStripeCustomerId('');
    setStripeSubscriptionId('');
    setSubscriptionStatus('active');
    setSyncResults(null);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Manual Subscription Sync
          </CardTitle>
          <CardDescription>
            Manually sync subscription data from Stripe when webhooks fail
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="userEmail">User Email *</Label>
              <Input
                id="userEmail"
                value={userEmail}
                onChange={(e) => setUserEmail(e.target.value)}
                placeholder="user@example.com"
              />
            </div>
            
            <div>
              <Label htmlFor="subscriptionStatus">Subscription Status</Label>
              <Select value={subscriptionStatus} onValueChange={setSubscriptionStatus}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="canceled">Canceled</SelectItem>
                  <SelectItem value="past_due">Past Due</SelectItem>
                  <SelectItem value="incomplete">Incomplete</SelectItem>
                  <SelectItem value="trialing">Trialing</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label htmlFor="stripeCustomerId">Stripe Customer ID *</Label>
            <Input
              id="stripeCustomerId"
              value={stripeCustomerId}
              onChange={(e) => setStripeCustomerId(e.target.value)}
              placeholder="cus_..."
            />
          </div>

          <div>
            <Label htmlFor="stripeSubscriptionId">Stripe Subscription ID *</Label>
            <Input
              id="stripeSubscriptionId"
              value={stripeSubscriptionId}
              onChange={(e) => setStripeSubscriptionId(e.target.value)}
              placeholder="sub_..."
            />
          </div>

          <div className="flex gap-2 pt-4">
            <Button 
              onClick={handleManualSync} 
              disabled={isLoading}
              className="flex-1"
            >
              {isLoading ? (
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <RefreshCw className="h-4 w-4 mr-2" />
              )}
              Sync Subscription
            </Button>
            
            <Button 
              onClick={handleAccessRefresh} 
              disabled={isLoading}
              variant="outline"
            >
              <User className="h-4 w-4 mr-2" />
              Refresh Access
            </Button>
            
            <Button 
              onClick={clearForm} 
              variant="outline"
            >
              Clear
            </Button>
          </div>
        </CardContent>
      </Card>

      {syncResults && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {syncResults.success ? (
                <CheckCircle className="h-5 w-5 text-green-600" />
              ) : (
                <AlertTriangle className="h-5 w-5 text-red-600" />
              )}
              Sync Results
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Badge variant={syncResults.success ? "default" : "destructive"}>
                  {syncResults.success ? "Success" : "Failed"}
                </Badge>
                <span className="text-sm text-muted-foreground">
                  {syncResults.message}
                </span>
              </div>
              
              {syncResults.details && (
                <div>
                  <Label>Details:</Label>
                  <Textarea
                    value={JSON.stringify(syncResults.details, null, 2)}
                    readOnly
                    className="mt-1 font-mono text-xs"
                    rows={8}
                  />
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
