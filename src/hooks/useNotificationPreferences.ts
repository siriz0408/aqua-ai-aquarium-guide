
import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

export interface NotificationPreferences {
  id: string;
  user_id: string;
  enabled: boolean;
  time_of_day: string; // HH:MM format
  task_priority_threshold: 'low' | 'medium' | 'high' | 'urgent';
  group_notifications: boolean;
  due_tasks_enabled: boolean;
  overdue_tasks_enabled: boolean;
  critical_alerts_enabled: boolean;
  ai_insights_enabled: boolean;
  snooze_duration_hours: number;
  escalation_intervals: number[]; // Hours between escalating reminders
  quiet_hours_start?: string; // HH:MM format
  quiet_hours_end?: string; // HH:MM format
  created_at: string;
  updated_at: string;
}

const defaultPreferences = {
  enabled: true,
  time_of_day: '09:00',
  task_priority_threshold: 'medium' as const,
  group_notifications: true,
  due_tasks_enabled: true,
  overdue_tasks_enabled: true,
  critical_alerts_enabled: true,
  ai_insights_enabled: true,
  snooze_duration_hours: 24,
  escalation_intervals: [24, 48, 72], // 1, 2, 3 days
  quiet_hours_start: '22:00',
  quiet_hours_end: '07:00',
};

export const useNotificationPreferences = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch user's notification preferences
  const { data: preferences, isLoading } = useQuery({
    queryKey: ['notification_preferences'],
    queryFn: async () => {
      if (!user) return null;
      
      const { data, error } = await supabase
        .from('notification_preferences')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching notification preferences:', error);
        throw error;
      }

      return data as NotificationPreferences | null;
    },
    enabled: !!user,
  });

  // Update preferences mutation
  const updatePreferencesMutation = useMutation({
    mutationFn: async (updates: Partial<NotificationPreferences>) => {
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('notification_preferences')
        .upsert({
          user_id: user.id,
          ...defaultPreferences,
          ...updates,
          updated_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notification_preferences'] });
      toast({
        title: "Preferences updated",
        description: "Your notification preferences have been saved",
      });
    },
    onError: (error) => {
      console.error('Error updating notification preferences:', error);
      toast({
        title: "Error",
        description: "Failed to update notification preferences",
        variant: "destructive",
      });
    },
  });

  const currentPreferences = preferences || defaultPreferences;

  return {
    preferences: currentPreferences,
    isLoading,
    updatePreferences: updatePreferencesMutation.mutate,
    isUpdating: updatePreferencesMutation.isPending,
  };
};
