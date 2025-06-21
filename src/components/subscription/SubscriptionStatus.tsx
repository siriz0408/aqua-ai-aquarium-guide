
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Crown, User, CheckCircle, AlertCircle } from 'lucide-react';
import { useSubscriptionAccess } from '@/hooks/useSubscriptionAccess';

interface SubscriptionStatusProps {
  onUpgrade?: () => void;
}

export const SubscriptionStatus: React.FC<SubscriptionStatusProps> = ({ onUpgrade }) => {
  const { hasAccess, isActive, isAdmin, tier, status, loading } = useSubscriptionAccess();

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-gray-200 rounded w-1/3"></div>
            <div className="h-8 bg-gray-200 rounded w-1/2"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const getStatusColor = () => {
    if (isAdmin) return 'bg-purple-500';
    if (isActive) return 'bg-green-500';
    return 'bg-gray-500';
  };

  const getStatusIcon = () => {
    if (isAdmin) return <Crown className="h-4 w-4" />;
    if (isActive) return <CheckCircle className="h-4 w-4" />;
    return <User className="h-4 w-4" />;
  };

  const getStatusText = () => {
    if (isAdmin) return 'Admin Access';
    if (isActive) return 'Pro Subscriber';
    return 'Free User';
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Subscription Status</span>
          <Badge className={`${getStatusColor()} text-white`}>
            {getStatusIcon()}
            <span className="ml-1">{getStatusText()}</span>
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-gray-500">Plan:</span>
            <p className="font-medium capitalize">{tier}</p>
          </div>
          <div>
            <span className="text-gray-500">Status:</span>
            <p className="font-medium capitalize">{status}</p>
          </div>
        </div>

        {hasAccess ? (
          <div className="flex items-center gap-2 text-green-600 bg-green-50 p-3 rounded-lg">
            <CheckCircle className="h-5 w-5" />
            <span className="font-medium">
              {isAdmin ? 'Full admin access to all features' : 'Access to premium features'}
            </span>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-orange-600 bg-orange-50 p-3 rounded-lg">
              <AlertCircle className="h-5 w-5" />
              <span className="font-medium">Limited to free features</span>
            </div>
            {onUpgrade && (
              <Button onClick={onUpgrade} className="w-full">
                Upgrade to Pro
              </Button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
