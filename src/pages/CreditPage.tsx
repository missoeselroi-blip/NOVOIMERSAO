import React from 'react';
import { 
  Coins, 
  History, 
  CreditCard, 
  TrendingDown, 
  TrendingUp,
  Zap,
  ShieldCheck,
  Clock,
  ArrowRight
} from 'lucide-react';
import { motion } from 'framer-motion';
import { useCredits } from '../contexts/CreditContext';
import { cn } from '../types';

import { loadStripe } from '@stripe/stripe-js';

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY || "");

export default function CreditPage() {
  const { balance, history, addCredits } = useCredits();

  const handlePurchase = async (amount: number, description: string) => {
    const stripe = await stripePromise;
    if (!stripe) return;

    try {
      const response = await fetch('/api/create-checkout-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount, description }),
      });
      const session = await response.json();

      if (session.id) {
        await (stripe as any).redirectToCheckout({ sessionId: session.id });
      } else {
        console.error('Failed to create checkout session');
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const purchaseOptions = [
    { amount: 100, price: 'R$ 19,90', label: 'Básico', icon: <Zap className="text-blue-500" /> },
    { amount: 300, price: 'R$ 49,90', label: 'Popular', icon: <Coins className="text-emerald-500" />, popular: true },
    { amount: 1000, price: 'R$ 129,90', label: 'Premium', icon: <ShieldCheck className="text-purple-500" /> },
  ];

  return (
    <div className="space-y-12 pb-20">
      <header>
        <div className="flex items-center justify-center gap-4">
          <h2 className="text-4xl font-display font-bold text-emerald-900 dark:text-emerald-400">Créditos de IA</h2>
        </div>
        <p className="text-stone-500 dark:text-zinc-400">Gerencie seus recursos para estudos profundos.</p>
      </header>

      {/* Balance Card */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="md:col-span-1 bg-gradient-to-br from-emerald-600 to-teal-700 p-8 rounded-[2.5rem] text-white shadow-2xl shadow-emerald-600/20 relative overflow-hidden"
        >
          <div className="relative z-10">
            <div className="flex items-center gap-2 opacity-80 mb-2">
              <Coins size={20} />
              <span className="font-medium uppercase tracking-wider text-xs">Saldo Atual</span>
            </div>
            <div className="text-6xl font-display font-bold mb-6">{balance}</div>
            <p className="text-emerald-100 text-sm leading-relaxed">
              Seus créditos permitem que a IA realize pesquisas exaustivas e gere conteúdos exclusivos para você.
            </p>
          </div>
          <Coins className="absolute -right-8 -bottom-8 text-white/10 w-48 h-48 rotate-12" />
        </motion.div>

        {/* Purchase Options */}
        <div className="md:col-span-2 grid grid-cols-1 sm:grid-cols-3 gap-4">
          {purchaseOptions.map((option) => (
            <motion.div
              key={option.amount}
              whileHover={{ y: -5 }}
              className={cn(
                "bg-white dark:bg-zinc-900 p-6 rounded-3xl border flex flex-col justify-between transition-all",
                option.popular 
                  ? "border-emerald-500 shadow-lg shadow-emerald-500/10 ring-1 ring-emerald-500/50" 
                  : "border-stone-200 dark:border-zinc-800"
              )}
            >
              <div>
                <div className="flex justify-between items-start mb-4">
                  <div className="p-3 bg-stone-50 dark:bg-zinc-800 rounded-2xl">
                    {option.icon}
                  </div>
                  {option.popular && (
                    <span className="bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 text-[10px] font-bold px-2 py-1 rounded-full uppercase">Mais Vendido</span>
                  )}
                </div>
                <h4 className="text-xl font-bold mb-1">{option.amount} Créditos</h4>
                <p className="text-stone-400 text-xs mb-4">{option.label}</p>
                <div className="text-2xl font-display font-bold text-emerald-600 dark:text-emerald-400 mb-6">{option.price}</div>
              </div>
              <button 
                onClick={() => handlePurchase(option.amount, `Compra de pacote ${option.label}`)}
                className={cn(
                  "w-full py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-all",
                  option.popular 
                    ? "bg-emerald-600 text-white hover:bg-emerald-700" 
                    : "bg-stone-100 dark:bg-zinc-800 text-stone-600 dark:text-zinc-300 hover:bg-stone-200"
                )}
              >
                Comprar <ArrowRight size={16} />
              </button>
            </motion.div>
          ))}
        </div>
      </div>

      {/* History */}
      <div className="bg-white dark:bg-zinc-900 rounded-[2.5rem] border border-stone-200 dark:border-zinc-800 overflow-hidden shadow-sm">
        <div className="p-8 border-b border-stone-100 dark:border-zinc-800 flex items-center justify-between">
          <h3 className="text-xl font-bold flex items-center gap-2">
            <History className="text-emerald-600" size={24} />
            Histórico de Uso
          </h3>
          <div className="text-xs text-stone-400 font-mono uppercase tracking-widest">Últimas transações</div>
        </div>
        
        <div className="divide-y divide-stone-50 dark:divide-zinc-800/50">
          {history.length === 0 ? (
            <div className="p-20 text-center text-stone-400">
              <Clock size={48} className="mx-auto mb-4 opacity-20" />
              <p>Nenhuma transação encontrada.</p>
            </div>
          ) : (
            history.map((item) => (
              <div key={item.id} className="p-6 flex items-center justify-between hover:bg-stone-50/50 dark:hover:bg-zinc-800/30 transition-colors">
                <div className="flex items-center gap-4">
                  <div className={cn(
                    "p-3 rounded-2xl",
                    item.type === 'consumption' ? "bg-red-50 dark:bg-red-900/20 text-red-600" : "bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600"
                  )}>
                    {item.type === 'consumption' ? <TrendingDown size={20} /> : <TrendingUp size={20} />}
                  </div>
                  <div>
                    <div className="font-bold text-stone-800 dark:text-zinc-100">{item.description}</div>
                    <div className="text-xs text-stone-400">{new Date(item.date).toLocaleString('pt-BR')}</div>
                  </div>
                </div>
                <div className={cn(
                  "text-lg font-display font-bold",
                  item.type === 'consumption' ? "text-red-600" : "text-emerald-600"
                )}>
                  {item.type === 'consumption' ? '-' : '+'}{item.amount}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Info Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-stone-100 dark:bg-zinc-800/50 p-8 rounded-[2rem] border border-stone-200 dark:border-zinc-800">
          <h4 className="text-lg font-bold mb-4 flex items-center gap-2">
            <Zap className="text-amber-500" size={20} />
            Como funcionam os créditos?
          </h4>
          <ul className="space-y-3 text-sm text-stone-600 dark:text-zinc-400">
            <li className="flex gap-2">
              <span className="text-emerald-600 font-bold">•</span>
              Cada ação da IA consome uma quantidade específica de créditos baseada na complexidade.
            </li>
            <li className="flex gap-2">
              <span className="text-emerald-600 font-bold">•</span>
              Ações simples como dicionário consomem 1 crédito.
            </li>
            <li className="flex gap-2">
              <span className="text-emerald-600 font-bold">•</span>
              Geração de apostilas completas consomem cerca de 50 créditos devido ao alto processamento.
            </li>
          </ul>
        </div>
        <div className="bg-stone-100 dark:bg-zinc-800/50 p-8 rounded-[2rem] border border-stone-200 dark:border-zinc-800">
          <h4 className="text-lg font-bold mb-4 flex items-center gap-2">
            <CreditCard className="text-blue-500" size={20} />
            Precisa de mais?
          </h4>
          <p className="text-sm text-stone-600 dark:text-zinc-400 leading-relaxed mb-4">
            Nossos pacotes são projetados para atender desde o estudante casual até o pregador que prepara sermões semanais exaustivos.
          </p>
          <div className="flex items-center gap-2 text-xs font-bold text-emerald-600 dark:text-emerald-400">
            <ShieldCheck size={16} />
            Pagamento Seguro via Stripe
          </div>
        </div>
      </div>
    </div>
  );
}
