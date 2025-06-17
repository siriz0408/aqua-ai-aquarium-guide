
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { EducationalFish, useEducationalFish } from '@/hooks/useEducationalFish';
import { Heart, Plus, Thermometer, Droplets, Fish, MoreVertical } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

interface FishCardProps {
  fish: EducationalFish;
  showAddToList?: boolean;
}

const FishCard: React.FC<FishCardProps> = ({ fish, showAddToList = true }) => {
  const { user } = useAuth();
  const { addToList, removeFromList, isInList, isAddingToList, isRemovingFromList } = useEducationalFish();

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

  const getDietColor = (diet?: string) => {
    switch (diet) {
      case 'Herbivore':
        return 'bg-green-50 text-green-700 border-green-200';
      case 'Carnivore':
        return 'bg-red-50 text-red-700 border-red-200';
      case 'Omnivore':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      default:
        return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  const handleAddToList = (listType: string) => {
    if (!user) return;
    addToList({ fishId: fish.id, listType });
  };

  const handleRemoveFromList = (listType: string) => {
    if (!user) return;
    removeFromList({ fishId: fish.id, listType });
  };

  return (
    <Card className="h-full hover:shadow-lg transition-shadow duration-200">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-lg mb-1">{fish.name}</CardTitle>
            {fish.scientific_name && (
              <p className="text-sm text-muted-foreground italic">{fish.scientific_name}</p>
            )}
          </div>
          {showAddToList && user && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {!isInList(fish.id, 'wishlist') ? (
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
                
                {!isInList(fish.id, 'planning') ? (
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
                
                {!isInList(fish.id, 'owned') ? (
                  <DropdownMenuItem onClick={() => handleAddToList('owned')}>
                    <Fish className="mr-2 h-4 w-4" />
                    Mark as Owned
                  </DropdownMenuItem>
                ) : (
                  <DropdownMenuItem onClick={() => handleRemoveFromList('owned')}>
                    <Fish className="mr-2 h-4 w-4" />
                    Remove from Owned
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
        
        <div className="flex flex-wrap gap-2 mt-2">
          <Badge className={getCareColor(fish.care_level)}>
            {fish.care_level}
          </Badge>
          {fish.diet_type && (
            <Badge variant="outline" className={getDietColor(fish.diet_type)}>
              {fish.diet_type}
            </Badge>
          )}
          {fish.reef_safe && (
            <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
              Reef Safe
            </Badge>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {fish.image_url && (
          <div className="aspect-video rounded-lg overflow-hidden bg-gray-100">
            <img 
              src={fish.image_url} 
              alt={fish.name}
              className="w-full h-full object-cover"
            />
          </div>
        )}

        {fish.summary && (
          <p className="text-sm text-muted-foreground line-clamp-3">
            {fish.summary}
          </p>
        )}

        <div className="space-y-2">
          {fish.tank_size_minimum && (
            <div className="flex items-center gap-2 text-sm">
              <Fish className="h-4 w-4 text-blue-500" />
              <span>Min tank: {fish.tank_size_minimum} gallons</span>
            </div>
          )}
          
          {fish.water_temperature_range && (
            <div className="flex items-center gap-2 text-sm">
              <Thermometer className="h-4 w-4 text-orange-500" />
              <span>{fish.water_temperature_range}</span>
            </div>
          )}
          
          {fish.ph_range && (
            <div className="flex items-center gap-2 text-sm">
              <Droplets className="h-4 w-4 text-blue-500" />
              <span>pH: {fish.ph_range}</span>
            </div>
          )}
        </div>

        {fish.food_details && (
          <div className="pt-2 border-t">
            <h4 className="text-xs font-medium text-muted-foreground mb-1">DIET</h4>
            <p className="text-xs text-muted-foreground line-clamp-2">
              {fish.food_details}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default FishCard;
