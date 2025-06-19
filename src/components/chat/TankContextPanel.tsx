
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Fish, Droplets, Calendar, Wrench } from 'lucide-react';
import { useTankContext } from '@/hooks/useTankContext';

const TankContextPanel = () => {
  const { 
    tanks, 
    selectedTankId, 
    setSelectedTankId, 
    selectedTankContext,
    isLoading 
  } = useTankContext();

  if (isLoading) {
    return (
      <Card className="mb-4">
        <CardContent className="p-4">
          <div className="text-sm text-muted-foreground">Loading tank data...</div>
        </CardContent>
      </Card>
    );
  }

  if (tanks.length === 0) {
    return (
      <Card className="mb-4">
        <CardContent className="p-4">
          <div className="text-sm text-muted-foreground">
            No tanks found. Add a tank to get personalized advice!
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="mb-4">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium">Tank Context</CardTitle>
          <Badge variant="secondary" className="text-xs">Active</Badge>
        </div>
        <CardDescription className="text-xs">
          AquaBot will use this tank's data for personalized advice
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-0 space-y-3">
        <Select value={selectedTankId || ''} onValueChange={setSelectedTankId}>
          <SelectTrigger className="h-8">
            <SelectValue placeholder="Select a tank" />
          </SelectTrigger>
          <SelectContent>
            {tanks.map((tank) => (
              <SelectItem key={tank.id} value={tank.id}>
                {tank.name} ({tank.size} {tank.type})
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {selectedTankContext && (
          <div className="space-y-2 text-xs">
            <Separator />
            
            <div className="grid grid-cols-2 gap-2">
              <div>
                <span className="font-medium">Size:</span> {selectedTankContext.size}
              </div>
              <div>
                <span className="font-medium">Age:</span> {selectedTankContext.age}
              </div>
            </div>

            {selectedTankContext.latestParameters && (
              <div className="space-y-1">
                <div className="flex items-center gap-1">
                  <Droplets className="h-3 w-3" />
                  <span className="font-medium">Latest Parameters:</span>
                </div>
                <div className="grid grid-cols-2 gap-1 text-xs text-muted-foreground ml-4">
                  {selectedTankContext.latestParameters.ph && (
                    <div>pH: {selectedTankContext.latestParameters.ph}</div>
                  )}
                  {selectedTankContext.latestParameters.salinity && (
                    <div>Salinity: {selectedTankContext.latestParameters.salinity}</div>
                  )}
                  {selectedTankContext.latestParameters.nitrate && (
                    <div>Nitrate: {selectedTankContext.latestParameters.nitrate}ppm</div>
                  )}
                  {selectedTankContext.latestParameters.temperature && (
                    <div>Temp: {selectedTankContext.latestParameters.temperature}°F</div>
                  )}
                </div>
              </div>
            )}

            {selectedTankContext.livestock.length > 0 && (
              <div className="space-y-1">
                <div className="flex items-center gap-1">
                  <Fish className="h-3 w-3" />
                  <span className="font-medium">Livestock ({selectedTankContext.livestock.length}):</span>
                </div>
                <div className="text-xs text-muted-foreground ml-4">
                  {selectedTankContext.livestock.slice(0, 3).map((animal, index) => (
                    <div key={index}>{animal.name} ({animal.species})</div>
                  ))}
                  {selectedTankContext.livestock.length > 3 && (
                    <div>+{selectedTankContext.livestock.length - 3} more</div>
                  )}
                </div>
              </div>
            )}

            {selectedTankContext.lastWaterChange && (
              <div className="flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                <span className="font-medium">Last water change:</span>
                <span className="text-muted-foreground">{selectedTankContext.lastWaterChange}</span>
              </div>
            )}

            {selectedTankContext.recentTasks.length > 0 && (
              <div className="space-y-1">
                <div className="flex items-center gap-1">
                  <Wrench className="h-3 w-3" />
                  <span className="font-medium">Recent maintenance:</span>
                </div>
                <div className="text-xs text-muted-foreground ml-4">
                  {selectedTankContext.recentTasks.slice(0, 2).map((task, index) => (
                    <div key={index}>{task.title} ({task.status})</div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default TankContextPanel;
