import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Download, 
  Trash2, 
  Book, 
  FileText, 
  Layers, 
  WifiOff, 
  ChevronRight,
  Search,
  ArrowLeft
} from 'lucide-react';
import { offlineService, OfflineContent } from '../services/offlineService';
import { useToast } from '../components/Toast';
import { cn } from '../types';

interface OfflinePageProps {
  onNavigate: (tab: string, state?: any) => void;
}

const OfflinePage: React.FC<OfflinePageProps> = ({ onNavigate }) => {
  const [contents, setContents] = useState<OfflineContent[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState<'all' | 'bible' | 'study' | 'outline' | 'lesson'>('all');
  const { showToast } = useToast();

  useEffect(() => {
    loadContents();
  }, []);

  const loadContents = async () => {
    const all = await offlineService.getAllContent();
    setContents(all.sort((a, b) => b.downloadedAt - a.downloadedAt));
  };

  const handleDelete = async (id: string, title: string) => {
    await offlineService.deleteContent(id);
    showToast(`"${title}" removido do acesso offline.`, 'info');
    loadContents();
  };

  const filteredContents = contents.filter(item => {
    const matchesSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = filter === 'all' || item.type === filter;
    return matchesSearch && matchesFilter;
  });

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'bible': return <Book className="text-emerald-500" size={20} />;
      case 'study': return <FileText className="text-blue-500" size={20} />;
      case 'outline': return <Layers className="text-purple-500" size={20} />;
      case 'lesson': return <Book className="text-amber-500" size={20} />;
      default: return <FileText size={20} />;
    }
  };

  const getTypeText = (type: string) => {
    switch (type) {
      case 'bible': return 'Bíblia';
      case 'study': return 'Estudo';
      case 'outline': return 'Esboço';
      case 'lesson': return 'Lição';
      default: return 'Conteúdo';
    }
  };

  const handleOpen = (item: OfflineContent) => {
    switch (item.type) {
      case 'bible':
        onNavigate('bible', { offlineContent: item.content, version: item.version });
        break;
      case 'study':
      case 'outline':
        onNavigate('study', { offlineContent: item.content, type: item.type });
        break;
      case 'lesson':
        onNavigate('lesson', { 
          offlineContent: {
            id: parseInt(item.id.replace('lesson-', '') || '0'),
            title: item.title,
            content: item.content
          } 
        });
        break;
    }
  };

  return (
    <div className="min-h-screen bg-stone-50 dark:bg-zinc-950 pb-20">
      <div className="max-w-4xl mx-auto px-4 py-12">
        <header className="mb-12">
          <button 
            onClick={() => onNavigate('home')}
            className="flex items-center gap-2 text-stone-500 hover:text-stone-800 dark:hover:text-white transition-colors mb-6 group"
          >
            <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
            <span className="font-bold">Voltar</span>
          </button>
          
          <div className="flex items-center gap-4 mb-4">
            <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-900/30 rounded-3xl flex items-center justify-center text-emerald-600 dark:text-emerald-400">
              <WifiOff size={32} />
            </div>
            <div>
              <h1 className="text-4xl font-display font-black text-stone-900 dark:text-white tracking-tight">
                Modo Offline
              </h1>
              <p className="text-stone-500 dark:text-zinc-400 font-medium">
                Gerencie seus conteúdos baixados para acesso sem internet.
              </p>
            </div>
          </div>
        </header>

        <div className="space-y-6">
          {/* Search and Filter */}
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400" size={20} />
              <input 
                type="text"
                placeholder="Pesquisar nos downloads..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-4 bg-white dark:bg-zinc-900 border border-stone-200 dark:border-zinc-800 rounded-2xl shadow-sm focus:ring-2 focus:ring-emerald-500/20 outline-none transition-all"
              />
            </div>
            
            <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0 scrollbar-none">
              {(['all', 'bible', 'study', 'outline', 'lesson'] as const).map((f) => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={cn(
                    "px-6 py-4 rounded-2xl font-bold text-sm transition-all whitespace-nowrap border",
                    filter === f 
                      ? "bg-emerald-600 text-white border-emerald-600 shadow-lg shadow-emerald-600/20" 
                      : "bg-white dark:bg-zinc-900 text-stone-500 dark:text-zinc-400 border-stone-200 dark:border-zinc-800 hover:bg-stone-50 dark:hover:bg-zinc-800"
                  )}
                >
                  {f === 'all' ? 'Todos' : getTypeText(f)}
                </button>
              ))}
            </div>
          </div>

          {/* Content List */}
          <div className="grid gap-4">
            <AnimatePresence mode="popLayout">
              {filteredContents.length > 0 ? (
                filteredContents.map((item) => (
                  <motion.div
                    key={item.id}
                    layout
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="bg-white dark:bg-zinc-900 border border-stone-200 dark:border-zinc-800 rounded-[2rem] p-6 flex items-center justify-between group hover:shadow-xl transition-all"
                  >
                    <div 
                      className="flex items-center gap-4 flex-1 cursor-pointer"
                      onClick={() => handleOpen(item)}
                    >
                      <div className="w-12 h-12 rounded-2xl bg-stone-50 dark:bg-zinc-800 flex items-center justify-center group-hover:scale-110 transition-transform">
                        {getTypeIcon(item.type)}
                      </div>
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-[10px] font-black uppercase tracking-widest px-2 py-0.5 bg-stone-100 dark:bg-zinc-800 text-stone-500 dark:text-zinc-400 rounded-full">
                            {getTypeText(item.type)} {item.version && `(${item.version})`}
                          </span>
                          <span className="text-[10px] text-stone-400">
                            {new Date(item.downloadedAt).toLocaleDateString('pt-BR')}
                          </span>
                        </div>
                        <h3 className="font-bold text-stone-800 dark:text-white group-hover:text-emerald-600 transition-colors">
                          {item.title}
                        </h3>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button 
                        onClick={() => handleOpen(item)}
                        className="p-3 bg-stone-50 dark:bg-zinc-800 text-stone-600 dark:text-zinc-400 rounded-xl hover:bg-emerald-50 hover:text-emerald-600 dark:hover:bg-emerald-900/20 transition-all"
                        title="Abrir"
                      >
                        <ChevronRight size={20} />
                      </button>
                      <button 
                        onClick={() => handleDelete(item.id, item.title)}
                        className="p-3 bg-stone-50 dark:bg-zinc-800 text-stone-400 hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-900/20 transition-all"
                        title="Excluir"
                      >
                        <Trash2 size={20} />
                      </button>
                    </div>
                  </motion.div>
                ))
              ) : (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="py-20 text-center"
                >
                  <div className="w-20 h-20 bg-stone-100 dark:bg-zinc-900 rounded-full flex items-center justify-center mx-auto mb-6 text-stone-300 dark:text-zinc-800">
                    <Download size={40} />
                  </div>
                  <h3 className="text-xl font-bold text-stone-800 dark:text-white mb-2">
                    Nenhum download encontrado
                  </h3>
                  <p className="text-stone-500 dark:text-zinc-400 max-w-xs mx-auto">
                    {searchQuery || filter !== 'all' 
                      ? "Tente ajustar seus filtros ou busca." 
                      : "Baixe Bíblias, estudos e esboços para que eles apareçam aqui."}
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OfflinePage;
