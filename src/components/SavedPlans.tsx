
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useSetupPlans } from '@/hooks/useSetupPlans';
import { useNavigate } from 'react-router-dom';
import { Calendar, DollarSign, Trash2, Eye, Edit } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

const SavedPlans = () => {
  const [plans, setPlans] = useState<any[]>([]);
  const { getUserSetupPlans, deleteSetupPlan, isLoading } = useSetupPlans();
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    loadPlans();
  }, []);

  const loadPlans = async () => {
    const userPlans = await getUserSetupPlans();
    setPlans(userPlans);
  };

  const handleDeletePlan = async (planId: string) => {
    const success = await deleteSetupPlan(planId);
    if (success) {
      setPlans(plans.filter(plan => plan.id !== planId));
    }
  };

  const handleViewPlan = (plan: any) => {
    sessionStorage.setItem('viewPlan', JSON.stringify(plan));
    navigate('/setup-planner');
  };

  const handleEditPlan = (plan: any) => {
    sessionStorage.setItem('editPlan', JSON.stringify(plan));
    navigate('/setup-planner');
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center">Loading your plans...</div>
        </CardContent>
      </Card>
    );
  }

  if (plans.length === 0) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <div className="space-y-4">
            <div className="text-4xl">📋</div>
            <div>
              <h4 className="text-lg font-medium">No saved plans yet</h4>
              <p className="text-muted-foreground">Create your first setup plan to get started</p>
            </div>
            <Button onClick={() => navigate('/setup-planner')}>
              Create Your First Plan
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {plans.map((plan) => (
        <Card key={plan.id} className="hover:shadow-md transition-shadow">
          <CardHeader className="pb-3">
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <CardTitle className="text-lg">{plan.plan_name}</CardTitle>
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
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleViewPlan(plan)}
                >
                  <Eye className="h-4 w-4 mr-1" />
                  View
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleEditPlan(plan)}
                >
                  <Edit className="h-4 w-4 mr-1" />
                  Edit
                </Button>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="outline" size="sm">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Delete Plan</AlertDialogTitle>
                      <AlertDialogDescription>
                        Are you sure you want to delete "{plan.plan_name}"? This action cannot be undone.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction onClick={() => handleDeletePlan(plan.id)}>
                        Delete
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="space-y-3">
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
              
              <div className="grid grid-cols-3 gap-4 text-sm">
                <div>
                  <p className="font-medium text-primary">{plan.equipment?.length || 0}</p>
                  <p className="text-muted-foreground">Equipment Items</p>
                </div>
                <div>
                  <p className="font-medium text-accent">{plan.compatible_livestock?.length || 0}</p>
                  <p className="text-muted-foreground">Livestock Options</p>
                </div>
                <div>
                  <p className="font-medium text-green-600">{plan.timeline?.length || 0}</p>
                  <p className="text-muted-foreground">Timeline Steps</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default SavedPlans;
