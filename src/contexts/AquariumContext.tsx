
import React, { createContext, useContext, useState, useEffect } from 'react';

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
  addTank: (tank: Omit<Tank, 'id' | 'createdAt'>) => void;
  updateTank: (tankId: string, updates: Partial<Tank>) => void;
  deleteTank: (tankId: string) => void;
  addParameters: (tankId: string, parameters: Omit<WaterParameters, 'id'>) => void;
  addEquipment: (tankId: string, equipment: Omit<Equipment, 'id'>) => void;
  addLivestock: (tankId: string, livestock: Omit<Livestock, 'id'>) => void;
  getTank: (tankId: string) => Tank | undefined;
}

const AquariumContext = createContext<AquariumContextType | undefined>(undefined);

export function AquariumProvider({ children }: { children: React.ReactNode }) {
  const [tanks, setTanks] = useState<Tank[]>(() => {
    const saved = localStorage.getItem('aqua-ai-tanks');
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem('aqua-ai-tanks', JSON.stringify(tanks));
  }, [tanks]);

  const addTank = (tankData: Omit<Tank, 'id' | 'createdAt'>) => {
    const newTank: Tank = {
      ...tankData,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
    };
    setTanks(prev => [...prev, newTank]);
  };

  const updateTank = (tankId: string, updates: Partial<Tank>) => {
    setTanks(prev => prev.map(tank => 
      tank.id === tankId ? { ...tank, ...updates } : tank
    ));
  };

  const deleteTank = (tankId: string) => {
    setTanks(prev => prev.filter(tank => tank.id !== tankId));
  };

  const addParameters = (tankId: string, parametersData: Omit<WaterParameters, 'id'>) => {
    const newParameters: WaterParameters = {
      ...parametersData,
      id: Date.now().toString(),
    };
    
    setTanks(prev => prev.map(tank => 
      tank.id === tankId 
        ? { ...tank, parameters: [...tank.parameters, newParameters] }
        : tank
    ));
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
