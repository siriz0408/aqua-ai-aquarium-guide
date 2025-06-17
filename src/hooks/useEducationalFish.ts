
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

export interface EducationalFish {
  id: string;
  name: string;
  scientific_name?: string;
  category: string;
  summary?: string;
  care_level: 'Beginner' | 'Intermediate' | 'Advanced';
  diet_type?: 'Herbivore' | 'Carnivore' | 'Omnivore';
  food_details?: string;
  tank_size_minimum?: number;
  water_temperature_range?: string;
  ph_range?: string;
  compatibility_notes?: string;
  similar_species?: string[];
  image_url?: string;
  image_gallery?: string[];
  reef_safe?: boolean;
  created_at: string;
  updated_at: string;
}

export interface UserFishList {
  id: string;
  user_id: string;
  fish_id: string;
  list_type: 'wishlist' | 'owned' | 'planning';
  notes?: string;
  added_at: string;
  educational_fish?: EducationalFish;
}

export const useEducationalFish = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch all educational fish
  const { data: fish = [], isLoading: fishLoading, error: fishError } = useQuery({
    queryKey: ['educational_fish'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('educational_fish')
        .select('*')
        .order('name');

      if (error) {
        console.error('Error fetching educational fish:', error);
        throw error;
      }

      return data as EducationalFish[];
    },
  });

  // Fetch user's fish lists
  const { data: userFishLists = [], isLoading: userListsLoading } = useQuery({
    queryKey: ['user_fish_lists'],
    queryFn: async () => {
      if (!user) return [];
      
      const { data, error } = await supabase
        .from('user_fish_lists')
        .select(`
          *,
          educational_fish (*)
        `)
        .order('added_at', { ascending: false });

      if (error) {
        console.error('Error fetching user fish lists:', error);
        return [];
      }

      return data as UserFishList[];
    },
    enabled: !!user,
  });

  // Add fish to user list
  const addToListMutation = useMutation({
    mutationFn: async ({ fishId, listType, notes }: { fishId: string; listType: string; notes?: string }) => {
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('user_fish_lists')
        .insert({
          user_id: user.id,
          fish_id: fishId,
          list_type: listType,
          notes: notes,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['user_fish_lists'] });
      toast({
        title: "Fish added to list",
        description: `Added to your ${variables.listType} successfully.`,
      });
    },
    onError: (error) => {
      console.error('Error adding fish to list:', error);
      toast({
        title: "Error",
        description: "Failed to add fish to list. It might already be in this list.",
        variant: "destructive",
      });
    },
  });

  // Remove fish from user list
  const removeFromListMutation = useMutation({
    mutationFn: async ({ fishId, listType }: { fishId: string; listType: string }) => {
      if (!user) throw new Error('User not authenticated');

      const { error } = await supabase
        .from('user_fish_lists')
        .delete()
        .eq('user_id', user.id)
        .eq('fish_id', fishId)
        .eq('list_type', listType);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user_fish_lists'] });
      toast({
        title: "Fish removed",
        description: "Fish removed from your list successfully.",
      });
    },
    onError: (error) => {
      console.error('Error removing fish from list:', error);
      toast({
        title: "Error",
        description: "Failed to remove fish from list.",
        variant: "destructive",
      });
    },
  });

  // Get fish by category
  const getFishByCategory = (category: string) => {
    return fish.filter(f => f.category.toLowerCase() === category.toLowerCase());
  };

  // Get user's fish by list type
  const getUserFishByType = (listType: string) => {
    return userFishLists.filter(item => item.list_type === listType);
  };

  // Check if fish is in user's list
  const isInList = (fishId: string, listType: string) => {
    return userFishLists.some(item => item.fish_id === fishId && item.list_type === listType);
  };

  return {
    fish,
    userFishLists,
    fishLoading,
    userListsLoading,
    fishError,
    addToList: addToListMutation.mutate,
    removeFromList: removeFromListMutation.mutate,
    isAddingToList: addToListMutation.isPending,
    isRemovingFromList: removeFromListMutation.isPending,
    getFishByCategory,
    getUserFishByType,
    isInList,
  };
};
