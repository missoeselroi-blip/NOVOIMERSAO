import React from 'react';
import { useAuth } from '../contexts/AuthContext';

export const AvatarManager: React.FC<{ size?: string }> = ({ size = 'w-24 h-24' }) => {
  const { user, cycleAvatar } = useAuth();
  
  if (!user) return null;

  return (
    <div className={`relative ${size}`}>
      <img 
        src={user.avatar || user.photoURL || `https://api.dicebear.com/7.x/adventurer/svg?seed=${user.id}`} 
        alt="Avatar" 
        className="w-full h-full rounded-full object-cover border-4 border-white dark:border-zinc-800 shadow-md"
        referrerPolicy="no-referrer"
      />
      <button 
        onClick={cycleAvatar}
        className="absolute bottom-0 right-0 p-2 bg-emerald-600 text-white rounded-full text-[10px] font-bold shadow-lg hover:bg-emerald-700 transition-colors"
      >
        Mudar
      </button>
    </div>
  );
};
