
import React from 'react';
import { Layout } from '@/components/Layout';
import SavedPlans from '@/components/SavedPlans';

const SavedPlansPage = () => {
  return (
    <Layout title="Saved Plans">
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Your Setup Plans</h1>
          <p className="text-muted-foreground">Manage and edit your aquarium setup plans</p>
        </div>
        <SavedPlans />
      </div>
    </Layout>
  );
};

export default SavedPlansPage;
