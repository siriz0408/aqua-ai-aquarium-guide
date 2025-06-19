
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Layout } from '@/components/Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAquarium, WaterParameters } from '@/contexts/AquariumContext';
import { Plus, Upload, Edit, Trash2, Calendar } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { EnhancedLivestockCard } from '@/components/tank-form/EnhancedLivestockCard';
import { EnhancedEquipmentCard } from '@/components/tank-form/EnhancedEquipmentCard';
import WaterTestResultsTable from '@/components/WaterTestResultsTable';
import ParameterChart from '@/components/tank/ParameterChart';
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
  const { getTank, updateTank, deleteParameters, loadWaterTestLogs, updateEquipment, deleteEquipment, updateLivestock, deleteLivestock } = useAquarium();
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

  const handleSendToChat = (test: WaterParameters) => {
    // Navigate to chat with test data
    const testData = {
      date: test.date,
      parameters: {
        ph: test.ph,
        salinity: test.salinity,
        temperature: test.temperature,
        ammonia: test.ammonia,
        nitrite: test.nitrite,
        nitrate: test.nitrate,
        kh: test.kh,
        calcium: test.calcium,
        magnesium: test.magnesium
      },
      tankName: tank.name
    };
    
    const message = `Please analyze my water test results from ${new Date(test.date).toLocaleDateString()} for my ${tank.name} tank:\n\n${JSON.stringify(testData.parameters, null, 2)}\n\nPlease provide detailed analysis, highlight any issues, and suggest actions if needed.`;
    
    // Store the message in sessionStorage to be picked up by the chat page
    sessionStorage.setItem('chatMessage', message);
    navigate('/aqua-bot');
  };

  const updateLivestockLocal = async (id: string, updates: any) => {
    await updateLivestock(tankId!, id, updates);
    
    toast({
      title: "Livestock updated",
      description: "Changes saved successfully.",
    });
  };

  const deleteLivestockLocal = async (id: string) => {
    await deleteLivestock(tankId!, id);
    
    toast({
      title: "Livestock removed",
      description: "Item removed from your tank.",
    });
  };

  const updateEquipmentLocal = async (id: string, updates: any) => {
    await updateEquipment(tankId!, id, updates);
    
    toast({
      title: "Equipment updated",
      description: "Changes saved successfully.",
    });
  };

  const deleteEquipmentLocal = async (id: string) => {
    await deleteEquipment(tankId!, id);
    
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
                <p className="text-2xl font-bold text-primary">{tank.livestock.length}</p>
                <p className="text-sm text-muted-foreground">Livestock</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-accent">{tank.equipment.length}</p>
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
            {/* Parameter Chart */}
            <ParameterChart parameters={tank.parameters} />
            
            {/* Parameter Table */}
            <WaterTestResultsTable
              tests={tank.parameters}
              onDeleteTest={handleDeleteTest}
              onSendToChat={handleSendToChat}
            />
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
            
            {tank.equipment.length > 0 ? (
              <div className="space-y-3">
                {tank.equipment.map((item) => (
                  <EnhancedEquipmentCard
                    key={item.id}
                    equipment={item}
                    onUpdate={updateEquipmentLocal}
                    onDelete={deleteEquipmentLocal}
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

            {tank.livestock.length > 0 ? (
              <div className="space-y-3">
                {tank.livestock.map((animal) => (
                  <EnhancedLivestockCard
                    key={animal.id}
                    livestock={animal}
                    onUpdate={updateLivestockLocal}
                    onDelete={deleteLivestockLocal}
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
