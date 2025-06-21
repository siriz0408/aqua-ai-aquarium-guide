
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Users, TrendingUp, AlertTriangle, DollarSign, UserCheck, UserX } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface SubscriptionMetrics {
  total_users: number;
  active_subscriptions: number;
  expired_subscriptions: number;
  expiring_soon: number;
  never_subscribed: number;
  revenue_at_risk: number;
}

export const SubscriptionMetrics: React.FC = () => {
  const { data: metrics, isLoading, error } = useQuery({
    queryKey: ['subscription-metrics'],
    queryFn: async (): Promise<SubscriptionMetrics> => {
      const { data, error } = await supabase.rpc('get_subscription_metrics');
      
      if (error) {
        console.error('Error fetching subscription metrics:', error);
        throw error;
      }
      
      return data?.[0] || {
        total_users: 0,
        active_subscriptions: 0,
        expired_subscriptions: 0,
        expiring_soon: 0,
        never_subscribed: 0,
        revenue_at_risk: 0
      };
    },
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Subscription Metrics</CardTitle>
          <CardDescription>Loading subscription data...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            <div className="h-4 bg-gray-200 rounded w-2/3"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Subscription Metrics</CardTitle>
          <CardDescription className="text-red-600">
            Error loading metrics: {error instanceof Error ? error.message : 'Unknown error'}
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  const conversionRate = metrics ? 
    ((metrics.active_subscriptions / Math.max(metrics.total_users, 1)) * 100).toFixed(1) : '0.0';

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Users</CardTitle>
          <Users className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{metrics?.total_users || 0}</div>
          <p className="text-xs text-muted-foreground">
            Registered users in system
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Active Subscriptions</CardTitle>
          <UserCheck className="h-4 w-4 text-green-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-green-600">
            {metrics?.active_subscriptions || 0}
          </div>
          <p className="text-xs text-muted-foreground">
            {conversionRate}% conversion rate
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Never Subscribed</CardTitle>
          <UserX className="h-4 w-4 text-gray-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-gray-600">
            {metrics?.never_subscribed || 0}
          </div>
          <p className="text-xs text-muted-foreground">
            Free tier users only
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Expired Subscriptions</CardTitle>
          <AlertTriangle className="h-4 w-4 text-red-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-red-600">
            {metrics?.expired_subscriptions || 0}
          </div>
          <p className="text-xs text-muted-foreground">
            Formerly subscribed users
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Expiring Soon</CardTitle>
          <TrendingUp className="h-4 w-4 text-orange-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-orange-600">
            {metrics?.expiring_soon || 0}
          </div>
          <p className="text-xs text-muted-foreground">
            Within next 7 days
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Revenue at Risk</CardTitle>
          <DollarSign className="h-4 w-4 text-red-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-red-600">
            ${(metrics?.revenue_at_risk || 0).toFixed(2)}
          </div>
          <p className="text-xs text-muted-foreground">
            From expiring subscriptions
          </p>
        </CardContent>
      </Card>
    </div>
  );
};
