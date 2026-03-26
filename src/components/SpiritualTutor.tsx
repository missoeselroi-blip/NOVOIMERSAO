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
  BookOpen
} from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { geminiService } from '../services/geminiService';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from './Toast';
import { cn } from '../types';
import MarkdownRenderer from './MarkdownRenderer';

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
  const scrollRef = useRef<HTMLDivElement>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const { user } = useAuth();
  const { showToast } = useToast();
  const location = useLocation();
  const navigate = useNavigate();

  const systemInstruction = `
# PERSONA
Você é o "Tutor de Imersão", o guia de inteligência espiritual do aplicativo Imersão Bíblica IA. Seu objetivo não é apenas dar respostas, mas conduzir o usuário em uma jornada de descoberta bíblica profunda, atuando como um mentor teológico e devocional.

# CONHECIMENTO DO APLICATIVO (MAPA DE NAVEGAÇÃO)
Você conhece todas as áreas do aplicativo e deve sugerir que o usuário as visite quando apropriado:
- **Início (/)**: Visão geral e acesso rápido.
- **Devocional (/devotional)**: Alimento diário para a alma e meditações.
- **Cursos (/courses)**: Cursos de Teologia, Evangelismo e outros.
- **Áudios (/audio-box)**: Biblioteca de áudios e narrações geradas.
- **Imersão (/study)**: Pesquisa bíblica profunda, significados de termos e concordância. Sugira esta página para pesquisas detalhadas sobre palavras ou versículos específicos.
- **Caderno (/notebook)**: Onde o usuário salva suas anotações e estudos.
- **Livros (/store)**: Recursos literários e materiais de apoio.
- **Créditos (/credits)**: Onde gerencia os créditos para IA.
- **Fórum (/forum)**: Espaço de comunhão e debate com outros irmãos.
- **Carreira (/career)**: Acompanhamento da jornada ministerial e patentes.
- **Corrida Bíblica (/bible-race)**: Gamificação da leitura bíblica.
- **Página do Aluno (/student-profile)**: Progresso detalhado nos cursos.
- **Missões (/missionary)**: Informações sobre impacto global e missões.

# DIRETRIZES DE ATUAÇÃO
1. **Abordagem Pedagógica:** Utilize a "Maiêutica". Em vez de entregar a interpretação pronta, faça perguntas que levem o usuário a observar o texto. Ex: "O que você percebe que se repete neste versículo?".
2. **Direcionamento no App:** 
   - Se o usuário quiser salvar algo, sugira o **Caderno**. 
   - Se quiser estudar de forma estruturada, sugira os **Cursos**. 
   - Se quiser ouvir a Palavra, sugira o **Audio Box**.
   - Se o usuário fizer uma pergunta sobre o significado de uma palavra grega/hebraica ou quiser uma pesquisa exegética, sugira a página de **Imersão**.
   - Se o usuário quiser interagir com a comunidade, sugira o **Fórum**.
3. **Fidelidade e Contexto:** Sempre considere o contexto histórico, literário e cultural.
4. **Equilíbrio Teológico:** Mantenha uma postura interdenominacional, focada no "Cristianismo Puro e Simples".
5. **Aplicação Prática:** Toda explicação deve culminar em uma pergunta ou sugestão de aplicação para a vida cotidiana.

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
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = { role: 'user', text: input };
    setMessages(prev => [...prev, userMessage]);
    const currentInput = input;
    setInput('');
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
        onClick={() => setIsOpen(true)}
        className="fixed bottom-40 right-6 md:bottom-32 md:right-8 z-[60] w-16 h-16 bg-emerald-600 text-white rounded-full shadow-2xl flex flex-col items-center justify-center gap-0.5 group overflow-hidden border-4 border-white dark:border-zinc-900 cursor-grab active:cursor-grabbing"
      >
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-500 to-teal-700 opacity-0 group-hover:opacity-100 transition-opacity" />
        <Sparkles size={20} className="relative z-10 animate-pulse" />
        <span className="relative z-10 text-[10px] font-black uppercase tracking-widest">Tutor</span>
      </motion.button>

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[70]"
            />
            <motion.div
              initial={{ opacity: 0, y: 100, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 100, scale: 0.9 }}
              className="fixed bottom-4 right-4 left-4 md:left-auto md:right-8 md:bottom-8 w-auto md:w-[450px] h-[600px] max-h-[85vh] bg-white dark:bg-zinc-900 rounded-[2.5rem] shadow-2xl z-[80] flex flex-col overflow-hidden border border-stone-200 dark:border-zinc-800"
            >
              {/* Header */}
              <div className="p-6 bg-emerald-600 text-white flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-white/20 rounded-2xl flex items-center justify-center">
                    <Bot size={24} />
                  </div>
                  <div>
                    <h3 className="font-black text-lg tracking-tight uppercase">Tutor de Imersão</h3>
                    <p className="text-[10px] font-bold text-emerald-100 uppercase tracking-widest">Seu Guia Espiritual</p>
                  </div>
                </div>
                <button 
                  onClick={() => setIsOpen(false)}
                  className="p-2 hover:bg-white/20 rounded-full transition-colors"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Messages */}
              <div 
                ref={scrollRef}
                className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-thin scrollbar-thumb-stone-200 dark:scrollbar-thumb-zinc-800"
              >
                {messages.length === 0 && (
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
                    <div className="grid grid-cols-1 gap-2 px-4 pt-4">
                      {[
                        "O que este texto diz sobre o caráter de Deus?",
                        "Como aplicar este versículo no meu trabalho?",
                        "Qual o contexto histórico deste livro?"
                      ].map((suggestion, i) => (
                        <button
                          key={i}
                          onClick={() => {
                            setInput(suggestion);
                          }}
                          className="text-left p-3 text-xs font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20 rounded-xl hover:bg-emerald-100 dark:hover:bg-emerald-900/30 transition-colors"
                        >
                          {suggestion}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {messages.map((msg, i) => (
                  <div 
                    key={i}
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
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => msg.audioUrl ? playAudio(i, msg.audioUrl) : handleGenerateAudio(i, msg.text)}
                            disabled={isAudioLoading === i}
                            className={cn(
                              "flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest transition-all",
                              playingAudio === i 
                                ? "bg-emerald-600 text-white" 
                                : "bg-stone-100 dark:bg-zinc-800 text-stone-500 hover:text-emerald-600"
                            )}
                          >
                            {isAudioLoading === i ? (
                              <Loader2 size={12} className="animate-spin" />
                            ) : playingAudio === i ? (
                              <VolumeX size={12} />
                            ) : (
                              <Volume2 size={12} />
                            )}
                            {playingAudio === i ? "Parar Áudio" : "Ouvir Resposta"}
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}

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
              </div>

              {/* Input */}
              <div className="p-6 border-t border-stone-100 dark:border-zinc-800 bg-stone-50/50 dark:bg-zinc-900/50">
                <div className="relative">
                  <input 
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                    placeholder="Pergunte ao Tutor..."
                    className="w-full bg-white dark:bg-zinc-800 border border-stone-200 dark:border-zinc-700 rounded-2xl py-4 pl-6 pr-14 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all shadow-sm"
                  />
                  <button 
                    onClick={handleSend}
                    disabled={!input.trim() || isLoading}
                    className="absolute right-2 top-2 bottom-2 w-10 bg-emerald-600 text-white rounded-xl flex items-center justify-center hover:bg-emerald-700 disabled:opacity-50 transition-all"
                  >
                    <Send size={18} />
                  </button>
                </div>
                <p className="text-[9px] text-center text-stone-400 dark:text-zinc-500 mt-4 uppercase tracking-widest font-bold">
                  O Tutor pode cometer erros. Sempre confira na sua Bíblia.
                </p>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};
