
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';

interface BudgetRangeStepProps {
  value: string;
  onChange: (value: string) => void;
}

const BudgetRangeStep: React.FC<BudgetRangeStepProps> = ({ value, onChange }) => {
  const budgetRanges = [
    {
      id: 'budget-500-1000',
      title: '$500 - $1,000',
      description: 'Starter setup',
      details: 'Basic equipment, hardy fish and soft corals',
      icon: '💰',
      color: 'bg-green-100 dark:bg-green-900/20'
    },
    {
      id: 'budget-1000-2500',
      title: '$1,000 - $2,500',
      description: 'Intermediate setup',
      details: 'Quality equipment, mixed reef potential',
      icon: '💎',
      color: 'bg-blue-100 dark:bg-blue-900/20'
    },
    {
      id: 'budget-2500-5000',
      title: '$2,500 - $5,000',
      description: 'Advanced setup',
      details: 'Premium equipment, SPS ready system',
      icon: '⭐',
      color: 'bg-purple-100 dark:bg-purple-900/20'
    },
    {
      id: 'budget-5000-plus',
      title: '$5,000+',
      description: 'Premium setup',
      details: 'Top-tier equipment, show-quality system',
      icon: '🏆',
      color: 'bg-gold-100 dark:bg-yellow-900/20'
    }
  ];

  return (
    <div className="space-y-4">
      <RadioGroup value={value} onValueChange={onChange}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {budgetRanges.map((range) => (
            <div key={range.id} className="relative">
              <RadioGroupItem value={range.id} id={range.id} className="sr-only" />
              <Label 
                htmlFor={range.id}
                className="cursor-pointer"
              >
                <Card className={`transition-all duration-200 hover:shadow-md hover:scale-105 ${
                  value === range.id ? 'ring-2 ring-primary' : ''
                }`}>
                  <CardContent className="p-6">
                    <div className={`w-full h-20 ${range.color} rounded-md mb-4 flex items-center justify-center`}>
                      <div className="text-3xl">{range.icon}</div>
                    </div>
                    <h3 className="font-semibold text-lg mb-2">{range.title}</h3>
                    <p className="text-sm text-muted-foreground mb-2">{range.description}</p>
                    <p className="text-xs text-muted-foreground">{range.details}</p>
                  </CardContent>
                </Card>
              </Label>
            </div>
          ))}
        </div>
      </RadioGroup>
    </div>
  );
};

export default BudgetRangeStep;
