
import React from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Loader2, TestTube2 } from 'lucide-react';
import { useQuickParameterModal } from '@/hooks/useQuickParameterModal';
import { QuickParameterInputs } from './QuickParameterInputs';

interface QuickParameterModalProps {
  tankId: string;
  tankName: string;
  isOpen: boolean;
  onClose: () => void;
}

export const QuickParameterModal: React.FC<QuickParameterModalProps> = ({
  tankId,
  tankName,
  isOpen,
  onClose,
}) => {
  const {
    isLoading,
    parameters,
    handleInputChange,
    handleSave,
    handleClose,
  } = useQuickParameterModal(tankId, tankName, onClose);

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <TestTube2 className="h-5 w-5" />
            Quick Parameter Log
          </DialogTitle>
          <DialogDescription>
            Log essential water parameters for {tankName}
          </DialogDescription>
        </DialogHeader>
        
        <QuickParameterInputs
          parameters={parameters}
          onInputChange={handleInputChange}
        />
        
        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={handleClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={isLoading} className="gap-2">
            {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
            Save Parameters
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
