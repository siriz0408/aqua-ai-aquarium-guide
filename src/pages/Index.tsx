
import React, { useState } from 'react';
import { Layout } from '@/components/Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAquarium, Tank } from '@/contexts/AquariumContext';
import { useNavigate } from 'react-router-dom';
import { Chat, Plus } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const Index = () => {
  const { tanks, addTank } = useAquarium();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isAddingTank, setIsAddingTank] = useState(false);
  const [newTank, setNewTank] = useState({
    name: '',
    size: '',
    type: 'FOWLR' as Tank['type'],
  });

  const handleAddTank = () => {
    if (!newTank.name || !newTank.size) {
      toast({
        title: "Please fill in all fields",
        variant: "destructive",
      });
      return;
    }

    addTank({
      ...newTank,
      equipment: [],
      livestock: [],
      parameters: [],
    });

    toast({
      title: "Tank added successfully!",
      description: `${newTank.name} has been added to your aquarium collection.`,
    });

    setNewTank({ name: '', size: '', type: 'FOWLR' });
    setIsAddingTank(false);
  };

  return (
    <Layout title="AquaAI">
      <div className="space-y-6 pb-20">
        {/* Welcome Section */}
        <div className="text-center space-y-4">
          <div className="ocean-gradient rounded-2xl p-8 text-white">
            <h2 className="text-3xl font-bold mb-2">Welcome to AquaAI</h2>
            <p className="text-blue-100 mb-6">Your AI-powered saltwater aquarium assistant</p>
            <Button
              onClick={() => navigate('/aquabot')}
              className="bg-white/20 hover:bg-white/30 text-white border border-white/30"
            >
              <Chat className="mr-2 h-4 w-4" />
              Ask AquaBot
            </Button>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-2 gap-4">
          <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => navigate('/aquabot')}>
            <CardContent className="p-4 text-center">
              <Chat className="h-8 w-8 mx-auto mb-2 text-primary" />
              <p className="font-medium">Chat with AI</p>
              <p className="text-sm text-muted-foreground">Get instant help</p>
            </CardContent>
          </Card>
          
          <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => navigate('/setup-planner')}>
            <CardContent className="p-4 text-center">
              <Plus className="h-8 w-8 mx-auto mb-2 text-accent" />
              <p className="font-medium">Setup Planner</p>
              <p className="text-sm text-muted-foreground">Plan your tank</p>
            </CardContent>
          </Card>
        </div>

        {/* My Tanks Section */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-2xl font-bold">My Tanks</h3>
            <Dialog open={isAddingTank} onOpenChange={setIsAddingTank}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Tank
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add New Tank</DialogTitle>
                  <DialogDescription>
                    Create a new aquarium to start tracking
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="tank-name">Tank Name</Label>
                    <Input
                      id="tank-name"
                      placeholder="e.g., Living Room Reef"
                      value={newTank.name}
                      onChange={(e) => setNewTank(prev => ({ ...prev, name: e.target.value }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="tank-size">Tank Size</Label>
                    <Input
                      id="tank-size"
                      placeholder="e.g., 75 gallons, 48x18x20 inches"
                      value={newTank.size}
                      onChange={(e) => setNewTank(prev => ({ ...prev, size: e.target.value }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="tank-type">Tank Type</Label>
                    <Select value={newTank.type} onValueChange={(value: Tank['type']) => setNewTank(prev => ({ ...prev, type: value }))}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="FOWLR">FOWLR (Fish Only With Live Rock)</SelectItem>
                        <SelectItem value="Reef">Reef Tank</SelectItem>
                        <SelectItem value="Mixed">Mixed Reef</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <Button onClick={handleAddTank} className="w-full">
                    Create Tank
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          {tanks.length === 0 ? (
            <Card className="p-8 text-center">
              <div className="space-y-4">
                <div className="text-6xl">🐠</div>
                <div>
                  <h4 className="text-lg font-medium">No tanks yet</h4>
                  <p className="text-muted-foreground">Add your first aquarium to get started</p>
                </div>
                <Button onClick={() => setIsAddingTank(true)}>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Your First Tank
                </Button>
              </div>
            </Card>
          ) : (
            <div className="grid gap-4">
              {tanks.map((tank) => (
                <Card 
                  key={tank.id} 
                  className="cursor-pointer hover:shadow-lg transition-all duration-200 hover:scale-[1.02]"
                  onClick={() => navigate(`/tank/${tank.id}`)}
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-lg">{tank.name}</CardTitle>
                        <CardDescription>{tank.size} • {tank.type}</CardDescription>
                      </div>
                      <div className="text-2xl">
                        {tank.type === 'Reef' ? '🪸' : tank.type === 'FOWLR' ? '🐠' : '🌊'}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="grid grid-cols-3 gap-4 text-center">
                      <div>
                        <p className="text-2xl font-bold text-primary">{tank.livestock.length}</p>
                        <p className="text-xs text-muted-foreground">Livestock</p>
                      </div>
                      <div>
                        <p className="text-2xl font-bold text-accent">{tank.equipment.length}</p>
                        <p className="text-xs text-muted-foreground">Equipment</p>
                      </div>
                      <div>
                        <p className="text-2xl font-bold text-green-600">{tank.parameters.length}</p>
                        <p className="text-xs text-muted-foreground">Test Logs</p>
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
