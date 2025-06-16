
import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowRight } from 'lucide-react';

interface TankSpecs {
  length: string;
  width: string;
  height: string;
  tankType: string;
  experience: string;
  location: string;
  goals: string;
}

interface TankSpecsStepProps {
  specs: TankSpecs;
  onSpecChange: (key: keyof TankSpecs, value: string) => void;
  onNext: () => void;
  isValid: boolean;
}

const TankSpecsStep: React.FC<TankSpecsStepProps> = ({
  specs,
  onSpecChange,
  onNext,
  isValid
}) => {
  const calculateGallons = () => {
    if (specs.length && specs.width && specs.height) {
      return Math.round((parseInt(specs.length) * parseInt(specs.width) * parseInt(specs.height)) / 231);
    }
    return 0;
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium mb-4">Tank Specifications</h3>
        
        <div className="grid grid-cols-3 gap-4 mb-4">
          <div>
            <Label htmlFor="length">Length (inches) *</Label>
            <Input
              id="length"
              type="number"
              placeholder="48"
              value={specs.length}
              onChange={(e) => onSpecChange('length', e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="width">Width (inches) *</Label>
            <Input
              id="width"
              type="number"
              placeholder="18"
              value={specs.width}
              onChange={(e) => onSpecChange('width', e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="height">Height (inches) *</Label>
            <Input
              id="height"
              type="number"
              placeholder="20"
              value={specs.height}
              onChange={(e) => onSpecChange('height', e.target.value)}
            />
          </div>
        </div>

        {calculateGallons() > 0 && (
          <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg mb-4">
            <p className="text-sm text-blue-700 dark:text-blue-300">
              Estimated Volume: <span className="font-semibold">{calculateGallons()} gallons</span>
            </p>
          </div>
        )}

        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <Label htmlFor="tankType">Tank Type *</Label>
            <Select value={specs.tankType} onValueChange={(value) => onSpecChange('tankType', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select tank type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="fowlr">FOWLR (Fish Only)</SelectItem>
                <SelectItem value="reef">Reef Tank</SelectItem>
                <SelectItem value="mixed">Mixed Reef</SelectItem>
                <SelectItem value="nano">Nano Reef</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div>
            <Label htmlFor="experience">Experience Level *</Label>
            <Select value={specs.experience} onValueChange={(value) => onSpecChange('experience', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select experience" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="beginner">Beginner</SelectItem>
                <SelectItem value="intermediate">Intermediate</SelectItem>
                <SelectItem value="advanced">Advanced</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="mb-4">
          <Label htmlFor="location">Tank Location</Label>
          <Input
            id="location"
            placeholder="e.g., Living room, basement, office"
            value={specs.location}
            onChange={(e) => onSpecChange('location', e.target.value)}
          />
        </div>

        <div>
          <Label htmlFor="goals">Goals & Livestock Interests *</Label>
          <Textarea
            id="goals"
            placeholder="Describe what you want to keep (fish, corals, inverts) and your main goals for this tank..."
            value={specs.goals}
            onChange={(e) => onSpecChange('goals', e.target.value)}
            rows={3}
          />
        </div>
      </div>

      <div className="flex justify-end">
        <Button 
          onClick={onNext} 
          disabled={!isValid}
          className="ocean-gradient text-white"
        >
          Next: Budget & Timeline
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};

export default TankSpecsStep;
