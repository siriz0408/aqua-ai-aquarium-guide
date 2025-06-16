
import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, Clock, AlertTriangle, Eye, ChevronRight } from 'lucide-react';
import { Task } from '@/hooks/useTasks';

interface TaskActionButtonProps {
  task: Task;
  onClick: () => void;
  className?: string;
}

const TaskActionButton: React.FC<TaskActionButtonProps> = ({ task, onClick, className = '' }) => {
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

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return 'destructive';
      case 'high':
        return 'secondary';
      case 'medium':
        return 'outline';
      default:
        return 'outline';
    }
  };

  const getBorderColor = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return 'border-red-200 dark:border-red-800';
      case 'high':
        return 'border-orange-200 dark:border-orange-800';
      case 'medium':
        return 'border-blue-200 dark:border-blue-800';
      default:
        return 'border-gray-200 dark:border-gray-800';
    }
  };

  const getBackgroundColor = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return 'bg-red-50 dark:bg-red-900/20 hover:bg-red-100 dark:hover:bg-red-900/30';
      case 'high':
        return 'bg-orange-50 dark:bg-orange-900/20 hover:bg-orange-100 dark:hover:bg-orange-900/30';
      case 'medium':
        return 'bg-blue-50 dark:bg-blue-900/20 hover:bg-blue-100 dark:hover:bg-blue-900/30';
      default:
        return 'bg-gray-50 dark:bg-gray-900/20 hover:bg-gray-100 dark:hover:bg-gray-900/30';
    }
  };

  return (
    <div 
      className={`group cursor-pointer transition-all duration-200 ${className}`}
      onClick={onClick}
    >
      <div className={`
        flex items-center justify-between p-3 rounded-lg border-2 
        ${getBorderColor(task.priority)} 
        ${getBackgroundColor(task.priority)}
        group-hover:shadow-md transition-all duration-200
      `}>
        <div className="flex-1 min-w-0 mr-3">
          <div className="flex items-start justify-between mb-1">
            <h4 className="text-sm font-medium truncate pr-2">{task.title}</h4>
            <Badge variant={getPriorityColor(task.priority)} className="shrink-0">
              {getPriorityIcon(task.priority)}
              {task.priority}
            </Badge>
          </div>
          {task.description && (
            <p className="text-xs text-muted-foreground line-clamp-2 mb-2">
              {task.description}
            </p>
          )}
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <span className="capitalize">{task.task_type}</span>
            {task.due_date && (
              <>
                <span>•</span>
                <span>Due {new Date(task.due_date).toLocaleDateString()}</span>
              </>
            )}
          </div>
        </div>
        
        <div className="flex items-center gap-2 shrink-0">
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
            onClick={(e) => {
              e.stopPropagation();
              onClick();
            }}
          >
            <Eye className="h-4 w-4" />
          </Button>
          <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-foreground transition-colors" />
        </div>
      </div>
    </div>
  );
};

export default TaskActionButton;
