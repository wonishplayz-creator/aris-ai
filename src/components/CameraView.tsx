import { useEffect } from 'react';
import { Camera, CameraOff, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useCamera } from '@/hooks/useCamera';

interface CameraViewProps {
  onCapture: (imageData: string) => void;
}

export const CameraView = ({ onCapture }: CameraViewProps) => {
  const { videoRef, canvasRef, isStreaming, error, startCamera, stopCamera, captureFrame } = useCamera();

  useEffect(() => {
    startCamera();
  }, [startCamera]);

  const handleCapture = () => {
    const imageData = captureFrame();
    if (imageData) {
      onCapture(imageData);
    }
  };

  return (
    <div className="relative w-full h-full bg-background rounded-2xl overflow-hidden">
      {/* Hidden canvas for capture */}
      <canvas ref={canvasRef} className="hidden" />
      
      {/* Video stream */}
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        className="w-full h-full object-cover"
      />

      {/* Overlay UI */}
      <div className="absolute inset-0 pointer-events-none">
        {/* Scanning grid effect */}
        <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-transparent to-primary/10" />
        
        {/* Corner brackets */}
        <div className="absolute top-8 left-8 w-16 h-16 border-l-2 border-t-2 border-primary/60 rounded-tl-lg" />
        <div className="absolute top-8 right-8 w-16 h-16 border-r-2 border-t-2 border-primary/60 rounded-tr-lg" />
        <div className="absolute bottom-32 left-8 w-16 h-16 border-l-2 border-b-2 border-primary/60 rounded-bl-lg" />
        <div className="absolute bottom-32 right-8 w-16 h-16 border-r-2 border-b-2 border-primary/60 rounded-br-lg" />

        {/* Status indicator */}
        <div className="absolute top-4 left-1/2 -translate-x-1/2 flex items-center gap-2 bg-background/80 backdrop-blur-sm px-4 py-2 rounded-full border border-border">
          <div className={`w-2 h-2 rounded-full ${isStreaming ? 'bg-success animate-pulse' : 'bg-destructive'}`} />
          <span className="text-sm font-medium text-foreground">
            {isStreaming ? 'Camera Active' : 'Camera Off'}
          </span>
        </div>
      </div>

      {/* Error display */}
      {error && (
        <div className="absolute inset-0 flex items-center justify-center bg-background/90">
          <div className="text-center p-6">
            <CameraOff className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
            <p className="text-destructive mb-4">{error}</p>
            <Button onClick={startCamera} variant="outline">
              <RotateCcw className="w-4 h-4 mr-2" />
              Retry
            </Button>
          </div>
        </div>
      )}

      {/* Camera controls */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-3">
        <Button
          variant={isStreaming ? "destructive" : "default"}
          size="icon"
          onClick={isStreaming ? stopCamera : startCamera}
          className="rounded-full w-12 h-12"
        >
          {isStreaming ? <CameraOff className="w-5 h-5" /> : <Camera className="w-5 h-5" />}
        </Button>
        
        {isStreaming && (
          <Button
            onClick={handleCapture}
            className="rounded-full px-6 bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70"
          >
            <Camera className="w-4 h-4 mr-2" />
            Analyze Cards
          </Button>
        )}
      </div>
    </div>
  );
};
