
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Search, Scan, Package, Plus } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface ProductLookupProps {
  onProductFound: (product: any, category: 'equipment' | 'livestock') => void;
}

export const ProductLookup: React.FC<ProductLookupProps> = ({ onProductFound }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchType, setSearchType] = useState<'upc' | 'name' | 'model'>('name');
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const { toast } = useToast();

  // Mock product database - in a real app, this would be an API call
  const mockProducts = [
    {
      id: '1',
      name: 'EcoTech Marine Radion XR15 G5 Pro',
      category: 'Lighting',
      type: 'equipment',
      upc: '123456789012',
      model: 'XR15-G5-PRO',
      brand: 'EcoTech Marine',
      price: '$449.99',
      imageUrl: '',
      maintenanceTips: 'Clean lens monthly, update firmware regularly'
    },
    {
      id: '2',
      name: 'Tunze Turbelle Nanostream 6055',
      category: 'Circulation',
      type: 'equipment',
      upc: '123456789013',
      model: '6055',
      brand: 'Tunze',
      price: '$159.99',
      imageUrl: '',
      maintenanceTips: 'Clean impeller every 2-3 months'
    },
    {
      id: '3',
      name: 'Ocellaris Clownfish',
      category: 'Fish',
      type: 'livestock',
      species: 'Amphiprion ocellatus',
      careLevel: 'Beginner',
      compatibility: 'Peaceful, reef safe',
      maxSize: '3 inches',
      temperament: 'Semi-aggressive'
    },
    {
      id: '4',
      name: 'Blue Tang',
      category: 'Fish',
      type: 'livestock',
      species: 'Paracanthurus hepatus',
      careLevel: 'Intermediate',
      compatibility: 'Peaceful, reef safe with caution',
      maxSize: '12 inches',
      temperament: 'Peaceful'
    },
    {
      id: '5',
      name: 'Green Star Polyp',
      category: 'Coral',
      type: 'livestock',
      species: 'Pachyclavularia violacea',
      careLevel: 'Beginner',
      compatibility: 'Peaceful, fast growing',
      lightRequirement: 'Low to Moderate',
      flow: 'Low to Moderate'
    }
  ];

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;

    setIsSearching(true);
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    let results = [];
    if (searchType === 'upc') {
      results = mockProducts.filter(product => 
        product.upc && product.upc.includes(searchQuery)
      );
    } else if (searchType === 'model') {
      results = mockProducts.filter(product => 
        product.model && product.model.toLowerCase().includes(searchQuery.toLowerCase())
      );
    } else {
      results = mockProducts.filter(product => 
        product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (product.brand && product.brand.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }

    setSearchResults(results);
    setIsSearching(false);

    if (results.length === 0) {
      toast({
        title: "No products found",
        description: "Try adjusting your search terms or search type.",
      });
    }
  };

  const handleAddProduct = (product: any) => {
    const category = product.type === 'equipment' ? 'equipment' : 'livestock';
    onProductFound(product, category);
    
    // Remove from search results after adding
    setSearchResults(prev => prev.filter(p => p.id !== product.id));
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Package className="h-5 w-5" />
          Product Lookup
        </CardTitle>
        <CardDescription>
          Search for products by UPC, model number, or name to add them to your tank
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2">
          <div className="flex-1">
            <Label htmlFor="search">Search Products</Label>
            <div className="flex gap-2">
              <Select value={searchType} onValueChange={(value: any) => setSearchType(value)}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="name">Name</SelectItem>
                  <SelectItem value="upc">UPC</SelectItem>
                  <SelectItem value="model">Model</SelectItem>
                </SelectContent>
              </Select>
              <Input
                id="search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={`Search by ${searchType}...`}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              />
              <Button onClick={handleSearch} disabled={isSearching} className="gap-2">
                {isSearching ? (
                  <>Searching...</>
                ) : (
                  <>
                    <Search className="h-4 w-4" />
                    Search
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>

        {/* Search Results */}
        {searchResults.length > 0 && (
          <div className="space-y-3">
            <h4 className="font-medium">Search Results ({searchResults.length})</h4>
            <div className="space-y-2">
              {searchResults.map((product) => (
                <div key={product.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h5 className="font-medium">{product.name}</h5>
                      <Badge variant="outline">{product.category}</Badge>
                      {product.type === 'equipment' && product.brand && (
                        <Badge variant="secondary">{product.brand}</Badge>
                      )}
                    </div>
                    <div className="text-sm text-muted-foreground space-y-1">
                      {product.type === 'equipment' ? (
                        <>
                          {product.model && <p>Model: {product.model}</p>}
                          {product.price && <p>Price: {product.price}</p>}
                          {product.upc && <p>UPC: {product.upc}</p>}
                        </>
                      ) : (
                        <>
                          {product.species && <p>Species: {product.species}</p>}
                          <p>Care Level: {product.careLevel}</p>
                          {product.maxSize && <p>Max Size: {product.maxSize}</p>}
                        </>
                      )}
                    </div>
                  </div>
                  <Button onClick={() => handleAddProduct(product)} size="sm" className="gap-2">
                    <Plus className="h-4 w-4" />
                    Add
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Quick Add Section */}
        <div className="pt-4 border-t">
          <h4 className="font-medium mb-3">Quick Add Common Items</h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {[
              { name: 'Test Kit - API Master', category: 'Testing', type: 'equipment' },
              { name: 'Heater - 100W', category: 'Heating', type: 'equipment' },
              { name: 'Powerhead', category: 'Circulation', type: 'equipment' },
              { name: 'Live Rock', category: 'Substrate', type: 'equipment' }
            ].map((item, index) => (
              <Button
                key={index}
                variant="outline"
                size="sm"
                onClick={() => handleAddProduct(item)}
                className="text-xs h-auto py-2"
              >
                {item.name}
              </Button>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
