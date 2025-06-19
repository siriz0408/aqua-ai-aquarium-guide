
export const generateSetupPlan = async (planData: any) => {
  console.log('generateSetupPlan called with:', planData);
  
  // Simulate AI generation with realistic delay
  await new Promise(resolve => setTimeout(resolve, 3000));
  
  // Extract tank dimensions or use defaults
  const length = planData.tankSpecs.length || '48';
  const width = planData.tankSpecs.width || '18';
  const height = planData.tankSpecs.height || '20';
  
  // Calculate gallons from dimensions
  const gallons = Math.round((parseInt(length) * parseInt(width) * parseInt(height)) / 231);
  
  const plan = {
    tankSize: `${length}"L x ${width}"W x ${height}"H`,
    estimatedGallons: gallons,
    tankType: planData.tankSpecs.goals || 'Mixed Reef',
    experienceLevel: planData.tankSpecs.experienceLevel || 'Beginner',
    budgetRange: planData.budgetTimeline.budgetRange || '$1000-2000',
    aestheticStyle: planData.budgetTimeline.aestheticPreferences || 'Natural',
    equipment: [
      { item: 'Tank + Stand', price: '$600-800', priority: 'Essential', category: 'Tank System' },
      { item: 'Protein Skimmer', price: '$200-400', priority: 'Essential', category: 'Filtration' },
      { item: 'Return Pump', price: '$100-200', priority: 'Essential', category: 'Circulation' },
      { item: 'Heater (200W)', price: '$30-50', priority: 'Essential', category: 'Climate' },
      { item: 'LED Lighting', price: '$300-600', priority: 'Essential', category: 'Lighting' },
      { item: 'Live Rock (50lbs)', price: '$200-300', priority: 'Essential', category: 'Biologics' },
      { item: 'Salt Mix', price: '$40-60', priority: 'Essential', category: 'Water' },
      { item: 'Test Kits', price: '$80-120', priority: 'Essential', category: 'Monitoring' },
      { item: 'Powerheads (2x)', price: '$100-200', priority: 'Recommended', category: 'Circulation' },
      { item: 'Auto Top Off', price: '$150-250', priority: 'Recommended', category: 'Automation' },
    ],
    compatibleLivestock: [
      'Ocellaris Clownfish (pair)',
      'Yellow Watchman Goby',
      'Coral Beauty Angelfish',
      'Cleaner Shrimp',
      'Hermit Crabs (cleanup crew)',
      'Turbo Snails (cleanup crew)',
    ],
    timeline: [
      'Week 1-2: Set up equipment, add saltwater and live rock',
      'Week 3-6: Nitrogen cycle (test daily, no fish yet)',
      'Week 7: Add first fish (clownfish pair)',
      'Week 9: Add cleanup crew',
      'Week 11: Add second fish species',
      'Month 3+: Begin adding corals (if reef tank)',
    ],
    totalEstimate: `$1,400 - $2,200`,
    monthlyMaintenance: '$30-50',
    recommendations: {
      beginner: planData.tankSpecs.experienceLevel === 'beginner',
      reef: planData.tankSpecs.goals?.includes('reef') || false,
      budget: planData.budgetTimeline.budgetRange?.includes('1000') || false
    },
    // Include original data for saving
    tankSpecs: planData.tankSpecs,
    budgetTimeline: planData.budgetTimeline,
  };

  console.log('Plan generated successfully:', plan);
  return plan;
};
