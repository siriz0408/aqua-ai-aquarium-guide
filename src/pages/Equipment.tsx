
import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Layout } from '@/components/Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAquarium } from '@/contexts/AquariumContext';
import { useToast } from '@/hooks/use-toast';
import { Upload, Save } from 'lucide-react';

const Equipment = () => {
  const { tankId } = useParams<{ tankId: string }>();
  const navigate = useNavigate();
  const { getTank, addEquipment } = useAquarium();
  const { toast } = useToast();
  
  const tank = tankId ? getTank(tankId) : undefined;
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [equipment, setEquipment] = useState({
    name: '',
    type: '',
    model: '',
  });

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

  const mockAnalyzeEquipment = async () => {
    setIsAnalyzing(true);
    
    // Simulate AI analysis
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Mock AI identification
    const mockResults = {
      name: 'Protein Skimmer',
      type: 'Filtration Equipment',
      model: 'Reef Octopus Classic 150',
      maintenanceTips: 'Clean collection cup weekly, adjust air flow for dry foam, replace airline tubing every 6 months.',
      upgradeNotes: 'Consider upgrading to a larger model if adding more fish load to the tank.',
    };
    
    setEquipment({
      name: mockResults.name,
      type: mockResults.type,
      model: mockResults.model,
    });
    
    setIsAnalyzing(false);
    
    toast({
      title: "Equipment identified!",
      description: "AI has analyzed your equipment photo and provided details.",
    });
    
    return mockResults;
  };

  const handleSave = () => {
    if (!equipment.name || !equipment.type) {
      toast({
        title: "Please fill in equipment details",
        variant: "destructive",
      });
      return;
    }

    const mockResults = {
      name: equipment.name,
      type: equipment.type,
      model: equipment.model,
      maintenanceTips: 'Clean collection cup weekly, adjust air flow for dry foam, replace airline tubing every 6 months.',
      upgradeNotes: 'Consider upgrading to a larger model if adding more fish load to the tank.',
    };

    addEquipment(tankId!, mockResults);
    
    toast({
      title: "Equipment added successfully!",
      description: `${equipment.name} has been added to your tank.`,
    });
    
    navigate(`/tank/${tankId}`);
  };

  return (
    <Layout title="Add Equipment" showBackButton>
      <div className="space-y-6 pb-20">
        <Card>
          <CardHeader>
            <CardTitle>Equipment Identification</CardTitle>
            <CardDescription>
              Upload a photo for AI identification or enter details manually
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Photo Upload Simulation */}
            <div className="border-2 border-dashed border-border rounded-lg p-8 text-center">
              <Upload className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <div className="space-y-2">
                <p className="text-sm font-medium">Upload Equipment Photo</p>
                <p className="text-xs text-muted-foreground">
                  AI will identify your equipment and provide maintenance tips
                </p>
                <Button 
                  onClick={mockAnalyzeEquipment} 
                  disabled={isAnalyzing}
                  className="mt-4"
                >
                  {isAnalyzing ? 'Analyzing...' : 'Simulate Photo Upload'}
                </Button>
              </div>
            </div>

            {isAnalyzing && (
              <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <div className="flex items-center justify-center space-x-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
                  <span className="text-sm">AI is analyzing your equipment...</span>
                </div>
              </div>
            )}

            {/* Manual Entry */}
            <div className="space-y-4">
              <h3 className="font-medium">Equipment Details</h3>
              <div>
                <Label htmlFor="name">Equipment Name</Label>
                <Input
                  id="name"
                  placeholder="e.g., Protein Skimmer"
                  value={equipment.name}
                  onChange={(e) => setEquipment(prev => ({ ...prev, name: e.target.value }))}
                />
              </div>
              <div>
                <Label htmlFor="type">Type</Label>
                <Input
                  id="type"
                  placeholder="e.g., Filtration, Lighting, Powerhead"
                  value={equipment.type}
                  onChange={(e) => setEquipment(prev => ({ ...prev, type: e.target.value }))}
                />
              </div>
              <div>
                <Label htmlFor="model">Model (Optional)</Label>
                <Input
                  id="model"
                  placeholder="e.g., Reef Octopus Classic 150"
                  value={equipment.model}
                  onChange={(e) => setEquipment(prev => ({ ...prev, model: e.target.value }))}
                />
              </div>
            </div>

            <Button onClick={handleSave} className="w-full ocean-gradient text-white">
              <Save className="mr-2 h-4 w-4" />
              Add Equipment
            </Button>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default Equipment;
