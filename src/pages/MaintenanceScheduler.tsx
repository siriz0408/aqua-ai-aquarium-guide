
import React, { useState } from 'react';
import { Layout } from '@/components/Layout';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import MaintenanceDashboard from '@/components/maintenance/MaintenanceDashboard';
import MaintenanceCalendar from '@/components/maintenance/MaintenanceCalendar';
import ScheduleGenerator from '@/components/maintenance/ScheduleGenerator';
import { useMaintenanceScheduler } from '@/hooks/useMaintenanceScheduler';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Calendar, BarChart3, Settings, Sparkles, Fish, Plus } from 'lucide-react';

interface Tank {
  id: string;
  name: string;
  size_gallons: number;
}

const MaintenanceScheduler = () => {
  const { user } = useAuth();
  const { schedules, schedulesLoading } = useMaintenanceScheduler();
  const [selectedTankId, setSelectedTankId] = useState<string>('all');

  // Fetch user's tanks
  const { data: tanks = [] } = useQuery({
    queryKey: ['user_tanks'],
    queryFn: async () => {
      if (!user) return [];
      
      const { data, error } = await supabase
        .from('aquariums')
        .select('id, name, size_gallons')
        .eq('user_id', user.id);

      if (error) {
        console.error('Error fetching tanks:', error);
        return [];
      }

      return data as Tank[];
    },
    enabled: !!user,
  });

  const filteredScheduleCount = selectedTankId === 'all' 
    ? schedules.length 
    : schedules.filter(s => s.tank_id === selectedTankId).length;

  if (schedulesLoading) {
    return (
      <Layout title="Maintenance Scheduler">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout title="Maintenance Scheduler">
      <div className="space-y-6 pb-20">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <Sparkles className="h-6 w-6 text-primary" />
              Intelligent Maintenance Scheduler
            </h1>
            <p className="text-muted-foreground">
              AI-powered maintenance scheduling tailored to your tank setup and experience
            </p>
          </div>
          
          {/* Tank Filter */}
          <div className="flex items-center gap-2">
            <Select value={selectedTankId} onValueChange={setSelectedTankId}>
              <SelectTrigger className="w-[200px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">
                  <div className="flex items-center gap-2">
                    <Fish className="h-4 w-4" />
                    All Tanks
                  </div>
                </SelectItem>
                {tanks.map((tank) => (
                  <SelectItem key={tank.id} value={tank.id}>
                    <div className="flex items-center gap-2">
                      <Fish className="h-4 w-4" />
                      {tank.name} ({tank.size_gallons}g)
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Badge variant="outline">
              {filteredScheduleCount} schedules
            </Badge>
          </div>
        </div>

        {/* Main Content */}
        {schedules.length === 0 ? (
          // No schedules state
          <Card className="p-8 text-center">
            <div className="space-y-4">
              <div className="text-6xl">🗓️</div>
              <div>
                <CardTitle className="text-xl mb-2">No Maintenance Schedules</CardTitle>
                <CardDescription>
                  Get started by generating an intelligent maintenance schedule for your tank.
                  Our AI will create a personalized schedule based on your tank type, size, and experience level.
                </CardDescription>
              </div>
              <div className="max-w-md mx-auto">
                <ScheduleGenerator />
              </div>
            </div>
          </Card>
        ) : (
          // Main interface with tabs
          <Tabs defaultValue="dashboard" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="dashboard" className="flex items-center gap-2">
                <BarChart3 className="h-4 w-4" />
                Dashboard
              </TabsTrigger>
              <TabsTrigger value="calendar" className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Calendar
              </TabsTrigger>
              <TabsTrigger value="generator" className="flex items-center gap-2">
                <Sparkles className="h-4 w-4" />
                Generator
              </TabsTrigger>
              <TabsTrigger value="settings" className="flex items-center gap-2">
                <Settings className="h-4 w-4" />
                Settings
              </TabsTrigger>
            </TabsList>

            <TabsContent value="dashboard" className="space-y-6">
              <MaintenanceDashboard 
                selectedTankId={selectedTankId === 'all' ? undefined : selectedTankId} 
              />
            </TabsContent>

            <TabsContent value="calendar" className="space-y-6">
              <MaintenanceCalendar 
                selectedTankId={selectedTankId === 'all' ? undefined : selectedTankId} 
              />
            </TabsContent>

            <TabsContent value="generator" className="space-y-6">
              <ScheduleGenerator />
            </TabsContent>

            <TabsContent value="settings" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Settings className="h-5 w-5" />
                    Schedule Settings
                  </CardTitle>
                  <CardDescription>
                    Customize your maintenance schedules and preferences
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="text-center py-8 text-muted-foreground">
                      <Settings className="h-8 w-8 mx-auto mb-2 opacity-50" />
                      <p className="text-sm">Schedule customization coming soon!</p>
                      <p className="text-xs">You'll be able to adjust frequencies, priorities, and notifications.</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        )}

        {/* Quick Info Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Sparkles className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-medium">Smart Scheduling</h3>
                  <p className="text-sm text-muted-foreground">
                    AI adjusts frequencies based on your tank and experience
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-100 rounded-lg">
                  <Calendar className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <h3 className="font-medium">Visual Planning</h3>
                  <p className="text-sm text-muted-foreground">
                    Calendar view helps you plan maintenance activities
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <BarChart3 className="h-5 w-5 text-purple-600" />
                </div>
                <div>
                  <h3 className="font-medium">Progress Tracking</h3>
                  <p className="text-sm text-muted-foreground">
                    Monitor completion rates and maintenance history
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
};

export default MaintenanceScheduler;
