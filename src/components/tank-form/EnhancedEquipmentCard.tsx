
import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Trash2, Plus, Minus, Edit, Save } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

interface EnhancedEquipmentCardProps {
  equipment: {
    id: string;
    name: string;
    type: string;
    model?: string;
    imageUrl?: string;
    maintenanceTips?: string;
    upgradeNotes?: string;
    quantity?: number;
  };
  onUpdate: (id: string, updates: any) => void;
  onDelete: (id: string) => void;
}

export const EnhancedEquipmentCard: React.FC<EnhancedEquipmentCardProps> = ({
  equipment,
  onUpdate,
  onDelete
}) => {
  const [quantity, setQuantity] = useState(equipment.quantity || 1);
  const [isEditingNotes, setIsEditingNotes] = useState(false);
  const [notes, setNotes] = useState(equipment.maintenanceTips || '');

  const handleQuantityChange = (newQuantity: number) => {
    const validQuantity = Math.max(1, newQuantity);
    setQuantity(validQuantity);
    onUpdate(equipment.id, { quantity: validQuantity });
  };

  const handleSaveNotes = () => {
    onUpdate(equipment.id, { maintenanceTips: notes });
    setIsEditingNotes(false);
  };

  return (
    <Card className="mb-3 hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="flex items-start gap-4">
          {/* Image placeholder */}
          <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
            {equipment.imageUrl ? (
              <img 
                src={equipment.imageUrl} 
                alt={equipment.name}
                className="w-full h-full object-cover rounded-lg"
              />
            ) : (
              <span className="text-2xl">⚙️</span>
            )}
          </div>

          {/* Info section */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between mb-2">
              <div>
                <h4 className="font-medium text-sm truncate">{equipment.name}</h4>
                {equipment.model && (
                  <p className="text-xs text-muted-foreground truncate">{equipment.model}</p>
                )}
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="text-xs">
                  {equipment.type}
                </Badge>
              </div>
            </div>

            {/* Notes section */}
            {isEditingNotes ? (
              <div className="space-y-2">
                <Textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Add installation notes or specifications..."
                  className="text-xs"
                  rows={2}
                />
                <div className="flex gap-2">
                  <Button size="sm" onClick={handleSaveNotes} className="h-6 text-xs">
                    <Save className="h-3 w-3 mr-1" />
                    Save
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => setIsEditingNotes(false)}
                    className="h-6 text-xs"
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            ) : (
              <div className="space-y-1">
                {equipment.maintenanceTips && (
                  <div className="p-2 bg-green-50 dark:bg-green-900/20 rounded text-xs">
                    <p className="text-green-800 dark:text-green-200">
                      💡 {equipment.maintenanceTips}
                    </p>
                  </div>
                )}
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => setIsEditingNotes(true)}
                  className="h-6 text-xs p-1"
                >
                  <Edit className="h-3 w-3 mr-1" />
                  {equipment.maintenanceTips ? 'Edit Notes' : 'Add Notes'}
                </Button>
              </div>
            )}
          </div>

          {/* Controls section */}
          <div className="flex items-center gap-2 flex-shrink-0">
            {/* Quantity controls */}
            <div className="flex items-center border rounded-lg">
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0"
                onClick={() => handleQuantityChange(quantity - 1)}
                disabled={quantity <= 1}
              >
                <Minus className="h-3 w-3" />
              </Button>
              <Input
                type="number"
                value={quantity}
                onChange={(e) => handleQuantityChange(parseInt(e.target.value) || 1)}
                className="h-8 w-12 text-center border-0 text-xs"
                min="1"
              />
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0"
                onClick={() => handleQuantityChange(quantity + 1)}
              >
                <Plus className="h-3 w-3" />
              </Button>
            </div>

            {/* Delete button */}
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-destructive">
                  <Trash2 className="h-3 w-3" />
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Remove {equipment.name}?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This will remove {equipment.name} from your tank. This action cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction 
                    onClick={() => onDelete(equipment.id)}
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  >
                    Remove
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
