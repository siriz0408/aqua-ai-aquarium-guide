
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useTasks } from '@/hooks/useTasks';
import { CheckCircle, Clock, Plus, Sparkles, AlertTriangle } from 'lucide-react';

const TaskRecommendations = () => {
  const { tasks, createTask } = useTasks();

  // Get recent pending tasks (last 10)
  const recentTasks = tasks
    .filter(task => task.status === 'pending')
    .slice(0, 10);

  // Group tasks by priority
  const urgentTasks = recentTasks.filter(task => task.priority === 'urgent');
  const highPriorityTasks = recentTasks.filter(task => task.priority === 'high');
  const mediumPriorityTasks = recentTasks.filter(task => task.priority === 'medium');

  const handleCompleteTask = (taskId: string) => {
    // This will be used to mark tasks as completed
    console.log('Mark task as completed:', taskId);
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

  if (recentTasks.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            AI Recommendations
          </CardTitle>
          <CardDescription>
            Tasks suggested by AquaBot will appear here
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center py-8">
          <div className="text-4xl mb-4">🤖</div>
          <p className="text-muted-foreground mb-4">
            Chat with AquaBot to get personalized maintenance recommendations
          </p>
          <Button variant="outline" onClick={() => window.location.href = '/aquabot'}>
            Start Chatting
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-primary" />
          AI Recommendations
        </CardTitle>
        <CardDescription>
          {recentTasks.length} pending task{recentTasks.length !== 1 ? 's' : ''} from AquaBot
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {urgentTasks.length > 0 && (
          <div>
            <h4 className="text-sm font-medium text-red-600 mb-2 flex items-center gap-1">
              <AlertTriangle className="h-3 w-3" />
              Urgent ({urgentTasks.length})
            </h4>
            <div className="space-y-2">
              {urgentTasks.slice(0, 3).map((task) => (
                <div key={task.id} className="flex items-center justify-between p-2 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{task.title}</p>
                    {task.description && (
                      <p className="text-xs text-muted-foreground truncate">{task.description}</p>
                    )}
                  </div>
                  <Badge variant={getPriorityColor(task.priority)} className="ml-2">
                    {getPriorityIcon(task.priority)}
                    {task.priority}
                  </Badge>
                </div>
              ))}
            </div>
          </div>
        )}

        {urgentTasks.length > 0 && (highPriorityTasks.length > 0 || mediumPriorityTasks.length > 0) && (
          <Separator />
        )}

        {highPriorityTasks.length > 0 && (
          <div>
            <h4 className="text-sm font-medium text-orange-600 mb-2 flex items-center gap-1">
              <Clock className="h-3 w-3" />
              High Priority ({highPriorityTasks.length})
            </h4>
            <div className="space-y-2">
              {highPriorityTasks.slice(0, 2).map((task) => (
                <div key={task.id} className="flex items-center justify-between p-2 rounded-lg bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{task.title}</p>
                    {task.description && (
                      <p className="text-xs text-muted-foreground truncate">{task.description}</p>
                    )}
                  </div>
                  <Badge variant={getPriorityColor(task.priority)} className="ml-2">
                    {getPriorityIcon(task.priority)}
                    {task.priority}
                  </Badge>
                </div>
              ))}
            </div>
          </div>
        )}

        {mediumPriorityTasks.length > 0 && (
          <div>
            <h4 className="text-sm font-medium text-blue-600 mb-2 flex items-center gap-1">
              <Clock className="h-3 w-3" />
              Medium Priority ({mediumPriorityTasks.length})
            </h4>
            <div className="space-y-2">
              {mediumPriorityTasks.slice(0, 2).map((task) => (
                <div key={task.id} className="flex items-center justify-between p-2 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{task.title}</p>
                    {task.description && (
                      <p className="text-xs text-muted-foreground truncate">{task.description}</p>
                    )}
                  </div>
                  <Badge variant={getPriorityColor(task.priority)} className="ml-2">
                    {getPriorityIcon(task.priority)}
                    {task.priority}
                  </Badge>
                </div>
              ))}
            </div>
          </div>
        )}

        {recentTasks.length > 5 && (
          <div className="pt-2 text-center">
            <Button variant="ghost" size="sm" onClick={() => window.location.href = '/reminders'}>
              View All {recentTasks.length} Tasks
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default TaskRecommendations;
