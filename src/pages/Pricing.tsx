
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
            <h1 className="text-4xl font-bold mb-4">Simple & Fair Pricing</h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              All core features are completely free forever. Upgrade to Pro to support development and get early access to new features.
            </p>
          </div>
          
          <PricingSection />
          
          <div className="text-center mt-12">
            <p className="text-sm text-muted-foreground">
              No hidden fees. Cancel Pro subscription anytime. Free features remain free forever.
            </p>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Pricing;
