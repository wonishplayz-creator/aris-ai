import { useState, useEffect } from 'react';
import { X, Copy, Check, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Message } from '@/hooks/usePuterAI';
import { cn } from '@/lib/utils';

interface FloatingResponseProps {
  messages: Message[];
  isLoading: boolean;
  onDismiss: (id: string) => void;
}

export const FloatingResponse = ({ messages, isLoading, onDismiss }: FloatingResponseProps) => {
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [visibleMessages, setVisibleMessages] = useState<Message[]>([]);

  // Only show the last 3 assistant messages
  useEffect(() => {
    const assistantMessages = messages.filter(m => m.role === 'assistant').slice(-3);
    setVisibleMessages(assistantMessages);
  }, [messages]);

  const handleCopy = async (content: string, id: string) => {
    await navigator.clipboard.writeText(content);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  if (visibleMessages.length === 0 && !isLoading) return null;

  return (
    <div className="fixed top-16 left-4 right-4 z-40 pointer-events-none flex flex-col items-center gap-3">
      {visibleMessages.map((message, index) => (
        <div
          key={message.id}
          className={cn(
            "pointer-events-auto max-w-xl w-full animate-fade-in",
            index === visibleMessages.length - 1 ? "opacity-100" : "opacity-70 scale-95"
          )}
          style={{ 
            animationDelay: `${index * 100}ms`,
            transform: index < visibleMessages.length - 1 ? 'scale(0.95)' : 'scale(1)'
          }}
        >
          <div className="bg-card/95 backdrop-blur-xl rounded-2xl border border-border/50 shadow-2xl overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-2 border-b border-border/30 bg-muted/30">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-primary" />
                <span className="text-xs font-medium text-foreground">YourFace AI</span>
                <span className="text-[10px] text-muted-foreground">
                  {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
              <div className="flex items-center gap-1">
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-6 w-6 rounded-full"
                  onClick={() => handleCopy(message.content, message.id)}
                >
                  {copiedId === message.id ? (
                    <Check className="w-3 h-3 text-success" />
                  ) : (
                    <Copy className="w-3 h-3" />
                  )}
                </Button>
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-6 w-6 rounded-full"
                  onClick={() => onDismiss(message.id)}
                >
                  <X className="w-3 h-3" />
                </Button>
              </div>
            </div>
            
            {/* Content */}
            <ScrollArea className="max-h-48">
              <div className="p-4">
                <p className="text-sm text-foreground whitespace-pre-wrap leading-relaxed">
                  {message.content}
                </p>
              </div>
            </ScrollArea>
          </div>
        </div>
      ))}

      {/* Loading indicator */}
      {isLoading && (
        <div className="pointer-events-auto max-w-xl w-full animate-fade-in">
          <div className="bg-card/95 backdrop-blur-xl rounded-2xl border border-border/50 shadow-2xl p-4">
            <div className="flex items-center gap-3">
              <div className="flex gap-1">
                <span className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                <span className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                <span className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
              <span className="text-sm text-muted-foreground">Analyzing what I see...</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
