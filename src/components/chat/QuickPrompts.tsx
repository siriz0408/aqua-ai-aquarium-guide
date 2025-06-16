
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
    color: 'from-blue-500 to-blue-600',
    hoverColor: 'hover:from-blue-600 hover:to-blue-700'
  },
  {
    id: 'diagnose',
    title: 'Diagnose Issue',
    icon: Stethoscope,
    prompt: 'I\'m experiencing issues with my marine aquarium. Can you help me diagnose the problem? Please ask me about symptoms, water parameters, recent changes, and fish behavior to identify potential causes.',
    color: 'from-red-500 to-red-600',
    hoverColor: 'hover:from-red-600 hover:to-red-700'
  },
  {
    id: 'recommendations',
    title: 'Get Recommendations',
    icon: Lightbulb,
    prompt: 'Can you provide recommendations to improve my marine aquarium? Please suggest equipment upgrades, livestock additions, maintenance improvements, or water chemistry optimizations.',
    color: 'from-green-500 to-green-600',
    hoverColor: 'hover:from-green-600 hover:to-green-700'
  },
  {
    id: 'water-quality',
    title: 'Water Quality Help',
    icon: Droplets,
    prompt: 'I need help with water quality management. Can you explain ideal parameters for marine aquariums and help me understand testing, water changes, and maintaining stable chemistry?',
    color: 'from-cyan-500 to-cyan-600',
    hoverColor: 'hover:from-cyan-600 hover:to-cyan-700'
  },
  {
    id: 'fish-compatibility',
    title: 'Fish Compatibility',
    icon: Fish,
    prompt: 'I want to add new fish to my marine aquarium. Can you help me check compatibility with my existing livestock and recommend suitable tank mates based on my tank setup?',
    color: 'from-purple-500 to-purple-600',
    hoverColor: 'hover:from-purple-600 hover:to-purple-700'
  },
  {
    id: 'emergency',
    title: 'Emergency Help',
    icon: AlertTriangle,
    prompt: 'I have an emergency situation with my marine aquarium! Please provide immediate guidance for urgent issues like equipment failure, sudden fish illness, or water parameter crashes.',
    color: 'from-orange-500 to-orange-600',
    hoverColor: 'hover:from-orange-600 hover:to-orange-700'
  }
];

export const QuickPrompts: React.FC<QuickPromptsProps> = ({ onPromptSelect, disabled = false }) => {
  return (
    <div className="mb-6">
      <div className="flex items-center gap-3 mb-4">
        <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
          <Lightbulb className="h-4 w-4 text-white" />
        </div>
        <h3 className="text-lg font-semibold text-foreground">Quick Actions</h3>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {quickPrompts.map((prompt) => {
          const IconComponent = prompt.icon;
          return (
            <Button
              key={prompt.id}
              variant="ghost"
              className={`
                h-auto p-4 flex flex-col items-center gap-3 text-center
                bg-gradient-to-br ${prompt.color} text-white border-none
                ${prompt.hoverColor} hover:text-white
                transition-all duration-200 hover:scale-105 hover:shadow-lg
                disabled:opacity-50 disabled:hover:scale-100 disabled:hover:shadow-none
                group
              `}
              onClick={() => onPromptSelect(prompt.prompt)}
              disabled={disabled}
            >
              <div className="h-8 w-8 rounded-lg bg-white/20 flex items-center justify-center group-hover:bg-white/30 transition-colors">
                <IconComponent className="h-4 w-4" />
              </div>
              <span className="text-sm font-medium leading-tight">{prompt.title}</span>
            </Button>
          );
        })}
      </div>
      
      <p className="text-xs text-muted-foreground mt-3 text-center">
        Choose a quick action above or type your own question
      </p>
    </div>
  );
};
