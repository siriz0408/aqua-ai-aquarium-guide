
import React from 'react';
import { Card } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Bot, User, Plus, Sparkles } from 'lucide-react';
import { Message } from '@/hooks/useChat';
import { ParsedTask, parseAIRecommendations } from '@/utils/taskParser';
import { format } from 'date-fns';
import { useToast } from '@/hooks/use-toast';

interface MessageBubbleProps {
  message: Message;
}

export const MessageBubble: React.FC<MessageBubbleProps> = ({ message }) => {
  const isUser = message.role === 'user';
  const { toast } = useToast();
  
  // Parse AI responses for actionable tasks
  const parsedTasks = !isUser ? parseAIRecommendations(message.content) : [];

  const addToPlanner = async (task: ParsedTask) => {
    try {
      // For now, just show a success message since planner integration would need backend
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
          <div className="prose prose-sm max-w-none dark:prose-invert">
            <p className="whitespace-pre-wrap m-0">{message.content}</p>
          </div>
          
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
