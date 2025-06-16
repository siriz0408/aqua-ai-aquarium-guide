
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Lightbulb, Plus, Star, AlertTriangle } from 'lucide-react';

interface TankRecommendationsProps {
  tankType: 'FOWLR' | 'Reef' | 'Mixed';
  gallons: number;
  onAddRecommendation: (product: any, category: 'equipment' | 'livestock') => void;
}

export const TankRecommendations: React.FC<TankRecommendationsProps> = ({
  tankType,
  gallons,
  onAddRecommendation
}) => {
  const [showEquipment, setShowEquipment] = useState(true);
  const [showLivestock, setShowLivestock] = useState(true);

  const getEquipmentRecommendations = () => {
    const baseRecommendations = [
      {
        name: 'Protein Skimmer',
        category: 'Filtration',
        type: 'equipment',
        priority: 'essential',
        reason: 'Removes organic waste before it breaks down',
        sizeGuidance: gallons < 50 ? 'Nano skimmer' : gallons < 100 ? 'Medium skimmer' : 'Large skimmer'
      },
      {
        name: 'Powerhead/Circulation Pump',
        category: 'Circulation',
        type: 'equipment',
        priority: 'essential',
        reason: 'Provides water movement and prevents dead spots',
        sizeGuidance: `${Math.round(gallons * 10)}+ GPH recommended`
      },
      {
        name: 'Heater',
        category: 'Heating',
        type: 'equipment',
        priority: 'essential',
        reason: 'Maintains stable temperature',
        sizeGuidance: `${Math.round(gallons * 3)}-${Math.round(gallons * 5)}W recommended`
      }
    ];

    if (tankType === 'Reef' || tankType === 'Mixed') {
      baseRecommendations.push(
        {
          name: 'LED Reef Light',
          category: 'Lighting',
          type: 'equipment',
          priority: 'essential',
          reason: 'Provides proper spectrum for coral photosynthesis',
          sizeGuidance: 'Full spectrum LED with blue/white channels'
        },
        {
          name: 'Calcium Reactor',
          category: 'Supplementation',
          type: 'equipment',
          priority: gallons > 30 ? 'recommended' : 'optional',
          reason: 'Maintains calcium and alkalinity for coral growth',
          sizeGuidance: gallons > 75 ? 'Medium to large reactor' : 'Small reactor'
        }
      );
    }

    if (gallons > 50) {
      baseRecommendations.push({
        name: 'Automatic Top Off (ATO)',
        category: 'Automation',
        type: 'equipment',
        priority: 'recommended',
        reason: 'Maintains stable salinity by replacing evaporated water',
        sizeGuidance: 'Optical sensor with reliable pump'
      });
    }

    return baseRecommendations;
  };

  const getLivestockRecommendations = () => {
    const baseRecommendations = [];

    if (tankType === 'FOWLR' || tankType === 'Mixed') {
      baseRecommendations.push(
        {
          name: 'Ocellaris Clownfish',
          category: 'Fish',
          type: 'livestock',
          species: 'Amphiprion ocellaris',
          careLevel: 'Beginner',
          priority: 'recommended',
          reason: 'Hardy, peaceful, and reef-safe',
          compatibility: 'Excellent starter fish'
        },
        {
          name: 'Royal Gramma',
          category: 'Fish',
          type: 'livestock',
          species: 'Gramma loreto',
          careLevel: 'Beginner',
          priority: 'recommended',
          reason: 'Colorful, peaceful, and easy to care for',
          compatibility: 'Good with most fish'
        }
      );

      if (gallons > 75) {
        baseRecommendations.push({
          name: 'Yellow Tang',
          category: 'Fish',
          type: 'livestock',
          species: 'Zebrasoma flavescens',
          careLevel: 'Intermediate',
          priority: 'optional',
          reason: 'Active algae eater, adds movement',
          compatibility: 'Needs swimming space'
        });
      }
    }

    if (tankType === 'Reef' || tankType === 'Mixed') {
      baseRecommendations.push(
        {
          name: 'Green Star Polyp',
          category: 'Coral',
          type: 'livestock',
          species: 'Pachyclavularia violacea',
          careLevel: 'Beginner',
          priority: 'recommended',
          reason: 'Fast-growing, hardy coral perfect for beginners',
          compatibility: 'Can be aggressive, give space'
        },
        {
          name: 'Zoanthids',
          category: 'Coral',
          type: 'livestock',
          species: 'Zoanthus sp.',
          careLevel: 'Beginner',
          priority: 'recommended',
          reason: 'Colorful, hardy, and easy to propagate',
          compatibility: 'Generally peaceful'
        }
      );

      if (gallons > 30) {
        baseRecommendations.push({
          name: 'Hammer Coral',
          category: 'Coral',
          type: 'livestock',
          species: 'Euphyllia ancora',
          careLevel: 'Intermediate',
          priority: 'optional',
          reason: 'Beautiful LPS coral with flowing tentacles',
          compatibility: 'Keep away from other corals'
        });
      }
    }

    // Add cleanup crew
    baseRecommendations.push(
      {
        name: 'Hermit Crabs',
        category: 'Cleanup Crew',
        type: 'livestock',
        species: 'Various hermit crab species',
        careLevel: 'Beginner',
        priority: 'essential',
        reason: 'Help control algae and detritus',
        compatibility: 'Generally peaceful'
      },
      {
        name: 'Turbo Snails',
        category: 'Cleanup Crew',
        type: 'livestock',
        species: 'Turbo sp.',
        careLevel: 'Beginner',
        priority: 'recommended',
        reason: 'Excellent algae eaters',
        compatibility: 'Peaceful herbivores'
      }
    );

    return baseRecommendations;
  };

  const equipmentRecommendations = getEquipmentRecommendations();
  const livestockRecommendations = getLivestockRecommendations();

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'essential': return 'bg-red-100 text-red-800 border-red-200';
      case 'recommended': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'optional': return 'bg-gray-100 text-gray-800 border-gray-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Lightbulb className="h-5 w-5" />
          Recommendations for {tankType} Tank ({gallons} gallons)
        </CardTitle>
        <CardDescription>
          Curated suggestions based on your tank type and size
        </CardDescription>
        <div className="flex items-center gap-4 pt-2">
          <div className="flex items-center space-x-2">
            <Switch
              id="show-equipment"
              checked={showEquipment}
              onCheckedChange={setShowEquipment}
            />
            <Label htmlFor="show-equipment">Equipment</Label>
          </div>
          <div className="flex items-center space-x-2">
            <Switch
              id="show-livestock"
              checked={showLivestock}
              onCheckedChange={setShowLivestock}
            />
            <Label htmlFor="show-livestock">Livestock</Label>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {showEquipment && (
          <div>
            <h4 className="font-medium mb-3 flex items-center gap-2">
              Equipment Recommendations
              <Badge variant="outline">{equipmentRecommendations.length} items</Badge>
            </h4>
            <div className="grid gap-3">
              {equipmentRecommendations.map((item, index) => (
                <div key={index} className="flex items-start justify-between p-3 border rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h5 className="font-medium">{item.name}</h5>
                      <Badge variant="outline">{item.category}</Badge>
                      <Badge className={getPriorityColor(item.priority)}>
                        {item.priority}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mb-1">{item.reason}</p>
                    <p className="text-xs text-blue-600 dark:text-blue-400">
                      💡 {item.sizeGuidance}
                    </p>
                  </div>
                  <Button
                    size="sm"
                    onClick={() => onAddRecommendation(item, 'equipment')}
                    className="gap-2"
                  >
                    <Plus className="h-4 w-4" />
                    Add
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}

        {showLivestock && (
          <div>
            <h4 className="font-medium mb-3 flex items-center gap-2">
              Livestock Recommendations
              <Badge variant="outline">{livestockRecommendations.length} items</Badge>
            </h4>
            <div className="grid gap-3">
              {livestockRecommendations.map((item, index) => (
                <div key={index} className="flex items-start justify-between p-3 border rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h5 className="font-medium">{item.name}</h5>
                      <Badge variant="outline">{item.category}</Badge>
                      <Badge className={getPriorityColor(item.priority)}>
                        {item.priority}
                      </Badge>
                      <Badge variant="secondary">{item.careLevel}</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mb-1">{item.reason}</p>
                    <p className="text-xs text-green-600 dark:text-green-400">
                      🐠 {item.compatibility}
                    </p>
                  </div>
                  <Button
                    size="sm"
                    onClick={() => onAddRecommendation(item, 'livestock')}
                    className="gap-2"
                  >
                    <Plus className="h-4 w-4" />
                    Add
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tank Size Warnings */}
        {gallons > 0 && gallons < 20 && (
          <div className="flex items-start gap-2 p-3 bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-lg">
            <AlertTriangle className="h-4 w-4 text-orange-600 mt-0.5" />
            <div className="text-sm">
              <p className="font-medium text-orange-800 dark:text-orange-200">Small Tank Notice</p>
              <p className="text-orange-700 dark:text-orange-300">
                Tanks under 20 gallons require more frequent maintenance and careful livestock selection.
              </p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
