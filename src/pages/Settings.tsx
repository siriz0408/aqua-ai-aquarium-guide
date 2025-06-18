
import React from 'react';
import { Layout } from '@/components/Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { User, Settings as SettingsIcon, CreditCard, Calendar, Shield } from 'lucide-react';
import { useCredits } from '@/hooks/useCredits';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useState } from 'react';

const Settings = () => {
  const { user } = useAuth();
  const { profile, getSubscriptionInfo } = useCredits();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const subscriptionInfo = getSubscriptionInfo();

  const handleManageSubscription = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('customer-portal');

      if (error) throw error;

      if (data?.url) {
        window.open(data.url, '_blank');
      }
    } catch (error) {
      console.error('Error opening customer portal:', error);
      toast({
        title: "Error",
        description: "Failed to open subscription management. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string | null | undefined) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <Layout title="Account Settings">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Header */}
          <div className="flex items-center gap-3 mb-8">
            <SettingsIcon className="h-8 w-8 text-blue-600" />
            <div>
              <h1 className="text-3xl font-bold">Account Settings</h1>
              <p className="text-muted-foreground">Manage your profile and subscription</p>
            </div>
          </div>

          {/* Profile Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Profile Information
              </CardTitle>
              <CardDescription>
                Your basic account information
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Full Name</label>
                  <p className="text-lg">{profile?.full_name || 'Not provided'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Email</label>
                  <p className="text-lg">{user?.email}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Account Type</label>
                  <div className="flex items-center gap-2">
                    {subscriptionInfo.isAdmin ? (
                      <Badge className="bg-green-600">
                        <Shield className="h-3 w-3 mr-1" />
                        Admin
                      </Badge>
                    ) : subscriptionInfo.tier === 'pro' ? (
                      <Badge className="bg-blue-600">
                        <CreditCard className="h-3 w-3 mr-1" />
                        Pro Plan
                      </Badge>
                    ) : subscriptionInfo.isTrial ? (
                      <Badge variant="secondary">
                        <Calendar className="h-3 w-3 mr-1" />
                        Trial
                      </Badge>
                    ) : (
                      <Badge variant="outline">Free</Badge>
                    )}
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Member Since</label>
                  <p className="text-lg">{formatDate(profile?.created_at)}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Subscription Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5" />
                Subscription Details
              </CardTitle>
              <CardDescription>
                Manage your subscription and billing
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Current Plan</label>
                  <p className="text-lg font-medium">{subscriptionInfo.displayTier}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Status</label>
                  <p className="text-lg capitalize">{subscriptionInfo.status}</p>
                </div>
                {profile?.subscription_end_date && (
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">
                      {subscriptionInfo.status === 'active' ? 'Next Billing Date' : 'Expires On'}
                    </label>
                    <p className="text-lg">{formatDate(profile.subscription_end_date)}</p>
                  </div>
                )}
                {subscriptionInfo.isTrial && (
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Trial Ends</label>
                    <p className="text-lg">{formatDate(profile?.trial_end_date)}</p>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap gap-3 pt-4">
                {subscriptionInfo.tier === 'pro' && subscriptionInfo.status === 'active' && (
                  <Button
                    onClick={handleManageSubscription}
                    disabled={loading}
                    variant="outline"
                  >
                    {loading ? 'Loading...' : 'Manage Subscription'}
                  </Button>
                )}
                
                {(subscriptionInfo.tier === 'free' || subscriptionInfo.isTrial) && (
                  <Button
                    onClick={handleManageSubscription}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    Upgrade to Pro
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Features Access */}
          <Card>
            <CardHeader>
              <CardTitle>Feature Access</CardTitle>
              <CardDescription>
                Features available with your current plan
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                  <span>AI Chat Assistant</span>
                  <Badge variant={subscriptionInfo.hasAccess ? "default" : "secondary"}>
                    {subscriptionInfo.hasAccess ? "Included" : "Upgrade Required"}
                  </Badge>
                </div>
                <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                  <span>Tank Management</span>
                  <Badge variant="default">Included</Badge>
                </div>
                <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                  <span>Water Parameter Tracking</span>
                  <Badge variant="default">Included</Badge>
                </div>
                <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                  <span>Priority Support</span>
                  <Badge variant={subscriptionInfo.hasAccess ? "default" : "secondary"}>
                    {subscriptionInfo.hasAccess ? "Included" : "Pro Only"}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
};

export default Settings;
