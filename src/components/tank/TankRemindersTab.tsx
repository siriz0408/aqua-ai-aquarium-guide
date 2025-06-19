
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Plus } from 'lucide-react';

interface TankRemindersTabProps {
  onNavigate: (path: string) => void;
}

const TankRemindersTab: React.FC<TankRemindersTabProps> = ({ onNavigate }) => {
  return (
    <Card className="p-8 text-center">
      <div className="space-y-4">
        <div className="text-4xl">⏰</div>
        <div>
          <h4 className="font-medium">No reminders set</h4>
          <p className="text-sm text-muted-foreground">Set up maintenance reminders for your tank</p>
        </div>
        <Button onClick={() => onNavigate('/reminders')}>
          <Plus className="mr-2 h-4 w-4" />
          Add Reminder
        </Button>
      </div>
    </Card>
  );
};

export default TankRemindersTab;
