import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Mail, Lock, User, Sparkles, BookOpen, Globe, MessageSquare, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '../types';
import { auth } from '../lib/firebase';

export const LoginPage: React.FC = () => {
  const { loginWithGoogle, loginWithEmail } = useAuth();
  const [isEmailLogin, setIsEmailLogin] = useState(false);
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const isFirebaseConfigured = !!auth;

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !name) return;
    setIsLoading(true);
    try {
      await loginWithEmail(email, name);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-[#fcfaf7] dark:bg-[#030303] transition-colors duration-700">
      {/* Decorative Background Elements */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-[10%] -left-[10%] w-[60%] h-[60%] rounded-full blur-[160px] opacity-20 bg-emerald-100 dark:bg-emerald-900/40" />
        <div className="absolute top-[20%] -right-[10%] w-[50%] h-[50%] rounded-full blur-[160px] opacity-10 bg-blue-50 dark:bg-blue-900/30" />
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md bg-white dark:bg-zinc-900 rounded-[2.5rem] p-8 md:p-12 shadow-2xl border border-stone-100 dark:border-zinc-800 relative z-10"
      >
        {!isFirebaseConfigured && (
          <div className="mb-6 p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-2xl flex items-start gap-3">
            <AlertCircle className="text-amber-600 flex-shrink-0 mt-0.5" size={18} />
            <div className="text-xs text-amber-800 dark:text-amber-400 leading-relaxed">
              <p className="font-bold mb-1">Firebase não configurado</p>
              <p>O login e a sincronização não funcionarão até que você adicione as chaves no menu <strong>Settings &gt; Environment Variables</strong>.</p>
            </div>
          </div>
        )}

        <div className="text-center space-y-4 mb-10">
          <div className="flex items-center justify-center gap-4 mb-6">
            <h1 className="text-3xl font-display font-bold tracking-tight">Imersão Bíblica IA</h1>
          </div>
          <p className="text-stone-500 dark:text-zinc-400 text-sm">Sua jornada única no estudo da Palavra começa aqui.</p>
        </div>

        <div className="space-y-6">
          {!isEmailLogin ? (
            <>
              <button 
                onClick={loginWithGoogle}
                className="w-full py-4 px-6 bg-white dark:bg-zinc-800 border border-stone-200 dark:border-zinc-700 rounded-2xl flex items-center justify-center gap-3 hover:bg-stone-50 dark:hover:bg-zinc-700 transition-all font-bold shadow-sm"
              >
                <img src="https://www.google.com/favicon.ico" alt="Google" className="w-5 h-5" />
                Entrar com Google
              </button>
              
              <div className="relative py-4">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-stone-100 dark:border-zinc-800"></div>
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-white dark:bg-zinc-900 px-4 text-stone-400">Ou use seu e-mail</span>
                </div>
              </div>

              <button 
                onClick={() => setIsEmailLogin(true)}
                className="w-full py-4 px-6 bg-emerald-600 text-white rounded-2xl flex items-center justify-center gap-3 hover:bg-emerald-700 transition-all font-bold shadow-lg shadow-emerald-600/20"
              >
                <Mail size={20} />
                Entrar com E-mail
              </button>
            </>
          ) : (
            <form onSubmit={handleEmailSubmit} className="space-y-4">
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-stone-400 ml-2">Seu Nome</label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400" size={18} />
                  <input 
                    type="text" 
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Como quer ser chamado?"
                    className="w-full pl-12 pr-4 py-4 bg-stone-50 dark:bg-zinc-800 border border-stone-200 dark:border-zinc-700 rounded-2xl focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-stone-400 ml-2">E-mail</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400" size={18} />
                  <input 
                    type="email" 
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="seu@email.com"
                    className="w-full pl-12 pr-4 py-4 bg-stone-50 dark:bg-zinc-800 border border-stone-200 dark:border-zinc-700 rounded-2xl focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
                  />
                </div>
              </div>

              <button 
                type="submit"
                disabled={isLoading}
                className="w-full py-4 px-6 bg-emerald-600 text-white rounded-2xl flex items-center justify-center gap-3 hover:bg-emerald-700 transition-all font-bold shadow-lg shadow-emerald-600/20 disabled:opacity-50 mt-4"
              >
                {isLoading ? <Sparkles className="animate-spin" size={20} /> : <Sparkles size={20} />}
                Iniciar Jornada
              </button>

              <button 
                type="button"
                onClick={() => setIsEmailLogin(false)}
                className="w-full py-2 text-stone-400 text-sm hover:text-emerald-600 transition-colors"
              >
                Voltar para opções
              </button>
            </form>
          )}
        </div>

        <div className="mt-12 grid grid-cols-3 gap-4">
          <div className="flex flex-col items-center gap-2 text-stone-400">
            <Globe size={18} />
            <span className="text-[10px] uppercase font-bold">Wiki</span>
          </div>
          <div className="flex flex-col items-center gap-2 text-stone-400">
            <Sparkles size={18} />
            <span className="text-[10px] uppercase font-bold">IA</span>
          </div>
          <div className="flex flex-col items-center gap-2 text-stone-400">
            <MessageSquare size={18} />
            <span className="text-[10px] uppercase font-bold">Fórum</span>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
