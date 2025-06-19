
import React from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { CheckCircle, SkipForward, Repeat, Calendar, Clock } from 'lucide-react';
import { Task } from '@/types/tasks';
import { useTasks } from '@/hooks/useTasks';
import { format } from 'date-fns';

interface RecurringTaskModalProps {
  task: Task | null;
  isOpen: boolean;
  onClose: () => void;
}

const RecurringTaskModal: React.FC<RecurringTaskModalProps> = ({
  task,
  isOpen,
  onClose,
}) => {
  const { completeRecurringTask, isCompletingRecurring } = useTasks();

  if (!task || !task.is_recurring) return null;

  const handleComplete = () => {
    completeRecurringTask({ taskId: task.id, skipOccurrence: false });
    onClose();
  };

  const handleSkip = () => {
    completeRecurringTask({ taskId: task.id, skipOccurrence: true });
    onClose();
  };

  const getRecurrenceDescription = () => {
    if (!task.recurrence_pattern) return 'Unknown pattern';
    
    const pattern = task.recurrence_pattern;
    
    switch (pattern.type) {
      case 'daily':
        return `Every ${pattern.interval || 1} day${(pattern.interval || 1) > 1 ? 's' : ''}`;
      case 'weekly':
        return `Every ${pattern.interval || 1} week${(pattern.interval || 1) > 1 ? 's' : ''}`;
      case 'bi_weekly':
        return 'Every 2 weeks';
      case 'monthly':
        return `Every ${pattern.interval || 1} month${(pattern.interval || 1) > 1 ? 's' : ''}`;
      case 'custom':
        return `Every ${pattern.customDays} days`;
      default:
        return 'Custom pattern';
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Repeat className="h-5 w-5 text-primary" />
            Complete Recurring Task
          </DialogTitle>
          <DialogDescription>
            This is a recurring task. Choose how you'd like to proceed.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Task Info */}
          <Card>
            <CardContent className="p-4">
              <h4 className="font-medium mb-2">{task.title}</h4>
              {task.description && (
                <p className="text-sm text-muted-foreground mb-3">
                  {task.description}
                </p>
              )}
              
              <div className="flex flex-wrap gap-2 mb-3">
                <Badge variant="outline" className="flex items-center gap-1">
                  <Repeat className="h-3 w-3" />
                  {getRecurrenceDescription()}
                </Badge>
                {task.due_date && (
                  <Badge variant="outline" className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    Due {format(new Date(task.due_date), 'MMM d')}
                  </Badge>
                )}
              </div>

              {/* Series Info */}
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">Completed:</span>
                  <div className="font-medium">{task.completion_count || 0} times</div>
                </div>
                <div>
                  <span className="text-muted-foreground">Skipped:</span>
                  <div className="font-medium">{task.skip_count || 0} times</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Action Explanation */}
          <div className="space-y-3 text-sm">
            <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
              <div className="flex items-center gap-2 font-medium text-green-900 dark:text-green-100 mb-1">
                <CheckCircle className="h-4 w-4" />
                Mark as Complete
              </div>
              <p className="text-green-800 dark:text-green-200">
                Complete this occurrence and automatically create the next one based on your recurrence schedule.
              </p>
            </div>
            
            <div className="p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
              <div className="flex items-center gap-2 font-medium text-orange-900 dark:text-orange-100 mb-1">
                <SkipForward className="h-4 w-4" />
                Skip This Occurrence
              </div>
              <p className="text-orange-800 dark:text-orange-200">
                Skip this occurrence and create the next one. This won't count as completed.
              </p>
            </div>
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button 
            variant="outline" 
            onClick={handleSkip}
            disabled={isCompletingRecurring}
            className="text-orange-600 hover:text-orange-700"
          >
            <SkipForward className="h-4 w-4 mr-2" />
            Skip
          </Button>
          <Button 
            onClick={handleComplete}
            disabled={isCompletingRecurring}
            className="bg-green-600 hover:bg-green-700"
          >
            <CheckCircle className="h-4 w-4 mr-2" />
            Complete
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default RecurringTaskModal;
