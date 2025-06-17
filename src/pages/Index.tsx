
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Layout } from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAquarium } from '@/contexts/AquariumContext';
import { Fish, Droplets, Plus, MessageCircle, BookOpen, Wrench, TestTube2, Calendar } from 'lucide-react';
import { SubscriptionBanner } from '@/components/SubscriptionBanner';
import { Badge } from '@/components/ui/badge';
import TaskRecommendations from '@/components/TaskRecommendations';

const Index = () => {
  const navigate = useNavigate();
  const { tanks: aquariums, isLoading } = useAquarium();

  const handleAddTank = () => {
    navigate('/add-tank');
  };

  const quickActions = [
    {
      title: 'Chat with AquaBot',
      description: 'Get expert advice for your aquarium',
      icon: MessageCircle,
      action: () => navigate('/aquabot'),
      color: 'bg-blue-500 hover:bg-blue-600',
    },
    {
      title: 'Setup Planner',
      description: 'Plan your next aquarium setup',
      icon: Wrench,
      action: () => navigate('/setup-planner'),
      color: 'bg-green-500 hover:bg-green-600',
    },
    {
      title: 'Learn & Explore',
      description: 'Browse fish and equipment guides',
      icon: BookOpen,
      action: () => navigate('/education'),
      color: 'bg-purple-500 hover:bg-purple-600',
    },
  ];

  const getParameterStatus = (tank: any) => {
    if (!tank.parameters || tank.parameters.length === 0) {
      return { status: 'warning', text: 'No tests' };
    }
    
    const latestTest = tank.parameters[tank.parameters.length - 1];
    const testDate = new Date(latestTest.date);
    const daysSinceTest = Math.floor((Date.now() - testDate.getTime()) / (1000 * 60 * 60 * 24));
    
    if (daysSinceTest > 14) {
      return { status: 'error', text: 'Overdue' };
    } else if (daysSinceTest > 7) {
      return { status: 'warning', text: 'Due soon' };
    } else {
      return { status: 'success', text: 'Recent' };
    }
  };

  return (
    <Layout title="My Aquariums">
      <div className="space-y-6">
        <SubscriptionBanner />
        
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold">Welcome to AquaAI</h1>
            <p className="text-muted-foreground">Manage your aquariums and get AI-powered advice</p>
          </div>
          <div className="flex gap-2">
            <Button onClick={() => navigate('/tanks')} variant="outline" className="gap-2">
              <Fish className="h-4 w-4" />
              View All Tanks
            </Button>
            <Button onClick={handleAddTank} className="gap-2">
              <Plus className="h-4 w-4" />
              Add Tank
            </Button>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid gap-4 md:grid-cols-3">
          {quickActions.map((action) => (
            <Card key={action.title} className="cursor-pointer hover:shadow-lg transition-shadow" onClick={action.action}>
              <CardHeader className="pb-3">
                <div className={`w-10 h-10 rounded-full ${action.color} flex items-center justify-center mb-2`}>
                  <action.icon className="h-5 w-5 text-white" />
                </div>
                <CardTitle className="text-lg">{action.title}</CardTitle>
                <CardDescription>{action.description}</CardDescription>
              </CardHeader>
            </Card>
          ))}
        </div>

        {/* Task Reminders Section */}
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2">
            {/* Recent Tanks Overview */}
            <div>
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold">Your Aquariums</h2>
                {aquariums.length > 0 && (
                  <Button variant="ghost" onClick={() => navigate('/tanks')}>
                    View All ({aquariums.length})
                  </Button>
                )}
              </div>
              
              {isLoading ? (
                <div className="grid gap-4 md:grid-cols-2">
                  {[...Array(2)].map((_, i) => (
                    <Card key={i} className="animate-pulse">
                      <CardHeader>
                        <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                        <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                      </CardHeader>
                      <CardContent>
                        <div className="h-20 bg-gray-200 rounded"></div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : aquariums.length === 0 ? (
                <Card className="text-center p-8">
                  <div className="flex flex-col items-center gap-4">
                    <Fish className="h-12 w-12 text-muted-foreground" />
                    <div>
                      <h3 className="text-lg font-semibold">No aquariums yet</h3>
                      <p className="text-muted-foreground mb-4">Get started by adding your first tank</p>
                      <Button onClick={handleAddTank} className="gap-2">
                        <Plus className="h-4 w-4" />
                        Add Your First Tank
                      </Button>
                    </div>
                  </div>
                </Card>
              ) : (
                <div className="grid gap-4 md:grid-cols-2">
                  {aquariums.slice(0, 4).map((aquarium) => {
                    const parameterStatus = getParameterStatus(aquarium);
                    
                    return (
                      <Card 
                        key={aquarium.id} 
                        className="cursor-pointer hover:shadow-lg transition-shadow group"
                        onClick={() => navigate(`/tank/${aquarium.id}`)}
                      >
                        <CardHeader className="pb-3">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <Droplets className="h-5 w-5 text-blue-500" />
                              <div>
                                <CardTitle className="text-base">{aquarium.name}</CardTitle>
                                <CardDescription>{aquarium.size}</CardDescription>
                              </div>
                            </div>
                            <Badge variant="secondary" className="text-xs">
                              {aquarium.type}
                            </Badge>
                          </div>
                        </CardHeader>
                        
                        <CardContent className="space-y-3">
                          {/* Quick Stats */}
                          <div className="grid grid-cols-3 gap-2 text-center">
                            <div>
                              <p className="text-sm font-medium text-blue-600">
                                {aquarium.livestock?.length || 0}
                              </p>
                              <p className="text-xs text-muted-foreground">Fish</p>
                            </div>
                            <div>
                              <p className="text-sm font-medium text-purple-600">
                                {aquarium.equipment?.length || 0}
                              </p>
                              <p className="text-xs text-muted-foreground">Equipment</p>
                            </div>
                            <div>
                              <p className="text-sm font-medium text-green-600">
                                {aquarium.parameters?.length || 0}
                              </p>
                              <p className="text-xs text-muted-foreground">Tests</p>
                            </div>
                          </div>
                          
                          {/* Test Status */}
                          <div className="flex items-center justify-between p-2 bg-muted rounded">
                            <div className="flex items-center gap-2">
                              <TestTube2 className="h-3 w-3" />
                              <span className="text-sm">Tests</span>
                            </div>
                            <Badge 
                              variant={parameterStatus.status === 'success' ? 'default' : 
                                     parameterStatus.status === 'warning' ? 'secondary' : 'destructive'}
                              className="text-xs"
                            >
                              {parameterStatus.text}
                            </Badge>
                          </div>
                          
                          {/* Quick Action */}
                          <Button 
                            size="sm" 
                            variant="outline" 
                            className="w-full opacity-0 group-hover:opacity-100 transition-opacity"
                            onClick={(e) => {
                              e.stopPropagation();
                              navigate(`/tank/${aquarium.id}/log-parameters`);
                            }}
                          >
                            <TestTube2 className="h-3 w-3 mr-1" />
                            Log Water Test
                          </Button>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Task Reminders Sidebar */}
          <div className="lg:col-span-1">
            <TaskRecommendations />
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Index;
