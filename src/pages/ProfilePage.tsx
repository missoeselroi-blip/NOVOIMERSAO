import React, { useState } from 'react';
import { 
  User as UserIcon, 
  Settings, 
  Heart, 
  StickyNote, 
  FileText, 
  Volume2, 
  LogOut, 
  ChevronRight, 
  Moon, 
  Sun, 
  Monitor,
  Book,
  Type as TypeIcon,
  Save,
  Trash2,
  Calendar,
  Clock,
  ArrowLeft
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { useAudioBox } from '../contexts/AudioBoxContext';
import { useToast } from '../components/Toast';
import { cn } from '../types';
import { MarkdownRenderer } from '../components/MarkdownRenderer';

export default function ProfilePage() {
  const { user, logout, updateUser, toggleFavorite, notes } = useAuth();
  const { tracks, deleteTrack } = useAudioBox();
  const { showToast } = useToast();
  const [activeTab, setActiveTab] = useState<'info' | 'favorites' | 'notes' | 'audios' | 'settings'>('info');
  const [isUpdating, setIsUpdating] = useState(false);

  // Settings state
  const [theme, setTheme] = useState(user?.settings?.theme || 'system');
  const [preferredBible, setPreferredBible] = useState(user?.settings?.preferredBible || 'NVI');
  const [fontSize, setFontSize] = useState(user?.settings?.fontSize || 'base');

  const handleSaveSettings = async () => {
    setIsUpdating(true);
    try {
      await updateUser({
        settings: {
          theme,
          preferredBible,
          fontSize
        }
      });
      showToast('Configurações salvas com sucesso! ✨', 'success');
    } catch (error) {
      showToast('Erro ao salvar configurações.', 'error');
    } finally {
      setIsUpdating(false);
    }
  };

  const tabs = [
    { id: 'info', label: 'Meu Perfil', icon: <UserIcon size={18} /> },
    { id: 'favorites', label: 'Favoritos', icon: <Heart size={18} /> },
    { id: 'notes', label: 'Meu Caderno', icon: <StickyNote size={18} /> },
    { id: 'audios', label: 'Caixa de Áudio', icon: <Volume2 size={18} /> },
    { id: 'settings', label: 'Configurações', icon: <Settings size={18} /> },
  ];

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center py-20 space-y-6">
        <div className="p-6 bg-stone-100 dark:bg-zinc-800 rounded-full text-stone-400">
          <UserIcon size={64} />
        </div>
        <h2 className="text-2xl font-bold">Acesse sua conta</h2>
        <p className="text-stone-500">Faça login para ver seu perfil e salvar seu progresso.</p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Header */}
      <div className="bg-white dark:bg-zinc-900 p-8 rounded-[3rem] border border-stone-200 dark:border-zinc-800 shadow-xl flex flex-col md:flex-row items-center gap-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 p-12 opacity-5 pointer-events-none">
          <UserIcon size={200} />
        </div>
        
        <div className="w-32 h-32 bg-emerald-600 rounded-full flex items-center justify-center text-white text-5xl font-bold shadow-2xl shadow-emerald-600/20 overflow-hidden relative group">
          {user.photoURL ? (
            <img src={user.photoURL} alt={user.name} className="w-full h-full object-cover" />
          ) : (
            <UserIcon size={64} />
          )}
        </div>

        <div className="text-center md:text-left space-y-2 flex-1">
          <h2 className="text-4xl font-bold font-display">{user.name}</h2>
          <p className="text-stone-500 font-medium">{user.email}</p>
          <div className="flex flex-wrap justify-center md:justify-start gap-3 mt-4">
            <div className="px-4 py-2 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 rounded-full text-sm font-bold flex items-center gap-2">
              <Calendar size={16} /> Membro desde {new Date(user.joinDate).toLocaleDateString('pt-BR')}
            </div>
            <button 
              onClick={logout}
              className="px-4 py-2 bg-red-50 dark:bg-red-900/20 text-red-600 rounded-full text-sm font-bold flex items-center gap-2 hover:bg-red-100 transition-colors"
            >
              <LogOut size={16} /> Sair
            </button>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex flex-wrap gap-2 bg-white dark:bg-zinc-900 p-2 rounded-3xl border border-stone-200 dark:border-zinc-800 shadow-sm w-fit mx-auto">
        {tabs.map(tab => (
          <button 
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={cn(
              "px-6 py-3 rounded-2xl font-bold text-sm transition-all flex items-center gap-2",
              activeTab === tab.id ? "bg-emerald-600 text-white shadow-lg" : "text-stone-500 hover:bg-stone-50 dark:hover:bg-zinc-800"
            )}
          >
            {tab.icon} {tab.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="bg-white dark:bg-zinc-900 p-8 rounded-[2.5rem] border border-stone-200 dark:border-zinc-800 shadow-sm min-h-[400px]"
        >
          {activeTab === 'info' && (
            <div className="space-y-8">
              <h3 className="text-2xl font-bold flex items-center gap-2">
                <UserIcon className="text-emerald-600" /> Informações da Conta
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="p-6 bg-stone-50 dark:bg-zinc-800/50 rounded-3xl space-y-1">
                  <p className="text-xs font-bold text-stone-400 uppercase tracking-widest">Nome Completo</p>
                  <p className="text-lg font-medium">{user.name}</p>
                </div>
                <div className="p-6 bg-stone-50 dark:bg-zinc-800/50 rounded-3xl space-y-1">
                  <p className="text-xs font-bold text-stone-400 uppercase tracking-widest">E-mail</p>
                  <p className="text-lg font-medium">{user.email}</p>
                </div>
                <div className="p-6 bg-stone-50 dark:bg-zinc-800/50 rounded-3xl space-y-1">
                  <p className="text-xs font-bold text-stone-400 uppercase tracking-widest">Data de Cadastro</p>
                  <p className="text-lg font-medium">{new Date(user.joinDate).toLocaleString('pt-BR')}</p>
                </div>
                <div className="p-6 bg-stone-50 dark:bg-zinc-800/50 rounded-3xl space-y-1">
                  <p className="text-xs font-bold text-stone-400 uppercase tracking-widest">Tipo de Conta</p>
                  <p className="text-lg font-medium uppercase tracking-widest text-emerald-600">{user.role}</p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'favorites' && (
            <div className="space-y-8">
              <h3 className="text-2xl font-bold flex items-center gap-2">
                <Heart className="text-rose-600" /> Versículos Favoritos
              </h3>
              {!user.favorites || user.favorites.length === 0 ? (
                <div className="text-center py-20 text-stone-400 space-y-4">
                  <Heart size={48} className="mx-auto opacity-20" />
                  <p>Você ainda não salvou nenhum versículo favorito.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {user.favorites.map((fav, idx) => (
                    <motion.div 
                      key={idx}
                      layout
                      className="p-8 bg-rose-50/50 dark:bg-rose-900/10 border border-rose-100 dark:border-rose-900/20 rounded-[2rem] space-y-4 relative group"
                    >
                      <button 
                        onClick={() => toggleFavorite(fav)}
                        className="absolute top-4 right-4 p-2 text-rose-300 hover:text-rose-600 transition-colors"
                      >
                        <Trash2 size={18} />
                      </button>
                      <p className="text-lg font-serif italic leading-relaxed">"{fav.verse}"</p>
                      <div className="flex justify-between items-end">
                        <p className="font-bold text-rose-700 dark:text-rose-400">— {fav.reference}</p>
                        <p className="text-[10px] text-rose-400 uppercase font-bold">{new Date(fav.date).toLocaleDateString('pt-BR')}</p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'notes' && (
            <div className="space-y-8">
              <h3 className="text-2xl font-bold flex items-center gap-2">
                <StickyNote className="text-amber-600" /> Meu Caderno
              </h3>
              {notes.length === 0 ? (
                <div className="text-center py-20 text-stone-400 space-y-4">
                  <StickyNote size={48} className="mx-auto opacity-20" />
                  <p>Seu caderno está vazio. Salve estudos e anotações para vê-los aqui.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-6">
                  {notes.map((note) => (
                    <div key={note.id} className="p-8 bg-stone-50 dark:bg-zinc-800/50 rounded-[2rem] border border-stone-100 dark:border-zinc-800 space-y-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <span className="px-3 py-1 bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 rounded-full text-[10px] font-bold uppercase tracking-widest mb-2 inline-block">
                            {note.category}
                          </span>
                          <h4 className="text-xl font-bold">{note.title}</h4>
                        </div>
                        <p className="text-xs text-stone-400">{new Date(note.createdAt).toLocaleDateString('pt-BR')}</p>
                      </div>
                      <div className="prose dark:prose-invert max-w-none text-stone-600 dark:text-zinc-400 line-clamp-3">
                        <MarkdownRenderer content={note.content} />
                      </div>
                      <button className="text-emerald-600 font-bold text-sm flex items-center gap-2 hover:gap-3 transition-all">
                        Ver nota completa <ChevronRight size={16} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'audios' && (
            <div className="space-y-8">
              <h3 className="text-2xl font-bold flex items-center gap-2">
                <Volume2 className="text-blue-600" /> Caixa de Áudio
              </h3>
              {tracks.length === 0 ? (
                <div className="text-center py-20 text-stone-400 space-y-4">
                  <Volume2 size={48} className="mx-auto opacity-20" />
                  <p>Nenhum áudio salvo ainda.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {tracks.map((track) => (
                    <div key={track.id} className="p-6 bg-blue-50/50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-900/20 rounded-3xl flex items-center gap-4 group">
                      <div className="w-12 h-12 bg-blue-600 text-white rounded-2xl flex items-center justify-center shadow-lg shadow-blue-600/20">
                        <Volume2 size={24} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-bold truncate">{track.title}</h4>
                        <p className="text-xs text-blue-600/60 dark:text-blue-400/40">{track.style} • {track.date}</p>
                      </div>
                      <button 
                        onClick={() => deleteTrack(track.id)}
                        className="p-2 text-stone-300 hover:text-red-600 transition-colors"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'settings' && (
            <div className="space-y-10">
              <h3 className="text-2xl font-bold flex items-center gap-2">
                <Settings className="text-stone-600" /> Configurações do App
              </h3>
              
              <div className="space-y-8">
                {/* Theme Selection */}
                <div className="space-y-4">
                  <p className="text-sm font-bold text-stone-400 uppercase tracking-widest flex items-center gap-2">
                    <Monitor size={16} /> Tema Visual
                  </p>
                  <div className="grid grid-cols-3 gap-4">
                    {[
                      { id: 'light', label: 'Claro', icon: <Sun size={20} /> },
                      { id: 'dark', label: 'Escuro', icon: <Moon size={20} /> },
                      { id: 'system', label: 'Sistema', icon: <Monitor size={20} /> },
                    ].map(t => (
                      <button
                        key={t.id}
                        onClick={() => setTheme(t.id as any)}
                        className={cn(
                          "p-6 rounded-3xl border-2 transition-all flex flex-col items-center gap-3",
                          theme === t.id 
                            ? "border-emerald-600 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600" 
                            : "border-stone-100 dark:border-zinc-800 hover:border-emerald-200"
                        )}
                      >
                        {t.icon}
                        <span className="font-bold text-sm">{t.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Bible Version */}
                <div className="space-y-4">
                  <p className="text-sm font-bold text-stone-400 uppercase tracking-widest flex items-center gap-2">
                    <Book size={16} /> Versão da Bíblia Preferida
                  </p>
                  <select 
                    value={preferredBible}
                    onChange={(e) => setPreferredBible(e.target.value)}
                    className="w-full p-4 bg-stone-50 dark:bg-zinc-800 border border-stone-200 dark:border-zinc-700 rounded-2xl outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                  >
                    <option value="NVI">NVI - Nova Versão Internacional</option>
                    <option value="ACF">ACF - Almeida Corrigida Fiel</option>
                    <option value="ARA">ARA - Almeida Revista e Atualizada</option>
                    <option value="NAA">NAA - Nova Almeida Atualizada</option>
                    <option value="NTLH">NTLH - Nova Tradução na Linguagem de Hoje</option>
                  </select>
                </div>

                {/* Font Size */}
                <div className="space-y-4">
                  <p className="text-sm font-bold text-stone-400 uppercase tracking-widest flex items-center gap-2">
                    <TypeIcon size={16} /> Tamanho da Fonte
                  </p>
                  <div className="flex gap-4">
                    {['xs', 'sm', 'base', 'lg', 'xl'].map(size => (
                      <button
                        key={size}
                        onClick={() => setFontSize(size)}
                        className={cn(
                          "flex-1 py-4 rounded-2xl border-2 font-bold transition-all",
                          fontSize === size 
                            ? "border-emerald-600 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600" 
                            : "border-stone-100 dark:border-zinc-800 hover:border-emerald-200"
                        )}
                      >
                        {size.toUpperCase()}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="pt-6 border-t border-stone-100 dark:border-zinc-800">
                  <button 
                    onClick={handleSaveSettings}
                    disabled={isUpdating}
                    className="w-full py-5 bg-emerald-600 text-white font-bold rounded-2xl hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-600/20 flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {isUpdating ? <Clock className="animate-spin" size={20} /> : <Save size={20} />}
                    Salvar Todas as Configurações
                  </button>
                </div>
              </div>
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
