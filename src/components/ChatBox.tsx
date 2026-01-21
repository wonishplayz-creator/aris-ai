import { useState, useRef, useEffect } from 'react';
import { Send, Sparkles, Trash2, Image } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Message } from '@/hooks/usePuterAI';
import { cn } from '@/lib/utils';

interface ChatBoxProps {
  messages: Message[];
  isLoading: boolean;
  onSendMessage: (content: string, imageData?: string) => void;
  onClearMessages: () => void;
  pendingImage?: string | null;
  onClearPendingImage?: () => void;
}

export const ChatBox = ({
  messages,
  isLoading,
  onSendMessage,
  onClearMessages,
  pendingImage,
  onClearPendingImage
}: ChatBoxProps) => {
  const [input, setInput] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() && !pendingImage) return;
    
    onSendMessage(input || 'What can you tell me about these cards?', pendingImage || undefined);
    setInput('');
    onClearPendingImage?.();
  };

  return (
    <div className="flex flex-col h-full bg-card/95 backdrop-blur-xl border-t border-border">
      {/* Messages area */}
      <ScrollArea className="flex-1 p-4" ref={scrollRef}>
        <div className="space-y-4">
          {messages.length === 0 && (
            <div className="text-center py-8">
              <Sparkles className="w-12 h-12 mx-auto text-primary/50 mb-3" />
              <p className="text-muted-foreground text-sm">
                Point your camera at your trading cards and ask me anything!
              </p>
              <p className="text-muted-foreground/60 text-xs mt-2">
                I can help with Pokemon, Yu-Gi-Oh, Magic, and more
              </p>
            </div>
          )}
          
          {messages.map((message) => (
            <div
              key={message.id}
              className={cn(
                "flex gap-3 animate-in fade-in slide-in-from-bottom-2 duration-300",
                message.role === 'user' ? 'justify-end' : 'justify-start'
              )}
            >
              <div
                className={cn(
                  "max-w-[85%] rounded-2xl px-4 py-3",
                  message.role === 'user'
                    ? 'bg-primary text-primary-foreground rounded-br-md'
                    : 'bg-muted text-foreground rounded-bl-md'
                )}
              >
                {message.imageData && (
                  <div className="mb-2 rounded-lg overflow-hidden">
                    <img 
                      src={message.imageData} 
                      alt="Captured" 
                      className="max-h-32 object-cover rounded"
                    />
                  </div>
                )}
                <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                <span className="text-[10px] opacity-50 mt-1 block">
                  {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            </div>
          ))}
          
          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-muted rounded-2xl rounded-bl-md px-4 py-3">
                <div className="flex items-center gap-2">
                  <div className="flex gap-1">
                    <span className="w-2 h-2 bg-primary/60 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <span className="w-2 h-2 bg-primary/60 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <span className="w-2 h-2 bg-primary/60 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                  <span className="text-xs text-muted-foreground">Analyzing...</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </ScrollArea>

      {/* Pending image preview */}
      {pendingImage && (
        <div className="px-4 py-2 border-t border-border bg-muted/50">
          <div className="flex items-center gap-2">
            <img src={pendingImage} alt="Pending" className="h-12 rounded-lg" />
            <span className="text-xs text-muted-foreground flex-1">Image ready to analyze</span>
            <Button size="sm" variant="ghost" onClick={onClearPendingImage}>
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Input area */}
      <form onSubmit={handleSubmit} className="p-4 border-t border-border">
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={pendingImage ? "Ask about these cards..." : "Ask me about your cards..."}
              className="pr-10 rounded-full bg-background border-muted-foreground/20"
              disabled={isLoading}
            />
            {pendingImage && (
              <Image className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-primary" />
            )}
          </div>
          
          <Button
            type="submit"
            size="icon"
            disabled={isLoading || (!input.trim() && !pendingImage)}
            className="rounded-full w-10 h-10 bg-primary hover:bg-primary/90"
          >
            <Send className="w-4 h-4" />
          </Button>
          
          {messages.length > 0 && (
            <Button
              type="button"
              size="icon"
              variant="ghost"
              onClick={onClearMessages}
              className="rounded-full w-10 h-10"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          )}
        </div>
      </form>
    </div>
  );
};
