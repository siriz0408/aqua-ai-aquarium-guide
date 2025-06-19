
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';

interface AestheticPreferencesStepProps {
  value: string;
  onChange: (value: string) => void;
}

const AestheticPreferencesStep: React.FC<AestheticPreferencesStepProps> = ({ value, onChange }) => {
  const aestheticStyles = [
    {
      id: 'minimalist',
      title: 'Minimalist',
      description: 'Clean, simple, modern',
      details: 'Sleek equipment, minimal rock work, focus on space',
      icon: '⚪',
      image: 'photo-1486718448742-163732cd1544',
      features: ['Clean lines', 'Hidden equipment', 'Open swimming space']
    },
    {
      id: 'natural',
      title: 'Natural Reef',
      description: 'Authentic ocean ecosystem',
      details: 'Natural rock formations, diverse coral placement',
      icon: '🌊',
      image: 'photo-1506744038136-46273834b3fb',
      features: ['Live rock aquascaping', 'Natural flow patterns', 'Ecosystem balance']
    },
    {
      id: 'high-tech',
      title: 'High-Tech',
      description: 'Advanced automation & monitoring',
      details: 'Latest technology, automated systems, data tracking',
      icon: '🤖',
      image: 'photo-1483058712412-4245e9b90334',
      features: ['Smart controllers', 'Automated dosing', 'Advanced monitoring']
    }
  ];

  return (
    <div className="space-y-4">
      <RadioGroup value={value} onValueChange={onChange}>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {aestheticStyles.map((style) => (
            <div key={style.id} className="relative">
              <RadioGroupItem value={style.id} id={style.id} className="sr-only" />
              <Label 
                htmlFor={style.id}
                className="cursor-pointer"
              >
                <Card className={`transition-all duration-200 hover:shadow-md hover:scale-105 ${
                  value === style.id ? 'ring-2 ring-primary' : ''
                }`}>
                  <CardContent className="p-6">
                    <div 
                      className="w-full h-32 bg-cover bg-center rounded-md mb-4"
                      style={{
                        backgroundImage: `url(https://images.unsplash.com/${style.image}?w=300&h=200&fit=crop)`
                      }}
                    />
                    <div className="text-center mb-3">
                      <div className="text-2xl mb-2">{style.icon}</div>
                      <h3 className="font-semibold text-lg mb-1">{style.title}</h3>
                      <p className="text-sm text-muted-foreground mb-2">{style.description}</p>
                      <p className="text-xs text-muted-foreground mb-3">{style.details}</p>
                    </div>
                    
                    <div className="space-y-1">
                      {style.features.map((feature, index) => (
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

export default AestheticPreferencesStep;
