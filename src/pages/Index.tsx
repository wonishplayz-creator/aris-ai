import { useState, useEffect, useRef } from 'react';
import { FullscreenCamera } from '@/components/FullscreenCamera';
import { FloatingChat } from '@/components/FloatingChat';
import { FloatingResponse } from '@/components/FloatingResponse';
import { usePuterAI } from '@/hooks/usePuterAI';
import { Sparkles, Loader2 } from 'lucide-react';

const Index = () => {
  const [pendingImage, setPendingImage] = useState<string | null>(null);
  const [puterLoaded, setPuterLoaded] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);
  const captureRef = useRef<(() => string | null) | null>(null);
  
  const { messages, isLoading, sendMessage, dismissMessage, initPuter } = usePuterAI();

  useEffect(() => {
    // Load Puter.js
    const script = document.createElement('script');
    script.src = 'https://js.puter.com/v2/';
    script.async = true;
    script.onload = () => {
      setTimeout(() => {
        if (initPuter()) {
          setPuterLoaded(true);
        }
      }, 500);
    };
    document.head.appendChild(script);

    return () => {
      if (document.head.contains(script)) {
        document.head.removeChild(script);
      }
    };
  }, [initPuter]);

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

  // Returns the captured image data directly
  const captureAndGet = (): string | null => {
    if (captureRef.current) {
      return captureRef.current();
    }
    return null;
  };

  const handleSendMessage = (content: string, imageData?: string) => {
    sendMessage(content, imageData);
    // Clear pending image after sending
    if (imageData) {
      setPendingImage(null);
    }
  };

  if (!puterLoaded) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-6">
        <div className="relative">
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary via-primary/80 to-primary/60 flex items-center justify-center shadow-2xl shadow-primary/30">
            <Sparkles className="w-10 h-10 text-primary-foreground" />
          </div>
          <div className="absolute -top-2 -right-2 w-6 h-6 bg-success rounded-full border-4 border-background animate-pulse" />
        </div>
        <div className="text-center">
          <h1 className="text-3xl font-bold text-foreground mb-2">
            Your<span className="text-primary">Face</span>
          </h1>
          <p className="text-muted-foreground">Your AI Vision Companion</p>
        </div>
        <div className="flex items-center gap-2 text-muted-foreground">
          <Loader2 className="w-5 h-5 animate-spin" />
          <span>Loading AI...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen w-screen overflow-hidden">
      {/* Fullscreen camera */}
      <FullscreenCamera 
        onCapture={handleCapture} 
        captureRef={captureRef}
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
    </div>
  );
};

export default Index;
