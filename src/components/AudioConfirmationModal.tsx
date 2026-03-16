import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Volume2, Loader2, X, AlertCircle } from 'lucide-react';

interface AudioConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  isLoading?: boolean;
}

export const AudioConfirmationModal: React.FC<AudioConfirmationModalProps> = ({ 
  isOpen, 
  onClose, 
  onConfirm,
  isLoading = false
}) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="bg-white dark:bg-zinc-900 w-full max-w-md rounded-[2.5rem] overflow-hidden shadow-2xl border border-stone-200 dark:border-zinc-800"
          >
            <div className="p-8 text-center space-y-6">
              <div className="w-20 h-20 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-3xl flex items-center justify-center mx-auto">
                <Volume2 size={40} />
              </div>
              
              <div className="space-y-2">
                <h3 className="text-2xl font-bold text-stone-900 dark:text-white">Gerar Áudio com IA</h3>
                <p className="text-stone-500 dark:text-zinc-400">
                  A geração de áudio por inteligência artificial é um processo complexo e pode levar alguns instantes para ser concluída.
                </p>
              </div>

              <div className="bg-amber-50 dark:bg-amber-900/20 p-4 rounded-2xl flex items-start gap-3 text-left">
                <AlertCircle className="text-amber-600 shrink-0 mt-0.5" size={18} />
                <p className="text-xs text-amber-800 dark:text-amber-200">
                  O tempo de espera depende da extensão do texto. Você deseja continuar?
                </p>
              </div>

              <div className="flex flex-col gap-3">
                <button
                  onClick={onConfirm}
                  disabled={isLoading}
                  className="w-full py-4 bg-emerald-600 text-white font-bold rounded-2xl hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-600/20 flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="animate-spin" size={20} />
                      Processando...
                    </>
                  ) : (
                    'Continuar e Gerar'
                  )}
                </button>
                <button
                  onClick={onClose}
                  disabled={isLoading}
                  className="w-full py-4 bg-stone-100 dark:bg-zinc-800 text-stone-600 dark:text-zinc-300 font-bold rounded-2xl hover:bg-stone-200 dark:hover:bg-zinc-700 transition-all"
                >
                  Desistir
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
