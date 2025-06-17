
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useSetupPlans } from '@/hooks/useSetupPlans';
import { useNavigate } from 'react-router-dom';
import { Calendar, DollarSign, Eye, Plus, Wrench } from 'lucide-react';

const PlansSummary = () => {
  const { plans, isLoading } = useSetupPlans();
  const navigate = useNavigate();

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const handleViewPlan = (plan: any) => {
    sessionStorage.setItem('viewPlan', JSON.stringify(plan));
    navigate('/setup-planner');
  };

  const handleViewAllPlans = () => {
    navigate('/saved-plans');
  };

  const handleCreatePlan = () => {
    navigate('/setup-planner');
  };

  if (isLoading) {
    return (
      <div className="w-full">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Your Setup Plans</h2>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          {[...Array(2)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader>
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              </CardHeader>
              <CardContent>
                <div className="h-20 bg-gray-200 rounded"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="flex justify-between items-center mb-4">
        <div>
          <h2 className="text-xl font-semibold">Your Setup Plans</h2>
          <p className="text-muted-foreground text-sm">Manage your aquarium setup plans</p>
        </div>
        <div className="flex gap-2">
          {plans.length > 0 && (
            <Button variant="ghost" onClick={handleViewAllPlans}>
              View All ({plans.length})
            </Button>
          )}
          <Button onClick={handleCreatePlan} className="gap-2">
            <Plus className="h-4 w-4" />
            Create Plan
          </Button>
        </div>
      </div>
      
      {plans.length === 0 ? (
        <Card className="text-center p-8">
          <div className="flex flex-col items-center gap-4">
            <Wrench className="h-12 w-12 text-muted-foreground" />
            <div>
              <h3 className="text-lg font-semibold">No setup plans yet</h3>
              <p className="text-muted-foreground mb-4">Create your first aquarium setup plan to get started</p>
              <Button onClick={handleCreatePlan} className="gap-2">
                <Plus className="h-4 w-4" />
                Create Your First Plan
              </Button>
            </div>
          </div>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {plans.slice(0, 4).map((plan) => (
            <Card 
              key={plan.id} 
              className="cursor-pointer hover:shadow-lg transition-shadow group"
              onClick={() => handleViewPlan(plan)}
            >
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <CardTitle className="text-base">{plan.plan_name}</CardTitle>
                    <CardDescription className="flex items-center gap-4">
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {formatDate(plan.created_at)}
                      </span>
                      {plan.total_estimate && (
                        <span className="flex items-center gap-1">
                          <DollarSign className="h-3 w-3" />
                          {plan.total_estimate}
                        </span>
                      )}
                    </CardDescription>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleViewPlan(plan);
                    }}
                    className="opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-3">
                {plan.tank_specs && (
                  <div className="flex flex-wrap gap-2">
                    {plan.tank_specs.size && (
                      <Badge variant="secondary">{plan.tank_specs.size}</Badge>
                    )}
                    {plan.tank_specs.type && (
                      <Badge variant="secondary">{plan.tank_specs.type}</Badge>
                    )}
                  </div>
                )}
                
                <div className="grid grid-cols-3 gap-2 text-center">
                  <div>
                    <p className="text-sm font-medium text-primary">
                      {plan.equipment?.length || 0}
                    </p>
                    <p className="text-xs text-muted-foreground">Equipment</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-accent">
                      {plan.compatible_livestock?.length || 0}
                    </p>
                    <p className="text-xs text-muted-foreground">Livestock</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-green-600">
                      {plan.timeline?.length || 0}
                    </p>
                    <p className="text-xs text-muted-foreground">Steps</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default PlansSummary;
