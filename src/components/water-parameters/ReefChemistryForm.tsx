
import React from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';

interface ReefChemistryFormProps {
  parameters: {
    kh: string;
    calcium: string;
    magnesium: string;
  };
  onParameterChange: (key: string, value: string) => void;
}

export const ReefChemistryForm: React.FC<ReefChemistryFormProps> = ({
  parameters,
  onParameterChange
}) => {
  return (
    <div className="space-y-4">
      <h3 className="font-medium text-green-600">Reef Chemistry</h3>
      <div className="grid grid-cols-1 gap-4">
        <div>
          <Label htmlFor="kh">KH (Alkalinity) dKH</Label>
          <Input
            id="kh"
            type="number"
            step="0.1"
            placeholder="8.5"
            value={parameters.kh}
            onChange={(e) => onParameterChange('kh', e.target.value)}
          />
        </div>
        <div>
          <Label htmlFor="calcium">Calcium (ppm)</Label>
          <Input
            id="calcium"
            type="number"
            placeholder="420"
            value={parameters.calcium}
            onChange={(e) => onParameterChange('calcium', e.target.value)}
          />
        </div>
        <div>
          <Label htmlFor="magnesium">Magnesium (ppm)</Label>
          <Input
            id="magnesium"
            type="number"
            placeholder="1300"
            value={parameters.magnesium}
            onChange={(e) => onParameterChange('magnesium', e.target.value)}
          />
        </div>
      </div>
    </div>
  );
};
