
import React, { useEffect, useRef } from 'react';
import { Layout } from '@/components/Layout';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Loader2 } from 'lucide-react';
import { useChat } from '@/hooks/useChat';
import { ConversationList } from '@/components/chat/ConversationList';
import { MessageBubble } from '@/components/chat/MessageBubble';
import { ChatInput } from '@/components/chat/ChatInput';

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

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async (message: string) => {
    await sendMessage(message, !currentConversationId);
  };

  return (
    <Layout title="AquaBot" showBackButton>
      <div className="h-[calc(100vh-8rem)] flex bg-background rounded-lg border border-border overflow-hidden">
        {/* Conversation List */}
        <ConversationList
          conversations={conversations}
          currentConversationId={currentConversationId}
          onSelectConversation={setCurrentConversationId}
          onNewConversation={createNewConversation}
          onDeleteConversation={deleteConversation}
          isLoading={conversationsLoading}
        />

        {/* Chat Area */}
        <div className="flex-1 flex flex-col">
          {/* Messages */}
          <ScrollArea className="flex-1 p-4">
            {currentConversationId ? (
              <>
                {messagesLoading ? (
                  <div className="flex items-center justify-center h-32">
                    <Loader2 className="h-6 w-6 animate-spin" />
                  </div>
                ) : messages.length === 0 ? (
                  <div className="flex items-center justify-center h-32 text-muted-foreground">
                    <p>No messages yet. Start the conversation!</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {messages.map((message) => (
                      <MessageBubble key={message.id} message={message} />
                    ))}
                    {isLoading && (
                      <div className="flex gap-3 mb-4">
                        <div className="h-8 w-8 bg-secondary rounded-full flex items-center justify-center">
                          <Loader2 className="h-4 w-4 animate-spin" />
                        </div>
                        <div className="bg-muted p-3 rounded-lg">
                          <p className="text-sm text-muted-foreground">AquaBot is thinking...</p>
                        </div>
                      </div>
                    )}
                  </div>
                )}
                <div ref={messagesEndRef} />
              </>
            ) : (
              <div className="flex items-center justify-center h-full">
                <div className="text-center space-y-4">
                  <div className="h-16 w-16 rounded-full ocean-gradient flex items-center justify-center mx-auto">
                    <span className="text-white text-2xl">🤖</span>
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold mb-2">Welcome to AquaBot!</h2>
                    <p className="text-muted-foreground max-w-md">
                      I'm your marine aquarium assistant. Ask me anything about water chemistry, 
                      fish care, equipment, or troubleshooting your tank!
                    </p>
                  </div>
                </div>
              </div>
            )}
          </ScrollArea>

          {/* Chat Input */}
          <ChatInput 
            onSendMessage={handleSendMessage} 
            disabled={isLoading} 
          />
        </div>
      </div>
    </Layout>
  );
};

export default AquaBot;
