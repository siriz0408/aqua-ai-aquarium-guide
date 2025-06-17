
import React, { useState, useEffect } from 'react';
import { Layout } from '@/components/Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Search, Fish, Settings, RefreshCw, Clock, Database } from 'lucide-react';
import { useEducationalEquipment } from '@/hooks/useEducationalEquipment';
import { useAutoSpecies } from '@/hooks/useAutoSpecies';
import EquipmentCard from '@/components/educational/EquipmentCard';
import AutoFishCard from '@/components/educational/AutoFishCard';

const Education = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  const { 
    species,
    isLoading: speciesLoading,
    error: speciesError,
    manualRefresh,
    getCacheInfo
  } = useAutoSpecies();

  const { 
    equipment, 
    equipmentLoading 
  } = useEducationalEquipment();

  // Add debugging
  useEffect(() => {
    console.log('Education page - Species state:', {
      speciesCount: species.length,
      isLoading: speciesLoading,
      error: speciesError,
      species: species
    });
  }, [species, speciesLoading, speciesError]);

  // Filter species based on search term and category
  const filteredSpecies = species.filter(f => {
    const matchesSearch = searchTerm === '' || 
      f.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      f.scientific_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      f.family?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = selectedCategory === 'all' || f.category === selectedCategory;
    
    return matchesSearch && matchesCategory;
  });

  console.log('Education page - Filtered species:', {
    originalCount: species.length,
    filteredCount: filteredSpecies.length,
    searchTerm,
    selectedCategory
  });

  // Filter equipment based on search term
  const filteredEquipment = equipment.filter(e => 
    searchTerm === '' || 
    e.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    e.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Get unique categories from species data
  const speciesCategories = [...new Set(species.map(f => f.category))];

  const cacheInfo = getCacheInfo();

  return (
    <Layout title="Educational Library">
      <div className="space-y-6 pb-20">
        {/* Header with Search and Actions */}
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">Marine Life Encyclopedia</h1>
              <p className="text-muted-foreground">
                Auto-populated from GBIF database with {species.length} species
              </p>
              {cacheInfo.lastUpdated && (
                <p className="text-xs text-muted-foreground mt-1">
                  Last updated: {cacheInfo.lastUpdated.toLocaleString()}
                </p>
              )}
            </div>
            
            <div className="flex gap-2">
              <Button
                onClick={manualRefresh}
                disabled={speciesLoading}
                variant="outline"
                size="sm"
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${speciesLoading ? 'animate-spin' : ''}`} />
                Refresh Data
              </Button>
            </div>
          </div>

          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search species, equipment, or categories..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Error Message */}
          {speciesError && (
            <Card className="border-red-200 bg-red-50">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 text-red-700">
                  <Database className="h-4 w-4" />
                  <span className="text-sm">{speciesError}</span>
                  <Button
                    onClick={manualRefresh}
                    variant="ghost"
                    size="sm"
                    className="ml-auto text-red-700 hover:text-red-800"
                  >
                    Try Again
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Main Content Tabs */}
        <Tabs defaultValue="fish" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="fish" className="flex items-center gap-2">
              <Fish className="h-4 w-4" />
              Marine Life ({species.length})
            </TabsTrigger>
            <TabsTrigger value="equipment" className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              Equipment ({equipment.length})
            </TabsTrigger>
          </TabsList>

          {/* Fish/Marine Life Tab */}
          <TabsContent value="fish" className="space-y-4">
            {/* Category Filter */}
            <div className="flex flex-wrap gap-2">
              <Button
                variant={selectedCategory === 'all' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedCategory('all')}
              >
                All Species ({species.length})
              </Button>
              {speciesCategories.map(category => {
                const count = species.filter(s => s.category === category).length;
                return (
                  <Button
                    key={category}
                    variant={selectedCategory === category ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setSelectedCategory(category)}
                  >
                    {category} ({count})
                  </Button>
                );
              })}
            </div>

            {/* Debug Info */}
            {process.env.NODE_ENV === 'development' && (
              <Card className="p-4 bg-yellow-50 border-yellow-200">
                <div className="text-sm text-yellow-800">
                  <div>Debug Info:</div>
                  <div>Species loaded: {species.length}</div>
                  <div>Filtered species: {filteredSpecies.length}</div>
                  <div>Loading: {speciesLoading ? 'Yes' : 'No'}</div>
                  <div>Error: {speciesError || 'None'}</div>
                  <div>Cache size: {cacheInfo.size}</div>
                </div>
              </Card>
            )}

            {/* Species Grid */}
            {speciesLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {[...Array(6)].map((_, i) => (
                  <Card key={i} className="h-64 animate-pulse">
                    <div className="bg-gray-200 h-full rounded-lg"></div>
                  </Card>
                ))}
              </div>
            ) : filteredSpecies.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredSpecies.map(fishItem => (
                  <AutoFishCard key={fishItem.id} fish={fishItem} />
                ))}
              </div>
            ) : (
              <Card className="p-8 text-center">
                <Fish className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-lg font-medium mb-2">
                  {species.length === 0 ? 'Loading species data...' : 'No species found'}
                </h3>
                <p className="text-muted-foreground mb-4">
                  {species.length === 0 
                    ? 'Auto-populating species from GBIF database' 
                    : searchTerm 
                    ? 'Try adjusting your search terms' 
                    : 'No species match the current filters'
                  }
                </p>
                {!speciesLoading && species.length === 0 && (
                  <Button onClick={manualRefresh}>
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Load Species Data
                  </Button>
                )}
              </Card>
            )}

            {/* Cache Info */}
            {cacheInfo.size > 0 && (
              <Card className="p-4">
                <div className="flex items-center justify-between text-sm text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    <span>
                      {cacheInfo.size} species cached • 
                      Last updated: {cacheInfo.lastUpdated?.toLocaleString()} • 
                      Expires: {cacheInfo.expiresAt?.toLocaleString()}
                    </span>
                  </div>
                  <Badge variant="outline" className="bg-green-50 text-green-700">
                    Auto-Populated
                  </Badge>
                </div>
              </Card>
            )}
          </TabsContent>

          {/* Equipment Tab */}
          <TabsContent value="equipment" className="space-y-4">
            {equipmentLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {[...Array(6)].map((_, i) => (
                  <Card key={i} className="h-64 animate-pulse">
                    <div className="bg-gray-200 h-full rounded-lg"></div>
                  </Card>
                ))}
              </div>
            ) : filteredEquipment.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredEquipment.map(equipmentItem => (
                  <EquipmentCard key={equipmentItem.id} equipment={equipmentItem} />
                ))}
              </div>
            ) : (
              <Card className="p-8 text-center">
                <Settings className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-lg font-medium mb-2">No equipment found</h3>
                <p className="text-muted-foreground">
                  {searchTerm ? 'Try adjusting your search terms' : 'Equipment data will be available soon'}
                </p>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
};

export default Education;
