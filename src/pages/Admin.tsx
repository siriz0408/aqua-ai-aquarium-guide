
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Users, CreditCard, Settings, Activity, Webhook, Clock, BarChart3 } from 'lucide-react';
import { AdminUserManagement } from '@/components/admin/AdminUserManagement';
import { AdminSubscriptionManagement } from '@/components/admin/AdminSubscriptionManagement';
import { AdminSystemSettings } from '@/components/admin/AdminSystemSettings';
import { AdminActivityLogs } from '@/components/admin/AdminActivityLogs';
import { WebhookMonitor } from '@/components/admin/WebhookMonitor';
import { AdminTrialManagement } from '@/components/admin/AdminTrialManagement';
import { AdminDashboard } from '@/components/admin/AdminDashboard';
import { Layout } from '@/components/Layout';
import { checkAdminStatus } from '@/utils/adminAuth';

const Admin = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState<any>(null);
  const [profileLoading, setProfileLoading] = useState(true);

  useEffect(() => {
    const loadAdminProfile = async () => {
      try {
        const { profile: adminProfile } = await checkAdminStatus();
        setProfile(adminProfile);
      } catch (error) {
        console.error('Error loading admin profile:', error);
      } finally {
        setProfileLoading(false);
      }
    };

    if (user) {
      loadAdminProfile();
    }
  }, [user]);

  // Show loading while checking permissions
  if (profileLoading) {
    return (
      <Layout title="Admin Dashboard" loading>
        <div />
      </Layout>
    );
  }

  return (
    <Layout title="Admin Dashboard">
      <div className="space-y-6">
        <div className="mb-8">
          <p className="text-muted-foreground">
            Manage users, subscriptions, trials, and system settings for AquaAI
          </p>
          {profile && (
            <p className="text-sm text-muted-foreground mt-2">
              Welcome back, {profile.full_name} ({profile.admin_role})
            </p>
          )}
        </div>

        <Tabs defaultValue="dashboard" className="space-y-6">
          <TabsList className="grid w-full grid-cols-7">
            <TabsTrigger value="dashboard" className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              Dashboard
            </TabsTrigger>
            <TabsTrigger value="users" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Users
            </TabsTrigger>
            <TabsTrigger value="subscriptions" className="flex items-center gap-2">
              <CreditCard className="h-4 w-4" />
              Subscriptions
            </TabsTrigger>
            <TabsTrigger value="trials" className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Trials
            </TabsTrigger>
            <TabsTrigger value="webhooks" className="flex items-center gap-2">
              <Webhook className="h-4 w-4" />
              Webhooks
            </TabsTrigger>
            <TabsTrigger value="settings" className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              Settings
            </TabsTrigger>
            <TabsTrigger value="activity" className="flex items-center gap-2">
              <Activity className="h-4 w-4" />
              Activity
            </TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard">
            <AdminDashboard />
          </TabsContent>

          <TabsContent value="users">
            <Card>
              <CardHeader>
                <CardTitle>User Management</CardTitle>
                <CardDescription>
                  Manage user accounts, roles, and permissions
                </CardDescription>
              </CardHeader>
              <CardContent>
                <AdminUserManagement />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="subscriptions">
            <Card>
              <CardHeader>
                <CardTitle>Subscription Management</CardTitle>
                <CardDescription>
                  Monitor and manage user subscriptions and payments
                </CardDescription>
              </CardHeader>
              <CardContent>
                <AdminSubscriptionManagement />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="trials">
            <Card>
              <CardHeader>
                <CardTitle>Trial Management</CardTitle>
                <CardDescription>
                  Extend trials, create database trials, and manage trial access
                </CardDescription>
              </CardHeader>
              <CardContent>
                <AdminTrialManagement />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="webhooks">
            <Card>
              <CardHeader>
                <CardTitle>Webhook Monitoring</CardTitle>
                <CardDescription>
                  Monitor Stripe webhook events and troubleshoot sync issues
                </CardDescription>
              </CardHeader>
              <CardContent>
                <WebhookMonitor />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="settings">
            <Card>
              <CardHeader>
                <CardTitle>System Settings</CardTitle>
                <CardDescription>
                  Configure system-wide settings and features
                </CardDescription>
              </CardHeader>
              <CardContent>
                <AdminSystemSettings />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="activity">
            <Card>
              <CardHeader>
                <CardTitle>Activity Logs</CardTitle>
                <CardDescription>
                  Monitor system activity and admin actions
                </CardDescription>
              </CardHeader>
              <CardContent>
                <AdminActivityLogs />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
};

export default Admin;
