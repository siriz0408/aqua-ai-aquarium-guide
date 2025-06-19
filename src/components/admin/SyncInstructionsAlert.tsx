
import React from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { InfoIcon } from 'lucide-react';

export const SyncInstructionsAlert: React.FC = () => {
  return (
    <Alert>
      <InfoIcon className="h-4 w-4" />
      <AlertDescription>
        <strong>Simplified Schema Active:</strong> The database has been optimized with the profiles table 
        as the single source of truth for subscription tracking. Use the manual sync form for failed 
        webhook events or direct Stripe data updates.
      </AlertDescription>
    </Alert>
  );
};
