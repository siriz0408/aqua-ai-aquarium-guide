import React, { useMemo, useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Bot, User, Plus, Sparkles, MessageCircle } from 'lucide-react';
import { Message } from '@/hooks/useChat';
import { ParsedTask, parseAIRecommendations } from '@/utils/taskParser';
import { format } from 'date-fns';
import { useToast } from '@/hooks/use-toast';
import { useTasks } from '@/hooks/useTasks';
import { Table as TableComponent, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useIsMobile } from '@/hooks/use-mobile';
import { cn } from '@/lib/utils';

interface MessageBubbleProps {
  message: Message;
  onFollowUpClick?: (prompt: string) => void;
}

// Enhanced contextual follow-up question generator
const generateContextualFollowUps = (content: string): string[] => {
  const followUps: string[] = [];
  const lowerContent = content.toLowerCase();

  // Water parameter analysis
  if (lowerContent.includes('ph') || lowerContent.includes('alkalinity') || lowerContent.includes('salinity')) {
    followUps.push("How often should I test these water parameters?");
    followUps.push("What causes these parameters to fluctuate?");
    followUps.push("Which parameter should I prioritize adjusting first?");
  }
  
  // Temperature issues
  else if (lowerContent.includes('temperature') || lowerContent.includes('heating') || lowerContent.includes('cooling')) {
    followUps.push("What's the ideal temperature range for my tank type?");
    followUps.push("How quickly can I safely adjust temperature?");
    followUps.push("What equipment do you recommend for temperature control?");
  }
  
  // Disease/health problems
  else if (lowerContent.includes('ich') || lowerContent.includes('disease') || lowerContent.includes('sick') || lowerContent.includes('infection')) {
    followUps.push("How long should I continue this treatment?");
    followUps.push("What are signs the treatment is working?");
    followUps.push("How can I prevent this from happening again?");
  }
  
  // Algae problems
  else if (lowerContent.includes('algae') || lowerContent.includes('green') || lowerContent.includes('brown algae') || lowerContent.includes('hair algae')) {
    followUps.push("What lighting changes should I make?");
    followUps.push("How do I adjust my feeding schedule?");
    followUps.push("Which cleanup crew would help with this algae?");
  }
  
  // Coral care
  else if (lowerContent.includes('coral') || lowerContent.includes('polyp') || lowerContent.includes('calcium') || lowerContent.includes('magnesium')) {
    followUps.push("What lighting requirements do these corals have?");
    followUps.push("How should I dose calcium and alkalinity?");
    followUps.push("What are signs of coral stress to watch for?");
  }
  
  // Fish compatibility
  else if (lowerContent.includes('fish') || lowerContent.includes('compatibility') || lowerContent.includes('aggressive') || lowerContent.includes('peaceful')) {
    followUps.push("What order should I add these fish?");
    followUps.push("How long should I quarantine new fish?");
    followUps.push("What are signs of fish stress or aggression?");
  }
  
  // Equipment recommendations
  else if (lowerContent.includes('equipment') || lowerContent.includes('filter') || lowerContent.includes('skimmer') || lowerContent.includes('pump')) {
    followUps.push("What size/capacity do I need for my tank?");
    followUps.push("How often does this equipment need maintenance?");
    followUps.push("What are alternative options in my budget range?");
  }
  
  // Water changes
  else if (lowerContent.includes('water change') || lowerContent.includes('salt mix') || lowerContent.includes('rodi')) {
    followUps.push("How do I prepare saltwater for water changes?");
    followUps.push("What's the best schedule for my tank size?");
    followUps.push("Should I vacuum the substrate during changes?");
  }
  
  // Tank setup/cycling
  else if (lowerContent.includes('cycle') || lowerContent.includes('setup') || lowerContent.includes('new tank') || lowerContent.includes('ammonia')) {
    followUps.push("How long does the cycling process typically take?");
    followUps.push("When can I add my first fish safely?");
    followUps.push("What should I do if ammonia spikes occur?");
  }
  
  // Feeding related
  else if (lowerContent.includes('feed') || lowerContent.includes('food') || lowerContent.includes('nutrition') || lowerContent.includes('diet')) {
    followUps.push("How much should I feed at each feeding?");
    followUps.push("What's the best feeding schedule?");
    followUps.push("How can I tell if I'm overfeeding?");
  }
  
  // Lighting issues
  else if (lowerContent.includes('light') || lowerContent.includes('led') || lowerContent.includes('spectrum') || lowerContent.includes('photoperiod')) {
    followUps.push("What photoperiod schedule should I use?");
    followUps.push("How do I prevent algae with lighting changes?");
    followUps.push("When should I upgrade my lighting system?");
  }
  
  // Generic troubleshooting
  else if (lowerContent.includes('problem') || lowerContent.includes('issue') || lowerContent.includes('help') || lowerContent.includes('wrong')) {
    followUps.push("What should I monitor closely over the next few days?");
    followUps.push("Are there any warning signs I should watch for?");
    followUps.push("What's the most important step to take first?");
  }
  
  // Planning/setup advice
  else if (lowerContent.includes('plan') || lowerContent.includes('recommend') || lowerContent.includes('suggest') || lowerContent.includes('consider')) {
    followUps.push("What's the timeline for implementing these changes?");
    followUps.push("What's the estimated cost for this approach?");
    followUps.push("What are the most critical items to prioritize?");
  }
  
  // Generic fallbacks if no specific context is found
  if (followUps.length === 0) {
    followUps.push("Can you explain this in more detail?");
    followUps.push("What are the next steps I should take?");
    followUps.push("Are there any risks or precautions I should know about?");
  }

  // Return exactly 3 follow-ups, shuffling if we have more
  if (followUps.length > 3) {
    const shuffled = followUps.sort(() => 0.5 - Math.random());
    return shuffled.slice(0, 3);
  }
  
  return followUps;
};

// Component to render markdown-style content with enhanced table and checkbox support
const MarkdownContent: React.FC<{ content: string; onAddTask: (task: ParsedTask) => void }> = ({ content, onAddTask }) => {
  const isMobile = useIsMobile();

  // Extract and parse tables from markdown
  const parseContent = useMemo(() => {
    const lines = content.split('\n');
    const elements: Array<{ type: 'text' | 'table' | 'checkbox'; content: string | string[][]; task?: ParsedTask }> = [];
    let currentText = '';
    let i = 0;

    while (i < lines.length) {
      const line = lines[i].trim();
      
      // Check for table start (header row with |)
      if (line.includes('|') && lines[i + 1]?.includes('---')) {
        // Save any accumulated text
        if (currentText.trim()) {
          elements.push({ type: 'text', content: currentText });
          currentText = '';
        }

        // Parse table
        const tableRows: string[][] = [];
        let tableIndex = i;
        
        // Parse header
        const headerCells = line.split('|').map(cell => cell.trim()).filter(cell => cell);
        tableRows.push(headerCells);
        
        // Skip separator row
        tableIndex += 2;
        
        // Parse data rows
        while (tableIndex < lines.length && lines[tableIndex].trim().includes('|')) {
          const rowCells = lines[tableIndex].split('|').map(cell => cell.trim()).filter(cell => cell);
          if (rowCells.length > 0) {
            tableRows.push(rowCells);
          }
          tableIndex++;
        }
        
        elements.push({ type: 'table', content: tableRows });
        i = tableIndex;
        continue;
      }
      
      // Check for checkbox tasks
      if (line.startsWith('☐') || line.match(/^\[\s*\]/)) {
        // Save any accumulated text
        if (currentText.trim()) {
          elements.push({ type: 'text', content: currentText });
          currentText = '';
        }

        // Extract task information
        const taskText = line.replace(/^[☐\[\s\]]+/, '').trim();
        const task: ParsedTask = {
          title: taskText.split(' - ')[0].replace(/\*\*/g, ''),
          description: taskText,
          category: 'maintenance',
          priority: 'medium'
        };

        elements.push({ type: 'checkbox', content: taskText, task });
        i++;
        continue;
      }

      // Accumulate regular text
      currentText += line + '\n';
      i++;
    }

    // Add any remaining text
    if (currentText.trim()) {
      elements.push({ type: 'text', content: currentText });
    }

    return elements;
  }, [content]);

  // Format regular text content
  const formatText = (text: string) => {
    return text
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/__(.*?)__/g, '<strong>$1</strong>')
      .replace(/^[•\-]\s*(.*?)$/gm, '<li class="ml-4 list-disc">$1</li>')
      .replace(/\n/g, '<br />');
  };

  return (
    <div className="space-y-2 sm:space-y-3">
      {parseContent.map((element, idx) => {
        if (element.type === 'table') {
          const tableData = element.content as string[][];
          return (
            <div key={idx} className="border rounded-lg overflow-hidden">
              <div className={cn(
                "overflow-x-auto",
                isMobile && "max-w-[280px]"
              )}>
                <TableComponent>
                  <TableHeader>
                    <TableRow>
                      {tableData[0]?.map((header, headerIdx) => (
                        <TableHead key={headerIdx} className={cn(
                          "font-semibold whitespace-nowrap",
                          isMobile ? "text-xs px-2 py-1" : "text-sm"
                        )}>
                          {header}
                        </TableHead>
                      ))}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {tableData.slice(1).map((row, rowIdx) => (
                      <TableRow key={rowIdx}>
                        {row.map((cell, cellIdx) => (
                          <TableCell key={cellIdx} className={cn(
                            isMobile ? "text-xs px-2 py-1" : "text-sm"
                          )}>
                            <span dangerouslySetInnerHTML={{ __html: formatText(cell) }} />
                          </TableCell>
                        ))}
                      </TableRow>
                    ))}
                  </TableBody>
                </TableComponent>
              </div>
            </div>
          );
        }

        if (element.type === 'checkbox' && element.task) {
          return (
            <div key={idx} className={cn(
              "flex items-start gap-2 sm:gap-3 p-2 sm:p-3 bg-background/50 rounded-lg border border-border/50",
              isMobile && "text-sm"
            )}>
              <input type="checkbox" className={cn(
                "mt-1 rounded border-border",
                isMobile ? "h-3 w-3" : "h-4 w-4"
              )} />
              <div className="flex-1 min-w-0">
                <p className={cn(
                  isMobile ? "text-xs" : "text-sm"
                )} dangerouslySetInnerHTML={{ __html: formatText(element.content as string) }} />
              </div>
              <Button
                size="sm"
                variant="outline"
                onClick={() => onAddTask(element.task!)}
                className={cn(
                  "shrink-0",
                  isMobile ? "h-6 text-xs px-1" : "h-7 text-xs px-2"
                )}
              >
                <Plus className={cn(
                  "mr-1",
                  isMobile ? "h-2 w-2" : "h-3 w-3"
                )} />
                Add Task
              </Button>
            </div>
          );
        }

        return (
          <div
            key={idx}
            className={cn(
              "prose prose-sm max-w-none dark:prose-invert [&_strong]:font-semibold [&_li]:list-disc [&_li]:ml-4",
              isMobile && "prose-xs [&_p]:text-sm [&_li]:text-sm"
            )}
            dangerouslySetInnerHTML={{ __html: formatText(element.content as string) }}
          />
        );
      })}
    </div>
  );
};

// Animated Follow-up Questions Component
const FollowUpQuestions: React.FC<{
  questions: string[];
  onQuestionClick: (question: string) => void;
  isMobile: boolean;
}> = ({ questions, onQuestionClick, isMobile }) => {
  const [showQuestions, setShowQuestions] = useState(false);
  const [clickedQuestions, setClickedQuestions] = useState<Set<number>>(new Set());

  useEffect(() => {
    // Animate in after a short delay
    const timer = setTimeout(() => setShowQuestions(true), 500);
    return () => clearTimeout(timer);
  }, []);

  const handleQuestionClick = (question: string, index: number) => {
    // Track clicked questions for analytics
    console.log('Follow-up question clicked:', question);
    setClickedQuestions(prev => new Set([...prev, index]));
    onQuestionClick(question);
  };

  return (
    <div className={cn(
      "mt-2 sm:mt-3 w-full transition-all duration-500 ease-out",
      showQuestions ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2",
      isMobile && "max-w-full"
    )}>
      <p className={cn(
        "font-medium mb-2 flex items-center gap-1 text-muted-foreground",
        isMobile ? "text-xs" : "text-xs"
      )}>
        <MessageCircle className={cn(
          isMobile ? "h-2 w-2" : "h-3 w-3"
        )} />
        Quick questions:
      </p>
      <div className="space-y-1">
        {questions.map((question, idx) => (
          <div
            key={idx}
            className={cn(
              "transition-all duration-300 ease-out",
              showQuestions ? "opacity-100 translate-x-0" : "opacity-0 translate-x-4"
            )}
            style={{ transitionDelay: `${idx * 100}ms` }}
          >
            <Button
              variant="ghost"
              size="sm"
              className={cn(
                "h-auto p-2 text-left justify-start w-full bg-background/50 hover:bg-background border border-border/30 hover:border-border transition-all duration-200",
                clickedQuestions.has(idx) && "opacity-60 bg-muted",
                isMobile ? "text-xs" : "text-xs"
              )}
              onClick={() => handleQuestionClick(question, idx)}
              disabled={clickedQuestions.has(idx)}
            >
              <span className="text-left leading-relaxed">{question}</span>
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
};

export const MessageBubble: React.FC<MessageBubbleProps> = ({ message, onFollowUpClick }) => {
  const isUser = message.role === 'user';
  const { toast } = useToast();
  const { createTask } = useTasks();
  const isMobile = useIsMobile();
  
  // Parse AI responses for actionable tasks
  const parsedTasks = !isUser ? parseAIRecommendations(message.content) : [];
  
  // Generate enhanced contextual follow-up questions for AI responses
  const followUpQuestions = !isUser ? generateContextualFollowUps(message.content) : [];

  const addToPlanner = async (task: ParsedTask) => {
    try {
      createTask({
        title: task.title,
        description: task.description || '',
        task_type: task.category,
        priority: task.priority as 'low' | 'medium' | 'high' | 'urgent',
        conversation_id: message.conversation_id,
      });
      
      toast({
        title: "Task added",
        description: `"${task.title}" added to your maintenance planner`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add task to planner",
        variant: "destructive"
      });
    }
  };
  
  return (
    <div className={cn(
      "flex gap-2 sm:gap-3 mb-3 sm:mb-4",
      isUser ? "flex-row-reverse" : "flex-row"
    )}>
      <Avatar className={cn(
        "mt-1 flex-shrink-0",
        isMobile ? "h-6 w-6" : "h-8 w-8"
      )}>
        <AvatarFallback className={isUser ? 'bg-primary text-primary-foreground' : 'bg-secondary'}>
          {isUser ? (
            <User className={isMobile ? "h-3 w-3" : "h-4 w-4"} />
          ) : (
            <Bot className={isMobile ? "h-3 w-3" : "h-4 w-4"} />
          )}
        </AvatarFallback>
      </Avatar>
      
      <div className={cn(
        "flex-1 min-w-0 flex flex-col",
        isUser ? "items-end" : "items-start",
        isMobile && "max-w-[85%]"
      )}>
        <Card className={cn(
          "p-2 sm:p-3",
          isUser ? 'bg-primary text-primary-foreground' : 'bg-muted',
          isMobile && "max-w-full"
        )}>
          {isUser ? (
            <div className="prose prose-sm max-w-none dark:prose-invert">
              <p className={cn(
                "whitespace-pre-wrap m-0",
                isMobile ? "text-sm" : "text-base"
              )}>{message.content}</p>
            </div>
          ) : (
            <MarkdownContent content={message.content} onAddTask={addToPlanner} />
          )}
          
          {/* Task suggestions for AI messages - only show if no checkboxes are already in content */}
          {!isUser && parsedTasks.length > 0 && !message.content.includes('☐') && (
            <div className={cn(
              "mt-2 sm:mt-3 pt-2 sm:pt-3 border-t border-border/50"
            )}>
              <p className={cn(
                "font-medium mb-2 flex items-center gap-1",
                isMobile ? "text-xs" : "text-xs"
              )}>
                <Sparkles className={cn(
                  isMobile ? "h-2 w-2" : "h-3 w-3"
                )} />
                Found {parsedTasks.length} actionable items:
              </p>
              <div className="space-y-1">
                {parsedTasks.slice(0, 3).map((task, idx) => (
                  <div 
                    key={idx} 
                    className={cn(
                      "flex items-center justify-between gap-2 p-2 rounded bg-background/50",
                      isMobile && "text-xs"
                    )}
                  >
                    <div className="flex-1 min-w-0">
                      <p className={cn(
                        "font-medium truncate",
                        isMobile ? "text-xs" : "text-xs"
                      )}>{task.title}</p>
                      <p className={cn(
                        "text-muted-foreground",
                        isMobile ? "text-xs" : "text-xs"
                      )}>
                        {task.category} • {task.priority} priority
                      </p>
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => addToPlanner(task)}
                      className={cn(
                        "shrink-0",
                        isMobile ? "h-5 text-xs px-1" : "h-6 text-xs"
                      )}
                    >
                      <Plus className={cn(
                        "mr-1",
                        isMobile ? "h-2 w-2" : "h-3 w-3"
                      )} />
                      Add
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </Card>
        
        {/* Enhanced Follow-up questions for AI responses */}
        {!isUser && followUpQuestions.length > 0 && onFollowUpClick && (
          <FollowUpQuestions
            questions={followUpQuestions}
            onQuestionClick={onFollowUpClick}
            isMobile={isMobile}
          />
        )}
        
        <span className={cn(
          "text-muted-foreground mt-1",
          isMobile ? "text-xs" : "text-xs"
        )}>
          {format(new Date(message.created_at), 'HH:mm')}
        </span>
      </div>
    </div>
  );
};
