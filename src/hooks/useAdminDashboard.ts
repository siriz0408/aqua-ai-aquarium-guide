
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export const useAdminDashboard = () => {
  const dashboardStatsQuery = useQuery({
    queryKey: ['admin-dashboard-stats'],
    queryFn: async () => {
      const [usersResult, subscriptionsResult, ticketsResult, revenueResult] = await Promise.all([
        // Total users
        supabase.from('profiles').select('id', { count: 'exact' }),
        
        // Active subscriptions
        supabase.from('profiles').select('id', { count: 'exact' }).neq('subscription_status', 'free'),
        
        // Open tickets
        supabase.from('support_tickets').select('id', { count: 'exact' }).eq('status', 'open'),
        
        // Monthly revenue (simplified - would need more complex logic for real revenue)
        supabase.from('profiles').select('subscription_tier').neq('subscription_status', 'free')
      ]);

      const revenue = revenueResult.data?.reduce((total, profile) => {
        return total + (profile.subscription_tier === 'premium' ? 19.99 : 9.99);
      }, 0) || 0;

      return {
        totalUsers: usersResult.count || 0,
        activeSubscriptions: subscriptionsResult.count || 0,
        openTickets: ticketsResult.count || 0,
        monthlyRevenue: revenue
      };
    }
  });

  const recentActivityQuery = useQuery({
    queryKey: ['admin-recent-activity'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('admin_activity_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) throw error;
      return data;
    }
  });

  return {
    dashboardStats: dashboardStatsQuery.data,
    recentActivity: recentActivityQuery.data,
    isLoading: dashboardStatsQuery.isLoading || recentActivityQuery.isLoading,
    refetch: () => {
      dashboardStatsQuery.refetch();
      recentActivityQuery.refetch();
    }
  };
};
