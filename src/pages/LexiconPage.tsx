import React, { useState, useEffect, useRef } from 'react';
import { 
  Search, 
  Book, 
  Sparkles,
  Loader2,
  X,
  Volume2,
  Download,
  Languages,
  Globe,
  Quote,
  Library
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

interface LexiconPageProps {
  initialQuery?: string;
}

export default function LexiconPage({ initialQuery = '' }: LexiconPageProps) {
  const { user } = useAuth();
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
        audio.oncanplaythrough = () => {
          audio.play().catch(e => console.error("Error playing audio:", e));
        };
        showToast("Iniciando leitura... Ouça com atenção! 🔊✨", 'success');
        
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
      const prompt = `Você é um especialista reconhecido mundialmente em línguas originais bíblicas (Hebraico, Aramaico e Grego) e em Religião Comparada. Sua tarefa é fornecer um estudo léxico e comparativo profundo para a palavra ou conceito: "${searchTarget}".

Estruture sua resposta obrigatoriamente com as seguintes seções (use negrito para os títulos):

1. **Léxico e Etimologia**: Explique o termo na língua original (transliteração e caracteres originais), sua raiz etimológica e como ele se conecta a outras palavras relacionadas.
2. **Uso e Contexto Bíblico**: Como essa palavra é empregada no Antigo e Novo Testamento. Existe mudança de significado entre os testamentos ou autores? Cite versículos-chave.
3. **Dicionários e Referências**: O que dizem os léxicos de autoridade (como Strong, Vine, Wycliffe ou TDNT - Dicionário Teológico do Novo Testamento).
4. **Perspectiva e Comparação Religiosa**: Como este termo ou conceito é visto no Judaísmo Contemporâneo, Islamismo, Catolicismo Romano (em pontos de fricção dogmática), Espiritismo ou religiões orientais (se houver paralelo relevante). Destaque semelhanças e divergências fundamentais.
5. **Aplicação Acadêmica e Devocional**: Uma síntese do valor desse estudo para o entendimento teológico e uma aplicação pastoral prática.

Use Markdown para formatação rica. Seja acadêmico, porém acessível.`;

      const response = await geminiService.generateText(prompt, "Você é um PhD em Linguística Bíblica e Teologia Comparada.");
      setResult(response);
      
      setTimeout(() => {
        resultRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 100);
    } catch (error) {
      console.error(error);
      showToast("Erro ao realizar a busca léxica.", 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendToCollection = async () => {
    if (!user || !audioUrl || !result) return;
    
    try {
      await addDoc(collection(db, 'audioCollection'), {
        userId: user.id,
        title: `Léxico: ${query}`,
        text: result,
        audioUrl: audioUrl,
        createdAt: new Date().toISOString(),
        type: 'lexicon_search'
      });
      showToast("Estudo enviado para a Coletânea de Áudios! 🎧✨", 'success');
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
    <div className="max-w-5xl mx-auto space-y-8 pb-32">
      <SearchLoadingOverlay isVisible={isLoading || isGeneratingSpeech} message={isLoading ? "Consultando Léxicos e Dicionários..." : "Traduzindo para Áudio..."} />
      
      <div className="bg-[#f5f5f0] dark:bg-zinc-900 p-8 rounded-[2.5rem] border border-stone-200 dark:border-zinc-800 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 opacity-5">
          <Languages size={120} />
        </div>
        
        <div className="flex items-center gap-4 mb-8">
          <div className="p-4 bg-stone-800 text-white rounded-2xl shadow-lg">
            <Library size={24} />
          </div>
          <div>
            <h2 className="text-2xl font-bold font-serif italic text-stone-800 dark:text-stone-200">Dicionário Léxico Bíblico</h2>
            <p className="text-stone-500 text-sm font-sans uppercase tracking-[0.2em]">Pesquisa de Originais e Religião Comparada</p>
          </div>
        </div>

        <div className="relative group">
          <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-stone-400 group-focus-within:text-stone-800 transition-colors" size={24} />
          <input 
            type="text"
            placeholder="Digite uma palavra (ex: Agape, Shalom, Justificação...)"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            className="w-full pl-16 pr-48 py-6 bg-white dark:bg-zinc-800/50 border border-stone-200 dark:border-zinc-700 rounded-3xl outline-none focus:ring-4 focus:ring-stone-800/5 focus:border-stone-800 transition-all text-lg font-serif"
          />
          <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-2">
            <AudioSearchButton onResult={(text) => { setQuery(text); handleSearch(text); }} />
            <button 
              onClick={() => handleSearch()}
              disabled={isLoading || !query.trim()}
              className="px-6 py-3 bg-stone-800 text-white font-bold rounded-2xl hover:bg-stone-900 transition-all disabled:opacity-50 flex items-center gap-2"
            >
              {isLoading ? <Loader2 className="animate-spin" size={20} /> : <><Search size={18} /> PESQUISAR</>}
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
            className="bg-white dark:bg-zinc-900 p-10 rounded-[3rem] border border-stone-200 dark:border-zinc-800 shadow-2xl relative"
          >
            <div className="flex items-center justify-between mb-8 pb-4 border-b border-stone-100 dark:border-zinc-800">
              <div className="flex items-center gap-4">
                <div className="flex flex-col">
                  <span className="text-[10px] text-stone-400 font-black uppercase tracking-[0.3em]">Significado Léxico de</span>
                  <h3 className="text-3xl font-serif italic text-stone-800 dark:text-stone-200 m-0">"{query}"</h3>
                </div>
                <button
                  onClick={() => handleListen(result)}
                  disabled={isGeneratingSpeech}
                  className="p-3 bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300 rounded-2xl hover:bg-stone-200 transition-colors disabled:opacity-50"
                  title="Ouvir Estudo"
                >
                  {isGeneratingSpeech ? <Loader2 size={24} className="animate-spin" /> : <Volume2 size={24} />}
                </button>
              </div>
              <div className="flex items-center gap-3">
                {audioUrl && (
                  <button 
                    onClick={handleSendToCollection}
                    className="px-6 py-3 bg-stone-800 text-white text-xs font-bold rounded-2xl hover:bg-stone-900 shadow-lg shadow-stone-800/20 transition-all flex items-center gap-3"
                  >
                    <Download size={16} />
                    ADICIONAR À COLETÂNEA
                  </button>
                )}
                <button 
                  onClick={() => setResult('')}
                  className="p-3 hover:bg-stone-100 dark:hover:bg-zinc-800 rounded-full transition-colors text-stone-400"
                >
                  <X size={24} />
                </button>
              </div>
            </div>
            
            {audioUrl && (
              <div className="mb-10 bg-[#f5f5f0] dark:bg-zinc-800/50 p-6 rounded-[2rem] border border-stone-200/50 dark:border-zinc-700 space-y-4">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-stone-800 text-white rounded-full flex items-center justify-center shadow-lg">
                    <Volume2 size={24} />
                  </div>
                  <div>
                    <p className="text-sm font-bold font-serif italic">Narração do Estudo Léxico</p>
                    <p className="text-[10px] text-stone-500 uppercase tracking-widest">Audio Intelligence Narrator</p>
                  </div>
                </div>
                <audio controls className="w-full h-10 filter grayscale dark:invert" src={audioUrl} />
              </div>
            )}

            <div className="prose prose-stone dark:prose-invert max-w-none font-serif text-lg leading-relaxed selection:bg-stone-200 selection:text-stone-900">
              <MarkdownRenderer content={result} />
            </div>
            
            <div className="mt-12 pt-8 border-t border-stone-100 dark:border-zinc-800 flex flex-wrap gap-4">
              <div className="flex items-center gap-2 text-[10px] font-bold text-stone-400 uppercase tracking-widest px-4 py-2 bg-stone-50 dark:bg-zinc-800 rounded-full">
                <Globe size={12} /> Religião Comparada
              </div>
              <div className="flex items-center gap-2 text-[10px] font-bold text-stone-400 uppercase tracking-widest px-4 py-2 bg-stone-50 dark:bg-zinc-800 rounded-full">
                <Languages size={12} /> Hebraico & Grego
              </div>
              <div className="flex items-center gap-2 text-[10px] font-bold text-stone-400 uppercase tracking-widest px-4 py-2 bg-stone-50 dark:bg-zinc-800 rounded-full">
                <Book size={12} /> Dicionários Acadêmicos
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {!result && !isLoading && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { 
              title: 'Léxico Original', 
              desc: 'Descubra a raiz das palavras no Hebraico (H) e Grego (G) para um entendimento profundo.', 
              icon: <Languages size={24} />,
              color: 'bg-stone-800'
            },
            { 
              title: 'Religião Comparada', 
              desc: 'Entenda como o Judaísmo, Islamismo e outras tradições interpretam o mesmo conceito.', 
              icon: <Globe size={24} />,
              color: 'bg-stone-600'
            },
            { 
              title: 'Dicionários de Referência', 
              desc: 'Consulta sintetizada aos dicionários Strong, Vine e enciclopédias bíblicas renomadas.', 
              icon: <Quote size={24} />,
              color: 'bg-stone-700'
            },
          ].map((item, i) => (
            <motion.div 
              key={i} 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="p-8 bg-[#f5f5f0] dark:bg-zinc-900 rounded-[2.5rem] border border-stone-200 dark:border-zinc-800 shadow-sm hover:shadow-xl transition-all cursor-pointer group"
            >
              <div className={`p-4 ${item.color} text-white rounded-2xl w-fit mb-6 shadow-lg group-hover:scale-110 transition-transform`}>
                {item.icon}
              </div>
              <h4 className="font-serif italic text-xl mb-3 text-stone-800 dark:text-stone-200">{item.title}</h4>
              <p className="text-stone-500 text-sm leading-relaxed font-sans">{item.desc}</p>
            </motion.div>
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
