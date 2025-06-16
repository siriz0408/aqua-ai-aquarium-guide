
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Save } from 'lucide-react';
import { useSetupPlans } from '@/hooks/useSetupPlans';

interface SavePlanDialogProps {
  setupPlan: any;
  onPlanSaved?: () => void;
}

const SavePlanDialog: React.FC<SavePlanDialogProps> = ({ setupPlan, onPlanSaved }) => {
  const [planName, setPlanName] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const { saveSetupPlan, isLoading } = useSetupPlans();

  const handleSave = async () => {
    if (!planName.trim()) return;

    const result = await saveSetupPlan(setupPlan, planName.trim());
    
    if (result) {
      setPlanName('');
      setIsOpen(false);
      onPlanSaved?.();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-2">
          <Save className="h-4 w-4" />
          Save Plan
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Save Setup Plan</DialogTitle>
          <DialogDescription>
            Give your setup plan a name so you can access it later and share it with our AI assistant.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="plan-name" className="text-right">
              Plan Name
            </Label>
            <Input
              id="plan-name"
              value={planName}
              onChange={(e) => setPlanName(e.target.value)}
              placeholder="e.g., My First Reef Tank"
              className="col-span-3"
              onKeyDown={(e) => {
                if (e.key === 'Enter' && planName.trim()) {
                  handleSave();
                }
              }}
            />
          </div>
        </div>
        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>
            Cancel
          </Button>
          <Button 
            type="button" 
            onClick={handleSave} 
            disabled={!planName.trim() || isLoading}
          >
            {isLoading ? 'Saving...' : 'Save Plan'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default SavePlanDialog;
