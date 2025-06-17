
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
  paid_users: number;
  total_credits_used: number;
  total_credits_remaining: number;
}

interface UserSubscription {
  id: string;
  email: string;
  full_name: string;
  subscription_status: string;
  subscription_tier: string;
  free_credits_remaining: number;
  total_credits_used: number;
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
        .select('subscription_status, free_credits_remaining, total_credits_used');

      if (error) throw error;

      const stats: SubscriptionStats = {
        total_users: data.length,
        free_users: data.filter(u => u.subscription_status === 'free').length,
        paid_users: data.filter(u => u.subscription_status === 'active').length,
        total_credits_used: data.reduce((sum, u) => sum + (u.total_credits_used || 0), 0),
        total_credits_remaining: data.reduce((sum, u) => sum + (u.free_credits_remaining || 0), 0),
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
        .select('id, email, full_name, subscription_status, subscription_tier, free_credits_remaining, total_credits_used, subscription_start_date, subscription_end_date')
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
      expired: 'bg-red-100 text-red-800',
      cancelled: 'bg-yellow-100 text-yellow-800',
    };

    return (
      <Badge className={colors[status as keyof typeof colors] || colors.free}>
        {status}
      </Badge>
    );
  };

  const getTierBadge = (tier: string) => {
    const colors = {
      basic: 'bg-blue-100 text-blue-800',
      pro: 'bg-purple-100 text-purple-800',
      premium: 'bg-gold-100 text-gold-800',
    };

    return (
      <Badge variant="outline" className={colors[tier as keyof typeof colors] || colors.basic}>
        {tier}
      </Badge>
    );
  };

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
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
              <CardTitle className="text-sm font-medium">Paid Users</CardTitle>
              <CreditCard className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.paid_users}</div>
              <p className="text-xs text-muted-foreground">
                {((stats.paid_users / stats.total_users) * 100).toFixed(1)}% conversion
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Credits Used</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total_credits_used}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Credits Remaining</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total_credits_remaining}</div>
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
              <SelectItem value="expired">Expired</SelectItem>
              <SelectItem value="cancelled">Cancelled</SelectItem>
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
              <SelectItem value="basic">Basic</SelectItem>
              <SelectItem value="pro">Pro</SelectItem>
              <SelectItem value="premium">Premium</SelectItem>
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
                <TableHead>Credits</TableHead>
                <TableHead>Subscription Period</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary mx-auto"></div>
                  </TableCell>
                </TableRow>
              ) : subscriptions.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
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
                        <div>{subscription.free_credits_remaining} remaining</div>
                        <div className="text-muted-foreground">{subscription.total_credits_used} used</div>
                      </div>
                    </TableCell>
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
