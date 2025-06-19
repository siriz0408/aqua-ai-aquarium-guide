
import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';

export interface NotificationPermissionState {
  permission: NotificationPermission;
  isSupported: boolean;
  isRequesting: boolean;
}

export const useNotificationPermission = () => {
  const { toast } = useToast();
  const [state, setState] = useState<NotificationPermissionState>({
    permission: 'default',
    isSupported: 'Notification' in window && 'serviceWorker' in navigator,
    isRequesting: false,
  });

  useEffect(() => {
    if (state.isSupported) {
      setState(prev => ({
        ...prev,
        permission: Notification.permission,
      }));
    }
  }, [state.isSupported]);

  const requestPermission = async (): Promise<NotificationPermission> => {
    if (!state.isSupported) {
      toast({
        title: "Notifications not supported",
        description: "Your browser doesn't support notifications",
        variant: "destructive",
      });
      return 'denied';
    }

    if (state.permission === 'granted') {
      return 'granted';
    }

    setState(prev => ({ ...prev, isRequesting: true }));

    try {
      const permission = await Notification.requestPermission();
      
      setState(prev => ({
        ...prev,
        permission,
        isRequesting: false,
      }));

      if (permission === 'granted') {
        toast({
          title: "Notifications enabled",
          description: "You'll receive maintenance reminders and alerts",
        });
      } else {
        toast({
          title: "Notifications disabled",
          description: "You can enable them later in your browser settings",
          variant: "destructive",
        });
      }

      return permission;
    } catch (error) {
      console.error('Error requesting notification permission:', error);
      setState(prev => ({ ...prev, isRequesting: false }));
      
      toast({
        title: "Error",
        description: "Failed to request notification permission",
        variant: "destructive",
      });
      
      return 'denied';
    }
  };

  return {
    ...state,
    requestPermission,
  };
};
