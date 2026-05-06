import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  MessageSquare, 
  X, 
  Send, 
  Bot, 
  User, 
  Loader2, 
  Volume2, 
  VolumeX,
  Sparkles,
  ChevronDown,
  History,
  BookOpen,
  Copy,
  Download,
  Share2,
  Save,
  Mic,
  MicOff,
  Search,
  Layout,
  Minimize2,
  Maximize2,
  Minus
} from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { geminiService } from '../services/geminiService';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from './Toast';
import { cn } from '../types';
import MarkdownRenderer from './MarkdownRenderer';
import { copyToClipboard } from '../utils/clipboard';
import { useShare } from '../utils/share';
import { SaveToNotebookModal } from './SaveToNotebookModal';
import { db } from '../lib/firebase';
import { collection, addDoc } from 'firebase/firestore';
import { lessons } from '../data/lessons_static';

interface Message {
  role: 'user' | 'model';
  text: string;
  thought?: string;
  audioUrl?: string;
  suggestions?: { label: string; path: string }[];
}

export const SpiritualTutor: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isAudioLoading, setIsAudioLoading] = useState<number | null>(null);
  const [playingAudio, setPlayingAudio] = useState<number | null>(null);
  const [isSaveModalOpen, setIsSaveModalOpen] = useState(false);
  const [noteToSave, setNoteToSave] = useState<string | null>(null);
  const [isSavingNote, setIsSavingNote] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isResourcesOpen, setIsResourcesOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [isMaximized, setIsMaximized] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const { user } = useAuth();
  const { showToast } = useToast();

  const appResources = [
    // Páginas Principais
    "Início",
    "Bíblia Online",
    "Devocional Diário",
    "Cursos de Teologia",
    "Áudios e Narrações",
    "Imersão Bíblica",
    "Caderno de Anotações",
    "Loja de Livros",
    "Fórum da Comunidade",
    "Quadro de Honra",
    "Missões Globais",
    "Corrida Bíblica",
    "Perfil do Aluno",
    "Sinais (Notícias da Vinda)",
    "Notícias do Reino",
    "Gerenciar Créditos",
    "Carreira Ministerial",
    "Contato",
    "Doações",
    "Evangelismo",
    "Diário Espiritual",
    "Redação Bíblica",
    "Área do Aluno",
    "Teologia",
    "Tutoriais",
    "Quem Somos?",

    // Atalhos da Página Início
    "Pensamento Profundo IA",
    "Gerar Estudo Bíblico",
    "Bíblias de Estudo",
    "Dicionários e Enciclopédias",
    "Ranking Ministerial",
    "Criação de Posts",
    "Contribua com a Obra",

    // Como se sente (Moods)
    "Sinto-me Ansioso",
    "Sinto-me Triste",
    "Sinto-me Feliz",
    "Sinto-me Cansado",
    "Sinto-me Com Medo",
    "Sinto-me Em Paz",
    "Sinto-me Grato",
    "Sinto-me Desanimado",
    "Sinto-me Sozinho",
    "Sinto-me Pecador",

    // Abas da Página Imersão
    "Imersão: Bíblias de Estudo",
    "Imersão: Busca de Versículo",
    "Imersão: Visão do Autor",
    "Imersão: Outras Religiões",
    "Imersão: Ferramenta de Criação",
    "Imersão: Ministério Infantil",
    "Imersão: Estórias & Teatro",
    "Imersão: Geração Narração",
    "Imersão: Post (Artes IA)",
    "Imersão: Compare Versões",
    "Imersão: Debate Bíblico",
    "Imersão: Significado",
    "Imersão: Pesquisa Infinita - Wiki",
    "Imersão: Livros Apócrifos",
    "Imersão: Mapas e Notas",

    // Disciplinas de Teologia
    "Teologia: Bibliologia",
    "Teologia: Teontologia",
    "Teologia: Cristologia",
    "Teologia: Pneumatologia",
    "Teologia: Antropologia Bíblica",
    "Teologia: Hamartiologia",
    "Teologia: Soteriologia",
    "Teologia: Eclesiologia",
    "Teologia: Escatologia",
    "Teologia: Angeologia",
    "Teologia: Hermenêutica Bíblica",
    "Teologia: Homilética",
    "Teologia: Exegética",
    "Teologia: Visão Calvinista vs Arminiana",
    "Teologia: Evangelismo/Missões",
    "Teologia: Liderança Cristã",
    "Teologia: Filosofia",
    "Teologia: Sociologia",
    "Teologia: Apologética",
    "Teologia: As Sete Dispensações",

    // Disciplinas de Evangelismo
    "Evangelismo: Introdução ao Evangelismo",
    "Evangelismo: Base Bíblica do Evangelismo",
    "Evangelismo: Evangelismo Urbano",
    "Evangelismo: Evangelismo Integral",
    "Evangelismo: Missões Transculturais",
    "Evangelismo: Evangelismo Criativo",
    "Evangelismo: Apologética e Desafios",
    "Evangelismo: Evangelismo Relacional",
    "Evangelismo: Pequenos Grupos",
    "Evangelismo: Organização na Igreja",
    "Evangelismo: Agências e ONGs",
    "Evangelismo: Captação de Recursos",
    "Evangelismo: Evangelismo Infantil",
    "Evangelismo: Intercessão",
    "Evangelismo: Espírito Santo",
    "Evangelismo: Estilo de Vida"
  ];

  const { share } = useShare();
  const location = useLocation();
  const navigate = useNavigate();
  const knowledgeBase = lessons.map(l => `[${l.title} - ${l.theme || ''}]: ${l.content}`).join('\n\n');

  const systemInstruction = `Você é o Tutor de Imersão, um guia espiritual e assistente especializado no aplicativo Imersão Bíblica IA.
BASE DE CONHECIMENTO (Use estas lições para responder com profundidade):
${knowledgeBase}

DIRETRIZES DE RESPOSTA:
Sua missão é ajudar os usuários a navegar no app, encontrar recursos e crescer espiritualmente.
1. Seja sempre encorajador, bíblico e prático.
2. Ao explicar um recurso, forneça um passo a passo de como encontrá-lo.
3. SEMPRE inclua sugestões de navegação no final da sua resposta usando o formato: <suggestions>[{"label": "Nome", "path": "/rota"}]</suggestions>.
4. Se o usuário perguntar sobre um recurso específico da lista "Recursos do App", explique como usá-lo e forneça o botão de navegação.

MAPEAMENTO DE RECURSOS E CAMINHOS:
- Início: /
- Devocional: /devotional
- Imersão (Estudo Bíblico): /study
- Teologia: /theology
- Evangelismo: /evangelism
- Áudios/Narrações: /audio-box
- Livros: /store
- Caderno: /notebook
- Diário: /journal
- Redação: /redacao
- Fórum: /forum
- Carreira: /career
- Corrida Bíblica: /bible-race
- Perfil: /student-profile
- Quem Somos: /who-am-i
- Contato/Doações: /contact
- Créditos: /credits

ABAS DE IMERSÃO (/study?tab=ID):
- Bíblias de Estudo: /study?tab=bibles
- Busca de Versículo: /study?tab=verse-search
- Visão do Autor: /study?tab=authors
- Outras Religiões: /study?tab=religions
- Ferramenta de Criação: /study?tab=creation-tool
- Ministério Infantil: /study?tab=kids_ministry
- Estórias & Teatro: /study?tab=stories_theater
- Geração Narração: /study?tab=narration
- Post (Artes IA): /study?tab=posts
- Compare Versões: /study?tab=compare
- Debate Bíblico: /study?tab=commentary
- Significado: /study?tab=meaning
- Pesquisa Infinita: /study?tab=wiki
- Livros Apócrifos: /study?tab=apocrypha
- Mapas e Notas: /study?tab=resources

SENTIMENTOS:
Se o usuário expressar um sentimento (ex: "Sinto-me Ansioso"), ofereça conforto bíblico, um versículo específico e uma oração curta. Sugira também o **Devocional (/devotional)** para meditação.

EXEMPLO DE RESPOSTA PARA RECURSO:
"Para acessar a Ferramenta de Criação na página de Imersão, siga estes passos:
1. Clique no menu 'Imersão' na barra de navegação.
2. Na parte superior da página, localize as abas e clique em 'Ferramenta de Criação'.
3. Lá você poderá gerar esboços, sermões e muito mais!

<suggestions>[{"label": "Abrir Ferramenta de Criação", "path": "/study?tab=creation-tool"}]</suggestions>"

Sempre coloque a pesquisa nova na parte superior da tela (isso é controlado pelo código, mas mantenha o contexto).

# TOM DE VOZ
- Acolhedor, mas intelectualmente estimulante.
- Linguagem acessível, evitando "evangeliquês" excessivo.
- Encorajador e paciente.

# FRONTEIRAS ÉTICAS (GARDRAILS)
- Não substitui o Pastor/Comunidade.
- Não é conselheiro médico/psicológico.
- Foco Bíblico.
- Sempre aconselhe ao amor, paciência, fé, perdão, empatia e submissão a Deus.
- Nunca incentive a rebelião, contenda, inveja ou vingança.

# FORMATO DE RESPOSTA
1. **Breve Contextualização:** (O que o texto diz?)
2. **Insights de Imersão:** (O que o texto significa?)
3. **Sugestão no App:** (Onde o usuário pode aprofundar isso no aplicativo?)
4. **Pergunta de Reflexão:** (Como isso muda minha vida hoje?)

# SUGESTÕES DE NAVEGAÇÃO
Sempre que sugerir uma área do aplicativo, inclua no final da sua resposta o seguinte bloco:
<suggestions>
[{"label": "Nome da Área", "path": "/rota"}]
</suggestions>
Exemplo:
<suggestions>
[{"label": "Ir para o Caderno", "path": "/notebook"}, {"label": "Ver Cursos", "path": "/courses"}]
</suggestions>
Certifique-se de que o JSON seja válido e esteja dentro das tags <suggestions>.

Responda em forma de chat. O usuário se chama ${user?.name || 'Irmão(ã)'}.
Atualmente o usuário está na página: ${location.pathname}.
`;

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = 0;
    }
  }, [messages]);

  // Limpar histórico ao fechar
  useEffect(() => {
    if (!isOpen) {
      setMessages([]);
    }
  }, [isOpen]);

  const handleSend = async (overrideInput?: string) => {
    const textToSend = typeof overrideInput === 'string' ? overrideInput : input;
    if (!textToSend.trim() || isLoading) return;

    const userMessage: Message = { role: 'user', text: textToSend };
    setMessages(prev => [...prev, userMessage]);
    const currentInput = textToSend;
    if (!overrideInput) setInput('');
    setIsLoading(true);

    try {
      const history = messages.map(m => ({
        role: m.role,
        parts: [{ text: m.text }]
      }));

      const stream = await geminiService.chatStream(currentInput, history, systemInstruction);
      
      let fullText = "";
      let thought = "";
      
      // Add a placeholder for the model message
      setMessages(prev => [...prev, { role: 'model', text: '' }]);
      
      try {
        for await (const chunk of stream) {
          if (!chunk) continue;
          
          const chunkText = chunk.text || "";
          fullText += chunkText;
          
          // Extract thought if available in the chunk
          const parts = chunk.candidates?.[0]?.content?.parts;
          if (parts && Array.isArray(parts)) {
            for (const part of parts) {
              if ((part as any).thought === true) {
                thought += (part as any).text || "";
              }
            }
          }

          // Extract suggestions if available
          const suggestionMatch = fullText.match(/<suggestions>([\s\S]*?)<\/suggestions>/);
          let suggestions: { label: string; path: string }[] | undefined;
          let cleanText = fullText;

          if (suggestionMatch) {
            try {
              const jsonStr = suggestionMatch[1].trim();
              if (jsonStr) {
                suggestions = JSON.parse(jsonStr);
                cleanText = fullText.replace(/<suggestions>[\s\S]*?<\/suggestions>/, '').trim();
              }
            } catch (e) {
              // Only log if the tag is closed, otherwise it's expected during streaming
              if (fullText.includes('</suggestions>')) {
                console.error("Error parsing suggestions:", e);
              }
            }
          } else if (fullText.includes('<suggestions>')) {
            // If the tag is still being generated, hide it and everything after it from the UI
            cleanText = fullText.split('<suggestions>')[0].trim();
          }

          // Update the last message with the accumulated text
          setMessages(prev => {
            const newMessages = [...prev];
            if (newMessages.length > 0) {
              newMessages[newMessages.length - 1] = { 
                role: 'model', 
                text: cleanText,
                thought: thought,
                suggestions: suggestions
              };
            }
            return newMessages;
          });
        }
      } catch (streamError: any) {
        console.error("Stream interrupted:", streamError);
        // If we already have some text, we don't necessarily want to show an error toast
        // but we should log it.
        if (!fullText) {
          throw streamError;
        }
      }
    } catch (error: any) {
      showToast(error.message || "Erro ao falar com o Tutor.", "error");
    } finally {
      setIsLoading(false);
    }
  };

  const handleGenerateAudio = async (index: number, text: string) => {
    if (isAudioLoading !== null) return;
    
    setIsAudioLoading(index);
    try {
      const audioUrl = await geminiService.generateSpeech(text, 'Kore');
      if (audioUrl) {
        setMessages(prev => {
          const newMessages = [...prev];
          newMessages[index] = { ...newMessages[index], audioUrl };
          return newMessages;
        });
        playAudio(index, audioUrl);
      } else {
        showToast("Não foi possível gerar o áudio.", "error");
      }
    } catch (error) {
      showToast("Erro ao gerar áudio.", "error");
    } finally {
      setIsAudioLoading(null);
    }
  };

  const playAudio = (index: number, url: string) => {
    if (playingAudio === index) {
      audioRef.current?.pause();
      setPlayingAudio(null);
      return;
    }

    if (audioRef.current) {
      audioRef.current.pause();
    }

    const audio = new Audio(url);
    audioRef.current = audio;
    setPlayingAudio(index);
    
    audio.onended = () => setPlayingAudio(null);
    audio.play().catch(err => {
      console.error("Error playing audio:", err);
      setPlayingAudio(null);
    });
  };

  const handleCopy = async (text: string) => {
    const success = await copyToClipboard(text);
    if (success) {
      showToast("Texto copiado para a área de transferência! 📋", "success");
    } else {
      showToast("Erro ao copiar texto.", "error");
    }
  };

  const handleDownload = (text: string) => {
    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `estudo-tutor-${new Date().getTime()}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showToast("Arquivo baixado com sucesso! 📥", "success");
  };

  const handleShare = async (text: string) => {
    await share({
      title: "Estudo Bíblico - Tutor de Imersão",
      text: text,
      url: window.location.href
    });
  };

  const handleSaveToNotebook = async (category: string) => {
    if (!noteToSave || !user) return;
    
    setIsSavingNote(true);
    try {
      await addDoc(collection(db, 'notes'), {
        userId: user.id,
        title: `Estudo do Tutor - ${new Date().toLocaleDateString()}`,
        content: noteToSave,
        category,
        date: new Date().toLocaleDateString('pt-BR'),
        createdAt: new Date().toISOString()
      });
      showToast("Salvo no seu caderno com sucesso! 📓", "success");
      setIsSaveModalOpen(false);
    } catch (error) {
      console.error("Error saving note:", error);
      showToast("Erro ao salvar no caderno.", "error");
    } finally {
      setIsSavingNote(false);
    }
  };

  const toggleVoiceInput = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    
    if (!SpeechRecognition) {
      showToast("Reconhecimento de voz não suportado neste navegador.", "error");
      return;
    }

    if (isListening) {
      setIsListening(false);
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = 'pt-BR';
    recognition.continuous = false;
    recognition.interimResults = true;

    recognition.onstart = () => {
      setIsListening(true);
      showToast("Ouvindo... 🎙️", "info");
    };

    recognition.onresult = (event: any) => {
      const transcript = Array.from(event.results)
        .map((result: any) => result[0])
        .map((result: any) => result.transcript)
        .join('');
      
      setInput(transcript);
    };

    recognition.onerror = (event: any) => {
      console.error('Speech recognition error', event.error);
      setIsListening(false);
      if (event.error === 'not-allowed') {
        showToast("Permissão de microfone negada.", "error");
      }
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognition.start();
  };

  return (
    <>
      {/* Floating Button */}
      <motion.button
        drag
        dragConstraints={{ left: -window.innerWidth + 80, right: 0, top: -window.innerHeight + 80, bottom: 0 }}
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9, cursor: 'grabbing' }}
        onClick={() => {
          setIsOpen(true);
          if (window.innerWidth < 768) {
            setIsMaximized(true);
          }
        }}
        className="fixed bottom-[19.5rem] right-6 md:bottom-[15.5rem] md:right-8 z-[60] w-14 h-14 bg-emerald-600 text-white rounded-full shadow-2xl flex flex-col items-center justify-center gap-0.5 group overflow-hidden border-2 border-white dark:border-zinc-900 cursor-grab active:cursor-grabbing"
      >
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-500 to-teal-700 opacity-0 group-hover:opacity-100 transition-opacity" />
        <Sparkles size={20} className="relative z-10 animate-pulse" />
        <span className="relative z-10 text-[8px] font-black uppercase tracking-widest">Tutor</span>
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <>
            {!isMinimized && !isMaximized && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setIsOpen(false)}
                className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[70]"
              />
            )}
            <motion.div
              initial={{ opacity: 0, y: 100, scale: 0.9 }}
              animate={{ 
                opacity: 1, 
                y: isMinimized ? (isMaximized ? 'calc(100vh - 80px)' : (isMobile ? 'calc(80vh - 80px)' : '570px')) : 0, 
                scale: 1,
                width: isMaximized ? '100vw' : (isMobile ? 'calc(100vw - 2rem)' : '450px'),
                height: isMaximized ? '100vh' : (isMobile ? '80vh' : '650px'),
                bottom: isMaximized ? 0 : '2rem',
                right: isMaximized ? 0 : (isMobile ? '1rem' : '2rem'),
                left: isMaximized ? 0 : (isMobile ? '1rem' : 'auto'),
                borderRadius: isMaximized ? 0 : '2.5rem'
              }}
              exit={{ opacity: 0, y: 100, scale: 0.9 }}
              className={cn(
                "fixed z-[80] bg-white dark:bg-zinc-900 shadow-2xl flex flex-col overflow-hidden border border-stone-200 dark:border-zinc-800 transition-all duration-300 pointer-events-auto",
                isMinimized && "cursor-pointer"
              )}
              onClick={() => isMinimized && setIsMinimized(false)}
            >
              {/* Header */}
              <div className="p-6 bg-emerald-600 text-white flex items-center justify-between pointer-events-auto">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-white/20 rounded-2xl flex items-center justify-center">
                    <Bot size={24} />
                  </div>
                  <div>
                    <h3 className="font-black text-lg tracking-tight uppercase">Tutor de Imersão</h3>
                    <p className="text-[10px] font-bold text-emerald-100 uppercase tracking-widest">Seu Guia Espiritual</p>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <button 
                    onClick={() => setIsMinimized(!isMinimized)}
                    className="p-2 hover:bg-white/20 rounded-full transition-colors"
                    title={isMinimized ? "Restaurar" : "Minimizar"}
                  >
                    <Minus size={16} />
                  </button>
                  <button 
                    onClick={() => setIsMaximized(!isMaximized)}
                    className="p-2 hover:bg-white/20 rounded-full transition-colors"
                    title={isMaximized ? "Restaurar" : "Maximizar"}
                  >
                    {isMaximized ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
                  </button>
                  <button 
                    onClick={() => setIsOpen(false)}
                    className="p-2 hover:bg-white/20 rounded-full transition-colors"
                    title="Fechar"
                  >
                    <X size={16} />
                  </button>
                </div>
              </div>

              {!isMinimized && (
                <>
                  {/* Input at the top */}
                  <div className="p-6 border-b border-stone-100 dark:border-zinc-800 bg-stone-50/50 dark:bg-zinc-900/50">
                    {/* App Resources Dropdown */}
                    <div className="mb-4 relative">
                      <button
                        onClick={() => setIsResourcesOpen(!isResourcesOpen)}
                        className="w-full flex items-center justify-between px-4 py-2 bg-white dark:bg-zinc-800 border border-stone-200 dark:border-zinc-700 rounded-xl text-xs font-bold text-stone-600 dark:text-zinc-400 hover:border-emerald-500 transition-all shadow-sm"
                      >
                        <div className="flex items-center gap-2">
                          <Layout size={14} className="text-emerald-600" />
                          <span>Recursos do App</span>
                        </div>
                        <ChevronDown size={14} className={cn("transition-transform", isResourcesOpen && "rotate-180")} />
                      </button>

                      <AnimatePresence>
                        {isResourcesOpen && (
                          <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-zinc-800 border border-stone-200 dark:border-zinc-700 rounded-2xl shadow-xl overflow-hidden z-[90] max-h-48 overflow-y-auto scrollbar-thin scrollbar-thumb-stone-200 dark:scrollbar-thumb-zinc-700"
                          >
                            {appResources.map((resource, idx) => (
                              <button
                                key={idx}
                                onClick={() => {
                                  setInput(resource);
                                  setIsResourcesOpen(false);
                                  handleSend(resource);
                                }}
                                className="w-full text-left px-4 py-3 text-xs text-stone-600 dark:text-zinc-400 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 hover:text-emerald-600 transition-colors border-b border-stone-50 dark:border-zinc-700/50 last:border-0"
                              >
                                {resource}
                              </button>
                            ))}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>

                    <div className="flex items-center gap-2">
                      <div className="relative flex-1">
                        <input 
                          type="text"
                          value={input}
                          onChange={(e) => setInput(e.target.value)}
                          onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                          placeholder="Pergunte ao Tutor..."
                          className="w-full bg-white dark:bg-zinc-800 border border-stone-200 dark:border-zinc-700 rounded-2xl py-4 pl-6 pr-14 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all shadow-sm"
                        />
                        <button 
                          onClick={() => handleSend()}
                          disabled={!input.trim() || isLoading}
                          className="absolute right-2 top-2 bottom-2 w-10 bg-emerald-600 text-white rounded-xl flex items-center justify-center hover:bg-emerald-700 disabled:opacity-50 transition-all"
                        >
                          <Search size={18} />
                        </button>
                      </div>
                      <button
                        onClick={toggleVoiceInput}
                        className={cn(
                          "w-12 h-12 rounded-2xl flex items-center justify-center transition-all shadow-sm border",
                          isListening 
                            ? "bg-red-500 text-white border-red-400 animate-pulse" 
                            : "bg-white dark:bg-zinc-800 text-stone-500 border-stone-200 dark:border-zinc-700 hover:text-emerald-600"
                        )}
                        title="Entrada de Voz"
                      >
                        {isListening ? <MicOff size={20} /> : <Mic size={20} />}
                      </button>
                    </div>
                  </div>

                  {/* Messages */}
                  <div 
                    ref={scrollRef}
                    className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-thin scrollbar-thumb-stone-200 dark:scrollbar-thumb-zinc-800 flex flex-col"
                  >
                    {isLoading && (
                      <div className="flex gap-3">
                        <div className="w-8 h-8 rounded-xl bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 flex items-center justify-center">
                          <Bot size={16} />
                        </div>
                        <div className="bg-stone-50 dark:bg-zinc-800/50 p-4 rounded-2xl rounded-tl-none border border-stone-100 dark:border-zinc-800">
                          <div className="flex gap-1">
                            <motion.div 
                              animate={{ scale: [1, 1.2, 1] }} 
                              transition={{ repeat: Infinity, duration: 1 }}
                              className="w-1.5 h-1.5 bg-emerald-400 rounded-full" 
                            />
                            <motion.div 
                              animate={{ scale: [1, 1.2, 1] }} 
                              transition={{ repeat: Infinity, duration: 1, delay: 0.2 }}
                              className="w-1.5 h-1.5 bg-emerald-500 rounded-full" 
                            />
                            <motion.div 
                              animate={{ scale: [1, 1.2, 1] }} 
                              transition={{ repeat: Infinity, duration: 1, delay: 0.4 }}
                              className="w-1.5 h-1.5 bg-emerald-600 rounded-full" 
                            />
                          </div>
                        </div>
                      </div>
                    )}

                    {messages.length > 0 ? (
                      [...messages].reverse().map((msg, i) => {
                        const originalIndex = messages.length - 1 - i;
                        return (
                          <div 
                            key={originalIndex}
                            className={cn(
                              "flex gap-3",
                              msg.role === 'user' ? "flex-row-reverse" : "flex-row"
                            )}
                          >
                            <div className={cn(
                              "w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0",
                              msg.role === 'user' ? "bg-stone-100 dark:bg-zinc-800 text-stone-600" : "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600"
                            )}>
                              {msg.role === 'user' ? <User size={16} /> : <Bot size={16} />}
                            </div>
                            <div className={cn(
                              "max-w-[80%] space-y-2",
                              msg.role === 'user' ? "items-end" : "items-start"
                            )}>
                              <div className={cn(
                                "p-4 rounded-2xl text-sm leading-relaxed shadow-sm",
                                msg.role === 'user' 
                                  ? "bg-emerald-600 text-white rounded-tr-none" 
                                  : "bg-stone-50 dark:bg-zinc-800/50 text-stone-800 dark:text-zinc-200 rounded-tl-none border border-stone-100 dark:border-zinc-800"
                              )}>
                                <MarkdownRenderer content={msg.text} />
                              </div>

                              {msg.suggestions && msg.suggestions.length > 0 && (
                                <div className="flex flex-wrap gap-2 mt-2">
                                  {msg.suggestions.map((suggestion, idx) => (
                                    <button
                                      key={idx}
                                      onClick={() => {
                                        navigate(suggestion.path);
                                        setIsOpen(false);
                                      }}
                                      className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 rounded-full text-[10px] font-black uppercase tracking-widest hover:bg-emerald-100 dark:hover:bg-emerald-900/30 transition-all border border-emerald-100 dark:border-emerald-900/50"
                                    >
                                      <History size={12} />
                                      {suggestion.label}
                                    </button>
                                  ))}
                                </div>
                              )}
                              
                              {msg.role === 'model' && (
                                <div className="flex flex-wrap items-center gap-2">
                                  <button
                                    onClick={() => msg.audioUrl ? playAudio(originalIndex, msg.audioUrl) : handleGenerateAudio(originalIndex, msg.text)}
                                    disabled={isAudioLoading === originalIndex}
                                    className={cn(
                                      "flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest transition-all",
                                      playingAudio === originalIndex 
                                        ? "bg-emerald-600 text-white" 
                                        : "bg-stone-100 dark:bg-zinc-800 text-stone-500 hover:text-emerald-600"
                                    )}
                                  >
                                    {isAudioLoading === originalIndex ? (
                                      <Loader2 size={12} className="animate-spin" />
                                    ) : playingAudio === originalIndex ? (
                                      <VolumeX size={12} />
                                    ) : (
                                      <Volume2 size={12} />
                                    )}
                                    {playingAudio === originalIndex ? "Parar Áudio" : "Ouvir Resposta"}
                                  </button>

                                  <div className="flex items-center gap-1 bg-stone-100 dark:bg-zinc-800 rounded-full p-1">
                                    <button
                                      onClick={() => handleCopy(msg.text)}
                                      className="p-1.5 text-stone-500 hover:text-emerald-600 transition-colors"
                                      title="Copiar"
                                    >
                                      <Copy size={12} />
                                    </button>
                                    <button
                                      onClick={() => handleDownload(msg.text)}
                                      className="p-1.5 text-stone-500 hover:text-emerald-600 transition-colors"
                                      title="Baixar"
                                    >
                                      <Download size={12} />
                                    </button>
                                    <button
                                      onClick={() => handleShare(msg.text)}
                                      className="p-1.5 text-stone-500 hover:text-emerald-600 transition-colors"
                                      title="Compartilhar"
                                    >
                                      <Share2 size={12} />
                                    </button>
                                    <button
                                      onClick={() => {
                                        setNoteToSave(msg.text);
                                        setIsSaveModalOpen(true);
                                      }}
                                      className="p-1.5 text-stone-500 hover:text-emerald-600 transition-colors"
                                      title="Salvar no Caderno"
                                    >
                                      <Save size={12} />
                                    </button>
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      })
                    ) : (
                      <div className="text-center py-12 space-y-4">
                        <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 rounded-3xl flex items-center justify-center mx-auto">
                          <BookOpen size={32} />
                        </div>
                        <div className="space-y-2">
                          <p className="text-lg font-bold text-stone-800 dark:text-white">Olá, {user?.name || 'Irmão(ã)'}!</p>
                          <p className="text-sm text-stone-500 dark:text-zinc-400 px-8">
                            Sou seu Tutor de Imersão. Como posso ajudar você a mergulhar mais fundo na Palavra hoje?
                          </p>
                        </div>

                        <motion.div 
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="mx-6 p-5 bg-emerald-50 dark:bg-emerald-900/20 rounded-3xl border border-emerald-100 dark:border-emerald-900/50 space-y-3 text-left relative"
                        >
                          <h4 className="text-[10px] font-black uppercase tracking-widest text-emerald-600">Como usar o Tutor</h4>
                          <p className="text-xs text-stone-600 dark:text-zinc-400 leading-relaxed">
                            Para pesquisar com o tutor, basta digitar sua dúvida ou sentimento no campo acima. 
                            Você pode perguntar sobre versículos, pedir conselhos bíblicos ou ajuda para entender um tema. 
                            Use o ícone de microfone para falar sua dúvida ou explore o botão <span className="font-bold">Recursos do App</span> para ver tudo o que o aplicativo oferece!
                          </p>
                        </motion.div>
                      </div>
                    )}
                  </div>
                </>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <SaveToNotebookModal
        isOpen={isSaveModalOpen}
        isLoading={isSavingNote}
        onClose={() => setIsSaveModalOpen(false)}
        onConfirm={(category) => handleSaveToNotebook(category)}
      />
    </>
  );
};
