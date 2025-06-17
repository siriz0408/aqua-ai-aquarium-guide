
import React, { useState } from 'react';
import { Layout } from '@/components/Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Search, Fish, Settings, Download, Database, Plus } from 'lucide-react';
import { useEducationalFish } from '@/hooks/useEducationalFish';
import { useEducationalEquipment } from '@/hooks/useEducationalEquipment';
import FishCard from '@/components/educational/FishCard';
import EquipmentCard from '@/components/educational/EquipmentCard';
import GBIFImportDialog from '@/components/educational/GBIFImportDialog';
import ImportJobStatus from '@/components/educational/ImportJobStatus';

const Education = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [isGBIFDialogOpen, setIsGBIFDialogOpen] = useState(false);

  const { 
    fish, 
    fishLoading, 
    addToList, 
    isInList, 
    getFishByCategory 
  } = useEducationalFish();

  const { 
    equipment, 
    equipmentLoading 
  } = useEducationalEquipment();

  // Filter fish based on search term and category
  const filteredFish = fish.filter(f => {
    const matchesSearch = searchTerm === '' || 
      f.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      f.scientific_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      f.category.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = selectedCategory === 'all' || f.category === selectedCategory;
    
    return matchesSearch && matchesCategory;
  });

  // Filter equipment based on search term
  const filteredEquipment = equipment.filter(e => 
    searchTerm === '' || 
    e.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    e.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Get unique categories from fish data
  const fishCategories = [...new Set(fish.map(f => f.category))];

  return (
    <Layout title="Educational Library">
      <div className="space-y-6 pb-20">
        {/* Header with Search and Actions */}
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">Marine Life Encyclopedia</h1>
              <p className="text-muted-foreground">
                Comprehensive database of marine species and aquarium equipment
              </p>
            </div>
            
            <div className="flex gap-2">
              <Button
                onClick={() => setIsGBIFDialogOpen(true)}
                className="ocean-gradient text-white"
              >
                <Database className="h-4 w-4 mr-2" />
                Import from GBIF
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
        </div>

        {/* Main Content Tabs */}
        <Tabs defaultValue="fish" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="fish" className="flex items-center gap-2">
              <Fish className="h-4 w-4" />
              Marine Life ({fish.length})
            </TabsTrigger>
            <TabsTrigger value="equipment" className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              Equipment ({equipment.length})
            </TabsTrigger>
            <TabsTrigger value="admin" className="flex items-center gap-2">
              <Download className="h-4 w-4" />
              Data Management
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
                All Categories ({fish.length})
              </Button>
              {fishCategories.map(category => {
                const count = getFishByCategory(category).length;
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

            {/* Species Grid */}
            {fishLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {[...Array(6)].map((_, i) => (
                  <Card key={i} className="h-64 animate-pulse">
                    <div className="bg-gray-200 h-full rounded-lg"></div>
                  </Card>
                ))}
              </div>
            ) : filteredFish.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredFish.map(fishItem => (
                  <FishCard key={fishItem.id} fish={fishItem} />
                ))}
              </div>
            ) : (
              <Card className="p-8 text-center">
                <Fish className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-lg font-medium mb-2">No species found</h3>
                <p className="text-muted-foreground mb-4">
                  {searchTerm ? 'Try adjusting your search terms' : 'Import species data from GBIF to get started'}
                </p>
                <Button onClick={() => setIsGBIFDialogOpen(true)}>
                  <Database className="h-4 w-4 mr-2" />
                  Import from GBIF
                </Button>
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

          {/* Admin/Data Management Tab */}
          <TabsContent value="admin" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* GBIF Import Card */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Database className="h-5 w-5" />
                    GBIF Integration
                  </CardTitle>
                  <CardDescription>
                    Import species data from the Global Biodiversity Information Facility
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="text-sm text-muted-foreground">
                    <p>Access to over 1.5 million species records with:</p>
                    <ul className="list-disc list-inside mt-2 space-y-1">
                      <li>Scientific names and taxonomy</li>
                      <li>Common names in multiple languages</li>
                      <li>High-quality images</li>
                      <li>Geographic distribution data</li>
                    </ul>
                  </div>
                  
                  <Button 
                    onClick={() => setIsGBIFDialogOpen(true)}
                    className="w-full"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Import Species Data
                  </Button>
                </CardContent>
              </Card>

              {/* Database Statistics */}
              <Card>
                <CardHeader>
                  <CardTitle>Database Statistics</CardTitle>
                  <CardDescription>Current content overview</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span>Total Species</span>
                      <Badge variant="outline">{fish.length}</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Equipment Items</span>
                      <Badge variant="outline">{equipment.length}</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Categories</span>
                      <Badge variant="outline">{fishCategories.length}</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>GBIF Records</span>
                      <Badge variant="outline">
                        {fish.filter(f => f.data_source === 'gbif').length}
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Import Job Status */}
            <ImportJobStatus />
          </TabsContent>
        </Tabs>

        {/* GBIF Import Dialog */}
        <GBIFImportDialog 
          open={isGBIFDialogOpen} 
          onOpenChange={setIsGBIFDialogOpen} 
        />
      </div>
    </Layout>
  );
};

export default Education;
