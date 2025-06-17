
import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Label } from '@/components/ui/label';
import { Search, Edit, UserPlus, Crown, User, Trash2, RefreshCw } from 'lucide-react';
import { UserInviteDialog } from './UserInviteDialog';
import { UserDetailModal } from './UserDetailModal';

interface UserProfile {
  id: string;
  email: string;
  full_name: string;
  is_admin: boolean;
  admin_role: string | null;
  subscription_status: string;
  subscription_tier: string;
  free_credits_remaining: number; // This will be 0 but kept for compatibility
  total_credits_used: number; // This will be 0 but kept for compatibility
  created_at: string;
  last_active: string | null;
  admin_permissions: any;
}

export const AdminUserManagement: React.FC = () => {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch users using the admin function that bypasses RLS
  const { data: users = [], isLoading, error, refetch } = useQuery({
    queryKey: ['admin-users', searchTerm],
    queryFn: async () => {
      console.log('Fetching users using admin function...');
      
      if (!user?.id) {
        throw new Error('User not authenticated');
      }

      // Use the updated admin function to get all profiles
      const { data, error: functionError } = await supabase.rpc('admin_get_all_profiles', {
        requesting_admin_id: user.id
      });
      
      if (functionError) {
        console.error('Error fetching profiles with admin function:', functionError);
        throw functionError;
      }
      
      console.log('Raw data from admin function:', data);
      
      // Filter by search term if provided
      let filteredData = data || [];
      if (searchTerm && Array.isArray(filteredData)) {
        filteredData = filteredData.filter((profile) => 
          profile.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          profile.full_name?.toLowerCase().includes(searchTerm.toLowerCase())
        );
      }
      
      console.log('Filtered data:', filteredData);
      return filteredData as UserProfile[];
    },
    retry: 2,
    enabled: !!user?.id,
    refetchOnWindowFocus: false,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  // Force refresh function
  const handleRefresh = () => {
    console.log('Manually refreshing user data...');
    refetch();
    toast({
      title: "Refreshing data",
      description: "Fetching the latest user information...",
    });
  };

  // Update user mutation using the admin function
  const updateUserMutation = useMutation({
    mutationFn: async (updates: { 
      userId: string; 
      is_admin: boolean; 
      admin_role: string | null; 
      subscription_status: string; 
      subscription_tier: string; 
      full_name: string;
    }) => {
      console.log('Updating user with admin function:', updates);
      
      if (!user?.id) {
        throw new Error('User not authenticated');
      }

      // Use the updated admin function to update the profile (credits parameter ignored)
      const { data, error } = await supabase.rpc('admin_update_profile', {
        requesting_admin_id: user.id,
        target_user_id: updates.userId,
        new_full_name: updates.full_name,
        new_is_admin: updates.is_admin,
        new_admin_role: updates.admin_role,
        new_subscription_status: updates.subscription_status,
        new_subscription_tier: updates.subscription_tier,
        new_free_credits_remaining: 0 // Ignored by the function now
      });

      if (error) {
        console.error('Error updating user with admin function:', error);
        throw error;
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      setIsEditDialogOpen(false);
      setSelectedUser(null);
      toast({
        title: "User updated",
        description: "User profile has been successfully updated.",
      });
    },
    onError: (error) => {
      console.error('Update user error:', error);
      toast({
        title: "Update failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Delete user mutation using the admin function
  const deleteUserMutation = useMutation({
    mutationFn: async (userId: string) => {
      console.log('Deleting user with admin function:', userId);
      
      if (!user?.id) {
        throw new Error('User not authenticated');
      }

      // Use the admin function to delete the profile
      const { data, error } = await supabase.rpc('admin_delete_profile', {
        requesting_admin_id: user.id,
        target_user_id: userId
      });

      if (error) {
        console.error('Error deleting user with admin function:', error);
        throw error;
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      toast({
        title: "User deleted",
        description: "User has been successfully deleted.",
      });
    },
    onError: (error) => {
      console.error('Delete user error:', error);
      toast({
        title: "Delete failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleEditUser = (user: UserProfile) => {
    setSelectedUser(user);
    setIsEditDialogOpen(true);
  };

  const handleViewUserDetail = (user: UserProfile) => {
    console.log('Opening detail modal for user:', user);
    setSelectedUser(user);
    setIsDetailModalOpen(true);
  };

  const handleUpdateUser = (formData: FormData) => {
    if (!selectedUser) return;

    const updates = {
      userId: selectedUser.id,
      is_admin: formData.get('is_admin') === 'true',
      admin_role: formData.get('admin_role') as string || null,
      subscription_status: formData.get('subscription_status') as string,
      subscription_tier: formData.get('subscription_tier') as string,
      full_name: formData.get('full_name') as string,
    };

    updateUserMutation.mutate(updates);
  };

  const handleDeleteUser = (userId: string) => {
    deleteUserMutation.mutate(userId);
  };

  const getRoleBadge = (user: UserProfile) => {
    if (user.is_admin) {
      return (
        <Badge variant="default" className="bg-purple-100 text-purple-800">
          <Crown className="h-3 w-3 mr-1" />
          {user.admin_role || 'Admin'}
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

  if (error) {
    console.error('AdminUserManagement error:', error);
    return (
      <div className="text-center py-8">
        <p className="text-red-600">Error loading users: {error.message}</p>
        <Button 
          onClick={handleRefresh}
          className="mt-4"
        >
          <RefreshCw className="h-4 w-4 mr-2" />
          Retry
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with Search and Actions */}
      <div className="flex items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search users by email or name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleRefresh} size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <UserInviteDialog />
        </div>
      </div>

      {/* Debug Info */}
      <div className="text-xs text-muted-foreground">
        Total users loaded: {users.length} | Search term: "{searchTerm}" | Loading: {isLoading.toString()}
      </div>

      {/* Users Table */}
      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>User</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Subscription</TableHead>
              <TableHead>Plan Type</TableHead>
              <TableHead>Last Active</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary mx-auto"></div>
                  <p className="mt-2 text-muted-foreground">Loading users...</p>
                </TableCell>
              </TableRow>
            ) : users.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                  {searchTerm ? 'No users found matching your search' : 'No users found'}
                </TableCell>
              </TableRow>
            ) : (
              users.map((userItem) => (
                <TableRow 
                  key={userItem.id} 
                  className="cursor-pointer hover:bg-muted/50"
                  onClick={() => handleViewUserDetail(userItem)}
                >
                  <TableCell>
                    <div>
                      <div className="font-medium">{userItem.full_name || 'No name'}</div>
                      <div className="text-sm text-muted-foreground">{userItem.email}</div>
                    </div>
                  </TableCell>
                  <TableCell>{getRoleBadge(userItem)}</TableCell>
                  <TableCell>{getSubscriptionBadge(userItem.subscription_status)}</TableCell>
                  <TableCell>
                    <Badge variant={userItem.subscription_tier === 'pro' ? 'default' : 'secondary'}>
                      {userItem.subscription_tier === 'pro' ? 'Pro' : 'Free'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm text-muted-foreground">
                      {userItem.last_active
                        ? new Date(userItem.last_active).toLocaleDateString()
                        : 'Never'}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEditUser(userItem)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="outline" size="sm">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete User</AlertDialogTitle>
                            <AlertDialogDescription>
                              Are you sure you want to delete {userItem.email}? This action cannot be undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleDeleteUser(userItem.id)}
                              className="bg-red-600 hover:bg-red-700"
                            >
                              Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* User Detail Modal */}
      <UserDetailModal
        user={selectedUser}
        isOpen={isDetailModalOpen}
        onClose={() => {
          setIsDetailModalOpen(false);
          setSelectedUser(null);
          // Refresh data when modal closes to show any updates
          handleRefresh();
        }}
      />

      {/* Edit User Dialog - Simplified for new model */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Quick Edit User</DialogTitle>
            <DialogDescription>
              Update user subscription and admin settings.
            </DialogDescription>
          </DialogHeader>
          {selectedUser && (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                const formData = new FormData(e.currentTarget);
                handleUpdateUser(formData);
              }}
              className="space-y-4"
            >
              <div className="space-y-2">
                <Label htmlFor="full_name">Full Name</Label>
                <Input
                  name="full_name"
                  defaultValue={selectedUser.full_name || ''}
                  placeholder="User's full name"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="is_admin">Admin Status</Label>
                  <Select name="is_admin" defaultValue={selectedUser.is_admin.toString()}>
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
                  <Select name="admin_role" defaultValue={selectedUser.admin_role || ''}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">None</SelectItem>
                      <SelectItem value="admin">Admin</SelectItem>
                      <SelectItem value="super_admin">Super Admin</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="subscription_status">Subscription Status</Label>
                  <Select name="subscription_status" defaultValue={selectedUser.subscription_status}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="free">Free</SelectItem>
                      <SelectItem value="active">Active</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="subscription_tier">Subscription Tier</Label>
                  <Select name="subscription_tier" defaultValue={selectedUser.subscription_tier}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="free">Free</SelectItem>
                      <SelectItem value="pro">Pro</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={updateUserMutation.isPending}>
                  {updateUserMutation.isPending ? 'Updating...' : 'Update User'}
                </Button>
              </div>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};
