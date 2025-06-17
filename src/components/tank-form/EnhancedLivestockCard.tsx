
import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Trash2, Plus, Minus } from 'lucide-react';
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

interface EnhancedLivestockCardProps {
  livestock: {
    id: string;
    name: string;
    species: string;
    careLevel: string;
    compatibility: string;
    imageUrl?: string;
    healthNotes?: string;
    quantity?: number;
    size?: string;
  };
  onUpdate: (id: string, updates: any) => void;
  onDelete: (id: string) => void;
}

export const EnhancedLivestockCard: React.FC<EnhancedLivestockCardProps> = ({
  livestock,
  onUpdate,
  onDelete
}) => {
  const [quantity, setQuantity] = useState(livestock.quantity || 1);
  const [size, setSize] = useState(livestock.size || 'Medium');

  const handleQuantityChange = (newQuantity: number) => {
    const validQuantity = Math.max(1, newQuantity);
    setQuantity(validQuantity);
    onUpdate(livestock.id, { quantity: validQuantity });
  };

  const handleSizeChange = (newSize: string) => {
    setSize(newSize);
    onUpdate(livestock.id, { size: newSize });
  };

  const getCareColor = (level: string) => {
    switch (level) {
      case 'Beginner':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'Intermediate':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'Advanced':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <Card className="mb-3 hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="flex items-center gap-4">
          {/* Image placeholder */}
          <div className="w-16 h-16 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
            {livestock.imageUrl ? (
              <img 
                src={livestock.imageUrl} 
                alt={livestock.name}
                className="w-full h-full object-cover rounded-lg"
              />
            ) : (
              <span className="text-2xl">🐠</span>
            )}
          </div>

          {/* Info section */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between mb-2">
              <div>
                <h4 className="font-medium text-sm truncate">{livestock.name}</h4>
                <p className="text-xs text-muted-foreground truncate">{livestock.species}</p>
              </div>
              <Badge className={`${getCareColor(livestock.careLevel)} text-xs`}>
                {livestock.careLevel}
              </Badge>
            </div>
            
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <span>Compatibility: {livestock.compatibility}</span>
            </div>
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

            {/* Size selector */}
            <Select value={size} onValueChange={handleSizeChange}>
              <SelectTrigger className="h-8 w-20 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Small">S</SelectItem>
                <SelectItem value="Medium">M</SelectItem>
                <SelectItem value="Large">L</SelectItem>
              </SelectContent>
            </Select>

            {/* Delete button */}
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-destructive">
                  <Trash2 className="h-3 w-3" />
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Remove {livestock.name}?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This will remove {livestock.name} from your tank. This action cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction 
                    onClick={() => onDelete(livestock.id)}
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
