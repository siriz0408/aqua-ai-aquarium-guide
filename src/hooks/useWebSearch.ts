
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';

interface WebSearchResult {
  content: string;
  success: boolean;
  error?: string;
}

export const useWebSearch = () => {
  const [isSearching, setIsSearching] = useState(false);
  const { toast } = useToast();

  const searchWeb = async (query: string): Promise<WebSearchResult> => {
    setIsSearching(true);
    
    try {
      const response = await fetch('/api/web-search', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ query }),
      });

      if (!response.ok) {
        throw new Error('Web search failed');
      }

      const data = await response.json();
      return { content: data.content, success: true };
    } catch (error) {
      console.error('Web search error:', error);
      toast({
        title: "Search Error",
        description: "Failed to search web data. Please try again.",
        variant: "destructive",
      });
      return { content: '', success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    } finally {
      setIsSearching(false);
    }
  };

  return { searchWeb, isSearching };
};
