
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Lock, Crown } from 'lucide-react';
import { useSubscriptionAccess } from '@/hooks/useSubscriptionAccess';

interface SubscriptionGateProps {
  children: React.ReactNode;
  feature?: string;
  onUpgrade?: () => void;
  fallback?: React.ReactNode;
}

export const SubscriptionGate: React.FC<SubscriptionGateProps> = ({ 
  children, 
  feature = 'this feature',
  onUpgrade,
  fallback
}) => {
  const { hasAccess, loading } = useSubscriptionAccess();

  if (loading) {
    return (
      <div className="animate-pulse space-y-4">
        <div className="h-32 bg-gray-200 rounded"></div>
      </div>
    );
  }

  if (hasAccess) {
    return <>{children}</>;
  }

  if (fallback) {
    return <>{fallback}</>;
  }

  return (
    <Card className="border-2 border-dashed border-gray-300">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-gray-600">
          <Lock className="h-5 w-5" />
          Premium Feature
        </CardTitle>
      </CardHeader>
      <CardContent className="text-center space-y-4">
        <div className="flex justify-center">
          <Crown className="h-16 w-16 text-gray-400" />
        </div>
        <div>
          <h3 className="font-semibold text-lg mb-2">Upgrade Required</h3>
          <p className="text-gray-600 mb-4">
            You need a Pro subscription to access {feature}.
          </p>
          {onUpgrade && (
            <Button onClick={onUpgrade} size="lg">
              Upgrade to Pro
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
