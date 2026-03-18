import React, { useState, useEffect, useCallback } from 'react';
import { Mic, MicOff, Loader2, Volume2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { playAcceptedBeep, playCompletedBeep } from '../lib/audioUtils';
import { useToast } from './Toast';
import { cn } from '../types';

interface VoiceCommandCenterProps {
  onCommand?: (command: string) => void;
}

export const VoiceCommandCenter: React.FC<VoiceCommandCenterProps> = () => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const navigate = useNavigate();
  const { showToast } = useToast();

  const processCommand = useCallback((text: string) => {
    const command = text.toLowerCase().trim();
    console.log('Processing command:', command);

    // Navigation commands
    if (command.includes('abrir bíblia online') || command.includes('abrir bíblia') || command.includes('estudo bíblico')) {
      playAcceptedBeep();
      navigate('/study');
      playCompletedBeep();
      showToast('Abrindo Bíblia Online...', 'success');
      return true;
    }

    if (command.includes('abrir esboço') || (command.includes('esboço') && !command.includes('gerar'))) {
      playAcceptedBeep();
      navigate('/study?tab=outline');
      playCompletedBeep();
      showToast('Abrindo seção de Esboços...', 'success');
      return true;
    }

    if (command.includes('abrir devocional')) {
      playAcceptedBeep();
      navigate('/devotional');
      playCompletedBeep();
      showToast('Abrindo Devocional...', 'success');
      return true;
    }

    if (command.includes('abrir teologia')) {
      playAcceptedBeep();
      navigate('/theology');
      playCompletedBeep();
      showToast('Abrindo Teologia...', 'success');
      return true;
    }

    // Search commands
    if (command.includes('pesquisar versículo') || command.includes('pesquisar versiculo')) {
      const query = command.replace(/pesquisar versículo|pesquisar versiculo/g, '').trim();
      if (query) {
        playAcceptedBeep();
        navigate(`/study?search=${encodeURIComponent(query)}`);
        playCompletedBeep();
        showToast(`Pesquisando versículo: ${query}`, 'success');
        return true;
      }
    }

    // Outline generation commands
    if (command.includes('gerar esboço para') || command.includes('gerar esboço sobre')) {
      const theme = command.replace(/gerar esboço para|gerar esboço sobre/g, '').trim();
      if (theme) {
        playAcceptedBeep();
        navigate(`/study?outline=${encodeURIComponent(theme)}`);
        playCompletedBeep();
        showToast(`Gerando esboço para: ${theme}`, 'success');
        return true;
      }
    }

    return false;
  }, [navigate, showToast]);

  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) return;

    const recognition = new SpeechRecognition();
    recognition.lang = 'pt-BR';
    recognition.continuous = false;
    recognition.interimResults = false;

    recognition.onstart = () => {
      setIsListening(true);
      setTranscript('');
    };

    recognition.onresult = (event: any) => {
      const current = event.resultIndex;
      const text = event.results[current][0].transcript;
      setTranscript(text);
      
      const wasCommand = processCommand(text);
      if (!wasCommand) {
        showToast(`Comando não reconhecido: "${text}"`, 'info');
      }
    };

    recognition.onerror = (event: any) => {
      console.error('Speech recognition error', event.error);
      setIsListening(false);
      
      if (event.error === 'not-allowed') {
        showToast('Permissão de microfone negada. Por favor, permita o acesso nas configurações do navegador.', 'error');
      } else if (event.error !== 'no-speech') {
        showToast('Erro no reconhecimento de voz.', 'error');
      }
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    if (isListening) {
      recognition.start();
    } else {
      recognition.stop();
    }

    return () => {
      recognition.stop();
    };
  }, [isListening, processCommand, showToast]);

  return (
    <div className="fixed bottom-24 left-6 z-50 flex flex-col items-start gap-4">
      <AnimatePresence>
        {isListening && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, x: -20 }}
            animate={{ opacity: 1, scale: 1, x: 0 }}
            exit={{ opacity: 0, scale: 0.9, x: -20 }}
            className="bg-white dark:bg-zinc-900 border border-stone-200 dark:border-zinc-800 rounded-3xl shadow-2xl p-4 w-64"
          >
            <div className="flex items-center gap-3 mb-2">
              <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
              <span className="text-xs font-bold uppercase tracking-widest text-stone-500">Ouvindo...</span>
            </div>
            <p className="text-sm font-medium text-stone-600 dark:text-zinc-300 italic">
              {transcript || 'Diga um comando...'}
            </p>
            <div className="mt-4 pt-4 border-t border-stone-100 dark:border-zinc-800">
              <p className="text-[10px] text-stone-400 uppercase font-bold leading-relaxed">
                Exemplos:<br/>
                • "Abrir Bíblia Online"<br/>
                • "Pesquisar versículo João 3:16"<br/>
                • "Gerar esboço para Fé"
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <button
        onClick={() => setIsListening(!isListening)}
        className={cn(
          "p-4 rounded-full shadow-2xl transition-all hover:scale-110 active:scale-95 group relative",
          isListening 
            ? "bg-red-500 text-white animate-pulse" 
            : "bg-emerald-600 text-white"
        )}
        title="Comando de Voz"
      >
        {isListening ? <MicOff size={24} /> : <Mic size={24} />}
        
        {/* Tooltip */}
        {!isListening && (
          <div className="absolute left-full ml-3 px-3 py-1.5 bg-zinc-900 dark:bg-zinc-800 text-white text-[10px] font-black rounded-lg opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none whitespace-nowrap z-[100] shadow-xl border border-white/10 -translate-x-2 group-hover:translate-x-0 uppercase tracking-widest">
            Comando de Voz
            <div className="absolute right-full top-1/2 -translate-y-1/2 border-8 border-transparent border-r-zinc-900 dark:border-r-zinc-800" />
          </div>
        )}
      </button>
    </div>
  );
};
