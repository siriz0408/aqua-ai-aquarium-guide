
import React from 'react';
import { Layout } from '@/components/Layout';
import { PricingSection } from '@/components/subscription/PricingSection';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useEffect } from 'react';

const Pricing = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      navigate('/auth');
    }
  }, [user, navigate]);

  if (!user) {
    return null;
  }

  return (
    <Layout title="Pricing - AquaAI">
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-gray-900 dark:to-blue-900">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold mb-4">Professional Aquarium Management</h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Get access to all of AquaAI's powerful features with our affordable subscription plans. 
              Start with a 3-day free trial.
            </p>
          </div>
          
          <PricingSection />
          
          <div className="text-center mt-12">
            <p className="text-sm text-muted-foreground">
              All plans include a 3-day free trial. Cancel anytime during trial period and you won't be charged.
            </p>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Pricing;
