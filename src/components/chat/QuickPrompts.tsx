
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Lightbulb, Stethoscope, ClipboardList, Fish, Droplets, AlertTriangle } from 'lucide-react';

interface QuickPromptsProps {
  onPromptSelect: (prompt: string) => void;
  disabled?: boolean;
}

const quickPrompts = [
  {
    id: 'plan',
    title: 'Help Me Plan',
    icon: ClipboardList,
    prompt: 'I need help planning my marine aquarium setup. Can you guide me through the essential equipment, tank cycling process, and stocking recommendations based on my tank size and experience level?',
    color: 'bg-blue-500 hover:bg-blue-600'
  },
  {
    id: 'diagnose',
    title: 'Diagnose Issue',
    icon: Stethoscope,
    prompt: 'I\'m experiencing issues with my marine aquarium. Can you help me diagnose the problem? Please ask me about symptoms, water parameters, recent changes, and fish behavior to identify potential causes.',
    color: 'bg-red-500 hover:bg-red-600'
  },
  {
    id: 'recommendations',
    title: 'Get Recommendations',
    icon: Lightbulb,
    prompt: 'Can you provide recommendations to improve my marine aquarium? Please suggest equipment upgrades, livestock additions, maintenance improvements, or water chemistry optimizations.',
    color: 'bg-green-500 hover:bg-green-600'
  },
  {
    id: 'water-quality',
    title: 'Water Quality Help',
    icon: Droplets,
    prompt: 'I need help with water quality management. Can you explain ideal parameters for marine aquariums and help me understand testing, water changes, and maintaining stable chemistry?',
    color: 'bg-cyan-500 hover:bg-cyan-600'
  },
  {
    id: 'fish-compatibility',
    title: 'Fish Compatibility',
    icon: Fish,
    prompt: 'I want to add new fish to my marine aquarium. Can you help me check compatibility with my existing livestock and recommend suitable tank mates based on my tank setup?',
    color: 'bg-purple-500 hover:bg-purple-600'
  },
  {
    id: 'emergency',
    title: 'Emergency Help',
    icon: AlertTriangle,
    prompt: 'I have an emergency situation with my marine aquarium! Please provide immediate guidance for urgent issues like equipment failure, sudden fish illness, or water parameter crashes.',
    color: 'bg-orange-500 hover:bg-orange-600'
  }
];

export const QuickPrompts: React.FC<QuickPromptsProps> = ({ onPromptSelect, disabled = false }) => {
  return (
    <Card className="mb-4">
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <Lightbulb className="h-5 w-5" />
          Quick Actions
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {quickPrompts.map((prompt) => {
            const IconComponent = prompt.icon;
            return (
              <Button
                key={prompt.id}
                variant="outline"
                className={`h-auto p-3 flex flex-col items-center gap-2 text-center ${prompt.color} text-white border-none`}
                onClick={() => onPromptSelect(prompt.prompt)}
                disabled={disabled}
              >
                <IconComponent className="h-5 w-5" />
                <span className="text-sm font-medium">{prompt.title}</span>
              </Button>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};
