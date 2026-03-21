import React from 'react';
import { Coins, Zap, Cloud, ArrowRight } from 'lucide-react';

export function CreditsQuotasTab() {
  return (
    <div className="space-y-8 p-6 bg-white dark:bg-zinc-900 rounded-[2.5rem] border border-stone-200 dark:border-zinc-800 shadow-sm">
      <h2 className="text-2xl font-bold text-emerald-900 dark:text-emerald-400">Créditos e Quotas</h2>
      
      <div className="space-y-6">
        <div className="bg-stone-50 dark:bg-zinc-800/50 p-6 rounded-2xl border border-stone-100 dark:border-zinc-700">
          <h3 className="text-lg font-bold flex items-center gap-2 mb-3">
            <Coins className="text-emerald-600" size={20} />
            Compra de Créditos
          </h3>
          <p className="text-sm text-stone-600 dark:text-zinc-400 mb-4">
            Para adquirir mais créditos e continuar aproveitando nossos recursos de IA, clique no botão abaixo.
          </p>
          <a 
            href="/credits" 
            className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white text-sm font-bold rounded-xl hover:bg-emerald-700 transition-all mb-4"
          >
            Comprar Créditos <ArrowRight size={16} />
          </a>
          <p className="text-xs text-stone-500 dark:text-zinc-500 italic">
            <strong>Aviso Legal:</strong> Este processo de compra de créditos é de inteira responsabilidade do IAStudio Google e não tem qualquer relação com o desenvolvedor deste aplicativo.
          </p>
        </div>

        <div className="bg-stone-50 dark:bg-zinc-800/50 p-6 rounded-2xl border border-stone-100 dark:border-zinc-700">
          <h3 className="text-lg font-bold flex items-center gap-2 mb-3">
            <Cloud className="text-blue-500" size={20} />
            Recursos de Nuvem (Quotas)
          </h3>
          <p className="text-sm text-stone-600 dark:text-zinc-400 mb-4">
            As quotas de recursos (como armazenamento, leituras e escritas no banco de dados) são gerenciadas pelo Firebase/Google Cloud. Se você atingir os limites do seu plano atual, o funcionamento do armazenamento de dados do app pode ser limitado.
          </p>
          <p className="text-sm text-stone-600 dark:text-zinc-400 mb-4">
            Para ampliar suas quotas, você deve realizar o upgrade do seu plano no console do Firebase/Google Cloud.
          </p>
          <a 
            href="https://console.firebase.google.com/" 
            target="_blank" 
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-bold rounded-xl hover:bg-blue-700 transition-all"
          >
            Acessar Console Firebase <ArrowRight size={16} />
          </a>
        </div>
      </div>
    </div>
  );
}
