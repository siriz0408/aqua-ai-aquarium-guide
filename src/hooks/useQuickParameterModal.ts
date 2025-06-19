
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useAquarium } from '@/contexts/AquariumContext';

interface ParameterState {
  ph: string;
  ammonia: string;
  nitrite: string;
  nitrate: string;
}

export const useQuickParameterModal = (tankId: string, tankName: string, onClose: () => void) => {
  const [isLoading, setIsLoading] = useState(false);
  const [parameters, setParameters] = useState<ParameterState>({
    ph: '',
    ammonia: '',
    nitrite: '',
    nitrate: '',
  });
  
  const { addParameters } = useAquarium();
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
        date: new Date().toISOString(),
        ph: parameters.ph ? parseFloat(parameters.ph) : 0,
        ammonia: parameters.ammonia ? parseFloat(parameters.ammonia) : 0,
        nitrite: parameters.nitrite ? parseFloat(parameters.nitrite) : 0,
        nitrate: parameters.nitrate ? parseFloat(parameters.nitrate) : 0,
        // Set other required parameters to 0 for quick logging
        salinity: 0,
        temperature: 0,
        kh: 0,
        calcium: 0,
        magnesium: 0,
        aiInsights: 'Quick log entry',
      };

      await addParameters(tankId, testData);
      
      toast({
        title: "Parameters logged",
        description: `Water test results saved for ${tankName}`,
      });
      
      // Reset form and close modal
      resetForm();
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

  const resetForm = () => {
    setParameters({
      ph: '',
      ammonia: '',
      nitrite: '',
      nitrate: '',
    });
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  return {
    isLoading,
    parameters,
    handleInputChange,
    handleSave,
    handleClose,
  };
};
