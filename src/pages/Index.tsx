
import React from 'react';
import { Layout } from '@/components/Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { DropletIcon, FishIcon, Thermometer, Zap, MessageSquare, Calculator, Lock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { SubscriptionBanner } from '@/components/subscription/SubscriptionBanner';
import { useSubscriptionAccess } from '@/hooks/useSubscriptionAccess';
import { useToast } from '@/hooks/use-toast';

const Index = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const {
    profile,
    subscriptionInfo,
    trialStatus,
    canAccessFeature,
    requiresUpgrade,
    isLoading
  } = useSubscriptionAccess();

  const handleFeatureClick = async (path: string, featureType: 'basic' | 'premium' = 'basic') => {
    if (!user) {
      navigate('/auth');
      return;
    }

    if (isLoading) {
      toast({
        title: "Loading...",
        description: "Please wait while we check your subscription status.",
      });
      return;
    }

    // Check if user can access this feature
    if (!canAccessFeature(featureType)) {
      toast({
        title: "Premium Feature",
        description: "This feature requires a Pro subscription or active trial. Please upgrade to continue.",
        variant: "destructive",
      });
      // Navigate to pricing instead
      navigate('/#pricing');
      return;
    }
    
    navigate(path);
  };

  const FeatureCard = ({ 
    title, 
    description, 
    icon: Icon, 
    path, 
    featureType = 'basic',
    iconColor = 'text-blue-500'
  }: {
    title: string;
    description: string;
    icon: any;
    path: string;
    featureType?: 'basic' | 'premium';
    iconColor?: string;
  }) => {
    const needsUpgrade = requiresUpgrade(featureType);
    
    return (
      <Card 
        className={`hover:shadow-lg transition-shadow cursor-pointer relative ${needsUpgrade ? 'opacity-75' : ''}`}
        onClick={() => handleFeatureClick(path, featureType)}
      >
        <CardHeader>
          <div className="flex items-start justify-between">
            <Icon className={`h-8 w-8 ${iconColor} mb-2`} />
            {needsUpgrade && (
              <Lock className="h-5 w-5 text-orange-500" />
            )}
          </div>
          <CardTitle className="flex items-center gap-2">
            {title}
            {featureType === 'premium' && needsUpgrade && (
              <span className="text-xs bg-orange-100 text-orange-800 px-2 py-1 rounded-full">
                Pro
              </span>
            )}
          </CardTitle>
          <CardDescription>
            {description}
          </CardDescription>
        </CardHeader>
      </Card>
    );
  };

  return (
    <Layout title="AquaAI - Intelligent Aquarium Management">
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-gray-900 dark:to-blue-900">
        <div className="container mx-auto px-4 py-8">
          {/* Show subscription banner for authenticated users */}
          {user && profile && (
            <SubscriptionBanner
              subscriptionStatus={profile.subscription_status}
              subscriptionTier={profile.subscription_tier}
              trialHoursRemaining={trialStatus?.hoursRemaining || 0}
              isTrialExpired={trialStatus?.isTrialExpired || false}
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
            {!user && (
              <div className="mt-6 space-x-4">
                <Button 
                  size="lg" 
                  className="ocean-gradient hover:opacity-90"
                  onClick={() => navigate('/auth')}
                >
                  Get Started
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
            <FeatureCard
              title="Tank Management"
              description="Track multiple aquariums, monitor water parameters, and maintain detailed logs."
              icon={DropletIcon}
              path="/tanks"
              featureType="basic"
              iconColor="text-blue-500"
            />

            <FeatureCard
              title="AquaBot AI Assistant"
              description="Get expert advice on fish care, troubleshooting, and aquarium maintenance."
              icon={MessageSquare}
              path="/aquabot"
              featureType="premium"
              iconColor="text-green-500"
            />

            <FeatureCard
              title="Fish & Equipment Guide"
              description="Explore comprehensive databases of fish species and aquarium equipment."
              icon={FishIcon}
              path="/education"
              featureType="basic"
              iconColor="text-orange-500"
            />

            <FeatureCard
              title="Setup Planner"
              description="Plan your dream aquarium with AI-generated equipment and livestock recommendations."
              icon={Calculator}
              path="/setup-planner"
              featureType="premium"
              iconColor="text-purple-500"
            />

            <FeatureCard
              title="Smart Reminders"
              description="Never miss water changes, feedings, or equipment maintenance with intelligent alerts."
              icon={Thermometer}
              path="/reminders"
              featureType="basic"
              iconColor="text-red-500"
            />

            <FeatureCard
              title="Water Testing"
              description="Log water test results and get automated analysis and recommendations."
              icon={Zap}
              path="/log-parameters"
              featureType="basic"
              iconColor="text-yellow-500"
            />
          </div>

          {/* Pricing Section */}
          <div id="pricing" className="bg-white dark:bg-gray-800 rounded-lg p-8 shadow-lg mb-12">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold mb-4">Choose Your Plan</h2>
              <p className="text-muted-foreground">
                Start with our free plan or upgrade to Pro for unlimited access to AI features
              </p>
            </div>
            
            <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
              {/* Free Plan */}
              <Card className="relative">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <DropletIcon className="h-5 w-5 text-blue-600" />
                    Free Plan
                  </CardTitle>
                  <CardDescription>
                    Perfect for getting started with basic aquarium management
                  </CardDescription>
                  <div className="text-3xl font-bold">$0</div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <Zap className="h-4 w-4 text-green-600" />
                      <span className="text-sm">Basic tank tracking</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Zap className="h-4 w-4 text-green-600" />
                      <span className="text-sm">Water parameter logging</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Zap className="h-4 w-4 text-green-600" />
                      <span className="text-sm">Equipment management</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Zap className="h-4 w-4 text-green-600" />
                      <span className="text-sm">Educational resources</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Pro Plan */}
              <Card className="relative border-blue-200 shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MessageSquare className="h-5 w-5 text-blue-600" />
                    Pro Plan
                  </CardTitle>
                  <CardDescription>
                    Unlock AI-powered insights and advanced planning tools
                  </CardDescription>
                  <div className="text-3xl font-bold">
                    $4.99<span className="text-base font-normal text-gray-600">/month</span>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <Zap className="h-4 w-4 text-green-600" />
                      <span className="text-sm">Everything in Free</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Zap className="h-4 w-4 text-green-600" />
                      <span className="text-sm font-medium">AI-Powered AquaBot Chat</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Zap className="h-4 w-4 text-green-600" />
                      <span className="text-sm">Advanced Setup Planner</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Zap className="h-4 w-4 text-green-600" />
                      <span className="text-sm">Priority support</span>
                    </div>
                  </div>
                  {user && !isLoading && (
                    <Button 
                      onClick={() => {
                        if (subscriptionInfo.hasAccess) {
                          toast({
                            title: "Already subscribed",
                            description: "You already have access to Pro features!",
                          });
                        } else {
                          navigate('/pricing');
                        }
                      }}
                      className="w-full bg-blue-600 hover:bg-blue-700"
                      disabled={subscriptionInfo.hasAccess}
                    >
                      {subscriptionInfo.hasAccess ? "Current Plan" : "Upgrade to Pro"}
                    </Button>
                  )}
                  {!user && (
                    <Button 
                      onClick={() => navigate('/auth')}
                      className="w-full bg-blue-600 hover:bg-blue-700"
                    >
                      Sign Up for Pro
                    </Button>
                  )}
                </CardContent>
              </Card>
            </div>
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
    </Layout>
  );
};

export default Index;
