
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { AlertCircle, RefreshCw } from 'lucide-react';

export const ManualSyncForm: React.FC = () => {
  const [formData, setFormData] = useState({
    email: '',
    stripeCustomerId: '',
    stripeSubscriptionId: '',
    status: 'active'
  });
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleSync = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.email || !formData.stripeCustomerId) {
      toast({
        title: "Validation Error",
        description: "Email and Stripe Customer ID are required",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      const { data, error } = await supabase.rpc('sync_stripe_subscription', {
        customer_email: formData.email,
        stripe_customer_id: formData.stripeCustomerId,
        stripe_subscription_id: formData.stripeSubscriptionId || null,
        subscription_status: formData.status
      });

      if (error) {
        throw error;
      }

      const result = data as any;
      if (result?.success) {
        toast({
          title: "Sync Successful",
          description: `Updated subscription for ${formData.email}`,
        });
        // Reset form
        setFormData({
          email: '',
          stripeCustomerId: '',
          stripeSubscriptionId: '',
          status: 'active'
        });
      } else {
        throw new Error(result?.error || 'Sync failed');
      }
    } catch (error) {
      console.error('Sync error:', error);
      toast({
        title: "Sync Failed",
        description: error instanceof Error ? error.message : 'Unknown error',
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <RefreshCw className="h-5 w-5" />
          Manual Subscription Sync
        </CardTitle>
        <CardDescription>
          Manually sync a user's subscription status with Stripe data
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSync} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="email">User Email *</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                placeholder="user@example.com"
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="stripeCustomerId">Stripe Customer ID *</Label>
              <Input
                id="stripeCustomerId"
                value={formData.stripeCustomerId}
                onChange={(e) => setFormData(prev => ({ ...prev, stripeCustomerId: e.target.value }))}
                placeholder="cus_..."
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="stripeSubscriptionId">Stripe Subscription ID</Label>
              <Input
                id="stripeSubscriptionId"
                value={formData.stripeSubscriptionId}
                onChange={(e) => setFormData(prev => ({ ...prev, stripeSubscriptionId: e.target.value }))}
                placeholder="sub_... (optional)"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="status">Subscription Status</Label>
              <Select 
                value={formData.status} 
                onValueChange={(value) => setFormData(prev => ({ ...prev, status: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="canceled">Canceled</SelectItem>
                  <SelectItem value="past_due">Past Due</SelectItem>
                  <SelectItem value="incomplete">Incomplete</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex items-start gap-2 p-3 bg-orange-50 border border-orange-200 rounded-lg">
            <AlertCircle className="h-4 w-4 text-orange-600 mt-0.5 flex-shrink-0" />
            <div className="text-sm text-orange-800">
              <p className="font-medium mb-1">Important:</p>
              <ul className="space-y-1 text-xs">
                <li>• This will override the user's current subscription status</li>
                <li>• Make sure the Stripe data is accurate before syncing</li>
                <li>• Active status will grant Pro access immediately</li>
              </ul>
            </div>
          </div>

          <Button type="submit" disabled={isLoading} className="w-full">
            {isLoading ? (
              <>
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                Syncing...
              </>
            ) : (
              'Sync Subscription'
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};
