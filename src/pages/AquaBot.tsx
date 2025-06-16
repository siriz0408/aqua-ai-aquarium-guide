
import React, { useEffect, useRef, useState } from 'react';
import { Layout } from '@/components/Layout';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Loader2, MessageSquare, X, Globe } from 'lucide-react';
import { useChat } from '@/hooks/useChat';
import { useWebSearch } from '@/hooks/useWebSearch';
import { useIsMobile } from '@/hooks/use-mobile';
import { ConversationList } from '@/components/chat/ConversationList';
import { MessageBubble } from '@/components/chat/MessageBubble';
import { ChatInput } from '@/components/chat/ChatInput';
import { QuickPrompts } from '@/components/chat/QuickPrompts';
import { PlanIntegration } from '@/components/chat/PlanIntegration';
import { Badge } from '@/components/ui/badge';

interface FileAttachment {
  name: string;
  url: string;
  type: string;
  size: number;
  preview?: string;
}

const AquaBot = () => {
  const {
    conversations,
    messages,
    currentConversationId,
    conversationsLoading,
    messagesLoading,
    isLoading,
    sendMessage,
    setCurrentConversationId,
    createNewConversation,
    deleteConversation,
  } = useChat();

  const { searchWeb, isSearching } = useWebSearch();
  const [showSidebar, setShowSidebar] = useState(false);
  const [webSearchEnabled, setWebSearchEnabled] = useState(false);
  const isMobile = useIsMobile();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Auto-hide sidebar on mobile
  useEffect(() => {
    if (isMobile) {
      setShowSidebar(false);
    }
  }, [isMobile]);

  const handleSendMessage = async (message: string, attachments?: FileAttachment[]) => {
    console.log('Handling send message with attachments:', attachments?.length || 0);
    
    let finalMessage = message;
    
    // If web search is enabled, search for relevant information first
    if (webSearchEnabled && message.trim()) {
      const searchQuery = `marine aquarium ${message}`;
      const searchResult = await searchWeb(searchQuery);
      
      if (searchResult.success) {
        finalMessage = `${message}\n\n[Web Search Results]:\n${searchResult.content}`;
      }
    }
    
    await sendMessage(finalMessage, !currentConversationId, attachments);
  };

  const handleQuickPrompt = async (prompt: string) => {
    await handleSendMessage(prompt);
  };

  const handlePlanIntegration = async (planData: string, action: 'checklist' | 'reminders') => {
    await handleSendMessage(planData);
  };

  return (
    <Layout title="AquaBot" showBackButton>
      <div className="h-[calc(100vh-8rem)] flex bg-background rounded-lg border border-border overflow-hidden relative">
        {/* Mobile overlay when sidebar is open */}
        {showSidebar && isMobile && (
          <div 
            className="fixed inset-0 bg-black/50 z-40 md:hidden"
            onClick={() => setShowSidebar(false)}
          />
        )}

        {/* Conversation Sidebar */}
        <div className={`
          ${showSidebar ? 'translate-x-0' : '-translate-x-full'}
          fixed md:relative
          w-80 h-full
          bg-background
          border-r border-border
          transition-transform duration-300 ease-in-out
          z-50 md:z-0
          ${!showSidebar ? 'md:w-0' : 'md:translate-x-0'}
          overflow-hidden
        `}>
          <div className="h-full flex flex-col">
            {/* Mobile header */}
            <div className="flex justify-between items-center p-4 border-b border-border md:hidden">
              <h3 className="font-semibold">Chat History</h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowSidebar(false)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            
            {/* Conversation List */}
            <ConversationList
              conversations={conversations}
              currentConversationId={currentConversationId}
              onSelectConversation={(id) => {
                setCurrentConversationId(id);
                if (isMobile) setShowSidebar(false);
              }}
              onNewConversation={() => {
                createNewConversation();
                if (isMobile) setShowSidebar(false);
              }}
              onDeleteConversation={deleteConversation}
              isLoading={conversationsLoading}
            />
          </div>
        </div>

        {/* Main Chat Area */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* Chat Header */}
          <div className="border-b border-border p-4 flex items-center gap-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowSidebar(!showSidebar)}
              className="flex items-center gap-2"
            >
              <MessageSquare className="h-4 w-4" />
              <span className="hidden sm:inline">
                {showSidebar ? 'Hide' : 'Show'} History
              </span>
            </Button>
            <h2 className="font-semibold flex-1 text-center">
              AquaBot Assistant
            </h2>
            <div className="flex items-center gap-2">
              <Button
                variant={webSearchEnabled ? "default" : "outline"}
                size="sm"
                onClick={() => setWebSearchEnabled(!webSearchEnabled)}
                className="flex items-center gap-2"
              >
                <Globe className="h-4 w-4" />
                <span className="hidden sm:inline">Web Search</span>
              </Button>
              {webSearchEnabled && (
                <Badge variant="secondary" className="hidden sm:inline-flex">
                  Live Data
                </Badge>
              )}
            </div>
          </div>

          {/* Messages */}
          <ScrollArea className="flex-1 p-4">
            {currentConversationId ? (
              <>
                {messagesLoading ? (
                  <div className="flex items-center justify-center h-32">
                    <Loader2 className="h-6 w-6 animate-spin" />
                  </div>
                ) : messages.length === 0 ? (
                  <div className="space-y-4">
                    <QuickPrompts 
                      onPromptSelect={handleQuickPrompt}
                      disabled={isLoading || isSearching}
                    />
                    <PlanIntegration 
                      onSendPlanData={handlePlanIntegration}
                      disabled={isLoading || isSearching}
                    />
                    <div className="flex items-center justify-center h-32 text-muted-foreground">
                      <p>Choose a quick action above or start typing your question!</p>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {messages.map((message) => (
                      <MessageBubble key={message.id} message={message} />
                    ))}
                    {(isLoading || isSearching) && (
                      <div className="flex gap-3 mb-4">
                        <div className="h-8 w-8 bg-secondary rounded-full flex items-center justify-center">
                          <Loader2 className="h-4 w-4 animate-spin" />
                        </div>
                        <div className="bg-muted p-3 rounded-lg">
                          <p className="text-sm text-muted-foreground">
                            {isSearching ? 'Searching web data...' : 'AquaBot is thinking...'}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                )}
                <div ref={messagesEndRef} />
              </>
            ) : (
              <div className="space-y-6">
                <div className="flex items-center justify-center">
                  <div className="text-center space-y-4">
                    <div className="h-16 w-16 rounded-full ocean-gradient flex items-center justify-center mx-auto">
                      <span className="text-white text-2xl">🤖</span>
                    </div>
                    <div>
                      <h2 className="text-xl font-semibold mb-2">Welcome to AquaBot!</h2>
                      <p className="text-muted-foreground max-w-md">
                        I'm your marine aquarium assistant with access to real-time web data. 
                        Ask me anything about water chemistry, fish care, equipment, or troubleshooting!
                      </p>
                    </div>
                  </div>
                </div>
                
                <QuickPrompts 
                  onPromptSelect={handleQuickPrompt}
                  disabled={isLoading || isSearching}
                />
                
                <PlanIntegration 
                  onSendPlanData={handlePlanIntegration}
                  disabled={isLoading || isSearching}
                />
              </div>
            )}
          </ScrollArea>

          {/* Chat Input */}
          <ChatInput 
            onSendMessage={handleSendMessage} 
            disabled={isLoading || isSearching} 
          />
        </div>
      </div>
    </Layout>
  );
};

export default AquaBot;
