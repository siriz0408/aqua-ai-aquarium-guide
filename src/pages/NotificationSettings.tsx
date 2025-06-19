
import React from 'react';
import { Layout } from '@/components/Layout';
import NotificationPreferences from '@/components/notifications/NotificationPreferences';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

const NotificationSettings = () => {
  const navigate = useNavigate();

  return (
    <Layout title="Notification Settings">
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate(-1)}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Notification Settings</h1>
            <p className="text-muted-foreground">
              Customize your notification preferences for maintenance reminders and alerts
            </p>
          </div>
        </div>

        <NotificationPreferences />
      </div>
    </Layout>
  );
};

export default NotificationSettings;
