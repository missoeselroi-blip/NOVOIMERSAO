import React from 'react';
import { Info } from 'lucide-react';

export const CreditInfoTip: React.FC = () => {
  return (
    <div className="bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-2xl p-6 mt-8 text-sm text-emerald-800 dark:text-emerald-300 shadow-sm">
      <div className="flex items-start gap-4">
        <div className="p-2 bg-emerald-100 dark:bg-emerald-800/40 rounded-xl shrink-0">
          <Info className="text-emerald-600 dark:text-emerald-400" size={20} />
        </div>
        <div className="space-y-4">
          <div>
            <p className="font-bold text-lg mb-1">Dica: Sistema de Créditos</p>
            <p className="leading-relaxed">Novos usuários recebem <strong>100 créditos gratuitos</strong>. Estes créditos são debitados conforme o uso de IA:</p>
          </div>
          
          <ul className="space-y-2 text-sm">
            <li className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
              <span>Pesquisas simples: <strong>1 a 4 créditos</strong>.</span>
            </li>
            <li className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
              <span>Pesquisas mais complexas e gerações áudios: variam <strong>5; 8 ou + créditos</strong>.</span>
            </li>
            <li className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
              <span>Gerar Apostila: até <strong>50 créditos</strong>.</span>
            </li>
          </ul>

          <div className="p-3 bg-white/50 dark:bg-black/20 rounded-xl border border-emerald-100 dark:border-emerald-800/50 italic text-xs">
            P.S. A apostila é o recurso que mais consomem créditos, mas gera uma apostila com cerca de 80 páginas com bastante qualidade.
          </div>

          <div className="space-y-2 pt-2 border-t border-emerald-100 dark:border-emerald-800/50">
            <p>
              Precisa de mais créditos? A compra de créditos pode ser feita na página <strong>Créditos</strong> no Menu do App.
            </p>
            <p className="text-xs opacity-80">
              Já as <strong>Quotas</strong> definem a armazenagem de dados e possuem um plano gratuito, em caso de uso excessivo é possível trocar para um plano pago. O link está na página de Créditos.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
