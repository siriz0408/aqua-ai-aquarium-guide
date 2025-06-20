
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Clock, UserPlus, AlertCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';

export const AdminTrialManagement: React.FC = () => {
  const [targetUserId, setTargetUserId] = useState('');
  const [extensionDays, setExtensionDays] = useState('3');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();

  const handleExtendTrial = async () => {
    if (!user?.id || !targetUserId.trim()) {
      toast({
        title: "Missing Information",
        description: "Please provide a valid user ID.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      const { data, error } = await supabase.rpc('admin_extend_user_trial', {
        admin_user_id: user.id,
        target_user_id: targetUserId.trim(),
        extension_days: parseInt(extensionDays) || 3
      });

      if (error) {
        console.error('Trial extension error:', error);
        toast({
          title: "Extension Failed",
          description: error.message,
          variant: "destructive",
        });
        return;
      }

      if (data.success) {
        toast({
          title: "Trial Extended! ✅",
          description: `User trial extended by ${data.extension_days} days. New end date: ${new Date(data.new_trial_end).toLocaleDateString()}`,
        });
        setTargetUserId('');
      } else {
        toast({
          title: "Extension Failed",
          description: data.error || "Unknown error occurred",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Unexpected error:', error);
      toast({
        title: "Error",
        description: "An unexpected error occurred.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateDatabaseTrial = async () => {
    if (!user?.id || !targetUserId.trim()) {
      toast({
        title: "Missing Information",
        description: "Please provide a valid user ID.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      const { data, error } = await supabase.rpc('start_user_trial_safe', {
        user_id: targetUserId.trim(),
        trial_length_days: parseInt(extensionDays) || 3,
        trial_type: 'database'
      });

      if (error) {
        console.error('Database trial creation error:', error);
        toast({
          title: "Trial Creation Failed",
          description: error.message,
          variant: "destructive",
        });
        return;
      }

      if (data.success) {
        toast({
          title: "Trial Created! ✅",
          description: `${data.trial_length_days}-day database trial created. Ends: ${new Date(data.trial_end_date).toLocaleDateString()}`,
        });
        setTargetUserId('');
      } else {
        toast({
          title: "Trial Creation Failed",
          description: data.error || "Unknown error occurred",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Unexpected error:', error);
      toast({
        title: "Error",
        description: "An unexpected error occurred.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-blue-600" />
            Trial Management
          </CardTitle>
          <CardDescription>
            Extend existing trials or create new database trials for users
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
              />
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <Button 
              onClick={handleExtendTrial}
              disabled={isLoading || !targetUserId.trim()}
              className="flex items-center gap-2"
            >
              <Clock className="h-4 w-4" />
              {isLoading ? "Extending..." : "Extend Existing Trial"}
            </Button>
            
            <Button 
              onClick={handleCreateDatabaseTrial}
              disabled={isLoading || !targetUserId.trim()}
              variant="outline"
              className="flex items-center gap-2"
            >
              <UserPlus className="h-4 w-4" />
              {isLoading ? "Creating..." : "Create Database Trial"}
            </Button>
          </div>

          <div className="bg-blue-50 dark:bg-blue-950/50 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
            <div className="flex items-start gap-2">
              <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5" />
              <div className="space-y-2">
                <h4 className="font-medium text-blue-800 dark:text-blue-200">Trial Types</h4>
                <ul className="text-sm text-blue-700 dark:text-blue-300 space-y-1">
                  <li><Badge variant="secondary" className="mr-2">Extend</Badge>Adds days to an existing trial or creates one if needed</li>
                  <li><Badge variant="outline" className="mr-2">Database</Badge>Creates instant trial without Stripe (prevents duplicate trials)</li>
                </ul>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
