
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RefreshCw, Zap } from 'lucide-react';
import { useSubscriptionSync } from '@/hooks/useSubscriptionSync';

interface SyncFormData {
  email: string;
  stripeCustomerId: string;
  stripeSubscriptionId: string;
  subscriptionStatus: string;
}

interface ManualSubscriptionSyncFormProps {
  onResult: (result: any) => void;
}

export const ManualSubscriptionSyncForm: React.FC<ManualSubscriptionSyncFormProps> = ({ onResult }) => {
  const { syncUserSubscription, isLoading } = useSubscriptionSync();
  const [syncForm, setSyncForm] = useState<SyncFormData>({
    email: '',
    stripeCustomerId: '',
    stripeSubscriptionId: '',
    subscriptionStatus: 'active'
  });

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
    
    onResult(result);
    
    if (result.success) {
      setSyncForm({
        email: '',
        stripeCustomerId: '',
        stripeSubscriptionId: '',
        subscriptionStatus: 'active'
      });
    }
  };

  return (
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
  );
};
