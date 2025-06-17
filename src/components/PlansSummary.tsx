
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
      <Card className="w-full">
        <CardHeader className="pb-3">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
            <div>
              <div className="h-5 bg-gray-200 rounded w-32 mb-1"></div>
              <div className="h-3 bg-gray-200 rounded w-48"></div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {[...Array(2)].map((_, i) => (
              <div key={i} className="p-3 border rounded-lg animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader className="pb-3">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
          <div className="flex-1 min-w-0">
            <CardTitle className="text-lg">Your Setup Plans</CardTitle>
            <CardDescription className="text-sm">Manage your aquarium setup plans</CardDescription>
          </div>
          <div className="flex gap-2 flex-shrink-0">
            {plans.length > 0 && (
              <Button variant="ghost" size="sm" onClick={handleViewAllPlans} className="text-xs">
                View All ({plans.length})
              </Button>
            )}
            <Button size="sm" onClick={handleCreatePlan} className="gap-1 text-xs">
              <Plus className="h-3 w-3" />
              Create Plan
            </Button>
          </div>
        </div>
      </CardHeader>
      
      <CardContent>
        {plans.length === 0 ? (
          <div className="text-center py-6">
            <Wrench className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
            <h3 className="text-sm font-medium mb-1">No setup plans yet</h3>
            <p className="text-xs text-muted-foreground mb-3">Create your first aquarium setup plan</p>
            <Button size="sm" onClick={handleCreatePlan} className="gap-1">
              <Plus className="h-3 w-3" />
              Create Your First Plan
            </Button>
          </div>
        ) : (
          <div className="grid gap-3 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {plans.slice(0, 8).map((plan) => (
              <div 
                key={plan.id} 
                className="p-3 border rounded-lg cursor-pointer hover:bg-muted/50 transition-colors group"
                onClick={() => handleViewPlan(plan)}
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="min-w-0 flex-1">
                    <h4 className="text-sm font-medium truncate">{plan.plan_name}</h4>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1 flex-wrap">
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
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleViewPlan(plan);
                    }}
                    className="opacity-0 group-hover:opacity-100 transition-opacity h-6 w-6 p-0 flex-shrink-0"
                  >
                    <Eye className="h-3 w-3" />
                  </Button>
                </div>
                
                {plan.tank_specs && (
                  <div className="flex flex-wrap gap-1 mb-2">
                    {plan.tank_specs.size && (
                      <Badge variant="secondary" className="text-xs px-1 py-0">{plan.tank_specs.size}</Badge>
                    )}
                    {plan.tank_specs.type && (
                      <Badge variant="secondary" className="text-xs px-1 py-0">{plan.tank_specs.type}</Badge>
                    )}
                  </div>
                )}
                
                <div className="grid grid-cols-3 gap-1 text-center">
                  <div>
                    <p className="text-xs font-medium text-primary">
                      {plan.equipment?.length || 0}
                    </p>
                    <p className="text-xs text-muted-foreground">Equipment</p>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-accent">
                      {plan.compatible_livestock?.length || 0}
                    </p>
                    <p className="text-xs text-muted-foreground">Livestock</p>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-green-600">
                      {plan.timeline?.length || 0}
                    </p>
                    <p className="text-xs text-muted-foreground">Steps</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default PlansSummary;
