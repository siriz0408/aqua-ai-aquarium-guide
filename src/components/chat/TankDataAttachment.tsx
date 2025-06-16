
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { useAquarium } from '@/contexts/AquariumContext';
import { Send, Fish, Settings, Droplets } from 'lucide-react';

interface TankDataAttachmentProps {
  isOpen: boolean;
  onClose: () => void;
  onAttachData: (data: string) => void;
  disabled?: boolean;
}

export const TankDataAttachment: React.FC<TankDataAttachmentProps> = ({
  isOpen,
  onClose,
  onAttachData,
  disabled = false,
}) => {
  const { tanks } = useAquarium();
  const [selectedTankId, setSelectedTankId] = useState<string>('');
  const [includeParameters, setIncludeParameters] = useState(true);
  const [includeEquipment, setIncludeEquipment] = useState(false);
  const [includeLivestock, setIncludeLivestock] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const selectedTank = selectedTankId ? tanks.find(tank => tank.id === selectedTankId) : null;

  const formatTankData = () => {
    if (!selectedTank) return '';

    let tankData = `**Tank Data - ${selectedTank.name}**\n`;
    tankData += `Tank Size: ${selectedTank.size} | Type: ${selectedTank.type}\n\n`;

    // Add water parameters if selected
    if (includeParameters && selectedTank.parameters.length > 0) {
      tankData += `**🧪 Latest Water Parameters:**\n`;
      const latestTest = selectedTank.parameters[selectedTank.parameters.length - 1];
      tankData += `Date: ${new Date(latestTest.date).toLocaleDateString()}\n`;
      
      const params = [];
      if (latestTest.ph > 0) params.push(`pH: ${latestTest.ph}`);
      if (latestTest.salinity > 0) params.push(`Salinity: ${latestTest.salinity}`);
      if (latestTest.temperature > 0) params.push(`Temp: ${latestTest.temperature}°F`);
      if (latestTest.ammonia >= 0) params.push(`NH3: ${latestTest.ammonia} ppm`);
      if (latestTest.nitrite >= 0) params.push(`NO2: ${latestTest.nitrite} ppm`);
      if (latestTest.nitrate >= 0) params.push(`NO3: ${latestTest.nitrate} ppm`);
      if (latestTest.kh > 0) params.push(`KH: ${latestTest.kh} dKH`);
      if (latestTest.calcium > 0) params.push(`Ca: ${latestTest.calcium} ppm`);
      if (latestTest.magnesium > 0) params.push(`Mg: ${latestTest.magnesium} ppm`);
      
      tankData += params.join(', ') + '\n\n';
    }

    // Add equipment if selected
    if (includeEquipment && selectedTank.equipment.length > 0) {
      tankData += `**⚙️ Equipment:**\n`;
      selectedTank.equipment.forEach((item, index) => {
        tankData += `• ${item.name} (${item.type})`;
        if (item.model) tankData += ` - ${item.model}`;
        tankData += '\n';
      });
      tankData += '\n';
    }

    // Add livestock if selected
    if (includeLivestock && selectedTank.livestock.length > 0) {
      tankData += `**🐠 Livestock:**\n`;
      selectedTank.livestock.forEach((animal, index) => {
        tankData += `• ${animal.name}`;
        if (animal.species) tankData += ` (${animal.species})`;
        tankData += ` - ${animal.careLevel}`;
        tankData += '\n';
      });
      tankData += '\n';
    }

    return tankData;
  };

  const handleAttach = async () => {
    if (!selectedTank || (!includeParameters && !includeEquipment && !includeLivestock)) return;

    setIsLoading(true);
    try {
      const formattedData = formatTankData();
      onAttachData(formattedData);
      onClose();
      // Reset form
      setSelectedTankId('');
      setIncludeParameters(true);
      setIncludeEquipment(false);
      setIncludeLivestock(false);
    } finally {
      setIsLoading(false);
    }
  };

  const getDataSummary = () => {
    if (!selectedTank) return null;
    
    const items = [];
    if (includeParameters && selectedTank.parameters.length > 0) {
      items.push(`${selectedTank.parameters.length} test results`);
    }
    if (includeEquipment && selectedTank.equipment.length > 0) {
      items.push(`${selectedTank.equipment.length} equipment`);
    }
    if (includeLivestock && selectedTank.livestock.length > 0) {
      items.push(`${selectedTank.livestock.length} livestock`);
    }
    
    return items.length > 0 ? items.join(', ') : 'No data selected';
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Attach Tank Data</DialogTitle>
          <DialogDescription>
            Select tank data to include with your message
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          {tanks.length === 0 ? (
            <div className="text-center p-4 text-muted-foreground">
              <p className="text-sm">No tanks found. Add a tank first.</p>
            </div>
          ) : (
            <>
              <div>
                <Label htmlFor="tank-select" className="text-sm font-medium">Select Tank</Label>
                <Select value={selectedTankId} onValueChange={setSelectedTankId}>
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Choose a tank..." />
                  </SelectTrigger>
                  <SelectContent>
                    {tanks.map((tank) => (
                      <SelectItem key={tank.id} value={tank.id}>
                        {tank.name} ({tank.size})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {selectedTank && (
                <>
                  <div className="space-y-3">
                    <Label className="text-sm font-medium">Include:</Label>
                    
                    <div className="space-y-2">
                      <div className="flex items-center space-x-3">
                        <Checkbox
                          id="parameters"
                          checked={includeParameters}
                          onCheckedChange={(checked) => setIncludeParameters(checked as boolean)}
                        />
                        <Label 
                          htmlFor="parameters" 
                          className="flex items-center gap-2 text-sm cursor-pointer flex-1"
                        >
                          <Droplets className="h-4 w-4" />
                          <span>Water Parameters</span>
                          {selectedTank.parameters.length > 0 && (
                            <Badge variant="secondary" className="text-xs">
                              {selectedTank.parameters.length}
                            </Badge>
                          )}
                        </Label>
                      </div>

                      <div className="flex items-center space-x-3">
                        <Checkbox
                          id="equipment"
                          checked={includeEquipment}
                          onCheckedChange={(checked) => setIncludeEquipment(checked as boolean)}
                        />
                        <Label 
                          htmlFor="equipment" 
                          className="flex items-center gap-2 text-sm cursor-pointer flex-1"
                        >
                          <Settings className="h-4 w-4" />
                          <span>Equipment</span>
                          {selectedTank.equipment.length > 0 && (
                            <Badge variant="secondary" className="text-xs">
                              {selectedTank.equipment.length}
                            </Badge>
                          )}
                        </Label>
                      </div>

                      <div className="flex items-center space-x-3">
                        <Checkbox
                          id="livestock"
                          checked={includeLivestock}
                          onCheckedChange={(checked) => setIncludeLivestock(checked as boolean)}
                        />
                        <Label 
                          htmlFor="livestock" 
                          className="flex items-center gap-2 text-sm cursor-pointer flex-1"
                        >
                          <Fish className="h-4 w-4" />
                          <span>Livestock</span>
                          {selectedTank.livestock.length > 0 && (
                            <Badge variant="secondary" className="text-xs">
                              {selectedTank.livestock.length}
                            </Badge>
                          )}
                        </Label>
                      </div>
                    </div>
                  </div>

                  <div className="p-3 bg-muted rounded-lg">
                    <p className="text-sm text-muted-foreground">
                      <strong>Will attach:</strong> {getDataSummary()}
                    </p>
                  </div>

                  <div className="flex gap-2 pt-2">
                    <Button 
                      variant="outline" 
                      onClick={onClose} 
                      className="flex-1"
                    >
                      Cancel
                    </Button>
                    <Button 
                      onClick={handleAttach}
                      disabled={disabled || isLoading || (!includeParameters && !includeEquipment && !includeLivestock)}
                      className="flex-1"
                    >
                      <Send className="mr-2 h-4 w-4" />
                      {isLoading ? 'Attaching...' : 'Attach Data'}
                    </Button>
                  </div>
                </>
              )}
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
