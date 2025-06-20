
import React from 'react';
import { Layout } from '@/components/Layout';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import { ProSubscriptionPrompt } from '@/components/subscription/ProSubscriptionPrompt';
import { useProSubscriptionAccess } from '@/hooks/useProSubscriptionAccess';

const Index = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const {
    status,
    isLoading,
    isAdmin,
    isPaidSubscriber,
    hasAccess,
    subscriptionTier
  } = useProSubscriptionAccess();

  // Show loading state
  if (isLoading) {
    return (
      <Layout title="AquaAI - Loading...">
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center space-y-4">
            <div className="h-16 w-16 rounded-full ocean-gradient flex items-center justify-center mx-auto animate-pulse">
              <span className="text-white text-2xl font-bold">🐠</span>
            </div>
            <p className="text-muted-foreground">Loading your aquarium dashboard...</p>
          </div>
        </div>
      </Layout>
    );
  }

  // Redirect non-authenticated users to auth
  if (!user) {
    navigate('/auth');
    return null;
  }

  // 100% PAYWALL: Show subscription prompt if no access
  if (!hasAccess) {
    return (
      <Layout title="AquaAI - Subscription Required">
        <ProSubscriptionPrompt isFullScreen />
      </Layout>
    );
  }

  // Only admins and paid subscribers reach here
  return (
    <Layout title="AquaAI - Intelligent Aquarium Management">
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-gray-900 dark:to-blue-900">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center mb-12">
            <div className="flex items-center justify-center mb-6">
              <div className="h-16 w-16 rounded-full ocean-gradient flex items-center justify-center mr-4">
                <span className="text-white text-2xl font-bold">🐠</span>
              </div>
              <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
                AquaAI Pro
              </h1>
            </div>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Welcome to your professional aquarium management experience. Track parameters, get AI advice, 
              and keep your aquatic friends thriving.
            </p>
            
            {/* Status Badge */}
            <div className="mt-6 flex justify-center">
              <div className={`px-4 py-2 rounded-full text-sm font-medium ${
                isAdmin ? 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-200' :
                isPaidSubscriber ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-200' :
                'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-200'
              }`}>
                {isAdmin ? '👑 Admin Access' :
                 isPaidSubscriber ? '✨ Pro Subscriber' :
                 '🔒 Access Required'}
              </div>
            </div>
          </div>

          {/* Quick Action Cards */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
            <div 
              className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-lg hover:shadow-xl transition-shadow cursor-pointer"
              onClick={() => navigate('/tanks')}
            >
              <div className="h-12 w-12 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center mb-4">
                <span className="text-2xl">🏠</span>
              </div>
              <h3 className="text-lg font-semibold mb-2">My Tanks</h3>
              <p className="text-muted-foreground text-sm">
                Manage your aquariums and track water parameters
              </p>
            </div>

            <div 
              className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-lg hover:shadow-xl transition-shadow cursor-pointer"
              onClick={() => navigate('/aquabot')}
            >
              <div className="h-12 w-12 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center mb-4">
                <span className="text-2xl">🤖</span>
              </div>
              <h3 className="text-lg font-semibold mb-2">AquaBot AI</h3>
              <p className="text-muted-foreground text-sm">
                Get expert AI advice for your aquarium
              </p>
            </div>

            <div 
              className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-lg hover:shadow-xl transition-shadow cursor-pointer"
              onClick={() => navigate('/setup-planner')}
            >
              <div className="h-12 w-12 bg-purple-100 dark:bg-purple-900 rounded-lg flex items-center justify-center mb-4">
                <span className="text-2xl">📋</span>
              </div>
              <h3 className="text-lg font-semibold mb-2">Setup Planner</h3>
              <p className="text-muted-foreground text-sm">
                Plan your perfect aquarium setup
              </p>
            </div>
          </div>

          {/* Pro Features Showcase */}
          <div className="bg-white dark:bg-gray-800 rounded-lg p-8 shadow-lg">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold mb-4">Professional Features</h2>
              <p className="text-muted-foreground">
                You now have access to all AquaAI Pro features for professional aquarium management.
              </p>
            </div>
            
            <div className="grid md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="h-12 w-12 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">🧠</span>
                </div>
                <h3 className="font-semibold mb-2">AI-Powered Insights</h3>
                <p className="text-sm text-muted-foreground">
                  Get personalized recommendations based on your tank data and parameters.
                </p>
              </div>
              
              <div className="text-center">
                <div className="h-12 w-12 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">📊</span>
                </div>
                <h3 className="font-semibold mb-2">Advanced Analytics</h3>
                <p className="text-sm text-muted-foreground">
                  Track trends, set alerts, and monitor your aquarium's health over time.
                </p>
              </div>
              
              <div className="text-center">
                <div className="h-12 w-12 rounded-full bg-purple-100 dark:bg-purple-900 flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">🎯</span>
                </div>
                <h3 className="font-semibold mb-2">Smart Planning</h3>
                <p className="text-sm text-muted-foreground">
                  AI-generated setup plans and livestock compatibility analysis.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Index;
