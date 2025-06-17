
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Heart, Plus, Thermometer, Droplets, Fish, MoreVertical, Waves, Leaf } from 'lucide-react';

interface FishCardProps {
  fish: {
    id: string;
    name: string;
    scientific_name?: string;
    category: 'Fish' | 'Coral' | 'Invertebrate' | 'Plant';
    summary: string;
    care_level: 'Beginner' | 'Intermediate' | 'Advanced';
    diet_type?: 'Herbivore' | 'Carnivore' | 'Omnivore';
    tank_size_minimum?: number;
    water_type: 'Saltwater' | 'Freshwater';
    reef_safe?: boolean;
    ph_range?: string;
    water_temperature_range?: string;
  };
  showAddToList?: boolean;
}

const FishCard: React.FC<FishCardProps> = ({ fish, showAddToList = true }) => {
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

  const getWaterTypeColor = (waterType: string) => {
    return waterType === 'Saltwater' 
      ? 'bg-blue-50 text-blue-700 border-blue-200'
      : 'bg-cyan-50 text-cyan-700 border-cyan-200';
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'Fish':
        return <Fish className="h-4 w-4" />;
      case 'Coral':
        return <span className="text-sm">🪸</span>;
      case 'Invertebrate':
        return <span className="text-sm">🦐</span>;
      case 'Plant':
        return <Leaf className="h-4 w-4" />;
      default:
        return <Fish className="h-4 w-4" />;
    }
  };

  return (
    <Card className="h-full hover:shadow-lg transition-shadow duration-200">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              {getCategoryIcon(fish.category)}
              <CardTitle className="text-lg">{fish.name}</CardTitle>
            </div>
            {fish.scientific_name && (
              <p className="text-sm text-muted-foreground italic">{fish.scientific_name}</p>
            )}
          </div>
          {showAddToList && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem>
                  <Heart className="mr-2 h-4 w-4" />
                  Add to Wishlist
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Plus className="mr-2 h-4 w-4" />
                  Add to Planning
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Fish className="mr-2 h-4 w-4" />
                  Mark as Owned
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
        
        <div className="flex flex-wrap gap-2 mt-2">
          <Badge className={getCareColor(fish.care_level)}>
            {fish.care_level}
          </Badge>
          <Badge variant="outline" className={getWaterTypeColor(fish.water_type)}>
            {fish.water_type === 'Saltwater' ? <Waves className="mr-1 h-3 w-3" /> : <Droplets className="mr-1 h-3 w-3" />}
            {fish.water_type}
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
        <p className="text-sm text-muted-foreground line-clamp-3">
          {fish.summary}
        </p>

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
      </CardContent>
    </Card>
  );
};

export default FishCard;
