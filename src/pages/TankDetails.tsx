
import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Layout } from '@/components/Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAquarium } from '@/contexts/AquariumContext';
import { Plus, Upload } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

const TankDetails = () => {
  const { tankId } = useParams<{ tankId: string }>();
  const navigate = useNavigate();
  const { getTank } = useAquarium();
  
  const tank = tankId ? getTank(tankId) : undefined;

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

  const latestParameters = tank.parameters[tank.parameters.length - 1];

  return (
    <Layout 
      title={tank.name} 
      showBackButton
      actions={
        <Button 
          size="sm" 
          onClick={() => navigate(`/tank/${tankId}/log-parameters`)}
          className="ocean-gradient text-white"
        >
          <Plus className="mr-1 h-3 w-3" />
          Log Test
        </Button>
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
            {latestParameters ? (
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
            {tank.equipment.length > 0 ? (
              <div className="space-y-4">
                {tank.equipment.map((equipment) => (
                  <Card key={equipment.id}>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base">{equipment.name}</CardTitle>
                      <CardDescription>{equipment.type}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      {equipment.model && (
                        <p className="text-sm text-muted-foreground mb-2">Model: {equipment.model}</p>
                      )}
                      {equipment.maintenanceTips && (
                        <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                          <p className="text-sm font-medium text-green-800 dark:text-green-200 mb-1">Maintenance Tips</p>
                          <p className="text-sm text-green-700 dark:text-green-300">{equipment.maintenanceTips}</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
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
            {tank.livestock.length > 0 ? (
              <div className="space-y-4">
                {tank.livestock.map((animal) => (
                  <Card key={animal.id}>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base">{animal.name}</CardTitle>
                      <CardDescription>{animal.species}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-sm">Care Level</span>
                          <Badge variant="outline">{animal.careLevel}</Badge>
                        </div>
                        {animal.compatibility && (
                          <div>
                            <p className="text-sm font-medium mb-1">Compatibility</p>
                            <p className="text-sm text-muted-foreground">{animal.compatibility}</p>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
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
