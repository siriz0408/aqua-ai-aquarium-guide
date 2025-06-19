
import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface QuickParameterInputsProps {
  parameters: {
    ph: string;
    ammonia: string;
    nitrite: string;
    nitrate: string;
  };
  onInputChange: (field: string, value: string) => void;
}

export const QuickParameterInputs: React.FC<QuickParameterInputsProps> = ({
  parameters,
  onInputChange,
}) => {
  return (
    <div className="grid gap-4 py-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="ph">pH</Label>
          <Input
            id="ph"
            type="number"
            inputMode="decimal"
            step="0.1"
            min="0"
            max="14"
            placeholder="8.2"
            value={parameters.ph}
            onChange={(e) => onInputChange('ph', e.target.value)}
            className="text-center"
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="ammonia">Ammonia (ppm)</Label>
          <Input
            id="ammonia"
            type="number"
            inputMode="decimal"
            step="0.01"
            min="0"
            placeholder="0.00"
            value={parameters.ammonia}
            onChange={(e) => onInputChange('ammonia', e.target.value)}
            className="text-center"
          />
        </div>
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="nitrite">Nitrite (ppm)</Label>
          <Input
            id="nitrite"
            type="number"
            inputMode="decimal"
            step="0.01"
            min="0"
            placeholder="0.00"
            value={parameters.nitrite}
            onChange={(e) => onInputChange('nitrite', e.target.value)}
            className="text-center"
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="nitrate">Nitrate (ppm)</Label>
          <Input
            id="nitrate"
            type="number"
            inputMode="decimal"
            step="0.1"
            min="0"
            placeholder="5.0"
            value={parameters.nitrate}
            onChange={(e) => onInputChange('nitrate', e.target.value)}
            className="text-center"
          />
        </div>
      </div>
    </div>
  );
};
