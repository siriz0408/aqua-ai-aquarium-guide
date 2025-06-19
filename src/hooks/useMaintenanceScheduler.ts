
import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

export interface MaintenanceTemplate {
  id: string;
  name: string;
  description?: string;
  tank_type: string;
  frequency: string;
  base_interval_days: number;
  task_type: string;
  priority: string;
  required_tools: string[];
  estimated_time?: string;
  difficulty: string;
  instructions?: string;
  tips: string[];
  warnings: string[];
  equipment_dependent: boolean;
  equipment_types: string[];
  size_dependent: boolean;
  bioload_dependent: boolean;
  experience_modifier: Record<string, number>;
  maturity_modifier: Record<string, number>;
  created_at: string;
  updated_at: string;
}

export interface MaintenanceSchedule {
  id: string;
  user_id: string;
  tank_id?: string;
  template_id?: string;
  name: string;
  description?: string;
  frequency_days: number;
  next_due_date?: string;
  last_completed_date?: string;
  is_active: boolean;
  is_custom: boolean;
  custom_instructions?: string;
  custom_priority?: string;
  notifications_enabled: boolean;
  created_at: string;
  updated_at: string;
  template?: MaintenanceTemplate;
}

export interface MaintenanceEvent {
  id: string;
  user_id: string;
  schedule_id: string;
  tank_id?: string;
  scheduled_date: string;
  completed_date?: string;
  status: 'scheduled' | 'completed' | 'skipped' | 'overdue';
  notes?: string;
  actual_duration?: number;
  difficulty_rating?: number;
  created_at: string;
  updated_at: string;
  schedule?: MaintenanceSchedule;
}

export const useMaintenanceScheduler = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch maintenance templates
  const { data: templates = [], isLoading: templatesLoading } = useQuery({
    queryKey: ['maintenance_templates'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('maintenance_templates')
        .select('*')
        .order('frequency', { ascending: true });

      if (error) {
        console.error('Error fetching maintenance templates:', error);
        return [];
      }

      return data as MaintenanceTemplate[];
    },
  });

  // Fetch user's maintenance schedules
  const { data: schedules = [], isLoading: schedulesLoading } = useQuery({
    queryKey: ['maintenance_schedules'],
    queryFn: async () => {
      if (!user) return [];
      
      const { data, error } = await supabase
        .from('maintenance_schedules')
        .select(`
          *,
          template:maintenance_templates(*)
        `)
        .eq('user_id', user.id)
        .eq('is_active', true)
        .order('next_due_date', { ascending: true });

      if (error) {
        console.error('Error fetching maintenance schedules:', error);
        return [];
      }

      return data as MaintenanceSchedule[];
    },
    enabled: !!user,
  });

  // Fetch maintenance events
  const { data: events = [], isLoading: eventsLoading } = useQuery({
    queryKey: ['maintenance_events'],
    queryFn: async () => {
      if (!user) return [];
      
      const { data, error } = await supabase
        .from('maintenance_events')
        .select(`
          *,
          schedule:maintenance_schedules(
            *,
            template:maintenance_templates(*)
          )
        `)
        .eq('user_id', user.id)
        .order('scheduled_date', { ascending: false });

      if (error) {
        console.error('Error fetching maintenance events:', error);
        return [];
      }

      return data as MaintenanceEvent[];
    },
    enabled: !!user,
  });

  // Generate schedules for a tank
  const generateSchedulesMutation = useMutation({
    mutationFn: async ({ 
      tankId, 
      tankType, 
      tankSizeGallons, 
      userExperience = 'beginner', 
      tankAgeMonths = 0 
    }: {
      tankId: string;
      tankType: string;
      tankSizeGallons: number;
      userExperience?: string;
      tankAgeMonths?: number;
    }) => {
      if (!user) throw new Error('User not authenticated');

      const { error } = await supabase.rpc('generate_tank_maintenance_schedule', {
        p_user_id: user.id,
        p_tank_id: tankId,
        p_tank_type: tankType,
        p_tank_size_gallons: tankSizeGallons,
        p_user_experience: userExperience,
        p_tank_age_months: tankAgeMonths
      });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['maintenance_schedules'] });
      toast({
        title: "Maintenance schedule generated",
        description: "Your intelligent maintenance schedule has been created based on your tank characteristics.",
      });
    },
    onError: (error) => {
      console.error('Error generating maintenance schedule:', error);
      toast({
        title: "Error",
        description: "Failed to generate maintenance schedule. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Complete a maintenance task
  const completeTaskMutation = useMutation({
    mutationFn: async ({ 
      scheduleId, 
      completionDate = new Date().toISOString().split('T')[0], 
      notes 
    }: {
      scheduleId: string;
      completionDate?: string;
      notes?: string;
    }) => {
      const { error } = await supabase.rpc('complete_maintenance_task', {
        p_schedule_id: scheduleId,
        p_completion_date: completionDate,
        p_notes: notes
      });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['maintenance_schedules'] });
      queryClient.invalidateQueries({ queryKey: ['maintenance_events'] });
      toast({
        title: "Task completed",
        description: "Maintenance task has been marked as completed and next occurrence scheduled.",
      });
    },
    onError: (error) => {
      console.error('Error completing maintenance task:', error);
      toast({
        title: "Error",
        description: "Failed to complete maintenance task.",
        variant: "destructive",
      });
    },
  });

  // Update schedule
  const updateScheduleMutation = useMutation({
    mutationFn: async ({ scheduleId, updates }: {
      scheduleId: string;
      updates: Partial<MaintenanceSchedule>;
    }) => {
      const { error } = await supabase
        .from('maintenance_schedules')
        .update(updates)
        .eq('id', scheduleId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['maintenance_schedules'] });
      toast({
        title: "Schedule updated",
        description: "Maintenance schedule has been updated successfully.",
      });
    },
    onError: (error) => {
      console.error('Error updating maintenance schedule:', error);
      toast({
        title: "Error",
        description: "Failed to update maintenance schedule.",
        variant: "destructive",
      });
    },
  });

  // Create custom schedule
  const createCustomScheduleMutation = useMutation({
    mutationFn: async (scheduleData: {
      name: string;
      description?: string;
      frequency_days: number;
      tank_id?: string;
      custom_instructions?: string;
      custom_priority?: string;
    }) => {
      if (!user) throw new Error('User not authenticated');

      const { error } = await supabase
        .from('maintenance_schedules')
        .insert({
          ...scheduleData,
          user_id: user.id,
          is_custom: true,
          next_due_date: new Date(Date.now() + scheduleData.frequency_days * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
        });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['maintenance_schedules'] });
      toast({
        title: "Custom schedule created",
        description: "Your custom maintenance schedule has been created.",
      });
    },
    onError: (error) => {
      console.error('Error creating custom schedule:', error);
      toast({
        title: "Error",
        description: "Failed to create custom schedule.",
        variant: "destructive",
      });
    },
  });

  // Helper functions
  const getUpcomingTasks = (days = 7) => {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() + days);
    
    return schedules.filter(schedule => {
      if (!schedule.next_due_date) return false;
      const dueDate = new Date(schedule.next_due_date);
      return dueDate <= cutoffDate;
    });
  };

  const getOverdueTasks = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    return schedules.filter(schedule => {
      if (!schedule.next_due_date) return false;
      const dueDate = new Date(schedule.next_due_date);
      return dueDate < today;
    });
  };

  const getTasksByFrequency = () => {
    const grouped = schedules.reduce((acc, schedule) => {
      const frequency = schedule.template?.frequency || 'custom';
      if (!acc[frequency]) acc[frequency] = [];
      acc[frequency].push(schedule);
      return acc;
    }, {} as Record<string, MaintenanceSchedule[]>);

    return grouped;
  };

  return {
    templates,
    schedules,
    events,
    templatesLoading,
    schedulesLoading,
    eventsLoading,
    generateSchedules: generateSchedulesMutation.mutate,
    completeTask: completeTaskMutation.mutate,
    updateSchedule: updateScheduleMutation.mutate,
    createCustomSchedule: createCustomScheduleMutation.mutate,
    isGeneratingSchedules: generateSchedulesMutation.isPending,
    isCompletingTask: completeTaskMutation.isPending,
    isUpdatingSchedule: updateScheduleMutation.isPending,
    isCreatingCustomSchedule: createCustomScheduleMutation.isPending,
    getUpcomingTasks,
    getOverdueTasks,
    getTasksByFrequency,
  };
};
