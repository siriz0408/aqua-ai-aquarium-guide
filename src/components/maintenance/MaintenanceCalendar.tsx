
import React, { useState } from 'react';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { MaintenanceSchedule, MaintenanceEvent, useMaintenanceScheduler } from '@/hooks/useMaintenanceScheduler';
import { format, isSameDay, parseISO } from 'date-fns';
import { Clock, CheckCircle, AlertTriangle, Calendar, Wrench } from 'lucide-react';
import { cn } from '@/lib/utils';

interface MaintenanceCalendarProps {
  selectedTankId?: string;
}

const MaintenanceCalendar: React.FC<MaintenanceCalendarProps> = ({ selectedTankId }) => {
  const { schedules, events, completeTask, isCompletingTask } = useMaintenanceScheduler();
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [selectedTask, setSelectedTask] = useState<MaintenanceSchedule | null>(null);
  const [completionNotes, setCompletionNotes] = useState('');
  const [showCompletionDialog, setShowCompletionDialog] = useState(false);

  // Filter schedules and events by selected tank if provided
  const filteredSchedules = selectedTankId 
    ? schedules.filter(s => s.tank_id === selectedTankId)
    : schedules;

  const filteredEvents = selectedTankId
    ? events.filter(e => e.tank_id === selectedTankId)
    : events;

  // Get tasks for a specific date
  const getTasksForDate = (date: Date) => {
    const dateStr = format(date, 'yyyy-MM-dd');
    
    const scheduledTasks = filteredSchedules.filter(schedule => 
      schedule.next_due_date === dateStr
    );

    const completedEvents = filteredEvents.filter(event => 
      event.completed_date === dateStr && event.status === 'completed'
    );

    return { scheduledTasks, completedEvents };
  };

  // Get tasks for selected date
  const selectedDateTasks = getTasksForDate(selectedDate);

  // Check if date has tasks
  const dateHasTasks = (date: Date) => {
    const { scheduledTasks, completedEvents } = getTasksForDate(date);
    return scheduledTasks.length > 0 || completedEvents.length > 0;
  };

  // Get task status for date
  const getDateTaskStatus = (date: Date) => {
    const { scheduledTasks, completedEvents } = getTasksForDate(date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    if (scheduledTasks.length > 0) {
      return date < today ? 'overdue' : 'scheduled';
    }
    if (completedEvents.length > 0) {
      return 'completed';
    }
    return null;
  };

  const handleCompleteTask = (task: MaintenanceSchedule) => {
    setSelectedTask(task);
    setCompletionNotes('');
    setShowCompletionDialog(true);
  };

  const confirmCompleteTask = () => {
    if (!selectedTask) return;
    
    completeTask({
      scheduleId: selectedTask.id,
      completionDate: format(selectedDate, 'yyyy-MM-dd'),
      notes: completionNotes || undefined
    });
    
    setShowCompletionDialog(false);
    setSelectedTask(null);
    setCompletionNotes('');
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'destructive';
      case 'medium': return 'default';
      case 'low': return 'secondary';
      default: return 'outline';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'overdue': return <AlertTriangle className="h-4 w-4 text-red-500" />;
      case 'scheduled': return <Clock className="h-4 w-4 text-blue-500" />;
      case 'completed': return <CheckCircle className="h-4 w-4 text-green-500" />;
      default: return <Calendar className="h-4 w-4 text-gray-500" />;
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Calendar */}
      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Maintenance Calendar
          </CardTitle>
          <CardDescription>
            View and manage your maintenance schedule
          </CardDescription>
        </CardHeader>
        <CardContent>
          <CalendarComponent
            mode="single"
            selected={selectedDate}
            onSelect={(date) => date && setSelectedDate(date)}
            className="rounded-md border"
            modifiers={{
              hasScheduled: (date) => getDateTaskStatus(date) === 'scheduled',
              hasOverdue: (date) => getDateTaskStatus(date) === 'overdue',
              hasCompleted: (date) => getDateTaskStatus(date) === 'completed',
            }}
            modifiersStyles={{
              hasScheduled: { backgroundColor: '#dbeafe', color: '#1e40af' },
              hasOverdue: { backgroundColor: '#fee2e2', color: '#dc2626' },
              hasCompleted: { backgroundColor: '#dcfce7', color: '#16a34a' },
            }}
          />
          
          {/* Legend */}
          <div className="flex flex-wrap gap-4 mt-4 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded bg-blue-100 border border-blue-300"></div>
              <span>Scheduled</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded bg-red-100 border border-red-300"></div>
              <span>Overdue</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded bg-green-100 border border-green-300"></div>
              <span>Completed</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Selected Date Tasks */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Wrench className="h-5 w-5" />
            {format(selectedDate, 'MMM dd, yyyy')}
          </CardTitle>
          <CardDescription>
            Tasks for selected date
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Scheduled Tasks */}
          {selectedDateTasks.scheduledTasks.length > 0 && (
            <div>
              <h4 className="font-medium mb-2 flex items-center gap-2">
                {getStatusIcon(getDateTaskStatus(selectedDate) || 'scheduled')}
                Scheduled Tasks
              </h4>
              <div className="space-y-2">
                {selectedDateTasks.scheduledTasks.map((task) => (
                  <div key={task.id} className="p-3 border rounded-lg">
                    <div className="flex justify-between items-start mb-2">
                      <h5 className="font-medium text-sm">{task.name}</h5>
                      <Badge variant={getPriorityColor(task.template?.priority || task.custom_priority || 'medium')}>
                        {task.template?.priority || task.custom_priority || 'medium'}
                      </Badge>
                    </div>
                    {task.description && (
                      <p className="text-xs text-muted-foreground mb-2">{task.description}</p>
                    )}
                    {task.template?.estimated_time && (
                      <p className="text-xs text-muted-foreground mb-2">
                        Est. time: {task.template.estimated_time}
                      </p>
                    )}
                    <Button
                      size="sm"
                      onClick={() => handleCompleteTask(task)}
                      className="w-full"
                    >
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Mark Complete
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Completed Tasks */}
          {selectedDateTasks.completedEvents.length > 0 && (
            <div>
              <h4 className="font-medium mb-2 flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                Completed Tasks
              </h4>
              <div className="space-y-2">
                {selectedDateTasks.completedEvents.map((event) => (
                  <div key={event.id} className="p-3 border rounded-lg bg-green-50">
                    <h5 className="font-medium text-sm">{event.schedule?.name}</h5>
                    {event.notes && (
                      <p className="text-xs text-muted-foreground mt-1">{event.notes}</p>
                    )}
                    {event.actual_duration && (
                      <p className="text-xs text-muted-foreground mt-1">
                        Duration: {event.actual_duration} minutes
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* No Tasks */}
          {selectedDateTasks.scheduledTasks.length === 0 && selectedDateTasks.completedEvents.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              <Calendar className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">No maintenance tasks for this date</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Task Completion Dialog */}
      <Dialog open={showCompletionDialog} onOpenChange={setShowCompletionDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Complete Maintenance Task</DialogTitle>
            <DialogDescription>
              Mark "{selectedTask?.name}" as completed for {format(selectedDate, 'MMM dd, yyyy')}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <Label htmlFor="notes">Notes (optional)</Label>
              <Textarea
                id="notes"
                placeholder="Add any notes about this maintenance task..."
                value={completionNotes}
                onChange={(e) => setCompletionNotes(e.target.value)}
                rows={3}
              />
            </div>
            
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowCompletionDialog(false)}>
                Cancel
              </Button>
              <Button onClick={confirmCompleteTask} disabled={isCompletingTask}>
                {isCompletingTask ? 'Completing...' : 'Complete Task'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default MaintenanceCalendar;
