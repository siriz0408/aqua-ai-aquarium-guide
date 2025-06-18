
import React from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';

export const SyncInstructionsAlert: React.FC = () => {
  return (
    <Alert>
      <AlertCircle className="h-4 w-4" />
      <AlertDescription>
        <strong>Usage Instructions:</strong>
        <ul className="mt-2 space-y-1 text-sm">
          <li>• Use Manual Sync when Stripe webhooks fail to update user subscriptions</li>
          <li>• Find Stripe Customer/Subscription IDs in your Stripe dashboard</li>
          <li>• Use Refresh Access to force-check a user's current access level</li>
          <li>• All operations are logged for audit purposes</li>
        </ul>
      </AlertDescription>
    </Alert>
  );
};
