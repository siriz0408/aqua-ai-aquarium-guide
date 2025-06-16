
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { useTasks } from '@/hooks/useTasks';
import { Sparkles, AlertTriangle, Clock } from 'lucide-react';
import TaskActionButton from '@/components/TaskActionButton';
import TaskDetailModal from '@/components/TaskDetailModal';
import { Task } from '@/hooks/useTasks';
import { useToast } from '@/hooks/use-toast';

const TaskRecommendations = () => {
  const { tasks, updateTask, deleteTask } = useTasks();
  const { toast } = useToast();
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Get recent pending tasks (last 10)
  const recentTasks = tasks
    .filter(task => task.status === 'pending')
    .slice(0, 10);

  // Group tasks by priority
  const urgentTasks = recentTasks.filter(task => task.priority === 'urgent');
  const highPriorityTasks = recentTasks.filter(task => task.priority === 'high');
  const mediumPriorityTasks = recentTasks.filter(task => task.priority === 'medium');

  const handleTaskClick = (task: Task) => {
    setSelectedTask(task);
    setIsModalOpen(true);
  };

  const handleResolveTask = async (taskId: string) => {
    try {
      updateTask({ 
        id: taskId, 
        status: 'completed',
        updated_at: new Date().toISOString()
      });
      toast({
        title: "Task completed",
        description: "Task has been marked as complete.",
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

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedTask(null);
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
    <>
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
              <h4 className="text-sm font-medium text-red-600 mb-3 flex items-center gap-1">
                <AlertTriangle className="h-3 w-3" />
                Urgent ({urgentTasks.length})
              </h4>
              <div className="space-y-2">
                {urgentTasks.slice(0, 3).map((task) => (
                  <TaskActionButton
                    key={task.id}
                    task={task}
                    onClick={() => handleTaskClick(task)}
                  />
                ))}
              </div>
            </div>
          )}

          {urgentTasks.length > 0 && (highPriorityTasks.length > 0 || mediumPriorityTasks.length > 0) && (
            <Separator />
          )}

          {highPriorityTasks.length > 0 && (
            <div>
              <h4 className="text-sm font-medium text-orange-600 mb-3 flex items-center gap-1">
                <Clock className="h-3 w-3" />
                High Priority ({highPriorityTasks.length})
              </h4>
              <div className="space-y-2">
                {highPriorityTasks.slice(0, 2).map((task) => (
                  <TaskActionButton
                    key={task.id}
                    task={task}
                    onClick={() => handleTaskClick(task)}
                  />
                ))}
              </div>
            </div>
          )}

          {mediumPriorityTasks.length > 0 && (
            <div>
              <h4 className="text-sm font-medium text-blue-600 mb-3 flex items-center gap-1">
                <Clock className="h-3 w-3" />
                Medium Priority ({mediumPriorityTasks.length})
              </h4>
              <div className="space-y-2">
                {mediumPriorityTasks.slice(0, 2).map((task) => (
                  <TaskActionButton
                    key={task.id}
                    task={task}
                    onClick={() => handleTaskClick(task)}
                  />
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

      <TaskDetailModal
        task={selectedTask}
        isOpen={isModalOpen}
        onClose={closeModal}
        onResolve={handleResolveTask}
        onDelete={handleDeleteTask}
      />
    </>
  );
};

export default TaskRecommendations;
