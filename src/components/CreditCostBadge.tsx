import React from 'react';
import { Coins } from 'lucide-react';

interface CreditCostBadgeProps {
  cost: number;
}

export const CreditCostBadge: React.FC<CreditCostBadgeProps> = ({ cost }) => {
  return (
    <span className="inline-flex items-center gap-1 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 px-2 py-0.5 rounded-full text-xs font-bold">
      <Coins size={12} />
      {cost} créditos
    </span>
  );
};
