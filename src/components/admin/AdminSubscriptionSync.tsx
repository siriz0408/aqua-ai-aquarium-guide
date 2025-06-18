
import React, { useState } from 'react';
import { Zap } from 'lucide-react';
import { ManualSubscriptionSyncForm } from './ManualSubscriptionSyncForm';
import { UserAccessRefreshForm } from './UserAccessRefreshForm';
import { SyncOperationResult } from './SyncOperationResult';
import { SyncInstructionsAlert } from './SyncInstructionsAlert';

export const AdminSubscriptionSync: React.FC = () => {
  const [lastResult, setLastResult] = useState<any>(null);

  const handleOperationResult = (result: any) => {
    setLastResult(result);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Zap className="h-5 w-5 text-blue-600" />
        <h2 className="text-2xl font-bold">Subscription Sync Tools</h2>
      </div>
      
      <div className="grid gap-6 md:grid-cols-2">
        <ManualSubscriptionSyncForm onResult={handleOperationResult} />
        <UserAccessRefreshForm onResult={handleOperationResult} />
      </div>

      <SyncOperationResult result={lastResult} />
      <SyncInstructionsAlert />
    </div>
  );
};
