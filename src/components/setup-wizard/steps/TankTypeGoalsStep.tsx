
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';

interface TankTypeGoalsStepProps {
  value: string;
  onChange: (value: string) => void;
}

const TankTypeGoalsStep: React.FC<TankTypeGoalsStepProps> = ({ value, onChange }) => {
  const tankTypes = [
    {
      id: 'fish-only',
      title: 'Fish Only',
      description: 'Focus on beautiful marine fish',
      details: 'Easier maintenance, more fish capacity, lower cost',
      icon: '🐟',
      image: 'photo-1465146344425-f00d5f5c8f07',
      features: ['Hardy fish species', 'Simple filtration', 'Lower lighting needs']
    },
    {
      id: 'mixed-reef',
      title: 'Mixed Reef',
      description: 'Fish, soft corals, and some LPS',
      details: 'Balanced ecosystem with moderate requirements',
      icon: '🪸',
      image: 'photo-1506744038136-46273834b3fb',
      features: ['Soft & LPS corals', 'Moderate lighting', 'Stable parameters']
    },
    {
      id: 'sps-dominant',
      title: 'SPS Dominant',
      description: 'High-end coral focused system',
      details: 'Demanding but stunning small polyp stony corals',
      icon: '💎',
      image: 'photo-1472396961693-142e6e269027',
      features: ['SPS corals', 'High-end lighting', 'Precise parameters']
    }
  ];

  return (
    <div className="space-y-4">
      <RadioGroup value={value} onValueChange={onChange}>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {tankTypes.map((type) => (
            <div key={type.id} className="relative">
              <RadioGroupItem value={type.id} id={type.id} className="sr-only" />
              <Label 
                htmlFor={type.id}
                className="cursor-pointer"
              >
                <Card className={`transition-all duration-200 hover:shadow-md hover:scale-105 ${
                  value === type.id ? 'ring-2 ring-primary' : ''
                }`}>
                  <CardContent className="p-6">
                    <div 
                      className="w-full h-32 bg-cover bg-center rounded-md mb-4"
                      style={{
                        backgroundImage: `url(https://images.unsplash.com/${type.image}?w=300&h=200&fit=crop)`
                      }}
                    />
                    <div className="text-center mb-3">
                      <div className="text-2xl mb-2">{type.icon}</div>
                      <h3 className="font-semibold text-lg mb-1">{type.title}</h3>
                      <p className="text-sm text-muted-foreground mb-2">{type.description}</p>
                      <p className="text-xs text-muted-foreground mb-3">{type.details}</p>
                    </div>
                    
                    <div className="space-y-1">
                      {type.features.map((feature, index) => (
                        <div key={index} className="flex items-center text-xs text-muted-foreground">
                          <div className="w-1 h-1 bg-primary rounded-full mr-2"></div>
                          {feature}
                        </div>
                      ))}
                    </div>
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

export default TankTypeGoalsStep;
