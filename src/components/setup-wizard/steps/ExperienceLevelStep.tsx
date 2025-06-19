
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';

interface ExperienceLevelStepProps {
  value: string;
  onChange: (value: string) => void;
}

const ExperienceLevelStep: React.FC<ExperienceLevelStepProps> = ({ value, onChange }) => {
  const experienceLevels = [
    {
      id: 'beginner',
      title: 'Beginner',
      description: 'New to saltwater aquariums',
      details: 'Focus on hardy species and simple equipment',
      icon: '🌱',
      image: 'photo-1486312338219-ce68d2c6f44d'
    },
    {
      id: 'intermediate',
      title: 'Intermediate',
      description: '1-3 years of experience',
      details: 'Ready for moderate difficulty corals and equipment',
      icon: '🐠',
      image: 'photo-1483058712412-4245e9b90334'
    },
    {
      id: 'advanced',
      title: 'Advanced',
      description: '3+ years of experience',
      details: 'Can handle demanding species and complex systems',
      icon: '🏆',
      image: 'photo-1461749280684-dccba630e2f6'
    }
  ];

  return (
    <div className="space-y-4">
      <RadioGroup value={value} onValueChange={onChange}>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {experienceLevels.map((level) => (
            <div key={level.id} className="relative">
              <RadioGroupItem value={level.id} id={level.id} className="sr-only" />
              <Label 
                htmlFor={level.id}
                className="cursor-pointer"
              >
                <Card className={`transition-all duration-200 hover:shadow-md hover:scale-105 ${
                  value === level.id ? 'ring-2 ring-primary' : ''
                }`}>
                  <CardContent className="p-6 text-center">
                    <div 
                      className="w-full h-24 bg-cover bg-center rounded-md mb-4"
                      style={{
                        backgroundImage: `url(https://images.unsplash.com/${level.image}?w=300&h=150&fit=crop)`
                      }}
                    />
                    <div className="text-3xl mb-2">{level.icon}</div>
                    <h3 className="font-semibold text-lg mb-2">{level.title}</h3>
                    <p className="text-sm text-muted-foreground mb-2">{level.description}</p>
                    <p className="text-xs text-muted-foreground">{level.details}</p>
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

export default ExperienceLevelStep;
