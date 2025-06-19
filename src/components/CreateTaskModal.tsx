
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Switch } from '@/components/ui/switch';
import { useTasks, RecurrencePattern } from '@/hooks/useTasks';
import { CalendarIcon, Repeat } from 'lucide-react';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';

interface CreateTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const CreateTaskModal: React.FC<CreateTaskModalProps> = ({ isOpen, onClose }) => {
  const { createTask, isCreating } = useTasks();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    task_type: 'general',
    priority: 'medium' as const,
    due_date: undefined as Date | undefined,
    is_recurring: false,
  });

  const [recurrencePattern, setRecurrencePattern] = useState<RecurrencePattern>({
    type: 'daily',
    interval: 1,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title.trim()) return;

    try {
      createTask({
        title: formData.title.trim(),
        description: formData.description.trim() || undefined,
        task_type: formData.task_type,
        priority: formData.priority,
        due_date: formData.due_date?.toISOString().split('T')[0],
        is_recurring: formData.is_recurring,
        recurrence_pattern: formData.is_recurring ? recurrencePattern : undefined,
      });
      
      // Reset form
      setFormData({
        title: '',
        description: '',
        task_type: 'general',
        priority: 'medium',
        due_date: undefined,
        is_recurring: false,
      });
      
      setRecurrencePattern({
        type: 'daily',
        interval: 1,
      });
      
      onClose();
    } catch (error) {
      console.error('Error creating task:', error);
    }
  };

  const handleClose = () => {
    setFormData({
      title: '',
      description: '',
      task_type: 'general',
      priority: 'medium',
      due_date: undefined,
      is_recurring: false,
    });
    setRecurrencePattern({
      type: 'daily',
      interval: 1,
    });
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create New Task</DialogTitle>
          <DialogDescription>
            Add a new task to your aquarium maintenance schedule.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Task Title</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              placeholder="e.g., Water change, Test pH levels"
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="description">Description (Optional)</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Add any additional details about this task..."
              rows={3}
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="task_type">Task Type</Label>
              <Select value={formData.task_type} onValueChange={(value) => setFormData(prev => ({ ...prev, task_type: value }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="general">General</SelectItem>
                  <SelectItem value="water_change">Water Change</SelectItem>
                  <SelectItem value="testing">Testing</SelectItem>
                  <SelectItem value="feeding">Feeding</SelectItem>
                  <SelectItem value="equipment">Equipment</SelectItem>
                  <SelectItem value="maintenance">Maintenance</SelectItem>
                  <SelectItem value="cleaning">Cleaning</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="priority">Priority</Label>
              <Select value={formData.priority} onValueChange={(value) => setFormData(prev => ({ ...prev, priority: value as any }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="urgent">Urgent</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div className="space-y-2">
            <Label>Due Date (Optional)</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !formData.due_date && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {formData.due_date ? format(formData.due_date, "PPP") : "Pick a date"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={formData.due_date}
                  onSelect={(date) => setFormData(prev => ({ ...prev, due_date: date }))}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>

          {/* Recurring Task Toggle */}
          <div className="flex items-center space-x-2 py-2">
            <Switch
              id="recurring"
              checked={formData.is_recurring}
              onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_recurring: checked }))}
            />
            <Label htmlFor="recurring" className="flex items-center gap-2">
              <Repeat className="h-4 w-4" />
              Make this a recurring task
            </Label>
          </div>

          {/* Recurrence Options */}
          {formData.is_recurring && (
            <div className="space-y-4 p-4 border rounded-lg bg-muted/50">
              <Label className="text-sm font-medium">Recurrence Settings</Label>
              
              <div className="space-y-2">
                <Label htmlFor="recurrence_type">Repeat</Label>
                <Select 
                  value={recurrencePattern.type} 
                  onValueChange={(value) => setRecurrencePattern(prev => ({ 
                    ...prev, 
                    type: value as RecurrencePattern['type'],
                    interval: value === 'custom' ? prev.customDays || 1 : prev.interval || 1
                  }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="daily">Daily</SelectItem>
                    <SelectItem value="weekly">Weekly</SelectItem>
                    <SelectItem value="bi_weekly">Bi-weekly</SelectItem>
                    <SelectItem value="monthly">Monthly</SelectItem>
                    <SelectItem value="custom">Custom</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {(recurrencePattern.type === 'daily' || recurrencePattern.type === 'weekly' || recurrencePattern.type === 'monthly') && (
                <div className="space-y-2">
                  <Label htmlFor="interval">Every</Label>
                  <div className="flex items-center gap-2">
                    <Input
                      id="interval"
                      type="number"
                      min="1"
                      max="365"
                      value={recurrencePattern.interval || 1}
                      onChange={(e) => setRecurrencePattern(prev => ({ 
                        ...prev, 
                        interval: parseInt(e.target.value) || 1 
                      }))}
                      className="w-20"
                    />
                    <span className="text-sm text-muted-foreground">
                      {recurrencePattern.type === 'daily' ? 'day(s)' : 
                       recurrencePattern.type === 'weekly' ? 'week(s)' : 'month(s)'}
                    </span>
                  </div>
                </div>
              )}

              {recurrencePattern.type === 'custom' && (
                <div className="space-y-2">
                  <Label htmlFor="customDays">Every (days)</Label>
                  <Input
                    id="customDays"
                    type="number"
                    min="1"
                    max="365"
                    value={recurrencePattern.customDays || 1}
                    onChange={(e) => setRecurrencePattern(prev => ({ 
                      ...prev, 
                      customDays: parseInt(e.target.value) || 1 
                    }))}
                    placeholder="Number of days"
                  />
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="maxOccurrences">Maximum Occurrences (Optional)</Label>
                <Input
                  id="maxOccurrences"
                  type="number"
                  min="1"
                  value={recurrencePattern.maxOccurrences || ''}
                  onChange={(e) => setRecurrencePattern(prev => ({ 
                    ...prev, 
                    maxOccurrences: e.target.value ? parseInt(e.target.value) : undefined 
                  }))}
                  placeholder="Leave empty for infinite"
                />
              </div>

              <div className="space-y-2">
                <Label>End Date (Optional)</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !recurrencePattern.endDate && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {recurrencePattern.endDate ? format(new Date(recurrencePattern.endDate), "PPP") : "Pick an end date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={recurrencePattern.endDate ? new Date(recurrencePattern.endDate) : undefined}
                      onSelect={(date) => setRecurrencePattern(prev => ({ 
                        ...prev, 
                        endDate: date?.toISOString().split('T')[0] 
                      }))}
                      disabled={(date) => date < new Date()}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>
          )}
          
          <DialogFooter>
            <Button type="button" variant="outline" onClick={handleClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={isCreating || !formData.title.trim()}>
              {isCreating ? 'Creating...' : 'Create Task'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CreateTaskModal;
