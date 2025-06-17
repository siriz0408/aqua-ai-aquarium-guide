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
import { Upload, Save, ArrowLeft } from 'lucide-react';
import { equipmentOptions, equipmentCategories } from '@/data/equipmentOptions';

const Equipment = () => {
  const { tankId } = useParams<{ tankId: string }>();
  const navigate = useNavigate();
  const { getTank, addEquipment } = useAquarium();
  const { toast } = useToast();
  
  const tank = tankId ? getTank(tankId) : undefined;
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedEquipment, setSelectedEquipment] = useState('');
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

  // Filter equipment options by selected category
  const filteredEquipmentOptions = selectedCategory 
    ? equipmentOptions.filter(opt => opt.category === selectedCategory)
    : [];

  const equipmentComboOptions = filteredEquipmentOptions.map(opt => ({
    value: opt.value,
    label: opt.label
  }));

  const handleCategorySelect = (category: string) => {
    setSelectedCategory(category);
    setSelectedEquipment('');
    setEquipment(prev => ({ ...prev, type: category }));
  };

  const handleEquipmentSelect = (value: string) => {
    setSelectedEquipment(value);
    const selectedOption = equipmentOptions.find(opt => opt.value === value);
    if (selectedOption) {
      setEquipment({
        name: selectedOption.label,
        type: selectedOption.category,
        model: ''
      });
    }
  };

  const resetSelection = () => {
    setSelectedCategory('');
    setSelectedEquipment('');
    setEquipment({
      name: '',
      type: '',
      model: '',
    });
  };

  const mockAnalyzeEquipment = async () => {
    setIsAnalyzing(true);
    
    // Simulate AI analysis
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Mock AI identification
    const mockResults = {
      name: 'Protein Skimmer',
      type: 'Filtration',
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

  const addSelectedEquipment = async () => {
    if (!selectedEquipment) return;
    
    const selectedOption = equipmentOptions.find(opt => opt.value === selectedEquipment);
    if (!selectedOption) return;

    const newEquipment = {
      name: selectedOption.label,
      type: selectedOption.category,
      model: '',
      imageUrl: '',
      maintenanceTips: selectedOption.description || '',
      upgradeNotes: ''
    };
    
    await addEquipment(tankId!, newEquipment);
    setSelectedEquipment('');
  };

  const handleSave = async () => {
    if (!equipment.name || !equipment.type) {
      toast({
        title: "Please fill in equipment details",
        variant: "destructive",
      });
      return;
    }

    const newEquipment = {
      name: equipment.name,
      type: equipment.type,
      model: equipment.model,
      imageUrl: '',
      maintenanceTips: 'Clean collection cup weekly, adjust air flow for dry foam, replace airline tubing every 6 months.',
      upgradeNotes: 'Consider upgrading to a larger model if adding more fish load to the tank.',
    };

    await addEquipment(tankId!, newEquipment);
    navigate(`/tank/${tankId}`);
  };

  const getCategoryEmoji = (category: string) => {
    switch (category) {
      case 'Tank System': return '🏗️';
      case 'Filtration': return '🌊';
      case 'Lighting': return '💡';
      case 'Heating & Cooling': return '🌡️';
      case 'Water Movement': return '🌀';
      case 'Monitoring': return '📊';
      case 'Dosing & Automation': return '⚗️';
      case 'Maintenance': return '🧹';
      case 'Food & Supplements': return '🥄';
      case 'Substrate & Decor': return '🪨';
      default: return '⚙️';
    }
  };

  return (
    <Layout title="Add Equipment" showBackButton>
      <div className="space-y-6 pb-20">
        <Card>
          <CardHeader>
            <CardTitle>Equipment Identification</CardTitle>
            <CardDescription>
              Select category first, then choose specific equipment or upload a photo for AI identification
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Category Selection */}
            {!selectedCategory ? (
              <Card className="bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
                <CardContent className="p-4">
                  <div className="space-y-4">
                    <Label className="text-sm font-medium">Step 1: Select Equipment Category</Label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {equipmentCategories.map(category => {
                        const categoryCount = equipmentOptions.filter(opt => opt.category === category).length;
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
                                <div className="text-xs text-muted-foreground">{categoryCount} options</div>
                              </div>
                            </div>
                          </Button>
                        );
                      })}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Choose a category to see specific equipment options
                    </p>
                  </div>
                </CardContent>
              </Card>
            ) : (
              /* Equipment Selection within Category */
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
                          {filteredEquipmentOptions.length} options available
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex gap-2">
                      <div className="flex-1">
                        <Combobox
                          options={equipmentComboOptions}
                          value={selectedEquipment}
                          onValueChange={handleEquipmentSelect}
                          placeholder={`Search ${selectedCategory.toLowerCase()}...`}
                          searchPlaceholder={`Type to search ${selectedCategory.toLowerCase()}...`}
                          emptyText={`No ${selectedCategory.toLowerCase()} found.`}
                        />
                      </div>
                      <Button 
                        onClick={addSelectedEquipment} 
                        disabled={!selectedEquipment}
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
                        setEquipment(prev => ({ 
                          ...prev, 
                          name: `Custom ${selectedCategory}`,
                          type: selectedCategory 
                        }));
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
                <Label htmlFor="type">Category</Label>
                <Select
                  value={equipment.type}
                  onValueChange={(value) => setEquipment(prev => ({ ...prev, type: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {equipmentCategories.map(category => (
                      <SelectItem key={category} value={category}>
                        {getCategoryEmoji(category)} {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
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
