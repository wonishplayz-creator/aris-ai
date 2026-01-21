import { useState, useEffect, useCallback } from 'react';

const MEMORY_STORAGE_KEY = 'yourface_memory';
const FACE_STORAGE_KEY = 'yourface_face_profile';

export interface FaceProfile {
  name: string;
  description: string;
  imageData?: string;
  createdAt: string;
}

export interface MemoryItem {
  id: string;
  content: string;
  timestamp: string;
}

export const useMemory = () => {
  const [faceProfile, setFaceProfile] = useState<FaceProfile | null>(null);
  const [memories, setMemories] = useState<MemoryItem[]>([]);

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const savedFace = localStorage.getItem(FACE_STORAGE_KEY);
      if (savedFace) {
        setFaceProfile(JSON.parse(savedFace));
      }
      
      const savedMemories = localStorage.getItem(MEMORY_STORAGE_KEY);
      if (savedMemories) {
        setMemories(JSON.parse(savedMemories));
      }
    } catch (e) {
      console.error('Failed to load memory:', e);
    }
  }, []);

  const saveFaceProfile = useCallback((profile: FaceProfile) => {
    setFaceProfile(profile);
    localStorage.setItem(FACE_STORAGE_KEY, JSON.stringify(profile));
  }, []);

  const clearFaceProfile = useCallback(() => {
    setFaceProfile(null);
    localStorage.removeItem(FACE_STORAGE_KEY);
  }, []);

  const addMemory = useCallback((content: string) => {
    const newMemory: MemoryItem = {
      id: Date.now().toString(),
      content,
      timestamp: new Date().toISOString()
    };
    
    setMemories(prev => {
      const updated = [...prev, newMemory].slice(-50); // Keep last 50 memories
      localStorage.setItem(MEMORY_STORAGE_KEY, JSON.stringify(updated));
      return updated;
    });
  }, []);

  const clearMemories = useCallback(() => {
    setMemories([]);
    localStorage.removeItem(MEMORY_STORAGE_KEY);
  }, []);

  const getContextPrompt = useCallback(() => {
    let context = '';
    
    if (faceProfile) {
      context += `\n\nIMPORTANT USER CONTEXT - This is your user:
- Name: ${faceProfile.name}
- Description: ${faceProfile.description}
When you see them in the camera, greet them by name and be personal.`;
    }
    
    if (memories.length > 0) {
      const recentMemories = memories.slice(-10).map(m => `- ${m.content}`).join('\n');
      context += `\n\nRecent things you remember about conversations:
${recentMemories}`;
    }
    
    return context;
  }, [faceProfile, memories]);

  return {
    faceProfile,
    memories,
    saveFaceProfile,
    clearFaceProfile,
    addMemory,
    clearMemories,
    getContextPrompt
  };
};
