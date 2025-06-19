
import React from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';

interface EssentialParametersFormProps {
  parameters: {
    ph: string;
    salinity: string;
    temperature: string;
  };
  onParameterChange: (key: string, value: string) => void;
}

export const EssentialParametersForm: React.FC<EssentialParametersFormProps> = ({
  parameters,
  onParameterChange
}) => {
  return (
    <div className="space-y-4">
      <h3 className="font-medium text-primary">Essential Parameters *</h3>
      <div className="grid grid-cols-1 gap-4">
        <div>
          <Label htmlFor="ph">pH Level</Label>
          <Input
            id="ph"
            type="number"
            step="0.1"
            placeholder="8.2"
            value={parameters.ph}
            onChange={(e) => onParameterChange('ph', e.target.value)}
          />
        </div>
        <div>
          <Label htmlFor="salinity">Salinity (specific gravity)</Label>
          <Input
            id="salinity"
            type="number"
            step="0.001"
            placeholder="1.025"
            value={parameters.salinity}
            onChange={(e) => onParameterChange('salinity', e.target.value)}
          />
        </div>
        <div>
          <Label htmlFor="temperature">Temperature (°F)</Label>
          <Input
            id="temperature"
            type="number"
            placeholder="78"
            value={parameters.temperature}
            onChange={(e) => onParameterChange('temperature', e.target.value)}
          />
        </div>
      </div>
    </div>
  );
};
