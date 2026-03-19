import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Hourglass, Loader2 } from 'lucide-react';

interface SearchLoadingOverlayProps {
  isVisible: boolean;
  message?: string;
}

export function SearchLoadingOverlay({ isVisible, message = "Pesquisando..." }: SearchLoadingOverlayProps) {
  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="bg-white dark:bg-zinc-900 rounded-[2.5rem] p-8 shadow-2xl border border-stone-200 dark:border-zinc-800 text-center max-w-sm w-full space-y-6"
          >
            <div className="relative w-24 h-24 mx-auto">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                className="absolute inset-0 text-emerald-600/20"
              >
                <Loader2 size={96} strokeWidth={1} />
              </motion.div>
              <motion.div
                animate={{ 
                  rotate: [0, 180, 180, 360, 360],
                  scale: [1, 1.1, 1, 1.1, 1]
                }}
                transition={{ 
                  duration: 3, 
                  repeat: Infinity, 
                  times: [0, 0.4, 0.5, 0.9, 1],
                  ease: "easeInOut"
                }}
                className="absolute inset-0 flex items-center justify-center text-emerald-600"
              >
                <Hourglass size={48} strokeWidth={1.5} />
              </motion.div>
            </div>
            
            <div className="space-y-2">
              <h3 className="text-xl font-bold text-stone-900 dark:text-white">
                {message}
              </h3>
              <p className="text-sm text-stone-500 dark:text-zinc-400">
                Aguarde um momento enquanto a IA processa sua solicitação.
              </p>
            </div>

            <div className="flex justify-center gap-1">
              {[0, 1, 2].map((i) => (
                <motion.div
                  key={i}
                  animate={{ 
                    scale: [1, 1.5, 1],
                    opacity: [0.3, 1, 0.3]
                  }}
                  transition={{ 
                    duration: 1, 
                    repeat: Infinity, 
                    delay: i * 0.2 
                  }}
                  className="w-2 h-2 bg-emerald-600 rounded-full"
                />
              ))}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
