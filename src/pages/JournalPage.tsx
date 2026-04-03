import React, { useState, useEffect } from 'react';
import { 
  Search, 
  Plus, 
  Book, 
  Trash2, 
  Edit, 
  Save, 
  ArrowLeft,
  Calendar,
  Loader2,
  Tag,
  Hash,
  Filter,
  ChevronRight,
  ChevronDown,
  Clock,
  BookOpen
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { auth, db } from '../lib/firebase';
import { 
  collection, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  query, 
  where, 
  onSnapshot,
  serverTimestamp 
} from 'firebase/firestore';
import { useToast } from '../components/Toast';
import { cn } from '../types';
import MarkdownRenderer from '../components/MarkdownRenderer';

enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string;
    email?: string;
    emailVerified?: boolean;
    isAnonymous?: boolean;
    tenantId?: string | null;
    providerInfo: {
      providerId: string;
      displayName: string | null;
      email: string | null;
      photoUrl: string | null;
    }[];
  }
}

const handleFirestoreError = (error: unknown, operationType: OperationType, path: string | null) => {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email || undefined,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData.map(provider => ({
        providerId: provider.providerId,
        displayName: provider.displayName,
        email: provider.email,
        photoUrl: provider.photoURL
      })) || []
    },
    operationType,
    path
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
};

interface JournalEntry {
  id: string;
  userId: string;
  title: string;
  content: string;
  verseReference?: string;
  topic?: string;
  createdAt: any;
  updatedAt?: any;
}

export default function JournalPage() {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingEntryId, setEditingEntryId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [entryToDelete, setEntryToDelete] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    title: 'Relato',
    customTitle: '',
    content: '',
    verseReference: '',
    topic: ''
  });

  useEffect(() => {
    if (!user) {
      setIsLoading(false);
      return;
    }

    const q = query(
      collection(db, 'personalDiaryEntries'),
      where('userId', '==', user.id)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetchedEntries = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as JournalEntry[];
      
      // Sort in client to avoid index requirements
      fetchedEntries.sort((a, b) => {
        const dateA = a.createdAt?.toDate?.()?.getTime() || 0;
        const dateB = b.createdAt?.toDate?.()?.getTime() || 0;
        return dateB - dateA;
      });

      setEntries(fetchedEntries);
      setIsLoading(false);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'personalDiaryEntries');
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

  const handleSave = async () => {
    if (!user) {
      showToast("Faça login para salvar no diário.", "info");
      return;
    }

    const finalTitle = formData.title === 'Outro' ? formData.customTitle : formData.title;

    if (!finalTitle || !formData.content) {
      showToast("Título e conteúdo são obrigatórios.", "info");
      return;
    }

    setIsSaving(true);
    try {
      const dataToSave = {
        title: finalTitle,
        content: formData.content,
        verseReference: formData.verseReference,
        topic: formData.topic
      };

      if (editingEntryId) {
        const entryRef = doc(db, 'personalDiaryEntries', editingEntryId);
        await updateDoc(entryRef, {
          ...dataToSave,
          updatedAt: serverTimestamp()
        });
        showToast("Entrada atualizada com sucesso! ✨");
      } else {
        await addDoc(collection(db, 'personalDiaryEntries'), {
          userId: user.id,
          ...dataToSave,
          createdAt: serverTimestamp()
        });
        showToast("Nova reflexão guardada! 📖✨");
      }
      setIsFormOpen(false);
      setEditingEntryId(null);
      setFormData({ title: 'Relato', customTitle: '', content: '', verseReference: '', topic: '' });
    } catch (error) {
      console.error("Error saving journal entry:", error);
      showToast("Erro ao salvar no diário.", "error");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!entryToDelete) return;
    setIsDeleting(true);
    try {
      await deleteDoc(doc(db, 'personalDiaryEntries', entryToDelete));
      showToast("Entrada removida.");
      setEntryToDelete(null);
    } catch (error) {
      console.error("Error deleting journal entry:", error);
      showToast("Erro ao excluir entrada.", "error");
    } finally {
      setIsDeleting(false);
    }
  };

  const filteredEntries = entries.filter(entry => 
    entry.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    entry.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
    entry.topic?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    entry.verseReference?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="animate-spin text-emerald-600" size={48} />
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-20">
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h1 className="text-4xl font-black tracking-tighter uppercase text-emerald-900 dark:text-emerald-400">Meu Diário Espiritual</h1>
            <p className="text-stone-500 dark:text-zinc-400 font-bold uppercase tracking-widest text-xs mt-2">Registre suas conversas com Deus</p>
          </div>
          <button
            onClick={() => {
              setFormData({ title: 'Relato', customTitle: '', content: '', verseReference: '', topic: '' });
              setEditingEntryId(null);
              setIsFormOpen(true);
            }}
            className="px-8 py-4 bg-emerald-600 text-white font-black rounded-2xl hover:bg-emerald-700 flex items-center gap-3 transition-all shadow-lg shadow-emerald-600/20 active:scale-95"
          >
            <Plus size={24} />
            Novo Registro
          </button>
        </header>

      {/* Search and Filters */}
      <div className="relative max-w-2xl">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400" size={20} />
        <input 
          type="text"
          placeholder="Pesquisar por título, versículo ou tema..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-12 pr-4 py-4 bg-white dark:bg-zinc-900 border border-stone-200 dark:border-zinc-800 rounded-2xl focus:ring-2 focus:ring-emerald-500 outline-none shadow-sm font-medium"
        />
      </div>

      <AnimatePresence>
        {isFormOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="bg-white dark:bg-zinc-900 p-8 rounded-[2.5rem] border border-stone-200 dark:border-zinc-800 shadow-2xl"
          >
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-2xl font-black uppercase tracking-tighter flex items-center gap-3">
                <BookOpen className="text-emerald-600" />
                {editingEntryId ? 'Editar Registro' : 'Novo Registro'}
              </h2>
              <button onClick={() => setIsFormOpen(false)} className="p-2 hover:bg-stone-100 dark:hover:bg-zinc-800 rounded-full transition-colors">
                <ArrowLeft size={24} className="text-stone-400" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-stone-400 uppercase tracking-widest ml-2">Título / Categoria</label>
                <select
                  value={formData.title}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  className="w-full p-4 bg-stone-50 dark:bg-zinc-800 border border-stone-200 dark:border-zinc-700 rounded-2xl focus:ring-2 focus:ring-emerald-500 outline-none font-bold relative z-50"
                >
                  <option value="Relato">Relato</option>
                  <option value="Sentimento">Sentimento</option>
                  <option value="Reflexão">Reflexão</option>
                  <option value="Planejamento">Planejamento</option>
                  <option value="Sonho">Sonho</option>
                  <option value="Outro">Outro (especificar)</option>
                </select>
              </div>
              
              {formData.title === 'Outro' && (
                <div className="space-y-2 animate-in fade-in">
                  <label className="text-[10px] font-black text-stone-400 uppercase tracking-widest ml-2">Especificar Título</label>
                  <input
                    type="text"
                    placeholder="Digite o título..."
                    value={formData.customTitle}
                    onChange={(e) => setFormData(prev => ({ ...prev, customTitle: e.target.value }))}
                    className="w-full p-4 bg-stone-50 dark:bg-zinc-800 border border-stone-200 dark:border-zinc-700 rounded-2xl focus:ring-2 focus:ring-emerald-500 outline-none font-bold relative z-50"
                  />
                </div>
              )}

              <div className="space-y-2">
                <label className="text-[10px] font-black text-stone-400 uppercase tracking-widest ml-2">Tema / Tópico</label>
                <div className="relative">
                  <Tag className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400" size={18} />
                  <input
                    type="text"
                    placeholder="Ex: Fé, Perseverança, Amor"
                    value={formData.topic}
                    onChange={(e) => setFormData(prev => ({ ...prev, topic: e.target.value }))}
                    className="w-full pl-12 pr-4 py-4 bg-stone-50 dark:bg-zinc-800 border border-stone-200 dark:border-zinc-700 rounded-2xl focus:ring-2 focus:ring-emerald-500 outline-none font-bold relative z-50"
                  />
                </div>
              </div>
              <div className="space-y-2 md:col-span-2">
                <label className="text-[10px] font-black text-stone-400 uppercase tracking-widest ml-2">Referência Bíblica (Opcional)</label>
                <div className="relative">
                  <Hash className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400" size={18} />
                  <input
                    type="text"
                    placeholder="Ex: João 3:16"
                    value={formData.verseReference}
                    onChange={(e) => setFormData(prev => ({ ...prev, verseReference: e.target.value }))}
                    className="w-full pl-12 pr-4 py-4 bg-stone-50 dark:bg-zinc-800 border border-stone-200 dark:border-zinc-700 rounded-2xl focus:ring-2 focus:ring-emerald-500 outline-none font-bold relative z-50"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-2 mb-8">
              <label className="text-[10px] font-black text-stone-400 uppercase tracking-widest ml-2">Suas Reflexões e Pensamentos</label>
              <textarea
                placeholder="Escreva aqui o que Deus falou ao seu coração..."
                value={formData.content}
                onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
                className="w-full p-6 bg-stone-50 dark:bg-zinc-800 border border-stone-200 dark:border-zinc-700 rounded-2xl focus:ring-2 focus:ring-emerald-500 outline-none h-64 resize-none leading-relaxed font-medium relative z-50"
              />
            </div>

            <div className="flex gap-4">
              <button
                onClick={handleSave}
                disabled={isSaving}
                className="flex-1 py-4 bg-emerald-600 text-white font-black rounded-2xl hover:bg-emerald-700 disabled:opacity-50 flex items-center justify-center gap-3 transition-all shadow-lg shadow-emerald-600/20 active:scale-95"
              >
                {isSaving ? <Loader2 className="animate-spin" size={24} /> : <Save size={24} />}
                {editingEntryId ? 'Atualizar Registro' : 'Salvar Registro'}
              </button>
              <button
                onClick={() => setIsFormOpen(false)}
                className="px-8 py-4 bg-stone-100 dark:bg-zinc-800 text-stone-600 dark:text-zinc-300 font-black rounded-2xl hover:bg-stone-200 transition-all active:scale-95"
              >
                Cancelar
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid grid-cols-1 gap-6">
        {filteredEntries.length === 0 ? (
          <div className="bg-white dark:bg-zinc-900 p-20 rounded-[3rem] border-2 border-dashed border-stone-100 dark:border-zinc-800 text-center">
            <Book size={64} className="mx-auto text-stone-200 mb-6" />
            <h3 className="text-2xl font-black uppercase tracking-tighter mb-2">Seu diário está em branco</h3>
            <p className="text-stone-500 font-medium">Comece a registrar suas experiências espirituais hoje.</p>
          </div>
        ) : (
          filteredEntries.map((entry) => (
            <motion.div
              key={entry.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-white dark:bg-zinc-900 p-8 rounded-[2.5rem] border border-stone-100 dark:border-zinc-800 shadow-xl hover:shadow-2xl transition-all group"
            >
              <div className="flex flex-col md:flex-row justify-between items-start gap-4 mb-6">
                <div className="space-y-2">
                  <div className="flex flex-wrap gap-2">
                    {entry.topic && (
                      <span className="px-3 py-1 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 rounded-full text-[10px] font-black uppercase tracking-widest flex items-center gap-1">
                        <Tag size={10} />
                        {entry.topic}
                      </span>
                    )}
                    {entry.verseReference && (
                      <span className="px-3 py-1 bg-blue-50 dark:bg-blue-900/30 text-blue-600 rounded-full text-[10px] font-black uppercase tracking-widest flex items-center gap-1">
                        <Hash size={10} />
                        {entry.verseReference}
                      </span>
                    )}
                  </div>
                  <h3 className="text-2xl font-black uppercase tracking-tighter text-stone-800 dark:text-zinc-100">{entry.title}</h3>
                  <div className="flex items-center gap-4 text-stone-400 text-[10px] font-black uppercase tracking-widest">
                    <span className="flex items-center gap-1">
                      <Calendar size={12} />
                      {entry.createdAt?.toDate().toLocaleDateString('pt-BR')}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock size={12} />
                      {entry.createdAt?.toDate().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                </div>
                <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => {
                      const predefinedTitles = ['Relato', 'Sentimento', 'Reflexão', 'Planejamento', 'Sonho'];
                      const isPredefined = predefinedTitles.includes(entry.title);
                      setFormData({
                        title: isPredefined ? entry.title : 'Outro',
                        customTitle: isPredefined ? '' : entry.title,
                        content: entry.content,
                        verseReference: entry.verseReference || '',
                        topic: entry.topic || ''
                      });
                      setEditingEntryId(entry.id);
                      setIsFormOpen(true);
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    className="p-3 bg-stone-50 dark:bg-zinc-800 text-stone-400 hover:text-emerald-600 rounded-2xl transition-all hover:scale-110"
                  >
                    <Edit size={20} />
                  </button>
                  <button
                    onClick={() => setEntryToDelete(entry.id)}
                    className="p-3 bg-stone-50 dark:bg-zinc-800 text-stone-400 hover:text-red-500 rounded-2xl transition-all hover:scale-110"
                  >
                    <Trash2 size={20} />
                  </button>
                </div>
              </div>

              <div className="prose dark:prose-invert max-w-none bg-stone-50/50 dark:bg-zinc-800/30 p-6 rounded-3xl border border-stone-50 dark:border-zinc-800/50">
                <MarkdownRenderer content={entry.content} />
              </div>
            </motion.div>
          ))
        )}
      </div>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {entryToDelete && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="bg-white dark:bg-zinc-900 w-full max-w-md rounded-[2.5rem] p-8 shadow-2xl border border-stone-200 dark:border-zinc-800 text-center"
            >
              <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 text-red-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Trash2 size={32} />
              </div>
              <h2 className="text-2xl font-black uppercase tracking-tighter text-stone-900 dark:text-zinc-100 mb-2">
                Excluir Reflexão
              </h2>
              <p className="text-stone-500 dark:text-zinc-400 mb-8 font-medium">
                Tem certeza que deseja apagar esta página do seu diário? Esta ação é permanente.
              </p>
              <div className="flex gap-4">
                <button
                  onClick={() => setEntryToDelete(null)}
                  className="flex-1 py-4 bg-stone-100 dark:bg-zinc-800 text-stone-700 dark:text-zinc-300 font-black rounded-2xl hover:bg-stone-200 transition-all active:scale-95"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleDelete}
                  disabled={isDeleting}
                  className="flex-1 py-4 bg-red-600 text-white font-black rounded-2xl hover:bg-red-700 transition-all shadow-lg shadow-red-600/20 disabled:opacity-50 flex items-center justify-center gap-2 active:scale-95"
                >
                  {isDeleting ? <Loader2 className="animate-spin" size={20} /> : <Trash2 size={20} />}
                  Excluir
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
