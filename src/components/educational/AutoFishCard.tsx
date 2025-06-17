
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Heart, Plus, Thermometer, Droplets, Fish, MoreVertical, Waves, Database, ExternalLink } from 'lucide-react';
import { AutoPopulatedSpecies } from '@/services/AutoSpeciesService';

interface AutoFishCardProps {
  fish: AutoPopulatedSpecies;
  showAddToList?: boolean;
}

const AutoFishCard: React.FC<AutoFishCardProps> = ({ fish, showAddToList = true }) => {
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

  const getDietColor = (diet: string) => {
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

  return (
    <Card className="h-full hover:shadow-lg transition-shadow duration-200">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <Fish className="h-4 w-4" />
              <CardTitle className="text-lg truncate">{fish.name}</CardTitle>
            </div>
            {fish.scientific_name && (
              <p className="text-sm text-muted-foreground italic mb-2 truncate">
                {fish.scientific_name}
              </p>
            )}
            {fish.family && (
              <p className="text-xs text-muted-foreground mb-2">
                Family: {fish.family}
              </p>
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
                <DropdownMenuItem
                  onClick={() => window.open(`https://www.gbif.org/species/${fish.gbif_species_key}`, '_blank')}
                >
                  <ExternalLink className="mr-2 h-4 w-4" />
                  View on GBIF
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
        
        <div className="flex flex-wrap gap-2 mt-2">
          <Badge className={getCareColor(fish.care_level)}>
            {fish.care_level}
          </Badge>
          <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
            <Waves className="mr-1 h-3 w-3" />
            {fish.water_type}
          </Badge>
          <Badge variant="outline" className={getDietColor(fish.diet_type)}>
            {fish.diet_type}
          </Badge>
          {fish.reef_safe && (
            <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
              Reef Safe
            </Badge>
          )}
          <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">
            <Database className="mr-1 h-3 w-3" />
            Auto-Populated
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Image Preview */}
        {fish.image_url && (
          <div className="aspect-video bg-gray-100 rounded-md overflow-hidden">
            <img
              src={fish.image_url}
              alt={fish.name}
              className="w-full h-full object-cover"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.style.display = 'none';
              }}
            />
          </div>
        )}

        <p className="text-sm text-muted-foreground line-clamp-3">
          {fish.summary}
        </p>

        {/* Common Names */}
        {fish.common_names.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-xs font-medium text-muted-foreground">COMMON NAMES</h4>
            <div className="flex flex-wrap gap-1">
              {fish.common_names.slice(0, 3).map((nameObj: any, index: number) => (
                <Badge key={index} variant="outline" className="text-xs">
                  {nameObj.name}
                </Badge>
              ))}
              {fish.common_names.length > 3 && (
                <Badge variant="outline" className="text-xs">
                  +{fish.common_names.length - 3} more
                </Badge>
              )}
            </div>
          </div>
        )}

        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm">
            <Fish className="h-4 w-4 text-blue-500" />
            <span>Min tank: {fish.tank_size_minimum} gallons</span>
          </div>
          
          <div className="flex items-center gap-2 text-sm">
            <Thermometer className="h-4 w-4 text-orange-500" />
            <span>{fish.water_temperature_range}</span>
          </div>
          
          <div className="flex items-center gap-2 text-sm">
            <Droplets className="h-4 w-4 text-blue-500" />
            <span>pH: {fish.ph_range}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default AutoFishCard;
