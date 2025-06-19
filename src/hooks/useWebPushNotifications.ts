
import { useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useNotificationPreferences } from './useNotificationPreferences';
import { useMaintenanceScheduler } from './useMaintenanceScheduler';
import { useServiceWorker } from './useServiceWorker';

export interface NotificationData {
  type: 'due_task' | 'overdue_task' | 'critical_alert' | 'ai_insight';
  taskId?: string;
  title: string;
  message: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  timestamp: string;
  actions?: Array<{
    action: string;
    title: string;
    icon?: string;
  }>;
}

export const useWebPushNotifications = () => {
  const { user } = useAuth();
  const { preferences } = useNotificationPreferences();
  const { schedules, getUpcomingTasks, getOverdueTasks } = useMaintenanceScheduler();
  const { registration } = useServiceWorker();

  // Check for due and overdue tasks
  useEffect(() => {
    if (!user || !preferences.enabled || !registration) return;

    const checkTasks = () => {
      const now = new Date();
      const currentTime = now.toTimeString().slice(0, 5); // HH:MM format
      
      // Skip if in quiet hours
      if (preferences.quiet_hours_start && preferences.quiet_hours_end) {
        const quietStart = preferences.quiet_hours_start;
        const quietEnd = preferences.quiet_hours_end;
        
        if (quietStart > quietEnd) {
          // Quiet hours span midnight
          if (currentTime >= quietStart || currentTime <= quietEnd) {
            return;
          }
        } else {
          // Quiet hours don't span midnight
          if (currentTime >= quietStart && currentTime <= quietEnd) {
            return;
          }
        }
      }

      // Check for due tasks at preferred time
      if (preferences.due_tasks_enabled && currentTime === preferences.time_of_day) {
        const dueTasks = getUpcomingTasks(1); // Tasks due today
        
        if (dueTasks.length > 0) {
          sendNotification({
            type: 'due_task',
            title: `${dueTasks.length} Task${dueTasks.length > 1 ? 's' : ''} Due Today`,
            message: dueTasks.map(t => t.name).join(', '),
            priority: 'medium',
            timestamp: now.toISOString(),
            actions: [
              { action: 'view', title: 'View Tasks' },
              { action: 'snooze', title: 'Remind Later' },
            ],
          });
        }
      }

      // Check for overdue tasks
      if (preferences.overdue_tasks_enabled) {
        const overdueTasks = getOverdueTasks();
        
        overdueTasks.forEach(task => {
          const dueDate = new Date(task.next_due_date || '');
          const daysSinceOverdue = Math.floor((now.getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24));
          
          // Send escalating reminders
          if (preferences.escalation_intervals.includes(daysSinceOverdue * 24)) {
            sendNotification({
              type: 'overdue_task',
              taskId: task.id,
              title: 'Overdue Task',
              message: `${task.name} is ${daysSinceOverdue} day${daysSinceOverdue > 1 ? 's' : ''} overdue`,
              priority: 'high',
              timestamp: now.toISOString(),
              actions: [
                { action: 'complete', title: 'Mark Complete' },
                { action: 'snooze', title: 'Snooze 1 Day' },
                { action: 'view', title: 'View Details' },
              ],
            });
          }
        });
      }
    };

    // Check tasks every hour
    const interval = setInterval(checkTasks, 60 * 60 * 1000);
    
    // Initial check
    checkTasks();

    return () => clearInterval(interval);
  }, [user, preferences, schedules, registration]);

  const sendNotification = async (data: NotificationData) => {
    if (!registration || !registration.active) {
      console.warn('Service worker not active, cannot send notification');
      return;
    }

    try {
      // Send message to service worker to display notification
      registration.active.postMessage({
        type: 'SHOW_NOTIFICATION',
        data,
      });
    } catch (error) {
      console.error('Error sending notification:', error);
    }
  };

  const sendCriticalAlert = (message: string, details?: string) => {
    if (!preferences.critical_alerts_enabled) return;

    sendNotification({
      type: 'critical_alert',
      title: 'Critical Tank Alert',
      message,
      priority: 'urgent',
      timestamp: new Date().toISOString(),
      actions: [
        { action: 'view', title: 'View Details' },
        { action: 'dismiss', title: 'Dismiss' },
      ],
    });
  };

  const sendAIInsight = (insight: string) => {
    if (!preferences.ai_insights_enabled) return;

    sendNotification({
      type: 'ai_insight',
      title: 'AquaAI Insight',
      message: insight,
      priority: 'low',
      timestamp: new Date().toISOString(),
      actions: [
        { action: 'view', title: 'Learn More' },
        { action: 'dismiss', title: 'Dismiss' },
      ],
    });
  };

  return {
    sendNotification,
    sendCriticalAlert,
    sendAIInsight,
  };
};
