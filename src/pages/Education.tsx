
import React, { useState } from 'react';
import { Layout } from '@/components/Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { educationalSpecies, educationalEquipment } from '@/data/educationalData';
import FishCard from '@/components/educational/FishCard';
import EquipmentCard from '@/components/educational/EquipmentCard';
import { Search, Filter, BookOpen, Fish, Settings, Waves, Leaf } from 'lucide-react';

const Education = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [waterType, setWaterType] = useState('all');
  const [activeTab, setActiveTab] = useState('species');

  const categories = [
    { value: 'all', label: 'All Species', icon: '🐠' },
    { value: 'Fish', label: 'Fish', icon: '🐟' },
    { value: 'Coral', label: 'Coral', icon: '🪸' },
    { value: 'Invertebrate', label: 'Invertebrates', icon: '🦐' },
    { value: 'Plant', label: 'Plants', icon: '🌱' },
  ];

  const waterTypes = [
    { value: 'all', label: 'All Water Types', icon: '🌊' },
    { value: 'Saltwater', label: 'Saltwater', icon: '🧂' },
    { value: 'Freshwater', label: 'Freshwater', icon: '💧' },
  ];

  const equipmentCategories = [
    { value: 'all', label: 'All Equipment', icon: '⚙️' },
    { value: 'Filtration', label: 'Filtration', icon: '🔄' },
    { value: 'Lighting', label: 'Lighting', icon: '💡' },
    { value: 'Heating', label: 'Heating', icon: '🌡️' },
    { value: 'Testing', label: 'Testing', icon: '🧪' },
    { value: 'Maintenance', label: 'Maintenance', icon: '🧽' },
  ];

  const filteredSpecies = educationalSpecies.filter(species => {
    const matchesSearch = species.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         species.scientific_name?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || species.category === selectedCategory;
    const matchesWaterType = waterType === 'all' || species.water_type === waterType;
    
    return matchesSearch && matchesCategory && matchesWaterType;
  });

  const filteredEquipment = educationalEquipment.filter(equipment => {
    const matchesSearch = equipment.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         equipment.summary.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || equipment.category === selectedCategory;
    
    return matchesSearch && matchesCategory;
  });

  const getSpeciesStats = () => {
    const saltwater = educationalSpecies.filter(s => s.water_type === 'Saltwater');
    const freshwater = educationalSpecies.filter(s => s.water_type === 'Freshwater');
    const fish = educationalSpecies.filter(s => s.category === 'Fish');
    const corals = educationalSpecies.filter(s => s.category === 'Coral');
    const inverts = educationalSpecies.filter(s => s.category === 'Invertebrate');
    const plants = educationalSpecies.filter(s => s.category === 'Plant');
    const beginnerFriendly = educationalSpecies.filter(s => s.care_level === 'Beginner');

    return { saltwater, freshwater, fish, corals, inverts, plants, beginnerFriendly };
  };

  const stats = getSpeciesStats();

  return (
    <Layout title="Research & Education" showBackButton>
      <div className="space-y-6 pb-20">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="ocean-gradient rounded-xl p-6 text-white">
            <BookOpen className="mx-auto h-8 w-8 mb-2" />
            <h2 className="text-2xl font-bold mb-2">Research & Learn</h2>
            <p className="text-blue-100 text-sm">
              Comprehensive database of aquarium species and equipment
            </p>
          </div>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="species" className="flex items-center gap-2">
              <Fish className="h-4 w-4" />
              Species & Life
            </TabsTrigger>
            <TabsTrigger value="equipment" className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              Equipment
            </TabsTrigger>
          </TabsList>

          <TabsContent value="species" className="space-y-6">
            {/* Search and Filters */}
            <Card>
              <CardContent className="p-4 space-y-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search species by name or scientific name..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                
                <div className="space-y-3">
                  <div className="flex flex-wrap gap-2">
                    <span className="text-sm font-medium text-muted-foreground">Category:</span>
                    {categories.map(category => (
                      <Button
                        key={category.value}
                        variant={selectedCategory === category.value ? "default" : "outline"}
                        size="sm"
                        onClick={() => setSelectedCategory(category.value)}
                        className="gap-1"
                      >
                        <span>{category.icon}</span>
                        {category.label}
                      </Button>
                    ))}
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <span className="text-sm font-medium text-muted-foreground">Water Type:</span>
                    {waterTypes.map(type => (
                      <Button
                        key={type.value}
                        variant={waterType === type.value ? "default" : "outline"}
                        size="sm"
                        onClick={() => setWaterType(type.value)}
                        className="gap-1"
                      >
                        <span>{type.icon}</span>
                        {type.label}
                      </Button>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Quick Stats */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <Card className="text-center p-4">
                <div className="text-2xl mb-1">🧂</div>
                <div className="text-lg font-bold">{stats.saltwater.length}</div>
                <div className="text-xs text-muted-foreground">Marine Species</div>
              </Card>
              <Card className="text-center p-4">
                <div className="text-2xl mb-1">💧</div>
                <div className="text-lg font-bold">{stats.freshwater.length}</div>
                <div className="text-xs text-muted-foreground">Freshwater Species</div>
              </Card>
              <Card className="text-center p-4">
                <div className="text-2xl mb-1">🪸</div>
                <div className="text-lg font-bold">{stats.corals.length}</div>
                <div className="text-xs text-muted-foreground">Coral Types</div>
              </Card>
              <Card className="text-center p-4">
                <div className="text-2xl mb-1">🌱</div>
                <div className="text-lg font-bold">{stats.beginnerFriendly.length}</div>
                <div className="text-xs text-muted-foreground">Beginner Friendly</div>
              </Card>
            </div>

            {/* Results */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium">
                  {filteredSpecies.length} Species Found
                </h3>
                <Badge variant="outline">
                  <Filter className="mr-1 h-3 w-3" />
                  {searchTerm ? `"${searchTerm}"` : 'All'}
                </Badge>
              </div>

              {filteredSpecies.length === 0 ? (
                <Card className="p-12 text-center">
                  <div className="space-y-4">
                    <div className="text-4xl">🔍</div>
                    <div>
                      <h4 className="font-medium">No species found</h4>
                      <p className="text-sm text-muted-foreground">
                        Try adjusting your search terms or filters
                      </p>
                    </div>
                    <Button 
                      variant="outline" 
                      onClick={() => {
                        setSearchTerm('');
                        setSelectedCategory('all');
                        setWaterType('all');
                      }}
                    >
                      Clear Filters
                    </Button>
                  </div>
                </Card>
              ) : (
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {filteredSpecies.map((species) => (
                    <FishCard key={species.id} fish={species} />
                  ))}
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="equipment" className="space-y-6">
            {/* Search and Filters for Equipment */}
            <Card>
              <CardContent className="p-4 space-y-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search equipment..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                
                <div className="flex flex-wrap gap-2">
                  {equipmentCategories.map(category => (
                    <Button
                      key={category.value}
                      variant={selectedCategory === category.value ? "default" : "outline"}
                      size="sm"
                      onClick={() => setSelectedCategory(category.value)}
                      className="gap-1"
                    >
                      <span>{category.icon}</span>
                      {category.label}
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Equipment Stats */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <Card className="text-center p-4">
                <div className="text-2xl mb-1">🔄</div>
                <div className="text-lg font-bold">{educationalEquipment.filter(e => e.category === 'Filtration').length}</div>
                <div className="text-xs text-muted-foreground">Filtration</div>
              </Card>
              <Card className="text-center p-4">
                <div className="text-2xl mb-1">💡</div>
                <div className="text-lg font-bold">{educationalEquipment.filter(e => e.category === 'Lighting').length}</div>
                <div className="text-xs text-muted-foreground">Lighting</div>
              </Card>
              <Card className="text-center p-4">
                <div className="text-2xl mb-1">🧪</div>
                <div className="text-lg font-bold">{educationalEquipment.filter(e => e.category === 'Testing').length}</div>
                <div className="text-xs text-muted-foreground">Testing</div>
              </Card>
              <Card className="text-center p-4">
                <div className="text-2xl mb-1">⚙️</div>
                <div className="text-lg font-bold">{educationalEquipment.filter(e => e.difficulty_level === 'Easy').length}</div>
                <div className="text-xs text-muted-foreground">Beginner Friendly</div>
              </Card>
            </div>

            {/* Equipment Results */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium">
                  {filteredEquipment.length} Equipment Items Found
                </h3>
                <Badge variant="outline">
                  <Filter className="mr-1 h-3 w-3" />
                  {searchTerm ? `"${searchTerm}"` : 'All'}
                </Badge>
              </div>

              {filteredEquipment.length === 0 ? (
                <Card className="p-12 text-center">
                  <div className="space-y-4">
                    <div className="text-4xl">🔍</div>
                    <div>
                      <h4 className="font-medium">No equipment found</h4>
                      <p className="text-sm text-muted-foreground">
                        Try adjusting your search terms or filters
                      </p>
                    </div>
                    <Button 
                      variant="outline" 
                      onClick={() => {
                        setSearchTerm('');
                        setSelectedCategory('all');
                      }}
                    >
                      Clear Filters
                    </Button>
                  </div>
                </Card>
              ) : (
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {filteredEquipment.map((equipment) => (
                    <EquipmentCard key={equipment.id} equipment={equipment} />
                  ))}
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
};

export default Education;
