
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Search, User, RefreshCw, AlertCircle, CheckCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface UserStatus {
  id: string;
  email: string;
  subscription_status: string;
  subscription_tier: string;
  stripe_customer_id?: string;
  stripe_subscription_id?: string;
  trial_start_date?: string;
  trial_end_date?: string;
  subscription_start_date?: string;
  subscription_end_date?: string;
  is_admin: boolean;
}

interface AccessResult {
  has_access: boolean;
  access_reason: string;
  trial_hours_remaining: number;
}

export const SubscriptionStatusChecker: React.FC = () => {
  const [searchEmail, setSearchEmail] = useState('');
  const [userStatus, setUserStatus] = useState<UserStatus | null>(null);
  const [accessResult, setAccessResult] = useState<AccessResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const checkUserStatus = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!searchEmail) {
      toast({
        title: "Error",
        description: "Please enter an email address",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      // Get user profile data
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('email', searchEmail)
        .single();

      if (profileError) {
        console.error('Error fetching user profile:', profileError);
        toast({
          title: "User Not Found",
          description: `No user found with email: ${searchEmail}`,
          variant: "destructive",
        });
        setUserStatus(null);
        setAccessResult(null);
        return;
      }

      setUserStatus(profileData);

      // Check access status using the database function
      const { data: accessData, error: accessError } = await supabase.rpc('check_user_subscription_access', {
        user_id: profileData.id
      });

      if (accessError) {
        console.error('Error checking access:', accessError);
      } else {
        const result = accessData?.[0];
        if (result) {
          setAccessResult({
            has_access: result.has_access,
            access_reason: result.access_type,
            trial_hours_remaining: result.trial_hours_remaining || 0
          });
        }
      }

      toast({
        title: "User Found",
        description: `Status retrieved for ${searchEmail}`,
      });
    } catch (error) {
      console.error('Exception checking user status:', error);
      toast({
        title: "Error",
        description: "An error occurred while checking user status",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const refreshUserStatus = async () => {
    if (!userStatus) return;

    setIsLoading(true);
    try {
      // Force refresh the user's access
      const { error: ensureError } = await supabase.rpc('ensure_user_profile', {
        user_id: userStatus.id
      });

      if (ensureError) {
        console.error('Error ensuring profile:', ensureError);
      }

      // Re-check the status
      await checkUserStatus({ preventDefault: () => {} } as React.FormEvent);
    } catch (error) {
      console.error('Error refreshing status:', error);
      toast({
        title: "Error",
        description: "Failed to refresh user status",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Search className="h-5 w-5 text-blue-600" />
        <h3 className="text-xl font-semibold">User Status Checker</h3>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Check User Subscription Status</CardTitle>
          <CardDescription>
            Search for a user by email to view their current subscription and access status
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={checkUserStatus} className="space-y-4">
            <div className="flex gap-2">
              <div className="flex-1">
                <Label htmlFor="searchEmail">User Email</Label>
                <Input
                  id="searchEmail"
                  type="email"
                  value={searchEmail}
                  onChange={(e) => setSearchEmail(e.target.value)}
                  placeholder="user@example.com"
                  required
                />
              </div>
              <div className="flex items-end">
                <Button type="submit" disabled={isLoading}>
                  {isLoading ? (
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Search className="h-4 w-4 mr-2" />
                  )}
                  Check Status
                </Button>
              </div>
            </div>
          </form>
        </CardContent>
      </Card>

      {userStatus && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span className="flex items-center gap-2">
                <User className="h-5 w-5" />
                User Status: {userStatus.email}
              </span>
              <Button variant="outline" size="sm" onClick={refreshUserStatus} disabled={isLoading}>
                {isLoading ? (
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <RefreshCw className="h-4 w-4 mr-2" />
                )}
                Refresh
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-sm font-medium">Subscription Status</Label>
                <div className="flex items-center gap-2 mt-1">
                  <Badge variant={userStatus.subscription_status === 'active' ? 'default' : 
                    userStatus.subscription_status === 'trial' ? 'secondary' : 'outline'}>
                    {userStatus.subscription_status}
                  </Badge>
                  {userStatus.is_admin && (
                    <Badge variant="default">Admin</Badge>
                  )}
                </div>
              </div>
              
              <div>
                <Label className="text-sm font-medium">Subscription Tier</Label>
                <div className="mt-1">
                  <Badge variant="outline">{userStatus.subscription_tier}</Badge>
                </div>
              </div>
            </div>

            <Separator />

            <div className="grid grid-cols-1 gap-2 text-sm">
              <div>
                <span className="font-medium">User ID:</span>
                <span className="ml-2 font-mono text-xs">{userStatus.id}</span>
              </div>
              
              {userStatus.stripe_customer_id && (
                <div>
                  <span className="font-medium">Stripe Customer ID:</span>
                  <span className="ml-2 font-mono text-xs">{userStatus.stripe_customer_id}</span>
                </div>
              )}
              
              {userStatus.stripe_subscription_id && (
                <div>
                  <span className="font-medium">Stripe Subscription ID:</span>
                  <span className="ml-2 font-mono text-xs">{userStatus.stripe_subscription_id}</span>
                </div>
              )}
            </div>

            {(userStatus.trial_start_date || userStatus.subscription_start_date) && (
              <>
                <Separator />
                <div className="grid grid-cols-2 gap-4 text-sm">
                  {userStatus.trial_start_date && (
                    <div>
                      <span className="font-medium">Trial Started:</span>
                      <div className="text-muted-foreground">
                        {new Date(userStatus.trial_start_date).toLocaleString()}
                      </div>
                    </div>
                  )}
                  
                  {userStatus.trial_end_date && (
                    <div>
                      <span className="font-medium">Trial Ends:</span>
                      <div className="text-muted-foreground">
                        {new Date(userStatus.trial_end_date).toLocaleString()}
                      </div>
                    </div>
                  )}
                  
                  {userStatus.subscription_start_date && (
                    <div>
                      <span className="font-medium">Subscription Started:</span>
                      <div className="text-muted-foreground">
                        {new Date(userStatus.subscription_start_date).toLocaleString()}
                      </div>
                    </div>
                  )}
                  
                  {userStatus.subscription_end_date && (
                    <div>
                      <span className="font-medium">Subscription Ends:</span>
                      <div className="text-muted-foreground">
                        {new Date(userStatus.subscription_end_date).toLocaleString()}
                      </div>
                    </div>
                  )}
                </div>
              </>
            )}

            {accessResult && (
              <>
                <Separator />
                <div className="p-4 rounded-lg bg-muted">
                  <h4 className="font-medium mb-2 flex items-center gap-2">
                    {accessResult.has_access ? (
                      <CheckCircle className="h-4 w-4 text-green-600" />
                    ) : (
                      <AlertCircle className="h-4 w-4 text-red-600" />
                    )}
                    Current Access Status
                  </h4>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="font-medium">Has Access:</span>
                      <Badge 
                        className="ml-2" 
                        variant={accessResult.has_access ? 'default' : 'destructive'}
                      >
                        {accessResult.has_access ? 'Yes' : 'No'}
                      </Badge>
                    </div>
                    <div>
                      <span className="font-medium">Access Reason:</span>
                      <span className="ml-2">{accessResult.access_reason}</span>
                    </div>
                    {accessResult.trial_hours_remaining > 0 && (
                      <div className="col-span-2">
                        <span className="font-medium">Trial Hours Remaining:</span>
                        <span className="ml-2">{Math.floor(accessResult.trial_hours_remaining)}</span>
                      </div>
                    )}
                  </div>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};
