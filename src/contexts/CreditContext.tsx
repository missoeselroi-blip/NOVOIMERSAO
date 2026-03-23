import React, { createContext, useContext, useState, useEffect } from 'react';

interface CreditTransaction {
  id: string;
  type: 'consumption' | 'purchase';
  amount: number;
  description: string;
  date: string;
}

interface CreditContextType {
  balance: number;
  history: CreditTransaction[];
  consumeCredits: (amount: number, description: string) => boolean;
  addCredits: (amount: number, description: string) => void;
  estimateCredits: (type: string) => number;
}

const CreditContext = createContext<CreditContextType | undefined>(undefined);

export const CreditProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [balance, setBalance] = useState<number>(() => {
    const saved = localStorage.getItem('ai_credits_balance');
    return saved ? parseInt(saved) : 100; // Default 100 free credits
  });

  const [history, setHistory] = useState<CreditTransaction[]>(() => {
    const saved = localStorage.getItem('ai_credits_history');
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem('ai_credits_balance', balance.toString());
  }, [balance]);

  useEffect(() => {
    localStorage.setItem('ai_credits_history', JSON.stringify(history));
  }, [history]);

  const consumeCredits = (amount: number, description: string) => {
    if (balance < amount) return false;
    
    setBalance(prev => prev - amount);
    const transaction: CreditTransaction = {
      id: Date.now().toString(),
      type: 'consumption',
      amount,
      description,
      date: new Date().toISOString()
    };
    setHistory(prev => [transaction, ...prev]);
    return true;
  };

  const addCredits = (amount: number, description: string) => {
    setBalance(prev => prev + amount);
    const transaction: CreditTransaction = {
      id: Date.now().toString(),
      type: 'purchase',
      amount,
      description,
      date: new Date().toISOString()
    };
    setHistory(prev => [transaction, ...prev]);
  };

  const estimateCredits = (type: string) => {
    switch (type) {
      case 'lesson': return 5;
      case 'study': return 8;
      case 'outline': return 3;
      case 'devotional': return 4;
      case 'debate': return 10;
      case 'booklet': return 50; // High cost for booklet as it queries many sources
      case 'wiki': return 2;
      case 'meaning': return 1;
      case 'author': return 5;
      case 'image': return 15; // Image generation is expensive
      case 'avatar': return 10; // Avatar generation cost
      case 'kids_ministry': return 5;
      default: return 2;
    }
  };

  return (
    <CreditContext.Provider value={{ balance, history, consumeCredits, addCredits, estimateCredits }}>
      {children}
    </CreditContext.Provider>
  );
};

export const useCredits = () => {
  const context = useContext(CreditContext);
  if (context === undefined) {
    throw new Error('useCredits must be used within a CreditProvider');
  }
  return context;
};
