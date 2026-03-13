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
  ArrowLeft,
  Calendar,
  Anchor,
  Loader2
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '../types';
import { useToast } from '../components/Toast';
import { AudioSearchButton } from '../components/AudioSearchButton';
import MarkdownRenderer from '../components/MarkdownRenderer';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

interface Note {
  id: string;
  title: string;
  content: string;
  date: string;
  createdAt?: string;
  category: 'Anotações' | 'Pregações' | 'Estudos';
}

interface NotebookPageProps {
  onSearchWiki?: (query: string) => void;
}

import { useAuth } from '../contexts/AuthContext';
import { db } from '../lib/firebase';
import { doc, addDoc, updateDoc, deleteDoc, collection } from 'firebase/firestore';

export default function NotebookPage({ onSearchWiki }: NotebookPageProps) {
  const { user, notes, isInitialLoading } = useAuth();
  const { showToast } = useToast();
  const [searchQuery, setSearchQuery] = useState('');
  const [currentNote, setCurrentNote] = useState<{ title: string, content: string, category: 'Anotações' | 'Pregações' | 'Estudos' }>({ title: '', content: '', category: 'Anotações' });
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState<'Todos' | 'Anotações' | 'Pregações' | 'Estudos'>('Todos');
  const [headerText, setHeaderText] = useState('');
  const [footerText, setFooterText] = useState('');
  const [noteToDelete, setNoteToDelete] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    // Notes are now handled by AuthContext and Firestore
  }, []);

  const saveNote = async () => {
    if (!currentNote.title || !currentNote.content) {
      showToast("Preencha o título e o conteúdo! ✍️", 'info');
      return;
    }

    if (!user) return;
    
    setIsSaving(true);
    try {
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
    if (noteToDelete) {
      setIsDeleting(true);
      try {
        const noteDocRef = doc(db, 'notes', noteToDelete);
        await deleteDoc(noteDocRef);
        showToast("Página removida. 🗑️", 'info');
      } catch (error) {
        console.error("Error deleting note:", error);
        showToast("Erro ao excluir página.", 'error');
      } finally {
        setNoteToDelete(null);
        setIsDeleting(false);
      }
    }
  };

  const handleCopy = (content: string) => {
    navigator.clipboard.writeText(content);
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
            <div class="header">${headerText}</div>
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
            <div class="footer">${footerText}</div>
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
    if (navigator.share) {
      try {
        await navigator.share({
          title: note.title,
          text: note.content,
        });
      } catch (err) {
        console.error(err);
      }
    } else {
      handleCopy(`${note.title}\n\n${note.content}`);
    }
  };

  if (isInitialLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-500"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="text-center py-20">
        <h2 className="text-2xl font-bold mb-4">Acesse sua conta para ver seu caderno</h2>
        <p className="text-stone-500">Guarde seus estudos e reflexões com segurança.</p>
      </div>
    );
  }

  const filteredNotes = notes.filter(n => {
    const matchesSearch = n.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         n.content.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = searchQuery ? true : (activeCategory === 'Todos' || n.category === activeCategory);
    return matchesSearch && matchesCategory;
  });

  const currentMonthYear = new Intl.DateTimeFormat('pt-BR', { month: 'long', year: 'numeric' }).format(new Date());

  return (
    <div className="space-y-8 relative">
      {/* Transparent Anchor Background */}
      <div className="fixed inset-0 pointer-events-none flex items-center justify-center opacity-[0.03] z-0 overflow-hidden">
        <Anchor size={800} className="text-emerald-900 dark:text-emerald-100 rotate-12" />
      </div>

      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
        <div>
          <h2 className="text-4xl font-display font-bold text-emerald-900 dark:text-emerald-400">Caderno</h2>
        </div>
        <div className="flex gap-3">
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
        </div>
      </header>

      {/* Categories and Customization */}
      <div className="flex flex-col lg:flex-row gap-6 items-start lg:items-center justify-between">
        <div className="flex bg-stone-100 dark:bg-zinc-800 p-1 rounded-2xl overflow-x-auto max-w-full">
          {['Todos', 'Anotações', 'Pregações', 'Estudos'].map((cat) => (
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

        <div className="flex flex-wrap gap-4 w-full lg:w-auto">
          <div className="flex-1 lg:flex-none relative">
            <input 
              type="text"
              placeholder="Cabeçalho do PDF"
              value={headerText}
              onChange={(e) => setHeaderText(e.target.value)}
              className="w-full px-4 py-2 bg-white dark:bg-zinc-900 border border-stone-200 dark:border-zinc-800 rounded-xl text-xs focus:ring-2 focus:ring-emerald-500 outline-none"
            />
          </div>
          <div className="flex-1 lg:flex-none relative">
            <input 
              type="text"
              placeholder="Rodapé do PDF"
              value={footerText}
              onChange={(e) => setFooterText(e.target.value)}
              className="w-full px-4 py-2 bg-white dark:bg-zinc-900 border border-stone-200 dark:border-zinc-800 rounded-xl text-xs focus:ring-2 focus:ring-emerald-500 outline-none"
            />
          </div>
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
                  placeholder="Título da página (ex: Estudo sobre João 3:16)"
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
                  <option value="Pregações">Pregações</option>
                  <option value="Estudos">Estudos</option>
                </select>
              </div>
              <textarea
                placeholder="Escreva aqui suas reflexões, estudos e o que Deus falou ao seu coração..."
                value={currentNote.content}
                onChange={(e) => setCurrentNote({ ...currentNote, content: e.target.value })}
                className="w-full p-6 bg-stone-50 dark:bg-zinc-800 border border-stone-200 dark:border-zinc-700 rounded-2xl focus:ring-2 focus:ring-emerald-500 outline-none h-96 resize-none leading-relaxed"
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
                    className="w-4 h-4 object-contain mix-blend-multiply dark:mix-blend-screen"
                    referrerPolicy="no-referrer"
                  />
                  <p className="text-[10px] font-mono text-stone-300 uppercase tracking-[0.2em]">
                    Imersão Bíblica IA — {note.createdAt ? new Date(note.createdAt).toLocaleDateString('pt-BR') : note.date}
                  </p>
                  <img 
                    src="https://i.postimg.cc/pd0P8t4L/1000097620_removebg_preview.png" 
                    alt="Logo" 
                    className="w-4 h-4 object-contain mix-blend-multiply dark:mix-blend-screen"
                    referrerPolicy="no-referrer"
                  />
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

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

      <footer className="pt-12 pb-6 border-t border-stone-200 dark:border-zinc-800 flex flex-col items-center gap-4">
        <div className="flex items-center justify-center gap-3">
          <img 
            src="https://i.postimg.cc/pd0P8t4L/1000097620_removebg_preview.png" 
            alt="Logo" 
            className="w-5 h-5 object-contain mix-blend-multiply dark:mix-blend-screen"
            referrerPolicy="no-referrer"
          />
          <p className="text-stone-500 dark:text-zinc-400 font-medium">
            Aplicativo Imersão Bíblia IA — {currentMonthYear.charAt(0).toUpperCase() + currentMonthYear.slice(1)}
          </p>
          <img 
            src="https://i.postimg.cc/pd0P8t4L/1000097620_removebg_preview.png" 
            alt="Logo" 
            className="w-5 h-5 object-contain mix-blend-multiply dark:mix-blend-screen"
            referrerPolicy="no-referrer"
          />
        </div>
      </footer>
    </div>
  );
}
