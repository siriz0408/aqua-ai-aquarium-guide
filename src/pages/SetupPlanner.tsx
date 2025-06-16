
import React, { useState } from 'react';
import { Layout } from '@/components/Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Plus } from 'lucide-react';

const SetupPlanner = () => {
  const { toast } = useToast();
  const [isGenerating, setIsGenerating] = useState(false);
  const [setupPlan, setSetupPlan] = useState<any>(null);
  const [formData, setFormData] = useState({
    livestock: '',
    length: '',
    width: '',
    height: '',
    budget: '',
  });

  const generateSetupPlan = async () => {
    if (!formData.livestock || !formData.length || !formData.budget) {
      toast({
        title: "Please fill in required fields",
        description: "Livestock goals, tank dimensions, and budget are required",
        variant: "destructive",
      });
      return;
    }

    setIsGenerating(true);
    
    // Simulate AI generation
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    const mockPlan = {
      tankSize: `${formData.length}"L x ${formData.width || '18'}"W x ${formData.height || '20'}"H`,
      estimatedGallons: Math.round((parseInt(formData.length) * parseInt(formData.width || '18') * parseInt(formData.height || '20')) / 231),
      equipment: [
        { item: 'Tank + Stand', price: '$600-800', priority: 'Essential' },
        { item: 'Protein Skimmer', price: '$200-400', priority: 'Essential' },
        { item: 'Return Pump', price: '$100-200', priority: 'Essential' },
        { item: 'Heater (200W)', price: '$30-50', priority: 'Essential' },
        { item: 'LED Lighting', price: '$300-600', priority: 'Essential' },
        { item: 'Live Rock (50lbs)', price: '$200-300', priority: 'Essential' },
        { item: 'Salt Mix', price: '$40-60', priority: 'Essential' },
        { item: 'Test Kits', price: '$80-120', priority: 'Essential' },
        { item: 'Powerheads (2x)', price: '$100-200', priority: 'Recommended' },
        { item: 'Auto Top Off', price: '$150-250', priority: 'Recommended' },
      ],
      compatibleLivestock: [
        'Ocellaris Clownfish (pair)',
        'Yellow Watchman Goby',
        'Coral Beauty Angelfish',
        'Cleaner Shrimp',
        'Hermit Crabs (cleanup crew)',
        'Turbo Snails (cleanup crew)',
      ],
      timeline: [
        'Week 1-2: Set up equipment, add saltwater and live rock',
        'Week 3-6: Nitrogen cycle (test daily, no fish yet)',
        'Week 7: Add first fish (clownfish pair)',
        'Week 9: Add cleanup crew',
        'Week 11: Add second fish species',
        'Month 3+: Begin adding corals (if reef tank)',
      ],
      totalEstimate: `$1,400 - $2,200`,
      monthlyMaintenance: '$30-50 (salt, test reagents, food)',
    };
    
    setSetupPlan(mockPlan);
    setIsGenerating(false);
    
    toast({
      title: "Setup plan generated!",
      description: "Your custom aquarium plan is ready",
    });
  };

  const updateFormData = (key: string, value: string) => {
    setFormData(prev => ({ ...prev, [key]: value }));
  };

  return (
    <Layout title="Smart Setup Planner">
      <div className="space-y-6 pb-20">
        <Card>
          <CardHeader>
            <CardTitle>Custom Tank Setup Generator</CardTitle>
            <CardDescription>
              Get AI-powered recommendations for your perfect saltwater aquarium
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <div>
                <Label htmlFor="livestock">Desired Livestock *</Label>
                <Textarea
                  id="livestock"
                  placeholder="e.g., Clownfish, angelfish, some corals for a beginner reef tank"
                  value={formData.livestock}
                  onChange={(e) => updateFormData('livestock', e.target.value)}
                />
              </div>
              
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="length">Length (inches) *</Label>
                  <Input
                    id="length"
                    type="number"
                    placeholder="48"
                    value={formData.length}
                    onChange={(e) => updateFormData('length', e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="width">Width (inches)</Label>
                  <Input
                    id="width"
                    type="number"
                    placeholder="18"
                    value={formData.width}
                    onChange={(e) => updateFormData('width', e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="height">Height (inches)</Label>
                  <Input
                    id="height"
                    type="number"
                    placeholder="20"
                    value={formData.height}
                    onChange={(e) => updateFormData('height', e.target.value)}
                  />
                </div>
              </div>
              
              <div>
                <Label htmlFor="budget">Budget (USD) *</Label>
                <Input
                  id="budget"
                  type="number"
                  placeholder="2000"
                  value={formData.budget}
                  onChange={(e) => updateFormData('budget', e.target.value)}
                />
              </div>
            </div>

            <Button 
              onClick={generateSetupPlan} 
              disabled={isGenerating}
              className="w-full ocean-gradient text-white"
            >
              <Plus className="mr-2 h-4 w-4" />
              {isGenerating ? 'Generating Plan...' : 'Generate Setup Plan'}
            </Button>

            {isGenerating && (
              <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <div className="flex items-center justify-center space-x-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
                  <span className="text-sm">AI is creating your custom setup plan...</span>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {setupPlan && (
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Your Custom Setup Plan</CardTitle>
                <CardDescription>
                  Tank Size: {setupPlan.tankSize} (~{setupPlan.estimatedGallons} gallons)
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-medium mb-3">Equipment List</h4>
                    <div className="space-y-2">
                      {setupPlan.equipment.map((item: any, index: number) => (
                        <div key={index} className="flex justify-between items-center">
                          <div>
                            <span className="text-sm">{item.item}</span>
                            <span className={`ml-2 text-xs px-2 py-1 rounded ${
                              item.priority === 'Essential' 
                                ? 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-200' 
                                : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-200'
                            }`}>
                              {item.priority}
                            </span>
                          </div>
                          <span className="text-sm font-medium">{item.price}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-medium mb-3">Compatible Livestock</h4>
                    <div className="space-y-1">
                      {setupPlan.compatibleLivestock.map((animal: string, index: number) => (
                        <div key={index} className="text-sm">{animal}</div>
                      ))}
                    </div>
                  </div>
                </div>
                
                <div className="mt-6">
                  <h4 className="font-medium mb-3">Setup Timeline</h4>
                  <div className="space-y-2">
                    {setupPlan.timeline.map((step: string, index: number) => (
                      <div key={index} className="text-sm">{step}</div>
                    ))}
                  </div>
                </div>
                
                <div className="mt-6 p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm font-medium text-green-800 dark:text-green-200">Total Setup Cost</p>
                      <p className="text-lg font-bold text-green-700 dark:text-green-300">{setupPlan.totalEstimate}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-green-800 dark:text-green-200">Monthly Maintenance</p>
                      <p className="text-lg font-bold text-green-700 dark:text-green-300">{setupPlan.monthlyMaintenance}</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default SetupPlanner;
