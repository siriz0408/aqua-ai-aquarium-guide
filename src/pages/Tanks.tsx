
import React from 'react';
import { Layout } from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Plus, Droplets, Fish, Settings, TestTube2, Calendar, Edit, Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAquarium, Tank } from '@/contexts/AquariumContext';
import { useToast } from '@/hooks/use-toast';
import { HealthIndicator } from '@/components/tank/HealthIndicator';
import { FeatureTooltip } from '@/components/ui/feature-tooltip';
import { ParameterTooltip } from '@/components/ui/parameter-tooltip';

export const Tanks = () => {
  const navigate = useNavigate();
  const { tanks, isLoading, deleteTank } = useAquarium();
  const { toast } = useToast();

  const handleDeleteTank = async (tankId: string, tankName: string) => {
    if (window.confirm(`Are you sure you want to delete "${tankName}"? This action cannot be undone.`)) {
      try {
        await deleteTank(tankId);
        toast({
          title: "Tank deleted",
          description: `${tankName} has been successfully deleted.`,
        });
      } catch (error) {
        console.error('Error deleting tank:', error);
        toast({
          title: "Error",
          description: "Failed to delete tank. Please try again.",
          variant: "destructive",
        });
      }
    }
  };

  const getLastTestDate = (tank: Tank): string | null => {
    if (!tank.parameters || tank.parameters.length === 0) return null;
    const latestTest = tank.parameters[tank.parameters.length - 1];
    return new Date(latestTest.date).toLocaleDateString();
  };

  const getParameterStatus = (tank: Tank): { status: 'warning' | 'error' | 'success'; text: string } => {
    if (!tank.parameters || tank.parameters.length === 0) {
      return { status: 'warning', text: 'No tests logged' };
    }
    
    const latestTest = tank.parameters[tank.parameters.length - 1];
    const testDate = new Date(latestTest.date);
    const daysSinceTest = Math.floor((Date.now() - testDate.getTime()) / (1000 * 60 * 60 * 24));
    
    if (daysSinceTest > 14) {
      return { status: 'error', text: 'Test overdue' };
    } else if (daysSinceTest > 7) {
      return { status: 'warning', text: 'Test due soon' };
    } else {
      return { status: 'success', text: 'Up to date' };
    }
  };

  return (
    <Layout title="My Tanks">
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold">My Tanks</h1>
            <p className="text-muted-foreground">Manage your aquarium collection and track their health</p>
          </div>
          <Button onClick={() => navigate('/add-tank')} className="gap-2">
            <Plus className="h-4 w-4" />
            Add Tank
          </Button>
        </div>

        {isLoading ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
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
        ) : tanks.length === 0 ? (
          <Card className="text-center p-12">
            <div className="flex flex-col items-center gap-4">
              <div className="text-6xl">🐠</div>
              <div>
                <h3 className="text-xl font-semibold mb-2">No tanks yet</h3>
                <p className="text-muted-foreground mb-6">Start your aquarium journey by adding your first tank</p>
                <Button onClick={() => navigate('/add-tank')} className="gap-2">
                  <Plus className="h-4 w-4" />
                  Add Your First Tank
                </Button>
              </div>
            </div>
          </Card>
        ) : (
          <>
            {/* Quick Stats */}
            <div className="grid gap-4 md:grid-cols-4 mb-8">
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-2">
                    <Droplets className="h-4 w-4 text-blue-500" />
                    <div>
                      <p className="text-sm text-muted-foreground">Total Tanks</p>
                      <p className="text-xl font-bold">{tanks.length}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-2">
                    <Fish className="h-4 w-4 text-green-500" />
                    <div>
                      <div className="flex items-center gap-1">
                        <p className="text-sm text-muted-foreground">Total Livestock</p>
                        <FeatureTooltip
                          title="Livestock Tracking"
                          description="Keep track of all fish, corals, and invertebrates across your tanks. Monitor compatibility, feeding schedules, and health status."
                          showIcon={true}
                        />
                      </div>
                      <p className="text-xl font-bold">
                        {tanks.reduce((total, tank) => total + (tank.livestock?.length || 0), 0)}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-2">
                    <Settings className="h-4 w-4 text-purple-500" />
                    <div>
                      <div className="flex items-center gap-1">
                        <p className="text-sm text-muted-foreground">Equipment Items</p>
                        <FeatureTooltip
                          title="Equipment Management"
                          description="Track all your aquarium equipment including filters, heaters, lights, and pumps. Set maintenance reminders and monitor performance."
                          showIcon={true}
                        />
                      </div>
                      <p className="text-xl font-bold">
                        {tanks.reduce((total, tank) => total + (tank.equipment?.length || 0), 0)}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-2">
                    <TestTube2 className="h-4 w-4 text-orange-500" />
                    <div>
                      <div className="flex items-center gap-1">
                        <p className="text-sm text-muted-foreground">Total Tests</p>
                        <ParameterTooltip
                          parameter="Water Testing"
                          normalRange="Weekly recommended"
                          description="Regular water testing is essential for maintaining a healthy aquarium. Test key parameters like pH, ammonia, nitrite, and nitrate."
                          showIcon={true}
                        />
                      </div>
                      <p className="text-xl font-bold">
                        {tanks.reduce((total, tank) => total + (tank.parameters?.length || 0), 0)}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Tank Grid */}
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {tanks.map((tank) => {
                const parameterStatus = getParameterStatus(tank);
                const lastTestDate = getLastTestDate(tank);
                
                return (
                  <Card 
                    key={tank.id} 
                    className="group hover:shadow-lg transition-all duration-200 cursor-pointer relative"
                    onClick={() => navigate(`/tank/${tank.id}`)}
                  >
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-2">
                          <Droplets className="h-5 w-5 text-blue-500" />
                          <div>
                            <CardTitle className="text-lg">{tank.name}</CardTitle>
                            <CardDescription>{tank.size}</CardDescription>
                          </div>
                        </div>
                        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              navigate(`/tank/${tank.id}/edit`);
                            }}
                          >
                            <Edit className="h-3 w-3" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteTank(tank.id, tank.name);
                            }}
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <Badge variant="secondary" className="w-fit">
                          {tank.type}
                        </Badge>
                        <div className="flex items-center gap-1">
                          <HealthIndicator tank={tank} size="sm" />
                          <FeatureTooltip
                            title="Tank Health Score"
                            description="Automated health assessment based on water parameter stability, maintenance frequency, and time since last issues. Helps you quickly identify tanks that need attention."
                            showIcon={true}
                          />
                        </div>
                      </div>
                    </CardHeader>
                    
                    <CardContent className="space-y-4">
                      {/* Tank Stats */}
                      <div className="grid grid-cols-3 gap-3 text-center">
                        <div>
                          <p className="text-sm font-medium text-blue-600">{tank.livestock?.length || 0}</p>
                          <p className="text-xs text-muted-foreground">Livestock</p>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-purple-600">{tank.equipment?.length || 0}</p>
                          <p className="text-xs text-muted-foreground">Equipment</p>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-green-600">{tank.parameters?.length || 0}</p>
                          <p className="text-xs text-muted-foreground">Tests</p>
                        </div>
                      </div>
                      
                      {/* Parameter Status */}
                      <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                        <div className="flex items-center gap-2">
                          <TestTube2 className="h-4 w-4" />
                          <span className="text-sm font-medium">Water Tests</span>
                          <ParameterTooltip
                            parameter="Test Status"
                            normalRange="Weekly testing"
                            description="Shows when your last water test was performed. Regular testing helps maintain optimal water conditions and prevent problems."
                            showIcon={true}
                          />
                        </div>
                        <div className="text-right">
                          <Badge 
                            variant={parameterStatus.status === 'success' ? 'default' : 
                                   parameterStatus.status === 'warning' ? 'secondary' : 'destructive'}
                            className="text-xs"
                          >
                            {parameterStatus.text}
                          </Badge>
                          {lastTestDate && (
                            <p className="text-xs text-muted-foreground mt-1">
                              Last: {lastTestDate}
                            </p>
                          )}
                        </div>
                      </div>
                      
                      {/* Quick Actions */}
                      <div className="flex gap-2">
                        <Button 
                          size="sm" 
                          variant="outline" 
                          className="flex-1"
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/tank/${tank.id}/log-parameters`);
                          }}
                        >
                          <TestTube2 className="h-3 w-3 mr-1" />
                          Log Test
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/tank/${tank.id}`);
                          }}
                        >
                          View Details
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </>
        )}
      </div>
    </Layout>
  );
};

export default Tanks;
