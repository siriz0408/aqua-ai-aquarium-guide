
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { HoverCard, HoverCardContent, HoverCardTrigger } from '@/components/ui/hover-card';
import { CheckCircle, Clock, AlertTriangle, Eye, ChevronRight, ChevronUp, ChevronDown, Info, Check } from 'lucide-react';
import { Task } from '@/hooks/useTasks';

interface TaskActionButtonProps {
  task: Task;
  onClick: () => void;
  onResolve?: (taskId: string) => void;
  onMoveUp?: (taskId: string) => void;
  onMoveDown?: (taskId: string) => void;
  canMoveUp?: boolean;
  canMoveDown?: boolean;
  className?: string;
}

const TaskActionButton: React.FC<TaskActionButtonProps> = ({ 
  task, 
  onClick, 
  onResolve,
  onMoveUp,
  onMoveDown,
  canMoveUp = true,
  canMoveDown = true,
  className = '' 
}) => {
  const [isHovered, setIsHovered] = useState(false);

  // Function to clean and format task title
  const formatTaskTitle = (title: string) => {
    // Remove markdown asterisks and clean up the title
    return title.replace(/\*\*/g, '').trim();
  };

  // Function to extract summary from description, excluding the title
  const getTaskSummary = (task: Task) => {
    const cleanTitle = formatTaskTitle(task.title);
    
    // If description exists and is different from title, use it as summary
    if (task.description && task.description.trim()) {
      const cleanDescription = task.description.replace(/\*\*/g, '').trim();
      // Don't show description if it's the same as the title
      if (cleanDescription !== cleanTitle) {
        return cleanDescription;
      }
    }
    
    // If title contains a colon, use only the part after colon as summary
    if (cleanTitle.includes(':')) {
      const parts = cleanTitle.split(':');
      const summary = parts.slice(1).join(':').trim();
      return summary || null;
    }
    
    return null;
  };

  // Function to get the main title (before colon if exists)
  const getMainTitle = (title: string) => {
    const cleanTitle = formatTaskTitle(title);
    if (cleanTitle.includes(':')) {
      return cleanTitle.split(':')[0].trim();
    }
    return cleanTitle;
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

  const handleQuickAction = (e: React.MouseEvent, action: () => void) => {
    e.stopPropagation();
    action();
  };

  const mainTitle = getMainTitle(task.title);
  const summary = getTaskSummary(task);

  return (
    <div 
      className={`group cursor-pointer transition-all duration-200 ${className}`}
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className={`
        flex items-center justify-between p-3 rounded-lg border-2 
        ${getBorderColor(task.priority)} 
        ${getBackgroundColor(task.priority)}
        group-hover:shadow-md transition-all duration-200
        ${isHovered ? 'scale-[1.02]' : ''}
      `}>
        <div className="flex-1 min-w-0 mr-3">
          <div className="flex items-start justify-between mb-1">
            <h4 className="text-sm font-semibold truncate pr-2">{mainTitle}</h4>
            <Badge variant={getPriorityColor(task.priority)} className="shrink-0">
              {getPriorityIcon(task.priority)}
              {task.priority}
            </Badge>
          </div>
          {summary && (
            <p className="text-xs text-muted-foreground line-clamp-2 mb-2">
              {summary}
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
        
        <div className="flex items-center gap-1 shrink-0">
          {/* Quick Actions - Show on hover */}
          <div className={`flex items-center gap-1 transition-all duration-200 ${
            isHovered ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-2'
          }`}>
            {/* Quick Summary */}
            <HoverCard>
              <HoverCardTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 w-7 p-0 hover:bg-blue-100 dark:hover:bg-blue-900/30"
                  onClick={(e) => handleQuickAction(e, () => {})}
                >
                  <Info className="h-3 w-3 text-blue-600" />
                </Button>
              </HoverCardTrigger>
              <HoverCardContent className="w-80 p-3">
                <div className="space-y-2">
                  <h4 className="font-medium text-sm">{mainTitle}</h4>
                  <p className="text-xs text-muted-foreground">
                    {summary || 'No description provided'}
                  </p>
                  <div className="flex items-center gap-2 text-xs">
                    <Badge variant={getPriorityColor(task.priority)} className="text-xs">
                      {task.priority}
                    </Badge>
                    <span className="text-muted-foreground">•</span>
                    <span className="text-muted-foreground capitalize">{task.task_type}</span>
                  </div>
                </div>
              </HoverCardContent>
            </HoverCard>

            {/* Move Up */}
            {onMoveUp && canMoveUp && (
              <Button
                variant="ghost"
                size="sm"
                className="h-7 w-7 p-0 hover:bg-gray-100 dark:hover:bg-gray-800"
                onClick={(e) => handleQuickAction(e, () => onMoveUp(task.id))}
                title="Move up in list"
              >
                <ChevronUp className="h-3 w-3 text-gray-600" />
              </Button>
            )}

            {/* Move Down */}
            {onMoveDown && canMoveDown && (
              <Button
                variant="ghost"
                size="sm"
                className="h-7 w-7 p-0 hover:bg-gray-100 dark:hover:bg-gray-800"
                onClick={(e) => handleQuickAction(e, () => onMoveDown(task.id))}
                title="Move down in list"
              >
                <ChevronDown className="h-3 w-3 text-gray-600" />
              </Button>
            )}

            {/* Quick Resolve */}
            {onResolve && (
              <Button
                variant="ghost"
                size="sm"
                className="h-7 w-7 p-0 hover:bg-green-100 dark:hover:bg-green-900/30"
                onClick={(e) => handleQuickAction(e, () => onResolve(task.id))}
                title="Mark as complete"
              >
                <Check className="h-3 w-3 text-green-600" />
              </Button>
            )}

            {/* View Details */}
            <Button
              variant="ghost"
              size="sm"
              className="h-7 w-7 p-0 hover:bg-primary/10"
              onClick={(e) => handleQuickAction(e, onClick)}
              title="View details"
            >
              <Eye className="h-3 w-3 text-primary" />
            </Button>
          </div>

          {/* Main Arrow */}
          <ChevronRight className={`h-4 w-4 text-muted-foreground transition-all duration-200 ${
            isHovered ? 'text-foreground translate-x-1' : ''
          }`} />
        </div>
      </div>
    </div>
  );
};

export default TaskActionButton;
