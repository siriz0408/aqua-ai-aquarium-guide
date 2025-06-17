
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Settings, Database, Key, Globe } from 'lucide-react';

export const AdminSystemSettings: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="grid gap-6">
        {/* AI Feature Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Key className="h-5 w-5" />
              AI Feature Configuration
            </CardTitle>
            <CardDescription>
              Configure AI features and access controls
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="default-credits">Default Free Credits</Label>
              <Input
                id="default-credits"
                type="number"
                defaultValue="5"
                className="w-full"
              />
              <p className="text-sm text-muted-foreground">
                Number of free credits new users receive
              </p>
            </div>
            <Separator />
            <div className="space-y-4">
              <Label>Feature Access Control</Label>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="aquabot-enabled">AquaBot Chat</Label>
                    <p className="text-sm text-muted-foreground">Enable AI chat functionality</p>
                  </div>
                  <Switch id="aquabot-enabled" defaultChecked />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="setup-planner-enabled">Setup Planner</Label>
                    <p className="text-sm text-muted-foreground">Enable aquarium setup planning</p>
                  </div>
                  <Switch id="setup-planner-enabled" defaultChecked />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="image-analysis-enabled">Image Analysis</Label>
                    <p className="text-sm text-muted-foreground">Enable image analysis features</p>
                  </div>
                  <Switch id="image-analysis-enabled" defaultChecked />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* System Configuration */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              System Configuration
            </CardTitle>
            <CardDescription>
              General system settings and configurations
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="app-name">Application Name</Label>
              <Input
                id="app-name"
                defaultValue="AquaAI"
                className="w-full"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="support-email">Support Email</Label>
              <Input
                id="support-email"
                type="email"
                defaultValue="support@aquaai.com"
                className="w-full"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="max-file-size">Max Upload File Size (MB)</Label>
              <Input
                id="max-file-size"
                type="number"
                defaultValue="10"
                className="w-full"
              />
            </div>
          </CardContent>
        </Card>

        {/* Database Maintenance */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="h-5 w-5" />
              Database Maintenance
            </CardTitle>
            <CardDescription>
              Database optimization and maintenance tools
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Button variant="outline" className="w-full">
                Clean Old Logs
              </Button>
              <Button variant="outline" className="w-full">
                Optimize Database
              </Button>
              <Button variant="outline" className="w-full">
                Backup Data
              </Button>
              <Button variant="outline" className="w-full">
                Generate Reports
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* API Configuration */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe className="h-5 w-5" />
              API Configuration
            </CardTitle>
            <CardDescription>
              External API settings and rate limits
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="rate-limit">API Rate Limit (requests/minute)</Label>
              <Input
                id="rate-limit"
                type="number"
                defaultValue="60"
                className="w-full"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="timeout">Request Timeout (seconds)</Label>
              <Input
                id="timeout"
                type="number"
                defaultValue="30"
                className="w-full"
              />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="api-logging">Enable API Logging</Label>
                <p className="text-sm text-muted-foreground">Log all API requests and responses</p>
              </div>
              <Switch id="api-logging" defaultChecked />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex justify-end">
        <Button className="w-full md:w-auto">
          Save Settings
        </Button>
      </div>
    </div>
  );
};
