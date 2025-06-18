import React, { useEffect } from 'react';
import { Layout } from '@/components/Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { DropletIcon, FishIcon, Thermometer, Zap, MessageSquare, Calculator } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { TrialBanner } from '@/components/TrialBanner';
import PaywallModal from '@/components/Paywall';
import { useCredits } from '@/hooks/useCredits';
import { useState } from 'react';

const Index = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { canUseFeature, needsUpgrade, getSubscriptionInfo } = useCredits();
  const [showPaywall, setShowPaywall] = useState(false);

  const handleFeatureClick = (path: string) => {
    if (!user) {
      navigate('/auth');
      return;
    }
    
    // Check if user can access the feature
    if (!canUseFeature()) {
      console.log('User cannot access feature, showing paywall');
      setShowPaywall(true);
      return;
    }
    
    console.log('User can access feature, navigating to:', path);
    navigate(path);
  };

  const handleUpgrade = () => {
    setShowPaywall(true);
  };

  const subscriptionInfo = getSubscriptionInfo();
  console.log('Current subscription info:', subscriptionInfo);

  return (
    <Layout title="AquaAI - Intelligent Aquarium Management">
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-gray-900 dark:to-blue-900">
        <div className="container mx-auto px-4 py-8">
          {user && <TrialBanner onUpgrade={handleUpgrade} />}
          
          <div className="text-center mb-12">
            <div className="flex items-center justify-center mb-6">
              <div className="h-16 w-16 rounded-full ocean-gradient flex items-center justify-center mr-4">
                <span className="text-white text-2xl font-bold">🐠</span>
              </div>
              <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
                AquaAI
              </h1>
            </div>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Your intelligent aquarium companion. Track water parameters, get AI-powered advice, 
              and keep your aquatic friends healthy and happy.
            </p>
            {!user && (
              <div className="mt-6 space-x-4">
                <Button 
                  size="lg" 
                  className="ocean-gradient hover:opacity-90"
                  onClick={() => navigate('/auth')}
                >
                  Start Free Trial
                </Button>
                <Button 
                  variant="outline" 
                  size="lg"
                  onClick={() => navigate('/auth')}
                >
                  Sign In
                </Button>
              </div>
            )}
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => handleFeatureClick('/tanks')}>
              <CardHeader>
                <DropletIcon className="h-8 w-8 text-blue-500 mb-2" />
                <CardTitle>Tank Management</CardTitle>
                <CardDescription>
                  Track multiple aquariums, monitor water parameters, and maintain detailed logs.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => handleFeatureClick('/aquabot')}>
              <CardHeader>
                <MessageSquare className="h-8 w-8 text-green-500 mb-2" />
                <CardTitle>AquaBot AI Assistant</CardTitle>
                <CardDescription>
                  Get expert advice on fish care, troubleshooting, and aquarium maintenance.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => handleFeatureClick('/education')}>
              <CardHeader>
                <FishIcon className="h-8 w-8 text-orange-500 mb-2" />
                <CardTitle>Fish & Equipment Guide</CardTitle>
                <CardDescription>
                  Explore comprehensive databases of fish species and aquarium equipment.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => handleFeatureClick('/setup-planner')}>
              <CardHeader>
                <Calculator className="h-8 w-8 text-purple-500 mb-2" />
                <CardTitle>Setup Planner</CardTitle>
                <CardDescription>
                  Plan your dream aquarium with AI-generated equipment and livestock recommendations.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => handleFeatureClick('/reminders')}>
              <CardHeader>
                <Thermometer className="h-8 w-8 text-red-500 mb-2" />
                <CardTitle>Smart Reminders</CardTitle>
                <CardDescription>
                  Never miss water changes, feedings, or equipment maintenance with intelligent alerts.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => handleFeatureClick('/log-parameters')}>
              <CardHeader>
                <Zap className="h-8 w-8 text-yellow-500 mb-2" />
                <CardTitle>Water Testing</CardTitle>
                <CardDescription>
                  Log water test results and get automated analysis and recommendations.
                </CardDescription>
              </CardHeader>
            </Card>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg p-8 shadow-lg">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold mb-4">Why Choose AquaAI?</h2>
              <p className="text-muted-foreground">
                Join thousands of aquarists who trust AquaAI to keep their aquariums thriving.
              </p>
            </div>
            
            <div className="grid md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="h-12 w-12 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center mx-auto mb-4">
                  <Zap className="h-6 w-6 text-blue-600" />
                </div>
                <h3 className="font-semibold mb-2">AI-Powered Insights</h3>
                <p className="text-sm text-muted-foreground">
                  Get personalized recommendations based on your specific aquarium setup and parameters.
                </p>
              </div>
              
              <div className="text-center">
                <div className="h-12 w-12 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center mx-auto mb-4">
                  <DropletIcon className="h-6 w-6 text-green-600" />
                </div>
                <h3 className="font-semibold mb-2">Comprehensive Tracking</h3>
                <p className="text-sm text-muted-foreground">
                  Monitor all aspects of your aquarium health with detailed logs and trend analysis.
                </p>
              </div>
              
              <div className="text-center">
                <div className="h-12 w-12 rounded-full bg-purple-100 dark:bg-purple-900 flex items-center justify-center mx-auto mb-4">
                  <FishIcon className="h-6 w-6 text-purple-600" />
                </div>
                <h3 className="font-semibold mb-2">Expert Knowledge</h3>
                <p className="text-sm text-muted-foreground">
                  Access a vast database of fish species, equipment guides, and care instructions.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <PaywallModal 
        isOpen={showPaywall} 
        onClose={() => setShowPaywall(false)} 
        showUpgradeOnly={needsUpgrade()}
      />
    </Layout>
  );
};

export default Index;
