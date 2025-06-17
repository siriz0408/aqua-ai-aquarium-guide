
import React from 'react';
import { Layout } from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { useCredits } from '@/hooks/useCredits';
import { useNavigate } from 'react-router-dom';

export const Tanks = () => {
  const { canUseFeature, needsUpgrade } = useCredits();
  const navigate = useNavigate();

  if (!canUseFeature()) {
    return (
      <Layout title="Tank Management">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">Tank Management</h1>
            <p className="text-muted-foreground mb-6">
              Tank management is a Pro feature. Upgrade to track your aquarium parameters and setup.
            </p>
            <Button onClick={() => navigate('/upgrade')}>
              Upgrade to Pro
            </Button>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout title="My Tanks">
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">My Tanks</h1>
          <Button onClick={() => navigate('/add-tank')}>
            <Plus className="h-4 w-4 mr-2" />
            Add Tank
          </Button>
        </div>
        {/* Add tank list content here */}
        <div className="text-center py-12">
          <p className="text-muted-foreground mb-4">No tanks added yet</p>
          <Button onClick={() => navigate('/add-tank')}>
            Add Your First Tank
          </Button>
        </div>
      </div>
    </Layout>
  );
};

export default Tanks;
