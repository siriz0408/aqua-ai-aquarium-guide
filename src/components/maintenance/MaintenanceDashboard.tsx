
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { useMaintenanceScheduler } from '@/hooks/useMaintenanceScheduler';
import { Clock, CheckCircle, AlertTriangle, Calendar, TrendingUp, Wrench } from 'lucide-react';
import { format, parseISO, differenceInDays } from 'date-fns';
import { cn } from '@/lib/utils';

interface MaintenanceDashboardProps {
  selectedTankId?: string;
  onTaskComplete?: (taskId: string) => void;
}

const MaintenanceDashboard: React.FC<MaintenanceDashboardProps> = ({ 
  selectedTankId, 
  onTaskComplete 
}) => {
  const { 
    schedules, 
    events, 
    completeTask, 
    getUpcomingTasks, 
    getOverdueTasks, 
    getTasksByFrequency,
    isCompletingTask 
  } = useMaintenanceScheduler();

  // Filter by tank if specified
  const filteredSchedules = selectedTankId 
    ? schedules.filter(s => s.tank_id === selectedTankId)
    : schedules;

  const upcomingTasks = getUpcomingTasks().filter(task => 
    !selectedTankId || task.tank_id === selectedTankId
  );
  
  const overdueTasks = getOverdueTasks().filter(task => 
    !selectedTankId || task.tank_id === selectedTankId
  );

  const tasksByFrequency = getTasksByFrequency();
  
  // Calculate completion rate for last 30 days
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  
  const recentEvents = events.filter(event => {
    const eventDate = parseISO(event.scheduled_date);
    return eventDate >= thirtyDaysAgo && (!selectedTankId || event.tank_id === selectedTankId);
  });
  
  const completedRecentEvents = recentEvents.filter(event => event.status === 'completed');
  const completionRate = recentEvents.length > 0 
    ? Math.round((completedRecentEvents.length / recentEvents.length) * 100)
    : 0;

  const handleQuickComplete = (taskId: string) => {
    completeTask({ scheduleId: taskId });
    onTaskComplete?.(taskId);
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'destructive';
      case 'medium': return 'default';
      case 'low': return 'secondary';
      default: return 'outline';
    }
  };

  const getTaskUrgency = (dueDate?: string) => {
    if (!dueDate) return 'none';
    
    const today = new Date();
    const due = parseISO(dueDate);
    const daysDiff = differenceInDays(due, today);
    
    if (daysDiff < 0) return 'overdue';
    if (daysDiff === 0) return 'today';
    if (daysDiff <= 3) return 'soon';
    return 'scheduled';
  };

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'overdue': return 'text-red-600 bg-red-50';
      case 'today': return 'text-orange-600 bg-orange-50';
      case 'soon': return 'text-yellow-600 bg-yellow-50';
      default: return 'text-blue-600 bg-blue-50';
    }
  };

  return (
    <div className="space-y-6">
      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Overdue Tasks</p>
                <p className="text-2xl font-bold text-red-600">{overdueTasks.length}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-red-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Due This Week</p>
                <p className="text-2xl font-bold text-orange-600">{upcomingTasks.length}</p>
              </div>
              <Clock className="h-8 w-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Active Schedules</p>
                <p className="text-2xl font-bold">{filteredSchedules.length}</p>
              </div>
              <Calendar className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Completion Rate</p>
                <p className="text-2xl font-bold text-green-600">{completionRate}%</p>
              </div>
              <TrendingUp className="h-8 w-8 text-green-500" />
            </div>
            <Progress value={completionRate} className="mt-2" />
          </CardContent>
        </Card>
      </div>

      {/* Urgent Tasks */}
      {(overdueTasks.length > 0 || upcomingTasks.length > 0) && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-orange-500" />
              Urgent Tasks
            </CardTitle>
            <CardDescription>
              Tasks that need immediate attention
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[...overdueTasks, ...upcomingTasks.slice(0, 5)].map((task) => {
                const urgency = getTaskUrgency(task.next_due_date);
                return (
                  <div key={task.id} className={cn(
                    "flex items-center justify-between p-3 rounded-lg border",
                    getUrgencyColor(urgency)
                  )}>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-medium text-sm">{task.name}</h4>
                        <Badge variant={getPriorityColor(task.template?.priority || task.custom_priority || 'medium')}>
                          {task.template?.priority || task.custom_priority || 'medium'}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Due: {task.next_due_date ? format(parseISO(task.next_due_date), 'MMM dd, yyyy') : 'No date'}
                        {task.template?.estimated_time && ` • ${task.template.estimated_time}`}
                      </p>
                    </div>
                    <Button
                      size="sm"
                      onClick={() => handleQuickComplete(task.id)}
                      disabled={isCompletingTask}
                    >
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Complete
                    </Button>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Schedule Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Tasks by Frequency */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Wrench className="h-5 w-5" />
              Schedule Overview
            </CardTitle>
            <CardDescription>
              Tasks organized by frequency
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {Object.entries(tasksByFrequency).map(([frequency, tasks]) => (
                <div key={frequency}>
                  <div className="flex justify-between items-center mb-2">
                    <h4 className="font-medium capitalize">
                      {frequency.replace('_', ' ')} Tasks
                    </h4>
                    <Badge variant="outline">{tasks.length}</Badge>
                  </div>
                  <div className="space-y-1">
                    {tasks.slice(0, 3).map((task) => (
                      <div key={task.id} className="text-sm text-muted-foreground pl-2 border-l-2 border-muted">
                        {task.name}
                      </div>
                    ))}
                    {tasks.length > 3 && (
                      <div className="text-xs text-muted-foreground pl-2">
                        +{tasks.length - 3} more
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Recent Completions */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-500" />
              Recent Completions
            </CardTitle>
            <CardDescription>
              Tasks completed in the last 7 days
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {completedRecentEvents
                .slice(0, 5)
                .map((event) => (
                  <div key={event.id} className="flex items-center justify-between p-2 rounded-lg bg-green-50">
                    <div>
                      <h4 className="font-medium text-sm">{event.schedule?.name}</h4>
                      <p className="text-xs text-muted-foreground">
                        Completed {event.completed_date ? format(parseISO(event.completed_date), 'MMM dd') : ''}
                      </p>
                    </div>
                    <CheckCircle className="h-4 w-4 text-green-500" />
                  </div>
                ))}
              
              {completedRecentEvents.length === 0 && (
                <div className="text-center py-4 text-muted-foreground">
                  <p className="text-sm">No tasks completed recently</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default MaintenanceDashboard;
