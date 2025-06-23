
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Clock, UserPlus, AlertCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';

export const AdminTrialManagement: React.FC = () => {
  const [targetUserId, setTargetUserId] = useState('');
  const [extensionDays, setExtensionDays] = useState('3');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();

  const handleExtendTrial = async () => {
    toast({
      title: "Feature Disabled",
      description: "Trial functionality has been disabled. All features are now free.",
      variant: "destructive",
    });
  };

  const handleCreateDatabaseTrial = async () => {
    toast({
      title: "Feature Disabled",
      description: "Trial functionality has been disabled. All features are now free.",
      variant: "destructive",
    });
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-blue-600" />
            Trial Management (Disabled)
          </CardTitle>
          <CardDescription>
            Trial functionality has been disabled. All features are now free for all users.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <Label htmlFor="targetUserId">Target User ID</Label>
              <Input
                id="targetUserId"
                value={targetUserId}
                onChange={(e) => setTargetUserId(e.target.value)}
                placeholder="Enter user UUID"
                className="font-mono text-sm"
                disabled
              />
            </div>
            
            <div className="space-y-3">
              <Label htmlFor="extensionDays">Days</Label>
              <Input
                id="extensionDays"
                type="number"
                value={extensionDays}
                onChange={(e) => setExtensionDays(e.target.value)}
                placeholder="3"
                min="1"
                max="30"
                disabled
              />
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <Button 
              onClick={handleExtendTrial}
              disabled={true}
              className="flex items-center gap-2"
            >
              <Clock className="h-4 w-4" />
              Extend Trial (Disabled)
            </Button>
            
            <Button 
              onClick={handleCreateDatabaseTrial}
              disabled={true}
              variant="outline"
              className="flex items-center gap-2"
            >
              <UserPlus className="h-4 w-4" />
              Create Trial (Disabled)
            </Button>
          </div>

          <div className="bg-green-50 dark:bg-green-950/50 p-4 rounded-lg border border-green-200 dark:border-green-800">
            <div className="flex items-start gap-2">
              <AlertCircle className="h-5 w-5 text-green-600 mt-0.5" />
              <div className="space-y-2">
                <h4 className="font-medium text-green-800 dark:text-green-200">All Features Now Free</h4>
                <p className="text-sm text-green-700 dark:text-green-300">
                  Trial functionality has been removed. All users now have access to all features without restrictions.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
