
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { CreditCard, Users, TrendingUp, DollarSign } from 'lucide-react';

interface SubscriptionStats {
  total_users: number;
  free_users: number;
  pro_users: number;
}

interface UserSubscription {
  id: string;
  email: string;
  full_name: string;
  subscription_status: string;
  subscription_tier: string;
  subscription_start_date: string | null;
  subscription_end_date: string | null;
}

export const AdminSubscriptionManagement: React.FC = () => {
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterTier, setFilterTier] = useState<string>('all');

  // Fetch subscription statistics
  const { data: stats } = useQuery({
    queryKey: ['admin-subscription-stats'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('subscription_status, subscription_tier');

      if (error) throw error;

      const stats: SubscriptionStats = {
        total_users: data.length,
        free_users: data.filter(u => u.subscription_tier === 'free').length,
        pro_users: data.filter(u => u.subscription_tier === 'pro' && u.subscription_status === 'active').length,
      };

      return stats;
    },
  });

  // Fetch user subscriptions with filters
  const { data: subscriptions = [], isLoading } = useQuery({
    queryKey: ['admin-subscriptions', filterStatus, filterTier],
    queryFn: async () => {
      let query = supabase
        .from('profiles')
        .select('id, email, full_name, subscription_status, subscription_tier, subscription_start_date, subscription_end_date')
        .order('created_at', { ascending: false });

      if (filterStatus !== 'all') {
        query = query.eq('subscription_status', filterStatus);
      }

      if (filterTier !== 'all') {
        query = query.eq('subscription_tier', filterTier);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as UserSubscription[];
    },
  });

  const getStatusBadge = (status: string) => {
    const colors = {
      active: 'bg-green-100 text-green-800',
      free: 'bg-gray-100 text-gray-800',
    };

    return (
      <Badge className={colors[status as keyof typeof colors] || colors.free}>
        {status}
      </Badge>
    );
  };

  const getTierBadge = (tier: string) => {
    const colors = {
      free: 'bg-blue-100 text-blue-800',
      pro: 'bg-purple-100 text-purple-800',
    };

    return (
      <Badge variant="outline" className={colors[tier as keyof typeof colors] || colors.free}>
        {tier}
      </Badge>
    );
  };

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Users</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total_users}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pro Users</CardTitle>
              <CreditCard className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.pro_users}</div>
              <p className="text-xs text-muted-foreground">
                {stats.total_users > 0 ? ((stats.pro_users / stats.total_users) * 100).toFixed(1) : 0}% conversion
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Free Users</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.free_users}</div>
              <p className="text-xs text-muted-foreground">
                {stats.total_users > 0 ? ((stats.free_users / stats.total_users) * 100).toFixed(1) : 0}% of users
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filters */}
      <div className="flex items-center gap-4">
        <div className="space-y-2">
          <label className="text-sm font-medium">Status</label>
          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="w-[180px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="free">Free</SelectItem>
              <SelectItem value="active">Active</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium">Tier</label>
          <Select value={filterTier} onValueChange={setFilterTier}>
            <SelectTrigger className="w-[180px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Tiers</SelectItem>
              <SelectItem value="free">Free</SelectItem>
              <SelectItem value="pro">Pro</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Subscriptions Table */}
      <Card>
        <CardHeader>
          <CardTitle>User Subscriptions</CardTitle>
          <CardDescription>
            Monitor and manage user subscription details
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Tier</TableHead>
                <TableHead>Subscription Period</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-8">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary mx-auto"></div>
                  </TableCell>
                </TableRow>
              ) : subscriptions.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                    No subscriptions found
                  </TableCell>
                </TableRow>
              ) : (
                subscriptions.map((subscription) => (
                  <TableRow key={subscription.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{subscription.full_name || 'No name'}</div>
                        <div className="text-sm text-muted-foreground">{subscription.email}</div>
                      </div>
                    </TableCell>
                    <TableCell>{getStatusBadge(subscription.subscription_status)}</TableCell>
                    <TableCell>{getTierBadge(subscription.subscription_tier)}</TableCell>
                    <TableCell>
                      <div className="text-sm">
                        {subscription.subscription_start_date && subscription.subscription_end_date ? (
                          <div>
                            <div>{new Date(subscription.subscription_start_date).toLocaleDateString()}</div>
                            <div className="text-muted-foreground">
                              to {new Date(subscription.subscription_end_date).toLocaleDateString()}
                            </div>
                          </div>
                        ) : (
                          <span className="text-muted-foreground">No subscription period</span>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};
