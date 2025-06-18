
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Clock, AlertTriangle } from 'lucide-react';
import { useCredits } from '@/hooks/useCredits';

interface TrialBannerProps {
  onUpgrade: () => void;
}

export const TrialBanner: React.FC<TrialBannerProps> = ({ onUpgrade }) => {
  const { getSubscriptionInfo } = useCredits();
  const subscriptionInfo = getSubscriptionInfo();

  // Only show for trial users who are NOT pro users
  if (!subscriptionInfo.isTrial || subscriptionInfo.tier === 'pro') {
    return null;
  }

  const hoursRemaining = Math.max(0, subscriptionInfo.trialHoursRemaining);
  const isExpired = hoursRemaining <= 0;
  const minutesRemaining = Math.floor((hoursRemaining % 1) * 60);

  const formatTimeRemaining = () => {
    if (isExpired) return 'Expired';
    
    const hours = Math.floor(hoursRemaining);
    if (hours > 0) {
      return `${hours}h ${minutesRemaining}m remaining`;
    } else {
      return `${minutesRemaining} minutes remaining`;
    }
  };

  return (
    <Card className={`mb-4 ${isExpired ? 'border-red-200 bg-red-50' : 'border-orange-200 bg-orange-50'}`}>
      <CardContent className="p-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {isExpired ? (
              <AlertTriangle className="h-4 w-4 text-red-600" />
            ) : (
              <Clock className="h-4 w-4 text-orange-600" />
            )}
            <div>
              <span className={`text-sm font-medium ${isExpired ? 'text-red-800' : 'text-orange-800'}`}>
                {isExpired ? 'Trial Expired' : 'Free Trial'}
              </span>
              <p className={`text-xs ${isExpired ? 'text-red-600' : 'text-orange-600'}`}>
                {isExpired 
                  ? 'Upgrade to continue using premium features'
                  : formatTimeRemaining()
                }
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant={isExpired ? "destructive" : "secondary"} className="text-xs">
              {isExpired ? 'Expired' : 'Trial'}
            </Badge>
            <Button 
              size="sm"
              onClick={onUpgrade}
              className={`text-xs px-3 py-1 h-7 ${isExpired ? 'bg-red-600 hover:bg-red-700' : ''}`}
            >
              {isExpired ? 'Upgrade Now' : 'Upgrade'}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
