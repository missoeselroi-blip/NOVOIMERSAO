import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Book, BookOpen, PenTool, Loader2, Theater, ScrollText, PlusCircle } from 'lucide-react';

interface SaveToNotebookModalProps {
  isOpen: boolean;
  isLoading?: boolean;
  onClose: () => void;
  onConfirm: (category: 'Anotações' | 'Pregações' | 'Estudos' | 'Histórias' | 'Teatro' | 'Outros') => void;
}

export function SaveToNotebookModal({ isOpen, isLoading, onClose, onConfirm }: SaveToNotebookModalProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={isLoading ? undefined : onClose}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative w-full max-w-md bg-white dark:bg-zinc-900 rounded-[2rem] shadow-2xl overflow-hidden"
          >
            <div className="p-6 border-b border-stone-100 dark:border-zinc-800 flex justify-between items-center">
              <h3 className="text-xl font-bold font-display text-emerald-900 dark:text-emerald-400">
                Salvar no Caderno
              </h3>
              <button
                onClick={onClose}
                disabled={isLoading}
                className="p-2 text-stone-400 hover:text-stone-600 dark:hover:text-stone-300 rounded-full hover:bg-stone-100 dark:hover:bg-zinc-800 transition-colors disabled:opacity-50"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-6 space-y-4 relative">
              {isLoading && (
                <div className="absolute inset-0 bg-white/80 dark:bg-zinc-900/80 z-10 flex flex-col items-center justify-center space-y-4 backdrop-blur-[2px]">
                  <Loader2 className="animate-spin text-emerald-600" size={40} />
                  <p className="text-emerald-900 dark:text-emerald-400 font-bold animate-pulse">Guardando no caderno...</p>
                </div>
              )}

              <p className="text-stone-600 dark:text-zinc-400 mb-4">
                Em qual caderno você deseja salvar este conteúdo?
              </p>

              <button
                onClick={() => onConfirm('Anotações')}
                disabled={isLoading}
                className="w-full flex items-center gap-4 p-4 rounded-2xl border border-stone-200 dark:border-zinc-800 hover:border-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 transition-all group disabled:opacity-50"
              >
                <div className="w-12 h-12 rounded-xl bg-emerald-100 dark:bg-emerald-900/50 flex items-center justify-center text-emerald-600 dark:text-emerald-400 group-hover:scale-110 transition-transform">
                  <PenTool size={24} />
                </div>
                <div className="text-left">
                  <h4 className="font-bold text-stone-900 dark:text-white">Anotações</h4>
                  <p className="text-sm text-stone-500 dark:text-zinc-400">Ideias, reflexões e notas gerais</p>
                </div>
              </button>

              <button
                onClick={() => onConfirm('Pregações')}
                disabled={isLoading}
                className="w-full flex items-center gap-4 p-4 rounded-2xl border border-stone-200 dark:border-zinc-800 hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all group disabled:opacity-50"
              >
                <div className="w-12 h-12 rounded-xl bg-blue-100 dark:bg-blue-900/50 flex items-center justify-center text-blue-600 dark:text-blue-400 group-hover:scale-110 transition-transform">
                  <BookOpen size={24} />
                </div>
                <div className="text-left">
                  <h4 className="font-bold text-stone-900 dark:text-white">Pregações</h4>
                  <p className="text-sm text-stone-500 dark:text-zinc-400">Esboços e mensagens para ministrar</p>
                </div>
              </button>

              <button
                onClick={() => onConfirm('Estudos')}
                disabled={isLoading}
                className="w-full flex items-center gap-4 p-4 rounded-2xl border border-stone-200 dark:border-zinc-800 hover:border-purple-500 hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-all group disabled:opacity-50"
              >
                <div className="w-12 h-12 rounded-xl bg-purple-100 dark:bg-purple-900/50 flex items-center justify-center text-purple-600 dark:text-purple-400 group-hover:scale-110 transition-transform">
                  <Book size={24} />
                </div>
                <div className="text-left">
                  <h4 className="font-bold text-stone-900 dark:text-white">Estudos</h4>
                  <p className="text-sm text-stone-500 dark:text-zinc-400">Pesquisas e aprofundamentos bíblicos</p>
                </div>
              </button>

              <button
                onClick={() => onConfirm('Histórias')}
                disabled={isLoading}
                className="w-full flex items-center gap-4 p-4 rounded-2xl border border-stone-200 dark:border-zinc-800 hover:border-amber-500 hover:bg-amber-50 dark:hover:bg-amber-900/20 transition-all group disabled:opacity-50"
              >
                <div className="w-12 h-12 rounded-xl bg-amber-100 dark:bg-amber-900/50 flex items-center justify-center text-amber-600 dark:text-amber-400 group-hover:scale-110 transition-transform">
                  <ScrollText size={24} />
                </div>
                <div className="text-left">
                  <h4 className="font-bold text-stone-900 dark:text-white">Histórias</h4>
                  <p className="text-sm text-stone-500 dark:text-zinc-400">Contos, fábulas e estórias geradas</p>
                </div>
              </button>

              <button
                onClick={() => onConfirm('Teatro')}
                disabled={isLoading}
                className="w-full flex items-center gap-4 p-4 rounded-2xl border border-stone-200 dark:border-zinc-800 hover:border-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/20 transition-all group disabled:opacity-50"
              >
                <div className="w-12 h-12 rounded-xl bg-rose-100 dark:bg-rose-900/50 flex items-center justify-center text-rose-600 dark:text-rose-400 group-hover:scale-110 transition-transform">
                  <Theater size={24} />
                </div>
                <div className="text-left">
                  <h4 className="font-bold text-stone-900 dark:text-white">Teatro</h4>
                  <p className="text-sm text-stone-500 dark:text-zinc-400">Peças, roteiros e dramaturgia</p>
                </div>
              </button>

              <button
                onClick={() => onConfirm('Outros')}
                disabled={isLoading}
                className="w-full flex items-center gap-4 p-4 rounded-2xl border border-stone-200 dark:border-zinc-800 hover:border-stone-500 hover:bg-stone-50 dark:hover:bg-stone-900/20 transition-all group disabled:opacity-50"
              >
                <div className="w-12 h-12 rounded-xl bg-stone-100 dark:bg-stone-900/50 flex items-center justify-center text-stone-600 dark:text-stone-400 group-hover:scale-110 transition-transform">
                  <PlusCircle size={24} />
                </div>
                <div className="text-left">
                  <h4 className="font-bold text-stone-900 dark:text-white">Outros</h4>
                  <p className="text-sm text-stone-500 dark:text-zinc-400">Outras categorias de conteúdo</p>
                </div>
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
