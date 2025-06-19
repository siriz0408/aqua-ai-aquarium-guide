
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Plus, Upload } from 'lucide-react';
import { EnhancedLivestockCard } from '@/components/tank-form/EnhancedLivestockCard';

interface Livestock {
  id: string;
  name: string;
  species: string;
  careLevel: string;
  compatibility: string;
  imageUrl?: string;
  healthNotes?: string;
  quantity?: number;
  size?: string;
  [key: string]: any;
}

interface TankLivestockTabProps {
  livestock: Livestock[];
  tankId: string;
  onNavigate: (path: string) => void;
  onUpdateLivestock: (id: string, updates: any) => void;
  onDeleteLivestock: (id: string) => void;
}

const TankLivestockTab: React.FC<TankLivestockTabProps> = ({
  livestock,
  tankId,
  onNavigate,
  onUpdateLivestock,
  onDeleteLivestock,
}) => {
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="font-medium">Tank Livestock</h3>
        <Button 
          onClick={() => onNavigate(`/tank/${tankId}/livestock`)}
          variant="outline"
          size="sm"
          className="gap-2 min-h-[48px]"
        >
          <Plus className="h-4 w-4" />
          Add Livestock
        </Button>
      </div>

      {livestock.length > 0 ? (
        <div className="space-y-3">
          {livestock.map((animal) => (
            <EnhancedLivestockCard
              key={animal.id}
              livestock={animal}
              onUpdate={onUpdateLivestock}
              onDelete={onDeleteLivestock}
            />
          ))}
        </div>
      ) : (
        <Card className="p-8 text-center">
          <div className="space-y-4">
            <div className="text-4xl">🐠</div>
            <div>
              <h4 className="font-medium">No livestock added</h4>
              <p className="text-sm text-muted-foreground">Upload photos to identify your fish and coral</p>
            </div>
            <Button 
              onClick={() => onNavigate(`/tank/${tankId}/livestock`)}
              className="gap-2 min-h-[48px]"
            >
              <Upload className="h-4 w-4" />
              Add Livestock
            </Button>
          </div>
        </Card>
      )}
    </div>
  );
};

export default TankLivestockTab;
