
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useSubscriptionAccess } from '@/hooks/useSubscriptionAccess';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { RefreshCw, Crown, CreditCard } from 'lucide-react';
import { Layout } from '@/components/Layout';
import { useToast } from '@/hooks/use-toast';

const Account = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { 
    profile,
    subscriptionInfo,
    accessData: status,
    isLoading,
    hasError,
    accessError,
    canAccessFeature,
    requiresUpgrade,
    shouldShowPaywall,
    shouldShowSubscriptionPrompt,
    shouldShowTrialBanner,
    hasActiveSubscription,
    isTrialActive,
    isTrialExpired,
    isAdmin,
    canStartTrial,
    hasUsedTrial,
    refreshAccess: refresh,
  } = useSubscriptionAccess();

  useEffect(() => {
    if (!user) {
      navigate('/auth');
    }
  }, [user, navigate]);

  const handleManageSubscription = async () => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to manage your subscription.",
        variant: "destructive",
      });
      return;
    }

    try {
      // Call your Supabase function to generate the Stripe portal link
      const response = await fetch('/api/create-portal-link', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (response.ok && data.url) {
        // Redirect the user to the Stripe customer portal
        window.location.href = data.url;
      } else {
        toast({
          title: "Error",
          description: data.error || "Failed to generate portal link. Please try again.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error creating portal link:", error);
      toast({
        title: "Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
    }
  };

  if (!user) {
    return null;
  }

  return (
    <Layout title="Account - AquaAI">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">Account Settings</h1>

        {status && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Crown className="h-5 w-5 text-blue-600" />
                Subscription Status
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
                <div>
                  <p className="font-medium text-blue-900">
                    {isAdmin ? 'Admin Access' : hasActiveSubscription ? 'Pro Subscriber' : 'Free User'}
                  </p>
                  <p className="text-sm text-blue-700">
                    {isAdmin ? 'Full admin privileges' : 
                     hasActiveSubscription ? 'Full access to all features' : 'Upgrade to access premium features'}
                  </p>
                  {hasActiveSubscription && status.subscriptionEndDate && (
                    <p className="text-xs text-blue-600 mt-1">
                      Expires: {new Date(status.subscriptionEndDate).toLocaleDateString()}
                    </p>
                  )}
                </div>
                <Badge variant={canAccessFeature() ? "default" : "secondary"}>
                  {canAccessFeature() ? "Active" : "Inactive"}
                </Badge>
              </div>
              
              <div className="flex gap-2">
                <Button
                  onClick={refresh}
                  disabled={isLoading}
                  variant="outline"
                  size="sm"
                >
                  {isLoading ? (
                    <>
                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                      Checking...
                    </>
                  ) : (
                    <>
                      <RefreshCw className="h-4 w-4 mr-2" />
                      Refresh Status
                    </>
                  )}
                </Button>
                
                {hasActiveSubscription && (
                  <Button
                    onClick={handleManageSubscription}
                    variant="outline"
                    size="sm"
                  >
                    <CreditCard className="h-4 w-4 mr-2" />
                    Manage Subscription
                  </Button>
                )}
                
                {!canAccessFeature() && (
                  <Button
                    onClick={() => navigate('/pricing')}
                    className="bg-blue-600 hover:bg-blue-700"
                    size="sm"
                  >
                    <Crown className="h-4 w-4 mr-2" />
                    Upgrade to Pro
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {hasError && (
          <div className="mt-4 text-red-500">
            Error: {accessError || 'Failed to load subscription status.'}
          </div>
        )}

        <div className="mt-8">
          <h2 className="text-2xl font-semibold mb-4">User Profile</h2>
          <Card>
            <CardContent>
              <div className="space-y-2">
                <p><strong>User ID:</strong> {user.id}</p>
                <p><strong>Email:</strong> {user.email}</p>
                {user.user_metadata?.full_name && (
                  <p><strong>Full Name:</strong> {user.user_metadata.full_name}</p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
};

export default Account;
