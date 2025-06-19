
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface Tank {
  name: string;
  size: string;
  type: 'Reef' | 'FOWLR' | 'Mixed';
  livestock: any[];
  equipment: any[];
  parameters: any[];
}

interface TankInfoCardProps {
  tank: Tank;
}

const TankInfoCard: React.FC<TankInfoCardProps> = ({ tank }) => {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              {tank.name}
              <div className="text-2xl">
                {tank.type === 'Reef' ? '🪸' : tank.type === 'FOWLR' ? '🐠' : '🌊'}
              </div>
            </CardTitle>
            <CardDescription>{tank.size}</CardDescription>
          </div>
          <Badge variant="secondary">{tank.type}</Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <p className="text-2xl font-bold text-primary">{tank.livestock.length}</p>
            <p className="text-sm text-muted-foreground">Livestock</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-accent">{tank.equipment.length}</p>
            <p className="text-sm text-muted-foreground">Equipment</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-green-600">{tank.parameters.length}</p>
            <p className="text-sm text-muted-foreground">Test Logs</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default TankInfoCard;
