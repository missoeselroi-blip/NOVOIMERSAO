import React from 'react';
import { Info } from 'lucide-react';

export const CreditInfoTip: React.FC = () => {
  return (
    <div className="bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-2xl p-4 mt-4 text-sm text-emerald-800 dark:text-emerald-300">
      <div className="flex items-start gap-3">
        <Info className="shrink-0 mt-0.5" size={18} />
        <div className="space-y-2">
          <p className="font-bold">Dica: Sistema de Créditos</p>
          <p>Novos usuários recebem <strong>100 créditos gratuitos</strong>. Estes créditos são debitados conforme o uso de IA:</p>
          <ul className="list-disc list-inside space-y-1 text-xs">
            <li>Pesquisas simples: 2 a 4 créditos.</li>
            <li>Pesquisas elaboradas e gerações complexas: 8+ créditos.</li>
            <li>Gerar Apostila e Gerar Vídeo: até 50 créditos.</li>
          </ul>
          <p className="text-xs pt-2">
            Precisa de mais? A compra de créditos pode ser feita na página <strong>Imersão &gt; Aba Créditos/Quotas</strong>.
          </p>
        </div>
      </div>
    </div>
  );
};
