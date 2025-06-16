
import React, { useState, useRef, useEffect } from 'react';
import { Layout } from '@/components/Layout';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useAquarium } from '@/contexts/AquariumContext';
import { ArrowUp } from 'lucide-react';

interface Message {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
}

const AquaBot = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: "Hello! I'm AquaBot, your AI saltwater aquarium assistant. I can help you with tank setup, troubleshooting, livestock compatibility, water chemistry, and maintenance schedules. What would you like to know?",
      isUser: false,
      timestamp: new Date(),
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const { tanks } = useAquarium();

  const scrollToBottom = () => {
    if (scrollAreaRef.current) {
      const scrollContainer = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]');
      if (scrollContainer) {
        scrollContainer.scrollTop = scrollContainer.scrollHeight;
      }
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const generateAIResponse = (userMessage: string): string => {
    const message = userMessage.toLowerCase();
    
    // Tank context
    const tankContext = tanks.length > 0 ? `\n\nI see you have ${tanks.length} tank(s) in your collection: ${tanks.map(t => t.name).join(', ')}.` : '';
    
    if (message.includes('cloudy') || message.includes('white') || message.includes('hazy')) {
      return `Cloudy water is usually caused by bacterial blooms, overfeeding, or disturbed substrate. Here's what to check:

1. **Test water parameters** - High ammonia/nitrites can cause bacterial blooms
2. **Reduce feeding** - Overfeeding is a common cause
3. **Check filtration** - Ensure your filter media isn't clogged
4. **Water changes** - 20-30% water change can help clear it up
5. **Add beneficial bacteria** - Products like Microbacter7 can help

The cloudiness should clear in 24-48 hours with proper treatment.${tankContext}`;
    }
    
    if (message.includes('algae') || message.includes('green')) {
      return `Algae growth is natural but can become problematic. Here's how to manage it:

**Prevention:**
- Maintain stable lighting schedule (8-10 hours for reef tanks)
- Keep nitrates under 10 ppm
- Proper water flow and circulation
- Regular water changes (10-20% weekly)

**Treatment:**
- Manual removal with algae scraper
- Reduce lighting temporarily
- Add cleanup crew (hermit crabs, snails)
- Check and clean equipment

**For hair algae:** Consider reducing feeding and adding herbivorous fish like tangs.${tankContext}`;
    }
    
    if (message.includes('fish') && message.includes('sick')) {
      return `Fish health issues need immediate attention. Look for these symptoms:

**Common signs:**
- White spots (Ich) - treat with copper or hyposalinity
- Torn fins - improve water quality, possible bacterial infection
- Rapid breathing - check ammonia, nitrites, and oxygen levels
- Loss of appetite - stress, disease, or poor water quality

**Immediate steps:**
1. Test water parameters immediately
2. Quarantine affected fish if possible
3. Observe closely for 24-48 hours
4. Consider consulting with aquatic veterinarian

**Prevention is key:** Quarantine new additions for 2-4 weeks.${tankContext}`;
    }
    
    if (message.includes('coral') && (message.includes('dying') || message.includes('brown') || message.includes('pale'))) {
      return `Coral stress can manifest in several ways:

**Brown/Dark corals:** Usually too much nutrients or insufficient lighting
**Pale/White corals:** Bleaching from stress, too much light, or temperature swings
**Tissue recession:** Poor water quality or chemical warfare between corals

**Critical parameters for coral health:**
- Calcium: 380-450 ppm
- Alkalinity: 8-12 dKH
- Magnesium: 1250-1350 ppm
- Nitrates: <10 ppm
- Phosphates: <0.1 ppm

**Immediate action:** Test all parameters and perform a 20% water change.${tankContext}`;
    }
    
    if (message.includes('setup') || message.includes('new tank') || message.includes('cycle')) {
      return `Setting up a new saltwater tank requires patience! Here's the process:

**Initial Setup (Week 1):**
1. Install equipment (filter, heater, lights, protein skimmer)
2. Add saltwater mixed to 1.025 specific gravity
3. Add live rock (1-2 lbs per gallon)
4. Start circulation pumps

**Cycling (Weeks 2-6):**
- Add ammonia source (fish food or pure ammonia)
- Test daily: Ammonia → Nitrites → Nitrates
- Don't add fish until ammonia and nitrites are 0

**First Fish:**
- Start with hardy species (clownfish, damselfish)
- Add one fish at a time, 2 weeks apart
- Quarantine everything for 2-4 weeks

**Timeline:** 6-8 weeks minimum before adding sensitive species.${tankContext}`;
    }
    
    if (message.includes('compatible') || message.includes('aggressive') || message.includes('peaceful')) {
      return `Fish compatibility is crucial for a peaceful tank:

**Peaceful Community Fish:**
- Clownfish, Cardinals, Wrasses, Gobies
- Can be mixed safely

**Semi-Aggressive:**
- Tangs, Angelfish, Triggerfish
- Need larger tanks and careful selection

**Aggressive:**
- Groupers, Large Triggers, Eels
- Often best kept alone or with similar species

**General Rules:**
- Introduce aggressive fish last
- Provide hiding spots and territories
- Similar sized fish reduce aggression
- Research specific species requirements

**Pro tip:** Rearrange rockwork when adding new fish to reset territories.${tankContext}`;
    }
    
    if (message.includes('water change') || message.includes('maintenance')) {
      return `Regular maintenance keeps your tank healthy:

**Weekly Tasks:**
- 10-20% water changes
- Test major parameters (pH, salinity, ammonia, nitrates)
- Clean glass and remove algae
- Check equipment function

**Monthly Tasks:**
- Deep clean protein skimmer
- Replace filter media
- Test calcium, alkalinity, magnesium
- Inspect all equipment

**Water Change Best Practices:**
- Match temperature and salinity
- Use RODI water for mixing
- Mix saltwater 24 hours before use
- Vacuum substrate gently

**Pro tip:** Consistency is more important than frequency!${tankContext}`;
    }
    
    // Default responses for unmatched queries
    const defaultResponses = [
      `That's a great question! For specific issues like that, I'd recommend checking your water parameters first - they're the foundation of aquarium health. Could you tell me more about what you're observing?${tankContext}`,
      
      `I'd be happy to help! Saltwater aquariums can be complex, but with the right approach, they're very rewarding. Can you provide more details about your specific situation?${tankContext}`,
      
      `Good question! Each tank is unique, so I'll need a bit more context. What type of tank do you have (FOWLR, reef, etc.) and what specific issue are you experiencing?${tankContext}`,
    ];
    
    return defaultResponses[Math.floor(Math.random() * defaultResponses.length)];
  };

  const handleSend = async () => {
    if (!inputText.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputText,
      isUser: true,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    setIsTyping(true);

    // Simulate AI thinking time
    setTimeout(() => {
      const aiResponse: Message = {
        id: (Date.now() + 1).toString(),
        text: generateAIResponse(inputText),
        isUser: false,
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, aiResponse]);
      setIsTyping(false);
    }, 1500 + Math.random() * 1000); // 1.5-2.5 seconds
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <Layout title="AquaBot">
      <div className="flex flex-col h-[calc(100vh-140px)] max-w-4xl mx-auto">
        {/* Chat Messages */}
        <ScrollArea ref={scrollAreaRef} className="flex-1 px-4">
          <div className="space-y-4 pb-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.isUser ? 'justify-end' : 'justify-start'}`}
              >
                <Card className={`max-w-[80%] ${message.isUser ? 'ocean-gradient text-white' : 'bg-card'}`}>
                  <CardContent className="p-3">
                    <p className="text-sm whitespace-pre-wrap">{message.text}</p>
                    <p className={`text-xs mt-2 opacity-70 ${message.isUser ? 'text-blue-100' : 'text-muted-foreground'}`}>
                      {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </CardContent>
                </Card>
              </div>
            ))}
            
            {isTyping && (
              <div className="flex justify-start">
                <Card className="bg-card">
                  <CardContent className="p-3">
                    <div className="flex items-center space-x-2">
                      <div className="flex space-x-1">
                        <div className="w-2 h-2 bg-primary rounded-full animate-bounce"></div>
                        <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                        <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                      </div>
                      <span className="text-sm text-muted-foreground">AquaBot is thinking...</span>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </div>
        </ScrollArea>

        {/* Input Area */}
        <div className="border-t border-border bg-background/95 backdrop-blur p-4">
          <div className="flex space-x-2">
            <Input
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Ask about water chemistry, fish compatibility, coral care..."
              className="flex-1"
              disabled={isTyping}
            />
            <Button 
              onClick={handleSend} 
              disabled={!inputText.trim() || isTyping}
              className="ocean-gradient text-white"
            >
              <ArrowUp className="h-4 w-4" />
            </Button>
          </div>
          <p className="text-xs text-muted-foreground mt-2 text-center">
            AquaBot provides general guidance. Always consult professionals for serious issues.
          </p>
        </div>
      </div>
    </Layout>
  );
};

export default AquaBot;
