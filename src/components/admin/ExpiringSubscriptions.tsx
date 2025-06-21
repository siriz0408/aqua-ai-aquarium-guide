
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { AlertTriangle, Calendar, Mail, RefreshCw } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface ExpiringSubscription {
  user_id: string;
  email: string;
  stripe_subscription_id: string;
  subscription_end_date: string;
  days_until_expiry: number;
}

export const ExpiringSubscriptions: React.FC = () => {
  const { toast } = useToast();
  
  const { data: expiringUsers, isLoading, error, refetch } = useQuery({
    queryKey: ['expiring-subscriptions'],
    queryFn: async (): Promise<ExpiringSubscription[]> => {
      const { data, error } = await supabase.rpc('get_expiring_subscriptions');
      
      if (error) {
        console.error('Error fetching expiring subscriptions:', error);
        throw error;
      }
      
      return data || [];
    },
    refetchInterval: 60000, // Refresh every minute
  });

  const handleRefresh = () => {
    refetch();
    toast({
      title: "Refreshed",
      description: "Expiring subscriptions data has been updated",
    });
  };

  const getBadgeVariant = (days: number) => {
    if (days <= 1) return 'destructive';
    if (days <= 3) return 'default';
    return 'secondary';
  };

  const getBadgeText = (days: number) => {
    if (days < 0) return 'Expired';
    if (days === 0) return 'Today';
    if (days === 1) return '1 day';
    return `${days} days`;
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Expiring Subscriptions</CardTitle>
          <CardDescription>Loading expiring subscription data...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center justify-between p-3 border rounded">
                <div className="space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-48"></div>
                  <div className="h-3 bg-gray-200 rounded w-32"></div>
                </div>
                <div className="h-6 bg-gray-200 rounded w-16"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Expiring Subscriptions</CardTitle>
          <CardDescription className="text-red-600">
            Error loading data: {error instanceof Error ? error.message : 'Unknown error'}
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-orange-600" />
              Expiring Subscriptions
            </CardTitle>
            <CardDescription>
              Subscriptions expiring within the next 7 days
            </CardDescription>
          </div>
          <Button variant="outline" size="sm" onClick={handleRefresh}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {!expiringUsers || expiringUsers.length === 0 ? (
          <div className="text-center py-8">
            <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">No subscriptions expiring soon</p>
            <p className="text-sm text-gray-400 mt-1">Great job on retention!</p>
          </div>
        ) : (
          <div className="space-y-4">
            {expiringUsers.map((user) => (
              <div key={user.user_id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <Mail className="h-4 w-4 text-gray-400" />
                    <span className="font-medium">{user.email}</span>
                  </div>
                  <div className="text-sm text-gray-500 space-y-1">
                    <div>Expires: {new Date(user.subscription_end_date).toLocaleDateString()}</div>
                    <div className="font-mono text-xs">
                      Subscription: {user.stripe_subscription_id}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={getBadgeVariant(user.days_until_expiry)}>
                    {getBadgeText(user.days_until_expiry)}
                  </Badge>
                </div>
              </div>
            ))}
            
            <div className="pt-4 border-t">
              <p className="text-sm text-gray-500 text-center">
                Total: {expiringUsers.length} subscription{expiringUsers.length !== 1 ? 's' : ''} expiring soon
              </p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
