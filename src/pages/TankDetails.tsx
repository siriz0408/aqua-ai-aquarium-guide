import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Layout } from '@/components/Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAquarium } from '@/contexts/AquariumContext';
import { Plus, Upload, Edit, Trash2, Calendar } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { EnhancedLivestockCard } from '@/components/tank-form/EnhancedLivestockCard';
import { EnhancedEquipmentCard } from '@/components/tank-form/EnhancedEquipmentCard';
import { useToast } from '@/hooks/use-toast';
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

const TankDetails = () => {
  const { tankId } = useParams<{ tankId: string }>();
  const navigate = useNavigate();
  const { getTank, updateTank, deleteParameters, loadWaterTestLogs } = useAquarium();
  const { toast } = useToast();
  
  const tank = tankId ? getTank(tankId) : undefined;
  const [livestock, setLivestock] = useState(tank?.livestock || []);
  const [equipment, setEquipment] = useState(tank?.equipment || []);

  // Load water test logs when component mounts
  useEffect(() => {
    if (tankId) {
      loadWaterTestLogs(tankId);
    }
  }, [tankId, loadWaterTestLogs]);

  // Update local state when tank data changes
  useEffect(() => {
    if (tank) {
      setLivestock(tank.livestock);
      setEquipment(tank.equipment);
    }
  }, [tank]);

  if (!tank) {
    return (
      <Layout title="Tank Not Found" showBackButton>
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold mb-4">Tank not found</h2>
          <Button onClick={() => navigate('/')}>Go Home</Button>
        </div>
      </Layout>
    );
  }

  const latestParameters = tank.parameters[0]; // Already sorted by date desc

  const handleDeleteTest = async (testId: string) => {
    try {
      await deleteParameters(tankId!, testId);
    } catch (error) {
      console.error('Error deleting test:', error);
    }
  };

  const updateLivestock = (id: string, updates: any) => {
    const updatedLivestock = livestock.map(item =>
      item.id === id ? { ...item, ...updates } : item
    );
    setLivestock(updatedLivestock);
    
    // Update tank in context
    updateTank(tankId!, { livestock: updatedLivestock });
    
    toast({
      title: "Livestock updated",
      description: "Changes saved successfully.",
    });
  };

  const deleteLivestock = (id: string) => {
    const updatedLivestock = livestock.filter(item => item.id !== id);
    setLivestock(updatedLivestock);
    
    // Update tank in context
    updateTank(tankId!, { livestock: updatedLivestock });
    
    toast({
      title: "Livestock removed",
      description: "Item removed from your tank.",
    });
  };

  const updateEquipment = (id: string, updates: any) => {
    const updatedEquipment = equipment.map(item =>
      item.id === id ? { ...item, ...updates } : item
    );
    setEquipment(updatedEquipment);
    
    // Update tank in context
    updateTank(tankId!, { equipment: updatedEquipment });
    
    toast({
      title: "Equipment updated",
      description: "Changes saved successfully.",
    });
  };

  const deleteEquipment = (id: string) => {
    const updatedEquipment = equipment.filter(item => item.id !== id);
    setEquipment(updatedEquipment);
    
    // Update tank in context
    updateTank(tankId!, { equipment: updatedEquipment });
    
    toast({
      title: "Equipment removed",
      description: "Item removed from your tank.",
    });
  };

  return (
    <Layout 
      title={tank.name} 
      showBackButton
      actions={
        <div className="flex gap-2">
          <Button 
            variant="outline"
            size="sm" 
            onClick={() => navigate(`/tank/${tankId}/edit`)}
            className="gap-1"
          >
            <Edit className="h-3 w-3" />
            Edit
          </Button>
          <Button 
            size="sm" 
            onClick={() => navigate(`/tank/${tankId}/log-parameters`)}
            className="ocean-gradient text-white gap-1"
          >
            <Plus className="h-3 w-3" />
            Log Test
          </Button>
        </div>
      }
    >
      <div className="space-y-6 pb-20">
        {/* Tank Info */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  {tank.name}
                  <div className="text-2xl">
                    {tank.type === 'Reef' ? '🪸' : tank.type === 'FOWLR' ? '🐠' : '🌊'}
                  </div>
                </CardTitle>
                <CardDescription>{tank.size}</CardDescription>
              </div>
              <Badge variant="secondary">{tank.type}</Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <p className="text-2xl font-bold text-primary">{livestock.length}</p>
                <p className="text-sm text-muted-foreground">Livestock</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-accent">{equipment.length}</p>
                <p className="text-sm text-muted-foreground">Equipment</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-green-600">{tank.parameters.length}</p>
                <p className="text-sm text-muted-foreground">Test Logs</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tabs */}
        <Tabs defaultValue="parameters" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="parameters">Parameters</TabsTrigger>
            <TabsTrigger value="equipment">Equipment</TabsTrigger>
            <TabsTrigger value="livestock">Livestock</TabsTrigger>
            <TabsTrigger value="reminders">Reminders</TabsTrigger>
          </TabsList>
          
          <TabsContent value="parameters" className="space-y-4">
            {tank.parameters.length > 0 ? (
              <div className="space-y-4">
                {/* Latest Test Summary */}
                {latestParameters && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Latest Water Test</CardTitle>
                      <CardDescription>
                        Logged on {new Date(latestParameters.date).toLocaleDateString()}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <span className="text-sm">pH</span>
                            <span className="font-medium">{latestParameters.ph}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm">Salinity</span>
                            <span className="font-medium">{latestParameters.salinity}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm">Temperature</span>
                            <span className="font-medium">{latestParameters.temperature}°F</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm">Ammonia</span>
                            <span className="font-medium">{latestParameters.ammonia}</span>
                          </div>
                        </div>
                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <span className="text-sm">Nitrate</span>
                            <span className="font-medium">{latestParameters.nitrate}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm">Nitrite</span>
                            <span className="font-medium">{latestParameters.nitrite}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm">KH</span>
                            <span className="font-medium">{latestParameters.kh}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm">Calcium</span>
                            <span className="font-medium">{latestParameters.calcium}</span>
                          </div>
                        </div>
                      </div>
                      {latestParameters.aiInsights && (
                        <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                          <p className="text-sm font-medium text-blue-800 dark:text-blue-200 mb-1">AI Insights</p>
                          <p className="text-sm text-blue-700 dark:text-blue-300">{latestParameters.aiInsights}</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                )}

                {/* All Test History */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Test History</CardTitle>
                    <CardDescription>
                      All your saved water test results
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {tank.parameters.map((test) => (
                      <div key={test.id} className="border rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-muted-foreground" />
                            <span className="font-medium">
                              {new Date(test.date).toLocaleDateString()}
                            </span>
                          </div>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="ghost" size="sm" className="text-red-600 hover:text-red-700">
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Delete Test Result</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Are you sure you want to delete this water test result? This action cannot be undone.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction 
                                  onClick={() => handleDeleteTest(test.id)}
                                  className="bg-red-600 hover:bg-red-700"
                                >
                                  Delete
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                        
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-sm">
                          <div>pH: <span className="font-medium">{test.ph}</span></div>
                          <div>Salinity: <span className="font-medium">{test.salinity}</span></div>
                          <div>Temp: <span className="font-medium">{test.temperature}°F</span></div>
                          <div>Ammonia: <span className="font-medium">{test.ammonia}</span></div>
                        </div>
                        
                        {test.aiInsights && (
                          <div className="mt-2 p-2 bg-muted rounded text-sm">
                            <span className="font-medium">AI Insights: </span>
                            {test.aiInsights}
                          </div>
                        )}
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </div>
            ) : (
              <Card className="p-8 text-center">
                <div className="space-y-4">
                  <div className="text-4xl">📊</div>
                  <div>
                    <h4 className="font-medium">No water tests logged</h4>
                    <p className="text-sm text-muted-foreground">Start tracking your water parameters</p>
                  </div>
                  <Button onClick={() => navigate(`/tank/${tankId}/log-parameters`)}>
                    <Plus className="mr-2 h-4 w-4" />
                    Log First Test
                  </Button>
                </div>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="equipment" className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="font-medium">Tank Equipment</h3>
              <Button 
                onClick={() => navigate(`/tank/${tankId}/equipment`)}
                variant="outline"
                size="sm"
              >
                <Plus className="mr-2 h-4 w-4" />
                Add Equipment
              </Button>
            </div>
            
            {equipment.length > 0 ? (
              <div className="space-y-3">
                {equipment.map((item) => (
                  <EnhancedEquipmentCard
                    key={item.id}
                    equipment={item}
                    onUpdate={updateEquipment}
                    onDelete={deleteEquipment}
                  />
                ))}
              </div>
            ) : (
              <Card className="p-8 text-center">
                <div className="space-y-4">
                  <div className="text-4xl">⚙️</div>
                  <div>
                    <h4 className="font-medium">No equipment added</h4>
                    <p className="text-sm text-muted-foreground">Upload photos to identify your equipment</p>
                  </div>
                  <Button onClick={() => navigate(`/tank/${tankId}/equipment`)}>
                    <Upload className="mr-2 h-4 w-4" />
                    Add Equipment
                  </Button>
                </div>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="livestock" className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="font-medium">Tank Livestock</h3>
              <Button 
                onClick={() => navigate(`/tank/${tankId}/livestock`)}
                variant="outline"
                size="sm"
              >
                <Plus className="mr-2 h-4 w-4" />
                Add Livestock
              </Button>
            </div>

            {livestock.length > 0 ? (
              <div className="space-y-3">
                {livestock.map((animal) => (
                  <EnhancedLivestockCard
                    key={animal.id}
                    livestock={animal}
                    onUpdate={updateLivestock}
                    onDelete={deleteLivestock}
                  />
                ))}
              </div>
            ) : (
              <Card className="p-8 text-center">
                <div className="space-y-4">
                  <div className="text-4xl">🐠</div>
                  <div>
                    <h4 className="font-medium">No livestock added</h4>
                    <p className="text-sm text-muted-foreground">Upload photos to identify your fish and coral</p>
                  </div>
                  <Button onClick={() => navigate(`/tank/${tankId}/livestock`)}>
                    <Upload className="mr-2 h-4 w-4" />
                    Add Livestock
                  </Button>
                </div>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="reminders" className="space-y-4">
            <Card className="p-8 text-center">
              <div className="space-y-4">
                <div className="text-4xl">⏰</div>
                <div>
                  <h4 className="font-medium">No reminders set</h4>
                  <p className="text-sm text-muted-foreground">Set up maintenance reminders for your tank</p>
                </div>
                <Button onClick={() => navigate('/reminders')}>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Reminder
                </Button>
              </div>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
};

export default TankDetails;
