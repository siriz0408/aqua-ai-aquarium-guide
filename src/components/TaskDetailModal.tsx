
import React from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Card, CardContent } from '@/components/ui/card';
import { CheckCircle, Clock, AlertTriangle, X, Calendar, MessageCircle } from 'lucide-react';
import { Task } from '@/hooks/useTasks';
import { format } from 'date-fns';

interface TaskDetailModalProps {
  task: Task | null;
  isOpen: boolean;
  onClose: () => void;
  onResolve: (taskId: string) => void;
  onDelete: (taskId: string) => void;
}

const TaskDetailModal: React.FC<TaskDetailModalProps> = ({
  task,
  isOpen,
  onClose,
  onResolve,
  onDelete,
}) => {
  if (!task) return null;

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return <AlertTriangle className="h-4 w-4 text-red-500" />;
      case 'high':
        return <Clock className="h-4 w-4 text-orange-500" />;
      case 'medium':
        return <Clock className="h-4 w-4 text-blue-500" />;
      default:
        return <Clock className="h-4 w-4 text-gray-500" />;
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

  const handleResolve = () => {
    onResolve(task.id);
    onClose();
  };

  const handleDelete = () => {
    onDelete(task.id);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <DialogTitle className="text-xl font-semibold pr-4">
                {task.title}
              </DialogTitle>
              <DialogDescription className="mt-2 flex items-center gap-2">
                <Badge variant={getPriorityColor(task.priority)}>
                  {getPriorityIcon(task.priority)}
                  {task.priority} priority
                </Badge>
                <Badge variant="outline">{task.task_type}</Badge>
                {task.due_date && (
                  <Badge variant="outline" className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    Due {format(new Date(task.due_date), 'MMM d, yyyy')}
                  </Badge>
                )}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-6">
          {/* Task Description */}
          {task.description && (
            <Card>
              <CardContent className="p-4">
                <h4 className="font-medium mb-2">Description</h4>
                <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                  {task.description}
                </p>
              </CardContent>
            </Card>
          )}

          {/* Task Details */}
          <Card>
            <CardContent className="p-4">
              <h4 className="font-medium mb-3">Task Details</h4>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <label className="font-medium text-muted-foreground">Status</label>
                  <p className="capitalize">{task.status.replace('_', ' ')}</p>
                </div>
                <div>
                  <label className="font-medium text-muted-foreground">Type</label>
                  <p className="capitalize">{task.task_type}</p>
                </div>
                <div>
                  <label className="font-medium text-muted-foreground">Created</label>
                  <p>{format(new Date(task.created_at), 'MMM d, yyyy h:mm a')}</p>
                </div>
                {task.frequency && (
                  <div>
                    <label className="font-medium text-muted-foreground">Frequency</label>
                    <p>{task.frequency}</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* AI Recommendations */}
          <Card>
            <CardContent className="p-4">
              <h4 className="font-medium mb-3 flex items-center gap-2">
                <MessageCircle className="h-4 w-4 text-primary" />
                AI Recommendations
              </h4>
              <div className="space-y-3 text-sm">
                <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <p className="font-medium text-blue-900 dark:text-blue-100 mb-1">
                    Why this task was recommended:
                  </p>
                  <p className="text-blue-800 dark:text-blue-200">
                    This task was automatically generated based on your tank parameters, livestock, 
                    and maintenance schedule to help maintain optimal aquarium conditions.
                  </p>
                </div>
                
                {task.priority === 'urgent' && (
                  <div className="p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
                    <p className="font-medium text-red-900 dark:text-red-100 mb-1">
                      ⚠️ Urgent Action Required
                    </p>
                    <p className="text-red-800 dark:text-red-200">
                      This task requires immediate attention to prevent potential issues with your aquarium.
                    </p>
                  </div>
                )}

                <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                  <p className="font-medium text-green-900 dark:text-green-100 mb-1">
                    💡 Pro Tip:
                  </p>
                  <p className="text-green-800 dark:text-green-200">
                    Regular maintenance tasks like this help prevent larger issues and keep your 
                    aquatic life healthy and thriving.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Separator />

          {/* Action Buttons */}
          <div className="flex gap-3 justify-end">
            <Button variant="outline" onClick={onClose}>
              Close
            </Button>
            <Button variant="outline" onClick={handleDelete} className="text-red-600 hover:text-red-700">
              <X className="h-4 w-4 mr-2" />
              Delete Task
            </Button>
            <Button onClick={handleResolve} className="bg-green-600 hover:bg-green-700">
              <CheckCircle className="h-4 w-4 mr-2" />
              Mark as Complete
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default TaskDetailModal;
