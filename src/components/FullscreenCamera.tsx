import { useEffect } from 'react';
import { Camera, CameraOff, RotateCcw, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useCamera } from '@/hooks/useCamera';

interface FullscreenCameraProps {
  onCapture: (imageData: string) => void;
  captureRef: React.MutableRefObject<(() => void) | null>;
}

export const FullscreenCamera = ({ onCapture, captureRef }: FullscreenCameraProps) => {
  const { videoRef, canvasRef, isStreaming, error, startCamera, stopCamera, captureFrame } = useCamera();

  useEffect(() => {
    startCamera();
  }, [startCamera]);

  // Expose capture function to parent
  useEffect(() => {
    captureRef.current = () => {
      const imageData = captureFrame();
      if (imageData) {
        onCapture(imageData);
      }
    };
  }, [captureFrame, onCapture, captureRef]);

  const handleCapture = () => {
    const imageData = captureFrame();
    if (imageData) {
      onCapture(imageData);
    }
  };

  return (
    <div className="fixed inset-0 bg-background">
      {/* Hidden canvas for capture */}
      <canvas ref={canvasRef} className="hidden" />
      
      {/* Video stream - fullscreen */}
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        className="w-full h-full object-cover"
      />

      {/* Subtle vignette overlay */}
      <div className="absolute inset-0 pointer-events-none bg-gradient-to-b from-background/40 via-transparent to-background/60" />

      {/* Corner brackets for scanning effect */}
      <div className="absolute inset-0 pointer-events-none p-8">
        <div className="relative w-full h-full">
          <div className="absolute top-0 left-0 w-20 h-20 border-l-2 border-t-2 border-primary/40 rounded-tl-2xl" />
          <div className="absolute top-0 right-0 w-20 h-20 border-r-2 border-t-2 border-primary/40 rounded-tr-2xl" />
          <div className="absolute bottom-24 left-0 w-20 h-20 border-l-2 border-b-2 border-primary/40 rounded-bl-2xl" />
          <div className="absolute bottom-24 right-0 w-20 h-20 border-r-2 border-b-2 border-primary/40 rounded-br-2xl" />
        </div>
      </div>

      {/* Status bar - top */}
      <div className="absolute top-4 left-0 right-0 flex justify-center pointer-events-none z-50">
        <div className="flex items-center gap-3 bg-background/80 backdrop-blur-xl px-4 py-2 rounded-full border border-border/50 shadow-lg pointer-events-auto">
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${isStreaming ? 'bg-success animate-pulse' : 'bg-destructive'}`} />
            <span className="text-sm font-medium text-foreground">
              {isStreaming ? 'Live' : 'Off'}
            </span>
          </div>
          
          <div className="w-px h-4 bg-border" />
          
          <Button
            size="icon"
            variant="ghost"
            className="h-8 w-8 rounded-full"
            onClick={isStreaming ? stopCamera : startCamera}
          >
            {isStreaming ? <CameraOff className="w-4 h-4" /> : <Camera className="w-4 h-4" />}
          </Button>

          {isStreaming && (
            <Button
              size="icon"
              variant="ghost"
              className="h-8 w-8 rounded-full"
              onClick={handleCapture}
            >
              <RefreshCw className="w-4 h-4" />
            </Button>
          )}
        </div>
      </div>

      {/* Error display */}
      {error && (
        <div className="absolute inset-0 flex items-center justify-center bg-background/95 z-40">
          <div className="text-center p-8 max-w-md">
            <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-muted flex items-center justify-center">
              <CameraOff className="w-10 h-10 text-muted-foreground" />
            </div>
            <h2 className="text-xl font-semibold text-foreground mb-2">Camera Access Needed</h2>
            <p className="text-muted-foreground mb-6">{error}</p>
            <Button onClick={startCamera} className="rounded-full px-6">
              <RotateCcw className="w-4 h-4 mr-2" />
              Enable Camera
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};
