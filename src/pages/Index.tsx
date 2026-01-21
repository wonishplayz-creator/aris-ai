import { useState, useEffect } from 'react';
import { CameraView } from '@/components/CameraView';
import { ChatBox } from '@/components/ChatBox';
import { YourFaceLogo } from '@/components/YourFaceLogo';
import { usePuterAI } from '@/hooks/usePuterAI';
import { Loader2 } from 'lucide-react';

const Index = () => {
  const [pendingImage, setPendingImage] = useState<string | null>(null);
  const [puterLoaded, setPuterLoaded] = useState(false);
  const { messages, isLoading, sendMessage, clearMessages, initPuter } = usePuterAI();

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
      document.head.removeChild(script);
    };
  }, [initPuter]);

  const handleCapture = (imageData: string) => {
    setPendingImage(imageData);
  };

  const handleSendMessage = (content: string, imageData?: string) => {
    sendMessage(content, imageData);
  };

  if (!puterLoaded) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-4">
        <YourFaceLogo />
        <div className="flex items-center gap-2 text-muted-foreground">
          <Loader2 className="w-5 h-5 animate-spin" />
          <span>Loading AI...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-background overflow-hidden">
      {/* Header */}
      <header className="flex-shrink-0 px-4 py-3 bg-card/80 backdrop-blur-lg border-b border-border flex items-center justify-between z-10">
        <YourFaceLogo />
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <div className="w-2 h-2 rounded-full bg-success animate-pulse" />
          <span>GPT-4o via Puter.js</span>
        </div>
      </header>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-h-0">
        {/* Camera section - takes 60% of remaining height */}
        <div className="flex-[3] min-h-0 p-3">
          <CameraView onCapture={handleCapture} />
        </div>

        {/* Chat section - takes 40% of remaining height */}
        <div className="flex-[2] min-h-0">
          <ChatBox
            messages={messages}
            isLoading={isLoading}
            onSendMessage={handleSendMessage}
            onClearMessages={clearMessages}
            pendingImage={pendingImage}
            onClearPendingImage={() => setPendingImage(null)}
          />
        </div>
      </div>
    </div>
  );
};

export default Index;
