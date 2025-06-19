
import React from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { InfoIcon } from 'lucide-react';

export const SyncInstructionsAlert: React.FC = () => {
  return (
    <Alert>
      <InfoIcon className="h-4 w-4" />
      <AlertDescription>
        <strong>Simplified Schema:</strong> The database has been optimized with a single profiles table for subscription tracking. 
        Use the manual sync form for failed webhook events or direct Stripe data updates.
      </AlertDescription>
    </Alert>
  );
};
