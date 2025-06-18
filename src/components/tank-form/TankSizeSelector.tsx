
import React from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

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

interface TankSizeSelectorProps {
  formData: {
    selectedSize: string;
    length: string;
    width: string;
    height: string;
    gallons: string;
  };
  showCustomSize: boolean;
  onSizeSelect: (value: string) => void;
  onInputChange: (field: string, value: string) => void;
}

export function TankSizeSelector({ 
  formData, 
  showCustomSize, 
  onSizeSelect, 
  onInputChange 
}: TankSizeSelectorProps) {
  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="tank-size">Tank Size</Label>
        <Select value={formData.selectedSize} onValueChange={onSizeSelect}>
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
              onChange={(e) => onInputChange('length', e.target.value)}
              placeholder="48"
            />
          </div>
          <div>
            <Label htmlFor="width">Width (inches)</Label>
            <Input
              id="width"
              type="number"
              value={formData.width}
              onChange={(e) => onInputChange('width', e.target.value)}
              placeholder="24"
            />
          </div>
          <div>
            <Label htmlFor="height">Height (inches)</Label>
            <Input
              id="height"
              type="number"
              value={formData.height}
              onChange={(e) => onInputChange('height', e.target.value)}
              placeholder="20"
            />
          </div>
          <div>
            <Label htmlFor="gallons">Gallons</Label>
            <Input
              id="gallons"
              type="number"
              value={formData.gallons}
              onChange={(e) => onInputChange('gallons', e.target.value)}
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
  );
}
