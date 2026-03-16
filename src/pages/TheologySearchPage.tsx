import React, { useState } from 'react';
import { 
  Search, 
  Book, 
  ExternalLink, 
  Sparkles,
  Loader2,
  X,
  ArrowLeft,
  BookOpen,
  HelpCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAccessibility } from '../contexts/AccessibilityContext';
import { geminiService } from '../services/geminiService';
import { MarkdownRenderer } from '../components/MarkdownRenderer';
import { useToast } from '../components/Toast';
import { AudioSearchButton } from '../components/AudioSearchButton';
import { useEffect } from 'react';

interface TheologySearchPageProps {
  initialQuery?: string;
}

export default function TheologySearchPage({ initialQuery = '' }: TheologySearchPageProps) {
  const { fontFamily, fontSize, lineHeight } = useAccessibility();
  const { showToast } = useToast();
  const [query, setQuery] = useState(initialQuery);
  const [result, setResult] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSearch = async (overrideQuery?: string) => {
    const searchTarget = overrideQuery || query;
    if (!searchTarget.trim()) return;
    setIsLoading(true);
    setResult('');
    try {
      const prompt = `Pesquise o termo teológico "${searchTarget}" em Bíblias de Estudo, Enciclopédias, Dicionários e Comentários Bíblicos. Forneça uma explicação profunda, citando fontes e versículos.`;
      const response = await geminiService.generateText(prompt, "Você é um PhD em Teologia.");
      setResult(response);
    } catch (error) {
      console.error(error);
      showToast("Erro ao realizar a busca teológica.", 'error');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (initialQuery) {
      handleSearch(initialQuery);
    }
  }, [initialQuery]);

  return (
    <div className="max-w-5xl mx-auto space-y-8">
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
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white dark:bg-zinc-900 p-10 rounded-[3rem] border border-stone-200 dark:border-zinc-800 shadow-xl prose dark:prose-invert max-w-none"
          >
            <div className="flex items-center justify-between mb-8 pb-4 border-b border-stone-100 dark:border-zinc-800">
              <h3 className="text-xl font-bold m-0">Resultado da Pesquisa: {query}</h3>
              <button 
                onClick={() => setResult('')}
                className="p-2 hover:bg-stone-100 dark:hover:bg-zinc-800 rounded-full transition-colors"
              >
                <X size={20} />
              </button>
            </div>
            <MarkdownRenderer content={result} />
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
    </div>
  );
}
