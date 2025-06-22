
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Info } from 'lucide-react';

export const AdminTrialManagement: React.FC = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Trial Management</CardTitle>
        <CardDescription>
          Trial functionality has been removed in favor of 100% paywall
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Alert>
          <Info className="h-4 w-4" />
          <AlertDescription>
            This system now operates with a 100% paywall model. All users must have an active subscription to access premium features. 
            Trial functionality has been completely removed from the platform.
          </AlertDescription>
        </Alert>
      </CardContent>
    </Card>
  );
};
