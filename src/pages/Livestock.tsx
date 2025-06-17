
import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Layout } from '@/components/Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Combobox } from '@/components/ui/combobox';
import { useAquarium } from '@/contexts/AquariumContext';
import { useToast } from '@/hooks/use-toast';
import { Upload, Save, ArrowLeft, Plus, Settings } from 'lucide-react';
import { livestockOptions, livestockCategories } from '@/data/livestockOptions';

const Livestock = () => {
  const { tankId } = useParams<{ tankId: string }>();
  const navigate = useNavigate();
  const { getTank, updateTank } = useAquarium();
  const { toast } = useToast();
  
  const tank = tankId ? getTank(tankId) : undefined;
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedLivestock, setSelectedLivestock] = useState('');
  const [showContinueActions, setShowContinueActions] = useState(false);
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

  // Filter livestock options by selected category
  const filteredLivestockOptions = selectedCategory 
    ? livestockOptions.filter(opt => opt.category === selectedCategory)
    : [];

  const livestockComboOptions = filteredLivestockOptions.map(opt => ({
    value: opt.value,
    label: `${opt.label} (${opt.careLevel})`
  }));

  const handleCategorySelect = (category: string) => {
    setSelectedCategory(category);
    setSelectedLivestock('');
  };

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

  const resetSelection = () => {
    setSelectedCategory('');
    setSelectedLivestock('');
    setLivestock({
      name: '',
      species: '',
    });
    setShowContinueActions(false);
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
    const newLivestock = {
      id: Date.now().toString(),
      name: livestock.name,
      species: livestock.species,
      careLevel: selectedOption?.careLevel || 'Beginner',
      compatibility: selectedOption?.compatibility || 'Peaceful, reef safe, good beginner fish. Compatible with most community fish.',
      imageUrl: '',
      healthNotes: ''
    };

    // Update the tank with the new livestock
    const updatedTank = {
      ...tank,
      livestock: [...(tank.livestock || []), newLivestock]
    };
    
    updateTank(tankId!, updatedTank);
    
    toast({
      title: "Livestock added successfully!",
      description: `${livestock.name} has been added to your tank.`,
    });

    // Reset form and show continue actions
    setLivestock({ name: '', species: '' });
    setSelectedLivestock('');
    setShowContinueActions(true);
  };

  const getCategoryEmoji = (category: string) => {
    switch (category) {
      case 'Fish': return '🐠';
      case 'Coral': return '🪸';
      case 'Invertebrate': return '🦐';
      case 'Cleanup Crew': return '🐌';
      case 'Plant': return '🌱';
      default: return '🐠';
    }
  };

  return (
    <Layout 
      title="Add Livestock" 
      showBackButton
      actions={
        <Button 
          variant="outline" 
          size="sm"
          onClick={() => navigate(`/tank/${tankId}`)}
          className="gap-1"
        >
          <Settings className="h-3 w-3" />
          Tank Overview
        </Button>
      }
    >
      <div className="space-y-6 pb-20">
        {/* Success message and continue actions */}
        {showContinueActions && (
          <Card className="bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800">
            <CardContent className="p-4">
              <div className="text-center space-y-4">
                <div className="text-2xl">✅</div>
                <div>
                  <h3 className="font-medium text-green-800 dark:text-green-200">Livestock Added!</h3>
                  <p className="text-sm text-green-700 dark:text-green-300">What would you like to do next?</p>
                </div>
                
                <div className="flex flex-col sm:flex-row gap-2 justify-center">
                  <Button onClick={resetSelection} variant="outline" size="sm">
                    <Plus className="mr-2 h-4 w-4" />
                    Add More Fish
                  </Button>
                  <Button 
                    onClick={() => navigate(`/tank/${tankId}/equipment`)} 
                    variant="outline" 
                    size="sm"
                  >
                    <Settings className="mr-2 h-4 w-4" />
                    Add Equipment
                  </Button>
                  <Button 
                    onClick={() => navigate(`/tank/${tankId}`)} 
                    className="ocean-gradient text-white"
                    size="sm"
                  >
                    View My Tank
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader>
            <CardTitle>Livestock Identification</CardTitle>
            <CardDescription>
              Select category first, then choose specific species or upload a photo for AI identification
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Category Selection */}
            {!selectedCategory ? (
              <Card className="bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
                <CardContent className="p-4">
                  <div className="space-y-4">
                    <Label className="text-sm font-medium">Step 1: Select Livestock Category</Label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {livestockCategories.map(category => {
                        const categoryCount = livestockOptions.filter(opt => opt.category === category).length;
                        return (
                          <Button
                            key={category}
                            variant="outline"
                            className="h-auto p-4 justify-start text-left"
                            onClick={() => handleCategorySelect(category)}
                          >
                            <div className="flex items-center gap-3">
                              <span className="text-2xl">{getCategoryEmoji(category)}</span>
                              <div>
                                <div className="font-medium">{category}</div>
                                <div className="text-xs text-muted-foreground">{categoryCount} species</div>
                              </div>
                            </div>
                          </Button>
                        );
                      })}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Choose a category to see specific species options
                    </p>
                  </div>
                </CardContent>
              </Card>
            ) : (
              /* Species Selection within Category */
              <Card className="bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800">
                <CardContent className="p-4">
                  <div className="space-y-4">
                    <div className="flex items-center gap-2">
                      <Button variant="ghost" size="sm" onClick={resetSelection}>
                        <ArrowLeft className="h-4 w-4" />
                      </Button>
                      <div>
                        <Label className="text-sm font-medium">
                          Step 2: Select {selectedCategory}
                        </Label>
                        <p className="text-xs text-muted-foreground">
                          {filteredLivestockOptions.length} species available
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex gap-2">
                      <div className="flex-1">
                        <Combobox
                          options={livestockComboOptions}
                          value={selectedLivestock}
                          onValueChange={handleLivestockSelect}
                          placeholder={`Search ${selectedCategory.toLowerCase()}...`}
                          searchPlaceholder={`Type to search ${selectedCategory.toLowerCase()}...`}
                          emptyText={`No ${selectedCategory.toLowerCase()} found.`}
                        />
                      </div>
                      <Button 
                        onClick={() => {
                          if (selectedLivestock) {
                            handleLivestockSelect(selectedLivestock);
                          }
                        }}
                        disabled={!selectedLivestock}
                        size="sm"
                      >
                        Select
                      </Button>
                    </div>
                    
                    <div className="text-center">
                      <span className="text-xs text-muted-foreground">or</span>
                    </div>
                    
                    <Button 
                      variant="outline" 
                      className="w-full"
                      onClick={() => {
                        setLivestock({
                          name: `Custom ${selectedCategory}`,
                          species: ''
                        });
                      }}
                    >
                      Add Custom {selectedCategory}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

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
