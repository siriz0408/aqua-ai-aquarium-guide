
import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Layout } from '@/components/Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Combobox } from '@/components/ui/combobox';
import { useAquarium } from '@/contexts/AquariumContext';
import { useToast } from '@/hooks/use-toast';
import { Upload, Save } from 'lucide-react';
import { livestockOptions, livestockCategories } from '@/data/livestockOptions';

const Livestock = () => {
  const { tankId } = useParams<{ tankId: string }>();
  const navigate = useNavigate();
  const { getTank, addLivestock } = useAquarium();
  const { toast } = useToast();
  
  const tank = tankId ? getTank(tankId) : undefined;
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [selectedLivestock, setSelectedLivestock] = useState('');
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

  const livestockComboOptions = livestockOptions.map(opt => ({
    value: opt.value,
    label: `${opt.label} (${opt.category} - ${opt.careLevel})`
  }));

  const handleLivestockSelect = (value: string) => {
    setSelectedLivestock(value);
    const selectedOption = livestockOptions.find(opt => opt.value === value);
    if (selectedOption) {
      setLivestock({
        name: selectedOption.label,
        species: selectedOption.label
      });
    }
  };

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

    const selectedOption = livestockOptions.find(opt => opt.value === selectedLivestock);
    const mockResults = {
      name: livestock.name,
      species: livestock.species,
      careLevel: selectedOption?.careLevel || 'Beginner',
      compatibility: selectedOption?.compatibility || 'Peaceful, reef safe, good beginner fish. Compatible with most community fish.',
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
              Select from common species or upload a photo for AI identification
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Quick Select Livestock */}
            <Card className="bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
              <CardContent className="p-4">
                <div className="space-y-3">
                  <Label className="text-sm font-medium">Quick Select Livestock</Label>
                  <Combobox
                    options={livestockComboOptions}
                    value={selectedLivestock}
                    onValueChange={handleLivestockSelect}
                    placeholder="Search fish, corals, invertebrates..."
                    searchPlaceholder="Type to search livestock..."
                    emptyText="No livestock found."
                  />
                  <p className="text-xs text-muted-foreground">
                    Select from popular aquarium species or enter details manually below
                  </p>
                </div>
              </CardContent>
            </Card>

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
