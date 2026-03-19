import React from 'react';
import { 
  FileText, 
  BookOpen, 
  ExternalLink, 
  Share2, 
  Instagram, 
  MessageCircle, 
  Facebook,
  ArrowRight,
  Sparkles,
  Heart,
  Upload,
  Image as ImageIcon,
  X,
  Brain,
  Zap,
  Newspaper,
  Youtube,
  Globe,
  Pencil,
  ArrowLeft,
  ChevronRight,
  Plus,
  Save,
  Trash2,
  Edit,
  Copy,
  Download,
  Book,
  Trophy,
  Library,
  MessageSquare,
  HeartHandshake,
  Mail,
  Search,
  StickyNote,
  HelpCircle,
  Volume2,
  Loader2,
  Info,
  GraduationCap
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useState, useRef, useEffect } from 'react';
import { cn } from '../types';
import { useAccessibility } from '../contexts/AccessibilityContext';
import { useAudioBox } from '../contexts/AudioBoxContext';
import { geminiService } from '../services/geminiService';
import { Type } from "@google/genai";
import { MarkdownRenderer } from '../components/MarkdownRenderer';
import NewsPage from './NewsPage';
import { useToast } from '../components/Toast';
import { getRandomWaitingMessage } from '../constants/waitingMessages';
import { SaveToNotebookModal } from '../components/SaveToNotebookModal';
import { AudioConfirmationModal } from '../components/AudioConfirmationModal';
import { useAuth } from '../contexts/AuthContext';
import { db } from '../lib/firebase';
import { collection, addDoc } from 'firebase/firestore';

import { AudioSearchButton } from '../components/AudioSearchButton';

interface HomePageProps {
  onNavigate: (tab: string) => void;
  deepThinking: boolean;
  setDeepThinking: (value: boolean) => void;
}

export default function HomePage({ onNavigate, deepThinking, setDeepThinking }: HomePageProps) {
  const { fontFamily, fontSize, lineHeight } = useAccessibility();
  const { saveTrack } = useAudioBox();
  const { showToast } = useToast();
  const { user, toggleFavorite } = useAuth();
  const [appSearchQuery, setAppSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<{ title: string, description: string, tab: string, type: 'page' | 'note' }[]>([]);
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [isNewsModalOpen, setIsNewsModalOpen] = useState(false);

  const getGreeting = () => {
    const hour = new Date().getHours();
    let timeGreeting = "Bom dia";
    if (hour >= 12 && hour < 18) timeGreeting = "Boa tarde";
    else if (hour >= 18) timeGreeting = "Boa noite";

    const userName = user?.name ? user.name.split(' ')[0] : 'Amigo(a)';
    return `${timeGreeting}, ${userName}! Que bom que voltou! Bons estudos.`;
  };

  const verses = [
    { text: "Pois eu bem sei os planos que tenho para vocês, diz o Senhor, planos de fazê-los prosperar e não de causar dano, planos de dar a vocês esperança e um futuro.", reference: "Jeremias 29:11" },
    { text: "O Senhor é o meu pastor; nada me faltará.", reference: "Salmos 23:1" },
    { text: "Tudo posso naquele que me fortalece.", reference: "Filipenses 4:13" },
    { text: "Porque Deus amou o mundo de tal maneira que deu o seu Filho unigênito, para que todo aquele que nele crê não pereça, mas tenha a vida eterna.", reference: "João 3:16" },
    { text: "O Senhor te abençoe e te guarde; o Senhor faça resplandecer o seu rosto sobre ti e tenha misericórdia de ti.", reference: "Números 6:24-25" },
    { text: "Mil cairão ao teu lado, e dez mil, à tua direita, mas tu não serás atingido.", reference: "Salmos 91:7" },
    { text: "Alegrem-se sempre no Senhor. Novamente direi: Alegrem-se!", reference: "Filipenses 4:4" },
    { text: "Deixo-lhes a paz; a minha paz lhes dou. Não lha dou como o mundo a dá. Não se perturbem os seus corações, nem tenham medo.", reference: "João 14:27" },
    { text: "O meu Deus suprirá todas as necessidades de vocês, de acordo com as suas gloriosas riquezas em Cristo Jesus.", reference: "Filipenses 4:19" },
    { text: "Lancem sobre ele toda a sua ansiedade, porque ele tem cuidado de vocês.", reference: "1 Pedro 5:7" },
    { text: "Sei que a tua bondade e a tua misericórdia me seguirão todos os dias da minha vida.", reference: "Salmos 23:6" },
    { text: "A tua palavra é lâmpada que ilumina os meus passos e luz que clareia o meu caminho.", reference: "Salmos 119:105" }
  ];

  const quickActions = [
    { id: 'devotional', label: 'Devocional', desc: 'Sua palavra diária.', icon: <Heart size={20} className="text-rose-600" />, color: 'bg-rose-50 dark:bg-rose-900/20 shadow-rose-100/50', image: 'https://images.unsplash.com/photo-1499209974431-9dac3adaf471?auto=format&fit=crop&q=80&w=400&h=300' },
    { id: 'bible', label: 'Bíblia Online', desc: 'Acesso imediato à Palavra.', icon: <BookOpen size={20} className="text-blue-600" />, color: 'bg-blue-50 dark:bg-blue-900/20 shadow-blue-100/50', onClick: () => window.open('https://www.bibliaonline.com.br/nvi', '_blank') },
    { id: 'study', label: 'Imersão', desc: 'Estudo bíblico profundo.', icon: <BookOpen size={20} className="text-blue-600" />, color: 'bg-blue-50 dark:bg-blue-900/20 shadow-blue-100/50', image: 'https://images.unsplash.com/photo-1504052434569-70ad5836ab65?auto=format&fit=crop&q=80&w=400&h=300' },
    { id: 'theology', label: 'Teologia', desc: 'Formação teológica.', icon: <GraduationCap size={20} className="text-emerald-600" />, color: 'bg-emerald-50 dark:bg-emerald-900/20 shadow-emerald-100/50', image: 'https://images.unsplash.com/photo-1504052434569-70ad5836ab65?auto=format&fit=crop&q=80&w=400&h=300' },
    { id: 'notebook', label: 'Caderno', desc: 'Suas anotações.', icon: <StickyNote size={20} className="text-amber-600" />, color: 'bg-amber-50 dark:bg-amber-900/20 shadow-amber-100/50', image: 'https://images.unsplash.com/photo-1517842645767-c639042777db?auto=format&fit=crop&q=80&w=400&h=300' },
    { id: 'posts', label: 'Post', desc: 'Artes com IA.', icon: <ImageIcon size={20} className="text-pink-600" />, color: 'bg-pink-50 dark:bg-pink-900/20 shadow-pink-100/50', image: 'https://images.unsplash.com/photo-1492724441997-5dc865305da7?auto=format&fit=crop&q=80&w=400&h=300' },
    { id: 'store', label: 'Livros', desc: 'Biblioteca selecionada.', icon: <Library size={20} className="text-indigo-600" />, color: 'bg-indigo-50 dark:bg-indigo-900/20 shadow-indigo-100/50', image: 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?auto=format&fit=crop&q=80&w=400&h=300' },
    { id: 'donate', label: 'Doe', desc: 'Ajude este projeto.', icon: <HeartHandshake size={20} className="text-red-600" />, color: 'bg-red-50 dark:bg-red-900/20 shadow-red-100/50', image: 'https://images.unsplash.com/photo-1579621970563-ebec7560ff3e?auto=format&fit=crop&q=80&w=400&h=300' },
    { id: 'forum', label: 'Fórum', desc: 'Comunidade de fé.', icon: <MessageSquare size={20} className="text-purple-600" />, color: 'bg-purple-50 dark:bg-purple-900/20 shadow-purple-100/50', image: 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?auto=format&fit=crop&q=80&w=400&h=300' },
    { id: 'career', label: 'Carreira', desc: 'Crescimento ministerial.', icon: <Trophy size={20} className="text-orange-600" />, color: 'bg-orange-50 dark:bg-orange-900/20 shadow-orange-100/50', image: 'https://picsum.photos/seed/soldier-salute/400/300' },
    { id: 'contact', label: 'Contato', desc: 'Fale conosco.', icon: <Mail size={20} className="text-cyan-600" />, color: 'bg-cyan-50 dark:bg-cyan-900/20 shadow-cyan-100/50', image: 'https://images.unsplash.com/photo-1512486130939-2c4f79935e4f?auto=format&fit=crop&q=80&w=400&h=300' },
    { id: 'news', label: 'Sinais', desc: 'Notícias sinais da Vinda.', icon: <Newspaper size={20} className="text-sky-600" />, color: 'bg-sky-50 dark:bg-sky-900/20 shadow-sky-100/50', onClick: () => setIsNewsModalOpen(true) },
  ];

  const handleGenerateMessage = async () => {
    if (!selectedMessageType) return;
    setIsGeneratingMessage(true);
    showToast(getRandomWaitingMessage(), 'info');

    const messageConfigs: Record<string, { prompt: string, instruction: string }> = {
      'Esboço Pregação': {
        prompt: `Gere um Esboço de pregação profunda da Palavra sobre o tema: ${messagePrompt}.`,
        instruction: "Você é um pregador experiente e profundo."
      },
      'Mensagem Aniversário': {
        prompt: `Gere uma mensagem de Aniversário para: ${messagePrompt}. Estruture a mensagem com um texto simples, poético e prático da bíblia. Mensagem curta (5 a 10 minutos). Utilize uma ilustração divertida e criativa. Aplique a palavra com conselhos práticos; Mensagem de motivação, ânimo, alegria e gratidão a Deus.`,
        instruction: "Você é um conselheiro amoroso e alegre."
      },
      'Mensagem Casamento': {
        prompt: `Gere uma mensagem de Casamento para: ${messagePrompt}. Estruture a mensagem com versículos e exemplos bíblicos que remetem ao casamento, relacionamento saudável, amor, reacender a paixão, dedicação, respeito, honra, aliança, amizade, renovo, combate ao egoísmo, ciúme, competição, empatia, o poder da fala: elogio e crítica, como servir ao cônjuge com alegria, encontrar sentido e prazer nas pequenas coisas, abrir mão de outros relacionamentos e projetos para se dedicar a família. Destaque que a família é um projeto de Deus e tem sofrido ataques de alguns pensadores da sociedade, mas a família é a base da sociedade e a base da igreja. Cuidado com os futuros filhos, estruturar, dar o melhor, o primeiro ministério e mais importante é a nossa casa, se a casa não vai bem - a vida não vai bem ou está prestes a ruir. Mensagem com tempo médio de 20 a 25 minutos.`,
        instruction: "Você é um conselheiro matrimonial sábio."
      },
      'Mensagem Fim do ano': {
        prompt: `Gere uma mensagem de Fim de Ano sobre: ${messagePrompt}. Estruture a mensagem com um texto profético de bençãos, resgate de aliança, promessas, identidade como filho de Deus, herdeiro com Cristo, mensagem de motivação para o ano novo, ânimo, alegria e muita gratidão a Deus pelo ano que passou, meditar sobre o que deu certo e errado, como ser um cristão melhor, um servo melhor, um pai melhor, um filho melhor, um cidadão melhor, faça desafios para o ano novo, leve a pessoa sonhar e projetar com fé, determinação, amor e graça. Mensagem extensa (30 a 45 minutos). Utilize uma ilustração de fácil associação com a sociedade atual.`,
        instruction: "Você é um profeta de esperança e renovação."
      },
      'Mensagem Formatura': {
        prompt: `Gere uma mensagem de Formatura para: ${messagePrompt}. Estruture a mensagem com um texto de motivação, ânimo, alegria e muita gratidão a Deus pelo ano que passou, medite na responsabilidade do conhecimento de levar a práticas saudáveis e o comprometimento de melhorar o mundo e ser exemplo e boa influência para outros. Desafie o ouvinte, leve a pessoa sonhar e projetar com fé, determinação, confiança e em si mesmo. Desperte o potencial, fale de homens e mulheres da bíblia que foram heróis que fizeram a diferença e marcaram o seu tempo e as gerações futuras. Diga: você é capaz! De fazer melhor e ser melhor! O Universo que Deus forjou é infinito de possibilidades e aprendizado e Ele começou a compartilhar com você os seus segredos. Utilize-os bem! Mensagem média (15 a 20 minutos). Utilize uma ilustração de fácil associação com a sociedade atual, moderna e inteligente.`,
        instruction: "Você é um mentor inspirador."
      },
      'Mensagem Devocional': {
        prompt: `Gere um devocional profundo sobre: ${messagePrompt}.`,
        instruction: "Você é um guia de meditação espiritual."
      },
      'Mensagem Velório': {
        prompt: `Gere uma mensagem de Velório para: ${messagePrompt}. Estruture a mensagem para os vivos e não para os mortos. Traga consolo a família e amigos, seja gentil, empático e amoroso. Fale da eternidade com Deus, plano de salvação, da realidade que todos vivemos que um dia também enfrentaremos a morte. Não julgue, não fale de inferno, não critique a família.`,
        instruction: "Você é um conselheiro fúnebre compassivo."
      }
    };

    const config = messageConfigs[selectedMessageType];
    if (!config) return;

    try {
      const response = await geminiService.generateTextWithThought(config.prompt, config.instruction, deepThinking);
      setGeneratedMessage(response.text);
      setGeneratedMessageThought(response.thought);
    } catch (error: any) {
      console.error(error);
      showToast(error.message || "Erro ao gerar mensagem.", 'error');
    } finally {
      setIsGeneratingMessage(false);
    }
  };

  const handleAppSearch = async (query: string) => {
    setAppSearchQuery(query);
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }

    const results: any[] = [];
    const q = query.toLowerCase();

    // Search in Pages/Shortcuts
    quickActions.forEach(action => {
      if (action.label.toLowerCase().includes(q) || action.desc.toLowerCase().includes(q)) {
        results.push({ title: action.label, description: action.desc, tab: action.id, type: 'page' });
      }
    });

    // Static content search (buttons, titles, resources)
    const staticContent = [
      { title: 'Contribua com a Obra', description: 'Apoie nosso trabalho missionário e social.', tab: 'contact' },
      { title: 'Pensamento Profundo IA', description: 'Ative o raciocínio avançado da Inteligência Artificial.', tab: 'home' },
      { title: 'Gerar Estudo Bíblico', description: 'Crie estudos, esboços e lições personalizadas.', tab: 'study' },
      { title: 'Bíblias de Estudo', description: 'Consulte Thompson, Shedd, Genebra e muitas outras.', tab: 'study' },
      { title: 'Dicionários e Enciclopédias', description: 'Significados e contextos históricos detalhados.', tab: 'study' },
      { title: 'Ranking Ministerial', description: 'Veja sua posição e patentes conquistadas.', tab: 'career' },
      { title: 'Criação de Posts', description: 'Gere imagens e textos para evangelismo digital.', tab: 'posts' },
      { title: 'Notícias do Reino', description: 'Acompanhe as últimas notícias do mundo cristão.', tab: 'home' },
    ];

    staticContent.forEach(item => {
      if (item.title.toLowerCase().includes(q) || item.description.toLowerCase().includes(q)) {
        if (!results.some(r => r.title === item.title)) {
          results.push({ ...item, type: 'page' });
        }
      }
    });

    // Search in Notes (Meu Caderno)
    const savedNotes = localStorage.getItem('preacher_notes');
    if (savedNotes) {
      const notes = JSON.parse(savedNotes);
      notes.forEach((note: any) => {
        if (note.title.toLowerCase().includes(q) || note.content.toLowerCase().includes(q)) {
          results.push({ title: note.title, description: note.content.substring(0, 100) + '...', tab: 'notebook', type: 'note' });
        }
      });
    }

    // Full-text search in Biblical sources (Simulated using AI for deep search)
    if (query.length > 3) {
      try {
        const searchPrompt = `Pesquise o termo "${query}" em Bíblias de Estudo, Enciclopédias, Dicionários e Comentários Bíblicos. Forneça 3 resultados curtos e relevantes com a fonte.`;
        const aiResults = await geminiService.generateJSON<any[]>(`
          Gere uma lista de 3 resultados de pesquisa para o termo "${query}" em fontes bíblicas.
          Formato: [{ "title": "Fonte: Título", "description": "Breve explicação...", "tab": "study" }]
        `, undefined, {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              title: { type: Type.STRING },
              description: { type: Type.STRING },
              tab: { type: Type.STRING }
            },
            required: ["title", "description", "tab"]
          }
        });
        if (Array.isArray(aiResults)) {
          aiResults.forEach(res => results.push({ ...res, type: 'bible' }));
        }
      } catch (e) {
        console.error("AI Search error", e);
      }
    }

    setSearchResults(results);
  };

  const [currentVerseIndex, setCurrentVerseIndex] = useState(0);
  const dailyVerse = verses[currentVerseIndex];
  const [isFavorited, setIsFavorited] = useState(false);

  useEffect(() => {
    if (user && user.favorites && dailyVerse) {
      const favorited = user.favorites.some(f => f.reference === dailyVerse.reference);
      setIsFavorited(favorited);
    } else {
      setIsFavorited(false);
    }
  }, [user, dailyVerse]);

  const handleToggleFavorite = async () => {
    if (!user) {
      showToast("Faça login para favoritar versículos.", "info");
      return;
    }

    if (!dailyVerse) return;

    try {
      await toggleFavorite({
        reference: dailyVerse.reference,
        verse: dailyVerse.text,
        version: 'NVI',
        date: new Date().toISOString()
      });
    } catch (error) {
      console.error("Error toggling favorite:", error);
    }
  };
  const [currentBg, setCurrentBg] = useState("https://i.postimg.cc/1Rqjh4bB/Screenshot-2026-03-09-12-08-27-022-com-google-android-googlequicksearchbox-edit.jpg");
  const [isBgModalOpen, setIsBgModalOpen] = useState(false);
  const [isSentimentModalOpen, setIsSentimentModalOpen] = useState(false);
  const [isMessageModalOpen, setIsMessageModalOpen] = useState(false);
  const [selectedMessageType, setSelectedMessageType] = useState<string | null>(null);
  const [messagePrompt, setMessagePrompt] = useState('');
  const [selectedSentiment, setSelectedSentiment] = useState<{ name: string, emoji: string, verse: string, ref: string } | null>(null);
  const [isGeneratingMessage, setIsGeneratingMessage] = useState(false);
  const [generatedMessage, setGeneratedMessage] = useState('');
  const [generatedMessageThought, setGeneratedMessageThought] = useState('');
  const [isAudioLoading, setIsAudioLoading] = useState(false);
  const [isAudioConfirmModalOpen, setIsAudioConfirmModalOpen] = useState(false);
  const [pendingAudioText, setPendingAudioText] = useState<string | null>(null);
  const [isNotebookModalOpen, setIsNotebookModalOpen] = useState(false);
  const [showQuickTips, setShowQuickTips] = useState(false);
  const [pendingNote, setPendingNote] = useState<{ title: string, content: string } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const hasSeenTips = localStorage.getItem('has_seen_quick_tips');
    if (!hasSeenTips) {
      const timer = setTimeout(() => {
        setShowQuickTips(true);
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, []);

  const closeQuickTips = () => {
    setShowQuickTips(false);
    localStorage.setItem('has_seen_quick_tips', 'true');
  };

  const handleSaveToNotebook = (title: string, content: string) => {
    setPendingNote({ title, content });
    setIsNotebookModalOpen(true);
  };

  const confirmSaveToNotebook = async (category: 'Anotações' | 'Esboços' | 'Estudos') => {
    if (!pendingNote) return;
    
    try {
      if (user) {
        await addDoc(collection(db, 'notes'), {
          userId: user.id,
          title: pendingNote.title,
          content: pendingNote.content,
          category,
          createdAt: new Date().toISOString()
        });
      } else {
        const savedNotes = JSON.parse(localStorage.getItem('preacher_notes') || '[]');
        const newNote = {
          id: Date.now().toString(),
          title: pendingNote.title,
          content: pendingNote.content,
          category,
          date: new Date().toLocaleDateString('pt-BR')
        };
        localStorage.setItem('preacher_notes', JSON.stringify([newNote, ...savedNotes]));
      }
      showToast(`Salvo em ${category}! 📓✨`);
      setIsNotebookModalOpen(false);
      setPendingNote(null);
    } catch (error) {
      console.error("Error saving to notebook:", error);
      showToast("Erro ao salvar no caderno.", 'error');
    }
  };

  const sentiments = [
    { name: 'Ansioso', emoji: '😰', verse: 'Não andem ansiosos por coisa alguma, mas em tudo, pela oração e súplicas, e com ação de graças, apresentem seus pedidos a Deus.', ref: 'Filipenses 4:6' },
    { name: 'Arrependido', emoji: '🛐', verse: 'Se confessarmos os nossos pecados, ele é fiel e justo para nos perdoar os pecados e nos purificar de toda injustiça.', ref: '1 João 1:9' },
    { name: 'Cansado', emoji: '🔋', verse: 'Venham a mim, todos os que estão cansados e sobrecarregados, e eu darei descanso a vocês.', ref: 'Mateus 11:28' },
    { name: 'Com Medo', emoji: '🛡️', verse: 'No dia em que eu tiver medo, hei de confiar em ti.', ref: 'Salmos 56:3' },
    { name: 'Confuso', emoji: '🧩', verse: 'Se algum de vocês tem falta de sabedoria, peça-a a Deus, que a todos dá livremente, de boa vontade; e lhe será concedida.', ref: 'Tiago 1:5' },
    { name: 'Deprimido', emoji: '🌑', verse: 'O Senhor está perto dos que têm o coração quebrantado e salva os de espírito abatido.', ref: 'Salmos 34:18' },
    { name: 'Desanimado', emoji: '🏜️', verse: 'Não fui eu que lhe ordenei? Seja forte e corajoso! Não se apavore nem desanime, pois o Senhor, o seu Deus, estará com você por onde você andar.', ref: 'Josué 1:9' },
    { name: 'Feliz', emoji: '☀️', verse: 'Alegrem-se sempre no Senhor. Novamente direi: Alegrem-se!', ref: 'Filipenses 4:4' },
    { name: 'Grato', emoji: '🌻', verse: 'Deem graças em todas as circunstâncias, pois esta é a vontade de Deus para vocês em Cristo Jesus.', ref: '1 Tessalonicenses 5:18' },
    { name: 'Irado', emoji: '🔥', verse: 'Quando vocês ficarem irados, não pequem. Apazigúem a sua ira antes que o sol se ponha.', ref: 'Efésios 4:26' },
    { name: 'Magoado', emoji: '💔', verse: 'Sejam bondosos e compassivos uns para com os outros, perdoando-se mutuamente, assim como Deus os perdoou em Cristo.', ref: 'Efésios 4:32' },
    { name: 'Solitário', emoji: '🏝️', verse: 'Deus faz que o solitário viva em família; liberta aqueles que estão presos em grilhões; mas os rebeldes habitam em terra seca.', ref: 'Salmos 68:6' },
    { name: 'Tentado', emoji: '⚖️', verse: 'Não veio sobre vós tentação, senão humana; mas fiel é Deus, que não vos deixará tentar acima do que podeis, antes com a tentação dará também o escape.', ref: '1 Coríntios 10:13' },
    { name: 'Triste', emoji: '🌧️', verse: 'Bem-aventurados os que choram, pois serão consolados.', ref: 'Mateus 5:4' },
  ];

  const handleGenerateSentimentMessage = async () => {
    if (!selectedSentiment) return;
    setIsGeneratingMessage(true);
    showToast(getRandomWaitingMessage(), 'info');
    
    try {
      const prompt = `Gere uma mensagem de conforto, motivação e orientação espiritual baseada no sentimento "${selectedSentiment.name}". 
      Utilize a sabedoria das Bíblias de Estudo, comentários teológicos e a visão de grandes autores cristãos. 
      A mensagem deve ser pessoal, acolhedora e profunda. 
      Inclua pelo menos 3 versículos relacionados e uma breve oração ao final.`;
      
      const response = await geminiService.generateText(prompt, "Você é um conselheiro espiritual sábio e acolhedor.", deepThinking);
      setGeneratedMessage(response);
    } catch (error: any) {
      console.error(error);
      showToast(error.message || "Erro ao gerar mensagem.", 'error');
    } finally {
      setIsGeneratingMessage(false);
    }
  };

  const handlePlayAudio = async (text: string) => {
    if (!text) return;
    setPendingAudioText(text);
    setIsAudioConfirmModalOpen(true);
  };

  const confirmPlayAudio = async () => {
    if (!pendingAudioText) return;
    setIsAudioConfirmModalOpen(false);
    setIsAudioLoading(true);
    try {
      const audioUrl = await geminiService.generateSpeech(pendingAudioText, 'Zephyr');
      if (audioUrl) {
        const audio = new Audio(audioUrl);
        audio.play();
        
        // Auto-save to Audio Box
        try {
          await saveTrack('Mensagem Inspiradora', 'Início', audioUrl, 'Inspiracional', 'Emotiva');
          showToast("Áudio salvo na Coletânea! 🎵", 'success');
        } catch (saveError) {
          console.error("Error auto-saving to audio box:", saveError);
        }
      }
    } catch (error: any) {
      console.error(error);
      showToast(error.message || "Erro ao gerar áudio.", 'error');
    } finally {
      setIsAudioLoading(false);
      setPendingAudioText(null);
    }
  };

  const predefinedBgs = [
    "https://picsum.photos/seed/hope/1200/600",
    "https://picsum.photos/seed/faith/1200/600",
    "https://picsum.photos/seed/peace/1200/600",
    "https://picsum.photos/seed/nature/1200/600",
    "https://picsum.photos/seed/spiritual/1200/600",
    "https://picsum.photos/seed/cross/1200/600",
    "https://picsum.photos/seed/bible/1200/600",
    "https://picsum.photos/seed/light/1200/600",
    "https://picsum.photos/seed/mountain/1200/600",
    "https://picsum.photos/seed/ocean/1200/600",
    "https://picsum.photos/seed/forest/1200/600",
    "https://picsum.photos/seed/sky/1200/600",
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentVerseIndex((prev) => (prev + 1) % verses.length);
    }, 10000);
    return () => clearInterval(interval);
  }, []);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setCurrentBg(reader.result as string);
        setIsBgModalOpen(false);
      };
      reader.readAsDataURL(file);
    }
  };

  const shareToSocial = (platform: string) => {
    const text = `"${dailyVerse.text}" - ${dailyVerse.reference} #ImersaoBiblica`;
    const url = window.location.href;
    
    if (platform === 'whatsapp') {
      window.open(`https://wa.me/?text=${encodeURIComponent(text + ' ' + url)}`, '_blank');
    } else if (platform === 'facebook') {
      window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`, '_blank');
    } else if (platform === 'instagram') {
      alert('Para compartilhar no Instagram, salve a imagem e poste no seu perfil!');
    }
  };

  return (
    <div className="space-y-10 max-w-7xl mx-auto px-4">
      {/* Top Image Section */}
      <div className="mb-12 relative flex justify-center overflow-hidden rounded-[2.5rem] group shadow-2xl">
        <img 
          src={currentBg} 
          alt="Banner Imersão" 
          className="w-full h-auto max-h-[350px] object-cover rounded-[2.5rem] transition-transform duration-1000 group-hover:scale-105"
          referrerPolicy="no-referrer"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent flex flex-col items-center justify-center p-6 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="space-y-3"
          >
            <h1 className="text-4xl md:text-7xl font-display font-black text-white tracking-tighter drop-shadow-2xl uppercase">
              Início
            </h1>
            <div className="h-1.5 w-24 bg-emerald-500 mx-auto rounded-full shadow-lg shadow-emerald-500/50" />
            <p className="text-white/90 text-xs md:text-base font-black tracking-[0.4em] uppercase drop-shadow-lg">
              {getGreeting()}
            </p>
          </motion.div>
        </div>
      </div>

      {/* Daily Verse Section */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="relative overflow-hidden rounded-[2.5rem] bg-white dark:bg-zinc-900 border border-stone-100 dark:border-zinc-800 shadow-xl p-8 md:p-12"
      >
        <div className="absolute top-0 right-0 p-8 opacity-5">
          <Book size={120} className="text-emerald-600" />
        </div>
        
        <div className="relative z-10 space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 px-3 py-1 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 rounded-full text-[10px] font-black uppercase tracking-widest">
              <Sparkles size={12} />
              Pão Diário
            </div>
            <div className="flex items-center gap-2">
              <button 
                onClick={handleToggleFavorite}
                className={cn(
                  "p-2 rounded-full transition-colors",
                  isFavorited 
                    ? "bg-red-100 dark:bg-red-900/20 text-red-600 dark:text-red-400" 
                    : "hover:bg-stone-100 dark:hover:bg-zinc-800 text-stone-400 hover:text-red-500"
                )}
                title={isFavorited ? "Remover dos Favoritos" : "Adicionar aos Favoritos"}
              >
                <Heart size={18} className={cn(isFavorited && "fill-current")} />
              </button>
              <button 
                onClick={() => shareToSocial('whatsapp')}
                className="p-2 hover:bg-stone-100 dark:hover:bg-zinc-800 rounded-full text-stone-400 hover:text-emerald-600 transition-colors"
                title="Compartilhar no WhatsApp"
              >
                <MessageCircle size={18} />
              </button>
              <button 
                onClick={() => shareToSocial('facebook')}
                className="p-2 hover:bg-stone-100 dark:hover:bg-zinc-800 rounded-full text-stone-400 hover:text-blue-600 transition-colors"
                title="Compartilhar no Facebook"
              >
                <Facebook size={18} />
              </button>
              <button 
                onClick={() => shareToSocial('instagram')}
                className="p-2 hover:bg-stone-100 dark:hover:bg-zinc-800 rounded-full text-stone-400 hover:text-pink-600 transition-colors"
                title="Compartilhar no Instagram"
              >
                <Instagram size={18} />
              </button>
            </div>
          </div>

          <div className="space-y-4">
            <p className="text-2xl md:text-3xl font-display font-medium text-stone-800 dark:text-white leading-tight italic">
              "{dailyVerse.text}"
            </p>
            <p className="text-emerald-600 dark:text-emerald-400 font-bold tracking-widest uppercase text-xs">
              — {dailyVerse.reference}
            </p>
          </div>

          <div className="flex flex-wrap gap-3 pt-4">
            <button 
              onClick={() => handlePlayAudio(dailyVerse.text)}
              disabled={isAudioLoading}
              className="px-6 py-2.5 bg-stone-900 dark:bg-white text-white dark:text-zinc-900 rounded-xl text-xs font-bold flex items-center gap-2 hover:scale-105 transition-all disabled:opacity-50"
            >
              {isAudioLoading ? <Loader2 className="animate-spin" size={14} /> : <Volume2 size={14} />}
              Ouvir Versículo
            </button>
            <button 
              onClick={() => handleSaveToNotebook(dailyVerse.reference, dailyVerse.text)}
              className="px-6 py-2.5 bg-stone-100 dark:bg-zinc-800 text-stone-600 dark:text-zinc-300 rounded-xl text-xs font-bold flex items-center gap-2 hover:scale-105 transition-all"
            >
              <StickyNote size={14} />
              Salvar no Caderno
            </button>
          </div>
        </div>
      </motion.div>

      {/* Sentiment Button - Modern Gradient */}
      <div className="grid grid-cols-1 gap-6">
        <button 
          onClick={() => setIsSentimentModalOpen(true)}
          className="w-full relative overflow-hidden rounded-[2rem] p-[2px] group transition-transform hover:scale-[1.02] active:scale-95 shadow-xl"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-emerald-500 via-teal-500 to-blue-500 opacity-80 group-hover:opacity-100 transition-opacity" />
          <div className="relative bg-gradient-to-br from-white to-emerald-50 dark:from-zinc-900 dark:to-emerald-900/10 px-8 py-6 rounded-[1.85rem] flex items-center justify-between gap-4 h-full">
            <div className="flex flex-col items-start text-left">
              <span className="text-2xl md:text-3xl font-display font-bold bg-gradient-to-r from-emerald-600 to-blue-600 bg-clip-text text-transparent">
                Como se sente hoje?
              </span>
              <span className="text-stone-500 dark:text-zinc-400 text-sm italic mt-1">
                "O coração alegre aformoseia o rosto..." — Pv 15:13
              </span>
            </div>
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-emerald-100 to-blue-100 dark:from-emerald-900/30 dark:to-blue-900/30 flex items-center justify-center flex-shrink-0 shadow-inner">
              <Heart className="text-emerald-600 dark:text-emerald-400" size={24} />
            </div>
          </div>
        </button>
      </div>

      {/* Meaning Result Display */}

      {/* Search Header */}
      <div className="flex flex-col md:flex-row gap-4 items-center">
        <div className="relative flex-1 w-full group">
          <div className="absolute -inset-0.5 bg-gradient-to-r from-emerald-500 to-blue-500 rounded-[2rem] opacity-20 group-focus-within:opacity-50 transition-opacity blur" />
          <div className="relative">
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-emerald-600 dark:text-emerald-400" size={20} />
            <input 
              type="text"
              placeholder="⚓ Pesquisar no App, Meu Caderno e Fontes Bíblicas..."
              value={appSearchQuery}
              onChange={(e) => handleAppSearch(e.target.value)}
              onFocus={() => setIsSearchFocused(true)}
              className="w-full pl-14 pr-24 py-5 bg-gradient-to-r from-white/90 to-emerald-50/90 dark:from-zinc-900/90 dark:to-emerald-900/10 backdrop-blur-xl border border-white/20 dark:border-zinc-800/50 rounded-[1.85rem] focus:outline-none shadow-xl text-sm transition-all"
            />
            <div className="absolute right-5 top-1/2 -translate-y-1/2 flex items-center gap-2">
              <button 
                onClick={() => setDeepThinking(!deepThinking)}
                className={cn(
                  "p-2 rounded-xl transition-all flex items-center gap-2",
                  deepThinking 
                    ? "bg-blue-600 text-white shadow-lg shadow-blue-600/20" 
                    : "bg-stone-100 dark:bg-zinc-800 text-stone-400 hover:text-blue-600"
                )}
                title={deepThinking ? "Pensamento Profundo Ativado" : "Ativar Pensamento Profundo"}
              >
                <Brain size={18} />
                {deepThinking && <span className="text-[10px] font-black uppercase tracking-widest hidden md:block">Deep Thinking</span>}
              </button>
              <AudioSearchButton onResult={(text) => handleAppSearch(text)} />
              <button 
                className="text-stone-300 hover:text-emerald-600 transition-colors"
                title="Pesquisa Global: App, Caderno e Fontes Bíblicas"
              >
                <HelpCircle size={20} />
              </button>
            </div>
          </div>
          
          <AnimatePresence>
            {isSearchFocused && appSearchQuery && (
              <>
                <div 
                  className="fixed inset-0 z-40" 
                  onClick={() => setIsSearchFocused(false)}
                />
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className="absolute top-full left-0 right-0 mt-3 bg-white dark:bg-zinc-900 border border-stone-200 dark:border-zinc-800 rounded-3xl shadow-2xl z-50 max-h-[400px] overflow-y-auto p-3"
                >
                  {searchResults.length === 0 ? (
                    <div className="p-10 text-center text-stone-500 text-sm">
                      Nenhum resultado encontrado para "{appSearchQuery}"
                    </div>
                  ) : (
                    <div className="space-y-1">
                      {searchResults.map((result, idx) => (
                        <button
                          key={idx}
                          onClick={() => {
                            onNavigate(result.tab);
                            setIsSearchFocused(false);
                            setAppSearchQuery('');
                          }}
                          className="w-full text-left p-4 hover:bg-stone-50 dark:hover:bg-zinc-800 rounded-2xl flex items-start gap-4 transition-colors group"
                        >
                          <div className="p-3 bg-emerald-50 dark:bg-emerald-900/20 rounded-xl text-emerald-600 group-hover:scale-110 transition-transform">
                            {result.type === 'page' ? <Sparkles size={18} /> : <StickyNote size={18} />}
                          </div>
                          <div>
                            <p className="font-bold text-sm text-stone-900 dark:text-white">{result.title}</p>
                            <p className="text-xs text-stone-500 line-clamp-1">{result.description}</p>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </div>
      </div>



      {/* Quick Actions - Minimalist & Compact */}
      <section className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {quickActions.map((action, index) => (
          <motion.div
            key={`${action.id}-${index}`}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.03 }}
            className="group relative flex flex-col bg-white dark:bg-zinc-900 border border-stone-100 dark:border-zinc-800 rounded-3xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-300"
          >
            {/* Action Button */}
            <button 
              onClick={() => {
                const actionWithClick = action as any;
                if (actionWithClick.onClick) {
                  actionWithClick.onClick();
                } else if (action.id === 'generate-message') {
                  setIsMessageModalOpen(true);
                } else {
                  onNavigate(action.id);
                }
              }}
              className="flex-1 flex flex-col items-center gap-3 p-5 text-center"
            >
              <div className={cn(
                "p-3 rounded-2xl transition-transform duration-300 group-hover:scale-110",
                action.color
              )}>
                {action.icon}
              </div>
              <div>
                <h4 className="text-sm font-bold text-stone-900 dark:text-white group-hover:text-emerald-600 transition-colors">{action.label}</h4>
                <p className="text-[10px] text-stone-400 dark:text-zinc-500 line-clamp-1 mt-0.5">
                  {action.desc}
                </p>
              </div>
            </button>

            {/* Know More Button */}
            <button 
              onClick={(e) => {
                e.stopPropagation();
                showToast(`Saiba mais sobre ${action.label}: ${action.desc}`, 'info');
              }}
              className="absolute top-3 right-3 p-1 text-stone-300 hover:text-emerald-600 transition-colors"
              title="Saiba mais"
            >
              <HelpCircle size={14} />
            </button>
          </motion.div>
        ))}
      </section>

      {/* Message of the Week - Soft Reading Area */}
      <section className="bg-stone-50 dark:bg-zinc-800/30 p-10 rounded-[3rem] border border-stone-100 dark:border-zinc-800/50">
        <div className="max-w-3xl mx-auto space-y-6">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="h-[1px] flex-1 bg-stone-200 dark:bg-zinc-800" />
            <h3 className="text-sm font-bold tracking-widest uppercase text-stone-400">Mensagem da Semana</h3>
            <div className="h-[1px] flex-1 bg-stone-200 dark:bg-zinc-800" />
          </div>
          <div className="text-center space-y-6">
            <div className="space-y-1">
              <h4 className="text-3xl font-serif italic text-stone-900 dark:text-white">"O Poder da Perseverança"</h4>
              <p className="text-xs text-stone-400 italic">Por Wesley Reis</p>
            </div>
            <p className="text-stone-600 dark:text-zinc-400 leading-relaxed font-light text-lg">
              Nesta semana, somos convidados a olhar para a vida de Paulo. Mesmo em meio a prisões e naufrágios, ele não perdeu a visão do Reino. A perseverança não é apenas aguentar, mas é avançar com propósito, sabendo que Aquele que começou a boa obra é fiel para completá-la.
            </p>
            <button className="inline-flex items-center gap-2 text-emerald-600 font-bold hover:gap-4 transition-all text-sm">
              CONTINUAR LEITURA <ArrowRight size={18} />
            </button>
          </div>
        </div>
      </section>

      {/* Missionary Work Section - Minimalist */}
      <section className="bg-amber-50 dark:bg-amber-900/10 p-10 md:p-14 rounded-[3rem] border border-amber-100 dark:border-amber-800/20 shadow-sm text-center space-y-8 relative overflow-hidden">
        <div className="absolute inset-0 opacity-[0.03] dark:opacity-[0.05] pointer-events-none">
          <img 
            src="https://images.unsplash.com/photo-1526948128573-703ee1aeb6fa?auto=format&fit=crop&q=80&w=1200" 
            alt="Globe Background" 
            className="w-full h-full object-cover grayscale"
            referrerPolicy="no-referrer"
          />
        </div>
        <div className="relative z-10 max-w-4xl mx-auto space-y-6">
          <h3 className="text-3xl font-display font-bold text-amber-950 dark:text-amber-400">Conheça o Nosso Trabalho Missionário</h3>
          <p className="text-amber-800/60 dark:text-amber-200/40 text-base leading-relaxed">
            Fazemos impactos evangelísticos, teatro em escolas e caravanas missionárias. Apoiamos comunidades carentes através do <span className="text-emerald-600 font-bold">GRUPAMI</span>. Faça parte desta missão de amor e fé.
          </p>
          <div className="flex flex-wrap justify-center gap-6">
            {[
              { icon: <Globe size={24} />, href: "https://www.grupami.net", color: "text-emerald-600", label: "Site" },
              { icon: <Instagram size={24} />, href: "https://www.instagram.com/grupami.missoes?igsh=NHJpN3MybnhyYWVq", color: "text-pink-600", label: "Instagram" },
              { icon: <Youtube size={24} />, href: "https://www.youtube.com/channel/UCgtcECZWTx3pr4j0Pm0hlyQ", color: "text-red-600", label: "Youtube" },
              { icon: <svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor"><path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.17-2.89-.6-4.13-1.47-.13 3.1-.12 6.2-.13 9.3 0 1.29-.27 2.61-.95 3.71-.68 1.11-1.74 1.99-2.96 2.43-1.22.44-2.58.53-3.86.27-1.28-.27-2.48-.94-3.37-1.9-.89-.96-1.46-2.22-1.61-3.51-.15-1.29.11-2.63.75-3.77.64-1.14 1.69-2.06 2.93-2.55 1.24-.49 2.64-.58 3.94-.25.12.03.24.07.36.11v4.11c-.81-.24-1.7-.23-2.49.03-.79.26-1.48.81-1.9 1.52-.42.71-.56 1.57-.39 2.38.17.81.65 1.54 1.32 2.01.67.47 1.51.68 2.33.59.82-.09 1.59-.49 2.12-1.13.53-.64.8-1.47.76-2.31-.04-3.4-.02-6.81-.03-10.21-.01-4.53-.01-9.06-.01-13.59z"/></svg>, href: "https://www.tiktok.com/@grupamikids?is_from_webapp=1&sender_device=pc", color: "text-stone-900 dark:text-white", label: "Tiktok" },
              { icon: <Share2 size={24} />, onClick: () => {
                const text = "Conheça o trabalho missionário do GRUPAMI! 🌍📖";
                const url = "https://www.grupami.net";
                window.open(`https://wa.me/?text=${encodeURIComponent(text + ' ' + url)}`, '_blank');
              }, color: "text-blue-600", label: "Compartilhar" }
            ].map((social, i) => (
              social.href ? (
                <a 
                  key={i}
                  href={social.href} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="flex flex-col items-center gap-2 group"
                >
                  <div className="p-5 bg-stone-50 dark:bg-zinc-800 rounded-3xl shadow-sm border border-stone-100 dark:border-zinc-800 group-hover:scale-110 group-hover:shadow-xl transition-all duration-300">
                    <div className={social.color}>{social.icon}</div>
                  </div>
                  <span className="text-[10px] font-bold text-stone-400 uppercase tracking-widest">{social.label}</span>
                </a>
              ) : (
                <button 
                  key={i}
                  onClick={social.onClick}
                  className="flex flex-col items-center gap-2 group"
                >
                  <div className="p-5 bg-stone-50 dark:bg-zinc-800 rounded-3xl shadow-sm border border-stone-100 dark:border-zinc-800 group-hover:scale-110 group-hover:shadow-xl transition-all duration-300">
                    <div className={social.color}>{social.icon}</div>
                  </div>
                  <span className="text-[10px] font-bold text-stone-400 uppercase tracking-widest">{social.label}</span>
                </button>
              )
            ))}
          </div>
        </div>
      </section>



      <AnimatePresence>
        {showQuickTips && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="bg-white dark:bg-zinc-900 w-full max-w-lg rounded-[3rem] shadow-2xl overflow-hidden border border-emerald-100 dark:border-emerald-900/30"
            >
              <div className="p-8 space-y-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-emerald-600 text-white rounded-2xl shadow-lg shadow-emerald-600/20">
                    <Zap size={24} />
                  </div>
                  <h3 className="text-2xl font-bold font-display">Dicas Rápidas ⚓</h3>
                </div>
                
                <div className="space-y-4">
                  <div className="flex gap-4 p-4 bg-stone-50 dark:bg-zinc-800/50 rounded-2xl border border-stone-100 dark:border-zinc-800">
                    <div className="p-2 bg-blue-100 dark:bg-blue-900/30 text-blue-600 rounded-xl h-fit">
                      <Search size={20} />
                    </div>
                    <div>
                      <h4 className="font-bold text-sm">Busca Global ⚓</h4>
                      <p className="text-xs text-stone-500 mt-1">Use a barra de busca no topo para encontrar qualquer coisa: ferramentas, suas anotações ou até pesquisas bíblicas profundas com IA.</p>
                    </div>
                  </div>

                  <div className="flex gap-4 p-4 bg-stone-50 dark:bg-zinc-800/50 rounded-2xl border border-stone-100 dark:border-zinc-800">
                    <div className="p-2 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 rounded-xl h-fit">
                      <BookOpen size={20} />
                    </div>
                    <div>
                      <h4 className="font-bold text-sm">Imersão Bíblica</h4>
                      <p className="text-xs text-stone-500 mt-1">Acesse estudos profundos, dicionários teológicos e ferramentas de exegese na aba Imersão.</p>
                    </div>
                  </div>
                </div>

                <button 
                  onClick={closeQuickTips}
                  className="w-full py-4 bg-emerald-600 text-white font-bold rounded-2xl hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-600/20"
                >
                  Entendi, vamos lá!
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Sentiment Modal */}
      <AnimatePresence>
        {isSentimentModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="bg-white dark:bg-zinc-900 w-full max-w-2xl rounded-[3rem] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
            >
              <div className="p-8 border-b border-stone-100 dark:border-zinc-800 flex justify-between items-center">
                <h3 className="text-2xl font-bold">Como você se sente?</h3>
                <button 
                  onClick={() => {
                    setIsSentimentModalOpen(false);
                    setSelectedSentiment(null);
                    setGeneratedMessage('');
                  }}
                  className="p-3 hover:bg-stone-100 dark:hover:bg-zinc-800 rounded-full transition-colors"
                >
                  <X size={24} />
                </button>
              </div>
              
              <div className="flex-1 overflow-y-auto p-8">
                {!selectedSentiment ? (
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    {sentiments.map((s, idx) => (
                      <button
                        key={idx}
                        onClick={() => setSelectedSentiment(s)}
                        className="flex flex-col items-center gap-3 p-6 bg-stone-50 dark:bg-zinc-800/50 rounded-3xl hover:bg-emerald-50 dark:hover:bg-emerald-900/20 border border-transparent hover:border-emerald-200 transition-all group"
                      >
                        <span className="text-4xl group-hover:scale-125 transition-transform">{s.emoji}</span>
                        <span className="font-bold text-sm">{s.name}</span>
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="space-y-8">
                    <div className="text-center space-y-4">
                      <span className="text-6xl inline-block mb-2">{selectedSentiment.emoji}</span>
                      <h4 className="text-2xl font-bold text-emerald-600">Para o seu coração:</h4>
                      <div className="p-8 bg-emerald-50 dark:bg-emerald-900/20 rounded-[2.5rem] border border-emerald-100 dark:border-emerald-800/30">
                        <p className="text-xl font-serif italic mb-4 leading-relaxed">"{selectedSentiment.verse}"</p>
                        <p className="font-bold text-emerald-700 dark:text-emerald-400">— {selectedSentiment.ref}</p>
                      </div>
                    </div>

                    {!generatedMessage && !isGeneratingMessage && (
                      <div className="bg-stone-50 dark:bg-zinc-800/50 p-8 rounded-[2.5rem] text-center space-y-6 border border-stone-100 dark:border-zinc-800">
                        <p className="font-medium text-stone-600 dark:text-zinc-400">Gostaria de receber uma mensagem personalizada de conforto e orientação?</p>
                        <div className="flex flex-col sm:flex-row gap-3">
                          <button 
                            onClick={handleGenerateSentimentMessage}
                            className="flex-1 py-4 bg-emerald-600 text-white font-bold rounded-2xl hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-600/20 flex items-center justify-center gap-2"
                          >
                            <Sparkles size={20} />
                            Sim, claro
                          </button>
                          <button 
                            onClick={() => {
                              setIsSentimentModalOpen(false);
                              setSelectedSentiment(null);
                            }}
                            className="flex-1 py-4 bg-stone-200 dark:bg-zinc-700 text-stone-600 dark:text-zinc-300 font-bold rounded-2xl hover:bg-stone-300 transition-all"
                          >
                            Agora não
                          </button>
                        </div>
                      </div>
                    )}

                    {isGeneratingMessage && (
                      <div className="flex flex-col items-center justify-center py-12 space-y-4">
                        <Loader2 className="animate-spin text-emerald-600" size={48} />
                        <p className="text-stone-500 animate-pulse font-medium">Buscando sabedoria nas Escrituras...</p>
                      </div>
                    )}

                    {generatedMessage && (
                      <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="space-y-6"
                      >
                        {generatedMessageThought && (
                          <div className="bg-amber-50/50 dark:bg-amber-900/10 border border-amber-200/50 dark:border-amber-800/30 rounded-2xl p-4">
                            <details className="group">
                              <summary className="flex items-center gap-2 text-xs font-bold text-amber-700 dark:text-amber-400 cursor-pointer list-none">
                                <Brain size={14} className="group-open:rotate-12 transition-transform" />
                                PROCESSO DE PENSAMENTO (IA)
                              </summary>
                              <div className="mt-3 text-xs text-amber-600/80 dark:text-amber-500/80 leading-relaxed italic">
                                {generatedMessageThought}
                              </div>
                            </details>
                          </div>
                        )}
                        <div className="bg-white dark:bg-zinc-800 p-8 rounded-[2.5rem] border border-stone-200 dark:border-zinc-700 shadow-sm prose dark:prose-invert max-w-none">
                          <div className="whitespace-pre-wrap leading-relaxed text-stone-700 dark:text-zinc-300">
                            {generatedMessage}
                          </div>
                        </div>
                        <div className="flex gap-3">
                          <button 
                            onClick={() => {
                              const element = document.createElement("a");
                              const file = new Blob([generatedMessage], {type: 'text/plain'});
                              element.href = URL.createObjectURL(file);
                              element.download = `mensagem-${selectedSentiment.name.toLowerCase()}.txt`;
                              document.body.appendChild(element);
                              element.click();
                            }}
                            className="flex-1 py-4 bg-stone-100 dark:bg-zinc-800 text-stone-600 dark:text-zinc-300 font-bold rounded-2xl hover:bg-stone-200 transition-all flex items-center justify-center gap-2"
                          >
                            <Download size={24} />
                            Baixar Texto
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Message Generation Modal */}
      <AnimatePresence>
        {isMessageModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="bg-white dark:bg-zinc-900 w-full max-w-2xl rounded-[3rem] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
            >
              <div className="p-8 border-b border-stone-100 dark:border-zinc-800 flex justify-between items-center">
                <h3 className="text-2xl font-bold">Gerar Mensagem</h3>
                <button 
                  onClick={() => {
                    setIsMessageModalOpen(false);
                    setSelectedMessageType(null);
                    setGeneratedMessage('');
                    setMessagePrompt('');
                  }}
                  className="p-3 hover:bg-stone-100 dark:hover:bg-zinc-800 rounded-full transition-colors"
                >
                  <X size={24} />
                </button>
              </div>
              
              <div className="flex-1 overflow-y-auto p-8">
                {!selectedMessageType ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {[
                      'Esboço Pregação',
                      'Mensagem Aniversário',
                      'Mensagem Casamento',
                      'Mensagem Fim do ano',
                      'Mensagem Formatura',
                      'Mensagem Devocional',
                      'Mensagem Velório'
                    ].map((type, idx) => (
                      <button
                        key={idx}
                        onClick={() => setSelectedMessageType(type)}
                        className="flex items-center gap-4 p-6 bg-stone-50 dark:bg-zinc-800/50 rounded-3xl hover:bg-emerald-50 dark:hover:bg-emerald-900/20 border border-transparent hover:border-emerald-200 transition-all group text-left"
                      >
                        <div className="p-3 bg-white dark:bg-zinc-700 rounded-2xl shadow-sm text-emerald-600 group-hover:scale-110 transition-transform">
                          <Sparkles size={24} />
                        </div>
                        <span className="font-bold text-sm">{type}</span>
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="space-y-8">
                    <div className="space-y-4">
                      <button 
                        onClick={() => setSelectedMessageType(null)}
                        className="text-emerald-600 font-bold flex items-center gap-2 text-sm"
                      >
                        <ArrowLeft size={16} /> Voltar para opções
                      </button>
                      <h4 className="text-xl font-bold">{selectedMessageType}</h4>
                      <p className="text-stone-500 text-sm">Insira o tema, nome da pessoa ou contexto para a mensagem:</p>
                      <textarea 
                        value={messagePrompt}
                        onChange={(e) => setMessagePrompt(e.target.value)}
                        placeholder="Ex: Aniversário da Maria, 50 anos..."
                        className={cn(
                          "w-full p-6 bg-stone-50 dark:bg-zinc-800 border border-stone-200 dark:border-zinc-700 rounded-3xl focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none transition-all min-h-[120px]",
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
                        style={{ lineHeight }}
                      />
                    </div>

                    {!generatedMessage && !isGeneratingMessage && (
                      <button 
                        onClick={handleGenerateMessage}
                        disabled={!messagePrompt.trim()}
                        className="w-full py-4 bg-emerald-600 text-white font-bold rounded-2xl hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-600/20 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <Sparkles size={20} />
                        ⚓ Gerar Mensagem Profunda
                      </button>
                    )}

                    {isGeneratingMessage && (
                      <div className="flex flex-col items-center justify-center py-12 space-y-4">
                        <Loader2 className="animate-spin text-emerald-600" size={48} />
                        <p className="text-stone-500 animate-pulse font-medium">Buscando a palavra... 📖</p>
                      </div>
                    )}

                    {generatedMessage && (
                      <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="space-y-6"
                      >
                        {generatedMessageThought && (
                          <div className="bg-amber-50/50 dark:bg-amber-900/10 border border-amber-200/50 dark:border-amber-800/30 rounded-2xl p-4">
                            <details className="group">
                              <summary className="flex items-center gap-2 text-xs font-bold text-amber-700 dark:text-amber-400 cursor-pointer list-none">
                                <Brain size={14} className="group-open:rotate-12 transition-transform" />
                                PROCESSO DE PENSAMENTO (IA)
                              </summary>
                              <div className="mt-3 text-xs text-amber-600/80 dark:text-amber-500/80 leading-relaxed italic">
                                {generatedMessageThought}
                              </div>
                            </details>
                          </div>
                        )}
                        <div className="bg-white dark:bg-zinc-800 p-8 rounded-[2.5rem] border border-stone-200 dark:border-zinc-700 shadow-sm prose dark:prose-invert max-w-none">
                          <div className="whitespace-pre-wrap leading-relaxed text-stone-700 dark:text-zinc-300">
                            {generatedMessage}
                          </div>
                        </div>
                        <div className="flex gap-3">
                          <button 
                            onClick={() => handleSaveToNotebook(selectedMessageType || 'Mensagem', generatedMessage)}
                            className="flex-1 py-4 bg-emerald-600 text-white font-bold rounded-2xl hover:bg-emerald-700 transition-all flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/20"
                          >
                            <Save size={20} />
                            Salvar no Caderno
                          </button>
                          <button 
                            onClick={() => {
                              const element = document.createElement("a");
                              const file = new Blob([generatedMessage], {type: 'text/plain'});
                              element.href = URL.createObjectURL(file);
                              element.download = `${selectedMessageType.toLowerCase().replace(/\s+/g, '-')}.txt`;
                              document.body.appendChild(element);
                              element.click();
                            }}
                            className="flex-1 py-4 bg-stone-100 dark:bg-zinc-800 text-stone-600 dark:text-zinc-300 font-bold rounded-2xl hover:bg-stone-200 transition-all flex items-center justify-center gap-2"
                          >
                            <Download size={24} />
                            Baixar Texto
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* News Modal */}
      <AnimatePresence>
        {isNewsModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="bg-white dark:bg-zinc-900 w-full max-w-5xl h-[90vh] rounded-3xl shadow-2xl overflow-hidden flex flex-col"
            >
              <div className="p-6 border-b border-stone-100 dark:border-zinc-800 flex justify-between items-center bg-white dark:bg-zinc-900">
                <h3 className="text-xl font-bold flex items-center gap-2">
                  <Newspaper className="text-orange-600" />
                  Notícias do Reino
                </h3>
                <button 
                  onClick={() => setIsNewsModalOpen(false)}
                  className="p-2 hover:bg-stone-100 dark:hover:bg-zinc-800 rounded-full transition-colors"
                >
                  <X size={20} />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto p-6">
                <NewsPage />
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Background Selection Modal */}
      <AnimatePresence>
        {isBgModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="bg-white dark:bg-zinc-900 w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden"
            >
              <div className="p-6 border-b border-stone-100 dark:border-zinc-800 flex justify-between items-center">
                <h3 className="text-xl font-bold">Selecionar Fundo</h3>
                <button 
                  onClick={() => setIsBgModalOpen(false)}
                  className="p-2 hover:bg-stone-100 dark:hover:bg-zinc-800 rounded-full transition-colors"
                >
                  <X size={20} />
                </button>
              </div>
              
              <div className="p-6 space-y-6">
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {predefinedBgs.map((bg, index) => (
                    <button
                      key={index}
                      onClick={() => {
                        setCurrentBg(bg);
                        setIsBgModalOpen(false);
                      }}
                      className={cn(
                        "relative aspect-video rounded-xl overflow-hidden border-2 transition-all",
                        currentBg === bg ? "border-emerald-600 scale-[0.98]" : "border-transparent hover:border-emerald-300"
                      )}
                    >
                      <img src={bg} alt={`Gallery ${index}`} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                    </button>
                  ))}
                </div>

                <div className="pt-6 border-t border-stone-100 dark:border-zinc-800">
                  <input 
                    type="file" 
                    ref={fileInputRef} 
                    onChange={handleFileUpload} 
                    accept="image/*" 
                    className="hidden" 
                  />
                  <button 
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full py-4 bg-stone-100 dark:bg-zinc-800 text-stone-600 dark:text-zinc-300 font-bold rounded-2xl hover:bg-stone-200 dark:hover:bg-zinc-700 transition-colors flex items-center justify-center gap-2"
                  >
                    <Upload size={20} />
                    Fazer Upload de Imagem
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <SaveToNotebookModal
        isOpen={isNotebookModalOpen}
        onClose={() => setIsNotebookModalOpen(false)}
        onConfirm={confirmSaveToNotebook}
      />

      <AudioConfirmationModal
        isOpen={isAudioConfirmModalOpen}
        onClose={() => setIsAudioConfirmModalOpen(false)}
        onConfirm={confirmPlayAudio}
        isLoading={isAudioLoading}
      />
    </div>
  );
}
