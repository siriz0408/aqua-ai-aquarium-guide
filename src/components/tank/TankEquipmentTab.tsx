
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Plus, Upload } from 'lucide-react';
import { EnhancedEquipmentCard } from '@/components/tank-form/EnhancedEquipmentCard';

interface Equipment {
  id: string;
  [key: string]: any;
}

interface TankEquipmentTabProps {
  equipment: Equipment[];
  tankId: string;
  onNavigate: (path: string) => void;
  onUpdateEquipment: (id: string, updates: any) => void;
  onDeleteEquipment: (id: string) => void;
}

const TankEquipmentTab: React.FC<TankEquipmentTabProps> = ({
  equipment,
  tankId,
  onNavigate,
  onUpdateEquipment,
  onDeleteEquipment,
}) => {
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="font-medium">Tank Equipment</h3>
        <Button 
          onClick={() => onNavigate(`/tank/${tankId}/equipment`)}
          variant="outline"
          size="sm"
        >
          <Plus className="mr-2 h-4 w-4" />
          Add Equipment
        </Button>
      </div>
      
      {equipment.length > 0 ? (
        <div className="space-y-3">
          {equipment.map((item) => (
            <EnhancedEquipmentCard
              key={item.id}
              equipment={item}
              onUpdate={onUpdateEquipment}
              onDelete={onDeleteEquipment}
            />
          ))}
        </div>
      ) : (
        <Card className="p-8 text-center">
          <div className="space-y-4">
            <div className="text-4xl">⚙️</div>
            <div>
              <h4 className="font-medium">No equipment added</h4>
              <p className="text-sm text-muted-foreground">Upload photos to identify your equipment</p>
            </div>
            <Button onClick={() => onNavigate(`/tank/${tankId}/equipment`)}>
              <Upload className="mr-2 h-4 w-4" />
              Add Equipment
            </Button>
          </div>
        </Card>
      )}
    </div>
  );
};

export default TankEquipmentTab;
