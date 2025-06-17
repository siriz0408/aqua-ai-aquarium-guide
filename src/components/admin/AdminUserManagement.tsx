
import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Label } from '@/components/ui/label';
import { Search, Edit, UserPlus, Crown, User, Trash2 } from 'lucide-react';
import { UserInviteDialog } from './UserInviteDialog';

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
}

export const AdminUserManagement: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch users with improved query
  const { data: users = [], isLoading, error } = useQuery({
    queryKey: ['admin-users', searchTerm],
    queryFn: async () => {
      console.log('Fetching users with search term:', searchTerm);
      
      // First check if current user is admin
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('Not authenticated');
      }

      let query = supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (searchTerm) {
        query = query.or(`email.ilike.%${searchTerm}%,full_name.ilike.%${searchTerm}%`);
      }

      const { data, error } = await query;
      
      console.log('Users query result:', { data, error });
      
      if (error) {
        console.error('Error fetching users:', error);
        throw error;
      }
      
      return data as UserProfile[];
    },
    retry: 1,
  });

  // Update user mutation
  const updateUserMutation = useMutation({
    mutationFn: async (updates: { 
      userId: string; 
      is_admin: boolean; 
      admin_role: string | null; 
      subscription_status: string; 
      subscription_tier: string; 
      free_credits_remaining: number;
      full_name: string;
    }) => {
      console.log('Updating user:', updates);
      
      const { error } = await supabase
        .from('profiles')
        .update({
          is_admin: updates.is_admin,
          admin_role: updates.admin_role,
          subscription_status: updates.subscription_status,
          subscription_tier: updates.subscription_tier,
          free_credits_remaining: updates.free_credits_remaining,
          full_name: updates.full_name,
        })
        .eq('id', updates.userId);

      if (error) {
        console.error('Error updating user:', error);
        throw error;
      }
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

  // Delete user mutation
  const deleteUserMutation = useMutation({
    mutationFn: async (userId: string) => {
      console.log('Deleting user:', userId);
      
      // Delete user profile (this will cascade to auth.users due to foreign key)
      const { error } = await supabase
        .from('profiles')
        .delete()
        .eq('id', userId);

      if (error) {
        console.error('Error deleting user:', error);
        throw error;
      }
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

  const handleUpdateUser = (formData: FormData) => {
    if (!selectedUser) return;

    const updates = {
      userId: selectedUser.id,
      is_admin: formData.get('is_admin') === 'true',
      admin_role: formData.get('admin_role') as string || null,
      subscription_status: formData.get('subscription_status') as string,
      subscription_tier: formData.get('subscription_tier') as string,
      free_credits_remaining: parseInt(formData.get('free_credits_remaining') as string),
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
          onClick={() => queryClient.invalidateQueries({ queryKey: ['admin-users'] })}
          className="mt-4"
        >
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
        <UserInviteDialog />
      </div>

      {/* Users Table */}
      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>User</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Subscription</TableHead>
              <TableHead>Credits</TableHead>
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
              users.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>
                    <div>
                      <div className="font-medium">{user.full_name || 'No name'}</div>
                      <div className="text-sm text-muted-foreground">{user.email}</div>
                    </div>
                  </TableCell>
                  <TableCell>{getRoleBadge(user)}</TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      {getSubscriptionBadge(user.subscription_status)}
                      <div className="text-xs text-muted-foreground">{user.subscription_tier}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      <div>{user.free_credits_remaining} remaining</div>
                      <div className="text-muted-foreground">{user.total_credits_used} used</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm text-muted-foreground">
                      {user.last_active
                        ? new Date(user.last_active).toLocaleDateString()
                        : 'Never'}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEditUser(user)}
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
                              Are you sure you want to delete {user.email}? This action cannot be undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleDeleteUser(user.id)}
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

      {/* Edit User Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Edit User</DialogTitle>
            <DialogDescription>
              Update user information, permissions, and subscription details.
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
                      <SelectItem value="expired">Expired</SelectItem>
                      <SelectItem value="cancelled">Cancelled</SelectItem>
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
                      <SelectItem value="basic">Basic</SelectItem>
                      <SelectItem value="pro">Pro</SelectItem>
                      <SelectItem value="premium">Premium</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="free_credits_remaining">Free Credits Remaining</Label>
                <Input
                  name="free_credits_remaining"
                  type="number"
                  defaultValue={selectedUser.free_credits_remaining}
                  min="0"
                />
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
