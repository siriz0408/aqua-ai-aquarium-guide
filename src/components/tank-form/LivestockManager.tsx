
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Trash2, Edit, Fish, AlertTriangle } from 'lucide-react';

interface LivestockManagerProps {
  livestock: any[];
  onUpdateLivestock: (livestock: any[]) => void;
  tankType: string;
  gallons: number;
}

export const LivestockManager: React.FC<LivestockManagerProps> = ({
  livestock,
  onUpdateLivestock,
  tankType,
  gallons
}) => {
  const [editingId, setEditingId] = React.useState<string | null>(null);

  const livestockCategories = [
    'Fish',
    'Coral',
    'Invertebrate',
    'Cleanup Crew',
    'Anemone',
    'Other'
  ];

  const careLevels = ['Beginner', 'Intermediate', 'Advanced', 'Expert'];

  const updateLivestock = (id: string, field: string, value: string) => {
    const updated = livestock.map(item =>
      item.id === id ? { ...item, [field]: value } : item
    );
    onUpdateLivestock(updated);
  };

  const removeLivestock = (id: string) => {
    const updated = livestock.filter(item => item.id !== id);
    onUpdateLivestock(updated);
  };

  const addNewLivestock = () => {
    const newLivestock = {
      id: Date.now().toString(),
      name: 'New Livestock',
      species: '',
      careLevel: 'Beginner',
      compatibility: '',
      imageUrl: '',
      healthNotes: ''
    };
    onUpdateLivestock([...livestock, newLivestock]);
    setEditingId(newLivestock.id);
  };

  const getStockingWarnings = () => {
    const warnings = [];
    const fishCount = livestock.filter(item => 
      item.species && (item.species.toLowerCase().includes('fish') || !item.species.includes('coral'))
    ).length;

    if (gallons > 0) {
      const fishPerGallon = fishCount / gallons;
      if (fishPerGallon > 0.1) {
        warnings.push('High fish density - monitor water quality closely');
      }
      
      if (gallons < 30 && fishCount > 3) {
        warnings.push('Small tank with many fish - consider reducing bioload');
      }
    }

    const advancedSpecies = livestock.filter(item => 
      item.careLevel === 'Advanced' || item.careLevel === 'Expert'
    );
    
    if (advancedSpecies.length > 0) {
      warnings.push(`${advancedSpecies.length} advanced/expert species require special care`);
    }

    return warnings;
  };

  const warnings = getStockingWarnings();

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-medium">Livestock</h3>
          <p className="text-sm text-muted-foreground">
            Manage your tank's inhabitants and monitor compatibility
          </p>
        </div>
        <Button onClick={addNewLivestock} size="sm">
          Add Livestock
        </Button>
      </div>

      {warnings.length > 0 && (
        <Card className="border-orange-200 bg-orange-50 dark:border-orange-800 dark:bg-orange-900/20">
          <CardContent className="p-4">
            <div className="flex items-start gap-2">
              <AlertTriangle className="h-4 w-4 text-orange-600 mt-0.5" />
              <div>
                <h4 className="font-medium text-orange-800 dark:text-orange-200 mb-1">
                  Stocking Considerations
                </h4>
                <ul className="text-sm text-orange-700 dark:text-orange-300 space-y-1">
                  {warnings.map((warning, index) => (
                    <li key={index}>• {warning}</li>
                  ))}
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {livestock.length === 0 ? (
        <Card className="p-8 text-center">
          <div className="space-y-4">
            <div className="text-4xl">🐠</div>
            <div>
              <h4 className="font-medium">No livestock added yet</h4>
              <p className="text-sm text-muted-foreground">
                Add fish, corals, and invertebrates to track your tank's inhabitants
              </p>
            </div>
          </div>
        </Card>
      ) : (
        <div className="space-y-3">
          {livestock.map((item) => (
            <Card key={item.id}>
              <CardContent className="p-4">
                {editingId === item.id ? (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label>Name</Label>
                        <Input
                          value={item.name}
                          onChange={(e) => updateLivestock(item.id, 'name', e.target.value)}
                          placeholder="Common name"
                        />
                      </div>
                      <div>
                        <Label>Species/Scientific Name</Label>
                        <Input
                          value={item.species || ''}
                          onChange={(e) => updateLivestock(item.id, 'species', e.target.value)}
                          placeholder="Scientific name"
                        />
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label>Care Level</Label>
                        <Select
                          value={item.careLevel}
                          onValueChange={(value) => updateLivestock(item.id, 'careLevel', value)}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {careLevels.map(level => (
                              <SelectItem key={level} value={level}>
                                {level}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label>Compatibility Notes</Label>
                        <Input
                          value={item.compatibility || ''}
                          onChange={(e) => updateLivestock(item.id, 'compatibility', e.target.value)}
                          placeholder="Peaceful, aggressive, etc."
                        />
                      </div>
                    </div>

                    <div>
                      <Label>Health Notes</Label>
                      <Textarea
                        value={item.healthNotes || ''}
                        onChange={(e) => updateLivestock(item.id, 'healthNotes', e.target.value)}
                        placeholder="Health observations, feeding notes, etc."
                        rows={3}
                      />
                    </div>

                    <div className="flex gap-2">
                      <Button onClick={() => setEditingId(null)} size="sm">
                        Save
                      </Button>
                      <Button 
                        onClick={() => removeLivestock(item.id)} 
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
                        <Badge variant="outline">{item.careLevel}</Badge>
                        {item.compatibility && (
                          <Badge variant="secondary" className="text-xs">
                            {item.compatibility}
                          </Badge>
                        )}
                      </div>
                      
                      {item.species && (
                        <p className="text-sm text-muted-foreground italic mb-1">
                          {item.species}
                        </p>
                      )}
                      
                      {item.healthNotes && (
                        <div className="mt-2 p-2 bg-blue-50 dark:bg-blue-900/20 rounded text-sm">
                          <p className="text-blue-800 dark:text-blue-200">
                            📝 {item.healthNotes}
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
                        onClick={() => removeLivestock(item.id)}
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
