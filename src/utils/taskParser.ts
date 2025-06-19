
export interface ParsedTask {
  title: string;
  description: string;
  frequency?: string;
  priority?: 'low' | 'medium' | 'high';
  category?: string;
  dueDate?: Date;
  source?: 'ai_response' | 'manual' | 'template';
}

export function parseAIRecommendations(aiResponse: string): ParsedTask[] {
  const tasks: ParsedTask[] = [];
  
  // Enhanced action patterns for better task identification
  const actionPatterns = [
    // Direct recommendations
    /(?:you should|make sure to|i recommend|recommend that you|suggest that you|important to)\s+(.+?)(?:\.|$)/gi,
    // Time-based patterns
    /(?:check|test|monitor|inspect|clean|replace|adjust)\s+(.+?)(?:in|after|within)\s+(\d+\s*(?:hours?|days?|weeks?|months?))/gi,
    // Maintenance tasks
    /(?:perform|do|conduct|carry out)\s+(.+?)(?:\.|$)/gi,
    // Conditional actions
    /(?:if|when|once)\s+(.+?),?\s+(?:then\s+)?(.+?)(?:\.|$)/gi,
    // Numbered/bulleted lists
    /(?:^\d+\.\s*|^[•\-*]\s*)(.+?)(?:\.|$)/gm,
    // Imperative commands
    /^(?:add|remove|increase|decrease|adjust|set|change|replace|clean|test|monitor|check)\s+(.+?)(?:\.|$)/gmi,
  ];
  
  // Time extraction patterns
  const timePatterns = [
    /(?:in|after|within)\s+(\d+)\s*(hours?|days?|weeks?|months?)/gi,
    /(?:every|each)\s+(\d+)\s*(hours?|days?|weeks?|months?)/gi,
    /(?:daily|weekly|monthly|quarterly)/gi,
  ];
  
  // Categories based on keywords
  const categories: Record<string, string> = {
    'water change': 'water_management',
    'test': 'testing',
    'feed': 'feeding',
    'clean': 'maintenance',
    'add': 'dosing',
    'dose': 'dosing',
    'check': 'observation',
    'monitor': 'observation',
    'quarantine': 'health',
    'treat': 'health',
    'replace': 'equipment',
    'adjust': 'equipment',
    'calibrate': 'equipment',
    'temperature': 'environment',
    'lighting': 'environment',
    'flow': 'environment',
    'coral': 'livestock',
    'fish': 'livestock',
    'algae': 'maintenance',
    'protein skimmer': 'equipment',
    'filter': 'equipment',
  };
  
  // Priority keywords
  const priorityKeywords = {
    high: ['urgent', 'immediately', 'asap', 'critical', 'emergency', 'now'],
    medium: ['soon', 'important', 'should', 'recommend'],
    low: ['consider', 'optional', 'when possible', 'eventually', 'if needed'],
  };
  
  // Extract tasks using patterns
  actionPatterns.forEach(pattern => {
    let match;
    while ((match = pattern.exec(aiResponse)) !== null) {
      const taskText = match[1]?.trim();
      if (!taskText || taskText.length < 5 || taskText.length > 300) continue;
      
      // Skip if it's a question or conditional statement without action
      if (taskText.match(/^(?:what|how|why|when|where|which|is|are|can|could|would|should)\s/i)) continue;
      
      // Clean up the task text
      const cleanText = taskText.replace(/[^\w\s\-.,()]/g, '').trim();
      if (cleanText.length < 5) continue;
      
      // Determine category
      let category = 'general';
      const lowerText = cleanText.toLowerCase();
      for (const [keyword, cat] of Object.entries(categories)) {
        if (lowerText.includes(keyword)) {
          category = cat;
          break;
        }
      }
      
      // Determine priority
      let priority: 'low' | 'medium' | 'high' = 'medium';
      for (const [level, keywords] of Object.entries(priorityKeywords)) {
        if (keywords.some(keyword => lowerText.includes(keyword))) {
          priority = level as 'low' | 'medium' | 'high';
          break;
        }
      }
      
      // Extract timing information
      let dueDate: Date | undefined;
      let frequency: string | undefined;
      
      const timeMatch = lowerText.match(/(?:in|after|within)\s+(\d+)\s*(hour|day|week|month)s?/);
      if (timeMatch) {
        const amount = parseInt(timeMatch[1]);
        const unit = timeMatch[2];
        dueDate = new Date();
        
        switch (unit) {
          case 'hour':
            dueDate.setHours(dueDate.getHours() + amount);
            break;
          case 'day':
            dueDate.setDate(dueDate.getDate() + amount);
            break;
          case 'week':
            dueDate.setDate(dueDate.getDate() + (amount * 7));
            break;
          case 'month':
            dueDate.setMonth(dueDate.getMonth() + amount);
            break;
        }
      }
      
      const frequencyMatch = lowerText.match(/(?:every|each)\s+(\d+)\s*(hour|day|week|month)s?/);
      if (frequencyMatch) {
        frequency = `${frequencyMatch[1]} ${frequencyMatch[2]}${parseInt(frequencyMatch[1]) > 1 ? 's' : ''}`;
      } else if (lowerText.includes('daily')) {
        frequency = 'daily';
      } else if (lowerText.includes('weekly')) {
        frequency = 'weekly';
      } else if (lowerText.includes('monthly')) {
        frequency = 'monthly';
      }
      
      // Generate title (first 8 words)
      const words = cleanText.split(' ');
      const title = words.slice(0, 8).join(' ') + (words.length > 8 ? '...' : '');
      
      tasks.push({
        title: title,
        description: cleanText,
        category,
        priority,
        dueDate,
        frequency,
        source: 'ai_response'
      });
    }
  });
  
  // Remove duplicates based on similar content
  const uniqueTasks = tasks.filter((task, index, self) => {
    return index === self.findIndex(t => 
      t.title.toLowerCase() === task.title.toLowerCase() ||
      t.description.toLowerCase() === task.description.toLowerCase()
    );
  });
  
  // Sort by priority (high -> medium -> low)
  const priorityOrder = { high: 3, medium: 2, low: 1 };
  return uniqueTasks
    .sort((a, b) => priorityOrder[b.priority || 'medium'] - priorityOrder[a.priority || 'medium'])
    .slice(0, 5); // Limit to 5 most relevant tasks
}
