import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mic, X, Loader2, User, RefreshCw, Volume2, Square } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { geminiService } from '../services/geminiService';
import { useToast } from './Toast';
import { cn } from '../types';

export const VoiceChat: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [voiceGender, setVoiceGender] = useState<'male' | 'female'>('female');
  const { user } = useAuth();
  const { showToast } = useToast();
  
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const [chatHistory, setChatHistory] = useState<any[]>([]);

  const getEmoji = () => {
    if (voiceGender === 'female') {
      if (isProcessing) return "🤔";
      if (isPlaying) return "👩‍🏫";
      if (isListening) return "🙋‍♀️";
      return "👩";
    } else {
      if (isProcessing) return "🤔";
      if (isPlaying) return "👨‍🏫";
      if (isListening) return "🙋‍♂️";
      return "👨";
    }
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "bom dia";
    if (hour < 18) return "boa tarde";
    return "boa noite";
  };

  const getSystemInstruction = () => {
    return `Você é um conselheiro cristão e terapeuta acolhedor.
Sua resposta DEVE ser curta e conversacional, ideal para ser ouvida em áudio.
NÃO use formatação markdown, asteriscos, emojis ou listas.
Responda seguindo os princípios cristãos bíblicos, sempre relembrando os ensinamentos de Jesus e do Apóstolo Paulo, dos outros livros do novo testamento, Salmos e Provérbios.
Dê sempre bons conselhos que remetem o usuário a atitudes de maturidade, humildade, gratidão e respeito.
Não incentive pecados, orgulho, egoísmo, mas leve o usuário a corrigir a sua postura e sentimento.
Utilize técnicas de terapia e psicanálise.
Utilize a técnica do "sanduíche": elogie primeiro, critique/corrija depois e finalize com outro elogio.
Após um comentário, faça uma pergunta para dar continuidade no assunto.
O nome do usuário é ${user?.name || 'amigo'}.`;
  };

  const playAudio = async (text: string) => {
    setIsProcessing(true);
    try {
      const voiceName = voiceGender === 'female' ? 'Kore' : 'Zephyr';
      const audioUrl = await geminiService.generateSpeech(text, voiceName);
      
      if (audioUrl) {
        if (audioRef.current) {
          audioRef.current.src = audioUrl;
          audioRef.current.play();
          setIsPlaying(true);
          audioRef.current.onended = () => setIsPlaying(false);
        }
      }
    } catch (error) {
      console.error("Error generating audio:", error);
      showToast("Erro ao gerar áudio.", "error");
    } finally {
      setIsProcessing(false);
    }
  };

  const startChat = async () => {
    setIsOpen(true);
    const greeting = `Olá ${user?.name || 'amigo'}, ${getGreeting()}! Como posso te ajudar hoje?`;
    
    // Add to history
    setChatHistory([
      { role: 'user', parts: [{ text: "Oi" }] },
      { role: 'model', parts: [{ text: greeting }] }
    ]);

    await playAudio(greeting);
  };

  const toggleVoice = () => {
    setVoiceGender(prev => prev === 'female' ? 'male' : 'female');
  };

  const startListening = async () => {
    if (isPlaying && audioRef.current) {
      audioRef.current.pause();
      setIsPlaying(false);
    }

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
        await processUserAudio(audioBlob);
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsListening(true);
    } catch (error) {
      console.error("Error accessing microphone:", error);
      showToast("Erro ao acessar o microfone. Verifique as permissões.", "error");
    }
  };

  const stopListening = () => {
    if (mediaRecorderRef.current && isListening) {
      mediaRecorderRef.current.stop();
      setIsListening(false);
    }
  };

  const processUserAudio = async (audioBlob: Blob) => {
    setIsProcessing(true);
    try {
      // Convert blob to base64
      const reader = new FileReader();
      reader.readAsDataURL(audioBlob);
      reader.onloadend = async () => {
        const base64Audio = (reader.result as string).split(',')[1];
        
        try {
          const ai = geminiService.getAI();
          const response = await ai.models.generateContent({
            model: "gemini-3.1-flash-lite-preview",
            contents: [
              ...chatHistory,
              { role: 'user', parts: [
                { inlineData: { data: base64Audio, mimeType: 'audio/webm' } },
                { text: "Transcreva o meu áudio e responda a ele seguindo as instruções do sistema. Retorne APENAS um JSON válido no formato exato: {\"transcription\": \"o que eu disse\", \"response\": \"a sua resposta\"}" }
              ]}
            ],
            config: {
              systemInstruction: getSystemInstruction(),
              responseMimeType: "application/json",
            }
          });

          const result = JSON.parse(response.text || "{}");
          const transcribedText = result.transcription;
          const chatResponseText = result.response;
          
          if (!transcribedText || !chatResponseText) {
            throw new Error("Invalid JSON structure");
          }

          // Update history
          setChatHistory(prev => [
            ...prev,
            { role: 'user', parts: [{ text: transcribedText }] },
            { role: 'model', parts: [{ text: chatResponseText }] }
          ]);

          // Play response
          await playAudio(chatResponseText);
        } catch (e) {
          console.error("Failed to process audio with single call:", e);
          showToast("Erro ao processar a resposta.", "error");
          setIsProcessing(false);
        }
      };
    } catch (error) {
      console.error("Error processing audio:", error);
      showToast("Erro ao processar sua fala.", "error");
      setIsProcessing(false);
    }
  };

  const stopAudio = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      setIsPlaying(false);
    }
  };

  return (
    <>
      <audio ref={audioRef} className="hidden" />

      {/* Floating Button */}
      <motion.button
        drag
        dragConstraints={{ left: -window.innerWidth + 80, right: 0, top: -window.innerHeight + 80, bottom: 0 }}
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9, cursor: 'grabbing' }}
        onClick={startChat}
        className="fixed bottom-[10.5rem] right-6 md:bottom-[6.5rem] md:right-8 z-[60] w-14 h-14 bg-emerald-600 text-white rounded-full shadow-2xl flex flex-col items-center justify-center gap-0.5 group overflow-hidden border-2 border-white dark:border-zinc-900 cursor-grab active:cursor-grabbing"
      >
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-500 to-teal-700 opacity-0 group-hover:opacity-100 transition-opacity" />
        <Volume2 size={20} className="relative z-10 animate-pulse" />
        <span className="relative z-10 text-[8px] font-black uppercase tracking-widest text-center leading-none">Bate<br/>Papo</span>
      </motion.button>

      {/* Chat Interface */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className="fixed bottom-0 left-0 right-0 md:left-auto md:right-6 md:bottom-24 md:w-96 bg-white dark:bg-zinc-900 rounded-t-3xl md:rounded-3xl shadow-2xl border border-stone-200 dark:border-zinc-800 z-50 overflow-hidden"
          >
            {/* Header */}
            <div className="bg-blue-600 p-4 flex items-center justify-between text-white">
              <div className="flex items-center gap-3">
                <Volume2 size={20} />
                <h3 className="font-bold">Bate Papo Cristão</h3>
              </div>
              <button 
                onClick={() => {
                  setIsOpen(false);
                  stopAudio();
                }} 
                className="p-1 hover:bg-white/20 rounded-full transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {/* Content */}
            <div className="p-8 flex flex-col items-center justify-center gap-8">
              {/* Avatar */}
              <div className="relative">
                <motion.div
                  animate={isPlaying ? { scale: [1, 1.05, 1] } : {}}
                  transition={{ repeat: Infinity, duration: 2 }}
                  className={cn(
                    "w-32 h-32 rounded-full border-4 shadow-xl overflow-hidden flex items-center justify-center text-6xl bg-stone-100 dark:bg-zinc-800",
                    isPlaying ? "border-blue-500" : "border-stone-200 dark:border-zinc-700"
                  )}
                >
                  {getEmoji()}
                </motion.div>
                
                <button
                  onClick={toggleVoice}
                  className="absolute bottom-0 right-0 p-2 bg-white dark:bg-zinc-800 rounded-full shadow-lg border border-stone-200 dark:border-zinc-700 hover:bg-stone-50 dark:hover:bg-zinc-700 transition-colors"
                  title="Trocar Voz"
                >
                  <RefreshCw size={16} className="text-stone-600 dark:text-stone-300" />
                </button>
              </div>

              {/* Status Text */}
              <div className="text-center h-8">
                {isProcessing ? (
                  <p className="text-stone-500 dark:text-stone-400 flex items-center justify-center gap-2">
                    <Loader2 size={16} className="animate-spin" />
                    Pensando...
                  </p>
                ) : isPlaying ? (
                  <p className="text-blue-600 dark:text-blue-400 font-medium animate-pulse">
                    Falando...
                  </p>
                ) : isListening ? (
                  <p className="text-red-500 font-medium animate-pulse">
                    Ouvindo...
                  </p>
                ) : (
                  <p className="text-stone-500 dark:text-stone-400">
                    Toque no microfone para falar
                  </p>
                )}
              </div>

              {/* Controls */}
              <div className="flex items-center justify-center gap-6">
                {isPlaying && (
                  <button
                    onClick={stopAudio}
                    className="p-4 bg-stone-100 dark:bg-zinc-800 text-stone-600 dark:text-stone-300 rounded-full hover:bg-stone-200 dark:hover:bg-zinc-700 transition-colors"
                    title="Parar Áudio"
                  >
                    <Square size={24} />
                  </button>
                )}
                
                <button
                  onClick={isListening ? stopListening : startListening}
                  disabled={isProcessing}
                  className={cn(
                    "p-6 rounded-full shadow-xl transition-all",
                    isListening 
                      ? "bg-red-500 text-white scale-110 animate-pulse" 
                      : "bg-blue-600 text-white hover:bg-blue-700",
                    isProcessing && "opacity-50 cursor-not-allowed"
                  )}
                >
                  <Mic size={32} />
                </button>
              </div>
              
              <p className="text-[10px] text-stone-400 text-center uppercase tracking-widest">
                {isListening ? "Toque para enviar" : "Toque para falar"}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
