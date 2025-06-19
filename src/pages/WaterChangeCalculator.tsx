
import React, { useState } from 'react';
import { Layout } from '@/components/Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { WaterChangeCalculator as Calculator } from '@/components/calculators/WaterChangeCalculator';
import { useAquarium } from '@/contexts/AquariumContext';
import { Calculator as CalculatorIcon, Droplets } from 'lucide-react';

const WaterChangeCalculator = () => {
  const { tanks } = useAquarium();
  const [selectedTankId, setSelectedTankId] = useState<string>('');

  return (
    <Layout title="Water Change Calculator">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
              <CalculatorIcon className="h-6 w-6 text-blue-600" />
            </div>
            <h1 className="text-3xl font-bold">Water Change Calculator</h1>
          </div>
          <p className="text-muted-foreground">
            Calculate optimal water changes based on your tank's parameters and goals.
            Get predictions for parameter changes and safety warnings.
          </p>
        </div>

        {/* Tank Selection */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Droplets className="h-5 w-5" />
              Select Tank
            </CardTitle>
            <CardDescription>
              Choose the tank you want to calculate water changes for
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Select value={selectedTankId} onValueChange={setSelectedTankId}>
              <SelectTrigger className="w-full md:w-96">
                <SelectValue placeholder="Choose a tank..." />
              </SelectTrigger>
              <SelectContent>
                {tanks.map(tank => (
                  <SelectItem key={tank.id} value={tank.id}>
                    <div className="flex flex-col">
                      <span className="font-medium">{tank.name}</span>
                      <span className="text-sm text-muted-foreground">
                        {tank.size} • {tank.parameters.length} test{tank.parameters.length !== 1 ? 's' : ''}
                      </span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            {tanks.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                <Droplets className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p>No tanks found. Add a tank first to use the water change calculator.</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Calculator Component */}
        {selectedTankId && <Calculator selectedTankId={selectedTankId} />}
        
        {!selectedTankId && tanks.length > 0 && (
          <Card>
            <CardContent className="text-center py-12">
              <CalculatorIcon className="h-16 w-16 mx-auto mb-4 text-muted-foreground opacity-50" />
              <h3 className="text-lg font-medium mb-2">Ready to Calculate</h3>
              <p className="text-muted-foreground">
                Select a tank above to start calculating optimal water changes based on your parameters.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </Layout>
  );
};

export default WaterChangeCalculator;
