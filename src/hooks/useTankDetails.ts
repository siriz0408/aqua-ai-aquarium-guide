
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAquarium, WaterParameters } from '@/contexts/AquariumContext';
import { useToast } from '@/hooks/use-toast';

export const useTankDetails = () => {
  const { tankId } = useParams<{ tankId: string }>();
  const navigate = useNavigate();
  const { getTank, updateTank, deleteParameters, loadWaterTestLogs, updateEquipment, deleteEquipment, updateLivestock, deleteLivestock } = useAquarium();
  const { toast } = useToast();
  
  const tank = tankId ? getTank(tankId) : undefined;
  const [livestock, setLivestock] = useState(tank?.livestock || []);
  const [equipment, setEquipment] = useState(tank?.equipment || []);

  // Load water test logs when component mounts
  useEffect(() => {
    if (tankId) {
      loadWaterTestLogs(tankId);
    }
  }, [tankId, loadWaterTestLogs]);

  // Update local state when tank data changes
  useEffect(() => {
    if (tank) {
      setLivestock(tank.livestock);
      setEquipment(tank.equipment);
    }
  }, [tank]);

  const handleDeleteTest = async (testId: string) => {
    try {
      await deleteParameters(tankId!, testId);
    } catch (error) {
      console.error('Error deleting test:', error);
    }
  };

  const handleSendToChat = (test: WaterParameters) => {
    // Navigate to chat with test data
    const testData = {
      date: test.date,
      parameters: {
        ph: test.ph,
        salinity: test.salinity,
        temperature: test.temperature,
        ammonia: test.ammonia,
        nitrite: test.nitrite,
        nitrate: test.nitrate,
        kh: test.kh,
        calcium: test.calcium,
        magnesium: test.magnesium
      },
      tankName: tank?.name
    };
    
    const message = `Please analyze my water test results from ${new Date(test.date).toLocaleDateString()} for my ${tank?.name} tank:\n\n${JSON.stringify(testData.parameters, null, 2)}\n\nPlease provide detailed analysis, highlight any issues, and suggest actions if needed.`;
    
    // Store the message in sessionStorage to be picked up by the chat page
    sessionStorage.setItem('chatMessage', message);
    navigate('/aqua-bot');
  };

  const updateLivestockLocal = async (id: string, updates: any) => {
    await updateLivestock(tankId!, id, updates);
    
    toast({
      title: "Livestock updated",
      description: "Changes saved successfully.",
    });
  };

  const deleteLivestockLocal = async (id: string) => {
    await deleteLivestock(tankId!, id);
    
    toast({
      title: "Livestock removed",
      description: "Item removed from your tank.",
    });
  };

  const updateEquipmentLocal = async (id: string, updates: any) => {
    await updateEquipment(tankId!, id, updates);
    
    toast({
      title: "Equipment updated",
      description: "Changes saved successfully.",
    });
  };

  const deleteEquipmentLocal = async (id: string) => {
    await deleteEquipment(tankId!, id);
    
    toast({
      title: "Equipment removed",
      description: "Item removed from your tank.",
    });
  };

  return {
    tank,
    tankId,
    livestock,
    equipment,
    navigate,
    handleDeleteTest,
    handleSendToChat,
    updateLivestockLocal,
    deleteLivestockLocal,
    updateEquipmentLocal,
    deleteEquipmentLocal,
  };
};
