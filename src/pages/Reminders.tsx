
import React, { useState } from 'react';
import { Layout } from '@/components/Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useTasks } from '@/hooks/useTasks';
import { Plus, Search, Filter, Calendar, Bell, CheckCircle, Clock, AlertTriangle } from 'lucide-react';
import TaskList from '@/components/TaskList';
import CreateTaskModal from '@/components/CreateTaskModal';
import ReminderSettings from '@/components/ReminderSettings';

const Reminders = () => {
  const { tasks, tasksLoading } = useTasks();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);

  // Filter tasks based on search and filters
  const filteredTasks = tasks.filter(task => {
    const matchesSearch = task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (task.description && task.description.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesStatus = statusFilter === 'all' || task.status === statusFilter;
    const matchesPriority = priorityFilter === 'all' || task.priority === priorityFilter;
    
    return matchesSearch && matchesStatus && matchesPriority;
  });

  // Group tasks by status
  const pendingTasks = filteredTasks.filter(task => task.status === 'pending');
  const inProgressTasks = filteredTasks.filter(task => task.status === 'in_progress');
  const completedTasks = filteredTasks.filter(task => task.status === 'completed');

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="h-4 w-4 text-orange-500" />;
      case 'in_progress':
        return <AlertTriangle className="h-4 w-4 text-blue-500" />;
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      default:
        return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusCount = (status: string) => {
    return filteredTasks.filter(task => task.status === status).length;
  };

  if (tasksLoading) {
    return (
      <Layout title="Reminders & Tasks">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout title="Reminders & Tasks">
      <div className="space-y-6 pb-20">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold">Tasks & Reminders</h1>
            <p className="text-muted-foreground">
              Manage your aquarium maintenance tasks and set reminders
            </p>
          </div>
          <Button onClick={() => setShowCreateModal(true)} className="w-full sm:w-auto">
            <Plus className="mr-2 h-4 w-4" />
            Add Task
          </Button>
        </div>

        {/* Search and Filters */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search tasks..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full sm:w-[140px]">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="in_progress">In Progress</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                </SelectContent>
              </Select>
              <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                <SelectTrigger className="w-full sm:w-[140px]">
                  <SelectValue placeholder="Priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Priority</SelectItem>
                  <SelectItem value="urgent">Urgent</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="low">Low</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Task Overview Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-2 mb-2">
                {getStatusIcon('pending')}
                <span className="font-medium">Pending</span>
              </div>
              <div className="text-2xl font-bold">{getStatusCount('pending')}</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-2 mb-2">
                {getStatusIcon('in_progress')}
                <span className="font-medium">In Progress</span>
              </div>
              <div className="text-2xl font-bold">{getStatusCount('in_progress')}</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-2 mb-2">
                {getStatusIcon('completed')}
                <span className="font-medium">Completed</span>
              </div>
              <div className="text-2xl font-bold">{getStatusCount('completed')}</div>
            </CardContent>
          </Card>
        </div>

        {/* Tasks Tabs */}
        <Tabs defaultValue="all" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="all">
              All ({filteredTasks.length})
            </TabsTrigger>
            <TabsTrigger value="pending">
              Pending ({pendingTasks.length})
            </TabsTrigger>
            <TabsTrigger value="in_progress">
              In Progress ({inProgressTasks.length})
            </TabsTrigger>
            <TabsTrigger value="completed">
              Completed ({completedTasks.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="space-y-4">
            <TaskList tasks={filteredTasks} onTaskSelect={setSelectedTaskId} />
          </TabsContent>

          <TabsContent value="pending" className="space-y-4">
            <TaskList tasks={pendingTasks} onTaskSelect={setSelectedTaskId} />
          </TabsContent>

          <TabsContent value="in_progress" className="space-y-4">
            <TaskList tasks={inProgressTasks} onTaskSelect={setSelectedTaskId} />
          </TabsContent>

          <TabsContent value="completed" className="space-y-4">
            <TaskList tasks={completedTasks} onTaskSelect={setSelectedTaskId} />
          </TabsContent>
        </Tabs>

        {/* Empty State */}
        {filteredTasks.length === 0 && (
          <Card className="p-8 text-center">
            <div className="space-y-4">
              <div className="text-6xl">📋</div>
              <div>
                <CardTitle className="text-xl mb-2">No Tasks Found</CardTitle>
                <CardDescription>
                  {searchTerm || statusFilter !== 'all' || priorityFilter !== 'all'
                    ? 'No tasks match your current filters. Try adjusting your search criteria.'
                    : 'Get started by creating your first task or chat with AquaBot for recommendations.'
                  }
                </CardDescription>
              </div>
              {!searchTerm && statusFilter === 'all' && priorityFilter === 'all' && (
                <div className="flex flex-col sm:flex-row gap-2 justify-center">
                  <Button onClick={() => setShowCreateModal(true)}>
                    <Plus className="mr-2 h-4 w-4" />
                    Create Task
                  </Button>
                  <Button variant="outline" onClick={() => window.location.href = '/aquabot'}>
                    Chat with AquaBot
                  </Button>
                </div>
              )}
            </div>
          </Card>
        )}
      </div>

      {/* Modals */}
      <CreateTaskModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
      />

      <ReminderSettings
        taskId={selectedTaskId}
        isOpen={!!selectedTaskId}
        onClose={() => setSelectedTaskId(null)}
      />
    </Layout>
  );
};

export default Reminders;
