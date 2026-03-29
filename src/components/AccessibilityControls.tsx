import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Type, ZoomIn, ZoomOut, AlignLeft, X, Settings2 } from 'lucide-react';
import { useAccessibility, FontFamily, FontSize } from '../contexts/AccessibilityContext';
import { cn } from '../types';

export const AccessibilityControls: React.FC = () => {
  const [isOpen, setIsOpen] = React.useState(false);
  const { fontFamily, setFontFamily, fontSize, setFontSize, lineHeight, setLineHeight } = useAccessibility();

  const fontFamilies: { id: FontFamily; label: string; class: string }[] = [
    { id: 'sans', label: 'Sans Serif', class: 'font-sans' },
    { id: 'serif', label: 'Serif', class: 'font-serif' },
    { id: 'mono', label: 'Monospace', class: 'font-mono' },
    { id: 'dyslexic', label: 'OpenDyslexic', class: 'font-dyslexic' },
  ];

  const fontSizes: FontSize[] = ['xs', 'sm', 'base', 'lg', 'xl', '2xl', '3xl'];

  const handleFontSizeChange = (delta: number) => {
    const currentIndex = fontSizes.indexOf(fontSize);
    const nextIndex = Math.max(0, Math.min(fontSizes.length - 1, currentIndex + delta));
    setFontSize(fontSizes[nextIndex]);
  };

  return (
    <motion.div 
      drag
      dragMomentum={false}
      className="fixed bottom-44 right-6 md:bottom-28 md:right-8 z-50 flex flex-col items-end gap-4 touch-none"
    >
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="bg-white dark:bg-zinc-900 border border-stone-200 dark:border-zinc-800 rounded-3xl shadow-2xl p-6 w-72 space-y-6"
          >
            <div className="flex items-center justify-between">
              <h3 className="font-bold flex items-center gap-2">
                <Settings2 size={18} className="text-emerald-600" />
                Acessibilidade
              </h3>
              <button onClick={() => setIsOpen(false)} className="p-1 hover:bg-stone-100 dark:hover:bg-zinc-800 rounded-full">
                <X size={18} />
              </button>
            </div>

            {/* Font Family */}
            <div className="space-y-3">
              <label className="text-xs font-bold text-stone-400 uppercase tracking-widest flex items-center gap-2">
                <Type size={14} />
                Fonte
              </label>
              <div className="grid grid-cols-2 gap-2">
                {fontFamilies.map((font) => (
                  <button
                    key={font.id}
                    onClick={() => setFontFamily(font.id)}
                    className={cn(
                      "px-3 py-2 rounded-xl text-xs transition-all border",
                      fontFamily === font.id
                        ? "bg-emerald-600 text-white border-emerald-600 shadow-lg shadow-emerald-600/20"
                        : "bg-stone-50 dark:bg-zinc-800 border-stone-200 dark:border-zinc-700 hover:border-emerald-300"
                    )}
                  >
                    <span className={font.class}>{font.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Font Size */}
            <div className="space-y-3">
              <label className="text-xs font-bold text-stone-400 uppercase tracking-widest flex items-center gap-2">
                <ZoomIn size={14} />
                Tamanho do Texto
              </label>
              <div className="flex items-center justify-between bg-stone-50 dark:bg-zinc-800 rounded-xl p-2 border border-stone-200 dark:border-zinc-700">
                <button 
                  onClick={() => handleFontSizeChange(-1)}
                  className="p-2 hover:bg-white dark:hover:bg-zinc-700 rounded-lg transition-colors"
                >
                  <ZoomOut size={18} />
                </button>
                <span className="text-sm font-bold uppercase">{fontSize}</span>
                <button 
                  onClick={() => handleFontSizeChange(1)}
                  className="p-2 hover:bg-white dark:hover:bg-zinc-700 rounded-lg transition-colors"
                >
                  <ZoomIn size={18} />
                </button>
              </div>
            </div>

            {/* Line Height */}
            <div className="space-y-3">
              <label className="text-xs font-bold text-stone-400 uppercase tracking-widest flex items-center gap-2">
                <AlignLeft size={14} />
                Espaçamento
              </label>
              <input 
                type="range" 
                min="1.2" 
                max="2.4" 
                step="0.1" 
                value={lineHeight}
                onChange={(e) => setLineHeight(parseFloat(e.target.value))}
                className="w-full accent-emerald-600"
              />
              <div className="flex justify-between text-[10px] font-bold text-stone-400">
                <span>Compacto</span>
                <span>Largo</span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "w-14 h-14 flex flex-col items-center justify-center gap-0.5 rounded-full shadow-2xl transition-all hover:scale-110 active:scale-95 border-2 border-white dark:border-zinc-900 cursor-grab active:cursor-grabbing group overflow-hidden",
          isOpen 
            ? "bg-stone-900 text-white dark:bg-white dark:text-zinc-900" 
            : "bg-emerald-600 text-white"
        )}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-500 to-teal-700 opacity-0 group-hover:opacity-100 transition-opacity" />
        {isOpen ? <X size={20} className="relative z-10" /> : <Type size={20} className="relative z-10" />}
        <span className="relative z-10 text-[8px] font-black uppercase tracking-widest">Texto</span>
      </button>
    </motion.div>
  );
};
