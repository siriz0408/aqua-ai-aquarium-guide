
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Download, ExternalLink, Image, Info } from 'lucide-react';
import { GBIFSpecies } from '@/hooks/useGBIFApi';

interface GBIFSpeciesCardProps {
  species: GBIFSpecies;
  onImport: (species: GBIFSpecies) => void;
  isImporting?: boolean;
  showImportButton?: boolean;
}

const GBIFSpeciesCard: React.FC<GBIFSpeciesCardProps> = ({ 
  species, 
  onImport, 
  isImporting = false,
  showImportButton = true 
}) => {
  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'accepted':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'synonym':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'doubtful':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getRankColor = (rank: string) => {
    switch (rank.toLowerCase()) {
      case 'species':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'genus':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'family':
        return 'bg-indigo-100 text-indigo-800 border-indigo-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const commonNames = species.vernacularNames?.filter(vn => vn.language === 'en') || [];
  const primaryCommonName = commonNames[0]?.vernacularName;
  const hasImages = species.media && species.media.length > 0;
  const primaryImage = species.media?.find(m => m.type === 'StillImage')?.identifier;

  return (
    <Card className="h-full hover:shadow-lg transition-shadow duration-200">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <CardTitle className="text-lg mb-1 truncate">
              {primaryCommonName || species.canonicalName}
            </CardTitle>
            <p className="text-sm text-muted-foreground italic mb-2 truncate">
              {species.scientificName}
              {species.authorship && (
                <span className="text-xs ml-1">({species.authorship})</span>
              )}
            </p>
            
            <div className="flex flex-wrap gap-1 mb-2">
              <Badge className={getStatusColor(species.taxonomicStatus)}>
                {species.taxonomicStatus}
              </Badge>
              <Badge variant="outline" className={getRankColor(species.rank)}>
                {species.rank}
              </Badge>
              {hasImages && (
                <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                  <Image className="h-3 w-3 mr-1" />
                  {species.media?.length} images
                </Badge>
              )}
            </div>
          </div>
          
          {showImportButton && (
            <Button
              onClick={() => onImport(species)}
              disabled={isImporting}
              size="sm"
              className="ml-2 flex-shrink-0"
            >
              <Download className="h-4 w-4 mr-1" />
              {isImporting ? 'Importing...' : 'Import'}
            </Button>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Taxonomic Information */}
        <div className="space-y-2">
          <h4 className="text-sm font-medium">Taxonomy</h4>
          <div className="grid grid-cols-2 gap-2 text-xs">
            {species.family && (
              <div><span className="font-medium">Family:</span> {species.family}</div>
            )}
            {species.genus && (
              <div><span className="font-medium">Genus:</span> {species.genus}</div>
            )}
            {species.order && (
              <div><span className="font-medium">Order:</span> {species.order}</div>
            )}
            {species.class && (
              <div><span className="font-medium">Class:</span> {species.class}</div>
            )}
          </div>
        </div>

        {/* Common Names */}
        {commonNames.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-sm font-medium">Common Names</h4>
            <div className="flex flex-wrap gap-1">
              {commonNames.slice(0, 3).map((name, index) => (
                <Badge key={index} variant="outline" className="text-xs">
                  {name.vernacularName}
                </Badge>
              ))}
              {commonNames.length > 3 && (
                <Badge variant="outline" className="text-xs">
                  +{commonNames.length - 3} more
                </Badge>
              )}
            </div>
          </div>
        )}

        {/* Image Preview */}
        {primaryImage && (
          <div className="space-y-2">
            <h4 className="text-sm font-medium">Preview</h4>
            <div className="relative aspect-video bg-gray-100 rounded-md overflow-hidden">
              <img
                src={primaryImage}
                alt={species.scientificName}
                className="w-full h-full object-cover"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.style.display = 'none';
                }}
              />
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex justify-between items-center pt-2 border-t">
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => window.open(`https://www.gbif.org/species/${species.key}`, '_blank')}
            >
              <ExternalLink className="h-3 w-3 mr-1" />
              GBIF
            </Button>
            <Button
              variant="outline"
              size="sm"
              title={`GBIF Key: ${species.key}`}
            >
              <Info className="h-3 w-3 mr-1" />
              #{species.key}
            </Button>
          </div>
          
          {!showImportButton && (
            <Badge variant="outline" className="text-xs">
              GBIF Data
            </Badge>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default GBIFSpeciesCard;
