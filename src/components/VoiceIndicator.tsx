import { Mic, MicOff, Volume2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface VoiceIndicatorProps {
  isEnabled: boolean;
  isListening: boolean;
  isAwaitingCommand: boolean;
  transcript: string;
  onToggle: () => void;
}

export const VoiceIndicator = ({
  isEnabled,
  isListening,
  isAwaitingCommand,
  transcript,
  onToggle
}: VoiceIndicatorProps) => {
  return (
    <div className="fixed top-4 right-4 z-50 flex flex-col items-end gap-2">
      {/* Voice toggle button */}
      <Button
        size="sm"
        variant={isEnabled ? "default" : "secondary"}
        className={cn(
          "rounded-full gap-2 transition-all duration-300",
          isEnabled && "bg-primary shadow-lg shadow-primary/30",
          isAwaitingCommand && "animate-pulse"
        )}
        onClick={onToggle}
      >
        {isEnabled ? (
          <>
            <Mic className={cn("w-4 h-4", isListening && "animate-pulse")} />
            <span className="text-xs">Voice On</span>
          </>
        ) : (
          <>
            <MicOff className="w-4 h-4" />
            <span className="text-xs">Voice Off</span>
          </>
        )}
      </Button>

      {/* Listening indicator */}
      {isEnabled && isListening && (
        <div className="bg-background/90 backdrop-blur-xl rounded-full px-4 py-2 border border-border/50 shadow-lg animate-fade-in">
          <div className="flex items-center gap-2">
            {isAwaitingCommand ? (
              <>
                <Volume2 className="w-4 h-4 text-primary animate-pulse" />
                <span className="text-xs text-primary font-medium">Listening...</span>
              </>
            ) : (
              <>
                <div className="flex gap-0.5">
                  <span className="w-1 h-3 bg-muted-foreground/40 rounded-full animate-pulse" style={{ animationDelay: '0ms' }} />
                  <span className="w-1 h-3 bg-muted-foreground/40 rounded-full animate-pulse" style={{ animationDelay: '150ms' }} />
                  <span className="w-1 h-3 bg-muted-foreground/40 rounded-full animate-pulse" style={{ animationDelay: '300ms' }} />
                </div>
                <span className="text-xs text-muted-foreground">Say "Hey Aris"</span>
              </>
            )}
          </div>
        </div>
      )}

      {/* Current transcript */}
      {isAwaitingCommand && transcript && (
        <div className="bg-primary/20 backdrop-blur-xl rounded-lg px-4 py-2 border border-primary/30 shadow-lg max-w-xs animate-fade-in">
          <p className="text-xs text-foreground truncate">{transcript}</p>
        </div>
      )}
    </div>
  );
};
