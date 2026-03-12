import React from 'react';
import { motion } from 'framer-motion';
import { Heart } from 'lucide-react';

export default function StorePage() {
  return (
    <div className="max-w-4xl mx-auto space-y-12 py-12">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center space-y-8"
      >
        <div className="relative group">
          <motion.div 
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1.2, ease: "easeOut" }}
            className="absolute -inset-8 bg-emerald-500/10 blur-3xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-1000" 
          />
          <motion.img 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, ease: "easeOut" }}
            src="https://static.wixstatic.com/media/464dd0_2f5d6cf294384515ac19d35cc0393f43~mv2.jpeg/v1/fill/w_760,h_1278,al_c,q_85,usm_0.66_1.00_0.01,enc_auto/LIVRO%20ANIMO%20DOBRE.jpeg" 
            alt="Lançamento do Livro: Ânimo Dobre" 
            className="w-full max-w-sm mx-auto rounded-[2rem] shadow-[0_20px_50px_rgba(0,0,0,0.3)] relative z-10 transition-transform duration-1000 group-hover:scale-[1.03]"
            referrerPolicy="no-referrer"
          />
        </div>

        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.8 }}
          className="space-y-6 px-4"
        >
          <div className="flex items-center justify-center gap-3 text-emerald-600 dark:text-emerald-400">
            <motion.div
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ repeat: Infinity, duration: 2 }}
            >
              <Heart size={24} fill="currentColor" />
            </motion.div>
            <span className="font-bold tracking-[0.4em] uppercase text-xs">Lançamento Exclusivo</span>
            <motion.div
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ repeat: Infinity, duration: 2, delay: 0.5 }}
            >
              <Heart size={24} fill="currentColor" />
            </motion.div>
          </div>

          <h2 className="text-4xl md:text-6xl font-display font-black text-emerald-900 dark:text-emerald-400 tracking-tighter leading-none">
            Ânimo Dobre
          </h2>

          <p className="text-xl md:text-2xl text-stone-600 dark:text-zinc-400 font-serif italic leading-relaxed max-w-2xl mx-auto">
            "Uma obra inspirada para fortalecer o seu espírito e renovar as suas forças na caminhada cristã."
          </p>

          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1, duration: 1 }}
            className="pt-8"
          >
            <div className="inline-block px-10 py-5 bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-bold rounded-2xl shadow-2xl shadow-emerald-600/30 hover:shadow-emerald-600/50 transition-shadow">
              DISPONÍVEL EM JUNHO DESTE ANO
            </div>
          </motion.div>

          <p className="text-stone-400 dark:text-zinc-500 text-xs font-bold uppercase tracking-[0.2em] pt-4">
            Prepare-se para uma imersão profunda na Palavra.
          </p>
        </motion.div>
      </motion.div>
    </div>
  );
}
