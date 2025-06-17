
import React, { useState } from 'react';
import { useAdminAuth } from '@/hooks/useAdminAuth';
import { useAdminSettings } from '@/hooks/useAdminSettings';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { UserPlus, Shield, Settings as SettingsIcon, Trash2 } from 'lucide-react';
import { AdminProtectedRoute } from './AdminProtectedRoute';

const AdminSettings = () => {
  const { adminProfile } = useAdminAuth();
  const { 
    adminUsers, 
    invitations, 
    isLoading, 
    inviteAdmin, 
    updateAdminRole, 
    removeAdmin, 
    cancelInvitation 
  } = useAdminSettings();
  
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState('admin');

  const handleInviteAdmin = () => {
    if (inviteEmail.trim()) {
      inviteAdmin({
        email: inviteEmail,
        role: inviteRole as 'admin' | 'super_admin',
        permissions: inviteRole === 'super_admin' 
          ? ['user_management', 'ticket_management', 'analytics', 'settings', 'admin_management']
          : ['ticket_management', 'analytics']
      });
      setInviteEmail('');
      setInviteRole('admin');
    }
  };

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-48"></div>
          <div className="h-32 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <AdminProtectedRoute requiredPermission="settings">
      <div className="p-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Admin Settings</h1>
          <p className="text-gray-600">Manage administrators and system settings</p>
        </div>

        <Tabs defaultValue="admins" className="space-y-6">
          <TabsList>
            <TabsTrigger value="admins">Admin Management</TabsTrigger>
            <TabsTrigger value="invitations">Pending Invitations</TabsTrigger>
            <TabsTrigger value="system">System Settings</TabsTrigger>
          </TabsList>

          <TabsContent value="admins">
            <div className="space-y-6">
              {/* Invite New Admin */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <UserPlus className="w-5 h-5" />
                    Invite New Administrator
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex gap-4">
                    <div className="flex-1">
                      <Label>Email Address</Label>
                      <Input
                        value={inviteEmail}
                        onChange={(e) => setInviteEmail(e.target.value)}
                        placeholder="admin@example.com"
                        type="email"
                      />
                    </div>
                    <div className="w-48">
                      <Label>Role</Label>
                      <Select value={inviteRole} onValueChange={setInviteRole}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="admin">Admin</SelectItem>
                          <SelectItem value="super_admin">Super Admin</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="flex items-end">
                      <Button onClick={handleInviteAdmin}>
                        Send Invitation
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Current Admins */}
              <Card>
                <CardHeader>
                  <CardTitle>Current Administrators</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {adminUsers.map((admin) => (
                      <div key={admin.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex items-center gap-4">
                          <div>
                            <h3 className="font-medium text-gray-900">
                              {admin.full_name || 'No name'}
                            </h3>
                            <p className="text-sm text-gray-600">{admin.email}</p>
                          </div>
                          <div className="flex gap-2">
                            <Badge variant={admin.admin_role === 'super_admin' ? 'default' : 'secondary'}>
                              {admin.admin_role}
                            </Badge>
                            {admin.last_admin_login && (
                              <Badge variant="outline">
                                Last login: {new Date(admin.last_admin_login).toLocaleDateString()}
                              </Badge>
                            )}
                          </div>
                        </div>
                        {adminProfile?.admin_role === 'super_admin' && admin.id !== adminProfile.id && (
                          <div className="flex gap-2">
                            <Select
                              value={admin.admin_role || 'admin'}
                              onValueChange={(role) => updateAdminRole({
                                userId: admin.id,
                                role: role as 'admin' | 'super_admin'
                              })}
                            >
                              <SelectTrigger className="w-32">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="admin">Admin</SelectItem>
                                <SelectItem value="super_admin">Super Admin</SelectItem>
                              </SelectContent>
                            </Select>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => removeAdmin({ userId: admin.id })}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="invitations">
            <Card>
              <CardHeader>
                <CardTitle>Pending Invitations</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {invitations.length === 0 ? (
                    <p className="text-gray-500 text-center py-8">No pending invitations</p>
                  ) : (
                    invitations.map((invitation) => (
                      <div key={invitation.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div>
                          <h3 className="font-medium text-gray-900">{invitation.email}</h3>
                          <p className="text-sm text-gray-600">
                            Role: {invitation.admin_role} • 
                            Expires: {new Date(invitation.expires_at).toLocaleDateString()}
                          </p>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => cancelInvitation({ invitationId: invitation.id })}
                        >
                          Cancel
                        </Button>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="system">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <SettingsIcon className="w-5 h-5" />
                  System Settings
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">System configuration options will be available here.</p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AdminProtectedRoute>
  );
};

export default AdminSettings;
