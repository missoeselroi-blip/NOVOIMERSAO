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
  Layers,
  BookOpen,
  Download,
  BookCheck,
  Book,
  Brain,
  GraduationCap,
  Anchor,
  Pencil
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '../types';
import { bibleService, BibleVersion, BibleBook, BibleVerse, SearchResult } from '../services/bibleService';
import { useAuth } from '../contexts/AuthContext';
import ConfirmationModal from '../components/ConfirmationModal';
import { useBible, AnnotationType } from '../contexts/BibleContext';
import { useToast } from '../components/Toast';
import { useOffline } from '../contexts/OfflineContext';
import { TextToSpeechButton } from '../components/TextToSpeechButton';
import { geminiService } from '../services/geminiService';
import Markdown from 'react-markdown';
import { useNavigate, useLocation } from 'react-router-dom';

import { offlineService } from '../services/offlineService';

interface BiblePageProps {
  isOverlay?: boolean;
  onClose?: () => void;
}

export default function BiblePage({ isOverlay = false, onClose }: BiblePageProps) {
  const { user, addStudy, addPoints } = useAuth();
  const { 
    annotations, 
    generalNotes, 
    setAnnotation, 
    removeAnnotation, 
    toggleFavorite, 
    setGeneralNote, 
    lastState, 
    setLastState 
  } = useBible();
  const { showToast } = useToast();
  const { downloadChapter } = useOffline();
  const navigate = useNavigate();
  const location = useLocation();
  
  // State
  const [versions, setVersions] = useState<BibleVersion[]>([]);
  const [selectedVersion, setSelectedVersion] = useState<string>(lastState?.version || 'NVIPT'); // Default to NVIPT (Portuguese)
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
  const [isCompareModalOpen, setIsCompareModalOpen] = useState(false);
  const [comparePath, setComparePath] = useState('');
  const [commentary, setCommentary] = useState<string | null>(null);
  const [isGeneratingCommentary, setIsGeneratingCommentary] = useState<boolean>(false);
  const [fontSize, setFontSize] = useState<number>(18); // Default to 18px
  const [showSettings, setShowSettings] = useState<boolean>(false);
  const [history, setHistory] = useState<{book: string, chapter: number, version: string}[]>([]);
  const [showAnnotationMenu, setShowAnnotationMenu] = useState(false);
  const [showStudyPanel, setShowStudyPanel] = useState<boolean>(false); // Default to closed
  const [studyPanelType, setStudyPanelType] = useState<'shedd' | 'tutor' | 'notes'>('shedd');
  const [sheddCommentary, setSheddCommentary] = useState<string | null>(null);
  const [isGeneratingShedd, setIsGeneratingShedd] = useState<boolean>(false);
  const [annotationNote, setAnnotationNote] = useState('');
  const [annotationColor, setAnnotationColor] = useState('#fbbf24');
  const [isAutoSaving, setIsAutoSaving] = useState(false);
  const [isEditingCommentary, setIsEditingCommentary] = useState(false);
  const [isEditingGeneralNote, setIsEditingGeneralNote] = useState(false);
  const [generalNoteDraft, setGeneralNoteDraft] = useState('');
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
          'ARA', 'NAA', 'NTLH', 'NVIPT', 'KJA', 'ACF'
        ];
        const filteredVersions = v.filter(ver => requestedVersions.includes(ver.short_name.toUpperCase()));
        setVersions(filteredVersions.length > 0 ? filteredVersions : v);
        
        let defaultVer = lastState?.version || 'ARA';
        let defaultBook = lastState?.book || 1;
        let defaultChapter = lastState?.chapter || 1;

        // Check for offline content or incoming reference from state
        if (location.state?.offlineContent) {
          const offlineData = location.state.offlineContent;
          if (offlineData.verses) {
            setVerses(offlineData.verses);
          } else {
            setVerses(offlineData); // Fallback if it was saved differently
          }
          
          if (location.state.version) setSelectedVersion(location.state.version);
          // Try to set book/chapter from ID if possible
          const parts = location.state.id?.split('-');
          if (parts && parts.length >= 3) {
            setSelectedBook(parseInt(parts[1]));
            setSelectedChapter(parseInt(parts[2]));
          }
          return; // Skip loading from API
        }

        const incomingRef = location.state?.reference;
        if (incomingRef) {
          try {
            // Simple parsing for "Book Chapter:Verse"
            const match = incomingRef.match(/((?:\d\s)?[A-Z][a-zà-ÿ]+)\s(\d+):/);
            if (match) {
              const bookName = match[1];
              const chapterNum = parseInt(match[2]);
              
              const b = await bibleService.getBooks(defaultVer);
              setBooks(b);
              
              const foundBook = b.find(bk => bk.name.toLowerCase().includes(bookName.toLowerCase()));
              if (foundBook) {
                defaultBook = foundBook.pk;
                defaultChapter = chapterNum;
                setSelectedBook(foundBook.pk);
                setSelectedChapter(chapterNum);
              }
            }
          } catch (e) {
            console.error("Error parsing incoming reference:", e);
          }
        }
        
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
    const wasFavorite = annotations[verseId]?.isFavorite;
    await toggleFavorite(verseId, v.text, `${bookName} ${selectedChapter}:${v.verse}`);
    
    if (!wasFavorite) {
      await addPoints(5, 'favorite_verse');
      showToast("Adicionado aos favoritos! ❤️ +5 pontos", "info");
    } else {
      showToast("Removido dos favoritos", "info");
    }
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

  useEffect(() => {
    if (showStudyPanel && selectedBook && selectedChapter) {
      if (studyPanelType === 'shedd') {
        generateSheddCommentary();
      } else if (studyPanelType === 'tutor' && !commentary && !isGeneratingCommentary) {
        generateChapterTutorCommentary();
      }
    }
  }, [selectedBook, selectedChapter, showStudyPanel, studyPanelType]);

  const generateChapterTutorCommentary = async () => {
    setIsGeneratingCommentary(true);
    setCommentary(null);
    setIsEditingCommentary(false);
    
    try {
      const bookName = books.find(b => b.pk === selectedBook)?.name || 'Livro';
      
      const prompt = `Você é um tutor teológico experiente. Forneça uma análise profunda e panorâmica para o seguinte capítulo bíblico:
      LIVRO: ${bookName}
      CAPÍTULO: ${selectedChapter}
      VERSÃO: ${selectedVersion}
      
      A análise deve incluir:
      1. Visão Geral do Capítulo: Tema principal e estrutura.
      2. Contexto Histórico e Geográfico: Onde e quando isso se encaixa na narrativa bíblica.
      3. Pontos Teológicos Chave: Doutrinas ou ensinamentos fundamentais presentes.
      4. Versículos de Destaque: Comentários curtos sobre passagens cruciais do capítulo.
      5. Aplicação Prática: Como este capítulo fala à vida do cristão hoje.
      6. Cristo no Capítulo: Como este texto aponta para Jesus ou para o plano da redenção.
      
      Use uma linguagem clara, inspiradora e rica teologicamente. Formate em Markdown.`;

      const result = await geminiService.generateText(prompt, "Você é um pastor e teólogo bíblico altamente qualificado.");
      setCommentary(result || "Não foi possível gerar a análise do capítulo.");
    } catch (error) {
      console.error("Error generating chapter commentary:", error);
      showToast("Erro ao gerar análise do capítulo com IA.", "error");
    } finally {
      setIsGeneratingCommentary(false);
    }
  };

  useEffect(() => {
    if (showStudyPanel && selectedBook && selectedChapter && studyPanelType === 'notes') {
      const chapterKey = `${selectedVersion}_${selectedBook}_${selectedChapter}`;
      setGeneralNoteDraft(generalNotes[chapterKey] || '');
    }
  }, [selectedVersion, selectedBook, selectedChapter, showStudyPanel, studyPanelType, generalNotes]);

  const handleSaveGeneralNote = async () => {
    const chapterKey = `${selectedVersion}_${selectedBook}_${selectedChapter}`;
    setIsAutoSaving(true);
    await setGeneralNote(chapterKey, generalNoteDraft);
    setIsEditingGeneralNote(false);
    setIsAutoSaving(false);
    showToast("Nota geral salva!", "success");
  };

  const loadChapter = async (version: string, bookId: number, chapter: number) => {
    setIsLoading(true);
    setCommentary(null);
    setSheddCommentary(null);
    setSelectedVerses([]);
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

  const generateCommentary = async (targetVerses?: BibleVerse | BibleVerse[]) => {
    const versesToComent = targetVerses 
      ? (Array.isArray(targetVerses) ? targetVerses : [targetVerses])
      : selectedVerses;

    if (versesToComent.length === 0) return;

    setSelectedVerses(versesToComent);
    setIsGeneratingCommentary(true);
    setCommentary(null);
    setShowStudyPanel(true);
    setStudyPanelType('tutor');
    setIsEditingCommentary(false);
    
    try {
      const bookName = books.find(b => b.pk === selectedBook)?.name || 'Livro';
      const firstVerse = versesToComent[0].verse;
      const lastVerse = versesToComent[versesToComent.length - 1].verse;
      const reference = `${bookName} ${selectedChapter}:${firstVerse}${versesToComent.length > 1 ? `-${lastVerse}` : ''}`;
      const fullText = versesToComent.map(v => `[${v.verse}] ${v.text}`).join('\n');
      
      const prompt = `Você é um tutor teológico experiente. Forneça um comentário bíblico profundo e uma nota de estudo para o seguinte trecho:
      REFERÊNCIA: ${reference} (${selectedVersion})
      TEXTO: 
      ${fullText}
      
      O comentário deve incluir:
      1. Contexto histórico e literário do trecho.
      2. Significado teológico profundo.
      3. Aplicação prática para a vida cristã hoje (contexto, significado e aplicação).
      4. Referências cruzadas interessantes.
      
      Use uma linguagem clara, inspiradora e acadêmica, mas acessível. Formate em Markdown.`;

      const result = await geminiService.generateText(prompt, "Você é um pastor e teólogo bíblico altamente qualificado.");
      setCommentary(result || "Não foi possível gerar o comentário.");
      if (result) {
        await addPoints(5, 'ia_commentary');
        showToast("Comentário gerado! +5 pontos", "success");
      }
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
      await addPoints(5, 'save_study');
      showToast("Estudo salvo com sucesso! +5 pontos", "success");
    } catch (error) {
      console.error("Error saving study:", error);
      showToast("Erro ao salvar estudo.", "error");
    }
  };

  const generateSheddCommentary = async (verse?: BibleVerse) => {
    setIsGeneratingShedd(true);
    setSheddCommentary(null);
    
    try {
      const bookName = books.find(b => b.pk === selectedBook)?.name || 'Livro';
      const reference = verse 
        ? `${bookName} ${selectedChapter}:${verse.verse}` 
        : `${bookName} ${selectedChapter}`;
      
      const prompt = `Você é o Dr. Russell Shedd, um teólogo e editor respeitado. 
      Forneça as notas de estudo da Bíblia de Estudo Shedd para o seguinte texto bíblico:
      Referência: ${reference} (${selectedVersion})
      ${verse ? `Texto do Versículo: "${verse.text}"` : `Contexto: Capítulo ${selectedChapter} de ${bookName}`}
      
      As notas devem refletir fielmente o espírito do comentário de Shedd:
      1. Introdução ao contexto histórico e literário.
      2. Exegese detalhada (comentários palavra por palavra ou frase por frase se necessário).
      3. Notas de rodapé e referências cruzadas que Shedd costuma destacar.
      4. Aplicações práticas ministeriais e espirituais.
      
      Seja teologicamente profundo, acadêmico, porém profundamente pastoral. Formate em Markdown claro.`;

      const result = await geminiService.generateText(prompt, "Você é a voz espiritual e teológica do Dr. Russell Shedd.");
      setSheddCommentary(result || "Não foi possível carregar as notas da Bíblia Shedd.");
    } catch (error) {
      console.error("Error generating Shedd commentary:", error);
      showToast("Erro ao carregar comentários Shedd.", "error");
    } finally {
      setIsGeneratingShedd(false);
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

  const handleDownloadOffline = async () => {
    const bookName = books.find(b => b.pk === selectedBook)?.name || '';
    const id = `bible-${selectedVersion}-${selectedBook}-${selectedChapter}`;
    
    const content = {
      book: bookName,
      chapter: selectedChapter,
      version: selectedVersion,
      verses: verses
    };

    try {
      await downloadChapter({
        id,
        book: bookName,
        chapter: selectedChapter,
        version: selectedVersion,
        content,
        downloadedAt: Date.now()
      });
      showToast(`Capítulo ${selectedChapter} de ${bookName} baixado para acesso offline!`, 'success');
    } catch (error) {
      console.error("Error downloading chapter:", error);
      showToast("Erro ao baixar capítulo.", "error");
    }
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
      <div className="p-3 md:p-6 border-b border-emerald-300 dark:border-emerald-800/50 flex flex-wrap items-center justify-between gap-2 md:gap-4 bg-emerald-100 dark:bg-emerald-900/30 sticky top-0 z-[60]">
        <div className="flex items-center gap-1 md:gap-2">
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
            className="flex items-center gap-1 md:gap-2 p-2 px-2 md:px-3 hover:bg-emerald-100 dark:hover:bg-emerald-800/50 rounded-xl transition-colors text-emerald-700 dark:text-emerald-400 mr-1 md:mr-2"
            title="Sair da Bíblia"
          >
            <X size={20} />
            <span className="text-sm font-medium hidden md:inline">Sair</span>
          </button>
          
          <button 
            onClick={toggleFullscreen}
            className="p-2 hover:bg-emerald-100 dark:hover:bg-emerald-800/50 rounded-xl transition-colors text-emerald-700 dark:text-emerald-400 mr-1 md:mr-2"
            title={isFullscreen ? "Minimizar" : "Maximizar"}
          >
            {isFullscreen ? <Minimize2 className="w-5 h-5 md:w-6 md:h-6" /> : <Maximize2 className="w-5 h-5 md:w-6 md:h-6" />}
          </button>
          
          <button 
            onClick={() => setShowVersionSelector(!showVersionSelector)}
            className="flex items-center px-3 md:px-4 py-2 bg-white dark:bg-zinc-800 rounded-xl border border-emerald-200 dark:border-emerald-800 hover:border-emerald-500 transition-all shadow-sm"
          >
            <span className="text-sm font-bold">{selectedVersion}</span>
          </button>

          <button 
            onClick={() => setShowBookSelector(!showBookSelector)}
            className="flex items-center px-3 md:px-4 py-2 bg-white dark:bg-zinc-800 rounded-xl border border-emerald-200 dark:border-emerald-800 hover:border-emerald-500 transition-all shadow-sm"
          >
            <BookOpen size={18} className="md:hidden text-emerald-600" />
            <span className="text-sm font-bold hidden md:inline">
              {bibleService.getBookAbbreviation(books.find(b => b.pk === selectedBook)?.name || '')}
            </span>
          </button>

          <div className="flex items-center gap-0.5 md:gap-1 ml-1 md:ml-2">
            <button 
              onClick={prevChapter}
              className="p-1.5 md:p-2 hover:bg-emerald-100 dark:hover:bg-emerald-800/50 rounded-lg transition-colors text-emerald-700 dark:text-emerald-400"
              title="Capítulo Anterior"
            >
              <ChevronLeft size={20} />
            </button>
            <button 
              onClick={nextChapter}
              className="p-1.5 md:p-2 hover:bg-emerald-100 dark:hover:bg-emerald-800/50 rounded-lg transition-colors text-emerald-700 dark:text-emerald-400"
              title="Próximo Capítulo"
            >
              <ChevronRight size={20} />
            </button>
            
            <button 
              onClick={handleDownloadOffline}
              className="p-1.5 md:p-2 hover:bg-emerald-100 dark:hover:bg-emerald-800/50 rounded-lg transition-colors text-emerald-700 dark:text-emerald-400 hidden sm:block"
              title="Baixar para Offline"
            >
              <Download size={20} />
            </button>
            
            <div className="w-px h-6 bg-emerald-200 dark:bg-emerald-800 mx-1 md:mx-2 hidden md:block" />
            
            <button 
              onClick={() => setShowSettings(!showSettings)}
              className="p-1.5 md:p-2 hover:bg-emerald-100 dark:hover:bg-emerald-800/50 rounded-xl transition-colors text-emerald-700 dark:text-emerald-400"
              title="Configurações"
            >
              <Settings size={20} />
            </button>

            <button 
              onClick={() => setShowStudyPanel(!showStudyPanel)}
              className={cn(
                "p-1.5 md:p-2 rounded-xl transition-all",
                showStudyPanel 
                  ? "bg-emerald-500 text-white shadow-lg shadow-emerald-500/30" 
                  : "hover:bg-emerald-100 dark:hover:bg-emerald-800/50 text-emerald-700 dark:text-emerald-400"
              )}
              title="Bíblia de Estudo"
            >
              <Anchor size={20} />
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
                  setComparePath(`/study?tab=compare&search=${encodeURIComponent(reference)}`);
                  setIsCompareModalOpen(true);
                }}
                className="p-2 rounded-lg transition-all hover:scale-110 text-indigo-600 dark:text-indigo-400"
                title="Comparar Versões"
              >
                <Layers size={20} />
              </button>
              <div className="w-px h-6 bg-emerald-200 dark:bg-emerald-800 mx-1" />
              <button 
                onClick={() => generateCommentary()}
                className="p-2 bg-emerald-600 text-white rounded-lg transition-all hover:scale-110 shadow-lg shadow-emerald-600/20"
                title="Comentário IA"
              >
                <Anchor size={20} />
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
                        key={`verse-${verseId}-${v.pk}`}
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
                            <Anchor size={14} />
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
                          <TextToSpeechButton 
                            text={v.text}
                            className="p-2 bg-white dark:bg-zinc-800 rounded-lg shadow-sm border border-stone-200 dark:border-zinc-700 text-emerald-600 hover:bg-emerald-50 transition-colors"
                          />
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
          {showStudyPanel && (
            <motion.div 
              key="study-panel"
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              className="w-full md:w-[400px] bg-stone-50 dark:bg-zinc-900 border-l border-emerald-200 dark:border-emerald-800/50 flex flex-col shadow-2xl z-40"
            >
              {/* Sidebar Header / Tabs */}
              <div className="bg-white dark:bg-zinc-950 border-b border-stone-200 dark:border-zinc-800">
                <div className="p-4 flex items-center justify-between border-b border-stone-100 dark:border-zinc-900">
                   <div className="flex items-center gap-2">
                     <Anchor className="text-emerald-600" size={18} />
                     <span className="text-xs font-black uppercase tracking-tighter">Central de Estudo</span>
                   </div>
                   <button 
                     onClick={() => setShowStudyPanel(false)}
                     className="p-1.5 hover:bg-stone-100 dark:hover:bg-zinc-800 rounded-lg transition-colors"
                   >
                     <X size={18} />
                   </button>
                </div>
                <div className="flex">
                  <button 
                    onClick={() => setStudyPanelType('shedd')}
                    className={cn(
                      "flex-1 py-3 text-[10px] font-black uppercase tracking-widest border-b-2 transition-all flex flex-col items-center gap-1",
                      studyPanelType === 'shedd' ? "border-emerald-500 text-emerald-600 bg-emerald-50/50" : "border-transparent text-stone-400"
                    )}
                  >
                    <Book size={14} />
                    Dr. Shedd
                  </button>
                  <button 
                    onClick={() => setStudyPanelType('tutor')}
                    className={cn(
                      "flex-1 py-3 text-[10px] font-black uppercase tracking-widest border-b-2 transition-all flex flex-col items-center gap-1",
                      studyPanelType === 'tutor' ? "border-emerald-500 text-emerald-600 bg-emerald-50/50" : "border-transparent text-stone-400"
                    )}
                  >
                    <Sparkles size={14} />
                    IA Tutor
                  </button>
                  <button 
                    onClick={() => setStudyPanelType('notes')}
                    className={cn(
                      "flex-1 py-3 text-[10px] font-black uppercase tracking-widest border-b-2 transition-all flex flex-col items-center gap-1",
                      studyPanelType === 'notes' ? "border-emerald-500 text-emerald-600 bg-emerald-50/50" : "border-transparent text-stone-400"
                    )}
                  >
                    <StickyNote size={14} />
                    Nota Geral
                  </button>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-6 space-y-6">
                {studyPanelType === 'shedd' && (
                  <div className="space-y-4">
                    <div className="p-5 bg-emerald-600 rounded-3xl text-white shadow-xl shadow-emerald-600/20 relative overflow-hidden group">
                      <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform">
                        <Palette size={80} />
                      </div>
                      <h4 className="text-lg font-black tracking-tighter uppercase mb-1">Bíblia Shedd</h4>
                      <p className="text-[10px] font-bold text-emerald-100 uppercase tracking-widest">Exegese e Espiritualidade</p>
                    </div>

                    {isGeneratingShedd ? (
                      <div className="flex flex-col items-center justify-center py-12 space-y-4">
                        <Loader2 className="animate-spin text-emerald-600" size={32} />
                        <p className="text-[10px] font-black text-stone-400 uppercase tracking-widest animate-pulse">Consultando Notas Shedd...</p>
                      </div>
                    ) : sheddCommentary ? (
                      <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="prose dark:prose-invert prose-emerald prose-sm max-w-none bg-white dark:bg-zinc-950 p-6 rounded-3xl border border-stone-100 dark:border-zinc-800 shadow-sm"
                      >
                        <Markdown>{sheddCommentary}</Markdown>
                      </motion.div>
                    ) : (
                      <div className="text-center py-12 bg-white dark:bg-zinc-950 rounded-3xl border border-dashed border-stone-200 dark:border-zinc-800 p-8">
                        <Info size={40} className="mx-auto text-emerald-200 mb-4" />
                        <p className="text-sm font-medium text-stone-500">As notas de estudo serão carregadas automaticamente para o capítulo atual.</p>
                        <button 
                          onClick={() => generateSheddCommentary()}
                          className="mt-4 px-6 py-2 bg-emerald-100 text-emerald-700 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-emerald-200 transition-all"
                        >
                          Carregar Agora
                        </button>
                      </div>
                    )}
                  </div>
                )}

                {studyPanelType === 'tutor' && (
                  <div className="space-y-4">
                    <div className="flex items-center gap-3 mb-6 p-4 bg-white dark:bg-zinc-950 rounded-2xl border border-stone-100 dark:border-zinc-900">
                      <div className="p-2 bg-purple-100 dark:bg-purple-900/30 text-purple-600 rounded-xl">
                        <Brain size={20} />
                      </div>
                      <div>
                        <h3 className="text-sm font-black tracking-tighter uppercase">Imersão IA</h3>
                        <p className="text-[9px] text-stone-400 uppercase tracking-widest">Tutor de Estudo Profundo</p>
                      </div>
                    </div>

                    {isGeneratingCommentary ? (
                      <div className="flex flex-col items-center justify-center py-12 space-y-4">
                        <Loader2 className="animate-spin text-purple-600" size={32} />
                        <p className="text-[10px] font-black text-stone-400 uppercase tracking-widest animate-pulse">Consultando Sabedoria IA...</p>
                      </div>
                    ) : commentary ? (
                      <motion.div 
                        key={`commentary-${selectedBook}-${selectedChapter}-${commentary.substring(0, 20)}`}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="prose dark:prose-invert prose-sm max-w-none bg-white dark:bg-zinc-950 p-6 rounded-3xl border border-stone-100 dark:border-zinc-800 shadow-sm"
                      >
                        <div className="flex justify-between items-center mb-4 pb-2 border-b border-stone-100 dark:border-zinc-900">
                          <span className="text-[10px] font-black uppercase text-stone-400">Análise do Versículo</span>
                          <button 
                            onClick={() => setIsEditingCommentary(!isEditingCommentary)}
                            className="p-1 px-2 bg-stone-100 dark:bg-zinc-800 rounded-lg text-emerald-600 hover:bg-emerald-50 transition-colors flex items-center gap-1 text-[10px] font-bold"
                          >
                            {isEditingCommentary ? <X size={12} /> : <Pencil size={12} />}
                            {isEditingCommentary ? 'Cancelar' : 'Editar'}
                          </button>
                        </div>

                        {isEditingCommentary ? (
                          <textarea
                            value={commentary}
                            onChange={(e) => setCommentary(e.target.value)}
                            className="w-full h-96 p-4 bg-stone-50 dark:bg-zinc-900 border border-emerald-500/20 rounded-2xl focus:ring-2 focus:ring-emerald-500 outline-none text-xs font-medium resize-none transition-all scrollbar-thin overflow-y-auto mb-4"
                          />
                        ) : (
                          <Markdown>{commentary}</Markdown>
                        )}
                        
                        <button 
                          onClick={async () => {
                            await handleSaveStudy();
                            setIsEditingCommentary(false);
                          }}
                          className="w-full mt-6 py-3 bg-zinc-900 text-white font-bold rounded-xl hover:bg-black transition-all flex items-center justify-center gap-2"
                        >
                          <Bookmark size={18} />
                          Salvar Estudo
                        </button>
                      </motion.div>
                    ) : (
                      <div className="text-center py-12 bg-white dark:bg-zinc-950 rounded-3xl border border-dashed border-stone-200 dark:border-zinc-800 p-8">
                        <Brain size={40} className="mx-auto text-purple-200 mb-4" />
                        <h4 className="text-sm font-black uppercase text-stone-900 dark:text-white mb-2">Análise do Capítulo</h4>
                        <p className="text-xs text-stone-500 mb-6 italic">Inicie uma análise profunda de todo o capítulo {selectedChapter} ou selecione um versículo específico.</p>
                        <button 
                          onClick={() => generateChapterTutorCommentary()}
                          className="px-6 py-2 bg-purple-100 text-purple-700 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-purple-200 transition-all flex items-center gap-2 mx-auto"
                        >
                          <Sparkles size={14} />
                          Analisar Capítulo
                        </button>
                      </div>
                    )}
                  </div>
                )}
                
                {studyPanelType === 'notes' && (
                  <div className="space-y-6">
                    {/* General Chapter Note */}
                    <div className="space-y-3">
                      <div className="flex justify-between items-center px-1">
                        <h3 className="text-xs font-black text-stone-400 uppercase tracking-widest">Nota Geral do Capítulo</h3>
                        <button 
                          onClick={() => {
                            if (isEditingGeneralNote) {
                              handleSaveGeneralNote();
                            } else {
                              setIsEditingGeneralNote(true);
                            }
                          }}
                          className="p-1 px-3 bg-emerald-600 text-white rounded-lg text-[10px] font-bold hover:bg-emerald-700 transition-colors flex items-center gap-1"
                        >
                          {isEditingGeneralNote ? <Bookmark size={12} /> : <Pencil size={12} />}
                          {isEditingGeneralNote ? 'Salvar' : 'Editar'}
                        </button>
                      </div>

                      {isEditingGeneralNote ? (
                        <textarea
                          value={generalNoteDraft}
                          onChange={(e) => setGeneralNoteDraft(e.target.value)}
                          placeholder="Escreva uma reflexão geral sobre este capítulo..."
                          className="w-full h-48 p-4 bg-white dark:bg-zinc-950 border border-emerald-500/30 rounded-2xl focus:ring-2 focus:ring-emerald-500 outline-none text-sm font-medium resize-none transition-all shadow-inner"
                        />
                      ) : (
                        <div className="p-6 bg-emerald-50/50 dark:bg-emerald-900/10 rounded-2xl border border-dashed border-emerald-200 dark:border-emerald-800/50 min-h-[120px] flex flex-col items-center justify-center text-center">
                          {generalNoteDraft ? (
                            <p className="text-sm font-medium text-stone-800 dark:text-zinc-200 whitespace-pre-wrap w-full text-left">{generalNoteDraft}</p>
                          ) : (
                            <>
                              <StickyNote size={32} className="text-emerald-300 mb-3" />
                              <p className="text-xs text-stone-400 mb-4 italic">Registre aqui suas reflexões gerais sobre este capítulo.</p>
                              <button 
                                onClick={() => setIsEditingGeneralNote(true)}
                                className="px-4 py-2 bg-emerald-100 text-emerald-700 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-emerald-200 transition-all font-sans"
                              >
                                Criar Nota Geral
                              </button>
                            </>
                          )}
                        </div>
                      )}
                    </div>

                    <div className="h-px bg-stone-100 dark:bg-zinc-800 my-2" />

                    <div className="space-y-4">
                      <h3 className="text-xs font-black text-stone-400 uppercase tracking-widest px-1">Notas por Versículo</h3>
                      {Object.keys(annotations).filter(id => annotations[id].note && id.includes(`${selectedVersion}_${selectedBook}_${selectedChapter}`)).length > 0 ? (
                        Object.keys(annotations)
                          .filter(id => annotations[id].note && id.includes(`${selectedVersion}_${selectedBook}_${selectedChapter}`))
                          .map(id => {
                            const [v, b, c, vr] = id.split('_');
                            return (
                              <div key={`note-item-${id}`} className="p-4 bg-white dark:bg-zinc-950 rounded-2xl border border-stone-100 dark:border-zinc-800 shadow-sm space-y-2 group">
                                 <div className="flex justify-between items-center">
                                   <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">
                                     {books.find(bk => bk.pk === parseInt(b))?.name} {c}:{vr}
                                   </span>
                                   <button onClick={() => removeAnnotation(id)} className="text-stone-300 hover:text-red-500 transition-colors">
                                     <Trash2 size={12} />
                                   </button>
                                 </div>
                                 <p className="text-xs font-medium text-stone-800 dark:text-zinc-200">{annotations[id].note}</p>
                              </div>
                            );
                          })
                      ) : (
                        <div className="text-center py-8 opacity-50 bg-stone-50 dark:bg-zinc-900/50 rounded-2xl border border-stone-100 dark:border-zinc-800">
                          <StickyNote size={32} className="mx-auto text-stone-300 mb-2" />
                          <p className="text-xs">Clique em um versículo na bíblia para adicionar uma nota individual.</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}
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
            key="footer-note-area"
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            className="border-t border-stone-200 dark:border-zinc-800 bg-stone-50 dark:bg-zinc-900 p-4 sticky bottom-0 z-50 shadow-2xl"
          >
            <div className="max-w-4xl mx-auto flex flex-col gap-3">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                <div className="flex items-center gap-2 text-[10px] font-black text-stone-400 uppercase tracking-widest shrink-0">
                  <StickyNote size={14} /> 
                  {`Observação: ${books.find(b => b.pk === selectedBook)?.name} ${selectedChapter}:${selectedVerses[0].verse}${selectedVerses.length > 1 ? `-${selectedVerses[selectedVerses.length - 1].verse}` : ''}`}
                </div>
                <div className="flex items-center justify-between md:justify-end gap-2 md:gap-4 w-full md:w-auto">
                  <button
                    onClick={() => setSelectedVerses([])}
                    className="flex items-center gap-1 text-[10px] font-black text-red-500 uppercase tracking-widest hover:text-red-600 transition-colors shrink-0"
                  >
                    <X size={12} />
                    Limpar
                  </button>
                  <div className="flex gap-1 overflow-x-auto pb-1 flex-1 min-w-0 md:flex-none">
                    {colors.map(color => (
                      <button
                        key={color}
                        onClick={() => setAnnotationColor(color)}
                        className={cn(
                          "w-5 h-5 rounded-full border transition-all shrink-0",
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
                    className="px-3 md:px-4 py-1.5 bg-emerald-600 text-white text-xs font-bold rounded-lg hover:bg-emerald-700 transition-colors shadow-sm shrink-0 whitespace-nowrap"
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
                  <form onSubmit={(e) => { e.preventDefault(); handleSearch(e); setShowSettings(false); }} className="relative flex gap-2">
                    <input 
                      type="text" 
                      placeholder="Buscar por palavra ou frase..." 
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 bg-stone-100 dark:bg-zinc-800 rounded-2xl border border-transparent focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none transition-all text-sm"
                    />
                    <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
                    <button type="submit" className="px-4 py-3 bg-emerald-600 text-white rounded-2xl font-bold text-sm">Buscar</button>
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
      <ConfirmationModal
        isOpen={isCompareModalOpen}
        onClose={() => setIsCompareModalOpen(false)}
        onConfirm={() => navigate(comparePath)}
        title="Comparar Versículo"
        message="Deseja comparar este versículo em outra página?"
      />
    </div>
  );
}
