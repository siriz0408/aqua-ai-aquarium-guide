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
  deleteParameters: (tankId: string, parametersId: string) => Promise<void>;
  loadWaterTestLogs: (tankId: string) => Promise<void>;
  addEquipment: (tankId: string, equipment: Omit<Equipment, 'id'>) => Promise<void>;
  updateEquipment: (tankId: string, equipmentId: string, updates: Partial<Equipment>) => Promise<void>;
  deleteEquipment: (tankId: string, equipmentId: string) => Promise<void>;
  addLivestock: (tankId: string, livestock: Omit<Livestock, 'id'>) => Promise<void>;
  updateLivestock: (tankId: string, livestockId: string, updates: Partial<Livestock>) => Promise<void>;
  deleteLivestock: (tankId: string, livestockId: string) => Promise<void>;
  getTank: (tankId: string) => Tank | undefined;
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
      const supabaseTanks: Tank[] = await Promise.all((aquariums || []).map(async (aquarium) => {
        // Load water test logs for each tank
        const { data: waterTests, error: waterTestError } = await supabase
          .from('water_test_logs')
          .select('*')
          .eq('aquarium_id', aquarium.id)
          .order('test_date', { ascending: false });

        if (waterTestError) {
          console.error('Error loading water tests:', waterTestError);
        }

        // Load equipment for each tank
        const { data: equipmentData, error: equipmentError } = await supabase
          .from('equipment')
          .select('*')
          .eq('aquarium_id', aquarium.id);

        if (equipmentError) {
          console.error('Error loading equipment:', equipmentError);
        }

        // Load livestock for each tank
        const { data: livestockData, error: livestockError } = await supabase
          .from('livestock')
          .select('*')
          .eq('aquarium_id', aquarium.id);

        if (livestockError) {
          console.error('Error loading livestock:', livestockError);
        }

        // Convert water test logs to WaterParameters format
        const parameters: WaterParameters[] = (waterTests || []).map(test => ({
          id: test.id,
          date: test.test_date,
          ph: test.ph || 0,
          salinity: test.salinity || 0,
          temperature: test.temperature || 0,
          ammonia: test.ammonia || 0,
          nitrite: test.nitrite || 0,
          nitrate: test.nitrate || 0,
          kh: test.alkalinity || 0,
          calcium: test.calcium || 0,
          magnesium: test.magnesium || 0,
          aiInsights: test.notes || undefined,
        }));

        // Convert equipment data
        const equipment: Equipment[] = (equipmentData || []).map(eq => ({
          id: eq.id,
          name: eq.name,
          type: eq.type,
          model: eq.model || '',
          imageUrl: eq.image_url || '',
          maintenanceTips: eq.maintenance_tips || '',
          upgradeNotes: eq.upgrade_notes || ''
        }));

        // Convert livestock data
        const livestock: Livestock[] = (livestockData || []).map(ls => ({
          id: ls.id,
          name: ls.name,
          species: ls.species,
          careLevel: ls.care_level,
          compatibility: ls.compatibility || '',
          imageUrl: ls.image_url || '',
          healthNotes: ls.health_notes || ''
        }));

        return {
          id: aquarium.id,
          name: aquarium.name,
          size: `${aquarium.size_gallons || 0} gallons`,
          type: 'Mixed' as const, // Default type for now
          equipment,
          livestock,
          parameters,
          createdAt: aquarium.created_at
        };
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

  const loadWaterTestLogs = async (tankId: string) => {
    if (!user) return;

    try {
      const { data: waterTests, error } = await supabase
        .from('water_test_logs')
        .select('*')
        .eq('aquarium_id', tankId)
        .order('test_date', { ascending: false });

      if (error) throw error;

      // Convert water test logs to WaterParameters format
      const parameters: WaterParameters[] = (waterTests || []).map(test => ({
        id: test.id,
        date: test.test_date,
        ph: test.ph || 0,
        salinity: test.salinity || 0,
        temperature: test.temperature || 0,
        ammonia: test.ammonia || 0,
        nitrite: test.nitrite || 0,
        nitrate: test.nitrate || 0,
        kh: test.alkalinity || 0,
        calcium: test.calcium || 0,
        magnesium: test.magnesium || 0,
        aiInsights: test.notes || undefined,
      }));

      // Update the specific tank with new parameters
      setTanks(prev => prev.map(tank => 
        tank.id === tankId ? { ...tank, parameters } : tank
      ));
    } catch (error: any) {
      console.error('Error loading water test logs:', error);
      toast({
        title: "Error loading test logs",
        description: error.message || "Failed to load water test data",
        variant: "destructive",
      });
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

        // Reload water test logs to refresh the data
        await loadWaterTestLogs(tankId);

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
    } else {
      // Update local state for non-authenticated users
      const newParameters: WaterParameters = {
        ...parametersData,
        id: Date.now().toString(),
      };
      
      setTanks(prev => prev.map(tank => 
        tank.id === tankId 
          ? { ...tank, parameters: [...tank.parameters, newParameters] }
          : tank
      ));

      const updatedTanks = tanks.map(tank => 
        tank.id === tankId 
          ? { ...tank, parameters: [...tank.parameters, newParameters] }
          : tank
      );
      localStorage.setItem('aqua-ai-tanks', JSON.stringify(updatedTanks));
    }
  };

  const deleteParameters = async (tankId: string, parametersId: string) => {
    if (user) {
      // Delete from Supabase
      try {
        const { error } = await supabase
          .from('water_test_logs')
          .delete()
          .eq('id', parametersId);

        if (error) throw error;

        // Reload water test logs to refresh the data
        await loadWaterTestLogs(tankId);

        toast({
          title: "Test result deleted",
          description: "The water test result has been removed.",
        });
      } catch (error: any) {
        console.error('Error deleting test result from Supabase:', error);
        toast({
          title: "Error deleting test result",
          description: error.message || "Failed to delete test result",
          variant: "destructive",
        });
      }
    } else {
      // Update local state for non-authenticated users
      setTanks(prev => prev.map(tank => 
        tank.id === tankId 
          ? { ...tank, parameters: tank.parameters.filter(p => p.id !== parametersId) }
          : tank
      ));

      const updatedTanks = tanks.map(tank => 
        tank.id === tankId 
          ? { ...tank, parameters: tank.parameters.filter(p => p.id !== parametersId) }
          : tank
      );
      localStorage.setItem('aqua-ai-tanks', JSON.stringify(updatedTanks));
    }
  };

  const addEquipment = async (tankId: string, equipmentData: Omit<Equipment, 'id'>) => {
    if (user) {
      try {
        const { data, error } = await supabase
          .from('equipment')
          .insert({
            aquarium_id: tankId,
            name: equipmentData.name,
            type: equipmentData.type,
            model: equipmentData.model,
            image_url: equipmentData.imageUrl,
            maintenance_tips: equipmentData.maintenanceTips,
            upgrade_notes: equipmentData.upgradeNotes
          })
          .select()
          .single();

        if (error) throw error;

        const newEquipment: Equipment = {
          id: data.id,
          name: data.name,
          type: data.type,
          model: data.model || '',
          imageUrl: data.image_url || '',
          maintenanceTips: data.maintenance_tips || '',
          upgradeNotes: data.upgrade_notes || ''
        };

        // Update local state
        setTanks(prev => prev.map(tank => 
          tank.id === tankId 
            ? { ...tank, equipment: [...tank.equipment, newEquipment] }
            : tank
        ));

        toast({
          title: "Equipment added successfully!",
          description: `${equipmentData.name} has been added to your tank.`,
        });
      } catch (error: any) {
        console.error('Error adding equipment:', error);
        toast({
          title: "Error adding equipment",
          description: error.message || "Failed to add equipment",
          variant: "destructive",
        });
      }
    } else {
      // Local storage fallback
      const newEquipment: Equipment = {
        ...equipmentData,
        id: Date.now().toString(),
      };
      
      setTanks(prev => prev.map(tank => 
        tank.id === tankId 
          ? { ...tank, equipment: [...tank.equipment, newEquipment] }
          : tank
      ));

      const updatedTanks = tanks.map(tank => 
        tank.id === tankId 
          ? { ...tank, equipment: [...tank.equipment, newEquipment] }
          : tank
      );
      localStorage.setItem('aqua-ai-tanks', JSON.stringify(updatedTanks));
    }
  };

  const updateEquipment = async (tankId: string, equipmentId: string, updates: Partial<Equipment>) => {
    if (user) {
      try {
        const { error } = await supabase
          .from('equipment')
          .update({
            name: updates.name,
            type: updates.type,
            model: updates.model,
            image_url: updates.imageUrl,
            maintenance_tips: updates.maintenanceTips,
            upgrade_notes: updates.upgradeNotes
          })
          .eq('id', equipmentId);

        if (error) throw error;
      } catch (error: any) {
        console.error('Error updating equipment:', error);
        toast({
          title: "Error updating equipment",
          description: error.message || "Failed to update equipment",
          variant: "destructive",
        });
        return;
      }
    }

    // Update local state
    setTanks(prev => prev.map(tank => 
      tank.id === tankId 
        ? {
            ...tank, 
            equipment: tank.equipment.map(eq => 
              eq.id === equipmentId ? { ...eq, ...updates } : eq
            )
          }
        : tank
    ));

    if (!user) {
      const updatedTanks = tanks.map(tank => 
        tank.id === tankId 
          ? {
              ...tank, 
              equipment: tank.equipment.map(eq => 
                eq.id === equipmentId ? { ...eq, ...updates } : eq
              )
            }
          : tank
      );
      localStorage.setItem('aqua-ai-tanks', JSON.stringify(updatedTanks));
    }
  };

  const deleteEquipment = async (tankId: string, equipmentId: string) => {
    if (user) {
      try {
        const { error } = await supabase
          .from('equipment')
          .delete()
          .eq('id', equipmentId);

        if (error) throw error;
      } catch (error: any) {
        console.error('Error deleting equipment:', error);
        toast({
          title: "Error deleting equipment",
          description: error.message || "Failed to delete equipment",
          variant: "destructive",
        });
        return;
      }
    }

    // Update local state
    setTanks(prev => prev.map(tank => 
      tank.id === tankId 
        ? { ...tank, equipment: tank.equipment.filter(eq => eq.id !== equipmentId) }
        : tank
    ));

    if (!user) {
      const updatedTanks = tanks.map(tank => 
        tank.id === tankId 
          ? { ...tank, equipment: tank.equipment.filter(eq => eq.id !== equipmentId) }
          : tank
      );
      localStorage.setItem('aqua-ai-tanks', JSON.stringify(updatedTanks));
    }
  };

  const addLivestock = async (tankId: string, livestockData: Omit<Livestock, 'id'>) => {
    if (user) {
      try {
        const { data, error } = await supabase
          .from('livestock')
          .insert({
            aquarium_id: tankId,
            name: livestockData.name,
            species: livestockData.species,
            care_level: livestockData.careLevel,
            compatibility: livestockData.compatibility,
            image_url: livestockData.imageUrl,
            health_notes: livestockData.healthNotes
          })
          .select()
          .single();

        if (error) throw error;

        const newLivestock: Livestock = {
          id: data.id,
          name: data.name,
          species: data.species,
          careLevel: data.care_level,
          compatibility: data.compatibility || '',
          imageUrl: data.image_url || '',
          healthNotes: data.health_notes || ''
        };

        // Update local state
        setTanks(prev => prev.map(tank => 
          tank.id === tankId 
            ? { ...tank, livestock: [...tank.livestock, newLivestock] }
            : tank
        ));

        toast({
          title: "Livestock added successfully!",
          description: `${livestockData.name} has been added to your tank.`,
        });
      } catch (error: any) {
        console.error('Error adding livestock:', error);
        toast({
          title: "Error adding livestock",
          description: error.message || "Failed to add livestock",
          variant: "destructive",
        });
      }
    } else {
      // Local storage fallback
      const newLivestock: Livestock = {
        ...livestockData,
        id: Date.now().toString(),
      };
      
      setTanks(prev => prev.map(tank => 
        tank.id === tankId 
          ? { ...tank, livestock: [...tank.livestock, newLivestock] }
          : tank
      ));

      const updatedTanks = tanks.map(tank => 
        tank.id === tankId 
          ? { ...tank, livestock: [...tank.livestock, newLivestock] }
          : tank
      );
      localStorage.setItem('aqua-ai-tanks', JSON.stringify(updatedTanks));
    }
  };

  const updateLivestock = async (tankId: string, livestockId: string, updates: Partial<Livestock>) => {
    if (user) {
      try {
        const { error } = await supabase
          .from('livestock')
          .update({
            name: updates.name,
            species: updates.species,
            care_level: updates.careLevel,
            compatibility: updates.compatibility,
            image_url: updates.imageUrl,
            health_notes: updates.healthNotes
          })
          .eq('id', livestockId);

        if (error) throw error;
      } catch (error: any) {
        console.error('Error updating livestock:', error);
        toast({
          title: "Error updating livestock",
          description: error.message || "Failed to update livestock",
          variant: "destructive",
        });
        return;
      }
    }

    // Update local state
    setTanks(prev => prev.map(tank => 
      tank.id === tankId 
        ? {
            ...tank, 
            livestock: tank.livestock.map(ls => 
              ls.id === livestockId ? { ...ls, ...updates } : ls
            )
          }
        : tank
    ));

    if (!user) {
      const updatedTanks = tanks.map(tank => 
        tank.id === tankId 
          ? {
              ...tank, 
              livestock: tank.livestock.map(ls => 
                ls.id === livestockId ? { ...ls, ...updates } : ls
              )
            }
          : tank
      );
      localStorage.setItem('aqua-ai-tanks', JSON.stringify(updatedTanks));
    }
  };

  const deleteLivestock = async (tankId: string, livestockId: string) => {
    if (user) {
      try {
        const { error } = await supabase
          .from('livestock')
          .delete()
          .eq('id', livestockId);

        if (error) throw error;
      } catch (error: any) {
        console.error('Error deleting livestock:', error);
        toast({
          title: "Error deleting livestock",
          description: error.message || "Failed to delete livestock",
          variant: "destructive",
        });
        return;
      }
    }

    // Update local state
    setTanks(prev => prev.map(tank => 
      tank.id === tankId 
        ? { ...tank, livestock: tank.livestock.filter(ls => ls.id !== livestockId) }
        : tank
    ));

    if (!user) {
      const updatedTanks = tanks.map(tank => 
        tank.id === tankId 
          ? { ...tank, livestock: tank.livestock.filter(ls => ls.id !== livestockId) }
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
      deleteParameters,
      loadWaterTestLogs,
      addEquipment,
      updateEquipment,
      deleteEquipment,
      addLivestock,
      updateLivestock,
      deleteLivestock,
      getTank,
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
