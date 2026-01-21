import { useState, useCallback } from 'react';

export type EffectType = 
  | 'glasses'
  | 'sunglasses' 
  | 'hearts'
  | 'sparkles'
  | 'fire'
  | 'snow'
  | 'confetti'
  | 'rainbow'
  | 'vignette'
  | 'blur'
  | 'pixelate'
  | 'retro'
  | 'neon'
  | 'party'
  | 'none';

export interface ActiveEffect {
  type: EffectType;
  startTime: number;
  duration?: number; // in ms, undefined = permanent until cleared
}

export const useScreenEffects = () => {
  const [activeEffects, setActiveEffects] = useState<ActiveEffect[]>([]);

  const addEffect = useCallback((type: EffectType, duration?: number) => {
    const effect: ActiveEffect = {
      type,
      startTime: Date.now(),
      duration
    };
    
    setActiveEffects(prev => [...prev.filter(e => e.type !== type), effect]);

    // Auto-remove if duration specified
    if (duration) {
      setTimeout(() => {
        setActiveEffects(prev => prev.filter(e => e.type !== type || e.startTime !== effect.startTime));
      }, duration);
    }
  }, []);

  const removeEffect = useCallback((type: EffectType) => {
    setActiveEffects(prev => prev.filter(e => e.type !== type));
  }, []);

  const clearAllEffects = useCallback(() => {
    setActiveEffects([]);
  }, []);

  const hasEffect = useCallback((type: EffectType) => {
    return activeEffects.some(e => e.type === type);
  }, [activeEffects]);

  return {
    activeEffects,
    addEffect,
    removeEffect,
    clearAllEffects,
    hasEffect
  };
};

// Parse AI response for effect commands
export const parseEffectCommands = (text: string): { type: EffectType; duration?: number }[] => {
  const effects: { type: EffectType; duration?: number }[] = [];
  
  const patterns: { pattern: RegExp; effect: EffectType }[] = [
    { pattern: /\[EFFECT:GLASSES\]/gi, effect: 'glasses' },
    { pattern: /\[EFFECT:SUNGLASSES\]/gi, effect: 'sunglasses' },
    { pattern: /\[EFFECT:HEARTS\]/gi, effect: 'hearts' },
    { pattern: /\[EFFECT:SPARKLES\]/gi, effect: 'sparkles' },
    { pattern: /\[EFFECT:FIRE\]/gi, effect: 'fire' },
    { pattern: /\[EFFECT:SNOW\]/gi, effect: 'snow' },
    { pattern: /\[EFFECT:CONFETTI\]/gi, effect: 'confetti' },
    { pattern: /\[EFFECT:RAINBOW\]/gi, effect: 'rainbow' },
    { pattern: /\[EFFECT:VIGNETTE\]/gi, effect: 'vignette' },
    { pattern: /\[EFFECT:BLUR\]/gi, effect: 'blur' },
    { pattern: /\[EFFECT:PIXELATE\]/gi, effect: 'pixelate' },
    { pattern: /\[EFFECT:RETRO\]/gi, effect: 'retro' },
    { pattern: /\[EFFECT:NEON\]/gi, effect: 'neon' },
    { pattern: /\[EFFECT:PARTY\]/gi, effect: 'party' },
    { pattern: /\[EFFECT:CLEAR\]/gi, effect: 'none' },
  ];

  for (const { pattern, effect } of patterns) {
    if (pattern.test(text)) {
      effects.push({ type: effect, duration: effect === 'confetti' ? 5000 : undefined });
    }
  }

  return effects;
};

// Remove effect tags from displayed text
export const cleanEffectTags = (text: string): string => {
  return text.replace(/\[EFFECT:[A-Z]+\]/gi, '').trim();
};
