
import React, { useState } from 'react';
import { Layout } from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useNavigate } from 'react-router-dom';
import { useAquarium } from '@/contexts/AquariumContext';
import { useToast } from '@/hooks/use-toast';
import { Droplets, Fish, Waves } from 'lucide-react';

export const AddTank = () => {
  const navigate = useNavigate();
  const { addTank } = useAquarium();
  const { toast } = useToast();
  
  const [formData, setFormData] = useState({
    name: '',
    size: '',
    type: '',
    description: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.size || !formData.type) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    
    try {
      await addTank({
        name: formData.name,
        size: `${formData.size} gallons`,
        type: formData.type as 'FOWLR' | 'Reef' | 'Mixed',
        equipment: [],
        livestock: [],
        parameters: []
      });
      
      toast({
        title: "Tank Created!",
        description: `${formData.name} has been added successfully.`,
      });
      
      navigate('/tanks');
    } catch (error) {
      console.error('Error creating tank:', error);
      toast({
        title: "Error",
        description: "Failed to create tank. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const tankTypes = [
    {
      value: 'Reef',
      label: 'Reef Tank',
      description: 'Corals, fish, and invertebrates',
      icon: '🪸'
    },
    {
      value: 'FOWLR',
      label: 'Fish Only with Live Rock',
      description: 'Fish and live rock, no corals',
      icon: '🐠'
    },
    {
      value: 'Mixed',
      label: 'Mixed Community',
      description: 'Various fish and some corals',
      icon: '🌊'
    }
  ];

  const commonSizes = [
    { value: '10', label: '10 gallons - Nano' },
    { value: '20', label: '20 gallons - Small' },
    { value: '40', label: '40 gallons - Medium' },
    { value: '55', label: '55 gallons - Standard' },
    { value: '75', label: '75 gallons - Large' },
    { value: '90', label: '90 gallons - Large' },
    { value: '125', label: '125 gallons - XL' },
    { value: '180', label: '180 gallons - XXL' },
    { value: 'custom', label: 'Custom Size' }
  ];

  return (
    <Layout title="Add New Tank" showBackButton>
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <div className="text-center mb-8">
          <div className="text-4xl mb-4">🐠</div>
          <h1 className="text-2xl font-bold mb-2">Add New Tank</h1>
          <p className="text-muted-foreground">Set up your new aquarium to start tracking its progress</p>
        </div>
        
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Droplets className="h-5 w-5" />
              Tank Information
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Tank Name */}
              <div>
                <Label htmlFor="name">Tank Name *</Label>
                <Input
                  id="name"
                  placeholder="e.g. Living Room Reef Tank"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  className="mt-1"
                />
              </div>
              
              {/* Tank Size */}
              <div>
                <Label htmlFor="size">Tank Size *</Label>
                <Select
                  value={formData.size}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, size: value }))}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Select tank size" />
                  </SelectTrigger>
                  <SelectContent>
                    {commonSizes.map((size) => (
                      <SelectItem key={size.value} value={size.value}>
                        {size.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {formData.size === 'custom' && (
                  <Input
                    placeholder="Enter custom size (gallons)"
                    className="mt-2"
                    onChange={(e) => setFormData(prev => ({ ...prev, size: e.target.value }))}
                  />
                )}
              </div>
              
              {/* Tank Type */}
              <div>
                <Label>Tank Type *</Label>
                <div className="grid grid-cols-1 gap-3 mt-2">
                  {tankTypes.map((type) => (
                    <Card
                      key={type.value}
                      className={`cursor-pointer transition-all border-2 ${
                        formData.type === type.value
                          ? 'border-primary bg-primary/5'
                          : 'border-border hover:border-primary/50'
                      }`}
                      onClick={() => setFormData(prev => ({ ...prev, type: type.value }))}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="text-2xl">{type.icon}</div>
                          <div>
                            <h4 className="font-medium">{type.label}</h4>
                            <p className="text-sm text-muted-foreground">{type.description}</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
              
              {/* Description */}
              <div>
                <Label htmlFor="description">Description (optional)</Label>
                <Textarea
                  id="description"
                  placeholder="Add any additional notes about your tank setup..."
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  className="mt-1"
                  rows={3}
                />
              </div>
              
              {/* Action Buttons */}
              <div className="flex gap-4 pt-4">
                <Button 
                  type="submit" 
                  disabled={isSubmitting}
                  className="flex-1"
                >
                  {isSubmitting ? 'Creating...' : 'Create Tank'}
                </Button>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => navigate('/tanks')}
                  disabled={isSubmitting}
                  className="flex-1"
                >
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default AddTank;
