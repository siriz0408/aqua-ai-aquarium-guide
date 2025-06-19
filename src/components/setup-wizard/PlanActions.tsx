
import React from 'react';
import { Button } from '@/components/ui/button';
import { RotateCcw, Edit } from 'lucide-react';
import SavePlanDialog from '@/components/setup-wizard/SavePlanDialog';

interface PlanActionsProps {
  setupPlan: any;
  isEditMode: boolean;
  onSaveEdited: (plan: any) => void;
  onReset: () => void;
  onPlanSaved: () => void;
}

const PlanActions: React.FC<PlanActionsProps> = ({
  setupPlan,
  isEditMode,
  onSaveEdited,
  onReset,
  onPlanSaved,
}) => {
  if (!setupPlan) return null;

  return (
    <div className="flex items-center gap-2">
      {isEditMode ? (
        <Button 
          variant="outline" 
          onClick={() => onSaveEdited(setupPlan)}
          className="gap-2"
        >
          <Edit className="h-4 w-4" />
          Save Changes
        </Button>
      ) : (
        <SavePlanDialog 
          setupPlan={setupPlan} 
          onPlanSaved={onPlanSaved}
        />
      )}
      <Button variant="outline" onClick={onReset}>
        <RotateCcw className="mr-2 h-4 w-4" />
        Start Over
      </Button>
    </div>
  );
};

export default PlanActions;
