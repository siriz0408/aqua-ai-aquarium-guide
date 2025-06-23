
import React from 'react';
import { SubscriptionPlans } from '@/components/subscription/SubscriptionPlans';
import { useAuth } from '@/contexts/AuthContext';
import { Navigate } from 'react-router-dom';

const SubscriptionPlansPage: React.FC = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto">
        <SubscriptionPlans />
      </div>
    </div>
  );
};

export default SubscriptionPlansPage;
