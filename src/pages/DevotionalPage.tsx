import React, { useState, useEffect } from 'react';
import { 
  Calendar as CalendarIcon, 
  ChevronLeft, 
  ChevronRight, 
  Sparkles, 
  Loader2, 
  Volume2, 
  Download, 
  Printer, 
  X, 
  Save, 
  ArrowLeft,
  BookOpen,
  Book,
  Baby,
  UserPlus,
  Users,
  Star,
  GraduationCap,
  Briefcase,
  Globe,
  Heart,
  Facebook,
  Instagram,
  MessageCircle,
  Bookmark,
  BookmarkCheck,
  Share2,
  RotateCcw,
  RotateCw,
  Play,
  Pause,
  Zap as ChallengeIcon,
  FileText,
  Plus,
  Edit,
  Trash2,
  CheckCircle,
  MessageSquarePlus,
  HeartHandshake,
  Mic
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Type } from "@google/genai";
import { geminiService } from '../services/geminiService';
import { MarkdownRenderer } from '../components/MarkdownRenderer';
import { useToast } from '../components/Toast';
import { SaveToNotebookModal } from '../components/SaveToNotebookModal';
import { useOffline } from '../contexts/OfflineContext';
import { useAudioBox } from '../contexts/AudioBoxContext';
import { useAuth } from '../contexts/AuthContext';
import { auth, db } from '../lib/firebase';
import { collection, addDoc, getDocs, query, where, deleteDoc, doc, updateDoc, orderBy, serverTimestamp } from 'firebase/firestore';
import { copyToClipboard } from '../utils/clipboard';

enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

import { FeedbackSection } from '../components/FeedbackSection';

const handleFirestoreError = (error: unknown, operationType: OperationType, path: string | null) => {
  const errInfo = {
    error: error instanceof Error ? error.message : String(error),
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
    path
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
};
import { ShareButtons } from '../components/ShareButtons';
import { useLocation } from 'react-router-dom';
import { cn } from '../types';
import { useAccessibility } from '../contexts/AccessibilityContext';
import { AudioConfirmationModal } from '../components/AudioConfirmationModal';
import { DEVOTIONAL_MATRIX } from '../constants/devotionals';
import { getRandomWaitingMessage } from '../constants/waitingMessages';
import MissionaryPage from './MissionaryPage';
import { PrayerRequestsSection } from '../components/PrayerRequestsSection';

import { useShare } from '../utils/share';

type DevotionalTheme = 'Kids' | 'Teen' | 'Casado' | 'Novo Convertido' | 'Discípulo' | 'Líder' | 'Teólogo' | 'Pastor' | 'Missionário' | 'Afastado';

interface ThemeConfig {
  id: DevotionalTheme;
  label: string;
  icon: React.ReactNode;
  color: string;
  prompt: string;
}

const THEMES: ThemeConfig[] = [
  { 
    id: 'Kids', 
    label: 'Kids', 
    icon: <Baby size={20} />, 
    color: 'bg-blue-500',
    prompt: 'Gere uma mensagem com linguagem infantil (7-9 anos). Foco no amor de Deus e obediência. Use parábolas de Jesus. Linguagem simples e direta.'
  },
  { 
    id: 'Teen', 
    label: 'Teen', 
    icon: <Users size={20} />, 
    color: 'bg-purple-500',
    prompt: 'Gere mensagens com temas de interesse de adolescentes (13-17 anos), como identidade, propósito, amizades, desafios escolares, pressão social, relacionamento com pais e fé. Linguagem jovem, dinâmica e empática.'
  },
  { 
    id: 'Casado', 
    label: 'Casado', 
    icon: <Heart size={20} />, 
    color: 'bg-rose-500',
    prompt: 'Gere mensagens voltadas para o matrimônio, seus desafios e suas alegrias. Motive o perdão, respeito, amor, lealdade e fidelidade. Fale sobre o papel de sacerdote do homem e mulher sábia que edifica a casa, criação de filhos, cuidar um do outro, zelo pela casa, sonhos, planejar, momento a sós, cuidar da aparência, cuidado com ciúmes, egoísmo, monotonia, sexo, intimidade e amizade.'
  },
  { 
    id: 'Novo Convertido', 
    label: 'Novo Convertido', 
    icon: <UserPlus size={20} />, 
    color: 'bg-emerald-500',
    prompt: 'Mensagens simplificadas focadas em João, Salmos e Provérbios. Base para os primeiros passos na fé.'
  },
  { 
    id: 'Discípulo', 
    label: 'Discípulo', 
    icon: <Users size={20} />, 
    color: 'bg-indigo-500',
    prompt: 'Foco na vida cristã prática (família, trabalho). Use as cartas de Paulo e Provérbios. Mensagem de motivação e fé.'
  },
  { 
    id: 'Líder', 
    label: 'Líder', 
    icon: <Star size={20} />, 
    color: 'bg-amber-500',
    prompt: 'Foco em liderança, serviço e caráter. Mensagens sobre dons espirituais e ganhar almas. Use exemplos de líderes bíblicos.'
  },
  { 
    id: 'Teólogo', 
    label: 'Teólogo', 
    icon: <GraduationCap size={20} />, 
    color: 'bg-stone-800',
    prompt: 'Abordagem acadêmica: termos originais (grego/hebraico), exegese e hermenêutica. Use as principais Bíblias de Estudo e Comentários.'
  },
  { 
    id: 'Pastor', 
    label: 'Pastor', 
    icon: <Briefcase size={20} />, 
    color: 'bg-zinc-700',
    prompt: 'Mensagens estruturadas (esboços). Foco em cuidado pastoral, revelação bíblica e combate a heresias. Prático e profundo.'
  },
  { 
    id: 'Missionário', 
    label: 'Missionário', 
    icon: <Globe size={20} />, 
    color: 'bg-cyan-600',
    prompt: 'Foco em missões, evangelismo e heróis da fé. Mensagens motivadoras para o campo missionário.'
  },
  { 
    id: 'Afastado', 
    label: 'Afastado', 
    icon: <Heart size={20} />, 
    color: 'bg-rose-500',
    prompt: 'Mensagem de arrependimento e retorno ao primeiro amor. Foco no perdão de Deus e vida eterna.'
  },
];

export default function DevotionalPage({ onNavigate }: { onNavigate: (tab: string, state?: any) => void }) {
  const location = useLocation();
  const { showToast } = useToast();
  const { share } = useShare();
  const { isOffline } = useOffline();
  const { user } = useAuth();
  const { saveTrack } = useAudioBox();
  const { fontFamily, fontSize, lineHeight } = useAccessibility();

  useEffect(() => {
    if (location.state?.devotional) {
      setDevotionalResult(location.state.devotional);
      // Clear state to prevent re-opening on refresh if needed, 
      // but usually location.state is fine for one-time display.
    }
  }, [location.state]);
  const [isReadingMode, setIsReadingMode] = useState(false);
  const [readingFontSize, setReadingFontSize] = useState(18);
  const [readingLineHeight, setReadingLineHeight] = useState(1.6);
  const [showMissionary, setShowMissionary] = useState(false);
  const [selectedTheme, setSelectedTheme] = useState<DevotionalTheme | null>(null);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [isLoading, setIsLoading] = useState(false);
  const [devotionalResult, setDevotionalResult] = useState<string | null>(null);
  const [isAudioLoading, setIsAudioLoading] = useState(false);
  const [isAudioConfirmModalOpen, setIsAudioConfirmModalOpen] = useState(false);
  const [favorites, setFavorites] = useState<any[]>(() => {
    const saved = localStorage.getItem('devotional_favorites');
    return saved ? JSON.parse(saved) : [];
  });
  const [activeTab, setActiveTab] = useState<'devotional' | 'journal' | 'readingPlan'>('devotional');
  const [journalEntries, setJournalEntries] = useState<any[]>([]);
  const [isJournalLoading, setIsJournalLoading] = useState(false);
  const [entryToDelete, setEntryToDelete] = useState<string | null>(null);
  const [newJournalEntry, setNewJournalEntry] = useState('');
  const [editingJournalId, setEditingJournalId] = useState<string | null>(null);
  const [editJournalContent, setEditJournalContent] = useState('');
  const [verseOfDay, setVerseOfDay] = useState<{ text: string, ref: string, bg: string } | null>(null);
  const [selectedTagFilter, setSelectedTagFilter] = useState<string | null>(null);
  const [isSeriesModalOpen, setIsSeriesModalOpen] = useState(false);
  const [seriesResult, setSeriesResult] = useState<string | null>(null);
  const [isGeneratingSeries, setIsGeneratingSeries] = useState(false);
  const [seriesSelectedMonth, setSeriesSelectedMonth] = useState<number>(new Date().getMonth());
  const [isNotebookModalOpen, setIsNotebookModalOpen] = useState(false);
  const [isSavingNote, setIsSavingNote] = useState(false);
  const [pendingNote, setPendingNote] = useState<{ title: string, content: string } | null>(null);
  const [isGeneratingPrayer, setIsGeneratingPrayer] = useState(false);
  const [isPrayerConfirmOpen, setIsPrayerConfirmOpen] = useState(false);
  const [prayerType, setPrayerType] = useState('Agradecimento');
  const [customPrayerTheme, setCustomPrayerTheme] = useState('');
  const [prayerAudio, setPrayerAudio] = useState<string | null>(null);
  const [isPlayingPrayer, setIsPlayingPrayer] = useState(false);
  const prayerAudioRef = React.useRef<HTMLAudioElement | null>(null);
  const bgMusicRef = React.useRef<HTMLAudioElement | null>(null);

  const handleGeneratePrayer = async () => {
    setIsGeneratingPrayer(true);
    showToast("Gerando sua oração... 🙏", "info");
    try {
      const types = ['Agradecimento', 'Adoração', 'Entrega', 'Cura', 'Libertação', 'Salvação', 'Direção', 'Família', 'Emprego', 'Provisão', 'Proteção', 'Livramento', 'Avivamento', 'Consolo'];
      let selectedType = prayerType;
      if (prayerType === 'Escolha pra mim') {
        selectedType = types[Math.floor(Math.random() * types.length)];
      } else if (prayerType === 'Outro') {
        selectedType = customPrayerTheme || 'Geral';
      }
      
      const prompt = `Gere uma oração gospel de ${selectedType}, com estilo carinhoso, consolador e motivador, focado em fé, adoração, graça, pedido de orientação do Espírito Santo e agradecimento pelas provisões diárias. Cite versículos da bíblia e salmos que evocam a fé, coragem, consolo, o Poder, glória e a proteção de Deus. A oração deve ser curta, profunda e emocionante.`;
      
      const prayerText = await geminiService.generateText(prompt, "Você é um mentor espiritual com voz acolhedora.");
      const randomVoice = Math.random() > 0.5 ? 'Fenrir' : 'Charon';
      const audioUrl = await geminiService.generateSpeech(prayerText, randomVoice as any);
      
      if (audioUrl) {
        setPrayerAudio(audioUrl);
        showToast("Oração gerada! Ouvindo agora... 🎧✨");
        setTimeout(() => {
          if (bgMusicRef.current) {
            bgMusicRef.current.volume = 0.4;
            bgMusicRef.current.play().catch(e => console.error("Error playing background music:", e));
          }
        }, 500);
      } else {
        showToast("Erro ao gerar áudio da oração.");
      }
    } catch (error: any) {
      console.error("Prayer Generation Error:", error);
      const errorMessage = error?.message || "Erro desconhecido";
      showToast(`Erro ao gerar oração: ${errorMessage}`, "error");
    } finally {
      setIsGeneratingPrayer(false);
    }
  };

  useEffect(() => {
    if (location.state?.text) {
      setDevotionalResult(location.state.text);
      if (location.state.title) {
        // You might want to store the title somewhere if needed, 
        // but for now, we just show the text.
      }
    }
  }, [location.state]);

  const fetchJournalEntries = async () => {
    if (!user) return;
    setIsJournalLoading(true);
    try {
      const q = query(
        collection(db, 'journalEntries'),
        where('userId', '==', user.id),
        orderBy('createdAt', 'desc')
      );
      const snapshot = await getDocs(q);
      const entries = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setJournalEntries(entries);
    } catch (error) {
      console.error("Error fetching journal entries:", error);
      handleFirestoreError(error, OperationType.GET, 'journalEntries');
    } finally {
      setIsJournalLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'journal') {
      fetchJournalEntries();
    }
  }, [activeTab, user]);

  const handleAddJournalEntry = async () => {
    if (!user || !newJournalEntry.trim()) return;
    try {
      await addDoc(collection(db, 'journalEntries'), {
        userId: user.id,
        title: 'Oração Diária',
        content: newJournalEntry,
        createdAt: serverTimestamp()
      });
      setNewJournalEntry('');
      fetchJournalEntries();
      showToast("Entrada adicionada com sucesso!", "success");
    } catch (error) {
      console.error("Error adding journal entry:", error);
      handleFirestoreError(error, OperationType.CREATE, 'journalEntries');
      showToast("Erro ao adicionar entrada.", "error");
    }
  };

  const handleUpdateJournalEntry = async (id: string) => {
    if (!user || !editJournalContent.trim()) return;
    try {
      await updateDoc(doc(db, 'journalEntries', id), {
        content: editJournalContent,
        updatedAt: serverTimestamp()
      });
      setEditingJournalId(null);
      setEditJournalContent('');
      fetchJournalEntries();
      showToast("Entrada atualizada com sucesso!", "success");
    } catch (error) {
      console.error("Error updating journal entry:", error);
      handleFirestoreError(error, OperationType.UPDATE, 'journalEntries');
      showToast("Erro ao atualizar entrada.", "error");
    }
  };

  const handleDeleteJournalEntry = async () => {
    if (!user || !entryToDelete) return;
    try {
      await deleteDoc(doc(db, 'journalEntries', entryToDelete));
      fetchJournalEntries();
      showToast("Entrada excluída com sucesso!", "success");
      setEntryToDelete(null);
    } catch (error) {
      console.error("Error deleting journal entry:", error);
      handleFirestoreError(error, OperationType.DELETE, 'journalEntries');
      showToast("Erro ao excluir entrada.", "error");
    }
  };

  const handleToggleTag = async (id: string, tag: string, currentTags: string[] = []) => {
    if (!user) return;
    try {
      const newTags = currentTags.includes(tag) 
        ? currentTags.filter(t => t !== tag)
        : [...currentTags, tag];
        
      await updateDoc(doc(db, 'journalEntries', id), {
        tags: newTags,
        updatedAt: serverTimestamp()
      });
      fetchJournalEntries();
    } catch (error) {
      console.error("Error updating tags:", error);
      handleFirestoreError(error, OperationType.UPDATE, 'journalEntries');
      showToast("Erro ao atualizar tag.", "error");
    }
  };

  const [isReceivingWord, setIsReceivingWord] = useState(false);
  const [receivedWordAudio, setReceivedWordAudio] = useState<string | null>(null);

  // Reading Plan State
  const [readingPlans, setReadingPlans] = useState<any[]>([]);
  const [activeReadingPlan, setActiveReadingPlan] = useState<any | null>(null);
  const [isReadingPlanLoading, setIsReadingPlanLoading] = useState(false);
  const [showPlanSelector, setShowPlanSelector] = useState(false);

  const fetchReadingPlans = async () => {
    if (!user) return;
    setIsReadingPlanLoading(true);
    try {
      const q = query(
        collection(db, 'readingPlans'),
        where('userId', '==', user.id)
      );
      const snapshot = await getDocs(q);
      const plans = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setReadingPlans(plans);
      if (plans.length > 0) {
        setActiveReadingPlan(plans[0]);
      }
    } catch (error) {
      console.error("Error fetching reading plans:", error);
      handleFirestoreError(error, OperationType.GET, 'readingPlans');
    } finally {
      setIsReadingPlanLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'readingPlan') {
      fetchReadingPlans();
    }
  }, [activeTab, user]);

  const handleCreatePlan = async (type: 'chronological' | 'thematic' | 'testament') => {
    if (!user) return;
    try {
      const newPlan = {
        userId: user.id,
        planType: type,
        startDate: serverTimestamp(),
        completedDays: [],
        remindersEnabled: false,
        reminderTime: '08:00',
        currentDay: 1
      };
      const docRef = await addDoc(collection(db, 'readingPlans'), newPlan);
      const planWithId = { id: docRef.id, ...newPlan };
      setReadingPlans([planWithId]);
      setActiveReadingPlan(planWithId);
      setShowPlanSelector(false);
      showToast("Plano de leitura criado com sucesso! 📖", "success");
    } catch (error) {
      console.error("Error creating reading plan:", error);
      handleFirestoreError(error, OperationType.CREATE, 'readingPlans');
      showToast("Erro ao criar plano de leitura.", "error");
    }
  };

  const handleToggleDay = async (day: number) => {
    if (!activeReadingPlan || !user) return;
    
    const isCompleted = activeReadingPlan.completedDays.includes(day);
    const newCompletedDays = isCompleted
      ? activeReadingPlan.completedDays.filter((d: number) => d !== day)
      : [...activeReadingPlan.completedDays, day];
      
    try {
      await updateDoc(doc(db, 'readingPlans', activeReadingPlan.id), {
        completedDays: newCompletedDays,
        currentDay: Math.max(...newCompletedDays, 0) + 1
      });
      
      const updatedPlan = { 
        ...activeReadingPlan, 
        completedDays: newCompletedDays,
        currentDay: Math.max(...newCompletedDays, 0) + 1
      };
      setActiveReadingPlan(updatedPlan);
      setReadingPlans(readingPlans.map(p => p.id === updatedPlan.id ? updatedPlan : p));
      
      if (!isCompleted) {
        showToast("Dia concluído! Parabéns! 🎉", "success");
      }
    } catch (error) {
      console.error("Error updating reading plan:", error);
      handleFirestoreError(error, OperationType.UPDATE, 'readingPlans');
    }
  };

  const handleToggleReminders = async () => {
    if (!activeReadingPlan || !user) return;
    
    const newEnabled = !activeReadingPlan.remindersEnabled;
    try {
      await updateDoc(doc(db, 'readingPlans', activeReadingPlan.id), {
        remindersEnabled: newEnabled
      });
      
      const updatedPlan = { ...activeReadingPlan, remindersEnabled: newEnabled };
      setActiveReadingPlan(updatedPlan);
      setReadingPlans(readingPlans.map(p => p.id === updatedPlan.id ? updatedPlan : p));
      
      showToast(newEnabled ? "Lembretes ativados! 🔔" : "Lembretes desativados. 🔕", "info");
      
      if (newEnabled && Notification.permission !== 'granted') {
        Notification.requestPermission();
      }
    } catch (error) {
      console.error("Error updating reminders:", error);
      handleFirestoreError(error, OperationType.UPDATE, 'readingPlans');
    }
  };

  const handleUpdateReminderTime = async (time: string) => {
    if (!activeReadingPlan || !user) return;
    
    try {
      await updateDoc(doc(db, 'readingPlans', activeReadingPlan.id), {
        reminderTime: time
      });
      
      const updatedPlan = { ...activeReadingPlan, reminderTime: time };
      setActiveReadingPlan(updatedPlan);
      setReadingPlans(readingPlans.map(p => p.id === updatedPlan.id ? updatedPlan : p));
      
      showToast(`Lembrete ajustado para ${time} ⏰`, "success");
    } catch (error) {
      console.error("Error updating reminder time:", error);
      handleFirestoreError(error, OperationType.UPDATE, 'readingPlans');
    }
  };

  const handleReceiveWord = async () => {
    if (!user) return;
    setIsReceivingWord(true);
    try {
      const prompt = `Gere uma palavra de fé, motivação, consolo e ânimo, glorificando a Deus e entregando tudo a Ele. Finalize com uma oração. Busque referências no estilo de autores referência em oração, como a Quarta Dimensão de David Yonggi Cho, Bom dia Espírito Santo de Benny Hinn, Porque tarda o Pleno Avivamento de Leonard Ravenhill, entre outros. O texto deve ser direto, como se estivesse falando com o leitor.`;
      const generatedWord = await geminiService.generateText(prompt, "Você é um pregador e mentor espiritual cheio do Espírito Santo.");
      
      await addDoc(collection(db, 'journalEntries'), {
        userId: user.id,
        title: 'Palavra Recebida',
        content: generatedWord,
        createdAt: serverTimestamp()
      });
      fetchJournalEntries();
      
      const audioUrl = await geminiService.generateSpeech(generatedWord, 'Zephyr');
      setReceivedWordAudio(audioUrl);
      showToast("Palavra recebida! Ouça o áudio.", "success");
    } catch (error) {
      console.error("Error receiving word:", error);
      showToast("Erro ao receber palavra.", "error");
    } finally {
      setIsReceivingWord(false);
    }
  };

  // Narration state
  const [selectedVoice, setSelectedVoice] = useState<'Zephyr' | 'Puck' | 'Charon' | 'Kore' | 'Fenrir'>('Zephyr');
  const [selectedEmotion, setSelectedEmotion] = useState('Inspiradora');
  const [narrationAudio, setNarrationAudio] = useState<string | null>(null);
  const [isGeneratingNarration, setIsGeneratingNarration] = useState(false);
  const [audioProgress, setAudioProgress] = useState(0);
  const [audioDuration, setAudioDuration] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = React.useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    const fetchVerse = async () => {
      if (isOffline) return;
      try {
        const data = await geminiService.generateJSON<{ text: string, ref: string }>(
          "Gere um versículo bíblico inspirador para hoje em português, com a referência. Retorne apenas o versículo e a referência em formato JSON: { \"text\": \"...\", \"ref\": \"...\" }",
          undefined,
          {
            type: Type.OBJECT,
            properties: {
              text: { type: Type.STRING },
              ref: { type: Type.STRING }
            },
            required: ["text", "ref"]
          }
        );
        
        const fallbackImg = "https://images.unsplash.com/photo-1499209974431-9dac3adaf471?auto=format&fit=crop&q=80&w=1200";
        setVerseOfDay({ ...data, bg: fallbackImg });
      } catch (error: any) {
        console.warn("Error fetching verse:", error?.message || error);
        // Fallback to a default verse if API fails (e.g., quota exceeded)
        setVerseOfDay({
          text: "O Senhor é o meu pastor; nada me faltará.",
          ref: "Salmos 23:1",
          bg: "https://images.unsplash.com/photo-1499209974431-9dac3adaf471?auto=format&fit=crop&q=80&w=1200"
        });
      }
    };
    fetchVerse();
  }, []);

  const toggleFavorite = (devotional: string) => {
    const isFav = favorites.some(f => f.content === devotional);
    let newFavs;
    if (isFav) {
      newFavs = favorites.filter(f => f.content !== devotional);
      showToast("Removido dos favoritos 💔");
    } else {
      newFavs = [...favorites, { 
        id: Date.now(), 
        content: devotional, 
        theme: selectedTheme,
        date: new Date().toLocaleDateString() 
      }];
      showToast("Adicionado aos favoritos! ❤️✨");
    }
    setFavorites(newFavs);
    localStorage.setItem('devotional_favorites', JSON.stringify(newFavs));
  };

  const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
  const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay();

  const handlePrevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const generateDevotional = async (day: number) => {
    if (!selectedTheme) {
      showToast("Por favor, escolha um tema primeiro! 🙏", "info");
      return;
    }

    if (isOffline) {
      showToast("Você está offline. Conecte-se para gerar novos devocionais.", "error");
      return;
    }

    setIsLoading(true);
    setDevotionalResult(null);
    showToast(getRandomWaitingMessage(), 'info');

    try {
      const themeConfig = THEMES.find(t => t.id === selectedTheme)!;
      const dayStr = String(day).padStart(2, '0');
      const monthStr = String(currentDate.getMonth() + 1).padStart(2, '0');
      const matrixKey = `${dayStr}/${monthStr}`;
      const bookOfDay = DEVOTIONAL_MATRIX[matrixKey] || "Bíblia Sagrada";
      
      const dateStr = `${day}/${currentDate.getMonth() + 1}/${currentDate.getFullYear()}`;
      
      const prompt = `Gere um devocional para o dia ${dateStr}. 
        Tema/Público: ${selectedTheme}. 
        Livro/Base do Dia: ${bookOfDay}.
        Instruções específicas: ${themeConfig.prompt}
        Formate a resposta com as seguintes seções em Markdown:
        1. # [Título Inspirador]
        2. **Versículo Chave:** [Referência e Texto]
        3. ## Meditação
        [Texto da meditação baseada no livro do dia: ${bookOfDay}]
        4. ## Desafio do Dia
        [Um desafio prático e acionável relacionado à mensagem]
        5. ## Oração Final
        [Uma oração curta e poderosa]`;

      const response = await geminiService.generateFastText(prompt, "Você é um mentor espiritual experiente.");

      setDevotionalResult(response || "Não foi possível gerar o devocional.");
    } catch (error: any) {
      console.error(error);
      showToast(error.message || "Erro ao conectar com a sabedoria divina. Tente novamente.", "error");
    } finally {
      setIsLoading(false);
    }
  };

  const handlePlayAudio = async () => {
    if (!devotionalResult) return;
    setIsAudioConfirmModalOpen(true);
  };

  const confirmPlayAudio = async () => {
    setIsAudioConfirmModalOpen(false);
    setIsGeneratingNarration(true);
    setNarrationAudio(null);
    setAudioProgress(0);
    
    try {
      const prompt = `Crie uma narração contínua, fluida e completa para o seguinte devocional: "${devotionalResult}".
      A narração deve ter a emoção "${selectedEmotion}".
      IMPORTANTE: Narre o texto integralmente do início ao fim, sem repetições e sem omitir nenhuma seção.
      Retorne apenas o texto da narração pronto para ser lido.`;
      
      const narrationText = await geminiService.generateText(prompt, "Você é um mentor espiritual e locutor profissional com voz acolhedora.");
      
      const audioUrl = await geminiService.generateSpeech(narrationText, selectedVoice);
      if (audioUrl) {
        setNarrationAudio(audioUrl);
        showToast("Narração gerada com sucesso! 🎙️✨");
      } else {
        showToast("Erro ao gerar áudio da narração.");
      }
    } catch (error) {
      console.error(error);
      showToast("Erro ao gerar áudio.", "error");
    } finally {
      setIsGeneratingNarration(false);
    }
  };

  const handleDownload = () => {
    if (!devotionalResult) return;
    const element = document.createElement("a");
    const file = new Blob([devotionalResult], {type: 'text/plain'});
    element.href = URL.createObjectURL(file);
    element.download = `devocional-${selectedTheme}-${currentDate.getDate()}.txt`;
    document.body.appendChild(element);
    element.click();
    showToast("Baixando devocional... 📄");
  };

  const handlePrint = () => {
    window.print();
  };

  const saveToNotebook = () => {
    if (!devotionalResult) return;
    
    setPendingNote({
      title: `Devocional: ${selectedTheme} - ${new Date().toLocaleDateString('pt-BR')}`,
      content: devotionalResult
    });
    setIsNotebookModalOpen(true);
  };

  const handleSaveToAudioBox = async () => {
    if (!narrationAudio) {
      showToast("Gere a narração primeiro para salvar na Coletânea.");
      return;
    }
    
    try {
      await saveTrack(`Devocional: ${selectedTheme}`, 'Devocional', narrationAudio, 'Devocional', selectedEmotion);
      showToast("Salvo na Coletânea! 🎵");
    } catch (error) {
      showToast("Erro ao salvar na Coletânea.");
    }
  };
  const shareSocial = (platform: 'whatsapp' | 'facebook' | 'instagram') => {
    if (!devotionalResult) return;
    const text = `Confira este devocional: ${devotionalResult.substring(0, 100)}...`;
    const url = window.location.href;
    
    let shareUrl = '';
    switch(platform) {
      case 'whatsapp':
        shareUrl = `https://wa.me/?text=${encodeURIComponent(text + ' ' + url)}`;
        break;
      case 'facebook':
        shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`;
        break;
      case 'instagram':
        showToast("Copiado para o clipboard! Poste no seu Story. 📸");
        copyToClipboard(text);
        return;
    }
    window.open(shareUrl, '_blank');
  };

  const generateSeriesDevotional = async () => {
    if (!selectedTheme) {
      showToast("Por favor, escolha um tema primeiro! 🙏", "info");
      return;
    }
    setIsGeneratingSeries(true);
    setSeriesResult(null);
    showToast("Preparando devocionais para o mês inteiro... Isso pode levar um momento. ⏳✨", 'info');
    
    try {
      const themeConfig = THEMES.find(t => t.id === selectedTheme)!;
      const targetDate = new Date(currentDate.getFullYear(), seriesSelectedMonth, 1);
      const targetDaysInMonth = new Date(targetDate.getFullYear(), targetDate.getMonth() + 1, 0).getDate();
      const monthName = targetDate.toLocaleString('pt-BR', { month: 'long' });
      const prompt = `Gere uma série de devocionais curtos para todos os dias do mês de ${monthName}. 
        Tema/Público: ${selectedTheme}. 
        Instruções: ${themeConfig.prompt}
        Formate como uma lista numerada de 1 a ${targetDaysInMonth}. Cada dia deve ter:
        - Título
        - Versículo Curto
        - Mensagem de 2-3 parágrafos
        - Oração curta`;
      
      const response = await geminiService.generateFastText(prompt, "Você é um mentor espiritual experiente.");
      setSeriesResult(response);
      showToast("Série mensal gerada com sucesso! 🙌✨");
    } catch (error) {
      console.error(error);
      showToast("Erro ao gerar série de devocionais.", 'error');
    } finally {
      setIsGeneratingSeries(false);
    }
  };

  const saveSeriesToNotebook = () => {
    if (!seriesResult) return;
    const targetDate = new Date(currentDate.getFullYear(), seriesSelectedMonth, 1);
    setPendingNote({
      title: `Série Devocional: ${selectedTheme} - ${targetDate.toLocaleString('pt-BR', { month: 'long' })}`,
      content: seriesResult
    });
    setIsNotebookModalOpen(true);
  };

  const confirmSaveToNotebook = async (category: 'Anotações' | 'Esboços' | 'Estudos') => {
    if (!pendingNote) return;
    
    setIsSavingNote(true);
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
        const savedNotes = JSON.parse(localStorage.getItem('preacher_notes') || '[]');
        const newNote = {
          id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          title: pendingNote.title,
          content: pendingNote.content,
          category,
          date: new Date().toLocaleDateString('pt-BR'),
          createdAt: new Date().toISOString()
        };
        localStorage.setItem('preacher_notes', JSON.stringify([newNote, ...savedNotes]));
      }
      showToast(`Salvo em ${category}! 📓✨`);
      setIsNotebookModalOpen(false);
      setPendingNote(null);
    } catch (error) {
      console.error("Error saving to notebook:", error);
      showToast("Erro ao salvar no caderno.", 'error');
    } finally {
      setIsSavingNote(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-20">
      {showMissionary ? (
        <div className="space-y-6">
          <button 
            onClick={() => setShowMissionary(false)}
            className="flex items-center gap-2 text-stone-500 hover:text-emerald-600 transition-colors font-bold"
          >
            <ArrowLeft size={20} /> VOLTAR PARA DEVOCIONAL
          </button>
          <MissionaryPage onNavigate={onNavigate} />
        </div>
      ) : (
        <>
          <div className="flex justify-center mb-8">
            <div className="bg-stone-100 dark:bg-zinc-800 p-1 rounded-full flex items-center gap-1">
              <button
                onClick={() => setActiveTab('devotional')}
                className={cn(
                  "px-6 py-2.5 rounded-full text-sm font-bold transition-all",
                  activeTab === 'devotional' 
                    ? "bg-white dark:bg-zinc-900 text-emerald-600 shadow-sm" 
                    : "text-stone-500 hover:text-stone-700 dark:text-zinc-400 dark:hover:text-zinc-200"
                )}
              >
                Devocional
              </button>
              <button
                onClick={() => setActiveTab('journal')}
                className={cn(
                  "px-6 py-2.5 rounded-full text-sm font-bold transition-all",
                  activeTab === 'journal' 
                    ? "bg-white dark:bg-zinc-900 text-emerald-600 shadow-sm" 
                    : "text-stone-500 hover:text-stone-700 dark:text-zinc-400 dark:hover:text-zinc-200"
                )}
              >
                Caderno de Oração
              </button>
              <button
                onClick={() => setActiveTab('readingPlan')}
                className={cn(
                  "px-6 py-2.5 rounded-full text-sm font-bold transition-all",
                  activeTab === 'readingPlan' 
                    ? "bg-white dark:bg-zinc-900 text-emerald-600 shadow-sm" 
                    : "text-stone-500 hover:text-stone-700 dark:text-zinc-400 dark:hover:text-zinc-200"
                )}
              >
                Plano de Leitura
              </button>
            </div>
          </div>

          {activeTab === 'devotional' ? (
            <>
              <header className="text-center space-y-4">
            <div className="flex justify-center gap-4">
              <button
                onClick={() => setIsPrayerConfirmOpen(true)}
                disabled={isGeneratingPrayer}
                className="px-6 py-3 bg-emerald-600 text-white font-bold rounded-full hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-600/20 flex items-center gap-2"
              >
                {isGeneratingPrayer ? <Loader2 size={18} className="animate-spin" /> : <span>🙏</span>}
                Posso Orar Por Você?
              </button>
            </div>
            <p className="text-stone-500 dark:text-zinc-400">Escolha o tema para o Devocional de hoje</p>
          </header>
          
          {isPrayerConfirmOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
              <div className="bg-app-surface p-8 rounded-3xl max-w-sm w-full text-center shadow-2xl border border-app-border">
                <h3 className="text-xl font-bold mb-4">Gerar Oração</h3>
                <p className="text-sm text-stone-500 mb-6">A geração demora cerca de um minuto.</p>
                <div className="space-y-4 mb-6">
                  <select 
                    value={prayerType} 
                    onChange={(e) => {
                      setPrayerType(e.target.value);
                      if (e.target.value !== 'Outro') setCustomPrayerTheme('');
                    }}
                    className="w-full p-3 rounded-xl border border-stone-200 dark:border-zinc-700 bg-stone-50 dark:bg-zinc-800"
                  >
                    <option value="Escolha pra mim">Escolha pra mim</option>
                    {['Agradecimento', 'Adoração', 'Entrega', 'Cura', 'Libertação', 'Salvação', 'Direção', 'Família', 'Emprego', 'Provisão', 'Proteção', 'Livramento', 'Avivamento', 'Consolo'].map(t => <option key={t} value={t}>{t}</option>)}
                    <option value="Outro">Outro (especifique)</option>
                  </select>
                  {prayerType === 'Outro' && (
                    <input
                      type="text"
                      value={customPrayerTheme}
                      onChange={(e) => setCustomPrayerTheme(e.target.value)}
                      placeholder="Qual o tema da oração?"
                      className="w-full p-3 rounded-xl border border-stone-200 dark:border-zinc-700 bg-stone-50 dark:bg-zinc-800"
                    />
                  )}
                </div>
                <div className="flex gap-4">
                  <button onClick={() => setIsPrayerConfirmOpen(false)} className="flex-1 py-3 bg-stone-100 dark:bg-zinc-800 text-stone-600 dark:text-zinc-300 font-bold rounded-xl hover:bg-stone-200">Cancelar</button>
                  <button onClick={() => { setIsPrayerConfirmOpen(false); handleGeneratePrayer(); }} className="flex-1 py-3 bg-emerald-600 text-white font-bold rounded-xl hover:bg-emerald-700 shadow-lg shadow-emerald-600/20">Gerar</button>
                </div>
              </div>
            </div>
          )}

          {prayerAudio && (
            <motion.div 
              drag
              dragMomentum={false}
              initial={{ opacity: 0, scale: 0.9, x: '-50%', y: '-50%' }}
              animate={{ opacity: 1, scale: 1, x: '-50%', y: '-50%' }}
              className="fixed top-1/2 left-1/2 bg-app-surface border border-app-border p-8 rounded-[3rem] shadow-2xl z-50 w-[95%] max-w-2xl cursor-move"
            >
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1.5 bg-emerald-600 text-white text-[10px] font-bold rounded-full uppercase tracking-widest shadow-lg pointer-events-none flex items-center gap-2">
                <Sparkles size={12} />
              </div>
              
              <button 
                onClick={() => {
                  if (prayerAudioRef.current) prayerAudioRef.current.pause();
                  setPrayerAudio(null);
                  setIsPlayingPrayer(false);
                }}
                className="absolute -top-2 -right-2 p-2.5 bg-white dark:bg-zinc-800 text-stone-500 rounded-full shadow-xl hover:scale-110 transition-all z-10 border border-stone-100 dark:border-zinc-700"
              >
                <X size={18} />
              </button>
              
              <div className="space-y-6 mt-4">
                <div className="flex items-center gap-6">
                  <div className="flex items-center gap-3">
                    <button 
                      onClick={() => { if(prayerAudioRef.current) prayerAudioRef.current.currentTime -= 10; }} 
                      className="p-3 rounded-full hover:bg-stone-100 dark:hover:bg-zinc-800 text-stone-600 dark:text-zinc-400 transition-colors"
                      title="Voltar 10s"
                    >
                      <RotateCcw size={24} />
                    </button>
                    
                    <button 
                      onClick={() => { 
                        if(prayerAudioRef.current) {
                          if (prayerAudioRef.current.paused) {
                            prayerAudioRef.current.play();
                            setIsPlayingPrayer(true);
                          } else {
                            prayerAudioRef.current.pause();
                            setIsPlayingPrayer(false);
                          }
                        }
                      }} 
                      className="w-16 h-16 bg-emerald-600 text-white rounded-full hover:bg-emerald-700 shadow-lg shadow-emerald-600/30 flex items-center justify-center transition-all hover:scale-105 active:scale-95"
                    >
                      {isPlayingPrayer ? <Pause size={32} fill="currentColor" /> : <Play size={32} fill="currentColor" className="ml-1" />}
                    </button>
                    
                    <button 
                      onClick={() => { if(prayerAudioRef.current) prayerAudioRef.current.currentTime += 10; }} 
                      className="p-3 rounded-full hover:bg-stone-100 dark:hover:bg-zinc-800 text-stone-600 dark:text-zinc-400 transition-colors"
                      title="Avançar 10s"
                    >
                      <RotateCw size={24} />
                    </button>
                  </div>
                  
                  <div className="flex-1 space-y-2">
                    <div className="h-3 bg-stone-100 dark:bg-zinc-800 rounded-full overflow-hidden relative">
                      <motion.div 
                        className="h-full bg-emerald-500 rounded-full shadow-[0_0_10px_rgba(16,185,129,0.5)]"
                        initial={{ width: 0 }}
                        animate={{ width: `${audioProgress}%` }}
                      />
                    </div>
                    <div className="flex justify-between text-[11px] text-stone-500 font-mono font-medium">
                      <span>{Math.floor((audioProgress / 100 * (prayerAudioRef.current?.duration || 0)) / 60)}:{(Math.floor((audioProgress / 100 * (prayerAudioRef.current?.duration || 0)) % 60)).toString().padStart(2, '0')}</span>
                      <span>{Math.floor((prayerAudioRef.current?.duration || 0) / 60)}:{(Math.floor((prayerAudioRef.current?.duration || 0) % 60)).toString().padStart(2, '0')}</span>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <button 
                    onClick={() => {
                      if (prayerAudio) {
                        const link = document.createElement('a');
                        link.href = prayerAudio;
                        link.download = 'oracao.mp3';
                        document.body.appendChild(link);
                        link.click();
                        document.body.removeChild(link);
                      }
                    }} 
                    className="py-3 bg-stone-100 dark:bg-zinc-800 text-stone-600 dark:text-zinc-300 font-bold rounded-2xl hover:bg-stone-200 flex items-center justify-center gap-2 text-xs transition-all"
                  >
                    <Download size={16} /> Baixar
                  </button>
                  
                  <button 
                    onClick={async () => {
                      await share({
                        title: 'Minha Oração',
                        text: 'Ouça esta oração que gerei.',
                        url: prayerAudio || ''
                      });
                    }} 
                    className="py-3 bg-stone-100 dark:bg-zinc-800 text-stone-600 dark:text-zinc-300 font-bold rounded-2xl hover:bg-stone-200 flex items-center justify-center gap-2 text-xs transition-all"
                  >
                    <Share2 size={16} /> Compartilhar
                  </button>
                  
                  <button 
                    onClick={async () => {
                      if (prayerAudio) {
                        try {
                          await saveTrack('Oração Gerada', 'Oração', prayerAudio, 'Oração', 'Inspiradora');
                          showToast("Áudio salvo na Coletânea! 🎵", 'success');
                        } catch (saveError) {
                          console.error("Error saving to audio box:", saveError);
                          showToast("Erro ao salvar áudio.", 'error');
                        }
                      }
                    }}
                    className="py-3 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 font-bold rounded-2xl hover:bg-emerald-100 dark:hover:bg-emerald-900/30 flex items-center justify-center gap-2 text-xs transition-all"
                  >
                    <Volume2 size={16} /> Salvar
                  </button>
                </div>
              </div>

              <audio 
                ref={prayerAudioRef}
                src={prayerAudio}
                autoPlay
                onTimeUpdate={(e) => {
                  const progress = (e.currentTarget.currentTime / e.currentTarget.duration) * 100;
                  setAudioProgress(progress);
                }}
                onEnded={() => {
                  setIsPlayingPrayer(false);
                  setTimeout(() => {
                    if (bgMusicRef.current) {
                      const audio = bgMusicRef.current;
                      const fadeDuration = 2000; // 2 seconds
                      const steps = 20;
                      const stepTime = fadeDuration / steps;
                      const volumeStep = audio.volume / steps;

                      const fadeInterval = setInterval(() => {
                        if (audio.volume > volumeStep) {
                          audio.volume -= volumeStep;
                        } else {
                          audio.pause();
                          audio.currentTime = 0;
                          audio.volume = 0.4; // Reset to original volume
                          clearInterval(fadeInterval);
                        }
                      }, stepTime);
                    }
                  }, 3000);
                }}
                onPlay={() => setIsPlayingPrayer(true)}
                onPause={() => setIsPlayingPrayer(false)}
                className="hidden"
              />
            </motion.div>
          )}
          <audio ref={bgMusicRef} src="https://firebasestorage.googleapis.com/v0/b/imersao-biblica-ia.firebasestorage.app/o/meditao-luz-das-estrelas.mp3?alt=media" loop />

      {/* Theme Selection */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
        {THEMES.map((theme) => (
          <button
            key={theme.id}
            onClick={() => setSelectedTheme(theme.id)}
            className={`flex flex-col items-center gap-2 p-4 rounded-2xl border transition-all ${
              selectedTheme === theme.id 
                ? `${theme.color} text-white border-transparent shadow-lg scale-105` 
                : 'bg-app-surface border-app-border text-app-muted hover:border-emerald-300'
            }`}
          >
            <div className={`p-2 rounded-xl ${selectedTheme === theme.id ? 'bg-white/20' : 'bg-stone-50 dark:bg-zinc-800'}`}>
              {theme.icon}
            </div>
            <span className="text-[10px] font-bold uppercase tracking-wider">{theme.label}</span>
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Calendar */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-app-surface p-6 rounded-[2.5rem] border border-app-border shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-bold text-lg flex items-center gap-2">
                <CalendarIcon size={20} className="text-emerald-600" />
                {currentDate.toLocaleString('pt-BR', { month: 'long', year: 'numeric' }).toUpperCase()}
              </h3>
              <div className="flex gap-2">
                <button 
                  onClick={handlePrevMonth} 
                  className="p-2 hover:bg-emerald-100 dark:hover:bg-emerald-900/50 rounded-full text-emerald-600 transition-colors"
                  aria-label="Mês anterior"
                >
                  <ChevronLeft size={20} />
                </button>
                <button 
                  onClick={handleNextMonth} 
                  className="p-2 hover:bg-emerald-100 dark:hover:bg-emerald-900/50 rounded-full text-emerald-600 transition-colors"
                  aria-label="Próximo mês"
                >
                  <ChevronRight size={20} />
                </button>
              </div>
            </div>

            <div className="grid grid-cols-7 gap-2 text-center">
              {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map(d => (
                <div key={d} className="text-[10px] font-bold text-stone-400 uppercase py-2">{d}</div>
              ))}
              {[...Array(firstDayOfMonth)].map((_, i) => (
                <div key={`empty-${i}`} />
              ))}
              {[...Array(daysInMonth)].map((_, i) => {
                const day = i + 1;
                const isToday = day === new Date().getDate() && currentDate.getMonth() === new Date().getMonth() && currentDate.getFullYear() === new Date().getFullYear();
                const dayStr = String(day).padStart(2, '0');
                const monthStr = String(currentDate.getMonth() + 1).padStart(2, '0');
                const book = DEVOTIONAL_MATRIX[`${dayStr}/${monthStr}`];
                
                return (
                  <button
                    key={day}
                    onClick={() => generateDevotional(day)}
                    title={book ? `Leitura: ${book}` : undefined}
                    className={`aspect-square flex flex-col items-center justify-center rounded-xl text-sm font-bold transition-all relative group ${
                      isToday 
                        ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/20 ring-2 ring-emerald-200' 
                        : 'hover:bg-emerald-50 dark:hover:bg-emerald-900/20 text-stone-700 dark:text-zinc-300'
                    }`}
                  >
                    {day}
                    {isToday && (
                      <div className="absolute top-1 right-1 w-1.5 h-1.5 bg-white rounded-full" />
                    )}
                    {book && (
                      <div className="absolute -bottom-1 w-1 h-1 rounded-full bg-amber-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {selectedTheme && (
            <div className="bg-app-surface p-6 rounded-3xl border border-app-border shadow-sm">
              <h4 className="text-sm font-bold text-stone-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                <BookOpen size={16} />
                Leitura do Dia
              </h4>
              <p className="text-lg font-bold text-emerald-700 dark:text-emerald-400">
                {DEVOTIONAL_MATRIX[`${String(new Date().getDate()).padStart(2, '0')}/${String(new Date().getMonth() + 1).padStart(2, '0')}`] || "Bíblia Sagrada"}
              </p>
              <p className="text-xs text-stone-500 mt-1">Base para a meditação de hoje.</p>
            </div>
          )}

          <div className="bg-emerald-50 dark:bg-emerald-900/10 p-6 rounded-3xl border border-emerald-100 dark:border-emerald-900/20">
            <p className="text-sm text-emerald-800 dark:text-emerald-300 leading-relaxed italic">
              "Lâmpada para os meus pés é tua palavra, e luz para o meu caminho." - Salmos 119:105
            </p>
          </div>
        </div>

        {/* Result Area - Shows placeholder, result is in modal */}
        <div className="lg:col-span-7">
          <div className="h-full min-h-[400px] flex flex-col items-center justify-center bg-stone-50/50 dark:bg-zinc-800/20 rounded-[2.5rem] border border-dashed border-stone-200 dark:border-zinc-800 p-12 text-center">
            <Sparkles size={48} className="text-stone-200 mb-6" />
            <h4 className="text-xl font-bold mb-2">Selecione um dia no calendário</h4>
            <p className="text-stone-500 max-w-xs">Escolha um tema acima e clique em um dia para receber sua palavra diária.</p>
          </div>
        </div>
      </div>

      {/* Series Modal */}
      <AnimatePresence>
        {isSeriesModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-white dark:bg-zinc-900 w-full max-w-4xl max-h-[90vh] rounded-[2.5rem] overflow-hidden shadow-2xl border border-stone-200 dark:border-zinc-800 flex flex-col"
            >
              <div className="p-6 border-b border-stone-100 dark:border-zinc-800 flex justify-between items-center bg-stone-50 dark:bg-zinc-800/50">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-amber-500 text-white rounded-xl">
                    <ChallengeIcon size={20} />
                  </div>
                  <div>
                    <h3 className="font-bold">Devocional em Série</h3>
                    <p className="text-xs text-stone-500">Gere mensagens para o mês inteiro</p>
                  </div>
                </div>
                <button onClick={() => setIsSeriesModalOpen(false)} className="p-2 hover:bg-stone-200 dark:hover:bg-zinc-700 rounded-full transition-colors">
                  <X size={24} />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-8 space-y-6">
                {!seriesResult && !isGeneratingSeries && (
                  <div className="text-center space-y-6 py-12">
                    <div className="w-20 h-20 bg-amber-100 dark:bg-amber-900/30 text-amber-600 rounded-3xl flex items-center justify-center mx-auto">
                      <CalendarIcon size={40} />
                    </div>
                    <div className="space-y-4">
                      <h4 className="text-xl font-bold">Pronto para gerar sua série mensal?</h4>
                      <p className="text-stone-500 max-w-md mx-auto">
                        Esta ferramenta irá gerar uma série completa de devocionais baseada no tema selecionado: 
                        <span className="font-bold text-emerald-600 ml-1">{selectedTheme || 'Nenhum tema selecionado'}</span>
                      </p>
                      
                      <div className="max-w-xs mx-auto text-left space-y-2">
                        <label className="block text-sm font-bold text-stone-700 dark:text-zinc-300">
                          Selecione o Mês:
                        </label>
                        <select
                          value={seriesSelectedMonth}
                          onChange={(e) => setSeriesSelectedMonth(Number(e.target.value))}
                          className="w-full p-4 bg-stone-50 dark:bg-zinc-800/50 border border-stone-200 dark:border-zinc-700 rounded-2xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all font-medium"
                        >
                          {Array.from({ length: 12 }, (_, i) => {
                            const date = new Date(currentDate.getFullYear(), i, 1);
                            return (
                              <option key={i} value={i}>
                                {date.toLocaleString('pt-BR', { month: 'long' }).charAt(0).toUpperCase() + date.toLocaleString('pt-BR', { month: 'long' }).slice(1)}
                              </option>
                            );
                          })}
                        </select>
                      </div>
                    </div>
                    <button 
                      onClick={generateSeriesDevotional}
                      disabled={!selectedTheme}
                      className="px-8 py-4 bg-emerald-600 text-white font-bold rounded-2xl hover:bg-emerald-700 disabled:opacity-50 shadow-lg shadow-emerald-600/20 transition-all mt-4"
                    >
                      Gerar Série Mensal
                    </button>
                  </div>
                )}

                {isGeneratingSeries && (
                  <div className="flex flex-col items-center justify-center py-20 space-y-6">
                    <Loader2 className="animate-spin text-emerald-600" size={64} />
                    <div className="text-center space-y-2">
                      <h4 className="text-xl font-bold">Gerando Série de Devocionais...</h4>
                      <p className="text-stone-500 animate-pulse">Buscando inspiração para cada dia do mês.</p>
                    </div>
                  </div>
                )}

                {seriesResult && (
                  <div className="prose dark:prose-invert max-w-none">
                    <MarkdownRenderer content={seriesResult} />
                  </div>
                )}
              </div>

              {seriesResult && (
                <div className="p-6 border-t border-stone-100 dark:border-zinc-800 bg-stone-50 dark:bg-zinc-800/50 flex justify-end gap-3">
                  <button 
                    onClick={() => {
                      const element = document.createElement("a");
                      const file = new Blob([seriesResult], {type: 'text/plain'});
                      element.href = URL.createObjectURL(file);
                      element.download = `serie-devocional-${selectedTheme}-${seriesSelectedMonth + 1}.txt`;
                      document.body.appendChild(element);
                      element.click();
                    }}
                    className="px-6 py-3 bg-white dark:bg-zinc-800 border border-stone-200 dark:border-zinc-800 text-stone-600 dark:text-zinc-300 font-bold rounded-xl hover:bg-stone-100 flex items-center gap-2"
                  >
                    <Download size={18} /> Baixar Texto
                  </button>
                  <button 
                    onClick={saveSeriesToNotebook}
                    className="px-6 py-3 bg-emerald-600 text-white font-bold rounded-xl hover:bg-emerald-700 flex items-center gap-2 shadow-lg shadow-emerald-600/20"
                  >
                    <Save size={18} /> Salvar no Caderno
                  </button>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Favorites Section */}
      {favorites.length > 0 && (
        <section className="space-y-6">
          <h3 className="text-2xl font-bold flex items-center gap-2">
            <BookmarkCheck className="text-rose-500" />
            Meus Favoritos
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {favorites.map((fav) => (
              <motion.div
                key={fav.id}
                layout
                className="bg-app-surface p-6 rounded-3xl border border-app-border shadow-sm relative group"
              >
                <button 
                  onClick={() => toggleFavorite(fav.content)}
                  className="absolute top-4 right-4 text-rose-500 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X size={18} />
                </button>
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-stone-400">
                    <span>{fav.theme}</span>
                    <span>•</span>
                    <span>{fav.date}</span>
                  </div>
                  <div className="line-clamp-4 text-sm text-stone-600 dark:text-zinc-400">
                    <MarkdownRenderer content={fav.content} />
                  </div>
                  <button 
                    onClick={() => setDevotionalResult(fav.content)}
                    className="text-emerald-600 font-bold text-xs hover:underline"
                  >
                    Ler completo
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        </section>
      )}
      </>
      ) : activeTab === 'journal' ? (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <header className="text-center space-y-4 relative">
            <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 rounded-2xl flex items-center justify-center mx-auto shadow-lg">
              <BookOpen size={32} />
            </div>
            <h2 className="text-3xl font-display font-bold">Caderno de Oração</h2>
            <p className="text-stone-500 dark:text-zinc-400 max-w-2xl mx-auto">
              Registre seus pedidos de oração, agradecimentos e reflexões pessoais.
            </p>
            
            <div className="flex justify-center pt-4">
              <button
                onClick={handleReceiveWord}
                disabled={isReceivingWord}
                className="px-6 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-bold rounded-xl hover:from-emerald-700 hover:to-teal-700 transition-all shadow-lg shadow-emerald-600/20 flex items-center gap-2 disabled:opacity-50"
              >
                {isReceivingWord ? (
                  <Loader2 size={20} className="animate-spin" />
                ) : (
                  <Mic size={20} />
                )}
                Receber Palavra
              </button>
            </div>
            
            {receivedWordAudio && (
              <div className="mt-4 bg-emerald-50 dark:bg-emerald-900/20 p-4 rounded-2xl max-w-md mx-auto flex items-center justify-between border border-emerald-100 dark:border-emerald-800/30">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-emerald-100 dark:bg-emerald-800/50 rounded-full flex items-center justify-center text-emerald-600">
                    <Volume2 size={20} />
                  </div>
                  <div className="text-left">
                    <p className="text-sm font-bold text-emerald-900 dark:text-emerald-400">Palavra Recebida</p>
                    <p className="text-xs text-emerald-600 dark:text-emerald-500">Ouça a mensagem gerada</p>
                  </div>
                </div>
                <audio controls src={receivedWordAudio} className="h-8 w-32" />
              </div>
            )}
          </header>

          <div className="bg-white dark:bg-zinc-900 rounded-3xl p-6 shadow-xl border border-stone-200 dark:border-zinc-800">
            <div className="space-y-4">
              <textarea
                value={newJournalEntry}
                onChange={(e) => setNewJournalEntry(e.target.value)}
                placeholder="Escreva seu pedido de oração, agradecimento ou reflexão..."
                className="w-full h-32 p-4 rounded-2xl border border-stone-200 dark:border-zinc-700 bg-stone-50 dark:bg-zinc-800 resize-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
              />
              <div className="flex justify-end">
                <button
                  onClick={handleAddJournalEntry}
                  disabled={!newJournalEntry.trim()}
                  className="px-6 py-3 bg-emerald-600 text-white font-bold rounded-xl hover:bg-emerald-700 transition-all disabled:opacity-50 flex items-center gap-2"
                >
                  <Plus size={20} />
                  Adicionar Entrada
                </button>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-bold flex items-center gap-2">
                <FileText className="text-emerald-600" />
                Suas Entradas
              </h3>
              
              <div className="flex gap-2">
                {['Atendida', 'Pedir mais', 'Agradecer'].map(tag => (
                  <button
                    key={tag}
                    onClick={() => setSelectedTagFilter(selectedTagFilter === tag ? null : tag)}
                    className={cn(
                      "px-3 py-1.5 rounded-full text-xs font-bold transition-all",
                      selectedTagFilter === tag 
                        ? "bg-emerald-600 text-white shadow-md shadow-emerald-600/20" 
                        : "bg-stone-100 text-stone-600 hover:bg-stone-200 dark:bg-zinc-800 dark:text-zinc-400 dark:hover:bg-zinc-700"
                    )}
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>
            
            {isJournalLoading ? (
              <div className="flex justify-center py-12">
                <Loader2 className="animate-spin text-emerald-600" size={32} />
              </div>
            ) : journalEntries.length === 0 ? (
              <div className="text-center py-12 bg-stone-50 dark:bg-zinc-800/50 rounded-3xl border border-stone-200 dark:border-zinc-800">
                <BookOpen size={48} className="mx-auto text-stone-300 dark:text-zinc-600 mb-4" />
                <p className="text-stone-500 dark:text-zinc-400">Nenhuma entrada ainda. Comece seu diário de oração!</p>
              </div>
            ) : (
              <div className="grid gap-4">
                {journalEntries.filter(entry => !selectedTagFilter || (entry.tags && entry.tags.includes(selectedTagFilter))).map((entry) => (
                  <div key={entry.id} className="bg-white dark:bg-zinc-900 p-6 rounded-2xl shadow-sm border border-stone-200 dark:border-zinc-800 space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-stone-500 dark:text-zinc-400 font-medium">
                        {entry.createdAt?.toDate ? entry.createdAt.toDate().toLocaleString('pt-BR', { dateStyle: 'long', timeStyle: 'short' }) : new Date().toLocaleString('pt-BR', { dateStyle: 'long', timeStyle: 'short' })}
                      </span>
                      <div className="flex items-center gap-2">
                        {editingJournalId === entry.id ? (
                          <>
                            <button
                              onClick={() => handleUpdateJournalEntry(entry.id)}
                              className="p-2 text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 rounded-lg transition-colors"
                              title="Salvar"
                            >
                              <Save size={18} />
                            </button>
                            <button
                              onClick={() => {
                                setEditingJournalId(null);
                                setEditJournalContent('');
                              }}
                              className="p-2 text-stone-400 hover:bg-stone-100 dark:hover:bg-zinc-800 rounded-lg transition-colors"
                              title="Cancelar"
                            >
                              <X size={18} />
                            </button>
                          </>
                        ) : (
                          <>
                            <button
                              onClick={() => {
                                setEditingJournalId(entry.id);
                                setEditJournalContent(entry.content);
                              }}
                              className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                              title="Editar"
                            >
                              <Edit size={18} />
                            </button>
                            <button
                              onClick={() => setEntryToDelete(entry.id)}
                              className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                              title="Excluir"
                            >
                              <Trash2 size={18} />
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                    
                    {editingJournalId === entry.id ? (
                      <textarea
                        value={editJournalContent}
                        onChange={(e) => setEditJournalContent(e.target.value)}
                        className="w-full h-32 p-4 rounded-xl border border-stone-200 dark:border-zinc-700 bg-stone-50 dark:bg-zinc-800 resize-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                      />
                    ) : (
                      <div className="space-y-4">
                        <p className={cn(
                          "text-stone-700 dark:text-zinc-300 whitespace-pre-wrap leading-relaxed",
                          entry.tags?.includes('Atendida') && "line-through text-stone-400 dark:text-zinc-500"
                        )}>
                          {entry.content}
                        </p>
                        
                        <div className="flex flex-wrap gap-2 pt-2 border-t border-stone-100 dark:border-zinc-800/50">
                          <button
                            onClick={() => handleToggleTag(entry.id, 'Atendida', entry.tags)}
                            className={cn(
                              "px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors",
                              entry.tags?.includes('Atendida')
                                ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400" 
                                : "bg-stone-100 text-stone-600 hover:bg-emerald-50 hover:text-emerald-600 dark:bg-zinc-800 dark:text-zinc-400 dark:hover:bg-emerald-900/20 dark:hover:text-emerald-400"
                            )}
                          >
                            <CheckCircle size={14} />
                            {entry.tags?.includes('Atendida') ? 'Atendida' : 'Marcar Atendida'}
                          </button>
                          
                          <button
                            onClick={() => handleToggleTag(entry.id, 'Pedir mais', entry.tags)}
                            className={cn(
                              "px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors",
                              entry.tags?.includes('Pedir mais')
                                ? "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400"
                                : "bg-stone-100 text-stone-600 hover:bg-blue-50 hover:text-blue-600 dark:bg-zinc-800 dark:text-zinc-400 dark:hover:bg-blue-900/20 dark:hover:text-blue-400"
                            )}
                          >
                            <MessageSquarePlus size={14} />
                            Pedir mais
                          </button>
                          
                          <button
                            onClick={() => handleToggleTag(entry.id, 'Agradecer', entry.tags)}
                            className={cn(
                              "px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors",
                              entry.tags?.includes('Agradecer')
                                ? "bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400"
                                : "bg-stone-100 text-stone-600 hover:bg-rose-50 hover:text-rose-600 dark:bg-zinc-800 dark:text-zinc-400 dark:hover:bg-rose-900/20 dark:hover:text-rose-400"
                            )}
                          >
                            <HeartHandshake size={14} />
                            Agradecer
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <header className="text-center space-y-4">
            <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 rounded-2xl flex items-center justify-center mx-auto shadow-lg">
              <CalendarIcon size={32} />
            </div>
            <h2 className="text-3xl font-display font-bold">Plano de Leitura</h2>
            <p className="text-stone-500 dark:text-zinc-400 max-w-2xl mx-auto">
              Acompanhe sua jornada através das Escrituras com um plano personalizado.
            </p>
          </header>

          {isReadingPlanLoading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="animate-spin text-emerald-600" size={32} />
            </div>
          ) : !activeReadingPlan ? (
            <div className="text-center py-12 bg-stone-50 dark:bg-zinc-800/50 rounded-3xl border border-stone-200 dark:border-zinc-800">
              <Book size={48} className="mx-auto text-stone-300 dark:text-zinc-600 mb-4" />
              <h3 className="text-xl font-bold mb-2">Você ainda não tem um plano</h3>
              <p className="text-stone-500 dark:text-zinc-400 mb-8">Escolha um plano para começar sua jornada de leitura hoje.</p>
              
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-3xl mx-auto px-4">
                <button 
                  onClick={() => handleCreatePlan('chronological')}
                  className="p-6 bg-white dark:bg-zinc-900 rounded-2xl border border-stone-200 dark:border-zinc-800 hover:border-emerald-500 transition-all group"
                >
                  <div className="w-12 h-12 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 rounded-xl flex items-center justify-center mb-4 mx-auto group-hover:scale-110 transition-transform">
                    <RotateCw size={24} />
                  </div>
                  <h4 className="font-bold mb-2">Cronológico</h4>
                  <p className="text-xs text-stone-500">Leia a Bíblia na ordem em que os eventos ocorreram.</p>
                </button>

                <button 
                  onClick={() => handleCreatePlan('thematic')}
                  className="p-6 bg-white dark:bg-zinc-900 rounded-2xl border border-stone-200 dark:border-zinc-800 hover:border-emerald-500 transition-all group"
                >
                  <div className="w-12 h-12 bg-blue-50 dark:bg-blue-900/20 text-blue-600 rounded-xl flex items-center justify-center mb-4 mx-auto group-hover:scale-110 transition-transform">
                    <Sparkles size={24} />
                  </div>
                  <h4 className="font-bold mb-2">Temático</h4>
                  <p className="text-xs text-stone-500">Explore temas específicos e como eles se conectam.</p>
                </button>

                <button 
                  onClick={() => handleCreatePlan('testament')}
                  className="p-6 bg-white dark:bg-zinc-900 rounded-2xl border border-stone-200 dark:border-zinc-800 hover:border-emerald-500 transition-all group"
                >
                  <div className="w-12 h-12 bg-purple-50 dark:bg-purple-900/20 text-purple-600 rounded-xl flex items-center justify-center mb-4 mx-auto group-hover:scale-110 transition-transform">
                    <BookOpen size={24} />
                  </div>
                  <h4 className="font-bold mb-2">Por Testamento</h4>
                  <p className="text-xs text-stone-500">Alterne entre o Antigo e o Novo Testamento.</p>
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-8">
              {/* Progress Card */}
              <div className="bg-white dark:bg-zinc-900 p-8 rounded-[2.5rem] shadow-xl border border-stone-200 dark:border-zinc-800">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="px-3 py-1 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 text-[10px] font-bold uppercase tracking-widest rounded-full">
                        Plano {activeReadingPlan.planType === 'chronological' ? 'Cronológico' : activeReadingPlan.planType === 'thematic' ? 'Temático' : 'Por Testamento'}
                      </span>
                    </div>
                    <h3 className="text-2xl font-bold">Seu Progresso</h3>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="text-2xl font-bold text-emerald-600">
                        {Math.round((activeReadingPlan.completedDays.length / 365) * 100)}%
                      </p>
                      <p className="text-[10px] text-stone-400 font-bold uppercase tracking-wider">Concluído</p>
                    </div>
                    <div className="w-16 h-16 rounded-full border-4 border-stone-100 dark:border-zinc-800 flex items-center justify-center relative">
                      <svg className="w-full h-full -rotate-90">
                        <circle
                          cx="32"
                          cy="32"
                          r="28"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="4"
                          className="text-emerald-500"
                          strokeDasharray={175.9}
                          strokeDashoffset={175.9 - (175.9 * (activeReadingPlan.completedDays.length / 365))}
                        />
                      </svg>
                      <span className="absolute text-[10px] font-bold">{activeReadingPlan.completedDays.length}/365</span>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-4">
                    <h4 className="font-bold flex items-center gap-2">
                      <CalendarIcon size={18} className="text-emerald-600" />
                      Leitura de Hoje (Dia {activeReadingPlan.currentDay})
                    </h4>
                    <div className="p-6 bg-stone-50 dark:bg-zinc-800/50 rounded-2xl border border-stone-100 dark:border-zinc-800">
                      <p className="text-lg font-bold text-stone-800 dark:text-zinc-100 mb-2">
                        {/* This would ideally come from a real plan data source */}
                        Gênesis 1-3
                      </p>
                      <p className="text-sm text-stone-500 leading-relaxed">
                        Comece sua jornada hoje mergulhando no relato da criação e nos primeiros passos da humanidade.
                      </p>
                      <button 
                        onClick={() => handleToggleDay(activeReadingPlan.currentDay)}
                        className={cn(
                          "w-full mt-6 py-3 rounded-xl font-bold transition-all flex items-center justify-center gap-2",
                          activeReadingPlan.completedDays.includes(activeReadingPlan.currentDay)
                            ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400"
                            : "bg-emerald-600 text-white hover:bg-emerald-700 shadow-lg shadow-emerald-600/20"
                        )}
                      >
                        {activeReadingPlan.completedDays.includes(activeReadingPlan.currentDay) ? (
                          <>
                            <CheckCircle size={20} />
                            Concluído
                          </>
                        ) : (
                          "Marcar como Lido"
                        )}
                      </button>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h4 className="font-bold flex items-center gap-2">
                      <ChallengeIcon size={18} className="text-amber-500" />
                      Configurações do Plano
                    </h4>
                    <div className="p-6 bg-stone-50 dark:bg-zinc-800/50 rounded-2xl border border-stone-100 dark:border-zinc-800 space-y-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-bold text-sm">Lembretes Diários</p>
                          <p className="text-[10px] text-stone-500">Receba uma notificação para ler</p>
                        </div>
                        <button 
                          onClick={handleToggleReminders}
                          className={cn(
                            "w-12 h-6 rounded-full transition-colors relative",
                            activeReadingPlan.remindersEnabled ? "bg-emerald-500" : "bg-stone-300 dark:bg-zinc-700"
                          )}
                        >
                          <motion.div 
                            className="absolute top-1 left-1 w-4 h-4 bg-white rounded-full shadow-sm"
                            animate={{ x: activeReadingPlan.remindersEnabled ? 24 : 0 }}
                          />
                        </button>
                      </div>

                      {activeReadingPlan.remindersEnabled && (
                        <div className="flex items-center justify-between pt-4 border-t border-stone-200 dark:border-zinc-700">
                          <p className="font-bold text-sm">Horário</p>
                          <input 
                            type="time" 
                            value={activeReadingPlan.reminderTime}
                            onChange={(e) => handleUpdateReminderTime(e.target.value)}
                            className="bg-white dark:bg-zinc-900 border border-stone-200 dark:border-zinc-700 rounded-lg px-2 py-1 text-sm font-bold"
                          />
                        </div>
                      )}

                      <button 
                        onClick={() => setShowPlanSelector(true)}
                        className="w-full py-2 text-xs text-stone-500 hover:text-emerald-600 transition-colors font-bold flex items-center justify-center gap-1"
                      >
                        <RotateCcw size={14} /> Alterar Plano de Leitura
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Calendar View for Progress */}
              <div className="bg-white dark:bg-zinc-900 p-8 rounded-[2.5rem] shadow-xl border border-stone-200 dark:border-zinc-800">
                <h3 className="text-xl font-bold mb-6">Histórico de Leitura</h3>
                <div className="grid grid-cols-7 sm:grid-cols-10 md:grid-cols-15 lg:grid-cols-20 gap-2">
                  {[...Array(365)].map((_, i) => {
                    const day = i + 1;
                    const isCompleted = activeReadingPlan.completedDays.includes(day);
                    const isCurrent = day === activeReadingPlan.currentDay;
                    
                    return (
                      <button
                        key={day}
                        onClick={() => handleToggleDay(day)}
                        className={cn(
                          "aspect-square rounded-lg text-[10px] font-bold transition-all flex items-center justify-center border",
                          isCompleted 
                            ? "bg-emerald-500 border-emerald-600 text-white shadow-sm" 
                            : isCurrent
                              ? "bg-amber-50 border-amber-200 text-amber-600 animate-pulse"
                              : "bg-stone-50 dark:bg-zinc-800 border-stone-100 dark:border-zinc-700 text-stone-400"
                        )}
                        title={`Dia ${day}`}
                      >
                        {day}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </div>
      )}
      </>
      )}

      <footer className="mt-12 pt-8 border-t border-stone-200 dark:border-zinc-800 text-center space-y-4">
        <div className="bg-stone-100 dark:bg-zinc-800/50 p-6 rounded-3xl inline-block max-w-2xl">
          <h4 className="font-bold text-emerald-700 dark:text-emerald-400 mb-2 flex items-center justify-center gap-2">
            <BookOpen size={18} />
            Leitura Recomendada da Semana
          </h4>
          <p className="text-sm text-stone-600 dark:text-zinc-400">
            Além da Bíblia Sagrada, recomendamos a leitura de obras clássicas e contemporâneas que aprofundam nossa visão missionária e teológica. 
            Cada dia do ano possui uma indicação especial baseada em grandes autores como Rick Warren, John Piper, Ronaldo Lidório e muitos outros.
          </p>
        </div>
        <p className="text-xs text-stone-400">
          Consulte o calendário para ver o livro base de cada dia.
        </p>
      </footer>

      <div className="max-w-4xl mx-auto px-4">
        <PrayerRequestsSection />
      </div>

      {/* Full-screen Loading Overlay */}
      <AnimatePresence>
        {isLoading && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative bg-white dark:bg-zinc-900 p-8 rounded-3xl shadow-2xl flex flex-col items-center space-y-6 max-w-sm w-full z-10"
            >
               <Book className="animate-spin text-emerald-600" size={64} />
               <div className="text-center space-y-2">
                 <h4 className="text-xl font-bold">Buscando Inspiração...</h4>
                 <p className="text-stone-500 animate-pulse">Preparando uma palavra especial para o seu coração.</p>
               </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Devotional Result Modal */}
      <AnimatePresence>
        {devotionalResult && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-0 sm:p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setDevotionalResult(null)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-amber-50 dark:bg-stone-900 w-full h-full sm:max-w-5xl sm:h-[95vh] sm:rounded-[2.5rem] overflow-hidden shadow-2xl border border-amber-200/50 dark:border-stone-800 flex flex-col relative z-10"
            >
              <div className="p-6 border-b border-amber-200/50 dark:border-stone-800 flex justify-between items-center bg-amber-100/50 dark:bg-stone-800/50">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-emerald-600 text-white rounded-xl">
                    <BookOpen size={20} />
                  </div>
                  <span className="font-bold text-sm">Devocional: {selectedTheme}</span>
                </div>
                <div className="flex gap-2">
                  <button 
                    onClick={() => setIsReadingMode(!isReadingMode)}
                    className={cn("p-2 rounded-full transition-colors", isReadingMode ? "bg-emerald-100 text-emerald-700" : "hover:bg-stone-200 dark:hover:bg-zinc-700")}
                    title="Modo Leitura"
                  >
                    <BookOpen size={20} />
                  </button>
                  <button 
                    onClick={() => toggleFavorite(devotionalResult)} 
                    className={cn(
                      "p-2 rounded-full transition-colors",
                      favorites.some(f => f.content === devotionalResult)
                        ? "text-rose-500 bg-rose-50 dark:bg-rose-900/20"
                        : "hover:bg-stone-200 dark:hover:bg-zinc-700"
                    )}
                    title="Favoritar"
                  >
                    {favorites.some(f => f.content === devotionalResult) ? <BookmarkCheck size={20} /> : <Bookmark size={20} />}
                  </button>
                  <button onClick={handlePrint} className="p-2 hover:bg-stone-200 dark:hover:bg-zinc-700 rounded-full transition-colors" title="Imprimir"><Printer size={20} /></button>
                  <button onClick={() => setDevotionalResult(null)} className="p-2 hover:bg-stone-200 dark:hover:bg-zinc-700 rounded-full transition-colors" title="Fechar"><X size={20} /></button>
                </div>
              </div>
              
              <div 
                className={cn("flex-1 p-6 sm:p-10 overflow-y-auto custom-scrollbar", isReadingMode && "max-w-3xl mx-auto")}
                style={isReadingMode ? { fontSize: `${readingFontSize}px`, lineHeight: readingLineHeight } : {}}
              >
                <MarkdownRenderer content={devotionalResult} />
                
                <div className="mt-12 pt-12 border-t border-stone-100 dark:border-zinc-800">
                  <FeedbackSection page="Devocional" context={selectedTheme || ''} />
                </div>
              </div>

              <div className="p-6 border-t border-amber-200/50 dark:border-stone-800 bg-amber-100/50 dark:bg-stone-800/50 flex flex-col gap-4">
                <div className="flex flex-wrap gap-3 items-center">
                  <div className="flex gap-2 mr-auto">
                    <ShareButtons 
                      title={`Devocional: ${selectedTheme}`} 
                      text={devotionalResult || ''} 
                    />
                  </div>
                  
                  <div className="flex gap-2">
                    <button 
                      onClick={handlePlayAudio}
                      disabled={isGeneratingNarration}
                      className="px-4 py-2 bg-amber-500 text-white font-bold rounded-xl hover:bg-amber-600 flex items-center gap-2 text-xs disabled:opacity-50"
                    >
                      {isGeneratingNarration ? <Loader2 size={16} className="animate-spin" /> : <Volume2 size={16} />}
                      Narração Emotiva
                    </button>
                  </div>
                </div>

                {narrationAudio && (
                  <div className="w-full bg-app-surface p-4 rounded-2xl border border-app-border shadow-sm">
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
                        {isPlaying ? <X size={20} /> : <Volume2 size={20} />}
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
                          a.download = `devocional-audio-${selectedTheme}.mp3`;
                          a.click();
                        }}
                        className="flex-1 py-2 text-[10px] bg-stone-100 dark:bg-zinc-800 text-stone-600 dark:text-zinc-300 font-bold rounded-lg hover:bg-stone-200 flex items-center justify-center gap-1"
                      >
                        <Download size={14} /> Baixar Áudio
                      </button>
                      <button 
                        onClick={async () => {
                          if (!narrationAudio) return;
                          
                          try {
                            // Try to share as file if supported
                            if (navigator.share && navigator.canShare) {
                              const response = await fetch(narrationAudio);
                              const blob = await response.blob();
                              const file = new File([blob], `devocional-${selectedTheme}.mp3`, { type: 'audio/mpeg' });
                              
                              if (navigator.canShare({ files: [file] })) {
                                await navigator.share({
                                  files: [file],
                                  title: 'Áudio Devocional',
                                  text: `Ouça o devocional de hoje: ${selectedTheme}`
                                });
                                return;
                              }
                            }
                            
                            // Fallback to text share
                            await share({
                              title: 'Áudio Devocional',
                              text: `Devocional de hoje: ${selectedTheme}. Ouça no Imersão Bíblica IA!`,
                            });
                          } catch (error) {
                            console.error("Error sharing audio:", error);
                            showToast("Erro ao compartilhar áudio.", "error");
                          }
                        }}
                        className="flex-1 py-2 text-[10px] bg-stone-100 dark:bg-zinc-800 text-stone-600 dark:text-zinc-300 font-bold rounded-lg hover:bg-stone-200 flex items-center justify-center gap-1"
                      >
                        <Share2 size={14} /> Compartilhar
                      </button>
                    </div>
                    <button 
                      onClick={handleSaveToAudioBox}
                      className="flex-1 py-2 text-xs bg-white dark:bg-zinc-900 border border-stone-200 dark:border-zinc-700 rounded-lg hover:bg-stone-50 dark:hover:bg-zinc-800 flex items-center justify-center gap-1"
                    >
                      <Volume2 size={14} /> Enviar para Coletânea
                    </button>
                  </div>
                )}

                <div className="flex flex-wrap gap-3">
                  <button onClick={handleDownload} className="flex-1 py-3 bg-white dark:bg-zinc-800 border border-stone-200 dark:border-zinc-700 text-stone-600 dark:text-zinc-300 font-bold rounded-xl hover:bg-stone-100 flex items-center justify-center gap-2 text-sm">
                    <Download size={18} /> Baixar Texto
                  </button>
                  <button onClick={saveToNotebook} className="flex-1 py-3 bg-emerald-600 text-white font-bold rounded-xl hover:bg-emerald-700 flex items-center justify-center gap-2 text-sm shadow-lg shadow-emerald-600/20">
                    <Save size={18} /> Salvar no Caderno
                  </button>
                  <button onClick={() => setDevotionalResult(null)} className="flex-1 py-3 bg-stone-200 dark:bg-zinc-700 text-stone-700 dark:text-zinc-200 font-bold rounded-xl hover:bg-stone-300 transition-all text-sm">
                    Retornar
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <SaveToNotebookModal
        isOpen={isNotebookModalOpen}
        isLoading={isSavingNote}
        onClose={() => setIsNotebookModalOpen(false)}
        onConfirm={confirmSaveToNotebook}
      />

      <AudioConfirmationModal
        isOpen={isAudioConfirmModalOpen}
        onClose={() => setIsAudioConfirmModalOpen(false)}
        onConfirm={confirmPlayAudio}
        isLoading={isAudioLoading}
      />

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {entryToDelete && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-white dark:bg-zinc-900 w-full max-w-sm rounded-3xl shadow-2xl p-6"
            >
              <h3 className="text-xl font-bold mb-4 text-stone-800 dark:text-zinc-100">Excluir Entrada</h3>
              <p className="text-stone-600 dark:text-zinc-400 mb-6">
                Tem certeza que deseja excluir esta entrada do seu caderno de oração? Esta ação não pode ser desfeita.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setEntryToDelete(null)}
                  className="flex-1 py-3 bg-stone-100 dark:bg-zinc-800 text-stone-700 dark:text-zinc-300 font-bold rounded-xl hover:bg-stone-200 dark:hover:bg-zinc-700 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleDeleteJournalEntry}
                  className="flex-1 py-3 bg-red-600 text-white font-bold rounded-xl hover:bg-red-700 transition-colors"
                >
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
