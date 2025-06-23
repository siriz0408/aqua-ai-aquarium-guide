
import React from 'react';
import TankEditForm from '@/components/tank-form/TankEditForm';
import { Layout } from '@/components/Layout';

const EditTank = () => {
  return (
    <Layout title="Edit Tank" showBackButton>
      <div className="w-full max-w-4xl mx-auto">
        <TankEditForm />
      </div>
    </Layout>
  );
};

export default EditTank;
