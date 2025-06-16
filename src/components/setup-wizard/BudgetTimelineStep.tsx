
import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { ArrowLeft, ArrowRight } from 'lucide-react';

interface BudgetTimeline {
  totalBudget: string;
  setupBudget: string;
  timeline: string;
  priority: string;
  monthlyBudget: string;
}

interface BudgetTimelineStepProps {
  budget: BudgetTimeline;
  onBudgetChange: (key: keyof BudgetTimeline, value: string) => void;
  onNext: () => void;
  onPrev: () => void;
  isValid: boolean;
}

const BudgetTimelineStep: React.FC<BudgetTimelineStepProps> = ({
  budget,
  onBudgetChange,
  onNext,
  onPrev,
  isValid
}) => {
  const setupPercentage = budget.totalBudget && budget.setupBudget ? 
    Math.round((parseInt(budget.setupBudget) / parseInt(budget.totalBudget)) * 100) : 0;

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium mb-4">Budget & Timeline Planning</h3>
        
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div>
            <Label htmlFor="totalBudget">Total Budget (USD) *</Label>
            <Input
              id="totalBudget"
              type="number"
              placeholder="3000"
              value={budget.totalBudget}
              onChange={(e) => onBudgetChange('totalBudget', e.target.value)}
            />
            <p className="text-xs text-muted-foreground mt-1">
              Including equipment, livestock, and maintenance
            </p>
          </div>
          
          <div>
            <Label htmlFor="setupBudget">Initial Setup Budget *</Label>
            <Input
              id="setupBudget"
              type="number"
              placeholder="2000"
              value={budget.setupBudget}
              onChange={(e) => onBudgetChange('setupBudget', e.target.value)}
            />
            <p className="text-xs text-muted-foreground mt-1">
              Equipment and initial livestock only
            </p>
          </div>
        </div>

        {setupPercentage > 0 && (
          <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg mb-6">
            <p className="text-sm text-green-700 dark:text-green-300">
              Setup Budget: <span className="font-semibold">{setupPercentage}%</span> of total budget
              {setupPercentage > 80 && " ⚠️ Consider allocating more for ongoing costs"}
            </p>
          </div>
        )}

        <div className="grid grid-cols-2 gap-4 mb-6">
          <div>
            <Label htmlFor="timeline">Setup Timeline *</Label>
            <Select value={budget.timeline} onValueChange={(value) => onBudgetChange('timeline', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select timeline" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="immediate">ASAP (1-2 weeks)</SelectItem>
                <SelectItem value="month">Within a month</SelectItem>
                <SelectItem value="quarter">Next 3 months</SelectItem>
                <SelectItem value="flexible">Flexible timeline</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div>
            <Label htmlFor="priority">Budget Priority *</Label>
            <Select value={budget.priority} onValueChange={(value) => onBudgetChange('priority', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select priority" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="equipment">Best Equipment</SelectItem>
                <SelectItem value="livestock">Premium Livestock</SelectItem>
                <SelectItem value="balanced">Balanced Approach</SelectItem>
                <SelectItem value="budget">Budget Conscious</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div>
          <Label htmlFor="monthlyBudget">Monthly Maintenance Budget</Label>
          <Input
            id="monthlyBudget"
            type="number"
            placeholder="100"
            value={budget.monthlyBudget}
            onChange={(e) => onBudgetChange('monthlyBudget', e.target.value)}
          />
          <p className="text-xs text-muted-foreground mt-1">
            Food, salt, test kits, supplements, replacements
          </p>
        </div>
      </div>

      <div className="flex justify-between">
        <Button variant="outline" onClick={onPrev}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Previous
        </Button>
        <Button 
          onClick={onNext} 
          disabled={!isValid}
          className="ocean-gradient text-white"
        >
          Generate Plan
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};

export default BudgetTimelineStep;
