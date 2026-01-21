import { useState, useCallback } from 'react';

declare global {
  interface Window {
    puter: {
      ai: {
        chat: (prompt: string | Array<{type: string; text?: string; image_url?: { url: string }}>, options?: { model?: string; stream?: boolean }) => Promise<string>;
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
      let prompt: string | Array<{type: string; text?: string; image_url?: { url: string }}>;
      
      const systemContext = `You are YourFace AI - a friendly, helpful AI vision assistant. You can see what the user shows you through their camera. Be conversational, helpful, and enthusiastic. You help with:
- Identifying objects, text, products, plants, animals
- Reading and translating text in images
- Playing games (card games, board games, video games) - give strategic advice
- Cooking help - identify ingredients, suggest recipes
- Homework and learning - explain concepts visible in images
- Shopping - compare products, read labels
- Tech support - help with device screens, error messages
- And anything else visual!

Keep responses concise but helpful. If you can't see something clearly, ask for a better angle. Be friendly and proactive with suggestions.`;

      if (imageData) {
        // Use vision capabilities with the image
        prompt = [
          { type: "text", text: `${systemContext}\n\nUser's request: ${content}` },
          { type: "image_url", image_url: { url: imageData } }
        ];
      } else {
        prompt = `${systemContext}\n\nUser's request: ${content}\n\n(Note: No image was provided with this message. If you need to see something, ask the user to point their camera at it.)`;
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
        content: 'Oops! I had trouble processing that. Please try again or check your connection.',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const dismissMessage = useCallback((id: string) => {
    setMessages(prev => prev.filter(m => m.id !== id));
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
    dismissMessage,
    clearMessages
  };
};
