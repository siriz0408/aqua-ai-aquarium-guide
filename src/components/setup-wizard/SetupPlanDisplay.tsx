
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface SetupPlanDisplayProps {
  setupPlan: any;
}

const SetupPlanDisplay: React.FC<SetupPlanDisplayProps> = ({ setupPlan }) => {
  return (
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
  );
};

export default SetupPlanDisplay;
