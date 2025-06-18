
import React from 'react';
import { ManualSyncForm } from './ManualSyncForm';
import { SyncInstructions } from './SyncInstructions';

export const SubscriptionSyncTools: React.FC = () => {
  return (
    <div className="space-y-6">
      <ManualSyncForm />
      <SyncInstructions />
    </div>
  );
};
