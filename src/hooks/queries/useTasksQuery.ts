
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import { fetchTasks, fetchTaskLists } from '@/services/taskService';

export const useTasksQuery = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['tasks'],
    queryFn: () => fetchTasks(user?.id || ''),
    enabled: !!user,
  });
};

export const useTaskListsQuery = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['task_lists'],
    queryFn: () => fetchTaskLists(user?.id || ''),
    enabled: !!user,
  });
};
