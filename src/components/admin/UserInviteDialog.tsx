
import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { UserPlus } from 'lucide-react';

export const UserInviteDialog: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const inviteUserMutation = useMutation({
    mutationFn: async (data: { email: string; adminRole: string; adminPermissions: string[] }) => {
      // First create an admin invitation
      const { error: inviteError } = await supabase
        .from('admin_invitations')
        .insert({
          email: data.email,
          admin_role: data.adminRole,
          permissions: data.adminPermissions,
        });

      if (inviteError) throw inviteError;

      // In a real app, you'd send an email invitation here
      // For now, we'll just create the user directly with admin privileges
      const tempPassword = Math.random().toString(36).slice(-8);
      
      const { error: signUpError } = await supabase.auth.admin.createUser({
        email: data.email,
        password: tempPassword,
        email_confirm: true,
        user_metadata: {
          full_name: data.email.split('@')[0],
        }
      });

      if (signUpError) throw signUpError;

      return { email: data.email, tempPassword };
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      setIsOpen(false);
      toast({
        title: "User invited successfully",
        description: `Invitation sent to ${data.email}. Temporary password: ${data.tempPassword}`,
      });
    },
    onError: (error) => {
      toast({
        title: "Invitation failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    const email = formData.get('email') as string;
    const adminRole = formData.get('adminRole') as string;
    const isAdmin = formData.get('isAdmin') === 'true';
    
    const adminPermissions = isAdmin 
      ? adminRole === 'super_admin' 
        ? ['user_management', 'ticket_management', 'analytics', 'settings', 'admin_management']
        : ['ticket_management', 'analytics']
      : [];

    inviteUserMutation.mutate({
      email,
      adminRole: isAdmin ? adminRole : '',
      adminPermissions,
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button className="flex items-center gap-2">
          <UserPlus className="h-4 w-4" />
          Invite User
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Invite New User</DialogTitle>
          <DialogDescription>
            Send an invitation to a new user with specified permissions.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email Address</Label>
            <Input
              id="email"
              name="email"
              type="email"
              placeholder="user@example.com"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="isAdmin">User Type</Label>
            <Select name="isAdmin" defaultValue="false">
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="false">Regular User</SelectItem>
                <SelectItem value="true">Admin User</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="adminRole">Admin Role</Label>
            <Select name="adminRole" defaultValue="admin">
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="admin">Admin</SelectItem>
                <SelectItem value="super_admin">Super Admin</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={inviteUserMutation.isPending}>
              {inviteUserMutation.isPending ? 'Sending...' : 'Send Invitation'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
