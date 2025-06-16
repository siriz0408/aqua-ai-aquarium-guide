
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { useTasks, Task } from '@/hooks/useTasks';
import { MoreHorizontal, CheckCircle, Play, Pause, Trash2, Bell, Calendar, AlertTriangle, Clock } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface TaskListProps {
  tasks: Task[];
  onTaskSelect: (taskId: string) => void;
}

const TaskList: React.FC<TaskListProps> = ({ tasks, onTaskSelect }) => {
  const { updateTask, deleteTask } = useTasks();
  const { toast } = useToast();

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return 'destructive';
      case 'high':
        return 'secondary';
      case 'medium':
        return 'outline';
      case 'low':
        return 'outline';
      default:
        return 'outline';
    }
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return <AlertTriangle className="h-3 w-3 text-red-500" />;
      case 'high':
        return <Clock className="h-3 w-3 text-orange-500" />;
      case 'medium':
        return <Clock className="h-3 w-3 text-blue-500" />;
      default:
        return <Clock className="h-3 w-3 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-800';
      case 'in_progress':
        return 'bg-blue-50 border-blue-200 dark:bg-blue-900/20 dark:border-blue-800';
      case 'pending':
        return 'bg-orange-50 border-orange-200 dark:bg-orange-900/20 dark:border-orange-800';
      default:
        return 'bg-gray-50 border-gray-200 dark:bg-gray-900/20 dark:border-gray-800';
    }
  };

  const handleStatusChange = async (task: Task, newStatus: string) => {
    try {
      updateTask({
        id: task.id,
        status: newStatus as Task['status'],
        updated_at: new Date().toISOString()
      });
      
      toast({
        title: "Task updated",
        description: `Task marked as ${newStatus.replace('_', ' ')}.`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update task status.",
        variant: "destructive",
      });
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    try {
      deleteTask(taskId);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete task.",
        variant: "destructive",
      });
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  if (tasks.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        No tasks to display
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {tasks.map((task) => (
        <Card key={task.id} className={`transition-all duration-200 hover:shadow-md ${getStatusColor(task.status)}`}>
          <CardContent className="p-4">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-2">
                  <h3 className="font-medium truncate">{task.title}</h3>
                  <Badge variant={getPriorityColor(task.priority)} className="shrink-0">
                    {getPriorityIcon(task.priority)}
                    {task.priority}
                  </Badge>
                  <Badge variant="outline" className="capitalize shrink-0">
                    {task.status.replace('_', ' ')}
                  </Badge>
                </div>
                
                {task.description && (
                  <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                    {task.description}
                  </p>
                )}
                
                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                  <span className="capitalize">{task.task_type}</span>
                  {task.due_date && (
                    <>
                      <span>•</span>
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        <span>Due {formatDate(task.due_date)}</span>
                      </div>
                    </>
                  )}
                  <span>•</span>
                  <span>Created {formatDate(task.created_at)}</span>
                </div>
              </div>
              
              <div className="flex items-center gap-2 shrink-0">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onTaskSelect(task.id)}
                  className="hidden sm:flex"
                >
                  <Bell className="h-3 w-3 mr-1" />
                  Remind
                </Button>
                
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48">
                    <DropdownMenuItem onClick={() => onTaskSelect(task.id)}>
                      <Bell className="mr-2 h-4 w-4" />
                      Set Reminder
                    </DropdownMenuItem>
                    
                    {task.status !== 'in_progress' && (
                      <DropdownMenuItem onClick={() => handleStatusChange(task, 'in_progress')}>
                        <Play className="mr-2 h-4 w-4" />
                        Start Task
                      </DropdownMenuItem>
                    )}
                    
                    {task.status === 'in_progress' && (
                      <DropdownMenuItem onClick={() => handleStatusChange(task, 'pending')}>
                        <Pause className="mr-2 h-4 w-4" />
                        Pause Task
                      </DropdownMenuItem>
                    )}
                    
                    {task.status !== 'completed' && (
                      <DropdownMenuItem onClick={() => handleStatusChange(task, 'completed')}>
                        <CheckCircle className="mr-2 h-4 w-4" />
                        Mark Complete
                      </DropdownMenuItem>
                    )}
                    
                    <DropdownMenuItem 
                      onClick={() => handleDeleteTask(task.id)}
                      className="text-red-600"
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      Delete Task
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default TaskList;
