import React, { useState } from 'react';
import { Layout } from '@/components/Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { RotateCcw, Sparkles } from 'lucide-react';
import SetupWizard from '@/components/setup-wizard/SetupWizard';

const SetupPlanner = () => {
  const { toast } = useToast();
  const [isGenerating, setIsGenerating] = useState(false);
  const [setupPlan, setSetupPlan] = useState<any>(null);

  const generateSetupPlan = async (planData: any) => {
    setIsGenerating(true);
    
    // Simulate AI generation with more realistic delay
    await new Promise(resolve => setTimeout(resolve, 4000));
    
    const gallons = Math.round((parseInt(planData.tankSpecs.length) * 
                               parseInt(planData.tankSpecs.width || '18') * 
                               parseInt(planData.tankSpecs.height || '20')) / 231);
    
    const mockPlan = {
      tankSize: `${planData.tankSpecs.length}"L x ${planData.tankSpecs.width || '18'}"W x ${planData.tankSpecs.height || '20'}"H`,
      estimatedGallons: gallons,
      tankType: planData.tankSpecs.tankType,
      experience: planData.tankSpecs.experience,
      totalBudget: planData.budgetTimeline.totalBudget,
      setupBudget: planData.budgetTimeline.setupBudget,
      equipment: [
        { item: 'Tank + Stand', price: '$600-800', priority: 'Essential', category: 'Tank System' },
        { item: 'Protein Skimmer', price: '$200-400', priority: 'Essential', category: 'Filtration' },
        { item: 'Return Pump', price: '$100-200', priority: 'Essential', category: 'Circulation' },
        { item: 'Heater (200W)', price: '$30-50', priority: 'Essential', category: 'Climate' },
        { item: 'LED Lighting', price: '$300-600', priority: 'Essential', category: 'Lighting' },
        { item: 'Live Rock (50lbs)', price: '$200-300', priority: 'Essential', category: 'Biologics' },
        { item: 'Salt Mix', price: '$40-60', priority: 'Essential', category: 'Water' },
        { item: 'Test Kits', price: '$80-120', priority: 'Essential', category: 'Monitoring' },
        { item: 'Powerheads (2x)', price: '$100-200', priority: 'Recommended', category: 'Circulation' },
        { item: 'Auto Top Off', price: '$150-250', priority: 'Recommended', category: 'Automation' },
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
      monthlyMaintenance: planData.budgetTimeline.monthlyBudget ? 
        `$${planData.budgetTimeline.monthlyBudget}` : '$30-50',
      recommendations: {
        beginner: planData.tankSpecs.experience === 'beginner',
        reef: planData.tankSpecs.tankType.includes('reef'),
        budget: planData.budgetTimeline.priority === 'budget'
      }
    };
    
    setSetupPlan(mockPlan);
    setIsGenerating(false);
    
    toast({
      title: "Setup plan generated!",
      description: "Your custom aquarium plan is ready with step-by-step guidance",
    });
  };

  const resetPlan = () => {
    setSetupPlan(null);
    toast({
      title: "Plan reset",
      description: "Start over with new specifications",
    });
  };

  return (
    <Layout title="Smart Setup Planner">
      <div className="space-y-6 pb-20">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-primary" />
                  Enhanced Setup Planner
                </CardTitle>
                <CardDescription>
                  Step-by-step guidance for your perfect saltwater aquarium setup
                </CardDescription>
              </div>
              {setupPlan && (
                <Button variant="outline" onClick={resetPlan}>
                  <RotateCcw className="mr-2 h-4 w-4" />
                  Start Over
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent>
            {!setupPlan && !isGenerating && (
              <SetupWizard onPlanGenerated={generateSetupPlan} />
            )}

            {isGenerating && (
              <div className="text-center p-8 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <div className="flex items-center justify-center space-x-2 mb-4">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                  <span className="text-lg font-medium">Generating Your Custom Plan...</span>
                </div>
                <p className="text-sm text-muted-foreground">
                  Analyzing your specifications and creating personalized recommendations
                </p>
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
