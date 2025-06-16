
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Plus, Minus, BarChart3, Settings, Lightbulb, AlertTriangle } from 'lucide-react';

interface EnhancedPlanDisplayProps {
  setupPlan: any;
  onPlanUpdate: (updatedPlan: any) => void;
}

const EnhancedPlanDisplay: React.FC<EnhancedPlanDisplayProps> = ({ setupPlan, onPlanUpdate }) => {
  const [selectedItems, setSelectedItems] = useState<string[]>(
    setupPlan.equipment.filter((item: any) => item.priority === 'Essential').map((item: any) => item.item)
  );
  const [showInsights, setShowInsights] = useState(true);
  const [advancedMode, setAdvancedMode] = useState(false);

  const toggleItem = (itemName: string, isSelected: boolean) => {
    if (isSelected) {
      setSelectedItems([...selectedItems, itemName]);
    } else {
      setSelectedItems(selectedItems.filter(item => item !== itemName));
    }
  };

  const calculateTotalCost = () => {
    return setupPlan.equipment
      .filter((item: any) => selectedItems.includes(item.item))
      .reduce((total: number, item: any) => {
        const price = item.price.replace(/[\$,-]/g, '').split('-')[0];
        return total + parseInt(price);
      }, 0);
  };

  const getInsights = () => {
    const totalCost = calculateTotalCost();
    // Safely extract budget number - handle both setupPlan.setupBudget and setupPlan.budgetTimeline.setupBudget
    const setupBudget = setupPlan.setupBudget || setupPlan.budgetTimeline?.setupBudget || setupPlan.totalEstimate || '$0';
    const budgetNumber = parseInt(setupBudget.toString().replace(/[\$,]/g, '')) || 0;
    const essentialItems = setupPlan.equipment.filter((item: any) => item.priority === 'Essential').length;
    const selectedEssentials = setupPlan.equipment.filter((item: any) => 
      item.priority === 'Essential' && selectedItems.includes(item.item)
    ).length;

    return {
      budgetStatus: totalCost > budgetNumber ? 'over' : totalCost > budgetNumber * 0.9 ? 'close' : 'good',
      budgetDifference: Math.abs(totalCost - budgetNumber),
      essentialCoverage: essentialItems > 0 ? Math.round((selectedEssentials / essentialItems) * 100) : 100,
      totalCost,
      itemCount: selectedItems.length
    };
  };

  const insights = getInsights();

  return (
    <div className="space-y-6">
      {/* Plan Controls */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Plan Configuration
              </CardTitle>
              <CardDescription>
                Customize your setup plan and toggle advanced features
              </CardDescription>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <label htmlFor="insights" className="text-sm font-medium">
                  Show Insights
                </label>
                <Switch
                  id="insights"
                  checked={showInsights}
                  onCheckedChange={setShowInsights}
                />
              </div>
              <div className="flex items-center space-x-2">
                <label htmlFor="advanced" className="text-sm font-medium">
                  Advanced Mode
                </label>
                <Switch
                  id="advanced"
                  checked={advancedMode}
                  onCheckedChange={setAdvancedMode}
                />
              </div>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Insights Panel */}
      {showInsights && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Plan Insights
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">${insights.totalCost.toLocaleString()}</div>
                <div className="text-xs text-blue-600">Current Total</div>
              </div>
              <div className={`text-center p-3 rounded-lg ${
                insights.budgetStatus === 'good' ? 'bg-green-50 dark:bg-green-900/20' :
                insights.budgetStatus === 'close' ? 'bg-yellow-50 dark:bg-yellow-900/20' :
                'bg-red-50 dark:bg-red-900/20'
              }`}>
                <div className={`text-2xl font-bold ${
                  insights.budgetStatus === 'good' ? 'text-green-600' :
                  insights.budgetStatus === 'close' ? 'text-yellow-600' :
                  'text-red-600'
                }`}>
                  {insights.budgetStatus === 'over' ? '+' : ''}${insights.budgetDifference.toLocaleString()}
                </div>
                <div className={`text-xs ${
                  insights.budgetStatus === 'good' ? 'text-green-600' :
                  insights.budgetStatus === 'close' ? 'text-yellow-600' :
                  'text-red-600'
                }`}>
                  {insights.budgetStatus === 'over' ? 'Over Budget' : 'Under Budget'}
                </div>
              </div>
              <div className="text-center p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                <div className="text-2xl font-bold text-purple-600">{insights.essentialCoverage}%</div>
                <div className="text-xs text-purple-600">Essential Coverage</div>
              </div>
              <div className="text-center p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
                <div className="text-2xl font-bold text-orange-600">{insights.itemCount}</div>
                <div className="text-xs text-orange-600">Selected Items</div>
              </div>
            </div>

            {insights.budgetStatus === 'over' && (
              <div className="mt-4 p-3 bg-red-50 dark:bg-red-900/20 rounded-lg flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-red-600" />
                <span className="text-sm text-red-800 dark:text-red-200">
                  Your current selection exceeds your budget by ${insights.budgetDifference.toLocaleString()}. 
                  Consider removing some optional items.
                </span>
              </div>
            )}

            {insights.essentialCoverage < 100 && (
              <div className="mt-2 p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg flex items-center gap-2">
                <Lightbulb className="h-4 w-4 text-yellow-600" />
                <span className="text-sm text-yellow-800 dark:text-yellow-200">
                  You're missing some essential equipment. Consider adding them for a successful setup.
                </span>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Equipment Selection */}
      <Card>
        <CardHeader>
          <CardTitle>Equipment Selection</CardTitle>
          <CardDescription>
            Tank Size: {setupPlan.tankSize} (~{setupPlan.estimatedGallons} gallons)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {setupPlan.equipment.map((item: any, index: number) => {
              const isSelected = selectedItems.includes(item.item);
              const isEssential = item.priority === 'Essential';
              
              return (
                <div key={index} className={`flex items-center justify-between p-3 border rounded-lg transition-all ${
                  isSelected ? 'border-primary bg-primary/5' : 'border-muted'
                }`}>
                  <div className="flex items-center gap-3">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => toggleItem(item.item, !isSelected)}
                      className={`w-8 h-8 p-0 ${isSelected ? 'text-primary' : 'text-muted-foreground'}`}
                    >
                      {isSelected ? <Minus className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
                    </Button>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className={`font-medium ${isSelected ? 'text-primary' : ''}`}>
                          {item.item}
                        </span>
                        <Badge 
                          variant={isEssential ? 'destructive' : 'secondary'}
                          className="text-xs"
                        >
                          {item.priority}
                        </Badge>
                        {advancedMode && (
                          <Badge variant="outline" className="text-xs">
                            {item.category}
                          </Badge>
                        )}
                      </div>
                      {advancedMode && (
                        <div className="text-xs text-muted-foreground mt-1">
                          Category: {item.category}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className={`font-medium ${isSelected ? 'text-primary' : 'text-muted-foreground'}`}>
                      {item.price}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <Separator className="my-6" />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium mb-3">Compatible Livestock</h4>
              <div className="space-y-1">
                {setupPlan.compatibleLivestock.map((animal: string, index: number) => (
                  <div key={index} className="text-sm flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-green-500"></span>
                    {animal}
                  </div>
                ))}
              </div>
            </div>
            
            <div>
              <h4 className="font-medium mb-3">Setup Timeline</h4>
              <div className="space-y-2">
                {setupPlan.timeline.map((step: string, index: number) => (
                  <div key={index} className="text-sm flex items-start gap-2">
                    <span className="w-5 h-5 rounded-full bg-blue-500 text-white text-xs flex items-center justify-center mt-0.5 flex-shrink-0">
                      {index + 1}
                    </span>
                    {step}
                  </div>
                ))}
              </div>
            </div>
          </div>
          
          <div className="mt-6 p-4 bg-gradient-to-r from-blue-50 to-green-50 dark:from-blue-900/20 dark:to-green-900/20 rounded-lg">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium text-blue-800 dark:text-blue-200">Selected Items Cost</p>
                <p className="text-2xl font-bold text-blue-700 dark:text-blue-300">${insights.totalCost.toLocaleString()}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-green-800 dark:text-green-200">Monthly Maintenance</p>
                <p className="text-2xl font-bold text-green-700 dark:text-green-300">{setupPlan.monthlyMaintenance}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default EnhancedPlanDisplay;
