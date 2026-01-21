import { useState } from 'react';
import { X, User, Camera, Save, Trash2, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { FaceProfile } from '@/hooks/useMemory';

interface FaceSetupDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentProfile: FaceProfile | null;
  onSave: (profile: FaceProfile) => void;
  onClear: () => void;
  onCaptureFace: () => string | null;
}

export const FaceSetupDialog = ({
  open,
  onOpenChange,
  currentProfile,
  onSave,
  onClear,
  onCaptureFace
}: FaceSetupDialogProps) => {
  const [name, setName] = useState(currentProfile?.name || '');
  const [description, setDescription] = useState(currentProfile?.description || '');
  const [capturedImage, setCapturedImage] = useState<string | null>(currentProfile?.imageData || null);

  const handleCapture = () => {
    const imageData = onCaptureFace();
    if (imageData) {
      setCapturedImage(imageData);
    }
  };

  const handleSave = () => {
    if (!name.trim()) return;
    
    onSave({
      name: name.trim(),
      description: description.trim(),
      imageData: capturedImage || undefined,
      createdAt: new Date().toISOString()
    });
    onOpenChange(false);
  };

  const handleClear = () => {
    setName('');
    setDescription('');
    setCapturedImage(null);
    onClear();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md bg-card border-border">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <User className="w-5 h-5 text-primary" />
            Face Setup
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          {/* Face capture */}
          <div className="flex justify-center">
            <div 
              className="relative w-32 h-32 rounded-full bg-muted border-2 border-dashed border-border flex items-center justify-center overflow-hidden cursor-pointer hover:border-primary transition-colors"
              onClick={handleCapture}
            >
              {capturedImage ? (
                <img src={capturedImage} alt="Your face" className="w-full h-full object-cover" />
              ) : (
                <div className="text-center p-4">
                  <Camera className="w-8 h-8 mx-auto text-muted-foreground mb-1" />
                  <span className="text-xs text-muted-foreground">Tap to capture</span>
                </div>
              )}
            </div>
          </div>

          {/* Name input */}
          <div>
            <label className="text-sm font-medium text-foreground mb-1 block">Your Name</label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="What should Aris call you?"
              className="bg-background"
            />
          </div>

          {/* Description */}
          <div>
            <label className="text-sm font-medium text-foreground mb-1 block">Tell Aris about yourself</label>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="e.g., I'm a software developer who loves card games. I have a cat named Whiskers."
              className="bg-background resize-none"
              rows={3}
            />
          </div>

          <div className="bg-primary/10 rounded-lg p-3 flex gap-2">
            <Sparkles className="w-4 h-4 text-primary shrink-0 mt-0.5" />
            <p className="text-xs text-muted-foreground">
              Aris will remember your face and greet you personally. Your data is stored locally on your device.
            </p>
          </div>

          {/* Actions */}
          <div className="flex gap-2">
            {currentProfile && (
              <Button variant="destructive" onClick={handleClear} className="flex-1">
                <Trash2 className="w-4 h-4 mr-2" />
                Clear
              </Button>
            )}
            <Button onClick={handleSave} disabled={!name.trim()} className="flex-1">
              <Save className="w-4 h-4 mr-2" />
              Save
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
