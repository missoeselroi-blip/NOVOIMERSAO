import React, { useState, useRef, useEffect, useMemo } from 'react';
import { 
  useNavigate,
  useSearchParams,
  useLocation
} from 'react-router-dom';
import { 
  Search, 
  Book, 
  Layers, 
  HelpCircle, 
  ArrowLeft,
  Map as MapIcon, 
  MessageSquare, 
  MessageCircle,
  Sparkles,
  ChevronRight,
  ChevronLeft,
  ChevronDown,
  ChevronUp,
  Loader2,
  FileText,
  Download,
  Share2,
  Heart,
  StickyNote,
  Edit,
  Check,
  X as CloseIcon,
  Globe,
  Plus,
  Trash2,
  Save,
  Copy,
  Volume2,
  Pencil,
  Quote,
  ExternalLink,
  Image as ImageIcon,
  Library,
  GraduationCap,
  Layout,
  Cross,
  User,
  Users,
  Brain,
  Zap,
  Trophy,
  Printer,
  CheckCircle,
  BookOpen,
  History,
  Baby,
  Theater,
  X,
  Video,
  Mic,
  Mic2,
  Music,
  Play,
  Coins
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShareButtons } from '../components/ShareButtons';
import { MarkdownRenderer } from '../components/MarkdownRenderer';
import { AudioSearchButton } from '../components/AudioSearchButton';
import { GoogleGenAI, Type, ThinkingLevel } from "@google/genai";
import { geminiService } from '../services/geminiService';
import { cn } from '../types';
import { AudioConfirmationModal } from '../components/AudioConfirmationModal';
import { useAccessibility } from '../contexts/AccessibilityContext';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import html2pdf from 'html2pdf.js';
import { GOSPEL_AUTHORS } from '../constants/authors';
import { useCredits } from '../contexts/CreditContext';

import { useToast } from '../components/Toast';
import PostsPage from './PostsPage';
import { useOffline } from '../contexts/OfflineContext';
import { useAudioBox } from '../contexts/AudioBoxContext';
import { SaveToNotebookModal } from '../components/SaveToNotebookModal';
import { WifiOff } from 'lucide-react';
import { getRandomWaitingMessage } from '../constants/waitingMessages';
import { useAuth } from '../contexts/AuthContext';
import { compressImage } from '../utils/imageUtils';
import { auth, db } from '../lib/firebase';
import { offlineService } from '../services/offlineService';
import { collection, addDoc, doc, updateDoc, deleteDoc, query, where, onSnapshot, serverTimestamp } from 'firebase/firestore';
import { copyToClipboard } from '../utils/clipboard';
import { sermonOutlines } from '../constants/sermonOutlines';

enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

import { FeedbackSection } from '../components/FeedbackSection';
import { SpeechGenerator } from '../components/SpeechGenerator';
import { CreditInfoTip } from '../components/CreditInfoTip';
import { CreditCostBadge } from '../components/CreditCostBadge';

const handleFirestoreError = (error: unknown, operationType: OperationType, path: string | null) => {
  const errorMessage = error instanceof Error ? error.message : String(error);
  const isSuspendedError = errorMessage.includes('permission-denied') || errorMessage.includes('api-key') || errorMessage.includes('suspended');
  const isOfflineError = errorMessage.includes('offline') || errorMessage.includes('unavailable');

  const errInfo = {
    error: errorMessage,
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
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
    path,
    possibleCause: isSuspendedError ? 'PROJETO_RESTRITO' : (isOfflineError ? 'ERRO_DE_CONECTIVIDADE' : 'OPERACAO_FALHOU')
  };

  console.error('Firestore Error Detailed:', JSON.stringify(errInfo, null, 2));

  throw new Error(JSON.stringify(errInfo));
};

import { useShare } from '../utils/share';
import GeneratedQuizPlayer, { QuizQuestion } from '../components/GeneratedQuizPlayer';

interface BibleStudyPageProps {
  deepThinking: boolean;
  setDeepThinking?: (value: boolean) => void;
  onNavigate?: (tab: string, state?: any) => void;
}

interface StudyHistoryItem {
  id: string;
  type: string;
  query: string;
  result: string;
  thought?: string;
  date: string;
  tab: string;
  creationType?: string;
}

import { SearchLoadingOverlay } from '../components/SearchLoadingOverlay';

const ExpandableMarkdown = ({ content, title, onSearch }: { content: string, title?: string, onSearch?: (q: string) => void }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const { showToast } = useToast();
  const { downloadMaterial } = useOffline();
  
  if (!content) return null;

  const handleDownloadOffline = async () => {
    if (!content) return;
    
    const id = `study-${Date.now()}`;
    try {
      await downloadMaterial({
        id,
        type: 'study',
        title: title || 'Estudo Bíblico',
        content: content,
        downloadedAt: Date.now()
      });
      showToast("Estudo baixado para acesso offline! 📱✨", "success");
    } catch (error) {
      console.error("Error downloading study:", error);
      showToast("Erro ao baixar estudo.", "error");
    }
  };

  const handleDownloadPDF = () => {
    const element = document.createElement('div');
    element.className = 'p-8 bg-white text-black font-serif';
    
    // Basic Markdown to HTML conversion for the PDF
    const htmlContent = content
      .replace(/^# (.*$)/gm, '<h1 class="text-3xl font-bold mb-4 text-emerald-800">$1</h1>')
      .replace(/^## (.*$)/gm, '<h2 class="text-2xl font-bold mt-6 mb-3 text-emerald-700">$1</h2>')
      .replace(/^### (.*$)/gm, '<h3 class="text-xl font-bold mt-4 mb-2 text-emerald-600">$1</h3>')
      .replace(/^\* (.*$)/gm, '<li class="ml-4">$1</li>')
      .replace(/^- (.*$)/gm, '<li class="ml-4">$1</li>')
      .replace(/\n\n/g, '</p><p class="mb-4">')
      .replace(/\n/g, '<br/>');

    element.innerHTML = `
      <div style="padding: 40px; font-family: 'Times New Roman', serif; color: #1a1a1a; line-height: 1.6;">
        <div style="text-align: center; margin-bottom: 30px; border-bottom: 2px solid #065f46; padding-bottom: 10px;">
          <h1 style="color: #065f46; margin: 0; font-size: 24px;">IMERSÃO BÍBLICA IA</h1>
          <p style="color: #6b7280; font-size: 12px; margin-top: 5px;">Seu Tutor Espiritual Inteligente</p>
        </div>
        <div class="content">
          ${htmlContent}
        </div>
        <div style="margin-top: 50px; padding-top: 20px; border-top: 1px solid #e5e7eb; text-align: center; font-size: 10px; color: #9ca3af;">
          Documento gerado em ${new Date().toLocaleDateString('pt-BR')} às ${new Date().toLocaleTimeString('pt-BR')}<br/>
          © Imersão Bíblica IA - Todos os direitos reservados
        </div>
      </div>
    `;
    
    const opt = {
      margin: 10,
      filename: `Estudo_Imersao_${new Date().getTime()}.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
    };
    
    // @ts-ignore
    html2pdf().from(element).set(opt).save();
  };

  const getIntroduction = (text: string) => {
    const lines = text.split('\n');
    let intro = '';
    let foundIntro = false;
    
    for (const line of lines) {
      const lowerLine = line.toLowerCase();
      if (lowerLine.includes('introdução') || lowerLine.includes('## introdução') || lowerLine.includes('# introdução')) {
        foundIntro = true;
        intro += line + '\n';
        continue;
      }
      if (foundIntro) {
        // Stop if we hit another header or after a few paragraphs
        if (line.startsWith('#') || (line.trim() === '' && intro.split('\n').length > 10)) {
          break;
        }
        intro += line + '\n';
      }
    }
    
    if (!foundIntro || intro.trim().length < 100) {
      // Fallback: first two paragraphs or 500 chars
      const paragraphs = text.split('\n\n');
      const fallback = paragraphs.slice(0, 2).join('\n\n');
      return fallback.length > 500 ? fallback.substring(0, 500) + '...' : fallback;
    }
    return intro;
  };

  const introduction = getIntroduction(content);
  const hasMore = content.trim().length > introduction.trim().length;

  return (
    <div className="space-y-4">
      <div className={cn("prose dark:prose-invert max-w-none transition-all duration-500", !isExpanded && "max-h-[400px] overflow-hidden relative")}>
        <MarkdownRenderer content={isExpanded ? content : introduction} onSearch={onSearch} />
        {!isExpanded && hasMore && (
          <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-white dark:from-zinc-900 via-white/90 dark:via-zinc-900/90 to-transparent pointer-events-none" />
        )}
      </div>
      <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-4">
        {hasMore && (
          <button 
            onClick={() => setIsExpanded(!isExpanded)}
            className="flex items-center gap-2 px-8 py-3 bg-stone-100 dark:bg-zinc-800 text-emerald-600 dark:text-emerald-400 font-bold rounded-2xl hover:bg-stone-200 dark:hover:bg-zinc-700 transition-all text-sm shadow-sm"
          >
            {isExpanded ? (
              <><ChevronUp size={18} /> Ler Menos</>
            ) : (
              <><ChevronDown size={18} /> Ler Mais</>
            )}
          </button>
        )}
        
        <button
          onClick={handleDownloadPDF}
          className="flex items-center gap-2 px-8 py-3 bg-emerald-600 text-white font-bold rounded-2xl hover:bg-emerald-700 transition-all text-sm shadow-lg shadow-emerald-600/20"
        >
          <FileText size={18} /> Baixar PDF
        </button>

        <button
          onClick={handleDownloadOffline}
          className="flex items-center gap-2 px-8 py-3 bg-blue-600 text-white font-bold rounded-2xl hover:bg-blue-700 transition-all text-sm shadow-lg shadow-blue-600/20"
        >
          <WifiOff size={18} /> Offline
        </button>
      </div>
    </div>
  );
};

const CATHOLIC_APOCRYPHA = [
  { name: 'Tobias', description: 'Narra a história de Tobias e seu pai, destacando a providência divina e a intercessão do anjo Rafael.' },
  { name: 'Judite', description: 'Relata a vitória de uma viúva judia sobre o general Holofernes, simbolizando a resistência do povo de Deus.' },
  { name: '1 e 2 Macabeus', description: 'História da revolta dos Macabeus contra a opressão selêucida e a purificação do Templo.' },
  { name: 'Sabedoria', description: 'Livro poético que exalta a sabedoria divina e critica a idolatria.' },
  { name: 'Eclesiástico', description: 'ou Sirácida' },
  { name: 'Baruc', description: 'incluindo a Carta de Jeremias' },
  { name: 'Acréscimos em Ester e Daniel', description: 'incluindo Bel e o Dragão e a Oração de Azarias' }
];

const NT_APOCRYPHA = [
  { name: 'Evangelho de Tomé', description: '114 ensinamentos filosóficos de Jesus' },
  { name: 'Evangelho de Maria Madalena', description: 'Relata ensinamentos de Jesus sob a perspectiva de Maria' },
  { name: 'Evangelho de Judas', description: 'Apresenta Judas como quem cumpriu uma missão divina' },
  { name: 'Protoevangelho de Tiago', description: 'Detalhes sobre a infância de Maria e Jesus' },
  { name: 'Apocalipse de Pedro', description: 'Descrições detalhadas do céu e inferno' },
  { name: 'Atos de Paulo e Tecla', description: 'Narra a história de uma seguidora de Paulo' },
  { name: 'Livro de Enoque', description: 'Relata visões sobre anjos caídos' }
];

const BIBLE_BOOKS = [
  "Gênesis", "Êxodo", "Levítico", "Números", "Deuteronômio",
  "Josué", "Juízes", "Rute", "1 Samuel", "2 Samuel",
  "1 Reis", "2 Reis", "1 Crônicas", "2 Crônicas",
  "Esdras", "Neemias", "Ester", "Jó", "Salmos",
  "Provérbios", "Eclesiastes", "Cantares", "Isaías",
  "Jeremias", "Lamentações", "Ezequiel", "Daniel",
  "Oseias", "Joel", "Amós", "Obadias", "Jonas",
  "Miqueias", "Naum", "Habacuque", "Sofonias",
  "Ageu", "Zacarias", "Malaquias",
  "Mateus", "Marcos", "Lucas", "João", "Atos",
  "Romanos", "1 Coríntios", "2 Coríntios", "Gálatas",
  "Efésios", "Filipenses", "Colossenses", "1 Tessalonicenses",
  "2 Tessalonicenses", "1 Timóteo", "2 Timóteo", "Tito",
  "Filemom", "Hebreus", "Tiago", "1 Pedro", "2 Pedro",
  "1 João", "2 João", "3 João", "Judas", "Apocalipse"
];

const CHAPTERS_PER_BOOK: Record<string, number> = {
  "Gênesis": 50, "Êxodo": 40, "Levítico": 27, "Números": 36, "Deuteronômio": 34,
  "Josué": 24, "Juízes": 21, "Rute": 4, "1 Samuel": 31, "2 Samuel": 24,
  "1 Reis": 22, "2 Reis": 25, "1 Crônicas": 29, "2 Crônicas": 36,
  "Esdras": 10, "Neemias": 13, "Ester": 10, "Jó": 42, "Salmos": 150,
  "Provérbios": 31, "Eclesiastes": 12, "Cantares": 8, "Isaías": 66,
  "Jeremias": 52, "Lamentações": 5, "Ezequiel": 48, "Daniel": 12,
  "Oseias": 14, "Joel": 3, "Amós": 9, "Obadias": 1, "Jonas": 4,
  "Miqueias": 7, "Naum": 3, "Habacuque": 3, "Sofonias": 3,
  "Ageu": 2, "Zacarias": 14, "Malaquias": 4,
  "Mateus": 28, "Marcos": 16, "Lucas": 24, "João": 21, "Atos": 28,
  "Romanos": 16, "1 Coríntios": 16, "2 Coríntios": 13, "Gálatas": 6,
  "Efésios": 6, "Filipenses": 4, "Colossenses": 4, "1 Tessalonicenses": 5,
  "2 Tessalonicenses": 3, "1 Timóteo": 6, "2 Timóteo": 4, "Tito": 3,
  "Filemom": 1, "Hebreus": 13, "Tiago": 5, "1 Pedro": 5, "2 Pedro": 3,
  "1 João": 5, "2 João": 1, "3 João": 1, "Judas": 1, "Apocalipse": 22
};

export default function BibleStudyPage({ deepThinking, setDeepThinking, onNavigate }: BibleStudyPageProps) {
  const { user, notes: firestoreNotes, toggleFavorite } = useAuth();
  const { saveTrack, deleteTrack } = useAudioBox();
  const { fontFamily, fontSize, lineHeight } = useAccessibility();
  const { showToast } = useToast();
  const { isOffline, downloadedChapters, downloadedMaterials, downloadChapter, downloadMaterial } = useOffline();
  const { balance, consumeCredits, estimateCredits } = useCredits();
  const { share } = useShare();
  const [searchParams, setSearchParams] = useSearchParams();
  const location = useLocation();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<string>('menu');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const processedParams = useRef({ search: null, outline: null, tab: null });
  const [searchQuery, setSearchQuery] = useState('');
  const [result, setResult] = useState('');
  const [resultThought, setResultThought] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isGeneratingSpeech, setIsGeneratingSpeech] = useState(false);
  const [isAudioConfirmModalOpen, setIsAudioConfirmModalOpen] = useState(false);
  const [isSpeechModalOpen, setIsSpeechModalOpen] = useState(false);
  const [speechModalContent, setSpeechModalContent] = useState('');
  const [pendingSpeechText, setPendingSpeechText] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [loadingSource, setLoadingSource] = useState<string | null>(null);
  const [selectedStudyBible, setSelectedStudyBible] = useState('');
  const [selectedCommentary, setSelectedCommentary] = useState('');
  const [selectedDictionary, setSelectedDictionary] = useState('');
  const [selectedEncyclopedia, setSelectedEncyclopedia] = useState('');
  const [selectedBible, setSelectedBible] = useState(''); // Keep for other tabs
  const [selectedReligions, setSelectedReligions] = useState<string[]>([]);
  const [selectedCompareVersions, setSelectedCompareVersions] = useState<string[]>(['Almeida']);
  const [selectedMeaningSources, setSelectedMeaningSources] = useState<string[]>(['Dicionário Aurélio']);
  const [selectedAuthor, setSelectedAuthor] = useState('');
  const [authorSearchQuery, setAuthorSearchQuery] = useState('');
  const [selectedWork, setSelectedWork] = useState('');
  const [previousTab, setPreviousTab] = useState<string | null>(null);
  const [creationType, setCreationType] = useState<'lesson' | 'study' | 'outline' | 'devotional' | 'debate' | 'booklet' | 'message' | 'infographic' | 'slides_notebook' | 'kids_ministry' | 'audio' | 'questions' | 'ebook'>('lesson');
  const [messageType, setMessageType] = useState<'outline' | 'birthday' | 'wedding' | 'newyear' | 'graduation' | 'devotional' | 'funeral' | 'children'>('outline');
  const [messageResult, setMessageResult] = useState('');
  const [messageResultThought, setMessageResultThought] = useState('');
  const [ebookResult, setEbookResult] = useState('');
  const [ebookResultThought, setEbookResultThought] = useState('');
  const [questionsScope, setQuestionsScope] = useState('Toda a Bíblia');
  const [questionsBook, setQuestionsBook] = useState('');
  const [questionsAgeGroup, setQuestionsAgeGroup] = useState('Adultos');
  const [questionsCount, setQuestionsCount] = useState(30);
  const [questionsResult, setQuestionsResult] = useState('');
  const [questionsResultThought, setQuestionsResultThought] = useState('');
  const [quizQuestions, setQuizQuestions] = useState<QuizQuestion[] | null>(null);
  const [isQuizOpen, setIsQuizOpen] = useState(false);
  const [meaningResult, setMeaningResult] = useState('');
  const [meaningResultThought, setMeaningResultThought] = useState('');
  const [meaningHistory, setMeaningHistory] = useState<any[]>([]);
  const [outlinesSearchQuery, setOutlinesSearchQuery] = useState('');
  const [selectedOutlineCategory, setSelectedOutlineCategory] = useState('Todas');
  const [selectedLibraryOutline, setSelectedLibraryOutline] = useState<any | null>(null);
  const [customOutlines, setCustomOutlines] = useState<any[]>([]);
  const [isEditingLibraryOutline, setIsEditingLibraryOutline] = useState(false);
  const [editedLibraryOutline, setEditedLibraryOutline] = useState<any | null>(null);
  const [isSavingCustomOutline, setIsSavingCustomOutline] = useState(false);
  const [isResourcesModalOpen, setIsResourcesModalOpen] = useState(false);
  const [isResourcesModalFullscreen, setIsResourcesModalFullscreen] = useState(false);

  useEffect(() => {
    if (!user) {
      setCustomOutlines([]);
      return;
    }
    const q = query(collection(db, 'customOutlines'), where('userId', '==', user.id));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const outlines = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setCustomOutlines(outlines);
    });
    return () => unsubscribe();
  }, [user]);

  const allLibraryOutlines = useMemo(() => {
    const customIds = new Set(customOutlines.map(o => o.originalId || o.id));
    const baseOutlines = sermonOutlines.filter(o => !customIds.has(o.id));
    return [...baseOutlines, ...customOutlines.map(o => ({ ...o, isEdited: true }))];
  }, [customOutlines]);

  const filteredLibraryOutlines = allLibraryOutlines.filter(outline => {
    const matchesSearch = outline.theme.toLowerCase().includes(outlinesSearchQuery.toLowerCase()) || 
                          outline.verse.toLowerCase().includes(outlinesSearchQuery.toLowerCase()) ||
                          outline.category.toLowerCase().includes(outlinesSearchQuery.toLowerCase());
    const matchesCategory = selectedOutlineCategory === 'Todas' || outline.category === selectedOutlineCategory;
    const matchesEdited = selectedOutlineCategory === 'Editados' ? outline.isEdited : true;
    
    if (selectedOutlineCategory === 'Editados') {
      return matchesSearch && outline.isEdited;
    }
    
    return matchesSearch && matchesCategory;
  });
  const [followUpQuery, setFollowUpQuery] = useState('');
  const [wikiQuery, setWikiQuery] = useState('');
  const [wikiResult, setWikiResult] = useState('');
  const [wikiResultThought, setWikiResultThought] = useState('');
  const [isAiMeaningOpen, setIsAiMeaningOpen] = useState(false);
  const [meaningQuery, setMeaningQuery] = useState('');
  const [selectedModel, setSelectedModel] = useState('Gemini');
  const [isGeneratingMeaning, setIsGeneratingMeaning] = useState(false);
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);

  // Apocryphal Books state
  const [selectedApocryphaBooks, setSelectedApocryphaBooks] = useState<string[]>([]);
  const [apocryphaSearchQuery, setApocryphaSearchQuery] = useState('');
  const [apocryphaResult, setApocryphaResult] = useState('');
  const [apocryphaThought, setApocryphaThought] = useState('');
  const [isGeneratingApocrypha, setIsGeneratingApocrypha] = useState(false);
  const [showApocryphaInfo, setShowApocryphaInfo] = useState<string | null>(null);

  // Music Box state
  const [musicText, setMusicText] = useState('');
  const [musicStyle, setMusicStyle] = useState('Gospel');
  const [musicEmotion, setMusicEmotion] = useState('Alegre');
  const [isGeneratingMusic, setIsGeneratingMusic] = useState(false);
  const [isGeneratingLyrics, setIsGeneratingLyrics] = useState(false);
  const [musicResult, setMusicResult] = useState('');
  const [musicData, setMusicData] = useState<{ title: string; lyrics: string; chords: string; arrangement: string; guitarGuide: string } | null>(null);
  const [activeMusicTab, setActiveMusicTab] = useState<'lyrics' | 'chords' | 'arrangement' | 'guitar'>('lyrics');
  const [musicAudioUrl, setMusicAudioUrl] = useState<string | null>(null);
  const [audioProgress, setAudioProgress] = useState(0);
  const [audioDuration, setAudioDuration] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [narrationAudio, setNarrationAudio] = useState<string | null>(null);
  const [isGeneratingNarration, setIsGeneratingNarration] = useState(false);
  const [searchPopup, setSearchPopup] = useState<{ isOpen: boolean; query: string; result: string }>({
    isOpen: false,
    query: '',
    result: ''
  });
  
  // Outline state
  const [topic, setTopic] = useState('');
  const [outline, setOutline] = useState('');
  const [outlineThought, setOutlineThought] = useState('');
  const [isEditingOutline, setIsEditingOutline] = useState(false);
  const [editedOutline, setEditedOutline] = useState('');
  const [personalNotes, setPersonalNotes] = useState('');
  const [verseSearch, setVerseSearch] = useState('');
  const [verseContent, setVerseContent] = useState('');
  const [isFavorited, setIsFavorited] = useState(false);

  useEffect(() => {
    if (location.state?.tab) {
      setActiveTab(location.state.tab);
      if (location.state.query) {
        setSearchQuery(location.state.query);
      }
    }
    if (location.state?.offlineContent) {
      setResult(location.state.offlineContent);
      setActiveTab('result');
      if (location.state.title) {
        setSearchQuery(location.state.title);
      }
    }
  }, [location.state]);

  useEffect(() => {
    if (user && user.favorites && (verseSearch || searchQuery)) {
      const ref = activeTab === 'verse-search' ? verseSearch : searchQuery;
      const favorited = user.favorites.some(f => f.reference === ref);
      setIsFavorited(favorited);
    } else {
      setIsFavorited(false);
    }
  }, [user, verseSearch, searchQuery, activeTab]);

  const handleApocryphaSearch = async () => {
    if (!apocryphaSearchQuery && selectedApocryphaBooks.length === 0) {
      showToast("Digite algo para pesquisar ou selecione pelo menos um livro.", "info");
      return;
    }

    setIsGeneratingApocrypha(true);
    setApocryphaResult('');
    setApocryphaThought('');

    try {
      const booksStr = selectedApocryphaBooks.length > 0 ? selectedApocryphaBooks.join(', ') : 'Todos os livros apócrifos';
      const target = apocryphaSearchQuery ? `Tema/Pesquisa: ${apocryphaSearchQuery} nos livros: ${booksStr}` : `Livros: ${booksStr}`;
      const prompt = `Forneça informações detalhadas sobre: ${target}. 
      Se for um livro apócrifo específico, inclua contexto histórico, conteúdo principal e por que é considerado apócrifo.
      Se for uma palavra ou tema, pesquise como esse tema é abordado nos livros apócrifos (Católicos e do NT) selecionados.
      
      IMPORTANTE: 
      1. Inclua uma seção sobre divergências no cânon: como outras bíblias de estudo, comentários, dicionários, enciclopédias e autores divergem sobre a canonicidade deste conteúdo.
      2. Procure e apresente ensinos bíblicos canônicos contrários que combatem ou refutam a abordagem feita nos livros apócrifos sobre este tema ou livro.
      3. Se nenhum livro específico foi selecionado, gere a pesquisa considerando todos os livros apócrifos conhecidos.`;

      const response = await geminiService.generateTextWithThought(prompt, "Você é um especialista em teologia e história bíblica. Forneça respostas acadêmicas, equilibradas e bem estruturadas em Markdown.", deepThinking);

      setApocryphaResult(response.text);
      if (response.thought) setApocryphaThought(response.thought);
      
      addToHistory({
        tab: 'apocrypha',
        query: target,
        result: response.text,
        thought: response.thought,
        type: 'Pesquisa Apócrifo'
      });

    } catch (error) {
      console.error("Error searching apocrypha:", error);
      showToast("Erro ao pesquisar. Tente novamente.", "error");
    } finally {
      setIsGeneratingApocrypha(false);
    }
  };

  const getSelectedSources = () => {
    const sources = [];
    if (selectedStudyBible) sources.push(selectedStudyBible);
    if (selectedCommentary) sources.push(selectedCommentary);
    if (selectedDictionary) sources.push(selectedDictionary);
    if (selectedEncyclopedia) sources.push(selectedEncyclopedia);
    
    if (sources.length === 0) return 'Todos os Recursos';
    if (sources.length === 1) return sources[0];
    return sources.join(', ');
  };

  const handleNavigateChapter = (direction: 'prev' | 'next') => {
    if (!searchQuery) return;

    // Try to parse current book and chapter
    const match = searchQuery.match(/^(.+?)\s+(\d+)$/);
    if (!match) {
      showToast("Para navegar, use o formato 'Livro Capítulo' (ex: Gênesis 1)", "info");
      return;
    }

    const currentBook = match[1].trim();
    const currentChapter = parseInt(match[2]);
    
    const bookIndex = BIBLE_BOOKS.indexOf(currentBook);
    if (bookIndex === -1) {
      showToast("Livro não encontrado para navegação automática.", "info");
      return;
    }

    let nextBook = currentBook;
    let nextChapter = currentChapter;

    if (direction === 'next') {
      const maxChapters = CHAPTERS_PER_BOOK[currentBook] || 1;
      if (currentChapter < maxChapters) {
        nextChapter = currentChapter + 1;
      } else if (bookIndex < BIBLE_BOOKS.length - 1) {
        nextBook = BIBLE_BOOKS[bookIndex + 1];
        nextChapter = 1;
      } else {
        showToast("Você já está no último capítulo da Bíblia.", "info");
        return;
      }
    } else {
      if (currentChapter > 1) {
        nextChapter = currentChapter - 1;
      } else if (bookIndex > 0) {
        nextBook = BIBLE_BOOKS[bookIndex - 1];
        nextChapter = CHAPTERS_PER_BOOK[nextBook] || 1;
      } else {
        showToast("Você já está no primeiro capítulo da Bíblia.", "info");
        return;
      }
    }

    const nextRef = `${nextBook} ${nextChapter}`;
    setSearchQuery(nextRef);
    setSearchParams({ search: nextRef, tab: 'bibles' });
    handleSearch(getSelectedSources(), nextRef);
  };

  const handleToggleFavorite = async () => {
    if (!user) {
      showToast("Faça login para favoritar versículos.", "info");
      return;
    }

    const reference = activeTab === 'verse-search' ? verseSearch : searchQuery;
    const content = activeTab === 'verse-search' ? verseContent : result;
    const version = activeTab === 'verse-search' ? 'ACF/NVI' : (activeTab === 'bibles' ? getSelectedSources() : (selectedBible || 'Imersão'));

    if (!reference || !content) return;

    try {
      await toggleFavorite({
        reference,
        verse: content,
        version,
        date: new Date().toISOString()
      });
    } catch (error) {
      console.error("Error toggling favorite:", error);
    }
  };
  const outlineRef = useRef<HTMLDivElement>(null);
  const storiesTheaterRef = useRef<HTMLDivElement>(null);
  const bibleResultRef = useRef<HTMLDivElement>(null);
  const verseResultRef = useRef<HTMLDivElement>(null);
  const resultRef = useRef<HTMLDivElement>(null);

  // General Notes state
  const [localNotes, setLocalNotes] = useState<{ id: string, title: string, content: string, date: string }[]>(() => {
    const saved = localStorage.getItem('preacher_notes');
    return saved ? JSON.parse(saved) : [];
  });

  const notes = user ? firestoreNotes : localNotes;

  // Pagination for Notes
  const [currentPage, setCurrentPage] = useState(1);
  const NOTES_PER_PAGE = 6;
  const totalPages = Math.ceil(notes.length / NOTES_PER_PAGE);
  const paginatedNotes = notes.slice((currentPage - 1) * NOTES_PER_PAGE, currentPage * NOTES_PER_PAGE);
  const [currentNote, setCurrentNote] = useState({ title: '', content: '' });

  const tabs = [
    { id: 'bibles', label: 'Bíblias e Enciclopédias', icon: <Book size={18} /> },
    { id: 'verse-search', label: 'Busca de Versículo', icon: <Search size={18} /> },
    { id: 'authors', label: 'Visão do Autor', icon: <User size={18} /> },
    { id: 'religions', label: 'Outras Religiões', icon: <Cross size={18} className="rotate-180" /> },
    { id: 'creation-tool', label: 'Ferramenta de Criação', icon: <Sparkles size={18} /> },
    { id: 'kids_ministry', label: 'Ministério Infantil', icon: <Baby size={18} /> },
    { id: 'stories_theater', label: 'Estórias & Teatro', icon: <Theater size={18} /> },
    { id: 'narration', label: 'Geração Narração', icon: <Volume2 size={18} /> },
    { id: 'posts', label: 'Post (Artes IA)', icon: <ImageIcon size={18} /> },
    { id: 'compare', label: 'Compare Versões', icon: <Layers size={18} /> },
    { id: 'commentary', label: 'Debate Bíblico', icon: <MessageSquare size={18} /> },
    { id: 'significado', label: 'Significados', icon: <HelpCircle size={18} /> },
    { id: 'wiki', label: 'Pesquisa Infinita - Wiki', icon: <Globe size={18} /> },
    { id: 'apocrypha', label: 'Livros Apócrifos', icon: <BookOpen size={18} /> },
    { id: 'resources', label: 'Mapas e Notas', icon: <MapIcon size={18} /> },
    { id: 'outlines_library', label: 'Esboços Prontos', icon: <FileText size={18} /> },
  ];

  const [lessonResult, setLessonResult] = useState('');
  const [lessonResultThought, setLessonResultThought] = useState('');
  const [leaderGuide, setLeaderGuide] = useState('');
  const [leaderGuideThought, setLeaderGuideThought] = useState('');
  const [studyResult, setStudyResult] = useState('');
  const [studyResultThought, setStudyResultThought] = useState('');
  const [devotionalResult, setDevotionalResult] = useState('');
  const [devotionalResultThought, setDevotionalResultThought] = useState('');
  const [debateResult, setDebateResult] = useState('');
  const [debateResultThought, setDebateResultThought] = useState('');
  const [bookletResult, setBookletResult] = useState('');
  const [bookletResultThought, setBookletResultThought] = useState('');
  const searchInputRef = useRef<HTMLDivElement>(null);

  const scrollToSearch = () => {
    searchInputRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };
  const [bookletProgress, setBookletProgress] = useState({ current: 0, total: 0, label: '' });
  const [isStoppingBooklet, setIsStoppingBooklet] = useState(false);
  const [showCreditConfirm, setShowCreditConfirm] = useState<{ show: boolean, cost: number, action: () => void }>({ show: false, cost: 0, action: () => {} });
  const stopBookletRef = useRef(false);
  const [notebookSearchQuery, setNotebookSearchQuery] = useState('');
  const [slidesResult, setSlidesResult] = useState('');
  const [showLeaderGuide, setShowLeaderGuide] = useState(false);
  const [isGeneratingSlides, setIsGeneratingSlides] = useState(false);
  const [creationPopup, setCreationPopup] = useState<{ show: boolean, title: string, content: string } | null>(null);

  const [isReadingMode, setIsReadingMode] = useState(false);
  const fontSizeMap: Record<string, number> = { 'xs': 12, 'sm': 14, 'base': 16, 'lg': 18, 'xl': 20, '2xl': 24, '3xl': 30 };
  const [readingFontSize, setReadingFontSize] = useState(fontSizeMap[fontSize] || 16);
  const [readingLineHeight, setReadingLineHeight] = useState(lineHeight);
  const [isNotebookModalOpen, setIsNotebookModalOpen] = useState(false);
  const [isSavingToNotebook, setIsSavingToNotebook] = useState(false);
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  const [pendingNote, setPendingNote] = useState<{ title: string, content: string } | null>(null);
  const [narrationText, setNarrationText] = useState('');
  const [narrationAudioData, setNarrationAudioData] = useState<{
    text: string;
    audioUrl: string;
    voice: string;
    emotion: string;
    title: string;
    subject?: string;
  } | null>(null);

  const handleSendToNarration = (text: string, savedTrack?: any) => {
    if (savedTrack) {
      setNarrationAudioData({
        text: savedTrack.text || '',
        audioUrl: savedTrack.audioUrl,
        voice: savedTrack.style,
        emotion: savedTrack.emotion,
        title: savedTrack.title,
        subject: savedTrack.subject
      });
      setNarrationText('');
    } else {
      setNarrationText(text);
      setNarrationAudioData(null);
    }
    setActiveTab('narration');
    showToast(savedTrack ? "Áudio carregado no Gerador de Narração! 🎙️✨" : "Texto enviado para o Gerador de Narração! 🎙️✨", "success");
    scrollToSearch();
  };

  // Stories & Theater state
  const [storiesTheaterAgeGroup, setStoriesTheaterAgeGroup] = useState('Adolescentes 13 a 17 anos');
  const [storiesTheaterTopic, setStoriesTheaterTopic] = useState('');
  const [storiesTheaterType, setStoriesTheaterType] = useState('theater');
  const [storiesTheaterResult, setStoriesTheaterResult] = useState<{ theater?: string, stories?: string, bibleStory?: string } | null>(null);
  const [storiesTheaterActiveTab, setStoriesTheaterActiveTab] = useState<'theater' | 'stories' | 'bibleStory'>('theater');
  const [isGeneratingStoriesTheater, setIsGeneratingStoriesTheater] = useState(false);

  // Kids Ministry state
  const [isKidsModalOpen, setIsKidsModalOpen] = useState(false);
  const [kidsAgeGroup, setKidsAgeGroup] = useState('Maternal até 3 anos');
  const [kidsContentType, setKidsContentType] = useState('Lição EBD');
  const [kidsResult, setKidsResult] = useState<{ children: string, monitors: string, activities: string, theater?: string } | null>(null);
  const [kidsActiveTab, setKidsActiveTab] = useState<'children' | 'monitors' | 'activities' | 'illustration'>('children');
  const [isGeneratingKids, setIsGeneratingKids] = useState(false);
  const [kidsIllustration, setKidsIllustration] = useState<string | null>(null);
  const [isGeneratingIllustration, setIsGeneratingIllustration] = useState(false);

  const [studyHistory, setStudyHistory] = useState<StudyHistoryItem[]>(() => {
    const saved = localStorage.getItem('study_history');
    return saved ? JSON.parse(saved) : [];
  });
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);

  const addToHistory = (item: Omit<StudyHistoryItem, 'id' | 'date'>) => {
    const newItem: StudyHistoryItem = {
      ...item,
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      date: new Date().toLocaleString('pt-BR'),
    };
    const updatedHistory = [newItem, ...studyHistory].slice(0, 20);
    setStudyHistory(updatedHistory);
    localStorage.setItem('study_history', JSON.stringify(updatedHistory));
  };

  // Commentary state
  const [selectedCommentators, setSelectedCommentators] = useState<string[]>(['Matthew Henry']);
  const [selectedCommentaryVersion, setSelectedCommentaryVersion] = useState('NVI');
  const [commentaryResult, setCommentaryResult] = useState('');
  const [commentaryDebateResult, setCommentaryDebateResult] = useState('');

  const [isGeneratingCommentary, setIsGeneratingCommentary] = useState(false);
  const [isGeneratingCommentaryDebate, setIsGeneratingCommentaryDebate] = useState(false);
  const [suggestedDebaters, setSuggestedDebaters] = useState<string[]>([]);
  const [includeOpposingOpinions, setIncludeOpposingOpinions] = useState(false);
  const [isSuggestingCommentators, setIsSuggestingCommentators] = useState(false);
  const [commentaryDebateTopic, setCommentaryDebateTopic] = useState('');

  const commentators = [
    { name: 'Matthew Henry', bio: 'Famoso por seu comentário devocional completo da Bíblia.' },
    { name: 'Charles Spurgeon', bio: 'Conhecido como o "Príncipe dos Pregadores", foca na aplicação prática e espiritual.' },
    { name: 'John Calvin', bio: 'Foco na soberania de Deus e exegese cuidadosa.' },
    { name: 'Martin Luther', bio: 'Ênfase na justificação pela fé e na graça.' },
    { name: 'John Wesley', bio: 'Foco na santidade e na experiência cristã.' },
    { name: 'Albert Barnes', bio: 'Comentários explicativos e práticos populares no século XIX.' },
    { name: 'Adam Clarke', bio: 'Conhecido por seu vasto conhecimento linguístico e histórico.' },
    { name: 'John MacArthur', bio: 'Perspectiva conservadora e foco na exposição versículo por versículo.' },
    { name: 'N.T. Wright', bio: 'Perspectiva contemporânea e foco no contexto histórico do Novo Testamento.' },
    { name: 'William Barclay', bio: 'Comentários acessíveis com foco no significado das palavras gregas.' },
  ];

  const commentaryVersions = [
    'NVI', 'ARA', 'ACF', 'Nova Vida', 'ARC', 'KJV', 'Almeida Século 21', 'NTLH'
  ];

  const handleSuggestCommentators = async () => {
    if (!topic) {
      showToast("Insira um tema primeiro para sugerirmos os melhores comentaristas.", "info");
      return;
    }
    setIsSuggestingCommentators(true);
    try {
      const prompt = `Com base no tema ou versículo "${topic}", identifique os quatro comentaristas bíblicos ou teólogos que mais se aprofundaram ou têm as visões mais relevantes sobre este assunto específico. 
      Retorne apenas os nomes dos quatro autores, separados por vírgula. Não adicione mais nada.`;
      
      const response = await geminiService.generateText(prompt);
      const suggested = response.split(',').map(s => s.trim()).filter(s => s.length > 0);
      if (suggested.length > 0) {
        setSelectedCommentators(suggested);
        showToast(`Sugeridos: ${suggested.join(', ')}`, "success");
      }
    } catch (error) {
      console.error("Erro ao sugerir comentaristas:", error);
      showToast("Erro ao sugerir comentaristas.", "error");
    } finally {
      setIsSuggestingCommentators(false);
    }
  };

  const handleGenerateCommentary = async () => {
    if (!topic) {
      showToast("Por favor, insira um versículo ou tema para o comentário.", "error");
      return;
    }

    setIsGeneratingCommentary(true);
    setCommentaryDebateTopic(topic); // Pre-fill debate topic
    try {
      const prompt = `Aja como um grupo de renomados teólogos e comentaristas bíblicos. 
      Gere um estudo bíblico exaustivo e comentário detalhado sobre o versículo ou tema: "${topic}".
      
      Fontes e Recursos a serem integrados:
      1. Bases Bíblicas: Citações diretas na versão ${selectedCommentaryVersion}.
      2. Comentários Bíblicos: Perspectivas detalhadas dos principais autores que abordam este assunto, incluindo especificamente: ${selectedCommentators.join(', ')}.
      3. Bíblias de Estudo: Insights de Bíblias renomadas (ex: Genebra, Thompson, Shedd, Plenitude, MacArthur).
      4. Enciclopédias Bíblicas: Contexto histórico, arqueológico e geográfico profundo.
      5. Dicionários Bíblicos: Definições e etimologias de termos-chave do tema no original (Hebraico/Grego).
      
      Estrutura do Estudo:
      1. Introdução e Panorama Geral
      2. Contexto Histórico, Cultural e Literário (Enciclopédia)
      3. Análise Exegética e Linguística (Dicionário)
      4. Comentário Teológico Detalhado (Baseado em ${selectedCommentators.join(', ')} e Bíblias de Estudo)
      5. Síntese e Conclusão
      
      Formate o texto em Markdown com títulos claros, negritos e listas para facilitar a leitura.
      
      IMPORTANTE: Ao final do seu comentário, adicione uma seção chamada "SUGESTÃO PARA DEBATE" contendo exatamente dois nomes de autores teológicos renomados que possuem visões possivelmente divergentes ou complementares sobre este tema específico, no formato: [Autor 1, Autor 2].`;

      const response = await geminiService.generateText(prompt);
      
      // Extract suggested debaters
      const suggestionMatch = response.match(/SUGESTÃO PARA DEBATE.*\[(.*?)\]/s);
      if (suggestionMatch && suggestionMatch[1]) {
        const authors = suggestionMatch[1].split(',').map(s => s.trim());
        if (authors.length >= 2) {
          setSuggestedDebaters(authors.slice(0, 2));
        }
      }

      setCommentaryResult(response);
      addToHistory({
        tab: 'commentary',
        query: topic,
        result: response,
        type: `Comentário: ${selectedCommentators.join(', ')}`
      });
    } catch (error) {
      console.error("Erro ao gerar comentário:", error);
      showToast("Erro ao gerar comentário. Tente novamente.", "error");
    } finally {
      setIsGeneratingCommentary(false);
    }
  };

  const handleGenerateCommentaryDebate = async () => {
    const targetTopic = commentaryDebateTopic || topic;
    if (!targetTopic) {
      showToast("Por favor, insira um tema para o debate.", "error");
      return;
    }

    setIsGeneratingCommentaryDebate(true);
    try {
      // Use suggested debaters if available and no specific ones selected
      let debateAuthors = selectedCommentators.filter(n => n.trim() !== '');
      
      if (debateAuthors.length < 2 && suggestedDebaters.length >= 2) {
        debateAuthors = suggestedDebaters;
      }
      
      if (debateAuthors.length < 2) {
        const suggestPrompt = `Para o tema "${targetTopic}", identifique os dois autores teológicos com as visões mais profundas e possivelmente divergentes para um debate. Retorne apenas os nomes separados por vírgula.`;
        const suggestRes = await geminiService.generateText(suggestPrompt);
        debateAuthors = suggestRes.split(',').map(s => s.trim());
      }

      const prompt = `Aja como um moderador de um debate teológico de alto nível.
      O tema do debate é: "${targetTopic}".
      Os debatedores principais são: ${debateAuthors.join(' e ')}.
      
      Estrutura do Debate:
      1. Tese de ${debateAuthors[0]} sobre o assunto.
      2. Antítese ou Perspectiva Divergente de ${debateAuthors[1]}.
      3. Pontos de Tensão e Diálogo entre as duas visões.
      4. Síntese Teológica e implicações para a fé cristã.
      
      Baseie-se em obras reais e pensamentos documentados destes autores.
      Formate em Markdown.`;

      const response = await geminiService.generateText(prompt);
      setCommentaryDebateResult(response);
      addToHistory({
        tab: 'commentary',
        query: targetTopic,
        result: response,
        type: `Debate: ${debateAuthors.join(' vs ')}`
      });
    } catch (error) {
      console.error("Erro ao gerar debate:", error);
      showToast("Erro ao gerar debate. Tente novamente.", "error");
    } finally {
      setIsGeneratingCommentaryDebate(false);
    }
  };

  const loadFromHistory = (item: StudyHistoryItem) => {
    setActiveTab(item.tab);
    if (item.tab === 'creation-tool' && item.creationType) {
      setCreationType(item.creationType as any);
      setTopic(item.query);
      
      if (item.creationType === 'lesson') setLessonResult(item.result);
      else if (item.creationType === 'study') setStudyResult(item.result);
      else if (item.creationType === 'outline') setOutline(item.result);
      else if (item.creationType === 'devotional') setDevotionalResult(item.result);
      else if (item.creationType === 'debate') setDebateResult(item.result);
      else if (item.creationType === 'booklet') setBookletResult(item.result);
      else if (item.creationType === 'ebook') setEbookResult(item.result);
      else if (item.creationType === 'message') setMessageResult(item.result);
      
      if (item.thought) {
        if (item.creationType === 'lesson') setLessonResultThought(item.thought);
        else if (item.creationType === 'study') setStudyResultThought(item.thought);
        else if (item.creationType === 'outline') setOutlineThought(item.thought);
        else if (item.creationType === 'devotional') setDevotionalResultThought(item.thought);
        else if (item.creationType === 'debate') setDebateResultThought(item.thought);
        else if (item.creationType === 'booklet') setBookletResultThought(item.thought);
        else if (item.creationType === 'ebook') setEbookResultThought(item.thought);
        else if (item.creationType === 'message') setMessageResultThought(item.thought);
      }
    } else {
      setSearchQuery(item.query);
      setResult(item.result);
      setResultThought(item.thought || '');
    }
    
    setIsHistoryOpen(false);
    showToast("Estudo recarregado do histórico! 🕒✨");
    scrollToSearch();
  };

  const handleSaveToNotebook = async (title: string, content: string) => {
    let finalContent = content;
    
    // If content is a base64 image string, compress it
    if (content.startsWith('data:image')) {
      showToast("Otimizando imagem para o caderno... ⏳", 'info');
      try {
        finalContent = await compressImage(content, 800, 800, 0.6);
      } catch (e) {
        console.error("Error compressing image:", e);
      }
    }

    setPendingNote({ title, content: finalContent });
    setIsNotebookModalOpen(true);
  };

  const confirmSaveToNotebook = async (category: 'Anotações' | 'Esboços' | 'Estudos' | 'Histórias' | 'Teatro' | 'Outros') => {
    if (!pendingNote) return;
    
    if (!pendingNote.content) {
      showToast("Conteúdo não disponível para salvar.", "error");
      return;
    }

    setIsSavingToNotebook(true);
    try {
      if (user) {
        await addDoc(collection(db, 'notes'), {
          userId: user.id,
          title: pendingNote.title,
          content: pendingNote.content,
          category,
          createdAt: new Date().toISOString()
        }).catch(err => handleFirestoreError(err, OperationType.CREATE, 'notes'));
      } else {
        const saved = localStorage.getItem('preacher_notes');
        const entries = saved ? JSON.parse(saved) : [];
        const newEntry = {
          id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          title: pendingNote.title,
          content: pendingNote.content,
          category,
          date: new Date().toLocaleDateString('pt-BR'),
          createdAt: new Date().toISOString()
        };
        localStorage.setItem('preacher_notes', JSON.stringify([newEntry, ...entries]));
      }
      showToast(`Salvo em ${category}! 📖✅`, 'success');
      setIsNotebookModalOpen(false);
      setPendingNote(null);
    } catch (error) {
      console.error("Error saving to notebook:", error);
      showToast("Erro ao salvar no caderno.", 'error');
    } finally {
      setIsSavingToNotebook(false);
    }
  };

  const saveNote = async () => {
    if (!currentNote.title || !currentNote.content) {
      showToast("Título e conteúdo são obrigatórios.", "error");
      return;
    }
    
    setIsLoading(true);
    try {
      if (user) {
        if (editingNoteId) {
          const noteDocRef = doc(db, 'notes', editingNoteId);
          await updateDoc(noteDocRef, {
            title: currentNote.title,
            content: currentNote.content,
            updatedAt: new Date().toISOString()
          });
          showToast("Página atualizada! 📝✨");
        } else {
          await addDoc(collection(db, 'notes'), {
            userId: user.id,
            title: currentNote.title,
            content: currentNote.content,
            category: 'Anotações',
            createdAt: new Date().toISOString()
          });
          showToast("Página guardada com sucesso! 📝✅");
        }
      } else {
        let updatedNotes;
        if (editingNoteId) {
          updatedNotes = localNotes.map(n => n.id === editingNoteId ? { ...n, title: currentNote.title, content: currentNote.content } : n);
          showToast("Página atualizada localmente! 📝✨");
        } else {
          const newNote = {
            id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            title: currentNote.title,
            content: currentNote.content,
            date: new Date().toLocaleDateString('pt-BR')
          };
          updatedNotes = [newNote, ...localNotes];
          showToast("Página guardada localmente! 📝✅");
        }
        setLocalNotes(updatedNotes);
        localStorage.setItem('preacher_notes', JSON.stringify(updatedNotes));
      }
      
      setCurrentNote({ title: '', content: '' });
      setEditingNoteId(null);
    } catch (error) {
      console.error("Error saving note:", error);
      showToast("Erro ao salvar nota.", 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const deleteNote = async (id: string) => {
    try {
      if (user) {
        await deleteDoc(doc(db, 'notes', id));
      } else {
        const updatedNotes = localNotes.filter(n => n.id !== id);
        setLocalNotes(updatedNotes);
        localStorage.setItem('preacher_notes', JSON.stringify(updatedNotes));
      }
      showToast("Página removida. 🗑️", 'info');
    } catch (error) {
      console.error("Error deleting note:", error);
      showToast("Erro ao remover página.", 'error');
    }
  };

  const handleAuthorSearch = async () => {
    if (!selectedAuthor && !searchQuery) return;
    
    setIsLoading(true);
    showToast(getRandomWaitingMessage(), 'info');
    if (deepThinking) {
      showToast("Aviso: O modo 'Pensamento Profundo' pode levar mais tempo para processar. 🧠⏳", 'info');
    }
    
    try {
      const author = GOSPEL_AUTHORS.find(a => a.name === selectedAuthor);
      let worksContext = author ? `Baseie sua resposta principalmente nas obras de ${author.name}: ${author.works.join(', ')}.` : '';
      
      // Prioritization logic
      const lowerQuery = (searchQuery || '').toLowerCase();
      const isFaithReason = lowerQuery.includes('fé') || lowerQuery.includes('razão') || lowerQuery.includes('apologética') || lowerQuery.includes('ateísmo');
      const isAnthropology = lowerQuery.includes('antropologia') || lowerQuery.includes('ateísmo');

      if (selectedAuthor === 'TODOS OS AUTORES' || !selectedAuthor) {
        if (isFaithReason) {
          worksContext += " Dê prioridade especial à visão de Tassos Lycurgo para este tema.";
        }
        if (isAnthropology) {
          worksContext += " Dê prioridade especial à visão de Rodrigo Silva para este tema.";
        }
      }

      if (selectedAuthor === 'Apóstolo Paulo') {
        worksContext += " Além das cartas paulinas, utilize o livro de Atos dos Apóstolos para extrair discursos, ensinamentos e o contexto de suas viagens missionárias.";
      }
      
      const prompt = `
      Termo pesquisado: "${searchQuery || 'Visão geral sobre a vida cristã'}"
      Fonte selecionada: "Visão do Autor: ${selectedAuthor || 'Grandes Autores Cristãos'}"
      
      Atue como um especialista na teologia e literatura de ${selectedAuthor || 'grandes autores cristãos'}. 
      Responda à seguinte pergunta ou tema: "${searchQuery || 'Visão geral sobre a vida cristã'}".
      
      ${worksContext}
      
      Sua resposta deve:
      1. Refletir o estilo, a linguagem e as convicções teológicas do autor.
      2. Citar (ou parafrasear com precisão) conceitos centrais de suas obras.
      3. Ser profunda, edificante e fiel ao pensamento do autor.
      
      IMPORTANTE: Se não houver uma referência direta e explícita deste autor para este tema exato, você DEVE:
      1. Sugerir versículos bíblicos que o autor provavelmente citaria.
      2. Propor estudos relacionados baseados na linha teológica do autor.
      3. Oferecer insights teológicos que o autor defenderia.
      
      IMPORTANTE: Ao longo de TODO o texto, você DEVE transformar termos teológicos, personagens bíblicos e conceitos importantes em links clicáveis.
      O formato OBRIGATÓRIO do link é [Termo](search:Termo).
      Exemplo: "...o sacrifício de [Jesus](search:Jesus) na cruz..."`;
      
      const response = await geminiService.generateTextWithThought(prompt, `Você é um especialista em ${selectedAuthor}.`, deepThinking);
      setResult(response.text);
      setResultThought(response.thought);

      addToHistory({
        type: 'Autor',
        query: `${selectedAuthor}: ${searchQuery}`,
        result: response.text,
        thought: response.thought,
        tab: 'authors'
      });
    } catch (error) {
      console.error(error);
      showToast("Erro ao consultar visão do autor.", 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const [isSearchingVerse, setIsSearchingVerse] = useState(false);
  const [verseContentThought, setVerseContentThought] = useState('');

  const handleVerseSearch = async () => {
    if (!verseSearch) return;
    
    setIsSearchingVerse(true);
    setVerseContent('');
    setVerseContentThought('');
    showToast("Buscando versículo nas Escrituras... 📖✨", 'info');
    
    try {
      const prompt = `
      Referência Bíblica: "${verseSearch}"
      
      Por favor, forneça o texto bíblico completo para esta referência.
      Priorize a versão "A Mensagem" (Eugene H. Peterson) se disponível, ou uma versão de estudo equivalente. Apresente também a versão Almeida Corrigida Fiel (ACF) ou NVI para comparação.
      Se for um capítulo inteiro, formate de maneira legível com os números dos versículos.
      
      ESTRUTURA ADICIONAL OBRIGATÓRIA:
      1. **Fundo Histórico**: Explique detalhadamente o contexto histórico, social e cultural da passagem.
      2. **Descobertas Arqueológicas**: Apresente as descobertas arqueológicas mais contundentes e relevantes que corroboram ou iluminam este texto.
      3. **Informações do Autor**: Forneça informações biográficas e teológicas relevantes sobre o autor e seu propósito específico nesta escrita.
      4. **Aplicação Pessoal**:
         - **Introdução**: Uma breve introdução conectando o texto à realidade atual.
         - **Desenvolvimento em Pontos**: Lições práticas divididas em pontos claros.
         - **Conclusão**: Uma síntese inspiradora para a vida do leitor.
      5. **Pesquisa Complementar**: Sugira outros textos bíblicos, temas ou termos para estudo aprofundado.
      
      IMPORTANTE: Transforme termos importantes em links clicáveis no formato [Termo](search:Termo).`;
      
      const response = await geminiService.generateTextWithThought(prompt, "Você é um erudito bíblico, arqueólogo e mentor espiritual altamente capacitado.", deepThinking);
      setVerseContent(response.text);
      setVerseContentThought(response.thought);
      
      addToHistory({
        type: 'Versículo',
        query: verseSearch,
        result: response.text,
        thought: response.thought,
        tab: 'bibles'
      });
    } catch (error) {
      console.error(error);
      showToast("Erro ao buscar versículo. Verifique a referência.", "error");
    } finally {
      setIsSearchingVerse(false);
    }
  };

  const handleGenerateStoriesTheater = async () => {
    if (!storiesTheaterTopic) {
      showToast("Digite um tema para gerar o conteúdo! 🎭", "info");
      return;
    }

    setIsGeneratingStoriesTheater(true);
    setStoriesTheaterResult(null);

    try {
      const isYoungAge = ['Maternal até 3 anos', 'Primário 4 a 5 anos', 'Juniores 6 a 9 anos', 'Pré-adolescentes 10 a 12 anos'].includes(storiesTheaterAgeGroup);
      
      const ageSpecificInstructions: Record<string, string> = {
        'Maternal até 3 anos': 'Histórias curtas com animais, brinquedos ou rotina familiar.',
        'Primário 4 a 5 anos': 'Contos com animais humanizados, trava-línguas, parlendas e cantigas. Histórias com ação simples e foco no cotidiano, brincadeiras, escola e família.',
        'Juniores 6 a 9 anos': 'Histórias mais longas e enredos mais complexos, personagens com idade aproximada, vilões e heróis, alfabetização, aventura, mistério, lendas, foco relacionamento com amigos, vizinhos, escola, família e igreja.',
        'Pré-adolescentes 10 a 12 anos': 'Enredo mais denso, desafios do cotidiano, sonhos, debates sociais, morais, éticos, combate ao bullying, preconceito, imoralidade, drogas lícitas e ilícitas, campanha contra violência, abusos.'
      };

      let prompt = "";
      if (storiesTheaterType === 'theater') {
        prompt = `Gere um roteiro de teatro cristão detalhado e criativo sobre o tema: "${storiesTheaterTopic}". 
        Faixa etária: ${storiesTheaterAgeGroup}. 
        ${isYoungAge ? `Instruções específicas para esta idade: ${ageSpecificInstructions[storiesTheaterAgeGroup]}` : ''}
        
        ESTRUTURA OBRIGATÓRIA:
        1. Título da Peça
        2. Lista de Personagens (com características físicas e comportamentais detalhadas)
        3. Descrição do Cenário, Maquiagem e Figurinos
        4. Orientações de Sonoplastia e Iluminação
        5. Roteiro dividido em Atos e Cenas
        
        REGRAS DE DRAMATURGIA:
        - Estabeleça um conflito central claro.
        - Defina os objetivos e impedimentos de cada personagem.
        - Utilize a dinâmica de herói/protagonista e vilão/antagonista.
        - Inclua coadjuvantes que ajudam ou atrapalham o protagonista.
        - Inclua narração quando necessário para contextualizar as cenas.
        
        O conteúdo deve ser profundamente cristão e apropriado para a idade escolhida.`;
      } else if (storiesTheaterType === 'stories') {
        prompt = `Gere uma estória (conto) cristã profunda, prática e impactante sobre o tema: "${storiesTheaterTopic}". 
        Faixa etária: ${storiesTheaterAgeGroup}. 
        ${isYoungAge ? `Instruções específicas para esta idade: ${ageSpecificInstructions[storiesTheaterAgeGroup]}` : ''}
        
        REQUISITOS DA ESTÓRIA:
        - Foco no cotidiano e na prática da vida cristã.
        - Baseada em princípios bíblicos sólidos.
        - Aborde temas sociais relevantes (como fome, desigualdade, preconceito, bullying, respeito, violência, drogas ou abusos), adaptando a abordagem à maturidade da faixa etária.
        - O objetivo final deve ser o evangelismo e proporcionar um encontro com Deus.
        - Linguagem envolvente e narrativa com começo, meio e fim (clímax e resolução).`;
      } else if (storiesTheaterType === 'bibleStory') {
        prompt = `Recrie uma história bíblica fiel e cativante sobre o tema ou personagem: "${storiesTheaterTopic}". 
        Faixa etária: ${storiesTheaterAgeGroup}. 
        ${isYoungAge ? `Instruções específicas para esta idade: ${ageSpecificInstructions[storiesTheaterAgeGroup]}` : ''}
        
        DIRETRIZES:
        - Mantenha a fidedignidade absoluta ao relato das Escrituras Sagradas.
        - Utilize uma linguagem apropriada, moderna e compreensível para a faixa etária escolhida.
        - Destaque a lição espiritual e a aplicação prática para os dias de hoje.
        - Torne a narrativa viva e emocionante, sem perder a reverência ao texto sagrado.`;
      }

      if (isYoungAge) {
        prompt += `
        
        ESTRUTURA ADICIONAL (REPLICAR MINISTÉRIO INFANTIL):
        Como esta é uma faixa etária infantil, inclua também:
        1. PARA OS MONITORES: Orientações pedagógicas, dicas de abordagem e materiais necessários.
        2. ATIVIDADES: Sugestões de dinâmicas, brincadeiras ou trabalhos manuais relacionados ao tema.`;
      }

      const response = await geminiService.generateText(prompt);
      
      if (storiesTheaterType === 'theater') {
        setStoriesTheaterResult({ theater: response });
        setStoriesTheaterActiveTab('theater');
      } else if (storiesTheaterType === 'stories') {
        setStoriesTheaterResult({ stories: response });
        setStoriesTheaterActiveTab('stories');
      } else {
        setStoriesTheaterResult({ bibleStory: response });
        setStoriesTheaterActiveTab('bibleStory');
      }

      showToast("Conteúdo gerado com sucesso! 🎭✨", "success");
      addToHistory({
        type: 'Stories & Theater',
        query: storiesTheaterTopic,
        result: response,
        tab: 'stories_theater'
      });
    } catch (error) {
      console.error("Error generating stories/theater:", error);
      showToast("Erro ao gerar conteúdo. Tente novamente.", "error");
    } finally {
      setIsGeneratingStoriesTheater(false);
    }
  };

  const handleGenerateKidsMinistry = async () => {
    if (!topic.trim()) {
      showToast("Por favor, digite um tema para o Ministério Infantil! 🎈");
      return;
    }

    const cost = 5;
    if (balance < cost) {
      showToast("Saldo insuficiente para gerar material infantil! 💎");
      return;
    }

    setShowCreditConfirm({
      show: true,
      cost,
      action: async () => {
        setIsGeneratingKids(true);
        setKidsResult(null);
        try {
          const ageSpecificInstructions: Record<string, string> = {
            'Maternal até 3 anos': 'Histórias curtas com animais, brinquedos ou rotina familiar.',
            'Primário 4 a 5 anos': 'Contos com animais humanizados, trava-línguas, parlendas e cantigas. Histórias com ação simples e foco no cotidiano, brincadeiras, escola e família.',
            'Juniores 6 a 9 anos': 'Histórias mais longas e enredos mais complexos, personagens com idade aproximada, vilões e heróis, alfabetização, aventura, mistério, lendas, foco relacionamento com amigos, vizinhos, escola, família e igreja.',
            'Pré-adolescentes 10 a 12 anos': 'Enredo mais denso, desafios do cotidiano, sonhos, debates sociais, morais, éticos, combate ao bullying, preconceito, imoralidade, drogas lícitas e ilícitas, campanha contra violência, abusos.'
          };

          const prompt = `Gere material completo para o Ministério Infantil sobre o tema: "${topic}".
          Faixa Etária: ${kidsAgeGroup}.
          Tipo de Conteúdo: ${kidsContentType}.
          
          Instruções específicas para esta faixa etária: ${ageSpecificInstructions[kidsAgeGroup] || ''}
          
          O conteúdo deve ser dividido em partes distintas:
          1. PARA AS CRIANÇAS: Linguagem simples, visual, histórias cativantes, aplicações práticas para a idade. Se o tipo for "Estória/Teatro", formate como um roteiro com personagens e falas.
          2. PARA OS MONITORES: Orientações pedagógicas, dicas de abordagem, preparação espiritual, materiais necessários.
          3. ATIVIDADES: Sugestões de dinâmicas, brincadeiras, trabalhos manuais (artesanato), quebra-cabeças ou desenhos para colorir (descritos).
          
          Retorne o resultado estritamente no formato JSON:
          {
            "children": "conteúdo em markdown para as crianças",
            "monitors": "conteúdo em markdown para os monitores",
            "activities": "conteúdo em markdown para as atividades"
          }`;

          const data = await geminiService.generateJSON<{ children: string, monitors: string, activities: string }>(
            prompt, 
            "Você é um especialista em educação cristã infantil e pedagogia.",
            {
              type: Type.OBJECT,
              properties: {
                children: { type: Type.STRING },
                monitors: { type: Type.STRING },
                activities: { type: Type.STRING }
              },
              required: ["children", "monitors", "activities"]
            }
          );

          setKidsResult(data);
          setKidsIllustration(null);
          setNarrationAudio(null);
          await consumeCredits(cost, `Geração de Material Infantil: ${topic}`);
          showToast("Material infantil gerado com sucesso! 🎨✨");
          addToHistory({
            tab: 'creation-tool',
            type: 'kids_ministry',
            creationType: 'kids_ministry',
            query: `${kidsContentType} - ${kidsAgeGroup}: ${topic}`,
            result: data.children,
            thought: "Material completo para Ministério Infantil"
          });
        } catch (error) {
          console.error(error);
          showToast("Erro ao gerar material infantil. Tente novamente.");
        } finally {
          setIsGeneratingKids(false);
        }
      }
    });
  };

  const handleGenerateIllustration = async () => {
    if (!kidsResult) return;
    
    const cost = 10;
    if (balance < cost) {
      showToast("Saldo insuficiente para gerar ilustração! 💎");
      return;
    }

    setIsGeneratingIllustration(true);
    try {
      const prompt = `Gere uma ilustração para colorir baseada no seguinte conteúdo infantil: "${kidsResult.children.substring(0, 500)}".
      Estilo: Pixar/Disney, traços simples, pouco detalhe, imagem monocolor (preto e branco), estilo livro de colorir, tamanho A4.`;
      
      const imageUrl = await geminiService.generateImage(prompt);
      if (imageUrl) {
        setKidsIllustration(imageUrl);
        setKidsActiveTab('illustration');
        await consumeCredits(cost, `Ilustração IA Infantil: ${topic}`);
        showToast("Ilustração gerada com sucesso! 🎨✨");
      } else {
        showToast("Erro ao gerar ilustração. Tente novamente.");
      }
    } catch (error) {
      console.error(error);
      showToast("Erro ao gerar ilustração.");
    } finally {
      setIsGeneratingIllustration(false);
    }
  };

  const handleGenerateNarration = async () => {
    if (!kidsResult) return;
    
    const content = kidsActiveTab === 'children' ? kidsResult.children : 
                    kidsActiveTab === 'monitors' ? kidsResult.monitors : 
                    kidsResult.activities;
                    
    setIsGeneratingNarration(true);
    setNarrationAudio(null);
    setAudioProgress(0);
    
    try {
      const prompt = `Crie uma narração emotiva e completa para o seguinte conteúdo: "${content}".
      A narração deve ser expressiva, com alternância de sentimentos e tons de voz adequados para cada parte do texto.
      Garanta que a narração cubra TODO o texto fornecido, sem cortes.
      Retorne apenas o texto da narração formatado para ser lido por um sistema de voz.`;
      
      const narrationText = await geminiService.generateText(prompt, "Você é um dublador e contador de histórias profissional.");
      
      const audioUrl = await geminiService.generateSpeech(narrationText, 'Zephyr');
      if (audioUrl) {
        setNarrationAudio(audioUrl);
        showToast("Narração gerada com sucesso! 🎙️✨");
      } else {
        showToast("Erro ao gerar áudio da narração.");
      }
    } catch (error) {
      console.error(error);
      showToast("Erro ao gerar narração.");
    } finally {
      setIsGeneratingNarration(false);
    }
  };

  const saveToAudioBox = async (title: string, audioUrl: string, style: string, emotion: string) => {
    try {
      await saveTrack(title, "Narração", audioUrl, style, emotion);
      showToast("Salvo na Coletânea! 🎵✨");
    } catch (error) {
      showToast("Erro ao salvar na Coletânea.");
    }
  };

  const handleGenerateLyrics = async () => {
    if (!musicText) return;
    
    const cost = 5;
    if (balance < cost) {
      showToast("Saldo insuficiente para gerar letra! 💎");
      return;
    }

    setIsGeneratingLyrics(true);
    setMusicResult('');
    setMusicData(null);
    setMusicAudioUrl(null);
    
    try {
      const prompt = `Componha uma música completa no estilo "${musicStyle}" com a emoção "${musicEmotion}" baseada no seguinte tema ou texto: "${musicText}".
      
      Retorne um JSON com a seguinte estrutura:
      {
        "title": "Título da Música",
        "lyrics": "Letra completa formatada em Markdown com [Verso], [Refrão], etc.",
        "chords": "A letra com as cifras (acordes) posicionadas acima das palavras, no formato padrão de música (Markdown).",
        "arrangement": "Instruções detalhadas para a banda (Ex: Bateria: Groove 4/4, Baixo: Linha melódica, Guitarras: Drive leve, BPM: 120, etc.)",
        "guitarGuide": "Guia específico para violão: Batida (ex: ↓ ↑ ↓ ↑), dedilhados sugeridos e dicas de execução para acompanhar a voz."
      }`;
      
      const response = await geminiService.generateJSON<{ title: string; lyrics: string; chords: string; arrangement: string; guitarGuide: string }>(
        prompt, 
        "Você é um compositor e produtor musical talentoso especializado em música cristã.",
        {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            lyrics: { type: Type.STRING },
            chords: { type: Type.STRING },
            arrangement: { type: Type.STRING },
            guitarGuide: { type: Type.STRING }
          },
          required: ["title", "lyrics", "chords", "arrangement", "guitarGuide"]
        }
      );

      if (response) {
        setMusicData(response);
        setMusicResult(response.lyrics);
        await consumeCredits(cost, `Composição Completa: ${musicStyle}`);
        showToast("Composição gerada com sucesso! 📝🎸", 'success');
      }
    } catch (error) {
      console.error(error);
      showToast("Erro ao gerar letra.");
    } finally {
      setIsGeneratingLyrics(false);
    }
  };

  const handleGenerateMusic = async () => {
    if (!musicResult) {
      showToast("Gere a letra primeiro!");
      return;
    }
    
    const cost = 10;
    if (balance < cost) {
      showToast("Saldo insuficiente para gerar música! 💎");
      return;
    }

    setIsGeneratingMusic(true);
    setMusicAudioUrl(null);
    
    try {
      showToast("Compondo melodia, voz e arranjos... 🎵", 'info');
      
      // We use a specific voice based on style/emotion if possible, or just a good default
      const voice = musicStyle === 'Infantil' ? 'Puck' : 
                    musicEmotion === 'Inspirador' ? 'Zephyr' : 
                    musicEmotion === 'Alegre' ? 'Fenrir' : 'Kore';

      // To simulate "instruments", we can add a system instruction or a specific prompt prefix
      // but the generateSpeech tool is simple. We'll just use it.
      const audioUrl = await geminiService.generateSpeech(musicResult, voice);
      
      if (audioUrl) {
        setMusicAudioUrl(audioUrl);
        await consumeCredits(cost, `Geração de Música: ${musicStyle}`);
        showToast("Música gerada com sucesso! 🎵✨");
      } else {
        showToast("Erro ao gerar o áudio da música.");
      }
    } catch (error) {
      console.error(error);
      showToast("Erro ao gerar música.");
    } finally {
      setIsGeneratingMusic(false);
    }
  };

  const handleSaveToAudioBox = async (content: string, audioUrl: string | null) => {
    if (!audioUrl) {
      showToast("Gere o áudio primeiro para salvar na Coletânea.", "info");
      return;
    }
    
    try {
      console.log('Saving to audio box:', { topic, audioUrl: audioUrl.substring(0, 50) + '...' });
      await saveTrack(`Ministério Infantil: ${topic || 'Sem Título'}`, 'Ministério Infantil', audioUrl, 'Narração', 'Emotiva');
      showToast("Salvo na Coletânea! 🎙️✨");
      setActiveTab('narration');
    } catch (error) {
      console.error('Error in handleSaveToAudioBox:', error);
      showToast("Erro ao salvar na Coletânea.", "error");
    }
  };

  const handlePrint = (content: string, title: string, isImage: boolean = false) => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    printWindow.document.write(`
      <html>
        <head>
          <title>${title}</title>
          <style>
            body { font-family: sans-serif; padding: 40px; line-height: 1.6; text-align: center; }
            img { max-width: 100%; height: auto; display: block; margin: 20px auto; border: 1px solid #eee; }
            h1 { color: #059669; text-align: left; }
            .content { white-space: pre-wrap; text-align: left; }
            @media print {
              button { display: none; }
            }
          </style>
        </head>
        <body>
          <h1>${title}</h1>
          ${isImage ? `<img src="${content}" referrerpolicy="no-referrer" />` : `<div class="content">${content}</div>`}
          <script>
            window.onload = () => {
              setTimeout(() => {
                window.print();
                window.close();
              }, 500);
            };
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  const handleUnifiedCreation = async () => {
    const cost = estimateCredits(creationType);
    
    setShowCreditConfirm({
      show: true,
      cost,
      action: async () => {
        if (await consumeCredits(cost, `Geração de ${creationType}: ${topic}`)) {
          if (creationType === 'lesson') handleCreateLesson();
          else if (creationType === 'study') handleCreateStudy();
          else if (creationType === 'outline') handleGenerateOutline();
          else if (creationType === 'devotional') handleCreateDevotional();
          else if (creationType === 'debate') handleCreateDebate();
          else if (creationType === 'booklet') handleCreateBooklet();
          else if (creationType === 'ebook') handleCreateEbook();
          else if (creationType === 'message') handleCreateMessage();
          else if (creationType === 'infographic') handleCreateInfographic();
          else if (creationType === 'slides_notebook') handleCreateSlidesPopup();
          else if (creationType === 'questions') handleCreateQuestions();
        } else {
          showToast("Saldo de créditos insuficiente! 🪙", 'error');
        }
      }
    });
  };

  const handleCreateQuestions = async () => {
    if (!topic) return;

    setIsLoading(true);
    showToast(getRandomWaitingMessage(), 'info');
    try {
      setQuestionsResult('');
      setQuizQuestions(null);
      
      let scopeText = questionsScope;
      if (questionsScope === 'Livro Específico' && questionsBook) {
        scopeText = `Livro de ${questionsBook}`;
      }

      const prompt = `Gere ${questionsCount} perguntas bíblicas de múltipla escolha (com 3 alternativas cada) sobre o tema: "${topic}".
      Escopo das perguntas: ${scopeText}.
      Público-alvo (nível de dificuldade e linguagem): ${questionsAgeGroup}.
      
      Regras:
      1. Divida as ${questionsCount} perguntas em 3 níveis de dificuldade: Fácil (cerca de um terço), Médio (cerca de um terço) e Difícil (cerca de um terço).
      2. Cada pergunta deve ter exatamente 3 alternativas.
      3. Indique claramente qual é a resposta correta (usando o índice 0, 1 ou 2) e a referência bíblica para cada pergunta.
      4. A linguagem e a profundidade teológica devem ser adequadas para o público-alvo selecionado (${questionsAgeGroup}).`;

      const responseSchema = {
        type: Type.OBJECT,
        properties: {
          questions: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                question: { type: Type.STRING },
                options: { 
                  type: Type.ARRAY,
                  items: { type: Type.STRING }
                },
                correctAnswerIndex: { type: Type.NUMBER },
                reference: { type: Type.STRING },
                difficulty: { type: Type.STRING }
              },
              required: ["question", "options", "correctAnswerIndex", "reference", "difficulty"]
            }
          }
        },
        required: ["questions"]
      };

      const parsed = await geminiService.generateJSON<{questions: QuizQuestion[]}>(prompt, undefined, responseSchema);
      
      if (parsed && parsed.questions && Array.isArray(parsed.questions)) {
        setQuizQuestions(parsed.questions);
        setIsQuizOpen(true);
        setQuestionsResult("Quiz gerado com sucesso! Clique no botão abaixo para jogar.");
      } else {
        setQuestionsResult("Não foi possível gerar as perguntas no formato correto.");
      }
      
      setQuestionsResultThought(""); // JSON doesn't return thought
      
      addToHistory({
        type: 'Perguntas Bíblicas',
        query: topic,
        result: "Quiz gerado com sucesso!",
        thought: "",
        tab: 'creation-tool',
        creationType: 'questions'
      });
    } catch (error: any) {
      console.error('Error generating questions:', error);
      showToast(error?.message || 'Erro ao gerar perguntas. Tente novamente.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateEbook = async () => {
    if (!topic) return;
    setIsLoading(true);
    setEbookResult('');
    setEbookResultThought('');
    showToast(getRandomWaitingMessage(), 'info');

    try {
      const prompt = `Crie um E-book completo, estruturado e bem escrito sobre o tema: "${topic}".
      O E-book deve conter:
      1. Título atraente
      2. Sumário (com os capítulos)
      3. Introdução
      4. Capítulos (mínimo de 3 capítulos, desenvolvendo bem o tema)
      5. Conclusão
      
      Formate o texto usando Markdown (## para capítulos, ### para subtítulos, etc).
      Certifique-se de que o conteúdo seja teologicamente rico e edificante.`;

      const response = await geminiService.generateTextWithThought(prompt, "Você é um autor cristão e teólogo experiente, especialista em escrever e-books edificantes.");
      
      if (response) {
        setEbookResult(response.text);
        setEbookResultThought(response.thought || '');
        addToHistory({
          type: 'E-book',
          query: topic,
          result: response.text,
          thought: response.thought,
          tab: 'creation-tool',
          creationType: 'ebook'
        });
        showToast("E-book gerado com sucesso! 🙌✨");
      }
    } catch (error: any) {
      console.error('Erro ao gerar e-book:', error);
      showToast(error?.message || 'Erro ao gerar e-book. Tente novamente.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateMessage = async () => {
    if (!topic) return;

    if (messageType === 'outline') {
      return handleGenerateOutline();
    } else if (messageType === 'devotional') {
      return handleCreateDevotional();
    }

    setIsLoading(true);
    showToast(getRandomWaitingMessage(), 'info');
    try {
      setMessageResult('');
      setSlidesResult('');
      let prompt = '';
      
      if (messageType === 'birthday') {
        prompt = `Gere uma Mensagem de Aniversário sobre o tema: ${topic}.
          Estruture a mensagem com um texto mais simples, poético e prático da bíblia. Mensagem curta aproximadamente 5 a 10 minutos. Utilize uma ilustração divertida e criativa. Aplique a palavra com conselhos práticos; Mensagem de motivação, ânimo, alegria e gratidão a Deus. Formate em Markdown.`;
      } else if (messageType === 'wedding') {
        prompt = `Gere uma Mensagem de Casamento sobre o tema: ${topic}.
          Estruture a mensagem com versículos e exemplos bíblicos que remetem ao casamento, relacionamento saudável, amor, reacender a paixão, dedicação, respeito, honra, aliança, amizade, renovo, combate ao egoísmo, ciúme, competição, empatia, o poder da fala: elogio e crítica, como servir ao cônjuge com alegria, encontrar sentido e prazer nas pequenas coisas, abrir mão de outros relacionamentos e projetos para se dedicar a família. Destaque que a família é um projeto de Deus e tem sofrido ataques de alguns pensadores da sociedade, mas a família é a base da sociedade e a base da igreja. cuidado com os futuros filhos, estruturar, dar o melhor, o primeiro ministério e mais importante é a nossa casa, se a casa não vai bem - a vida não vai bem ou está prestes a ruir. Mensagem com tempo médio de 20 a 25 minutos. Formate em Markdown.`;
      } else if (messageType === 'newyear') {
        prompt = `Gere uma Mensagem Fim do ano sobre o tema: ${topic}.
          Estruture a mensagem com um texto profético de bençãos, resgate de aliança, promessas, identidade como filho de Deus, herdeiro com Cristo, mensagem de motivação para o ano novo, ânimo, alegria e muita gratidão a Deus pelo ano que passou, meditar sobre o que deu certo e errado, como ser um cristão melhor, um servo melhor, um pai melhor, um filho melhor, um cidadão melhor, faça desafios para o ano novo, leve a pessoa sonhar e projetar com fé, determinação, amor e graça. Mensagem extensa 30 a 45 minutos. Utilize uma ilustração fácil associação com a sociedade atual. Formate em Markdown.`;
      } else if (messageType === 'graduation') {
        prompt = `Gere uma Mensagem Formatura sobre o tema: ${topic}.
          Estruture a mensagem com um texto de motivação, ânimo, alegria e muita gratidão a Deus pelo ano que passou, medite na responsabilidade do conhecimento de levar a práticas saudáveis e o comprometimento de melhorar o mundo e ser exemplo e boa influência para outros. Desafie o ouvinte, leve a pessoa sonhar e projetar com fé, determinação, confiança e em si mesmo. Desperte o potencial, fale de homens e mulheres da bíblia que foram heróis que fizeram a diferença e marcaram o seu tempo e as gerações futuras. Diga você é capaz! De fazer melhor e ser melhor! O Universo que Deus forjou é infinito de possibilidades e aprendizado e Ele começou a compartilhar com você os seus segredos. Utilize-os bem! Mensagem média 15 a 20 minutos. Utilize uma ilustração fácil associação com a sociedade atual, moderna e inteligente. Formate em Markdown.`;
      } else if (messageType === 'funeral') {
        prompt = `Gere uma Mensagem de Velório sobre o tema: ${topic}.
          Estruture a mensagem para os vivos e não para os mortos. Traga consolo a família e amigos, seja gentil, empático e amoroso. Fale da eternidade com Deus, plano de salvação, da realidade que todos vivemos que um dia também enfrentaremos a morte. Não julgue, não fale de inferno, não critique a família. Formate em Markdown.`;
      } else if (messageType === 'children') {
        prompt = `Gere uma Mensagem Infantil sobre o tema: ${topic}.
          Estruture a mensagem de forma básica, clara e com linguagem adequada para crianças. Utilize exemplos e ilustrações que façam parte do universo infantil (brincadeiras, escola, família, animais, natureza). Sugira termos e abordagens interativas para prender a atenção desse público. A mensagem deve ser curta (5 a 10 minutos) e transmitir um ensinamento bíblico prático e positivo. Formate em Markdown.`;
      }

      const response = await geminiService.generateTextWithThought(prompt, undefined, deepThinking);
      setMessageResult(response.text || "Não foi possível gerar a mensagem.");
      setMessageResultThought(response.thought);
      
      addToHistory({
        type: 'Mensagem',
        query: topic,
        result: response.text || '',
        thought: response.thought,
        tab: 'creation-tool',
        creationType: 'message'
      });
    } catch (error) {
      console.error(error);
      showToast("Erro ao gerar mensagem.", "error");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateInfographic = async () => {
    if (!topic) return;
    setIsLoading(true);
    try {
      const prompt = `Gere uma estrutura de infográfico detalhada para o tema: ${topic}. 
        Inclua: Título, Pontos Chave (com ícones sugeridos), Dados Estatísticos ou Bíblicos relevantes, e uma Conclusão Visual.
        Formate em Markdown estruturado.`;
      const response = await geminiService.generateTextWithThought(prompt, undefined, deepThinking);
      setCreationPopup({
        show: true,
        title: `Infográfico: ${topic}`,
        content: response.text || "Erro ao gerar infográfico."
      });
    } catch (error) {
      console.error(error);
      showToast("Erro ao gerar infográfico.", "error");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateSlidesPopup = async () => {
    if (!topic) return;
    setIsLoading(true);
    try {
      const prompt = `Gere um roteiro de slides profissional para o tema: ${topic}. 
        Inclua pelo menos 10 slides com: Título do Slide, Conteúdo em tópicos, e Sugestão de Imagem/Fundo para cada slide.
        Formate em Markdown estruturado.`;
      const response = await geminiService.generateTextWithThought(prompt, undefined, deepThinking);
      setCreationPopup({
        show: true,
        title: `Slides: ${topic}`,
        content: response.text || "Erro ao gerar slides."
      });
    } catch (error) {
      console.error(error);
      showToast("Erro ao gerar slides.", "error");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateBooklet = async () => {
    if (!topic) return;
    setIsLoading(true);
    setIsStoppingBooklet(false);
    stopBookletRef.current = false;
    setBookletResult('');
    setBookletProgress({ current: 0, total: 10, label: 'Iniciando geração da apostila...' });
    
    // Define selected resources
    const selectedBibles = [
      "Bíblia de Estudo Genebra",
      "Bíblia NVI de Estudo",
      "Bíblia de Estudo ACF",
      "Bíblia de Jerusalém (Versão Católica)",
      "Bíblia Thompson",
      "Bíblia Shedd",
      "Bíblia de Estudo Pentecostal",
      "Bíblia de Estudo Matthew Henry",
      "Bíblia de Estudo Aplicação Pessoal",
      "Bíblia de Estudo Max Lucado – (NVI, Leitura Perfeita)"
    ];
    const selectedCommentaries = [
      "Comentário Bíblico Beacon",
      "Comentário bíblico expositivo Wiersbe",
      "Comentário Bíblico Matthew Henry",
      "Comentário Bíblico Moody",
      "Comentário Bíblico Vida Nova"
    ];
    const selectedDictionaries = [
      "Dicionário Bíblico Tyndale",
      "Dicionário Bíblico Wycliffe",
      "Dicionário Vine"
    ];
    const selectedEncyclopedias = [
      "Enciclopédia Bíblica",
      "Enciclopédia de Bíblia, Teologia e Filosofia (Champlin)",
      "Enciclopédia Cultura Cristã — Merrill C. Tenney"
    ];

    setBookletProgress({ current: 0, total: 100, label: 'Analisando afinidade de autores...' });
    showToast(getRandomWaitingMessage(), 'info');
    showToast("Aviso: A geração de uma apostila completa é um processo complexo e pode demorar alguns minutos. 📚⏳", 'info');

    try {
      // Intelligent Author Selection
      const authorNames = GOSPEL_AUTHORS.map(a => a.name).join(', ');
      const affinityPrompt = `Dada a lista de autores: [${authorNames}], quais deles têm maior afinidade teológica ou literária com o tema "${topic}"? 
      Retorne APENAS os nomes dos autores selecionados (máximo 5), separados por vírgula. Se nenhum tiver afinidade clara, retorne apenas os 3 mais relevantes no contexto geral cristão.`;
      const affinityResponse = await geminiService.generateText(affinityPrompt, "Você é um curador de conteúdo teológico.");
      const selectedAuthors = affinityResponse?.split(',').map(s => s.trim()).filter(s => s) || [];

      const allSelectedResources = [
        ...selectedBibles.map(name => ({ name, cat: "Bíblia de Estudo" })),
        ...selectedCommentaries.map(name => ({ name, cat: "Comentário" })),
        ...selectedDictionaries.map(name => ({ name, cat: "Dicionário" })),
        ...selectedEncyclopedias.map(name => ({ name, cat: "Enciclopédia" })),
        ...selectedAuthors.map(name => ({ name, cat: "Visão do Autor" }))
      ];

      setBookletProgress({ current: 0, total: allSelectedResources.length, label: 'Gerando capa e sumário...' });

      let fullContent = "";
      let pageCount = 1;
      const sections: { title: string, page: number }[] = [];

      // 1. Simple Cover
      fullContent += `
<div style="text-align: center; padding: 120px 0; border: 2px solid #064e3b; margin-bottom: 50px; border-radius: 15px; background: #fff;">
  <h1 style="font-size: 56px; margin-bottom: 10px; color: #064e3b;">${topic.toUpperCase()}</h1>
  <div style="width: 100px; h-1px; background: #064e3b; margin: 30px auto;"></div>
  <p style="font-size: 20px; color: #444; font-weight: bold;">Apostila de Estudo Profundo</p>
  <p style="font-size: 16px; color: #888; margin-top: 60px; display: flex; align-items: center; justify-content: center; gap: 10px;">
   <img src="https://i.postimg.cc/3N279HyV/1000105226-removebg-preview.png" width="24" height="24" style="object-fit: contain;" referrerpolicy="no-referrer" />
   Gerado por **Imersão Bíblica IA**
   <img src="https://i.postimg.cc/3N279HyV/1000105226-removebg-preview.png" width="24" height="24" style="object-fit: contain;" referrerpolicy="no-referrer" />
 </p>
</div>
<div style="page-break-after: always;"></div>\n\n`;

      // Placeholder for TOC
      let tocContent = "# Sumário\n\n";
      
      const processBatch = async (items: {name: string, cat: string}[]) => {
        for (const item of items) {
          if (stopBookletRef.current) break;

          setBookletProgress(prev => ({ 
            ...prev, 
            current: prev.current + 1, 
            label: `Consultando ${item.cat}: ${item.name}...` 
          }));
          
          try {
            const prompt = `Forneça um estudo/comentário profundo sobre o tema "${topic}" baseado na fonte "${item.name}". Seja detalhado e fiel à perspectiva desta obra.`;
            const response = await geminiService.generateTextWithThought(prompt, `Você é um especialista em ${item.cat}.`, deepThinking);
            if (!bookletResultThought) setBookletResultThought(response.thought);
            pageCount++;
            const sectionTitle = `${item.cat} - ${item.name}`;
            sections.push({ title: sectionTitle, page: pageCount });
            
            fullContent += `\n\n---\n\n## Página ${pageCount}: ${sectionTitle}\n\n${response.text}\n\n<div style="text-align: right; font-size: 10px; color: #888; margin-top: 20px; display: flex; align-items: center; justify-content: flex-end; gap: 5px;"><img src="https://i.postimg.cc/3N279HyV/1000105226-removebg-preview.png" width="16" height="16" referrerpolicy="no-referrer" /> Imersão Bíblica IA - Página ${pageCount} <img src="https://i.postimg.cc/3N279HyV/1000105226-removebg-preview.png" width="16" height="16" referrerpolicy="no-referrer" /></div>\n\n<div style="page-break-after: always;"></div>\n\n`;
            
            // Build TOC dynamically
            let currentToc = "# Sumário\n\n";
            sections.forEach((s, idx) => {
              currentToc += `${idx + 1}. ${s.title} .................... Página ${s.page}\n\n`;
            });
            
            setBookletResult(currentToc + "\n\n<div style='page-break-after: always;'></div>\n\n" + fullContent);
          } catch (err) {
            console.error(`Error processing ${item.name}:`, err);
          }
        }
      };

      await processBatch(allSelectedResources);

      if (stopBookletRef.current) {
        fullContent += `\n\n---\n\n<div style="text-align: center; padding: 40px; border-top: 2px solid #ef4444; color: #ef4444;">\n\n### GERAÇÃO INTERROMPIDA PELO USUÁRIO\n\n</div>`;
      } else {
        fullContent += `\n\n---\n\n<div style="text-align: center; padding: 40px; border-top: 2px solid #064e3b;">\n\n### FIM DA APOSTILA\n\n<div style="display: flex; align-items: center; justify-content: center; gap: 10px;"><img src="https://i.postimg.cc/3N279HyV/1000105226-removebg-preview.png" width="32" height="32" referrerpolicy="no-referrer" /> Gerado por **Imersão Bíblica IA** <img src="https://i.postimg.cc/3N279HyV/1000105226-removebg-preview.png" width="32" height="32" referrerpolicy="no-referrer" /></div>\n\n</div>`;
      }
      
      // Final TOC construction
      let finalToc = "# Sumário\n\n";
      sections.forEach((s, idx) => {
        finalToc += `${idx + 1}. ${s.title} .................... Página ${s.page}\n\n`;
      });

      setBookletResult(finalToc + "\n\n<div style='page-break-after: always;'></div>\n\n" + fullContent);
      showToast(stopBookletRef.current ? "Geração interrompida." : "Apostila gerada com sucesso! 📚✅", stopBookletRef.current ? 'info' : 'success');
      
      if (!stopBookletRef.current) {
        addToHistory({
          type: 'Apostila',
          query: topic,
          result: finalToc + "\n\n<div style='page-break-after: always;'></div>\n\n" + fullContent,
          thought: bookletResultThought,
          tab: 'creation-tool',
          creationType: 'booklet'
        });
      }
    } catch (error) {
      console.error(error);
      showToast("Erro ao gerar apostila.", 'error');
    } finally {
      setIsLoading(false);
      setIsStoppingBooklet(false);
      setBookletProgress({ current: 0, total: 0, label: '' });
    }
  };

  const handleDownloadEbookPDF = async () => {
    const element = document.getElementById('ebook-content');
    if (!element) return;

    setIsGeneratingPDF(true);
    showToast("Gerando seu E-book PDF... Isso pode levar um momento. 📄💎", 'info');
    try {
      const opt = {
        margin:       15,
        filename:     `ebook-${(topic || "estudo").replace(/\s+/g, '_')}.pdf`,
        image:        { type: 'jpeg' as const, quality: 0.98 },
        html2canvas:  { 
          scale: 2, 
          useCORS: true,
          logging: false
        },
        jsPDF:        { unit: 'mm', format: 'a4', orientation: 'portrait' as const },
        pagebreak:    { mode: ['avoid-all', 'css', 'legacy'] }
      };

      // @ts-ignore
      await html2pdf().set(opt).from(element).save();
      showToast("E-book PDF gerado com sucesso! 📄🎉", 'success');
    } catch (error) {
      console.error('Erro ao gerar PDF:', error);
      showToast("Erro ao gerar PDF.", 'error');
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  const handleDownloadBookletPDF = async () => {
    const element = document.getElementById('booklet-content');
    if (!element) return;

    setIsGeneratingPDF(true);
    showToast("Gerando seu Ebook PDF... Isso pode levar um momento. 📄💎", 'info');
    try {
      const opt = {
        margin:       15,
        filename:     `apostila-${(topic || "estudo").replace(/\s+/g, '_')}.pdf`,
        image:        { type: 'jpeg' as const, quality: 0.98 },
        html2canvas:  { 
          scale: 2, 
          useCORS: true,
          onclone: (clonedDoc: Document) => {
            const style = clonedDoc.createElement('style');
            style.innerHTML = `
              * {
                color: #1c1917 !important;
                background-color: #ffffff !important;
                border-color: #e7e5e4 !important;
              }
              .prose * {
                color: inherit !important;
              }
              /* Fix for overlapping lines in markdown */
              .prose p, .prose li, .prose h1, .prose h2, .prose h3, .prose h4 {
                page-break-inside: avoid;
              }
            `;
            clonedDoc.head.appendChild(style);
          }
        },
        jsPDF:        { unit: 'mm', format: 'a4', orientation: 'portrait' as const },
        pagebreak:    { mode: ['avoid-all', 'css', 'legacy'] }
      };

      await html2pdf().set(opt).from(element).save();
      showToast("Ebook baixado com sucesso! 📚✅");
    } catch (error) {
      console.error('Erro ao gerar PDF:', error);
      showToast("Erro ao gerar PDF.", 'error');
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  const stopBooklet = () => {
    stopBookletRef.current = true;
    setIsStoppingBooklet(true);
    showToast("Interrompendo geração... Aguarde o processo atual finalizar.", 'info');
  };

  const handleDownloadNote = (note: { title: string, content: string }) => {
    const element = document.createElement("a");
    const file = new Blob([`TÍTULO: ${note.title}\n\n${note.content}`], {type: 'text/plain'});
    element.href = URL.createObjectURL(file);
    element.download = `${(note.title || "nota").toLowerCase().replace(/\s+/g, '-')}.txt`;
    document.body.appendChild(element);
    element.click();
    showToast("Baixando página... 📄");
  };

  const handleShareNote = async (note: { title: string, content: string }) => {
    await share({
      title: note.title,
      text: note.content,
    });
  };

  const [relatedResources, setRelatedResources] = useState<{ title: string, type: string, url: string }[]>([]);
  const [isGeneratingResources, setIsGeneratingResources] = useState(false);
  const [isEditingStoriesTheater, setIsEditingStoriesTheater] = useState(false);
  const [editedStoriesTheaterResult, setEditedStoriesTheaterResult] = useState<{ theater?: string, stories?: string, bibleStory?: string } | null>(null);

  const generateRelatedResources = async (query: string) => {
    if (!query) return;
    setIsGeneratingResources(true);
    try {
      const prompt = `Com base no tema ou versículo bíblico "${query}", sugira 4 a 6 recursos relacionados de alta relevância.
      Os recursos devem incluir:
      - Comentários de estudo (ex: Matthew Henry, Shedd)
      - Artigos teológicos (ex: Justificação pela fé, Contexto histórico)
      - Mapas bíblicos pertinentes (ex: Viagens de Paulo, Êxodo)
      - Enciclopédias ou Dicionários
      
      Retorne os resultados estritamente no formato JSON:
      [
        { "title": "Título do Recurso", "type": "Tipo (Mapa, Artigo, Comentário, etc.)", "url": "search:termo_para_pesquisa" }
      ]
      No campo "url", use o prefixo "search:" seguido do termo que deve ser pesquisado no app para encontrar esse recurso.`;

      const response = await geminiService.generateText(prompt, "Você é um bibliotecário teológico especializado em recursos bíblicos.");
      // Extract JSON from response
      const jsonMatch = response.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        const resources = JSON.parse(jsonMatch[0]);
        setRelatedResources(resources);
      }
    } catch (error) {
      console.error("Error generating related resources:", error);
    } finally {
      setIsGeneratingResources(false);
    }
  };

  const handleWikiSearch = async (query?: string) => {
    const q = query || wikiQuery;
    if (!q) return;
    
    setIsLoading(true);
    setWikiQuery(q);
    showToast(getRandomWaitingMessage(), 'info');
    
    try {
      const prompt = `Crie uma página de enciclopédia (estilo Wiki) completa e profunda sobre o tema: "${q}".
      A página deve ser estruturada com:
      - Título Principal
      - Resumo Introdutório
      - Seções detalhadas (História, Significado Teológico, Contexto Bíblico, etc.)
      - Referências Cruzadas
      
      IMPORTANTE: Ao longo de TODO o texto, você DEVE transformar termos teológicos, personagens bíblicos e conceitos importantes em links clicáveis.
      O formato OBRIGATÓRIO do link é [Termo](search:Termo).
      Exemplo: "...o sacrifício de [Jesus](search:Jesus) na cruz..."
      
      No final de cada seção ou no rodapé, insira uma seção "Saiba mais" com vários links no formato [Termo](search:Termo) para permitir uma navegação infinita.
      Use um tom acadêmico, porém acessível e profundamente teológico.`;
      
      const response = await geminiService.generateTextWithThought(prompt, "Você é um enciclopedista teológico e historiador bíblico.", deepThinking);
      setWikiResult(response.text);
      setWikiResultThought(response.thought);
      if (activeTab !== 'wiki') {
        setPreviousTab(activeTab);
        setActiveTab('wiki');
      }
    } catch (error) {
      console.error(error);
      showToast("Erro ao explorar a Wiki.", 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleListen = async (text: string, isEmotive: boolean = false) => {
    if (!text) return;
    setPendingSpeechText(isEmotive ? `Narrar com emoção e dramaticidade: ${text}` : text);
    setIsAudioConfirmModalOpen(true);
  };

  const confirmGenerateSpeech = async () => {
    if (!pendingSpeechText) return;
    
    // Stop previous audio if playing
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }

    setIsAudioConfirmModalOpen(false);
    setIsGeneratingSpeech(true);
    showToast("Preparando a voz da IA... 🔊📖", 'info');
    try {
      const audioUrl = await geminiService.generateSpeech(pendingSpeechText);
      if (audioUrl) {
        const audio = new Audio(audioUrl);
        audioRef.current = audio;
        audio.oncanplaythrough = () => {
          audio.play().catch(e => console.error("Error playing audio:", e));
        };
        showToast("Iniciando leitura... Ouça com atenção! 🔊✨", 'success');
        
        audio.onended = () => {
          audioRef.current = null;
        };
      } else {
        showToast("Erro ao gerar áudio. Tente um texto mais curto.", 'error');
      }
    } catch (error) {
      console.error(error);
      showToast("Erro ao gerar áudio.", 'error');
    } finally {
      setIsGeneratingSpeech(false);
      setPendingSpeechText(null);
    }
  };

  const handleGenerateMeaning = async () => {
    if (!meaningQuery.trim()) return;
    setIsGeneratingMeaning(true);
    setMeaningResult('');
    setMeaningResultThought('');
    showToast(getRandomWaitingMessage(), 'info');
    
    try {
      const response = await geminiService.generateMeaning(meaningQuery, selectedModel, deepThinking);
      setMeaningResult(response.text);
      setMeaningResultThought(response.thought);
      showToast("Significado gerado com sucesso! 🧠✨");
    } catch (error) {
      console.error(error);
      showToast("Erro ao gerar significado.", 'error');
    } finally {
      setIsGeneratingMeaning(false);
    }
  };

  const handleMeaningSearch = async (isFollowUp: boolean = false, forceDeep: boolean = false) => {
    const query = isFollowUp ? followUpQuery : searchQuery;
    if (!query) return;
    
    setIsLoading(true);
    showToast(getRandomWaitingMessage(), 'info');
    try {
      if (!isFollowUp) {
        setMeaningResult('');
        setMeaningHistory([]);
      }
      
      let systemInstruction = "Você é um especialista em teologia, linguística e história bíblica.";
      let prompt = "";

      const sourcesStr = selectedMeaningSources.length > 0 ? selectedMeaningSources.join(', ') : 'Dicionário Aurélio';
      const isAI = forceDeep || selectedMeaningSources.some(s => s.includes('Gemini') || s.includes('ChatGPT') || s.includes('IA'));

      if (isAI) {
        systemInstruction = "Você é um especialista reconhecido mundialmente em línguas originais bíblicas (Hebraico, Aramaico e Grego) e em Religião Comparada.";
        
        prompt = isFollowUp 
          ? `Pergunta de acompanhamento sobre o estudo léxico/comparativo: "${query}"`
          : `Forneça um estudo léxico e comparativo profundo para a palavra ou conceito: "${query}".

Estruture sua resposta obrigatoriamente com as seguintes seções (use negrito para os títulos):

1. **Léxico e Etimologia**: Explique o termo na língua original (transliteração e caracteres originais), sua raiz etimológica e como ele se conecta a outras palavras relacionadas.
2. **Uso e Contexto Bíblico**: Como essa palavra é empregada no Antigo e Novo Testamento. Existe mudança de significado entre os testamentos ou autores? Cite versículos-chave.
3. **Dicionários e Referências**: O que dizem os léxicos de autoridade (como Strong, Vine, Wycliffe ou TDNT - Dicionário Teológico do Novo Testamento).
4. **Perspectiva e Comparação Religiosa**: Como este termo ou conceito é visto no Judaísmo Contemporâneo, Islamismo, Catolicismo Romano, Espiritismo ou religiões orientais (se houver paralelo relevante). Destaque semelhanças e divergências fundamentais.
5. **Aplicação Acadêmica e Devocional**: Uma síntese do valor desse estudo para o entendimento teológico e uma aplicação pastoral prática.

Utilize as seguintes fontes como base adicional: ${sourcesStr}. Use Markdown para formatação rica.`;
      } else {
        prompt = `Forneça a definição e o significado de "${query}" de acordo com o padrão das seguintes fontes: ${sourcesStr}. Inclua etimologia e exemplos se possível.`;
      }

      const response = await geminiService.chat(prompt, meaningHistory, systemInstruction, deepThinking);
      
      setMeaningResult(response.text);
      setMeaningResultThought(response.thought);
      
      const newHistory = [
        ...meaningHistory,
        { role: 'user', parts: [{ text: prompt }] },
        { role: 'model', parts: [{ text: response.text }] }
      ];
      setMeaningHistory(newHistory);
      setFollowUpQuery('');
    } catch (error) {
      console.error(error);
      setMeaningResult('Erro ao buscar significado.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = async (source?: string, overrideQuery?: string, overrideTab?: string) => {
    const query = overrideQuery || searchQuery || topic;
    if (!query && !source) return;
    
    const searchSource = source || loadingSource;
    const currentTab = overrideTab || activeTab;

    if (isOffline) {
      const offlineId = `${searchSource}-${query}`;
      const offlineData = downloadedChapters.find(c => c.id === offlineId) || downloadedMaterials.find(m => m.id === offlineId);
      
      if (offlineData) {
        setResult(offlineData.content);
        showToast("Carregado do modo offline! 📶", "info");
        return;
      } else {
        showToast("Conteúdo não disponível offline. Conecte-se para pesquisar.", "error");
        return;
      }
    }
    
    setIsLoading(true);
    
    if (searchSource) {
      setLoadingSource(searchSource);
      showToast(getRandomWaitingMessage(), 'info');
      if (deepThinking) {
        showToast("Aviso: O modo 'Pensamento Profundo' pode levar mais tempo para processar. 🧠⏳", 'info');
      }
    } else {
      showToast(getRandomWaitingMessage(), 'info');
      if (deepThinking) {
        showToast("Aviso: O modo 'Pensamento Profundo' pode levar mais tempo para processar. 🧠⏳", 'info');
      }
    }

    try {
      setResult('');
      setResultThought('');
      setSlidesResult('');
      let responseText = '';
      let responseThought = '';

      if (currentTab === 'religions') {
        const religionPrompt = `
        Termo pesquisado: "${query || 'Geral'}"
        Fonte selecionada: "${searchSource}"
        
        Forneça informações e explicações detalhadas sobre o tema ou assunto "${query || 'Geral'}" sob a perspectiva do livro sagrado "${searchSource}". 
        Explique o contexto, a visão desta religião e como este tema é abordado em seus textos sagrados.
        
        IMPORTANTE: Se não houver uma referência direta e explícita nos textos sagrados desta fonte para este termo exato, você DEVE:
        1. Sugerir conceitos ou ensinamentos desta religião que se aproximem do tema.
        2. Oferecer insights teológicos comparativos.
        3. Sugerir versículos bíblicos (da Bíblia Cristã) que abordem o tema de forma complementar ou contrastante.
        4. Propor estudos relacionados para aprofundamento.`;
        const response = await geminiService.generateTextWithThought(religionPrompt, "Você é um especialista em religiões comparadas e teologia.", deepThinking);
        responseText = response.text;
        responseThought = response.thought;
      } else if (currentTab === 'compare') {
        const versionsStr = selectedCompareVersions.length > 0 ? selectedCompareVersions.join(', ') : 'Almeida';
        const response = await geminiService.generateTextWithThought(`Compare o texto bíblico "${query}" na versão NVI (Nova Versão Internacional em Português) com as seguintes versões: ${versionsStr}. Apresente o texto de todas as versões e explique as nuances de tradução. Se alguma versão comparada for estrangeira (como KJV), apresente o texto original e sua tradução.`, undefined, deepThinking);
        responseText = response.text;
        responseThought = response.thought;
      } else if (searchSource) {
        // Specific source search from Bibles tab
        let prompt = `
        Termo pesquisado: "${query || 'Geral'}"
        Fonte selecionada: "${searchSource}"
        
        `;
        const isTranslation = searchSource.includes('KJV') || 
                              searchSource.includes('ARC') || 
                              searchSource.includes('NVI') || 
                              searchSource.includes('NVT') || 
                              searchSource.includes('ARA') || 
                              searchSource.includes('ACF') || 
                              searchSource.includes('Nova Vida') || 
                              searchSource.includes('Bíblia Viva') || 
                              searchSource.includes('Reina Valera') || 
                              searchSource.includes('RVR1960') ||
                              searchSource.includes('NIV') || 
                              searchSource.includes('ESV') || 
                              searchSource.includes('NKJV') || 
                              searchSource.includes('NASB') || 
                              searchSource.includes('NLT') || 
                              searchSource.includes('NRSV') || 
                              searchSource.includes('Louis Segond') || 
                              searchSource.includes('Lutherbibel') ||
                              searchSource.includes('Tradução do Novo mundo');

        if (isTranslation && !searchSource.includes('Bíblia de Estudo')) {
          prompt += `Se "${query || 'Geral'}" for uma referência bíblica (ex: João 3:16), forneça o texto bíblico exato da passagem na versão/tradução "${searchSource}". 
          Se for um tema (ex: Amor, Fé), forneça os principais versículos sobre este tema usando o texto exato da versão/tradução "${searchSource}".
          Se a versão for em outro idioma (como KJV em inglês ou Reina Valera em espanhol), forneça o texto no idioma original da versão e, em seguida, forneça uma tradução ou explicação em Português do Brasil.
          Se a versão for em português (como ARC, NVI, NVT, ARA, ACF, Nova Vida, Bíblia Viva), forneça o texto exato em Português do Brasil e um breve comentário explicativo.`;
        } else if (searchSource === 'Todas as Bíblias') {
          prompt += `Forneça um comentário bíblico consolidado e profundo sobre a passagem ou tema: ${query || 'Geral'}. 
          Sua pesquisa deve se concentrar exclusivamente em Bíblias de Estudo (como Shedd, Thompson, Genebra, Pentecostal, NAA, NVT, etc.). 
          Apresente as diferentes nuances teológicas encontradas nessas fontes de estudo.`;
        } else if (searchSource === 'Todos os Comentários') {
          prompt += `Forneça um comentário bíblico consolidado e profundo sobre a passagem ou tema: ${query || 'Geral'}. 
          Sua pesquisa deve se concentrar exclusivamente em Comentários Bíblicos (como Beacon, Matthew Henry, Moody, Vida Nova, Série Cultura Bíblica, etc.).`;
        } else if (searchSource === 'Todos os Dicionários') {
          prompt += `Forneça o significado e o contexto bíblico para a palavra ou tema: ${query || 'Geral'}. 
          Sua pesquisa deve se concentrar exclusivamente em Dicionários Bíblicos (como Tyndale, Wycliffe, Almeida, John Davis, Vine, etc.).`;
        } else if (searchSource === 'Todas as Enciclopédias') {
          prompt += `Forneça uma explicação enciclopédica detalhada sobre o tema ou assunto: ${query || 'Geral'}. 
          Sua pesquisa deve se concentrar exclusivamente em Enciclopédias Bíblicas (como Bíblica, Cultura Cristã, Champlin, etc.).`;
        } else if (searchSource === 'Todos os Recursos') {
          prompt += `Forneça um estudo bíblico exaustivo e completo sobre a passagem ou tema: ${query || 'Geral'}. 
          Sua pesquisa deve integrar informações de todas as fontes disponíveis: Bíblias de Estudo, Comentários, Dicionários e Enciclopédias. 
          Seja o mais detalhado possível.`;
        } else if (searchSource.includes(',')) {
          prompt += `Forneça um estudo bíblico detalhado sobre a passagem ou tema: ${query || 'Geral'}. 
          Sua pesquisa deve integrar informações das seguintes fontes selecionadas: ${searchSource}.
          Apresente as diferentes nuances teológicas encontradas nessas fontes.`;
        } else if (searchSource.includes('A Mensagem')) {
          prompt += `Forneça o comentário e a perspectiva da "Bíblia de Estudo A Mensagem" (Eugene H. Peterson) para a passagem ou tema: ${query || 'Geral'}. Se não houver uma passagem específica, explique a visão de Peterson sobre o tema.`;
        } else if (searchSource.includes('Shedd')) {
          prompt += `Forneça o comentário bíblico do Dr. Russel Shedd para a passagem ou tema: ${query || 'Geral'}. Se não houver uma passagem específica, explique a visão teológica de Shedd sobre o tema.`;
        } else {
          prompt += `Forneça o comentário bíblico da fonte "${searchSource}" para a passagem ou tema: ${query || 'Geral'}.`;
        }

        prompt += `
        
        IMPORTANTE: Se não houver uma referência direta e explícita nesta fonte específica para este termo exato, você DEVE:
        1. Sugerir versículos bíblicos relacionados ao tema.
        2. Propor estudos bíblicos que abordem o assunto.
        3. Oferecer insights teológicos baseados no contexto geral das Escrituras.
        4. Explicar por que a fonte pode não abordar o termo diretamente (ex: termo moderno, conceito implícito).`;

        const response = await geminiService.generateTextWithThought(prompt, undefined, deepThinking);
        responseText = response.text;
        responseThought = response.thought;
      } else {
        // General search - prioritize A Mensagem
        const response = await geminiService.generateTextWithThought(`
        Termo pesquisado: "${query}"
        Fonte selecionada: "Geral (Priorizando Bíblia de Estudo A Mensagem, Shedd, Thompson, Genebra)"
        
        Forneça comentários bíblicos detalhados sobre: ${query}. 
        Priorize a perspectiva da "Bíblia de Estudo A Mensagem" (Eugene H. Peterson). 
        Use também fontes como Shedd, Thompson e Genebra.
        Se não houver resultados diretos, sugira versículos, estudos e insights teológicos.`, undefined, deepThinking);
        responseText = response.text;
        responseThought = response.thought;
      }

      setResult(responseText);
      setResultThought(responseThought);
      
      if (activeTab === 'bibles') {
        generateRelatedResources(query);
      }
      
      addToHistory({
        type: activeTab === 'bibles' ? 'Bíblia' : activeTab === 'authors' ? 'Autor' : activeTab === 'religions' ? 'Religião' : 'Comparação',
        query: query || searchQuery,
        result: responseText,
        thought: responseThought,
        tab: activeTab
      });
    } catch (error) {
      console.error(error);
      setResult('Ocorreu um erro ao processar sua solicitação.');
    } finally {
      setIsLoading(false);
      setLoadingSource(null);
    }
  };

  const handleCopy = (text?: string) => {
    const contentToCopy = text || result;
    copyToClipboard(contentToCopy);
    showToast("Copiado! Agora é só colar onde quiser! 📋✨");
  };

  const handleDownloadElement = async (element: HTMLElement | null, title: string) => {
    if (!element) return;
    showToast("Preparando seu arquivo... Ficou lindo! 📄💎", 'info');
    try {
      const opt = {
        margin:       15,
        filename:     `${(title || "estudo").toLowerCase().replace(/\s+/g, '_')}_${new Date().getTime()}.pdf`,
        image:        { type: 'jpeg' as const, quality: 0.98 },
        html2canvas:  { 
          scale: 2, 
          useCORS: true,
          onclone: (clonedDoc: Document) => {
            const style = clonedDoc.createElement('style');
            style.innerHTML = `
              * {
                color: #1c1917 !important;
                background-color: #ffffff !important;
                border-color: #e7e5e4 !important;
              }
              .prose * {
                color: inherit !important;
              }
              /* Fix for overlapping lines in markdown */
              .prose p, .prose li, .prose h1, .prose h2, .prose h3, .prose h4 {
                page-break-inside: avoid;
              }
            `;
            clonedDoc.head.appendChild(style);
          }
        },
        jsPDF:        { unit: 'mm', format: 'a4', orientation: 'portrait' as const },
        pagebreak:    { mode: ['avoid-all', 'css', 'legacy'] }
      };

      await html2pdf().set(opt).from(element).save();
      showToast("Download concluído! 🙌✨");
    } catch (err) {
      console.error('Erro ao gerar PDF:', err);
      showToast("Erro ao gerar PDF.", 'error');
    }
  };

  const handleDownloadResult = () => {
    let title = 'Estudo_Biblico';
    if (activeTab === 'creation-tool') {
      if (creationType === 'lesson') title = showLeaderGuide ? 'Guia_do_Lider' : 'Licao_Celula';
      else if (creationType === 'study') title = 'Estudo_Biblico';
      else if (creationType === 'outline') title = 'Esboco_Pregacao';
      else if (creationType === 'devotional') title = 'Devocional';
      else if (creationType === 'debate') title = 'Debate';
      else if (creationType === 'booklet') title = 'Apostila';
      else if (creationType === 'ebook') title = 'Ebook';
      else if (creationType === 'message') title = 'Mensagem';
      else if (creationType === 'infographic') title = 'Infografico';
      else if (creationType === 'slides_notebook') title = 'Slides';
      else if (creationType === 'kids_ministry') title = 'Ministerio_Infantil';
      else if (creationType === 'audio') title = 'Audio';
    } else if (activeTab === 'wiki') {
      title = 'Wiki_Biblica';
    } else if (activeTab === 'authors') {
      title = 'Visao_do_Autor';
    } else if (activeTab === 'religions') {
      title = 'Visao_Outras_Religioes';
    }
    handleDownloadElement(bibleResultRef.current, title);
  };

  const handleShareContent = async (title: string, text: string) => {
    await share({
      title: title,
      text: text,
    });
  };

  const getShareData = () => {
    let contentToShare = result;
    let titleToShare = 'Comentário Bíblico';

    if (activeTab === 'creation-tool') {
      if (creationType === 'lesson') { contentToShare = showLeaderGuide ? leaderGuide : lessonResult; titleToShare = showLeaderGuide ? 'Guia do Líder' : 'Lição Célula'; }
      else if (creationType === 'study') { contentToShare = studyResult; titleToShare = 'Estudo Bíblico'; }
      else if (creationType === 'outline') { contentToShare = outline; titleToShare = 'Esboço Pregação'; }
      else if (creationType === 'devotional') { contentToShare = devotionalResult; titleToShare = 'Devocional'; }
      else if (creationType === 'debate') { contentToShare = debateResult; titleToShare = 'Debate'; }
      else if (creationType === 'booklet') { contentToShare = bookletResult; titleToShare = 'Apostila'; }
      else if (creationType === 'ebook') { contentToShare = ebookResult; titleToShare = 'Ebook'; }
      else if (creationType === 'message') { contentToShare = messageResult; titleToShare = 'Mensagem'; }
      else if (creationType === 'infographic') { contentToShare = ''; titleToShare = 'Infográfico'; }
      else if (creationType === 'slides_notebook') { contentToShare = slidesResult; titleToShare = 'Slides'; }
      else if (creationType === 'kids_ministry') { contentToShare = kidsResult?.children || ''; titleToShare = 'Ministério Infantil'; }
      else if (creationType === 'audio') { contentToShare = ''; titleToShare = 'Áudio'; }
    } else if (activeTab === 'kids_ministry') {
      const isImage = kidsActiveTab === 'illustration';
      contentToShare = isImage ? kidsIllustration || '' : (kidsActiveTab === 'children' ? (kidsResult?.children || '') : kidsActiveTab === 'monitors' ? (kidsResult?.monitors || '') : (kidsResult?.activities || ''));
      titleToShare = `Ministério Infantil - ${kidsActiveTab}`;
    } else if (activeTab === 'stories_theater') {
      contentToShare = storiesTheaterActiveTab === 'theater' ? storiesTheaterResult?.theater || '' :
                       storiesTheaterActiveTab === 'stories' ? storiesTheaterResult?.stories || '' :
                       storiesTheaterResult?.bibleStory || '';
      titleToShare = 'Histórias & Teatro';
    } else if (activeTab === 'commentary') {
      contentToShare = commentaryResult;
      titleToShare = 'Comentário Bíblico';
    } else if (activeTab === 'compare') {
      contentToShare = result;
      titleToShare = 'Comparação de Versões';
    } else if (activeTab === 'significado') {
      contentToShare = meaningResult;
      titleToShare = 'Significados';
    } else if (activeTab === 'wiki') {
      contentToShare = wikiResult;
      titleToShare = 'Wiki Bíblica';
    } else if (activeTab === 'authors') {
      contentToShare = result;
      titleToShare = 'Visão do Autor';
    } else if (activeTab === 'religions') {
      contentToShare = result;
      titleToShare = 'Visão de Outras Religiões';
    } else if (activeTab === 'verse-search') {
      contentToShare = verseContent;
      titleToShare = verseSearch;
    }

    return { title: titleToShare, text: contentToShare || '' };
  };

  const handleShareResult = () => {
    const { title, text } = getShareData();
    if (text) {
      handleShareContent(title, text);
    } else {
      showToast("Nada para compartilhar.", "error");
    }
  };

  const handleSaveDraft = () => {
    const draft = {
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      type: creationType,
      topic: topic,
      content: result || lessonResult || studyResult || outline || devotionalResult || debateResult || bookletResult,
      date: new Date().toLocaleDateString('pt-BR')
    };

    const savedDrafts = localStorage.getItem('app_drafts');
    const drafts = savedDrafts ? JSON.parse(savedDrafts) : [];
    drafts.push(draft);
    localStorage.setItem('app_drafts', JSON.stringify(drafts));
    showToast("Rascunho salvo com sucesso! 📝✨");
  };

  const [generatedResourceImage, setGeneratedResourceImage] = useState<string | null>(null);
  const [isEditingKidsResult, setIsEditingKidsResult] = useState(false);
  const [editedKidsResult, setEditedKidsResult] = useState<any>(null);
  const [isResourceImageModalOpen, setIsResourceImageModalOpen] = useState(false);
  const [resourceImageSource, setResourceImageSource] = useState('');
  const [resourceStudyResult, setResourceStudyResult] = useState('');

  const handleSaveKidsEdit = () => {
    setKidsResult(editedKidsResult);
    setIsEditingKidsResult(false);
    showToast("Alterações salvas! ✨");
  };

  const handleCancelKidsEdit = () => {
    setEditedKidsResult(kidsResult);
    setIsEditingKidsResult(false);
  };

  const handleGenerateResourceImage = async (resourceTitle: string) => {
    setIsLoading(true);
    try {
      const imagePrompt = `Gere uma imagem teológica e histórica detalhada sobre o tema: "${resourceTitle}". 
      A imagem deve ser baseada nas descrições e mapas das Bíblias de Estudo de Genebra, Bíblia de Estudo NVI, Bíblia de Estudo Almeida e Bíblia de Estudo de Jerusalém.
      Estilo: Ilustração histórica realista, com cores sóbrias e detalhes arqueológicos.`;
      
      const imageResponse = await geminiService.generateImage(imagePrompt);
      
      const studyPrompt = `Forneça um estudo detalhado sobre o tema: "${resourceTitle}". 
      Pesquise fielmente nas seguintes fontes: Bíblia de Estudo de Genebra, Bíblia de Estudo NVI, Bíblia de Estudo Almeida, Bíblia de Estudo de Jerusalém, enciclopédias, dicionários e comentários bíblicos.
      O texto deve ser rico em detalhes históricos, geográficos e teológicos.`;
      
      const studyResponse = await geminiService.generateText(studyPrompt, "Você é um renomado teólogo e historiador bíblico.");

      if (imageResponse) {
        setGeneratedResourceImage(imageResponse);
        setResourceStudyResult(studyResponse || '');
        setResourceImageSource(`Fontes: Bíblias de Estudo Genebra, NVI, Almeida, Jerusalém e Enciclopédias Bíblicas. 
        Adaptação App Imersão Bíblica IA`);
        setIsResourceImageModalOpen(true);
      }
    } catch (error) {
      console.error(error);
      showToast("Erro ao processar recurso. Tente novamente.", 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGenerateOutline = async (overrideTopic?: string) => {
    const targetTopic = overrideTopic || topic;
    if (!targetTopic) return;
    setIsLoading(true);
    showToast(getRandomWaitingMessage(), 'info');
    try {
      setOutline('');
      setOutlineThought('');
      setSlidesResult('');
      const response = await geminiService.generateOutlineWithThought(targetTopic, deepThinking);
      setOutline(response.text);
      setOutlineThought(response.thought);
      setEditedOutline(response.text);
      
      addToHistory({
        type: 'Esboço',
        query: topic,
        result: response.text,
        thought: response.thought,
        tab: 'creation-tool',
        creationType: 'outline'
      });
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle URL search parameters
  useEffect(() => {
    const search = searchParams.get('search');
    const outlineParam = searchParams.get('outline');
    const tabParam = searchParams.get('tab');
    const wikiParam = searchParams.get('wikiQuery');

    // Skip if we've already processed these exact parameters
    if (search === processedParams.current.search && 
        outlineParam === processedParams.current.outline && 
        tabParam === processedParams.current.tab &&
        !wikiParam) return;

    if (wikiParam) {
      setWikiQuery(wikiParam);
      setActiveTab('wiki');
      handleWikiSearch(wikiParam);
      // Clear params to avoid re-triggering
      setSearchParams({}, { replace: true });
      return;
    }

    // Update ref immediately to prevent re-entry
    processedParams.current = { search, outline: outlineParam, tab: tabParam };

    if (tabParam && tabParam !== activeTab) {
      setActiveTab(tabParam);
    }

    if (search) {
      setSearchQuery(search);
      handleSearch(undefined, search, tabParam || activeTab);
      // Clear params to avoid re-triggering
      setSearchParams({}, { replace: true });
    } else if (outlineParam) {
      setTopic(outlineParam);
      handleGenerateOutline(outlineParam);
      setSearchParams({}, { replace: true });
    }
  }, [searchParams, activeTab]);

  useEffect(() => {
    if (result || verseContent || messageResult || meaningResult || wikiResult || lessonResult || musicResult || narrationAudio) {
      resultRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [result, verseContent, messageResult, meaningResult, wikiResult, lessonResult, musicResult, narrationAudio]);

  const handleCreateLesson = async () => {
    if (!topic) return;
    setIsLoading(true);
    showToast(getRandomWaitingMessage(), 'info');
    try {
      setLessonResult('');
      setLeaderGuide('');
      setSlidesResult('');
      const lessonPrompt = `Crie uma lição bíblica completa sobre o tema: "${topic}". 
      Siga rigorosamente esta estrutura:
      - Tema
      - Versículo chave
      - Objetivos
      - Bate papo (uma pergunta prática e interativa sobre o assunto)
      - Introdução
      - Ilustração
      - Desenvolvimento (entre 250 a 300 palavras)
      - Conclusão (resumo com aplicação prática)
      - Oração
      - Perguntas para discussão em grupo
      - Desafio da semana
      Use um tom inspirador e educativo.`;

      const guidePrompt = `Crie um "Guia do Líder" para a lição sobre: "${topic}". 
      Deve conter:
      - Aprofundamento da lição (mais referências bíblicas, use fontes de bíblias de estudo, dicionários e enciclopédias)
      - Perguntas retóricas
      - Perguntas de aprofundamento
      - Perguntas práticas
      - Dicas de evangelismo (ganchos que o assunto apresenta)
      - Dicas de como ministrar a lição
      - Sugestão de quebra gelo (brincadeiras para descontrair e ensinar)
      Seja profundo e técnico, mas útil para o líder.`;

      const [lessonRes, guideRes] = await Promise.all([
        geminiService.generateTextWithThought(lessonPrompt, "Você é um educador cristão e teólogo.", deepThinking),
        geminiService.generateTextWithThought(guidePrompt, "Você é um mentor de líderes e teólogo experiente.", deepThinking)
      ]);

      setLessonResult(lessonRes.text);
      setLessonResultThought(lessonRes.thought);
      setLeaderGuide(guideRes.text);
      setLeaderGuideThought(guideRes.thought);
      showToast("Lição e Guia do Líder gerados com sucesso! 🙌📖");

      addToHistory({
        type: 'Lição',
        query: topic,
        result: lessonRes.text,
        thought: lessonRes.thought,
        tab: 'creation-tool',
        creationType: 'lesson'
      });
    } catch (error: any) {
      console.error(error);
      showToast(error.message || "Erro ao gerar lição.", 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateStudy = async () => {
    if (!topic) return;
    setIsLoading(true);
    showToast(getRandomWaitingMessage(), 'info');
    try {
      setStudyResult('');
      setSlidesResult('');
      const prompt = `Crie um estudo bíblico profundo sobre: "${topic}". 
      Use uma linguagem popular, simples e compreensível para todos, mas com profundidade teológica.
      Incorpore comentários de bíblias de estudo, dicionários e enciclopédias.
      Relacione o assunto com a vida prática (crie uma ponte).
      Insira frases de impacto, ditados populares, ilustrações e exemplos reais da vida.
      Estrutura:
      - Tema
      - Versículo chave
      - Versículos para aprofundamento
      - Introdução
      - Desenvolvimento
      - Conclusão
      - Resumo
      - Aplicação prática`;

      const response = await geminiService.generateTextWithThought(prompt, "Você é um pastor que fala a língua do povo, mas com profundo conhecimento teológico.", deepThinking);
      setStudyResult(response.text);
      setStudyResultThought(response.thought);
      showToast("Estudo bíblico gerado com sucesso! 🙌✨");

      addToHistory({
        type: 'Estudo',
        query: topic,
        result: response.text,
        thought: response.thought,
        tab: 'creation-tool',
        creationType: 'study'
      });
    } catch (error: any) {
      console.error(error);
      showToast(error.message || "Erro ao gerar estudo.", 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateDebate = async () => {
    if (!topic) return;
    setIsLoading(true);
    showToast(getRandomWaitingMessage(), 'info');
    try {
      setDebateResult('');
      const prompt = `Gere um debate teológico amigável e profundo sobre o tema: "${topic}".
      
      Instruções:
      1. Pesquise e utilize informações de Bíblias de Estudo, Enciclopédias, Dicionários, Comentários e obras de autores cristãos renomados.
      2. Apresente pelo menos duas ou três linhas de pensamento diferentes sobre o tema (ex: visões reformada, arminiana, pentecostal, etc., conforme aplicável).
      3. O tom deve ser respeitoso, acadêmico e focado na edificação.
      4. Utilize diálogos ou seções estruturadas para cada ponto de vista.
      5. Insira hiperlinks no formato [Saiba mais sobre Termo](search:Termo) para conceitos-chave.
      6. Conclua com um resumo que aponte para a unidade em Cristo, apesar das diferentes interpretações.`;

      const response = await geminiService.generateTextWithThought(prompt, "Você é um moderador de debates teológicos e acadêmico bíblico.", deepThinking);
      setDebateResult(response.text);
      setDebateResultThought(response.thought);
      showToast("Debate gerado com sucesso! 🙌🤝");

      addToHistory({
        type: 'Debate',
        query: topic,
        result: response.text,
        thought: response.thought,
        tab: 'creation-tool',
        creationType: 'debate'
      });
    } catch (error: any) {
      console.error(error);
      showToast(error.message || "Erro ao gerar debate.", 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateDevotional = async () => {
    if (!topic) return;
    setIsLoading(true);
    showToast(getRandomWaitingMessage(), 'info');
    try {
      setDevotionalResult('');
      setSlidesResult('');
      const devotionalPrompt = `Crie um devocional cristão inspirado sobre o tema: "${topic}".
      Regras:
      - Mensagem rápida (máximo 300 palavras ao todo).
      - Linguagem simples, acessível e reconfortante.
      - Use exemplos práticos para aplicação cotidiana.
      - Utilize comentários das bíblias de estudo evangélicas.
      - Foco em fé, adoração, devoção, consolo e motivação.
      
      Estrutura:
      - Título criativo
      - Texto básico (passagem bíblica)
      - Meditação rápida
      - Oração (bonita, sincera, humilde e com palavras reconfortantes)
      - Desafio do dia (algo prático baseado no devocional)
      
      No final, insira uma seção exatamente assim:
      ---
      Saiba mais:
      [Palavra1](search:Palavra1), [Palavra2](search:Palavra2), [Palavra3](search:Palavra3), [Palavra4](search:Palavra4), [Palavra5](search:Palavra5)
      
      Escolha 5 palavras-chave fundamentais do texto para os links acima.`;

      const response = await geminiService.generateTextWithThought(devotionalPrompt, "Você é um conselheiro espiritual e mentor devocional.", deepThinking);
      setDevotionalResult(response.text);
      setDevotionalResultThought(response.thought);
      showToast("Devocional gerado com sucesso! 🙌🕊️");

      addToHistory({
        type: 'Devocional',
        query: topic,
        result: response.text,
        thought: response.thought,
        tab: 'creation-tool',
        creationType: 'devotional'
      });
    } catch (error: any) {
      console.error(error);
      showToast(error.message || "Erro ao gerar devocional.", 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePopupSearch = async (query: string) => {
    setSearchPopup(prev => ({ ...prev, isOpen: true, query, result: '' }));
    setIsLoading(true);
    try {
      const prompt = `Forneça um comentário bíblico consolidado e profundo sobre a palavra ou tema: ${query}. 
      Integre perspectivas de Bíblias de Estudo e Dicionários Bíblicos.`;
      const response = await geminiService.generateTextWithThought(prompt, undefined, deepThinking);
      setSearchPopup(prev => ({ ...prev, result: response.text }));
    } catch (error) {
      console.error(error);
      setSearchPopup(prev => ({ ...prev, result: 'Erro ao pesquisar.' }));
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateSlides = async () => {
    const contentToUse = showLeaderGuide ? leaderGuide : (lessonResult || studyResult || outline || result);
    if (!contentToUse) {
      showToast("Gere um conteúdo primeiro antes de criar os slides! 📖", 'info');
      return;
    }

    setIsLoading(true);
    setIsGeneratingSlides(true);
    showToast("A IA está preparando seus slides... Ficará incrível! 📊✨", 'info');

    try {
      const prompt = `Transforme o seguinte conteúdo em um roteiro de slides profissional para apresentação.
      Para cada slide, forneça:
      - Título do Slide
      - Tópicos principais (bullet points curtos e impactantes)
      - Sugestão de imagem ou fundo
      
      Conteúdo base:
      ${contentToUse}
      
      Retorne em formato Markdown estruturado por slides (Slide 1, Slide 2, etc).`;

      const response = await geminiService.generateText(prompt, "Você é um especialista em design de apresentações e comunicação visual cristã.");
      setSlidesResult(response);
      showToast("Slides gerados! Agora você pode copiar e usar no seu editor favorito. 🚀📊");
    } catch (error) {
      console.error(error);
      showToast("Erro ao gerar slides.", 'error');
    } finally {
      setIsLoading(false);
      setIsGeneratingSlides(false);
    }
  };

  const openNotebookLM = () => {
    window.open('https://notebooklm.google.com/', '_blank');
    showToast("Abrindo NotebookLM... Use o conteúdo para aprofundar sua pesquisa! 🧠✨", 'info');
  };

  const handleSaveEdit = () => {
    if (creationType === 'booklet') {
      setBookletResult(editedOutline);
    } else if (creationType === 'ebook') {
      setEbookResult(editedOutline);
    } else {
      setOutline(editedOutline);
    }
    setIsEditingOutline(false);
  };

  const handleCancelEdit = () => {
    setEditedOutline(creationType === 'booklet' ? bookletResult : creationType === 'ebook' ? ebookResult : outline);
    setIsEditingOutline(false);
  };

  const exportPDF = async () => {
    if (!outlineRef.current) return;
    setIsGeneratingPDF(true);
    showToast("Gerando seu PDF... Quase pronto! 📄💎", 'info');
    try {
      const opt = {
        margin:       25,
        filename:     `esboco-${topic.slice(0, 20)}.pdf`,
        image:        { type: 'jpeg' as const, quality: 0.98 },
        html2canvas:  { 
          scale: 2, 
          useCORS: true,
          onclone: (clonedDoc: Document) => {
            const style = clonedDoc.createElement('style');
            style.innerHTML = `
              * {
                color: #1c1917 !important;
                background-color: #ffffff !important;
                border-color: #e7e5e4 !important;
              }
              .prose * {
                color: inherit !important;
              }
              /* Fix for overlapping lines in markdown */
              .prose p, .prose li, .prose h1, .prose h2, .prose h3, .prose h4 {
                page-break-inside: avoid;
              }
            `;
            clonedDoc.head.appendChild(style);
          }
        },
        jsPDF:        { unit: 'mm', format: 'a4', orientation: 'portrait' as const },
        pagebreak:    { mode: ['avoid-all', 'css', 'legacy'] }
      };

      await html2pdf().set(opt).from(outlineRef.current).save();
      showToast("PDF gerado com sucesso! 📄🎉", 'success');
    } catch (error) {
      console.error('Erro ao gerar PDF:', error);
      showToast("Erro ao gerar PDF.", 'error');
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  const studyBibles = [
    "Bíblia do Homem",
    "Bíblia de Estudo Desafios de Todo Homem",
    "Bíblia de Estudo MacArthur",
    "Bíblia de Estudo Ryrie",
    "Bíblia de Estudo Holman",
    "Bíblia de Estudo da Reforma",
    "Bíblia de Estudo Arqueológica",
    "Bíblia de Estudo King James",
    "Bíblia de Estudo A Mensagem",
    "Bíblia de Estudos Palavras-Chave",
    "Bíblia Apologética com apócrifos",
    "Bíblia da Mulher",
    "Bíblia de Estudo ACF",
    "Bíblia de Estudo Aplicação Pessoal",
    "Bíblia de Estudos Apologética",
    "Bíblia de Estudo Batalha Espiritual E Vitória Financeira",
    "Bíblia de Estudo Cristo em Toda a Escritura",
    "Bíblia de Estudo Cronológica Aplicação Pessoal",
    "Bíblia de Estudo Dake",
    "Bíblia de Estudo da Fé Reformada",
    "Bíblia de Estudo Despertar NTLH",
    "Bíblia de Estudo do Discipulado NAA",
    "Bíblia de Estudo do Pregador",
    "Bíblia de Estudo e Sermões Spurgeon – Edição Rosé (NVT)",
    "Bíblia de Estudo Em Defesa da Fé",
    "Bíblia de Estudo Genebra",
    "Bíblia De Estudo Igreja Primitiva",
    "Bíblia de Estudo Introdutória NVI",
    "Bíblia de Estudo Matthew Henry",
    "Bíblia de Estudo Max Lucado – (NVI, Leitura Perfeita)",
    "Bíblia de Estudo NAA",
    "Bíblia de Estudo NVT",
    "Bíblia de Estudo Patmos",
    "Bíblia de Estudo Pentecostal",
    "Bíblia de Estudo Plenitude",
    "Bíblia de Estudo Plenitude – ARC, Edição Pentecostal",
    "Bíblia de Estudo Plenitude para Jovens NTLH",
    "Bíblia de Estudo Rota 66 | NVI | Luiz Sayão",
    "Bíblia de Estudo Temática – Orando a Palavra 2",
    "Bíblia de Estudo Textual",
    "Bíblia de Estudo Thomas Nelson",
    "Bíblia de Estudos Joyce Meyer",
    "Bíblia do Obreiro Aprovado (CPAD)",
    "Bíblia do Pregador",
    "Bíblia do Pregador Fiel",
    "Bíblia do Pregador Pentecostal",
    "Bíblia em esboços",
    "Bíblia Missionária de Estudo",
    "Bíblia NVI de Estudo",
    "Bíblia Para Pregadoras E Lideres | Geziel Gomes",
    "Bíblia Pregação Expositiva | RA",
    "Bíblia Sagrada Missionária",
    "Bíblia Shedd",
    "Bíblia Thompson",
    "Bíblia Scofield",
    "Bíblia de Estudo do Expositor (Jimmy Swaggart)",
    "Bíblia de Estudo de Liderança (John Maxwell)",
    "Bíblia de Estudo da Mulher Cristã",
    "Bíblia de Estudo de Profecias (Tim LaHaye)",
    "Bíblia de Estudo de Avivamento e Renovação Espiritual",
    "Bíblia de Estudo de Casais",
    "Bíblia de Estudo de Arqueologia Bíblica (SBB)",
    "Bíblia de Estudo de Pregação Expositiva (Hernandes Dias Lopes)",
    "Bíblia de Estudo de Batalha Espiritual (Bento Oliveira)",
    "Bíblia de Estudo de Vida Cristã",
    "Bíblia de Estudo de Santidade",
    "Bíblia de Estudo de Oração",
    "Bíblia de Estudo Wiersbe",
    "Bíblia de Estudo Swindoll",
    "Bíblia de Estudo C. S. Lewis",
    "Bíblia de Estudo A. W. Tozer",
    "Bíblia de Estudo Billy Graham",
    "Bíblia de Estudo John Wesley",
    "Bíblia de Estudo Herança Reformada",
    "Bíblia de Estudo Andrews",
    "Bíblia de Estudo Di Nelson",
    "Bíblia de Estudo Almeida",
    "Bíblia de Estudo Conselheira",
    "Bíblia de Estudo da Família",
    "Bíblia de Estudo da Mulher de Fé",
    "Bíblia de Estudo Indutiva",
    "Bíblia de Estudo Integrada",
    "Bíblia de Estudo Descoberta",
    "Bíblia de Estudo do Jovem",
    "Bíblia de Estudo do Adolescente",
    "Comentário Bíblico Beacon",
    "Comentário bíblico expositivo Wiersbe",
    "Comentário Bíblico Matthew Henry",
    "Comentário Bíblico Moody",
    "Comentário Bíblico Vida Nova",
    "Comentário Estudo Perspicaz das Escrituras",
    "Comentário histórico-cultural da Bíblia (AT e NT)",
    "Comentário Panorama da bíblia (at e nt)",
    "Comentário Série Cultura Bíblica",
    "Comentário Teologia sistemática - Stanley Horton",
    "Concordância Strong",
    "Dicionário Bíblico Tyndale",
    "Dicionário Bíblico Wycliffe",
    "Dicionário da Bíblia de Almeida",
    "Dicionário da Bíblia John Davis",
    "Dicionário da Vida Diária na Antiguidade Bíblica e Pós-Bíblica",
    "Dicionário de Referências Bíblicas – H. L. Willmington",
    "Dicionário Léxico Grego-Português do Novo Testamento",
    "Dicionário Novo Dicionário da Bíblia (J. D. Douglas)",
    "Dicionário Vine",
    "Dicionário VOCABULÁRIO E DICIONÁRIO DA BÍBLIA",
    "Enciclopédia Bíblica",
    "Enciclopédia Cultura Cristã — Merrill C. Tenney",
    "Enciclopédia Da Vida De Jesus",
    "Enciclopédia Da Vida Dos Personagens Biblicos De A Z Matheus Soares",
    "Enciclopédia de Apologética: Respostas aos Críticos da fé Cristã",
    "Enciclopédia de Bíblia, Teologia e Filosofia (Champlin)",
    "Enciclopédia De Fatos Da Bíblia",
    "Enciclopédia Historia do Povo Judeu No Tempo de Jesus Cristo - Emil Schurer",
    "Enciclopédia Paulo para todos",
    "Enciclopédia Torá Interpretada - Rabino Samson Raphael Hirsch"
  ];

  const biblesList = studyBibles.filter(b => !b.startsWith("Comentário") && !b.startsWith("Dicionário") && !b.startsWith("Enciclopédia") && !b.startsWith("Concordância"));
  const commentariesList = studyBibles.filter(b => b.startsWith("Comentário"));
  const dictionariesList = studyBibles.filter(b => b.startsWith("Dicionário") || b.startsWith("Concordância"));
  const encyclopediasList = studyBibles.filter(b => b.startsWith("Enciclopédia"));

  const otherReligionsBooks = [
    "Alcorão (Islamismo)",
    "Livro de Mórmon (Mórmons)",
    "O Livro dos Espíritos (Espiritismo)",
    "Tanakh (Judaísmo)",
    "Tripitaka (Budismo)",
    "Veda (Hinduísmo)",
    "Bíblia Tradução do Novo mundo (Versão TJ)"
  ];

  const resources = [
    { title: "O Mundo Antigo (Egito, Mesopotâmia, Canaã)", desc: "🗺️ MAPAS DO ANTIGO TESTAMENTO" },
    { title: "O Crescente Fértil", desc: "🗺️ MAPAS DO ANTIGO TESTAMENTO" },
    { title: "A Jornada de Abraão", desc: "🗺️ MAPAS DO ANTIGO TESTAMENTO" },
    { title: "O Êxodo do Egito", desc: "🗺️ MAPAS DO ANTIGO TESTAMENTO" },
    { title: "Peregrinação no Deserto", desc: "🗺️ MAPAS DO ANTIGO TESTAMENTO" },
    { title: "Conquista de Canaã", desc: "🗺️ MAPAS DO ANTIGO TESTAMENTO" },
    { title: "Distribuição das Tribos de Israel", desc: "🗺️ MAPAS DO ANTIGO TESTAMENTO" },
    { title: "Período dos Juízes", desc: "🗺️ MAPAS DO ANTIGO TESTAMENTO" },
    { title: "Reino Unido (Saul, Davi e Salomão)", desc: "🗺️ MAPAS DO ANTIGO TESTAMENTO" },
    { title: "Reino Dividido (Israel e Judá)", desc: "🗺️ MAPAS DO ANTIGO TESTAMENTO" },
    { title: "Império Assírio", desc: "🗺️ MAPAS DO ANTIGO TESTAMENTO" },
    { title: "Império Babilônico", desc: "🗺️ MAPAS DO ANTIGO TESTAMENTO" },
    { title: "Queda de Samaria (722 a.C.)", desc: "🗺️ MAPAS DO ANTIGO TESTAMENTO" },
    { title: "Queda de Jerusalém (586 a.C.)", desc: "🗺️ MAPAS DO ANTIGO TESTAMENTO" },
    { title: "Exílio na Babilônia", desc: "🗺️ MAPAS DO ANTIGO TESTAMENTO" },
    { title: "Retorno do Exílio", desc: "🗺️ MAPAS DO ANTIGO TESTAMENTO" },
    { title: "Império Persa", desc: "🗺️ MAPAS DO ANTIGO TESTAMENTO" },
    { title: "Império Grego (Alexandre Magno)", desc: "🗺️ MAPAS DO ANTIGO TESTAMENTO" },
    { title: "Império Romano no período intertestamentário", desc: "🗺️ MAPAS DO ANTIGO TESTAMENTO" },
    { title: "Palestina no tempo de Jesus", desc: "🗺️ MAPAS DO NOVO TESTAMENTO" },
    { title: "Divisão política da Palestina (Herodes e governadores)", desc: "🗺️ MAPAS DO NOVO TESTAMENTO" },
    { title: "Ministério de Jesus na Galileia", desc: "🗺️ MAPAS DO NOVO TESTAMENTO" },
    { title: "Ministério de Jesus na Judeia e Pereia", desc: "🗺️ MAPAS DO NOVO TESTAMENTO" },
    { title: "Última semana de Jesus em Jerusalém", desc: "🗺️ MAPAS DO NOVO TESTAMENTO" },
    { title: "Jerusalém no tempo de Jesus", desc: "🗺️ MAPAS DO NOVO TESTAMENTO" },
    { title: "Viagem a Emaús", desc: "🗺️ MAPAS DO NOVO TESTAMENTO" },
    { title: "Primeira viagem missionária de Paulo", desc: "🗺️ MAPAS DO NOVO TESTAMENTO" },
    { title: "Segunda viagem missionária de Paulo", desc: "🗺️ MAPAS DO NOVO TESTAMENTO" },
    { title: "Terceira viagem missionária de Paulo", desc: "🗺️ MAPAS DO NOVO TESTAMENTO" },
    { title: "Viagem de Paulo a Roma", desc: "🗺️ MAPAS DO NOVO TESTAMENTO" },
    { title: "Igrejas do Novo Testamento", desc: "🗺️ MAPAS DO NOVO TESTAMENTO" },
    { title: "As sete igrejas da Ásia (Apocalipse)", desc: "🗺️ MAPAS DO NOVO TESTAMENTO" },
    { title: "Império Romano no século I", desc: "🏛️ MAPAS HISTÓRICOS GERAIS" },
    { title: "Rotas comerciais antigas", desc: "🏛️ MAPAS HISTÓRICOS GERAIS" },
    { title: "Jerusalém em diferentes períodos históricos", desc: "🏛️ MAPAS HISTÓRICOS GERAIS" },
    { title: "Templo de Salomão", desc: "🏛️ MAPAS HISTÓRICOS GERAIS" },
    { title: "Templo de Herodes", desc: "🏛️ MAPAS HISTÓRICOS GERAIS" },
    { title: "Tabernáculo no deserto", desc: "🏛️ MAPAS HISTÓRICOS GERAIS" },
  ];

  const handleDownloadOffline = async () => {
    if (!result || !searchQuery) return;
    
    const searchSource = loadingSource || activeTab;
    const offlineId = `${searchSource}-${searchQuery}`;
    
    try {
      if (activeTab === 'bibles') {
        await downloadChapter({
          id: offlineId,
          version: searchSource || 'NVI',
          book: searchQuery,
          chapter: 1,
          content: result,
          downloadedAt: Date.now()
        });
      } else {
        await downloadMaterial({
          id: offlineId,
          title: `${searchSource}: ${searchQuery}`,
          content: result,
          type: 'study',
          downloadedAt: Date.now()
        });
      }
      showToast("Conteúdo salvo para uso offline! 📶✅");
    } catch (error) {
      console.error(error);
      showToast("Erro ao salvar para offline.", "error");
    }
  };

  return (
    <div className={cn(
      "space-y-8 transition-all duration-300",
      isFullscreen ? "fixed inset-0 z-50 bg-stone-50 dark:bg-zinc-950 overflow-y-auto p-4 md:p-8" : ""
    )}>
      <SearchLoadingOverlay 
        isVisible={isLoading || isSearchingVerse || isGeneratingMeaning || isGeneratingKids || isGeneratingStoriesTheater || isGeneratingMusic || isGeneratingLyrics || isGeneratingNarration || isGeneratingCommentary || isGeneratingCommentaryDebate} 
        message={isLoading ? "Pesquisando..." : "Processando..."} 
      />
      <AnimatePresence>
        {isHistoryOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-8">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsHistoryOpen(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="relative w-full max-w-2xl max-h-[80vh] bg-white dark:bg-zinc-900 rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col"
            >
              <div className="p-6 border-b border-stone-100 dark:border-zinc-800 flex justify-between items-center bg-stone-50 dark:bg-zinc-800/50">
                <div className="flex items-center gap-2">
                  <History className="text-emerald-600" size={24} />
                  <h3 className="text-xl font-bold text-emerald-900 dark:text-emerald-400">Histórico de Estudos</h3>
                </div>
                <button 
                  onClick={() => setIsHistoryOpen(false)}
                  className="p-2 hover:bg-stone-200 dark:hover:bg-zinc-700 rounded-full transition-colors"
                >
                  <CloseIcon size={24} />
                </button>
              </div>
              
              <div className="flex-1 p-6 overflow-y-auto custom-scrollbar">
                {studyHistory.length === 0 ? (
                  <div className="text-center py-12">
                    <History size={48} className="mx-auto text-stone-300 mb-4" />
                    <p className="text-stone-500">Nenhum estudo recente encontrado.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {studyHistory.map((item, idx) => (
                      <button
                        key={`history-item-${item.id}-${idx}`}
                        onClick={() => loadFromHistory(item)}
                        className="w-full p-4 bg-stone-50 dark:bg-zinc-800/50 border border-stone-100 dark:border-zinc-800 rounded-2xl text-left hover:border-emerald-500 hover:bg-emerald-50/30 transition-all group"
                      >
                        <div className="flex justify-between items-start mb-2">
                          <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-600 bg-emerald-100 dark:bg-emerald-900/30 px-2 py-0.5 rounded-md">
                            {item.type}
                          </span>
                          <span className="text-[10px] text-stone-400">{item.date}</span>
                        </div>
                        <h4 className="font-bold text-stone-800 dark:text-zinc-200 group-hover:text-emerald-700 transition-colors line-clamp-1">
                          {item.query}
                        </h4>
                        <p className="text-xs text-stone-500 dark:text-zinc-500 mt-1 line-clamp-2">
                          {(item.result || "").replace(/[#*`]/g, '').slice(0, 150)}...
                        </p>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <div className="p-4 border-t border-stone-100 dark:border-zinc-800 bg-stone-50 dark:bg-zinc-800/50">
                <button 
                  onClick={() => {
                    setStudyHistory([]);
                    localStorage.removeItem('study_history');
                    showToast("Histórico limpo! 🧹");
                  }}
                  className="w-full py-3 text-red-500 text-xs font-bold hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-colors flex items-center justify-center gap-2"
                >
                  <Trash2 size={14} /> Limpar Histórico
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Creation Result Popup */}
      <AnimatePresence>
        {creationPopup?.show && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-8">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setCreationPopup(null)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="relative w-full max-w-4xl max-h-[90vh] bg-white dark:bg-zinc-900 rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col"
            >
              <div className="p-6 border-b border-stone-100 dark:border-zinc-800 flex justify-between items-center bg-stone-50 dark:bg-zinc-800/50">
                <h3 className="text-xl font-bold text-emerald-900 dark:text-emerald-400">{creationPopup.title}</h3>
                <button 
                  onClick={() => setCreationPopup(null)}
                  className="p-2 hover:bg-stone-200 dark:hover:bg-zinc-700 rounded-full transition-colors"
                >
                  <CloseIcon size={24} />
                </button>
              </div>
              
              <div className="flex-1 p-8 md:p-12 overflow-y-auto custom-scrollbar prose dark:prose-invert max-w-none">
                <ExpandableMarkdown content={creationPopup.content} />
                <CreditInfoTip />
              </div>

              <div className="p-6 border-t border-stone-100 dark:border-zinc-800 bg-stone-50 dark:bg-zinc-800/50 flex gap-3">
                <button 
                  onClick={() => handleListen(creationPopup.content)}
                  disabled={isGeneratingSpeech}
                  className="flex-1 py-3 bg-amber-100 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400 font-bold rounded-xl hover:bg-amber-200 flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {isGeneratingSpeech ? <Loader2 size={18} className="animate-spin" /> : <Volume2 size={18} />}
                  Ouvir
                </button>
                <button 
                  onClick={() => {
                    copyToClipboard(creationPopup.content);
                    showToast("Copiado! 📋✨");
                  }} 
                  className="flex-1 py-3 bg-stone-100 dark:bg-zinc-800 text-stone-600 dark:text-zinc-300 font-bold rounded-xl hover:bg-stone-200 flex items-center justify-center gap-2"
                >
                  <Share2 size={18} /> Compartilhar
                </button>
                <button 
                  onClick={() => {
                    handleSaveToNotebook(creationPopup.title, creationPopup.content);
                    setCreationPopup(null);
                  }} 
                  className="flex-1 py-3 bg-emerald-600 text-white font-bold rounded-xl hover:bg-emerald-700 flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/20"
                >
                  <Save size={18} /> Salvar no Caderno
                </button>
                <button 
                  onClick={() => setCreationPopup(null)} 
                  className="px-8 py-3 bg-stone-200 dark:bg-zinc-700 text-stone-700 dark:text-zinc-200 font-bold rounded-xl hover:bg-stone-300 transition-all"
                >
                  Fechar
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Credit Confirmation Modal */}
      <AnimatePresence>
        {showCreditConfirm.show && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white dark:bg-zinc-900 p-8 rounded-[2.5rem] max-w-md w-full shadow-2xl border border-stone-200 dark:border-zinc-800"
            >
              <div className="flex items-center gap-4 mb-6">
                <div className="p-4 bg-amber-100 dark:bg-amber-900/30 rounded-2xl">
                  <Sparkles className="text-amber-600" size={32} />
                </div>
                <div>
                  <h3 className="text-2xl font-bold">Confirmar Ação</h3>
                  <p className="text-stone-500 text-sm">Esta operação utiliza inteligência artificial avançada.</p>
                </div>
              </div>
              
              <div className="bg-stone-50 dark:bg-zinc-800/50 p-6 rounded-2xl mb-8 border border-stone-100 dark:border-zinc-800">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-stone-600 dark:text-zinc-400">Custo estimado:</span>
                  <span className="font-display font-bold text-xl text-emerald-600">{showCreditConfirm.cost} Créditos</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-stone-600 dark:text-zinc-400">Seu saldo:</span>
                  <span className="font-mono font-bold">{balance} Créditos</span>
                </div>
              </div>

              <div className="flex gap-3">
                <button 
                  onClick={() => {
                    setShowCreditConfirm({ ...showCreditConfirm, show: false });
                    showCreditConfirm.action();
                  }}
                  className="flex-1 py-4 bg-emerald-600 text-white font-bold rounded-2xl hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-600/20"
                >
                  Confirmar e Iniciar
                </button>
                <button 
                  onClick={() => setShowCreditConfirm({ ...showCreditConfirm, show: false })}
                  className="px-8 py-4 bg-stone-100 dark:bg-zinc-800 text-stone-600 dark:text-zinc-300 font-bold rounded-2xl hover:bg-stone-200 transition-all"
                >
                  Cancelar
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Header - Sophisticated & Modern */}
      <div className="flex flex-col md:flex-row items-center justify-end gap-6 mb-10">
        <div className="flex items-center gap-3 bg-stone-100 dark:bg-zinc-800/50 p-2 rounded-3xl border border-stone-200 dark:border-zinc-800">
          <button
            onClick={() => onNavigate?.('credits')}
            className="px-4 py-2 bg-white dark:bg-zinc-900 rounded-2xl shadow-sm border border-stone-200 dark:border-zinc-800 flex items-center gap-2 group"
          >
            <div className="w-8 h-8 bg-amber-50 dark:bg-amber-900/20 rounded-lg flex items-center justify-center text-amber-600 group-hover:scale-110 transition-transform">
              <Sparkles size={16} />
            </div>
            <span className="text-sm font-bold">{balance} <span className="text-[10px] text-stone-400 font-medium">CRÉDITOS</span></span>
          </button>

          <button
            onClick={() => {
              if (setDeepThinking) {
                setDeepThinking(!deepThinking);
                showToast(`Pensamento Profundo: ${!deepThinking ? "Ativado" : "Desativado"}`, 'info');
              }
            }}
            className={cn(
              "flex items-center gap-2 px-5 py-2.5 rounded-2xl text-[10px] font-bold transition-all border",
              deepThinking 
                ? "bg-purple-600 border-purple-500 text-white shadow-lg shadow-purple-600/20" 
                : "bg-white dark:bg-zinc-900 border-stone-200 dark:border-zinc-800 text-stone-600 dark:text-zinc-400 hover:bg-stone-50"
            )}
            title="Ativar raciocínio avançado da IA"
          >
            <Brain size={16} />
            {deepThinking ? "PROFUNDO: ON" : "PROFUNDO: OFF"}
          </button>
        </div>
      </div>

      {/* Tabs - Creative Button Grid */}
      {!isReadingMode && (
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-xs font-bold uppercase tracking-widest text-stone-400 ml-2">Módulos de Estudo</h3>
          <div className="flex gap-2">
            <button 
              onClick={() => setIsReadingMode(true)}
              className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white text-xs font-bold rounded-xl hover:bg-emerald-700 transition-all"
            >
              <BookOpen size={16} />
              Modo Leitura
            </button>
            <button 
              onClick={() => setIsHistoryOpen(true)}
              className="flex items-center gap-2 px-4 py-2 bg-stone-100 dark:bg-zinc-800 text-stone-600 dark:text-zinc-300 text-xs font-bold rounded-xl hover:bg-stone-200 transition-all"
            >
              <History size={16} />
              Histórico
            </button>
          </div>
        </div>
      )}
      
      {isReadingMode && (
        <div className="fixed top-4 right-4 z-[100] flex items-center gap-2 p-2 bg-white dark:bg-zinc-900 rounded-2xl border border-stone-200 dark:border-zinc-800 shadow-xl">
          <button 
            onClick={() => setIsReadingMode(false)}
            className="px-4 py-2 bg-stone-100 dark:bg-zinc-800 text-stone-600 dark:text-zinc-300 text-xs font-bold rounded-xl hover:bg-stone-200"
          >
            Sair do Modo Leitura
          </button>
          <div className="flex items-center gap-1">
            <button onClick={() => setReadingFontSize(prev => Math.max(12, prev - 2))} className="p-2 hover:bg-stone-100 rounded-full">A-</button>
            <span className="text-xs font-bold">{readingFontSize}px</span>
            <button onClick={() => setReadingFontSize(prev => Math.min(32, prev + 2))} className="p-2 hover:bg-stone-100 rounded-full">A+</button>
          </div>
          <div className="flex items-center gap-1">
            <button onClick={() => setReadingLineHeight(prev => Math.max(1.2, prev - 0.1))} className="p-2 hover:bg-stone-100 rounded-full">Esp-</button>
            <span className="text-xs font-bold">{readingLineHeight.toFixed(1)}</span>
            <button onClick={() => setReadingLineHeight(prev => Math.min(2.5, prev + 0.1))} className="p-2 hover:bg-stone-100 rounded-full">Esp+</button>
          </div>
        </div>
      )}

      {activeTab === 'menu' && !isReadingMode && (
        <div className="bg-stone-200/50 dark:bg-zinc-900/80 p-6 md:p-8 rounded-[2.5rem] border border-stone-200 dark:border-zinc-800 shadow-inner">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 pb-6">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id);
                  scrollToSearch();
                  setResult('');
                  setSlidesResult('');
                  setDebateResult('');
                  setSelectedBible('');
                  setSearchQuery('');
                  setNotebookSearchQuery('');
                }}
                className="flex flex-col items-center justify-center gap-3 p-6 rounded-2xl text-sm font-bold transition-all border bg-white dark:bg-zinc-900 border-stone-200 dark:border-zinc-800 text-stone-600 dark:text-zinc-300 hover:bg-stone-50 dark:hover:bg-zinc-800 hover:border-emerald-200 dark:hover:border-emerald-900/50 hover:scale-105 shadow-sm"
              >
                <div className="p-3 rounded-xl bg-stone-100 dark:bg-zinc-800 text-emerald-600">
                  {tab.icon}
                </div>
                <span className="text-center">{tab.label}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {activeTab !== 'menu' && !isReadingMode && (
        <div className="flex items-center justify-between mb-6 pb-4 border-b border-stone-100 dark:border-zinc-800">
          <button
            onClick={() => {
              setActiveTab('menu');
              setIsFullscreen(false);
            }}
            className="flex items-center gap-2 px-4 py-2 bg-stone-100 dark:bg-zinc-800 text-stone-600 dark:text-zinc-300 font-bold rounded-xl hover:bg-stone-200 dark:hover:bg-zinc-700 transition-all"
          >
            <ArrowLeft size={18} />
            Voltar ao Menu
          </button>
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-bold text-stone-800 dark:text-stone-200 hidden sm:block">
              {tabs.find(t => t.id === activeTab)?.label}
            </h2>
          </div>
          <button
            onClick={() => setIsFullscreen(!isFullscreen)}
            className="flex items-center gap-2 px-4 py-2 bg-stone-100 dark:bg-zinc-800 text-stone-600 dark:text-zinc-300 font-bold rounded-xl hover:bg-stone-200 dark:hover:bg-zinc-700 transition-all"
          >
            <Layout size={18} />
            <span className="hidden sm:inline">{isFullscreen ? 'Minimizar' : 'Maximizar'}</span>
          </button>
        </div>
      )}

      {/* Content Area */}
      {activeTab !== 'menu' && (
        <div 
          ref={searchInputRef} 
          className={cn("min-h-[400px]", isReadingMode && "max-w-3xl mx-auto")}
          style={isReadingMode ? { fontSize: `${readingFontSize}px`, lineHeight: readingLineHeight } : {}}
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-6"
            >
            {activeTab === 'verse-search' && (
              <div className="space-y-6">
                <div className="flex flex-col md:flex-row gap-4">
                  <div className="relative flex-1">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400" size={20} />
                    <input
                      type="text"
                      placeholder="⚓ Busca Rápida: Digite o versículo (ex: João 3:16 ou Salmos 23)"
                      value={verseSearch}
                      onChange={(e) => setVerseSearch(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleVerseSearch()}
                      className="w-full pl-12 pr-12 py-4 bg-white dark:bg-zinc-900 border border-stone-200 dark:border-zinc-800 rounded-2xl focus:ring-2 focus:ring-emerald-500 outline-none"
                    />
                    <div className="absolute right-4 top-1/2 -translate-y-1/2">
                      <AudioSearchButton onResult={(text) => { setVerseSearch(text); handleVerseSearch(); }} />
                    </div>
                  </div>
                  <button
                    onClick={handleVerseSearch}
                    disabled={isSearchingVerse || !verseSearch}
                    className="px-8 py-4 bg-emerald-600 text-white font-bold rounded-2xl hover:bg-emerald-700 disabled:opacity-50 flex items-center justify-center gap-2 transition-all shadow-lg shadow-emerald-600/20"
                  >
                    {isSearchingVerse ? <Loader2 className="animate-spin" size={20} /> : <Search size={20} />}
                    Buscar Versículo
                  </button>
                </div>

                {verseContent && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-4"
                  >
                    {verseContentThought && (
                      <div className="bg-amber-50/50 dark:bg-amber-900/10 border border-amber-200/50 dark:border-amber-800/30 rounded-2xl p-4">
                        <details className="group">
                          <summary className="flex items-center gap-2 text-xs font-bold text-amber-700 dark:text-amber-400 cursor-pointer list-none">
                            <Brain size={14} className="group-open:rotate-12 transition-transform" />
                            CONTEXTO DO VERSÍCULO
                          </summary>
                          <div className="mt-3 text-xs text-amber-600/80 dark:text-amber-500/80 leading-relaxed italic">
                            {verseContentThought}
                          </div>
                        </details>
                      </div>
                    )}
                    <div 
                      ref={resultRef}
                      className="bg-white dark:bg-zinc-900 p-8 rounded-3xl border border-stone-200 dark:border-zinc-800 shadow-sm prose dark:prose-invert max-w-none"
                    >
                      <ExpandableMarkdown content={verseContent} onSearch={handleWikiSearch} />
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <button
                        onClick={() => handleSearch('Todas as Bíblias', verseSearch.split(' ')[0])}
                        className="flex-1 min-w-[150px] py-3 bg-emerald-100 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 font-bold rounded-xl hover:bg-emerald-200 flex items-center justify-center gap-2 transition-all"
                      >
                        <BookOpen size={18} />
                        Ver Capítulo Completo
                      </button>
                      <button
                        onClick={handleToggleFavorite}
                        className={cn(
                          "flex-1 min-w-[150px] py-3 font-bold rounded-xl flex items-center justify-center gap-2 transition-all",
                          isFavorited 
                            ? "bg-red-100 dark:bg-red-900/20 text-red-600 dark:text-red-400 hover:bg-red-200" 
                            : "bg-stone-100 dark:bg-zinc-800 text-stone-600 dark:text-zinc-300 hover:bg-stone-200"
                        )}
                      >
                        <Heart size={18} className={cn(isFavorited && "fill-current")} />
                        {isFavorited ? 'Favoritado' : 'Favoritar'}
                      </button>
                      <button
                        onClick={() => handleSaveToNotebook(verseSearch, verseContent)}
                        className="flex-1 min-w-[150px] py-3 bg-emerald-600 text-white font-bold rounded-xl hover:bg-emerald-700 flex items-center justify-center gap-2 transition-all"
                      >
                        <Save size={18} />
                        Salvar no Caderno
                      </button>
                      <button
                        onClick={() => handleListen(verseContent)}
                        disabled={isGeneratingSpeech}
                        className="flex-1 min-w-[150px] py-3 bg-amber-100 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400 font-bold rounded-xl hover:bg-amber-200 flex items-center justify-center gap-2 transition-all disabled:opacity-50"
                      >
                        {isGeneratingSpeech ? <Loader2 size={18} className="animate-spin" /> : <Volume2 size={18} />}
                        Ouvir
                      </button>
                      <button
                        onClick={() => handleDownloadElement(verseResultRef.current, `Versiculo_${verseSearch}`)}
                        className="flex-1 min-w-[150px] py-3 bg-stone-100 dark:bg-zinc-800 text-stone-600 dark:text-zinc-300 font-bold rounded-xl hover:bg-stone-200 flex items-center justify-center gap-2 transition-all"
                      >
                        <Download size={18} />
                        Baixar
                      </button>
                      <button
                        onClick={() => handleShareContent(verseSearch, verseContent)}
                        className="flex-1 min-w-[150px] py-3 bg-stone-100 dark:bg-zinc-800 text-stone-600 dark:text-zinc-300 font-bold rounded-xl hover:bg-stone-200 flex items-center justify-center gap-2 transition-all"
                      >
                        <Share2 size={18} />
                        Compartilhar
                      </button>
                      </div>
                  </motion.div>
                )}
              </div>
            )}

            {activeTab === 'bibles' && (
              <div className="space-y-6">
                <div className="flex flex-col gap-4">
                  <div className="relative w-full">
                    <Pencil className="absolute left-4 top-1/2 -translate-y-1/2 text-emerald-600 dark:text-emerald-400" size={24} />
                    <input
                      type="text"
                      placeholder="⚓ Escreva um tema ou passagem neste campo e clique em Pesquisar..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-14 pr-4 py-5 bg-emerald-50/50 dark:bg-emerald-900/10 border-2 border-emerald-400 dark:border-emerald-600 rounded-2xl focus:ring-4 focus:ring-emerald-500/20 outline-none text-base md:text-lg font-medium text-stone-800 dark:text-zinc-100 placeholder-emerald-700/50 dark:placeholder-emerald-300/50 shadow-lg shadow-emerald-500/10 transition-all"
                    />
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
                    <select 
                      value={selectedStudyBible}
                      onChange={(e) => setSelectedStudyBible(e.target.value)}
                      className="w-full px-4 py-3 bg-white dark:bg-zinc-900 border border-stone-200 dark:border-zinc-800 rounded-xl outline-none text-sm focus:border-emerald-500"
                    >
                      <option value="">Selecione Bíblia de Estudo (85)</option>
                      <option value="Todas as Bíblias">Todos(as)...</option>
                      {biblesList.map((bible, idx) => (
                        <option key={`bible-${bible}-${idx}`} value={bible}>{bible}</option>
                      ))}
                    </select>

                    <select 
                      value={selectedCommentary}
                      onChange={(e) => setSelectedCommentary(e.target.value)}
                      className="w-full px-4 py-3 bg-white dark:bg-zinc-900 border border-stone-200 dark:border-zinc-800 rounded-xl outline-none text-sm focus:border-emerald-500"
                    >
                      <option value="">Selecione o Comentário Bíblico (10)</option>
                      <option value="Todos os Comentários">Todos(as)...</option>
                      {commentariesList.map((commentary, idx) => (
                        <option key={`commentary-${commentary}-${idx}`} value={commentary}>{commentary}</option>
                      ))}
                    </select>

                    <select 
                      value={selectedDictionary}
                      onChange={(e) => setSelectedDictionary(e.target.value)}
                      className="w-full px-4 py-3 bg-white dark:bg-zinc-900 border border-stone-200 dark:border-zinc-800 rounded-xl outline-none text-sm focus:border-emerald-500"
                    >
                      <option value="">Selecione o Dicionário Bíblico (11)</option>
                      <option value="Todos os Dicionários">Todos(as)...</option>
                      {dictionariesList.map((dictionary, idx) => (
                        <option key={`dictionary-${dictionary}-${idx}`} value={dictionary}>{dictionary}</option>
                      ))}
                    </select>

                    <select 
                      value={selectedEncyclopedia}
                      onChange={(e) => setSelectedEncyclopedia(e.target.value)}
                      className="w-full px-4 py-3 bg-white dark:bg-zinc-900 border border-stone-200 dark:border-zinc-800 rounded-xl outline-none text-sm focus:border-emerald-500"
                    >
                      <option value="">Selecione a Enciclopédia Bíblica (10)</option>
                      <option value="Todas as Enciclopédias">Todos(as)...</option>
                      {encyclopediasList.map((encyclopedia, idx) => (
                        <option key={`encyclopedia-${encyclopedia}-${idx}`} value={encyclopedia}>{encyclopedia}</option>
                      ))}
                    </select>
                  </div>

                  <button
                    onClick={() => handleSearch(getSelectedSources())}
                    disabled={isLoading}
                    className="w-full py-4 bg-emerald-600 text-white font-bold text-lg rounded-2xl hover:bg-emerald-700 disabled:opacity-50 flex items-center justify-center gap-2 transition-all shadow-lg shadow-emerald-600/20"
                  >
                    {isLoading ? (
                      <>
                        <BookOpen className="animate-pulse" size={24} />
                        Aguarde...
                      </>
                    ) : (
                      <>
                        <Search size={24} />
                        ⚓ Pesquisar
                      </>
                    )}
                  </button>
                </div>

                {result && (
                  <div className="space-y-4">
                    {resultThought && (
                      <div className="bg-amber-50/50 dark:bg-amber-900/10 border border-amber-200/50 dark:border-amber-800/30 rounded-2xl p-4">
                        <details className="group">
                          <summary className="flex items-center gap-2 text-xs font-bold text-amber-700 dark:text-amber-400 cursor-pointer list-none">
                            <Brain size={14} className="group-open:rotate-12 transition-transform" />
                            PROCESSO DE PENSAMENTO (IA)
                          </summary>
                          <div className="mt-3 text-xs text-amber-600/80 dark:text-amber-500/80 leading-relaxed italic">
                            {resultThought}
                          </div>
                        </details>
                      </div>
                    )}
                    <div 
                      ref={resultRef}
                      className="bg-white dark:bg-zinc-900 p-8 rounded-3xl border border-stone-200 dark:border-zinc-800 shadow-sm prose dark:prose-invert max-w-none"
                    >
                      <div className="flex justify-center items-center mb-6 not-prose">
                        <span className="text-xs font-bold text-stone-400 uppercase tracking-widest text-center">
                          {searchQuery}
                        </span>
                      </div>
                      <ExpandableMarkdown content={result} onSearch={handleWikiSearch} />
                      <div className="mt-8 pt-8 border-t border-stone-100 dark:border-zinc-800">
                        <FeedbackSection page="Imersão Bíblica" context={activeTab} />
                      </div>
                    </div>
                    
                    <div className="flex flex-wrap gap-3">
                      <button
                        onClick={handleToggleFavorite}
                        className={cn(
                          "flex-1 py-3 font-bold rounded-xl flex items-center justify-center gap-2 transition-all",
                          isFavorited 
                            ? "bg-red-100 dark:bg-red-900/20 text-red-600 dark:text-red-400 hover:bg-red-200" 
                            : "bg-stone-100 dark:bg-zinc-800 text-stone-600 dark:text-zinc-300 hover:bg-stone-200"
                        )}
                      >
                        <Heart size={18} className={cn(isFavorited && "fill-current")} />
                        {isFavorited ? 'Favoritado' : 'Favoritar'}
                      </button>
                      <button
                        onClick={() => handleCopy()}
                        className="flex-1 py-3 bg-stone-100 dark:bg-zinc-800 text-stone-600 dark:text-zinc-300 font-bold rounded-xl hover:bg-stone-200 flex items-center justify-center gap-2"
                      >
                        <Copy size={18} />
                        Copiar
                      </button>
                      <button
                        onClick={() => handleListen(result)}
                        disabled={isGeneratingSpeech}
                        className="flex-1 py-3 bg-amber-100 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400 font-bold rounded-xl hover:bg-amber-200 flex items-center justify-center gap-2 transition-all disabled:opacity-50"
                      >
                        {isGeneratingSpeech ? <Loader2 size={18} className="animate-spin" /> : <Volume2 size={18} />}
                        Ouvir
                      </button>
                      <button
                        onClick={() => {
                          handleDownloadResult();
                          showToast("Preparando seu arquivo... Ficou lindo! 📄💎", 'info');
                        }}
                        className="flex-1 py-3 bg-stone-100 dark:bg-zinc-800 text-stone-600 dark:text-zinc-300 font-bold rounded-xl hover:bg-stone-200 flex items-center justify-center gap-2"
                      >
                        <Download size={18} />
                        Baixar
                      </button>
                      <button
                        onClick={() => handleWikiSearch(searchQuery)}
                        className="flex-1 py-3 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 font-bold rounded-xl hover:bg-blue-200 flex items-center justify-center gap-2"
                      >
                        <Globe size={18} />
                        ⚓ Wiki
                      </button>
                      <button
                        onClick={() => {
                          handleShareResult();
                          showToast("Compartilhando a benção! 🕊️✨");
                        }}
                        className="flex-1 py-3 bg-stone-100 dark:bg-zinc-800 text-stone-600 dark:text-zinc-300 font-bold rounded-xl hover:bg-stone-200 flex items-center justify-center gap-2"
                      >
                        <Share2 size={18} />
                        Compartilhar
                      </button>
                      <button
                        onClick={() => handleSaveToNotebook(getSelectedSources(), result)}
                        className="flex-1 py-3 bg-emerald-600 text-white font-bold rounded-xl hover:bg-emerald-700 flex items-center justify-center gap-2"
                      >
                        <Save size={18} />
                        Salvar no Caderno
                      </button>
                    </div>

                    {isGeneratingResources && (
                      <div className="flex items-center gap-3 p-4 bg-blue-50 dark:bg-blue-900/10 rounded-2xl border border-blue-100 dark:border-blue-800/30">
                        <Loader2 className="animate-spin text-blue-600" size={18} />
                        <span className="text-sm font-bold text-blue-700 dark:text-blue-400">Buscando recursos relacionados... 📚✨</span>
                      </div>
                    )}

                    {relatedResources.length > 0 && (
                      <motion.div 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-stone-50 dark:bg-zinc-800/50 p-6 rounded-3xl border border-stone-200 dark:border-zinc-800"
                      >
                        <h4 className="text-sm font-black text-stone-900 dark:text-white mb-4 uppercase tracking-widest flex items-center gap-2">
                          <Sparkles size={16} className="text-amber-500" />
                          Recursos Relacionados Sugeridos
                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          {relatedResources.map((resource, idx) => (
                            <button
                              key={`related-resource-${resource.title}-${idx}`}
                              onClick={() => {
                                const term = (resource.url || "").replace('search:', '');
                                setSearchQuery(term);
                                handleSearch(getSelectedSources(), term);
                              }}
                              className="flex items-start gap-3 p-3 bg-white dark:bg-zinc-900 rounded-xl border border-stone-200 dark:border-zinc-800 hover:border-emerald-500 transition-all text-left group"
                            >
                              <div className="p-2 bg-stone-100 dark:bg-zinc-800 rounded-lg text-stone-500 group-hover:text-emerald-600 transition-colors">
                                {resource.type.toLowerCase().includes('mapa') ? <MapIcon size={18} /> : 
                                 resource.type.toLowerCase().includes('artigo') ? <FileText size={18} /> : 
                                 <BookOpen size={18} />}
                              </div>
                              <div>
                                <p className="text-xs font-bold text-stone-900 dark:text-white line-clamp-1">{resource.title}</p>
                                <p className="text-[10px] text-stone-400 uppercase font-black tracking-tighter">{resource.type}</p>
                              </div>
                            </button>
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'authors' && (
              <div className="space-y-6">
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400" size={18} />
                  <input 
                    type="text"
                    placeholder="Pesquisar autor por nome ou especialidade..."
                    value={authorSearchQuery}
                    onChange={(e) => setAuthorSearchQuery(e.target.value)}
                    className="w-full pl-12 pr-4 py-4 bg-white dark:bg-zinc-900 border border-stone-200 dark:border-zinc-800 rounded-2xl outline-none focus:ring-2 focus:ring-emerald-500 shadow-sm"
                  />
                </div>
                
                {authorSearchQuery && (
                  <div className="bg-white dark:bg-zinc-900 border border-stone-200 dark:border-zinc-800 rounded-2xl p-4 shadow-sm max-h-60 overflow-y-auto">
                    {GOSPEL_AUTHORS.filter(a => 
                      a.name.toLowerCase().includes(authorSearchQuery.toLowerCase()) ||
                      a.works.some(w => w.toLowerCase().includes(authorSearchQuery.toLowerCase()))
                    ).map((author, idx) => (
                      <button
                        key={`${author.name}-${idx}`}
                        onClick={() => {
                          setSelectedAuthor(author.name);
                          setAuthorSearchQuery('');
                        }}
                        className="w-full text-left p-3 hover:bg-stone-100 dark:hover:bg-zinc-800 rounded-xl"
                      >
                        <div className="font-bold">{author.name}</div>
                        <div className="text-xs text-stone-500">{author.works.join(', ')}</div>
                        {(author as any).biography && <div className="text-xs text-stone-400 mt-1 italic">{(author as any).biography}</div>}
                      </button>
                    ))}
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400" size={18} />
                    <select 
                      value={selectedAuthor}
                      onChange={(e) => {
                        setSelectedAuthor(e.target.value);
                        setSelectedWork('');
                      }}
                      className="w-full pl-12 pr-4 py-4 bg-white dark:bg-zinc-900 border border-stone-200 dark:border-zinc-800 rounded-2xl outline-none focus:ring-2 focus:ring-emerald-500 shadow-sm appearance-none"
                    >
                      <option value="">Selecione um Autor</option>
                      {GOSPEL_AUTHORS.map((author, idx) => (
                        <option key={`${author.name}-${idx}`} value={author.name}>{author.name}</option>
                      ))}
                    </select>
                  </div>
                  <div className="relative">
                    <Book className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400" size={18} />
                    <select 
                      value={selectedWork}
                      onChange={(e) => setSelectedWork(e.target.value)}
                      disabled={!selectedAuthor}
                      className="w-full pl-12 pr-4 py-4 bg-white dark:bg-zinc-900 border border-stone-200 dark:border-zinc-800 rounded-2xl outline-none focus:ring-2 focus:ring-emerald-500 shadow-sm appearance-none disabled:opacity-50"
                    >
                      <option value="">Obras Principais (Opcional)</option>
                      {selectedAuthor && GOSPEL_AUTHORS.find(a => a.name === selectedAuthor)?.works.map((work, idx) => (
                        <option key={`${work}-${idx}`} value={work}>{work}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="relative flex-1">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400" size={18} />
                    <input 
                      type="text"
                      placeholder="⚓ Sobre o que você quer saber a visão do autor?"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-12 pr-4 py-4 bg-white dark:bg-zinc-900 border border-stone-200 dark:border-zinc-800 rounded-2xl outline-none focus:ring-2 focus:ring-emerald-500 shadow-sm"
                    />
                  </div>
                  <button 
                    onClick={handleAuthorSearch}
                    disabled={isLoading}
                    className="px-8 py-4 bg-emerald-600 text-white font-bold rounded-2xl hover:bg-emerald-700 disabled:opacity-50 flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/20"
                  >
                    {isLoading ? <Loader2 className="animate-spin" size={20} /> : <Sparkles size={20} />}
                    ⚓ Consultar Visão
                  </button>
                </div>

                {result && activeTab === 'authors' && (
                  <div className="space-y-4">
                    {resultThought && (
                      <div className="bg-amber-50/50 dark:bg-amber-900/10 border border-amber-200/50 dark:border-amber-800/30 rounded-2xl p-4">
                        <details className="group">
                          <summary className="flex items-center gap-2 text-xs font-bold text-amber-700 dark:text-amber-400 cursor-pointer list-none">
                            <Brain size={14} className="group-open:rotate-12 transition-transform" />
                            PROCESSO DE PENSAMENTO (IA)
                          </summary>
                          <div className="mt-3 text-xs text-amber-600/80 dark:text-amber-500/80 leading-relaxed italic">
                            {resultThought}
                          </div>
                        </details>
                      </div>
                    )}
                    <div 
                      ref={bibleResultRef}
                      className="bg-white dark:bg-zinc-900 p-8 rounded-3xl border border-stone-200 dark:border-zinc-800 shadow-sm prose dark:prose-invert max-w-none"
                    >
                      <ExpandableMarkdown content={result} onSearch={handleWikiSearch} />
                    </div>
                    
                    <div className="flex flex-wrap gap-3">
                      <button
                        onClick={() => handleListen(result)}
                        disabled={isGeneratingSpeech}
                        className="flex-1 py-3 bg-stone-100 dark:bg-zinc-800 text-stone-600 dark:text-zinc-300 font-bold rounded-xl hover:bg-stone-200 flex items-center justify-center gap-2 disabled:opacity-50"
                      >
                        {isGeneratingSpeech ? <Loader2 size={18} className="animate-spin" /> : <Volume2 size={18} />}
                        Ouvir
                      </button>
                      <button onClick={() => handleCopy()} className="flex-1 py-3 bg-stone-100 dark:bg-zinc-800 text-stone-600 dark:text-zinc-300 font-bold rounded-xl hover:bg-stone-200 flex items-center justify-center gap-2"><Copy size={18} /> Copiar</button>
                      <button onClick={handleDownloadResult} className="flex-1 py-3 bg-stone-100 dark:bg-zinc-800 text-stone-600 dark:text-zinc-300 font-bold rounded-xl hover:bg-stone-200 flex items-center justify-center gap-2"><Download size={18} /> Baixar</button>
                      <button onClick={() => handleWikiSearch(searchQuery)} className="flex-1 py-3 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 font-bold rounded-xl hover:bg-blue-200 flex items-center justify-center gap-2"><Globe size={18} /> ⚓ Wiki</button>
                      <div className="flex-1 flex items-center justify-center">
                        <ShareButtons 
                          title="Comentário Bíblico" 
                          text={result} 
                        />
                      </div>
                      <button onClick={() => handleSaveToNotebook(selectedAuthor || 'Visão do Autor', result)} className="flex-1 py-3 bg-emerald-600 text-white font-bold rounded-xl hover:bg-emerald-700 flex items-center justify-center gap-2"><Save size={18} /> Salvar no Caderno</button>
                      <button 
                        onClick={() => handleSendToNarration(result)}
                        className="flex-1 py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 flex items-center justify-center gap-2"
                      >
                        <Mic2 size={18} /> Gerar Narração
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'religions' && (
              <div className="space-y-6">
                <div className="flex flex-col gap-4">
                  <div className="relative">
                    <Pencil className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400" size={18} />
                    <input
                      type="text"
                      placeholder="⚓ Escreva um tema ou assunto para pesquisar em outras religiões..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-12 pr-4 py-4 bg-white dark:bg-zinc-900 border border-stone-200 dark:border-zinc-800 rounded-2xl focus:ring-2 focus:ring-emerald-500 outline-none text-xs md:text-sm"
                    />
                  </div>
                  
                  <div className="bg-white dark:bg-zinc-900 p-4 rounded-2xl border border-stone-200 dark:border-zinc-800">
                    <h4 className="text-xs font-bold text-stone-500 dark:text-stone-400 mb-3 uppercase tracking-wider">Selecione as Religiões/Livros</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                      {otherReligionsBooks.map(book => (
                        <label key={book} className="flex items-center gap-2 p-2 rounded-lg hover:bg-stone-50 dark:hover:bg-zinc-800 cursor-pointer transition-colors">
                          <input
                            type="checkbox"
                            checked={selectedReligions.includes(book)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSelectedReligions([...selectedReligions, book]);
                              } else {
                                setSelectedReligions(selectedReligions.filter(r => r !== book));
                              }
                            }}
                            className="w-4 h-4 text-emerald-600 rounded border-stone-300 focus:ring-emerald-500"
                          />
                          <span className="text-sm text-stone-700 dark:text-stone-300">{book}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  <button
                    onClick={() => handleSearch(selectedReligions.join(', '))}
                    disabled={isLoading || selectedReligions.length === 0}
                    className="w-full py-4 bg-emerald-600 text-white font-bold rounded-2xl hover:bg-emerald-700 disabled:opacity-50 flex items-center justify-center gap-2 transition-all"
                  >
                    {isLoading ? (
                      <>
                        <BookOpen className="animate-pulse" size={18} />
                        Aguarde...
                      </>
                    ) : (
                      <>
                        <Search size={18} />
                        ⚓ Pesquisar
                      </>
                    )}
                  </button>
                </div>

                {result && (
                  <div className="space-y-4">
                    {resultThought && (
                      <div className="bg-amber-50/50 dark:bg-amber-900/10 border border-amber-200/50 dark:border-amber-800/30 rounded-2xl p-4">
                        <details className="group">
                          <summary className="flex items-center gap-2 text-xs font-bold text-amber-700 dark:text-amber-400 cursor-pointer list-none">
                            <Brain size={14} className="group-open:rotate-12 transition-transform" />
                            PROCESSO DE PENSAMENTO (IA)
                          </summary>
                          <div className="mt-3 text-xs text-amber-600/80 dark:text-amber-500/80 leading-relaxed italic">
                            {resultThought}
                          </div>
                        </details>
                      </div>
                    )}
                    <div 
                      ref={bibleResultRef}
                      className="bg-white dark:bg-zinc-900 p-8 rounded-3xl border border-stone-200 dark:border-zinc-800 shadow-sm prose dark:prose-invert max-w-none"
                    >
                      <ExpandableMarkdown content={result} onSearch={handleWikiSearch} />
                    </div>
                    
                    <div className="flex flex-wrap gap-2">
                      <button
                        onClick={() => handleListen(result)}
                        disabled={isGeneratingSpeech}
                        className="px-4 py-2 bg-stone-50 dark:bg-zinc-800 text-stone-600 dark:text-zinc-300 text-xs font-bold rounded-xl hover:bg-stone-100 flex items-center gap-2 border border-stone-100 dark:border-zinc-700 transition-all disabled:opacity-50"
                      >
                        {isGeneratingSpeech ? <Loader2 size={14} className="animate-spin" /> : <Volume2 size={14} />}
                        Ouvir
                      </button>
                      {result && !isOffline && (
                        <button 
                          onClick={handleDownloadOffline}
                          className="px-4 py-2 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 text-xs font-bold rounded-xl hover:bg-emerald-100 flex items-center gap-2 border border-emerald-100 dark:border-emerald-800/30 transition-all"
                          title="Salvar para Offline"
                        >
                          <WifiOff size={14} /> Offline
                        </button>
                      )}
                      <button onClick={() => handleCopy()} className="px-4 py-2 bg-stone-50 dark:bg-zinc-800 text-stone-600 dark:text-zinc-300 text-xs font-bold rounded-xl hover:bg-stone-100 flex items-center gap-2 border border-stone-100 dark:border-zinc-700 transition-all"><Copy size={14} /> Copiar</button>
                      <button onClick={handleDownloadResult} className="px-4 py-2 bg-stone-50 dark:bg-zinc-800 text-stone-600 dark:text-zinc-300 text-xs font-bold rounded-xl hover:bg-stone-100 flex items-center gap-2 border border-stone-100 dark:border-zinc-700 transition-all"><Download size={14} /> Baixar</button>
                      <button onClick={() => handleWikiSearch(searchQuery)} className="px-4 py-2 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 text-xs font-bold rounded-xl hover:bg-blue-100 flex items-center gap-2 border border-blue-100 dark:border-blue-800/30 transition-all"><Globe size={14} /> ⚓ Wiki</button>
                      <ShareButtons 
                        title="Estudo de Religiões" 
                        text={result} 
                      />
                      <button onClick={handleSaveDraft} className="px-4 py-2 bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400 text-xs font-bold rounded-xl hover:bg-amber-100 flex items-center gap-2 border border-amber-100 dark:border-amber-800/30 transition-all"><Pencil size={14} /> Salvar Rascunho</button>
                      <button onClick={() => handleSaveToNotebook(selectedBible || 'Outras Religiões', result)} className="px-4 py-2 bg-emerald-600 text-white text-xs font-bold rounded-xl hover:bg-emerald-700 flex items-center gap-2 shadow-sm transition-all"><Save size={14} /> Salvar no Caderno</button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'creation-tool' && (
              <div className="space-y-8">
                <div className="bg-white dark:bg-zinc-900 p-6 rounded-3xl border border-stone-200 dark:border-zinc-800 shadow-sm">
                  <div className="flex flex-col gap-4">
                    <div className="relative">
                      <input
                        type="text"
                        placeholder="⚓ Digite o tema (ex: A Graça de Deus)"
                        value={topic}
                        onChange={(e) => setTopic(e.target.value)}
                        className="w-full pl-6 pr-6 py-4 bg-stone-50 dark:bg-zinc-800 border border-stone-200 dark:border-zinc-700 rounded-2xl focus:ring-2 focus:ring-emerald-500 outline-none"
                      />
                    </div>
                    
                    <div className="bg-white dark:bg-zinc-900 p-4 rounded-2xl border border-stone-200 dark:border-zinc-800">
                      <h4 className="text-xs font-bold text-stone-500 dark:text-stone-400 mb-3 uppercase tracking-wider">Selecione o Tipo de Criação</h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
                        {[
                          { value: 'lesson', label: 'Lição Célula' },
                          { value: 'study', label: 'Estudo Bíblico' },
                          { value: 'outline', label: 'Esboço Pregação' },
                          { value: 'devotional', label: 'Devocional' },
                          { value: 'booklet', label: 'Apostila' },
                          { value: 'ebook', label: 'E-book' },
                          { value: 'message', label: 'Mensagem' },
                          { value: 'questions', label: 'Perguntas Bíblicas' }
                        ].map(type => (
                          <label key={type.value} className="flex items-center gap-2 p-2 rounded-lg hover:bg-stone-50 dark:hover:bg-zinc-800 cursor-pointer transition-colors">
                            <input
                              type="radio"
                              name="creationType"
                              value={type.value}
                              checked={creationType === type.value}
                              onChange={(e) => setCreationType(e.target.value as any)}
                              className="w-4 h-4 text-emerald-600 border-stone-300 focus:ring-emerald-500"
                            />
                            <span className="text-sm text-stone-700 dark:text-stone-300">{type.label}</span>
                          </label>
                        ))}
                      </div>
                    </div>

                    <div className="flex flex-col gap-4">
                      {creationType === 'message' && (
                        <div className="bg-white dark:bg-zinc-900 p-4 rounded-2xl border border-stone-200 dark:border-zinc-800">
                          <h4 className="text-xs font-bold text-stone-500 dark:text-stone-400 mb-3 uppercase tracking-wider">Tipo de Mensagem</h4>
                          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
                            {[
                              { value: 'outline', label: 'Pregação' },
                              { value: 'birthday', label: 'Mensagem de Aniversário' },
                              { value: 'wedding', label: 'Mensagem de Casamento' },
                              { value: 'newyear', label: 'Mensagem Fim do ano' },
                              { value: 'graduation', label: 'Mensagem Formatura' },
                              { value: 'devotional', label: 'Mensagem Devocional' },
                              { value: 'funeral', label: 'Mensagem Velório' },
                              { value: 'children', label: 'Mensagem Infantil' }
                            ].map(type => (
                              <label key={type.value} className="flex items-center gap-2 p-2 rounded-lg hover:bg-stone-50 dark:hover:bg-zinc-800 cursor-pointer transition-colors">
                                <input
                                  type="radio"
                                  name="messageType"
                                  value={type.value}
                                  checked={messageType === type.value}
                                  onChange={(e) => setMessageType(e.target.value as any)}
                                  className="w-4 h-4 text-emerald-600 border-stone-300 focus:ring-emerald-500"
                                />
                                <span className="text-sm text-stone-700 dark:text-stone-300">{type.label}</span>
                              </label>
                            ))}
                          </div>
                        </div>
                      )}
                      {creationType === 'questions' && (
                        <div className="flex flex-col gap-4">
                          <div className="bg-white dark:bg-zinc-900 p-4 rounded-2xl border border-stone-200 dark:border-zinc-800">
                            <h4 className="text-xs font-bold text-stone-500 dark:text-stone-400 mb-3 uppercase tracking-wider">Escopo</h4>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
                              {['Toda a Bíblia', 'Velho Testamento', 'Novo Testamento', 'Livro Específico'].map(scope => (
                                <label key={scope} className="flex items-center gap-2 p-2 rounded-lg hover:bg-stone-50 dark:hover:bg-zinc-800 cursor-pointer transition-colors">
                                  <input
                                    type="radio"
                                    name="questionsScope"
                                    value={scope}
                                    checked={questionsScope === scope}
                                    onChange={(e) => setQuestionsScope(e.target.value)}
                                    className="w-4 h-4 text-emerald-600 border-stone-300 focus:ring-emerald-500"
                                  />
                                  <span className="text-sm text-stone-700 dark:text-stone-300">{scope}</span>
                                </label>
                              ))}
                            </div>
                          </div>
                          {questionsScope === 'Livro Específico' && (
                            <input
                              type="text"
                              placeholder="Qual livro?"
                              value={questionsBook}
                              onChange={(e) => setQuestionsBook(e.target.value)}
                              className="w-full px-4 py-4 bg-white dark:bg-zinc-900 border border-stone-200 dark:border-zinc-800 rounded-2xl outline-none text-sm"
                            />
                          )}
                          <div className="bg-white dark:bg-zinc-900 p-4 rounded-2xl border border-stone-200 dark:border-zinc-800">
                            <h4 className="text-xs font-bold text-stone-500 dark:text-stone-400 mb-3 uppercase tracking-wider">Faixa Etária</h4>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
                              {['Crianças', 'Juniores', 'Adolescentes', 'Jovens', 'Adultos', 'Líderes', 'Teólogos'].map(age => (
                                <label key={age} className="flex items-center gap-2 p-2 rounded-lg hover:bg-stone-50 dark:hover:bg-zinc-800 cursor-pointer transition-colors">
                                  <input
                                    type="radio"
                                    name="questionsAgeGroup"
                                    value={age}
                                    checked={questionsAgeGroup === age}
                                    onChange={(e) => setQuestionsAgeGroup(e.target.value)}
                                    className="w-4 h-4 text-emerald-600 border-stone-300 focus:ring-emerald-500"
                                  />
                                  <span className="text-sm text-stone-700 dark:text-stone-300">{age}</span>
                                </label>
                              ))}
                            </div>
                          </div>
                          <div className="bg-white dark:bg-zinc-900 p-4 rounded-2xl border border-stone-200 dark:border-zinc-800">
                            <h4 className="text-xs font-bold text-stone-500 dark:text-stone-400 mb-3 uppercase tracking-wider">Quantidade</h4>
                            <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-5 gap-2">
                              {[10, 20, 30, 40, 50].map(count => (
                                <label key={count} className="flex items-center gap-2 p-2 rounded-lg hover:bg-stone-50 dark:hover:bg-zinc-800 cursor-pointer transition-colors">
                                  <input
                                    type="radio"
                                    name="questionsCount"
                                    value={count}
                                    checked={questionsCount === count}
                                    onChange={(e) => setQuestionsCount(Number(e.target.value))}
                                    className="w-4 h-4 text-emerald-600 border-stone-300 focus:ring-emerald-500"
                                  />
                                  <span className="text-sm text-stone-700 dark:text-stone-300">{count}</span>
                                </label>
                              ))}
                            </div>
                          </div>
                        </div>
                      )}
                      
                      <div className="flex justify-end mt-4">
                        <button
                          onClick={handleUnifiedCreation}
                          disabled={isLoading || !topic}
                          className="px-8 py-4 bg-emerald-600 text-white font-bold rounded-2xl hover:bg-emerald-700 disabled:opacity-50 flex items-center justify-center gap-2 transition-all"
                        >
                          {isLoading ? <Loader2 className="animate-spin" size={20} /> : <Sparkles size={20} />}
                          ⚓ Gerar
                          <CreditCostBadge cost={estimateCredits(creationType)} />
                        </button>
                      </div>
                    </div>
                  </div>
                  <div className="mt-4 flex items-center justify-between bg-emerald-50 dark:bg-emerald-900/20 p-4 rounded-2xl border border-emerald-100 dark:border-emerald-800/30">
                    <div className="flex items-center gap-2 text-emerald-700 dark:text-emerald-400">
                      <Zap size={18} />
                      <span className="text-sm font-bold">Calculadora de Créditos</span>
                    </div>
                    <div className="flex items-center gap-4 text-sm">
                      <span className="text-stone-600 dark:text-zinc-400">Custo estimado:</span>
                      <span className="font-bold text-emerald-600 dark:text-emerald-400 bg-white dark:bg-zinc-800 px-3 py-1 rounded-lg shadow-sm">
                        {estimateCredits(creationType)} créditos
                      </span>
                    </div>
                  </div>
                </div>

                {/* Results based on what was generated */}
                {lessonResult && creationType === 'lesson' && (
                  <div className="space-y-6">
                    {(showLeaderGuide ? leaderGuideThought : lessonResultThought) && (
                      <div className="bg-amber-50/50 dark:bg-amber-900/10 border border-amber-200/50 dark:border-amber-800/30 rounded-2xl p-4">
                        <details className="group">
                          <summary className="flex items-center gap-2 text-xs font-bold text-amber-700 dark:text-amber-400 cursor-pointer list-none">
                            <Brain size={14} className="group-open:rotate-12 transition-transform" />
                            PROCESSO DE PENSAMENTO (IA)
                          </summary>
                          <div className="mt-3 text-xs text-amber-600/80 dark:text-amber-500/80 leading-relaxed italic">
                            {showLeaderGuide ? leaderGuideThought : lessonResultThought}
                          </div>
                        </details>
                      </div>
                    )}
                    <div className="flex gap-4 mb-4">
                      <button onClick={() => setShowLeaderGuide(false)} className={cn("px-6 py-2 rounded-full font-bold transition-all", !showLeaderGuide ? "bg-emerald-600 text-white" : "bg-stone-100 dark:bg-zinc-800 text-stone-500")}>Lição</button>
                      <button onClick={() => setShowLeaderGuide(true)} className={cn("px-6 py-2 rounded-full font-bold transition-all", showLeaderGuide ? "bg-emerald-600 text-white" : "bg-stone-100 dark:bg-zinc-800 text-stone-500")}>Guia do Líder</button>
                    </div>
                    <div ref={bibleResultRef} className="bg-white dark:bg-zinc-900 p-8 md:p-12 rounded-3xl border border-stone-200 dark:border-zinc-800 shadow-lg prose dark:prose-invert max-w-none">
                      <ExpandableMarkdown content={showLeaderGuide ? leaderGuide : lessonResult} onSearch={handleWikiSearch} />
                    </div>
                    <div className="flex flex-wrap gap-3">
                      <button
                        onClick={() => handleListen(showLeaderGuide ? leaderGuide : lessonResult)}
                        disabled={isGeneratingSpeech}
                        className="flex-1 py-3 bg-stone-100 dark:bg-zinc-800 text-stone-600 dark:text-zinc-300 font-bold rounded-xl hover:bg-stone-200 flex items-center justify-center gap-2 disabled:opacity-50"
                      >
                        {isGeneratingSpeech ? <Loader2 size={18} className="animate-spin" /> : <Volume2 size={18} />}
                        Ouvir
                      </button>
                      <button onClick={() => { copyToClipboard(showLeaderGuide ? leaderGuide : lessonResult); showToast("Copiado! 📋✨"); }} className="flex-1 py-3 bg-stone-100 dark:bg-zinc-800 text-stone-600 dark:text-zinc-300 font-bold rounded-xl hover:bg-stone-200 flex items-center justify-center gap-2"><Copy size={18} /> Copiar</button>
                      <button onClick={() => { handleDownloadResult(); showToast("Baixando... 📄💎"); }} className="flex-1 py-3 bg-stone-100 dark:bg-zinc-800 text-stone-600 dark:text-zinc-300 font-bold rounded-xl hover:bg-stone-200 flex items-center justify-center gap-2"><Download size={18} /> Baixar</button>
                      <button onClick={() => handleWikiSearch(topic)} className="flex-1 py-3 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 font-bold rounded-xl hover:bg-blue-200 flex items-center justify-center gap-2"><Globe size={18} /> ⚓ Wiki</button>
                      <div className="flex-1 flex items-center justify-center">
                        <ShareButtons {...getShareData()} />
                      </div>
                      <button onClick={handleSaveDraft} className="flex-1 py-3 bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400 font-bold rounded-xl hover:bg-amber-100 flex items-center justify-center gap-2"><Pencil size={18} /> Salvar Rascunho</button>
                      <button onClick={() => handleSaveToNotebook(showLeaderGuide ? 'Guia do Líder' : 'Lição Bíblica', showLeaderGuide ? leaderGuide : lessonResult)} className="flex-1 py-3 bg-emerald-600 text-white font-bold rounded-xl hover:bg-emerald-700 flex items-center justify-center gap-2"><Save size={18} /> Salvar no Caderno</button>
                      <button onClick={handleCreateSlides} disabled={isGeneratingSlides} className="flex-1 py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 flex items-center justify-center gap-2 disabled:opacity-50">
                        {isGeneratingSlides ? <Loader2 className="animate-spin" size={18} /> : <Layout size={18} />}
                        Criar Slides IA
                      </button>
                    </div>
                  </div>
                )}

                {studyResult && creationType === 'study' && (
                  <div className="space-y-6">
                    {studyResultThought && (
                      <div className="bg-amber-50/50 dark:bg-amber-900/10 border border-amber-200/50 dark:border-amber-800/30 rounded-2xl p-4">
                        <details className="group">
                          <summary className="flex items-center gap-2 text-xs font-bold text-amber-700 dark:text-amber-400 cursor-pointer list-none">
                            <Brain size={14} className="group-open:rotate-12 transition-transform" />
                            PROCESSO DE PENSAMENTO (IA)
                          </summary>
                          <div className="mt-3 text-xs text-amber-600/80 dark:text-amber-500/80 leading-relaxed italic">
                            {studyResultThought}
                          </div>
                        </details>
                      </div>
                    )}
                    <div ref={bibleResultRef} className="bg-white dark:bg-zinc-900 p-8 md:p-12 rounded-3xl border border-stone-200 dark:border-zinc-800 shadow-lg prose dark:prose-invert max-w-none">
                      <ExpandableMarkdown content={studyResult} onSearch={handleWikiSearch} />
                    </div>
                    <div className="flex flex-wrap gap-3">
                      <button
                        onClick={() => handleListen(studyResult)}
                        disabled={isGeneratingSpeech}
                        className="flex-1 py-3 bg-stone-100 dark:bg-zinc-800 text-stone-600 dark:text-zinc-300 font-bold rounded-xl hover:bg-stone-200 flex items-center justify-center gap-2 disabled:opacity-50"
                      >
                        {isGeneratingSpeech ? <Loader2 size={18} className="animate-spin" /> : <Volume2 size={18} />}
                        Ouvir
                      </button>
                      <button onClick={() => { copyToClipboard(studyResult); showToast("Copiado! 📋✨"); }} className="flex-1 py-3 bg-stone-100 dark:bg-zinc-800 text-stone-600 dark:text-zinc-300 font-bold rounded-xl hover:bg-stone-200 flex items-center justify-center gap-2"><Copy size={18} /> Copiar</button>
                      <button onClick={() => { handleDownloadResult(); showToast("Baixando... 📄💎"); }} className="flex-1 py-3 bg-stone-100 dark:bg-zinc-800 text-stone-600 dark:text-zinc-300 font-bold rounded-xl hover:bg-stone-200 flex items-center justify-center gap-2"><Download size={18} /> Baixar</button>
                      <button onClick={() => handleWikiSearch(topic)} className="flex-1 py-3 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 font-bold rounded-xl hover:bg-blue-200 flex items-center justify-center gap-2"><Globe size={18} /> ⚓ Wiki</button>
                      <div className="flex-1 flex items-center justify-center">
                        <ShareButtons {...getShareData()} />
                      </div>
                      <button onClick={handleSaveDraft} className="flex-1 py-3 bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400 font-bold rounded-xl hover:bg-amber-100 flex items-center justify-center gap-2"><Pencil size={18} /> Salvar Rascunho</button>
                      <button onClick={() => handleSaveToNotebook('Imersão Popular', studyResult)} className="flex-1 py-3 bg-emerald-600 text-white font-bold rounded-xl hover:bg-emerald-700 flex items-center justify-center gap-2"><Save size={18} /> Salvar no Caderno</button>
                      <button onClick={handleCreateSlides} disabled={isGeneratingSlides} className="flex-1 py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 flex items-center justify-center gap-2 disabled:opacity-50">
                        {isGeneratingSlides ? <Loader2 className="animate-spin" size={18} /> : <Layout size={18} />}
                        Criar Slides IA
                      </button>
                    </div>
                  </div>
                )}

                {outline && (creationType === 'outline' || (creationType === 'message' && messageType === 'outline')) && (
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2 space-y-6">
                      {outlineThought && (
                        <div className="bg-amber-50/50 dark:bg-amber-900/10 border border-amber-200/50 dark:border-amber-800/30 rounded-2xl p-4">
                          <details className="group">
                            <summary className="flex items-center gap-2 text-xs font-bold text-amber-700 dark:text-amber-400 cursor-pointer list-none">
                              <Brain size={14} className="group-open:rotate-12 transition-transform" />
                              PROCESSO DE PENSAMENTO (IA)
                            </summary>
                            <div className="mt-3 text-xs text-amber-600/80 dark:text-amber-500/80 leading-relaxed italic">
                              {outlineThought}
                            </div>
                          </details>
                        </div>
                      )}
                      <div ref={outlineRef} className="bg-white dark:bg-zinc-900 p-12 rounded-3xl border border-stone-200 dark:border-zinc-800 shadow-lg prose dark:prose-invert max-w-none min-h-[842px] w-full" style={{ fontFamily: 'Inter, sans-serif' }}>
                        <div className="mb-8 text-center border-b pb-8">
                          <h1 className="text-emerald-600 mb-2">Esboço de Pregação</h1>
                          <p className="text-stone-400 text-sm italic">Gerado pelo App do Pregador</p>
                        </div>
                        {isEditingOutline ? (
                          <textarea 
                            value={editedOutline} 
                            onChange={(e) => setEditedOutline(e.target.value)} 
                            className={cn(
                              "w-full h-[600px] p-8 bg-stone-50 dark:bg-zinc-800 border border-emerald-500 rounded-3xl outline-none leading-relaxed",
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
                        ) : (
                          <ExpandableMarkdown content={outline} onSearch={handleWikiSearch} />
                        )}
                      </div>
                    </div>
                    <div className="space-y-6">
                      <div className="bg-white dark:bg-zinc-900 p-6 rounded-3xl border border-stone-200 dark:border-zinc-800 shadow-sm">
                        <h3 className="font-bold text-lg mb-4 flex items-center gap-2"><Download size={20} className="text-emerald-600" /> Ações</h3>
                        <div className="space-y-3">
                          {isEditingOutline ? (
                            <div className="flex gap-2">
                              <button onClick={handleSaveEdit} className="flex-1 py-3 bg-emerald-600 text-white font-bold rounded-xl hover:bg-emerald-700 flex items-center justify-center gap-2"><Check size={18} /> Salvar</button>
                              <button onClick={handleCancelEdit} className="flex-1 py-3 bg-stone-100 dark:bg-zinc-800 text-stone-600 dark:text-zinc-300 font-bold rounded-xl hover:bg-stone-200"><CloseIcon size={18} /> Cancelar</button>
                            </div>
                          ) : (
                            <button onClick={() => setIsEditingOutline(true)} className="w-full py-3 bg-zinc-900 dark:bg-zinc-100 dark:text-zinc-900 text-white font-bold rounded-xl hover:opacity-90 flex items-center justify-center gap-2"><Edit size={18} /> Editar Esboço</button>
                          )}
                          <button 
                            onClick={exportPDF} 
                            disabled={isGeneratingPDF}
                            className="w-full py-3 bg-emerald-600 text-white font-bold rounded-xl hover:bg-emerald-700 flex items-center justify-center gap-2 disabled:opacity-50"
                          >
                            {isGeneratingPDF ? <Loader2 className="animate-spin" size={18} /> : <Download size={18} />}
                            Baixar PDF
                          </button>
                          <button onClick={() => handleWikiSearch(topic)} className="w-full py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 flex items-center justify-center gap-2"><Globe size={18} /> ⚓ Pesquisa Wiki</button>
                        <div className="flex gap-3">
                          <button
                            onClick={() => handleListen(outline)}
                            disabled={isGeneratingSpeech}
                            className="flex-1 py-3 bg-stone-100 dark:bg-zinc-800 text-stone-600 dark:text-zinc-300 font-bold rounded-xl hover:bg-stone-200 flex items-center justify-center gap-2 disabled:opacity-50"
                          >
                            {isGeneratingSpeech ? <Loader2 size={18} className="animate-spin" /> : <Volume2 size={18} />}
                            Ouvir
                          </button>
                          <button onClick={() => handleSaveToNotebook('Esboço', outline)} className="flex-1 py-3 bg-emerald-600 text-white font-bold rounded-xl hover:bg-emerald-700 flex items-center justify-center gap-2"><Save size={18} /> Salvar no Caderno</button>
                        </div>
                          <button onClick={handleCreateSlides} disabled={isGeneratingSlides} className="w-full py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 flex items-center justify-center gap-2 disabled:opacity-50">{isGeneratingSlides ? <Loader2 className="animate-spin" size={18} /> : <Layout size={18} />} Criar Slides IA</button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {debateResult && creationType === 'debate' && (
                  <div className="space-y-6">
                    {debateResultThought && (
                      <div className="bg-amber-50/50 dark:bg-amber-900/10 border border-amber-200/50 dark:border-amber-800/30 rounded-2xl p-4">
                        <details className="group">
                          <summary className="flex items-center gap-2 text-xs font-bold text-amber-700 dark:text-amber-400 cursor-pointer list-none">
                            <Brain size={14} className="group-open:rotate-12 transition-transform" />
                            PROCESSO DE PENSAMENTO (IA)
                          </summary>
                          <div className="mt-3 text-xs text-amber-600/80 dark:text-amber-500/80 leading-relaxed italic">
                            {debateResultThought}
                          </div>
                        </details>
                      </div>
                    )}
                    <div ref={bibleResultRef} className="bg-white dark:bg-zinc-900 p-8 md:p-12 rounded-3xl border border-stone-200 dark:border-zinc-800 shadow-lg prose dark:prose-invert max-w-none">
                      <ExpandableMarkdown content={debateResult} onSearch={handleWikiSearch} />
                    </div>
                    <div className="flex flex-wrap gap-3">
                      <button
                        onClick={() => handleListen(debateResult)}
                        disabled={isGeneratingSpeech}
                        className="flex-1 py-3 bg-stone-100 dark:bg-zinc-800 text-stone-600 dark:text-zinc-300 font-bold rounded-xl hover:bg-stone-200 flex items-center justify-center gap-2 disabled:opacity-50"
                      >
                        {isGeneratingSpeech ? <Loader2 size={18} className="animate-spin" /> : <Volume2 size={18} />}
                        Ouvir
                      </button>
                      <button onClick={() => { copyToClipboard(debateResult); showToast("Copiado! 📋✨"); }} className="flex-1 py-3 bg-stone-100 dark:bg-zinc-800 text-stone-600 dark:text-zinc-300 font-bold rounded-xl hover:bg-stone-200 flex items-center justify-center gap-2"><Copy size={18} /> Copiar</button>
                      <button onClick={() => { handleDownloadResult(); showToast("Baixando... 📄💎"); }} className="flex-1 py-3 bg-stone-100 dark:bg-zinc-800 text-stone-600 dark:text-zinc-300 font-bold rounded-xl hover:bg-stone-200 flex items-center justify-center gap-2"><Download size={18} /> Baixar</button>
                      <button onClick={() => handleSaveToNotebook('Debate Teológico', debateResult)} className="flex-1 py-3 bg-emerald-600 text-white font-bold rounded-xl hover:bg-emerald-700 flex items-center justify-center gap-2"><Save size={18} /> Salvar no Caderno</button>
                    </div>
                  </div>
                )}

                {(devotionalResult && (creationType === 'devotional' || (creationType === 'message' && messageType === 'devotional'))) && (
                  <div className="space-y-6">
                    {devotionalResultThought && (
                      <div className="bg-amber-50/50 dark:bg-amber-900/10 border border-amber-200/50 dark:border-amber-800/30 rounded-2xl p-4">
                        <details className="group">
                          <summary className="flex items-center gap-2 text-xs font-bold text-amber-700 dark:text-amber-400 cursor-pointer list-none">
                            <Brain size={14} className="group-open:rotate-12 transition-transform" />
                            PROCESSO DE PENSAMENTO (IA)
                          </summary>
                          <div className="mt-3 text-xs text-amber-600/80 dark:text-amber-500/80 leading-relaxed italic">
                            {devotionalResultThought}
                          </div>
                        </details>
                      </div>
                    )}
                    <div ref={bibleResultRef} className="bg-white dark:bg-zinc-900 p-8 md:p-12 rounded-3xl border border-stone-200 dark:border-zinc-800 shadow-lg prose dark:prose-invert max-w-none">
                      <ExpandableMarkdown content={devotionalResult} onSearch={handleWikiSearch} />
                    </div>
                    <div className="flex flex-wrap gap-3">
                      <button
                        onClick={() => handleListen(devotionalResult)}
                        disabled={isGeneratingSpeech}
                        className="flex-1 py-3 bg-stone-100 dark:bg-zinc-800 text-stone-600 dark:text-zinc-300 font-bold rounded-xl hover:bg-stone-200 flex items-center justify-center gap-2 disabled:opacity-50"
                      >
                        {isGeneratingSpeech ? <Loader2 size={18} className="animate-spin" /> : <Volume2 size={18} />}
                        Ouvir
                      </button>
                      <button onClick={() => { copyToClipboard(devotionalResult); showToast("Copiado! 📋✨"); }} className="flex-1 py-3 bg-stone-100 dark:bg-zinc-800 text-stone-600 dark:text-zinc-300 font-bold rounded-xl hover:bg-stone-200 flex items-center justify-center gap-2"><Copy size={18} /> Copiar</button>
                      <button onClick={() => { handleDownloadResult(); showToast("Baixando... 📄💎"); }} className="flex-1 py-3 bg-stone-100 dark:bg-zinc-800 text-stone-600 dark:text-zinc-300 font-bold rounded-xl hover:bg-stone-200 flex items-center justify-center gap-2"><Download size={18} /> Baixar</button>
                      <button onClick={() => handleWikiSearch(topic)} className="flex-1 py-3 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 font-bold rounded-xl hover:bg-blue-200 flex items-center justify-center gap-2"><Globe size={18} /> ⚓ Wiki</button>
                      <div className="flex-1 flex items-center justify-center">
                        <ShareButtons {...getShareData()} />
                      </div>
                      <button onClick={handleSaveDraft} className="flex-1 py-3 bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400 font-bold rounded-xl hover:bg-amber-100 flex items-center justify-center gap-2"><Pencil size={18} /> Salvar Rascunho</button>
                      <button onClick={() => handleSaveToNotebook('Devocional Diário', devotionalResult)} className="flex-1 py-3 bg-emerald-600 text-white font-bold rounded-xl hover:bg-emerald-700 flex items-center justify-center gap-2"><Save size={18} /> Salvar no Caderno</button>
                    </div>
                  </div>
                )}

                {messageResult && creationType === 'message' && messageType !== 'outline' && messageType !== 'devotional' && (
                  <div className="space-y-6">
                    {messageResultThought && (
                      <div className="bg-amber-50/50 dark:bg-amber-900/10 border border-amber-200/50 dark:border-amber-800/30 rounded-2xl p-4">
                        <details className="group">
                          <summary className="flex items-center gap-2 text-xs font-bold text-amber-700 dark:text-amber-400 cursor-pointer list-none">
                            <Brain size={14} className="group-open:rotate-12 transition-transform" />
                            PROCESSO DE PENSAMENTO (IA)
                          </summary>
                          <div className="mt-3 text-xs text-amber-600/80 dark:text-amber-500/80 leading-relaxed italic">
                            {messageResultThought}
                          </div>
                        </details>
                      </div>
                    )}
                    <div ref={bibleResultRef} className="bg-white dark:bg-zinc-900 p-8 md:p-12 rounded-3xl border border-stone-200 dark:border-zinc-800 shadow-lg prose dark:prose-invert max-w-none">
                      <ExpandableMarkdown content={messageResult} onSearch={handleWikiSearch} />
                    </div>
                    <div className="flex flex-wrap gap-3">
                      <button
                        onClick={() => handleListen(messageResult)}
                        disabled={isGeneratingSpeech}
                        className="flex-1 py-3 bg-stone-100 dark:bg-zinc-800 text-stone-600 dark:text-zinc-300 font-bold rounded-xl hover:bg-stone-200 flex items-center justify-center gap-2 disabled:opacity-50"
                      >
                        {isGeneratingSpeech ? <Loader2 size={18} className="animate-spin" /> : <Volume2 size={18} />}
                        Ouvir
                      </button>
                      <button onClick={() => { copyToClipboard(messageResult); showToast("Copiado! 📋✨"); }} className="flex-1 py-3 bg-stone-100 dark:bg-zinc-800 text-stone-600 dark:text-zinc-300 font-bold rounded-xl hover:bg-stone-200 flex items-center justify-center gap-2"><Copy size={18} /> Copiar</button>
                      <button onClick={() => { handleDownloadResult(); showToast("Baixando... 📄💎"); }} className="flex-1 py-3 bg-stone-100 dark:bg-zinc-800 text-stone-600 dark:text-zinc-300 font-bold rounded-xl hover:bg-stone-200 flex items-center justify-center gap-2"><Download size={18} /> Baixar</button>
                      <button onClick={() => handleWikiSearch(topic)} className="flex-1 py-3 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 font-bold rounded-xl hover:bg-blue-200 flex items-center justify-center gap-2"><Globe size={18} /> ⚓ Wiki</button>
                      <div className="flex-1 flex items-center justify-center">
                        <ShareButtons {...getShareData()} />
                      </div>
                      <button onClick={handleSaveDraft} className="flex-1 py-3 bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400 font-bold rounded-xl hover:bg-amber-100 flex items-center justify-center gap-2"><Pencil size={18} /> Salvar Rascunho</button>
                      <button onClick={() => handleSaveToNotebook('Mensagem', messageResult)} className="flex-1 py-3 bg-emerald-600 text-white font-bold rounded-xl hover:bg-emerald-700 flex items-center justify-center gap-2"><Save size={18} /> Salvar no Caderno</button>
                    </div>
                  </div>
                )}

                {bookletResult && creationType === 'booklet' && (
                  <div className="space-y-6">
                    {bookletResultThought && (
                      <div className="bg-amber-50/50 dark:bg-amber-900/10 border border-amber-200/50 dark:border-amber-800/30 rounded-2xl p-4">
                        <details className="group">
                          <summary className="flex items-center gap-2 text-xs font-bold text-amber-700 dark:text-amber-400 cursor-pointer list-none">
                            <Brain size={14} className="group-open:rotate-12 transition-transform" />
                            PROCESSO DE PENSAMENTO (IA)
                          </summary>
                          <div className="mt-3 text-xs text-amber-600/80 dark:text-amber-500/80 leading-relaxed italic">
                            {bookletResultThought}
                          </div>
                        </details>
                      </div>
                    )}
                    {isLoading && (
                      <div className="bg-emerald-50 dark:bg-emerald-900/20 p-6 rounded-2xl border border-emerald-100 dark:border-emerald-800/30">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <Loader2 className="animate-spin text-emerald-600" size={18} />
                            <span className="text-sm font-bold text-emerald-700 dark:text-emerald-400">{bookletProgress.label}</span>
                          </div>
                          <span className="text-sm font-mono font-bold">{Math.round((bookletProgress.current / bookletProgress.total) * 100)}%</span>
                        </div>
                        <div className="w-full h-3 bg-stone-200 dark:bg-zinc-800 rounded-full overflow-hidden mb-4">
                          <motion.div 
                            className="h-full bg-emerald-600"
                            initial={{ width: 0 }}
                            animate={{ width: `${(bookletProgress.current / bookletProgress.total) * 100}%` }}
                          />
                        </div>
                        <div className="flex justify-between items-center">
                          <p className="text-[10px] text-stone-400 italic">Processando {bookletProgress.current} de {bookletProgress.total} recursos...</p>
                          <button 
                            onClick={stopBooklet}
                            disabled={isStoppingBooklet}
                            className="px-4 py-1 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 text-xs font-bold rounded-lg hover:bg-red-200 transition-colors disabled:opacity-50"
                          >
                            {isStoppingBooklet ? "Parando..." : "Interromper Geração"}
                          </button>
                        </div>
                      </div>
                    )}
                    <div id="booklet-content" className="bg-white dark:bg-zinc-900 p-8 md:p-12 rounded-3xl border border-stone-200 dark:border-zinc-800 shadow-lg prose dark:prose-invert max-w-none">
                      {isEditingOutline ? (
                        <textarea 
                          value={editedOutline} 
                          onChange={(e) => setEditedOutline(e.target.value)} 
                          className={cn(
                            "w-full h-[600px] p-8 bg-stone-50 dark:bg-zinc-800 border border-emerald-500 rounded-3xl outline-none leading-relaxed",
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
                      ) : (
                        <ExpandableMarkdown content={bookletResult} onSearch={handleWikiSearch} />
                      )}
                    </div>
                    <div className="flex flex-wrap gap-3">
                      {isEditingOutline ? (
                        <>
                          <button onClick={handleSaveEdit} className="flex-1 py-3 bg-emerald-600 text-white font-bold rounded-xl hover:bg-emerald-700 flex items-center justify-center gap-2"><Check size={18} /> Salvar</button>
                          <button onClick={handleCancelEdit} className="flex-1 py-3 bg-stone-100 dark:bg-zinc-800 text-stone-600 dark:text-zinc-300 font-bold rounded-xl hover:bg-stone-200 flex items-center justify-center gap-2"><CloseIcon size={18} /> Cancelar</button>
                        </>
                      ) : (
                        <>
                          <button
                            onClick={() => handleListen(bookletResult)}
                            disabled={isGeneratingSpeech}
                            className="flex-1 py-3 bg-stone-100 dark:bg-zinc-800 text-stone-600 dark:text-zinc-300 font-bold rounded-xl hover:bg-stone-200 flex items-center justify-center gap-2 disabled:opacity-50"
                          >
                            {isGeneratingSpeech ? <Loader2 size={18} className="animate-spin" /> : <Volume2 size={18} />}
                            Ouvir
                          </button>
                          <button onClick={() => { setIsEditingOutline(true); setEditedOutline(bookletResult); }} className="flex-1 py-3 bg-stone-100 dark:bg-zinc-800 text-stone-600 dark:text-zinc-300 font-bold rounded-xl hover:bg-stone-200 flex items-center justify-center gap-2"><Edit size={18} /> Editar</button>
                          <button onClick={() => { copyToClipboard(bookletResult); showToast("Copiado! 📋✨"); }} className="flex-1 py-3 bg-stone-100 dark:bg-zinc-800 text-stone-600 dark:text-zinc-300 font-bold rounded-xl hover:bg-stone-200 flex items-center justify-center gap-2"><Copy size={18} /> Copiar</button>
                          <button 
                            onClick={handleDownloadBookletPDF} 
                            disabled={isGeneratingPDF}
                            className="flex-1 py-3 bg-stone-100 dark:bg-zinc-800 text-stone-600 dark:text-zinc-300 font-bold rounded-xl hover:bg-stone-200 flex items-center justify-center gap-2 disabled:opacity-50"
                          >
                            {isGeneratingPDF ? <Loader2 className="animate-spin" size={18} /> : <Download size={18} />}
                            Baixar PDF
                          </button>
                          <button onClick={() => { handleShareResult(); showToast("Compartilhando... 🕊️✨"); }} className="flex-1 py-3 bg-stone-100 dark:bg-zinc-800 text-stone-600 dark:text-zinc-300 font-bold rounded-xl hover:bg-stone-200 flex items-center justify-center gap-2"><Share2 size={18} /> Compartilhar</button>
                          <button onClick={handleSaveDraft} className="flex-1 py-3 bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400 font-bold rounded-xl hover:bg-amber-100 flex items-center justify-center gap-2"><Pencil size={18} /> Salvar Rascunho</button>
                          <button onClick={() => handleSaveToNotebook('Apostila Completa', bookletResult)} className="flex-1 py-3 bg-emerald-600 text-white font-bold rounded-xl hover:bg-emerald-700 flex items-center justify-center gap-2"><Save size={18} /> Salvar no Caderno</button>
                        </>
                      )}
                    </div>
                  </div>
                )}

                {ebookResult && creationType === 'ebook' && (
                  <div className="space-y-6">
                    {ebookResultThought && (
                      <div className="bg-amber-50/50 dark:bg-amber-900/10 border border-amber-200/50 dark:border-amber-800/30 rounded-2xl p-4">
                        <details className="group">
                          <summary className="flex items-center gap-2 text-xs font-bold text-amber-700 dark:text-amber-400 cursor-pointer list-none">
                            <Brain size={14} className="group-open:rotate-12 transition-transform" />
                            PROCESSO DE PENSAMENTO (IA)
                          </summary>
                          <div className="mt-3 text-xs text-amber-600/80 dark:text-amber-500/80 leading-relaxed italic">
                            {ebookResultThought}
                          </div>
                        </details>
                      </div>
                    )}
                    <div id="ebook-content" className="bg-white dark:bg-zinc-900 p-8 md:p-12 rounded-3xl border border-stone-200 dark:border-zinc-800 shadow-lg prose dark:prose-invert max-w-none">
                      {isEditingOutline ? (
                        <textarea 
                          value={editedOutline} 
                          onChange={(e) => setEditedOutline(e.target.value)} 
                          className={cn(
                            "w-full h-[600px] p-8 bg-stone-50 dark:bg-zinc-800 border border-emerald-500 rounded-3xl outline-none leading-relaxed",
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
                      ) : (
                        <ExpandableMarkdown content={ebookResult} onSearch={handleWikiSearch} />
                      )}
                    </div>
                    <div className="flex flex-wrap gap-3">
                      {isEditingOutline ? (
                        <>
                          <button onClick={handleSaveEdit} className="flex-1 py-3 bg-emerald-600 text-white font-bold rounded-xl hover:bg-emerald-700 flex items-center justify-center gap-2"><Check size={18} /> Salvar</button>
                          <button onClick={handleCancelEdit} className="flex-1 py-3 bg-stone-100 dark:bg-zinc-800 text-stone-600 dark:text-zinc-300 font-bold rounded-xl hover:bg-stone-200 flex items-center justify-center gap-2"><CloseIcon size={18} /> Cancelar</button>
                        </>
                      ) : (
                        <>
                          <button
                            onClick={() => handleListen(ebookResult)}
                            disabled={isGeneratingSpeech}
                            className="flex-1 py-3 bg-stone-100 dark:bg-zinc-800 text-stone-600 dark:text-zinc-300 font-bold rounded-xl hover:bg-stone-200 flex items-center justify-center gap-2 disabled:opacity-50"
                          >
                            {isGeneratingSpeech ? <Loader2 size={18} className="animate-spin" /> : <Volume2 size={18} />}
                            Ouvir
                          </button>
                          <button onClick={() => { setIsEditingOutline(true); setEditedOutline(ebookResult); }} className="flex-1 py-3 bg-stone-100 dark:bg-zinc-800 text-stone-600 dark:text-zinc-300 font-bold rounded-xl hover:bg-stone-200 flex items-center justify-center gap-2"><Edit size={18} /> Editar</button>
                          <button onClick={() => { copyToClipboard(ebookResult); showToast("Copiado! 📋✨"); }} className="flex-1 py-3 bg-stone-100 dark:bg-zinc-800 text-stone-600 dark:text-zinc-300 font-bold rounded-xl hover:bg-stone-200 flex items-center justify-center gap-2"><Copy size={18} /> Copiar</button>
                          <button 
                            onClick={handleDownloadEbookPDF} 
                            disabled={isGeneratingPDF}
                            className="flex-1 py-3 bg-stone-100 dark:bg-zinc-800 text-stone-600 dark:text-zinc-300 font-bold rounded-xl hover:bg-stone-200 flex items-center justify-center gap-2 disabled:opacity-50"
                          >
                            {isGeneratingPDF ? <Loader2 className="animate-spin" size={18} /> : <Download size={18} />}
                            Baixar PDF
                          </button>
                          <button onClick={() => { handleShareResult(); showToast("Compartilhando... 🕊️✨"); }} className="flex-1 py-3 bg-stone-100 dark:bg-zinc-800 text-stone-600 dark:text-zinc-300 font-bold rounded-xl hover:bg-stone-200 flex items-center justify-center gap-2"><Share2 size={18} /> Compartilhar</button>
                          <button onClick={handleSaveDraft} className="flex-1 py-3 bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400 font-bold rounded-xl hover:bg-amber-100 flex items-center justify-center gap-2"><Pencil size={18} /> Salvar Rascunho</button>
                          <button onClick={() => handleSaveToNotebook('E-book', ebookResult)} className="flex-1 py-3 bg-emerald-600 text-white font-bold rounded-xl hover:bg-emerald-700 flex items-center justify-center gap-2"><Save size={18} /> Salvar no Caderno</button>
                        </>
                      )}
                    </div>
                  </div>
                )}

                {questionsResult && creationType === 'questions' && (
                  <div className="space-y-6">
                    {questionsResultThought && (
                      <div className="bg-amber-50/50 dark:bg-amber-900/10 border border-amber-200/50 dark:border-amber-800/30 rounded-2xl p-4">
                        <details className="group">
                          <summary className="flex items-center gap-2 text-xs font-bold text-amber-700 dark:text-amber-400 cursor-pointer list-none">
                            <Brain size={14} className="group-open:rotate-12 transition-transform" />
                            PROCESSO DE PENSAMENTO (IA)
                          </summary>
                          <div className="mt-3 text-xs text-amber-600/80 dark:text-amber-500/80 leading-relaxed italic">
                            {questionsResultThought}
                          </div>
                        </details>
                      </div>
                    )}
                    <div ref={bibleResultRef} className="bg-white dark:bg-zinc-900 p-8 md:p-12 rounded-3xl border border-stone-200 dark:border-zinc-800 shadow-lg prose dark:prose-invert max-w-none">
                      <ExpandableMarkdown content={questionsResult} onSearch={handleWikiSearch} />
                      {quizQuestions && (
                        <button
                          onClick={() => setIsQuizOpen(true)}
                          className="mt-6 w-full py-4 bg-emerald-600 text-white font-bold rounded-2xl hover:bg-emerald-700 flex items-center justify-center gap-2 transition-all shadow-lg shadow-emerald-600/20"
                        >
                          <Trophy size={20} />
                          Jogar Quiz
                        </button>
                      )}
                    </div>
                    {isQuizOpen && quizQuestions && (
                      <GeneratedQuizPlayer questions={quizQuestions} onClose={() => setIsQuizOpen(false)} />
                    )}
                    <div className="flex flex-wrap gap-3">
                      <button
                        onClick={() => handleListen(questionsResult)}
                        disabled={isGeneratingSpeech}
                        className="flex-1 py-3 bg-stone-100 dark:bg-zinc-800 text-stone-600 dark:text-zinc-300 font-bold rounded-xl hover:bg-stone-200 flex items-center justify-center gap-2 disabled:opacity-50"
                      >
                        {isGeneratingSpeech ? <Loader2 size={18} className="animate-spin" /> : <Volume2 size={18} />}
                        Ouvir
                      </button>
                      <button onClick={() => { copyToClipboard(questionsResult); showToast("Copiado! 📋✨"); }} className="flex-1 py-3 bg-stone-100 dark:bg-zinc-800 text-stone-600 dark:text-zinc-300 font-bold rounded-xl hover:bg-stone-200 flex items-center justify-center gap-2"><Copy size={18} /> Copiar</button>
                      <button onClick={() => { handleDownloadResult(); showToast("Baixando... 📄💎"); }} className="flex-1 py-3 bg-stone-100 dark:bg-zinc-800 text-stone-600 dark:text-zinc-300 font-bold rounded-xl hover:bg-stone-200 flex items-center justify-center gap-2"><Download size={18} /> Baixar</button>
                      <button onClick={() => handleWikiSearch(topic)} className="flex-1 py-3 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 font-bold rounded-xl hover:bg-blue-200 flex items-center justify-center gap-2"><Globe size={18} /> ⚓ Wiki</button>
                      <button onClick={() => { handleShareResult(); showToast("Compartilhando... 🕊️✨"); }} className="flex-1 py-3 bg-stone-100 dark:bg-zinc-800 text-stone-600 dark:text-zinc-300 font-bold rounded-xl hover:bg-stone-200 flex items-center justify-center gap-2"><Share2 size={18} /> Compartilhar</button>
                      <button onClick={handleSaveDraft} className="flex-1 py-3 bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400 font-bold rounded-xl hover:bg-amber-100 flex items-center justify-center gap-2"><Pencil size={18} /> Salvar Rascunho</button>
                      <button onClick={() => handleSaveToNotebook('Perguntas Bíblicas', questionsResult)} className="flex-1 py-3 bg-emerald-600 text-white font-bold rounded-xl hover:bg-emerald-700 flex items-center justify-center gap-2"><Save size={18} /> Salvar no Caderno</button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'narration' && (
              <div className="space-y-8">
                <div className="bg-white dark:bg-zinc-900 p-8 rounded-[3rem] border border-stone-200 dark:border-zinc-800 shadow-sm">
                  <div className="flex flex-col gap-6">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="p-3 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 rounded-2xl">
                        <Volume2 size={24} />
                      </div>
                      <div>
                        <h2 className="text-2xl font-display font-black tracking-tight">Geração de Narração</h2>
                        <p className="text-stone-500 text-sm">Gere narrações profissionais para seus estudos, lições ou mensagens</p>
                      </div>
                    </div>

                    <SpeechGenerator 
                      initialText={narrationAudioData ? narrationAudioData.text : (narrationText || topic)}
                      initialAudioUrl={narrationAudioData?.audioUrl}
                      initialVoice={narrationAudioData?.voice}
                      initialEmotion={narrationAudioData?.emotion}
                      initialTitle={narrationAudioData?.title}
                      initialSubject={narrationAudioData?.subject}
                      onSaveToNotebook={handleSaveToNotebook}
                    />
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'stories_theater' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-8"
              >
                <div className="bg-white dark:bg-zinc-900 p-8 rounded-[2.5rem] border border-stone-200 dark:border-zinc-800 shadow-xl">
                  <div className="flex items-center gap-4 mb-8">
                    <div className="w-12 h-12 bg-rose-100 dark:bg-rose-900/50 rounded-2xl flex items-center justify-center text-rose-600 dark:text-rose-400">
                      <Theater size={24} />
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold font-display text-stone-900 dark:text-white">Estórias & Teatro</h3>
                      <p className="text-stone-500 dark:text-zinc-400">Crie roteiros de teatro e estórias impactantes para todas as idades</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-6 mb-8">
                    <div>
                      <label className="block text-sm font-bold text-stone-700 dark:text-zinc-300 mb-2 ml-1">
                        Tema para Estórias & Teatro
                      </label>
                      <input
                        type="text"
                        placeholder="⚓ Digite o tema (ex: O Amor de Deus, A Arca de Noé, Superação)"
                        value={storiesTheaterTopic}
                        onChange={(e) => setStoriesTheaterTopic(e.target.value)}
                        className="w-full p-4 bg-stone-50 dark:bg-zinc-800 border border-stone-200 dark:border-zinc-700 rounded-2xl focus:ring-2 focus:ring-rose-500 outline-none font-bold"
                      />
                    </div>

                    <div className="bg-stone-50 dark:bg-zinc-800 p-4 rounded-2xl border border-stone-200 dark:border-zinc-700">
                      <h4 className="text-xs font-bold text-stone-500 dark:text-stone-400 mb-3 uppercase tracking-wider">Faixa Etária</h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
                        {[
                          { value: 'Maternal até 3 anos', label: 'Maternal (até 3 anos)' },
                          { value: 'Primário 4 a 5 anos', label: 'Primário (4 a 5 anos)' },
                          { value: 'Juniores 6 a 9 anos', label: 'Juniores (6 a 9 anos)' },
                          { value: 'Pré-adolescentes 10 a 12 anos', label: 'Pré-adolescentes (10 a 12 anos)' },
                          { value: 'Adolescentes 13 a 17 anos', label: 'Adolescentes (13-17 anos)' },
                          { value: 'Jovens 18 a 28 anos', label: 'Jovens (18-28 anos)' },
                          { value: 'Adultos 29 a 59 anos', label: 'Adultos (29-59 anos)' },
                          { value: 'Idosos 60 a 120 anos', label: 'Idosos (60-120 anos)' }
                        ].map(age => (
                          <label key={age.value} className="flex items-center gap-2 p-2 rounded-lg hover:bg-white dark:hover:bg-zinc-900 cursor-pointer transition-colors">
                            <input
                              type="radio"
                              name="storiesTheaterAgeGroup"
                              value={age.value}
                              checked={storiesTheaterAgeGroup === age.value}
                              onChange={(e) => setStoriesTheaterAgeGroup(e.target.value)}
                              className="w-4 h-4 text-rose-600 border-stone-300 focus:ring-rose-500"
                            />
                            <span className="text-sm text-stone-700 dark:text-stone-300">{age.label}</span>
                          </label>
                        ))}
                      </div>
                    </div>

                    <div className="bg-stone-50 dark:bg-zinc-800 p-4 rounded-2xl border border-stone-200 dark:border-zinc-700">
                      <h4 className="text-xs font-bold text-stone-500 dark:text-stone-400 mb-3 uppercase tracking-wider">O que deseja gerar?</h4>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                        {[
                          { value: 'theater', label: 'Gerar Teatro' },
                          { value: 'stories', label: 'Gerar Estórias' },
                          { value: 'bibleStory', label: 'Gerar História Bíblica' }
                        ].map(type => (
                          <label key={type.value} className="flex items-center gap-2 p-2 rounded-lg hover:bg-white dark:hover:bg-zinc-900 cursor-pointer transition-colors">
                            <input
                              type="radio"
                              name="storiesTheaterType"
                              value={type.value}
                              checked={storiesTheaterType === type.value}
                              onChange={(e) => setStoriesTheaterType(e.target.value)}
                              className="w-4 h-4 text-rose-600 border-stone-300 focus:ring-rose-500"
                            />
                            <span className="text-sm text-stone-700 dark:text-stone-300">{type.label}</span>
                          </label>
                        ))}
                      </div>
                    </div>

                    <div className="flex justify-end">
                      <button
                        onClick={handleGenerateStoriesTheater}
                        disabled={isGeneratingStoriesTheater || !storiesTheaterTopic}
                        className="w-full py-4 bg-rose-600 text-white font-bold rounded-2xl hover:bg-rose-700 disabled:opacity-50 flex items-center justify-center gap-2 transition-all shadow-lg shadow-rose-600/20"
                      >
                        {isGeneratingStoriesTheater ? (
                          <>
                            <Loader2 className="animate-spin" size={20} />
                            Gerando...
                          </>
                        ) : (
                          <>
                            <Sparkles size={20} />
                            Gerar Conteúdo
                          </>
                        )}
                      </button>
                    </div>
                  </div>

                  {storiesTheaterResult && (
                    <div className="mt-12 space-y-8">
                      <div className="flex flex-wrap gap-2 p-1 bg-stone-100 dark:bg-zinc-800 rounded-2xl w-fit">
                        {storiesTheaterResult.theater && (
                          <button
                            onClick={() => setStoriesTheaterActiveTab('theater')}
                            className={cn(
                              "px-6 py-2 rounded-xl font-bold text-sm transition-all",
                              storiesTheaterActiveTab === 'theater' ? "bg-white dark:bg-zinc-700 text-rose-600 shadow-sm" : "text-stone-500"
                            )}
                          >
                            Roteiro de Teatro
                          </button>
                        )}
                        {storiesTheaterResult.stories && (
                          <button
                            onClick={() => setStoriesTheaterActiveTab('stories')}
                            className={cn(
                              "px-6 py-2 rounded-xl font-bold text-sm transition-all",
                              storiesTheaterActiveTab === 'stories' ? "bg-white dark:bg-zinc-700 text-rose-600 shadow-sm" : "text-stone-500"
                            )}
                          >
                            Estória
                          </button>
                        )}
                        {storiesTheaterResult.bibleStory && (
                          <button
                            onClick={() => setStoriesTheaterActiveTab('bibleStory')}
                            className={cn(
                              "px-6 py-2 rounded-xl font-bold text-sm transition-all",
                              storiesTheaterActiveTab === 'bibleStory' ? "bg-white dark:bg-zinc-700 text-rose-600 shadow-sm" : "text-stone-500"
                            )}
                          >
                            História Bíblica
                          </button>
                        )}
                      </div>

                      <div className="bg-stone-50 dark:bg-zinc-800/50 p-8 rounded-[2rem] border border-stone-200 dark:border-zinc-800 relative group">
                        <div className="flex flex-wrap gap-3 mb-6 p-4 bg-white dark:bg-zinc-900 rounded-2xl shadow-sm border border-stone-100 dark:border-zinc-800">
                          <button
                            onClick={() => {
                              if (isEditingStoriesTheater) {
                                if (storiesTheaterResult) {
                                  setStoriesTheaterResult({
                                    ...storiesTheaterResult,
                                    [storiesTheaterActiveTab]: editedStoriesTheaterResult?.[storiesTheaterActiveTab]
                                  });
                                }
                                setIsEditingStoriesTheater(false);
                                showToast("Alterações salvas! ✨");
                              } else {
                                setEditedStoriesTheaterResult(storiesTheaterResult);
                                setIsEditingStoriesTheater(true);
                              }
                            }}
                            className="flex items-center gap-2 px-4 py-2 bg-blue-50 dark:bg-blue-900/20 text-blue-600 rounded-xl hover:bg-blue-100 transition-all font-bold text-sm"
                            title={isEditingStoriesTheater ? "Salvar Edição" : "Editar Conteúdo"}
                          >
                            {isEditingStoriesTheater ? <Save size={18} /> : <Pencil size={18} />}
                            {isEditingStoriesTheater ? "Salvar" : "Editar"}
                          </button>
                          
                          <button
                            onClick={() => {
                              const content = isEditingStoriesTheater 
                                ? editedStoriesTheaterResult?.[storiesTheaterActiveTab]
                                : (storiesTheaterActiveTab === 'theater' ? storiesTheaterResult.theater :
                                   storiesTheaterActiveTab === 'stories' ? storiesTheaterResult.stories :
                                   storiesTheaterResult.bibleStory);
                              if (content) {
                                copyToClipboard(content);
                                showToast("Copiado para a área de transferência! 📋");
                              }
                            }}
                            className="flex items-center gap-2 px-4 py-2 bg-stone-100 dark:bg-zinc-800 text-stone-600 rounded-xl hover:bg-stone-200 transition-all font-bold text-sm"
                            title="Copiar"
                          >
                            <Copy size={18} />
                            Copiar
                          </button>

                          <button
                            onClick={() => {
                              handleDownloadElement(storiesTheaterRef.current, `Stories_Theater_${storiesTheaterTopic}`);
                            }}
                            className="flex items-center gap-2 px-4 py-2 bg-stone-100 dark:bg-zinc-800 text-stone-600 rounded-xl hover:bg-stone-200 transition-all font-bold text-sm"
                            title="Baixar PDF"
                          >
                            <Download size={18} />
                            PDF
                          </button>

                          <button
                            onClick={() => {
                              const content = isEditingStoriesTheater 
                                ? editedStoriesTheaterResult?.[storiesTheaterActiveTab]
                                : (storiesTheaterActiveTab === 'theater' ? storiesTheaterResult.theater :
                                   storiesTheaterActiveTab === 'stories' ? storiesTheaterResult.stories :
                                   storiesTheaterResult.bibleStory);
                              if (content) {
                                handleShareContent(`Stories & Theater - ${storiesTheaterTopic}`, content);
                              }
                            }}
                            className="flex items-center gap-2 px-4 py-2 bg-purple-50 dark:bg-purple-900/20 text-purple-600 rounded-xl hover:bg-purple-100 transition-all font-bold text-sm"
                            title="Compartilhar"
                          >
                            <Share2 size={18} />
                            Compartilhar
                          </button>

                          <button
                            onClick={() => {
                              const content = isEditingStoriesTheater 
                                ? editedStoriesTheaterResult?.[storiesTheaterActiveTab]
                                : (storiesTheaterActiveTab === 'theater' ? storiesTheaterResult.theater :
                                   storiesTheaterActiveTab === 'stories' ? storiesTheaterResult.stories :
                                   storiesTheaterResult.bibleStory);
                              if (content) {
                                handleListen(content);
                              }
                            }}
                            className="flex items-center gap-2 px-4 py-2 bg-amber-50 dark:bg-amber-900/20 text-amber-600 rounded-xl hover:bg-amber-100 transition-all font-bold text-sm"
                            title="Ouvir"
                          >
                            <Volume2 size={18} />
                            Ouvir
                          </button>

                          <button
                            onClick={() => {
                              const content = isEditingStoriesTheater 
                                ? editedStoriesTheaterResult?.[storiesTheaterActiveTab]
                                : (storiesTheaterActiveTab === 'theater' ? storiesTheaterResult.theater :
                                   storiesTheaterActiveTab === 'stories' ? storiesTheaterResult.stories :
                                   storiesTheaterResult.bibleStory);
                              if (content) {
                                handleListen(content, true); // True for emotive narration
                              }
                            }}
                            className="flex items-center gap-2 px-4 py-2 bg-rose-50 dark:bg-rose-900/20 text-rose-600 rounded-xl hover:bg-rose-100 transition-all font-bold text-sm"
                            title="Narração Emotiva"
                          >
                            <Music size={18} />
                            Narrar
                          </button>

                          <button
                            onClick={() => {
                              const content = isEditingStoriesTheater 
                                ? editedStoriesTheaterResult?.[storiesTheaterActiveTab]
                                : (storiesTheaterActiveTab === 'theater' ? storiesTheaterResult.theater :
                                   storiesTheaterActiveTab === 'stories' ? storiesTheaterResult.stories :
                                   storiesTheaterResult.bibleStory);
                              if (content) {
                                setPendingNote({ 
                                  title: `${storiesTheaterActiveTab === 'theater' ? 'Roteiro' : 'História'}: ${storiesTheaterTopic}`, 
                                  content 
                                });
                                setIsNotebookModalOpen(true);
                              }
                            }}
                            className="flex items-center gap-2 px-4 py-2 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 rounded-xl hover:bg-emerald-100 transition-all font-bold text-sm ml-auto"
                            title="Salvar no Caderno"
                          >
                            <StickyNote size={18} />
                            Caderno
                          </button>
                        </div>

                        <div className="prose prose-stone dark:prose-invert max-w-none" ref={storiesTheaterRef}>
                          {isEditingStoriesTheater ? (
                            <textarea
                              value={editedStoriesTheaterResult?.[storiesTheaterActiveTab] || ''}
                              onChange={(e) => setEditedStoriesTheaterResult({
                                ...editedStoriesTheaterResult,
                                [storiesTheaterActiveTab]: e.target.value
                              })}
                              className="w-full h-[500px] p-6 bg-white dark:bg-zinc-900 border border-stone-200 dark:border-zinc-800 rounded-2xl focus:ring-2 focus:ring-rose-500 outline-none font-mono text-sm"
                            />
                          ) : (
                            <ExpandableMarkdown
                              content={storiesTheaterActiveTab === 'theater' ? storiesTheaterResult.theater || '' :
                               storiesTheaterActiveTab === 'stories' ? storiesTheaterResult.stories || '' :
                               storiesTheaterResult.bibleStory || ''}
                            />
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </motion.div>
            )}

            {activeTab === 'kids_ministry' && (
              <div className="space-y-8">
                <div className="bg-white dark:bg-zinc-900 p-6 rounded-3xl border border-stone-200 dark:border-zinc-800 shadow-sm">
                  <div className="flex flex-col gap-4">
                    <div className="relative">
                      <input
                        type="text"
                        placeholder="⚓ Digite o tema para o Ministério Infantil (ex: A Arca de Noé)"
                        value={topic}
                        onChange={(e) => setTopic(e.target.value)}
                        className="w-full pl-6 pr-6 py-4 bg-stone-50 dark:bg-zinc-800 border border-stone-200 dark:border-zinc-700 rounded-2xl focus:ring-2 focus:ring-emerald-500 outline-none"
                      />
                    </div>
                    
                    <div className="bg-white dark:bg-zinc-900 p-4 rounded-2xl border border-stone-200 dark:border-zinc-800">
                      <h4 className="text-xs font-bold text-stone-500 dark:text-stone-400 mb-3 uppercase tracking-wider">Faixa Etária</h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
                        {[
                          { value: 'Maternal até 3 anos', label: 'Maternal (até 3 anos)' },
                          { value: 'Primário 4 a 5 anos', label: 'Primário (4 a 5 anos)' },
                          { value: 'Juniores 6 a 9 anos', label: 'Juniores (6 a 9 anos)' },
                          { value: 'Pré-adolescentes 10 a 12 anos', label: 'Pré-adolescentes (10 a 12 anos)' }
                        ].map(age => (
                          <label key={age.value} className="flex items-center gap-2 p-2 rounded-lg hover:bg-stone-50 dark:hover:bg-zinc-800 cursor-pointer transition-colors">
                            <input
                              type="radio"
                              name="kidsAgeGroup"
                              value={age.value}
                              checked={kidsAgeGroup === age.value}
                              onChange={(e) => setKidsAgeGroup(e.target.value)}
                              className="w-4 h-4 text-emerald-600 border-stone-300 focus:ring-emerald-500"
                            />
                            <span className="text-sm text-stone-700 dark:text-stone-300">{age.label}</span>
                          </label>
                        ))}
                      </div>
                    </div>

                    <div className="bg-white dark:bg-zinc-900 p-4 rounded-2xl border border-stone-200 dark:border-zinc-800">
                      <h4 className="text-xs font-bold text-stone-500 dark:text-stone-400 mb-3 uppercase tracking-wider">Tipo de Conteúdo</h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
                        {[
                          'Lição EBD', 'Célula Infantil', 'Culto Infantil', 'Culto Doméstico', 'Evangelismo', 'História Bíblica', 'Hora de Dormir'
                        ].map(type => (
                          <label key={type} className="flex items-center gap-2 p-2 rounded-lg hover:bg-stone-50 dark:hover:bg-zinc-800 cursor-pointer transition-colors">
                            <input
                              type="radio"
                              name="kidsContentType"
                              value={type}
                              checked={kidsContentType === type}
                              onChange={(e) => setKidsContentType(e.target.value)}
                              className="w-4 h-4 text-emerald-600 border-stone-300 focus:ring-emerald-500"
                            />
                            <span className="text-sm text-stone-700 dark:text-stone-300">{type}</span>
                          </label>
                        ))}
                      </div>
                    </div>

                    <div className="flex justify-end mt-2">
                      <button
                        onClick={handleGenerateKidsMinistry}
                        disabled={isGeneratingKids || !topic}
                        className="px-8 py-4 bg-emerald-600 text-white font-bold rounded-2xl hover:bg-emerald-700 disabled:opacity-50 flex items-center justify-center gap-2 transition-all"
                      >
                        {isGeneratingKids ? <Loader2 className="animate-spin" size={20} /> : <Baby size={20} />}
                        ⚓ Gerar
                      </button>
                    </div>
                  </div>
                  <div className="mt-4 flex items-center justify-between bg-emerald-50 dark:bg-emerald-900/20 p-4 rounded-2xl border border-emerald-100 dark:border-emerald-800/30">
                    <div className="flex items-center gap-2 text-emerald-700 dark:text-emerald-400">
                      <Zap size={18} />
                      <span className="text-sm font-bold">Calculadora de Créditos</span>
                    </div>
                    <div className="flex items-center gap-4 text-sm">
                      <span className="text-stone-600 dark:text-zinc-400">Custo estimado:</span>
                      <span className="font-bold text-emerald-600 dark:text-emerald-400 bg-white dark:bg-zinc-800 px-3 py-1 rounded-lg shadow-sm">
                        5 créditos
                      </span>
                    </div>
                  </div>
                </div>

                {kidsResult && (
                  <div className="space-y-6">
                    <div className="flex flex-wrap gap-2 mb-4">
                      <button 
                        onClick={() => setKidsActiveTab('children')} 
                        className={cn("px-6 py-2 rounded-full font-bold transition-all", kidsActiveTab === 'children' ? "bg-emerald-600 text-white" : "bg-stone-100 dark:bg-zinc-800 text-stone-500")}
                      >
                        Para as Crianças
                      </button>
                      <button 
                        onClick={() => setKidsActiveTab('monitors')} 
                        className={cn("px-6 py-2 rounded-full font-bold transition-all", kidsActiveTab === 'monitors' ? "bg-emerald-600 text-white" : "bg-stone-100 dark:bg-zinc-800 text-stone-500")}
                      >
                        Para os Monitores
                      </button>
                      <button 
                        onClick={() => setKidsActiveTab('activities')} 
                        className={cn("px-6 py-2 rounded-full font-bold transition-all", kidsActiveTab === 'activities' ? "bg-emerald-600 text-white" : "bg-stone-100 dark:bg-zinc-800 text-stone-500")}
                      >
                        Atividades
                      </button>
                      <button 
                        onClick={() => {
                          if (!kidsIllustration) {
                            handleGenerateIllustration();
                          } else {
                            setKidsActiveTab('illustration');
                          }
                        }} 
                        className={cn("px-6 py-2 rounded-full font-bold transition-all flex items-center gap-2", kidsActiveTab === 'illustration' ? "bg-emerald-600 text-white" : "bg-stone-100 dark:bg-zinc-800 text-stone-500")}
                      >
                        {isGeneratingIllustration ? <Loader2 size={16} className="animate-spin" /> : <ImageIcon size={16} />}
                        Ilustração IA
                      </button>
                    </div>
                    <div className="bg-white dark:bg-zinc-900 p-8 md:p-12 rounded-3xl border border-stone-200 dark:border-zinc-800 shadow-lg prose dark:prose-invert max-w-none min-h-[400px] flex flex-col items-center justify-center">
                      {kidsActiveTab === 'illustration' ? (
                        kidsIllustration ? (
                          <div className="w-full flex flex-col items-center gap-4">
                            <img src={kidsIllustration} alt="Ilustração Infantil" className="max-w-full h-auto rounded-2xl shadow-md border border-stone-200 dark:border-zinc-800" referrerPolicy="no-referrer" />
                            <p className="text-sm text-stone-500 italic">Ilustração estilo Pixar/Disney para colorir (A4)</p>
                          </div>
                        ) : (
                          <div className="text-center py-12">
                            <ImageIcon size={48} className="mx-auto text-stone-300 mb-4" />
                            <p className="text-stone-500">Clique no botão acima para gerar a ilustração!</p>
                          </div>
                        )
                      ) : isEditingKidsResult ? (
                        <div className="w-full h-full flex flex-col gap-4">
                          <textarea
                            value={
                              kidsActiveTab === 'children' ? (editedKidsResult?.children || '') :
                              kidsActiveTab === 'monitors' ? (editedKidsResult?.monitors || '') :
                              (editedKidsResult?.activities || '')
                            }
                            onChange={(e) => {
                              const newResult = { ...editedKidsResult };
                              if (kidsActiveTab === 'children') newResult.children = e.target.value;
                              else if (kidsActiveTab === 'monitors') newResult.monitors = e.target.value;
                              else newResult.activities = e.target.value;
                              setEditedKidsResult(newResult);
                            }}
                            className="w-full h-[400px] p-6 bg-stone-50 dark:bg-zinc-800 border border-stone-200 dark:border-zinc-700 rounded-2xl focus:ring-2 focus:ring-emerald-500 outline-none resize-none font-sans"
                          />
                          <div className="flex gap-2 justify-end">
                            <button
                              onClick={handleCancelKidsEdit}
                              className="px-6 py-2 bg-stone-100 dark:bg-zinc-800 text-stone-600 dark:text-zinc-300 font-bold rounded-xl hover:bg-stone-200"
                            >
                              Cancelar
                            </button>
                            <button
                              onClick={handleSaveKidsEdit}
                              className="px-6 py-2 bg-emerald-600 text-white font-bold rounded-xl hover:bg-emerald-700"
                            >
                              Salvar Alterações
                            </button>
                          </div>
                        </div>
                      ) : (
                        <ExpandableMarkdown 
                          content={
                            kidsActiveTab === 'children' ? (kidsResult?.children || '') :
                            kidsActiveTab === 'monitors' ? (kidsResult?.monitors || '') :
                            (kidsResult?.activities || '')
                          } 
                          onSearch={handleWikiSearch} 
                        />
                      )}
                    </div>
                    <div className="flex flex-wrap gap-3">
                      {!isEditingKidsResult && kidsActiveTab !== 'illustration' && (
                        <button
                          onClick={() => {
                            setEditedKidsResult(kidsResult);
                            setIsEditingKidsResult(true);
                          }}
                          className="flex-1 py-3 bg-stone-100 dark:bg-zinc-800 text-stone-600 dark:text-zinc-300 font-bold rounded-xl hover:bg-stone-200 flex items-center justify-center gap-2"
                        >
                          <Edit size={18} /> Editar
                        </button>
                      )}
                      <button
                        onClick={() => handleListen(kidsActiveTab === 'children' ? (kidsResult?.children || '') : kidsActiveTab === 'monitors' ? (kidsResult?.monitors || '') : (kidsResult?.activities || ''))}
                        disabled={isGeneratingSpeech}
                        className="flex-1 py-3 bg-stone-100 dark:bg-zinc-800 text-stone-600 dark:text-zinc-300 font-bold rounded-xl hover:bg-stone-200 flex items-center justify-center gap-2 disabled:opacity-50"
                      >
                        {isGeneratingSpeech ? <Loader2 size={18} className="animate-spin" /> : <Volume2 size={18} />}
                        Ouvir
                      </button>
                      <button
                        onClick={handleGenerateNarration}
                        disabled={isGeneratingNarration}
                        className="flex-1 py-3 bg-amber-100 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400 font-bold rounded-xl hover:bg-amber-200 flex items-center justify-center gap-2 disabled:opacity-50"
                      >
                        {isGeneratingNarration ? <Loader2 size={18} className="animate-spin" /> : <Volume2 size={18} />}
                        Narração Emotiva
                      </button>
                      
                      {narrationAudio && (
                        <div className="w-full mt-4 bg-stone-50 dark:bg-zinc-800/50 p-4 rounded-2xl border border-stone-200 dark:border-zinc-700">
                          <div className="flex items-center gap-4 mb-2">
                            <button 
                              onClick={() => {
                                if (audioRef.current) {
                                  if (isPlaying) audioRef.current.pause();
                                  else audioRef.current.play();
                                  setIsPlaying(!isPlaying);
                                }
                              }}
                              className="w-10 h-10 flex items-center justify-center bg-emerald-600 text-white rounded-full hover:bg-emerald-700 transition-colors"
                            >
                              {isPlaying ? <CloseIcon size={20} /> : <Volume2 size={20} />}
                            </button>
                            <div className="flex-1">
                              <div className="h-2 bg-stone-200 dark:bg-zinc-700 rounded-full overflow-hidden">
                                <motion.div 
                                  className="h-full bg-emerald-500"
                                  initial={{ width: 0 }}
                                  animate={{ width: `${(audioProgress / audioDuration) * 100}%` }}
                                />
                              </div>
                              <div className="flex justify-between mt-1 text-[10px] text-stone-500 font-mono">
                                <span>{Math.floor(audioProgress / 60)}:{Math.floor(audioProgress % 60).toString().padStart(2, '0')}</span>
                                <span>{Math.floor(audioDuration / 60)}:{Math.floor(audioDuration % 60).toString().padStart(2, '0')}</span>
                              </div>
                            </div>
                          </div>
                          {narrationAudio && (
                            <audio 
                              ref={audioRef}
                              src={narrationAudio}
                              onTimeUpdate={(e) => setAudioProgress(e.currentTarget.currentTime)}
                              onLoadedMetadata={(e) => setAudioDuration(e.currentTarget.duration)}
                              onEnded={() => setIsPlaying(false)}
                              className="hidden"
                            />
                          )}
                          <div className="flex gap-2">
                            <button 
                              onClick={() => {
                                const a = document.createElement('a');
                                a.href = narrationAudio;
                                a.download = `narracao-${topic}.mp3`;
                                a.click();
                              }}
                              className="flex-1 py-2 text-xs bg-white dark:bg-zinc-900 border border-stone-200 dark:border-zinc-700 rounded-lg hover:bg-stone-50 dark:hover:bg-zinc-800 flex items-center justify-center gap-1"
                            >
                              <Download size={14} /> Baixar
                            </button>
                            <button 
                              onClick={() => handleSaveToAudioBox(kidsActiveTab === 'children' ? (kidsResult?.children || '') : kidsActiveTab === 'monitors' ? (kidsResult?.monitors || '') : (kidsResult?.activities || ''), narrationAudio)}
                              className="flex-1 py-2 text-xs bg-white dark:bg-zinc-900 border border-stone-200 dark:border-zinc-700 rounded-lg hover:bg-stone-50 dark:hover:bg-zinc-800 flex items-center justify-center gap-1"
                            >
                              <Volume2 size={14} /> Enviar para Coletânea
                            </button>
                          </div>
                        </div>
                      )}
                      <button 
                        onClick={() => { 
                          const content = kidsActiveTab === 'illustration' ? kidsIllustration || '' : (kidsActiveTab === 'children' ? (kidsResult?.children || '') : kidsActiveTab === 'monitors' ? (kidsResult?.monitors || '') : (kidsResult?.activities || ''));
                          copyToClipboard(content); 
                          showToast("Copiado! 📋✨"); 
                        }} 
                        className="flex-1 py-3 bg-stone-100 dark:bg-zinc-800 text-stone-600 dark:text-zinc-300 font-bold rounded-xl hover:bg-stone-200 flex items-center justify-center gap-2"
                      >
                        <Copy size={18} /> Copiar
                      </button>
                      <button 
                        onClick={() => {
                          const isImage = kidsActiveTab === 'illustration';
                          const content = isImage ? kidsIllustration || '' : (kidsActiveTab === 'children' ? (kidsResult?.children || '') : kidsActiveTab === 'monitors' ? (kidsResult?.monitors || '') : (kidsResult?.activities || ''));
                          const title = `Ministério Infantil - ${kidsActiveTab}`;
                          handlePrint(content, title, isImage);
                        }}
                        className="flex-1 py-3 bg-stone-100 dark:bg-zinc-800 text-stone-600 dark:text-zinc-300 font-bold rounded-xl hover:bg-stone-200 flex items-center justify-center gap-2"
                      >
                        <Printer size={18} /> Imprimir
                      </button>
                      <button 
                        onClick={() => {
                          const isImage = kidsActiveTab === 'illustration';
                          const content = isImage ? kidsIllustration || '' : (kidsActiveTab === 'children' ? (kidsResult?.children || '') : kidsActiveTab === 'monitors' ? (kidsResult?.monitors || '') : (kidsResult?.activities || ''));
                          
                          if (isImage && content) {
                            const a = document.createElement('a');
                            a.href = content;
                            a.download = `ilustracao-infantil-${topic}.png`;
                            a.click();
                          } else {
                            const blob = new Blob([content], { type: 'text/plain' });
                            const url = URL.createObjectURL(blob);
                            const a = document.createElement('a');
                            a.href = url;
                            a.download = `ministerio-infantil-${kidsActiveTab}.txt`;
                            a.click();
                          }
                          showToast("Baixando material... 📥");
                        }}
                        className="flex-1 py-3 bg-stone-100 dark:bg-zinc-800 text-stone-600 dark:text-zinc-300 font-bold rounded-xl hover:bg-stone-200 flex items-center justify-center gap-2"
                      >
                        <Download size={18} /> Baixar
                      </button>
                      <button 
                        onClick={() => { 
                          handleShareResult(); 
                          showToast("Compartilhando... 🕊️✨"); 
                        }} 
                        className="flex-1 py-3 bg-stone-100 dark:bg-zinc-800 text-stone-600 dark:text-zinc-300 font-bold rounded-xl hover:bg-stone-200 flex items-center justify-center gap-2"
                      >
                        <Share2 size={18} /> Compartilhar
                      </button>
                      <button 
                        onClick={() => {
                          const isImage = kidsActiveTab === 'illustration';
                          const content = isImage ? kidsIllustration || '' : (kidsActiveTab === 'children' ? (kidsResult?.children || '') : kidsActiveTab === 'monitors' ? (kidsResult?.monitors || '') : (kidsResult?.activities || ''));
                          handleSaveToNotebook('Ministério Infantil', content);
                        }} 
                        className="flex-1 py-3 bg-emerald-600 text-white font-bold rounded-xl hover:bg-emerald-700 flex items-center justify-center gap-2"
                      >
                        <Save size={18} /> Salvar no Caderno
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'posts' && (
              <div className="bg-white dark:bg-zinc-900 p-8 rounded-[3rem] border border-stone-200 dark:border-zinc-800 shadow-sm">
                <PostsPage />
              </div>
            )}

            {activeTab === 'notes' && (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-1 space-y-6">
                  <div className="bg-white dark:bg-zinc-900 p-6 rounded-3xl border border-stone-200 dark:border-zinc-800 shadow-sm">
                    <h3 className="font-bold text-lg mb-6 flex items-center gap-2">
                      <Plus className="text-emerald-600" size={20} />
                      Nova Página
                    </h3>
                    <div className="space-y-4">
                      <input
                        type="text"
                        placeholder="⚓ Título da nota"
                        value={currentNote.title}
                        onChange={(e) => setCurrentNote({ ...currentNote, title: e.target.value })}
                        className="w-full p-4 bg-stone-50 dark:bg-zinc-800 border border-stone-200 dark:border-zinc-700 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none"
                      />
                      <textarea
                        placeholder="⚓ Conteúdo da página..."
                        value={currentNote.content}
                        onChange={(e) => setCurrentNote({ ...currentNote, content: e.target.value })}
                        className={cn(
                          "w-full p-4 bg-stone-50 dark:bg-zinc-800 border border-stone-200 dark:border-zinc-700 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none h-64 resize-none",
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
                      <button
                        onClick={saveNote}
                        className="w-full py-4 bg-emerald-600 text-white font-bold rounded-xl hover:bg-emerald-700 flex items-center justify-center gap-2 transition-all"
                      >
                        <Save size={20} />
                        Salvar Nota
                      </button>
                    </div>
                  </div>
                </div>

                <div className="lg:col-span-2 space-y-6">
                  <div className="bg-white dark:bg-zinc-900 p-4 rounded-2xl border border-stone-200 dark:border-zinc-800 shadow-sm flex items-center gap-3">
                    <Search size={20} className="text-stone-400" />
                    <input 
                      type="text"
                      placeholder="⚓ Pesquisar em suas páginas..."
                      value={notebookSearchQuery}
                      onChange={(e) => setNotebookSearchQuery(e.target.value)}
                      className="flex-1 bg-transparent outline-none text-sm"
                    />
                  </div>
                  {notes.length === 0 ? (
                    <div className="bg-white dark:bg-zinc-900 p-12 rounded-3xl border border-dashed border-stone-200 dark:border-zinc-800 text-center">
                      <StickyNote size={48} className="mx-auto text-stone-300 mb-4" />
                      <h3 className="text-xl font-bold mb-2">Nenhuma nota salva</h3>
                      <p className="text-stone-500">Suas páginas pessoais aparecerão aqui.</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {notes
                        .filter(note => 
                          note.title.toLowerCase().includes(notebookSearchQuery.toLowerCase()) || 
                          note.content.toLowerCase().includes(notebookSearchQuery.toLowerCase())
                        )
                        .map((note) => (
                        <div key={note.id} className="bg-white dark:bg-zinc-900 p-6 rounded-3xl border border-stone-200 dark:border-zinc-800 shadow-sm hover:shadow-md transition-all group">
                          <div className="flex justify-between items-start mb-4">
                            <h4 className="font-bold text-lg leading-tight">{note.title}</h4>
                            <button
                              onClick={() => deleteNote(note.id)}
                              className="p-2 text-stone-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                            >
                              <Trash2 size={18} />
                            </button>
                          </div>
                          <p className="text-stone-600 dark:text-zinc-400 text-sm mb-6 line-clamp-4 whitespace-pre-wrap">
                            {note.content}
                          </p>
                          <div className="flex items-center justify-between pt-4 border-t border-stone-100 dark:border-zinc-800">
                            <span className="text-xs text-stone-400 font-medium">{note.date}</span>
                            <div className="flex gap-2">
                              <button 
                                onClick={() => {
                                  setCurrentNote({ title: note.title, content: note.content });
                                  setEditingNoteId(note.id);
                                  window.scrollTo({ top: 0, behavior: 'smooth' });
                                }}
                                className="text-emerald-600 p-1 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 rounded-lg transition-colors"
                                title="Editar"
                              >
                                <Edit size={16} />
                              </button>
                              <button 
                                onClick={() => handleDownloadNote(note)}
                                className="text-emerald-600 p-1 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 rounded-lg transition-colors"
                                title="Baixar"
                              >
                                <Download size={16} />
                              </button>
                              <button 
                                onClick={() => handleShareNote(note)}
                                className="text-emerald-600 p-1 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 rounded-lg transition-colors"
                                title="Compartilhar"
                              >
                                <Share2 size={16} />
                              </button>
                              <button 
                                onClick={() => handleSaveToNotebook('Minha Página', note.content)}
                                className="text-emerald-600 text-xs font-bold hover:underline flex items-center gap-1"
                              >
                                <Save size={12} /> Salvar no Caderno
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {(activeTab === 'commentary' || activeTab === 'compare') && (
              <div className="space-y-6">
                <div className="flex flex-col gap-4">
                  <div className="flex flex-col md:flex-row gap-4">
                    <div className="relative flex-1">
                      <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400" size={20} />
                      <input
                        type="text"
                        placeholder={activeTab === 'compare' ? "⚓ Digite o versículo (ex: João 3:16)" : "⚓ O que você deseja pesquisar?"}
                        value={searchQuery}
                        onChange={(e) => {
                          const val = e.target.value;
                          setSearchQuery(val);
                          if (activeTab === 'commentary') {
                            setTopic(val);
                            setCommentaryDebateTopic(val);
                          }
                        }}
                        onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                        className="w-full pl-12 pr-12 py-4 bg-white dark:bg-zinc-900 border border-stone-200 dark:border-zinc-800 rounded-2xl focus:ring-2 focus:ring-emerald-500 outline-none"
                      />
                      <div className="absolute right-4 top-1/2 -translate-y-1/2">
                        <AudioSearchButton onResult={(text) => { setSearchQuery(text); handleSearch(text); }} />
                      </div>
                    </div>
                    {activeTab === 'compare' && (
                      <div className="bg-white dark:bg-zinc-900 p-4 rounded-2xl border border-stone-200 dark:border-zinc-800">
                        <h4 className="text-xs font-bold text-stone-500 dark:text-stone-400 mb-3 uppercase tracking-wider">Selecione as Versões para Comparar</h4>
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 max-h-[200px] overflow-y-auto pr-2 custom-scrollbar">
                          {[
                            'Almeida Revista e Corrigida (ARC)', 'Almeida Revista Atualizada (ARA)', 'Almeida Corrigida Fiel (ACF)', 'Almeida século 21',
                            'Nova Almeida Atualizada (NAA)', 'Nova Versão Transformadora (NVT)', 'Nova Versão Internacional (NVI)', 'Nova Vida',
                            'Tradução Brasileira', 'Bíblia Viva', 'Bíblia de Jerusalém', 'Bíblia Pastoral', 'Bíblia da CNBB',
                            'Bíblia Judaica Completa', 'Bíblia Judaica E A Bíblia Cristã',
                            'King James Version (EN)', 'New King James Version (EN)', 'New International Version (EN)', 'English Standard Version (EN)',
                            'New American Standard Bible (EN)', 'New Living Translation (EN)', 'New Revised Standard Version (EN)',
                            'Reina Valera (ES)', 'Reina Valera 1960 (ES)', 'Biblia de las Américas (ES)',
                            'Louis Segond (FR)', 'Lutherbibel (DE)',
                            'Vulgata Latina', 'VT Hebraico', 'NT Grego'
                          ].map(version => (
                            <label key={version} className="flex items-center gap-2 p-2 rounded-lg hover:bg-stone-50 dark:hover:bg-zinc-800 cursor-pointer transition-colors">
                              <input
                                type="checkbox"
                                checked={selectedCompareVersions.includes(version)}
                                onChange={(e) => {
                                  if (e.target.checked) {
                                    setSelectedCompareVersions([...selectedCompareVersions, version]);
                                  } else {
                                    setSelectedCompareVersions(selectedCompareVersions.filter(v => v !== version));
                                  }
                                }}
                                className="w-4 h-4 text-emerald-600 rounded border-stone-300 focus:ring-emerald-500"
                              />
                              <span className="text-sm text-stone-700 dark:text-stone-300 truncate" title={version}>{version}</span>
                            </label>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                  <button
                    onClick={() => handleSearch()}
                    disabled={isLoading}
                    className="w-full py-4 bg-emerald-600 text-white font-bold rounded-2xl hover:bg-emerald-700 disabled:opacity-50 flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/20"
                  >
                    {isLoading ? <Loader2 className="animate-spin" size={20} /> : <Search size={20} />}
                    ⚓ {activeTab === 'commentary' ? 'Pesquisar Autor' : 'Pesquisa Geral'}
                  </button>
                </div>

                {result && (
                  <div className="space-y-4">
                    {resultThought && (
                      <div className="bg-amber-50/50 dark:bg-amber-900/10 border border-amber-200/50 dark:border-amber-800/30 rounded-2xl p-4">
                        <details className="group">
                          <summary className="flex items-center gap-2 text-xs font-bold text-amber-700 dark:text-amber-400 cursor-pointer list-none">
                            <Brain size={14} className="group-open:rotate-12 transition-transform" />
                            PROCESSO DE PENSAMENTO (IA)
                          </summary>
                          <div className="mt-3 text-xs text-amber-600/80 dark:text-amber-500/80 leading-relaxed italic">
                            {resultThought}
                          </div>
                        </details>
                      </div>
                    )}
                    <div className="bg-white dark:bg-zinc-900 p-8 rounded-3xl border border-stone-200 dark:border-zinc-800 shadow-sm prose dark:prose-invert max-w-none">
                      <ExpandableMarkdown content={result} onSearch={handleWikiSearch} />
                    </div>
                    <div className="flex gap-3">
                      <button
                        onClick={() => handleListen(result)}
                        disabled={isGeneratingSpeech}
                        className="flex-1 py-3 bg-stone-100 dark:bg-zinc-800 text-stone-600 dark:text-zinc-300 font-bold rounded-xl hover:bg-stone-200 flex items-center justify-center gap-2 disabled:opacity-50"
                      >
                        {isGeneratingSpeech ? <Loader2 size={18} className="animate-spin" /> : <Volume2 size={18} />}
                        Ouvir
                      </button>
                      <button
                        onClick={() => handleSaveToNotebook(activeTab === 'compare' ? 'Comparação de Versões' : 'Comentário Bíblico', result)}
                        className="flex-1 py-3 bg-emerald-600 text-white font-bold rounded-xl hover:bg-emerald-700 flex items-center justify-center gap-2"
                      >
                        <Save size={18} />
                        Salvar no Caderno
                      </button>
                      <button
                        onClick={() => handleCopy()}
                        className="flex-1 py-3 bg-stone-100 dark:bg-zinc-800 text-stone-600 dark:text-zinc-300 font-bold rounded-xl hover:bg-stone-200 flex items-center justify-center gap-2"
                      >
                        <Copy size={18} />
                        Copiar
                      </button>
                    </div>
                  </div>
                )}

                {activeTab === 'commentary' && (
                  <div className="space-y-12">
                    {/* Section 1: Comprehensive Commentary */}
                    <div className="bg-white dark:bg-zinc-900 p-8 rounded-[2.5rem] border border-stone-200 dark:border-zinc-800 shadow-xl shadow-stone-200/50 dark:shadow-none">
                      <div className="flex items-center gap-3 mb-6">
                        <div className="p-3 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 rounded-2xl">
                          <MessageSquare size={24} />
                        </div>
                        <div>
                          <h3 className="text-xl font-bold text-stone-800 dark:text-zinc-100">Comentário Profundo do Autor</h3>
                          <p className="text-sm text-stone-500 dark:text-zinc-400">Recursos exaustivos: Comentários, Bíblias de Estudo, Enciclopédias e Dicionários</p>
                        </div>
                      </div>
                      
                      <div className="mb-8">
                        <p className="text-sm text-stone-500 dark:text-zinc-400 mb-4">Clique no botão abaixo para pesquisar os quatro principais autores que abordam o assunto pesquisado.</p>
                      </div>

                      <div className="space-y-6">
                        <input 
                          type="text"
                          value={topic}
                          onChange={(e) => {
                            const val = e.target.value;
                            setTopic(val);
                            setSearchQuery(val);
                            setCommentaryDebateTopic(val);
                          }}
                          placeholder="Pesquisa Geral"
                          className="w-full p-6 bg-stone-50 dark:bg-zinc-800 border-2 border-transparent focus:border-emerald-500 rounded-[2rem] outline-none transition-all shadow-inner text-lg"
                        />
                        <div className="flex flex-col md:flex-row gap-4">
                          <button 
                            onClick={handleGenerateCommentary}
                            disabled={isGeneratingCommentary || !topic}
                            className="flex-1 py-4 bg-emerald-600 text-white font-bold rounded-2xl hover:bg-emerald-700 disabled:opacity-50 transition-all shadow-lg shadow-emerald-600/20 flex items-center justify-center gap-2"
                          >
                            {isGeneratingCommentary ? <Loader2 className="animate-spin" size={20} /> : <Search size={20} />}
                            Pesquisar Autor
                          </button>
                          <button
                            onClick={handleSuggestCommentators}
                            disabled={isSuggestingCommentators || !topic}
                            className="flex-1 py-4 bg-white dark:bg-zinc-800 text-emerald-600 border-2 border-emerald-600 rounded-2xl hover:bg-emerald-50 dark:hover:bg-zinc-700 transition-all font-bold disabled:opacity-50 flex items-center justify-center gap-2"
                          >
                            {isSuggestingCommentators ? <Loader2 className="animate-spin" size={20} /> : <Brain size={20} />}
                            Sugerir Autores
                          </button>
                        </div>
                      </div>

                      {commentaryResult && (
                        <motion.div 
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="mt-8 space-y-6"
                        >
                          <div className="bg-stone-50 dark:bg-zinc-800/50 p-8 rounded-[2rem] border border-stone-200 dark:border-zinc-800 prose dark:prose-invert max-w-none relative">
                            <div className="flex items-center justify-between mb-4">
                              <div className="flex items-center gap-2 text-emerald-600 font-bold uppercase text-xs tracking-widest">
                                <BookOpen size={16} /> Resultado do Comentário
                              </div>
                              <button 
                                onClick={() => setCommentaryResult('')}
                                className="text-stone-400 hover:text-red-500 transition-all"
                                title="Limpar resultado"
                              >
                                <Trash2 size={16} />
                              </button>
                            </div>
                            <ExpandableMarkdown content={commentaryResult} onSearch={handleWikiSearch} />
                          </div>
                          <div className="flex gap-3">
                            <button
                              onClick={() => handleSaveToNotebook(`Comentário: ${topic}`, commentaryResult)}
                              className="flex-1 py-4 bg-emerald-600 text-white font-bold rounded-2xl hover:bg-emerald-700 flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/20 transition-all"
                            >
                              <Save size={20} /> Salvar no Caderno
                            </button>
                          </div>
                        </motion.div>
                      )}
                    </div>

                    {/* Section 2: Debate Section */}
                    <div className="bg-white dark:bg-zinc-900 p-8 rounded-[2.5rem] border border-stone-200 dark:border-zinc-800 shadow-xl shadow-stone-200/50 dark:shadow-none">
                      <div className="flex items-center gap-3 mb-6">
                        <div className="p-3 bg-amber-100 dark:bg-amber-900/30 text-amber-600 rounded-2xl">
                          <Users size={24} />
                        </div>
                        <div>
                          <h3 className="text-xl font-bold text-stone-800 dark:text-zinc-100">Debate bíblico</h3>
                          <p className="text-sm text-stone-500 dark:text-zinc-400">Confronte visões de diferentes autores para um estudo mais profundo</p>
                        </div>
                      </div>

                      <div className="space-y-6 mb-8">
                        <div className="flex flex-col gap-4">
                          <input 
                            type="text"
                            value={commentaryDebateTopic || topic}
                            onChange={(e) => {
                              const val = e.target.value;
                              setCommentaryDebateTopic(val);
                              setSearchQuery(val);
                              setTopic(val);
                            }}
                            placeholder="Tema para o debate..."
                            className="w-full p-6 bg-stone-50 dark:bg-zinc-800 border-2 border-transparent focus:border-amber-500 rounded-[2rem] outline-none transition-all shadow-inner text-lg"
                          />
                          <button 
                            onClick={handleGenerateCommentaryDebate}
                            disabled={isGeneratingCommentaryDebate || (!commentaryDebateTopic && !topic)}
                            className="w-full py-4 bg-amber-600 text-white font-bold rounded-2xl hover:bg-amber-700 disabled:opacity-50 transition-all shadow-lg shadow-amber-600/20 flex items-center justify-center gap-2"
                          >
                            {isGeneratingCommentaryDebate ? <Loader2 className="animate-spin" size={20} /> : <Zap size={20} />}
                            Criar Debate
                          </button>
                        </div>
                        <p className="text-xs text-stone-400 italic ml-4">
                          * A IA selecionará automaticamente dois autores de peso para o debate baseado no tema, mas você pode alterar os autores na seção abaixo se desejar.
                        </p>
                      </div>

                      {/* Author and Bible Version Selection */}
                      <div className="mt-8 pt-8 border-t border-stone-100 dark:border-zinc-800">
                        <div className="grid grid-cols-1 gap-8">
                          <div className="space-y-4">
                            <div className="flex items-center justify-between">
                              <label className="text-xs font-bold text-stone-400 uppercase tracking-wider ml-1">Autores Principais</label>
                              <button 
                                onClick={() => setSelectedCommentators([...selectedCommentators, ''])}
                                className="text-emerald-600 hover:text-emerald-700 text-xs font-bold flex items-center gap-1"
                              >
                                <Plus size={14} /> Adicionar
                              </button>
                            </div>
                            <div className="space-y-2">
                              {selectedCommentators.map((name, index) => (
                                <div key={`selected-commentator-${index}`} className="flex gap-2">
                                  <div className="relative flex-1">
                                    <input
                                      type="text"
                                      value={name}
                                      onChange={(e) => {
                                        const newNames = [...selectedCommentators];
                                        newNames[index] = e.target.value;
                                        setSelectedCommentators(newNames);
                                      }}
                                      placeholder="Nome do comentarista"
                                      className="w-full p-3 bg-stone-50 dark:bg-zinc-800 border border-stone-100 dark:border-zinc-700 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none transition-all text-sm"
                                      list="commentators-list"
                                    />
                                    <datalist id="commentators-list">
                                      {commentators.map((c, cIdx) => <option key={`commentator-opt-${c.name}-${cIdx}`} value={c.name} />)}
                                    </datalist>
                                  </div>
                                  {selectedCommentators.length > 1 && (
                                    <button 
                                      onClick={() => setSelectedCommentators(selectedCommentators.filter((_, i) => i !== index))}
                                      className="p-3 text-stone-400 hover:text-red-500 transition-all"
                                    >
                                      <Trash2 size={18} />
                                    </button>
                                  )}
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>

                      {commentaryDebateResult && (
                        <motion.div 
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="space-y-6"
                        >
                          <div className="bg-amber-50/50 dark:bg-amber-900/10 p-8 rounded-[2rem] border border-amber-100 dark:border-amber-900/30 prose dark:prose-invert max-w-none relative">
                            <div className="flex items-center justify-between mb-4">
                              <div className="flex items-center gap-2 text-amber-600 font-bold uppercase text-xs tracking-widest">
                                <Zap size={16} /> Resultado do Debate
                              </div>
                              <button 
                                onClick={() => setCommentaryDebateResult('')}
                                className="text-stone-400 hover:text-red-500 transition-all"
                                title="Limpar resultado"
                              >
                                <Trash2 size={16} />
                              </button>
                            </div>
                            <ExpandableMarkdown content={commentaryDebateResult} onSearch={handleWikiSearch} />
                          </div>
                          <div className="flex gap-3">
                            <button
                              onClick={() => handleSaveToNotebook(`Debate: ${commentaryDebateTopic || topic}`, commentaryDebateResult)}
                              className="flex-1 py-4 bg-amber-600 text-white font-bold rounded-2xl hover:bg-amber-700 flex items-center justify-center gap-2 shadow-lg shadow-amber-600/20 transition-all"
                            >
                              <Save size={20} /> Salvar no Caderno
                            </button>
                          </div>
                        </motion.div>
                      )}

                      {suggestedDebaters.length > 0 && !commentaryDebateResult && (
                        <div className="mt-6 p-6 bg-amber-50 dark:bg-amber-900/10 rounded-3xl border border-amber-100 dark:border-amber-900/30">
                          <p className="text-sm font-bold text-amber-800 dark:text-amber-400 mb-3 flex items-center gap-2">
                            <Brain size={18} /> Sugestão de Debatedores para este tema:
                          </p>
                          <div className="flex flex-wrap gap-2">
                            {suggestedDebaters.map((author, idx) => (
                              <span key={`suggested-debater-${author}-${idx}`} className="px-4 py-2 bg-white dark:bg-zinc-800 text-amber-700 dark:text-amber-300 rounded-xl text-xs font-bold border border-amber-200 dark:border-amber-800 shadow-sm">
                                {author}
                              </span>
                            ))}
                          </div>
                          <p className="text-[10px] text-amber-600/70 dark:text-amber-400/50 mt-3 italic">
                            Estes autores foram sugeridos com base na sua pesquisa de comentário acima.
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                <div className="mt-8 p-6 bg-blue-50 dark:bg-blue-900/20 rounded-2xl border border-blue-100 dark:border-blue-800">
                  <h4 className="font-bold text-blue-800 dark:text-blue-300 mb-4 flex items-center gap-2">
                    <StickyNote size={18} />
                    Notas de Estudo
                  </h4>
                  <div className="space-y-4 text-sm text-blue-700 dark:text-blue-400">
                    <div className="p-4 bg-white dark:bg-zinc-900 rounded-xl shadow-sm">
                      <p className="font-bold text-emerald-600 mb-2">SOBRE A TRADUÇÃO DAS ESCRITURAS</p>
                      <p className="mb-4">Nenhuma tradução é perfeita. A fidelidade máxima só ocorre consultando: Hebraico (Antigo Testamento) e Grego koiné (Novo Testamento). Como a maioria de nós não dominamos estas duas línguas, o mais assertivo é consultar mais de uma versão/tradução. Isso ajudará a evitar erros de interpretação. Utilize também outras referências e evitar criar uma doutrina/ensino baseado num único trecho bíblico.</p>
                      
                      <p className="font-bold text-emerald-600 mb-2">RECOMENDAÇÃO PRÁTICA</p>
                      <p className="mb-2 italic">Para quem ensina e produz conteúdo:</p>
                      <ul className="space-y-1 mb-4">
                        <li className="flex items-center gap-2">📌 Use NAA ou ARA como base principal</li>
                        <li className="flex items-center gap-2">📌 Compare com ACF (para linha Texto Recebido)</li>
                        <li className="flex items-center gap-2">📌 Consulte NVI ou NVT para clareza de aplicação</li>
                      </ul>

                      <p className="font-bold text-emerald-600 mb-2">TEXTO RECEBIDO VS TEXTO CRÍTICO</p>
                      <div className="overflow-x-auto mb-4">
                        <table className="w-full text-left border-collapse min-w-[400px]">
                          <thead>
                            <tr className="border-b border-stone-100 dark:border-zinc-800">
                              <th className="py-2 pr-4 font-bold">Texto Recebido</th>
                              <th className="py-2 font-bold">Texto Crítico</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-stone-50 dark:divide-zinc-800/50">
                            <tr><td className="py-2 pr-4">Base bizantina</td><td className="py-2">Base nos manuscritos mais antigos</td></tr>
                            <tr><td className="py-2 pr-4">Manuscritos mais recentes (séculos IX–XV)</td><td className="py-2">Manuscritos mais antigos (séculos II–IV)</td></tr>
                            <tr><td className="py-2 pr-4">Usado na Reforma</td><td className="py-2">Usado na maioria das traduções modernas</td></tr>
                            <tr><td className="py-2 pr-4">Base da King James, ARC, ACF</td><td className="py-2">Base da NAA, ARA, NVI</td></tr>
                          </tbody>
                        </table>
                      </div>
                      <p className="mb-4">O texto recebido já é uma tradução, enquanto o texto crítico busca os manuscritos mais antigos.</p>
                      
                      <p className="mb-4">Existem também uma forma de traduzir mais livre descrita como paráfrase ou seja uma interpretação não literal do texto: **Bíblia Viva** e **Nova Linguagem de Hoje**. É mais fácil de entender o texto, mas omite ou acrescenta traços que podem levar a interpretações errôneas. Recomenda-se cautela.</p>

                      <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse min-w-[500px]">
                          <thead>
                            <tr className="border-b border-stone-100 dark:border-zinc-800">
                              <th className="py-2 pr-4 font-bold">Versão</th>
                              <th className="py-2 pr-4 font-bold">Tipo de Tradução</th>
                              <th className="py-2 pr-4 font-bold">Texto-base</th>
                              <th className="py-2 pr-4 font-bold">Grau de Literalidade</th>
                              <th className="py-2 font-bold">Fidelidade</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-stone-50 dark:divide-zinc-800/50">
                            <tr><td className="py-2 pr-4">**ACF**</td><td className="py-2 pr-4">Formal</td><td className="py-2 pr-4">Texto Recebido</td><td className="py-2 pr-4">Muito alta</td><td className="py-2">⭐⭐⭐⭐⭐</td></tr>
                            <tr><td className="py-2 pr-4">**ARC**</td><td className="py-2 pr-4">Formal</td><td className="py-2 pr-4">Texto Recebido</td><td className="py-2 pr-4">Alta</td><td className="py-2">⭐⭐⭐⭐</td></tr>
                            <tr><td className="py-2 pr-4">**NAA**</td><td className="py-2 pr-4">Formal equilibrada</td><td className="py-2 pr-4">Texto Crítico</td><td className="py-2 pr-4">Alta</td><td className="py-2">⭐⭐⭐⭐⭐</td></tr>
                            <tr><td className="py-2 pr-4">**ARA**</td><td className="py-2 pr-4">Formal</td><td className="py-2 pr-4">Texto Crítico</td><td className="py-2 pr-4">Alta</td><td className="py-2">⭐⭐⭐⭐</td></tr>
                            <tr><td className="py-2 pr-4">**A21**</td><td className="py-2 pr-4">Formal crítica</td><td className="py-2 pr-4">Texto Crítico</td><td className="py-2 pr-4">Alta</td><td className="py-2">⭐⭐⭐⭐</td></tr>
                            <tr><td className="py-2 pr-4">**Bíblia de Jerusalém**</td><td className="py-2 pr-4">Formal acadêmica</td><td className="py-2 pr-4">Texto Crítico</td><td className="py-2 pr-4">Alta</td><td className="py-2">⭐⭐⭐⭐</td></tr>
                            <tr><td className="py-2 pr-4">**NVI**</td><td className="py-2 pr-4">Equivalência dinâmica</td><td className="py-2 pr-4">Texto Crítico</td><td className="py-2 pr-4">Média</td><td className="py-2">⭐⭐⭐</td></tr>
                            <tr><td className="py-2 pr-4">**NVT**</td><td className="py-2 pr-4">Dinâmica</td><td className="py-2 pr-4">Texto Crítico</td><td className="py-2 pr-4">Média</td><td className="py-2">⭐⭐</td></tr>
                            <tr><td className="py-2 pr-4">**Bíblia Viva**</td><td className="py-2 pr-4">Paráfrase</td><td className="py-2 pr-4">Variado</td><td className="py-2 pr-4">Baixa</td><td className="py-2">⭐</td></tr>
                          </tbody>
                        </table>
                      </div>
                    </div>
                    <div className="p-4 bg-white dark:bg-zinc-900 rounded-xl shadow-sm overflow-x-auto">
                      <p className="font-bold mb-4">Tabela de comparações de versões:</p>
                      <table className="w-full text-left border-collapse min-w-[600px]">
                        <thead>
                          <tr className="border-b border-stone-100 dark:border-zinc-800">
                            <th className="py-2 pr-4 font-bold">Versão</th>
                            <th className="py-2 pr-4 font-bold">Tradição</th>
                            <th className="py-2 pr-4 font-bold">Tipo de Tradução</th>
                            <th className="py-2 pr-4 font-bold">Linguagem</th>
                            <th className="py-2 pr-4 font-bold">Ano / Revisão</th>
                            <th className="py-2 font-bold">Indicação</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-stone-50 dark:divide-zinc-800/50">
                          <tr><td className="py-2 pr-4">**ARC**</td><td className="py-2 pr-4">Protestante</td><td className="py-2 pr-4">Formal (literal)</td><td className="py-2 pr-4">Clássica</td><td className="py-2 pr-4">1898 / 1995</td><td className="py-2">Igrejas tradicionais</td></tr>
                          <tr><td className="py-2 pr-4">**ARA**</td><td className="py-2 pr-4">Protestante</td><td className="py-2 pr-4">Formal (literal)</td><td className="py-2 pr-4">Formal moderna</td><td className="py-2 pr-4">1959 / 1993</td><td className="py-2">Estudo e ensino</td></tr>
                          <tr><td className="py-2 pr-4">**ACF**</td><td className="py-2 pr-4">Protestante</td><td className="py-2 pr-4">Formal (Texto Recebido)</td><td className="py-2 pr-4">Tradicional</td><td className="py-2 pr-4">1994</td><td className="py-2">Linha conservadora</td></tr>
                          <tr><td className="py-2 pr-4">**NAA**</td><td className="py-2 pr-4">Protestante</td><td className="py-2 pr-4">Formal equilibrada</td><td className="py-2 pr-4">Atual</td><td className="py-2 pr-4">2017</td><td className="py-2">Pregação e estudo</td></tr>
                          <tr><td className="py-2 pr-4">**A21**</td><td className="py-2 pr-4">Protestante</td><td className="py-2 pr-4">Formal crítica</td><td className="py-2 pr-4">Atual</td><td className="py-2 pr-4">2008</td><td className="py-2">Estudo técnico</td></tr>
                          <tr><td className="py-2 pr-4">**NVI**</td><td className="py-2 pr-4">Protestante</td><td className="py-2 pr-4">Equivalência dinâmica</td><td className="py-2 pr-4">Contemporânea</td><td className="py-2 pr-4">2001 / 2011</td><td className="py-2">Leitura e evangelismo</td></tr>
                          <tr><td className="py-2 pr-4">**NVT**</td><td className="py-2 pr-4">Protestante</td><td className="py-2 pr-4">Dinâmica</td><td className="py-2 pr-4">Muito atual</td><td className="py-2 pr-4">2016</td><td className="py-2">Novos convertidos</td></tr>
                          <tr><td className="py-2 pr-4">**Bíblia Viva**</td><td className="py-2 pr-4">Protestante</td><td className="py-2 pr-4">Paráfrase</td><td className="py-2 pr-4">Simples</td><td className="py-2 pr-4">1981</td><td className="py-2">Devocional</td></tr>
                          <tr><td className="py-2 pr-4">**KJA**</td><td className="py-2 pr-4">Protestante</td><td className="py-2 pr-4">Formal</td><td className="py-2 pr-4">Intermediária</td><td className="py-2 pr-4">2009 / 2012</td><td className="py-2">Estudo comparativo</td></tr>
                          <tr><td className="py-2 pr-4">**Tradução Brasileira**</td><td className="py-2 pr-4">Protestante</td><td className="py-2 pr-4">Formal</td><td className="py-2 pr-4">Antiga</td><td className="py-2 pr-4">1917</td><td className="py-2">Valor histórico</td></tr>
                          <tr><td className="py-2 pr-4">**Bíblia de Jerusalém**</td><td className="py-2 pr-4">Católica</td><td className="py-2 pr-4">Formal crítica</td><td className="py-2 pr-4">Literária</td><td className="py-2 pr-4">1981 / 2002</td><td className="py-2">Estudo acadêmico</td></tr>
                          <tr><td className="py-2 pr-4">**Bíblia Ave-Maria**</td><td className="py-2 pr-4">Católica</td><td className="py-2 pr-4">Formal</td><td className="py-2 pr-4">Tradicional</td><td className="py-2 pr-4">1959</td><td className="py-2">Uso litúrgico</td></tr>
                          <tr><td className="py-2 pr-4">**Bíblia Pastoral**</td><td className="py-2 pr-4">Católica</td><td className="py-2 pr-4">Dinâmica</td><td className="py-2 pr-4">Acessível</td><td className="py-2 pr-4">1990</td><td className="py-2">Ênfase social</td></tr>
                          <tr><td className="py-2 pr-4">**Bíblia da CNBB**</td><td className="py-2 pr-4">Católica</td><td className="py-2 pr-4">Formal moderada</td><td className="py-2 pr-4">Atual</td><td className="py-2 pr-4">2001 / 2018</td><td className="py-2">Uso oficial CNBB</td></tr>
                        </tbody>
                      </table>
                    </div>
                    <div className="p-4 bg-white dark:bg-zinc-900 rounded-xl shadow-sm">
                      <p className="font-bold mb-4">Indicação para escolha:</p>
                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                        <div>
                          <p className="font-bold text-emerald-600 mb-2">📖 Estudo Profundo:</p>
                          <ul className="list-disc list-inside">
                            <li>NAA</li>
                            <li>ARA</li>
                            <li>Bíblia de Jerusalém</li>
                            <li>Almeida Século 21</li>
                          </ul>
                        </div>
                        <div>
                          <p className="font-bold text-emerald-600 mb-2">🎤 Pregação:</p>
                          <ul className="list-disc list-inside">
                            <li>NAA</li>
                            <li>NVI</li>
                            <li>KJA</li>
                          </ul>
                        </div>
                        <div>
                          <p className="font-bold text-emerald-600 mb-2">📘 Leitura Fácil:</p>
                          <ul className="list-disc list-inside">
                            <li>NVT</li>
                            <li>Bíblia Viva</li>
                          </ul>
                        </div>
                        <div>
                          <p className="font-bold text-emerald-600 mb-2">🏛 Estudo Histórico:</p>
                          <ul className="list-disc list-inside">
                            <li>ARC</li>
                            <li>Tradução Brasileira</li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'notebook' && (
              <div className="space-y-8">
                {/* Notebook Header & Search */}
                <div className="flex flex-col md:flex-row gap-6 items-center justify-between bg-white dark:bg-zinc-900 p-8 rounded-[2.5rem] border border-stone-200 dark:border-zinc-800 shadow-sm">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-emerald-50 dark:bg-emerald-900/20 rounded-2xl text-emerald-600">
                      <Book size={24} />
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold">Meus Estudos</h3>
                      <p className="text-sm text-stone-500">Seu caderno de páginas e reflexões.</p>
                    </div>
                  </div>
                  
                  <div className="flex flex-1 w-full max-w-md relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400" size={18} />
                    <input 
                      type="text"
                      placeholder="⚓ Pesquisar em meus estudos..."
                      value={notebookSearchQuery}
                      onChange={(e) => setNotebookSearchQuery(e.target.value)}
                      className="w-full pl-12 pr-4 py-3 bg-stone-50 dark:bg-zinc-800 border border-stone-200 dark:border-zinc-700 rounded-2xl focus:ring-2 focus:ring-emerald-500 outline-none text-sm"
                    />
                  </div>

                  <button
                    onClick={() => {
                      setCurrentNote({ title: '', content: '' });
                      setEditingNoteId(null);
                      window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
                    }}
                    className="px-6 py-3 bg-emerald-600 text-white font-bold rounded-2xl hover:bg-emerald-700 flex items-center gap-2 transition-all shadow-lg shadow-emerald-600/20"
                  >
                    <Plus size={20} />
                    Nova Página
                  </button>
                </div>

                {/* Pages Display - A4 Style */}
                <div className="space-y-12">
                  {notes.filter(n => n.title.toLowerCase().includes(notebookSearchQuery.toLowerCase()) || n.content.toLowerCase().includes(notebookSearchQuery.toLowerCase())).length === 0 ? (
                    <div className="bg-white dark:bg-zinc-900 p-20 rounded-[3rem] border border-dashed border-stone-200 dark:border-zinc-800 text-center">
                      <StickyNote size={64} className="mx-auto text-stone-200 mb-6" />
                      <h3 className="text-2xl font-bold mb-2">Seu caderno está vazio</h3>
                      <p className="text-stone-500">Comece a registrar seus estudos e revelações.</p>
                    </div>
                  ) : (
                    <div className="space-y-16">
                      {notes
                        .filter(n => n.title.toLowerCase().includes(notebookSearchQuery.toLowerCase()) || n.content.toLowerCase().includes(notebookSearchQuery.toLowerCase()))
                        .map((note, idx) => (
                        <motion.div 
                          key={note.id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="relative mx-auto w-full max-w-[800px] min-h-[1000px] bg-white dark:bg-zinc-900 shadow-2xl rounded-sm border border-stone-200 dark:border-zinc-800 flex flex-col"
                          style={{ 
                            backgroundImage: 'linear-gradient(#f1f1f1 1px, transparent 1px)',
                            backgroundSize: '100% 32px',
                            paddingTop: '64px'
                          }}
                        >
                          {/* Notebook Holes */}
                          <div className="absolute left-6 top-0 bottom-0 flex flex-col justify-around py-8 pointer-events-none">
                            {[...Array(20)].map((_, i) => (
                              <div key={`spiral-hole-${i}`} className="w-4 h-4 rounded-full bg-stone-100 dark:bg-zinc-800 border border-stone-200 dark:border-zinc-700 shadow-inner" />
                            ))}
                          </div>

                          {/* Page Header */}
                          <div className="px-16 pb-8 border-b border-stone-100 dark:border-zinc-800 flex justify-between items-end">
                            <div>
                              <h4 className="text-3xl font-serif font-bold text-stone-800 dark:text-zinc-100 mb-1">{note.title}</h4>
                              <p className="text-xs font-mono text-stone-400 uppercase tracking-widest">Criado em: {note.date}</p>
                            </div>
                            <div className="flex gap-2">
                              <button 
                                onClick={() => {
                                  setCurrentNote({ title: note.title, content: note.content });
                                  setEditingNoteId(note.id);
                                  window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
                                }}
                                className="p-2 bg-stone-50 dark:bg-zinc-800 text-stone-600 dark:text-zinc-400 rounded-lg hover:bg-emerald-50 hover:text-emerald-600 transition-colors"
                                title="Editar"
                              >
                                <Edit size={18} />
                              </button>
                              <button 
                                onClick={() => {
                                  copyToClipboard(`${note.title}\n\n${note.content}`);
                                  showToast("Copiado para a área de transferência! 📋");
                                }}
                                className="p-2 bg-stone-50 dark:bg-zinc-800 text-stone-600 dark:text-zinc-400 rounded-lg hover:bg-emerald-50 hover:text-emerald-600 transition-colors"
                                title="Copiar"
                              >
                                <Copy size={18} />
                              </button>
                              <button 
                                onClick={() => handleDownloadNote(note)}
                                className="p-2 bg-stone-50 dark:bg-zinc-800 text-stone-600 dark:text-zinc-400 rounded-lg hover:bg-emerald-50 hover:text-emerald-600 transition-colors"
                                title="Baixar"
                              >
                                <Download size={18} />
                              </button>
                              <button 
                                onClick={() => handleShareNote(note)}
                                className="p-2 bg-stone-50 dark:bg-zinc-800 text-stone-600 dark:text-zinc-400 rounded-lg hover:bg-emerald-50 hover:text-emerald-600 transition-colors"
                                title="Compartilhar"
                              >
                                <Share2 size={18} />
                              </button>
                              <button 
                                onClick={() => handleWikiSearch(note.title)}
                                className="p-2 bg-stone-50 dark:bg-zinc-800 text-stone-600 dark:text-zinc-400 rounded-lg hover:bg-blue-50 hover:text-blue-600 transition-colors"
                                title="⚓ Wiki"
                              >
                                <Globe size={18} />
                              </button>
                              <button 
                                onClick={() => deleteNote(note.id)}
                                className="p-2 bg-stone-50 dark:bg-zinc-800 text-stone-400 hover:bg-red-50 hover:text-red-600 transition-colors"
                                title="Excluir"
                              >
                                <Trash2 size={18} />
                              </button>
                            </div>
                          </div>

                          {/* Page Content */}
                          <div className="flex-1 px-16 py-12 prose dark:prose-invert max-w-none">
                            <div className="text-lg leading-[32px] text-stone-700 dark:text-zinc-300 font-serif whitespace-pre-wrap">
                              {note.content}
                            </div>
                          </div>

                          {/* Page Footer */}
                          <div className="px-16 py-8 border-t border-stone-100 dark:border-zinc-800 flex justify-between items-center text-[10px] font-bold text-stone-400 uppercase tracking-[0.2em]">
                            <span>Página {idx + 1}</span>
                            <div className="flex items-center gap-2">
                              <img 
                                src="https://i.postimg.cc/3N279HyV/1000105226-removebg-preview.png" 
                                alt="Logo" 
                                className="w-4 h-4 object-contain"
                                referrerPolicy="no-referrer"
                              />
                              <span>Imersão Bíblica IA - Mergulhando na Palavra - {new Date().getFullYear()}</span>
                              <img 
                                src="https://i.postimg.cc/3N279HyV/1000105226-removebg-preview.png" 
                                alt="Logo" 
                                className="w-4 h-4 object-contain"
                                referrerPolicy="no-referrer"
                              />
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  )}
                </div>

                {/* New/Edit Note Form */}
                <div className="max-w-[800px] mx-auto bg-white dark:bg-zinc-900 p-8 rounded-[2.5rem] border border-stone-200 dark:border-zinc-800 shadow-xl">
                  <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                    {editingNoteId ? <Edit className="text-emerald-600" size={24} /> : <Plus className="text-emerald-600" size={24} />}
                    {editingNoteId ? 'Editar Estudo' : 'Novo Estudo'}
                  </h3>
                  <div className="space-y-4">
                    <input
                      type="text"
                      placeholder="⚓ Título do seu estudo"
                      value={currentNote.title}
                      onChange={(e) => setCurrentNote({ ...currentNote, title: e.target.value })}
                      className="w-full p-4 bg-stone-50 dark:bg-zinc-800 border border-stone-200 dark:border-zinc-700 rounded-2xl focus:ring-2 focus:ring-emerald-500 outline-none font-bold"
                    />
                    <textarea
                      placeholder="⚓ Escreva aqui suas reflexões, esboços e notas..."
                      value={currentNote.content}
                      onChange={(e) => setCurrentNote({ ...currentNote, content: e.target.value })}
                      className={cn(
                        "w-full p-6 bg-stone-50 dark:bg-zinc-800 border border-stone-200 dark:border-zinc-700 rounded-2xl focus:ring-2 focus:ring-emerald-500 outline-none h-96 resize-none",
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
                      {editingNoteId && (
                        <button
                          onClick={() => {
                            setEditingNoteId(null);
                            setCurrentNote({ title: '', content: '' });
                          }}
                          className="flex-1 py-4 bg-stone-100 dark:bg-zinc-800 text-stone-600 dark:text-zinc-300 font-bold rounded-2xl hover:bg-stone-200 transition-all"
                        >
                          Cancelar
                        </button>
                      )}
                      <button
                        onClick={saveNote}
                        className="flex-[2] py-4 bg-emerald-600 text-white font-bold rounded-2xl hover:bg-emerald-700 flex items-center justify-center gap-2 transition-all shadow-lg shadow-emerald-600/20"
                      >
                        <Save size={20} />
                        {editingNoteId ? 'Atualizar Estudo' : 'Salvar Estudo'}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'significado' && (
              <div className="space-y-6">
                <div className="flex flex-col gap-4">
                  <div className="bg-stone-50 dark:bg-zinc-800/50 p-6 rounded-[2rem] border border-stone-200 dark:border-zinc-700 mb-2">
                    <h3 className="text-xl font-bold font-serif italic text-stone-800 dark:text-stone-200 flex items-center gap-2">
                      <Library size={20} className="text-emerald-600" />
                      Compare Significados e Religiões
                    </h3>
                    <p className="text-stone-500 text-xs uppercase tracking-widest mt-1">Léxico e Estudo Comparativo Profundo</p>
                  </div>
                  <div className="relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400" size={20} />
                    <input
                      type="text"
                      placeholder="⚓ Digite uma palavra ou tema (ex: Agape, Shalom, Justificação...)"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleMeaningSearch(false)}
                      className="w-full pl-12 pr-12 py-4 bg-white dark:bg-zinc-900 border border-stone-200 dark:border-zinc-800 rounded-2xl focus:ring-2 focus:ring-emerald-500 outline-none"
                    />
                    <div className="absolute right-4 top-1/2 -translate-y-1/2">
                      <AudioSearchButton onResult={(text) => { setSearchQuery(text); handleMeaningSearch(false); }} />
                    </div>
                  </div>

                  <div className="bg-white dark:bg-zinc-900 p-4 rounded-2xl border border-stone-200 dark:border-zinc-800">
                    <h4 className="text-xs font-bold text-stone-500 dark:text-stone-400 mb-3 uppercase tracking-wider">Selecione as Fontes de Significado</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 max-h-[200px] overflow-y-auto pr-2 custom-scrollbar">
                      {[
                        'Dicionário Aurélio', 'Dicionário Houaiss', 'Dicionário Michaelis',
                        'Português-Hebraico', 'Hebraico-Português', 'Português-Grego', 'Grego-Português',
                        'Pergunte ao Gemini', 'Pergunte ao ChatGPT', 'Pergunte ao Claude IA', 'Pergunte ao Llama IA'
                      ].map(source => (
                        <label key={source} className="flex items-center gap-2 p-2 rounded-lg hover:bg-stone-50 dark:hover:bg-zinc-800 cursor-pointer transition-colors">
                          <input
                            type="checkbox"
                            checked={selectedMeaningSources.includes(source)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSelectedMeaningSources([...selectedMeaningSources, source]);
                              } else {
                                setSelectedMeaningSources(selectedMeaningSources.filter(s => s !== source));
                              }
                            }}
                            className="w-4 h-4 text-emerald-600 rounded border-stone-300 focus:ring-emerald-500"
                          />
                          <span className="text-sm text-stone-700 dark:text-stone-300 truncate" title={source}>{source}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  <button
                    onClick={() => handleMeaningSearch(false)}
                    disabled={isLoading || !searchQuery}
                    className="w-full py-4 bg-emerald-600 text-white font-bold rounded-2xl hover:bg-emerald-700 disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {isLoading ? <Loader2 className="animate-spin" size={20} /> : <Search size={20} />}
                    ⚓ Pesquisar
                  </button>

                  <button
                    onClick={() => handleMeaningSearch(false, true)}
                    disabled={isLoading || !searchQuery}
                    className="w-full py-4 bg-white dark:bg-zinc-900 text-emerald-600 dark:text-emerald-400 font-bold rounded-2xl border-2 border-emerald-600 dark:border-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 transition-all flex items-center justify-center gap-2"
                  >
                    {isLoading ? <Loader2 className="animate-spin" size={20} /> : <Library size={20} />}
                    Compare Significados e Religiões
                  </button>
                </div>

                {meaningResult && (
                  <div className="space-y-4">
                    {meaningResultThought && (
                      <div className="bg-amber-50/50 dark:bg-amber-900/10 border border-amber-200/50 dark:border-amber-800/30 rounded-2xl p-4">
                        <details className="group">
                          <summary className="flex items-center gap-2 text-xs font-bold text-amber-700 dark:text-amber-400 cursor-pointer list-none">
                            <Brain size={14} className="group-open:rotate-12 transition-transform" />
                            PROCESSO DE PENSAMENTO (IA)
                          </summary>
                          <div className="mt-3 text-xs text-amber-600/80 dark:text-amber-500/80 leading-relaxed italic">
                            {meaningResultThought}
                          </div>
                        </details>
                      </div>
                    )}
                    <div className="bg-white dark:bg-zinc-900 p-8 rounded-3xl border border-stone-200 dark:border-zinc-800 shadow-sm prose dark:prose-invert max-w-none">
                      <ExpandableMarkdown content={meaningResult} onSearch={handleWikiSearch} />
                    </div>

                    {selectedMeaningSources.some(s => s.includes('Gemini') || s.includes('ChatGPT') || s.includes('IA')) && (
                      <div className="bg-emerald-50/50 dark:bg-emerald-900/10 p-6 rounded-3xl border border-emerald-100 dark:border-emerald-800/30 space-y-4">
                        <div className="flex items-center gap-2 text-emerald-800 dark:text-emerald-400 font-bold text-sm">
                          <MessageCircle size={18} />
                          PERGUNTA DE ACOMPANHAMENTO
                        </div>
                        <div className="relative">
                          <input
                            type="text"
                            placeholder="⚓ Faça uma pergunta baseada na resposta acima..."
                            value={followUpQuery}
                            onChange={(e) => setFollowUpQuery(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleMeaningSearch(true)}
                            className="w-full pl-4 pr-12 py-3 bg-white dark:bg-zinc-900 border border-emerald-200 dark:border-emerald-800 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500"
                          />
                          <button
                            onClick={() => handleMeaningSearch(true)}
                            disabled={isLoading || !followUpQuery}
                            className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 rounded-lg disabled:opacity-50"
                          >
                            <Search size={20} />
                          </button>
                        </div>
                        <p className="text-[10px] text-emerald-600/60 dark:text-emerald-500/60 italic">
                          A IA lembrará do contexto da conversa para responder sua próxima dúvida.
                        </p>
                      </div>
                    )}

                    <div className="flex gap-3">
                      <button
                        onClick={() => handleListen(meaningResult)}
                        disabled={isGeneratingSpeech}
                        className="flex-1 py-3 bg-stone-100 dark:bg-zinc-800 text-stone-600 dark:text-zinc-300 font-bold rounded-xl hover:bg-stone-200 flex items-center justify-center gap-2 disabled:opacity-50"
                      >
                        {isGeneratingSpeech ? <Loader2 size={18} className="animate-spin" /> : <Volume2 size={18} />}
                        Ouvir
                      </button>
                      <button onClick={() => { copyToClipboard(meaningResult); showToast("Copiado! 📋✨"); }} className="flex-1 py-3 bg-stone-100 dark:bg-zinc-800 text-stone-600 dark:text-zinc-300 font-bold rounded-xl hover:bg-stone-200 flex items-center justify-center gap-2"><Copy size={18} /> Copiar</button>
                      <button onClick={() => handleWikiSearch(searchQuery)} className="flex-1 py-3 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 font-bold rounded-xl hover:bg-blue-200 flex items-center justify-center gap-2"><Globe size={18} /> ⚓ Wiki</button>
                      <button onClick={() => handleSaveToNotebook('Significado', meaningResult)} className="flex-1 py-3 bg-emerald-600 text-white font-bold rounded-xl hover:bg-emerald-700 flex items-center justify-center gap-2"><Save size={18} /> Salvar no Caderno</button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'wiki' && (
              <div className="space-y-6">
                <div className="flex flex-col md:flex-row gap-4">
                  {previousTab && (
                    <button
                      onClick={() => setActiveTab(previousTab)}
                      className="px-4 py-4 bg-stone-100 dark:bg-zinc-800 text-stone-600 dark:text-zinc-300 font-bold rounded-2xl hover:bg-stone-200 flex items-center justify-center gap-2 transition-all"
                    >
                      <ArrowLeft size={20} />
                      Voltar
                    </button>
                  )}
                  <div className="relative flex-[2]">
                    <Globe className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400" size={20} />
                    <input
                      type="text"
                      placeholder="⚓ Explore o conhecimento infinito... Digite um tema."
                      value={wikiQuery}
                      onChange={(e) => setWikiQuery(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleWikiSearch()}
                      className="w-full pl-12 pr-12 py-4 bg-white dark:bg-zinc-900 border border-stone-200 dark:border-zinc-800 rounded-2xl focus:ring-2 focus:ring-emerald-500 outline-none"
                    />
                    <div className="absolute right-4 top-1/2 -translate-y-1/2">
                      <AudioSearchButton onResult={(text) => { setWikiQuery(text); handleWikiSearch(text); }} />
                    </div>
                  </div>
                  <button
                    onClick={() => handleWikiSearch()}
                    disabled={isLoading || !wikiQuery}
                    className="px-8 py-4 bg-blue-600 text-white font-bold rounded-2xl hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {isLoading ? <Loader2 className="animate-spin" size={20} /> : <Sparkles size={20} />}
                    ⚓ Explorar Wiki
                  </button>
                </div>

                {wikiResult && (
                  <div className="space-y-4">
                    {wikiResultThought && (
                      <div className="bg-amber-50/50 dark:bg-amber-900/10 border border-amber-200/50 dark:border-amber-800/30 rounded-2xl p-4">
                        <details className="group">
                          <summary className="flex items-center gap-2 text-xs font-bold text-amber-700 dark:text-amber-400 cursor-pointer list-none">
                            <Brain size={14} className="group-open:rotate-12 transition-transform" />
                            PROCESSO DE PENSAMENTO (IA)
                          </summary>
                          <div className="mt-3 text-xs text-amber-600/80 dark:text-amber-500/80 leading-relaxed italic">
                            {wikiResultThought}
                          </div>
                        </details>
                      </div>
                    )}
                    <div className="bg-white dark:bg-zinc-900 p-8 md:p-12 rounded-3xl border border-stone-200 dark:border-zinc-800 shadow-lg prose dark:prose-invert max-w-none">
                      <ExpandableMarkdown content={wikiResult} onSearch={handleWikiSearch} />
                    </div>
                    <div className="flex flex-wrap gap-3">
                      <button
                        onClick={() => handleListen(wikiResult)}
                        disabled={isGeneratingSpeech}
                        className="flex-1 py-3 bg-stone-100 dark:bg-zinc-800 text-stone-600 dark:text-zinc-300 font-bold rounded-xl hover:bg-stone-200 flex items-center justify-center gap-2 disabled:opacity-50"
                      >
                        {isGeneratingSpeech ? <Loader2 size={18} className="animate-spin" /> : <Volume2 size={18} />}
                        Ouvir
                      </button>
                      <button onClick={() => { copyToClipboard(wikiResult); showToast("Copiado! 📋✨"); }} className="flex-1 py-3 bg-stone-100 dark:bg-zinc-800 text-stone-600 dark:text-zinc-300 font-bold rounded-xl hover:bg-stone-200 flex items-center justify-center gap-2"><Copy size={18} /> Copiar</button>
                      <button onClick={() => { handleDownloadResult(); showToast("Baixando... 📄💎"); }} className="flex-1 py-3 bg-stone-100 dark:bg-zinc-800 text-stone-600 dark:text-zinc-300 font-bold rounded-xl hover:bg-stone-200 flex items-center justify-center gap-2"><Download size={18} /> Baixar</button>
                      <div className="flex-1 flex items-center justify-center">
                        <ShareButtons {...getShareData()} />
                      </div>
                      <button onClick={() => handleSaveToNotebook('Wiki Infinita', wikiResult)} className="flex-1 py-3 bg-emerald-600 text-white font-bold rounded-xl hover:bg-emerald-700 flex items-center justify-center gap-2"><Save size={18} /> Salvar no Caderno</button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'apocrypha' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-8"
              >
                <div className="bg-white dark:bg-zinc-900 p-8 rounded-[2.5rem] border border-stone-200 dark:border-zinc-800 shadow-xl">
                  <div className="flex items-center gap-4 mb-8">
                    <div className="w-12 h-12 bg-amber-100 dark:bg-amber-900/50 rounded-2xl flex items-center justify-center text-amber-600 dark:text-amber-400">
                      <BookOpen size={24} />
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold font-display text-stone-900 dark:text-white">Livros Apócrifos</h3>
                      <p className="text-stone-500 dark:text-zinc-400">Explore os livros não canônicos e suas histórias</p>
                    </div>
                  </div>

                  <div className="bg-stone-100 dark:bg-zinc-800/50 p-6 rounded-3xl space-y-6 mb-8">
                    <div className="flex flex-col gap-4">
                      <div>
                        <label className="block text-xs font-bold text-stone-500 mb-2 ml-1 uppercase tracking-wider">Pesquisa Personalizada</label>
                        <input
                          type="text"
                          placeholder="Pesquisar palavra ou termo"
                          value={apocryphaSearchQuery}
                          onChange={(e) => setApocryphaSearchQuery(e.target.value)}
                          className="w-full p-4 bg-white dark:bg-zinc-900 border border-stone-200 dark:border-zinc-700 rounded-2xl outline-none font-bold text-sm"
                        />
                      </div>
                      
                      <div className="bg-white dark:bg-zinc-900 p-4 rounded-2xl border border-stone-200 dark:border-zinc-800">
                        <div className="flex items-center justify-between mb-3">
                          <h4 className="text-xs font-bold text-stone-500 dark:text-stone-400 uppercase tracking-wider">Selecione os Livros</h4>
                          <label className="flex items-center gap-2 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={selectedApocryphaBooks.length === CATHOLIC_APOCRYPHA.length + NT_APOCRYPHA.length}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setSelectedApocryphaBooks([...CATHOLIC_APOCRYPHA.map(b => b.name), ...NT_APOCRYPHA.map(b => b.name)]);
                                } else {
                                  setSelectedApocryphaBooks([]);
                                }
                              }}
                              className="w-4 h-4 text-emerald-600 rounded border-stone-300 focus:ring-emerald-500"
                            />
                            <span className="text-xs font-bold text-stone-600 dark:text-stone-400">Todos os livros</span>
                          </label>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                          <div className="col-span-full mb-1">
                            <h5 className="text-xs font-bold text-amber-600 dark:text-amber-500 uppercase">Católicos</h5>
                          </div>
                          {CATHOLIC_APOCRYPHA.map((book, bIdx) => (
                            <label key={`apocrypha-catholic-${book.name}-${bIdx}`} className="flex items-center gap-2 p-2 rounded-lg hover:bg-stone-50 dark:hover:bg-zinc-800 cursor-pointer transition-colors">
                              <input
                                type="checkbox"
                                checked={selectedApocryphaBooks.includes(book.name)}
                                onChange={(e) => {
                                  if (e.target.checked) {
                                    setSelectedApocryphaBooks([...selectedApocryphaBooks, book.name]);
                                  } else {
                                    setSelectedApocryphaBooks(selectedApocryphaBooks.filter(b => b !== book.name));
                                  }
                                }}
                                className="w-4 h-4 text-amber-600 rounded border-stone-300 focus:ring-amber-500"
                              />
                              <span className="text-sm text-stone-700 dark:text-stone-300 truncate" title={book.name}>{book.name}</span>
                            </label>
                          ))}
                          <div className="col-span-full mt-2 mb-1">
                            <h5 className="text-xs font-bold text-rose-600 dark:text-rose-500 uppercase">Novo Testamento</h5>
                          </div>
                          {NT_APOCRYPHA.map((book, bIdx) => (
                            <label key={`apocrypha-nt-${book.name}-${bIdx}`} className="flex items-center gap-2 p-2 rounded-lg hover:bg-stone-50 dark:hover:bg-zinc-800 cursor-pointer transition-colors">
                              <input
                                type="checkbox"
                                checked={selectedApocryphaBooks.includes(book.name)}
                                onChange={(e) => {
                                  if (e.target.checked) {
                                    setSelectedApocryphaBooks([...selectedApocryphaBooks, book.name]);
                                  } else {
                                    setSelectedApocryphaBooks(selectedApocryphaBooks.filter(b => b !== book.name));
                                  }
                                }}
                                className="w-4 h-4 text-amber-600 rounded border-stone-300 focus:ring-amber-500"
                              />
                              <span className="text-sm text-stone-700 dark:text-stone-300 truncate" title={book.name}>{book.name}</span>
                            </label>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-4">
                      <button
                        onClick={handleApocryphaSearch}
                        disabled={isGeneratingApocrypha}
                        className="flex-1 py-4 bg-amber-600 text-white font-bold rounded-2xl hover:bg-amber-700 disabled:opacity-50 flex items-center justify-center gap-2 transition-all shadow-lg shadow-amber-600/20"
                      >
                        {isGeneratingApocrypha ? <Loader2 className="animate-spin" size={20} /> : <Search size={20} />}
                        Pesquisar Apócrifo
                      </button>
                    </div>
                  </div>

                  <details className="group mb-8">
                    <summary className="flex items-center justify-between p-4 bg-stone-50 dark:bg-zinc-800/50 rounded-2xl border border-stone-100 dark:border-zinc-800 cursor-pointer list-none font-bold text-stone-700 dark:text-zinc-300 hover:bg-stone-100 dark:hover:bg-zinc-800 transition-colors">
                      <div className="flex items-center gap-2">
                        <HelpCircle size={20} className="text-amber-600" />
                        O que são Livros Apócrifos?
                      </div>
                      <ChevronDown size={20} className="text-stone-400 group-open:rotate-180 transition-transform" />
                    </summary>
                    <div className="mt-2 p-6 bg-stone-50 dark:bg-zinc-800/50 rounded-2xl border border-stone-100 dark:border-zinc-800 prose prose-stone dark:prose-invert max-w-none">
                      <p className="text-sm leading-relaxed m-0 mb-8">
                        O termo "apócrifo" significa "oculto" ou "escondido". No contexto bíblico, refere-se a livros que não fazem parte do cânon oficial das Escrituras. 
                        As Bíblias protestantes seguem o cânon hebraico (39 livros no AT), enquanto algumas Bíblias católicas incluem livros chamados "deuterocanônicos", 
                        que estavam presentes na Septuaginta (tradução grega do AT). Os protestantes os excluem por não serem considerados divinamente inspirados, 
                        embora reconheçam seu valor histórico e literário.
                      </p>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="space-y-4">
                          <h4 className="font-bold text-stone-700 dark:text-zinc-300 flex items-center gap-2 m-0">
                            <div className="w-2 h-2 bg-amber-500 rounded-full" />
                            Apócrifos Católicos
                          </h4>
                          <div className="space-y-4">
                            {CATHOLIC_APOCRYPHA.map((book) => (
                              <div key={book.name} className="p-4 bg-white dark:bg-zinc-900 rounded-xl border border-stone-100 dark:border-zinc-800">
                                <h5 className="text-sm font-bold m-0 mb-1 text-amber-700 dark:text-amber-500">{book.name}</h5>
                                <p className="text-xs text-stone-600 dark:text-zinc-400 m-0 leading-relaxed">{book.description}</p>
                              </div>
                            ))}
                          </div>
                        </div>

                        <div className="space-y-4">
                          <h4 className="font-bold text-stone-700 dark:text-zinc-300 flex items-center gap-2 m-0">
                            <div className="w-2 h-2 bg-rose-500 rounded-full" />
                            Apócrifos NT
                          </h4>
                          <div className="space-y-4">
                            {NT_APOCRYPHA.map((book) => (
                              <div key={book.name} className="p-4 bg-white dark:bg-zinc-900 rounded-xl border border-stone-100 dark:border-zinc-800">
                                <h5 className="text-sm font-bold m-0 mb-1 text-rose-700 dark:text-rose-500">{book.name}</h5>
                                <p className="text-xs text-stone-600 dark:text-zinc-400 m-0 leading-relaxed">{book.description}</p>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  </details>

                  {apocryphaResult && (
                    <div className="mt-12 space-y-6">
                      <div className="flex items-center justify-between">
                        <h4 className="text-xl font-bold font-display">Resultado da Pesquisa</h4>
                        <div className="flex gap-2">
                          <button onClick={() => copyToClipboard(apocryphaResult)} className="p-2 bg-stone-100 dark:bg-zinc-800 text-stone-600 rounded-xl hover:bg-stone-200"><Copy size={18} /></button>
                          <button onClick={() => handleSaveToNotebook('Pesquisa Apócrifa', apocryphaResult)} className="p-2 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 rounded-xl hover:bg-emerald-200"><Save size={18} /></button>
                        </div>
                      </div>
                      <div className="bg-stone-50 dark:bg-zinc-800/50 p-8 rounded-[2rem] border border-stone-200 dark:border-zinc-800">
                        <ExpandableMarkdown content={apocryphaResult} />
                      </div>
                    </div>
                  )}
                </div>
              </motion.div>
            )}

            {activeTab === 'resources' && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {resources.map((res, idx) => (
                  <div key={`${res.title}-${idx}`} className="p-6 bg-white dark:bg-zinc-900 border border-stone-200 dark:border-zinc-800 rounded-2xl hover:shadow-md transition-shadow group">
                    <div className="w-12 h-12 bg-emerald-50 dark:bg-emerald-900/20 rounded-xl flex items-center justify-center text-emerald-600 mb-4 group-hover:scale-110 transition-transform">
                      <MapIcon size={24} />
                    </div>
                    <h4 className="font-bold text-lg mb-2">{res.title}</h4>
                    <p className="text-stone-500 dark:text-zinc-400 text-sm mb-4">{res.desc}</p>
                    <div className="flex items-center gap-3">
                      <button 
                        onClick={() => handleGenerateResourceImage(res.title)}
                        disabled={isLoading}
                        className="text-emerald-600 text-sm font-bold hover:underline flex items-center gap-2"
                      >
                        {isLoading ? <Loader2 className="animate-spin" size={16} /> : <Sparkles size={16} />}
                        Acessar Recurso
                      </button>
                      <button 
                        onClick={() => {
                          showToast(`Abrindo Mapas para: ${res.title} 🗺️`, 'info');
                          handleWikiSearch(`Mapas de ${res.title}`);
                        }}
                        className="px-3 py-1 bg-blue-50 dark:bg-blue-900/20 text-blue-600 text-[10px] font-bold rounded-lg hover:bg-blue-100 transition-colors flex items-center gap-1"
                      >
                        <MapIcon size={12} />
                        ⚓ Mapas
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {activeTab === 'outlines_library' && (
              <div className="space-y-6">
                <div className="flex flex-col md:flex-row gap-4 mb-6">
                  <div className="relative flex-1">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400" size={20} />
                    <input
                      type="text"
                      placeholder="⚓ Buscar esboços por tema, versículo ou categoria..."
                      value={outlinesSearchQuery}
                      onChange={(e) => setOutlinesSearchQuery(e.target.value)}
                      className="w-full pl-12 pr-4 py-4 bg-white dark:bg-zinc-900 border border-stone-200 dark:border-zinc-800 rounded-2xl focus:ring-2 focus:ring-emerald-500 outline-none"
                    />
                  </div>
                  <select
                    value={selectedOutlineCategory}
                    onChange={(e) => setSelectedOutlineCategory(e.target.value)}
                    className="px-4 py-4 bg-white dark:bg-zinc-900 border border-stone-200 dark:border-zinc-800 rounded-2xl outline-none"
                  >
                    <option value="Todas">Todas as Categorias</option>
                    <option value="Editados">Editados</option>
                    {Array.from(new Set(sermonOutlines.map(o => o.category))).map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredLibraryOutlines.map((outline) => (
                    <div key={outline.id} className="p-6 bg-white dark:bg-zinc-900 border border-stone-200 dark:border-zinc-800 rounded-2xl hover:shadow-md transition-shadow flex flex-col h-full">
                      <div className="flex items-center gap-2 mb-3">
                        <span className="px-3 py-1 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 text-[10px] font-bold uppercase tracking-wider rounded-lg">
                          {outline.category}
                        </span>
                        {outline.isEdited && (
                          <span className="px-3 py-1 bg-blue-50 dark:bg-blue-900/20 text-blue-600 text-[10px] font-bold uppercase tracking-wider rounded-lg flex items-center gap-1">
                            <Edit size={10} />
                            Editado
                          </span>
                        )}
                      </div>
                      <h4 className="font-bold text-lg mb-2 text-stone-800 dark:text-zinc-100">{outline.theme}</h4>
                      <p className="text-emerald-600 font-medium text-sm mb-4">{outline.verse}</p>
                      <p className="text-stone-500 dark:text-zinc-400 text-sm mb-6 line-clamp-3 flex-1">
                        {outline.introduction}
                      </p>
                      <button
                        onClick={() => setSelectedLibraryOutline(outline)}
                        className="w-full py-3 bg-stone-100 dark:bg-zinc-800 text-stone-700 dark:text-zinc-300 font-bold rounded-xl hover:bg-stone-200 dark:hover:bg-zinc-700 transition-colors flex items-center justify-center gap-2"
                      >
                        <FileText size={18} />
                        Ver Esboço Completo
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

          </motion.div>
        </AnimatePresence>
      </div>
      )}

      {/* Outline Library Modal */}
        <AnimatePresence>
          {selectedLibraryOutline && (
            <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="bg-white dark:bg-zinc-900 w-full max-w-4xl max-h-[90vh] rounded-3xl shadow-2xl overflow-hidden flex flex-col"
              >
                <div className="p-6 border-b border-stone-100 dark:border-zinc-800 flex justify-between items-center">
                  <h3 className="font-bold text-xl text-emerald-900 dark:text-emerald-400 flex items-center gap-2">
                    <FileText size={20} />
                    {selectedLibraryOutline.theme}
                  </h3>
                  <button
                    onClick={() => {
                      setSelectedLibraryOutline(null);
                      setIsEditingLibraryOutline(false);
                      setEditedLibraryOutline(null);
                    }}
                    className="p-2 hover:bg-stone-100 dark:hover:bg-zinc-800 rounded-full transition-colors"
                  >
                    <CloseIcon size={24} />
                  </button>
                </div>
                <div className="flex-1 overflow-y-auto p-8 custom-scrollbar space-y-8">
                  {isEditingLibraryOutline && editedLibraryOutline ? (
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-bold text-stone-700 dark:text-zinc-300 mb-1">Tema</label>
                        <input
                          type="text"
                          value={editedLibraryOutline.theme}
                          onChange={(e) => setEditedLibraryOutline({ ...editedLibraryOutline, theme: e.target.value })}
                          className="w-full p-3 rounded-xl border border-stone-200 dark:border-zinc-700 bg-stone-50 dark:bg-zinc-800 focus:ring-2 focus:ring-emerald-500 outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-bold text-stone-700 dark:text-zinc-300 mb-1">Versículo</label>
                        <input
                          type="text"
                          value={editedLibraryOutline.verse}
                          onChange={(e) => setEditedLibraryOutline({ ...editedLibraryOutline, verse: e.target.value })}
                          className="w-full p-3 rounded-xl border border-stone-200 dark:border-zinc-700 bg-stone-50 dark:bg-zinc-800 focus:ring-2 focus:ring-emerald-500 outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-bold text-stone-700 dark:text-zinc-300 mb-1">Introdução</label>
                        <textarea
                          value={editedLibraryOutline.introduction}
                          onChange={(e) => setEditedLibraryOutline({ ...editedLibraryOutline, introduction: e.target.value })}
                          className="w-full p-3 rounded-xl border border-stone-200 dark:border-zinc-700 bg-stone-50 dark:bg-zinc-800 focus:ring-2 focus:ring-emerald-500 outline-none h-24 resize-none"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-bold text-stone-700 dark:text-zinc-300 mb-1">Desenvolvimento (um ponto por linha)</label>
                        <textarea
                          value={editedLibraryOutline.development.join('\n')}
                          onChange={(e) => setEditedLibraryOutline({ ...editedLibraryOutline, development: e.target.value.split('\n') })}
                          className="w-full p-3 rounded-xl border border-stone-200 dark:border-zinc-700 bg-stone-50 dark:bg-zinc-800 focus:ring-2 focus:ring-emerald-500 outline-none h-48 resize-none"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-bold text-stone-700 dark:text-zinc-300 mb-1">Conclusão</label>
                        <textarea
                          value={editedLibraryOutline.conclusion}
                          onChange={(e) => setEditedLibraryOutline({ ...editedLibraryOutline, conclusion: e.target.value })}
                          className="w-full p-3 rounded-xl border border-stone-200 dark:border-zinc-700 bg-stone-50 dark:bg-zinc-800 focus:ring-2 focus:ring-emerald-500 outline-none h-24 resize-none"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-bold text-stone-700 dark:text-zinc-300 mb-1">Oração</label>
                        <textarea
                          value={editedLibraryOutline.prayer}
                          onChange={(e) => setEditedLibraryOutline({ ...editedLibraryOutline, prayer: e.target.value })}
                          className="w-full p-3 rounded-xl border border-stone-200 dark:border-zinc-700 bg-stone-50 dark:bg-zinc-800 focus:ring-2 focus:ring-emerald-500 outline-none h-24 resize-none"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-bold text-stone-700 dark:text-zinc-300 mb-1">Apelo</label>
                        <textarea
                          value={editedLibraryOutline.appeal}
                          onChange={(e) => setEditedLibraryOutline({ ...editedLibraryOutline, appeal: e.target.value })}
                          className="w-full p-3 rounded-xl border border-stone-200 dark:border-zinc-700 bg-stone-50 dark:bg-zinc-800 focus:ring-2 focus:ring-emerald-500 outline-none h-24 resize-none"
                        />
                      </div>
                    </div>
                  ) : (
                    <div className="prose dark:prose-invert max-w-none">
                      <h1 className="text-emerald-600 mb-2">{selectedLibraryOutline.theme}</h1>
                      <h3 className="text-stone-500 dark:text-zinc-400 mt-0 mb-8">{selectedLibraryOutline.verse}</h3>

                      <h2 className="text-emerald-600">Introdução</h2>
                      <p>{selectedLibraryOutline.introduction}</p>

                      <h2 className="text-emerald-600">Desenvolvimento</h2>
                      <ul>
                        {selectedLibraryOutline.development.map((point: string, index: number) => (
                          <li key={index}>{point}</li>
                        ))}
                      </ul>

                      <h2 className="text-emerald-600">Conclusão</h2>
                      <p>{selectedLibraryOutline.conclusion}</p>

                      <h2 className="text-emerald-600">Oração</h2>
                      <p>{selectedLibraryOutline.prayer}</p>

                      <h2 className="text-emerald-600">Apelo</h2>
                      <p>{selectedLibraryOutline.appeal}</p>
                    </div>
                  )}
                </div>
                <div className="p-6 bg-stone-50 dark:bg-zinc-800/50 border-t border-stone-100 dark:border-zinc-800 flex flex-wrap gap-3">
                  {isEditingLibraryOutline ? (
                    <>
                      <button
                        onClick={() => {
                          setIsEditingLibraryOutline(false);
                          setEditedLibraryOutline(null);
                        }}
                        className="flex-1 min-w-[140px] py-3 bg-stone-200 dark:bg-zinc-700 text-stone-700 dark:text-zinc-300 font-bold rounded-2xl hover:bg-stone-300 dark:hover:bg-zinc-600 transition-all"
                      >
                        Cancelar
                      </button>
                      <button
                        onClick={async () => {
                          if (!user) {
                            showToast("Faça login para salvar esboços personalizados.", "info");
                            return;
                          }
                          setIsSavingCustomOutline(true);
                          try {
                            const dataToSave = {
                              ...editedLibraryOutline,
                              userId: user.id,
                              originalId: editedLibraryOutline.originalId || editedLibraryOutline.id,
                              updatedAt: serverTimestamp()
                            };
                            
                            if (editedLibraryOutline.isEdited && editedLibraryOutline.id) {
                              // Update existing custom outline
                              await updateDoc(doc(db, 'customOutlines', editedLibraryOutline.id), dataToSave);
                            } else {
                              // Create new custom outline
                              delete dataToSave.id; // Let Firestore generate a new ID
                              await addDoc(collection(db, 'customOutlines'), dataToSave);
                            }
                            
                            showToast("Esboço salvo com sucesso!", "success");
                            setIsEditingLibraryOutline(false);
                            setSelectedLibraryOutline({ ...editedLibraryOutline, isEdited: true });
                          } catch (error) {
                            console.error("Error saving custom outline:", error);
                            showToast("Erro ao salvar esboço.", "error");
                          } finally {
                            setIsSavingCustomOutline(false);
                          }
                        }}
                        disabled={isSavingCustomOutline}
                        className="flex-1 min-w-[140px] py-3 bg-emerald-600 text-white font-bold rounded-2xl hover:bg-emerald-700 flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/20 transition-all disabled:opacity-50"
                      >
                        {isSavingCustomOutline ? <Loader2 size={20} className="animate-spin" /> : <Save size={20} />}
                        Salvar Alterações
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        onClick={() => {
                          setEditedLibraryOutline({ ...selectedLibraryOutline });
                          setIsEditingLibraryOutline(true);
                        }}
                        className="flex-1 min-w-[140px] py-3 bg-blue-600 text-white font-bold rounded-2xl hover:bg-blue-700 flex items-center justify-center gap-2 shadow-lg shadow-blue-600/20 transition-all"
                      >
                        <Edit size={20} />
                        Editar Esboço
                      </button>
                      <button
                        onClick={() => {
                          const contentToSave = `
# ${selectedLibraryOutline.theme}
### ${selectedLibraryOutline.verse}

## Introdução
${selectedLibraryOutline.introduction}

## Desenvolvimento
${selectedLibraryOutline.development.map((p: string) => `- ${p}`).join('\n')}

## Conclusão
${selectedLibraryOutline.conclusion}

## Oração
${selectedLibraryOutline.prayer}

## Apelo
${selectedLibraryOutline.appeal}
                      `.trim();
                      handleSaveToNotebook('Esboços', contentToSave);
                    }}
                    className="flex-1 min-w-[140px] py-3 bg-emerald-600 text-white font-bold rounded-2xl hover:bg-emerald-700 flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/20 transition-all"
                  >
                    <Save size={20} />
                    Salvar no Caderno
                  </button>
                  <button
                    onClick={() => {
                      const contentToCopy = `
${selectedLibraryOutline.theme}
${selectedLibraryOutline.verse}

Introdução:
${selectedLibraryOutline.introduction}

Desenvolvimento:
${selectedLibraryOutline.development.join('\n')}

Conclusão:
${selectedLibraryOutline.conclusion}

Oração:
${selectedLibraryOutline.prayer}

Apelo:
${selectedLibraryOutline.appeal}
                      `.trim();
                      copyToClipboard(contentToCopy);
                      showToast("Esboço copiado! 📋✨");
                    }}
                    className="flex-1 min-w-[140px] py-3 bg-white dark:bg-zinc-800 border border-stone-200 dark:border-zinc-700 text-stone-600 dark:text-zinc-300 font-bold rounded-2xl hover:bg-stone-100 flex items-center justify-center gap-2 transition-all"
                  >
                    <Copy size={20} />
                    Copiar Esboço
                  </button>
                  <button
                    onClick={async () => {
                      const id = `outline-${selectedLibraryOutline.id}`;
                      try {
                        await downloadMaterial({
                          id,
                          type: 'outline',
                          title: selectedLibraryOutline.theme,
                          content: selectedLibraryOutline,
                          downloadedAt: Date.now()
                        });
                        showToast("Esboço baixado para acesso offline! 📱✨", "success");
                      } catch (error) {
                        console.error("Error downloading outline:", error);
                        showToast("Erro ao baixar esboço.", "error");
                      }
                    }}
                    className="flex-1 min-w-[140px] py-3 bg-purple-600 text-white font-bold rounded-2xl hover:bg-purple-700 flex items-center justify-center gap-2 shadow-lg shadow-purple-600/20 transition-all"
                  >
                    <WifiOff size={20} />
                    Baixar Offline
                  </button>
                  <button
                    onClick={() => {
                      setSelectedLibraryOutline(null);
                      setIsEditingLibraryOutline(false);
                      setEditedLibraryOutline(null);
                    }}
                    className="px-6 py-3 bg-stone-200 dark:bg-zinc-700 text-stone-700 dark:text-zinc-200 font-bold rounded-2xl hover:bg-stone-300 transition-all"
                  >
                    Fechar
                  </button>
                  </>
                )}
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* Resource Image Modal */}
        <AnimatePresence>
          {isResourceImageModalOpen && (
            <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="bg-white dark:bg-zinc-900 w-full max-w-4xl max-h-[90vh] rounded-3xl shadow-2xl overflow-hidden flex flex-col"
              >
                <div className="p-6 border-b border-stone-100 dark:border-zinc-800 flex justify-between items-center">
                  <h3 className="font-bold text-xl text-emerald-900 dark:text-emerald-400">Recurso Visual IA</h3>
                  <button
                    onClick={() => setIsResourceImageModalOpen(false)}
                    className="p-2 hover:bg-stone-100 dark:hover:bg-zinc-800 rounded-full transition-colors"
                  >
                    <CloseIcon size={24} />
                  </button>
                </div>
                <div className="flex-1 overflow-y-auto p-8 custom-scrollbar space-y-8">
                  <div className="relative aspect-video bg-stone-100 dark:bg-zinc-800 rounded-2xl overflow-hidden shadow-inner">
                    {generatedResourceImage && (
                      <>
                        <img 
                          src={generatedResourceImage} 
                          alt="Recurso Bíblico" 
                          className="w-full h-full object-contain"
                          referrerPolicy="no-referrer"
                        />
                        <div className="absolute bottom-4 right-4 bg-black/60 backdrop-blur-md p-3 rounded-xl text-white text-[10px] font-mono max-w-[250px] border border-white/10">
                          {resourceImageSource}
                        </div>
                      </>
                    )}
                  </div>
                  
                  {resourceStudyResult && (
                    <div className="prose dark:prose-invert max-w-none">
                      <ExpandableMarkdown content={resourceStudyResult} onSearch={handleWikiSearch} />
                    </div>
                  )}
                </div>
                <div className="p-6 bg-stone-50 dark:bg-zinc-800/50 border-t border-stone-100 dark:border-zinc-800 flex flex-wrap gap-3">
                  <button
                    onClick={() => {
                      const link = document.createElement('a');
                      link.href = generatedResourceImage!;
                      link.download = 'recurso-biblico.png';
                      link.click();
                      showToast("Baixando imagem... 🖼️");
                    }}
                    className="flex-1 min-w-[140px] py-3 bg-emerald-600 text-white font-bold rounded-2xl hover:bg-emerald-700 flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/20 transition-all"
                  >
                    <Download size={20} />
                    Baixar Imagem
                  </button>
                  <button
                    onClick={() => handleListen(resourceStudyResult)}
                    disabled={isGeneratingSpeech}
                    className="flex-1 min-w-[140px] py-3 bg-amber-100 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400 font-bold rounded-xl hover:bg-amber-200 flex items-center justify-center gap-2 transition-all disabled:opacity-50"
                  >
                    {isGeneratingSpeech ? <Loader2 size={18} className="animate-spin" /> : <Volume2 size={18} />}
                    Ouvir
                  </button>
                  <button
                    onClick={() => {
                      if (resourceStudyResult) {
                        copyToClipboard(resourceStudyResult);
                        showToast("Texto copiado! 📋✨");
                      }
                    }}
                    className="flex-1 min-w-[140px] py-3 bg-white dark:bg-zinc-800 border border-stone-200 dark:border-zinc-700 text-stone-600 dark:text-zinc-300 font-bold rounded-2xl hover:bg-stone-100 flex items-center justify-center gap-2 transition-all"
                  >
                    <Copy size={20} />
                    Copiar Texto
                  </button>
                  <button
                    onClick={async () => {
                      if (resourceStudyResult) {
                        await share({
                          title: 'Recurso Bíblico',
                          text: resourceStudyResult,
                        });
                      }
                    }}
                    className="flex-1 min-w-[140px] py-3 bg-white dark:bg-zinc-800 border border-stone-200 dark:border-zinc-700 text-stone-600 dark:text-zinc-300 font-bold rounded-2xl hover:bg-stone-100 flex items-center justify-center gap-2 transition-all"
                  >
                    <Share2 size={20} />
                    Compartilhar
                  </button>
                  <button
                    onClick={() => {
                      if (resourceStudyResult) {
                        handleSaveToNotebook('Recurso Visual', resourceStudyResult);
                      }
                    }}
                    className="flex-1 min-w-[140px] py-3 bg-blue-600 text-white font-bold rounded-2xl hover:bg-blue-700 flex items-center justify-center gap-2 shadow-lg shadow-blue-600/20 transition-all"
                  >
                    <Save size={20} />
                    Salvar no Caderno
                  </button>
                  <button
                    onClick={() => setIsResourceImageModalOpen(false)}
                    className="px-6 py-3 bg-stone-200 dark:bg-zinc-700 text-stone-700 dark:text-zinc-200 font-bold rounded-2xl hover:bg-stone-300 transition-all"
                  >
                    Fechar
                  </button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* Search Popup Modal */}
        <AnimatePresence>
          {searchPopup.isOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="bg-white dark:bg-zinc-900 w-full max-w-2xl max-h-[80vh] rounded-3xl shadow-2xl overflow-hidden flex flex-col"
              >
                <div className="p-6 border-b border-stone-100 dark:border-zinc-800 flex justify-between items-center bg-emerald-600 text-white">
                  <h3 className="font-bold text-lg flex items-center gap-2">
                    <Search size={20} />
                    Pesquisa: {searchPopup.query}
                  </h3>
                  <button
                    onClick={() => setSearchPopup(prev => ({ ...prev, isOpen: false }))}
                    className="p-2 hover:bg-white/20 rounded-full transition-colors"
                  >
                    <CloseIcon size={20} />
                  </button>
                </div>
                
                <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
                  {isLoading && !searchPopup.result ? (
                    <div className="flex flex-col items-center justify-center py-12 text-stone-400">
                      <Loader2 className="animate-spin mb-4" size={32} />
                      <p>Consultando fontes teológicas...</p>
                    </div>
                  ) : (
                    <div className="prose dark:prose-invert max-w-none">
                      <ExpandableMarkdown content={searchPopup.result} onSearch={handleWikiSearch} />
                      <CreditInfoTip />
                    </div>
                  )}
                </div>

                <div className="p-6 border-t border-stone-100 dark:border-zinc-800 bg-stone-50 dark:bg-zinc-800/50 flex gap-3">
                  <button
                    onClick={() => handleListen(searchPopup.result)}
                    disabled={isGeneratingSpeech}
                    className="flex-1 py-2 bg-white dark:bg-zinc-800 border border-stone-200 dark:border-zinc-700 text-stone-600 dark:text-zinc-300 font-bold rounded-xl hover:bg-stone-100 flex items-center justify-center gap-2 text-sm disabled:opacity-50"
                  >
                    {isGeneratingSpeech ? <Loader2 size={16} className="animate-spin" /> : <Volume2 size={16} />}
                    Ouvir
                  </button>
                  <button
                    onClick={() => { copyToClipboard(searchPopup.result); showToast("Copiado! 📋✨"); }}
                    className="flex-1 py-2 bg-white dark:bg-zinc-800 border border-stone-200 dark:border-zinc-700 text-stone-600 dark:text-zinc-300 font-bold rounded-xl hover:bg-stone-100 flex items-center justify-center gap-2 text-sm"
                  >
                    <Copy size={16} /> Copiar
                  </button>
                  <button
                    onClick={() => {
                      const element = document.createElement("a");
                      const file = new Blob([searchPopup.result], {type: 'text/plain'});
                      element.href = URL.createObjectURL(file);
                      element.download = `pesquisa-${searchPopup.query}.txt`;
                      document.body.appendChild(element);
                      element.click();
                      showToast("Baixando... 📄");
                    }}
                    className="flex-1 py-2 bg-white dark:bg-zinc-800 border border-stone-200 dark:border-zinc-700 text-stone-600 dark:text-zinc-300 font-bold rounded-xl hover:bg-stone-100 flex items-center justify-center gap-2 text-sm"
                  >
                    <Download size={16} /> Baixar
                  </button>
                  <button
                    onClick={async () => {
                      await share({ 
                        title: `Pesquisa: ${searchPopup.query}`, 
                        text: searchPopup.result 
                      });
                    }}
                    className="flex-1 py-2 bg-white dark:bg-zinc-900 border border-stone-200 dark:border-zinc-700 text-stone-600 dark:text-zinc-300 font-bold rounded-xl hover:bg-stone-100 flex items-center justify-center gap-2 text-sm"
                  >
                    <Share2 size={16} /> Compartilhar
                  </button>
                  <button
                    onClick={() => handleSaveToNotebook('Pesquisa Rápida', searchPopup.result)}
                    className="flex-1 py-2 bg-emerald-600 text-white font-bold rounded-xl hover:bg-emerald-700 flex items-center justify-center gap-2 text-sm"
                  >
                    <Save size={16} /> Salvar
                  </button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

      <div className="mt-12 flex justify-center">
        <button
          onClick={() => setIsResourcesModalOpen(true)}
          className="px-6 py-3 bg-stone-100 dark:bg-zinc-800 text-stone-700 dark:text-zinc-300 font-bold rounded-2xl hover:bg-stone-200 dark:hover:bg-zinc-700 transition-all flex items-center gap-2 shadow-sm"
        >
          <BookOpen size={20} />
          Recursos dessa página (Clique aqui)
        </button>
      </div>

      <AnimatePresence>
        {isResourcesModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsResourcesModalOpen(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className={cn(
                "relative bg-white dark:bg-zinc-900 shadow-2xl flex flex-col overflow-hidden transition-all duration-300",
                isResourcesModalFullscreen 
                  ? "fixed inset-0 w-full h-full rounded-none" 
                  : "w-full max-w-4xl max-h-[85vh] rounded-[2rem]"
              )}
            >
              {/* Navigation Bar */}
              <div className="flex items-center justify-between p-4 border-b border-stone-100 dark:border-zinc-800 bg-stone-50 dark:bg-zinc-900/50">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                    <BookOpen size={20} />
                  </div>
                  <h3 className="font-bold text-stone-900 dark:text-white">Recursos dessa página</h3>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setIsResourcesModalFullscreen(false)}
                    className="p-2 text-stone-400 hover:text-stone-600 dark:hover:text-zinc-300 hover:bg-stone-100 dark:hover:bg-zinc-800 rounded-lg transition-colors"
                    title="Minimizar"
                  >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M8 3v3a2 2 0 0 1-2 2H3m18 0h-3a2 2 0 0 1-2-2V3m0 18v-3a2 2 0 0 1 2-2h3M3 16h3a2 2 0 0 1 2 2v3"/></svg>
                  </button>
                  <button
                    onClick={() => setIsResourcesModalFullscreen(true)}
                    className="p-2 text-stone-400 hover:text-stone-600 dark:hover:text-zinc-300 hover:bg-stone-100 dark:hover:bg-zinc-800 rounded-lg transition-colors"
                    title="Maximizar"
                  >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3"/></svg>
                  </button>
                  <button
                    onClick={() => setIsResourcesModalOpen(false)}
                    className="p-2 text-stone-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg transition-colors"
                    title="Fechar"
                  >
                    <X size={20} />
                  </button>
                </div>
              </div>

              {/* Content */}
              <div className="flex-1 overflow-y-auto p-6 sm:p-8">
                <div className="prose dark:prose-invert max-w-none text-stone-600 dark:text-zinc-400 space-y-6">
                  <p><strong className="text-stone-900 dark:text-white">Bíblias de Estudo</strong> = Aqui você vai conseguir mergulhar em uma biblioteca bíblica com 85 Bíblias de Estudo; 10 Comentários bíblicos, 10 Enciclopédias bíblicas, 10 Dicionários bíblicos e 1 Concordância.</p>
                  <p><strong className="text-stone-900 dark:text-white">Busca de Verísculo</strong> = Nesta pesquisa além de duas versões do texto pesquisado, você terá um breve relato histórico e teológico que envolve o texto pesquisado.</p>
                  <p><strong className="text-stone-900 dark:text-white">Visão do Autor</strong> = Neste recurso você vai conseguir pesquisar cerca de 50 escritores dos mais renomados, influentes da nossa época e de tempos antigos. Você poderá pesquisar palavras, termos, frases e até mesmo fazer uma pergunta como se fosse para o autor. A IA irá pesquisar em todos os seus livros e responder em uma síntese bem direta sobre o assunto específico ou assuntos correlacionados.</p>
                  <p><strong className="text-stone-900 dark:text-white">Outras Religiões</strong> = Pesquise também nas principais religiões e seguimentos cristãos que possuem um cânon (livro sagrado ou principal livro doutrinário da religião).</p>
                  <p><strong className="text-stone-900 dark:text-white">Ferramentas de Criação</strong> = Nesta versátil ferramenta você vai conseguir gerar vários materiais para a sua pesquisa, conhecimento ou utilização em seu ministério. São vários tipos de criação: Lição para células (pequenos grupos); Estudos bíblicos, Esboços, Devocional, Apostilas (chegam a 80 páginas), E-books, Perguntas Bíblicas e Mensagens (dividas em Pregação, Aniversário, Casamento, Fim do ano, Formatura, Devocional, Velório e Infantil).</p>
                  <p><strong className="text-stone-900 dark:text-white">Compare Versões</strong> = Estão disponíveis neste recurso todas as versões e traduções da bíblia mais conhecidas. Ao pesquisar o usuário terá a acesso as duas versões do texto (a primeira versão sempre NVI e a segunda opção que o leitor deseja comparar). Terá também um apanhado das principais palavras que divergem nas duas versões. Você também conseguirá pesquisar nas línguas originais: Hebraico para o VT e Grego para o NT.</p>
                  <p><strong className="text-stone-900 dark:text-white">Significado</strong> = Pesquise palavras e expressões nos três principais dicionários da língua portuguesa. Mais: Português-Hebraico, Hebraico-Português, Português-Grego, Grego-Português. E também estão quatro IAs integradas: Gemini, ChatGPT, Claude e LIama.</p>
                  <p><strong className="text-stone-900 dark:text-white">Pesquisa Infinita - Wiki</strong> = É um recurso formidável integrada a IA Gemini que transforme uma pesquisa ou um texto em hiperlink nas palavras principais direcionando a outras pesquisas com novos hiperlinks e assim indefinidamente.</p>
                  <p><strong className="text-stone-900 dark:text-white">Mapas e Notas</strong> = Neste recurso é possível pesquisar os principais mapas bíblicos antigos, momentos históricos e outros recursos gerados a partir de IA com fontes em Bíblias de Estudos e Enciclopédias.</p>
                  <p><strong className="text-stone-900 dark:text-white">Ministério Infantil</strong> = Recurso para gerar lições de EBD, atividades e roteiros adaptados para crianças de todas as idades.</p>
                  <p><strong className="text-stone-900 dark:text-white">Histórias & Teatro</strong> = Crie roteiros de teatro e histórias impactantes e criativas para o seu ministério.</p>
                  <p><strong className="text-stone-900 dark:text-white">Geração Narração</strong> = Transforme seus textos e estudos em narrações profissionais com diversas vozes e tons.</p>
                  <p><strong className="text-stone-900 dark:text-white">Comentário/Debate bíblico</strong> = Gere comentários profundos ou debates teológicos entre diferentes visões sobre qualquer tema bíblico.</p>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <SaveToNotebookModal
        isOpen={isNotebookModalOpen}
        isLoading={isSavingToNotebook}
        onClose={() => setIsNotebookModalOpen(false)}
        onConfirm={confirmSaveToNotebook}
      />

      <AudioConfirmationModal
        isOpen={isAudioConfirmModalOpen}
        onClose={() => setIsAudioConfirmModalOpen(false)}
        onConfirm={confirmGenerateSpeech}
        isLoading={isGeneratingSpeech}
      />

      {/* Speech Generator Modal */}
      <AnimatePresence>
        {isSpeechModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsSpeechModalOpen(false)}
              className="absolute inset-0 bg-stone-900/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-4xl max-h-[90vh] overflow-y-auto custom-scrollbar"
            >
              <div className="absolute top-6 right-6 z-10">
                <button
                  onClick={() => setIsSpeechModalOpen(false)}
                  className="p-2 bg-white dark:bg-zinc-800 text-stone-500 rounded-full shadow-lg hover:scale-110 transition-all"
                >
                  <X size={20} />
                </button>
              </div>
              <SpeechGenerator 
                initialText={speechModalContent} 
                onSaveToNotebook={(title, content) => {
                  setPendingNote({ title, content });
                  setIsNotebookModalOpen(true);
                }}
              />
            </motion.div>
          </div>
        )}
      </AnimatePresence>
      
      <div className="max-w-4xl mx-auto px-4 pb-12">
        <CreditInfoTip />
      </div>
    </div>
  );
}
