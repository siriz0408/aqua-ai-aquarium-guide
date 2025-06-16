
import React from 'react';
import { Card } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Bot, User, Plus, Sparkles } from 'lucide-react';
import { Message } from '@/hooks/useChat';
import { ParsedTask, parseAIRecommendations } from '@/utils/taskParser';
import { format } from 'date-fns';
import { useToast } from '@/hooks/use-toast';
import { useTasks } from '@/hooks/useTasks';

interface MessageBubbleProps {
  message: Message;
}

// Component to render markdown-style content
const MarkdownContent: React.FC<{ content: string }> = ({ content }) => {
  // Convert markdown-style formatting to HTML
  const formatContent = (text: string) => {
    return text
      // Bold text **text** or __text__
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/__(.*?)__/g, '<strong>$1</strong>')
      // Checkboxes ☐ or [ ]
      .replace(/☐\s*(.*?)$/gm, '<label class="flex items-center gap-2 my-1"><input type="checkbox" class="rounded border-border" /> <span>$1</span></label>')
      .replace(/\[\s*\]\s*(.*?)$/gm, '<label class="flex items-center gap-2 my-1"><input type="checkbox" class="rounded border-border" /> <span>$1</span></label>')
      // Bullet points • or -
      .replace(/^[•\-]\s*(.*?)$/gm, '<li class="ml-4">$1</li>')
      // Line breaks
      .replace(/\n/g, '<br />');
  };

  return (
    <div 
      className="prose prose-sm max-w-none dark:prose-invert [&_strong]:font-semibold [&_li]:list-disc [&_li]:ml-4 [&_input]:w-4 [&_input]:h-4"
      dangerouslySetInnerHTML={{ __html: formatContent(content) }}
    />
  );
};

export const MessageBubble: React.FC<MessageBubbleProps> = ({ message }) => {
  const isUser = message.role === 'user';
  const { toast } = useToast();
  const { createTask } = useTasks();
  
  // Parse AI responses for actionable tasks
  const parsedTasks = !isUser ? parseAIRecommendations(message.content) : [];

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
            <MarkdownContent content={message.content} />
          )}
          
          {/* Task suggestions for AI messages */}
          {!isUser && parsedTasks.length > 0 && (
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
        <span className="text-xs text-muted-foreground mt-1">
          {format(new Date(message.created_at), 'HH:mm')}
        </span>
      </div>
    </div>
  );
};
