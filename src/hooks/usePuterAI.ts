import { useState, useCallback } from 'react';

interface PuterAIResponse {
  message?: {
    content: string;
  };
  choices?: Array<{
    message?: {
      content: string;
    };
  }>;
  text?: string;
}

declare global {
  interface Window {
    puter: {
      ai: {
        chat: (
          prompt: string | Array<{ role: string; content: string }>,
          imageOrOptions?: string | string[] | { model?: string; stream?: boolean },
          testModeOrOptions?: boolean | { model?: string; stream?: boolean },
          options?: { model?: string; stream?: boolean }
        ) => Promise<string | PuterAIResponse>;
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

  const sendMessage = useCallback(async (content: string, imageData?: string, contextPrompt?: string) => {
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
      const baseContext = `You are Aris - a friendly, helpful AI vision assistant. You can see what the user shows you through their camera. Be conversational, helpful, and enthusiastic. You help with:
- Identifying objects, text, products, plants, animals
- Reading and translating text in images
- Playing games (card games, board games, video games) - give strategic advice
- Cooking help - identify ingredients, suggest recipes
- Homework and learning - explain concepts visible in images
- Shopping - compare products, read labels
- Tech support - help with device screens, error messages
- And anything else visual!

Keep responses concise but helpful. If you can't see something clearly, ask for a better angle. Be friendly and proactive with suggestions.`;

      const systemContext = contextPrompt 
        ? `${baseContext}${contextPrompt}`
        : baseContext;

      const fullPrompt = `${systemContext}\n\nUser's request: ${content}`;
      
      let response: string | PuterAIResponse;
      
      if (imageData) {
        // Puter.js syntax: puter.ai.chat(prompt, image, testMode, options)
        response = await window.puter.ai.chat(
          fullPrompt,
          imageData,
          false,
          { model: 'gpt-4o' }
        );
      } else {
        response = await window.puter.ai.chat(
          fullPrompt + '\n\n(Note: No image was provided. If you need to see something, ask the user to point their camera at it.)',
          { model: 'gpt-4o' }
        );
      }

      // Extract text from response
      let responseText: string;
      if (typeof response === 'string') {
        responseText = response;
      } else if (response?.message?.content) {
        responseText = response.message.content;
      } else if (response?.choices?.[0]?.message?.content) {
        responseText = response.choices[0].message.content;
      } else if (response?.text) {
        responseText = response.text;
      } else if (typeof response === 'object' && response !== null) {
        console.log('Puter response object:', JSON.stringify(response));
        responseText = 'I received your message but had trouble parsing the response. Please try again.';
      } else {
        responseText = String(response);
      }

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: responseText,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, assistantMessage]);
      return responseText;
    } catch (error) {
      console.error('AI Error:', error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: 'Oops! I had trouble processing that. Please try again or check your connection.',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
      return null;
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
    sendMessage,
    dismissMessage,
    clearMessages
  };
};
