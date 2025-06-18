
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface TankBasicInfoProps {
  formData: {
    name: string;
    type: 'FOWLR' | 'Reef' | 'Mixed';
    location: string;
    lighting: string;
  };
  onInputChange: (field: string, value: string) => void;
}

export function TankBasicInfo({ formData, onInputChange }: TankBasicInfoProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Tank Information</CardTitle>
        <CardDescription>Basic details about your aquarium</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="name">Tank Name</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => onInputChange('name', e.target.value)}
              placeholder="My Reef Tank"
            />
          </div>
          <div>
            <Label htmlFor="type">Tank Type</Label>
            <Select value={formData.type} onValueChange={(value: any) => onInputChange('type', value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="FOWLR">FOWLR (Fish Only With Live Rock)</SelectItem>
                <SelectItem value="Reef">Reef Tank</SelectItem>
                <SelectItem value="Mixed">Mixed Reef</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="location">Location</Label>
            <Select value={formData.location} onValueChange={(value) => onInputChange('location', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select location" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="living-room">Living Room</SelectItem>
                <SelectItem value="bedroom">Bedroom</SelectItem>
                <SelectItem value="office">Office</SelectItem>
                <SelectItem value="basement">Basement</SelectItem>
                <SelectItem value="garage">Garage</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="lighting">Primary Lighting</Label>
            <Select value={formData.lighting} onValueChange={(value) => onInputChange('lighting', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select lighting type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="led">LED</SelectItem>
                <SelectItem value="t5">T5 Fluorescent</SelectItem>
                <SelectItem value="metal-halide">Metal Halide</SelectItem>
                <SelectItem value="hybrid">Hybrid</SelectItem>
                <SelectItem value="none">No Lighting Yet</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
