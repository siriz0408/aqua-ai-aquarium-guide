
import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

export interface TaskStep {
  id: string;
  description: string;
  completed: boolean;
  notes?: string;
}

export interface TaskResource {
  id: string;
  title: string;
  url?: string;
  type: 'link' | 'image' | 'document' | 'video';
  description?: string;
}

export interface Task {
  id: string;
  user_id: string;
  title: string;
  description?: string;
  task_type: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled';
  frequency?: string;
  due_date?: string;
  list_id?: string;
  conversation_id?: string;
  detailed_instructions?: string;
  steps?: TaskStep[];
  estimated_time?: string;
  difficulty?: 'beginner' | 'intermediate' | 'advanced';
  resources?: TaskResource[];
  tips?: string[];
  warnings?: string[];
  required_tools?: string[];
  created_at: string;
  updated_at: string;
}

export interface TaskList {
  id: string;
  user_id: string;
  name: string;
  description?: string;
  list_type: string;
  color: string;
  created_at: string;
  updated_at: string;
}

interface CreateTaskData {
  title: string;
  description?: string;
  task_type: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  conversation_id?: string;
  detailed_instructions?: string;
  steps?: TaskStep[];
  estimated_time?: string;
  difficulty?: 'beginner' | 'intermediate' | 'advanced';
  resources?: TaskResource[];
  tips?: string[];
  warnings?: string[];
  required_tools?: string[];
}

// Helper function to convert database row to Task
const convertToTask = (row: any): Task => {
  return {
    id: row.id,
    user_id: row.user_id,
    title: row.title,
    description: row.description,
    task_type: row.task_type,
    priority: row.priority,
    status: row.status,
    frequency: row.frequency,
    due_date: row.due_date,
    list_id: row.list_id,
    conversation_id: row.conversation_id,
    detailed_instructions: row.detailed_instructions,
    steps: Array.isArray(row.steps) ? row.steps as TaskStep[] : [],
    estimated_time: row.estimated_time,
    difficulty: row.difficulty,
    resources: Array.isArray(row.resources) ? row.resources as TaskResource[] : [],
    tips: Array.isArray(row.tips) ? row.tips : [],
    warnings: Array.isArray(row.warnings) ? row.warnings : [],
    required_tools: Array.isArray(row.required_tools) ? row.required_tools : [],
    created_at: row.created_at,
    updated_at: row.updated_at,
  };
};

export const useTasks = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch tasks
  const { data: tasks = [], isLoading: tasksLoading } = useQuery({
    queryKey: ['tasks'],
    queryFn: async () => {
      if (!user) return [];
      
      const { data, error } = await supabase
        .from('tasks')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching tasks:', error);
        return [];
      }

      return data ? data.map(convertToTask) : [];
    },
    enabled: !!user,
  });

  // Fetch task lists
  const { data: taskLists = [], isLoading: taskListsLoading } = useQuery({
    queryKey: ['task_lists'],
    queryFn: async () => {
      if (!user) return [];
      
      const { data, error } = await supabase
        .from('task_lists')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching task lists:', error);
        return [];
      }

      return data as TaskList[];
    },
    enabled: !!user,
  });

  // Create task mutation
  const createTaskMutation = useMutation({
    mutationFn: async (taskData: CreateTaskData) => {
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('tasks')
        .insert({
          title: taskData.title,
          description: taskData.description,
          task_type: taskData.task_type,
          priority: taskData.priority,
          conversation_id: taskData.conversation_id,
          detailed_instructions: taskData.detailed_instructions,
          steps: taskData.steps || [],
          estimated_time: taskData.estimated_time,
          difficulty: taskData.difficulty,
          resources: taskData.resources || [],
          tips: taskData.tips || [],
          warnings: taskData.warnings || [],
          required_tools: taskData.required_tools || [],
          user_id: user.id,
        })
        .select()
        .single();

      if (error) throw error;
      return convertToTask(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      toast({
        title: "Task created",
        description: "Task has been added successfully.",
      });
    },
    onError: (error) => {
      console.error('Error creating task:', error);
      toast({
        title: "Error",
        description: "Failed to create task. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Update task mutation
  const updateTaskMutation = useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Task> & { id: string }) => {
      const { data, error } = await supabase
        .from('tasks')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return convertToTask(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
    },
    onError: (error) => {
      console.error('Error updating task:', error);
      toast({
        title: "Error",
        description: "Failed to update task.",
        variant: "destructive",
      });
    },
  });

  // Delete task mutation
  const deleteTaskMutation = useMutation({
    mutationFn: async (taskId: string) => {
      const { error } = await supabase
        .from('tasks')
        .delete()
        .eq('id', taskId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      toast({
        title: "Task deleted",
        description: "Task has been removed successfully.",
      });
    },
    onError: (error) => {
      console.error('Error deleting task:', error);
      toast({
        title: "Error",
        description: "Failed to delete task.",
        variant: "destructive",
      });
    },
  });

  return {
    tasks,
    taskLists,
    tasksLoading,
    taskListsLoading,
    createTask: createTaskMutation.mutate,
    updateTask: updateTaskMutation.mutate,
    deleteTask: deleteTaskMutation.mutate,
    isCreating: createTaskMutation.isPending,
    isUpdating: updateTaskMutation.isPending,
    isDeleting: deleteTaskMutation.isPending,
  };
};
