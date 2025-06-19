
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { completeRecurringTask } from '@/services/taskService';

export const useCompleteRecurringTask = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ taskId, skipOccurrence = false }: { taskId: string; skipOccurrence?: boolean }) => {
      return completeRecurringTask(taskId, skipOccurrence);
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      
      if (variables.skipOccurrence) {
        toast({
          title: "Task skipped",
          description: "Task occurrence has been skipped and next occurrence created.",
        });
      } else {
        toast({
          title: "Task completed",
          description: (data as any)?.next_task_id 
            ? "Task completed and next occurrence created."
            : "Task completed successfully.",
        });
      }
    },
    onError: (error) => {
      console.error('Error completing recurring task:', error);
      toast({
        title: "Error",
        description: "Failed to complete recurring task.",
        variant: "destructive",
      });
    },
  });
};
