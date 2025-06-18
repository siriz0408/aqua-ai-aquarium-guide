
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AdminSubscriptionSync } from './AdminSubscriptionSync';
import { SubscriptionStatusChecker } from './SubscriptionStatusChecker';
import { CreditCard, Search, RefreshCw } from 'lucide-react';

export const AdminSubscriptionManagement: React.FC = () => {
  return (
    <div className="space-y-6">
      <Tabs defaultValue="status" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="status" className="flex items-center gap-2">
            <Search className="h-4 w-4" />
            Status Checker
          </TabsTrigger>
          <TabsTrigger value="sync" className="flex items-center gap-2">
            <RefreshCw className="h-4 w-4" />
            Manual Sync
          </TabsTrigger>
        </TabsList>

        <TabsContent value="status">
          <SubscriptionStatusChecker />
        </TabsContent>

        <TabsContent value="sync">
          <AdminSubscriptionSync />
        </TabsContent>
      </Tabs>
    </div>
  );
};
