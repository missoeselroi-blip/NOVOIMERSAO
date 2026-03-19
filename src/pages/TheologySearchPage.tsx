import React, { useState, useEffect, useRef } from 'react';
import { 
  Search, 
  Book, 
  ExternalLink, 
  Sparkles,
  Loader2,
  X,
  ArrowLeft,
  BookOpen,
  HelpCircle,
  Volume2,
  Download,
  Share2
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAccessibility } from '../contexts/AccessibilityContext';
import { geminiService } from '../services/geminiService';
import { MarkdownRenderer } from '../components/MarkdownRenderer';
import { useToast } from '../components/Toast';
import { AudioSearchButton } from '../components/AudioSearchButton';
import { SearchLoadingOverlay } from '../components/SearchLoadingOverlay';
import { useAuth } from '../contexts/AuthContext';
import { db } from '../lib/firebase';
import { collection, addDoc } from 'firebase/firestore';

import { AudioConfirmationModal } from '../components/AudioConfirmationModal';

interface TheologySearchPageProps {
  initialQuery?: string;
}

export default function TheologySearchPage({ initialQuery = '' }: TheologySearchPageProps) {
  const { user } = useAuth();
  const { fontFamily, fontSize, lineHeight } = useAccessibility();
  const { showToast } = useToast();
  const [query, setQuery] = useState(initialQuery);
  const [result, setResult] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isGeneratingSpeech, setIsGeneratingSpeech] = useState(false);
  const [isAudioConfirmModalOpen, setIsAudioConfirmModalOpen] = useState(false);
  const [pendingSpeechText, setPendingSpeechText] = useState<string | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const resultRef = useRef<HTMLDivElement>(null);

  const handleListen = async (text: string) => {
    if (!text) return;
    setPendingSpeechText(text);
    setIsAudioConfirmModalOpen(true);
  };

  const confirmGenerateSpeech = async () => {
    if (!pendingSpeechText) return;
    setIsAudioConfirmModalOpen(false);
    setIsGeneratingSpeech(true);
    showToast("Preparando a voz da IA... 🔊📖", 'info');
    try {
      const url = await geminiService.generateSpeech(pendingSpeechText);
      if (url) {
        setAudioUrl(url);
        const audio = new Audio(url);
        audio.play();
        showToast("Iniciando leitura... Ouça com atenção! 🔊✨", 'success');
        
        // Scroll to result after a short delay to allow rendering
        setTimeout(() => {
          resultRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }, 100);
      } else {
        showToast("Erro ao gerar áudio.", 'error');
      }
    } catch (error) {
      console.error(error);
      showToast("Erro ao gerar áudio.", 'error');
    } finally {
      setIsGeneratingSpeech(false);
      setPendingSpeechText(null);
    }
  };

  const handleSearch = async (overrideQuery?: string) => {
    const searchTarget = overrideQuery || query;
    if (!searchTarget.trim()) return;
    setIsLoading(true);
    setResult('');
    setAudioUrl(null);
    try {
      const prompt = `Pesquise o termo teológico "${searchTarget}" em Bíblias de Estudo, Enciclopédias, Dicionários e Comentários Bíblicos. Forneça uma explicação profunda, citando fontes e versículos.`;
      const response = await geminiService.generateText(prompt, "Você é um PhD em Teologia.");
      setResult(response);
      
      // Scroll to result after a short delay to allow rendering
      setTimeout(() => {
        resultRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 100);
    } catch (error) {
      console.error(error);
      showToast("Erro ao realizar a busca teológica.", 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendToCollection = async () => {
    if (!user || !audioUrl || !result) return;
    
    try {
      await addDoc(collection(db, 'audioCollection'), {
        userId: user.id,
        title: `Pesquisa: ${query}`,
        text: result,
        audioUrl: audioUrl,
        createdAt: new Date().toISOString(),
        type: 'theology_search'
      });
      showToast("Áudio enviado para a Coletânea de Áudios! 🎧✨", 'success');
    } catch (error) {
      console.error("Error sending to collection:", error);
      showToast("Erro ao enviar áudio para a coletânea.", 'error');
    }
  };

  useEffect(() => {
    if (initialQuery) {
      handleSearch(initialQuery);
    }
  }, [initialQuery]);

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <SearchLoadingOverlay isVisible={isLoading || isGeneratingSpeech} message={isLoading ? "Pesquisando Teologia..." : "Gerando Áudio..."} />
      
      <div className="bg-white dark:bg-zinc-900 p-8 rounded-[2.5rem] border border-stone-200 dark:border-zinc-800 shadow-xl">
        <div className="flex items-center gap-4 mb-8">
          <div className="p-4 bg-emerald-600 text-white rounded-2xl shadow-lg shadow-emerald-600/20">
            <Search size={24} />
          </div>
          <div>
            <div className="flex items-center gap-3">
              <h2 className="text-2xl font-bold font-display">Busca de Teologia</h2>
            </div>
            <p className="text-stone-500 text-sm">Pesquise termos, conceitos e personagens bíblicos.</p>
          </div>
        </div>

        <div className="relative group">
          <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-stone-400 group-focus-within:text-emerald-600 transition-colors" size={24} />
          <input 
            type="text"
            placeholder="⚓ Ex: Soteriologia, Escatologia, Justificação..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            className="w-full pl-16 pr-48 py-6 bg-stone-50 dark:bg-zinc-800/50 border border-stone-200 dark:border-zinc-700 rounded-3xl outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all text-lg"
          />
          <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-2">
            <AudioSearchButton onResult={(text) => { setQuery(text); handleSearch(text); }} />
            <button 
              onClick={() => handleSearch()}
              disabled={isLoading || !query.trim()}
              className="px-6 py-3 bg-emerald-600 text-white font-bold rounded-2xl hover:bg-emerald-700 transition-all disabled:opacity-50 flex items-center gap-2"
            >
              {isLoading ? <Loader2 className="animate-spin" size={20} /> : <><Search size={18} /> ⚓ BUSCAR</>}
            </button>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {result && (
          <motion.div
            ref={resultRef}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white dark:bg-zinc-900 p-10 rounded-[3rem] border border-stone-200 dark:border-zinc-800 shadow-xl overflow-hidden"
          >
            <div className="flex items-center justify-between mb-8 pb-4 border-b border-stone-100 dark:border-zinc-800">
              <div className="flex items-center gap-4">
                <h3 className="text-xl font-bold m-0">Resultado da Pesquisa: {query}</h3>
                <button
                  onClick={() => handleListen(result)}
                  disabled={isGeneratingSpeech}
                  className="p-2 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 rounded-xl hover:bg-emerald-100 transition-colors disabled:opacity-50"
                  title="Ouvir Resultado"
                >
                  {isGeneratingSpeech ? <Loader2 size={20} className="animate-spin" /> : <Volume2 size={20} />}
                </button>
              </div>
              <div className="flex items-center gap-2">
                {audioUrl && (
                  <button 
                    onClick={handleSendToCollection}
                    className="px-4 py-2 bg-emerald-600 text-white text-xs font-bold rounded-xl hover:bg-emerald-700 transition-colors flex items-center gap-2"
                  >
                    <Download size={14} />
                    Enviar para Coletânea
                  </button>
                )}
                <button 
                  onClick={() => setResult('')}
                  className="p-2 hover:bg-stone-100 dark:hover:bg-zinc-800 rounded-full transition-colors"
                >
                  <X size={20} />
                </button>
              </div>
            </div>
            
            {audioUrl && (
              <div className="mb-8 bg-stone-50 dark:bg-zinc-800/50 p-6 rounded-3xl space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-emerald-600 text-white rounded-full flex items-center justify-center animate-pulse">
                    <Volume2 size={20} />
                  </div>
                  <div>
                    <p className="text-sm font-bold">Áudio Gerado</p>
                    <p className="text-xs text-stone-400">Narração IA</p>
                  </div>
                </div>
                <audio controls className="w-full h-10" src={audioUrl} />
              </div>
            )}

            <div className="prose dark:prose-invert max-w-none">
              <MarkdownRenderer content={result} />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {!result && !isLoading && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { title: 'Termos Gregos', desc: 'Explore o significado original do Novo Testamento.', icon: <Sparkles size={20} /> },
            { title: 'Hermenêutica', desc: 'Princípios para interpretação correta das Escrituras.', icon: <Book size={20} /> },
            { title: 'Sistemática', desc: 'Doutrinas organizadas de forma lógica e bíblica.', icon: <BookOpen size={20} /> },
          ].map((item, i) => (
            <div key={i} className="p-8 bg-white dark:bg-zinc-900 rounded-[2.5rem] border border-stone-100 dark:border-zinc-800 shadow-sm hover:shadow-md transition-all">
              <div className="p-3 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 rounded-xl w-fit mb-4">
                {item.icon}
              </div>
              <h4 className="font-bold text-lg mb-2">{item.title}</h4>
              <p className="text-stone-500 text-sm leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      )}

      <AudioConfirmationModal 
        isOpen={isAudioConfirmModalOpen}
        onClose={() => setIsAudioConfirmModalOpen(false)}
        onConfirm={confirmGenerateSpeech}
        isLoading={isGeneratingSpeech}
      />
    </div>
  );
}
