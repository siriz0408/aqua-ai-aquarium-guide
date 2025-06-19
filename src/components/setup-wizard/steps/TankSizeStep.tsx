
import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';

interface TankSizeStepProps {
  value: string;
  customSize?: {
    length: string;
    width: string;
    height: string;
    gallons: string;
  };
  onChange: (value: string, customSize?: any) => void;
}

const TankSizeStep: React.FC<TankSizeStepProps> = ({ value, customSize, onChange }) => {
  const [showCustom, setShowCustom] = useState(value === 'custom');

  const commonSizes = [
    { id: '20-gallon', label: '20 Gallon Long', dimensions: '30" × 12" × 12"', image: 'photo-1472396961693-142e6e269027' },
    { id: '40-gallon', label: '40 Gallon Breeder', dimensions: '36" × 18" × 16"', image: 'photo-1483058712412-4245e9b90334' },
    { id: '75-gallon', label: '75 Gallon', dimensions: '48" × 18" × 21"', image: 'photo-1506744038136-46273834b3fb' },
    { id: '120-gallon', label: '120 Gallon', dimensions: '48" × 24" × 24"', image: 'photo-1465146344425-f00d5f5c8f07' },
    { id: '180-gallon', label: '180 Gallon', dimensions: '72" × 24" × 24"', image: 'photo-1486718448742-163732cd1544' }
  ];

  const handleSizeChange = (selectedValue: string) => {
    if (selectedValue === 'custom') {
      setShowCustom(true);
      onChange(selectedValue, customSize || { length: '', width: '', height: '', gallons: '' });
    } else {
      setShowCustom(false);
      onChange(selectedValue);
    }
  };

  const handleCustomSizeChange = (field: string, fieldValue: string) => {
    const newCustomSize = {
      ...customSize,
      [field]: fieldValue
    };
    onChange('custom', newCustomSize);
  };

  return (
    <div className="space-y-6">
      <RadioGroup value={value} onValueChange={handleSizeChange}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {commonSizes.map((size) => (
            <div key={size.id} className="relative">
              <RadioGroupItem value={size.id} id={size.id} className="sr-only" />
              <Label 
                htmlFor={size.id}
                className="cursor-pointer"
              >
                <Card className={`transition-all duration-200 hover:shadow-md hover:scale-105 ${
                  value === size.id ? 'ring-2 ring-primary' : ''
                }`}>
                  <CardContent className="p-4">
                    <div 
                      className="w-full h-32 bg-cover bg-center rounded-md mb-3"
                      style={{
                        backgroundImage: `url(https://images.unsplash.com/${size.image}?w=400&h=200&fit=crop)`
                      }}
                    />
                    <h3 className="font-semibold text-lg">{size.label}</h3>
                    <p className="text-sm text-muted-foreground">{size.dimensions}</p>
                  </CardContent>
                </Card>
              </Label>
            </div>
          ))}
          
          {/* Custom Size Option */}
          <div className="relative">
            <RadioGroupItem value="custom" id="custom" className="sr-only" />
            <Label 
              htmlFor="custom"
              className="cursor-pointer"
            >
              <Card className={`transition-all duration-200 hover:shadow-md hover:scale-105 ${
                value === 'custom' ? 'ring-2 ring-primary' : ''
              }`}>
                <CardContent className="p-4">
                  <div className="w-full h-32 bg-gradient-to-br from-blue-100 to-cyan-100 dark:from-blue-900/20 dark:to-cyan-900/20 rounded-md mb-3 flex items-center justify-center">
                    <div className="text-4xl">📐</div>
                  </div>
                  <h3 className="font-semibold text-lg">Custom Size</h3>
                  <p className="text-sm text-muted-foreground">Enter your own dimensions</p>
                </CardContent>
              </Card>
            </Label>
          </div>
        </div>
      </RadioGroup>

      {/* Custom Size Inputs */}
      {showCustom && (
        <Card className="animate-fade-in">
          <CardContent className="p-4">
            <h3 className="font-semibold mb-4">Enter Custom Dimensions</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <Label htmlFor="length">Length (inches)</Label>
                <Input
                  id="length"
                  type="number"
                  placeholder="48"
                  value={customSize?.length || ''}
                  onChange={(e) => handleCustomSizeChange('length', e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="width">Width (inches)</Label>
                <Input
                  id="width"
                  type="number"
                  placeholder="24"
                  value={customSize?.width || ''}
                  onChange={(e) => handleCustomSizeChange('width', e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="height">Height (inches)</Label>
                <Input
                  id="height"
                  type="number"
                  placeholder="24"
                  value={customSize?.height || ''}
                  onChange={(e) => handleCustomSizeChange('height', e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="gallons">Gallons (optional)</Label>
                <Input
                  id="gallons"
                  type="number"
                  placeholder="120"
                  value={customSize?.gallons || ''}
                  onChange={(e) => handleCustomSizeChange('gallons', e.target.value)}
                />
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default TankSizeStep;
