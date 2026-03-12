import React, { useState, useEffect } from 'react';
import { Mic, MicOff, Loader2 } from 'lucide-react';
import { useToast } from './Toast';

interface AudioSearchButtonProps {
  onResult: (text: string) => void;
  className?: string;
  size?: number;
}

export function AudioSearchButton({ onResult, className, size = 20 }: AudioSearchButtonProps) {
  const [isListening, setIsListening] = useState(false);
  const { showToast } = useToast();
  const [recognition, setRecognition] = useState<any>(null);

  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognitionInstance = new SpeechRecognition();
      recognitionInstance.continuous = false;
      recognitionInstance.interimResults = false;
      recognitionInstance.lang = 'pt-BR';

      recognitionInstance.onstart = () => {
        setIsListening(true);
        showToast("Ouvindo... Fale agora! 🎤", 'info');
      };

      recognitionInstance.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        onResult(transcript);
        setIsListening(false);
        showToast(`Entendi: "${transcript}"`, 'success');
      };

      recognitionInstance.onerror = (event: any) => {
        console.error('Speech recognition error', event.error);
        setIsListening(false);
        if (event.error === 'not-allowed') {
          showToast("Permissão de microfone negada. 🚫", 'error');
        } else {
          showToast("Erro ao ouvir. Tente novamente. ❌", 'error');
        }
      };

      recognitionInstance.onend = () => {
        setIsListening(false);
      };

      setRecognition(recognitionInstance);
    }
  }, [onResult, showToast]);

  const toggleListening = () => {
    if (!recognition) {
      showToast("Seu navegador não suporta pesquisa por voz. 🚫", 'error');
      return;
    }

    if (isListening) {
      recognition.stop();
    } else {
      try {
        recognition.start();
      } catch (e) {
        console.error(e);
      }
    }
  };

  return (
    <button
      type="button"
      onClick={toggleListening}
      className={`p-2 rounded-full transition-all ${
        isListening 
          ? 'bg-red-100 text-red-600 animate-pulse' 
          : 'text-stone-400 hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-900/20'
      } ${className}`}
      title={isListening ? "Parar de ouvir" : "Pesquisar por voz"}
    >
      {isListening ? <MicOff size={size} /> : <Mic size={size} />}
    </button>
  );
}
