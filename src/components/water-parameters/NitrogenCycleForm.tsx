
import React from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';

interface NitrogenCycleFormProps {
  parameters: {
    ammonia: string;
    nitrite: string;
    nitrate: string;
  };
  onParameterChange: (key: string, value: string) => void;
}

export const NitrogenCycleForm: React.FC<NitrogenCycleFormProps> = ({
  parameters,
  onParameterChange
}) => {
  return (
    <div className="space-y-4">
      <h3 className="font-medium text-accent">Nitrogen Cycle</h3>
      <div className="grid grid-cols-1 gap-4">
        <div>
          <Label htmlFor="ammonia">Ammonia (ppm)</Label>
          <Input
            id="ammonia"
            type="number"
            step="0.01"
            placeholder="0.0"
            value={parameters.ammonia}
            onChange={(e) => onParameterChange('ammonia', e.target.value)}
          />
        </div>
        <div>
          <Label htmlFor="nitrite">Nitrite (ppm)</Label>
          <Input
            id="nitrite"
            type="number"
            step="0.01"
            placeholder="0.0"
            value={parameters.nitrite}
            onChange={(e) => onParameterChange('nitrite', e.target.value)}
          />
        </div>
        <div>
          <Label htmlFor="nitrate">Nitrate (ppm)</Label>
          <Input
            id="nitrate"
            type="number"
            placeholder="5"
            value={parameters.nitrate}
            onChange={(e) => onParameterChange('nitrate', e.target.value)}
          />
        </div>
      </div>
    </div>
  );
};
