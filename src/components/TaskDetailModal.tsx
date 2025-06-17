
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Progress } from '@/components/ui/progress';
import { 
  CheckCircle, 
  Clock, 
  AlertTriangle, 
  X, 
  Calendar, 
  MessageCircle,
  ExternalLink,
  Lightbulb,
  AlertCircle,
  Wrench,
  Play,
  FileText,
  Image,
  Video
} from 'lucide-react';
import { Task, TaskStep, TaskResource } from '@/hooks/useTasks';
import { format } from 'date-fns';

interface TaskDetailModalProps {
  task: Task | null;
  isOpen: boolean;
  onClose: () => void;
  onResolve: (taskId: string) => void;
  onDelete: (taskId: string) => void;
  onUpdateSteps: (taskId: string, steps: TaskStep[]) => void;
}

const TaskDetailModal: React.FC<TaskDetailModalProps> = ({
  task,
  isOpen,
  onClose,
  onResolve,
  onDelete,
  onUpdateSteps,
}) => {
  const [localSteps, setLocalSteps] = useState<TaskStep[]>([]);

  React.useEffect(() => {
    if (task?.steps) {
      setLocalSteps(task.steps);
    }
  }, [task]);

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

  const getDifficultyColor = (difficulty?: string) => {
    switch (difficulty) {
      case 'advanced':
        return 'destructive';
      case 'intermediate':
        return 'secondary';
      case 'beginner':
        return 'outline';
      default:
        return 'outline';
    }
  };

  const getResourceIcon = (type: string) => {
    switch (type) {
      case 'video':
        return <Video className="h-4 w-4" />;
      case 'image':
        return <Image className="h-4 w-4" />;
      case 'document':
        return <FileText className="h-4 w-4" />;
      default:
        return <ExternalLink className="h-4 w-4" />;
    }
  };

  const handleStepToggle = (stepId: string, completed: boolean) => {
    const updatedSteps = localSteps.map(step =>
      step.id === stepId ? { ...step, completed } : step
    );
    setLocalSteps(updatedSteps);
    onUpdateSteps(task.id, updatedSteps);
  };

  const completedSteps = localSteps.filter(step => step.completed).length;
  const progressPercentage = localSteps.length > 0 ? (completedSteps / localSteps.length) * 100 : 0;

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
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <DialogTitle className="text-xl font-semibold pr-4">
                {task.title}
              </DialogTitle>
              <DialogDescription className="mt-2 flex items-center gap-2 flex-wrap">
                <Badge variant={getPriorityColor(task.priority)}>
                  {getPriorityIcon(task.priority)}
                  {task.priority} priority
                </Badge>
                <Badge variant="outline">{task.task_type}</Badge>
                {task.difficulty && (
                  <Badge variant={getDifficultyColor(task.difficulty)}>
                    {task.difficulty}
                  </Badge>
                )}
                {task.estimated_time && (
                  <Badge variant="outline" className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {task.estimated_time}
                  </Badge>
                )}
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
          {/* Progress Overview */}
          {localSteps.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Play className="h-5 w-5 text-primary" />
                  Progress Overview
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span>Completed Steps</span>
                    <span>{completedSteps} of {localSteps.length}</span>
                  </div>
                  <Progress value={progressPercentage} className="h-2" />
                  <p className="text-xs text-muted-foreground">
                    {progressPercentage.toFixed(0)}% complete
                  </p>
                </div>
              </CardContent>
            </Card>
          )}

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

          {/* Detailed Instructions */}
          {task.detailed_instructions && (
            <Card>
              <CardContent className="p-4">
                <h4 className="font-medium mb-2">Detailed Instructions</h4>
                <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                  {task.detailed_instructions}
                </p>
              </CardContent>
            </Card>
          )}

          {/* Step-by-Step Checklist */}
          {localSteps.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Step-by-Step Instructions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {localSteps.map((step, index) => (
                    <div key={step.id} className="flex items-start gap-3 p-3 rounded-lg border">
                      <Checkbox
                        checked={step.completed}
                        onCheckedChange={(checked) => 
                          handleStepToggle(step.id, checked as boolean)
                        }
                        className="mt-1"
                      />
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-sm font-medium">Step {index + 1}</span>
                          {step.completed && (
                            <CheckCircle className="h-4 w-4 text-green-500" />
                          )}
                        </div>
                        <p className={`text-sm ${step.completed ? 'line-through text-muted-foreground' : ''}`}>
                          {step.description}
                        </p>
                        {step.notes && (
                          <p className="text-xs text-muted-foreground mt-1">
                            Note: {step.notes}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Required Tools */}
          {task.required_tools && task.required_tools.length > 0 && (
            <Card>
              <CardContent className="p-4">
                <h4 className="font-medium mb-3 flex items-center gap-2">
                  <Wrench className="h-4 w-4" />
                  Required Tools & Materials
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {task.required_tools.map((tool, index) => (
                    <div key={index} className="flex items-center gap-2 text-sm">
                      <span className="w-2 h-2 bg-primary rounded-full" />
                      {tool}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Tips */}
          {task.tips && task.tips.length > 0 && (
            <Card>
              <CardContent className="p-4">
                <h4 className="font-medium mb-3 flex items-center gap-2">
                  <Lightbulb className="h-4 w-4 text-yellow-500" />
                  Helpful Tips
                </h4>
                <div className="space-y-2">
                  {task.tips.map((tip, index) => (
                    <div key={index} className="p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                      <p className="text-sm text-yellow-800 dark:text-yellow-200">
                        {tip}
                      </p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Warnings */}
          {task.warnings && task.warnings.length > 0 && (
            <Card>
              <CardContent className="p-4">
                <h4 className="font-medium mb-3 flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 text-red-500" />
                  Important Warnings
                </h4>
                <div className="space-y-2">
                  {task.warnings.map((warning, index) => (
                    <div key={index} className="p-3 bg-red-50 dark:bg-red-900/20 rounded-lg border-l-4 border-red-500">
                      <p className="text-sm text-red-800 dark:text-red-200">
                        {warning}
                      </p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Resources */}
          {task.resources && task.resources.length > 0 && (
            <Card>
              <CardContent className="p-4">
                <h4 className="font-medium mb-3">Helpful Resources</h4>
                <div className="space-y-3">
                  {task.resources.map((resource) => (
                    <div key={resource.id} className="flex items-start gap-3 p-3 border rounded-lg">
                      {getResourceIcon(resource.type)}
                      <div className="flex-1">
                        <h5 className="font-medium">{resource.title}</h5>
                        {resource.description && (
                          <p className="text-sm text-muted-foreground">
                            {resource.description}
                          </p>
                        )}
                        {resource.url && (
                          <a
                            href={resource.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm text-primary hover:underline flex items-center gap-1 mt-1"
                          >
                            Open Resource
                            <ExternalLink className="h-3 w-3" />
                          </a>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
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
