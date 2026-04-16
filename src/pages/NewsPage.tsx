import React, { useState, useEffect } from 'react';
import { 
  Newspaper, 
  Globe, 
  Loader2, 
  ArrowRight,
  Sparkles
} from 'lucide-react';
import { motion } from 'framer-motion';
import { MarkdownRenderer } from '../components/MarkdownRenderer';
import { geminiService } from '../services/geminiService';
import { useToast } from '../components/Toast';
import { useAccessibility } from '../contexts/AccessibilityContext';
import { CreditInfoTip } from '../components/CreditInfoTip';

export default function NewsPage() {
  const { showToast } = useToast();
  const [news, setNews] = useState('');
  const [isLoadingNews, setIsLoadingNews] = useState(false);

  const fetchNews = async () => {
    setIsLoadingNews(true);
    showToast("Buscando os sinais da vinda de Cristo... 🌍📖", 'info');
    try {
      const query = "sinais da vinda de Cristo: guerras, fome, epidemias, desastres naturais, notícias cristianismo profecias bíblicas";
      const result = await geminiService.searchNews(query);
      setNews(result);
    } catch (error) {
      console.error(error);
      showToast("Erro ao buscar notícias.", 'error');
    } finally {
      setIsLoadingNews(false);
    }
  };

  useEffect(() => {
    fetchNews();
  }, []);

  return (
    <div className="space-y-12">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-4">
            <img 
              src="https://i.postimg.cc/3N279HyV/1000105226-removebg-preview.png" 
              alt="Logo" 
              className="w-8 h-8 object-contain"
              referrerPolicy="no-referrer"
            />
            <h2 className="text-3xl font-display font-bold">Sinais da Vinda de Cristo</h2>
            <img 
              src="https://i.postimg.cc/3N279HyV/1000105226-removebg-preview.png" 
              alt="Logo" 
              className="w-8 h-8 object-contain"
              referrerPolicy="no-referrer"
            />
          </div>
          <p className="text-stone-500 dark:text-zinc-400">Acompanhe os sinais proféticos: guerras, fome, epidemias e desastres naturais.</p>
        </div>
        <button 
          onClick={fetchNews}
          disabled={isLoadingNews}
          className="px-6 py-3 bg-emerald-600 text-white font-bold rounded-2xl hover:bg-emerald-700 transition-all flex items-center gap-2 disabled:opacity-50"
        >
          {isLoadingNews ? <Loader2 className="animate-spin" size={20} /> : <Globe size={20} />}
          Atualizar Notícias
        </button>
      </header>

      <div className="grid grid-cols-1 gap-12">
        {/* News Feed */}
        <div className="space-y-8">
          <div className="bg-white dark:bg-zinc-900 p-6 sm:p-8 rounded-[2rem] sm:rounded-[2.5rem] border border-stone-200 dark:border-zinc-800 shadow-sm min-h-[600px]">
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-xl font-bold flex items-center gap-2">
                <Newspaper className="text-emerald-600" />
                Destaques do Dia
              </h3>
            </div>

            {isLoadingNews ? (
              <div className="flex flex-col items-center justify-center h-96 space-y-4">
                <Loader2 className="animate-spin text-emerald-600" size={48} />
                <p className="text-stone-500 animate-pulse">Sintonizando as notícias do campo...</p>
              </div>
            ) : (
              <div className="prose dark:prose-invert max-w-none">
                <MarkdownRenderer content={news || "Nenhuma notícia encontrada no momento."} />
              </div>
            )}
          </div>
        </div>
      </div>
      <CreditInfoTip />
    </div>
  );
}
