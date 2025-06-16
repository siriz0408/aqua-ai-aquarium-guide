
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { useTasks } from '@/hooks/useTasks';
import { useToast } from '@/hooks/use-toast';
import { CalendarIcon, Bell } from 'lucide-react';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';

interface ReminderSettingsProps {
  taskId: string | null;
  isOpen: boolean;
  onClose: () => void;
}

const ReminderSettings: React.FC<ReminderSettingsProps> = ({ taskId, isOpen, onClose }) => {
  const { tasks } = useTasks();
  const { toast } = useToast();
  const [reminderSettings, setReminderSettings] = useState({
    enabled: false,
    frequency: 'once',
    reminderDate: undefined as Date | undefined,
    reminderTime: '09:00',
    browserNotifications: true,
  });

  const task = tasks.find(t => t.id === taskId);

  const handleSaveReminder = () => {
    if (!task) return;

    // For now, we'll just show a toast. In a real app, you'd save to a reminders table
    toast({
      title: "Reminder set",
      description: `You'll be reminded about "${task.title}" ${reminderSettings.frequency === 'once' ? 'once' : reminderSettings.frequency}.`,
    });

    // Request browser notification permission if enabled
    if (reminderSettings.browserNotifications && 'Notification' in window) {
      if (Notification.permission === 'default') {
        Notification.requestPermission().then(permission => {
          if (permission === 'granted') {
            toast({
              title: "Notifications enabled",
              description: "You'll receive browser notifications for your reminders.",
            });
          }
        });
      }
    }

    onClose();
  };

  if (!task) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Set Reminder
          </DialogTitle>
          <DialogDescription>
            Configure reminder settings for "{task.title}"
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="text-base">Enable Reminder</Label>
              <div className="text-sm text-muted-foreground">
                Get notified about this task
              </div>
            </div>
            <Switch
              checked={reminderSettings.enabled}
              onCheckedChange={(checked) => 
                setReminderSettings(prev => ({ ...prev, enabled: checked }))
              }
            />
          </div>

          {reminderSettings.enabled && (
            <>
              <div className="space-y-2">
                <Label>Frequency</Label>
                <Select 
                  value={reminderSettings.frequency} 
                  onValueChange={(value) => setReminderSettings(prev => ({ ...prev, frequency: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="once">One time</SelectItem>
                    <SelectItem value="daily">Daily</SelectItem>
                    <SelectItem value="weekly">Weekly</SelectItem>
                    <SelectItem value="monthly">Monthly</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Reminder Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !reminderSettings.reminderDate && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {reminderSettings.reminderDate ? format(reminderSettings.reminderDate, "PPP") : "Pick a date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={reminderSettings.reminderDate}
                      onSelect={(date) => setReminderSettings(prev => ({ ...prev, reminderDate: date }))}
                      initialFocus
                      disabled={(date) => date < new Date()}
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div className="space-y-2">
                <Label htmlFor="time">Reminder Time</Label>
                <Select 
                  value={reminderSettings.reminderTime} 
                  onValueChange={(value) => setReminderSettings(prev => ({ ...prev, reminderTime: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="max-h-[200px] overflow-y-auto">
                    {Array.from({ length: 24 }, (_, i) => {
                      const hour = i.toString().padStart(2, '0');
                      return (
                        <React.Fragment key={i}>
                          <SelectItem value={`${hour}:00`}>{hour}:00</SelectItem>
                          <SelectItem value={`${hour}:30`}>{hour}:30</SelectItem>
                        </React.Fragment>
                      );
                    })}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-base">Browser Notifications</Label>
                  <div className="text-sm text-muted-foreground">
                    Show notifications in your browser
                  </div>
                </div>
                <Switch
                  checked={reminderSettings.browserNotifications}
                  onCheckedChange={(checked) => 
                    setReminderSettings(prev => ({ ...prev, browserNotifications: checked }))
                  }
                />
              </div>
            </>
          )}
        </div>
        
        <DialogFooter>
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button 
            onClick={handleSaveReminder}
            disabled={reminderSettings.enabled && !reminderSettings.reminderDate}
          >
            Save Reminder
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ReminderSettings;
