import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from './Toast';

interface UserSetupModalProps {
  onClose: () => void;
  isInitial?: boolean;
}

export const UserSetupModal: React.FC<UserSetupModalProps> = ({ onClose, isInitial }) => {
  const { user, updateUser } = useAuth();
  const [name, setName] = useState(user?.name || '');
  const { showToast } = useToast();

  const handleSave = async () => {
    if (!name.trim()) {
      showToast('Por favor, informe seu nome.', 'error');
      return;
    }

    const avatarUrl = `https://api.dicebear.com/7.x/adventurer/svg?seed=man-${Math.random()}`;

    await updateUser({ name, displayNameSet: true, avatar: avatarUrl, avatarIndex: 0 });
    showToast(isInitial ? 'Perfil configurado!' : 'Perfil atualizado!', 'success');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white dark:bg-zinc-900 w-full max-w-sm rounded-3xl p-8 space-y-6 shadow-2xl"
      >
        <h2 className="text-2xl font-bold">{isInitial ? 'Como você quer ser chamado?' : 'Alterar Perfil'}</h2>
        
        {isInitial && (
            <input 
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Seu nome"
              className="w-full p-4 rounded-xl border border-stone-200 dark:border-zinc-700"
            />
        )}
        
        <button 
          onClick={handleSave}
          className="w-full py-4 bg-emerald-600 text-white rounded-xl font-bold"
        >
          {isInitial ? 'Salvar' : 'Atualizar'}
        </button>
      </motion.div>
    </div>
  );
};
