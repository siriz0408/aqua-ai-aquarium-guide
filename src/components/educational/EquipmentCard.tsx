
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { EducationalEquipment, useEducationalEquipment } from '@/hooks/useEducationalEquipment';
import { Heart, Plus, Settings, MoreVertical, DollarSign, Clock } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

interface EquipmentCardProps {
  equipment: EducationalEquipment;
  showAddToList?: boolean;
}

const EquipmentCard: React.FC<EquipmentCardProps> = ({ equipment, showAddToList = true }) => {
  const { user } = useAuth();
  const { addToList, removeFromList, isInList, isAddingToList, isRemovingFromList } = useEducationalEquipment();

  const getDifficultyColor = (level: string) => {
    switch (level) {
      case 'Easy':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'Moderate':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'Advanced':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const handleAddToList = (listType: string) => {
    if (!user) return;
    addToList({ equipmentId: equipment.id, listType });
  };

  const handleRemoveFromList = (listType: string) => {
    if (!user) return;
    removeFromList({ equipmentId: equipment.id, listType });
  };

  return (
    <Card className="h-full hover:shadow-lg transition-shadow duration-200">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-lg mb-1">{equipment.name}</CardTitle>
            <p className="text-sm text-muted-foreground">{equipment.category}</p>
          </div>
          {showAddToList && user && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {!isInList(equipment.id, 'wishlist') ? (
                  <DropdownMenuItem onClick={() => handleAddToList('wishlist')}>
                    <Heart className="mr-2 h-4 w-4" />
                    Add to Wishlist
                  </DropdownMenuItem>
                ) : (
                  <DropdownMenuItem onClick={() => handleRemoveFromList('wishlist')}>
                    <Heart className="mr-2 h-4 w-4 fill-current" />
                    Remove from Wishlist
                  </DropdownMenuItem>
                )}
                
                {!isInList(equipment.id, 'planning') ? (
                  <DropdownMenuItem onClick={() => handleAddToList('planning')}>
                    <Plus className="mr-2 h-4 w-4" />
                    Add to Planning
                  </DropdownMenuItem>
                ) : (
                  <DropdownMenuItem onClick={() => handleRemoveFromList('planning')}>
                    <Plus className="mr-2 h-4 w-4" />
                    Remove from Planning
                  </DropdownMenuItem>
                )}
                
                {!isInList(equipment.id, 'owned') ? (
                  <DropdownMenuItem onClick={() => handleAddToList('owned')}>
                    <Settings className="mr-2 h-4 w-4" />
                    Mark as Owned
                  </DropdownMenuItem>
                ) : (
                  <DropdownMenuItem onClick={() => handleRemoveFromList('owned')}>
                    <Settings className="mr-2 h-4 w-4" />
                    Remove from Owned
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
        
        <div className="flex flex-wrap gap-2 mt-2">
          <Badge className={getDifficultyColor(equipment.difficulty_level)}>
            {equipment.difficulty_level}
          </Badge>
          {equipment.price_range && (
            <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
              <DollarSign className="h-3 w-3 mr-1" />
              {equipment.price_range}
            </Badge>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {equipment.image_url && (
          <div className="aspect-video rounded-lg overflow-hidden bg-gray-100">
            <img 
              src={equipment.image_url} 
              alt={equipment.name}
              className="w-full h-full object-cover"
            />
          </div>
        )}

        {equipment.summary && (
          <p className="text-sm text-muted-foreground line-clamp-3">
            {equipment.summary}
          </p>
        )}

        <div className="space-y-2">
          {equipment.recommended_tank_sizes && equipment.recommended_tank_sizes.length > 0 && (
            <div className="flex items-start gap-2 text-sm">
              <Settings className="h-4 w-4 text-blue-500 mt-0.5" />
              <div>
                <span className="font-medium">Tank sizes: </span>
                <span>{equipment.recommended_tank_sizes.join(', ')}</span>
              </div>
            </div>
          )}
          
          {equipment.maintenance_frequency && (
            <div className="flex items-center gap-2 text-sm">
              <Clock className="h-4 w-4 text-orange-500" />
              <span>{equipment.maintenance_frequency}</span>
            </div>
          )}
        </div>

        {equipment.installation_notes && (
          <div className="pt-2 border-t">
            <h4 className="text-xs font-medium text-muted-foreground mb-1">INSTALLATION</h4>
            <p className="text-xs text-muted-foreground line-clamp-2">
              {equipment.installation_notes}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default EquipmentCard;
