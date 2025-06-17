
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
import PlansSummary from '@/components/PlansSummary';

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
        <TaskRecommendations />

        {/* Setup Plans Section */}
        <PlansSummary />

        {/* Your Aquariums Section */}
        <Card className="w-full">
          <CardHeader className="pb-3">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
              <div className="flex-1 min-w-0">
                <CardTitle className="text-lg">Your Aquariums</CardTitle>
                <CardDescription className="text-sm">Monitor and manage your tanks</CardDescription>
              </div>
              {aquariums.length > 0 && (
                <Button variant="ghost" size="sm" onClick={() => navigate('/tanks')} className="flex-shrink-0 text-xs">
                  View All ({aquariums.length})
                </Button>
              )}
            </div>
          </CardHeader>
          
          <CardContent>
            {isLoading ? (
              <div className="grid gap-3 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {[...Array(2)].map((_, i) => (
                  <div key={i} className="p-3 border rounded-lg animate-pulse">
                    <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                  </div>
                ))}
              </div>
            ) : aquariums.length === 0 ? (
              <div className="text-center py-6">
                <Fish className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                <h3 className="text-sm font-medium mb-1">No aquariums yet</h3>
                <p className="text-xs text-muted-foreground mb-3">Get started by adding your first tank</p>
                <Button size="sm" onClick={handleAddTank} className="gap-1">
                  <Plus className="h-3 w-3" />
                  Add Your First Tank
                </Button>
              </div>
            ) : (
              <div className="grid gap-3 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {aquariums.slice(0, 8).map((aquarium) => {
                  const parameterStatus = getParameterStatus(aquarium);
                  
                  return (
                    <div 
                      key={aquarium.id} 
                      className="p-3 border rounded-lg cursor-pointer hover:bg-muted/50 transition-colors group"
                      onClick={() => navigate(`/tank/${aquarium.id}`)}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2 min-w-0 flex-1">
                          <Droplets className="h-4 w-4 text-blue-500 flex-shrink-0" />
                          <div className="min-w-0">
                            <h4 className="text-sm font-medium truncate">{aquarium.name}</h4>
                            <p className="text-xs text-muted-foreground truncate">{aquarium.size}</p>
                          </div>
                        </div>
                        <Badge variant="secondary" className="text-xs flex-shrink-0">
                          {aquarium.type}
                        </Badge>
                      </div>
                      
                      {/* Quick Stats */}
                      <div className="grid grid-cols-3 gap-1 text-center mb-2">
                        <div>
                          <p className="text-xs font-medium text-blue-600">
                            {aquarium.livestock?.length || 0}
                          </p>
                          <p className="text-xs text-muted-foreground">Fish</p>
                        </div>
                        <div>
                          <p className="text-xs font-medium text-purple-600">
                            {aquarium.equipment?.length || 0}
                          </p>
                          <p className="text-xs text-muted-foreground">Equipment</p>
                        </div>
                        <div>
                          <p className="text-xs font-medium text-green-600">
                            {aquarium.parameters?.length || 0}
                          </p>
                          <p className="text-xs text-muted-foreground">Tests</p>
                        </div>
                      </div>
                      
                      {/* Test Status */}
                      <div className="flex items-center justify-between p-2 bg-muted rounded text-xs">
                        <div className="flex items-center gap-1">
                          <TestTube2 className="h-3 w-3" />
                          <span>Tests</span>
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
                        className="w-full mt-2 opacity-0 group-hover:opacity-100 transition-opacity text-xs h-7"
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/tank/${aquarium.id}/log-parameters`);
                        }}
                      >
                        <TestTube2 className="h-3 w-3 mr-1" />
                        Log Water Test
                      </Button>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default Index;
