import { Sparkles } from 'lucide-react';

export const YourFaceLogo = () => {
  return (
    <div className="flex items-center gap-2">
      <div className="relative">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary via-primary/80 to-primary/60 flex items-center justify-center shadow-lg shadow-primary/25">
          <Sparkles className="w-5 h-5 text-primary-foreground" />
        </div>
        <div className="absolute -top-1 -right-1 w-3 h-3 bg-success rounded-full border-2 border-background animate-pulse" />
      </div>
      <div>
        <h1 className="text-xl font-bold tracking-tight text-foreground">
          Your<span className="text-primary">Face</span>
        </h1>
        <p className="text-[10px] text-muted-foreground -mt-1">AI Card Strategist</p>
      </div>
    </div>
  );
};
