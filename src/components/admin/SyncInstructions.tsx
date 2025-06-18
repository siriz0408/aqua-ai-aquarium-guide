
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export const SyncInstructions: React.FC = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Sync Instructions</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3 text-sm">
          <div>
            <strong>1. Get Stripe Customer ID:</strong>
            <p className="text-gray-600">
              Go to your Stripe Dashboard → Customers → Search by email → Copy Customer ID (starts with "cus_")
            </p>
          </div>
          <div>
            <strong>2. Get Subscription ID (if applicable):</strong>
            <p className="text-gray-600">
              In the customer's details, find their subscription and copy the ID (starts with "sub_")
            </p>
          </div>
          <div>
            <strong>3. Choose Status:</strong>
            <p className="text-gray-600">
              Select the current status of the subscription as shown in Stripe
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
