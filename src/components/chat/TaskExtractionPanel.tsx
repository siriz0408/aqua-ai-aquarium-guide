
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { ParsedTask } from '@/utils/taskParser';
import { Plus, ChevronDown, ChevronRight, Clock, Target, Calendar as CalendarIcon, Sparkles, Edit } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { useIsMobile } from '@/hooks/use-mobile';

interface TaskExtractionPanelProps {
  tasks: ParsedTask[];
  onAddTask: (task: ParsedTask) => void;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
}

interface TaskEditDialogProps {
  task: ParsedTask;
  isOpen: boolean;
  onClose: () => void;
  onSave: (task: ParsedTask) => void;
}

const TaskEditDialog: React.FC<TaskEditDialogProps> = ({ task, isOpen, onClose, onSave }) => {
  const [editedTask, setEditedTask] = useState<ParsedTask>(task);
  const [showCalendar, setShowCalendar] = useState(false);
  const isMobile = useIsMobile();

  const handleSave = () => {
    onSave(editedTask);
    onClose();
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'destructive';
      case 'medium': return 'default';
      case 'low': return 'secondary';
      default: return 'default';
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className={cn("max-w-md", isMobile && "max-w-[95vw]")}>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Edit className="h-4 w-4" />
            Edit Task Details
          </DialogTitle>
          <DialogDescription>
            Customize the task before adding it to your planner.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          <div>
            <Label htmlFor="title">Task Title</Label>
            <Input
              id="title"
              value={editedTask.title}
              onChange={(e) => setEditedTask(prev => ({ ...prev, title: e.target.value }))}
              placeholder="Enter task title..."
            />
          </div>
          
          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={editedTask.description}
              onChange={(e) => setEditedTask(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Enter task description..."
              rows={3}
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="priority">Priority</Label>
              <Select 
                value={editedTask.priority || 'medium'} 
                onValueChange={(value) => setEditedTask(prev => ({ ...prev, priority: value as 'low' | 'medium' | 'high' }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="category">Category</Label>
              <Select 
                value={editedTask.category || 'general'} 
                onValueChange={(value) => setEditedTask(prev => ({ ...prev, category: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="general">General</SelectItem>
                  <SelectItem value="water_management">Water Management</SelectItem>
                  <SelectItem value="testing">Testing</SelectItem>
                  <SelectItem value="feeding">Feeding</SelectItem>
                  <SelectItem value="maintenance">Maintenance</SelectItem>
                  <SelectItem value="equipment">Equipment</SelectItem>
                  <SelectItem value="livestock">Livestock</SelectItem>
                  <SelectItem value="health">Health</SelectItem>
                  <SelectItem value="environment">Environment</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div>
            <Label>Due Date (Optional)</Label>
            <Popover open={showCalendar} onOpenChange={setShowCalendar}>
              <PopoverTrigger asChild>
                <Button variant="outline" className="w-full justify-start text-left">
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {editedTask.dueDate ? format(editedTask.dueDate, 'PPP') : 'Select date'}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={editedTask.dueDate}
                  onSelect={(date) => {
                    setEditedTask(prev => ({ ...prev, dueDate: date }));
                    setShowCalendar(false);
                  }}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>
          
          <div>
            <Label htmlFor="frequency">Frequency (Optional)</Label>
            <Input
              id="frequency"
              value={editedTask.frequency || ''}
              onChange={(e) => setEditedTask(prev => ({ ...prev, frequency: e.target.value }))}
              placeholder="e.g., weekly, monthly, every 3 days"
            />
          </div>
        </div>
        
        <div className="flex justify-end gap-2 pt-4">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSave}>
            Add Task
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

const TaskExtractionPanel: React.FC<TaskExtractionPanelProps> = ({ 
  tasks, 
  onAddTask, 
  isCollapsed = false, 
  onToggleCollapse 
}) => {
  const [editingTask, setEditingTask] = useState<ParsedTask | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const isMobile = useIsMobile();

  if (tasks.length === 0) return null;

  const handleQuickAdd = (task: ParsedTask) => {
    console.log('Quick adding task:', task.title, 'Source:', task.source);
    onAddTask(task);
  };

  const handleEditTask = (task: ParsedTask) => {
    setEditingTask(task);
    setIsEditDialogOpen(true);
  };

  const handleSaveEditedTask = (editedTask: ParsedTask) => {
    console.log('Adding edited task:', editedTask.title, 'Source:', editedTask.source);
    onAddTask(editedTask);
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'destructive';
      case 'medium': return 'default';
      case 'low': return 'secondary';
      default: return 'default';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'testing': return '🧪';
      case 'water_management': return '💧';
      case 'feeding': return '🐟';
      case 'maintenance': return '🔧';
      case 'equipment': return '⚙️';
      case 'livestock': return '🐠';
      case 'health': return '🏥';
      case 'environment': return '🌊';
      default: return '📋';
    }
  };

  return (
    <>
      <Card className={cn("mt-3", isMobile && "mx-1")}>
        <Collapsible open={!isCollapsed} onOpenChange={onToggleCollapse}>
          <CollapsibleTrigger asChild>
            <CardHeader className={cn("pb-2 cursor-pointer hover:bg-muted/50 transition-colors", isMobile && "px-3 py-2")}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Sparkles className={cn("text-primary", isMobile ? "h-3 w-3" : "h-4 w-4")} />
                  <CardTitle className={cn("font-medium", isMobile ? "text-sm" : "text-base")}>
                    Found {tasks.length} actionable {tasks.length === 1 ? 'task' : 'tasks'}
                  </CardTitle>
                </div>
                {isCollapsed ? (
                  <ChevronRight className={cn(isMobile ? "h-3 w-3" : "h-4 w-4")} />
                ) : (
                  <ChevronDown className={cn(isMobile ? "h-3 w-3" : "h-4 w-4")} />
                )}
              </div>
              <CardDescription className={cn(isMobile ? "text-xs" : "text-sm")}>
                AI-extracted tasks ready to add to your planner
              </CardDescription>
            </CardHeader>
          </CollapsibleTrigger>
          
          <CollapsibleContent>
            <CardContent className={cn("pt-0 space-y-2", isMobile && "px-3 pb-3")}>
              {tasks.map((task, index) => (
                <div
                  key={index}
                  className={cn(
                    "flex items-start gap-3 p-3 rounded-lg border bg-card hover:bg-muted/50 transition-colors",
                    isMobile && "gap-2 p-2"
                  )}
                >
                  <div className="flex-shrink-0 text-xl">
                    {getCategoryIcon(task.category || 'general')}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <h4 className={cn("font-medium truncate", isMobile ? "text-sm" : "text-base")}>
                          {task.title}
                        </h4>
                        <p className={cn("text-muted-foreground mt-1 line-clamp-2", isMobile ? "text-xs" : "text-sm")}>
                          {task.description}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2 mt-2">
                      <Badge variant={getPriorityColor(task.priority || 'medium')} className={cn(isMobile && "text-xs px-1 py-0")}>
                        {task.priority || 'medium'}
                      </Badge>
                      
                      {task.dueDate && (
                        <Badge variant="outline" className={cn("text-muted-foreground", isMobile && "text-xs px-1 py-0")}>
                          <Clock className={cn("mr-1", isMobile ? "h-2 w-2" : "h-3 w-3")} />
                          {format(task.dueDate, 'MMM dd')}
                        </Badge>
                      )}
                      
                      {task.frequency && (
                        <Badge variant="outline" className={cn("text-muted-foreground", isMobile && "text-xs px-1 py-0")}>
                          <Target className={cn("mr-1", isMobile ? "h-2 w-2" : "h-3 w-3")} />
                          {task.frequency}
                        </Badge>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex flex-col gap-1">
                    <Button
                      size="sm"
                      onClick={() => handleQuickAdd(task)}
                      className={cn(isMobile ? "h-6 px-2 text-xs" : "h-7 px-3 text-xs")}
                    >
                      <Plus className={cn("mr-1", isMobile ? "h-2 w-2" : "h-3 w-3")} />
                      Add
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleEditTask(task)}
                      className={cn(isMobile ? "h-6 px-2 text-xs" : "h-7 px-3 text-xs")}
                    >
                      <Edit className={cn("mr-1", isMobile ? "h-2 w-2" : "h-3 w-3")} />
                      Edit
                    </Button>
                  </div>
                </div>
              ))}
            </CardContent>
          </CollapsibleContent>
        </Collapsible>
      </Card>
      
      {editingTask && (
        <TaskEditDialog
          task={editingTask}
          isOpen={isEditDialogOpen}
          onClose={() => {
            setIsEditDialogOpen(false);
            setEditingTask(null);
          }}
          onSave={handleSaveEditedTask}
        />
      )}
    </>
  );
};

export default TaskExtractionPanel;
