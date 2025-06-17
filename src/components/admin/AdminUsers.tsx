
import React, { useState } from 'react';
import { useAdminUsers } from '@/hooks/useAdminUsers';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Search, Edit, MessageSquare } from 'lucide-react';

const AdminUsers = () => {
  const { users, isLoading, updateUser, addAdminNote } = useAdminUsers();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [noteText, setNoteText] = useState('');
  const [noteType, setNoteType] = useState('general');

  const filteredUsers = users.filter(user =>
    user.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleUpdateSubscription = (userId: string, status: string, tier: string) => {
    updateUser({
      userId,
      updates: {
        subscription_status: status,
        subscription_tier: tier,
        subscription_start_date: status !== 'free' ? new Date().toISOString() : null
      }
    });
  };

  const handleAddNote = () => {
    if (selectedUser && noteText.trim()) {
      addAdminNote({
        userId: selectedUser.id,
        note: noteText,
        noteType
      });
      setNoteText('');
      setNoteType('general');
    }
  };

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-32"></div>
          <div className="h-10 bg-gray-200 rounded"></div>
          <div className="space-y-2">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-16 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">User Management</h1>
        <p className="text-gray-600">Manage users and their subscriptions</p>
      </div>

      {/* Search */}
      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            placeholder="Search users by name or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Users Table */}
      <Card>
        <CardHeader>
          <CardTitle>Users ({filteredUsers.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredUsers.map((user) => (
              <div key={user.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex-1">
                  <div className="flex items-center gap-4">
                    <div>
                      <h3 className="font-medium text-gray-900">{user.full_name || 'No name'}</h3>
                      <p className="text-sm text-gray-600">{user.email}</p>
                    </div>
                    <div className="flex gap-2">
                      <Badge variant={user.subscription_status === 'active' ? 'default' : 'secondary'}>
                        {user.subscription_status}
                      </Badge>
                      <Badge variant="outline">
                        {user.subscription_tier}
                      </Badge>
                      {user.is_admin && (
                        <Badge variant="destructive">Admin</Badge>
                      )}
                    </div>
                  </div>
                  <div className="mt-2 text-sm text-gray-500">
                    Joined: {new Date(user.created_at).toLocaleDateString()} •
                    Credits: {user.free_credits_remaining || 0} remaining
                  </div>
                </div>
                <div className="flex gap-2">
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button variant="outline" size="sm">
                        <Edit className="w-4 h-4 mr-1" />
                        Edit
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Edit User: {user.full_name}</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div>
                          <Label>Subscription Status</Label>
                          <Select 
                            defaultValue={user.subscription_status}
                            onValueChange={(status) => {
                              const tier = status === 'free' ? 'basic' : user.subscription_tier;
                              handleUpdateSubscription(user.id, status, tier);
                            }}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="free">Free</SelectItem>
                              <SelectItem value="active">Active</SelectItem>
                              <SelectItem value="canceled">Canceled</SelectItem>
                              <SelectItem value="expired">Expired</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label>Subscription Tier</Label>
                          <Select 
                            defaultValue={user.subscription_tier}
                            onValueChange={(tier) => handleUpdateSubscription(user.id, user.subscription_status, tier)}
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
                    </DialogContent>
                  </Dialog>

                  <Dialog>
                    <DialogTrigger asChild>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => setSelectedUser(user)}
                      >
                        <MessageSquare className="w-4 h-4 mr-1" />
                        Note
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Add Admin Note</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div>
                          <Label>Note Type</Label>
                          <Select value={noteType} onValueChange={setNoteType}>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="general">General</SelectItem>
                              <SelectItem value="billing">Billing</SelectItem>
                              <SelectItem value="support">Support</SelectItem>
                              <SelectItem value="warning">Warning</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label>Note</Label>
                          <Textarea
                            value={noteText}
                            onChange={(e) => setNoteText(e.target.value)}
                            placeholder="Enter admin note..."
                          />
                        </div>
                        <Button onClick={handleAddNote} className="w-full">
                          Add Note
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminUsers;
