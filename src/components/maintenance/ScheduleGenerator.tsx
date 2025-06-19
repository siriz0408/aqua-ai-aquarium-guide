
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useMaintenanceScheduler } from '@/hooks/useMaintenanceScheduler';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Sparkles, Settings, Fish, Droplet, Calendar } from 'lucide-react';

interface Tank {
  id: string;
  name: string;
  size_gallons: number;
  setup_date: string;
}

const ScheduleGenerator: React.FC = () => {
  const { user } = useAuth();
  const { generateSchedules, isGeneratingSchedules, templates } = useMaintenanceScheduler();
  const [selectedTank, setSelectedTank] = useState<string>('');
  const [tankType, setTankType] = useState<string>('');
  const [userExperience, setUserExperience] = useState<string>('beginner');
  const [showPreview, setShowPreview] = useState(false);

  // Fetch user's tanks
  const { data: tanks = [] } = useQuery({
    queryKey: ['user_tanks'],
    queryFn: async () => {
      if (!user) return [];
      
      const { data, error } = await supabase
        .from('aquariums')
        .select('id, name, size_gallons, setup_date')
        .eq('user_id', user.id);

      if (error) {
        console.error('Error fetching tanks:', error);
        return [];
      }

      return data as Tank[];
    },
    enabled: !!user,
  });

  const selectedTankData = tanks.find(tank => tank.id === selectedTank);

  // Calculate tank age in months
  const getTankAgeMonths = (setupDate: string) => {
    const setup = new Date(setupDate);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - setup.getTime());
    const diffMonths = Math.ceil(diffTime / (1000 * 60 * 60 * 24 * 30));
    return diffMonths;
  };

  // Get applicable templates for preview
  const getApplicableTemplates = () => {
    return templates.filter(template => 
      template.tank_type === 'all' || template.tank_type === tankType
    );
  };

  const handleGenerateSchedule = () => {
    if (!selectedTankData || !tankType) return;

    const tankAgeMonths = getTankAgeMonths(selectedTankData.setup_date);

    generateSchedules({
      tankId: selectedTankData.id,
      tankType,
      tankSizeGallons: selectedTankData.size_gallons,
      userExperience,
      tankAgeMonths
    });

    setShowPreview(false);
  };

  const getFrequencyColor = (frequency: string) => {
    switch (frequency) {
      case 'weekly': return 'destructive';
      case 'bi_weekly': return 'default';
      case 'monthly': return 'secondary';
      case 'quarterly': return 'outline';
      default: return 'outline';
    }
  };

  const getExperienceMultiplier = (template: any) => {
    return template.experience_modifier?.[userExperience] || 1.0;
  };

  const getMaturityMultiplier = (template: any, tankAgeMonths: number) => {
    let maturityLevel = 'new';
    if (tankAgeMonths >= 18) maturityLevel = 'mature';
    else if (tankAgeMonths >= 6) maturityLevel = 'established';
    
    return template.maturity_modifier?.[maturityLevel] || 1.0;
  };

  const calculateAdjustedInterval = (template: any) => {
    if (!selectedTankData) return template.base_interval_days;
    
    const tankAgeMonths = getTankAgeMonths(selectedTankData.setup_date);
    const experienceMultiplier = getExperienceMultiplier(template);
    const maturityMultiplier = getMaturityMultiplier(template, tankAgeMonths);
    
    return Math.round(template.base_interval_days * experienceMultiplier * maturityMultiplier);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-primary" />
          Intelligent Schedule Generator
        </CardTitle>
        <CardDescription>
          Generate a personalized maintenance schedule based on your tank characteristics and experience level
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Tank Selection */}
        <div className="space-y-2">
          <Label htmlFor="tank">Select Tank</Label>
          <Select value={selectedTank} onValueChange={setSelectedTank}>
            <SelectTrigger>
              <SelectValue placeholder="Choose a tank to generate schedule for" />
            </SelectTrigger>
            <SelectContent>
              {tanks.map((tank) => (
                <SelectItem key={tank.id} value={tank.id}>
                  <div className="flex items-center gap-2">
                    <Fish className="h-4 w-4" />
                    {tank.name} ({tank.size_gallons} gal)
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Tank Type */}
        <div className="space-y-2">
          <Label htmlFor="tank-type">Tank Type</Label>
          <Select value={tankType} onValueChange={setTankType}>
            <SelectTrigger>
              <SelectValue placeholder="Select your tank type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="FOWLR">
                <div className="flex items-center gap-2">
                  <Fish className="h-4 w-4" />
                  FOWLR (Fish Only With Live Rock)
                </div>
              </SelectItem>
              <SelectItem value="Mixed">
                <div className="flex items-center gap-2">
                  <Droplet className="h-4 w-4" />
                  Mixed Reef (Fish + Easy Corals)
                </div>
              </SelectItem>
              <SelectItem value="Reef">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  Full Reef (SPS/LPS Corals)
                </div>
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Experience Level */}
        <div className="space-y-2">
          <Label htmlFor="experience">Your Experience Level</Label>
          <Select value={userExperience} onValueChange={setUserExperience}>
            <SelectTrigger>
              <SelectValue placeholder="Select your experience level" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="beginner">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-green-500"></div>
                  Beginner (More frequent maintenance)
                </div>
              </SelectItem>
              <SelectItem value="intermediate">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-yellow-500"></div>
                  Intermediate (Standard intervals)
                </div>
              </SelectItem>
              <SelectItem value="advanced">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                  Advanced (Extended intervals)
                </div>
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Tank Info Display */}
        {selectedTankData && (
          <div className="p-4 bg-muted rounded-lg">
            <h4 className="font-medium mb-2">Tank Information</h4>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-muted-foreground">Size:</span> {selectedTankData.size_gallons} gallons
              </div>
              <div>
                <span className="text-muted-foreground">Age:</span> {getTankAgeMonths(selectedTankData.setup_date)} months
              </div>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-2">
          <Dialog open={showPreview} onOpenChange={setShowPreview}>
            <DialogTrigger asChild>
              <Button 
                variant="outline" 
                disabled={!selectedTank || !tankType}
                className="flex-1"
              >
                <Settings className="h-4 w-4 mr-2" />
                Preview Schedule
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Schedule Preview</DialogTitle>
                <DialogDescription>
                  This is what your maintenance schedule will look like based on your selections
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-4">
                {getApplicableTemplates().map((template) => {
                  const adjustedInterval = calculateAdjustedInterval(template);
                  return (
                    <div key={template.id} className="p-4 border rounded-lg">
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="font-medium">{template.name}</h4>
                        <div className="flex gap-1">
                          <Badge variant={getFrequencyColor(template.frequency)}>
                            {template.frequency.replace('_', ' ')}
                          </Badge>
                          <Badge variant="outline">
                            Every {adjustedInterval} days
                          </Badge>
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">{template.description}</p>
                      <div className="flex gap-2 text-xs text-muted-foreground">
                        <span>⏱️ {template.estimated_time}</span>
                        <span>📊 {template.difficulty}</span>
                        <span>🎯 {template.priority} priority</span>
                      </div>
                    </div>
                  );
                })}
                
                <div className="flex justify-end gap-2 pt-4 border-t">
                  <Button variant="outline" onClick={() => setShowPreview(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleGenerateSchedule} disabled={isGeneratingSchedules}>
                    {isGeneratingSchedules ? 'Generating...' : 'Generate Schedule'}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>

          <Button 
            onClick={handleGenerateSchedule}
            disabled={!selectedTank || !tankType || isGeneratingSchedules}
            className="flex-1"
          >
            {isGeneratingSchedules ? (
              <>Generating...</>
            ) : (
              <>
                <Sparkles className="h-4 w-4 mr-2" />
                Generate Schedule
              </>
            )}
          </Button>
        </div>

        {/* Help Text */}
        <div className="text-sm text-muted-foreground space-y-1">
          <p>💡 <strong>Smart Scheduling:</strong> Tasks are automatically adjusted based on:</p>
          <ul className="list-disc list-inside ml-4 space-y-1">
            <li>Your experience level (beginners get more frequent maintenance)</li>
            <li>Tank maturity (new tanks need more attention)</li>
            <li>Tank type (reef tanks require more maintenance than FOWLR)</li>
            <li>Tank size (larger tanks may have different requirements)</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};

export default ScheduleGenerator;
