
import React, { useState } from 'react';
import { Layout } from '@/components/Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import { useCredits } from '@/hooks/useCredits';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Loader2, User, CreditCard, Crown, Zap, Settings } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

const Profile = () => {
  const { user } = useAuth();
  const { profile, usageLogs, getUserPlanType, getRemainingCredits } = useCredits();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [fullName, setFullName] = useState(profile?.full_name || '');
  const [isUpdating, setIsUpdating] = useState(false);

  const updateProfileMutation = useMutation({
    mutationFn: async (data: { full_name: string }) => {
      if (!user) throw new Error('No user found');
      
      const { error } = await supabase
        .from('profiles')
        .update(data)
        .eq('id', user.id);
        
      if (error) throw error;
    },
    onSuccess: () => {
      toast({
        title: 'Profile updated',
        description: 'Your profile has been updated successfully.',
      });
      queryClient.invalidateQueries({ queryKey: ['userProfile'] });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: 'Failed to update profile. Please try again.',
        variant: 'destructive',
      });
      console.error('Profile update error:', error);
    },
  });

  const handleUpdateProfile = async () => {
    if (!fullName.trim()) {
      toast({
        title: 'Error',
        description: 'Please enter your full name.',
        variant: 'destructive',
      });
      return;
    }

    setIsUpdating(true);
    try {
      await updateProfileMutation.mutateAsync({ full_name: fullName });
    } finally {
      setIsUpdating(false);
    }
  };

  const planType = getUserPlanType();
  const displayCredits = getRemainingCredits();

  const getPlanDetails = () => {
    switch (planType) {
      case 'super_admin':
        return {
          name: 'Super Admin',
          description: 'Full system access with unlimited features',
          color: 'bg-red-600',
          icon: Crown,
          features: ['Unlimited chat messages', 'Admin dashboard access', 'User management', 'All premium features']
        };
      case 'admin':
        return {
          name: 'Admin',
          description: 'Administrative access with unlimited chat',
          color: 'bg-orange-600',
          icon: Settings,
          features: ['Unlimited chat messages', 'Admin dashboard access', 'All premium features']
        };
      case 'premium':
        return {
          name: 'Premium',
          description: 'Unlimited access to all features',
          color: 'bg-purple-600',
          icon: Crown,
          features: ['Unlimited chat messages', 'Priority support', 'Advanced features', 'No restrictions']
        };
      case 'basic':
        return {
          name: 'Basic',
          description: '100 chat messages per month',
          color: 'bg-blue-600',
          icon: Zap,
          features: ['100 chat messages/month', 'All planner features', 'Educational content', 'Email support']
        };
      default:
        return {
          name: 'Free',
          description: '5 chat messages total',
          color: 'bg-gray-600',
          icon: User,
          features: ['5 chat messages total', 'Setup planner access', 'Educational content', 'Community support']
        };
    }
  };

  const planDetails = getPlanDetails();
  const PlanIcon = planDetails.icon;

  if (!user || !profile) {
    return (
      <Layout title="Profile">
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      </Layout>
    );
  }

  return (
    <Layout title="Profile & Settings">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Profile & Settings</h1>
            <p className="text-muted-foreground">Manage your account and subscription</p>
          </div>
        </div>

        <Tabs defaultValue="profile" className="space-y-6">
          <TabsList>
            <TabsTrigger value="profile">Profile</TabsTrigger>
            <TabsTrigger value="subscription">Subscription</TabsTrigger>
            <TabsTrigger value="usage">Usage History</TabsTrigger>
          </TabsList>

          <TabsContent value="profile" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Personal Information</CardTitle>
                <CardDescription>Update your personal details</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <Input id="email" value={user.email || ''} disabled />
                  <p className="text-xs text-muted-foreground">Email cannot be changed</p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="fullName">Full Name</Label>
                  <Input
                    id="fullName"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Enter your full name"
                  />
                </div>
                <Button 
                  onClick={handleUpdateProfile} 
                  disabled={isUpdating}
                  className="w-full sm:w-auto"
                >
                  {isUpdating ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Updating...
                    </>
                  ) : (
                    'Update Profile'
                  )}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="subscription" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Current Plan</CardTitle>
                <CardDescription>Your subscription details and usage</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between p-6 border rounded-lg">
                  <div className="flex items-center space-x-4">
                    <div className={`p-3 rounded-full ${planDetails.color}`}>
                      <PlanIcon className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold">{planDetails.name}</h3>
                      <p className="text-muted-foreground">{planDetails.description}</p>
                      <div className="flex items-center gap-2 mt-2">
                        {displayCredits !== null ? (
                          <Badge variant="outline">
                            {displayCredits} credits remaining
                          </Badge>
                        ) : (
                          <Badge variant="default">Unlimited access</Badge>
                        )}
                      </div>
                    </div>
                  </div>
                  {planType === 'free' || planType === 'basic' ? (
                    <Button>
                      <CreditCard className="mr-2 h-4 w-4" />
                      Upgrade Plan
                    </Button>
                  ) : planType === 'premium' ? (
                    <Button variant="outline">
                      <Settings className="mr-2 h-4 w-4" />
                      Manage Subscription
                    </Button>
                  ) : null}
                </div>

                <div className="mt-6">
                  <h4 className="font-semibold mb-3">Plan Features</h4>
                  <ul className="space-y-2">
                    {planDetails.features.map((feature, index) => (
                      <li key={index} className="flex items-center space-x-2">
                        <div className="h-2 w-2 bg-green-500 rounded-full"></div>
                        <span className="text-sm">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="usage" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Usage History</CardTitle>
                <CardDescription>Track your chat usage and credits</CardDescription>
              </CardHeader>
              <CardContent>
                {usageLogs.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">No usage history yet</p>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Date</TableHead>
                        <TableHead>Feature</TableHead>
                        <TableHead>Credits Before</TableHead>
                        <TableHead>Credits After</TableHead>
                        <TableHead>Plan</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {usageLogs.map((log) => (
                        <TableRow key={log.id}>
                          <TableCell>
                            {new Date(log.created_at).toLocaleDateString()}
                          </TableCell>
                          <TableCell className="capitalize">{log.feature_used}</TableCell>
                          <TableCell>{log.credits_before}</TableCell>
                          <TableCell>{log.credits_after}</TableCell>
                          <TableCell>
                            <Badge variant="outline" className="capitalize">
                              {log.subscription_status}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
};

export default Profile;
