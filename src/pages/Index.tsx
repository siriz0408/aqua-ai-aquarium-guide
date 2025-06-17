
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
import { useIsMobile } from '@/hooks/use-mobile';
import { cn } from '@/lib/utils';
import TaskRecommendations from '@/components/TaskRecommendations';
import SavedPlans from '@/components/SavedPlans';

const Index = () => {
  const { tanks, addTank, deleteTank } = useAquarium();
  const navigate = useNavigate();
  const { toast } = useToast();
  const isMobile = useIsMobile();
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

  const handleDeleteTank = async (tankId: string, tankName: string) => {
    try {
      await deleteTank(tankId);
      toast({
        title: "Tank deleted permanently",
        description: `${tankName} and all its data have been permanently removed.`,
      });
    } catch (error) {
      console.error('Error deleting tank:', error);
      toast({
        title: "Error",
        description: "Failed to delete tank. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <Layout title="AquaAI">
      <div className={cn(
        "space-y-4 sm:space-y-6",
        isMobile ? "pb-6" : "pb-16 sm:pb-20"
      )}>
        {/* Welcome Section - Mobile optimized */}
        <div className="text-center">
          <div className={cn(
            "ocean-gradient rounded-xl text-white",
            isMobile ? "p-4" : "p-6 sm:p-8"
          )}>
            <h2 className={cn(
              "font-bold mb-2",
              isMobile ? "text-xl" : "text-2xl sm:text-3xl"
            )}>Welcome to AquaAI</h2>
            <p className={cn(
              "text-blue-100 mb-4",
              isMobile ? "text-sm mb-3" : "text-sm sm:text-base mb-4 sm:mb-6"
            )}>Your AI-powered saltwater aquarium assistant</p>
            <Button
              onClick={() => navigate('/aquabot')}
              className={cn(
                "bg-white/20 hover:bg-white/30 text-white border border-white/30",
                isMobile ? "text-sm h-9" : "text-sm sm:text-base"
              )}
              size={isMobile ? "sm" : "default"}
            >
              <MessageCircle className={cn(
                "mr-2",
                isMobile ? "h-3 w-3" : "h-4 w-4"
              )} />
              Ask AquaBot
            </Button>
          </div>
        </div>

        {/* AI Recommendations Section */}
        <TaskRecommendations />

        {/* Quick Actions - Mobile optimized */}
        <div className={cn(
          "grid gap-3",
          isMobile ? "grid-cols-2" : "grid-cols-2 sm:gap-4"
        )}>
          <Card className="cursor-pointer hover:shadow-lg transition-all duration-200 active:scale-95 mobile-card-hover" onClick={() => navigate('/aquabot')}>
            <CardContent className={cn(
              "text-center",
              isMobile ? "p-3" : "p-3 sm:p-4"
            )}>
              <MessageCircle className={cn(
                "mx-auto mb-2 text-primary",
                isMobile ? "h-6 w-6" : "h-6 w-6 sm:h-8 sm:w-8"
              )} />
              <p className={cn(
                "font-medium",
                isMobile ? "text-sm" : "text-sm sm:text-base"
              )}>Chat with AI</p>
              <p className={cn(
                "text-muted-foreground",
                isMobile ? "text-xs" : "text-xs sm:text-sm"
              )}>Get instant help</p>
            </CardContent>
          </Card>
          
          <Card className="cursor-pointer hover:shadow-lg transition-all duration-200 active:scale-95 mobile-card-hover" onClick={() => navigate('/setup-planner')}>
            <CardContent className={cn(
              "text-center",
              isMobile ? "p-3" : "p-3 sm:p-4"
            )}>
              <Plus className={cn(
                "mx-auto mb-2 text-accent",
                isMobile ? "h-6 w-6" : "h-6 w-6 sm:h-8 sm:w-8"
              )} />
              <p className={cn(
                "font-medium",
                isMobile ? "text-sm" : "text-sm sm:text-base"
              )}>Setup Planner</p>
              <p className={cn(
                "text-muted-foreground",
                isMobile ? "text-xs" : "text-xs sm:text-sm"
              )}>Plan your tank</p>
            </CardContent>
          </Card>
        </div>

        {/* My Plans Section */}
        <div className="space-y-3 sm:space-y-4">
          <div className="flex items-center justify-between">
            <h3 className={cn(
              "font-bold",
              isMobile ? "text-lg" : "text-xl sm:text-2xl"
            )}>My Plans</h3>
            <Button onClick={() => navigate('/setup-planner')} variant="outline" size="sm">
              <Plus className={cn(
                "mr-1",
                isMobile ? "h-3 w-3" : "h-3 w-3 sm:h-4 sm:w-4"
              )} />
              <span className={cn(
                isMobile ? "text-xs" : "text-xs sm:text-sm"
              )}>New Plan</span>
            </Button>
          </div>
          <SavedPlans />
        </div>

        {/* My Tanks Section - Mobile optimized */}
        <div className="space-y-3 sm:space-y-4">
          <div className="flex items-center justify-between">
            <h3 className={cn(
              "font-bold",
              isMobile ? "text-lg" : "text-xl sm:text-2xl"
            )}>My Tanks</h3>
            <Dialog open={isAddingTank} onOpenChange={setIsAddingTank}>
              <DialogTrigger asChild>
                <Button size="sm">
                  <Plus className={cn(
                    "mr-1",
                    isMobile ? "h-3 w-3" : "h-3 w-3 sm:h-4 sm:w-4"
                  )} />
                  <span className={cn(
                    isMobile ? "text-xs" : "text-xs sm:text-sm"
                  )}>Add Tank</span>
                </Button>
              </DialogTrigger>
              <DialogContent className={cn(
                isMobile ? "w-[95vw] max-w-sm mx-2" : "w-[95vw] max-w-md"
              )}>
                <DialogHeader>
                  <DialogTitle className={cn(
                    isMobile ? "text-lg" : "text-xl"
                  )}>Add New Tank</DialogTitle>
                  <DialogDescription className={cn(
                    isMobile ? "text-sm" : "text-base"
                  )}>
                    Create a new aquarium to start tracking
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="tank-name" className={cn(
                      isMobile ? "text-sm" : "text-base"
                    )}>Tank Name</Label>
                    <Input
                      id="tank-name"
                      placeholder="e.g., Living Room Reef"
                      value={newTank.name}
                      onChange={(e) => setNewTank(prev => ({ ...prev, name: e.target.value }))}
                      className={cn(
                        isMobile && "text-base" // Prevent zoom on iOS
                      )}
                    />
                  </div>
                  <div>
                    <Label htmlFor="tank-size" className={cn(
                      isMobile ? "text-sm" : "text-base"
                    )}>Tank Size</Label>
                    <Input
                      id="tank-size"
                      placeholder="e.g., 75 gallons, 48x18x20 inches"
                      value={newTank.size}
                      onChange={(e) => setNewTank(prev => ({ ...prev, size: e.target.value }))}
                      className={cn(
                        isMobile && "text-base" // Prevent zoom on iOS
                      )}
                    />
                  </div>
                  <div>
                    <Label htmlFor="tank-type" className={cn(
                      isMobile ? "text-sm" : "text-base"
                    )}>Tank Type</Label>
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
            <Card className={cn(
              "text-center",
              isMobile ? "p-4" : "p-6 sm:p-8"
            )}>
              <div className="space-y-3 sm:space-y-4">
                <div className={cn(
                  isMobile ? "text-3xl" : "text-4xl sm:text-6xl"
                )}>🐠</div>
                <div>
                  <h4 className={cn(
                    "font-medium",
                    isMobile ? "text-base" : "text-base sm:text-lg"
                  )}>No tanks yet</h4>
                  <p className={cn(
                    "text-muted-foreground",
                    isMobile ? "text-sm" : "text-sm sm:text-base"
                  )}>Add your first aquarium to get started</p>
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
                  className="cursor-pointer hover:shadow-lg transition-all duration-200 hover:scale-[1.01] active:scale-95 mobile-card-hover"
                >
                  <CardHeader className={cn(
                    isMobile ? "pb-2" : "pb-2 sm:pb-3"
                  )}>
                    <div className="flex items-start justify-between">
                      <div className="min-w-0 flex-1" onClick={() => navigate(`/tank/${tank.id}`)}>
                        <CardTitle className={cn(
                          "truncate",
                          isMobile ? "text-base" : "text-base sm:text-lg"
                        )}>{tank.name}</CardTitle>
                        <CardDescription className={cn(
                          isMobile ? "text-sm" : "text-sm"
                        )}>{tank.size} • {tank.type}</CardDescription>
                      </div>
                      <div className="flex items-center gap-2 ml-2">
                        <div className={cn(
                          "flex-shrink-0",
                          isMobile ? "text-xl" : "text-xl sm:text-2xl"
                        )}>
                          {tank.type === 'Reef' ? '🪸' : tank.type === 'FOWLR' ? '🐠' : '🌊'}
                        </div>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent className={cn(
                            isMobile && "w-[95vw] max-w-sm mx-2"
                          )}>
                            <AlertDialogHeader>
                              <AlertDialogTitle className={cn(
                                "flex items-center gap-2 text-destructive",
                                isMobile ? "text-lg" : "text-xl"
                              )}>
                                <Trash2 className="h-5 w-5" />
                                Permanently Delete Tank
                              </AlertDialogTitle>
                              <AlertDialogDescription className={cn(
                                "space-y-2",
                                isMobile ? "text-sm" : "text-base"
                              )}>
                                <p className="font-medium">
                                  Are you sure you want to permanently delete "{tank.name}"?
                                </p>
                                <p className="text-sm">
                                  <strong>This action cannot be undone.</strong> This will permanently remove:
                                </p>
                                <ul className="text-sm list-disc list-inside space-y-1 ml-2">
                                  <li>The tank and all its settings</li>
                                  <li>All equipment records ({tank.equipment.length} items)</li>
                                  <li>All livestock records ({tank.livestock.length} animals)</li>
                                  <li>All water test logs ({tank.parameters.length} tests)</li>
                                  <li>Any related maintenance history</li>
                                </ul>
                                <p className="text-sm font-medium text-destructive">
                                  This data will be permanently deleted from your account and cannot be recovered.
                                </p>
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter className={cn(
                              isMobile && "flex-col gap-2"
                            )}>
                              <AlertDialogCancel className={cn(
                                isMobile && "w-full"
                              )}>Cancel</AlertDialogCancel>
                              <AlertDialogAction 
                                onClick={() => handleDeleteTank(tank.id, tank.name)}
                                className={cn(
                                  "bg-destructive text-destructive-foreground hover:bg-destructive/90",
                                  isMobile && "w-full"
                                )}
                              >
                                Yes, Permanently Delete
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0" onClick={() => navigate(`/tank/${tank.id}`)}>
                    <div className={cn(
                      "grid grid-cols-3 text-center",
                      isMobile ? "gap-2" : "gap-2 sm:gap-4"
                    )}>
                      <div>
                        <p className={cn(
                          "font-bold text-primary",
                          isMobile ? "text-lg" : "text-lg sm:text-2xl"
                        )}>{tank.livestock.length}</p>
                        <p className={cn(
                          "text-muted-foreground",
                          isMobile ? "text-xs" : "text-xs"
                        )}>Livestock</p>
                      </div>
                      <div>
                        <p className={cn(
                          "font-bold text-accent",
                          isMobile ? "text-lg" : "text-lg sm:text-2xl"
                        )}>{tank.equipment.length}</p>
                        <p className={cn(
                          "text-muted-foreground",
                          isMobile ? "text-xs" : "text-xs"
                        )}>Equipment</p>
                      </div>
                      <div>
                        <p className={cn(
                          "font-bold text-green-600",
                          isMobile ? "text-lg" : "text-lg sm:text-2xl"
                        )}>{tank.parameters.length}</p>
                        <p className={cn(
                          "text-muted-foreground",
                          isMobile ? "text-xs" : "text-xs"
                        )}>Test Logs</p>
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
