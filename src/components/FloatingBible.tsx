import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Book } from 'lucide-react';
import { cn } from '../types';
import BiblePage from '../pages/BiblePage';
import { useLocation } from 'react-router-dom';

export const FloatingBible: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    setIsOpen(false);
  }, [location.pathname]);

  const isBiblePage = location.pathname === '/bible';

  return (
    <>
      {/* Floating Button */}
      {!isBiblePage && (
        <motion.button
          drag
          dragConstraints={{ left: -window.innerWidth + 80, right: 0, top: -window.innerHeight + 80, bottom: 0 }}
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9, cursor: 'grabbing' }}
          onClick={() => setIsOpen(true)}
          className="fixed bottom-[21rem] right-6 md:bottom-[17rem] md:right-8 z-[60] w-14 h-14 bg-emerald-600 text-white rounded-full shadow-2xl flex flex-col items-center justify-center gap-0.5 group overflow-hidden border-2 border-white dark:border-zinc-900 cursor-grab active:cursor-grabbing"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-500 to-teal-700 opacity-0 group-hover:opacity-100 transition-opacity" />
          <Book size={20} className="relative z-10 animate-pulse" />
          <span className="relative z-10 text-[8px] font-black uppercase tracking-widest">Bíblia</span>
        </motion.button>
      )}

      {/* Overlay */}
      <div
        className={cn(
          "fixed inset-0 z-[70] bg-white dark:bg-zinc-950 overflow-hidden transition-all duration-300",
          isOpen ? "opacity-100 translate-y-0 scale-100 pointer-events-auto" : "opacity-0 translate-y-12 scale-95 pointer-events-none"
        )}
      >
        <BiblePage isOverlay={true} onClose={() => setIsOpen(false)} />
      </div>
    </>
  );
};
