
import { useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useWebPushNotifications } from './useWebPushNotifications';
import { useNotificationPreferences } from './useNotificationPreferences';
import { useServiceWorker } from './useServiceWorker';

export const useNotificationSystem = () => {
  const { user } = useAuth();
  const { preferences } = useNotificationPreferences();
  const { registration } = useServiceWorker();
  const webPushNotifications = useWebPushNotifications();

  // Initialize notification system when user is logged in and service worker is ready
  useEffect(() => {
    if (!user || !registration || !preferences.enabled) {
      return;
    }

    console.log('Notification system initialized for user:', user.id);
    
    // The useWebPushNotifications hook already handles periodic checks
    // This is just for initialization logging
  }, [user, registration, preferences.enabled]);

  return {
    ...webPushNotifications,
    isReady: !!(user && registration && preferences.enabled),
  };
};
