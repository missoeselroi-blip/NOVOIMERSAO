import React, { useState, useEffect, useCallback, useRef } from 'react';
import { 
  Search, 
  ChevronLeft, 
  ChevronRight, 
  Settings, 
  MessageSquare, 
  Info, 
  Bookmark, 
  Share2, 
  Copy, 
  Type, 
  Moon, 
  Sun, 
  Loader2, 
  X,
  ArrowRight,
  Sparkles,
  History,
  BookmarkCheck,
  Highlighter,
  Underline,
  Circle,
  StickyNote,
  Heart,
  Send,
  Trash2,
  Palette,
  Maximize2,
  Minimize2,
  LogOut,
  ArrowLeft,
  Layers
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../types';
import { bibleService, BibleVersion, BibleBook, BibleVerse, SearchResult } from '../services/bibleService';
import { useAuth } from '../contexts/AuthContext';
import { useBible, AnnotationType } from '../contexts/BibleContext';
import { useToast } from '../components/Toast';
import { geminiService } from '../services/geminiService';
import Markdown from 'react-markdown';
import { useNavigate } from 'react-router-dom';

interface BiblePageProps {
  isOverlay?: boolean;
  onClose?: () => void;
}

export default function BiblePage({ isOverlay = false, onClose }: BiblePageProps) {
  const { user, addStudy } = useAuth();
  const { annotations, setAnnotation, removeAnnotation, toggleFavorite, lastState, setLastState } = useBible();
  const { showToast } = useToast();
  const navigate = useNavigate();
  
  // State
  const [versions, setVersions] = useState<BibleVersion[]>([]);
  const [selectedVersion, setSelectedVersion] = useState<string>(lastState?.version || 'ARA'); // Default to ARA (Portuguese)
  const [books, setBooks] = useState<BibleBook[]>([]);
  const [selectedBook, setSelectedBook] = useState<number>(lastState?.book || 1); // Default to Genesis
  const [selectedChapter, setSelectedChapter] = useState<number>(lastState?.chapter || 1);
  const [verses, setVerses] = useState<BibleVerse[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSearching, setIsSearching] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>(lastState?.searchQuery || '');
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [showVersionSelector, setShowVersionSelector] = useState<boolean>(false);
  const [showBookSelector, setShowBookSelector] = useState<boolean>(false);
  const [selectedVerses, setSelectedVerses] = useState<BibleVerse[]>([]);
  const [commentary, setCommentary] = useState<string | null>(null);
  const [isGeneratingCommentary, setIsGeneratingCommentary] = useState<boolean>(false);
  const [fontSize, setFontSize] = useState<number>(18); // Default to 18px
  const [showSettings, setShowSettings] = useState<boolean>(false);
  const [history, setHistory] = useState<{book: string, chapter: number, version: string}[]>([]);
  const [showAnnotationMenu, setShowAnnotationMenu] = useState(false);
  const [annotationNote, setAnnotationNote] = useState('');
  const [annotationColor, setAnnotationColor] = useState('#fbbf24');
  const [isAutoSaving, setIsAutoSaving] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(true); // Default to fullscreen

  const scrollRef = useRef<HTMLDivElement>(null);

  // Sync state to Context
  useEffect(() => {
    setLastState({
      version: selectedVersion,
      book: selectedBook,
      chapter: selectedChapter,
      searchQuery: searchQuery
    });
  }, [selectedVersion, selectedBook, selectedChapter, searchQuery, setLastState]);

  // Initialize
  useEffect(() => {
    const init = async () => {
      try {
        const v = await bibleService.getVersions();
        // Filter for requested versions
        const requestedVersions = [
          'ARA', 'NTLH'
        ];
        const filteredVersions = v.filter(ver => requestedVersions.includes(ver.short_name));
        setVersions(filteredVersions.length > 0 ? filteredVersions : v);
        
        const defaultVer = lastState?.version || 'ARA';
        const defaultBook = lastState?.book || 1;
        const defaultChapter = lastState?.chapter || 1;
        
        const b = await bibleService.getBooks(defaultVer);
        setBooks(b);
        
        loadChapter(defaultVer, defaultBook, defaultChapter);
        
        if (lastState?.searchQuery) {
          setIsSearching(true);
          try {
            const results = await bibleService.search(defaultVer, lastState.searchQuery);
            setSearchResults(results);
          } catch (error) {
            console.error("Error searching Bible:", error);
          } finally {
            setIsSearching(false);
          }
        }
      } catch (error) {
        console.error("Error initializing Bible:", error);
        // Don't show toast for every error during init, just try to load something
        try {
          const b = await bibleService.getBooks('ARA');
          setBooks(b);
          loadChapter('ARA', 1, 1);
        } catch (e) {
          showToast("Erro ao carregar a Bíblia. Tente novamente.", "error");
        }
      }
    };
    init();
  }, []);

  const handleVerseClick = (v: BibleVerse, event?: React.MouseEvent) => {
    const isSelected = selectedVerses.some(sv => sv.pk === v.pk);
    
    if (event?.shiftKey && selectedVerses.length > 0) {
      const lastSelected = selectedVerses[selectedVerses.length - 1];
      const start = Math.min(lastSelected.verse, v.verse);
      const end = Math.max(lastSelected.verse, v.verse);
      
      const range = verses.filter(verse => verse.verse >= start && verse.verse <= end);
      const newSelected = Array.from(new Set([...selectedVerses, ...range])).sort((a, b) => a.verse - b.verse);
      setSelectedVerses(newSelected);
      return;
    }

    if (isSelected) {
      const newSelected = selectedVerses.filter(sv => sv.pk !== v.pk);
      setSelectedVerses(newSelected);
      if (newSelected.length === 0) {
        setAnnotationNote('');
      } else {
        // Load note from the last selected verse
        const lastVerse = newSelected[newSelected.length - 1];
        const verseId = `${selectedVersion}_${selectedBook}_${selectedChapter}_${lastVerse.verse}`;
        const existing = annotations[verseId];
        setAnnotationNote(existing?.note || '');
        setAnnotationColor(existing?.color || '#fbbf24');
      }
    } else {
      const newSelected = [...selectedVerses, v].sort((a, b) => a.verse - b.verse);
      setSelectedVerses(newSelected);
      
      // If it's the first one, load its note
      if (newSelected.length === 1) {
        const verseId = `${selectedVersion}_${selectedBook}_${selectedChapter}_${v.verse}`;
        const existing = annotations[verseId];
        setAnnotationNote(existing?.note || '');
        setAnnotationColor(existing?.color || '#fbbf24');
      }
    }
  };

  const applyAnnotation = async (type: AnnotationType) => {
    if (selectedVerses.length === 0 || !selectedBook) return;
    
    setIsAutoSaving(true);
    try {
      for (const v of selectedVerses) {
        const verseId = `${selectedVersion}_${selectedBook}_${selectedChapter}_${v.verse}`;
        await setAnnotation(verseId, { type, color: annotationColor, note: annotationNote });
      }
      showToast(`${selectedVerses.length} versículo(s) anotado(s)! ✨`, "success");
      setSelectedVerses([]);
      setAnnotationNote('');
    } catch (error) {
      console.error("Error applying multi-verse annotation:", error);
      showToast("Erro ao salvar anotações.", "error");
    } finally {
      setIsAutoSaving(false);
    }
  };

  const handleToggleFavorite = async (v: BibleVerse) => {
    if (!selectedBook) return;
    const verseId = `${selectedVersion}_${selectedBook}_${selectedChapter}_${v.verse}`;
    const bookName = books.find(b => b.pk === selectedBook)?.name || '';
    await toggleFavorite(verseId, v.text, `${bookName} ${selectedChapter}:${v.verse}`);
    showToast(annotations[verseId]?.isFavorite ? "Removido dos favoritos" : "Adicionado aos favoritos! ❤️", "info");
  };

  const sendToPost = (v: BibleVerse) => {
    const bookName = books.find(b => b.pk === selectedBook)?.name || '';
    const reference = `${bookName} ${selectedChapter}:${v.verse}`;
    if (isOverlay && onClose) onClose();
    navigate('/posts', { state: { verse: v.text, reference } });
  };

  const colors = [
    '#fbbf24', // Yellow
    '#34d399', // Green
    '#60a5fa', // Blue
    '#f87171', // Red
    '#c084fc', // Purple
    '#fb923c', // Orange
  ];

  const loadChapter = async (version: string, bookId: number, chapter: number) => {
    setIsLoading(true);
    try {
      const v = await bibleService.getChapter(version, bookId, chapter);
      setVerses(v);
      setSelectedBook(bookId);
      setSelectedChapter(chapter);
      setSelectedVersion(version);
      
      // Add to history
      const bookName = books.find(b => b.pk === bookId)?.name || 'Livro';
      setHistory(prev => {
        const newHistory = [{book: bookName, chapter, version}, ...prev.filter(h => !(h.book === bookName && h.chapter === chapter && h.version === version))];
        return newHistory.slice(0, 10);
      });
      
      if (scrollRef.current) {
        scrollRef.current.scrollTop = 0;
      }
    } catch (error) {
      console.error("Error loading chapter:", error);
      showToast("Erro ao carregar o capítulo.", "error");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    
    setIsSearching(true);
    try {
      const results = await bibleService.search(selectedVersion, searchQuery);
      setSearchResults(results);
    } catch (error) {
      console.error("Error searching Bible:", error);
      showToast("Erro ao realizar busca.", "error");
    } finally {
      setIsSearching(false);
    }
  };

  const generateCommentary = async (verse: BibleVerse) => {
    setSelectedVerses([verse]);
    setIsGeneratingCommentary(true);
    setCommentary(null);
    
    try {
      const bookName = books.find(b => b.pk === selectedBook)?.name || 'Livro';
      
      const prompt = `Você é um tutor teológico experiente. Forneça um comentário bíblico profundo e uma nota de estudo para o seguinte versículo:
      ${bookName} ${selectedChapter}:${verse.verse} (${selectedVersion})
      Texto: "${verse.text}"
      
      O comentário deve incluir:
      1. Contexto histórico e literário.
      2. Significado teológico.
      3. Aplicação prática para a vida cristã hoje.
      4. Referências cruzadas interessantes.
      
      Use uma linguagem clara, inspiradora e acadêmica, mas acessível. Formate em Markdown.`;

      const result = await geminiService.generateText(prompt, "Você é um pastor e teólogo bíblico altamente qualificado.");
      setCommentary(result || "Não foi possível gerar o comentário.");
    } catch (error) {
      console.error("Error generating commentary:", error);
      showToast("Erro ao gerar comentário com IA.", "error");
    } finally {
      setIsGeneratingCommentary(false);
    }
  };

  const handleSaveStudy = async () => {
    if (!user) {
      showToast("Faça login para salvar seus estudos.", "info");
      return;
    }
    if (!commentary || selectedVerses.length === 0) return;

    try {
      const bookName = books.find(b => b.pk === selectedBook)?.name || 'Livro';
      const firstVerse = selectedVerses[0];
      const lastVerse = selectedVerses[selectedVerses.length - 1];
      const reference = `${bookName} ${selectedChapter}:${firstVerse.verse}${selectedVerses.length > 1 ? `-${lastVerse.verse}` : ''}`;
      
      await addStudy({
        title: `Estudo: ${reference}`,
        content: commentary,
        verseReference: reference,
        bibleVersion: selectedVersion
      });
      showToast("Estudo salvo com sucesso!", "success");
    } catch (error) {
      console.error("Error saving study:", error);
      showToast("Erro ao salvar estudo.", "error");
    }
  };

  const nextChapter = () => {
    const currentBook = books.find(b => b.pk === selectedBook);
    if (!currentBook) return;

    if (selectedChapter < currentBook.chapters) {
      loadChapter(selectedVersion, selectedBook, selectedChapter + 1);
    } else {
      // Go to next book
      const nextBook = books.find(b => b.pk === selectedBook + 1);
      if (nextBook) {
        loadChapter(selectedVersion, nextBook.pk, 1);
      }
    }
  };

  const prevChapter = () => {
    if (selectedChapter > 1) {
      loadChapter(selectedVersion, selectedBook, selectedChapter - 1);
    } else {
      // Go to previous book
      const prevBook = books.find(b => b.pk === selectedBook - 1);
      if (prevBook) {
        loadChapter(selectedVersion, prevBook.pk, prevBook.chapters);
      }
    }
  };

  const copyVerse = (verse: BibleVerse) => {
    const bookName = books.find(b => b.pk === selectedBook)?.name || 'Livro';
    const text = `"${verse.text}" - ${bookName} ${selectedChapter}:${verse.verse} (${selectedVersion})`;
    navigator.clipboard.writeText(text);
    showToast("Versículo copiado!", "success");
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      if (document.documentElement.requestFullscreen) {
        document.documentElement.requestFullscreen().catch(e => {
          console.error(`Error attempting to enable full-screen mode: ${e.message}`);
        });
        setIsFullscreen(true);
      } else {
        showToast("Modo tela cheia não suportado neste navegador.", "info");
      }
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen().catch(e => console.error(e));
        setIsFullscreen(false);
      }
    }
  };

  return (
    <div className={cn(
      "fixed inset-0 z-[70] flex flex-col bg-white dark:bg-zinc-950 overflow-hidden",
      isFullscreen ? "p-0" : ""
    )}>
      {/* Header / Toolbar */}
      <div className="p-4 md:p-6 border-b border-stone-200 dark:border-zinc-800 flex flex-wrap items-center justify-between gap-4 bg-stone-100 dark:bg-zinc-900 sticky top-0 z-[60]">
        <div className="flex items-center gap-2">
          <button 
            onClick={() => {
              if (document.fullscreenElement && document.exitFullscreen) {
                document.exitFullscreen().catch(e => console.error(e));
              }
              if (isOverlay && onClose) {
                onClose();
              } else {
                navigate('/');
              }
            }}
            className="flex items-center gap-2 p-2 px-3 hover:bg-stone-200 dark:hover:bg-zinc-800 rounded-xl transition-colors text-stone-500 mr-2"
            title="Sair da Bíblia"
          >
            <X size={20} />
            <span className="text-sm font-medium hidden sm:inline">Sair</span>
          </button>
          
          <button 
            onClick={toggleFullscreen}
            className="p-2 hover:bg-stone-200 dark:hover:bg-zinc-800 rounded-xl transition-colors text-stone-500 mr-2"
            title={isFullscreen ? "Minimizar" : "Maximizar"}
          >
            {isFullscreen ? <Minimize2 size={24} /> : <Maximize2 size={24} />}
          </button>
          
          <button 
            onClick={() => setShowVersionSelector(!showVersionSelector)}
            className="flex items-center px-4 py-2 bg-white dark:bg-zinc-800 rounded-xl border border-stone-200 dark:border-zinc-700 hover:border-emerald-500 transition-all shadow-sm"
          >
            <span className="text-sm font-bold">{selectedVersion}</span>
          </button>

          <button 
            onClick={() => setShowBookSelector(!showBookSelector)}
            className="flex items-center px-4 py-2 bg-white dark:bg-zinc-800 rounded-xl border border-stone-200 dark:border-zinc-700 hover:border-emerald-500 transition-all shadow-sm"
          >
            <span className="text-sm font-bold">
              {bibleService.getBookAbbreviation(books.find(b => b.pk === selectedBook)?.name || '')}
            </span>
          </button>

          <div className="flex items-center gap-1 ml-2">
            <button 
              onClick={prevChapter}
              className="p-2 hover:bg-stone-200 dark:hover:bg-zinc-800 rounded-lg transition-colors"
              title="Capítulo Anterior"
            >
              <ChevronLeft size={20} />
            </button>
            <button 
              onClick={nextChapter}
              className="p-2 hover:bg-stone-200 dark:hover:bg-zinc-800 rounded-lg transition-colors"
              title="Próximo Capítulo"
            >
              <ChevronRight size={20} />
            </button>
            
            <div className="w-px h-6 bg-stone-200 dark:bg-zinc-700 mx-2 hidden md:block" />
            
            <button 
              onClick={() => setShowSettings(!showSettings)}
              className="p-2 hover:bg-stone-200 dark:hover:bg-zinc-800 rounded-xl transition-colors text-stone-500"
              title="Configurações"
            >
              <Settings size={20} />
            </button>
          </div>
        </div>

        {/* Editing Buttons in Header - Only visible when verses are selected */}
        <AnimatePresence>
          {selectedVerses.length > 0 && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="flex items-center gap-2 px-4 py-1 bg-emerald-50 dark:bg-emerald-900/20 rounded-2xl border border-emerald-200 dark:border-emerald-800 shadow-sm"
            >
              <button 
                onClick={() => applyAnnotation('highlight')}
                className="p-2 rounded-lg transition-all hover:scale-110 text-emerald-600"
                title="Grifar"
              >
                <Highlighter size={20} />
              </button>
              <button 
                onClick={() => applyAnnotation('underline')}
                className="p-2 rounded-lg transition-all hover:scale-110 text-blue-600"
                title="Sublinhar"
              >
                <Underline size={20} />
              </button>
              <button 
                onClick={() => applyAnnotation('circle')}
                className="p-2 rounded-lg transition-all hover:scale-110 text-purple-600"
                title="Circular"
              >
                <Circle size={20} />
              </button>
              <div className="w-px h-6 bg-emerald-200 dark:bg-emerald-800 mx-1" />
              <button 
                onClick={async () => {
                  if (selectedVerses.length === 0 || !selectedBook) return;
                  for (const v of selectedVerses) {
                    const verseId = `${selectedVersion}_${selectedBook}_${selectedChapter}_${v.verse}`;
                    await removeAnnotation(verseId);
                  }
                  showToast("Marcações removidas", "info");
                  setSelectedVerses([]);
                }}
                className="p-2 rounded-lg transition-all hover:scale-110 text-red-600"
                title="Limpar Marcações"
              >
                <Trash2 size={20} />
              </button>
              <div className="w-px h-6 bg-emerald-200 dark:bg-emerald-800 mx-1" />
              <button 
                onClick={() => {
                  if (selectedVerses.length === 0) return;
                  const bookName = books.find(b => b.pk === selectedBook)?.name;
                  const text = selectedVerses.map(v => `[${v.verse}] ${v.text}`).join('\n');
                  const reference = `${bookName} ${selectedChapter}:${selectedVerses[0].verse}${selectedVerses.length > 1 ? `-${selectedVerses[selectedVerses.length - 1].verse}` : ''}`;
                  navigator.clipboard.writeText(`${reference}\n\n${text}`);
                  showToast("Copiado para a área de transferência", "success");
                }}
                className="p-2 rounded-lg transition-all hover:scale-110 text-stone-600 dark:text-stone-300"
                title="Copiar"
              >
                <Copy size={20} />
              </button>
              <button 
                onClick={async () => {
                  if (selectedVerses.length === 0) return;
                  const bookName = books.find(b => b.pk === selectedBook)?.name;
                  const text = selectedVerses.map(v => `[${v.verse}] ${v.text}`).join('\n');
                  const reference = `${bookName} ${selectedChapter}:${selectedVerses[0].verse}${selectedVerses.length > 1 ? `-${selectedVerses[selectedVerses.length - 1].verse}` : ''}`;
                  
                  if (navigator.share) {
                    try {
                      await navigator.share({
                        title: 'Versículo Bíblico',
                        text: `${reference}\n\n${text}`,
                        url: window.location.href
                      });
                    } catch (err) {
                      console.error("Error sharing:", err);
                    }
                  } else {
                    showToast("Compartilhamento não suportado neste navegador", "info");
                  }
                }}
                className="p-2 rounded-lg transition-all hover:scale-110 text-stone-600 dark:text-stone-300"
                title="Compartilhar"
              >
                <Share2 size={20} />
              </button>
              <button 
                onClick={() => {
                  if (selectedVerses.length === 0) return;
                  const bookName = books.find(b => b.pk === selectedBook)?.name;
                  const reference = `${bookName} ${selectedChapter}:${selectedVerses[0].verse}${selectedVerses.length > 1 ? `-${selectedVerses[selectedVerses.length - 1].verse}` : ''}`;
                  if (isOverlay && onClose) onClose();
                  navigate(`/study?tab=compare&search=${encodeURIComponent(reference)}`);
                }}
                className="p-2 rounded-lg transition-all hover:scale-110 text-indigo-600 dark:text-indigo-400"
                title="Comparar Versões"
              >
                <Layers size={20} />
              </button>
              <div className="w-px h-6 bg-emerald-200 dark:bg-emerald-800 mx-1" />
              <button 
                onClick={() => {
                  setSelectedVerses([]);
                  setAnnotationNote('');
                }}
                className="p-2 text-stone-500 hover:text-stone-900 dark:hover:text-white transition-all hover:scale-110"
                title="Limpar Seleção"
              >
                <X size={20} />
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="flex items-center gap-2">
          {/* Settings button moved to navigation group */}
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex overflow-hidden relative bg-stone-50 dark:bg-zinc-900/50">
        {/* Version Selector Overlay */}
        <AnimatePresence>
          {showVersionSelector && (
            <motion.div 
              key="version-selector"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="absolute top-0 left-0 right-0 z-20 p-6 bg-white dark:bg-zinc-900 border-b border-stone-200 dark:border-zinc-800 shadow-xl grid grid-cols-2 md:grid-cols-4 gap-4 max-h-[70vh] overflow-y-auto"
            >
              <div className="col-span-full flex justify-between items-center mb-2">
                <h3 className="text-xs font-black text-stone-400 uppercase tracking-widest">Versões Disponíveis</h3>
                <button onClick={() => setShowVersionSelector(false)}><X size={18} /></button>
              </div>
              {versions.map(v => (
                <button 
                  key={v.short_name}
                  onClick={() => {
                    loadChapter(v.short_name, selectedBook, selectedChapter);
                    setShowVersionSelector(false);
                  }}
                  className={cn(
                    "p-4 rounded-2xl border text-left transition-all",
                    selectedVersion === v.short_name 
                      ? "bg-emerald-50 border-emerald-500 text-emerald-700" 
                      : "border-stone-100 dark:border-zinc-800 hover:bg-stone-50 dark:hover:bg-zinc-800"
                  )}
                >
                  <p className="font-bold">{v.short_name}</p>
                  <p className="text-[10px] text-stone-400 truncate">{v.name}</p>
                </button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Book Selector Overlay */}
        <AnimatePresence>
          {showBookSelector && (
            <motion.div 
              key="book-selector"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="absolute inset-0 z-20 bg-white dark:bg-zinc-900 flex flex-col"
            >
              <div className="p-6 border-b border-stone-100 dark:border-zinc-800 flex justify-between items-center">
                <h3 className="text-xl font-black tracking-tighter uppercase">Selecionar Livro</h3>
                <button onClick={() => setShowBookSelector(false)} className="p-2 hover:bg-stone-100 dark:hover:bg-zinc-800 rounded-full"><X size={24} /></button>
              </div>
              <div className="flex-1 overflow-y-auto p-6 grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
                {books.map((b, idx) => (
                  <button 
                    key={`book-${selectedVersion}-${b.pk || idx}`}
                    onClick={() => {
                      setSelectedBook(b.pk);
                      // Don't close yet, show chapters
                    }}
                    className={cn(
                      "p-3 rounded-xl border text-sm font-bold transition-all",
                      selectedBook === b.pk 
                        ? "bg-emerald-600 border-emerald-600 text-white" 
                        : "border-stone-100 dark:border-zinc-800 hover:bg-stone-50 dark:hover:bg-zinc-800"
                    )}
                  >
                    {b.name}
                  </button>
                ))}
              </div>
              {selectedBook && (
                <div className="p-6 bg-stone-50 dark:bg-zinc-800/50 border-t border-stone-200 dark:border-zinc-800">
                  <h4 className="text-xs font-black text-stone-400 uppercase tracking-widest mb-4">
                    Capítulos de {bibleService.shortenBookName(books.find(b => b.pk === selectedBook)?.name || '')}
                  </h4>
                  <div className="flex flex-wrap gap-2 max-h-48 overflow-y-auto p-1">
                    {Array.from({ length: books.find(b => b.pk === selectedBook)?.chapters || 0 }, (_, i) => i + 1).map(c => (
                      <button 
                        key={`chapter-${selectedVersion}-${selectedBook}-${c}`}
                        onClick={() => {
                          loadChapter(selectedVersion, selectedBook, c);
                          setShowBookSelector(false);
                        }}
                        className={cn(
                          "w-10 h-10 rounded-lg border flex items-center justify-center font-bold transition-all",
                          selectedChapter === c 
                            ? "bg-emerald-600 border-emerald-600 text-white" 
                            : "bg-white dark:bg-zinc-800 border-stone-200 dark:border-zinc-700 hover:border-emerald-500"
                        )}
                      >
                        {c}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Search Results Overlay */}
        <AnimatePresence>
          {searchQuery && searchResults.length > 0 && (
            <motion.div 
              key="search-results"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className="absolute inset-0 z-30 bg-white dark:bg-zinc-950 flex flex-col"
            >
              <div className="p-6 border-b border-stone-100 dark:border-zinc-800 flex justify-between items-center bg-stone-50 dark:bg-zinc-900">
                <div>
                  <h3 className="text-xl font-black tracking-tighter uppercase">Resultados da Busca</h3>
                  <p className="text-xs text-stone-400 uppercase tracking-widest">{searchResults.length} ocorrências encontradas</p>
                </div>
                <button onClick={() => { setSearchQuery(''); setSearchResults([]); }} className="p-2 hover:bg-stone-100 dark:hover:bg-zinc-800 rounded-full"><X size={24} /></button>
              </div>
              <div className="flex-1 overflow-y-auto p-6 space-y-6">
                {searchResults.map((res, idx) => (
                  <div 
                    key={`search-res-${res.pk}-${res.book}-${res.chapter}-${res.verse}-${idx}`} 
                    className="p-6 bg-stone-50 dark:bg-zinc-900 rounded-3xl border border-stone-100 dark:border-zinc-800 hover:border-emerald-500 transition-all cursor-pointer group"
                    onClick={() => {
                      const bookObj = books.find(b => b.name === res.book);
                      if (bookObj) {
                        loadChapter(selectedVersion, bookObj.pk, res.chapter);
                        setSearchQuery('');
                        setSearchResults([]);
                      }
                    }}
                  >
                    <div className="flex justify-between items-start mb-3">
                      <span className="text-xs font-black text-emerald-600 uppercase tracking-widest">{res.book} {res.chapter}:{res.verse}</span>
                      <ArrowRight size={16} className="text-stone-300 group-hover:text-emerald-500 transition-colors" />
                    </div>
                    <p className="text-stone-700 dark:text-zinc-300 leading-relaxed italic">"{res.text}"</p>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Reading Area */}
        <div className="flex-1 flex flex-col overflow-hidden">
          <div 
            ref={scrollRef}
            className="flex-1 overflow-y-auto p-6 md:p-12 scroll-smooth"
            style={{ fontSize: `${fontSize}px` }}
          >
            {isLoading ? (
              <div className="flex flex-col items-center justify-center h-full space-y-4">
                <Loader2 className="animate-spin text-emerald-600" size={48} />
                <p className="text-stone-400 uppercase tracking-widest text-[10px] font-black">Carregando Escrituras...</p>
              </div>
            ) : (
              <div className="max-w-3xl mx-auto space-y-8">
                <div className="text-center mb-12">
                  <h1 className="text-4xl md:text-6xl font-display font-black tracking-tighter text-stone-900 dark:text-white mb-4 uppercase">
                    {bibleService.shortenBookName(books.find(b => b.pk === selectedBook)?.name || '')} {selectedChapter}
                  </h1>
                  <div className="h-1.5 w-24 bg-emerald-500 mx-auto rounded-full shadow-lg shadow-emerald-500/50" />
                </div>

                <div className="space-y-6">
                  {verses.map((v) => {
                    const verseId = `${selectedVersion}_${selectedBook}_${selectedChapter}_${v.verse}`;
                    const annotation = annotations[verseId];
                    
                    return (
                      <motion.div 
                        key={verseId}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={cn(
                          "group relative p-4 rounded-2xl transition-all hover:bg-stone-50 dark:hover:bg-zinc-900/50 cursor-pointer",
                          selectedVerses.some(sv => sv.pk === v.pk) ? "bg-emerald-50/50 dark:bg-emerald-900/10 border-l-4 border-emerald-500 shadow-sm" : "",
                          annotation?.type === 'highlight' ? `bg-[${annotation.color}]/20` : "",
                          annotation?.type === 'underline' ? "border-b-2" : "",
                          annotation?.type === 'circle' ? "border-2 rounded-full" : ""
                        )}
                        style={{ 
                          backgroundColor: annotation?.type === 'highlight' ? `${annotation.color}33` : undefined,
                          borderBottomColor: annotation?.type === 'underline' ? annotation.color : undefined,
                          borderColor: annotation?.type === 'circle' ? annotation.color : undefined
                        }}
                        onClick={(e) => handleVerseClick(v, e)}
                      >
                        <div className="flex gap-4">
                          <span className="text-xs font-black text-emerald-600 mt-1.5 select-none">{v.verse}</span>
                          <div className="flex-1 space-y-2">
                            <p className="leading-relaxed text-stone-800 dark:text-zinc-200 font-medium">
                              {v.text}
                            </p>
                            {annotation?.note && (
                              <div className="flex items-start gap-2 p-3 bg-stone-100 dark:bg-zinc-800 rounded-xl text-xs text-stone-500 dark:text-zinc-400 italic border-l-2 border-stone-300 dark:border-zinc-600">
                                <StickyNote size={12} className="mt-0.5 shrink-0" />
                                <span>{annotation.note}</span>
                              </div>
                            )}
                          </div>
                        </div>
                        
                        <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1 z-10">
                          <button 
                            onClick={(e) => { e.stopPropagation(); handleToggleFavorite(v); }}
                            className={cn(
                              "p-2 bg-white dark:bg-zinc-800 rounded-lg shadow-sm border border-stone-200 dark:border-zinc-700 transition-colors",
                              annotation?.isFavorite ? "text-red-500 bg-red-50" : "text-stone-400 hover:text-red-500"
                            )}
                            title="Favoritar"
                          >
                            <Heart size={14} fill={annotation?.isFavorite ? "currentColor" : "none"} />
                          </button>
                          <button 
                            onClick={(e) => { e.stopPropagation(); generateCommentary(v); }}
                            className="p-2 bg-white dark:bg-zinc-800 rounded-lg shadow-sm border border-stone-200 dark:border-zinc-700 text-emerald-600 hover:bg-emerald-50 transition-colors"
                            title="Estudo IA"
                          >
                            <Sparkles size={14} />
                          </button>
                          <button 
                            onClick={(e) => { e.stopPropagation(); copyVerse(v); }}
                            className="p-2 bg-white dark:bg-zinc-800 rounded-lg shadow-sm border border-stone-200 dark:border-zinc-700 text-stone-500 hover:bg-stone-50 transition-colors"
                            title="Copiar"
                          >
                            <Copy size={14} />
                          </button>
                          <button 
                            onClick={(e) => { e.stopPropagation(); sendToPost(v); }}
                            className="p-2 bg-white dark:bg-zinc-800 rounded-lg shadow-sm border border-stone-200 dark:border-zinc-700 text-amber-600 hover:bg-amber-50 transition-colors"
                            title="Criar Post"
                          >
                            <Send size={14} />
                          </button>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>

                {/* Navigation Buttons */}
                <div className="flex justify-between items-center pt-12 border-t border-stone-100 dark:border-zinc-800">
                  <button 
                    onClick={prevChapter}
                    className="flex items-center gap-2 px-6 py-3 bg-stone-100 dark:bg-zinc-800 rounded-2xl font-bold hover:bg-emerald-600 hover:text-white transition-all group"
                  >
                    <ChevronLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
                    Anterior
                  </button>
                  <button 
                    onClick={nextChapter}
                    className="flex items-center gap-2 px-6 py-3 bg-stone-100 dark:bg-zinc-800 rounded-2xl font-bold hover:bg-emerald-600 hover:text-white transition-all group"
                  >
                    Próximo
                    <ChevronRight size={20} className="group-hover:translate-x-1 transition-transform" />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Side Panel (Commentaries / Study Notes) */}
        <AnimatePresence>
          {(selectedVerses.length > 0 || isGeneratingCommentary) && (
            <motion.div 
              key="study-panel"
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              className="w-full md:w-96 bg-stone-50 dark:bg-zinc-900 border-l border-stone-200 dark:border-zinc-800 flex flex-col shadow-2xl z-40"
            >
              <div className="p-6 border-b border-stone-200 dark:border-zinc-800 flex justify-between items-center bg-white dark:bg-zinc-950">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 rounded-xl">
                    <Sparkles size={20} />
                  </div>
                  <div>
                    <h3 className="font-black tracking-tighter uppercase">Imersão IA</h3>
                    <p className="text-[10px] text-stone-400 uppercase tracking-widest">Estudo & Comentário</p>
                  </div>
                </div>
                <button onClick={() => { setSelectedVerses([]); setCommentary(null); }} className="p-2 hover:bg-stone-100 dark:hover:bg-zinc-800 rounded-full"><X size={20} /></button>
              </div>

              <div className="flex-1 overflow-y-auto p-6 space-y-6">
                {selectedVerses.length > 0 && (
                  <div className="p-4 bg-white dark:bg-zinc-950 rounded-2xl border border-stone-200 dark:border-zinc-800 shadow-sm">
                    <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest mb-2">
                      {books.find(b => b.pk === selectedBook)?.name} {selectedChapter}:{selectedVerses[0].verse}{selectedVerses.length > 1 ? `-${selectedVerses[selectedVerses.length - 1].verse}` : ''}
                    </p>
                    <p className="text-sm italic text-stone-600 dark:text-zinc-400">"{selectedVerses[0].text}"</p>
                  </div>
                )}

                {isGeneratingCommentary ? (
                  <div className="flex flex-col items-center justify-center py-12 space-y-4">
                    <Loader2 className="animate-spin text-emerald-600" size={32} />
                    <p className="text-[10px] font-black text-stone-400 uppercase tracking-widest animate-pulse">Consultando Sabedoria IA...</p>
                  </div>
                ) : commentary ? (
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="prose dark:prose-invert prose-sm max-w-none"
                  >
                    <Markdown>{commentary}</Markdown>
                  </motion.div>
                ) : (
                  <div className="text-center py-12">
                    <Info size={48} className="mx-auto text-stone-200 mb-4" />
                    <p className="text-sm text-stone-400">Selecione um versículo e clique no ícone de brilho para gerar um comentário teológico profundo.</p>
                  </div>
                )}
              </div>

              <div className="p-4 bg-white dark:bg-zinc-950 border-t border-stone-200 dark:border-zinc-800">
                <button 
                  onClick={handleSaveStudy}
                  disabled={!commentary || isGeneratingCommentary}
                  className="w-full py-3 bg-emerald-600 text-white font-bold rounded-xl hover:bg-emerald-700 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Bookmark size={18} />
                  Salvar nos Meus Estudos
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Footer / Notes Area */}
      {/* Footer Note Field - Only visible when verses are selected */}
      <AnimatePresence>
        {selectedVerses.length > 0 && (
          <motion.div 
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            className="border-t border-stone-200 dark:border-zinc-800 bg-stone-50 dark:bg-zinc-900 p-4 sticky bottom-0 z-50 shadow-2xl"
          >
            <div className="max-w-4xl mx-auto flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-[10px] font-black text-stone-400 uppercase tracking-widest">
                  <StickyNote size={14} /> 
                  {`Observação: ${books.find(b => b.pk === selectedBook)?.name} ${selectedChapter}:${selectedVerses[0].verse}${selectedVerses.length > 1 ? `-${selectedVerses[selectedVerses.length - 1].verse}` : ''}`}
                </div>
                <div className="flex items-center gap-4">
                  <button
                    onClick={() => setSelectedVerses([])}
                    className="flex items-center gap-1 text-[10px] font-black text-red-500 uppercase tracking-widest hover:text-red-600 transition-colors"
                  >
                    <X size={12} />
                    Limpar
                  </button>
                  <div className="flex gap-1">
                    {colors.map(color => (
                      <button
                        key={color}
                        onClick={() => setAnnotationColor(color)}
                        className={cn(
                          "w-5 h-5 rounded-full border transition-all",
                          annotationColor === color ? "border-zinc-900 dark:border-white scale-110" : "border-transparent"
                        )}
                        style={{ backgroundColor: color }}
                      />
                    ))}
                  </div>
                  <button 
                    onClick={() => {
                      const firstVerseId = `${selectedVersion}_${selectedBook}_${selectedChapter}_${selectedVerses[0].verse}`;
                      const currentType = annotations[firstVerseId]?.type || 'highlight';
                      applyAnnotation(currentType);
                    }}
                    className="px-4 py-1.5 bg-emerald-600 text-white text-xs font-bold rounded-lg hover:bg-emerald-700 transition-colors shadow-sm"
                  >
                    Salvar Nota
                  </button>
                </div>
              </div>
              <textarea
                value={annotationNote}
                onChange={(e) => setAnnotationNote(e.target.value)}
                placeholder="Escreva sua observação aqui..."
                className="w-full p-4 bg-white dark:bg-zinc-800 border border-stone-200 dark:border-zinc-700 rounded-2xl focus:ring-2 focus:ring-emerald-500 outline-none text-base h-32 resize-none transition-all shadow-inner"
                rows={5}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Settings Modal */}
      <AnimatePresence>
        {showSettings && (
          <div key="settings-modal" className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowSettings(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative w-full max-w-md bg-white dark:bg-zinc-900 rounded-[2.5rem] shadow-2xl overflow-hidden p-8"
            >
              <h3 className="text-2xl font-black tracking-tighter uppercase mb-6">Configurações de Leitura</h3>
              
              <div className="space-y-6">
                <div>
                  <label className="text-xs font-black text-stone-400 uppercase tracking-widest mb-3 block">Busca nas Escrituras</label>
                  <form onSubmit={(e) => { e.preventDefault(); handleSearch(e); setShowSettings(false); }} className="relative">
                    <input 
                      type="text" 
                      placeholder="Buscar por palavra ou frase..." 
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 bg-stone-100 dark:bg-zinc-800 rounded-2xl border border-transparent focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none transition-all text-sm"
                    />
                    <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
                  </form>
                </div>

                <div>
                  <label className="text-xs font-black text-stone-400 uppercase tracking-widest mb-3 block">Tamanho da Fonte</label>
                  <div className="flex items-center gap-4">
                    <button onClick={() => setFontSize(Math.max(12, fontSize - 2))} className="p-3 bg-stone-100 dark:bg-zinc-800 rounded-xl hover:bg-stone-200 dark:hover:bg-zinc-700 transition-colors"><Type size={16} /></button>
                    <span className="flex-1 text-center font-bold text-lg">{fontSize}px</span>
                    <button onClick={() => setFontSize(Math.min(32, fontSize + 2))} className="p-3 bg-stone-100 dark:bg-zinc-800 rounded-xl hover:bg-stone-200 dark:hover:bg-zinc-700 transition-colors"><Type size={24} /></button>
                  </div>
                </div>

                <div>
                  <label className="text-xs font-black text-stone-400 uppercase tracking-widest mb-3 block">Modo de Exibição</label>
                  <button 
                    onClick={() => { toggleFullscreen(); setShowSettings(false); }}
                    className={cn(
                      "w-full flex items-center justify-between p-4 rounded-2xl border transition-all",
                      isFullscreen 
                        ? "bg-emerald-50 dark:bg-emerald-900/20 border-emerald-500 text-emerald-600" 
                        : "bg-stone-50 dark:bg-zinc-800/50 border-stone-200 dark:border-zinc-700 text-stone-600 dark:text-stone-300"
                    )}
                  >
                    <span className="font-bold">Tela Cheia</span>
                    <Sparkles size={20} className={isFullscreen ? "text-emerald-600" : ""} />
                  </button>
                </div>

                <div>
                  <label className="text-xs font-black text-stone-400 uppercase tracking-widest mb-3 block">Histórico Recente</label>
                  <div className="space-y-2">
                    {history.length > 0 ? history.map((h, idx) => (
                      <button 
                        key={`history-${h.book}-${h.chapter}-${h.version}-${idx}`}
                        onClick={() => {
                          const bookObj = books.find(b => b.name === h.book);
                          if (bookObj) loadChapter(h.version, bookObj.pk, h.chapter);
                          setShowSettings(false);
                        }}
                        className="w-full flex items-center justify-between p-3 bg-stone-50 dark:bg-zinc-800/50 rounded-xl hover:bg-emerald-50 dark:hover:bg-emerald-900/20 transition-colors text-sm"
                      >
                        <span className="font-bold">{h.book} {h.chapter}</span>
                        <span className="text-[10px] text-stone-400 uppercase tracking-widest">{h.version}</span>
                      </button>
                    )) : (
                      <p className="text-xs text-stone-400 italic">Nenhum histórico ainda.</p>
                    )}
                  </div>
                </div>
              </div>

              <button 
                onClick={() => setShowSettings(false)}
                className="w-full mt-8 py-4 bg-stone-900 dark:bg-white text-white dark:text-stone-900 font-bold rounded-2xl"
              >
                Fechar
              </button>
            </motion.div>
          </div>
        )}
        {/* Annotation Menu removed as it is now in header/footer */}
      </AnimatePresence>
    </div>
  );
}
