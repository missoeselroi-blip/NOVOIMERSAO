import React, { useState, useRef, useEffect } from 'react';
import { 
  Volume2, 
  Play, 
  Pause, 
  Search, 
  ChevronRight, 
  ChevronLeft,
  Loader2,
  Book,
  BookOpen,
  ArrowLeft,
  X,
  Plus,
  Info,
  ExternalLink,
  RotateCcw,
  SkipForward,
  SkipBack,
  Clock
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '../types';
import { useToast } from '../components/Toast';
import { bibleService } from '../services/bibleService';
import { geminiService } from '../services/geminiService';
import { storage } from '../lib/firebase';
import { ref, getDownloadURL } from 'firebase/storage';

interface AudioBibleBook {
  pk: number;
  name: string;
  chapters: number;
  testament: 'VT' | 'NT';
}

const VT_BOOKS = [
  { pk: 1, name: "Gênesis", chapters: 50 },
  { pk: 2, name: "Êxodo", chapters: 40 },
  { pk: 3, name: "Levítico", chapters: 27 },
  { pk: 4, name: "Números", chapters: 36 },
  { pk: 5, name: "Deuteronômio", chapters: 34 },
  { pk: 6, name: "Josué", chapters: 24 },
  { pk: 7, name: "Juízes", chapters: 21 },
  { pk: 8, name: "Rute", chapters: 4 },
  { pk: 9, name: "1 Samuel", chapters: 31 },
  { pk: 10, name: "2 Samuel", chapters: 24 },
  { pk: 11, name: "1 Reis", chapters: 22 },
  { pk: 12, name: "2 Reis", chapters: 25 },
  { pk: 13, name: "1 Crônicas", chapters: 29 },
  { pk: 14, name: "2 Crônicas", chapters: 36 },
  { pk: 15, name: "Esdras", chapters: 10 },
  { pk: 16, name: "Neemias", chapters: 13 },
  { pk: 17, name: "Ester", chapters: 10 },
  { pk: 18, name: "Jó", chapters: 42 },
  { pk: 19, name: "Salmos", chapters: 150 },
  { pk: 20, name: "Provérbios", chapters: 31 },
  { pk: 21, name: "Eclesiastes", chapters: 12 },
  { pk: 22, name: "Cânticos", chapters: 8 },
  { pk: 23, name: "Isaías", chapters: 66 },
  { pk: 24, name: "Jeremias", chapters: 52 },
  { pk: 25, name: "Lamentações", chapters: 5 },
  { pk: 26, name: "Ezequiel", chapters: 48 },
  { pk: 27, name: "Daniel", chapters: 12 },
  { pk: 28, name: "Oseias", chapters: 14 },
  { pk: 29, name: "Joel", chapters: 3 },
  { pk: 30, name: "Amós", chapters: 9 },
  { pk: 31, name: "Obadias", chapters: 1 },
  { pk: 32, name: "Jonas", chapters: 4 },
  { pk: 33, name: "Miqueias", chapters: 7 },
  { pk: 34, name: "Naum", chapters: 3 },
  { pk: 35, name: "Habacuque", chapters: 3 },
  { pk: 36, name: "Sofonias", chapters: 3 },
  { pk: 37, name: "Ageu", chapters: 2 },
  { pk: 38, name: "Zacarias", chapters: 14 },
  { pk: 39, name: "Malaquias", chapters: 4 }
].map(b => ({ ...b, testament: 'VT' as const }));

const NT_BOOKS = [
  { pk: 40, name: "Mateus", chapters: 28 },
  { pk: 41, name: "Marcos", chapters: 16 },
  { pk: 42, name: "Lucas", chapters: 24 },
  { pk: 43, name: "João", chapters: 21 },
  { pk: 44, name: "Atos", chapters: 28 },
  { pk: 45, name: "Romanos", chapters: 16 },
  { pk: 46, name: "1 Coríntios", chapters: 16 },
  { pk: 47, name: "2 Coríntios", chapters: 13 },
  { pk: 48, name: "Gálatas", chapters: 6 },
  { pk: 49, name: "Efésios", chapters: 6 },
  { pk: 50, name: "Filipenses", chapters: 4 },
  { pk: 51, name: "Colossenses", chapters: 4 },
  { pk: 52, name: "1 Tessalonicenses", chapters: 5 },
  { pk: 53, name: "2 Tessalonicenses", chapters: 3 },
  { pk: 54, name: "1 Timóteo", chapters: 6 },
  { pk: 55, name: "2 Timóteo", chapters: 4 },
  { pk: 56, name: "Tito", chapters: 3 },
  { pk: 57, name: "Filemom", chapters: 1 },
  { pk: 58, name: "Hebreus", chapters: 13 },
  { pk: 59, name: "Tiago", chapters: 5 },
  { pk: 60, name: "1 Pedro", chapters: 5 },
  { pk: 61, name: "2 Pedro", chapters: 3 },
  { pk: 62, name: "1 João", chapters: 5 },
  { pk: 63, name: "2 João", chapters: 1 },
  { pk: 64, name: "3 João", chapters: 1 },
  { pk: 65, name: "Judas", chapters: 1 },
  { pk: 66, name: "Apocalipse", chapters: 22 }
].map(b => ({ ...b, testament: 'NT' as const }));

const ALL_BOOKS: AudioBibleBook[] = [...VT_BOOKS, ...NT_BOOKS];

const BOOK_SLUGS: { [key: number]: string } = {
  1: "Genesis",
  2: "Exodo",
  3: "Levitico",
  4: "Numeros",
  5: "Deuteronomio",
  6: "Josue",
  7: "Juizes",
  8: "Rute",
  9: "1Samuel",
  10: "2Samuel",
  11: "1Reis",
  12: "2Reis",
  13: "1Cronicas",
  14: "2Cronicas",
  15: "Esdras",
  16: "Neemias",
  17: "Ester",
  18: "Jo",
  19: "Salmos",
  20: "Proverbios",
  21: "Eclesiastes",
  22: "Canticos",
  23: "Isaias",
  24: "Jeremias",
  25: "Lamentacoes",
  26: "Ezequiel",
  27: "Daniel",
  28: "Oseas",
  29: "Joel",
  30: "Amos",
  31: "Obadias",
  32: "Jonas",
  33: "Miqueas",
  34: "Naum",
  35: "Habacuc",
  36: "Sofonias",
  37: "Ageu",
  38: "Zacarias",
  39: "Malaquias",
  40: "S_Mateus",
  41: "S_Marcos",
  42: "S_Lucas",
  43: "S_Joao",
  44: "Atos",
  45: "Romanos",
  46: "1Corintios",
  47: "2Corintios",
  48: "Galatas",
  49: "Efesios",
  50: "Filipenses",
  51: "Colossenses",
  52: "1Tess",
  53: "2Tess",
  54: "1Timoteo",
  55: "2Timoteo",
  56: "Tito",
  57: "Filemon",
  58: "Hebreus",
  59: "S_Tiago",
  60: "1Pedro",
  61: "2Pedro",
  62: "1S_Joao",
  63: "2S_Joao",
  64: "3S_Joao",
  65: "S_Judas",
  66: "Apocalipse"
};

export default function SpokenBiblePage() {
  const { showToast } = useToast();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBook, setSelectedBook] = useState<AudioBibleBook | null>(null);
  const [selectedChapter, setSelectedChapter] = useState<number | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [showConfigInfo, setShowConfigInfo] = useState(false);
  const [testamentFilter, setTestamentFilter] = useState<'all' | 'VT' | 'NT'>('all');
  
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isGeneratingAI, setIsGeneratingAI] = useState(false);
  const [useAIFallback, setUseAIFallback] = useState(false);

  const filteredBooks = ALL_BOOKS.filter(book => {
    const matchesSearch = book.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesTestament = testamentFilter === 'all' || book.testament === testamentFilter;
    return matchesSearch && matchesTestament;
  });

  useEffect(() => {
    if (selectedBook && selectedChapter) {
      const fetchAudioUrl = async () => {
        const isVT = selectedBook.testament === 'VT';
        const prefix = isVT ? 'A' : 'B';
        const bookIndex = isVT ? selectedBook.pk : selectedBook.pk - 39;
        const formattedBookIndex = bookIndex.toString().padStart(2, '0');
        const formattedChapter = selectedChapter.toString().padStart(2, '0');
        
        // Get slug and pad with underscores to 12 characters
        const slug = BOOK_SLUGS[selectedBook.pk] || selectedBook.name;
        const paddedSlug = slug.normalize('NFD').replace(/[\u0300-\u036f]/g, "").replace(/\s/g, "").padEnd(12, '_');
        
        // Suffix depends on testament section
        const suffix = isVT ? 'PO1NLHO1DA' : 'PO1NLHN1DA';
        
        const filename = `${prefix}${formattedBookIndex}___${formattedChapter}_${paddedSlug}${suffix}.mp3`;
        
        // Try paths
        const paths = [
            `audio/${filename}`,
            `public/audio/${filename}`,
            `Portuguese_por_NLH_OT_Non-Drama/${filename}`,
            `Portuguese_por_NLH_NT_Non-Drama/${filename}`,
            `public/Portuguese_por_NLH_OT_Non-Drama/${filename}`,
            `public/Portuguese_por_NLH_NT_Non-Drama/${filename}`,
            `${filename}`
        ];
        
        console.log("Tentando carregar arquivo:", filename);
        console.log("Caminhos tentados:", paths);
        
        for (const path of paths) {
            try {
                const storageRef = ref(storage, path);
                const url = await getDownloadURL(storageRef);
                setAudioUrl(url);
                console.log("Arquivo carregado com sucesso:", url);
                return;
            } catch (e) {
                console.warn(`Falha ao carregar ${path}:`, e);
            }
        }
        
        setAudioUrl(null);
        showToast("Áudio não encontrado no Firebase Storage.", "error");
      };
      
      fetchAudioUrl();
    } else {
      setAudioUrl(null);
    }
  }, [selectedBook, selectedChapter]);

  const handleAIGenerate = async () => {
    if (!selectedBook || !selectedChapter) return;
    
    setIsGeneratingAI(true);
    showToast("Gerando Narração por IA... Por favor, aguarde alguns segundos.", "info");
    
    try {
      // Fetch the chapter text
      const versesData = await bibleService.getChapter('ara', selectedBook.pk, selectedChapter);
      const fullText = versesData.map(v => `${v.verse}. ${v.text}`).join(' ');
      
      const audioUrl = await geminiService.generateSpeech(
        `Capítulo ${selectedChapter} de ${selectedBook.name}. ${fullText}`,
        'Kore',
        'calm'
      );
      
      if (audioUrl) {
        setUseAIFallback(true);
        if (audioRef.current) {
          audioRef.current.src = audioUrl;
          audioRef.current.play();
          setIsPlaying(true);
          showToast("Narração por IA carregada com sucesso!", "success");
        }
      }
    } catch (error) {
      console.error("AI Narration error:", error);
      showToast("Erro ao gerar narração por IA.", "error");
    } finally {
      setIsGeneratingAI(false);
    }
  };

  useEffect(() => {
    setUseAIFallback(false);
    if (audioRef.current && audioUrl) {
      audioRef.current.src = audioUrl;
      console.log("Setting audio source to:", audioUrl);
      if (isPlaying) {
        audioRef.current.play().catch((err) => {
          console.error("Error playing audio after setting src:", err);
        });
      }
    }
  }, [audioUrl]);

  const handlePlayPause = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play().catch((err) => {
        console.warn("Local file not found, offering AI fallback:", err);
        showToast("Áudio local não encontrado. Você pode usar a Narração por IA abaixo.", "info");
      });
    }
    setIsPlaying(!isPlaying);
  };

  const handleSkip = (seconds: number) => {
    if (!audioRef.current) return;
    audioRef.current.currentTime += seconds;
  };

  const formatTime = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = Math.floor(seconds % 60);
    return `${h > 0 ? `${h}:` : ''}${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="min-h-screen pb-32 pt-6">
      <div className="max-w-6xl mx-auto px-4">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <button 
                onClick={() => {
                  if (selectedBook) setSelectedBook(null);
                  else window.history.back();
                }}
                className="p-2 hover:bg-stone-100 dark:hover:bg-zinc-800 rounded-full transition-colors"
              >
                <ArrowLeft size={20} />
              </button>
              <h1 className="text-3xl font-black text-stone-900 dark:text-white tracking-tighter uppercase flex items-center gap-3">
                <div className="p-2 bg-amber-600 text-white rounded-xl">
                  <Volume2 size={24} />
                </div>
                Bíblia Falada
              </h1>
            </div>
            <p className="text-stone-500 dark:text-zinc-400 font-medium">
              Ouça a Palavra de Deus em qualquer lugar.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button 
              onClick={() => setShowConfigInfo(true)}
              className="flex items-center gap-2 px-4 py-2 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-xl text-xs font-bold border border-blue-100 dark:border-blue-800"
            >
              <Info size={16} />
              Como anexar áudios?
            </button>
          </div>
        </div>

        {!selectedBook ? (
          <div className="space-y-8">
            {/* Search & Filters */}
            <div className="flex flex-col md:flex-row gap-4">
              <div className="relative flex-1 group">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400 group-focus-within:text-amber-600 transition-colors" size={20} />
                <input 
                  type="text"
                  placeholder="Pesquisar livro..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-12 pr-4 py-4 bg-white dark:bg-zinc-900 border border-stone-200 dark:border-zinc-800 rounded-2xl focus:ring-2 focus:ring-amber-500 outline-none transition-all shadow-sm"
                />
              </div>
              <div className="flex bg-stone-100 dark:bg-zinc-800 p-1 rounded-2xl border border-stone-200 dark:border-zinc-700">
                <button 
                  onClick={() => setTestamentFilter('all')}
                  className={cn("px-6 py-2 rounded-xl text-xs font-bold transition-all", testamentFilter === 'all' ? "bg-white dark:bg-zinc-700 text-amber-600 shadow-sm" : "text-stone-500")}
                >
                  Todos
                </button>
                <button 
                  onClick={() => setTestamentFilter('VT')}
                  className={cn("px-6 py-2 rounded-xl text-xs font-bold transition-all", testamentFilter === 'VT' ? "bg-white dark:bg-zinc-700 text-amber-600 shadow-sm" : "text-stone-500")}
                >
                  VT
                </button>
                <button 
                  onClick={() => setTestamentFilter('NT')}
                  className={cn("px-6 py-2 rounded-xl text-xs font-bold transition-all", testamentFilter === 'NT' ? "bg-white dark:bg-zinc-700 text-amber-600 shadow-sm" : "text-stone-500")}
                >
                  NT
                </button>
              </div>
            </div>

            {/* Books Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {filteredBooks.map((book) => (
                <motion.button
                  key={book.pk}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setSelectedBook(book)}
                  className="p-6 bg-white dark:bg-zinc-900 rounded-[2rem] border border-stone-200 dark:border-zinc-800 shadow-sm hover:shadow-md hover:border-amber-200 dark:hover:border-amber-900 transition-all text-center flex flex-col items-center gap-3 group"
                >
                  <div className={cn(
                    "p-3 rounded-2xl transition-colors",
                    book.testament === 'VT' ? "bg-stone-100 dark:bg-zinc-800 text-stone-500 group-hover:bg-amber-100" : "bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 group-hover:bg-emerald-100"
                  )}>
                    <BookOpen size={24} />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-stone-900 dark:text-white line-clamp-1">{book.name}</h3>
                    <p className="text-[10px] text-stone-400 uppercase tracking-widest font-black mt-1">{book.chapters} cap</p>
                  </div>
                </motion.button>
              ))}
            </div>
          </div>
        ) : (
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-8"
          >
            {/* Chapters View */}
            <div className="bg-white dark:bg-zinc-900 rounded-[2.5rem] border border-stone-200 dark:border-zinc-800 p-8 shadow-sm">
              <div className="flex items-center gap-4 mb-8">
                <div className={cn(
                  "p-4 rounded-[1.5rem]",
                  selectedBook.testament === 'VT' ? "bg-stone-100 text-stone-500" : "bg-emerald-100 text-emerald-600"
                )}>
                  <BookOpen size={32} />
                </div>
                <div>
                  <h2 className="text-2xl font-black text-stone-900 dark:text-white uppercase tracking-tight">{selectedBook.name}</h2>
                  <p className="text-xs text-stone-400 uppercase tracking-[0.2em] font-bold">
                    {selectedBook.testament === 'VT' ? 'Velho Testamento' : 'Novo Testamento'} • {selectedBook.chapters} Capítulos
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10 gap-3">
                {Array.from({ length: selectedBook.chapters }, (_, i) => i + 1).map((chapter) => (
                  <button
                    key={`chapter-${chapter}`}
                    onClick={() => {
                      setSelectedChapter(chapter);
                      setIsPlaying(true);
                      setProgress(0);
                    }}
                    className={cn(
                      "aspect-square rounded-2xl font-bold flex items-center justify-center transition-all border",
                      selectedChapter === chapter 
                        ? "bg-amber-600 text-white border-amber-600 shadow-lg shadow-amber-600/20" 
                        : "bg-stone-50 dark:bg-zinc-800 text-stone-600 dark:text-zinc-400 border-transparent hover:border-amber-200"
                    )}
                  >
                    {chapter}
                  </button>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {/* Floating Instructions Modal */}
        <AnimatePresence>
          {showConfigInfo && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
              <motion.div 
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                className="bg-white dark:bg-zinc-900 w-full max-w-lg rounded-[2.5rem] shadow-2xl overflow-hidden"
              >
                <div className="p-6 border-b border-stone-100 dark:border-zinc-800 flex justify-between items-center">
                  <h3 className="text-xl font-bold">Instruções de Configuração</h3>
                  <button 
                    onClick={() => setShowConfigInfo(false)}
                    className="p-2 hover:bg-stone-100 dark:hover:bg-zinc-800 rounded-full transition-colors"
                  >
                    <X size={20} />
                  </button>
                </div>
                <div className="p-8 space-y-6">
                  <p className="text-stone-600 dark:text-zinc-400 text-sm leading-relaxed">
                    Para que seus áudios funcionem, você deve colocá-los nas seguintes pastas na raiz do seu projeto:
                  </p>
                  
                  <div className="bg-stone-50 dark:bg-zinc-800 p-6 rounded-2xl space-y-2 font-mono text-[10px]">
                    <p className="text-emerald-600">public/</p>
                    <p className="pl-4 text-blue-600">audio/</p>
                    <p className="pl-8 text-stone-500">A01___01_Genesis_____PO1NLHO1DA.mp3</p>
                    <p className="pl-8 text-stone-500">B01___01_S_Mateus____PO1NLHN1DA.mp3</p>
                  </div>

                  <div className="p-4 bg-amber-50 dark:bg-amber-900/10 border border-amber-100 dark:border-amber-800/30 rounded-xl flex items-start gap-3">
                    <Info size={20} className="text-amber-600 shrink-0 mt-0.5" />
                    <p className="text-xs text-amber-700 dark:text-amber-400 leading-relaxed font-medium">
                      O sistema reconhece automaticamente os arquivos seguindo o padrão de nomenclatura da coleção Non-Drama.
                    </p>
                  </div>

                  <button 
                    onClick={() => setShowConfigInfo(false)}
                    className="w-full py-4 bg-stone-900 dark:bg-white text-white dark:text-zinc-900 rounded-2xl font-bold hover:opacity-90 transition-all shadow-xl"
                  >
                    Entendi, fechar
                  </button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </div>

      {/* Persistent Audio Player */}
      <AnimatePresence>
        {selectedChapter && selectedBook && (
          <motion.div
            initial={{ y: 200, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 200, opacity: 0 }}
            className="fixed bottom-20 md:bottom-6 left-4 right-4 md:left-1/2 md:-translate-x-1/2 md:max-w-2xl z-50"
          >
            <div className="bg-stone-900 dark:bg-zinc-950 text-white rounded-[2.5rem] p-6 shadow-[0_20px_50px_rgba(0,0,0,0.5)] border border-white/10 backdrop-blur-xl">
              <div className="space-y-6">
                {/* Info & Close */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-amber-600 flex items-center justify-center text-white shadow-lg shadow-amber-600/20">
                      <Volume2 size={24} />
                    </div>
                    <div>
                      <h4 className="font-bold text-lg">{selectedBook.name}</h4>
                      <p className="text-xs text-stone-400 uppercase tracking-widest font-black">Capítulo {selectedChapter}</p>
                    </div>
                  </div>
                  <button 
                    onClick={() => {
                      setSelectedChapter(null);
                      setIsPlaying(false);
                      if (audioRef.current) audioRef.current.pause();
                    }}
                    className="p-3 hover:bg-white/10 rounded-full transition-colors"
                  >
                    <X size={24} />
                  </button>
                </div>

                {/* Progress Bar */}
                <div className="space-y-2">
                  <div className="relative h-2 bg-white/10 rounded-full overflow-hidden group cursor-pointer">
                    <motion.div 
                      className="absolute inset-y-0 left-0 bg-amber-500 shadow-[0_0_10px_rgba(245,158,11,0.5)]"
                      style={{ width: `${(progress / (duration || 1)) * 100}%` }}
                    />
                    <input 
                      type="range"
                      min="0"
                      max={duration || 0}
                      step="0.1"
                      value={progress}
                      onChange={(e) => {
                        const val = parseFloat(e.target.value);
                        setProgress(val);
                        if (audioRef.current) audioRef.current.currentTime = val;
                      }}
                      className="absolute inset-0 opacity-0 cursor-pointer z-10"
                    />
                  </div>
                  <div className="flex justify-between text-[10px] font-mono text-stone-400 font-bold uppercase tracking-widest">
                    <span>{formatTime(progress)}</span>
                    <span>{formatTime(duration)}</span>
                  </div>
                </div>

                {/* Controls */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <button 
                      onClick={() => {
                        const rates = [1, 1.25, 1.5, 2, 0.75];
                        const nextIndex = (rates.indexOf(playbackRate) + 1) % rates.length;
                        const nextRate = rates[nextIndex];
                        setPlaybackRate(nextRate);
                        if (audioRef.current) audioRef.current.playbackRate = nextRate;
                      }}
                      className="px-3 py-1.5 bg-white/5 hover:bg-white/10 rounded-lg text-[10px] font-bold transition-colors"
                      title="Velocidade"
                    >
                      {playbackRate}x
                    </button>

                    <button 
                      onClick={handleAIGenerate}
                      disabled={isGeneratingAI}
                      className={cn(
                        "flex items-center gap-2 px-4 py-1.5 rounded-lg text-[10px] font-bold transition-all shadow-lg",
                        useAIFallback 
                          ? "bg-emerald-600/20 text-emerald-400 border border-emerald-500/30" 
                          : "bg-amber-600 hover:bg-amber-700 text-white shadow-amber-600/20"
                      )}
                      title="Gerar narração com Inteligência Artificial"
                    >
                      {isGeneratingAI ? (
                        <>
                          <Loader2 size={12} className="animate-spin" />
                          GERANDO...
                        </>
                      ) : (
                        <>
                          <div className={cn("w-1.5 h-1.5 rounded-full animate-pulse", useAIFallback ? "bg-emerald-400" : "bg-white")} />
                          {useAIFallback ? "NARRAÇÃO IA ATIVA" : "NARRAÇÃO IA"}
                        </>
                      )}
                    </button>
                  </div>

                  <div className="flex items-center gap-6">
                    <button 
                      onClick={() => handleSkip(-15)}
                      className="p-3 text-stone-400 hover:text-white transition-colors"
                      title="Voltar 15s"
                    >
                      <SkipBack size={24} />
                    </button>
                    
                    <button 
                      onClick={handlePlayPause}
                      className="w-20 h-20 flex items-center justify-center bg-white text-stone-900 rounded-[2rem] hover:scale-105 transition-all shadow-xl shadow-white/10 active:scale-95"
                    >
                      {isPlaying ? <Pause size={32} /> : <Play size={32} className="ml-1" />}
                    </button>

                    <button 
                      onClick={() => handleSkip(15)}
                      className="p-3 text-stone-400 hover:text-white transition-colors"
                      title="Avançar 15s"
                    >
                      <SkipForward size={24} />
                    </button>
                  </div>

                  <div className="flex items-center gap-4">
                    <button 
                      onClick={() => {
                        if (audioRef.current) audioRef.current.currentTime = 0;
                      }}
                      className="p-3 text-stone-400 hover:text-white transition-colors"
                      title="Recomeçar"
                    >
                      <RotateCcw size={20} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <audio
        ref={audioRef}
        onTimeUpdate={(e) => setProgress(e.currentTarget.currentTime)}
        onLoadedMetadata={(e) => setDuration(e.currentTarget.duration)}
        onEnded={() => {
          setIsPlaying(false);
          // Auto-play next chapter functionality could be added here
        }}
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
      />
    </div>
  );
}
