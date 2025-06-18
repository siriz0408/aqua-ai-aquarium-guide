
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AdminSubscriptionSync } from './AdminSubscriptionSync';
import { SubscriptionStatusChecker } from './SubscriptionStatusChecker';
import { SubscriptionSyncTools } from './SubscriptionSyncTools';
import { StripeDataLookup } from './StripeDataLookup';
import { CreditCard, Search, RefreshCw, Settings, Database } from 'lucide-react';

export const AdminSubscriptionManagement: React.FC = () => {
  return (
    <div className="space-y-6">
      <Tabs defaultValue="status" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="status" className="flex items-center gap-2">
            <Search className="h-4 w-4" />
            Status Check
          </TabsTrigger>
          <TabsTrigger value="sync" className="flex items-center gap-2">
            <RefreshCw className="h-4 w-4" />
            Auto Sync
          </TabsTrigger>
          <TabsTrigger value="manual" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            Manual Tools
          </TabsTrigger>
          <TabsTrigger value="lookup" className="flex items-center gap-2">
            <Database className="h-4 w-4" />
            Stripe Lookup
          </TabsTrigger>
        </TabsList>

        <TabsContent value="status">
          <SubscriptionStatusChecker />
        </TabsContent>

        <TabsContent value="sync">
          <AdminSubscriptionSync />
        </TabsContent>

        <TabsContent value="manual">
          <SubscriptionSyncTools />
        </TabsContent>

        <TabsContent value="lookup">
          <StripeDataLookup />
        </TabsContent>
      </Tabs>
    </div>
  );
};
