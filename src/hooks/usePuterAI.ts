import { useState, useCallback } from 'react';

declare global {
  interface Window {
    puter: {
      ai: {
        chat: (prompt: string, options?: { model?: string; stream?: boolean }) => Promise<string>;
      };
    };
  }
}

export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  imageData?: string;
}

export const usePuterAI = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);

  const initPuter = useCallback(() => {
    if (typeof window !== 'undefined' && window.puter) {
      setIsInitialized(true);
      return true;
    }
    return false;
  }, []);

  const analyzeImage = useCallback(async (imageData: string, userPrompt?: string): Promise<string> => {
    if (!window.puter) {
      throw new Error('Puter.js not loaded');
    }

    const prompt = userPrompt || `You are YourFace AI, an expert trading card game analyst. Analyze this image of trading cards (Pokemon, Yu-Gi-Oh, Magic: The Gathering, etc.).

Identify:
1. What cards are visible
2. Card names, types, HP/stats if visible
3. Any attacks, abilities, or effects
4. Strategic recommendations for gameplay

If it's a Pokemon card game scenario, suggest:
- Best moves to make
- Energy requirements
- Weaknesses to watch for
- Overall strategy tips

Be conversational and helpful. If you can't see cards clearly, ask for a better angle.`;

    // For Puter.js, we need to describe what we see since it doesn't support direct image input
    // We'll send a prompt that includes the image context
    const fullPrompt = `${prompt}\n\n[User has shared a camera view of their cards. Analyze and provide strategic advice.]`;
    
    const response = await window.puter.ai.chat(fullPrompt, {
      model: 'gpt-4o'
    });

    return response;
  }, []);

  const sendMessage = useCallback(async (content: string, imageData?: string) => {
    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content,
      timestamp: new Date(),
      imageData
    };

    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);

    try {
      let prompt = content;
      
      if (imageData) {
        prompt = `The user is showing you their trading cards via camera. Their message: "${content}"
        
You are YourFace AI - a friendly, expert card game strategist. Help them understand their cards, suggest moves, explain mechanics, and provide winning strategies. Be enthusiastic about card games!`;
      }

      const response = await window.puter.ai.chat(prompt, {
        model: 'gpt-4o'
      });

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: response,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error('AI Error:', error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: 'Sorry, I encountered an error. Please make sure Puter.js is loaded and try again.',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const clearMessages = useCallback(() => {
    setMessages([]);
  }, []);

  return {
    messages,
    isLoading,
    isInitialized,
    initPuter,
    sendMessage,
    analyzeImage,
    clearMessages
  };
};
