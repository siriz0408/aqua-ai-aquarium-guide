
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useSetupPlans } from '@/hooks/useSetupPlans';
import { Settings, Send, Calendar, CheckSquare } from 'lucide-react';

interface PlanIntegrationProps {
  onSendPlanData: (planData: string, action: 'checklist' | 'reminders') => void;
  disabled?: boolean;
}

export const PlanIntegration: React.FC<PlanIntegrationProps> = ({ onSendPlanData, disabled = false }) => {
  const { plans, isLoading } = useSetupPlans();
  const [selectedPlan, setSelectedPlan] = useState<string>('');
  const [actionType, setActionType] = useState<'checklist' | 'reminders'>('checklist');

  const handleSendPlan = () => {
    const plan = plans.find(p => p.id === selectedPlan);
    if (!plan) return;

    const planDetails = `
**Tank Plan: ${plan.plan_name}**

**Equipment List:**
${plan.equipment.map(item => `• ${item.item} - ${item.price} (${item.priority})`).join('\n')}

**Compatible Livestock:**
${plan.compatible_livestock.map(fish => `• ${fish}`).join('\n')}

**Timeline:**
${plan.timeline.map((step, index) => `${index + 1}. ${step}`).join('\n')}

**Budget:** ${plan.total_estimate}
**Monthly Maintenance:** ${plan.monthly_maintenance}

${actionType === 'checklist' 
  ? 'Please create a detailed checklist based on this plan that I can use to track my setup progress.'
  : 'Please create maintenance reminders and task schedules based on this plan that I can add to my task list.'
}`;

    onSendPlanData(planDetails, actionType);
  };

  if (isLoading) {
    return (
      <Card className="mb-4">
        <CardContent className="p-4">
          <div className="text-center text-muted-foreground">Loading plans...</div>
        </CardContent>
      </Card>
    );
  }

  if (plans.length === 0) {
    return (
      <Card className="mb-4">
        <CardContent className="p-4">
          <div className="text-center text-muted-foreground">
            No saved plans found. Create a plan in the Setup Planner first.
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="mb-4">
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <Settings className="h-5 w-5" />
          My Tank Plans
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Select Plan</label>
            <Select value={selectedPlan} onValueChange={setSelectedPlan}>
              <SelectTrigger>
                <SelectValue placeholder="Choose a saved plan" />
              </SelectTrigger>
              <SelectContent>
                {plans.map((plan) => (
                  <SelectItem key={plan.id} value={plan.id}>
                    {plan.plan_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-medium">Action Type</label>
            <Select value={actionType} onValueChange={(value: 'checklist' | 'reminders') => setActionType(value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="checklist">
                  <div className="flex items-center gap-2">
                    <CheckSquare className="h-4 w-4" />
                    Create Checklist
                  </div>
                </SelectItem>
                <SelectItem value="reminders">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    Create Reminders
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        
        <Button 
          onClick={handleSendPlan}
          disabled={!selectedPlan || disabled}
          className="w-full"
        >
          <Send className="h-4 w-4 mr-2" />
          Send Plan to AquaBot
        </Button>
      </CardContent>
    </Card>
  );
};
