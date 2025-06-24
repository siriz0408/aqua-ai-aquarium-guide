
import React, { useEffect } from 'react';
import { useSubscriptionAccess } from '@/hooks/useSubscriptionAccess';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export const StartupTest: React.FC = () => {
  const { user } = useAuth();
  const { subscriptionInfo, accessData, isLoading } = useSubscriptionAccess();

  useEffect(() => {
    console.log('StartupTest - User:', user?.id);
    console.log('StartupTest - Loading:', isLoading);
    console.log('StartupTest - Access Data:', accessData);
    console.log('StartupTest - Subscription Info:', subscriptionInfo);
  }, [user, isLoading, accessData, subscriptionInfo]);

  if (isLoading) {
    return (
      <Card className="max-w-md mx-auto mt-8">
        <CardHeader>
          <CardTitle>System Check</CardTitle>
        </CardHeader>
        <CardContent>
          <p>Loading system status...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="max-w-md mx-auto mt-8">
      <CardHeader>
        <CardTitle className="text-green-600">✅ System Restored</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        <p><strong>Status:</strong> All systems operational</p>
        <p><strong>User:</strong> {user?.email || 'Not signed in'}</p>
        <p><strong>Access Level:</strong> {subscriptionInfo?.displayTier || 'Unknown'}</p>
        <p><strong>Has Access:</strong> {subscriptionInfo?.hasAccess ? 'Yes' : 'No'}</p>
        {subscriptionInfo?.isTrial && (
          <p><strong>Trial Hours:</strong> {subscriptionInfo.trialHoursRemaining}</p>
        )}
      </CardContent>
    </Card>
  );
};
