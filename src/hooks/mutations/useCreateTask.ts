
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { createTask } from '@/services/taskService';
import { CreateTaskData } from '@/types/tasks';

export const useCreateTask = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (taskData: CreateTaskData) => {
      if (!user) throw new Error('User not authenticated');
      return createTask(taskData, user.id);
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      
      // Analytics tracking
      console.log('Task created successfully:', {
        taskId: data.id,
        title: data.title,
        type: data.task_type,
        priority: data.priority,
        isRecurring: data.is_recurring,
        hasConversation: !!data.conversation_id,
        hasDueDate: !!data.due_date,
        timestamp: new Date().toISOString()
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
};
