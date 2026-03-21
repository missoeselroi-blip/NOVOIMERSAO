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
    if (command.includes('ir para início') || command.includes('ir para inicio') || command.includes('abrir início')) {
      playAcceptedBeep();
      navigate('/');
      playCompletedBeep();
      showToast('Indo para o Início... 🏠', 'success');
      return true;
    }

    if (command.includes('abrir bíblia online') || command.includes('abrir bíblia') || command.includes('estudo bíblico') || command.includes('ir para imersão')) {
      playAcceptedBeep();
      navigate('/study');
      playCompletedBeep();
      showToast('Abrindo Bíblia Online... 📖', 'success');
      return true;
    }

    if (command.includes('abrir esboço') || (command.includes('esboço') && !command.includes('gerar'))) {
      playAcceptedBeep();
      navigate('/study?tab=outline');
      playCompletedBeep();
      showToast('Abrindo seção de Esboços... ✍️', 'success');
      return true;
    }

    if (command.includes('abrir devocional') || command.includes('ir para devocional')) {
      playAcceptedBeep();
      navigate('/devotional');
      playCompletedBeep();
      showToast('Abrindo Devocional... ❤️', 'success');
      return true;
    }

    if (command.includes('abrir teologia') || command.includes('ir para teologia')) {
      playAcceptedBeep();
      navigate('/theology');
      playCompletedBeep();
      showToast('Abrindo Teologia... 🎓', 'success');
      return true;
    }

    if (command.includes('abrir caderno') || command.includes('ir para caderno')) {
      playAcceptedBeep();
      navigate('/notebook');
      playCompletedBeep();
      showToast('Abrindo seu Caderno... 📓', 'success');
      return true;
    }

    if (command.includes('abrir notícias') || command.includes('ir para notícias')) {
      playAcceptedBeep();
      navigate('/news');
      playCompletedBeep();
      showToast('Abrindo Notícias... 📰', 'success');
      return true;
    }

    if (command.includes('abrir perfil') || command.includes('ir para perfil')) {
      playAcceptedBeep();
      navigate('/profile');
      playCompletedBeep();
      showToast('Abrindo seu Perfil... 👤', 'success');
      return true;
    }

    if (command.includes('abrir créditos') || command.includes('ir para créditos')) {
      playAcceptedBeep();
      navigate('/credits');
      playCompletedBeep();
      showToast('Abrindo Créditos... 🎖️', 'success');
      return true;
    }

    if (command.includes('abrir contato') || command.includes('ir para contato')) {
      playAcceptedBeep();
      navigate('/contact');
      playCompletedBeep();
      showToast('Abrindo Contato... 📧', 'success');
      return true;
    }

    if (command.includes('abrir fórum') || command.includes('ir para fórum')) {
      playAcceptedBeep();
      navigate('/forum');
      playCompletedBeep();
      showToast('Abrindo Fórum... 💬', 'success');
      return true;
    }

    if (command.includes('abrir carreira') || command.includes('ir para carreira') || command.includes('quadro de honra')) {
      playAcceptedBeep();
      navigate('/career');
      playCompletedBeep();
      showToast('Abrindo Carreira... 🏆', 'success');
      return true;
    }

    // Feature commands
    if (command.includes('gerar lição') || command.includes('gerar comentário')) {
      playAcceptedBeep();
      window.dispatchEvent(new CustomEvent('generate-lesson'));
      playCompletedBeep();
      showToast('Gerando lição... 📚', 'success');
      return true;
    }

    // Feature commands
    if (command.includes('ativar pensamento profundo')) {
      playAcceptedBeep();
      // This would need a global state or event, but for now we show the toast
      // and the user can see it's a valid command.
      // In a real app, we'd use a context or custom event.
      window.dispatchEvent(new CustomEvent('toggle-deep-thinking', { detail: true }));
      playCompletedBeep();
      showToast('Pensamento Profundo Ativado! 🧠✨', 'success');
      return true;
    }

    if (command.includes('desativar pensamento profundo')) {
      playAcceptedBeep();
      window.dispatchEvent(new CustomEvent('toggle-deep-thinking', { detail: false }));
      playCompletedBeep();
      showToast('Pensamento Profundo Desativado.', 'info');
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
    <motion.div 
      drag
      dragMomentum={false}
      className="fixed bottom-24 left-6 z-50 flex flex-col items-start gap-4 touch-none"
    >
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
    </motion.div>
  );
};
