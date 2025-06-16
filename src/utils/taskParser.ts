
export interface ParsedTask {
  title: string;
  description: string;
  frequency?: string;
  priority?: 'low' | 'medium' | 'high';
  category?: string;
}

export function parseAIRecommendations(aiResponse: string): ParsedTask[] {
  const tasks: ParsedTask[] = [];
  
  // Patterns to identify actionable items
  const actionPatterns = [
    /(?:you should|recommend|suggest|need to|must)\s+(.+?)(?:\.|$)/gi,
    /(?:\d+\.\s*)(.+?)(?:\.|$)/gi, // Numbered lists
    /(?:•\s*)(.+?)(?:\.|$)/gi, // Bullet points
  ];
  
  // Keywords for categorization
  const categories: Record<string, string> = {
    'water change': 'maintenance',
    'test': 'testing',
    'feed': 'feeding',
    'clean': 'maintenance',
    'add': 'dosing',
    'check': 'observation',
    'quarantine': 'treatment',
    'treat': 'treatment'
  };
  
  // Extract tasks
  actionPatterns.forEach(pattern => {
    let match;
    while ((match = pattern.exec(aiResponse)) !== null) {
      const taskText = match[1].trim();
      
      // Skip if too short or too long
      if (taskText.length < 10 || taskText.length > 200) continue;
      
      // Determine category
      let category = 'general';
      for (const [keyword, cat] of Object.entries(categories)) {
        if (taskText.toLowerCase().includes(keyword)) {
          category = cat;
          break;
        }
      }
      
      // Determine priority based on keywords
      let priority: 'low' | 'medium' | 'high' = 'medium';
      if (taskText.match(/immediate|urgent|asap|critical/i)) {
        priority = 'high';
      } else if (taskText.match(/consider|optional|when possible/i)) {
        priority = 'low';
      }
      
      tasks.push({
        title: taskText.split(' ').slice(0, 5).join(' ') + '...',
        description: taskText,
        category,
        priority
      });
    }
  });
  
  return tasks;
}
