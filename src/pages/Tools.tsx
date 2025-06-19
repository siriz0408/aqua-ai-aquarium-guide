
import React from 'react';
import { Layout } from '@/components/Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useNavigate } from 'react-router-dom';
import { Calculator, Wrench, Beaker, BookOpen, Bot } from 'lucide-react';
import { useSubscriptionAccess } from '@/hooks/useSubscriptionAccess';

interface FeatureCardProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  isPremium?: boolean;
  href: string;
}

const FeatureCard: React.FC<FeatureCardProps> = ({ title, description, icon, isPremium, href }) => {
  const navigate = useNavigate();
  const { canAccessFeature } = useSubscriptionAccess();
  const canAccess = !isPremium || canAccessFeature('premium');

  return (
    <Card className={`relative transition-all hover:shadow-lg ${!canAccess ? 'opacity-75' : ''}`}>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
              {icon}
            </div>
            <div>
              <CardTitle className="text-lg">{title}</CardTitle>
              {isPremium && (
                <Badge variant="secondary" className="mt-1">
                  Premium
                </Badge>
              )}
            </div>
          </div>
        </div>
        <CardDescription className="mt-2">{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <Button 
          onClick={() => navigate(href)}
          disabled={!canAccess}
          className="w-full"
        >
          {canAccess ? 'Open Tool' : 'Upgrade to Access'}
        </Button>
      </CardContent>
    </Card>
  );
};

const Tools = () => {
  return (
    <Layout title="Aquarium Tools">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Aquarium Tools</h1>
          <p className="text-muted-foreground">
            Powerful tools to help you maintain and optimize your reef aquarium.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <FeatureCard
            title="Setup Planner"
            description="Get a complete setup plan with equipment recommendations, timeline, and budget breakdown for your new reef tank."
            icon={<Wrench className="h-5 w-5 text-blue-600" />}
            isPremium={true}
            href="/setup-planner"
          />
          
          <FeatureCard
            title="Water Change Calculator"
            description="Calculate optimal water changes based on your parameters. Get predictions for parameter shifts and safety warnings."
            icon={<Calculator className="h-5 w-5 text-blue-600" />}
            isPremium={true}
            href="/water-change-calculator"
          />

          <FeatureCard
            title="AquaBot AI Assistant"
            description="Get expert advice from our AI assistant trained on reef keeping knowledge. Analyze your parameters and troubleshoot issues."
            icon={<Bot className="h-5 w-5 text-blue-600" />}
            isPremium={true}
            href="/aquabot"
          />

          <FeatureCard
            title="Parameter Analysis"
            description="Deep dive into your water parameter trends with advanced analytics and personalized recommendations."
            icon={<Beaker className="h-5 w-5 text-blue-600" />}
            isPremium={true}
            href="/parameter-analysis"
          />

          <FeatureCard
            title="Species Compatibility"
            description="Check compatibility between fish and coral species before adding them to your tank."
            icon={<BookOpen className="h-5 w-5 text-blue-600" />}
            isPremium={false}
            href="/compatibility-checker"
          />
        </div>

        <div className="mt-12 text-center">
          <div className="bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 rounded-lg p-8">
            <h2 className="text-2xl font-bold mb-4">More Tools Coming Soon</h2>
            <p className="text-muted-foreground mb-6">
              We're constantly adding new tools to help you succeed with your reef aquarium.
              Have a suggestion? Let us know!
            </p>
            <Button variant="outline">
              Request a Feature
            </Button>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Tools;
