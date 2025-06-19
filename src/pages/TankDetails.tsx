
import React from 'react';
import { Layout } from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, Edit } from 'lucide-react';
import { useTankDetails } from '@/hooks/useTankDetails';
import TankInfoCard from '@/components/tank/TankInfoCard';
import TankParametersTab from '@/components/tank/TankParametersTab';
import TankEquipmentTab from '@/components/tank/TankEquipmentTab';
import TankLivestockTab from '@/components/tank/TankLivestockTab';
import TankRemindersTab from '@/components/tank/TankRemindersTab';
import { HealthIndicator } from '@/components/tank/HealthIndicator';

const TankDetails = () => {
  const {
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
  } = useTankDetails();

  if (!tank) {
    return (
      <Layout title="Tank Not Found" showBackButton>
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold mb-4">Tank not found</h2>
          <Button onClick={() => navigate('/')} className="min-h-[48px]">Go Home</Button>
        </div>
      </Layout>
    );
  }

  return (
    <Layout 
      title={tank.name} 
      showBackButton
      actions={
        <div className="flex gap-2">
          <Button 
            variant="outline"
            size="sm" 
            onClick={() => navigate(`/tank/${tankId}/edit`)}
            className="gap-1 min-h-[48px]"
          >
            <Edit className="h-3 w-3" />
            Edit
          </Button>
          <Button 
            size="sm" 
            onClick={() => navigate(`/tank/${tankId}/log-parameters`)}
            className="ocean-gradient text-white gap-1 min-h-[48px]"
          >
            <Plus className="h-3 w-3" />
            Log Test
          </Button>
        </div>
      }
    >
      <div className="space-y-6 pb-20">
        {/* Tank Info */}
        <TankInfoCard tank={tank} />

        {/* Health Indicator */}
        <HealthIndicator tank={tank} showDetails />

        {/* Tabs */}
        <Tabs defaultValue="parameters" className="w-full">
          <TabsList className="grid w-full grid-cols-4 min-h-[48px]">
            <TabsTrigger value="parameters" className="min-h-[44px] touch-manipulation">Parameters</TabsTrigger>
            <TabsTrigger value="equipment" className="min-h-[44px] touch-manipulation">Equipment</TabsTrigger>
            <TabsTrigger value="livestock" className="min-h-[44px] touch-manipulation">Livestock</TabsTrigger>
            <TabsTrigger value="reminders" className="min-h-[44px] touch-manipulation">Reminders</TabsTrigger>
          </TabsList>
          
          <TabsContent value="parameters" className="space-y-4">
            <TankParametersTab
              parameters={tank.parameters}
              onDeleteTest={handleDeleteTest}
              onSendToChat={handleSendToChat}
            />
          </TabsContent>

          <TabsContent value="equipment" className="space-y-4">
            <TankEquipmentTab
              equipment={tank.equipment}
              tankId={tankId!}
              onNavigate={navigate}
              onUpdateEquipment={updateEquipmentLocal}
              onDeleteEquipment={deleteEquipmentLocal}
            />
          </TabsContent>

          <TabsContent value="livestock" className="space-y-4">
            <TankLivestockTab
              livestock={tank.livestock}
              tankId={tankId!}
              onNavigate={navigate}
              onUpdateLivestock={updateLivestockLocal}
              onDeleteLivestock={deleteLivestockLocal}
            />
          </TabsContent>

          <TabsContent value="reminders" className="space-y-4">
            <TankRemindersTab onNavigate={navigate} />
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
};

export default TankDetails;
