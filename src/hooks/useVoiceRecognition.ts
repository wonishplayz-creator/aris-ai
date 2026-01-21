import { useState, useCallback, useRef, useEffect } from 'react';

interface UseVoiceRecognitionOptions {
  wakeWord?: string;
  onWakeWordDetected?: () => void;
  onCommand?: (command: string) => void;
  onListeningChange?: (isListening: boolean) => void;
}

export const useVoiceRecognition = ({
  wakeWord = 'hey aris',
  onWakeWordDetected,
  onCommand,
  onListeningChange
}: UseVoiceRecognitionOptions = {}) => {
  const [isEnabled, setIsEnabled] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isAwaitingCommand, setIsAwaitingCommand] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [error, setError] = useState<string | null>(null);
  
  const recognitionRef = useRef<SpeechRecognitionInstance | null>(null);
  const commandTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const startListening = useCallback(() => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      setError('Speech recognition not supported in this browser');
      return;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-US';

    recognition.onstart = () => {
      setIsListening(true);
      setError(null);
      onListeningChange?.(true);
    };

    recognition.onend = () => {
      setIsListening(false);
      onListeningChange?.(false);
      
      // Restart if still enabled
      if (isEnabled && recognitionRef.current) {
        try {
          recognition.start();
        } catch (e) {
          // Already started
        }
      }
    };

    recognition.onerror = (event) => {
      console.error('Speech recognition error:', event.error);
      if (event.error !== 'no-speech' && event.error !== 'aborted') {
        setError(`Voice error: ${event.error}`);
      }
    };

    recognition.onresult = (event) => {
      let finalTranscript = '';
      let interimTranscript = '';

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          finalTranscript += transcript;
        } else {
          interimTranscript += transcript;
        }
      }

      const currentTranscript = (finalTranscript || interimTranscript).toLowerCase().trim();
      setTranscript(currentTranscript);

      // Check for wake word
      if (!isAwaitingCommand && currentTranscript.includes(wakeWord.toLowerCase())) {
        setIsAwaitingCommand(true);
        onWakeWordDetected?.();
        
        // Clear any existing timeout
        if (commandTimeoutRef.current) {
          clearTimeout(commandTimeoutRef.current);
        }
        
        // Set timeout to capture command after wake word
        commandTimeoutRef.current = setTimeout(() => {
          // Extract command after wake word
          const wakeWordIndex = currentTranscript.toLowerCase().indexOf(wakeWord.toLowerCase());
          const command = currentTranscript.slice(wakeWordIndex + wakeWord.length).trim();
          
          if (command) {
            onCommand?.(command);
          }
          
          setIsAwaitingCommand(false);
          setTranscript('');
        }, 2000); // Wait 2 seconds for command to complete
      }
      
      // If awaiting command and we have final transcript
      if (isAwaitingCommand && finalTranscript) {
        const wakeWordIndex = finalTranscript.toLowerCase().indexOf(wakeWord.toLowerCase());
        if (wakeWordIndex !== -1) {
          const command = finalTranscript.slice(wakeWordIndex + wakeWord.length).trim();
          
          if (command) {
            if (commandTimeoutRef.current) {
              clearTimeout(commandTimeoutRef.current);
            }
            onCommand?.(command);
            setIsAwaitingCommand(false);
            setTranscript('');
          }
        }
      }
    };

    recognitionRef.current = recognition;
    
    try {
      recognition.start();
    } catch (e) {
      console.error('Failed to start recognition:', e);
    }
  }, [isEnabled, isAwaitingCommand, wakeWord, onWakeWordDetected, onCommand, onListeningChange]);

  const stopListening = useCallback(() => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      recognitionRef.current = null;
    }
    if (commandTimeoutRef.current) {
      clearTimeout(commandTimeoutRef.current);
    }
    setIsListening(false);
    setIsAwaitingCommand(false);
    setTranscript('');
  }, []);

  const toggleEnabled = useCallback(() => {
    if (isEnabled) {
      stopListening();
      setIsEnabled(false);
    } else {
      setIsEnabled(true);
    }
  }, [isEnabled, stopListening]);

  // Start/stop based on enabled state
  useEffect(() => {
    if (isEnabled && !isListening) {
      startListening();
    } else if (!isEnabled && isListening) {
      stopListening();
    }
  }, [isEnabled, isListening, startListening, stopListening]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopListening();
    };
  }, [stopListening]);

  return {
    isEnabled,
    isListening,
    isAwaitingCommand,
    transcript,
    error,
    toggleEnabled,
    startListening,
    stopListening
  };
};

// Add type declarations for Web Speech API
interface SpeechRecognitionEvent extends Event {
  resultIndex: number;
  results: SpeechRecognitionResultList;
}

interface SpeechRecognitionResultList {
  length: number;
  item(index: number): SpeechRecognitionResult;
  [index: number]: SpeechRecognitionResult;
}

interface SpeechRecognitionResult {
  isFinal: boolean;
  length: number;
  item(index: number): SpeechRecognitionAlternative;
  [index: number]: SpeechRecognitionAlternative;
}

interface SpeechRecognitionAlternative {
  transcript: string;
  confidence: number;
}

interface SpeechRecognitionErrorEvent extends Event {
  error: string;
  message: string;
}

interface SpeechRecognitionInstance extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start(): void;
  stop(): void;
  abort(): void;
  onstart: ((this: SpeechRecognitionInstance, ev: Event) => void) | null;
  onend: ((this: SpeechRecognitionInstance, ev: Event) => void) | null;
  onerror: ((this: SpeechRecognitionInstance, ev: SpeechRecognitionErrorEvent) => void) | null;
  onresult: ((this: SpeechRecognitionInstance, ev: SpeechRecognitionEvent) => void) | null;
}

interface SpeechRecognitionConstructor {
  new(): SpeechRecognitionInstance;
}

declare global {
  interface Window {
    SpeechRecognition: SpeechRecognitionConstructor;
    webkitSpeechRecognition: SpeechRecognitionConstructor;
  }
}
