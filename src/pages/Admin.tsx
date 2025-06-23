
import React from 'react';
import { Layout } from '@/components/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const Admin = () => {
  return (
    <Layout title="Admin Dashboard">
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Admin Features Removed</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              Admin functionality has been removed from this simplified version of the application.
              All features are now available to authenticated users.
            </p>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default Admin;
