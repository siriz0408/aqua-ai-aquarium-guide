
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { RefreshCw, Zap, AlertCircle, CheckCircle, Users } from 'lucide-react';
import { useManualSync } from '@/hooks/useManualSync';
import { Alert, AlertDescription } from '@/components/ui/alert';

export const AdminSubscriptionSync: React.FC = () => {
  const { syncUserSubscription, refreshUserAccess, isLoading } = useManualSync();
  const [syncForm, setSyncForm] = useState({
    email: '',
    stripeCustomerId: '',
    stripeSubscriptionId: '',
    subscriptionStatus: 'active'
  });
  const [refreshUserId, setRefreshUserId] = useState('');
  const [lastResult, setLastResult] = useState<any>(null);

  const handleManualSync = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!syncForm.email || !syncForm.stripeCustomerId) {
      return;
    }

    const result = await syncUserSubscription(
      syncForm.email,
      syncForm.stripeCustomerId,
      syncForm.stripeSubscriptionId,
      syncForm.subscriptionStatus
    );
    
    setLastResult(result);
    
    if (result.success) {
      setSyncForm({
        email: '',
        stripeCustomerId: '',
        stripeSubscriptionId: '',
        subscriptionStatus: 'active'
      });
    }
  };

  const handleRefreshAccess = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!refreshUserId) {
      return;
    }

    const result = await refreshUserAccess(refreshUserId);
    setLastResult(result);
    
    if (result.success) {
      setRefreshUserId('');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Zap className="h-5 w-5 text-blue-600" />
        <h2 className="text-2xl font-bold">Subscription Sync Tools</h2>
      </div>
      
      <div className="grid gap-6 md:grid-cols-2">
        {/* Manual Subscription Sync */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <RefreshCw className="h-4 w-4" />
              Manual Subscription Sync
            </CardTitle>
            <CardDescription>
              Manually sync a user's subscription from Stripe data when webhooks fail
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleManualSync} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">User Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={syncForm.email}
                  onChange={(e) => setSyncForm(prev => ({ ...prev, email: e.target.value }))}
                  placeholder="user@example.com"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="stripeCustomerId">Stripe Customer ID</Label>
                <Input
                  id="stripeCustomerId"
                  value={syncForm.stripeCustomerId}
                  onChange={(e) => setSyncForm(prev => ({ ...prev, stripeCustomerId: e.target.value }))}
                  placeholder="cus_xxxxxxxxxxxx"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="stripeSubscriptionId">Stripe Subscription ID</Label>
                <Input
                  id="stripeSubscriptionId"
                  value={syncForm.stripeSubscriptionId}
                  onChange={(e) => setSyncForm(prev => ({ ...prev, stripeSubscriptionId: e.target.value }))}
                  placeholder="sub_xxxxxxxxxxxx"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="subscriptionStatus">Subscription Status</Label>
                <select
                  id="subscriptionStatus"
                  value={syncForm.subscriptionStatus}
                  onChange={(e) => setSyncForm(prev => ({ ...prev, subscriptionStatus: e.target.value }))}
                  className="w-full p-2 border border-input rounded-md bg-background"
                >
                  <option value="active">Active</option>
                  <option value="canceled">Canceled</option>
                  <option value="past_due">Past Due</option>
                  <option value="unpaid">Unpaid</option>
                </select>
              </div>
              
              <Button type="submit" disabled={isLoading} className="w-full">
                {isLoading ? (
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Zap className="h-4 w-4 mr-2" />
                )}
                Sync Subscription
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* User Access Refresh */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Refresh User Access
            </CardTitle>
            <CardDescription>
              Refresh and check a user's access status using their user ID
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleRefreshAccess} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="refreshUserId">User ID</Label>
                <Input
                  id="refreshUserId"
                  value={refreshUserId}
                  onChange={(e) => setRefreshUserId(e.target.value)}
                  placeholder="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
                  required
                />
              </div>
              
              <Button type="submit" disabled={isLoading} className="w-full">
                {isLoading ? (
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <CheckCircle className="h-4 w-4 mr-2" />
                )}
                Refresh Access
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>

      {/* Results Display */}
      {lastResult && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {lastResult.success ? (
                <CheckCircle className="h-4 w-4 text-green-600" />
              ) : (
                <AlertCircle className="h-4 w-4 text-red-600" />
              )}
              Last Operation Result
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Badge variant={lastResult.success ? "default" : "destructive"}>
                  {lastResult.success ? "Success" : "Failed"}
                </Badge>
                <span className="text-sm text-muted-foreground">
                  {lastResult.message}
                </span>
              </div>
              
              {lastResult.details && (
                <div className="mt-4">
                  <Label className="text-sm font-medium">Operation Details:</Label>
                  <pre className="mt-2 p-3 bg-muted rounded-md text-xs overflow-auto max-h-40">
                    {JSON.stringify(lastResult.details, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Instructions */}
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          <strong>Usage Instructions:</strong>
          <ul className="mt-2 space-y-1 text-sm">
            <li>• Use Manual Sync when Stripe webhooks fail to update user subscriptions</li>
            <li>• Find Stripe Customer/Subscription IDs in your Stripe dashboard</li>
            <li>• Use Refresh Access to force-check a user's current access level</li>
            <li>• All operations are logged for audit purposes</li>
          </ul>
        </AlertDescription>
      </Alert>
    </div>
  );
};
