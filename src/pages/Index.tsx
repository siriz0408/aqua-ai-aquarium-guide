
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Layout } from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAquariums } from '@/contexts/AquariumContext';
import { Fish, Droplets, Plus, MessageCircle, BookOpen, Wrench } from 'lucide-react';
import { SubscriptionBanner } from '@/components/SubscriptionBanner';

const Index = () => {
  const navigate = useNavigate();
  const { aquariums, isLoading } = useAquariums();

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

  return (
    <Layout title="My Aquariums">
      <div className="space-y-6">
        <SubscriptionBanner />
        
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold">Welcome to AquaAI</h1>
            <p className="text-muted-foreground">Manage your aquariums and get AI-powered advice</p>
          </div>
          <Button onClick={handleAddTank} className="gap-2">
            <Plus className="h-4 w-4" />
            Add Tank
          </Button>
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

        {/* Aquarium Grid */}
        <div>
          <h2 className="text-xl font-semibold mb-4">Your Aquariums</h2>
          {isLoading ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {[...Array(3)].map((_, i) => (
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
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {aquariums.map((aquarium) => (
                <Card 
                  key={aquarium.id} 
                  className="cursor-pointer hover:shadow-lg transition-shadow"
                  onClick={() => navigate(`/tank/${aquarium.id}`)}
                >
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Droplets className="h-5 w-5 text-blue-500" />
                      {aquarium.name}
                    </CardTitle>
                    <CardDescription>
                      {aquarium.size_gallons} gallons • Setup: {aquarium.setup_date ? new Date(aquarium.setup_date).toLocaleDateString() : 'Not set'}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-muted-foreground">Temperature:</span>
                        <p className="font-medium">{aquarium.temperature ? `${aquarium.temperature}°F` : 'Not recorded'}</p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">pH:</span>
                        <p className="font-medium">{aquarium.ph || 'Not recorded'}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default Index;
