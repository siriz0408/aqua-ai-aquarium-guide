
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

interface SetupPlan {
  id?: string;
  plan_name: string;
  tank_specs: any;
  budget_timeline: any;
  equipment: any;
  compatible_livestock: any;
  timeline: any;
  total_estimate?: string;
  monthly_maintenance?: string;
  recommendations?: any;
}

export const useSetupPlans = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [plans, setPlans] = useState<any[]>([]);
  const { user } = useAuth();
  const { toast } = useToast();

  // Load plans when user changes
  useEffect(() => {
    if (user) {
      loadPlans();
    } else {
      setPlans([]);
    }
  }, [user]);

  const loadPlans = async () => {
    if (!user) return;

    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('setup_plans')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPlans(data || []);
    } catch (error: any) {
      console.error('Error fetching setup plans:', error);
      toast({
        title: "Error loading plans",
        description: error.message || "Failed to load setup plans",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const saveSetupPlan = async (setupPlan: any, planName: string, planId?: string) => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please sign in to save your setup plan",
        variant: "destructive",
      });
      return null;
    }

    setIsLoading(true);
    
    try {
      const planData: SetupPlan = {
        plan_name: planName,
        tank_specs: setupPlan.tankSpecs || {},
        budget_timeline: setupPlan.budgetTimeline || {},
        equipment: setupPlan.equipment || [],
        compatible_livestock: setupPlan.compatibleLivestock || [],
        timeline: setupPlan.timeline || [],
        total_estimate: setupPlan.totalEstimate,
        monthly_maintenance: setupPlan.monthlyMaintenance,
        recommendations: setupPlan.recommendations || {},
      };

      let data, error;

      if (planId) {
        // Update existing plan
        const result = await supabase
          .from('setup_plans')
          .update(planData)
          .eq('id', planId)
          .eq('user_id', user.id)
          .select()
          .single();
        
        data = result.data;
        error = result.error;

        if (!error) {
          toast({
            title: "Setup plan updated!",
            description: `Your plan "${planName}" has been updated successfully`,
          });
          // Reload plans to get updated data
          loadPlans();
        }
      } else {
        // Create new plan
        const result = await supabase
          .from('setup_plans')
          .insert([{
            ...planData,
            user_id: user.id,
          }])
          .select()
          .single();

        data = result.data;
        error = result.error;

        if (!error) {
          toast({
            title: "Setup plan saved!",
            description: `Your plan "${planName}" has been saved successfully`,
          });
          // Reload plans to include new plan
          loadPlans();
        }
      }

      if (error) throw error;
      return data;
    } catch (error: any) {
      console.error('Error saving setup plan:', error);
      toast({
        title: "Error saving plan",
        description: error.message || "Failed to save setup plan",
        variant: "destructive",
      });
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const getUserSetupPlans = async () => {
    if (!user) return [];

    setIsLoading(true);
    
    try {
      const { data, error } = await supabase
        .from('setup_plans')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      const planData = data || [];
      setPlans(planData);
      return planData;
    } catch (error: any) {
      console.error('Error fetching setup plans:', error);
      toast({
        title: "Error loading plans",
        description: error.message || "Failed to load setup plans",
        variant: "destructive",
      });
      return [];
    } finally {
      setIsLoading(false);
    }
  };

  const deleteSetupPlan = async (planId: string) => {
    if (!user) return false;

    setIsLoading(true);
    
    try {
      const { error } = await supabase
        .from('setup_plans')
        .delete()
        .eq('id', planId)
        .eq('user_id', user.id);

      if (error) throw error;

      toast({
        title: "Plan deleted",
        description: "Setup plan has been deleted successfully",
      });

      // Reload plans to remove deleted plan
      loadPlans();
      return true;
    } catch (error: any) {
      console.error('Error deleting setup plan:', error);
      toast({
        title: "Error deleting plan",
        description: error.message || "Failed to delete setup plan",
        variant: "destructive",
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    plans,
    saveSetupPlan,
    getUserSetupPlans,
    deleteSetupPlan,
    isLoading,
  };
};
