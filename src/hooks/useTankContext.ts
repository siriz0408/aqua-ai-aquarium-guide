
import { useState, useEffect } from 'react';
import { useAquarium } from '@/contexts/AquariumContext';
import { useTasks } from '@/hooks/useTasks';

export interface TankContextData {
  tankId: string;
  name: string;
  size: string;
  type: string;
  age: string;
  latestParameters?: {
    ph?: number;
    salinity?: number;
    temperature?: number;
    ammonia?: number;
    nitrite?: number;
    nitrate?: number;
    kh?: number;
    calcium?: number;
    magnesium?: number;
    testDate?: string;
  };
  livestock: Array<{
    name: string;
    species: string;
    careLevel: string;
  }>;
  recentTasks: Array<{
    title: string;
    status: string;
    dueDate?: string;
  }>;
  lastWaterChange?: string;
}

export const useTankContext = () => {
  const { tanks, isLoading } = useAquarium();
  const { tasks } = useTasks();
  const [selectedTankId, setSelectedTankId] = useState<string | null>(null);
  const [showTankContext, setShowTankContext] = useState(false);

  // Auto-select first tank if none selected
  useEffect(() => {
    if (!selectedTankId && tanks.length > 0) {
      setSelectedTankId(tanks[0].id);
    }
  }, [tanks, selectedTankId]);

  const generateTankContext = (tankId: string): TankContextData | null => {
    const tank = tanks.find(t => t.id === tankId);
    if (!tank) return null;

    // Calculate tank age
    const ageInMonths = Math.floor(
      (new Date().getTime() - new Date(tank.createdAt).getTime()) / (1000 * 60 * 60 * 24 * 30)
    );
    const ageText = ageInMonths < 1 ? 'New tank' : 
                   ageInMonths === 1 ? '1 month old' : 
                   `${ageInMonths} months old`;

    // Get latest water parameters
    const latestParameters = tank.parameters.length > 0 ? {
      ...tank.parameters[0],
      testDate: tank.parameters[0].date
    } : undefined;

    // Get recent maintenance tasks related to this tank
    const recentTasks = tasks
      .filter(task => task.title.toLowerCase().includes('water change') || 
                     task.title.toLowerCase().includes('test') ||
                     task.title.toLowerCase().includes('maintenance'))
      .slice(0, 3)
      .map(task => ({
        title: task.title,
        status: task.status,
        dueDate: task.due_date
      }));

    // Find last water change task
    const lastWaterChangeTask = tasks
      .filter(task => task.title.toLowerCase().includes('water change') && 
                     task.status === 'completed')
      .sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime())[0];

    const lastWaterChange = lastWaterChangeTask ? 
      `${Math.floor((new Date().getTime() - new Date(lastWaterChangeTask.updated_at).getTime()) / (1000 * 60 * 60 * 24))} days ago` : 
      undefined;

    return {
      tankId: tank.id,
      name: tank.name,
      size: tank.size,
      type: tank.type,
      age: ageText,
      latestParameters,
      livestock: tank.livestock.map(l => ({
        name: l.name,
        species: l.species,
        careLevel: l.careLevel
      })),
      recentTasks,
      lastWaterChange
    };
  };

  const formatTankContextForAI = (contextData: TankContextData): string => {
    let context = `User has a ${contextData.size} ${contextData.type.toLowerCase()} tank called "${contextData.name}" (${contextData.age})`;

    if (contextData.latestParameters) {
      const params = contextData.latestParameters;
      const paramStrings = [];
      if (params.ph) paramStrings.push(`pH ${params.ph}`);
      if (params.salinity) paramStrings.push(`Salinity ${params.salinity}`);
      if (params.nitrate) paramStrings.push(`Nitrate ${params.nitrate}ppm`);
      if (params.temperature) paramStrings.push(`Temp ${params.temperature}°F`);
      
      if (paramStrings.length > 0) {
        context += ` with:\n- Latest parameters (${new Date(params.testDate!).toLocaleDateString()}): ${paramStrings.join(', ')}`;
      }
    }

    if (contextData.livestock.length > 0) {
      const livestockSummary = contextData.livestock
        .map(l => `${l.name} (${l.species})`)
        .join(', ');
      context += `\n- Livestock: ${livestockSummary}`;
    }

    if (contextData.lastWaterChange) {
      context += `\n- Last water change: ${contextData.lastWaterChange}`;
    }

    if (contextData.recentTasks.length > 0) {
      const taskSummary = contextData.recentTasks
        .map(t => `${t.title} (${t.status})`)
        .join(', ');
      context += `\n- Recent maintenance: ${taskSummary}`;
    }

    return context;
  };

  const selectedTankContext = selectedTankId ? generateTankContext(selectedTankId) : null;
  const contextString = selectedTankContext ? formatTankContextForAI(selectedTankContext) : '';

  return {
    tanks: tanks.map(tank => ({
      id: tank.id,
      name: tank.name,
      size: tank.size,
      type: tank.type
    })),
    selectedTankId,
    setSelectedTankId,
    showTankContext,
    setShowTankContext,
    selectedTankContext,
    contextString,
    isLoading
  };
};
