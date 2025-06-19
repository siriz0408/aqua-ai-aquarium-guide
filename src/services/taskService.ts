
import { supabase } from '@/integrations/supabase/client';
import { Task, TaskList, CreateTaskData } from '@/types/tasks';

export const fetchTasks = async (userId: string): Promise<Task[]> => {
  if (!userId) return [];
  
  const { data, error } = await supabase
    .from('tasks')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching tasks:', error);
    return [];
  }

  return (data || []).map(task => ({
    ...task,
    recurrence_pattern: task.recurrence_pattern as any
  })) as Task[];
};

export const fetchTaskLists = async (userId: string): Promise<TaskList[]> => {
  if (!userId) return [];
  
  const { data, error } = await supabase
    .from('task_lists')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching task lists:', error);
    return [];
  }

  return data as TaskList[];
};

export const createTask = async (taskData: CreateTaskData, userId: string) => {
  const insertData: any = {
    title: taskData.title,
    description: taskData.description,
    task_type: taskData.task_type,
    priority: taskData.priority,
    conversation_id: taskData.conversation_id,
    due_date: taskData.due_date,
    user_id: userId,
    is_recurring: taskData.is_recurring || false,
    recurrence_pattern: taskData.recurrence_pattern || null,
  };

  const { data, error } = await supabase
    .from('tasks')
    .insert(insertData)
    .select()
    .single();

  if (error) throw error;

  // If it's recurring, update the series_id to point to itself
  if (taskData.is_recurring && data) {
    await supabase
      .from('tasks')
      .update({ series_id: data.id })
      .eq('id', data.id);
  }

  return data;
};

export const updateTask = async (updates: Partial<Task> & { id: string }) => {
  const { data, error } = await supabase
    .from('tasks')
    .update(updates)
    .eq('id', updates.id)
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const deleteTask = async (taskId: string) => {
  const { error } = await supabase
    .from('tasks')
    .delete()
    .eq('id', taskId);

  if (error) throw error;
};

export const completeRecurringTask = async (taskId: string, skipOccurrence: boolean = false) => {
  const { data, error } = await supabase.rpc('complete_recurring_task', {
    task_id: taskId,
    completion_date: new Date().toISOString().split('T')[0],
    skip_occurrence: skipOccurrence
  });

  if (error) throw error;
  return data;
};
