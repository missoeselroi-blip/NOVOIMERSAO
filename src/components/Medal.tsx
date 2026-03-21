import React from 'react';
import { Anchor } from 'lucide-react';
import { motion } from 'framer-motion';

interface MedalProps {
  subject: string;
  completed: boolean;
}

export const Medal = ({ subject, completed }: MedalProps) => {
  return (
    <motion.div
      whileHover={{ scale: 1.05 }}
      className={`relative p-4 rounded-2xl border-2 flex flex-col items-center gap-2 transition-all ${
        completed 
          ? 'bg-amber-50 border-amber-400 shadow-lg shadow-amber-500/20' 
          : 'bg-stone-100 border-stone-200 opacity-60'
      }`}
    >
      <div className={`p-3 rounded-full ${completed ? 'bg-amber-400 text-white' : 'bg-stone-300 text-stone-500'}`}>
        <Anchor size={24} />
      </div>
      <span className={`text-xs font-bold text-center ${completed ? 'text-amber-900' : 'text-stone-500'}`}>
        {subject}
      </span>
      {completed && (
        <div className="absolute -top-2 -right-2 bg-emerald-500 text-white p-1 rounded-full">
          <span className="text-[10px] font-bold">✓</span>
        </div>
      )}
    </motion.div>
  );
};
