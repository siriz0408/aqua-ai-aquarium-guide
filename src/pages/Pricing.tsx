
import React from 'react';
import { Layout } from '@/components/Layout';
import {PricingSection } from '@/components/subscription/PricingSection';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useEffect } from 'react';

const Pricing = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // Redirect to auth if not logged in
    if (!user) {
      navigate('/auth');
    }
  }, [user, navigate]);

  if (!user) {
    return null; // Will redirect
  }

  return (
    <Layout title="Pricing - AquaAI">
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-gray-900 dark:to-blue-900">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold mb-4">Choose Your Plan</h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Upgrade to Pro to unlock AI-powered features and advanced aquarium management tools.
            </p>
          </div>
          
          <PricingSection />
          
          <div className="text-center mt-12">
            <p className="text-sm text-muted-foreground">
              All plans include a 3-day free trial. Cancel anytime. No hidden fees.
            </p>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Pricing;
