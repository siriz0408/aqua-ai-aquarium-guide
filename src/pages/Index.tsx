
import React, { useState } from 'react';
import { Layout } from '@/components/Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { useAquarium, Tank } from '@/contexts/AquariumContext';
import { useNavigate } from 'react-router-dom';
import { MessageCircle, Plus, Trash2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import TaskRecommendations from '@/components/TaskRecommendations';
import SavedPlans from '@/components/SavedPlans';

const Index = () => {
  const { tanks, addTank, deleteTank } = useAquarium();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isAddingTank, setIsAddingTank] = useState(false);
  const [newTank, setNewTank] = useState({
    name: '',
    size: '',
    type: 'FOWLR' as Tank['type'],
  });

  const handleAddTank = async () => {
    if (!newTank.name || !newTank.size) {
      toast({
        title: "Please fill in all fields",
        variant: "destructive",
      });
      return;
    }

    await addTank({
      ...newTank,
      equipment: [],
      livestock: [],
      parameters: [],
    });

    // Get the latest tank (the one we just added)
    // We'll need to wait a bit for the state to update, so let's use a timeout
    setTimeout(() => {
      const latestTank = tanks[tanks.length - 1];
      if (latestTank) {
        toast({
          title: "Tank created successfully!",
          description: "Let's add some fish to your tank!",
        });
        // Auto-navigate to livestock selection for the new tank
        navigate(`/tank/${latestTank.id}/livestock`);
      }
    }, 100);

    setNewTank({ name: '', size: '', type: 'FOWLR' });
    setIsAddingTank(false);
  };

  const handleDeleteTank = (tankId: string, tankName: string) => {
    deleteTank(tankId);
    toast({
      title: "Tank deleted",
      description: `${tankName} has been removed from your collection.`,
    });
  };

  return (
    <Layout title="AquaAI">
      <div className="space-y-4 sm:space-y-6 pb-16 sm:pb-20">
        {/* Welcome Section - Enhanced for mobile */}
        <div className="text-center space-y-3 sm:space-y-4">
          <div className="ocean-gradient rounded-xl sm:rounded-2xl p-6 sm:p-8 text-white">
            <h2 className="text-2xl sm:text-3xl font-bold mb-2">Welcome to AquaAI</h2>
            <p className="text-blue-100 text-sm sm:text-base mb-4 sm:mb-6">Your AI-powered saltwater aquarium assistant</p>
            <Button
              onClick={() => navigate('/aquabot')}
              className="bg-white/20 hover:bg-white/30 text-white border border-white/30 text-sm sm:text-base"
              size="sm"
            >
              <MessageCircle className="mr-2 h-4 w-4" />
              Ask AquaBot
            </Button>
          </div>
        </div>

        {/* AI Recommendations Section */}
        <TaskRecommendations />

        {/* Quick Actions - Mobile optimized grid */}
        <div className="grid grid-cols-2 gap-3 sm:gap-4">
          <Card className="cursor-pointer hover:shadow-lg transition-all duration-200 active:scale-95" onClick={() => navigate('/aquabot')}>
            <CardContent className="p-3 sm:p-4 text-center">
              <MessageCircle className="h-6 w-6 sm:h-8 sm:w-8 mx-auto mb-2 text-primary" />
              <p className="font-medium text-sm sm:text-base">Chat with AI</p>
              <p className="text-xs sm:text-sm text-muted-foreground">Get instant help</p>
            </CardContent>
          </Card>
          
          <Card className="cursor-pointer hover:shadow-lg transition-all duration-200 active:scale-95" onClick={() => navigate('/setup-planner')}>
            <CardContent className="p-3 sm:p-4 text-center">
              <Plus className="h-6 w-6 sm:h-8 sm:w-8 mx-auto mb-2 text-accent" />
              <p className="font-medium text-sm sm:text-base">Setup Planner</p>
              <p className="text-xs sm:text-sm text-muted-foreground">Plan your tank</p>
            </CardContent>
          </Card>
        </div>

        {/* My Plans Section */}
        <div className="space-y-3 sm:space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xl sm:text-2xl font-bold">My Plans</h3>
            <Button onClick={() => navigate('/setup-planner')} variant="outline" size="sm">
              <Plus className="mr-1 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4" />
              <span className="text-xs sm:text-sm">New Plan</span>
            </Button>
          </div>
          <SavedPlans />
        </div>

        {/* My Tanks Section */}
        <div className="space-y-3 sm:space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xl sm:text-2xl font-bold">My Tanks</h3>
            <Dialog open={isAddingTank} onOpenChange={setIsAddingTank}>
              <DialogTrigger asChild>
                <Button size="sm">
                  <Plus className="mr-1 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4" />
                  <span className="text-xs sm:text-sm">Add Tank</span>
                </Button>
              </DialogTrigger>
              <DialogContent className="w-[95vw] max-w-md">
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
            <Card className="p-6 sm:p-8 text-center">
              <div className="space-y-3 sm:space-y-4">
                <div className="text-4xl sm:text-6xl">🐠</div>
                <div>
                  <h4 className="text-base sm:text-lg font-medium">No tanks yet</h4>
                  <p className="text-sm sm:text-base text-muted-foreground">Add your first aquarium to get started</p>
                </div>
                <Button onClick={() => setIsAddingTank(true)} size="sm">
                  <Plus className="mr-2 h-4 w-4" />
                  Add Your First Tank
                </Button>
              </div>
            </Card>
          ) : (
            <div className="grid gap-3 sm:gap-4">
              {tanks.map((tank) => (
                <Card 
                  key={tank.id} 
                  className="cursor-pointer hover:shadow-lg transition-all duration-200 hover:scale-[1.01] active:scale-95"
                >
                  <CardHeader className="pb-2 sm:pb-3">
                    <div className="flex items-start justify-between">
                      <div className="min-w-0 flex-1" onClick={() => navigate(`/tank/${tank.id}`)}>
                        <CardTitle className="text-base sm:text-lg truncate">{tank.name}</CardTitle>
                        <CardDescription className="text-sm">{tank.size} • {tank.type}</CardDescription>
                      </div>
                      <div className="flex items-center gap-2 ml-2">
                        <div className="text-xl sm:text-2xl flex-shrink-0">
                          {tank.type === 'Reef' ? '🪸' : tank.type === 'FOWLR' ? '🐠' : '🌊'}
                        </div>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Delete Tank</AlertDialogTitle>
                              <AlertDialogDescription>
                                Are you sure you want to delete "{tank.name}"? This action cannot be undone and will remove all associated data including equipment, livestock, and water parameters.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction 
                                onClick={() => handleDeleteTank(tank.id, tank.name)}
                                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                              >
                                Delete Tank
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0" onClick={() => navigate(`/tank/${tank.id}`)}>
                    <div className="grid grid-cols-3 gap-2 sm:gap-4 text-center">
                      <div>
                        <p className="text-lg sm:text-2xl font-bold text-primary">{tank.livestock.length}</p>
                        <p className="text-xs text-muted-foreground">Livestock</p>
                      </div>
                      <div>
                        <p className="text-lg sm:text-2xl font-bold text-accent">{tank.equipment.length}</p>
                        <p className="text-xs text-muted-foreground">Equipment</p>
                      </div>
                      <div>
                        <p className="text-lg sm:text-2xl font-bold text-green-600">{tank.parameters.length}</p>
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
