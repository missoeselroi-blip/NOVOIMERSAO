import React, { useState, useEffect } from 'react';
import { 
  Search, 
  Plus, 
  StickyNote, 
  Trash2, 
  Edit, 
  Copy, 
  Download, 
  Share2, 
  Globe, 
  Printer, 
  Save, 
  Book,
  BookOpen,
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  Calendar,
  Loader2,
  Lock,
  Volume2,
  Maximize2
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { copyToClipboard } from '../utils/clipboard';
import { useAccessibility } from '../contexts/AccessibilityContext';
import { cn } from '../types';
import { useToast } from '../components/Toast';
import { AudioSearchButton } from '../components/AudioSearchButton';
import { AudioConfirmationModal } from '../components/AudioConfirmationModal';
import { geminiService } from '../services/geminiService';
import MarkdownRenderer from '../components/MarkdownRenderer';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import JournalPage from './JournalPage';

import { useShare } from '../utils/share';

interface Note {
  id: string;
  title: string;
  content: string;
  date: string;
  createdAt?: string;
  category: 'Anotações' | 'Esboços' | 'Estudos' | 'Histórias' | 'Teatro' | 'Outros';
}

interface NotebookPageProps {
  onSearchWiki?: (query: string) => void;
}

import { useAuth } from '../contexts/AuthContext';
import { useAudioBox } from '../contexts/AudioBoxContext';
import { db } from '../lib/firebase';
import { doc, addDoc, updateDoc, deleteDoc, collection } from 'firebase/firestore';

export default function NotebookPage({ onSearchWiki }: NotebookPageProps) {
  const { user, notes: firestoreNotes, isInitialLoading } = useAuth();
  const { share } = useShare();
  const { saveTrack } = useAudioBox();
  const { fontFamily, fontSize, lineHeight } = useAccessibility();
  const { showToast } = useToast();
  const [searchQuery, setSearchQuery] = useState('');
  const [currentNote, setCurrentNote] = useState<{ title: string, content: string, category: 'Anotações' | 'Esboços' | 'Estudos' | 'Histórias' | 'Teatro' | 'Outros' }>({ title: '', content: '', category: 'Anotações' });
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState<'Todos' | 'Anotações' | 'Esboços' | 'Estudos' | 'Histórias' | 'Teatro' | 'Outros'>('Todos');
  const [noteToDelete, setNoteToDelete] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [activeView, setActiveView] = useState<'notes' | 'journal'>('notes');
  const [isGeneratingSpeech, setIsGeneratingSpeech] = useState(false);
  const [isAudioConfirmModalOpen, setIsAudioConfirmModalOpen] = useState(false);
  const [pendingSpeechText, setPendingSpeechText] = useState('');
  const [isPreachingMode, setIsPreachingMode] = useState(false);
  const [preachingNote, setPreachingNote] = useState<Note | null>(null);
  const [preachingSections, setPreachingSections] = useState<string[]>([]);
  const [currentPreachingSection, setCurrentPreachingSection] = useState(0);

  const [localNotes, setLocalNotes] = useState<any[]>(() => {
    const saved = localStorage.getItem('preacher_notes');
    return saved ? JSON.parse(saved) : [];
  });

  const notes = user ? firestoreNotes : localNotes;
  const sortedNotes = [...notes].sort((a, b) => {
    const dateA = a.createdAt ? new Date(a.createdAt).getTime() : (a.date ? new Date(a.date.split('/').reverse().join('-')).getTime() : 0);
    const dateB = b.createdAt ? new Date(b.createdAt).getTime() : (b.date ? new Date(b.date.split('/').reverse().join('-')).getTime() : 0);
    return dateB - dateA;
  });

  const saveNote = async () => {
    if (!currentNote.title || !currentNote.content) {
      showToast("Preencha o título e o conteúdo! ✍️", 'info');
      return;
    }

    setIsSaving(true);
    try {
      if (user) {
        if (editingNoteId) {
          const noteDocRef = doc(db, 'notes', editingNoteId);
          await updateDoc(noteDocRef, {
            title: currentNote.title,
            content: currentNote.content,
            category: currentNote.category,
            updatedAt: new Date().toISOString()
          });
          showToast("Página atualizada! 📝✨");
        } else {
          const notesCollectionRef = collection(db, 'notes');
          await addDoc(notesCollectionRef, {
            userId: user.id,
            title: currentNote.title,
            content: currentNote.content,
            category: currentNote.category,
            createdAt: new Date().toISOString()
          });
          showToast("Página guardada com sucesso! 📝✅");
        }
      } else {
        let updatedNotes;
        if (editingNoteId) {
          updatedNotes = localNotes.map(n => n.id === editingNoteId ? { 
            ...n, 
            title: currentNote.title, 
            content: currentNote.content, 
            category: currentNote.category,
            updatedAt: new Date().toISOString() 
          } : n);
          showToast("Página atualizada localmente! 📝✨");
        } else {
          const newNote = {
            id: Date.now().toString(),
            title: currentNote.title,
            content: currentNote.content,
            category: currentNote.category,
            date: new Date().toLocaleDateString('pt-BR'),
            createdAt: new Date().toISOString()
          };
          updatedNotes = [newNote, ...localNotes];
          showToast("Página guardada localmente! 📝✅");
        }
        setLocalNotes(updatedNotes);
        localStorage.setItem('preacher_notes', JSON.stringify(updatedNotes));
      }
      
      setCurrentNote({ title: '', content: '', category: 'Anotações' });
      setEditingNoteId(null);
      setIsFormOpen(false);
    } catch (error) {
      console.error("Error saving note:", error);
      showToast("Erro ao salvar página.", 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const confirmDelete = (id: string) => {
    setNoteToDelete(id);
  };

  const deleteNote = async () => {
    if (!noteToDelete) return;
    
    setIsDeleting(true);
    try {
      if (user) {
        await deleteDoc(doc(db, 'notes', noteToDelete));
        showToast("Página removida com sucesso! 🗑️");
      } else {
        const updatedNotes = localNotes.filter(n => n.id !== noteToDelete);
        setLocalNotes(updatedNotes);
        localStorage.setItem('preacher_notes', JSON.stringify(updatedNotes));
        showToast("Página removida localmente. 🗑️");
      }
      setNoteToDelete(null);
    } catch (error) {
      console.error("Error deleting note:", error);
      showToast("Erro ao remover página.", 'error');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleCopy = (content: string) => {
    copyToClipboard(content);
    showToast("Copiado para a área de transferência! 📋✨");
  };

  const handleDownload = (note: Note) => {
    const element = document.createElement("a");
    const file = new Blob([`# ${note.title}\n\n${note.content}\n\nData: ${note.createdAt ? new Date(note.createdAt).toLocaleDateString('pt-BR') : note.date}`], {type: 'text/plain'});
    element.href = URL.createObjectURL(file);
    element.download = `${note.title.replace(/\s+/g, '_')}.txt`;
    document.body.appendChild(element);
    element.click();
    showToast("Baixando sua página... 📄💎");
  };

  const handleDownloadPDF = async (note: Note) => {
    const element = document.getElementById(`note-content-${note.id}`);
    if (!element) return;

    showToast("Gerando seu PDF... Quase pronto! 📄💎", 'info');
    try {
      const canvas = await html2canvas(element, { 
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff'
      });
      
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      
      const imgProps = pdf.getImageProperties(imgData);
      const imgHeight = (imgProps.height * pdfWidth) / imgProps.width;
      
      let heightLeft = imgHeight;
      let position = 0;

      pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, imgHeight);
      heightLeft -= pdfHeight;

      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, imgHeight);
        heightLeft -= pdfHeight;
      }

      pdf.save(`${note.title.replace(/\s+/g, '_')}.pdf`);
      showToast("PDF baixado com sucesso! 📄✅");
    } catch (error) {
      console.error('Erro ao gerar PDF:', error);
      showToast("Erro ao gerar PDF.", 'error');
    }
  };

  const enterPreachingMode = (note: Note) => {
    setPreachingNote(note);
    
    // Split content into sections based on common headers or just chunks
    const sections = note.content.split(/(?=\n#{1,3}\s|\n\*\*Introdução\*\*|\n\*\*Desenvolvimento\*\*|\n\*\*Conclusão\*\*)/i)
      .filter(s => s.trim().length > 0);
    
    if (sections.length === 0) {
      // Fallback: split by double newlines if no headers found
      const fallbackSections = note.content.split(/\n\n+/).filter(s => s.trim().length > 0);
      setPreachingSections(fallbackSections.length > 0 ? fallbackSections : [note.content]);
    } else {
      setPreachingSections(sections);
    }
    
    setCurrentPreachingSection(0);
    setIsPreachingMode(true);
  };

  const handlePrint = (note: Note) => {
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head>
            <title>${note.title}</title>
            <style>
              @page { size: A4; margin: 2cm; }
              body { font-family: 'Georgia', serif; padding: 0; line-height: 1.6; color: #1a1a1a; }
              .header { border-bottom: 1px solid #eee; padding-bottom: 10px; margin-bottom: 30px; text-align: center; font-size: 10px; text-transform: uppercase; letter-spacing: 2px; color: #666; }
              .footer { border-top: 1px solid #eee; padding-top: 10px; margin-top: 30px; text-align: center; font-size: 10px; color: #999; position: fixed; bottom: 0; width: 100%; }
              h1 { color: #064e3b; font-size: 24pt; margin-bottom: 5pt; }
              .meta { color: #666; font-size: 10pt; margin-bottom: 30pt; border-left: 3px solid #059669; padding-left: 15px; }
              .content { font-size: 12pt; text-align: justify; }
              .category-tag { display: inline-block; background: #ecfdf5; color: #059669; padding: 2pt 8pt; border-radius: 999px; font-size: 9pt; font-weight: bold; margin-bottom: 10pt; }
            </style>
          </head>
          <body>
            <div class="category-tag">${note.category}</div>
            <h1>${note.title}</h1>
            <div class="meta">
              Data: ${note.createdAt ? new Date(note.createdAt).toLocaleDateString('pt-BR') : note.date}<br/>
              <div style="display: flex; align-items: center; gap: 5px;">
                <img src="https://i.postimg.cc/pd0P8t4L/1000097620_removebg_preview.png" width="16" height="16" style="object-fit: contain;" />
                Fonte: Imersão Bíblica IA
                <img src="https://i.postimg.cc/pd0P8t4L/1000097620_removebg_preview.png" width="16" height="16" style="object-fit: contain;" />
              </div>
            </div>
            <div class="content">${note.content.replace(/\n/g, '<br/>')}</div>
          </body>
        </html>
      `);
      printWindow.document.close();
      printWindow.focus();
      setTimeout(() => {
        printWindow.print();
        printWindow.close();
      }, 250);
    }
  };

  const handleShare = async (note: Note) => {
    await share({
      title: note.title,
      text: note.content,
    });
  };

  const handleListen = (text: string) => {
    setPendingSpeechText(text);
    setIsAudioConfirmModalOpen(true);
  };

  const confirmGenerateSpeech = async () => {
    setIsAudioConfirmModalOpen(false);
    setIsGeneratingSpeech(true);
    try {
      const audioUrl = await geminiService.generateSpeech(pendingSpeechText);
      if (!audioUrl) {
        showToast("Erro ao gerar áudio.", 'error');
        setIsGeneratingSpeech(false);
        setPendingSpeechText('');
        return;
      }
      const audio = new Audio(audioUrl);
      audio.oncanplaythrough = () => {
        audio.play().catch(e => console.error("Error playing audio:", e));
      };
      showToast("Reproduzindo áudio... 🔊✨");

      // Auto-save to Audio Box
      try {
        await saveTrack('Nota do Caderno', 'Caderno', audioUrl, 'Leitura', 'Informativa');
        showToast("Áudio salvo na Coletânea! 🎵", 'success');
      } catch (saveError) {
        console.error("Error auto-saving to audio box:", saveError);
      }
    } catch (error) {
      console.error("Error generating speech:", error);
      showToast("Erro ao gerar áudio.", "error");
    } finally {
      setIsGeneratingSpeech(false);
      setPendingSpeechText('');
    }
  };

  if (isInitialLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-500"></div>
      </div>
    );
  }

  const filteredNotes = sortedNotes.filter(n => {
    const matchesSearch = n.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         n.content.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = searchQuery ? true : (activeCategory === 'Todos' || n.category === activeCategory);
    return matchesSearch && matchesCategory;
  });

  const currentMonthYear = new Intl.DateTimeFormat('pt-BR', { month: 'long', year: 'numeric' }).format(new Date());

  return (
    <div className="space-y-8 relative">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
        <div className="flex items-center gap-4">
          <h2 className="text-4xl font-display font-bold text-emerald-900 dark:text-emerald-400">
            {activeView === 'notes' ? 'Meu Caderno' : 'Meu Diário'}
          </h2>
          <div className="flex bg-stone-100 dark:bg-zinc-800 p-1 rounded-xl">
            <button
              onClick={() => setActiveView('notes')}
              className={cn(
                "px-4 py-1.5 rounded-lg text-xs font-black uppercase tracking-widest transition-all",
                activeView === 'notes' 
                  ? "bg-white dark:bg-zinc-700 text-emerald-600 shadow-sm" 
                  : "text-stone-400 hover:text-stone-600"
              )}
            >
              Notas
            </button>
            <button
              onClick={() => setActiveView('journal')}
              className={cn(
                "px-4 py-1.5 rounded-lg text-xs font-black uppercase tracking-widest transition-all",
                activeView === 'journal' 
                  ? "bg-white dark:bg-zinc-700 text-emerald-600 shadow-sm" 
                  : "text-stone-400 hover:text-stone-600"
              )}
            >
              Diário
            </button>
          </div>
        </div>
        <div className="flex gap-3">
          {activeView === 'notes' ? (
            <button
              onClick={() => {
                setIsFormOpen(true);
                setEditingNoteId(null);
                setCurrentNote({ title: '', content: '', category: 'Anotações' });
              }}
              className="px-6 py-3 bg-emerald-600 text-white font-bold rounded-2xl hover:bg-emerald-700 flex items-center gap-2 transition-all shadow-lg shadow-emerald-600/20"
            >
              <Plus size={20} />
              Nova Página
            </button>
          ) : (
            <button
              onClick={() => {
                // This will be handled by the JournalPage component internally if we want, 
                // but we can also trigger its "New Entry" if we refactor it.
                // For now, let's just let JournalPage handle its own "New Entry" button.
              }}
              className="hidden"
            >
              Nova Reflexão
            </button>
          )}
        </div>
      </header>

      {activeView === 'journal' ? (
        <JournalPage isSubView={true} />
      ) : (
        <>
          {/* Categories and Customization */}
      <div className="flex flex-col lg:flex-row gap-6 items-start lg:items-center justify-between">
        <div className="flex bg-stone-100 dark:bg-zinc-800 p-1 rounded-2xl overflow-x-auto max-w-full">
          {['Todos', 'Anotações', 'Esboços', 'Estudos', 'Histórias', 'Teatro', 'Teologia', 'Outros'].map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat as any)}
              className={cn(
                "px-6 py-2 rounded-xl font-bold text-sm transition-all whitespace-nowrap",
                activeCategory === cat ? "bg-white dark:bg-zinc-700 text-emerald-600 shadow-sm" : "text-stone-500"
              )}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Search Bar */}
      <div className="relative max-w-2xl">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400" size={20} />
        <input 
          type="text"
          placeholder="Pesquisar em suas páginas..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-12 pr-12 py-4 bg-white dark:bg-zinc-900 border border-stone-200 dark:border-zinc-800 rounded-2xl focus:ring-2 focus:ring-emerald-500 outline-none shadow-sm"
        />
        <div className="absolute right-4 top-1/2 -translate-y-1/2">
          <AudioSearchButton onResult={(text) => setSearchQuery(text)} />
        </div>
      </div>

      {/* Preaching Mode Modal */}
      <AnimatePresence>
        {isPreachingMode && preachingNote && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] bg-white dark:bg-zinc-950 flex flex-col"
          >
            {/* Header */}
            <div className="p-6 border-b border-stone-100 dark:border-zinc-900 flex justify-between items-center bg-white/80 dark:bg-zinc-950/80 backdrop-blur-md sticky top-0 z-10">
              <div className="flex items-center gap-4">
                <button 
                  onClick={() => setIsPreachingMode(false)}
                  className="p-3 hover:bg-stone-100 dark:hover:bg-zinc-900 rounded-full transition-colors"
                >
                  <ArrowLeft size={24} />
                </button>
                <div>
                  <h2 className="text-xl font-bold line-clamp-1">{preachingNote.title}</h2>
                  <p className="text-xs text-stone-500 font-mono">MODO DE PREGAÇÃO • SEÇÃO {currentPreachingSection + 1} DE {preachingSections.length}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button 
                  onClick={() => {
                    const el = document.documentElement;
                    if (document.fullscreenElement) {
                      document.exitFullscreen();
                    } else {
                      el.requestFullscreen();
                    }
                  }}
                  className="p-3 hover:bg-stone-100 dark:hover:bg-zinc-900 rounded-full transition-colors hidden md:block"
                  title="Tela Cheia"
                >
                  <Maximize2 size={24} />
                </button>
              </div>
            </div>

            {/* Content Area */}
            <div className="flex-1 overflow-y-auto p-6 md:p-12 lg:p-20 max-w-5xl mx-auto w-full">
              <motion.div
                key={currentPreachingSection}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="prose dark:prose-invert max-w-none"
              >
                <div className={cn(
                  "font-serif leading-relaxed text-stone-800 dark:text-zinc-100",
                  "text-2xl md:text-3xl lg:text-4xl" // Large fonts for preaching
                )}>
                  <MarkdownRenderer content={preachingSections[currentPreachingSection]} />
                </div>
              </motion.div>
            </div>

            {/* Navigation Footer */}
            <div className="p-6 border-t border-stone-100 dark:border-zinc-900 bg-white/80 dark:bg-zinc-950/80 backdrop-blur-md sticky bottom-0 z-10">
              <div className="max-w-5xl mx-auto flex items-center justify-between gap-4">
                <button
                  disabled={currentPreachingSection === 0}
                  onClick={() => setCurrentPreachingSection(prev => Math.max(0, prev - 1))}
                  className="flex-1 py-6 bg-stone-100 dark:bg-zinc-900 rounded-[2rem] font-bold flex items-center justify-center gap-2 disabled:opacity-30 transition-all hover:bg-stone-200 dark:hover:bg-zinc-800"
                >
                  <ChevronLeft size={32} />
                  <span className="hidden md:inline">Anterior</span>
                </button>
                
                <div className="flex gap-2 px-4">
                  {preachingSections.map((_, idx) => (
                    <div 
                      key={idx}
                      className={cn(
                        "w-3 h-3 rounded-full transition-all",
                        currentPreachingSection === idx ? "bg-emerald-600 scale-125" : "bg-stone-200 dark:bg-zinc-800"
                      )}
                    />
                  ))}
                </div>

                <button
                  disabled={currentPreachingSection === preachingSections.length - 1}
                  onClick={() => setCurrentPreachingSection(prev => Math.min(preachingSections.length - 1, prev + 1))}
                  className="flex-1 py-6 bg-emerald-600 text-white rounded-[2rem] font-bold flex items-center justify-center gap-2 disabled:opacity-30 transition-all hover:bg-emerald-700 shadow-xl shadow-emerald-600/20"
                >
                  <span className="hidden md:inline">Próxima</span>
                  <ChevronRight size={32} />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isFormOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="bg-white dark:bg-zinc-900 p-8 rounded-[2.5rem] border border-stone-200 dark:border-zinc-800 shadow-xl"
          >
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold flex items-center gap-2">
                <Edit className="text-emerald-600" size={24} />
                {editingNoteId ? 'Editar Página' : 'Nova Página'}
              </h3>
              <button onClick={() => setIsFormOpen(false)} className="text-stone-400 hover:text-stone-600">
                <ArrowLeft size={24} />
              </button>
            </div>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input
                  type="text"
                  placeholder="⚓ Título da página (ex: Estudo sobre João 3:16)"
                  value={currentNote.title}
                  onChange={(e) => setCurrentNote({ ...currentNote, title: e.target.value })}
                  className="p-4 bg-stone-50 dark:bg-zinc-800 border border-stone-200 dark:border-zinc-700 rounded-2xl focus:ring-2 focus:ring-emerald-500 outline-none font-bold text-lg"
                />
                <select
                  value={currentNote.category}
                  onChange={(e) => setCurrentNote({ ...currentNote, category: e.target.value as any })}
                  className="p-4 bg-stone-50 dark:bg-zinc-800 border border-stone-200 dark:border-zinc-700 rounded-2xl focus:ring-2 focus:ring-emerald-500 outline-none font-bold"
                >
                  <option value="Anotações">Anotações</option>
                  <option value="Esboços">Esboços</option>
                  <option value="Estudos">Estudos</option>
                  <option value="Histórias">Histórias</option>
                  <option value="Teatro">Teatro</option>
                  <option value="Teologia">Teologia</option>
                  <option value="Outros">Outros</option>
                </select>
              </div>
              <textarea
                placeholder="⚓ Escreva aqui suas reflexões, estudos e o que Deus falou ao seu coração..."
                value={currentNote.content}
                onChange={(e) => setCurrentNote({ ...currentNote, content: e.target.value })}
                className={cn(
                  "w-full p-6 bg-stone-50 dark:bg-zinc-800 border border-stone-200 dark:border-zinc-700 rounded-2xl focus:ring-2 focus:ring-emerald-500 outline-none h-96 resize-none leading-relaxed",
                  fontFamily === 'dyslexic' ? 'font-dyslexic' : 
                  fontFamily === 'serif' ? 'font-serif' : 
                  fontFamily === 'mono' ? 'font-mono' : 'font-sans',
                  fontSize === 'xs' ? 'text-xs' :
                  fontSize === 'sm' ? 'text-sm' :
                  fontSize === 'base' ? 'text-base' :
                  fontSize === 'lg' ? 'text-lg' :
                  fontSize === 'xl' ? 'text-xl' :
                  fontSize === '2xl' ? 'text-2xl' : 'text-3xl'
                )}
                style={{ 
                  lineHeight: lineHeight
                }}
              />
              <div className="flex gap-4">
                <button
                  onClick={saveNote}
                  disabled={isSaving}
                  className="flex-1 py-4 bg-emerald-600 text-white font-bold rounded-2xl hover:bg-emerald-700 disabled:opacity-50 flex items-center justify-center gap-2 transition-all shadow-lg shadow-emerald-600/20"
                >
                  {isSaving ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} />}
                  Salvar no Caderno
                </button>
                <button
                  onClick={() => setIsFormOpen(false)}
                  disabled={isSaving}
                  className="px-8 py-4 bg-stone-100 dark:bg-zinc-800 text-stone-600 dark:text-zinc-300 font-bold rounded-2xl hover:bg-stone-200 transition-all disabled:opacity-50"
                >
                  Cancelar
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {!user && (
        <div className="mb-8 p-6 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-3xl flex items-center gap-4">
          <div className="w-12 h-12 bg-amber-100 dark:bg-amber-800 rounded-2xl flex items-center justify-center flex-shrink-0">
            <Lock className="text-amber-600" size={24} />
          </div>
          <div className="flex-1">
            <h3 className="font-bold text-amber-900 dark:text-amber-200">Modo Offline / Local</h3>
            <p className="text-sm text-amber-700 dark:text-amber-400">Suas notas estão sendo salvas apenas neste navegador. Faça login para sincronizar em todos os seus dispositivos.</p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 gap-12">
        {filteredNotes.length === 0 ? (
          <div className="bg-white dark:bg-zinc-900 p-20 rounded-[3rem] border border-dashed border-stone-200 dark:border-zinc-800 text-center">
            <StickyNote size={64} className="mx-auto text-stone-200 mb-6" />
            <h3 className="text-2xl font-bold mb-2">Seu caderno está vazio</h3>
            <p className="text-stone-500">Comece a registrar seus estudos e revelações.</p>
          </div>
        ) : (
          <div className="space-y-16">
            {filteredNotes.map((note) => (
              <motion.div 
                key={note.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="relative mx-auto w-full max-w-[850px] min-h-[600px] bg-white dark:bg-zinc-900 shadow-2xl rounded-sm border border-stone-200 dark:border-zinc-800 flex flex-col"
                style={{ 
                  backgroundImage: 'linear-gradient(#f1f1f1 1px, transparent 1px)',
                  backgroundSize: '100% 32px',
                  paddingTop: '64px'
                }}
              >
                {/* Notebook Holes */}
                <div className="absolute left-6 top-0 bottom-0 flex flex-col justify-around py-8 pointer-events-none">
                  {[...Array(15)].map((_, i) => (
                    <div key={i} className="w-4 h-4 rounded-full bg-stone-100 dark:bg-zinc-800 border border-stone-200 dark:border-zinc-700 shadow-inner" />
                  ))}
                </div>

                {/* Page Header */}
                <div className="px-16 pb-8 border-b border-stone-100 dark:border-zinc-800 flex justify-between items-end">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <span className="px-3 py-1 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 rounded-full text-[10px] font-bold uppercase tracking-widest">
                        {note.category}
                      </span>
                    </div>
                    <h4 className="text-3xl font-serif font-bold text-stone-800 dark:text-zinc-100 mb-1">{note.title}</h4>
                    <p className="text-xs font-mono text-stone-400 uppercase tracking-widest flex items-center gap-2">
                      <Calendar size={12} />
                      Criado em: {note.createdAt ? new Date(note.createdAt).toLocaleDateString('pt-BR') : 'Data desconhecida'}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <button 
                      onClick={() => {
                        setCurrentNote({ title: note.title, content: note.content, category: note.category });
                        setEditingNoteId(note.id);
                        setIsFormOpen(true);
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                      }}
                      className="p-2 text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 rounded-xl transition-colors"
                      title="Editar"
                    >
                      <Edit size={20} />
                    </button>
                    <button 
                      onClick={() => handleCopy(note.content)}
                      className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-xl transition-colors"
                      title="Copiar"
                    >
                      <Copy size={20} />
                    </button>
                    <button 
                      onClick={() => handleDownloadPDF(note)}
                      className="p-2 text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 rounded-xl transition-colors"
                      title="Baixar PDF"
                    >
                      <Download size={20} />
                    </button>
                    {note.category === 'Esboços' && (
                      <button 
                        onClick={() => enterPreachingMode(note)}
                        className="p-2 text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-900/20 rounded-xl transition-colors"
                        title="Modo de Pregação"
                      >
                        <BookOpen size={20} />
                      </button>
                    )}
                    <button 
                      onClick={() => handlePrint(note)}
                      className="p-2 text-stone-600 hover:bg-stone-50 dark:hover:bg-zinc-800 rounded-xl transition-colors"
                      title="Imprimir"
                    >
                      <Printer size={20} />
                    </button>
                    <button 
                      onClick={() => handleShare(note)}
                      className="p-2 text-purple-600 hover:bg-purple-50 dark:hover:bg-purple-900/20 rounded-xl transition-colors"
                      title="Compartilhar"
                    >
                      <Share2 size={20} />
                    </button>
                    <button 
                      onClick={() => handleListen(`${note.title}. ${note.content}`)}
                      disabled={isGeneratingSpeech}
                      className="p-2 text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 rounded-xl transition-colors disabled:opacity-50"
                      title="Ouvir"
                    >
                      {isGeneratingSpeech && pendingSpeechText === `${note.title}. ${note.content}` ? (
                        <Loader2 size={20} className="animate-spin" />
                      ) : (
                        <Volume2 size={20} />
                      )}
                    </button>
                    {onSearchWiki && (
                      <button 
                        onClick={() => onSearchWiki(note.title)}
                        className="p-2 text-cyan-600 hover:bg-cyan-50 dark:hover:bg-cyan-900/20 rounded-xl transition-colors"
                        title="Wiki"
                      >
                        <Globe size={20} />
                      </button>
                    )}
                    <button 
                      onClick={() => confirmDelete(note.id)}
                      className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-colors"
                      title="Excluir"
                    >
                      <Trash2 size={20} />
                    </button>
                  </div>
                </div>

                {/* Page Content */}
                <div id={`note-content-${note.id}`} className="flex-1 px-16 py-10 prose dark:prose-invert max-w-none bg-white dark:bg-zinc-900">
                  <MarkdownRenderer content={note.content} />
                </div>

                {/* Page Footer */}
                <div className="px-16 py-6 border-t border-stone-100 dark:border-zinc-800 flex items-center justify-center gap-3">
                  <img 
                    src="https://i.postimg.cc/pd0P8t4L/1000097620_removebg_preview.png" 
                    alt="Logo" 
                    className="w-4 h-4 object-contain"
                    referrerPolicy="no-referrer"
                  />
                  <p className="text-[10px] font-mono text-stone-300 uppercase tracking-[0.2em]">
                    Imersão Bíblica IA — {note.createdAt ? new Date(note.createdAt).toLocaleDateString('pt-BR') : note.date}
                  </p>
                  <img 
                    src="https://i.postimg.cc/pd0P8t4L/1000097620_removebg_preview.png" 
                    alt="Logo" 
                    className="w-4 h-4 object-contain"
                    referrerPolicy="no-referrer"
                  />
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </>
  )}

  <AnimatePresence>
        {noteToDelete && (
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
              <h2 className="text-2xl font-display font-bold text-stone-900 dark:text-zinc-100 mb-2">
                Excluir Página
              </h2>
              <p className="text-stone-500 dark:text-zinc-400 mb-8">
                Tem certeza que deseja excluir esta página do seu caderno? Esta ação não pode ser desfeita.
              </p>
              <div className="flex gap-4">
                <button
                  onClick={() => setNoteToDelete(null)}
                  disabled={isDeleting}
                  className="flex-1 py-3 bg-stone-100 dark:bg-zinc-800 text-stone-700 dark:text-zinc-300 font-bold rounded-2xl hover:bg-stone-200 dark:hover:bg-zinc-700 transition-colors disabled:opacity-50"
                >
                  Cancelar
                </button>
                <button
                  onClick={deleteNote}
                  disabled={isDeleting}
                  className="flex-1 py-3 bg-red-600 text-white font-bold rounded-2xl hover:bg-red-700 transition-colors shadow-lg shadow-red-600/20 disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {isDeleting ? <Loader2 className="animate-spin" size={20} /> : <Trash2 size={20} />}
                  Excluir
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <AudioConfirmationModal
        isOpen={isAudioConfirmModalOpen}
        isLoading={isGeneratingSpeech}
        onClose={() => setIsAudioConfirmModalOpen(false)}
        onConfirm={confirmGenerateSpeech}
      />
    </div>
  );
}
