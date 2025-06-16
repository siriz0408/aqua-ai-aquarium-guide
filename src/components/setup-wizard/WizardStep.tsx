
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle } from 'lucide-react';

interface WizardStepProps {
  title: string;
  description: string;
  stepNumber: number;
  isActive: boolean;
  isCompleted: boolean;
  children: React.ReactNode;
}

const WizardStep: React.FC<WizardStepProps> = ({
  title,
  description,
  stepNumber,
  isActive,
  isCompleted,
  children
}) => {
  return (
    <Card className={`transition-all duration-200 ${
      isActive ? 'ring-2 ring-primary shadow-lg' : 'opacity-70'
    }`}>
      <CardHeader className="pb-4">
        <div className="flex items-center gap-3">
          <div className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-medium ${
            isCompleted 
              ? 'bg-green-500 text-white' 
              : isActive 
                ? 'bg-primary text-primary-foreground' 
                : 'bg-muted text-muted-foreground'
          }`}>
            {isCompleted ? <CheckCircle className="h-4 w-4" /> : stepNumber}
          </div>
          <div className="flex-1">
            <CardTitle className="text-lg flex items-center gap-2">
              {title}
              {isCompleted && <Badge variant="secondary" className="text-xs">Complete</Badge>}
              {isActive && <Badge variant="default" className="text-xs">Current</Badge>}
            </CardTitle>
            <CardDescription className="text-sm">{description}</CardDescription>
          </div>
        </div>
      </CardHeader>
      {isActive && (
        <CardContent>
          {children}
        </CardContent>
      )}
    </Card>
  );
};

export default WizardStep;
