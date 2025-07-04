
import React, { useEffect, useRef, useState } from 'react';
import { Layout } from '@/components/Layout';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Loader2, MessageSquare, X, Globe, Menu, Zap, Database } from 'lucide-react';
import { useChat } from '@/hooks/useChat';
import { useWebSearch } from '@/hooks/useWebSearch';
import { useTankContext } from '@/hooks/useTankContext';
import { useIsMobile } from '@/hooks/use-mobile';
import { ConversationList } from '@/components/chat/ConversationList';
import { MessageBubble } from '@/components/chat/MessageBubble';
import { ChatInput } from '@/components/chat/ChatInput';
import { QuickPrompts } from '@/components/chat/QuickPrompts';
import TankContextPanel from '@/components/chat/TankContextPanel';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

interface FileAttachment {
  name: string;
  url: string;
  type: string;
  size: number;
  preview?: string;
}

const AquaBot = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  // Redirect to auth if not logged in
  useEffect(() => {
    if (!user) {
      navigate('/auth');
      return;
    }
  }, [user, navigate]);

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
    showPaywall,
    setShowPaywall,
  } = useChat();

  const { searchWeb, isSearching } = useWebSearch();
  const { 
    showTankContext, 
    setShowTankContext, 
    contextString, 
    selectedTankContext,
    tanks 
  } = useTankContext();
  
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

  // Auto-hide sidebar on mobile when route changes
  useEffect(() => {
    if (isMobile) {
      setShowSidebar(false);
    }
  }, [isMobile]);

  // Don't render if user is not authenticated
  if (!user) {
    return null;
  }

  const handleSendMessage = async (message: string, attachments?: FileAttachment[]) => {
    console.log('Handling send message with attachments:', attachments?.length || 0);
    
    // No restrictions - always allow message sending
    let finalMessage = message;
    
    // Add tank context to message if enabled
    if (showTankContext && contextString) {
      finalMessage = `Tank Context: ${contextString}\n\nUser Question: ${message}`;
    }
    
    // If web search is enabled, search for relevant information first
    if (webSearchEnabled && message.trim()) {
      const searchQuery = `marine aquarium ${message}`;
      const searchResult = await searchWeb(searchQuery);
      
      if (searchResult.success) {
        finalMessage = `${finalMessage}\n\n[Web Search Results]:\n${searchResult.content}`;
      }
    }
    
    await sendMessage(finalMessage, !currentConversationId, attachments);
  };

  const handleQuickPrompt = async (prompt: string) => {
    await handleSendMessage(prompt);
  };

  const handleFollowUpClick = async (prompt: string) => {
    await handleSendMessage(prompt);
  };

  return (
    <Layout title="AquaBot" showBackButton>
      {/* Mobile-first responsive container */}
      <div className="h-[calc(100vh-12rem)] sm:h-[calc(100vh-8rem)] flex bg-background rounded-lg border border-border overflow-hidden relative">
        {/* Mobile overlay when sidebar is open */}
        {showSidebar && isMobile && (
          <div 
            className="fixed inset-0 bg-black/50 z-40"
            onClick={() => setShowSidebar(false)}
          />
        )}

        {/* Responsive Conversation Sidebar */}
        <div className={cn(
          "h-full bg-background border-r border-border transition-all duration-300 ease-in-out z-50",
          isMobile ? [
            "fixed inset-y-0 left-0",
            showSidebar ? "w-80 translate-x-0" : "w-0 -translate-x-full"
          ] : [
            "relative",
            showSidebar ? "w-80" : "w-0"
          ]
        )}>
          <div className={cn(
            "h-full flex flex-col transition-opacity duration-300",
            showSidebar ? "opacity-100" : "opacity-0"
          )}>
            {/* Mobile sidebar header */}
            {isMobile && (
              <div className="flex justify-between items-center p-3 border-b border-border bg-background">
                <h3 className="font-semibold text-sm">Chat History</h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowSidebar(false)}
                  className="h-8 w-8 p-0"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            )}
            
            {/* Conversation List */}
            {showSidebar && (
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
            )}
          </div>
        </div>

        {/* Main Chat Area - Responsive */}
        <div className="flex-1 flex flex-col min-w-0 h-full">
          {/* Mobile-optimized Chat Header */}
          <div className="border-b border-border p-2 sm:p-4 flex items-center gap-2 bg-background">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowSidebar(!showSidebar)}
              className="flex items-center gap-1 sm:gap-2 h-8 sm:h-9 px-2 sm:px-3"
            >
              <Menu className="h-4 w-4" />
              <span className="hidden sm:inline text-sm">
                {showSidebar ? 'Hide' : 'Show'} History
              </span>
            </Button>
            
            <h2 className="font-semibold flex-1 text-center text-sm sm:text-base truncate">
              AquaBot Assistant
              {showTankContext && selectedTankContext && (
                <Badge variant="outline" className="ml-2 text-xs">
                  {selectedTankContext.name}
                </Badge>
              )}
            </h2>
            
            <div className="flex items-center gap-1 sm:gap-2">
              {/* Always show Pro status */}
              <Badge variant="default" className="flex items-center gap-1">
                <Zap className="h-3 w-3" />
                <span className="text-xs">Pro</span>
              </Badge>
              
              {/* Tank Context Toggle */}
              {tanks.length > 0 && (
                <Button
                  variant={showTankContext ? "default" : "outline"}
                  size="sm"
                  onClick={() => setShowTankContext(!showTankContext)}
                  className="flex items-center gap-1 sm:gap-2 h-8 sm:h-9 px-2 sm:px-3"
                >
                  <Database className="h-3 w-3 sm:h-4 sm:w-4" />
                  <span className="hidden sm:inline text-xs sm:text-sm">Tank Data</span>
                </Button>
              )}
              
              <Button
                variant={webSearchEnabled ? "default" : "outline"}
                size="sm"
                onClick={() => setWebSearchEnabled(!webSearchEnabled)}
                className="flex items-center gap-1 sm:gap-2 h-8 sm:h-9 px-2 sm:px-3"
              >
                <Globe className="h-3 w-3 sm:h-4 sm:w-4" />
                <span className="hidden sm:inline text-xs sm:text-sm">Web Search</span>
              </Button>
              {webSearchEnabled && (
                <Badge variant="secondary" className="hidden sm:inline-flex text-xs">
                  Live Data
                </Badge>
              )}
            </div>
          </div>

          {/* Messages Area - Mobile optimized */}
          <ScrollArea className="flex-1 p-2 sm:p-4">
            {/* Tank Context Panel */}
            {showTankContext && <TankContextPanel />}
            
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
                    <div className="flex items-center justify-center h-32 text-muted-foreground">
                      <p className="text-center text-sm px-4">Choose a quick action above or start typing your question!</p>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {messages.map((message) => (
                      <MessageBubble 
                        key={message.id} 
                        message={message} 
                        onFollowUpClick={handleFollowUpClick}
                      />
                    ))}
                    {(isLoading || isSearching) && (
                      <div className="flex gap-2 sm:gap-3 mb-4">
                        <div className="h-6 w-6 sm:h-8 sm:w-8 bg-secondary rounded-full flex items-center justify-center flex-shrink-0">
                          <Loader2 className="h-3 w-3 sm:h-4 sm:w-4 animate-spin" />
                        </div>
                        <div className="bg-muted p-2 sm:p-3 rounded-lg">
                          <p className="text-xs sm:text-sm text-muted-foreground">
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
              <div className="space-y-4 sm:space-y-6 p-2 sm:p-0">
                <div className="flex items-center justify-center">
                  <div className="text-center space-y-3 sm:space-y-4 max-w-md">
                    <div className="h-12 w-12 sm:h-16 sm:w-16 rounded-full ocean-gradient flex items-center justify-center mx-auto">
                      <span className="text-white text-xl sm:text-2xl">🤖</span>
                    </div>
                    <div>
                      <h2 className="text-lg sm:text-xl font-semibold mb-2">Welcome to AquaBot!</h2>
                      <p className="text-muted-foreground text-sm sm:text-base px-4">
                        I'm your marine aquarium assistant with access to real-time web data
                        {showTankContext && selectedTankContext && 
                          ` and your ${selectedTankContext.name} tank data`
                        }. 
                        Ask me anything about water chemistry, fish care, equipment, or troubleshooting!
                      </p>
                      <p className="text-xs text-blue-600 mt-2">
                        Full access available to all users
                      </p>
                    </div>
                  </div>
                </div>
                
                <QuickPrompts 
                  onPromptSelect={handleQuickPrompt}
                  disabled={isLoading || isSearching}
                />
              </div>
            )}
          </ScrollArea>

          {/* Mobile-optimized Chat Input */}
          <div className="border-t border-border bg-background">
            <ChatInput 
              onSendMessage={handleSendMessage} 
              disabled={isLoading || isSearching} 
            />
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default AquaBot;
