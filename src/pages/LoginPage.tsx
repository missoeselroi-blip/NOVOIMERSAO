import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Mail, Lock, User, Sparkles, BookOpen, Globe, MessageSquare, AlertCircle, Github } from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '../types';
import { auth, isProjectSuspended } from '../lib/firebase';

export const LoginPage: React.FC = () => {
  const { loginWithGoogle, loginWithGithub, loginWithEmail, registerWithEmail } = useAuth();
  const [isRegistering, setIsRegistering] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const isFirebaseConfigured = !!auth;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password || (isRegistering && !name)) return;
    setIsLoading(true);
    try {
      if (isRegistering) {
        await registerWithEmail(email, password, name);
      } else {
        await loginWithEmail(email, password);
      }
    } catch (error: any) {
      console.error("Erro capturado:", error);
      let errorMessage = "Erro desconhecido";
      if (error instanceof Error) {
        errorMessage = error.message;
      } else if (typeof error === 'string') {
        errorMessage = error;
      } else if (error && typeof error === 'object' && 'code' in error) {
        errorMessage = error.code;
      }
      
      alert(isRegistering ? `Erro ao criar conta: ${errorMessage}` : `Erro ao entrar: ${errorMessage}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    setError(null);
    try {
      await loginWithGoogle();
    } catch (err: any) {
      if (err.code === 'auth/popup-closed-by-user' || err.code === 'auth/cancelled-popup-request') {
        console.log("Login popup closed by user");
        return;
      }
      
      setError(err.message || "Erro ao fazer login com Google.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleGithubLogin = async () => {
    setIsLoading(true);
    setError(null);
    try {
      await loginWithGithub();
    } catch (err: any) {
      if (err.code === 'auth/popup-closed-by-user' || err.code === 'auth/cancelled-popup-request') {
        console.log("Login popup closed by user");
        return;
      }
      setError(err.message || "Erro ao fazer login com GitHub.");
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
        {error && (
          <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-2xl flex items-start gap-3">
            <AlertCircle className="text-red-600 flex-shrink-0 mt-0.5" size={18} />
            <div className="text-xs text-red-800 dark:text-red-400 leading-relaxed">
              <p className="font-bold mb-1">Erro de Acesso</p>
              <p>{error}</p>
            </div>
          </div>
        )}

        {!isFirebaseConfigured && !error && (
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
            <img 
              src="https://i.postimg.cc/3N279HyV/1000105226-removebg-preview.png" 
              alt="Logo" 
              className="w-10 h-10 object-contain"
              referrerPolicy="no-referrer"
            />
            <h1 className="text-3xl font-display font-bold tracking-tight">Imersão Bíblica IA</h1>
          </div>
          <p className="text-stone-500 dark:text-zinc-400 text-sm">
            {isRegistering ? 'Crie sua conta para começar sua jornada.' : 'Sua jornada única no estudo da Palavra começa aqui.'}
          </p>
        </div>

        <div className="space-y-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            {isRegistering && (
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-stone-400 ml-2">Seu Nome</label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400" size={18} />
                  <input 
                    type="text" 
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="⚓ Como quer ser chamado?"
                    className="w-full pl-12 pr-4 py-4 bg-stone-50 dark:bg-zinc-800 border border-stone-200 dark:border-zinc-700 rounded-2xl focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
                  />
                </div>
              </div>
            )}

            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-stone-400 ml-2">E-mail</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400" size={18} />
                <input 
                  type="email" 
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="⚓ seu@email.com"
                  className="w-full pl-12 pr-4 py-4 bg-stone-50 dark:bg-zinc-800 border border-stone-200 dark:border-zinc-700 rounded-2xl focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-stone-400 ml-2">Senha</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400" size={18} />
                <input 
                  type="password" 
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
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
              {isRegistering ? 'Criar Conta' : 'Iniciar Jornada'}
            </button>

            <button 
              type="button"
              onClick={() => setIsRegistering(!isRegistering)}
              className="w-full py-2 text-stone-400 text-sm hover:text-emerald-600 transition-colors"
            >
              {isRegistering ? 'Já tem uma conta? Entre aqui' : 'Não tem uma conta? Cadastre-se'}
            </button>
          </form>

          <div className="relative py-4">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-stone-100 dark:border-zinc-800"></div>
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-white dark:bg-zinc-900 px-4 text-stone-400">Ou continue com</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <button 
              onClick={handleGoogleLogin}
              className="py-4 px-6 bg-white dark:bg-zinc-800 border border-stone-200 dark:border-zinc-700 rounded-2xl flex items-center justify-center gap-3 hover:bg-stone-50 dark:hover:bg-zinc-700 transition-all font-bold shadow-sm"
            >
              <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" className="w-5 h-5" referrerPolicy="no-referrer" />
              Google
            </button>

            <button 
              onClick={handleGithubLogin}
              className="py-4 px-6 bg-zinc-900 dark:bg-zinc-700 text-white border border-transparent rounded-2xl flex items-center justify-center gap-3 hover:bg-zinc-800 dark:hover:bg-zinc-600 transition-all font-bold shadow-sm"
            >
              <Github size={20} />
              GitHub
            </button>
          </div>

          <div className="mt-6 text-center">
            <p className="text-[10px] text-stone-400 dark:text-zinc-500 uppercase tracking-widest mb-1">
              Autenticação Segura
            </p>
            <p className="text-[9px] text-stone-300 dark:text-zinc-600 leading-tight">
              O domínio <span className="font-mono">gen-lang-client...</span> é o servidor oficial de segurança do Google para este aplicativo.
            </p>
          </div>
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

