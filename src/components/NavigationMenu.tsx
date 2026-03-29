import React from 'react';
import { Book, BookOpen, FileText, GraduationCap, Newspaper, Mail } from 'lucide-react';
import { cn } from '../types';
import { useLocation, useNavigate } from 'react-router-dom';

const navItems = [
  { id: 'bible', label: 'Bíblia Online', icon: <Book size={20} />, path: '/bible' },
  { id: 'study', label: 'Estudo Bíblico', icon: <BookOpen size={20} />, path: '/study' },
  { id: 'notebook', label: 'Esboço', icon: <FileText size={20} />, path: '/notebook' },
  { id: 'career', label: 'Treinamentos', icon: <GraduationCap size={20} />, path: '/career' },
  { id: 'posts', label: 'Posts', icon: <Newspaper size={20} />, path: '/posts' },
  { id: 'contact', label: 'Contato', icon: <Mail size={20} />, path: '/contact' },
];

export const NavigationMenu = () => {
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white dark:bg-zinc-900 border-t border-stone-200 dark:border-zinc-800 p-2 flex justify-around z-50 md:hidden">
      {navItems.map((item) => (
        <button
          key={item.id}
          onClick={() => navigate(item.path)}
          className={cn(
            "flex flex-col items-center justify-center p-3 rounded-xl transition-colors",
            location.pathname === item.path ? "text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20" : "text-stone-500 dark:text-zinc-400 hover:bg-stone-100 dark:hover:bg-zinc-800"
          )}
          title={item.label}
        >
          {item.icon}
        </button>
      ))}
    </div>
  );
};
