
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RefreshCw, CheckCircle, Users } from 'lucide-react';
import { useUserAccessRefresh } from '@/hooks/useUserAccessRefresh';

interface UserAccessRefreshFormProps {
  onResult: (result: any) => void;
}

export const UserAccessRefreshForm: React.FC<UserAccessRefreshFormProps> = ({ onResult }) => {
  const { refreshUserAccess, isLoading } = useUserAccessRefresh();
  const [refreshUserId, setRefreshUserId] = useState('');

  const handleRefreshAccess = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!refreshUserId) {
      return;
    }

    const result = await refreshUserAccess(refreshUserId);
    onResult(result);
    
    if (result.success) {
      setRefreshUserId('');
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="h-4 w-4" />
          Refresh User Access
        </CardTitle>
        <CardDescription>
          Refresh and check a user's access status using their user ID
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleRefreshAccess} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="refreshUserId">User ID</Label>
            <Input
              id="refreshUserId"
              value={refreshUserId}
              onChange={(e) => setRefreshUserId(e.target.value)}
              placeholder="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
              required
            />
          </div>
          
          <Button type="submit" disabled={isLoading} className="w-full">
            {isLoading ? (
              <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <CheckCircle className="h-4 w-4 mr-2" />
            )}
            Refresh Access
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};
