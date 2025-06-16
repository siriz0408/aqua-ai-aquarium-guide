
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { useAquarium } from '@/contexts/AquariumContext';
import { TestTube2, Send, Fish, Settings, Droplets } from 'lucide-react';

interface TankTestsIntegrationProps {
  onSendTestData: (data: string) => void;
  disabled?: boolean;
}

export const TankTestsIntegration: React.FC<TankTestsIntegrationProps> = ({
  onSendTestData,
  disabled = false,
}) => {
  const { tanks } = useAquarium();
  const [selectedTankId, setSelectedTankId] = useState<string>('');
  const [includeParameters, setIncludeParameters] = useState(true);
  const [includeEquipment, setIncludeEquipment] = useState(true);
  const [includeLivestock, setIncludeLivestock] = useState(true);
  const [isLoading, setIsLoading] = useState(false);

  const selectedTank = selectedTankId ? tanks.find(tank => tank.id === selectedTankId) : null;

  const formatTankData = () => {
    if (!selectedTank) return '';

    let tankData = `**Tank Analysis Request for: ${selectedTank.name}**\n`;
    tankData += `Tank Size: ${selectedTank.size}\n`;
    tankData += `Tank Type: ${selectedTank.type}\n\n`;

    // Add water parameters if selected
    if (includeParameters && selectedTank.parameters.length > 0) {
      tankData += `**🧪 Latest Water Parameters:**\n`;
      const latestTest = selectedTank.parameters[selectedTank.parameters.length - 1];
      tankData += `Date: ${new Date(latestTest.date).toLocaleDateString()}\n`;
      tankData += `• pH: ${latestTest.ph}\n`;
      tankData += `• Salinity: ${latestTest.salinity}\n`;
      tankData += `• Temperature: ${latestTest.temperature}°F\n`;
      tankData += `• Ammonia: ${latestTest.ammonia} ppm\n`;
      tankData += `• Nitrite: ${latestTest.nitrite} ppm\n`;
      tankData += `• Nitrate: ${latestTest.nitrate} ppm\n`;
      if (latestTest.kh > 0) tankData += `• KH (Alkalinity): ${latestTest.kh} dKH\n`;
      if (latestTest.calcium > 0) tankData += `• Calcium: ${latestTest.calcium} ppm\n`;
      if (latestTest.magnesium > 0) tankData += `• Magnesium: ${latestTest.magnesium} ppm\n`;
      if (latestTest.aiInsights) tankData += `Previous AI Insights: ${latestTest.aiInsights}\n`;
      tankData += '\n';
    }

    // Add equipment if selected
    if (includeEquipment && selectedTank.equipment.length > 0) {
      tankData += `**⚙️ Current Equipment Setup:**\n`;
      selectedTank.equipment.forEach((item, index) => {
        tankData += `${index + 1}. ${item.name} (${item.type})`;
        if (item.model) tankData += ` - Model: ${item.model}`;
        tankData += '\n';
        if (item.maintenanceTips) {
          tankData += `   Maintenance: ${item.maintenanceTips}\n`;
        }
        if (item.upgradeNotes) {
          tankData += `   Upgrade Notes: ${item.upgradeNotes}\n`;
        }
      });
      tankData += '\n';
    }

    // Add livestock if selected
    if (includeLivestock && selectedTank.livestock.length > 0) {
      tankData += `**🐠 Current Livestock:**\n`;
      selectedTank.livestock.forEach((animal, index) => {
        tankData += `${index + 1}. ${animal.name}`;
        if (animal.species) tankData += ` (${animal.species})`;
        tankData += ` - Care Level: ${animal.careLevel}`;
        if (animal.compatibility) tankData += ` - ${animal.compatibility}`;
        tankData += '\n';
        if (animal.healthNotes) {
          tankData += `   Health Notes: ${animal.healthNotes}\n`;
        }
      });
      tankData += '\n';
    }

    tankData += `**Request:** Please analyze my tank data and provide specific recommendations for improvements, maintenance tasks, or any concerns you notice. Focus on actionable advice I can implement.`;

    return tankData;
  };

  const handleSendData = async () => {
    if (!selectedTank) return;

    setIsLoading(true);
    try {
      const formattedData = formatTankData();
      await onSendTestData(formattedData);
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
      items.push(`${selectedTank.equipment.length} equipment items`);
    }
    if (includeLivestock && selectedTank.livestock.length > 0) {
      items.push(`${selectedTank.livestock.length} livestock`);
    }
    
    return items.length > 0 ? items.join(', ') : 'No data selected';
  };

  if (tanks.length === 0) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <TestTube2 className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
          <p className="text-sm text-muted-foreground">
            No tanks found. Add a tank to share your data with AquaBot.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TestTube2 className="h-5 w-5" />
          Share Tank Data
        </CardTitle>
        <CardDescription>
          Send your complete tank information to AquaBot for personalized analysis and recommendations
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label htmlFor="tank-select">Select Tank</Label>
          <Select value={selectedTankId} onValueChange={setSelectedTankId}>
            <SelectTrigger>
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
              <Label>Include in Analysis:</Label>
              
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="parameters"
                  checked={includeParameters}
                  onCheckedChange={(checked) => setIncludeParameters(checked as boolean)}
                />
                <Label htmlFor="parameters" className="flex items-center gap-2">
                  <Droplets className="h-4 w-4" />
                  Water Parameters
                  {selectedTank.parameters.length > 0 && (
                    <Badge variant="secondary">{selectedTank.parameters.length} tests</Badge>
                  )}
                </Label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="equipment"
                  checked={includeEquipment}
                  onCheckedChange={(checked) => setIncludeEquipment(checked as boolean)}
                />
                <Label htmlFor="equipment" className="flex items-center gap-2">
                  <Settings className="h-4 w-4" />
                  Equipment Setup
                  {selectedTank.equipment.length > 0 && (
                    <Badge variant="secondary">{selectedTank.equipment.length} items</Badge>
                  )}
                </Label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="livestock"
                  checked={includeLivestock}
                  onCheckedChange={(checked) => setIncludeLivestock(checked as boolean)}
                />
                <Label htmlFor="livestock" className="flex items-center gap-2">
                  <Fish className="h-4 w-4" />
                  Livestock
                  {selectedTank.livestock.length > 0 && (
                    <Badge variant="secondary">{selectedTank.livestock.length} animals</Badge>
                  )}
                </Label>
              </div>
            </div>

            <div className="p-3 bg-muted rounded-lg">
              <p className="text-sm text-muted-foreground">
                <strong>Will send:</strong> {getDataSummary()}
              </p>
            </div>

            <Button 
              onClick={handleSendData}
              disabled={disabled || isLoading || (!includeParameters && !includeEquipment && !includeLivestock)}
              className="w-full"
            >
              <Send className="mr-2 h-4 w-4" />
              {isLoading ? 'Sending...' : 'Send Tank Data to AquaBot'}
            </Button>
          </>
        )}
      </CardContent>
    </Card>
  );
};
