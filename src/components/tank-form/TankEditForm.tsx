
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Layout } from '@/components/Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useAquarium } from '@/contexts/AquariumContext';
import { ProductLookup } from './ProductLookup';
import { TankRecommendations } from './TankRecommendations';
import { EquipmentManager } from './EquipmentManager';
import { LivestockManager } from './LivestockManager';
import { Save, AlertCircle, Lightbulb } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

// Common tank sizes
const commonTankSizes = [
  { label: '10 Gallon (20"×10"×12")', value: '20x10x12', gallons: 10 },
  { label: '20 Gallon Long (30"×12"×12")', value: '30x12x12', gallons: 20 },
  { label: '29 Gallon (30"×12"×18")', value: '30x12x18', gallons: 29 },
  { label: '40 Gallon Breeder (36"×18"×16")', value: '36x18x16', gallons: 40 },
  { label: '55 Gallon (48"×13"×21")', value: '48x13x21', gallons: 55 },
  { label: '75 Gallon (48"×18"×21")', value: '48x18x21', gallons: 75 },
  { label: '90 Gallon (48"×18"×24")', value: '48x18x24', gallons: 90 },
  { label: '120 Gallon (48"×24"×24")', value: '48x24x24', gallons: 120 },
  { label: '150 Gallon (72"×18"×28")', value: '72x18x28', gallons: 150 },
  { label: '180 Gallon (72"×24"×24")', value: '72x24x24', gallons: 180 },
  { label: 'Custom Size', value: 'custom', gallons: 0 }
];

const TankEditForm = () => {
  const { tankId } = useParams<{ tankId: string }>();
  const navigate = useNavigate();
  const { getTank, updateTank, addTank } = useAquarium();
  const { toast } = useToast();
  
  const tank = tankId ? getTank(tankId) : undefined;
  const isEditing = !!tankId && !!tank;

  const [formData, setFormData] = useState({
    name: '',
    size: '',
    type: 'FOWLR' as 'FOWLR' | 'Reef' | 'Mixed',
    length: '',
    width: '',
    height: '',
    gallons: '',
    location: '',
    lighting: '',
    filtration: '',
    heatingCooling: '',
    notes: '',
    selectedSize: ''
  });

  const [equipment, setEquipment] = useState<any[]>([]);
  const [livestock, setLivestock] = useState<any[]>([]);
  const [showRecommendations, setShowRecommendations] = useState(true);
  const [showCustomSize, setShowCustomSize] = useState(false);

  useEffect(() => {
    if (tank) {
      setFormData({
        name: tank.name,
        size: tank.size,
        type: tank.type,
        length: '',
        width: '',
        height: '',
        gallons: '',
        location: '',
        lighting: '',
        filtration: '',
        heatingCooling: '',
        notes: '',
        selectedSize: ''
      });
      setEquipment(tank.equipment || []);
      setLivestock(tank.livestock || []);
    }
  }, [tank]);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSizeSelect = (value: string) => {
    setFormData(prev => ({ ...prev, selectedSize: value }));
    
    if (value === 'custom') {
      setShowCustomSize(true);
      setFormData(prev => ({ ...prev, length: '', width: '', height: '', gallons: '' }));
    } else {
      setShowCustomSize(false);
      const selectedTank = commonTankSizes.find(tank => tank.value === value);
      if (selectedTank) {
        const [length, width, height] = selectedTank.value.split('x');
        setFormData(prev => ({
          ...prev,
          length,
          width,
          height,
          gallons: selectedTank.gallons.toString(),
          size: selectedTank.label
        }));
      }
    }
  };

  const handleSave = () => {
    let tankSize = formData.size;
    
    // Generate size string if custom dimensions are provided
    if (showCustomSize && formData.length && formData.width && formData.height) {
      tankSize = `${formData.length}×${formData.width}×${formData.height} inches`;
      if (formData.gallons) {
        tankSize += ` (~${formData.gallons} gal)`;
      }
    }

    const tankData = {
      name: formData.name,
      size: tankSize,
      type: formData.type,
      equipment,
      livestock,
      parameters: tank?.parameters || []
    };

    if (isEditing) {
      updateTank(tankId!, tankData);
      toast({
        title: "Tank updated successfully!",
        description: `${tankData.name} has been updated.`
      });
    } else {
      addTank(tankData);
      toast({
        title: "Tank created successfully!",
        description: `${tankData.name} has been added to your tanks.`
      });
    }

    navigate('/');
  };

  const addProductToTank = (product: any, category: 'equipment' | 'livestock') => {
    if (category === 'equipment') {
      setEquipment(prev => [...prev, {
        id: Date.now().toString(),
        name: product.name,
        type: product.category || 'Equipment',
        model: product.model || '',
        imageUrl: product.imageUrl || '',
        maintenanceTips: product.maintenanceTips || '',
        upgradeNotes: ''
      }]);
    } else {
      setLivestock(prev => [...prev, {
        id: Date.now().toString(),
        name: product.name,
        species: product.species || product.name,
        careLevel: product.careLevel || 'Beginner',
        compatibility: product.compatibility || 'Good',
        imageUrl: product.imageUrl || '',
        healthNotes: ''
      }]);
    }

    toast({
      title: "Product added!",
      description: `${product.name} has been added to your tank.`
    });
  };

  return (
    <Layout 
      title={isEditing ? `Edit ${tank?.name}` : "Add New Tank"} 
      showBackButton
      actions={
        <Button onClick={handleSave} className="gap-2">
          <Save className="h-4 w-4" />
          {isEditing ? 'Update Tank' : 'Create Tank'}
        </Button>
      }
    >
      <div className="space-y-6 pb-20">
        {/* Basic Tank Information */}
        <Card>
          <CardHeader>
            <CardTitle>Tank Information</CardTitle>
            <CardDescription>Basic details about your aquarium</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="name">Tank Name</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  placeholder="My Reef Tank"
                />
              </div>
              <div>
                <Label htmlFor="type">Tank Type</Label>
                <Select value={formData.type} onValueChange={(value: any) => handleInputChange('type', value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="FOWLR">FOWLR (Fish Only With Live Rock)</SelectItem>
                    <SelectItem value="Reef">Reef Tank</SelectItem>
                    <SelectItem value="Mixed">Mixed Reef</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Tank Size Selection */}
            <div className="space-y-4">
              <div>
                <Label htmlFor="tank-size">Tank Size</Label>
                <Select value={formData.selectedSize} onValueChange={handleSizeSelect}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a common tank size or custom" />
                  </SelectTrigger>
                  <SelectContent>
                    {commonTankSizes.map(tankSize => (
                      <SelectItem key={tankSize.value} value={tankSize.value}>
                        {tankSize.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {showCustomSize && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <Label htmlFor="length">Length (inches)</Label>
                    <Input
                      id="length"
                      type="number"
                      value={formData.length}
                      onChange={(e) => handleInputChange('length', e.target.value)}
                      placeholder="48"
                    />
                  </div>
                  <div>
                    <Label htmlFor="width">Width (inches)</Label>
                    <Input
                      id="width"
                      type="number"
                      value={formData.width}
                      onChange={(e) => handleInputChange('width', e.target.value)}
                      placeholder="24"
                    />
                  </div>
                  <div>
                    <Label htmlFor="height">Height (inches)</Label>
                    <Input
                      id="height"
                      type="number"
                      value={formData.height}
                      onChange={(e) => handleInputChange('height', e.target.value)}
                      placeholder="20"
                    />
                  </div>
                  <div>
                    <Label htmlFor="gallons">Gallons</Label>
                    <Input
                      id="gallons"
                      type="number"
                      value={formData.gallons}
                      onChange={(e) => handleInputChange('gallons', e.target.value)}
                      placeholder="75"
                    />
                  </div>
                </div>
              )}

              {formData.gallons && (
                <div className="text-sm text-muted-foreground">
                  Tank Volume: {formData.gallons} gallons
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="location">Location</Label>
                <Select value={formData.location} onValueChange={(value) => handleInputChange('location', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select location" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="living-room">Living Room</SelectItem>
                    <SelectItem value="bedroom">Bedroom</SelectItem>
                    <SelectItem value="office">Office</SelectItem>
                    <SelectItem value="basement">Basement</SelectItem>
                    <SelectItem value="garage">Garage</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="lighting">Primary Lighting</Label>
                <Select value={formData.lighting} onValueChange={(value) => handleInputChange('lighting', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select lighting type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="led">LED</SelectItem>
                    <SelectItem value="t5">T5 Fluorescent</SelectItem>
                    <SelectItem value="metal-halide">Metal Halide</SelectItem>
                    <SelectItem value="hybrid">Hybrid</SelectItem>
                    <SelectItem value="none">No Lighting Yet</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Product Lookup */}
        <ProductLookup onProductFound={addProductToTank} />

        {/* Recommendations */}
        {showRecommendations && (
          <TankRecommendations 
            tankType={formData.type}
            gallons={parseInt(formData.gallons) || 0}
            onAddRecommendation={addProductToTank}
          />
        )}

        {/* Tabs for Equipment and Livestock */}
        <Tabs defaultValue="equipment" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="equipment">Equipment ({equipment.length})</TabsTrigger>
            <TabsTrigger value="livestock">Livestock ({livestock.length})</TabsTrigger>
          </TabsList>
          
          <TabsContent value="equipment">
            <EquipmentManager 
              equipment={equipment}
              onUpdateEquipment={setEquipment}
              tankType={formData.type}
            />
          </TabsContent>

          <TabsContent value="livestock">
            <LivestockManager 
              livestock={livestock}
              onUpdateLivestock={setLivestock}
              tankType={formData.type}
              gallons={parseInt(formData.gallons) || 0}
            />
          </TabsContent>
        </Tabs>

        {/* Compatibility Warnings */}
        {livestock.length > 1 && (
          <Card className="border-orange-200 bg-orange-50 dark:border-orange-800 dark:bg-orange-900/20">
            <CardHeader className="pb-3">
              <CardTitle className="text-orange-800 dark:text-orange-200 flex items-center gap-2">
                <AlertCircle className="h-5 w-5" />
                Compatibility Check
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <p className="text-sm text-orange-700 dark:text-orange-300">
                  Review the compatibility of your livestock selection:
                </p>
                <div className="flex flex-wrap gap-2">
                  {livestock.map((animal) => (
                    <Badge key={animal.id} variant="secondary" className="text-xs">
                      {animal.name} - {animal.careLevel}
                    </Badge>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </Layout>
  );
};

export default TankEditForm;
