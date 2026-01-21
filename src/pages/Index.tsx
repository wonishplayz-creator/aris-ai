import { useState, useEffect, useRef, useCallback } from 'react';
import { FullscreenCamera } from '@/components/FullscreenCamera';
import { FloatingChat } from '@/components/FloatingChat';
import { FloatingResponse } from '@/components/FloatingResponse';
import { VoiceIndicator } from '@/components/VoiceIndicator';
import { FaceSetupDialog } from '@/components/FaceSetupDialog';
import { ScreenEffects } from '@/components/ScreenEffects';
import { usePuterAI } from '@/hooks/usePuterAI';
import { useVoiceRecognition } from '@/hooks/useVoiceRecognition';
import { useMemory } from '@/hooks/useMemory';
import { useScreenEffects, parseEffectCommands, cleanEffectTags } from '@/hooks/useScreenEffects';
import { Sparkles, Loader2, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

const Index = () => {
  const [pendingImage, setPendingImage] = useState<string | null>(null);
  const [puterLoaded, setPuterLoaded] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);
  const [showFaceSetup, setShowFaceSetup] = useState(false);
  const captureRef = useRef<(() => string | null) | null>(null);
  
  const { messages, isLoading, sendMessage, dismissMessage } = usePuterAI();
  const memory = useMemory();
  const screenEffects = useScreenEffects();

  // Process AI responses for effect commands
  useEffect(() => {
    const lastMessage = messages.filter(m => m.role === 'assistant').slice(-1)[0];
    if (lastMessage) {
      const effects = parseEffectCommands(lastMessage.content);
      effects.forEach(effect => {
        if (effect.type === 'none') {
          screenEffects.clearAllEffects();
        } else {
          screenEffects.addEffect(effect.type, effect.duration);
        }
      });
    }
  }, [messages]);

  // Enhanced send message with memory context
  const sendMessageWithContext = useCallback((content: string, imageData?: string) => {
    const contextPrompt = memory.getContextPrompt();
    sendMessage(content, imageData, contextPrompt);
    
    // Add notable interactions to memory
    if (content.length > 10) {
      memory.addMemory(`User asked: "${content.slice(0, 100)}"`);
    }
  }, [sendMessage, memory]);

  // Voice command handler
  const handleVoiceCommand = useCallback((command: string) => {
    console.log('Voice command received:', command);
    
    let imageData: string | null = null;
    if (captureRef.current) {
      imageData = captureRef.current();
    }
    
    sendMessageWithContext(command, imageData || undefined);
    toast.success(`Got it: "${command}"`, { duration: 2000 });
  }, [sendMessageWithContext]);

  const handleWakeWordDetected = useCallback(() => {
    toast.info('Listening...', { duration: 1500 });
  }, []);

  const voice = useVoiceRecognition({
    wakeWord: 'hey aris',
    onWakeWordDetected: handleWakeWordDetected,
    onCommand: handleVoiceCommand
  });

  // Improved Puter.js loading with retry logic
  useEffect(() => {
    let attempts = 0;
    const maxAttempts = 20;
    
    const checkPuter = () => {
      if (window.puter?.ai?.chat) {
        setPuterLoaded(true);
        return true;
      }
      return false;
    };

    // Check if already loaded
    if (checkPuter()) return;

    // Load Puter.js script
    const existingScript = document.querySelector('script[src*="puter.com"]');
    if (!existingScript) {
      const script = document.createElement('script');
      script.src = 'https://js.puter.com/v2/';
      script.async = true;
      document.head.appendChild(script);
    }

    // Poll for Puter availability
    const interval = setInterval(() => {
      attempts++;
      if (checkPuter()) {
        clearInterval(interval);
      } else if (attempts >= maxAttempts) {
        clearInterval(interval);
        // Load anyway and let it fail gracefully
        setPuterLoaded(true);
        console.warn('Puter.js may not be fully loaded');
      }
    }, 250);

    return () => clearInterval(interval);
  }, []);

  // Track streaming state
  useEffect(() => {
    const checkStreaming = setInterval(() => {
      const video = document.querySelector('video');
      if (video && video.srcObject) {
        const stream = video.srcObject as MediaStream;
        setIsStreaming(stream.active);
      }
    }, 500);
    return () => clearInterval(checkStreaming);
  }, []);

  const handleCapture = (imageData: string) => {
    setPendingImage(imageData);
  };

  const captureAndGet = (): string | null => {
    if (captureRef.current) {
      return captureRef.current();
    }
    return null;
  };

  const handleSendMessage = (content: string, imageData?: string) => {
    sendMessageWithContext(content, imageData);
    if (imageData) {
      setPendingImage(null);
    }
  };

  if (!puterLoaded) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-6">
        <div className="relative">
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary via-primary/80 to-primary/60 flex items-center justify-center shadow-2xl shadow-primary/30 animate-pulse">
            <Sparkles className="w-10 h-10 text-primary-foreground" />
          </div>
          <div className="absolute -top-2 -right-2 w-6 h-6 bg-success rounded-full border-4 border-background animate-pulse" />
        </div>
        <div className="text-center">
          <h1 className="text-3xl font-bold text-foreground mb-2">
            <span className="text-primary">Aris</span>
          </h1>
          <p className="text-muted-foreground">Your AI Vision Companion</p>
        </div>
        <div className="flex items-center gap-2 text-muted-foreground">
          <Loader2 className="w-5 h-5 animate-spin" />
          <span>Loading Aris...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen w-screen overflow-hidden">
      {/* Screen effects overlay */}
      <ScreenEffects activeEffects={screenEffects.activeEffects} />

      {/* Fullscreen camera */}
      <FullscreenCamera 
        onCapture={handleCapture} 
        captureRef={captureRef}
      />

      {/* Top controls bar */}
      <div className="fixed top-4 left-4 z-50">
        <Button
          size="sm"
          variant={memory.faceProfile ? "default" : "secondary"}
          className="rounded-full gap-2"
          onClick={() => setShowFaceSetup(true)}
        >
          <User className="w-4 h-4" />
          {memory.faceProfile ? memory.faceProfile.name : 'Setup Face'}
        </Button>
      </div>

      {/* Voice indicator */}
      <VoiceIndicator
        isEnabled={voice.isEnabled}
        isListening={voice.isListening}
        isAwaitingCommand={voice.isAwaitingCommand}
        transcript={voice.transcript}
        onToggle={voice.toggleEnabled}
      />

      {/* Floating responses */}
      <FloatingResponse 
        messages={messages}
        isLoading={isLoading}
        onDismiss={dismissMessage}
      />

      {/* Floating chat bar */}
      <FloatingChat
        messages={messages}
        isLoading={isLoading}
        onSendMessage={handleSendMessage}
        pendingImage={pendingImage}
        onClearPendingImage={() => setPendingImage(null)}
        onCaptureAndGet={captureAndGet}
        isStreaming={isStreaming}
      />

      {/* Face setup dialog */}
      <FaceSetupDialog
        open={showFaceSetup}
        onOpenChange={setShowFaceSetup}
        currentProfile={memory.faceProfile}
        onSave={memory.saveFaceProfile}
        onClear={memory.clearFaceProfile}
        onCaptureFace={captureAndGet}
      />
    </div>
  );
};

export default Index;
