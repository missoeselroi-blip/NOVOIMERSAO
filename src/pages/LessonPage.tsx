import React, { useState, useRef, useEffect } from 'react';
import { 
  Maximize2, 
  Minimize2, 
  ZoomIn,
  ZoomOut,
  Download, 
  Share2, 
  StickyNote, 
  Volume2, 
  Globe,
  WifiOff,
  ChevronLeft,
  ChevronRight,
  Search,
  FileText,
  ExternalLink,
  PenTool,
  FileSearch,
  History,
  Save,
  X,
  BookOpen,
  Book,
  Glasses,
  Mic,
  Square,
  UserCheck,
  Loader2
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, useLocation } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import rehypeRaw from 'rehype-raw';
import { cn } from '../types';
import { useToast } from '../components/Toast';
import { geminiService } from '../services/geminiService';
import { SpeechGenerator } from '../components/SpeechGenerator';

import { useAuth } from '../contexts/AuthContext';
import { useOffline } from '../contexts/OfflineContext';
import { SaveToNotebookModal } from '../components/SaveToNotebookModal';
import { lessons, Lesson } from '../data/lessons';
import html2pdf from 'html2pdf.js';

const LessonPage: React.FC = () => {
  const [selectedLesson, setSelectedLesson] = useState<Lesson | null>(null);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [zoom, setZoom] = useState(1);
  const [showNotes, setShowNotes] = useState(false);
  const [showAudio, setShowAudio] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isGeneratingAudio, setIsGeneratingAudio] = useState(false);
  const [isSaveModalOpen, setIsSaveModalOpen] = useState(false);
  
  const navigate = useNavigate();
  const location = useLocation();
  const { showToast } = useToast();
  const { downloadMaterial, isOffline } = useOffline();

  useEffect(() => {
    if (location.state?.offlineContent) {
      setSelectedLesson(location.state.offlineContent);
    }
  }, [location.state]);
  const [notes, setNotes] = useState<string>("");
  const [notesHistory, setNotesHistory] = useState<string[]>([]);
  const [showSummary, setShowSummary] = useState(false);
  const [showLeaderGuide, setShowLeaderGuide] = useState(false);
  const [showLeaderAudio, setShowLeaderAudio] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [showMentor, setShowMentor] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [mentorGreeting, setMentorGreeting] = useState<string | null>(null);
  const [mentorResponse, setMentorResponse] = useState("");
  const [isMentorLoading, setIsMentorLoading] = useState(false);
  const [isMentorPlaying, setIsMentorPlaying] = useState(false);
  const [mentorAudioUrl, setMentorAudioUrl] = useState<string | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  const [isNotebookModalOpen, setIsNotebookModalOpen] = useState(false);
  const [isSavingToNotebook, setIsSavingToNotebook] = useState(false);
  const [contentToSave, setContentToSave] = useState({ title: '', content: '' });
  const [bibleModal, setBibleModal] = useState<{
    isOpen: boolean;
    reference: string;
    version: string;
    content: string;
    loading: boolean;
  }>({
    isOpen: false,
    reference: "",
    version: "NVI",
    content: "",
    loading: false
  });
  const { user } = useAuth();
  const mentorAudioRef = useRef<HTMLAudioElement | null>(null);

  const bibleVersions = ["NVI", "ACF", "ARA", "KJV", "NTLH"];

  const leaderGuideContent = selectedLesson?.leaderGuide || "";

  const fetchBibleText = async (ref: string, version: string) => {
    setBibleModal(prev => ({ ...prev, loading: true, reference: ref, version }));
    try {
      const prompt = `Forneça o texto bíblico para a referência "${ref}" na versão "${version}". Retorne apenas o texto dos versículos, sem comentários adicionais.`;
      const text = await geminiService.generateText(prompt);
      setBibleModal(prev => ({ ...prev, content: text, loading: false }));
    } catch (error) {
      console.error("Error fetching bible text:", error);
      setBibleModal(prev => ({ ...prev, content: "Erro ao carregar o texto bíblico.", loading: false }));
    }
  };

  const handleBibleRefClick = (ref: string) => {
    setBibleModal(prev => ({ ...prev, isOpen: true }));
    fetchBibleText(ref, bibleModal.version);
  };

  const handleNavigateBible = async (direction: 'prev' | 'next') => {
    // Simple logic to navigate chapters if possible, otherwise just a placeholder
    // For a real app, we'd parse the reference properly
    showToast("Navegação de capítulos em desenvolvimento...", "info");
  };

  const processedContent = React.useMemo(() => {
    if (!selectedLesson || !selectedLesson.content) return "";
    // Regex to match biblical references like "João 3:16", "1 Coríntios 13:1-8", "TG 4:8", etc.
    const bibleRegex = /((?:[123]\s)?[A-Z][A-Za-zà-ÿ]{1,})\s\d+:\d+(?:-\d+)?/g;
    return selectedLesson.content.replace(bibleRegex, (match) => `**${match}**`);
  }, [selectedLesson]);

  const processedLeaderGuide = React.useMemo(() => {
    if (!selectedLesson || !selectedLesson.leaderGuide) return "";
    const bibleRegex = /((?:[123]\s)?[A-Z][A-Za-zà-ÿ]{1,})\s\d+:\d+(?:-\d+)?/g;
    return selectedLesson.leaderGuide.replace(bibleRegex, (match) => `**${match}**`);
  }, [selectedLesson]);

  const handleShare = () => {
    const url = window.location.href;
    navigator.clipboard.writeText(url).then(() => {
      showToast("Link da lição copiado para a área de transferência!", "success");
    }).catch(err => {
      console.error('Could not copy text: ', err);
      showToast("Não foi possível copiar o link.", "error");
    });
  };

  const handleSave = () => {
    if (selectedLesson) {
      setContentToSave({
        title: selectedLesson.title,
        content: selectedLesson.content
      });
      setIsNotebookModalOpen(true);
    }
  };

  const confirmSaveToNotebook = async (category: string) => {
    setIsSavingToNotebook(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    setIsSavingToNotebook(false);
    setIsNotebookModalOpen(false);
    showToast(`Lição salva com sucesso em ${category}!`, "success");
  };

  const handleListen = () => {
    setShowAudio(!showAudio);
    if (!showAudio) {
      showToast("Abrindo ferramentas de áudio...", "info");
    }
  };

  const handleDownload = () => {
    if (!selectedLesson || !selectedLesson.content || !selectedLesson.title) {
      showToast("Conteúdo da lição incompleto para download.", "error");
      return;
    }

    showToast("Gerando seu PDF... Quase pronto! 📄💎", 'info');

    const element = document.createElement('div');
    element.className = 'pdf-container';
    
    // Improved Markdown to HTML conversion for the PDF with better styling
    const htmlContent = (selectedLesson.content || "")
      .replace(/^# (.*$)/gm, '<h1 style="font-size: 28pt; font-weight: 800; margin-bottom: 20pt; color: #065f46; text-align: center; text-transform: uppercase; border-bottom: 3px solid #065f46; padding-bottom: 10pt;">$1</h1>')
      .replace(/^## (.*$)/gm, '<h2 style="font-size: 20pt; font-weight: 700; margin-top: 24pt; margin-bottom: 12pt; color: #047857; border-left: 5px solid #059669; padding-left: 10pt;">$1</h2>')
      .replace(/^### (.*$)/gm, '<h3 style="font-size: 16pt; font-weight: 600; margin-top: 18pt; margin-bottom: 8pt; color: #059669;">$1</h3>')
      .replace(/^\* (.*$)/gm, '<li style="margin-left: 20pt; margin-bottom: 6pt; list-style-type: disc;">$1</li>')
      .replace(/^- (.*$)/gm, '<li style="margin-left: 20pt; margin-bottom: 6pt; list-style-type: disc;">$1</li>')
      .replace(/\*\*([^*]+)\*\*/g, '<strong style="color: #064e3b;">$1</strong>')
      .replace(/\n\n/g, '</p><p style="margin-bottom: 14pt; line-height: 1.7; page-break-inside: avoid;">')
      .replace(/\n/g, '<br/>');

    element.innerHTML = `
      <div style="padding: 20mm; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; color: #1f2937; line-height: 1.7; background-color: #ffffff;">
        <div style="text-align: center; margin-bottom: 40pt; border-bottom: 2px solid #e5e7eb; padding-bottom: 20pt;">
          <div style="font-size: 10pt; color: #059669; font-weight: 800; letter-spacing: 2pt; margin-bottom: 5pt; text-transform: uppercase;">Material de Estudo</div>
          <h1 style="color: #065f46; margin: 0; font-size: 32pt; font-weight: 900; letter-spacing: -1pt;">IMERSÃO BÍBLICA IA</h1>
          <p style="color: #6b7280; font-size: 14pt; margin-top: 10pt; font-style: italic;">Lição: ${selectedLesson.title || "Sem Título"}</p>
        </div>
        
        <div class="content" style="font-size: 11pt;">
          <p style="margin-bottom: 14pt; line-height: 1.7;">${htmlContent}</p>
        </div>
        
        <div style="margin-top: 60pt; border-top: 1px solid #e5e7eb; padding-top: 30pt; text-align: center; page-break-inside: avoid;">
          <p style="font-style: italic; color: #4b5563; font-size: 10pt; margin-bottom: 20pt;">
            "A palavra de Deus é viva e eficaz..." (Hebreus 4:12)
          </p>
          <div style="display: flex; justify-content: center; gap: 40pt; margin-bottom: 30pt;">
            <div style="text-align: center;">
              <div style="font-weight: 800; color: #065f46; font-size: 9pt; text-transform: uppercase;">Igreja Betânia</div>
              <div style="color: #6b7280; font-size: 8pt;">Ipatinga/MG</div>
            </div>
          </div>
          <div style="font-size: 8pt; color: #9ca3af; letter-spacing: 0.5pt; text-transform: uppercase; font-weight: 600;">
            Gerado em ${new Date().toLocaleDateString('pt-BR')} • © Imersão Bíblica IA
          </div>
        </div>
      </div>
    `;
    
    const opt = {
      margin: 0,
      filename: `Licao_${(selectedLesson.title || "Licao").replace(/\s+/g, '_')}.pdf`,
      image: { type: 'jpeg', quality: 1.0 },
      html2canvas: { scale: 2, useCORS: true, letterRendering: true },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
      pagebreak: { mode: ['avoid-all', 'css', 'legacy'] }
    };
    
    // @ts-ignore
    html2pdf().from(element).set(opt).save().then(() => {
      showToast("Download concluído! 📄✨", "success");
    }).catch(err => {
      console.error('PDF error:', err);
      showToast("Erro ao gerar PDF.", "error");
    });
  };

  const handleDownloadOffline = async () => {
    if (!selectedLesson) return;
    
    try {
      await downloadMaterial({
        id: `lesson-${selectedLesson.id}`,
        type: 'lesson',
        title: selectedLesson.title,
        content: selectedLesson.content,
        downloadedAt: Date.now()
      });
      showToast("Lição salva para acesso offline! 📱✨", "success");
    } catch (error) {
      console.error("Error saving lesson offline:", error);
      showToast("Erro ao salvar lição offline.", "error");
    }
  };

  const handleWiki = () => {
    if (selectedLesson && selectedLesson.content) {
      const text = String(selectedLesson.content).replace(/<br\/>/g, '\n').replace(/#|##|###|\*/g, '');
      navigate(`/study?wikiQuery=${encodeURIComponent(text)}`);
    } else {
      showToast("Conteúdo da lição não disponível para pesquisa.", "error");
    }
  };

  const handleSaveNote = () => {
    if (notes.trim()) {
      setNotesHistory([notes, ...notesHistory]);
      setNotes("");
      showToast("Anotação salva com sucesso!", "success");
    }
  };

  const toggleFullScreen = () => {
    setIsFullScreen(!isFullScreen);
    if (!isFullScreen) {
      setZoom(1.5); // Max zoom for reading
    } else {
      setZoom(1);
    }
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const reader = new FileReader();
        reader.readAsDataURL(audioBlob);
        reader.onloadend = async () => {
          const base64Audio = (reader.result as string).split(',')[1];
          handleMentorQuery(base64Audio);
        };
      };

      mediaRecorder.start();
      setIsRecording(true);
      showToast("Gravando sua pergunta...", "info");
    } catch (error) {
      console.error("Error starting recording:", error);
      showToast("Erro ao acessar microfone.", "error");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
    }
  };

  const handleMentorQuery = async (base64Audio: string) => {
    setIsMentorLoading(true);
    setMentorResponse("");
    setMentorAudioUrl(null);
    try {
      const transcription = await geminiService.transcribeAudio(base64Audio);
      if (!transcription) throw new Error("Não foi possível transcrever o áudio.");

      const response = await geminiService.generateText(transcription, getMentorSystemPrompt(), true);
      setMentorResponse(response);
      
      showToast("Mentor respondeu! ✨");
    } catch (error) {
      console.error("Mentor error:", error);
      showToast("Erro ao falar com o Mentor.", "error");
    } finally {
      setIsMentorLoading(false);
    }
  };

  const getMentorSystemPrompt = () => {
    return `Você é um Mentor espiritual e de liderança cristã altamente experiente. 
Seus princípios são baseados nos valores bíblicos do Novo Testamento e, de forma central, nos ensinamentos de Abe Huber sobre o MDA (Modelo de Discipulado Apostólico), discipulado um a um, consolidação, evangelismo, reuniões de célula, liderança e supervisão. 
Você também integra conhecimentos profundos de outros grandes autores referência em liderança e crescimento (como John Maxwell, Rick Warren, Billy Graham, e outros escritores de liderança contemporâneos). 
Seu objetivo é fornecer dicas práticas, encorajamento e sabedoria para líderes e membros de células, sempre focando na aplicação prática da lição atual.
Responda de forma pastoral, direta, inspiradora e acolhedora.
O nome do usuário é ${user?.name || 'amigo'}. 
Sempre que possível, faça conexões entre a lição "${selectedLesson?.title || 'Bíblica'}" e os princípios de liderança de Abe Huber.
Mantenha as respostas conversacionais e bem fundamentadas teologicamente. Use o pensamento profundo para dar respostas ricas e precisas.`;
  };

  const openMentor = async () => {
    setShowMentor(true);
    if (!mentorResponse) {
      setIsMentorLoading(true);
      try {
        const hour = new Date().getHours();
        let greetingText = "Bom dia";
        if (hour >= 12 && hour < 18) greetingText = "Boa tarde";
        else if (hour >= 18) greetingText = "Boa noite";
        
        const userName = user?.name ? user.name.split(' ')[0] : 'amigo';
        setMentorGreeting(`${greetingText}, ${userName}! Que alegria ter você aqui.`);
        
        const lessonTitle = selectedLesson?.title || 'nossa lição';
        
        const prompt = `Gere uma saudação inicial curta e calorosa como um Mentor de liderança cristã. 
        Cumprimente o usuário pelo nome (${userName}) com um "${greetingText}". 
        Mencione que você está aqui para ajudar com a lição "${lessonTitle}". 
        Cite brevemente que seus ensinamentos são baseados em Abe Huber e outros grandes líderes. 
        Termine com uma pergunta convidando o usuário a falar ou perguntar algo sobre a lição. 
        A resposta deve ser direta e em texto claro. Utilize o pensamento profundo para ser certeiro.`;

        const response = await geminiService.generateText(prompt, getMentorSystemPrompt(), true);
        setMentorResponse(response);
      } catch (error) {
        console.error("Error initializing mentor:", error);
        showToast("O Mentor está um pouco ocupado agora, mas você pode tentar novamente em breve.", "error");
      } finally {
        setIsMentorLoading(false);
      }
    }
  };

  const filteredLessons = lessons.filter(lesson => 
    lesson.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (lesson.theme && lesson.theme.toLowerCase().includes(searchQuery.toLowerCase())) ||
    lesson.content.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-stone-50 dark:bg-zinc-950 pb-20">
      <div className="max-w-7xl mx-auto px-4 py-12">
        <header className="mb-16 text-center">
          <h1 className="text-5xl md:text-7xl font-display font-black text-stone-900 dark:text-white tracking-tighter mb-6 bg-clip-text text-transparent bg-gradient-to-b from-stone-900 to-stone-600 dark:from-white dark:to-zinc-500">
            Lições de Célula
          </h1>
          
          <p className="text-stone-500 dark:text-zinc-400 max-w-2xl mx-auto font-medium text-lg leading-relaxed">
            Uma jornada profunda de 50 lições de célula previstas para 2026 atualizadas semanalmente e utilizadas pela Igreja Betânia de Ipatinga.
          </p>
          
          <div className="mt-12 max-w-2xl mx-auto relative px-4">
            <div className="relative group">
              <div className="absolute -inset-1 bg-gradient-to-r from-emerald-500 to-blue-500 rounded-2xl blur opacity-20 group-focus-within:opacity-40 transition duration-500"></div>
              <div className="relative">
                <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-stone-400 group-focus-within:text-emerald-500 transition-colors" size={22} />
                <input 
                  type="text"
                  placeholder="Pesquisar por título, tema ou conteúdo..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-14 pr-6 py-5 bg-white dark:bg-zinc-900 border border-stone-200 dark:border-zinc-800 rounded-2xl shadow-xl focus:ring-0 outline-none transition-all text-lg font-medium placeholder:text-stone-300 dark:placeholder:text-zinc-700"
                />
              </div>
            </div>
          </div>
        </header>

        {/* Lessons Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
          {filteredLessons.map((lesson) => (
            <motion.button
              key={lesson.id}
              whileHover={{ scale: 1.05, y: -5 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => {
                setSelectedLesson(lesson);
                setZoom(1.1); // Default to 110%
                setIsFullScreen(true); // Default to fullscreen
              }}
              className={cn(
                "aspect-square flex flex-col items-center justify-center p-6 rounded-[2.5rem] border-2 transition-all shadow-xl group relative overflow-hidden",
                lesson.hasAttachment 
                  ? "bg-amber-50 border-amber-200 dark:bg-amber-900/20 dark:border-amber-800" 
                  : "bg-white border-stone-100 dark:bg-zinc-900 dark:border-zinc-800"
              )}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-blue-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />
              
              <div className={cn(
                "w-12 h-12 rounded-2xl flex items-center justify-center mb-3 shadow-inner transition-transform group-hover:scale-110 duration-300",
                lesson.hasAttachment ? "bg-amber-100 text-amber-600" : "bg-emerald-100 text-emerald-600"
              )}>
                <Glasses size={24} />
              </div>
              <span className="font-black text-lg text-stone-900 dark:text-white tracking-tighter">{lesson.title}</span>
              {lesson.theme && (
                <span className="text-[9px] font-black uppercase tracking-widest text-emerald-600 mt-1 text-center px-2 leading-tight opacity-80">
                  {lesson.theme}
                </span>
              )}
              {lesson.hasAttachment && lesson.id !== 12 && (
                <span className="text-[10px] font-black uppercase tracking-widest text-amber-600 mt-2">Anexo</span>
              )}
            </motion.button>
          ))}
        </div>
      </div>

      {/* Lesson Reader Modal */}
      <AnimatePresence>
        {selectedLesson && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className={cn(
              "fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-8",
              isFullScreen ? "bg-white dark:bg-zinc-950" : "bg-black/60 backdrop-blur-sm"
            )}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className={cn(
                "relative bg-white dark:bg-zinc-900 shadow-2xl overflow-hidden flex flex-col",
                isFullScreen 
                  ? "w-full h-full rounded-none" 
                  : "w-full max-w-4xl max-h-[90vh] rounded-[1.5rem] md:rounded-[3rem] border border-stone-200 dark:border-zinc-800"
              )}
            >
              {/* Toolbar */}
              <div className="p-3 md:p-6 border-b border-stone-100 dark:border-zinc-800 flex flex-wrap items-center justify-between gap-3 bg-stone-50/50 dark:bg-zinc-800/50">
                <div className="flex items-center gap-2 md:gap-4">
                  <button 
                    onClick={() => setSelectedLesson(null)}
                    className="p-2 hover:bg-stone-200 dark:hover:bg-zinc-700 rounded-full transition-colors"
                  >
                    <ChevronLeft className="w-5 h-5 md:w-6 md:h-6" />
                  </button>
                  <div className="max-w-[150px] sm:max-w-none">
                    <h2 className="text-base md:text-xl font-black tracking-tight truncate">{selectedLesson.title}</h2>
                  </div>
                </div>

                <div className="flex items-center gap-1 md:gap-2 flex-wrap justify-end">
                  <button onClick={toggleFullScreen} className="p-1.5 md:p-2 hover:bg-stone-200 dark:hover:bg-zinc-700 rounded-xl transition-colors shrink-0" title={isFullScreen ? "Minimizar" : "Maximizar"}>
                    {isFullScreen ? <Minimize2 className="w-4 h-4 md:w-[18px] md:h-[18px]" /> : <Maximize2 className="w-4 h-4 md:w-[18px] md:h-[18px]" />}
                  </button>
                  <button onClick={handleDownload} className="p-1.5 md:p-2 hover:bg-stone-200 dark:hover:bg-zinc-700 rounded-xl transition-colors shrink-0" title="Baixar PDF">
                    <Download className="w-4 h-4 md:w-[18px] md:h-[18px]" />
                  </button>
                  <button onClick={handleDownloadOffline} className="p-1.5 md:p-2 hover:bg-stone-200 dark:hover:bg-zinc-700 rounded-xl transition-colors shrink-0" title="Salvar Offline">
                    <WifiOff className="w-4 h-4 md:w-[18px] md:h-[18px] text-amber-600" />
                  </button>
                  <button onClick={handleShare} className="p-1.5 md:p-2 hover:bg-stone-200 dark:hover:bg-zinc-700 rounded-xl transition-colors shrink-0" title="Compartilhar">
                    <Share2 className="w-4 h-4 md:w-[18px] md:h-[18px]" />
                  </button>
                  <button onClick={handleSave} className="p-1.5 md:p-2 hover:bg-stone-200 dark:hover:bg-zinc-700 rounded-xl transition-colors shrink-0" title="Salvar no Caderno">
                    <StickyNote className="w-4 h-4 md:w-[18px] md:h-[18px]" />
                  </button>
                  <button onClick={handleListen} className="p-1.5 md:p-2 hover:bg-stone-200 dark:hover:bg-zinc-700 rounded-xl transition-colors shrink-0" title="Ouvir">
                    <Volume2 className="w-4 h-4 md:w-[18px] md:h-[18px]" />
                  </button>
                  <button onClick={openMentor} className="p-1.5 md:p-2 bg-[#BC6C25] text-white hover:bg-[#A15B1F] rounded-xl transition-colors flex items-center gap-1 md:gap-2 px-2 md:px-3 shrink-0" title="Mentor">
                    <UserCheck className="w-4 h-4 md:w-[18px] md:h-[18px]" />
                    <span className="text-[9px] md:text-[10px] font-bold uppercase hidden sm:inline">Mentor</span>
                  </button>
                  <button onClick={handleWiki} className="p-1.5 md:p-2 bg-[#8A9A5B] text-white hover:bg-[#7A8A4B] rounded-xl transition-colors flex items-center gap-1 md:gap-2 px-2 md:px-3 shrink-0" title="Wiki">
                    <Globe className="w-4 h-4 md:w-[18px] md:h-[18px]" />
                    <span className="text-[9px] md:text-[10px] font-bold uppercase hidden sm:inline">Wiki</span>
                  </button>
                  <button 
                    onClick={() => setShowNotes(true)} 
                    className="p-1.5 md:p-2 bg-[#D4A373] text-white hover:bg-[#C49363] rounded-xl transition-colors flex items-center gap-1 md:gap-2 px-2 md:px-3 shrink-0" 
                    title="Anotar"
                  >
                    <PenTool className="w-4 h-4 md:w-[18px] md:h-[18px]" />
                    <span className="text-[9px] md:text-[10px] font-bold uppercase hidden sm:inline">Anotar</span>
                  </button>
                  <button 
                    onClick={() => setShowSummary(true)} 
                    className="p-1.5 md:p-2 bg-[#5B8A9A] text-white hover:bg-[#4B7A8A] rounded-xl transition-colors flex items-center gap-1 md:gap-2 px-2 md:px-3 shrink-0" 
                    title="Resumo"
                  >
                    <FileSearch className="w-4 h-4 md:w-[18px] md:h-[18px]" />
                    <span className="text-[9px] md:text-[10px] font-bold uppercase hidden sm:inline">Resumo</span>
                  </button>
                </div>
              </div>

              {/* Content Area */}
              <div className={cn(
                "flex-1 overflow-y-auto p-8 md:p-16 scrollbar-thin scrollbar-thumb-stone-200 dark:scrollbar-thumb-zinc-800 relative",
                selectedLesson.id === 11 && "bg-cover bg-center bg-no-repeat",
                selectedLesson.id === 12 && "bg-stone-50 dark:bg-zinc-950"
              )}
              style={selectedLesson.id === 11 ? { backgroundImage: 'url("https://images.unsplash.com/photo-1499209974431-9dac3adaf471?auto=format&fit=crop&q=80&w=1920")' } : {}}
              >
                {/* Overlay for readability if background is present */}
                {selectedLesson.id === 11 && (
                  <div className="absolute inset-0 bg-white/85 dark:bg-zinc-950/85 backdrop-blur-[2px] z-0" />
                )}
                
                <div className="max-w-3xl mx-auto relative z-10 mb-8">
                  {selectedLesson.id === 12 && (
                    <div className="mb-6 p-4 bg-emerald-50 dark:bg-emerald-900/20 rounded-2xl border border-emerald-100 dark:border-emerald-800 flex items-center justify-between group">
                      <div>
                        <p className="text-[10px] font-black uppercase tracking-widest text-emerald-600 dark:text-emerald-400 mb-1">Referência Principal</p>
                        <h3 className="text-lg font-bold text-stone-800 dark:text-white">TIAGO 1:6-8</h3>
                      </div>
                      <button 
                        onClick={() => handleBibleRefClick("Tiago 1:6-8")}
                        className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-full text-xs font-bold hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-600/20"
                      >
                        <ExternalLink size={14} />
                        ABRIR NA BÍBLIA
                      </button>
                    </div>
                  )}
                  <AnimatePresence>
                    {showAudio && (
                      <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="mb-8"
                      >
                        <div className="flex items-center gap-2 mb-4 text-emerald-600 dark:text-emerald-400">
                          <Volume2 size={20} />
                          <h4 className="font-black uppercase tracking-widest text-xs">Narração Emotiva da Lição</h4>
                        </div>
                        <SpeechGenerator 
                          initialText={(selectedLesson?.content || "").replace(/<br\/>/g, '\n').replace(/#|##|###|\*/g, '')}
                          initialTitle={`Narração: ${selectedLesson?.title || "Lição"}`}
                          initialSubject="Lição Bíblica"
                          initialEmotion="inspirador"
                          initialVoice="homem"
                          onSaveToNotebook={(title, content) => {
                            setContentToSave({ title, content });
                            setIsNotebookModalOpen(true);
                          }}
                        />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                <div 
                  className="max-w-3xl mx-auto transition-all duration-500 relative z-10"
                  style={{ 
                    transform: `scale(${zoom})`, 
                    transformOrigin: 'top center',
                    width: zoom > 1 ? `${100 / zoom}%` : '100%',
                    fontFamily: 'Arial, sans-serif'
                  }}
                >
                  <div className="prose dark:prose-invert max-w-none lesson-custom-formatting">
                    <style>{`
                      .lesson-custom-formatting { font-size: 14px !important; }
                      .lesson-custom-formatting h1, .lesson-custom-formatting p, .lesson-custom-formatting li { font-size: 14px !important; }
                      .lesson-custom-formatting h2, .lesson-custom-formatting h3 { font-size: 18px !important; font-weight: bold !important; margin-top: 1.5rem !important; margin-bottom: 0.75rem !important; color: #065f46 !important; }
                      .dark .lesson-custom-formatting h2, .dark .lesson-custom-formatting h3 { color: #34d399 !important; }
                      .lesson-custom-formatting h1 { font-weight: bold !important; margin-top: 1rem !important; margin-bottom: 0.5rem !important; }
                      .bible-ref-link { 
                        background-color: #fef08a; 
                        padding: 0 4px; 
                        border-radius: 4px; 
                        font-weight: bold; 
                        color: #854d0e; 
                        cursor: pointer;
                        text-decoration: none;
                        transition: all 0.2s;
                      }
                      .bible-ref-link:hover {
                        background-color: #fde047;
                        transform: translateY(-1px);
                      }
                      .dark .bible-ref-link { background-color: #854d0e; color: #fef08a; }
                      .dark .bible-ref-link:hover { background-color: #a16207; }
                    `}</style>
                    <div className="text-stone-600 dark:text-zinc-400 leading-[2.2] mb-6">
                      <ReactMarkdown 
                        rehypePlugins={[rehypeRaw]}
                        components={{
                          strong: ({node, ...props}) => {
                            const content = String(props.children);
                            // Improved regex for biblical references including abbreviations
                            const bibleRegex = /((?:[123]\s)?[A-Z][A-Za-zà-ÿ]{1,})\s\d+:\d+(?:-\d+)?/g;
                            if (content.match(bibleRegex)) {
                              return (
                                <button 
                                  onClick={() => handleBibleRefClick(content)}
                                  className="bible-ref-link"
                                >
                                  {content}
                                </button>
                              );
                            }
                            return <strong {...props} />;
                          }
                        }}
                      >
                        {processedContent}
                      </ReactMarkdown>
                    </div>
                    
                    <div className="mt-16 pt-8 border-t border-stone-200 dark:border-zinc-800 text-center">
                      <div className="italic text-stone-400 dark:text-zinc-500 text-sm space-y-1">
                        <p>Escrito por Wesley Reis</p>
                        <p>Temas e revisão: Eliomar e Rosa Ferrari</p>
                        <p className="mt-4 font-bold not-italic text-stone-600 dark:text-zinc-400">Igreja Betânia de Ipatinga</p>
                      </div>
                      {selectedLesson.leaderGuide && (
                        <button 
                          onClick={() => setShowLeaderGuide(true)}
                          className="mt-8 px-8 py-3 bg-[#E2725B] text-white rounded-full font-bold hover:bg-[#D2624B] transition-all shadow-lg shadow-[#E2725B]/20 flex items-center gap-2 mx-auto"
                        >
                          <BookOpen size={20} />
                          GUIA DO LÍDER
                        </button>
                      )}
                    </div>
                    
                    {selectedLesson.hasAttachment && (
                      <div className="mt-12 p-8 bg-amber-50 dark:bg-amber-900/20 rounded-[2rem] border-2 border-dashed border-amber-200 dark:border-amber-800 flex flex-col items-center text-center">
                        <div className="w-16 h-16 bg-amber-100 dark:bg-amber-800 rounded-2xl flex items-center justify-center mb-4 text-amber-600 dark:text-amber-400">
                          <FileText size={32} />
                        </div>
                        <h4 className="text-xl font-bold mb-2">Arquivo em Anexo</h4>
                        <p className="text-sm text-stone-500 dark:text-zinc-400 mb-6">
                          Esta lição contém um material complementar importante para o seu estudo.
                        </p>
                        <button className="flex items-center gap-2 px-6 py-3 bg-amber-600 text-white rounded-full font-bold hover:bg-amber-700 transition-all shadow-lg shadow-amber-600/20">
                          <Download size={20} />
                          Baixar PDF da {selectedLesson.title}
                        </button>
                      </div>
                    )}

                    {/* Footer removed */}
                  </div>
                </div>
              </div>

              {/* Zoom Controls (Floating & Movable) */}
              <motion.div 
                drag
                dragMomentum={false}
                className="absolute bottom-8 right-8 flex items-center gap-2 bg-white dark:bg-zinc-800 p-2 rounded-2xl shadow-2xl border border-stone-200 dark:border-zinc-700 z-[110] cursor-move"
              >
                <button 
                  onClick={() => setZoom(prev => Math.max(0.5, prev - 0.1))}
                  className="p-2 hover:bg-stone-100 dark:hover:bg-zinc-700 rounded-xl transition-colors text-stone-600 dark:text-zinc-400"
                  title="Diminuir Zoom"
                >
                  <ZoomOut size={18} />
                </button>
                <span className="text-xs font-black w-12 text-center text-stone-900 dark:text-white">{Math.round(zoom * 100)}%</span>
                <button 
                  onClick={() => setZoom(prev => Math.min(3, prev + 0.1))}
                  className="p-2 hover:bg-stone-100 dark:hover:bg-zinc-700 rounded-xl transition-colors text-stone-600 dark:text-zinc-400"
                  title="Aumentar Zoom"
                >
                  <ZoomIn size={18} />
                </button>
              </motion.div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Annotations Modal */}
      <AnimatePresence>
        {showNotes && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              className="bg-white dark:bg-zinc-900 w-full max-w-lg rounded-[2rem] shadow-2xl overflow-hidden flex flex-col max-h-[80vh]"
            >
              <div className="p-6 border-b border-stone-100 dark:border-zinc-800 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <PenTool className="text-amber-500" />
                  <h3 className="text-xl font-black tracking-tight">Anotações</h3>
                </div>
                <button onClick={() => setShowNotes(false)} className="p-2 hover:bg-stone-100 dark:hover:bg-zinc-800 rounded-full">
                  <X size={20} />
                </button>
              </div>
              
              <div className="flex-1 overflow-y-auto p-6 space-y-6">
                <div className="space-y-4">
                  <label className="text-xs font-black uppercase tracking-widest text-stone-400">Nova Observação</label>
                  <textarea 
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Escreva suas reflexões aqui..."
                    className="w-full h-32 p-4 rounded-2xl bg-stone-50 dark:bg-zinc-800 border-2 border-stone-100 dark:border-zinc-700 focus:border-amber-500 outline-none transition-all resize-none"
                  />
                  <button 
                    onClick={handleSaveNote}
                    className="w-full py-3 bg-[#D4A373] text-white rounded-xl font-bold hover:bg-[#C49363] transition-all flex items-center justify-center gap-2"
                  >
                    <Save size={18} />
                    Salvar Anotação
                  </button>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-stone-400">
                    <History size={14} />
                    Histórico
                  </div>
                  {notesHistory.length === 0 ? (
                    <p className="text-sm text-stone-400 italic">Nenhuma anotação salva ainda.</p>
                  ) : (
                    <div className="space-y-3">
                      {notesHistory.map((note, idx) => (
                        <div key={idx} className="p-4 bg-stone-50 dark:bg-zinc-800/50 rounded-xl border border-stone-100 dark:border-zinc-800 text-sm leading-relaxed">
                          {note}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Summary Modal */}
      <AnimatePresence>
        {showSummary && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              className="bg-white dark:bg-zinc-900 w-full max-w-2xl rounded-[3rem] shadow-2xl overflow-hidden flex flex-col max-h-[85vh]"
            >
              <div className="p-8 border-b border-stone-100 dark:border-zinc-800 flex items-center justify-between bg-[#5B8A9A]/10">
                <div className="flex items-center gap-3">
                  <FileSearch className="text-[#5B8A9A]" size={28} />
                  <div>
                    <h3 className="text-2xl font-black tracking-tight">Resumo Executivo</h3>
                    <p className="text-[10px] font-bold text-[#5B8A9A] uppercase tracking-widest">Ideias Centrais & Recursos</p>
                  </div>
                </div>
                <button onClick={() => setShowSummary(false)} className="p-2 hover:bg-[#5B8A9A]/30 rounded-full transition-colors">
                  <X size={24} />
                </button>
              </div>
              
              <div className="flex-1 overflow-y-auto p-8 space-y-8">
                {selectedLesson.id === 12 ? (
                  <section className="space-y-4">
                    <h4 className="text-lg font-black text-stone-900 dark:text-white flex items-center gap-2">
                      <div className="w-2 h-6 bg-blue-600 rounded-full" />
                      Pontos Chave da Lição
                    </h4>
                    <ul className="space-y-3">
                      {[
                        `**01.** **Definição de Ânimo Dobre:** A mente dividida ("dipsychos") que gera inconstância em todas as áreas da vida.`,
                        `**02.** **Impacto da Inconstância:** A oscilação impede o recebimento de bênçãos divinas e destrói a autoconfiança.`,
                        `**03.** **Raízes do Problema:** Falta de fé, escravidão emocional e negligência em pequenas responsabilidades (atrasos, desorganização).`,
                        `**04.** **O Caminho da Vitória:** Vigiar, chegar-se a Deus, purificar as mãos e limpar o coração (Tg 4:8).`,
                        `**05.** **Integridade e Decisão:** O ânimo é uma decisão, não apenas um sentimento passageiro. Requer integridade total.`,
                        `**06.** **A Luta Espiritual:** O conflito entre carne e espírito é real para todos, exigindo vigilância constante (Mt 26:41).`,
                        `**07.** **Promessa de Mudança:** A transformação é possível através da confiança, espera e ação no tempo de Deus.`
                      ].map((item, idx) => (
                        <li key={idx} className="flex gap-3 text-stone-600 dark:text-zinc-400">
                          <ReactMarkdown 
                            components={{
                              strong: ({node, ...props}) => {
                                const content = String(props.children);
                                const bibleRegex = /((?:[123]\s)?[A-Z][A-Za-zà-ÿ]{1,})\s\d+:\d+(?:-\d+)?/g;
                                if (content.match(bibleRegex)) {
                                  return (
                                    <button 
                                      onClick={() => handleBibleRefClick(content)}
                                      className="bible-ref-link"
                                    >
                                      {content}
                                    </button>
                                  );
                                }
                                return <strong {...props} />;
                              }
                            }}
                          >
                            {item}
                          </ReactMarkdown>
                        </li>
                      ))}
                    </ul>
                  </section>
                ) : (
                  <section className="space-y-4">
                    <h4 className="text-lg font-black text-stone-900 dark:text-white flex items-center gap-2">
                      <div className="w-2 h-6 bg-blue-600 rounded-full" />
                      Resumo da Lição
                    </h4>
                    <p className="text-stone-600 dark:text-zinc-400 leading-relaxed">
                      Esta lição explora fundamentos bíblicos essenciais para o crescimento espiritual. 
                      Recomendamos a leitura atenta do texto e a utilização das ferramentas de anotação para registrar seus insights.
                    </p>
                  </section>
                )}

                <section className="space-y-4">
                  <h4 className="text-lg font-black text-stone-900 dark:text-white flex items-center gap-2">
                    <div className="w-2 h-6 bg-emerald-600 rounded-full" />
                    Recursos para Aprofundamento
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-4 bg-stone-50 dark:bg-zinc-800/50 rounded-2xl border border-stone-100 dark:border-zinc-800">
                      <h5 className="font-bold text-emerald-600 mb-1 flex items-center gap-2">
                        <BookOpen size={16} />
                        Módulo Imersão
                      </h5>
                      <p className="text-xs text-stone-500">Use a ferramenta de Imersão para pesquisar temas relacionados a esta lição.</p>
                    </div>
                    <div className="p-4 bg-stone-50 dark:bg-zinc-800/50 rounded-2xl border border-stone-100 dark:border-zinc-800">
                      <h5 className="font-bold text-amber-600 mb-1 flex items-center gap-2">
                        <StickyNote size={16} />
                        Caderno de Notas
                      </h5>
                      <p className="text-xs text-stone-500">Registre seus compromissos e decisões baseadas neste estudo.</p>
                    </div>
                  </div>
                </section>

                <div className="p-6 bg-blue-600 rounded-[2rem] text-white">
                  <h5 className="font-black uppercase tracking-widest text-[10px] mb-2 opacity-80">Dica do App</h5>
                  <p className="text-sm font-medium leading-relaxed">
                    Aprofunde seu conhecimento utilizando a **Pesquisa Wiki** para encontrar referências históricas e teológicas sobre os temas abordados.
                  </p>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Bible Reference Modal */}
      <AnimatePresence>
        {bibleModal.isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              className="bg-white dark:bg-zinc-900 w-full max-w-xl rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col max-h-[70vh]"
            >
              <div className="p-6 border-b border-stone-100 dark:border-zinc-800 flex items-center justify-between bg-emerald-50/50 dark:bg-emerald-900/10">
                <div className="flex items-center gap-3">
                  <Book className="text-emerald-600" size={24} />
                  <div>
                    <h3 className="text-xl font-black tracking-tight">{bibleModal.reference}</h3>
                    <div className="flex items-center gap-2 mt-1">
                      {bibleVersions.map(v => (
                        <button
                          key={v}
                          onClick={() => fetchBibleText(bibleModal.reference, v)}
                          className={cn(
                            "px-2 py-0.5 rounded text-[10px] font-bold transition-all",
                            bibleModal.version === v 
                              ? "bg-emerald-600 text-white" 
                              : "bg-stone-200 dark:bg-zinc-800 text-stone-500"
                          )}
                        >
                          {v}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
                <button onClick={() => setBibleModal(prev => ({ ...prev, isOpen: false }))} className="p-2 hover:bg-emerald-100 dark:hover:bg-emerald-900/30 rounded-full transition-colors">
                  <X size={20} />
                </button>
              </div>
              
              <div className="flex-1 overflow-y-auto p-8">
                {bibleModal.loading ? (
                  <div className="flex flex-col items-center justify-center py-12 gap-4">
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    >
                      <Search className="text-emerald-600" size={32} />
                    </motion.div>
                    <p className="text-sm font-bold text-stone-400 animate-pulse">Buscando na Palavra...</p>
                  </div>
                ) : (
                  <div className="prose dark:prose-invert max-w-none">
                    <p className="text-stone-700 dark:text-zinc-300 leading-relaxed text-lg font-serif italic">
                      "{bibleModal.content}"
                    </p>
                  </div>
                )}
              </div>

              <div className="p-6 border-t border-stone-100 dark:border-zinc-800 bg-stone-50 dark:bg-zinc-800/30">
                <button 
                  onClick={() => {
                    navigate('/bible', { state: { reference: bibleModal.reference } });
                    setBibleModal(prev => ({ ...prev, isOpen: false }));
                  }}
                  className="w-full py-3 bg-emerald-600 text-white rounded-2xl font-bold hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-600/20 flex items-center justify-center gap-2"
                >
                  <ExternalLink size={18} />
                  ABRIR NA BÍBLIA COMPLETA
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Leader Guide Modal */}
      <AnimatePresence>
        {showLeaderGuide && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[130] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              className="bg-white dark:bg-zinc-900 w-full max-w-4xl rounded-[3rem] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
            >
              <div className="p-4 md:p-8 border-b border-stone-100 dark:border-zinc-800 flex items-center justify-between bg-emerald-50/50 dark:bg-emerald-900/10">
                <div className="flex items-center gap-4">
                  <button 
                    onClick={() => setShowLeaderGuide(false)}
                    className="p-2 hover:bg-emerald-100 dark:hover:bg-emerald-900/30 rounded-full transition-colors"
                  >
                    <ChevronLeft size={24} />
                  </button>
                  <div>
                    <h3 className="text-xl md:text-2xl font-black tracking-tight">GUIA DO LÍDER</h3>
                    <p className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest">Lição 12 – ÂNIMO DOBRE PARTE I</p>
                  </div>
                </div>

                <div className="flex items-center gap-1 md:gap-2 flex-wrap justify-end">
                  <button 
                    onClick={() => setShowLeaderAudio(!showLeaderAudio)}
                    className={cn(
                      "p-2 rounded-xl transition-all flex items-center gap-2 font-bold text-sm",
                      showLeaderAudio 
                        ? "bg-emerald-600 text-white shadow-lg shadow-emerald-600/20" 
                        : "bg-stone-100 dark:bg-zinc-800 text-stone-600 dark:text-zinc-400 hover:bg-stone-200"
                    )}
                    title="Ouvir Guia"
                  >
                    <Volume2 size={18} />
                    <span className="text-[10px] uppercase hidden sm:inline">{showLeaderAudio ? "Ouvindo" : "Áudio"}</span>
                  </button>
                  <button onClick={handleDownload} className="p-2 hover:bg-emerald-100 dark:hover:bg-emerald-900/30 rounded-xl transition-colors shrink-0" title="Baixar">
                    <Download size={18} />
                  </button>
                  <button onClick={handleShare} className="p-2 hover:bg-emerald-100 dark:hover:bg-emerald-900/30 rounded-xl transition-colors shrink-0" title="Compartilhar">
                    <Share2 size={18} />
                  </button>
                  <button onClick={openMentor} className="p-2 bg-purple-600 text-white hover:bg-purple-700 rounded-xl transition-colors flex items-center gap-2 px-3 shrink-0" title="Mentor">
                    <UserCheck size={18} />
                    <span className="text-[10px] font-bold uppercase">Mentor</span>
                  </button>
                  <button onClick={handleWiki} className="p-2 bg-emerald-600 text-white hover:bg-emerald-700 rounded-xl transition-colors flex items-center gap-2 px-3 shrink-0" title="Wiki">
                    <Globe size={18} />
                    <span className="text-[10px] font-bold uppercase">Wiki</span>
                  </button>
                  <button 
                    onClick={() => setShowNotes(true)} 
                    className="p-2 bg-amber-500 text-white hover:bg-amber-600 rounded-xl transition-colors flex items-center gap-2 px-3 shrink-0" 
                    title="Anotar"
                  >
                    <PenTool size={18} />
                    <span className="text-[10px] font-bold uppercase">Anotar</span>
                  </button>
                  <button 
                    onClick={() => setShowSummary(true)} 
                    className="p-2 bg-blue-600 text-white hover:bg-blue-700 rounded-xl transition-colors flex items-center gap-2 px-3 shrink-0" 
                    title="Resumo"
                  >
                    <FileSearch size={18} />
                    <span className="text-[10px] font-bold uppercase">Resumo</span>
                  </button>
                  <button onClick={() => setShowLeaderGuide(false)} className="p-2 hover:bg-emerald-100 dark:hover:bg-emerald-900/30 rounded-full transition-colors shrink-0">
                    <X size={24} />
                  </button>
                </div>
              </div>
              
              <div className="flex-1 overflow-y-auto p-8 md:p-12">
                <AnimatePresence>
                  {showLeaderAudio && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="max-w-3xl mx-auto mb-8 overflow-hidden"
                    >
                      <div className="flex items-center gap-2 mb-4 text-emerald-600 dark:text-emerald-400">
                        <Volume2 size={20} />
                        <h4 className="font-black uppercase tracking-widest text-xs">Narração Emotiva do Guia</h4>
                      </div>
                      <SpeechGenerator 
                        initialText={processedLeaderGuide.replace(/<br\/>/g, '\n').replace(/#|##|###|\*/g, '')}
                        initialTitle={`Narração: Guia do Líder - ${selectedLesson?.title}`}
                        initialSubject="Guia do Líder"
                        initialEmotion="pastor"
                        initialVoice="homem"
                        onSaveToNotebook={(title, content) => {
                          setContentToSave({ title, content });
                          setIsNotebookModalOpen(true);
                        }}
                      />
                    </motion.div>
                  )}
                </AnimatePresence>
                <div className="prose dark:prose-invert max-w-none leader-guide-content">
                  <style>{`
                    .leader-guide-content h2 { color: #059669; font-weight: 900; margin-top: 2rem; border-bottom: 2px solid #ecfdf5; padding-bottom: 0.5rem; }
                    .leader-guide-content h3 { color: #10b981; font-weight: 800; margin-top: 1.5rem; }
                    .leader-guide-content p { line-height: 1.8; margin-bottom: 1rem; }
                    .leader-guide-content ul { list-style-type: disc; padding-left: 1.5rem; margin-bottom: 1rem; }
                    .leader-guide-content li { margin-bottom: 0.5rem; }
                    .leader-guide-content hr { margin: 2rem 0; border-color: #f3f4f6; }
                  `}</style>
                  <ReactMarkdown 
                    rehypePlugins={[rehypeRaw]}
                    components={{
                      strong: ({node, ...props}) => {
                        const content = String(props.children);
                        const bibleRegex = /((?:[123]\s)?[A-Z][A-Za-zà-ÿ]{1,})\s\d+:\d+(?:-\d+)?/g;
                        if (content.match(bibleRegex)) {
                          return (
                            <button 
                              onClick={() => handleBibleRefClick(content)}
                              className="bible-ref-link"
                            >
                              {content}
                            </button>
                          );
                        }
                        return <strong {...props} />;
                      }
                    }}
                  >
                    {processedLeaderGuide}
                  </ReactMarkdown>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      <AnimatePresence>
        <audio ref={mentorAudioRef} className="hidden" />
      {showMentor && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              className="bg-white dark:bg-zinc-900 w-full max-w-lg rounded-[3rem] shadow-2xl overflow-hidden flex flex-col"
            >
              <div className="p-8 border-b border-stone-100 dark:border-zinc-800 flex items-center justify-between bg-purple-50/50 dark:bg-purple-900/10">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-purple-600 text-white rounded-2xl flex items-center justify-center shadow-lg shadow-purple-600/20">
                    <UserCheck size={24} />
                  </div>
                  <div>
                    <h3 className="text-xl font-black tracking-tight">MENTOR</h3>
                    <p className="text-[10px] font-bold text-purple-400 uppercase tracking-widest">Dicas de Liderança e Discipulado</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {mentorResponse && (
                    <>
                      <button 
                        onClick={() => {
                          const blob = new Blob([mentorResponse], { type: 'text/plain' });
                          const url = URL.createObjectURL(blob);
                          const a = document.createElement('a');
                          a.href = url;
                          a.download = `mentor-resposta-${new Date().getTime()}.txt`;
                          a.click();
                        }}
                        className="p-2 hover:bg-purple-100 dark:hover:bg-purple-900/30 rounded-xl transition-colors text-purple-600"
                        title="Baixar Resposta"
                      >
                        <Download size={20} />
                      </button>
                      <button 
                        onClick={() => {
                          setContentToSave({ title: "Resposta do Mentor", content: mentorResponse });
                          setIsNotebookModalOpen(true);
                        }}
                        className="p-2 hover:bg-purple-100 dark:hover:bg-purple-900/30 rounded-xl transition-colors text-purple-600"
                        title="Salvar no Caderno"
                      >
                        <StickyNote size={20} />
                      </button>
                      {mentorAudioUrl && (
                        <button 
                          onClick={() => {
                            const a = document.createElement('a');
                            a.href = mentorAudioUrl;
                            a.download = `mentor-audio-${new Date().getTime()}.mp3`;
                            a.click();
                          }}
                          className="p-2 hover:bg-purple-100 dark:hover:bg-purple-900/30 rounded-xl transition-colors text-purple-600"
                          title="Salvar Áudio"
                        >
                          <Save size={20} />
                        </button>
                      )}
                    </>
                  )}
                  <button onClick={() => {
                    if (mentorAudioRef.current) {
                      mentorAudioRef.current.pause();
                      mentorAudioRef.current.currentTime = 0;
                    }
                    setShowMentor(false);
                  }} className="p-2 hover:bg-purple-100 dark:hover:bg-purple-900/30 rounded-full transition-colors">
                    <X size={24} />
                  </button>
                </div>
              </div>

              <div className="p-8 space-y-6">
                <div className="bg-stone-50 dark:bg-zinc-800/50 p-6 rounded-[2rem] min-h-[150px] flex flex-col items-center justify-center text-center">
                  {isMentorLoading ? (
                    <div className="space-y-4">
                      {mentorGreeting && (
                        <motion.p 
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="text-lg font-bold text-purple-600 mb-4"
                        >
                          {mentorGreeting}
                        </motion.p>
                      )}
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                        className="mx-auto"
                      >
                        <Loader2 className="text-purple-600" size={32} />
                      </motion.div>
                      <p className="text-sm font-bold text-stone-400 animate-pulse">O Mentor está processando sua sabedoria...</p>
                    </div>
                  ) : mentorResponse ? (
                    <div className="space-y-4 w-full">
                      <p className="text-sm leading-relaxed text-stone-700 dark:text-zinc-300 italic font-serif">
                        "{mentorResponse}"
                      </p>
                      {isMentorPlaying && (
                        <button 
                          onClick={() => {
                            if (mentorAudioRef.current) {
                              mentorAudioRef.current.pause();
                              mentorAudioRef.current.currentTime = 0;
                            }
                          }}
                          className="flex items-center gap-2 mx-auto px-4 py-2 bg-stone-100 dark:bg-zinc-800 rounded-full text-xs font-bold text-stone-600 dark:text-stone-400 hover:bg-stone-200 transition-colors"
                        >
                          <Square size={14} />
                          PARAR ÁUDIO
                        </button>
                      )}
                      <button 
                        onClick={() => {
                          if (mentorAudioRef.current) {
                            mentorAudioRef.current.pause();
                            mentorAudioRef.current.currentTime = 0;
                          }
                          setMentorResponse("");
                          setMentorAudioUrl(null);
                        }}
                        className="text-xs font-bold text-purple-600 uppercase tracking-widest hover:underline"
                      >
                        Fazer outra pergunta
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <p className="text-sm text-stone-500">Pressione o botão abaixo e fale sua dúvida sobre liderança, discipulado ou célula.</p>
                      <div className="flex justify-center items-center gap-6">
                        {isMentorPlaying && (
                          <button
                            onClick={() => {
                              if (mentorAudioRef.current) {
                                mentorAudioRef.current.pause();
                                mentorAudioRef.current.currentTime = 0;
                              }
                            }}
                            className="p-4 bg-stone-100 dark:bg-zinc-800 text-stone-600 dark:text-stone-300 rounded-full hover:bg-stone-200 dark:hover:bg-zinc-700 transition-colors"
                            title="Parar Áudio"
                          >
                            <Square size={24} />
                          </button>
                        )}
                        <button
                          onMouseDown={startRecording}
                          onMouseUp={stopRecording}
                          onTouchStart={startRecording}
                          onTouchEnd={stopRecording}
                          className={cn(
                            "w-20 h-20 rounded-full flex items-center justify-center transition-all shadow-xl",
                            isRecording 
                              ? "bg-red-500 text-white scale-110 animate-pulse" 
                              : "bg-purple-600 text-white hover:bg-purple-700"
                          )}
                        >
                          {isRecording ? <Square size={32} /> : <Mic size={32} />}
                        </button>
                      </div>
                      <p className="text-[10px] font-bold text-stone-400 uppercase tracking-widest">
                        {isRecording ? "Solte para enviar" : "Segure para falar"}
                      </p>
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-purple-50 dark:bg-purple-900/10 rounded-2xl border border-purple-100 dark:border-purple-800/30">
                    <h5 className="text-[10px] font-black text-purple-600 uppercase mb-1">Base de Conhecimento</h5>
                    <p className="text-[9px] text-stone-500 leading-tight">Abe Huber, John Maxwell, Rick Warren e Princípios do NT.</p>
                  </div>
                  <div className="p-4 bg-emerald-50 dark:bg-emerald-900/10 rounded-2xl border border-emerald-100 dark:border-emerald-800/30">
                    <h5 className="text-[10px] font-black text-emerald-600 uppercase mb-1">Foco</h5>
                    <p className="text-[9px] text-stone-500 leading-tight">Discipulado, Consolidação e Liderança de Célula.</p>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <SaveToNotebookModal 
        isOpen={isNotebookModalOpen}
        isLoading={isSavingToNotebook}
        onClose={() => setIsNotebookModalOpen(false)}
        onConfirm={confirmSaveToNotebook}
      />
    </div>
  );
};

export default LessonPage;
