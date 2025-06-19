
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { useNotificationPreferences } from '@/hooks/useNotificationPreferences';
import { useNotificationPermission } from '@/hooks/useNotificationPermission';
import { Bell, BellOff, Clock, AlertTriangle, Sparkles } from 'lucide-react';

const NotificationPreferences: React.FC = () => {
  const { preferences, updatePreferences, isUpdating } = useNotificationPreferences();
  const { permission, requestPermission, isSupported } = useNotificationPermission();

  const handleToggle = (key: string, value: boolean) => {
    updatePreferences({ [key]: value });
  };

  const handleSelectChange = (key: string, value: string | number) => {
    updatePreferences({ [key]: value });
  };

  const handleTimeChange = (key: string, value: string) => {
    updatePreferences({ [key]: value });
  };

  if (!isSupported) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BellOff className="h-5 w-5" />
            Notifications Not Supported
          </CardTitle>
          <CardDescription>
            Your browser doesn't support push notifications
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Permission Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Notification Permission
          </CardTitle>
          <CardDescription>
            Allow notifications to receive maintenance reminders and alerts
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">
                Status: {permission === 'granted' ? 'Enabled' : permission === 'denied' ? 'Blocked' : 'Not Set'}
              </p>
              <p className="text-sm text-muted-foreground">
                {permission === 'granted' && 'You will receive notifications'}
                {permission === 'denied' && 'Enable in your browser settings'}
                {permission === 'default' && 'Click to enable notifications'}
              </p>
            </div>
            {permission !== 'granted' && (
              <Button onClick={requestPermission} disabled={permission === 'denied'}>
                Enable Notifications
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Main Settings */}
      <Card>
        <CardHeader>
          <CardTitle>Notification Settings</CardTitle>
          <CardDescription>
            Customize when and how you receive notifications
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Master Toggle */}
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="enabled">Enable Notifications</Label>
              <p className="text-sm text-muted-foreground">
                Master switch for all notifications
              </p>
            </div>
            <Switch
              id="enabled"
              checked={preferences.enabled}
              onCheckedChange={(checked) => handleToggle('enabled', checked)}
              disabled={isUpdating || permission !== 'granted'}
            />
          </div>

          <Separator />

          {/* Time Preferences */}
          <div className="space-y-4">
            <h4 className="font-medium flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Timing Preferences
            </h4>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="time_of_day">Preferred Time</Label>
                <Input
                  id="time_of_day"
                  type="time"
                  value={preferences.time_of_day}
                  onChange={(e) => handleTimeChange('time_of_day', e.target.value)}
                  disabled={isUpdating || !preferences.enabled}
                />
                <p className="text-xs text-muted-foreground">
                  When to send daily task reminders
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="snooze_duration">Snooze Duration (hours)</Label>
                <Select
                  value={preferences.snooze_duration_hours.toString()}
                  onValueChange={(value) => handleSelectChange('snooze_duration_hours', parseInt(value))}
                  disabled={isUpdating || !preferences.enabled}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">1 hour</SelectItem>
                    <SelectItem value="4">4 hours</SelectItem>
                    <SelectItem value="8">8 hours</SelectItem>
                    <SelectItem value="24">1 day</SelectItem>
                    <SelectItem value="48">2 days</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="quiet_start">Quiet Hours Start</Label>
                <Input
                  id="quiet_start"
                  type="time"
                  value={preferences.quiet_hours_start || ''}
                  onChange={(e) => handleTimeChange('quiet_hours_start', e.target.value)}
                  disabled={isUpdating || !preferences.enabled}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="quiet_end">Quiet Hours End</Label>
                <Input
                  id="quiet_end"
                  type="time"
                  value={preferences.quiet_hours_end || ''}
                  onChange={(e) => handleTimeChange('quiet_hours_end', e.target.value)}
                  disabled={isUpdating || !preferences.enabled}
                />
              </div>
            </div>
          </div>

          <Separator />

          {/* Priority Threshold */}
          <div className="space-y-2">
            <Label htmlFor="priority_threshold">Priority Threshold</Label>
            <Select
              value={preferences.task_priority_threshold}
              onValueChange={(value) => handleSelectChange('task_priority_threshold', value)}
              disabled={isUpdating || !preferences.enabled}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="low">Low and above</SelectItem>
                <SelectItem value="medium">Medium and above</SelectItem>
                <SelectItem value="high">High and above</SelectItem>
                <SelectItem value="urgent">Urgent only</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              Only notify for tasks at or above this priority level
            </p>
          </div>

          <Separator />

          {/* Notification Types */}
          <div className="space-y-4">
            <h4 className="font-medium">Notification Types</h4>
            
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="due_tasks">Due Tasks</Label>
                  <p className="text-sm text-muted-foreground">
                    Daily reminders for tasks due today
                  </p>
                </div>
                <Switch
                  id="due_tasks"
                  checked={preferences.due_tasks_enabled}
                  onCheckedChange={(checked) => handleToggle('due_tasks_enabled', checked)}
                  disabled={isUpdating || !preferences.enabled}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="overdue_tasks">Overdue Tasks</Label>
                  <p className="text-sm text-muted-foreground">
                    Escalating reminders for overdue tasks
                  </p>
                </div>
                <Switch
                  id="overdue_tasks"
                  checked={preferences.overdue_tasks_enabled}
                  onCheckedChange={(checked) => handleToggle('overdue_tasks_enabled', checked)}
                  disabled={isUpdating || !preferences.enabled}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5 flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-red-500" />
                  <div>
                    <Label htmlFor="critical_alerts">Critical Alerts</Label>
                    <p className="text-sm text-muted-foreground">
                      Urgent parameter and equipment alerts
                    </p>
                  </div>
                </div>
                <Switch
                  id="critical_alerts"
                  checked={preferences.critical_alerts_enabled}
                  onCheckedChange={(checked) => handleToggle('critical_alerts_enabled', checked)}
                  disabled={isUpdating || !preferences.enabled}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5 flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-blue-500" />
                  <div>
                    <Label htmlFor="ai_insights">AI Insights</Label>
                    <p className="text-sm text-muted-foreground">
                      Helpful tips and recommendations from AquaAI
                    </p>
                  </div>
                </div>
                <Switch
                  id="ai_insights"
                  checked={preferences.ai_insights_enabled}
                  onCheckedChange={(checked) => handleToggle('ai_insights_enabled', checked)}
                  disabled={isUpdating || !preferences.enabled}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="group_notifications">Group Notifications</Label>
                  <p className="text-sm text-muted-foreground">
                    Combine multiple notifications into one
                  </p>
                </div>
                <Switch
                  id="group_notifications"
                  checked={preferences.group_notifications}
                  onCheckedChange={(checked) => handleToggle('group_notifications', checked)}
                  disabled={isUpdating || !preferences.enabled}
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default NotificationPreferences;
