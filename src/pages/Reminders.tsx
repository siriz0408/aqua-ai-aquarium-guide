
import React from 'react';
import { Layout } from '@/components/Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';

const Reminders = () => {
  return (
    <Layout title="Reminders">
      <div className="space-y-6 pb-20">
        <Card className="p-8 text-center">
          <div className="space-y-4">
            <div className="text-6xl">⏰</div>
            <div>
              <CardTitle className="text-xl mb-2">Maintenance Reminders</CardTitle>
              <CardDescription>
                Set up automated reminders for water changes, testing, and equipment maintenance
              </CardDescription>
            </div>
            <div className="text-sm text-muted-foreground space-y-2">
              <p>🚧 This feature is coming soon!</p>
              <p>In the next update, you'll be able to:</p>
              <ul className="text-left max-w-md mx-auto space-y-1">
                <li>• Set recurring water change reminders</li>
                <li>• Schedule equipment maintenance alerts</li>
                <li>• Track completion history</li>
                <li>• Get push notifications</li>
              </ul>
            </div>
            <Button disabled className="mt-4">
              <Plus className="mr-2 h-4 w-4" />
              Add Reminder (Coming Soon)
            </Button>
          </div>
        </Card>
      </div>
    </Layout>
  );
};

export default Reminders;
