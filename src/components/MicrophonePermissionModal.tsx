import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mic, X, ShieldCheck, AlertCircle } from 'lucide-react';

export const MicrophonePermissionModal: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    // Check if permission was already granted or dismissed
    const hasPrompted = localStorage.getItem('mic_permission_prompted');
    
    if (!hasPrompted) {
      // Check if browser supports speech recognition
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        // Delay a bit to not overwhelm the user on first load
        const timer = setTimeout(() => {
          setIsOpen(true);
        }, 2000);
        return () => clearTimeout(timer);
      }
    }
  }, []);

  const handleRequestPermission = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      // Stop the stream immediately, we just wanted the permission
      stream.getTracks().forEach(track => track.stop());
      localStorage.setItem('mic_permission_prompted', 'true');
      setIsOpen(false);
    } catch (error) {
      console.error('Error requesting microphone permission:', error);
      localStorage.setItem('mic_permission_prompted', 'true');
      setIsOpen(false);
    }
  };

  const handleDismiss = () => {
    localStorage.setItem('mic_permission_prompted', 'true');
    setIsOpen(false);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="bg-white dark:bg-zinc-900 w-full max-w-md rounded-[2.5rem] overflow-hidden shadow-2xl border border-stone-200 dark:border-zinc-800"
          >
            <div className="p-8 text-center space-y-6">
              <div className="w-20 h-20 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-3xl flex items-center justify-center mx-auto">
                <Mic size={40} />
              </div>
              
              <div className="space-y-2">
                <h3 className="text-2xl font-bold text-stone-900 dark:text-white">Permissão de Microfone</h3>
                <p className="text-stone-500 dark:text-zinc-400">
                  Para usar os comandos de voz e a pesquisa por áudio, precisamos de acesso ao seu microfone.
                </p>
              </div>

              <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-2xl flex items-start gap-3 text-left border border-blue-100 dark:border-blue-800/30">
                <ShieldCheck className="text-blue-600 shrink-0 mt-0.5" size={18} />
                <p className="text-xs text-blue-800 dark:text-blue-200">
                  Sua privacidade é importante. O áudio é processado apenas para comandos e nunca é armazenado sem sua autorização.
                </p>
              </div>

              <div className="flex flex-col gap-3">
                <button
                  onClick={handleRequestPermission}
                  className="w-full py-4 bg-emerald-600 text-white font-bold rounded-2xl hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-600/20 flex items-center justify-center gap-2"
                >
                  Permitir Acesso
                </button>
                <button
                  onClick={handleDismiss}
                  className="w-full py-4 bg-stone-100 dark:bg-zinc-800 text-stone-600 dark:text-zinc-300 font-bold rounded-2xl hover:bg-stone-200 dark:hover:bg-zinc-700 transition-all"
                >
                  Agora Não
                </button>
              </div>
              
              <p className="text-[10px] text-stone-400 uppercase font-bold tracking-widest">
                Você pode alterar isso nas configurações do navegador a qualquer momento.
              </p>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
