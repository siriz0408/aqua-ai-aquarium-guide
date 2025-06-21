
import React from 'react';
import { SubscriptionMetrics } from './SubscriptionMetrics';
import { ExpiringSubscriptions } from './ExpiringSubscriptions';

export const AdminDashboard: React.FC = () => {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Dashboard Overview</h2>
        <p className="text-muted-foreground">
          Monitor subscription metrics and user activity
        </p>
      </div>
      
      <SubscriptionMetrics />
      
      <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-2">
        <ExpiringSubscriptions />
        {/* Future: Add more monitoring widgets here */}
      </div>
    </div>
  );
};
