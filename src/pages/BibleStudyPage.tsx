import React, { useState, useRef, useEffect } from 'react';
import { 
  Search, 
  Book, 
  Layers, 
  HelpCircle, 
  ArrowLeft,
  Map as MapIcon, 
  MessageSquare, 
  Sparkles,
  ChevronRight,
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
  Hourglass,
  Pencil,
  ExternalLink,
  Image as ImageIcon,
  GraduationCap,
  Layout,
  Cross,
  User,
  Brain,
  Zap,
  Trophy,
  Printer,
  CheckCircle,
  BookOpen,
  History
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { MarkdownRenderer } from '../components/MarkdownRenderer';
import { AudioSearchButton } from '../components/AudioSearchButton';
import { geminiService } from '../services/geminiService';
import { cn } from '../types';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { GOSPEL_AUTHORS } from '../constants/authors';
import { useCredits } from '../contexts/CreditContext';

import { useToast } from '../components/Toast';
import PostsPage from './PostsPage';
import { useOffline } from '../contexts/OfflineContext';
import { SaveToNotebookModal } from '../components/SaveToNotebookModal';
import { WifiOff } from 'lucide-react';
import { getRandomWaitingMessage } from '../constants/waitingMessages';

interface BibleStudyPageProps {
  deepThinking: boolean;
  setDeepThinking?: (value: boolean) => void;
  onNavigate?: (tab: string) => void;
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

export default function BibleStudyPage({ deepThinking, setDeepThinking, onNavigate }: BibleStudyPageProps) {
  const { showToast } = useToast();
  const { isOffline, downloadedChapters, downloadedMaterials, downloadChapter, downloadMaterial } = useOffline();
  const { balance, consumeCredits, estimateCredits } = useCredits();
  const [activeTab, setActiveTab] = useState<string>('bibles');
  const [searchQuery, setSearchQuery] = useState('');
  const [result, setResult] = useState('');
  const [resultThought, setResultThought] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isGeneratingSpeech, setIsGeneratingSpeech] = useState(false);
  const [loadingSource, setLoadingSource] = useState<string | null>(null);
  const [selectedBible, setSelectedBible] = useState('');
  const [selectedAuthor, setSelectedAuthor] = useState('');
  const [selectedWork, setSelectedWork] = useState('');
  const [compareVersion, setCompareVersion] = useState('Almeida');
  const [previousTab, setPreviousTab] = useState<string | null>(null);
  const [creationType, setCreationType] = useState<'lesson' | 'study' | 'outline' | 'devotional' | 'debate' | 'booklet' | 'message'>('lesson');
  const [messageType, setMessageType] = useState<'outline' | 'birthday' | 'wedding' | 'newyear' | 'graduation' | 'devotional' | 'funeral'>('outline');
  const [messageResult, setMessageResult] = useState('');
  const [messageResultThought, setMessageResultThought] = useState('');
  const [meaningSource, setMeaningSource] = useState('Dicionário Aurélio');
  const [meaningResult, setMeaningResult] = useState('');
  const [meaningResultThought, setMeaningResultThought] = useState('');
  const [wikiQuery, setWikiQuery] = useState('');
  const [wikiResult, setWikiResult] = useState('');
  const [wikiResultThought, setWikiResultThought] = useState('');
  const [isAiMeaningOpen, setIsAiMeaningOpen] = useState(false);
  const [meaningQuery, setMeaningQuery] = useState('');
  const [selectedModel, setSelectedModel] = useState('Gemini');
  const [isGeneratingMeaning, setIsGeneratingMeaning] = useState(false);
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
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
  const [isFavorited, setIsFavorited] = useState(false);
  const outlineRef = useRef<HTMLDivElement>(null);
  const bibleResultRef = useRef<HTMLDivElement>(null);

  // General Notes state
  const [notes, setNotes] = useState<{ id: string, title: string, content: string, date: string }[]>(() => {
    const saved = localStorage.getItem('preacher_notes');
    return saved ? JSON.parse(saved) : [];
  });

  // Pagination for Notes
  const [currentPage, setCurrentPage] = useState(1);
  const NOTES_PER_PAGE = 6;
  const totalPages = Math.ceil(notes.length / NOTES_PER_PAGE);
  const paginatedNotes = notes.slice((currentPage - 1) * NOTES_PER_PAGE, currentPage * NOTES_PER_PAGE);
  const [currentNote, setCurrentNote] = useState({ title: '', content: '' });

  const tabs = [
    { id: 'bibles', label: 'Bíblias de Estudo', icon: <Book size={18} /> },
    { id: 'authors', label: 'Visão do Autor', icon: <User size={18} /> },
    { id: 'religions', label: 'Outras Religiões', icon: <Cross size={18} className="rotate-180" /> },
    { id: 'creation-tool', label: 'Ferramenta de Criação', icon: <Sparkles size={18} /> },
    { id: 'posts', label: 'Post (Artes IA)', icon: <ImageIcon size={18} /> },
    { id: 'compare', label: 'Compare Versões', icon: <Layers size={18} /> },
    { id: 'meaning', label: 'Significado', icon: <HelpCircle size={18} /> },
    { id: 'wiki', label: 'Pesquisa Infinita - Wiki', icon: <Globe size={18} /> },
    { id: 'resources', label: 'Mapas e Notas', icon: <MapIcon size={18} /> },
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

  const [isNotebookModalOpen, setIsNotebookModalOpen] = useState(false);
  const [pendingNote, setPendingNote] = useState<{ title: string, content: string } | null>(null);

  const [studyHistory, setStudyHistory] = useState<StudyHistoryItem[]>(() => {
    const saved = localStorage.getItem('study_history');
    return saved ? JSON.parse(saved) : [];
  });
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);

  const addToHistory = (item: Omit<StudyHistoryItem, 'id' | 'date'>) => {
    const newItem: StudyHistoryItem = {
      ...item,
      id: Date.now().toString(),
      date: new Date().toLocaleString('pt-BR'),
    };
    const updatedHistory = [newItem, ...studyHistory].slice(0, 20);
    setStudyHistory(updatedHistory);
    localStorage.setItem('study_history', JSON.stringify(updatedHistory));
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
      else if (item.creationType === 'message') setMessageResult(item.result);
      
      if (item.thought) {
        if (item.creationType === 'lesson') setLessonResultThought(item.thought);
        else if (item.creationType === 'study') setStudyResultThought(item.thought);
        else if (item.creationType === 'outline') setOutlineThought(item.thought);
        else if (item.creationType === 'devotional') setDevotionalResultThought(item.thought);
        else if (item.creationType === 'debate') setDebateResultThought(item.thought);
        else if (item.creationType === 'booklet') setBookletResultThought(item.thought);
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

  const handleSaveToNotebook = (title: string, content: string) => {
    setPendingNote({ title, content });
    setIsNotebookModalOpen(true);
  };

  const confirmSaveToNotebook = (category: 'Anotações' | 'Pregações' | 'Estudos') => {
    if (!pendingNote) return;
    
    const saved = localStorage.getItem('preacher_notes');
    const entries = saved ? JSON.parse(saved) : [];
    const newEntry = {
      id: Date.now().toString(),
      title: pendingNote.title,
      content: pendingNote.content,
      category,
      date: new Date().toLocaleDateString('pt-BR'),
    };
    localStorage.setItem('preacher_notes', JSON.stringify([newEntry, ...entries]));
    showToast(`Salvo em ${category}! 📖✅`);
    setIsNotebookModalOpen(false);
    setPendingNote(null);
  };

  const saveNote = () => {
    if (!currentNote.title || !currentNote.content) return;
    
    let updatedNotes;
    if (editingNoteId) {
      updatedNotes = notes.map(n => n.id === editingNoteId ? { ...n, title: currentNote.title, content: currentNote.content } : n);
      showToast("Página atualizada! 📝✨");
    } else {
      const newNote = {
        id: Date.now().toString(),
        title: currentNote.title,
        content: currentNote.content,
        date: new Date().toLocaleDateString('pt-BR')
      };
      updatedNotes = [newNote, ...notes];
      showToast("Página guardada com sucesso! 📝✅");
    }
    
    setNotes(updatedNotes);
    localStorage.setItem('preacher_notes', JSON.stringify(updatedNotes));
    setCurrentNote({ title: '', content: '' });
    setEditingNoteId(null);
  };

  const deleteNote = (id: string) => {
    const updatedNotes = notes.filter(n => n.id !== id);
    setNotes(updatedNotes);
    localStorage.setItem('preacher_notes', JSON.stringify(updatedNotes));
    showToast("Página removida. 🗑️", 'info');
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

  const handleUnifiedCreation = () => {
    const cost = estimateCredits(creationType);
    
    setShowCreditConfirm({
      show: true,
      cost,
      action: () => {
        if (consumeCredits(cost, `Geração de ${creationType}: ${topic}`)) {
          if (creationType === 'lesson') handleCreateLesson();
          else if (creationType === 'study') handleCreateStudy();
          else if (creationType === 'outline') handleGenerateOutline();
          else if (creationType === 'devotional') handleCreateDevotional();
          else if (creationType === 'debate') handleCreateDebate();
          else if (creationType === 'booklet') handleCreateBooklet();
          else if (creationType === 'message') handleCreateMessage();
          else if (creationType === 'infographic') handleCreateInfographic();
          else if (creationType === 'slides_notebook') handleCreateSlidesPopup();
        } else {
          showToast("Saldo de créditos insuficiente! 🪙", 'error');
        }
      }
    });
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
   <img src="https://i.postimg.cc/pd0P8t4L/1000097620_removebg_preview.png" width="24" height="24" style="object-fit: contain;" />
   Gerado por **Imersão Bíblica IA**
   <img src="https://i.postimg.cc/pd0P8t4L/1000097620_removebg_preview.png" width="24" height="24" style="object-fit: contain;" />
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
            
            fullContent += `\n\n---\n\n## Página ${pageCount}: ${sectionTitle}\n\n${response.text}\n\n<div style="text-align: right; font-size: 10px; color: #888; margin-top: 20px; display: flex; align-items: center; justify-content: flex-end; gap: 5px;"><img src="https://i.postimg.cc/pd0P8t4L/1000097620_removebg_preview.png" width="16" height="16" /> Imersão Bíblica IA - Página ${pageCount} <img src="https://i.postimg.cc/pd0P8t4L/1000097620_removebg_preview.png" width="16" height="16" /></div>\n\n<div style="page-break-after: always;"></div>\n\n`;
            
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
        fullContent += `\n\n---\n\n<div style="text-align: center; padding: 40px; border-top: 2px solid #064e3b;">\n\n### FIM DA APOSTILA\n\n<div style="display: flex; align-items: center; justify-content: center; gap: 10px;"><img src="https://i.postimg.cc/pd0P8t4L/1000097620_removebg_preview.png" width="32" height="32" /> Gerado por **Imersão Bíblica IA** <img src="https://i.postimg.cc/pd0P8t4L/1000097620_removebg_preview.png" width="32" height="32" /></div>\n\n</div>`;
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

  const handleDownloadBookletPDF = async () => {
    const element = document.getElementById('booklet-content');
    if (!element) return;

    showToast("Gerando seu Ebook PDF... Isso pode levar um momento. 📄💎", 'info');
    try {
      const canvas = await html2canvas(element, { 
        scale: 1.5,
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff',
        windowWidth: 800 // Fixed width for consistent A4 aspect ratio
      });
      
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      
      const imgProps = pdf.getImageProperties(imgData);
      const imgHeight = (imgProps.height * pdfWidth) / imgProps.width;
      
      let heightLeft = imgHeight;
      let position = 0;

      // Add watermark to each page
      const addWatermark = (p: any) => {
        p.setFontSize(8);
        p.setTextColor(150);
        p.text("Gerado pelo App Imersão Bíblica IA", pdfWidth / 2, pdfHeight - 10, { align: 'center' });
      };

      pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, imgHeight);
      addWatermark(pdf);
      heightLeft -= pdfHeight;

      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, imgHeight);
        addWatermark(pdf);
        heightLeft -= pdfHeight;
      }

      pdf.save(`apostila-${topic.replace(/\s+/g, '_')}.pdf`);
      showToast("Ebook baixado com sucesso! 📚✅");
    } catch (error) {
      console.error('Erro ao gerar PDF:', error);
      showToast("Erro ao gerar PDF.", 'error');
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
    element.download = `${note.title.toLowerCase().replace(/\s+/g, '-')}.txt`;
    document.body.appendChild(element);
    element.click();
    showToast("Baixando página... 📄");
  };

  const handleShareNote = async (note: { title: string, content: string }) => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: note.title,
          text: note.content,
        });
        showToast("Compartilhando página! 🕊️");
      } catch (err) {
        console.error('Erro ao compartilhar:', err);
      }
    } else {
      navigator.clipboard.writeText(`${note.title}\n\n${note.content}`);
      showToast("Copiado para a área de transferência! 📋");
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

  const handleMeaningSearch = async () => {
    if (!searchQuery) return;
    setIsLoading(true);
    showToast(getRandomWaitingMessage(), 'info');
    try {
      setMeaningResult('');
      let prompt = '';
      
      if (meaningSource.includes('Gemini')) {
        prompt = `Explique o significado, origem e contexto de "${searchQuery}". Forneça uma resposta detalhada e educativa.`;
      } else if (meaningSource.includes('ChatGPT')) {
        prompt = `Atue como o ChatGPT e explique o significado de "${searchQuery}". Seja direto e forneça exemplos de uso.`;
      } else if (meaningSource.includes('IA')) {
        prompt = `Atue como uma Inteligência Artificial avançada e explique o significado de "${searchQuery}" sob diversas perspectivas.`;
      } else {
        prompt = `Forneça a definição e o significado de "${searchQuery}" de acordo com o padrão do ${meaningSource}. Inclua etimologia e exemplos se possível.`;
      }

      const response = await geminiService.generateTextWithThought(prompt, "Você é um lexicógrafo e especialista em língua portuguesa.", deepThinking);
      setMeaningResult(response.text);
      setMeaningResultThought(response.thought);
    } catch (error) {
      console.error(error);
      setMeaningResult('Erro ao buscar significado.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = async (source?: string) => {
    const query = searchQuery || topic;
    if (!query && !source) return;
    
    const searchSource = source || loadingSource;

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

      if (activeTab === 'religions') {
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
      } else if (activeTab === 'compare') {
        const response = await geminiService.generateTextWithThought(`Compare o texto bíblico "${query}" na versão NVI com a versão ${compareVersion}. Explique as nuances de tradução.`, undefined, deepThinking);
        responseText = response.text;
        responseThought = response.thought;
      } else if (searchSource) {
        // Specific source search from Bibles tab
        let prompt = `
        Termo pesquisado: "${query || 'Geral'}"
        Fonte selecionada: "${searchSource}"
        
        `;
        if (searchSource === 'Todas as Bíblias') {
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
        // General search
        const response = await geminiService.generateTextWithThought(`
        Termo pesquisado: "${query}"
        Fonte selecionada: "Geral (Shedd, Thompson, Genebra)"
        
        Forneça comentários bíblicos detalhados sobre: ${query}. Use fontes como Shedd, Thompson e Genebra.
        Se não houver resultados diretos, sugira versículos, estudos e insights teológicos.`, undefined, deepThinking);
        responseText = response.text;
        responseThought = response.thought;
      }

      setResult(responseText);
      setResultThought(responseThought);
      
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

  const handleCopy = () => {
    navigator.clipboard.writeText(result);
    showToast("Copiado! Agora é só colar onde quiser! 📋✨");
  };

  const handleSpeak = async () => {
    setIsGeneratingSpeech(true);
    showToast("Preparando a voz da IA... 🔊📖", 'info');
    try {
      const audio = await geminiService.generateSpeech(result.slice(0, 1000));
      if (audio) {
        const audioObj = new Audio(audio);
        audioObj.play();
        showToast("Iniciando leitura... Ouça com atenção! 🔊✨");
      } else {
        showToast("Erro ao gerar áudio.", 'error');
      }
    } catch (error) {
      console.error(error);
      showToast("Erro ao gerar áudio.", 'error');
    } finally {
      setIsGeneratingSpeech(false);
    }
  };

  const handleDownloadResult = async () => {
    if (!bibleResultRef.current) return;
    showToast("Preparando seu arquivo... Ficou lindo! 📄💎", 'info');
    try {
      const canvas = await html2canvas(bibleResultRef.current, { 
        scale: 2,
        useCORS: true,
        onclone: (clonedDoc) => {
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
          `;
          clonedDoc.head.appendChild(style);
        }
      });
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const imgProps = pdf.getImageProperties(imgData);
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
      
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(`estudo-biblico-${searchQuery.slice(0, 20) || 'comentario'}.pdf`);
    } catch (error) {
      console.error('Erro ao gerar PDF:', error);
      // Fallback to text download
      const element = document.createElement("a");
      const file = new Blob([result], {type: 'text/plain'});
      element.href = URL.createObjectURL(file);
      element.download = "comentario-biblico.txt";
      document.body.appendChild(element);
      element.click();
    }
  };

  const handleShareResult = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Comentário Bíblico',
          text: result,
        });
        showToast("Compartilhando a benção! 🕊️✨");
      } catch (err) {
        console.error('Erro ao compartilhar:', err);
      }
    } else {
      handleCopy();
    }
  };

  const handleSaveDraft = () => {
    const draft = {
      id: Date.now().toString(),
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
  const [isResourceImageModalOpen, setIsResourceImageModalOpen] = useState(false);
  const [resourceImageSource, setResourceImageSource] = useState('');
  const [resourceStudyResult, setResourceStudyResult] = useState('');

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

  const handleGenerateOutline = async () => {
    if (!topic) return;
    setIsLoading(true);
    showToast(getRandomWaitingMessage(), 'info');
    try {
      setOutline('');
      setOutlineThought('');
      setSlidesResult('');
      const response = await geminiService.generateOutlineWithThought(topic, deepThinking);
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
    } catch (error) {
      console.error(error);
      showToast("Erro ao gerar lição.", 'error');
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
    } catch (error) {
      console.error(error);
      showToast("Erro ao gerar estudo.", 'error');
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
    } catch (error) {
      console.error(error);
      showToast("Erro ao gerar debate.", 'error');
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
    } catch (error) {
      console.error(error);
      showToast("Erro ao gerar devocional.", 'error');
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
    } else {
      setOutline(editedOutline);
    }
    setIsEditingOutline(false);
  };

  const handleCancelEdit = () => {
    setEditedOutline(creationType === 'booklet' ? bookletResult : outline);
    setIsEditingOutline(false);
  };

  const exportPDF = async () => {
    if (!outlineRef.current) return;
    showToast("Gerando seu PDF... Quase pronto! 📄💎", 'info');
    try {
      const canvas = await html2canvas(outlineRef.current, { 
        scale: 2,
        useCORS: true,
        onclone: (clonedDoc) => {
          const style = clonedDoc.createElement('style');
          style.innerHTML = `
            * {
              color: #1c1917 !important;
              background-color: #ffffff !important;
              border-color: #e7e5e4 !important;
            }
          `;
          clonedDoc.head.appendChild(style);
        }
      });
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const imgProps = pdf.getImageProperties(imgData);
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
      
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(`esboco-${topic.slice(0, 20)}.pdf`);
    } catch (error) {
      console.error('Erro ao gerar PDF:', error);
    }
  };

  const studyBibles = [
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
    "Bíblia de Jerusalém (Versão Católica)",
    "Bíblia do Obreiro Aprovado (CPAD)",
    "Bíblia do Pregador",
    "Bíblia do Pregador Fiel",
    "Bíblia do Pregador Pentecostal",
    "Bíblia em esboços",
    "Bíblia Judaica Completa",
    "Bíblia Judaica E A Bíblia Cristã",
    "Bíblia Missionária de Estudo",
    "Bíblia NVI de Estudo",
    "Bíblia Para Pregadoras E Lideres | Geziel Gomes",
    "Bíblia Pregação Expositiva | RA",
    "Bíblia Sagrada – Tradução Oficial da CNBB (Versão Católica)",
    "Bíblia Sagrada Missionária",
    "Bíblia Shedd",
    "Bíblia Thompson",
    "Bíblia Tradução do Novo mundo (Versão TJ)",
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

  const otherReligionsBooks = [
    "Alcorão (Islamismo)",
    "Livro de Mórmon (Mórmons)",
    "O Livro dos Espíritos (Espiritismo)",
    "Tanakh (Judaísmo)",
    "Tripitaka (Budismo)",
    "Veda (Hinduísmo)"
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
          type: 'study_bible',
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
    <div className="space-y-8">
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
                    {studyHistory.map((item) => (
                      <button
                        key={item.id}
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
                          {item.result.replace(/[#*`]/g, '').slice(0, 150)}...
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
                <MarkdownRenderer content={creationPopup.content} />
              </div>

              <div className="p-6 border-t border-stone-100 dark:border-zinc-800 bg-stone-50 dark:bg-zinc-800/50 flex gap-3">
                <button 
                  onClick={() => {
                    navigator.clipboard.writeText(creationPopup.content);
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
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-xs font-bold uppercase tracking-widest text-stone-400 ml-2">Módulos de Estudo</h3>
        <button 
          onClick={() => setIsHistoryOpen(true)}
          className="flex items-center gap-2 px-4 py-2 bg-stone-100 dark:bg-zinc-800 text-stone-600 dark:text-zinc-300 text-xs font-bold rounded-xl hover:bg-stone-200 transition-all"
        >
          <History size={16} />
          Histórico
        </button>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 pb-6 border-b border-stone-100 dark:border-zinc-800">
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
            className={cn(
              "flex flex-col items-center justify-center gap-3 p-4 rounded-2xl text-xs font-bold transition-all border",
              activeTab === tab.id 
                ? "bg-emerald-600 border-emerald-500 text-white shadow-lg shadow-emerald-600/20 scale-105" 
                : "bg-white dark:bg-zinc-900 border-stone-200 dark:border-zinc-800 text-stone-500 hover:bg-stone-50 dark:hover:bg-zinc-800 hover:border-emerald-200 dark:hover:border-emerald-900/50"
            )}
          >
            <div className={cn(
              "p-2 rounded-xl",
              activeTab === tab.id ? "bg-white/20" : "bg-stone-100 dark:bg-zinc-800 text-emerald-600"
            )}>
              {tab.icon}
            </div>
            <span className="text-center">{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Content Area */}
      <div ref={searchInputRef} className="min-h-[400px]">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-6"
          >
            {activeTab === 'bibles' && (
              <div className="space-y-6">
                <div className="flex flex-col md:flex-row gap-4">
                  <div className="relative flex-[2]">
                    <Pencil className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400" size={18} />
                    <input
                      type="text"
                      placeholder="Escreva um tema ou passagem neste campo e clique nos botões. O texto vai aparecer abaixo na página"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-12 pr-4 py-4 bg-white dark:bg-zinc-900 border border-stone-200 dark:border-zinc-800 rounded-2xl focus:ring-2 focus:ring-emerald-500 outline-none text-xs md:text-sm"
                    />
                  </div>
                  <div className="flex-1 flex flex-col sm:flex-row gap-2">
                      <select 
                        value={selectedBible}
                        onChange={(e) => setSelectedBible(e.target.value)}
                        className="flex-1 px-4 py-4 bg-white dark:bg-zinc-900 border border-stone-200 dark:border-zinc-800 rounded-2xl outline-none text-sm"
                      >
                        <option value="">Selecione a Bíblia...</option>
                        <option value="Todos os Recursos">TODOS OS RECURSOS</option>
                        <option value="Todas as Bíblias">Todas as Bíblias</option>
                        <option value="Todos os Comentários">Todos os Comentários</option>
                        <option value="Todos os Dicionários">Todos os Dicionários</option>
                        <option value="Todas as Enciclopédias">Todas as Enciclopédias</option>
                        {studyBibles.map(bible => (
                          <option key={bible} value={bible}>{bible}</option>
                        ))}
                      </select>
                    <button
                      onClick={() => handleSearch(selectedBible)}
                      disabled={isLoading || !selectedBible}
                      className="px-6 py-4 bg-emerald-600 text-white font-bold rounded-2xl hover:bg-emerald-700 disabled:opacity-50 flex items-center justify-center gap-2 transition-all"
                    >
                      {isLoading && loadingSource === selectedBible ? (
                        <>
                          <Hourglass className="animate-spin" size={18} />
                          Aguarde...
                        </>
                      ) : (
                        <>
                          <Search size={18} />
                          Pesquisar
                        </>
                      )}
                    </button>
                  </div>
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
                      <MarkdownRenderer content={result} onSearch={handleWikiSearch} />
                    </div>
                    
                    <div className="flex flex-wrap gap-3">
                      <button
                        onClick={handleCopy}
                        className="flex-1 py-3 bg-stone-100 dark:bg-zinc-800 text-stone-600 dark:text-zinc-300 font-bold rounded-xl hover:bg-stone-200 flex items-center justify-center gap-2"
                      >
                        <Copy size={18} />
                        Copiar
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
                        Wiki
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
                        onClick={() => handleSaveToNotebook(selectedBible || 'Imersão', result)}
                        className="flex-1 py-3 bg-emerald-600 text-white font-bold rounded-xl hover:bg-emerald-700 flex items-center justify-center gap-2"
                      >
                        <Save size={18} />
                        Salvar no Caderno
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'authors' && (
              <div className="space-y-6">
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
                      {GOSPEL_AUTHORS.map(author => (
                        <option key={author.name} value={author.name}>{author.name}</option>
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
                      {selectedAuthor && GOSPEL_AUTHORS.find(a => a.name === selectedAuthor)?.works.map(work => (
                        <option key={work} value={work}>{work}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="relative flex-1">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400" size={18} />
                    <input 
                      type="text"
                      placeholder="Sobre o que você quer saber a visão do autor?"
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
                    Consultar Visão
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
                      <MarkdownRenderer content={result} onSearch={handleWikiSearch} />
                    </div>
                    
                    <div className="flex flex-wrap gap-3">
                      <button onClick={handleCopy} className="flex-1 py-3 bg-stone-100 dark:bg-zinc-800 text-stone-600 dark:text-zinc-300 font-bold rounded-xl hover:bg-stone-200 flex items-center justify-center gap-2"><Copy size={18} /> Copiar</button>
                      <button onClick={handleDownloadResult} className="flex-1 py-3 bg-stone-100 dark:bg-zinc-800 text-stone-600 dark:text-zinc-300 font-bold rounded-xl hover:bg-stone-200 flex items-center justify-center gap-2"><Download size={18} /> Baixar</button>
                      <button onClick={() => handleWikiSearch(searchQuery)} className="flex-1 py-3 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 font-bold rounded-xl hover:bg-blue-200 flex items-center justify-center gap-2"><Globe size={18} /> Wiki</button>
                      <button onClick={handleShareResult} className="flex-1 py-3 bg-stone-100 dark:bg-zinc-800 text-stone-600 dark:text-zinc-300 font-bold rounded-xl hover:bg-stone-200 flex items-center justify-center gap-2"><Share2 size={18} /> Compartilhar</button>
                      <button onClick={() => handleSaveToNotebook(selectedAuthor || 'Visão do Autor', result)} className="flex-1 py-3 bg-emerald-600 text-white font-bold rounded-xl hover:bg-emerald-700 flex items-center justify-center gap-2"><Save size={18} /> Salvar no Caderno</button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'religions' && (
              <div className="space-y-6">
                <div className="flex flex-col md:flex-row gap-4">
                  <div className="relative flex-[2]">
                    <Pencil className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400" size={18} />
                    <input
                      type="text"
                      placeholder="Escreva um tema ou assunto para pesquisar em outras religiões..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-12 pr-4 py-4 bg-white dark:bg-zinc-900 border border-stone-200 dark:border-zinc-800 rounded-2xl focus:ring-2 focus:ring-emerald-500 outline-none text-xs md:text-sm"
                    />
                  </div>
                  <div className="flex-1 flex flex-col sm:flex-row gap-2">
                    <select 
                      value={selectedBible}
                      onChange={(e) => setSelectedBible(e.target.value)}
                      className="flex-1 px-4 py-4 bg-white dark:bg-zinc-900 border border-stone-200 dark:border-zinc-800 rounded-2xl outline-none text-sm"
                    >
                      <option value="">Selecione o Livro...</option>
                      {otherReligionsBooks.map(book => (
                        <option key={book} value={book}>{book}</option>
                      ))}
                    </select>
                    <button
                      onClick={() => handleSearch(selectedBible)}
                      disabled={isLoading || !selectedBible}
                      className="px-6 py-4 bg-emerald-600 text-white font-bold rounded-2xl hover:bg-emerald-700 disabled:opacity-50 flex items-center justify-center gap-2 transition-all"
                    >
                      {isLoading && loadingSource === selectedBible ? (
                        <>
                          <Hourglass className="animate-spin" size={18} />
                          Aguarde...
                        </>
                      ) : (
                        <>
                          <Search size={18} />
                          Pesquisar
                        </>
                      )}
                    </button>
                  </div>
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
                      <MarkdownRenderer content={result} onSearch={handleWikiSearch} />
                    </div>
                    
                    <div className="flex flex-wrap gap-2">
                      {result && !isOffline && (
                        <button 
                          onClick={handleDownloadOffline}
                          className="px-4 py-2 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 text-xs font-bold rounded-xl hover:bg-emerald-100 flex items-center gap-2 border border-emerald-100 dark:border-emerald-800/30 transition-all"
                          title="Salvar para Offline"
                        >
                          <WifiOff size={14} /> Offline
                        </button>
                      )}
                      <button onClick={handleCopy} className="px-4 py-2 bg-stone-50 dark:bg-zinc-800 text-stone-600 dark:text-zinc-300 text-xs font-bold rounded-xl hover:bg-stone-100 flex items-center gap-2 border border-stone-100 dark:border-zinc-700 transition-all"><Copy size={14} /> Copiar</button>
                      <button onClick={handleDownloadResult} className="px-4 py-2 bg-stone-50 dark:bg-zinc-800 text-stone-600 dark:text-zinc-300 text-xs font-bold rounded-xl hover:bg-stone-100 flex items-center gap-2 border border-stone-100 dark:border-zinc-700 transition-all"><Download size={14} /> Baixar</button>
                      <button onClick={() => handleWikiSearch(searchQuery)} className="px-4 py-2 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 text-xs font-bold rounded-xl hover:bg-blue-100 flex items-center gap-2 border border-blue-100 dark:border-blue-800/30 transition-all"><Globe size={14} /> Wiki</button>
                      <button onClick={handleShareResult} className="px-4 py-2 bg-stone-50 dark:bg-zinc-800 text-stone-600 dark:text-zinc-300 text-xs font-bold rounded-xl hover:bg-stone-100 flex items-center gap-2 border border-stone-100 dark:border-zinc-700 transition-all"><Share2 size={14} /> Compartilhar</button>
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
                  <div className="flex flex-col md:flex-row gap-4">
                    <div className="relative flex-[2]">
                      <input
                        type="text"
                        placeholder="Digite o tema (ex: A Graça de Deus)"
                        value={topic}
                        onChange={(e) => setTopic(e.target.value)}
                        className="w-full pl-6 pr-6 py-4 bg-stone-50 dark:bg-zinc-800 border border-stone-200 dark:border-zinc-700 rounded-2xl focus:ring-2 focus:ring-emerald-500 outline-none"
                      />
                    </div>
                    <div className="flex-1 flex flex-col sm:flex-row gap-2">
                      <select 
                        value={creationType}
                        onChange={(e) => setCreationType(e.target.value as any)}
                        className="flex-1 px-4 py-4 bg-white dark:bg-zinc-900 border border-stone-200 dark:border-zinc-800 rounded-2xl outline-none text-sm"
                      >
                        <option value="lesson">Gerar Lição Célula</option>
                        <option value="study">Gerar Estudo Bíblico</option>
                        <option value="outline">Gerar Esboço Pregação</option>
                        <option value="devotional">Gerar Devocional</option>
                        <option value="debate">Gerar Debate</option>
                        <option value="booklet">Gerar Apostila</option>
                        <option value="message">Gerar Mensagem</option>
                      </select>
                      {creationType === 'message' && (
                        <select 
                          value={messageType}
                          onChange={(e) => setMessageType(e.target.value as any)}
                          className="flex-1 px-4 py-4 bg-white dark:bg-zinc-900 border border-stone-200 dark:border-zinc-800 rounded-2xl outline-none text-sm"
                        >
                          <option value="outline">Pregação</option>
                          <option value="birthday">Mensagem de Aniversário</option>
                          <option value="wedding">Mensagem de Casamento</option>
                          <option value="newyear">Mensagem Fim do ano</option>
                          <option value="graduation">Mensagem Formatura</option>
                          <option value="devotional">Mensagem Devocional</option>
                          <option value="funeral">Mensagem Velório</option>
                          <option value="children">Mensagem Infantil</option>
                        </select>
                      )}
                      <button
                        onClick={handleUnifiedCreation}
                        disabled={isLoading || !topic}
                        className="px-8 py-4 bg-emerald-600 text-white font-bold rounded-2xl hover:bg-emerald-700 disabled:opacity-50 flex items-center justify-center gap-2 transition-all"
                      >
                        {isLoading ? <Loader2 className="animate-spin" size={20} /> : <Sparkles size={20} />}
                        Gerar
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
                    <div className="bg-white dark:bg-zinc-900 p-8 md:p-12 rounded-3xl border border-stone-200 dark:border-zinc-800 shadow-lg prose dark:prose-invert max-w-none">
                      <MarkdownRenderer content={showLeaderGuide ? leaderGuide : lessonResult} onSearch={handleWikiSearch} />
                    </div>
                    <div className="flex flex-wrap gap-3">
                      <button onClick={() => { navigator.clipboard.writeText(showLeaderGuide ? leaderGuide : lessonResult); showToast("Copiado! 📋✨"); }} className="flex-1 py-3 bg-stone-100 dark:bg-zinc-800 text-stone-600 dark:text-zinc-300 font-bold rounded-xl hover:bg-stone-200 flex items-center justify-center gap-2"><Copy size={18} /> Copiar</button>
                      <button onClick={() => { handleDownloadResult(); showToast("Baixando... 📄💎"); }} className="flex-1 py-3 bg-stone-100 dark:bg-zinc-800 text-stone-600 dark:text-zinc-300 font-bold rounded-xl hover:bg-stone-200 flex items-center justify-center gap-2"><Download size={18} /> Baixar</button>
                      <button onClick={() => handleWikiSearch(topic)} className="flex-1 py-3 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 font-bold rounded-xl hover:bg-blue-200 flex items-center justify-center gap-2"><Globe size={18} /> Wiki</button>
                      <button onClick={() => { handleShareResult(); showToast("Compartilhando... 🕊️✨"); }} className="flex-1 py-3 bg-stone-100 dark:bg-zinc-800 text-stone-600 dark:text-zinc-300 font-bold rounded-xl hover:bg-stone-200 flex items-center justify-center gap-2"><Share2 size={18} /> Compartilhar</button>
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
                    <div className="bg-white dark:bg-zinc-900 p-8 md:p-12 rounded-3xl border border-stone-200 dark:border-zinc-800 shadow-lg prose dark:prose-invert max-w-none">
                      <MarkdownRenderer content={studyResult} onSearch={handleWikiSearch} />
                    </div>
                    <div className="flex flex-wrap gap-3">
                      <button onClick={() => { navigator.clipboard.writeText(studyResult); showToast("Copiado! 📋✨"); }} className="flex-1 py-3 bg-stone-100 dark:bg-zinc-800 text-stone-600 dark:text-zinc-300 font-bold rounded-xl hover:bg-stone-200 flex items-center justify-center gap-2"><Copy size={18} /> Copiar</button>
                      <button onClick={() => { handleDownloadResult(); showToast("Baixando... 📄💎"); }} className="flex-1 py-3 bg-stone-100 dark:bg-zinc-800 text-stone-600 dark:text-zinc-300 font-bold rounded-xl hover:bg-stone-200 flex items-center justify-center gap-2"><Download size={18} /> Baixar</button>
                      <button onClick={() => handleWikiSearch(topic)} className="flex-1 py-3 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 font-bold rounded-xl hover:bg-blue-200 flex items-center justify-center gap-2"><Globe size={18} /> Wiki</button>
                      <button onClick={() => { handleShareResult(); showToast("Compartilhando... 🕊️✨"); }} className="flex-1 py-3 bg-stone-100 dark:bg-zinc-800 text-stone-600 dark:text-zinc-300 font-bold rounded-xl hover:bg-stone-200 flex items-center justify-center gap-2"><Share2 size={18} /> Compartilhar</button>
                      <button onClick={handleSaveDraft} className="flex-1 py-3 bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400 font-bold rounded-xl hover:bg-amber-100 flex items-center justify-center gap-2"><Pencil size={18} /> Salvar Rascunho</button>
                      <button onClick={() => handleSaveToNotebook('Imersão Popular', studyResult)} className="flex-1 py-3 bg-emerald-600 text-white font-bold rounded-xl hover:bg-emerald-700 flex items-center justify-center gap-2"><Save size={18} /> Salvar no Caderno</button>
                      <button onClick={handleCreateSlides} disabled={isGeneratingSlides} className="flex-1 py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 flex items-center justify-center gap-2 disabled:opacity-50">
                        {isGeneratingSlides ? <Loader2 className="animate-spin" size={18} /> : <Layout size={18} />}
                        Criar Slides IA
                      </button>
                    </div>
                  </div>
                )}

                {outline && creationType === 'outline' && (
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
                          <textarea value={editedOutline} onChange={(e) => setEditedOutline(e.target.value)} className="w-full h-[600px] p-8 bg-stone-50 dark:bg-zinc-800 border border-emerald-500 rounded-3xl outline-none font-mono text-sm leading-relaxed" />
                        ) : (
                          <MarkdownRenderer content={outline} onSearch={handleWikiSearch} />
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
                          <button onClick={exportPDF} className="w-full py-3 bg-emerald-600 text-white font-bold rounded-xl hover:bg-emerald-700 flex items-center justify-center gap-2"><Download size={18} /> Baixar PDF</button>
                          <button onClick={() => handleWikiSearch(topic)} className="w-full py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 flex items-center justify-center gap-2"><Globe size={18} /> Pesquisa Wiki</button>
                          <button onClick={() => handleSaveToNotebook('Esboço', outline)} className="w-full py-3 bg-emerald-600 text-white font-bold rounded-xl hover:bg-emerald-700 flex items-center justify-center gap-2"><Save size={18} /> Salvar no Caderno</button>
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
                    <div className="bg-white dark:bg-zinc-900 p-8 md:p-12 rounded-3xl border border-stone-200 dark:border-zinc-800 shadow-lg prose dark:prose-invert max-w-none">
                      <MarkdownRenderer content={debateResult} onSearch={handleWikiSearch} />
                    </div>
                    <div className="flex flex-wrap gap-3">
                      <button onClick={() => { navigator.clipboard.writeText(debateResult); showToast("Copiado! 📋✨"); }} className="flex-1 py-3 bg-stone-100 dark:bg-zinc-800 text-stone-600 dark:text-zinc-300 font-bold rounded-xl hover:bg-stone-200 flex items-center justify-center gap-2"><Copy size={18} /> Copiar</button>
                      <button onClick={() => { handleDownloadResult(); showToast("Baixando... 📄💎"); }} className="flex-1 py-3 bg-stone-100 dark:bg-zinc-800 text-stone-600 dark:text-zinc-300 font-bold rounded-xl hover:bg-stone-200 flex items-center justify-center gap-2"><Download size={18} /> Baixar</button>
                      <button onClick={() => handleSaveToNotebook('Debate Teológico', debateResult)} className="flex-1 py-3 bg-emerald-600 text-white font-bold rounded-xl hover:bg-emerald-700 flex items-center justify-center gap-2"><Save size={18} /> Salvar no Caderno</button>
                    </div>
                  </div>
                )}

                {devotionalResult && creationType === 'devotional' && (
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
                    <div className="bg-white dark:bg-zinc-900 p-8 md:p-12 rounded-3xl border border-stone-200 dark:border-zinc-800 shadow-lg prose dark:prose-invert max-w-none">
                      <MarkdownRenderer content={devotionalResult} onSearch={handleWikiSearch} />
                    </div>
                    <div className="flex flex-wrap gap-3">
                      <button onClick={() => { navigator.clipboard.writeText(devotionalResult); showToast("Copiado! 📋✨"); }} className="flex-1 py-3 bg-stone-100 dark:bg-zinc-800 text-stone-600 dark:text-zinc-300 font-bold rounded-xl hover:bg-stone-200 flex items-center justify-center gap-2"><Copy size={18} /> Copiar</button>
                      <button onClick={() => { handleDownloadResult(); showToast("Baixando... 📄💎"); }} className="flex-1 py-3 bg-stone-100 dark:bg-zinc-800 text-stone-600 dark:text-zinc-300 font-bold rounded-xl hover:bg-stone-200 flex items-center justify-center gap-2"><Download size={18} /> Baixar</button>
                      <button onClick={() => handleWikiSearch(topic)} className="flex-1 py-3 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 font-bold rounded-xl hover:bg-blue-200 flex items-center justify-center gap-2"><Globe size={18} /> Wiki</button>
                      <button onClick={() => { handleShareResult(); showToast("Compartilhando... 🕊️✨"); }} className="flex-1 py-3 bg-stone-100 dark:bg-zinc-800 text-stone-600 dark:text-zinc-300 font-bold rounded-xl hover:bg-stone-200 flex items-center justify-center gap-2"><Share2 size={18} /> Compartilhar</button>
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
                    <div className="bg-white dark:bg-zinc-900 p-8 md:p-12 rounded-3xl border border-stone-200 dark:border-zinc-800 shadow-lg prose dark:prose-invert max-w-none">
                      <MarkdownRenderer content={messageResult} onSearch={handleWikiSearch} />
                    </div>
                    <div className="flex flex-wrap gap-3">
                      <button onClick={() => { navigator.clipboard.writeText(messageResult); showToast("Copiado! 📋✨"); }} className="flex-1 py-3 bg-stone-100 dark:bg-zinc-800 text-stone-600 dark:text-zinc-300 font-bold rounded-xl hover:bg-stone-200 flex items-center justify-center gap-2"><Copy size={18} /> Copiar</button>
                      <button onClick={() => { handleDownloadResult(); showToast("Baixando... 📄💎"); }} className="flex-1 py-3 bg-stone-100 dark:bg-zinc-800 text-stone-600 dark:text-zinc-300 font-bold rounded-xl hover:bg-stone-200 flex items-center justify-center gap-2"><Download size={18} /> Baixar</button>
                      <button onClick={() => handleWikiSearch(topic)} className="flex-1 py-3 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 font-bold rounded-xl hover:bg-blue-200 flex items-center justify-center gap-2"><Globe size={18} /> Wiki</button>
                      <button onClick={() => { handleShareResult(); showToast("Compartilhando... 🕊️✨"); }} className="flex-1 py-3 bg-stone-100 dark:bg-zinc-800 text-stone-600 dark:text-zinc-300 font-bold rounded-xl hover:bg-stone-200 flex items-center justify-center gap-2"><Share2 size={18} /> Compartilhar</button>
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
                          className="w-full h-[600px] p-8 bg-stone-50 dark:bg-zinc-800 border border-emerald-500 rounded-3xl outline-none font-mono text-sm leading-relaxed" 
                        />
                      ) : (
                        <MarkdownRenderer content={bookletResult} onSearch={handleWikiSearch} />
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
                          <button onClick={() => { setIsEditingOutline(true); setEditedOutline(bookletResult); }} className="flex-1 py-3 bg-stone-100 dark:bg-zinc-800 text-stone-600 dark:text-zinc-300 font-bold rounded-xl hover:bg-stone-200 flex items-center justify-center gap-2"><Edit size={18} /> Editar</button>
                          <button onClick={() => { navigator.clipboard.writeText(bookletResult); showToast("Copiado! 📋✨"); }} className="flex-1 py-3 bg-stone-100 dark:bg-zinc-800 text-stone-600 dark:text-zinc-300 font-bold rounded-xl hover:bg-stone-200 flex items-center justify-center gap-2"><Copy size={18} /> Copiar</button>
                          <button onClick={handleDownloadBookletPDF} className="flex-1 py-3 bg-stone-100 dark:bg-zinc-800 text-stone-600 dark:text-zinc-300 font-bold rounded-xl hover:bg-stone-200 flex items-center justify-center gap-2"><Download size={18} /> Baixar PDF</button>
                          <button onClick={() => { handleShareResult(); showToast("Compartilhando... 🕊️✨"); }} className="flex-1 py-3 bg-stone-100 dark:bg-zinc-800 text-stone-600 dark:text-zinc-300 font-bold rounded-xl hover:bg-stone-200 flex items-center justify-center gap-2"><Share2 size={18} /> Compartilhar</button>
                          <button onClick={handleSaveDraft} className="flex-1 py-3 bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400 font-bold rounded-xl hover:bg-amber-100 flex items-center justify-center gap-2"><Pencil size={18} /> Salvar Rascunho</button>
                          <button onClick={() => handleSaveToNotebook('Apostila Completa', bookletResult)} className="flex-1 py-3 bg-emerald-600 text-white font-bold rounded-xl hover:bg-emerald-700 flex items-center justify-center gap-2"><Save size={18} /> Salvar no Caderno</button>
                        </>
                      )}
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
                        placeholder="Título da nota"
                        value={currentNote.title}
                        onChange={(e) => setCurrentNote({ ...currentNote, title: e.target.value })}
                        className="w-full p-4 bg-stone-50 dark:bg-zinc-800 border border-stone-200 dark:border-zinc-700 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none"
                      />
                      <textarea
                        placeholder="Conteúdo da página..."
                        value={currentNote.content}
                        onChange={(e) => setCurrentNote({ ...currentNote, content: e.target.value })}
                        className="w-full p-4 bg-stone-50 dark:bg-zinc-800 border border-stone-200 dark:border-zinc-700 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none h-64 resize-none"
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
                      placeholder="Pesquisar em suas páginas..."
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
                <div className="flex flex-col md:flex-row gap-4">
                  <div className="relative flex-1">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400" size={20} />
                    <input
                      type="text"
                      placeholder={activeTab === 'compare' ? "Digite o versículo (ex: João 3:16)" : "O que você deseja pesquisar?"}
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                      className="w-full pl-12 pr-12 py-4 bg-white dark:bg-zinc-900 border border-stone-200 dark:border-zinc-800 rounded-2xl focus:ring-2 focus:ring-emerald-500 outline-none"
                    />
                    <div className="absolute right-4 top-1/2 -translate-y-1/2">
                      <AudioSearchButton onResult={(text) => { setSearchQuery(text); handleSearch(text); }} />
                    </div>
                  </div>
                  {activeTab === 'compare' && (
                    <select 
                      value={compareVersion}
                      onChange={(e) => setCompareVersion(e.target.value)}
                      className="px-4 py-4 bg-white dark:bg-zinc-900 border border-stone-200 dark:border-zinc-800 rounded-2xl outline-none"
                    >
                      <option value="Almeida Revista e Corrigida">Almeida Revista e Corrigida</option>
                      <option value="Almeida Revista Atualizada">Almeida Revista Atualizada</option>
                      <option value="Almeida Corrigida Fiel">Almeida Corrigida Fiel</option>
                      <option value="Almeida século 21">Almeida século 21</option>
                      <option value="NAA">Nova Almeida Atualizada</option>
                      <option value="Nova Versão Transformadora">Nova Versão Transformadora</option>
                      <option value="Nova Versão Internacional">Nova Versão Internacional</option>
                      <option value="Tradução Brasileira">Tradução Brasileira</option>
                      <option value="Bíblia Viva">Bíblia Viva</option>
                      <option value="Bíblia de Jerusalém">Bíblia de Jerusalém</option>
                      <option value="Bíblia Pastoral">Bíblia Pastoral</option>
                      <option value="Bíblia da CNBB">Bíblia da CNBB</option>
                      <option value="KJV">King James Version (EN)</option>
                      <option value="Vulgata">Vulgata Latina</option>
                      <option value="VT Hebraico">VT Hebraico</option>
                      <option value="NT Grego">NT Grego</option>
                    </select>
                  )}
                  <button
                    onClick={() => handleSearch()}
                    disabled={isLoading}
                    className="px-8 py-4 bg-emerald-600 text-white font-bold rounded-2xl hover:bg-emerald-700 disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {isLoading ? <Loader2 className="animate-spin" size={20} /> : <Search size={20} />}
                    Pesquisar
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
                      <MarkdownRenderer content={result} onSearch={handleWikiSearch} />
                    </div>
                    <div className="flex gap-3">
                      <button
                        onClick={() => handleSaveToNotebook(activeTab === 'compare' ? 'Comparação de Versões' : 'Comentário Bíblico', result)}
                        className="flex-1 py-3 bg-emerald-600 text-white font-bold rounded-xl hover:bg-emerald-700 flex items-center justify-center gap-2"
                      >
                        <Save size={18} />
                        Salvar no Caderno
                      </button>
                      <button
                        onClick={handleCopy}
                        className="flex-1 py-3 bg-stone-100 dark:bg-zinc-800 text-stone-600 dark:text-zinc-300 font-bold rounded-xl hover:bg-stone-200 flex items-center justify-center gap-2"
                      >
                        <Copy size={18} />
                        Copiar
                      </button>
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
                      placeholder="Pesquisar em meus estudos..."
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
                              <div key={i} className="w-4 h-4 rounded-full bg-stone-100 dark:bg-zinc-800 border border-stone-200 dark:border-zinc-700 shadow-inner" />
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
                                  navigator.clipboard.writeText(`${note.title}\n\n${note.content}`);
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
                                title="Wiki"
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
                                src="https://i.postimg.cc/pd0P8t4L/1000097620_removebg_preview.png" 
                                alt="Logo" 
                                className="w-4 h-4 object-contain mix-blend-multiply dark:mix-blend-screen"
                                referrerPolicy="no-referrer"
                              />
                              <span>Imersão Bíblica IA - Mergulhando na Palavra - {new Date().getFullYear()}</span>
                              <img 
                                src="https://i.postimg.cc/pd0P8t4L/1000097620_removebg_preview.png" 
                                alt="Logo" 
                                className="w-4 h-4 object-contain mix-blend-multiply dark:mix-blend-screen"
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
                      placeholder="Título do seu estudo"
                      value={currentNote.title}
                      onChange={(e) => setCurrentNote({ ...currentNote, title: e.target.value })}
                      className="w-full p-4 bg-stone-50 dark:bg-zinc-800 border border-stone-200 dark:border-zinc-700 rounded-2xl focus:ring-2 focus:ring-emerald-500 outline-none font-bold"
                    />
                    <textarea
                      placeholder="Escreva aqui suas reflexões, esboços e notas..."
                      value={currentNote.content}
                      onChange={(e) => setCurrentNote({ ...currentNote, content: e.target.value })}
                      className="w-full p-6 bg-stone-50 dark:bg-zinc-800 border border-stone-200 dark:border-zinc-700 rounded-2xl focus:ring-2 focus:ring-emerald-500 outline-none h-96 resize-none font-serif text-lg leading-relaxed"
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

            {activeTab === 'meaning' && (
              <div className="space-y-6">
                <div className="flex flex-col md:flex-row gap-4">
                  <div className="relative flex-[2]">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400" size={20} />
                    <input
                      type="text"
                      placeholder="Escreva a palavra, tema ou frase para saber o significado..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleMeaningSearch()}
                      className="w-full pl-12 pr-12 py-4 bg-white dark:bg-zinc-900 border border-stone-200 dark:border-zinc-800 rounded-2xl focus:ring-2 focus:ring-emerald-500 outline-none"
                    />
                    <div className="absolute right-4 top-1/2 -translate-y-1/2">
                      <AudioSearchButton onResult={(text) => { setSearchQuery(text); handleMeaningSearch(); }} />
                    </div>
                  </div>
                  <div className="flex-1 flex flex-col sm:flex-row gap-2">
                    <select 
                      value={meaningSource}
                      onChange={(e) => setMeaningSource(e.target.value)}
                      className="flex-1 px-4 py-4 bg-white dark:bg-zinc-900 border border-stone-200 dark:border-zinc-800 rounded-2xl outline-none text-sm"
                    >
                      <option value="Dicionário Aurélio">Dicionário Aurélio</option>
                      <option value="Dicionário Houaiss">Dicionário Houaiss</option>
                      <option value="Dicionário Michaelis">Dicionário Michaelis</option>
                      <option value="Português-Hebraico">Português-Hebraico</option>
                      <option value="Hebraico-Português">Hebraico-Português</option>
                      <option value="Português-Grego">Português-Grego</option>
                      <option value="Grego-Português">Grego-Português</option>
                      <option value="Pergunte ao Gemini">Pergunte ao Gemini</option>
                      <option value="Pergunte ao ChatGPT">Pergunte ao ChatGPT</option>
                      <option value="Pergunte ao Claude IA">Pergunte ao Claude IA</option>
                      <option value="Pergunte ao Llama IA">Pergunte ao Llama IA</option>
                    </select>
                    <button
                      onClick={handleMeaningSearch}
                      disabled={isLoading || !searchQuery}
                      className="px-8 py-4 bg-emerald-600 text-white font-bold rounded-2xl hover:bg-emerald-700 disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                      {isLoading ? <Loader2 className="animate-spin" size={20} /> : <Search size={20} />}
                      Pesquisar
                    </button>
                  </div>
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
                      <MarkdownRenderer content={meaningResult} onSearch={handleWikiSearch} />
                    </div>
                    <div className="flex gap-3">
                      <button onClick={() => { navigator.clipboard.writeText(meaningResult); showToast("Copiado! 📋✨"); }} className="flex-1 py-3 bg-stone-100 dark:bg-zinc-800 text-stone-600 dark:text-zinc-300 font-bold rounded-xl hover:bg-stone-200 flex items-center justify-center gap-2"><Copy size={18} /> Copiar</button>
                      <button onClick={() => handleWikiSearch(searchQuery)} className="flex-1 py-3 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 font-bold rounded-xl hover:bg-blue-200 flex items-center justify-center gap-2"><Globe size={18} /> Wiki</button>
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
                      placeholder="Explore o conhecimento infinito... Digite um tema."
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
                    Explorar Wiki
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
                      <MarkdownRenderer content={wikiResult} onSearch={handleWikiSearch} />
                    </div>
                    <div className="flex flex-wrap gap-3">
                      <button onClick={() => { navigator.clipboard.writeText(wikiResult); showToast("Copiado! 📋✨"); }} className="flex-1 py-3 bg-stone-100 dark:bg-zinc-800 text-stone-600 dark:text-zinc-300 font-bold rounded-xl hover:bg-stone-200 flex items-center justify-center gap-2"><Copy size={18} /> Copiar</button>
                      <button onClick={() => { handleDownloadResult(); showToast("Baixando... 📄💎"); }} className="flex-1 py-3 bg-stone-100 dark:bg-zinc-800 text-stone-600 dark:text-zinc-300 font-bold rounded-xl hover:bg-stone-200 flex items-center justify-center gap-2"><Download size={18} /> Baixar</button>
                      <button onClick={() => { handleShareResult(); showToast("Compartilhando... 🕊️✨"); }} className="flex-1 py-3 bg-stone-100 dark:bg-zinc-800 text-stone-600 dark:text-zinc-300 font-bold rounded-xl hover:bg-stone-200 flex items-center justify-center gap-2"><Share2 size={18} /> Compartilhar</button>
                      <button onClick={() => handleSaveToNotebook('Wiki Infinita', wikiResult)} className="flex-1 py-3 bg-emerald-600 text-white font-bold rounded-xl hover:bg-emerald-700 flex items-center justify-center gap-2"><Save size={18} /> Salvar no Caderno</button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'resources' && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {resources.map((res) => (
                  <div key={res.title} className="p-6 bg-white dark:bg-zinc-900 border border-stone-200 dark:border-zinc-800 rounded-2xl hover:shadow-md transition-shadow group">
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
                        Mapas
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </motion.div>
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
                      <MarkdownRenderer content={resourceStudyResult} onSearch={handleWikiSearch} />
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
                    onClick={() => {
                      if (resourceStudyResult) {
                        navigator.clipboard.writeText(resourceStudyResult);
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
                      if (navigator.share && resourceStudyResult) {
                        try {
                          await navigator.share({
                            title: 'Recurso Bíblico',
                            text: resourceStudyResult,
                          });
                        } catch (err) { console.error(err); }
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
                      <MarkdownRenderer content={searchPopup.result} onSearch={handleWikiSearch} />
                    </div>
                  )}
                </div>

                <div className="p-6 border-t border-stone-100 dark:border-zinc-800 bg-stone-50 dark:bg-zinc-800/50 flex gap-3">
                  <button
                    onClick={() => { navigator.clipboard.writeText(searchPopup.result); showToast("Copiado! 📋✨"); }}
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
                      if (navigator.share) {
                        try {
                          await navigator.share({ title: `Pesquisa: ${searchPopup.query}`, text: searchPopup.result });
                        } catch (err) { console.error(err); }
                      }
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
      </div>

      <div className="mt-12 p-8 bg-stone-50 dark:bg-zinc-800/50 rounded-[2.5rem] border border-stone-200 dark:border-zinc-800 text-sm text-stone-600 dark:text-zinc-400 space-y-4">
        <h4 className="font-bold text-stone-900 dark:text-white text-lg mb-4">Recursos dessa página:</h4>
        <p><strong className="text-stone-900 dark:text-white">Bíblias de Estudo</strong> = Aqui você vai conseguir mergulhar em uma biblioteca bíblica com 50 Bíblias de Estudo; 10 Comentários bíblicos, 10 Enciclopédias bíblicas, 10 Dicionários bíblicos e 1 Concordância.</p>
        <p><strong className="text-stone-900 dark:text-white">Visão do Autor</strong> = Neste recurso você vai conseguir pesquisar cerca de 50 escritores dos mais renomados, influentes da nossa época e de tempos antigos. Você poderá pesquisar palavras, termos, frases e até mesmo fazer uma pergunta como se fosse para o autor. A IA irá pesquisar em todos os seus livros e responder em uma síntese bem direta sobre o assunto específico ou assuntos correlacionados.</p>
        <p><strong className="text-stone-900 dark:text-white">Outras Religiões</strong> = Pesquise também nas principais religiões e seguimentos cristãos que possuem um cânon (livro sagrado ou principal livro doutrinário da religião).</p>
        <p><strong className="text-stone-900 dark:text-white">Ferramentas de Criação</strong> = Nesta versátil ferramenta você vai conseguir gerar vários materiais para a sua pesquisa, conhecimento ou utilização em seu ministério. São sete tipos de criação: Lição para células (pequenos grupos); Estudos bíblicos, Esboços, Devocional, Debate, Apostilas (chegam a 80 páginas) e Mensagens (dividas em Pregação, Aniversário, Casamento, Fim do ano, Formatura, Devocional e Velório).</p>
        <p><strong className="text-stone-900 dark:text-white">Compare Versões</strong> = Estão disponíveis neste recurso todas as versões e traduções da bíblia mais conhecidas. Ao pesquisar o usuário terá a acesso as duas versões do texto (a primeira versão sempre NVI e a segunda opção que o leitor deseja comparar). Terá também um apanhado das principais palavras que divergem nas duas versões. Você também conseguirá pesquisar nas línguas originais: Hebraico para o VT e Grego para o NT.</p>
        <p><strong className="text-stone-900 dark:text-white">Significado</strong> = Pesquise palavras e expressões nos três principais dicionários da língua portuguesa. Mais: Português-Hebraico, Hebraico-Português, Português-Grego, Grego-Português. E também estão quatro IAs integradas: Gemini, ChatGPT, Claude e LIama.</p>
        <p><strong className="text-stone-900 dark:text-white">Pesquisa Infinita - Wiki</strong> = É um recurso formidável integrada a IA Gemini que transforme uma pesquisa ou um texto em hiperlink nas palavras principais direcionando a outras pesquisas com novos hiperlinks e assim indefinidamente.</p>
        <p><strong className="text-stone-900 dark:text-white">Mapas e Notas</strong> = Neste recurso é possível pesquisar os principais mapas bíblicos antigos, momentos históricos e outros recursos gerados a partir de IA com fontes em Bíblias de Estudos e Enciclopédias.</p>
      </div>

      <SaveToNotebookModal
        isOpen={isNotebookModalOpen}
        onClose={() => setIsNotebookModalOpen(false)}
        onConfirm={confirmSaveToNotebook}
      />
    </div>
  );
}
