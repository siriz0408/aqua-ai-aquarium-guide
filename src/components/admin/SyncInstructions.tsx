
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { InfoIcon } from 'lucide-react';

export const SyncInstructions: React.FC = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <InfoIcon className="h-4 w-4" />
          Subscription Sync Instructions
        </CardTitle>
        <CardDescription>
          How to use the simplified subscription sync system
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Alert>
          <InfoIcon className="h-4 w-4" />
          <AlertDescription>
            <strong>Schema Simplified:</strong> We now use only the profiles table for subscription tracking. 
            All subscription data is centralized for better performance and maintainability.
          </AlertDescription>
        </Alert>

        <div className="space-y-3">
          <div>
            <h4 className="font-medium text-sm">Manual Sync Process:</h4>
            <ol className="list-decimal list-inside text-sm text-muted-foreground space-y-1 mt-2">
              <li>Get the user's email address from your user management system</li>
              <li>Find their Stripe Customer ID in the Stripe dashboard</li>
              <li>Optionally, get their Stripe Subscription ID for active subscriptions</li>
              <li>Use the sync form above to update their subscription status</li>
            </ol>
          </div>

          <div>
            <h4 className="font-medium text-sm">Subscription Status Values:</h4>
            <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1 mt-2">
              <li><code>active</code> or <code>trialing</code> → Sets user to Pro tier with active status</li>
              <li><code>canceled</code>, <code>past_due</code>, <code>unpaid</code>, <code>incomplete</code> → Sets user to Free tier with expired status</li>
            </ul>
          </div>

          <div>
            <h4 className="font-medium text-sm">What Gets Updated:</h4>
            <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1 mt-2">
              <li>User's subscription status (active/expired)</li>
              <li>User's subscription tier (pro/free)</li>
              <li>Stripe Customer ID and Subscription ID</li>
              <li>Subscription end date (for canceled subscriptions)</li>
              <li>Profile updated timestamp</li>
            </ul>
          </div>

          <div>
            <h4 className="font-medium text-sm">Webhook Integration:</h4>
            <p className="text-sm text-muted-foreground mt-2">
              The same sync function is used by Stripe webhooks for automatic updates. 
              All webhook events are tracked in the webhook_events table for monitoring.
            </p>
          </div>

          <div>
            <h4 className="font-medium text-sm">Performance Improvements:</h4>
            <p className="text-sm text-muted-foreground mt-2">
              The simplified schema includes optimized indexes for faster queries 
              on email, Stripe IDs, and subscription status fields. RLS policies have been 
              simplified to prevent recursion issues.
            </p>
          </div>
        </div>

        <Alert>
          <InfoIcon className="h-4 w-4" />
          <AlertDescription>
            <strong>Security:</strong> All sync operations use security definer functions 
            with proper RLS policies to ensure data integrity and access control.
          </AlertDescription>
        </Alert>
      </CardContent>
    </Card>
  );
};
