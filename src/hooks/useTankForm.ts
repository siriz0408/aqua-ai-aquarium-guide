
import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useAquarium } from '@/contexts/AquariumContext';

export const useTankForm = () => {
  const { tankId } = useParams<{ tankId: string }>();
  const { getTank } = useAquarium();
  
  const tank = tankId ? getTank(tankId) : undefined;
  const isEditing = !!tankId && !!tank;

  const [formData, setFormData] = useState({
    name: '',
    size: '',
    type: 'FOWLR' as 'FOWLR' | 'Reef' | 'Mixed',
    length: '',
    width: '',
    height: '',
    gallons: '',
    location: '',
    lighting: '',
    filtration: '',
    heatingCooling: '',
    notes: '',
    selectedSize: ''
  });

  const [equipment, setEquipment] = useState<any[]>([]);
  const [livestock, setLivestock] = useState<any[]>([]);
  const [showCustomSize, setShowCustomSize] = useState(false);

  useEffect(() => {
    if (tank) {
      setFormData({
        name: tank.name,
        size: tank.size,
        type: tank.type,
        length: '',
        width: '',
        height: '',
        gallons: '',
        location: '',
        lighting: '',
        filtration: '',
        heatingCooling: '',
        notes: '',
        selectedSize: ''
      });
      setEquipment(tank.equipment || []);
      setLivestock(tank.livestock || []);
    }
  }, [tank]);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return {
    formData,
    equipment,
    livestock,
    showCustomSize,
    isEditing,
    tank,
    tankId,
    setFormData,
    setEquipment,
    setLivestock,
    setShowCustomSize,
    handleInputChange
  };
};
