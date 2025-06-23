import React from 'react';
import { Layout } from '@/components/Layout';
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { DropletIcon, FishIcon, Thermometer, Zap, MessageSquare, Calculator } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { TrialStatusBanner } from '@/components/subscription/TrialStatusBanner';
import { ExpiredTrialPaywall } from '@/components/subscription/ExpiredTrialPaywall';
import { EnhancedSubscriptionPrompt } from '@/components/subscription/EnhancedSubscriptionPrompt';
import { useSubscriptionAccess } from '@/hooks/useSubscriptionAccess';

const Index = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const {
    accessData,
    shouldShowPaywall,
    shouldShowSubscriptionPrompt,
    shouldShowTrialBanner,
    isLoading,
    isAdmin,
    canStartTrial,
    hasUsedTrial
  } = useSubscriptionAccess();

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

  // Show subscription prompt for users without access who haven't started a trial
  if (shouldShowSubscriptionPrompt()) {
    return (
      <Layout title="AquaAI - Start Your Journey">
        <EnhancedSubscriptionPrompt 
          isFullScreen 
          canStartTrial={canStartTrial}
          hasUsedTrial={hasUsedTrial}
        />
      </Layout>
    );
  }

  // Show paywall for expired trials or users who can't start trials
  if (shouldShowPaywall()) {
    return (
      <Layout title="AquaAI - Trial Expired">
        <ExpiredTrialPaywall isFullScreen />
      </Layout>
    );
  }

  const handleFeatureClick = async (path: string) => {
    navigate(path);
  };

  const FeatureCard = ({ 
    title, 
    description, 
    icon: Icon, 
    path, 
    iconColor = 'text-blue-500'
  }: {
    title: string;
    description: string;
    icon: any;
    path: string;
    iconColor?: string;
  }) => {
    return (
      <Card 
        className="hover:shadow-lg transition-shadow cursor-pointer"
        onClick={() => handleFeatureClick(path)}
      >
        <CardHeader>
          <Icon className={`h-8 w-8 ${iconColor} mb-2`} />
          <CardTitle>{title}</CardTitle>
          <CardDescription>{description}</CardDescription>
        </CardHeader>
      </Card>
    );
  };

  return (
    <Layout title="AquaAI - Intelligent Aquarium Management">
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-gray-900 dark:to-blue-900">
        <div className="container mx-auto px-4 py-8">
          {/* Show trial status banner */}
          {shouldShowTrialBanner() && accessData && (
            <TrialStatusBanner
              accessType={accessData.access_type as 'trial' | 'trial_expired' | 'free'}
              hoursRemaining={accessData.trial_hours_remaining}
              trialType={accessData.trial_type}
              canStartTrial={accessData.can_start_trial}
            />
          )}

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
            {isAdmin && (
              <div className="mt-4 p-3 bg-purple-100 dark:bg-purple-900/20 rounded-lg border border-purple-200 dark:border-purple-800">
                <p className="text-purple-800 dark:text-purple-200 font-medium">
                  👑 Admin Access - You have unlimited access to all features
                </p>
              </div>
            )}
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
            <FeatureCard
              title="Tank Management"
              description="Track multiple aquariums, monitor water parameters, and maintain detailed logs."
              icon={DropletIcon}
              path="/tanks"
              iconColor="text-blue-500"
            />

            <FeatureCard
              title="AquaBot AI Assistant"
              description="Get expert advice on fish care, troubleshooting, and aquarium maintenance."
              icon={MessageSquare}
              path="/aquabot"
              iconColor="text-green-500"
            />

            <FeatureCard
              title="Fish & Equipment Guide"
              description="Explore comprehensive databases of fish species and aquarium equipment."
              icon={FishIcon}
              path="/education"
              iconColor="text-orange-500"
            />

            <FeatureCard
              title="Setup Planner"
              description="Plan your dream aquarium with AI-generated equipment and livestock recommendations."
              icon={Calculator}
              path="/setup-planner"
              iconColor="text-purple-500"
            />

            <FeatureCard
              title="Smart Reminders"
              description="Never miss water changes, feedings, or equipment maintenance with intelligent alerts."
              icon={Thermometer}
              path="/reminders"
              iconColor="text-red-500"
            />

            <FeatureCard
              title="Water Testing"
              description="Log water test results and get automated analysis and recommendations."
              icon={Zap}
              path="/tanks"
              iconColor="text-yellow-500"
            />
          </div>

          {/* Benefits Section */}
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
    </Layout>
  );
};

export default Index;
