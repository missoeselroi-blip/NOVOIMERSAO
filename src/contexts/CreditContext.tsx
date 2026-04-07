import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  doc, 
  onSnapshot, 
  setDoc, 
  addDoc, 
  collection, 
  query, 
  where, 
  orderBy, 
  serverTimestamp,
  runTransaction,
  Timestamp
} from 'firebase/firestore';
import { onAuthStateChanged, User } from 'firebase/auth';
import { db, auth } from '../lib/firebase';

interface CreditTransaction {
  id: string;
  userId: string;
  type: 'consumption' | 'purchase';
  amount: number;
  description: string;
  date: string;
}

interface CreditContextType {
  balance: number;
  history: CreditTransaction[];
  consumeCredits: (amount: number, description: string) => Promise<boolean>;
  addCredits: (amount: number, description: string) => Promise<void>;
  estimateCredits: (type: string) => number;
  loading: boolean;
}

const CreditContext = createContext<CreditContextType | undefined>(undefined);

export const CreditProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [balance, setBalance] = useState<number>(0);
  const [history, setHistory] = useState<CreditTransaction[]>([]);
  const [loading, setLoading] = useState(true);

  // Auth listener
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      if (!currentUser) {
        setLoading(false);
        setBalance(0);
        setHistory([]);
      }
    });
    return () => unsubscribe();
  }, []);

  // Firestore listeners
  useEffect(() => {
    if (!user) return;

    setLoading(true);

    // Balance listener
    const balanceDocRef = doc(db, 'userCredits', user.uid);
    const unsubscribeBalance = onSnapshot(balanceDocRef, async (snapshot) => {
      if (snapshot.exists()) {
        setBalance(snapshot.data().balance || 0);
        setLoading(false);
      } else {
        // Migration or Initial setup
        const localBalance = localStorage.getItem('ai_credits_balance');
        const initialBalance = localBalance ? parseInt(localBalance) : 100;
        
        await setDoc(balanceDocRef, {
          userId: user.uid,
          balance: initialBalance,
          lastUpdated: serverTimestamp()
        });
        
        // Clear local storage after migration
        localStorage.removeItem('ai_credits_balance');
        setBalance(initialBalance);
        setLoading(false);
      }
    }, (error) => {
      console.error("Error listening to balance:", error);
      setLoading(false);
    });

    // History listener
    const transactionsRef = collection(db, 'creditTransactions');
    const q = query(
      transactionsRef, 
      where('userId', '==', user.uid),
      orderBy('date', 'desc')
    );

    const unsubscribeHistory = onSnapshot(q, (snapshot) => {
      const txs: CreditTransaction[] = [];
      snapshot.forEach((doc) => {
        const data = doc.data();
        txs.push({
          id: doc.id,
          userId: data.userId,
          type: data.type,
          amount: data.amount,
          description: data.description,
          date: data.date instanceof Timestamp ? data.date.toDate().toISOString() : data.date
        });
      });
      setHistory(txs);
    }, (error) => {
      console.error("Error listening to history:", error);
    });

    return () => {
      unsubscribeBalance();
      unsubscribeHistory();
    };
  }, [user]);

  const consumeCredits = async (amount: number, description: string) => {
    if (!user || isNaN(amount)) return false;
    if (amount <= 0) return true; // No cost, allow action
    
    try {
      const balanceDocRef = doc(db, 'userCredits', user.uid);
      const result = await runTransaction(db, async (transaction) => {
        const balanceDoc = await transaction.get(balanceDocRef);
        if (!balanceDoc.exists()) {
          throw new Error("Document does not exist!");
        }

        const currentBalance = Number(balanceDoc.data().balance) || 0;
        if (currentBalance < amount) {
          return false;
        }

        const newBalance = currentBalance - amount;
        transaction.update(balanceDocRef, { 
          userId: user.uid,
          balance: newBalance,
          lastUpdated: serverTimestamp()
        });

        // Add transaction record
        const txRef = doc(collection(db, 'creditTransactions'));
        const safeDescription = description ? (description.length > 400 ? description.substring(0, 400) + '...' : description) : 'Consumo de créditos';
        transaction.set(txRef, {
          userId: user.uid,
          type: 'consumption',
          amount,
          description: safeDescription,
          date: serverTimestamp()
        });

        return true;
      });

      return result;
    } catch (error) {
      console.error("Error consuming credits:", error);
      return false;
    }
  };

  const addCredits = async (amount: number, description: string) => {
    if (!user || isNaN(amount) || amount <= 0) return;

    try {
      const balanceDocRef = doc(db, 'userCredits', user.uid);
      await runTransaction(db, async (transaction) => {
        const balanceDoc = await transaction.get(balanceDocRef);
        let currentBalance = 0;
        
        if (balanceDoc.exists()) {
          currentBalance = Number(balanceDoc.data().balance) || 0;
        }

        const newBalance = currentBalance + amount;
        transaction.set(balanceDocRef, { 
          userId: user.uid,
          balance: newBalance,
          lastUpdated: serverTimestamp()
        }, { merge: true });

        // Add transaction record
        const txRef = doc(collection(db, 'creditTransactions'));
        const safeDescription = description ? (description.length > 400 ? description.substring(0, 400) + '...' : description) : 'Adição de créditos';
        transaction.set(txRef, {
          userId: user.uid,
          type: 'purchase',
          amount,
          description: safeDescription,
          date: serverTimestamp()
        });
      });
    } catch (error) {
      console.error("Error adding credits:", error);
    }
  };

  const estimateCredits = (type: string) => {
    switch (type) {
      case 'lesson': return 5;
      case 'study': return 8;
      case 'outline': return 3;
      case 'devotional': return 4;
      case 'debate': return 10;
      case 'booklet': return 50;
      case 'wiki': return 2;
      case 'meaning': return 1;
      case 'author': return 5;
      case 'image': return 15;
      case 'avatar': return 10;
      case 'kids_ministry': return 5;
      default: return 2;
    }
  };

  return (
    <CreditContext.Provider value={{ balance, history, consumeCredits, addCredits, estimateCredits, loading }}>
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
