
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Combobox } from '@/components/ui/combobox';
import { Trash2, Edit, Settings } from 'lucide-react';
import { equipmentOptions, equipmentCategories } from '@/data/equipmentOptions';

interface EquipmentManagerProps {
  equipment: any[];
  onUpdateEquipment: (equipment: any[]) => void;
  tankType: string;
}

export const EquipmentManager: React.FC<EquipmentManagerProps> = ({
  equipment,
  onUpdateEquipment,
  tankType
}) => {
  const [editingId, setEditingId] = React.useState<string | null>(null);
  const [selectedEquipment, setSelectedEquipment] = React.useState('');

  const updateEquipment = (id: string, field: string, value: string) => {
    const updated = equipment.map(item =>
      item.id === id ? { ...item, [field]: value } : item
    );
    onUpdateEquipment(updated);
  };

  const removeEquipment = (id: string) => {
    const updated = equipment.filter(item => item.id !== id);
    onUpdateEquipment(updated);
  };

  const addNewEquipment = () => {
    const newEquipment = {
      id: Date.now().toString(),
      name: 'New Equipment',
      type: 'Equipment',
      model: '',
      imageUrl: '',
      maintenanceTips: '',
      upgradeNotes: ''
    };
    onUpdateEquipment([...equipment, newEquipment]);
    setEditingId(newEquipment.id);
  };

  const addSelectedEquipment = () => {
    if (!selectedEquipment) return;
    
    const equipmentData = equipmentOptions.find(opt => opt.value === selectedEquipment);
    if (!equipmentData) return;

    const newEquipment = {
      id: Date.now().toString(),
      name: equipmentData.label,
      type: equipmentData.category,
      model: '',
      imageUrl: '',
      maintenanceTips: equipmentData.description || '',
      upgradeNotes: ''
    };
    
    onUpdateEquipment([...equipment, newEquipment]);
    setSelectedEquipment('');
  };

  const equipmentComboOptions = equipmentOptions.map(opt => ({
    value: opt.value,
    label: `${opt.label} (${opt.category})`
  }));

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-medium">Equipment</h3>
          <p className="text-sm text-muted-foreground">
            Manage your tank's equipment and get maintenance recommendations
          </p>
        </div>
      </div>

      {/* Quick Add Equipment */}
      <Card className="bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
        <CardContent className="p-4">
          <div className="space-y-3">
            <Label className="text-sm font-medium">Quick Add Equipment</Label>
            <div className="flex gap-2">
              <div className="flex-1">
                <Combobox
                  options={equipmentComboOptions}
                  value={selectedEquipment}
                  onValueChange={setSelectedEquipment}
                  placeholder="Search equipment..."
                  searchPlaceholder="Type to search equipment..."
                  emptyText="No equipment found."
                />
              </div>
              <Button 
                onClick={addSelectedEquipment} 
                disabled={!selectedEquipment}
                size="sm"
              >
                Add
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              Select from common equipment or add custom equipment below
            </p>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button onClick={addNewEquipment} variant="outline" size="sm">
          Add Custom Equipment
        </Button>
      </div>

      {equipment.length === 0 ? (
        <Card className="p-8 text-center">
          <div className="space-y-4">
            <div className="text-4xl">⚙️</div>
            <div>
              <h4 className="font-medium">No equipment added yet</h4>
              <p className="text-sm text-muted-foreground">
                Add equipment to track your setup and get maintenance reminders
              </p>
            </div>
          </div>
        </Card>
      ) : (
        <div className="space-y-3">
          {equipment.map((item) => (
            <Card key={item.id}>
              <CardContent className="p-4">
                {editingId === item.id ? (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label>Equipment Name</Label>
                        <Input
                          value={item.name}
                          onChange={(e) => updateEquipment(item.id, 'name', e.target.value)}
                          placeholder="Equipment name"
                        />
                      </div>
                      <div>
                        <Label>Category</Label>
                        <Select
                          value={item.type}
                          onValueChange={(value) => updateEquipment(item.id, 'type', value)}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {equipmentCategories.map(category => (
                              <SelectItem key={category} value={category}>
                                {category}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    
                    <div>
                      <Label>Model/Details</Label>
                      <Input
                        value={item.model || ''}
                        onChange={(e) => updateEquipment(item.id, 'model', e.target.value)}
                        placeholder="Model number or additional details"
                      />
                    </div>

                    <div>
                      <Label>Maintenance Tips</Label>
                      <Textarea
                        value={item.maintenanceTips || ''}
                        onChange={(e) => updateEquipment(item.id, 'maintenanceTips', e.target.value)}
                        placeholder="Maintenance schedule and tips..."
                        rows={3}
                      />
                    </div>

                    <div className="flex gap-2">
                      <Button onClick={() => setEditingId(null)} size="sm">
                        Save
                      </Button>
                      <Button 
                        onClick={() => removeEquipment(item.id)} 
                        variant="destructive" 
                        size="sm"
                      >
                        Delete
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h4 className="font-medium">{item.name}</h4>
                        <Badge variant="outline">{item.type}</Badge>
                        {item.model && (
                          <Badge variant="secondary" className="text-xs">
                            {item.model}
                          </Badge>
                        )}
                      </div>
                      
                      {item.maintenanceTips && (
                        <div className="mt-2 p-2 bg-green-50 dark:bg-green-900/20 rounded text-sm">
                          <p className="text-green-800 dark:text-green-200">
                            💡 {item.maintenanceTips}
                          </p>
                        </div>
                      )}
                    </div>
                    
                    <div className="flex gap-2">
                      <Button
                        onClick={() => setEditingId(item.id)}
                        variant="outline"
                        size="sm"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        onClick={() => removeEquipment(item.id)}
                        variant="outline"
                        size="sm"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};
