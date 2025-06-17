
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Search, Download, Loader2, Fish, Database } from 'lucide-react';
import { useGBIFApi } from '@/hooks/useGBIFApi';
import { useGBIFImport } from '@/hooks/useGBIFImport';
import GBIFSpeciesCard from './GBIFSpeciesCard';

interface GBIFImportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const GBIFImportDialog: React.FC<GBIFImportDialogProps> = ({ open, onOpenChange }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [selectedFamily, setSelectedFamily] = useState('');

  const { searchSpecies, searchByFamily, searchMarineSpecies, isLoading: isSearching } = useGBIFApi();
  const { importSpecies, bulkImport, isImporting } = useGBIFImport();

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    
    const results = await searchSpecies(searchQuery, 20);
    if (results) {
      setSearchResults(results.results);
    }
  };

  const handleFamilySearch = async () => {
    if (!selectedFamily.trim()) return;
    
    const results = await searchByFamily(selectedFamily, 50);
    if (results) {
      setSearchResults(results.results);
    }
  };

  const handleMarineSearch = async () => {
    const results = await searchMarineSpecies(100);
    if (results) {
      setSearchResults(results.results);
    }
  };

  const handleBulkImport = () => {
    if (searchResults.length === 0) return;
    
    bulkImport({ 
      species: searchResults,
      jobType: selectedFamily ? 'family_import' : 'bulk_import'
    });
    onOpenChange(false);
  };

  const popularMarineFamilies = [
    { name: 'Pomacentridae', common: 'Damselfishes', count: '~400 species' },
    { name: 'Labridae', common: 'Wrasses', count: '~600 species' },
    { name: 'Serranidae', common: 'Groupers', count: '~500 species' },
    { name: 'Chaetodontidae', common: 'Butterflyfishes', count: '~130 species' },
    { name: 'Pomacanthidae', common: 'Angelfishes', count: '~90 species' },
    { name: 'Acanthuridae', common: 'Tangs/Surgeonfish', count: '~80 species' },
    { name: 'Gobiidae', common: 'Gobies', count: '~2000 species' },
    { name: 'Blenniidae', common: 'Blennies', count: '~400 species' },
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Import Species from GBIF
          </DialogTitle>
          <DialogDescription>
            Search and import species data from the Global Biodiversity Information Facility (GBIF)
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="search" className="flex-1 flex flex-col">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="search">Search Species</TabsTrigger>
            <TabsTrigger value="family">Import by Family</TabsTrigger>
            <TabsTrigger value="marine">Popular Marine Species</TabsTrigger>
          </TabsList>

          <TabsContent value="search" className="flex-1 flex flex-col space-y-4">
            <div className="flex gap-2">
              <div className="flex-1">
                <Label htmlFor="search">Search by Name</Label>
                <Input
                  id="search"
                  placeholder="Enter scientific or common name (e.g., Amphiprion ocellaris)"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                />
              </div>
              <Button 
                onClick={handleSearch} 
                disabled={isSearching || !searchQuery.trim()}
                className="mt-6"
              >
                {isSearching ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
                Search
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="family" className="flex-1 flex flex-col space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="family">Custom Family Search</Label>
                <div className="flex gap-2">
                  <Input
                    id="family"
                    placeholder="Enter family name (e.g., Pomacentridae)"
                    value={selectedFamily}
                    onChange={(e) => setSelectedFamily(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleFamilySearch()}
                  />
                  <Button 
                    onClick={handleFamilySearch} 
                    disabled={isSearching || !selectedFamily.trim()}
                  >
                    {isSearching ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
                  </Button>
                </div>
              </div>
              
              <div>
                <Label>Popular Marine Families</Label>
                <ScrollArea className="h-32 border rounded-md p-2">
                  <div className="space-y-1">
                    {popularMarineFamilies.map((family) => (
                      <Button
                        key={family.name}
                        variant="ghost"
                        size="sm"
                        className="w-full justify-start text-left h-auto p-2"
                        onClick={() => {
                          setSelectedFamily(family.name);
                          handleFamilySearch();
                        }}
                      >
                        <div>
                          <div className="font-medium">{family.name}</div>
                          <div className="text-xs text-muted-foreground">
                            {family.common} • {family.count}
                          </div>
                        </div>
                      </Button>
                    ))}
                  </div>
                </ScrollArea>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="marine" className="flex-1 flex flex-col space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Fish className="h-5 w-5" />
                  Popular Marine Species
                </CardTitle>
                <CardDescription>
                  Import commonly kept aquarium species from popular marine families
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button 
                  onClick={handleMarineSearch}
                  disabled={isSearching}
                  className="w-full"
                >
                  {isSearching ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  ) : (
                    <Search className="h-4 w-4 mr-2" />
                  )}
                  Load Popular Marine Species
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Search Results */}
          {searchResults.length > 0 && (
            <div className="flex-1 flex flex-col space-y-4 border-t pt-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-semibold">Search Results</h3>
                  <Badge variant="outline">{searchResults.length} species found</Badge>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    onClick={() => setSearchResults([])}
                  >
                    Clear Results
                  </Button>
                  <Button
                    onClick={handleBulkImport}
                    disabled={isImporting || searchResults.length === 0}
                  >
                    {isImporting ? (
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    ) : (
                      <Download className="h-4 w-4 mr-2" />
                    )}
                    Import All ({searchResults.length})
                  </Button>
                </div>
              </div>

              <ScrollArea className="flex-1 min-h-[300px]">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pr-4">
                  {searchResults.map((species) => (
                    <GBIFSpeciesCard
                      key={species.key}
                      species={species}
                      onImport={importSpecies}
                      isImporting={isImporting}
                    />
                  ))}
                </div>
              </ScrollArea>
            </div>
          )}
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};

export default GBIFImportDialog;
