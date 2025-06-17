
import React, { useState } from 'react';
import { Layout } from '@/components/Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useEducationalFish } from '@/hooks/useEducationalFish';
import FishCard from '@/components/educational/FishCard';
import { Search, Filter, BookOpen, Fish, Settings } from 'lucide-react';

const Education = () => {
  const { fish, fishLoading } = useEducationalFish();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  const categories = [
    { value: 'all', label: 'All Species', icon: '🐠' },
    { value: 'fish', label: 'Fish', icon: '🐟' },
    { value: 'coral', label: 'Coral', icon: '🪸' },
    { value: 'invertebrate', label: 'Invertebrates', icon: '🦐' },
  ];

  const filteredFish = fish.filter(f => {
    const matchesSearch = f.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         f.scientific_name?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || 
                           f.category.toLowerCase() === selectedCategory.toLowerCase();
    
    return matchesSearch && matchesCategory;
  });

  if (fishLoading) {
    return (
      <Layout title="Research & Education" showBackButton>
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout title="Research & Education" showBackButton>
      <div className="space-y-6 pb-20">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="ocean-gradient rounded-xl p-6 text-white">
            <BookOpen className="mx-auto h-8 w-8 mb-2" />
            <h2 className="text-2xl font-bold mb-2">Research & Learn</h2>
            <p className="text-blue-100 text-sm">
              Discover species compatibility, care requirements, and tank planning
            </p>
          </div>
        </div>

        {/* Search and Filters */}
        <Card>
          <CardContent className="p-4 space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search fish, coral, or invertebrates..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <div className="flex flex-wrap gap-2">
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
          </CardContent>
        </Card>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <Card className="text-center p-4">
            <div className="text-2xl mb-1">🐠</div>
            <div className="text-lg font-bold">{fish.filter(f => f.category === 'Fish').length}</div>
            <div className="text-xs text-muted-foreground">Fish Species</div>
          </Card>
          <Card className="text-center p-4">
            <div className="text-2xl mb-1">🪸</div>
            <div className="text-lg font-bold">{fish.filter(f => f.category === 'Coral').length}</div>
            <div className="text-xs text-muted-foreground">Coral Types</div>
          </Card>
          <Card className="text-center p-4">
            <div className="text-2xl mb-1">🦐</div>
            <div className="text-lg font-bold">{fish.filter(f => f.category === 'Invertebrate').length}</div>
            <div className="text-xs text-muted-foreground">Invertebrates</div>
          </Card>
          <Card className="text-center p-4">
            <div className="text-2xl mb-1">🌱</div>
            <div className="text-lg font-bold">{fish.filter(f => f.care_level === 'Beginner').length}</div>
            <div className="text-xs text-muted-foreground">Beginner Friendly</div>
          </Card>
        </div>

        {/* Results */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium">
              {filteredFish.length} {selectedCategory === 'all' ? 'Species' : categories.find(c => c.value === selectedCategory)?.label} Found
            </h3>
            <Badge variant="outline">
              <Filter className="mr-1 h-3 w-3" />
              {searchTerm ? `"${searchTerm}"` : 'All'}
            </Badge>
          </div>

          {filteredFish.length === 0 ? (
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
                  }}
                >
                  Clear Filters
                </Button>
              </div>
            </Card>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {filteredFish.map((species) => (
                <FishCard key={species.id} fish={species} />
              ))}
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default Education;
