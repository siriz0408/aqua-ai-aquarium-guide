
import React, { useMemo } from 'react';
import { Card } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Bot, User, Plus, Sparkles, Table, MessageCircle } from 'lucide-react';
import { Message } from '@/hooks/useChat';
import { ParsedTask, parseAIRecommendations } from '@/utils/taskParser';
import { format } from 'date-fns';
import { useToast } from '@/hooks/use-toast';
import { useTasks } from '@/hooks/useTasks';
import { Table as TableComponent, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

interface MessageBubbleProps {
  message: Message;
  onFollowUpClick?: (prompt: string) => void;
}

// Generate contextual follow-up questions based on AI response content
const generateFollowUpQuestions = (content: string): string[] => {
  const followUps: string[] = [];
  const lowerContent = content.toLowerCase();

  // Water parameter related follow-ups
  if (lowerContent.includes('water') || lowerContent.includes('parameter') || lowerContent.includes('test')) {
    followUps.push("What's the ideal testing schedule for these parameters?");
    followUps.push("How do I correct these water parameters if they're off?");
    followUps.push("What equipment do you recommend for maintaining stable water chemistry?");
  }

  // Fish/livestock related follow-ups
  if (lowerContent.includes('fish') || lowerContent.includes('coral') || lowerContent.includes('livestock')) {
    followUps.push("What are the compatibility requirements for these species?");
    followUps.push("What should I feed them and how often?");
    followUps.push("How do I know if they're healthy and thriving?");
  }

  // Equipment related follow-ups
  if (lowerContent.includes('equipment') || lowerContent.includes('filter') || lowerContent.includes('skimmer') || lowerContent.includes('lighting')) {
    followUps.push("What's the maintenance schedule for this equipment?");
    followUps.push("How do I know when it needs upgrading or replacement?");
    followUps.push("What are some alternative equipment options?");
  }

  // Problem/issue related follow-ups
  if (lowerContent.includes('problem') || lowerContent.includes('issue') || lowerContent.includes('sick') || lowerContent.includes('algae')) {
    followUps.push("What should I do if this problem persists?");
    followUps.push("How can I prevent this from happening again?");
    followUps.push("Are there any warning signs I should watch for?");
  }

  // Setup/planning related follow-ups
  if (lowerContent.includes('setup') || lowerContent.includes('plan') || lowerContent.includes('new') || lowerContent.includes('beginner')) {
    followUps.push("What's the typical timeline for this setup process?");
    followUps.push("What are the most common mistakes to avoid?");
    followUps.push("How much should I budget for this project?");
  }

  // Maintenance related follow-ups
  if (lowerContent.includes('maintenance') || lowerContent.includes('clean') || lowerContent.includes('change')) {
    followUps.push("How often should I perform these maintenance tasks?");
    followUps.push("What tools do I need for proper maintenance?");
    followUps.push("Can you create a maintenance schedule for me?");
  }

  // Generic follow-ups if no specific context
  if (followUps.length === 0) {
    followUps.push("Can you explain this in more detail?");
    followUps.push("What are the next steps I should take?");
    followUps.push("Are there any risks or precautions I should know about?");
  }

  // Return max 3 follow-ups
  return followUps.slice(0, 3);
};

// Component to render markdown-style content with enhanced table and checkbox support
const MarkdownContent: React.FC<{ content: string; onAddTask: (task: ParsedTask) => void }> = ({ content, onAddTask }) => {
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
    <div className="space-y-3">
      {parseContent.map((element, idx) => {
        if (element.type === 'table') {
          const tableData = element.content as string[][];
          return (
            <div key={idx} className="border rounded-lg overflow-hidden">
              <TableComponent>
                <TableHeader>
                  <TableRow>
                    {tableData[0]?.map((header, headerIdx) => (
                      <TableHead key={headerIdx} className="font-semibold">
                        {header}
                      </TableHead>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {tableData.slice(1).map((row, rowIdx) => (
                    <TableRow key={rowIdx}>
                      {row.map((cell, cellIdx) => (
                        <TableCell key={cellIdx} className="text-sm">
                          <span dangerouslySetInnerHTML={{ __html: formatText(cell) }} />
                        </TableCell>
                      ))}
                    </TableRow>
                  ))}
                </TableBody>
              </TableComponent>
            </div>
          );
        }

        if (element.type === 'checkbox' && element.task) {
          return (
            <div key={idx} className="flex items-start gap-3 p-3 bg-background/50 rounded-lg border border-border/50">
              <input type="checkbox" className="mt-1 h-4 w-4 rounded border-border" />
              <div className="flex-1 min-w-0">
                <p className="text-sm" dangerouslySetInnerHTML={{ __html: formatText(element.content as string) }} />
              </div>
              <Button
                size="sm"
                variant="outline"
                onClick={() => onAddTask(element.task!)}
                className="shrink-0 h-7 text-xs px-2"
              >
                <Plus className="h-3 w-3 mr-1" />
                Add Task
              </Button>
            </div>
          );
        }

        return (
          <div
            key={idx}
            className="prose prose-sm max-w-none dark:prose-invert [&_strong]:font-semibold [&_li]:list-disc [&_li]:ml-4"
            dangerouslySetInnerHTML={{ __html: formatText(element.content as string) }}
          />
        );
      })}
    </div>
  );
};

export const MessageBubble: React.FC<MessageBubbleProps> = ({ message, onFollowUpClick }) => {
  const isUser = message.role === 'user';
  const { toast } = useToast();
  const { createTask } = useTasks();
  
  // Parse AI responses for actionable tasks
  const parsedTasks = !isUser ? parseAIRecommendations(message.content) : [];
  
  // Generate follow-up questions for AI responses
  const followUpQuestions = !isUser ? generateFollowUpQuestions(message.content) : [];

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
    <div className={`flex gap-3 ${isUser ? 'flex-row-reverse' : 'flex-row'} mb-4`}>
      <Avatar className="h-8 w-8 mt-1">
        <AvatarFallback className={isUser ? 'bg-primary text-primary-foreground' : 'bg-secondary'}>
          {isUser ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
        </AvatarFallback>
      </Avatar>
      
      <div className={`flex-1 max-w-[80%] ${isUser ? 'items-end' : 'items-start'} flex flex-col`}>
        <Card className={`p-3 ${isUser ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>
          {isUser ? (
            <div className="prose prose-sm max-w-none dark:prose-invert">
              <p className="whitespace-pre-wrap m-0">{message.content}</p>
            </div>
          ) : (
            <MarkdownContent content={message.content} onAddTask={addToPlanner} />
          )}
          
          {/* Task suggestions for AI messages - only show if no checkboxes are already in content */}
          {!isUser && parsedTasks.length > 0 && !message.content.includes('☐') && (
            <div className="mt-3 pt-3 border-t border-border/50">
              <p className="text-xs font-medium mb-2 flex items-center gap-1">
                <Sparkles className="h-3 w-3" />
                Found {parsedTasks.length} actionable items:
              </p>
              <div className="space-y-1">
                {parsedTasks.slice(0, 3).map((task, idx) => (
                  <div 
                    key={idx} 
                    className="flex items-center justify-between gap-2 p-2 rounded bg-background/50"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium truncate">{task.title}</p>
                      <p className="text-xs text-muted-foreground">
                        {task.category} • {task.priority} priority
                      </p>
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => addToPlanner(task)}
                      className="shrink-0 h-6 text-xs"
                    >
                      <Plus className="h-3 w-3 mr-1" />
                      Add
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </Card>
        
        {/* Follow-up questions for AI responses */}
        {!isUser && followUpQuestions.length > 0 && onFollowUpClick && (
          <div className="mt-3 w-full">
            <p className="text-xs font-medium mb-2 flex items-center gap-1 text-muted-foreground">
              <MessageCircle className="h-3 w-3" />
              Follow-up questions:
            </p>
            <div className="space-y-1">
              {followUpQuestions.map((question, idx) => (
                <Button
                  key={idx}
                  variant="ghost"
                  size="sm"
                  className="h-auto p-2 text-xs text-left justify-start w-full bg-background/50 hover:bg-background border border-border/30 hover:border-border"
                  onClick={() => onFollowUpClick(question)}
                >
                  {question}
                </Button>
              ))}
            </div>
          </div>
        )}
        
        <span className="text-xs text-muted-foreground mt-1">
          {format(new Date(message.created_at), 'HH:mm')}
        </span>
      </div>
    </div>
  );
};
