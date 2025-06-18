
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Layout } from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAquarium } from '@/contexts/AquariumContext';
import { ProductLookup } from './ProductLookup';
import { TankRecommendations } from './TankRecommendations';
import { EquipmentManager } from './EquipmentManager';
import { LivestockManager } from './LivestockManager';
import { TankBasicInfo } from './TankBasicInfo';
import { TankSizeSelector } from './TankSizeSelector';
import { CompatibilityWarning } from './CompatibilityWarning';
import { Save } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useTankForm } from '@/hooks/useTankForm';

const TankEditForm = () => {
  const navigate = useNavigate();
  const { updateTank, addTank } = useAquarium();
  const { toast } = useToast();
  
  const {
    formData,
    equipment,
    livestock,
    showCustomSize,
    isEditing,
    tank,
    tankId,
    setFormData,
    setEquipment,
    setLivestock,
    setShowCustomSize,
    handleInputChange
  } = useTankForm();

  const handleSizeSelect = (value: string) => {
    setFormData(prev => ({ ...prev, selectedSize: value }));
    
    if (value === 'custom') {
      setShowCustomSize(true);
      setFormData(prev => ({ ...prev, length: '', width: '', height: '', gallons: '' }));
    } else {
      setShowCustomSize(false);
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
        { label: '180 Gallon (72"×24"×24")', value: '72x24x24', gallons: 180 }
      ];
      
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
        <TankBasicInfo formData={formData} onInputChange={handleInputChange} />
        
        <TankSizeSelector
          formData={formData}
          showCustomSize={showCustomSize}
          onSizeSelect={handleSizeSelect}
          onInputChange={handleInputChange}
        />

        <ProductLookup onProductFound={addProductToTank} />

        <TankRecommendations 
          tankType={formData.type}
          gallons={parseInt(formData.gallons) || 0}
          onAddRecommendation={addProductToTank}
        />

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

        <CompatibilityWarning livestock={livestock} />
      </div>
    </Layout>
  );
};

export default TankEditForm;
