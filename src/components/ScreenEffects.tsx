import { useEffect, useState } from 'react';
import { ActiveEffect, EffectType } from '@/hooks/useScreenEffects';
import { cn } from '@/lib/utils';

interface ScreenEffectsProps {
  activeEffects: ActiveEffect[];
}

interface Particle {
  id: number;
  x: number;
  y: number;
  emoji: string;
  size: number;
  animationDuration: number;
  delay: number;
}

export const ScreenEffects = ({ activeEffects }: ScreenEffectsProps) => {
  const [particles, setParticles] = useState<Particle[]>([]);

  // Generate particles for emoji effects
  useEffect(() => {
    const particleEffects: Record<EffectType, string[]> = {
      hearts: ['❤️', '💕', '💖', '💗', '💓'],
      sparkles: ['✨', '⭐', '🌟', '💫', '⚡'],
      fire: ['🔥', '🔥', '🔥', '💥', '✨'],
      snow: ['❄️', '🌨️', '❄️', '⛄', '❄️'],
      confetti: ['🎉', '🎊', '🎈', '🎁', '⭐'],
      party: ['🎉', '🪩', '🎶', '💃', '🕺'],
      glasses: [],
      sunglasses: [],
      rainbow: [],
      vignette: [],
      blur: [],
      pixelate: [],
      retro: [],
      neon: [],
      none: []
    };

    const activeParticleEffects = activeEffects.filter(e => 
      particleEffects[e.type]?.length > 0
    );

    if (activeParticleEffects.length > 0) {
      const newParticles: Particle[] = [];
      activeParticleEffects.forEach(effect => {
        const emojis = particleEffects[effect.type];
        for (let i = 0; i < 20; i++) {
          newParticles.push({
            id: Date.now() + i + Math.random(),
            x: Math.random() * 100,
            y: -10 - Math.random() * 20,
            emoji: emojis[Math.floor(Math.random() * emojis.length)],
            size: 1 + Math.random() * 1.5,
            animationDuration: 3 + Math.random() * 4,
            delay: Math.random() * 2
          });
        }
      });
      setParticles(newParticles);
    } else {
      setParticles([]);
    }
  }, [activeEffects]);

  const hasEffect = (type: EffectType) => activeEffects.some(e => e.type === type);

  return (
    <>
      {/* Filter overlays */}
      <div 
        className={cn(
          "fixed inset-0 pointer-events-none z-30 transition-all duration-500",
          hasEffect('vignette') && "shadow-[inset_0_0_150px_60px_rgba(0,0,0,0.8)]",
          hasEffect('blur') && "backdrop-blur-sm",
          hasEffect('retro') && "sepia brightness-90",
          hasEffect('neon') && "mix-blend-screen"
        )}
        style={{
          filter: [
            hasEffect('retro') ? 'sepia(0.5) contrast(1.1)' : '',
            hasEffect('neon') ? 'saturate(2) brightness(1.2)' : '',
          ].filter(Boolean).join(' ') || undefined
        }}
      />

      {/* Rainbow overlay */}
      {hasEffect('rainbow') && (
        <div 
          className="fixed inset-0 pointer-events-none z-30 opacity-30"
          style={{
            background: 'linear-gradient(45deg, rgba(255,0,0,0.3), rgba(255,127,0,0.3), rgba(255,255,0,0.3), rgba(0,255,0,0.3), rgba(0,0,255,0.3), rgba(139,0,255,0.3))',
            animation: 'rainbow-shift 3s linear infinite'
          }}
        />
      )}

      {/* Neon glow border */}
      {hasEffect('neon') && (
        <div 
          className="fixed inset-0 pointer-events-none z-30"
          style={{
            boxShadow: 'inset 0 0 60px 20px rgba(255,0,255,0.4), inset 0 0 100px 40px rgba(0,255,255,0.3)',
            animation: 'neon-pulse 1.5s ease-in-out infinite alternate'
          }}
        />
      )}

      {/* Glasses overlay */}
      {hasEffect('glasses') && (
        <div className="fixed top-1/4 left-1/2 -translate-x-1/2 pointer-events-none z-40">
          <div className="text-8xl animate-bounce" style={{ animationDuration: '2s' }}>
            👓
          </div>
        </div>
      )}

      {/* Sunglasses overlay */}
      {hasEffect('sunglasses') && (
        <div className="fixed top-1/4 left-1/2 -translate-x-1/2 pointer-events-none z-40">
          <div className="text-8xl animate-bounce" style={{ animationDuration: '2s' }}>
            🕶️
          </div>
        </div>
      )}

      {/* Particle effects */}
      {particles.length > 0 && (
        <div className="fixed inset-0 pointer-events-none z-35 overflow-hidden">
          {particles.map(particle => (
            <div
              key={particle.id}
              className="absolute animate-fall"
              style={{
                left: `${particle.x}%`,
                top: `${particle.y}%`,
                fontSize: `${particle.size}rem`,
                animationDuration: `${particle.animationDuration}s`,
                animationDelay: `${particle.delay}s`,
                animationIterationCount: 'infinite'
              }}
            >
              {particle.emoji}
            </div>
          ))}
        </div>
      )}

      {/* Global styles for effects */}
      <style>{`
        @keyframes rainbow-shift {
          0% { filter: hue-rotate(0deg); }
          100% { filter: hue-rotate(360deg); }
        }
        
        @keyframes neon-pulse {
          0% { opacity: 0.6; }
          100% { opacity: 1; }
        }
        
        @keyframes fall {
          0% {
            transform: translateY(0) rotate(0deg);
            opacity: 1;
          }
          100% {
            transform: translateY(100vh) rotate(360deg);
            opacity: 0.5;
          }
        }
        
        .animate-fall {
          animation: fall linear forwards;
        }
      `}</style>
    </>
  );
};
