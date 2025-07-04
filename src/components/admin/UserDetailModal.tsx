
import React, { useState, useEffect } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { User, Crown, CreditCard, Shield, Database } from 'lucide-react';

interface UserProfile {
  id: string;
  email: string;
  full_name: string;
  is_admin: boolean;
  admin_role: string | null;
  subscription_status: string;
  subscription_tier: string;
  free_credits_remaining: number;
  total_credits_used: number;
  created_at: string;
  last_active: string | null;
  admin_permissions: any;
}

interface UserDetailModalProps {
  user: UserProfile | null;
  isOpen: boolean;
  onClose: () => void;
}

export const UserDetailModal: React.FC<UserDetailModalProps> = ({ user, isOpen, onClose }) => {
  const { user: currentUser } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [formData, setFormData] = useState<Partial<UserProfile>>({});
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  // Reset form data when user changes or modal opens
  useEffect(() => {
    if (user && isOpen) {
      console.log('Setting form data for user:', user);
      const initialData = {
        full_name: user.full_name || '',
        is_admin: user.is_admin,
        admin_role: user.admin_role || 'none',
        subscription_status: user.subscription_status,
        subscription_tier: user.subscription_tier,
        free_credits_remaining: user.free_credits_remaining,
      };
      setFormData(initialData);
      setHasUnsavedChanges(false);
      console.log('Initial form data:', initialData);
    }
  }, [user, isOpen]);

  const updateUserMutation = useMutation({
    mutationFn: async (updates: Partial<UserProfile>) => {
      if (!currentUser?.id || !user?.id) {
        throw new Error('User not authenticated or target user not found');
      }

      console.log('Updating user with data:', updates);

      const { data, error } = await supabase.rpc('admin_update_profile', {
        requesting_admin_id: currentUser.id,
        target_user_id: user.id,
        new_full_name: updates.full_name || user.full_name || '',
        new_is_admin: updates.is_admin ?? user.is_admin,
        new_admin_role: updates.admin_role === 'none' ? null : (updates.admin_role || user.admin_role),
        new_subscription_status: updates.subscription_status || user.subscription_status,
        new_subscription_tier: updates.subscription_tier || user.subscription_tier,
        new_free_credits_remaining: updates.free_credits_remaining ?? user.free_credits_remaining
      });

      if (error) {
        console.error('Update error:', error);
        throw error;
      }
      
      console.log('Update successful:', data);
      return data;
    },
    onSuccess: () => {
      // Invalidate all relevant queries to refresh data
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      queryClient.invalidateQueries({ queryKey: ['admin-users', ''] });
      setHasUnsavedChanges(false);
      toast({
        title: "User updated successfully",
        description: "All changes have been saved.",
      });
      onClose();
    },
    onError: (error: any) => {
      console.error('Update mutation error:', error);
      toast({
        title: "Update failed",
        description: error.message || 'An error occurred while updating the user',
        variant: "destructive",
      });
    },
  });

  const handleSave = () => {
    console.log('Saving form data:', formData);
    updateUserMutation.mutate(formData);
  };

  const handleInputChange = (field: keyof UserProfile, value: any) => {
    console.log('Field changed:', field, 'New value:', value);
    setFormData(prev => {
      const newData = { ...prev, [field]: value };
      console.log('Updated form data:', newData);
      return newData;
    });
    setHasUnsavedChanges(true);
  };

  const handleClose = () => {
    if (hasUnsavedChanges) {
      const confirmClose = window.confirm('You have unsaved changes. Are you sure you want to close?');
      if (!confirmClose) return;
    }
    setHasUnsavedChanges(false);
    onClose();
  };

  const getRoleBadge = (isAdmin: boolean, adminRole: string | null) => {
    if (isAdmin) {
      return (
        <Badge variant="default" className="bg-purple-100 text-purple-800">
          <Crown className="h-3 w-3 mr-1" />
          Admin
        </Badge>
      );
    }
    return (
      <Badge variant="outline">
        <User className="h-3 w-3 mr-1" />
        User
      </Badge>
    );
  };

  const getSubscriptionBadge = (status: string) => {
    const colors = {
      active: 'bg-green-100 text-green-800',
      free: 'bg-gray-100 text-gray-800',
      expired: 'bg-red-100 text-red-800',
      cancelled: 'bg-yellow-100 text-yellow-800',
    };

    return (
      <Badge className={colors[status as keyof typeof colors] || colors.free}>
        {status}
      </Badge>
    );
  };

  if (!user) return null;

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-purple-100 flex items-center justify-center">
              <User className="h-5 w-5 text-purple-600" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                Edit User Details
                {getRoleBadge(formData.is_admin ?? user.is_admin, formData.admin_role === 'none' ? null : (formData.admin_role ?? user.admin_role))}
                {hasUnsavedChanges && (
                  <Badge variant="secondary" className="text-xs bg-orange-100 text-orange-800">
                    Unsaved Changes
                  </Badge>
                )}
              </div>
              <DialogDescription className="text-left">
                {user.email}
              </DialogDescription>
            </div>
          </DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="basic" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="basic" className="flex items-center gap-2">
              <User className="h-4 w-4" />
              Basic Info
            </TabsTrigger>
            <TabsTrigger value="role" className="flex items-center gap-2">
              <Shield className="h-4 w-4" />
              Role & Permissions
            </TabsTrigger>
            <TabsTrigger value="subscription" className="flex items-center gap-2">
              <CreditCard className="h-4 w-4" />
              Subscription
            </TabsTrigger>
            <TabsTrigger value="metadata" className="flex items-center gap-2">
              <Database className="h-4 w-4" />
              Account Data
            </TabsTrigger>
          </TabsList>

          <TabsContent value="basic" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Basic Information</CardTitle>
                <CardDescription>
                  Update the user's basic profile information
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address</Label>
                    <Input
                      id="email"
                      type="email"
                      value={user.email}
                      disabled
                      className="bg-gray-50"
                    />
                    <p className="text-xs text-muted-foreground">
                      Email cannot be changed directly
                    </p>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="full_name">Full Name</Label>
                    <Input
                      id="full_name"
                      value={formData.full_name || ''}
                      onChange={(e) => handleInputChange('full_name', e.target.value)}
                      placeholder="Enter full name"
                    />
                  </div>
                </div>
                
                <Separator />
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Account Created</Label>
                    <div className="text-sm text-muted-foreground">
                      {new Date(user.created_at).toLocaleDateString()}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Last Active</Label>
                    <div className="text-sm text-muted-foreground">
                      {user.last_active
                        ? new Date(user.last_active).toLocaleDateString()
                        : 'Never'}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="role" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Role & Permissions</CardTitle>
                <CardDescription>
                  Manage the user's administrative roles and permissions
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="is_admin">Admin Status</Label>
                    <Select
                      value={(formData.is_admin ?? user.is_admin)?.toString()}
                      onValueChange={(value) => handleInputChange('is_admin', value === 'true')}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="false">User</SelectItem>
                        <SelectItem value="true">Admin</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="admin_role">Admin Role</Label>
                    <Select
                      value={formData.admin_role ?? user.admin_role ?? 'none'}
                      onValueChange={(value) => handleInputChange('admin_role', value)}
                      disabled={!(formData.is_admin ?? user.is_admin)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select role" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">None</SelectItem>
                        <SelectItem value="admin">Admin</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                {(formData.is_admin ?? user.is_admin) && (
                  <div className="p-4 bg-purple-50 rounded-lg">
                    <h4 className="font-medium text-purple-900 mb-2">Admin Permissions</h4>
                    <div className="text-sm text-purple-700">
                      Full admin access: User management, Analytics, Settings
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="subscription" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Subscription & Credits</CardTitle>
                <CardDescription>
                  Manage the user's subscription plan and credit balance
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="subscription_status">Subscription Status</Label>
                    <Select
                      value={formData.subscription_status ?? user.subscription_status}
                      onValueChange={(value) => handleInputChange('subscription_status', value)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="free">Free</SelectItem>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="expired">Expired</SelectItem>
                        <SelectItem value="cancelled">Cancelled</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="subscription_tier">Subscription Tier</Label>
                    <Select
                      value={formData.subscription_tier ?? user.subscription_tier}
                      onValueChange={(value) => handleInputChange('subscription_tier', value)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="basic">Basic</SelectItem>
                        <SelectItem value="pro">Pro</SelectItem>
                        <SelectItem value="premium">Premium</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <Separator />
                
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="credits">Free Credits Remaining</Label>
                    {getSubscriptionBadge(formData.subscription_status ?? user.subscription_status)}
                  </div>
                  <Input
                    id="credits"
                    type="number"
                    value={formData.free_credits_remaining ?? user.free_credits_remaining}
                    onChange={(e) => handleInputChange('free_credits_remaining', parseInt(e.target.value) || 0)}
                    min="0"
                  />
                  <div className="text-sm text-muted-foreground">
                    Total credits used: {user.total_credits_used}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="metadata" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Account Data</CardTitle>
                <CardDescription>
                  View additional account information and metadata
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 gap-4">
                  <div className="space-y-2">
                    <Label>User ID</Label>
                    <div className="text-sm font-mono bg-gray-50 p-2 rounded">
                      {user.id}
                    </div>
                  </div>
                  
                  <Separator />
                  
                  <div className="space-y-2">
                    <Label>Current Form Data (Debug)</Label>
                    <div className="text-sm bg-gray-50 p-3 rounded max-h-48 overflow-y-auto">
                      <pre className="whitespace-pre-wrap">
                        {JSON.stringify(formData, null, 2)}
                      </pre>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Original User Data (Debug)</Label>
                    <div className="text-sm bg-gray-50 p-3 rounded max-h-48 overflow-y-auto">
                      <pre className="whitespace-pre-wrap">
                        {JSON.stringify(user, null, 2)}
                      </pre>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <div className="flex justify-end gap-2 pt-4 border-t">
          <Button variant="outline" onClick={handleClose}>
            Cancel
          </Button>
          <Button 
            onClick={handleSave} 
            disabled={updateUserMutation.isPending || !hasUnsavedChanges}
            className={hasUnsavedChanges ? 'bg-orange-600 hover:bg-orange-700' : ''}
          >
            {updateUserMutation.isPending ? 'Saving...' : hasUnsavedChanges ? 'Save Changes' : 'No Changes'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
