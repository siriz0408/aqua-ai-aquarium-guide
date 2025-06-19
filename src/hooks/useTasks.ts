
import { useTasksQuery, useTaskListsQuery } from './queries/useTasksQuery';
import { useCreateTask } from './mutations/useCreateTask';
import { useUpdateTask } from './mutations/useUpdateTask';
import { useDeleteTask } from './mutations/useDeleteTask';
import { useCompleteRecurringTask } from './mutations/useCompleteRecurringTask';

// Re-export types for backward compatibility
export type { Task, TaskList, CreateTaskData, RecurrencePattern } from '@/types/tasks';

export const useTasks = () => {
  const { data: tasks = [], isLoading: tasksLoading } = useTasksQuery();
  const { data: taskLists = [], isLoading: taskListsLoading } = useTaskListsQuery();
  
  const createTaskMutation = useCreateTask();
  const updateTaskMutation = useUpdateTask();
  const deleteTaskMutation = useDeleteTask();
  const completeRecurringTaskMutation = useCompleteRecurringTask();

  return {
    tasks,
    taskLists,
    tasksLoading,
    taskListsLoading,
    createTask: createTaskMutation.mutate,
    updateTask: updateTaskMutation.mutate,
    deleteTask: deleteTaskMutation.mutate,
    completeRecurringTask: completeRecurringTaskMutation.mutate,
    isCreating: createTaskMutation.isPending,
    isUpdating: updateTaskMutation.isPending,
    isDeleting: deleteTaskMutation.isPending,
    isCompletingRecurring: completeRecurringTaskMutation.isPending,
  };
};
