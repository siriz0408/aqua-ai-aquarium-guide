
import React, { useState } from 'react';
import { Layout } from '@/components/Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import { useSubscriptionAccess } from '@/hooks/useSubscriptionAccess';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { User, CreditCard, Calendar, Crown, Settings } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Account = () => {
  const { user, signOut } = useAuth();
  const { profile, subscriptionInfo, trialStatus, isLoading } = useSubscriptionAccess();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [isLoadingPortal, setIsLoadingPortal] = useState(false);

  const handleManageSubscription = async () => {
    if (!user) return;

    setIsLoadingPortal(true);
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
      setIsLoadingPortal(false);
    }
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  if (!user) {
    return null;
  }

  return (
    <Layout title="Account - AquaAI">
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-gray-900 dark:to-blue-900">
        <div className="container mx-auto px-4 py-8 max-w-4xl">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold mb-4">Account Settings</h1>
            <p className="text-xl text-muted-foreground">
              Manage your subscription and account preferences
            </p>
          </div>

          <div className="grid gap-6">
            {/* Profile Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Profile Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-600">Email</label>
                  <p className="text-lg">{user.email}</p>
                </div>
                {profile?.full_name && (
                  <div>
                    <label className="text-sm font-medium text-gray-600">Full Name</label>
                    <p className="text-lg">{profile.full_name}</p>
                  </div>
                )}
                <div>
                  <label className="text-sm font-medium text-gray-600">Account Status</label>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge variant={subscriptionInfo.isAdmin ? "default" : "secondary"}>
                      {subscriptionInfo.displayTier}
                    </Badge>
                    {subscriptionInfo.isAdmin && (
                      <Crown className="h-4 w-4 text-yellow-500" />
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Subscription Status */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="h-5 w-5" />
                  Subscription Status
                </CardTitle>
                <CardDescription>
                  Manage your subscription and billing information
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {isLoading ? (
                  <div className="animate-pulse">
                    <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/3"></div>
                  </div>
                ) : (
                  <>
                    <div className="flex items-center justify-between">
                      <span className="font-medium">Current Plan:</span>
                      <Badge 
                        variant={subscriptionInfo.hasAccess ? "default" : "outline"}
                        className="ml-2"
                      >
                        {subscriptionInfo.displayTier}
                      </Badge>
                    </div>

                    {subscriptionInfo.isTrial && (
                      <div className="flex items-center justify-between">
                        <span className="font-medium">Trial Time Remaining:</span>
                        <span className="text-orange-600 font-medium">
                          {Math.floor(subscriptionInfo.trialHoursRemaining)} hours
                        </span>
                      </div>
                    )}

                    {profile?.subscription_end_date && subscriptionInfo.hasAccess && (
                      <div className="flex items-center justify-between">
                        <span className="font-medium">Next Billing Date:</span>
                        <span className="text-gray-600">
                          {new Date(profile.subscription_end_date).toLocaleDateString()}
                        </span>
                      </div>
                    )}

                    <div className="flex gap-3 pt-4">
                      {subscriptionInfo.hasAccess && !subscriptionInfo.isAdmin && (
                        <Button
                          onClick={handleManageSubscription}
                          disabled={isLoadingPortal}
                          variant="outline"
                          className="flex items-center gap-2"
                        >
                          <Settings className="h-4 w-4" />
                          {isLoadingPortal ? "Loading..." : "Manage Subscription"}
                        </Button>
                      )}

                      {!subscriptionInfo.hasAccess && !subscriptionInfo.isAdmin && (
                        <Button
                          onClick={() => navigate('/pricing')}
                          className="flex items-center gap-2"
                        >
                          <Crown className="h-4 w-4" />
                          Upgrade to Pro
                        </Button>
                      )}
                    </div>
                  </>
                )}
              </CardContent>
            </Card>

            {/* Account Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Account Actions</CardTitle>
                <CardDescription>
                  Manage your account settings and preferences
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button
                  onClick={handleSignOut}
                  variant="outline"
                  className="w-full"
                >
                  Sign Out
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Account;
