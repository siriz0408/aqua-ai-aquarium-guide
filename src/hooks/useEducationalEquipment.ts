
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

export interface EducationalEquipment {
  id: string;
  name: string;
  category: string;
  summary: string; // Changed from optional to required
  difficulty_level: 'Easy' | 'Moderate' | 'Advanced';
  recommended_tank_sizes?: string[];
  installation_notes?: string;
  maintenance_frequency?: string;
  compatibility_equipment?: string[];
  price_range?: string;
  image_url?: string;
  image_gallery?: string[];
  specifications?: any;
  created_at: string;
  updated_at: string;
}

export interface UserEquipmentList {
  id: string;
  user_id: string;
  equipment_id: string;
  list_type: 'wishlist' | 'owned' | 'planning';
  notes?: string;
  added_at: string;
  educational_equipment?: EducationalEquipment;
}

export const useEducationalEquipment = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch all educational equipment
  const { data: equipment = [], isLoading: equipmentLoading, error: equipmentError } = useQuery({
    queryKey: ['educational_equipment'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('educational_equipment')
        .select('*')
        .order('name');

      if (error) {
        console.error('Error fetching educational equipment:', error);
        throw error;
      }

      return data as EducationalEquipment[];
    },
  });

  // Fetch user's equipment lists
  const { data: userEquipmentLists = [], isLoading: userListsLoading } = useQuery({
    queryKey: ['user_equipment_lists'],
    queryFn: async () => {
      if (!user) return [];
      
      const { data, error } = await supabase
        .from('user_equipment_lists')
        .select(`
          *,
          educational_equipment (*)
        `)
        .order('added_at', { ascending: false });

      if (error) {
        console.error('Error fetching user equipment lists:', error);
        return [];
      }

      return data as UserEquipmentList[];
    },
    enabled: !!user,
  });

  // Add equipment to user list
  const addToListMutation = useMutation({
    mutationFn: async ({ equipmentId, listType, notes }: { equipmentId: string; listType: string; notes?: string }) => {
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('user_equipment_lists')
        .insert({
          user_id: user.id,
          equipment_id: equipmentId,
          list_type: listType,
          notes: notes,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['user_equipment_lists'] });
      toast({
        title: "Equipment added to list",
        description: `Added to your ${variables.listType} successfully.`,
      });
    },
    onError: (error) => {
      console.error('Error adding equipment to list:', error);
      toast({
        title: "Error",
        description: "Failed to add equipment to list. It might already be in this list.",
        variant: "destructive",
      });
    },
  });

  // Remove equipment from user list
  const removeFromListMutation = useMutation({
    mutationFn: async ({ equipmentId, listType }: { equipmentId: string; listType: string }) => {
      if (!user) throw new Error('User not authenticated');

      const { error } = await supabase
        .from('user_equipment_lists')
        .delete()
        .eq('user_id', user.id)
        .eq('equipment_id', equipmentId)
        .eq('list_type', listType);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user_equipment_lists'] });
      toast({
        title: "Equipment removed",
        description: "Equipment removed from your list successfully.",
      });
    },
    onError: (error) => {
      console.error('Error removing equipment from list:', error);
      toast({
        title: "Error",
        description: "Failed to remove equipment from list.",
        variant: "destructive",
      });
    },
  });

  // Get equipment by category
  const getEquipmentByCategory = (category: string) => {
    return equipment.filter(e => e.category.toLowerCase() === category.toLowerCase());
  };

  // Get user's equipment by list type
  const getUserEquipmentByType = (listType: string) => {
    return userEquipmentLists.filter(item => item.list_type === listType);
  };

  // Check if equipment is in user's list
  const isInList = (equipmentId: string, listType: string) => {
    return userEquipmentLists.some(item => item.equipment_id === equipmentId && item.list_type === listType);
  };

  return {
    equipment,
    userEquipmentLists,
    equipmentLoading,
    userListsLoading,
    equipmentError,
    addToList: addToListMutation.mutate,
    removeFromList: removeFromListMutation.mutate,
    isAddingToList: addToListMutation.isPending,
    isRemovingFromList: removeFromListMutation.isPending,
    getEquipmentByCategory,
    getUserEquipmentByType,
    isInList,
  };
};
