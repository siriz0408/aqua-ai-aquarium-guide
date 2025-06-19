
import { useToast } from '@/hooks/use-toast';

export interface WaterParameters {
  ph: string;
  salinity: string;
  temperature: string;
  ammonia: string;
  nitrate: string;
  nitrite: string;
  kh: string;
  calcium: string;
  magnesium: string;
}

export const useWaterParameterValidation = () => {
  const { toast } = useToast();

  const validateParameters = (parameters: WaterParameters): boolean => {
    const requiredFields = ['ph', 'salinity', 'temperature'];
    const missing = requiredFields.filter(field => !parameters[field as keyof typeof parameters]);
    
    if (missing.length > 0) {
      toast({
        title: "Missing required fields",
        description: "Please fill in pH, salinity, and temperature at minimum",
        variant: "destructive",
      });
      return false;
    }

    return true;
  };

  return { validateParameters };
};
