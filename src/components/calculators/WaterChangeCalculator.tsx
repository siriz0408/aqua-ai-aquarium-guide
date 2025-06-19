
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { AlertTriangle, Droplets, DollarSign, Scale } from 'lucide-react';
import { useAquarium, WaterParameters } from '@/contexts/AquariumContext';
import { saltMixes, getDefaultSaltMix, SaltMix } from '@/data/saltMixes';
import { 
  calculateWaterChange, 
  getPresetTargets, 
  ParameterTargets,
  WaterChangeCalculation 
} from '@/utils/waterChangeCalculations';
import { useToast } from '@/hooks/use-toast';

interface WaterChangeCalculatorProps {
  selectedTankId?: string;
}

export const WaterChangeCalculator: React.FC<WaterChangeCalculatorProps> = ({ 
  selectedTankId 
}) => {
  const { tanks, getTank } = useAquarium();
  const { toast } = useToast();
  
  const [tankId, setTankId] = useState<string>(selectedTankId || '');
  const [currentParams, setCurrentParams] = useState<WaterParameters | null>(null);
  const [targets, setTargets] = useState<ParameterTargets>({});
  const [selectedSaltMix, setSelectedSaltMix] = useState<SaltMix>(getDefaultSaltMix());
  const [changePercentage, setChangePercentage] = useState<number>(15);
  const [customTargets, setCustomTargets] = useState<ParameterTargets>({});
  const [calculation, setCalculation] = useState<WaterChangeCalculation | null>(null);

  // Load tank parameters when tank is selected
  useEffect(() => {
    if (tankId) {
      const tank = getTank(tankId);
      if (tank && tank.parameters.length > 0) {
        const latest = tank.parameters[0]; // Most recent parameters
        setCurrentParams(latest);
      }
    }
  }, [tankId, getTank]);

  // Recalculate when inputs change
  useEffect(() => {
    if (currentParams && tankId) {
      const tank = getTank(tankId);
      if (tank) {
        const tankVolume = parseInt(tank.size) || 50; // Extract gallons from size string
        const finalTargets = { ...targets, ...customTargets };
        
        const calc = calculateWaterChange(
          currentParams,
          finalTargets,
          selectedSaltMix,
          tankVolume,
          changePercentage
        );
        setCalculation(calc);
      }
    }
  }, [currentParams, targets, customTargets, selectedSaltMix, changePercentage, tankId, getTank]);

  const handlePresetSelect = (preset: string) => {
    const presetTargets = getPresetTargets(preset);
    setTargets(presetTargets);
    setCustomTargets({});
  };

  const handleCustomTargetChange = (param: keyof ParameterTargets, value: string) => {
    const numValue = parseFloat(value);
    if (!isNaN(numValue)) {
      setCustomTargets(prev => ({ ...prev, [param]: numValue }));
      setTargets({}); // Clear preset targets when using custom
    }
  };

  const handleLogWaterChange = () => {
    if (!calculation || !currentParams || !tankId) return;
    
    // Here you would typically save the water change event to the database
    // For now, we'll just show a success message
    toast({
      title: "Water Change Logged",
      description: `${changePercentage}% water change recorded with predicted parameter changes.`,
    });
  };

  if (!currentParams) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Select Tank</CardTitle>
          <CardDescription>Choose a tank with test data to calculate water changes</CardDescription>
        </CardHeader>
        <CardContent>
          <Select value={tankId} onValueChange={setTankId}>
            <SelectTrigger>
              <SelectValue placeholder="Choose tank..." />
            </SelectTrigger>
            <SelectContent>
              {tanks.map(tank => (
                <SelectItem key={tank.id} value={tank.id}>
                  {tank.name} ({tank.parameters.length} tests)
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Current Parameters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Droplets className="h-5 w-5" />
            Current Parameters
          </CardTitle>
          <CardDescription>Latest test results from your tank</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <Label className="text-sm text-muted-foreground">pH</Label>
              <div className="text-lg font-medium">{currentParams.ph}</div>
            </div>
            <div>
              <Label className="text-sm text-muted-foreground">Salinity</Label>
              <div className="text-lg font-medium">{currentParams.salinity}</div>
            </div>
            <div>
              <Label className="text-sm text-muted-foreground">Calcium</Label>
              <div className="text-lg font-medium">{currentParams.calcium} ppm</div>
            </div>
            <div>
              <Label className="text-sm text-muted-foreground">Alkalinity</Label>
              <div className="text-lg font-medium">{currentParams.kh} dKH</div>
            </div>
            <div>
              <Label className="text-sm text-muted-foreground">Magnesium</Label>
              <div className="text-lg font-medium">{currentParams.magnesium} ppm</div>
            </div>
            <div>
              <Label className="text-sm text-muted-foreground">Nitrate</Label>
              <div className="text-lg font-medium">{currentParams.nitrate} ppm</div>
            </div>
            <div>
              <Label className="text-sm text-muted-foreground">Nitrite</Label>
              <div className="text-lg font-medium">{currentParams.nitrite} ppm</div>
            </div>
            <div>
              <Label className="text-sm text-muted-foreground">Ammonia</Label>
              <div className="text-lg font-medium">{currentParams.ammonia} ppm</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Target Parameters */}
      <Card>
        <CardHeader>
          <CardTitle>Target Parameters</CardTitle>
          <CardDescription>What would you like to achieve?</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePresetSelect('reduce-nitrates')}
            >
              Reduce Nitrates
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePresetSelect('raise-ph')}
            >
              Raise pH
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePresetSelect('lower-salinity')}
            >
              Lower Salinity
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePresetSelect('reef-optimal')}
            >
              Reef Optimal
            </Button>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <Label htmlFor="target-nitrate">Target Nitrate (ppm)</Label>
              <Input
                id="target-nitrate"
                type="number"
                placeholder="5"
                onChange={(e) => handleCustomTargetChange('nitrate', e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="target-ph">Target pH</Label>
              <Input
                id="target-ph"
                type="number"
                step="0.1"
                placeholder="8.2"
                onChange={(e) => handleCustomTargetChange('ph', e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="target-salinity">Target Salinity</Label>
              <Input
                id="target-salinity"
                type="number"
                step="0.001"
                placeholder="1.025"
                onChange={(e) => handleCustomTargetChange('salinity', e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="target-calcium">Target Calcium (ppm)</Label>
              <Input
                id="target-calcium"
                type="number"
                placeholder="420"
                onChange={(e) => handleCustomTargetChange('calcium', e.target.value)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Salt Mix Selection */}
      <Card>
        <CardHeader>
          <CardTitle>Salt Mix Selection</CardTitle>
          <CardDescription>Choose your salt mix to predict accurate results</CardDescription>
        </CardHeader>
        <CardContent>
          <Select 
            value={selectedSaltMix.id} 
            onValueChange={(value) => {
              const mix = saltMixes.find(m => m.id === value);
              if (mix) setSelectedSaltMix(mix);
            }}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {saltMixes.map(mix => (
                <SelectItem key={mix.id} value={mix.id}>
                  <div>
                    <div className="font-medium">{mix.brand} {mix.name}</div>
                    <div className="text-sm text-muted-foreground">
                      ${mix.costPerGallon}/gal • {mix.description}
                    </div>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {/* Calculation Results */}
      {calculation && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Scale className="h-5 w-5" />
              Calculation Results
              <Badge variant={calculation.safetyScore > 80 ? 'default' : 'destructive'}>
                Safety: {calculation.safetyScore}%
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Water Change Slider */}
            <div>
              <Label className="text-base font-medium">
                Water Change: {changePercentage}%
              </Label>
              <div className="mt-2">
                <Slider
                  value={[changePercentage]}
                  onValueChange={(value) => setChangePercentage(value[0])}
                  min={5}
                  max={50}
                  step={1}
                  className="w-full"
                />
              </div>
              <div className="flex justify-between text-sm text-muted-foreground mt-1">
                <span>5%</span>
                <span>Recommended: {Math.round(calculation.recommendedPercentage)}%</span>
                <span>50%</span>
              </div>
            </div>

            {/* Predicted Parameters */}
            <div>
              <h4 className="font-medium mb-3">Predicted New Parameters</h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {Object.entries(calculation.predictedParameters).map(([key, value]) => {
                  if (value === undefined) return null;
                  const currentValue = currentParams[key as keyof WaterParameters];
                  const change = value - currentValue;
                  const isIncrease = change > 0;
                  
                  return (
                    <div key={key} className="bg-muted rounded-lg p-3">
                      <Label className="text-sm text-muted-foreground capitalize">
                        {key === 'kh' ? 'Alkalinity' : key}
                      </Label>
                      <div className="text-lg font-medium">
                        {typeof value === 'number' ? value.toFixed(key === 'ph' || key === 'salinity' ? 3 : 0) : value}
                        {key.includes('calcium') || key.includes('magnesium') || key.includes('nitrate') || key.includes('nitrite') || key.includes('ammonia') ? ' ppm' : ''}
                        {key === 'kh' ? ' dKH' : ''}
                      </div>
                      <div className={`text-sm ${isIncrease ? 'text-green-600' : 'text-red-600'}`}>
                        {isIncrease ? '+' : ''}{change.toFixed(key === 'ph' || key === 'salinity' ? 3 : 1)}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Warnings */}
            {calculation.warnings.length > 0 && (
              <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <AlertTriangle className="h-4 w-4 text-yellow-600" />
                  <span className="font-medium text-yellow-800 dark:text-yellow-200">
                    Parameter Shift Warnings
                  </span>
                </div>
                <ul className="space-y-1 text-sm text-yellow-700 dark:text-yellow-300">
                  {calculation.warnings.map((warning, index) => (
                    <li key={index}>• {warning}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Cost & Salt Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-muted rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Scale className="h-4 w-4 text-blue-600" />
                  <span className="font-medium">Salt Needed</span>
                </div>
                <div className="text-2xl font-bold">{calculation.saltNeeded.toFixed(2)} lbs</div>
                <div className="text-sm text-muted-foreground">
                  {selectedSaltMix.brand} {selectedSaltMix.name}
                </div>
              </div>
              
              <div className="bg-muted rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <DollarSign className="h-4 w-4 text-green-600" />
                  <span className="font-medium">Estimated Cost</span>
                </div>
                <div className="text-2xl font-bold">${calculation.estimatedCost.toFixed(2)}</div>
                <div className="text-sm text-muted-foreground">
                  Salt mix only
                </div>
              </div>
            </div>

            {/* Action Button */}
            <Button 
              onClick={handleLogWaterChange}
              className="w-full"
              size="lg"
            >
              Log Water Change
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
