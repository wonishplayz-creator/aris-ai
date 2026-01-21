import { useState, useRef } from 'react';
import { Send, X, Sparkles, Maximize2, Minimize2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Message } from '@/hooks/usePuterAI';

interface FloatingChatProps {
  messages: Message[];
  isLoading: boolean;
  onSendMessage: (content: string, imageData?: string) => void;
  pendingImage?: string | null;
  onClearPendingImage?: () => void;
  onCaptureAndGet: () => string | null;
  isStreaming: boolean;
}

export const FloatingChat = ({
  messages,
  isLoading,
  onSendMessage,
  pendingImage,
  onClearPendingImage,
  onCaptureAndGet,
  isStreaming
}: FloatingChatProps) => {
  const [input, setInput] = useState('');
  const [isExpanded, setIsExpanded] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() && !pendingImage) return;
    
    let imageToSend = pendingImage;
    
    // Auto-capture if no pending image and camera is streaming
    if (!imageToSend && isStreaming) {
      imageToSend = onCaptureAndGet();
    }
    
    onSendMessage(input || 'What do you see?', imageToSend || undefined);
    setInput('');
    onClearPendingImage?.();
  };

  const handleQuickAction = (prompt: string) => {
    let imageToSend = pendingImage;
    
    // Capture fresh image for quick actions
    if (isStreaming) {
      imageToSend = onCaptureAndGet();
    }
    
    onSendMessage(prompt, imageToSend || undefined);
    onClearPendingImage?.();
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 p-4 pointer-events-none">
      <div className="max-w-2xl mx-auto pointer-events-auto">
        {/* Quick actions */}
        {!isExpanded && !isLoading && (
          <div className="flex gap-2 mb-3 justify-center flex-wrap animate-fade-in">
            <Button
              size="sm"
              variant="secondary"
              className="rounded-full bg-background/80 backdrop-blur-xl border border-border/50 hover:bg-background/90 shadow-lg"
              onClick={() => handleQuickAction("What do you see?")}
            >
              <Sparkles className="w-3 h-3 mr-1" />
              What's this?
            </Button>
            <Button
              size="sm"
              variant="secondary"
              className="rounded-full bg-background/80 backdrop-blur-xl border border-border/50 hover:bg-background/90 shadow-lg"
              onClick={() => handleQuickAction("Add a fun effect to my screen! Maybe glasses, hearts, sparkles, or something cool")}
            >
              ✨ Effects
            </Button>
            <Button
              size="sm"
              variant="secondary"
              className="rounded-full bg-background/80 backdrop-blur-xl border border-border/50 hover:bg-background/90 shadow-lg"
              onClick={() => handleQuickAction("Help me with this game - what should I do?")}
            >
              Game help
            </Button>
          </div>
        )}

        {/* Pending image indicator */}
        {pendingImage && (
          <div className="flex items-center justify-center gap-2 mb-2 animate-fade-in">
            <div className="flex items-center gap-2 bg-primary/20 backdrop-blur-xl px-4 py-2 rounded-full border border-primary/30">
              <img src={pendingImage} alt="Captured" className="h-8 w-8 rounded object-cover" />
              <span className="text-xs text-primary-foreground">Ready to analyze</span>
              <Button size="icon" variant="ghost" className="h-6 w-6" onClick={onClearPendingImage}>
                <X className="w-3 h-3" />
              </Button>
            </div>
          </div>
        )}

        {/* Main input bar */}
        <form onSubmit={handleSubmit} className="relative">
          <div className="flex items-center gap-2 bg-background/90 backdrop-blur-xl rounded-full border border-border/50 shadow-2xl shadow-background/50 p-2">
            <Button
              type="button"
              size="icon"
              variant="ghost"
              className="rounded-full shrink-0"
              onClick={() => setIsExpanded(!isExpanded)}
            >
              {isExpanded ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </Button>
            
            <Input
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask me anything about what you see..."
              className="flex-1 border-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 placeholder:text-muted-foreground/60"
              disabled={isLoading}
            />
            
            <Button
              type="submit"
              size="icon"
              disabled={isLoading}
              className="rounded-full shrink-0 bg-primary hover:bg-primary/90"
            >
              {isLoading ? (
                <div className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
              ) : (
                <Send className="w-4 h-4" />
              )}
            </Button>
          </div>
        </form>

        <div className="flex justify-center mt-2">
          <span className="text-[10px] text-muted-foreground/50">
            Aris AI • GPT-4o via Puter.js
          </span>
        </div>
      </div>
    </div>
  );
};
