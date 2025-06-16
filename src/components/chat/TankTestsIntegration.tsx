
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Loader2, TestTube, Calendar, Droplets, Activity } from 'lucide-react';
import { useAquarium } from '@/contexts/AquariumContext';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';

interface TankTestsIntegrationProps {
  onSendTestData: (testData: string) => void;
  disabled?: boolean;
}

interface WaterTestLog {
  id: string;
  aquarium_id: string;
  test_date: string;
  ph?: number;
  salinity?: number;
  temperature?: number;
  ammonia?: number;
  nitrite?: number;
  nitrate?: number;
  alkalinity?: number;
  calcium?: number;
  magnesium?: number;
  phosphate?: number;
  notes?: string;
  created_at: string;
}

export const TankTestsIntegration: React.FC<TankTestsIntegrationProps> = ({ 
  onSendTestData, 
  disabled = false 
}) => {
  const [testLogs, setTestLogs] = useState<WaterTestLog[]>([]);
  const [selectedTest, setSelectedTest] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [showTests, setShowTests] = useState(false);
  const { tanks, isLoading: tanksLoading } = useAquarium();
  const { user } = useAuth();
  const { toast } = useToast();

  const loadTestLogs = async () => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please sign in to view your test logs",
        variant: "destructive",
      });
      return;
    }

    if (tanksLoading) {
      toast({
        title: "Loading tanks...",
        description: "Please wait while we load your tank data",
      });
      return;
    }

    setIsLoading(true);
    try {
      console.log('Available tanks:', tanks);
      
      // Get valid tank IDs (UUIDs from Supabase or skip local timestamp IDs)
      const validTankIds = tanks
        .filter(tank => tank && tank.id && typeof tank.id === 'string')
        .map(tank => tank.id)
        .filter(id => {
          // Check if it's a valid UUID format (from Supabase)
          const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
          return uuidRegex.test(id);
        });
      
      console.log('Valid tank IDs:', validTankIds);
      
      if (validTankIds.length === 0) {
        // Show interface even if no valid UUIDs, but display helpful message
        setShowTests(true);
        setTestLogs([]);
        return;
      }

      const { data, error } = await supabase
        .from('water_test_logs')
        .select('*')
        .in('aquarium_id', validTankIds)
        .order('test_date', { ascending: false })
        .limit(20);

      if (error) throw error;

      console.log('Loaded test logs:', data);
      setTestLogs(data || []);
      setShowTests(true);
    } catch (error: any) {
      console.error('Error loading test logs:', error);
      toast({
        title: "Error loading tests",
        description: error.message || "Failed to load test logs",
        variant: "destructive",
      });
      setShowTests(true); // Still show interface
    } finally {
      setIsLoading(false);
    }
  };

  const formatTestData = (test: WaterTestLog) => {
    const tankName = tanks.find(t => t.id === test.aquarium_id)?.name || 'Unknown Tank';
    
    const parameters = [];
    if (test.ph) parameters.push(`pH: ${test.ph}`);
    if (test.salinity) parameters.push(`Salinity: ${test.salinity}`);
    if (test.temperature) parameters.push(`Temperature: ${test.temperature}°F`);
    if (test.ammonia !== undefined) parameters.push(`Ammonia: ${test.ammonia} ppm`);
    if (test.nitrite !== undefined) parameters.push(`Nitrite: ${test.nitrite} ppm`);
    if (test.nitrate !== undefined) parameters.push(`Nitrate: ${test.nitrate} ppm`);
    if (test.alkalinity) parameters.push(`Alkalinity: ${test.alkalinity} dKH`);
    if (test.calcium) parameters.push(`Calcium: ${test.calcium} ppm`);
    if (test.magnesium) parameters.push(`Magnesium: ${test.magnesium} ppm`);
    if (test.phosphate !== undefined) parameters.push(`Phosphate: ${test.phosphate} ppm`);

    return `I need help analyzing my water test results from ${tankName} (tested on ${format(new Date(test.test_date), 'MMM dd, yyyy')}):

${parameters.join('\n')}

${test.notes ? `\nAdditional notes: ${test.notes}` : ''}

Please provide step-by-step recommendations to improve my water quality and address any issues. I'd like actionable tasks I can follow to optimize my tank parameters.`;
  };

  const handleSendTestData = () => {
    const test = testLogs.find(t => t.id === selectedTest);
    if (!test) return;

    const testDataMessage = formatTestData(test);
    onSendTestData(testDataMessage);
    
    // Reset selection
    setSelectedTest('');
    setShowTests(false);
  };

  const getParameterStatus = (value: number | undefined, ideal: { min: number; max: number }) => {
    if (value === undefined) return 'unknown';
    if (value < ideal.min || value > ideal.max) return 'warning';
    return 'good';
  };

  const renderTestPreview = (test: WaterTestLog) => {
    const tankName = tanks.find(t => t.id === test.aquarium_id)?.name || 'Unknown Tank';
    
    return (
      <div key={test.id} className="border rounded-lg p-3 space-y-2">
        <div className="flex justify-between items-start">
          <div>
            <p className="font-medium text-sm">{tankName}</p>
            <p className="text-xs text-muted-foreground">
              {format(new Date(test.test_date), 'MMM dd, yyyy')}
            </p>
          </div>
          <div className="flex gap-1">
            {test.ph && (
              <Badge 
                variant={getParameterStatus(test.ph, { min: 8.1, max: 8.4 }) === 'good' ? 'default' : 'destructive'}
                className="text-xs"
              >
                pH {test.ph}
              </Badge>
            )}
            {test.ammonia !== undefined && (
              <Badge 
                variant={test.ammonia === 0 ? 'default' : 'destructive'}
                className="text-xs"
              >
                NH₃ {test.ammonia}
              </Badge>
            )}
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-2 text-xs">
          {test.salinity && <span>Salinity: {test.salinity}</span>}
          {test.temperature && <span>Temp: {test.temperature}°F</span>}
          {test.nitrate !== undefined && <span>NO₃: {test.nitrate} ppm</span>}
          {test.calcium && <span>Ca: {test.calcium} ppm</span>}
        </div>
      </div>
    );
  };

  const hasValidTanks = tanks.some(tank => {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    return uuidRegex.test(tank.id);
  });

  return (
    <Card className="mb-4">
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <TestTube className="h-5 w-5" />
          Tank Test Analysis
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {!showTests ? (
          <div className="text-center space-y-4">
            <div className="flex items-center justify-center">
              <div className="text-center space-y-2">
                <Droplets className="h-12 w-12 mx-auto text-blue-500" />
                <p className="text-sm text-muted-foreground">
                  Load your recent water test results to get AI-powered analysis and step-by-step recommendations
                </p>
                {!user && (
                  <p className="text-xs text-orange-600">
                    Sign in to sync your test data across devices
                  </p>
                )}
                {user && !hasValidTanks && (
                  <p className="text-xs text-orange-600">
                    Add tanks through the main app to start logging test results
                  </p>
                )}
              </div>
            </div>
            
            <Button
              onClick={loadTestLogs}
              disabled={disabled || isLoading || tanksLoading}
              className="w-full"
              variant="outline"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Loading Tests...
                </>
              ) : tanksLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Loading Tanks...
                </>
              ) : (
                <>
                  <Activity className="mr-2 h-4 w-4" />
                  Load Recent Test Results
                </>
              )}
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium">Select a test to analyze:</p>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowTests(false)}
              >
                Back
              </Button>
            </div>

            {testLogs.length === 0 ? (
              <div className="text-center py-6">
                <Calendar className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                <p className="text-sm text-muted-foreground">No test results found</p>
                <p className="text-xs text-muted-foreground">
                  {!hasValidTanks 
                    ? "Add tanks through the main app and log some water tests" 
                    : "Add some water test logs to get AI recommendations"
                  }
                </p>
              </div>
            ) : (
              <>
                <ScrollArea className="h-64 w-full">
                  <div className="space-y-2">
                    {testLogs.map(test => (
                      <div
                        key={test.id}
                        className={`cursor-pointer transition-colors ${
                          selectedTest === test.id
                            ? 'ring-2 ring-primary'
                            : ''
                        }`}
                        onClick={() => setSelectedTest(test.id)}
                      >
                        {renderTestPreview(test)}
                      </div>
                    ))}
                  </div>
                </ScrollArea>

                <Button
                  onClick={handleSendTestData}
                  disabled={!selectedTest || disabled}
                  className="w-full"
                >
                  <TestTube className="mr-2 h-4 w-4" />
                  Analyze Selected Test Results
                </Button>
              </>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
