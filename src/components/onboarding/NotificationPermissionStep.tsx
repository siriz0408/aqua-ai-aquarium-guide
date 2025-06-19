
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useNotificationPermission } from '@/hooks/useNotificationPermission';
import { Bell, BellOff, CheckCircle, X } from 'lucide-react';

interface NotificationPermissionStepProps {
  onComplete: () => void;
  onSkip: () => void;
}

const NotificationPermissionStep: React.FC<NotificationPermissionStepProps> = ({
  onComplete,
  onSkip,
}) => {
  const { permission, requestPermission, isSupported, isRequesting } = useNotificationPermission();

  const handleEnableNotifications = async () => {
    const result = await requestPermission();
    if (result === 'granted') {
      onComplete();
    }
  };

  if (!isSupported) {
    return (
      <Card>
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 p-3 bg-gray-100 rounded-full w-fit">
            <BellOff className="h-8 w-8 text-gray-600" />
          </div>
          <CardTitle>Notifications Not Available</CardTitle>
          <CardDescription>
            Your browser doesn't support push notifications, but you can still use all other features of AquaAI.
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center">
          <Button onClick={onComplete} className="w-full">
            Continue Without Notifications
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (permission === 'granted') {
    return (
      <Card>
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 p-3 bg-green-100 rounded-full w-fit">
            <CheckCircle className="h-8 w-8 text-green-600" />
          </div>
          <CardTitle>Notifications Enabled!</CardTitle>
          <CardDescription>
            You'll receive helpful reminders and alerts to keep your aquarium healthy.
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center">
          <Button onClick={onComplete} className="w-full">
            Continue Setup
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="text-center">
        <div className="mx-auto mb-4 p-3 bg-blue-100 rounded-full w-fit">
          <Bell className="h-8 w-8 text-blue-600" />
        </div>
        <CardTitle>Stay on Top of Tank Maintenance</CardTitle>
        <CardDescription>
          Get timely reminders for water changes, testing, and equipment maintenance. 
          Never miss an important task that keeps your aquarium thriving.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-3">
          <div className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg">
            <div className="p-1 bg-blue-100 rounded">
              <Bell className="h-4 w-4 text-blue-600" />
            </div>
            <div>
              <h4 className="font-medium text-sm">Daily Reminders</h4>
              <p className="text-sm text-muted-foreground">
                Get notified about tasks due today at your preferred time
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3 p-3 bg-orange-50 rounded-lg">
            <div className="p-1 bg-orange-100 rounded">
              <Bell className="h-4 w-4 text-orange-600" />
            </div>
            <div>
              <h4 className="font-medium text-sm">Overdue Alerts</h4>
              <p className="text-sm text-muted-foreground">
                Escalating reminders for tasks that need immediate attention
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3 p-3 bg-red-50 rounded-lg">
            <div className="p-1 bg-red-100 rounded">
              <Bell className="h-4 w-4 text-red-600" />
            </div>
            <div>
              <h4 className="font-medium text-sm">Critical Alerts</h4>
              <p className="text-sm text-muted-foreground">
                Urgent notifications for water parameters and equipment issues
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <Button 
            onClick={handleEnableNotifications} 
            className="w-full"
            disabled={isRequesting}
          >
            {isRequesting ? 'Requesting Permission...' : 'Enable Notifications'}
          </Button>
          
          <Button 
            variant="ghost" 
            onClick={onSkip}
            className="w-full"
            disabled={isRequesting}
          >
            Skip for Now
          </Button>
        </div>

        <p className="text-xs text-muted-foreground text-center">
          You can change notification preferences anytime in your account settings
        </p>
      </CardContent>
    </Card>
  );
};

export default NotificationPermissionStep;
