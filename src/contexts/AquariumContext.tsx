import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

export interface WaterParameters {
  id: string;
  date: string;
  ph: number;
  salinity: number;
  temperature: number;
  ammonia: number;
  nitrate: number;
  nitrite: number;
  kh: number;
  calcium: number;
  magnesium: number;
  aiInsights?: string;
}

export interface Equipment {
  id: string;
  name: string;
  type: string;
  model?: string;
  imageUrl?: string;
  maintenanceTips?: string;
  upgradeNotes?: string;
}

export interface Livestock {
  id: string;
  name: string;
  species: string;
  careLevel: string;
  compatibility: string;
  imageUrl?: string;
  healthNotes?: string;
}

export interface Tank {
  id: string;
  name: string;
  size: string;
  type: 'FOWLR' | 'Reef' | 'Mixed';
  equipment: Equipment[];
  livestock: Livestock[];
  parameters: WaterParameters[];
  createdAt: string;
}

interface AquariumContextType {
  tanks: Tank[];
  addTank: (tank: Omit<Tank, 'id' | 'createdAt'>) => Promise<void>;
  updateTank: (tankId: string, updates: Partial<Tank>) => Promise<void>;
  deleteTank: (tankId: string) => Promise<void>;
  addParameters: (tankId: string, parameters: Omit<WaterParameters, 'id'>) => Promise<void>;
  addEquipment: (tankId: string, equipment: Omit<Equipment, 'id'>) => void;
  addLivestock: (tankId: string, livestock: Omit<Livestock, 'id'>) => void;
  getTank: (tankId: string) => Tank | undefined;
  fetchWaterTestLogs: (tankId: string) => Promise<WaterParameters[]>;
  isLoading: boolean;
}

const AquariumContext = createContext<AquariumContextType | undefined>(undefined);

export function AquariumProvider({ children }: { children: React.ReactNode }) {
  const [tanks, setTanks] = useState<Tank[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();

  // Load tanks from Supabase when user is authenticated
  useEffect(() => {
    if (user) {
      loadTanksFromSupabase();
    } else {
      // Load from localStorage if not authenticated
      loadTanksFromLocal();
    }
  }, [user]);

  const loadTanksFromLocal = () => {
    try {
      const saved = localStorage.getItem('aqua-ai-tanks');
      const localTanks = saved ? JSON.parse(saved) : [];
      setTanks(localTanks);
    } catch (error) {
      console.error('Error loading local tanks:', error);
      setTanks([]);
    } finally {
      setIsLoading(false);
    }
  };

  const loadTanksFromSupabase = async () => {
    if (!user) return;

    setIsLoading(true);
    try {
      const { data: aquariums, error } = await supabase
        .from('aquariums')
        .select('*')
        .eq('user_id', user.id);

      if (error) throw error;

      // Convert Supabase data to Tank format
      const supabaseTanks: Tank[] = (aquariums || []).map(aquarium => ({
        id: aquarium.id,
        name: aquarium.name,
        size: `${aquarium.size_gallons || 0} gallons`,
        type: 'Mixed' as const, // Default type for now
        equipment: [],
        livestock: [],
        parameters: [],
        createdAt: aquarium.created_at
      }));

      setTanks(supabaseTanks);
    } catch (error: any) {
      console.error('Error loading tanks from Supabase:', error);
      toast({
        title: "Error loading tanks",
        description: error.message || "Failed to load tank data",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const fetchWaterTestLogs = async (tankId: string): Promise<WaterParameters[]> => {
    if (!user) {
      // For non-authenticated users, return the parameters from local state
      const tank = tanks.find(t => t.id === tankId);
      return tank?.parameters || [];
    }

    try {
      const { data, error } = await supabase
        .from('water_test_logs')
        .select('*')
        .eq('aquarium_id', tankId)
        .order('test_date', { ascending: false });

      if (error) throw error;

      // Transform the data to match the WaterParameters interface
      const transformedData: WaterParameters[] = (data || []).map(log => ({
        id: log.id,
        date: log.test_date,
        ph: log.ph || 0,
        salinity: log.salinity || 0,
        temperature: log.temperature || 0,
        ammonia: log.ammonia || 0,
        nitrite: log.nitrite || 0,
        nitrate: log.nitrate || 0,
        kh: log.alkalinity || 0,
        calcium: log.calcium || 0,
        magnesium: log.magnesium || 0,
        aiInsights: log.notes || '',
      }));

      return transformedData;
    } catch (error) {
      console.error('Error fetching water test logs:', error);
      return [];
    }
  };

  const addTank = async (tankData: Omit<Tank, 'id' | 'createdAt'>) => {
    if (user) {
      // Save to Supabase
      try {
        const sizeMatch = tankData.size.match(/(\d+)/);
        const sizeGallons = sizeMatch ? parseInt(sizeMatch[1]) : null;

        const { data, error } = await supabase
          .from('aquariums')
          .insert({
            user_id: user.id,
            name: tankData.name,
            size_gallons: sizeGallons,
          })
          .select()
          .single();

        if (error) throw error;

        const newTank: Tank = {
          id: data.id,
          name: data.name,
          size: `${data.size_gallons || 0} gallons`,
          type: tankData.type,
          equipment: tankData.equipment,
          livestock: tankData.livestock,
          parameters: tankData.parameters,
          createdAt: data.created_at,
        };

        setTanks(prev => [...prev, newTank]);

        toast({
          title: "Tank created successfully!",
          description: `${newTank.name} has been added to your tanks.`
        });
      } catch (error: any) {
        console.error('Error adding tank to Supabase:', error);
        toast({
          title: "Error creating tank",
          description: error.message || "Failed to create tank",
          variant: "destructive",
        });
      }
    } else {
      // Save to localStorage
      const newTank: Tank = {
        ...tankData,
        id: Date.now().toString(),
        createdAt: new Date().toISOString(),
      };
      const updatedTanks = [...tanks, newTank];
      setTanks(updatedTanks);
      localStorage.setItem('aqua-ai-tanks', JSON.stringify(updatedTanks));
    }
  };

  const updateTank = async (tankId: string, updates: Partial<Tank>) => {
    if (user) {
      // Update in Supabase
      try {
        const { error } = await supabase
          .from('aquariums')
          .update({
            name: updates.name,
            // Add other fields as needed
          })
          .eq('id', tankId);

        if (error) throw error;
      } catch (error: any) {
        console.error('Error updating tank in Supabase:', error);
        toast({
          title: "Error updating tank",
          description: error.message || "Failed to update tank",
          variant: "destructive",
        });
        return;
      }
    }

    // Update local state
    setTanks(prev => prev.map(tank => 
      tank.id === tankId ? { ...tank, ...updates } : tank
    ));

    if (!user) {
      // Update localStorage
      const updatedTanks = tanks.map(tank => 
        tank.id === tankId ? { ...tank, ...updates } : tank
      );
      localStorage.setItem('aqua-ai-tanks', JSON.stringify(updatedTanks));
    }
  };

  const deleteTank = async (tankId: string) => {
    if (user) {
      // Delete from Supabase database
      try {
        // First delete related water test logs
        const { error: waterTestError } = await supabase
          .from('water_test_logs')
          .delete()
          .eq('aquarium_id', tankId);

        if (waterTestError) {
          console.error('Error deleting water test logs:', waterTestError);
          // Continue with tank deletion even if water test logs fail
        }

        // Then delete the tank
        const { error: tankError } = await supabase
          .from('aquariums')
          .delete()
          .eq('id', tankId);

        if (tankError) throw tankError;

        toast({
          title: "Tank deleted successfully",
          description: "The tank and all its data have been permanently removed.",
        });
      } catch (error: any) {
        console.error('Error deleting tank from Supabase:', error);
        toast({
          title: "Error deleting tank",
          description: error.message || "Failed to delete tank from database",
          variant: "destructive",
        });
        return; // Don't update local state if database deletion failed
      }
    }

    // Update local state
    setTanks(prev => prev.filter(tank => tank.id !== tankId));
    
    if (!user) {
      // Update localStorage for non-authenticated users
      const updatedTanks = tanks.filter(tank => tank.id !== tankId);
      localStorage.setItem('aqua-ai-tanks', JSON.stringify(updatedTanks));
    }
  };

  const addParameters = async (tankId: string, parametersData: Omit<WaterParameters, 'id'>) => {
    if (user) {
      // Save to Supabase water_test_logs
      try {
        const { error } = await supabase
          .from('water_test_logs')
          .insert({
            aquarium_id: tankId,
            test_date: new Date(parametersData.date).toISOString().split('T')[0],
            ph: parametersData.ph,
            salinity: parametersData.salinity,
            temperature: parametersData.temperature,
            ammonia: parametersData.ammonia,
            nitrite: parametersData.nitrite,
            nitrate: parametersData.nitrate,
            alkalinity: parametersData.kh,
            calcium: parametersData.calcium,
            magnesium: parametersData.magnesium,
            notes: parametersData.aiInsights,
          });

        if (error) throw error;

        toast({
          title: "Test results saved!",
          description: "Your water test has been logged successfully.",
        });
      } catch (error: any) {
        console.error('Error saving test results to Supabase:', error);
        toast({
          title: "Error saving test results",
          description: error.message || "Failed to save test results",
          variant: "destructive",
        });
      }
    }

    // Update local state
    const newParameters: WaterParameters = {
      ...parametersData,
      id: Date.now().toString(),
    };
    
    setTanks(prev => prev.map(tank => 
      tank.id === tankId 
        ? { ...tank, parameters: [...tank.parameters, newParameters] }
        : tank
    ));

    if (!user) {
      const updatedTanks = tanks.map(tank => 
        tank.id === tankId 
          ? { ...tank, parameters: [...tank.parameters, newParameters] }
          : tank
      );
      localStorage.setItem('aqua-ai-tanks', JSON.stringify(updatedTanks));
    }
  };

  const addEquipment = (tankId: string, equipmentData: Omit<Equipment, 'id'>) => {
    const newEquipment: Equipment = {
      ...equipmentData,
      id: Date.now().toString(),
    };
    
    setTanks(prev => prev.map(tank => 
      tank.id === tankId 
        ? { ...tank, equipment: [...tank.equipment, newEquipment] }
        : tank
    ));

    if (!user) {
      const updatedTanks = tanks.map(tank => 
        tank.id === tankId 
          ? { ...tank, equipment: [...tank.equipment, newEquipment] }
          : tank
      );
      localStorage.setItem('aqua-ai-tanks', JSON.stringify(updatedTanks));
    }
  };

  const addLivestock = (tankId: string, livestockData: Omit<Livestock, 'id'>) => {
    const newLivestock: Livestock = {
      ...livestockData,
      id: Date.now().toString(),
    };
    
    setTanks(prev => prev.map(tank => 
      tank.id === tankId 
        ? { ...tank, livestock: [...tank.livestock, newLivestock] }
        : tank
    ));

    if (!user) {
      const updatedTanks = tanks.map(tank => 
        tank.id === tankId 
          ? { ...tank, livestock: [...tank.livestock, newLivestock] }
          : tank
      );
      localStorage.setItem('aqua-ai-tanks', JSON.stringify(updatedTanks));
    }
  };

  const getTank = (tankId: string) => {
    return tanks.find(tank => tank.id === tankId);
  };

  return (
    <AquariumContext.Provider value={{
      tanks,
      addTank,
      updateTank,
      deleteTank,
      addParameters,
      addEquipment,
      addLivestock,
      getTank,
      fetchWaterTestLogs,
      isLoading,
    }}>
      {children}
    </AquariumContext.Provider>
  );
}

export function useAquarium() {
  const context = useContext(AquariumContext);
  if (context === undefined) {
    throw new Error('useAquarium must be used within an AquariumProvider');
  }
  return context;
}
