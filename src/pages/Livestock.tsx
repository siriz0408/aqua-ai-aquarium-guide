
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

const Livestock = () => {
  const { tankId } = useParams<{ tankId: string }>();
  const navigate = useNavigate();
  const { getTank, addLivestock } = useAquarium();
  const { toast } = useToast();
  
  const tank = tankId ? getTank(tankId) : undefined;
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [livestock, setLivestock] = useState({
    name: '',
    species: '',
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

  const mockAnalyzeLivestock = async () => {
    setIsAnalyzing(true);
    
    // Simulate AI analysis
    await new Promise(resolve => setTimeout(resolve, 2500));
    
    // Mock AI identification
    const mockResults = {
      name: 'Clownfish',
      species: 'Amphiprion ocellaris (Ocellaris Clownfish)',
      careLevel: 'Easy',
      compatibility: 'Peaceful, reef safe, good beginner fish. Compatible with most community fish.',
    };
    
    setLivestock({
      name: mockResults.name,
      species: mockResults.species,
    });
    
    setIsAnalyzing(false);
    
    toast({
      title: "Fish identified!",
      description: "AI has analyzed your photo and identified the species.",
    });
    
    return mockResults;
  };

  const handleSave = () => {
    if (!livestock.name || !livestock.species) {
      toast({
        title: "Please fill in livestock details",
        variant: "destructive",
      });
      return;
    }

    const mockResults = {
      name: livestock.name,
      species: livestock.species,
      careLevel: 'Easy',
      compatibility: 'Peaceful, reef safe, good beginner fish. Compatible with most community fish.',
    };

    addLivestock(tankId!, mockResults);
    
    toast({
      title: "Livestock added successfully!",
      description: `${livestock.name} has been added to your tank.`,
    });
    
    navigate(`/tank/${tankId}`);
  };

  return (
    <Layout title="Add Livestock" showBackButton>
      <div className="space-y-6 pb-20">
        <Card>
          <CardHeader>
            <CardTitle>Livestock Identification</CardTitle>
            <CardDescription>
              Upload a photo for AI species identification or enter details manually
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Photo Upload Simulation */}
            <div className="border-2 border-dashed border-border rounded-lg p-8 text-center">
              <Upload className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <div className="space-y-2">
                <p className="text-sm font-medium">Upload Fish/Coral Photo</p>
                <p className="text-xs text-muted-foreground">
                  AI will identify the species and provide care information
                </p>
                <Button 
                  onClick={mockAnalyzeLivestock} 
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
                  <span className="text-sm">AI is identifying your livestock...</span>
                </div>
              </div>
            )}

            {/* Manual Entry */}
            <div className="space-y-4">
              <h3 className="font-medium">Livestock Details</h3>
              <div>
                <Label htmlFor="name">Common Name</Label>
                <Input
                  id="name"
                  placeholder="e.g., Clownfish, Yellow Tang, Hammer Coral"
                  value={livestock.name}
                  onChange={(e) => setLivestock(prev => ({ ...prev, name: e.target.value }))}
                />
              </div>
              <div>
                <Label htmlFor="species">Scientific Name/Species</Label>
                <Input
                  id="species"
                  placeholder="e.g., Amphiprion ocellaris"
                  value={livestock.species}
                  onChange={(e) => setLivestock(prev => ({ ...prev, species: e.target.value }))}
                />
              </div>
            </div>

            <Button onClick={handleSave} className="w-full ocean-gradient text-white">
              <Save className="mr-2 h-4 w-4" />
              Add Livestock
            </Button>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default Livestock;
