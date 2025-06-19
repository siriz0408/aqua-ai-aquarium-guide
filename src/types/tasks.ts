
export interface RecurrencePattern {
  type: 'daily' | 'weekly' | 'bi_weekly' | 'monthly' | 'custom' | 'weekly_days';
  interval?: number;
  customDays?: number;
  daysOfWeek?: number[];
  endDate?: string;
  maxOccurrences?: number;
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
  is_recurring?: boolean;
  recurrence_pattern?: RecurrencePattern;
  parent_task_id?: string;
  occurrence_date?: string;
  series_id?: string;
  completion_count?: number;
  skip_count?: number;
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

export interface CreateTaskData {
  title: string;
  description?: string;
  task_type: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  conversation_id?: string;
  due_date?: string;
  is_recurring?: boolean;
  recurrence_pattern?: RecurrencePattern;
}
