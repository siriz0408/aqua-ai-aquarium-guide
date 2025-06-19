
import { useState, useEffect } from 'react';
import { useSetupPlans } from '@/hooks/useSetupPlans';
import { useToast } from '@/hooks/use-toast';

export interface PlanManagerState {
  setupPlan: any;
  isEditMode: boolean;
  editingPlanId: string | null;
}

export const usePlanManager = () => {
  const { toast } = useToast();
  const { saveSetupPlan } = useSetupPlans();
  const [planState, setPlanState] = useState<PlanManagerState>({
    setupPlan: null,
    isEditMode: false,
    editingPlanId: null,
  });

  // Check if we should load a saved plan for viewing or editing
  useEffect(() => {
    const viewPlan = sessionStorage.getItem('viewPlan');
    const editPlan = sessionStorage.getItem('editPlan');
    
    if (viewPlan) {
      const savedPlan = JSON.parse(viewPlan);
      // Convert the saved plan format to the display format
      const planForDisplay = {
        tankSize: savedPlan.tank_specs?.size || 'Unknown',
        estimatedGallons: savedPlan.tank_specs?.gallons || 'Unknown',
        equipment: savedPlan.equipment || [],
        compatibleLivestock: savedPlan.compatible_livestock || [],
        timeline: savedPlan.timeline || [],
        totalEstimate: savedPlan.total_estimate || 'N/A',
        monthlyMaintenance: savedPlan.monthly_maintenance || 'N/A',
        recommendations: savedPlan.recommendations || {},
        // Include original data for saving
        tankSpecs: savedPlan.tank_specs,
        budgetTimeline: savedPlan.budget_timeline,
      };
      setPlanState({
        setupPlan: planForDisplay,
        isEditMode: false,
        editingPlanId: null,
      });
      sessionStorage.removeItem('viewPlan');
    }

    if (editPlan) {
      const savedPlan = JSON.parse(editPlan);
      
      const planForDisplay = {
        tankSize: savedPlan.tank_specs?.size || 'Unknown',
        estimatedGallons: savedPlan.tank_specs?.gallons || 'Unknown',
        equipment: savedPlan.equipment || [],
        compatibleLivestock: savedPlan.compatible_livestock || [],
        timeline: savedPlan.timeline || [],
        totalEstimate: savedPlan.total_estimate || 'N/A',
        monthlyMaintenance: savedPlan.monthly_maintenance || 'N/A',
        recommendations: savedPlan.recommendations || {},
        // Include original data for saving
        tankSpecs: savedPlan.tank_specs,
        budgetTimeline: savedPlan.budget_timeline,
        planName: savedPlan.plan_name,
      };
      
      setPlanState({
        setupPlan: planForDisplay,
        isEditMode: true,
        editingPlanId: savedPlan.id,
      });
      sessionStorage.removeItem('editPlan');
    }
  }, []);

  const updatePlan = (updatedPlan: any) => {
    setPlanState(prev => ({
      ...prev,
      setupPlan: updatedPlan,
    }));
    
    if (planState.isEditMode && planState.editingPlanId) {
      // Auto-save when editing an existing plan
      saveEditedPlan(updatedPlan);
    } else {
      toast({
        title: "Plan updated",
        description: "Your changes have been saved locally",
      });
    }
  };

  const saveEditedPlan = async (updatedPlan: any) => {
    if (!planState.editingPlanId || !updatedPlan.planName) return;

    const success = await saveSetupPlan(updatedPlan, updatedPlan.planName, planState.editingPlanId);
    if (success) {
      toast({
        title: "Plan saved",
        description: "Your changes have been saved successfully",
      });
    }
  };

  const setPlan = (plan: any) => {
    setPlanState(prev => ({
      ...prev,
      setupPlan: plan,
    }));
  };

  const resetPlan = () => {
    setPlanState({
      setupPlan: null,
      isEditMode: false,
      editingPlanId: null,
    });
    // Clear wizard localStorage as well
    localStorage.removeItem('planner-wizard-data');
    localStorage.removeItem('planner-wizard-step');
    toast({
      title: "Plan reset",
      description: "Start over with new specifications",
    });
  };

  return {
    planState,
    updatePlan,
    saveEditedPlan,
    setPlan,
    resetPlan,
  };
};
