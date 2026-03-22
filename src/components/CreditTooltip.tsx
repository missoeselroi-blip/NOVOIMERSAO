import React from 'react';
import { Info } from 'lucide-react';
import { CreditInfoTip } from './CreditInfoTip';

export const CreditTooltip: React.FC = () => {
  return (
    <div className="relative group inline-block">
      <Info size={16} className="text-emerald-600 cursor-help" />
      <div className="absolute left-0 bottom-full mb-2 w-72 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-50">
        <CreditInfoTip />
      </div>
    </div>
  );
};
