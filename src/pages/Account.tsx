
import React from 'react';
import { Layout } from '@/components/Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import { useSubscriptionAccess } from '@/hooks/useSubscriptionAccess';
import { User, Shield, CreditCard, Loader2 } from 'lucide-react';

const Account = () => {
  const { user } = useAuth();
  const { hasAccess, isActive, isAdmin, tier, loading, refresh } = useSubscriptionAccess();

  if (loading) {
    return (
      <Layout title="Account Settings">
        <div className="flex items-center justify-center min-h-[400px]">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      </Layout>
    );
  }

  return (
    <Layout title="Account Settings">
      <div className="max-w-4xl space-y-6">
        {/* User Profile */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Profile Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-500">Email</label>
                <p className="text-sm">{user?.email}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Account Type</label>
                <div className="flex items-center gap-2">
                  <Badge variant={isAdmin ? 'destructive' : isActive ? 'default' : 'secondary'}>
                    {isAdmin ? 'Administrator' : isActive ? 'Pro Subscriber' : 'Free User'}
                  </Badge>
                </div>
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
              Manage your AquaAI subscription and billing
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-500">Current Plan</label>
                <div className="flex items-center gap-2">
                  <Badge variant={isActive ? 'default' : 'secondary'}>
                    {tier.toUpperCase()}
                  </Badge>
                  {isActive && <span className="text-sm text-green-600">Active</span>}
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Access Level</label>
                <p className="text-sm">
                  {hasAccess ? 'Full Access' : 'Limited Access'}
                </p>
              </div>
            </div>

            <div className="flex gap-3">
              <Button onClick={refresh} variant="outline">
                Refresh Status
              </Button>
              {!hasAccess && (
                <Button onClick={() => window.location.href = '/'}>
                  Upgrade to Pro
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Admin Panel Access */}
        {isAdmin && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Administrator Access
              </CardTitle>
              <CardDescription>
                You have administrator privileges for this application
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button onClick={() => window.location.href = '/admin'}>
                Access Admin Panel
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Feature Access Summary */}
        <Card>
          <CardHeader>
            <CardTitle>Feature Access</CardTitle>
            <CardDescription>
              Overview of features available with your current plan
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <h4 className="font-medium">Available Features</h4>
                <ul className="text-sm space-y-1">
                  <li className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    Basic Tank Management
                  </li>
                  {hasAccess && (
                    <>
                      <li className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        AI-Powered AquaBot
                      </li>
                      <li className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        Advanced Setup Planner
                      </li>
                      <li className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        Premium Support
                      </li>
                    </>
                  )}
                </ul>
              </div>
              {!hasAccess && (
                <div className="space-y-2">
                  <h4 className="font-medium">Upgrade to Access</h4>
                  <ul className="text-sm space-y-1 text-gray-500">
                    <li className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-gray-300 rounded-full"></div>
                      AI-Powered AquaBot
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-gray-300 rounded-full"></div>
                      Advanced Setup Planner
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-gray-300 rounded-full"></div>
                      Premium Support
                    </li>
                  </ul>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default Account;
