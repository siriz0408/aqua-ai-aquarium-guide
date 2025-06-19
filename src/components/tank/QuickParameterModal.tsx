
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { useAquarium } from '@/contexts/AquariumContext';
import { Loader2, TestTube2 } from 'lucide-react';

interface QuickParameterModalProps {
  tankId: string;
  tankName: string;
  isOpen: boolean;
  onClose: () => void;
}

export const QuickParameterModal: React.FC<QuickParameterModalProps> = ({
  tankId,
  tankName,
  isOpen,
  onClose,
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [parameters, setParameters] = useState({
    ph: '',
    ammonia: '',
    nitrite: '',
    nitrate: '',
  });
  
  const { addWaterTest } = useAquarium();
  const { toast } = useToast();

  const handleInputChange = (field: string, value: string) => {
    // Allow empty string, numbers, and single decimal point
    if (value === '' || /^\d*\.?\d*$/.test(value)) {
      setParameters(prev => ({
        ...prev,
        [field]: value
      }));
    }
  };

  const handleSave = async () => {
    // Check if at least one parameter is filled
    const hasData = Object.values(parameters).some(value => value !== '');
    
    if (!hasData) {
      toast({
        title: "No data entered",
        description: "Please enter at least one parameter value.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    
    try {
      const testData = {
        aquarium_id: tankId,
        test_date: new Date().toISOString().split('T')[0],
        ph: parameters.ph ? parseFloat(parameters.ph) : null,
        ammonia: parameters.ammonia ? parseFloat(parameters.ammonia) : null,
        nitrite: parameters.nitrite ? parseFloat(parameters.nitrite) : null,
        nitrate: parameters.nitrate ? parseFloat(parameters.nitrate) : null,
        // Set other parameters to null for quick logging
        temperature: null,
        salinity: null,
        alkalinity: null,
        calcium: null,
        magnesium: null,
        phosphate: null,
        notes: 'Quick log entry',
      };

      await addWaterTest(testData);
      
      toast({
        title: "Parameters logged",
        description: `Water test results saved for ${tankName}`,
      });
      
      // Reset form and close modal
      setParameters({
        ph: '',
        ammonia: '',
        nitrite: '',
        nitrate: '',
      });
      onClose();
      
    } catch (error) {
      console.error('Error saving parameters:', error);
      toast({
        title: "Error",
        description: "Failed to save parameters. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setParameters({
      ph: '',
      ammonia: '',
      nitrite: '',
      nitrate: '',
    });
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <TestTube2 className="h-5 w-5" />
            Quick Parameter Log
          </DialogTitle>
          <DialogDescription>
            Log essential water parameters for {tankName}
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="ph">pH</Label>
              <Input
                id="ph"
                type="number"
                inputMode="decimal"
                step="0.1"
                min="0"
                max="14"
                placeholder="8.2"
                value={parameters.ph}
                onChange={(e) => handleInputChange('ph', e.target.value)}
                className="text-center"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="ammonia">Ammonia (ppm)</Label>
              <Input
                id="ammonia"
                type="number"
                inputMode="decimal"
                step="0.01"
                min="0"
                placeholder="0.00"
                value={parameters.ammonia}
                onChange={(e) => handleInputChange('ammonia', e.target.value)}
                className="text-center"
              />
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="nitrite">Nitrite (ppm)</Label>
              <Input
                id="nitrite"
                type="number"
                inputMode="decimal"
                step="0.01"
                min="0"
                placeholder="0.00"
                value={parameters.nitrite}
                onChange={(e) => handleInputChange('nitrite', e.target.value)}
                className="text-center"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="nitrate">Nitrate (ppm)</Label>
              <Input
                id="nitrate"
                type="number"
                inputMode="decimal"
                step="0.1"
                min="0"
                placeholder="5.0"
                value={parameters.nitrate}
                onChange={(e) => handleInputChange('nitrate', e.target.value)}
                className="text-center"
              />
            </div>
          </div>
        </div>
        
        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={handleClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={isLoading} className="gap-2">
            {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
            Save Parameters
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
