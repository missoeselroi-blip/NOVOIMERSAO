import React, { createContext, useContext, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, Info, AlertCircle, X } from 'lucide-react';

type ToastType = 'success' | 'info' | 'error';

interface Toast {
  id: string;
  message: string;
  type: ToastType;
}

interface ToastContextType {
  showToast: (message: string, type?: ToastType) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = useCallback((message: string, type: ToastType = 'success') => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  }, []);

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div className="fixed top-6 left-1/2 -translate-x-1/2 md:top-auto md:left-auto md:bottom-6 md:right-6 md:translate-x-0 z-[9999] flex flex-col gap-3 pointer-events-none">
        <AnimatePresence>
          {toasts.map((toast) => (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, x: 50, scale: 0.8 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 20, scale: 0.8 }}
              className={`
                pointer-events-auto flex items-center gap-3 px-6 py-4 rounded-2xl shadow-2xl border
                ${toast.type === 'success' ? 'bg-emerald-600 border-emerald-500 text-white' : 
                  toast.type === 'error' ? 'bg-red-600 border-red-500 text-white' : 
                  'bg-zinc-900 border-zinc-800 text-white'}
              `}
            >
              {toast.type === 'success' && <CheckCircle2 size={20} className="shrink-0" />}
              {toast.type === 'info' && <Info size={20} className="shrink-0" />}
              {toast.type === 'error' && <AlertCircle size={20} className="shrink-0" />}
              
              <span className="font-bold text-sm">{toast.message}</span>
              
              <button 
                onClick={() => removeToast(toast.id)}
                className="ml-2 p-1 hover:bg-white/20 rounded-lg transition-colors"
              >
                <X size={14} />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
};
