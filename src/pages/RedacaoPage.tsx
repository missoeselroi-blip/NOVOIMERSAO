import React, { useState, useEffect } from 'react';
import { 
  Pencil, 
  Trash2, 
  Download, 
  Share2, 
  CheckCircle, 
  AlertCircle,
  FileText,
  BarChart3,
  Loader2,
  Sparkles,
  Save,
  Clock
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useToast } from '../components/Toast';
import { useAccessibility } from '../contexts/AccessibilityContext';
import { geminiService } from '../services/geminiService';
import { cn } from '../types';
import { MarkdownRenderer } from '../components/MarkdownRenderer';
import { CreditInfoTip } from '../components/CreditInfoTip';

import { useShare } from '../utils/share';

export default function RedacaoPage() {
  const { fontFamily, fontSize, lineHeight } = useAccessibility();
  const { share } = useShare();
  const { showToast } = useToast();
  const [text, setText] = useState('');
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [evaluation, setEvaluation] = useState<{
    score: number;
    criteria: { label: string, penalty: number, met: boolean }[];
    message: string;
    aiFeedback?: string;
  } | null>(null);

  const [drafts, setDrafts] = useState<{ id: string, text: string, date: string }[]>(() => {
    const saved = localStorage.getItem('redacao_drafts');
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem('redacao_drafts', JSON.stringify(drafts));
  }, [drafts]);

  const saveDraft = () => {
    if (!text.trim()) {
      showToast("Escreva algo antes de salvar como rascunho! ✍️", 'info');
      return;
    }

    const newDraft = {
      id: Date.now().toString(),
      text,
      date: new Date().toLocaleString('pt-BR')
    };

    setDrafts([newDraft, ...drafts].slice(0, 10)); // Keep last 10 drafts
    showToast("Rascunho salvo com sucesso! 📝✨");
  };

  const loadDraft = (draftText: string) => {
    setText(draftText);
    showToast("Rascunho carregado! ✍️");
  };

  const deleteDraft = (id: string) => {
    setDrafts(drafts.filter(d => d.id !== id));
    showToast("Rascunho excluído. 🗑️");
  };

  const wordCount = text.trim() ? text.trim().split(/\s+/).length : 0;

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    showToast("Não é permitido colar textos nesta área. Escreva sua própria redação! ✍️", 'info');
  };

  const evaluateRedacao = async () => {
    if (wordCount < 10) {
      showToast("Escreva um pouco mais antes de avaliar! ✍️", 'info');
      return;
    }

    setIsEvaluating(true);
    showToast("Avaliando sua redação... 🤖", 'info');

    let score = 10;
    const criteria = [
      { label: 'Repetições excessivas', penalty: 1, met: true },
      { label: 'Palavras de baixo calão', penalty: 2, met: true },
      { label: 'Fuga do tema (Como fazer exercícios físicos?)', penalty: 2, met: true },
      { label: 'Mínimo de 200 palavras', penalty: 1, met: true },
      { label: 'Coerência textual', penalty: 2, met: true },
    ];

    // 1. Repetitions (simple check for common words appearing too much)
    const words = (text.toLowerCase().match(/\b\w+\b/g) || []) as string[];
    const wordFreq: Record<string, number> = {};
    words.forEach(w => { if(w.length > 3) wordFreq[w] = (wordFreq[w] || 0) + 1; });
    const hasExcessiveRepetition = Object.values(wordFreq).some(count => count > words.length * 0.1);
    if (hasExcessiveRepetition) {
      score -= 1;
      criteria[0].met = false;
    }

    // 2. Bad words
    const badWords = ['palavrão1', 'palavrão2']; // Mock list
    const hasBadWords = words.some(w => badWords.includes(w));
    if (hasBadWords) {
      score -= 2;
      criteria[1].met = false;
    }

    // 3. Theme check (simple keyword check)
    const themeKeywords = ['exercício', 'físico', 'saúde', 'corpo', 'atividade', 'esporte'];
    const hasThemeKeywords = themeKeywords.some(k => text.toLowerCase().includes(k));
    if (!hasThemeKeywords) {
      score -= 2;
      criteria[2].met = false;
    }

    // 4. Word count
    if (wordCount < 200) {
      score -= 1;
      criteria[3].met = false;
    }

    // 5. Coherence (mock check for sentence structure/length variety)
    const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
    const isCoherent = sentences.length > 3 && sentences.every(s => s.trim().split(' ').length > 2);
    if (!isCoherent) {
      score -= 2;
      criteria[4].met = false;
    }

    let message = "";
    if (score <= 3) message = "Você pode fazer melhor! Acredite!";
    else if (score <= 5) message = "Vamos tentar de novo? Você vai conseguir!";
    else if (score === 6) message = "Foi por pouco! Na próxima vai dar certo!";
    else if (score <= 8) message = "Parabéns! Muito bom!";
    else if (score === 9) message = "Ótimo! Servo bom e fiel!";
    else message = "Excelente! Você é um exemplo para nós!";

    let aiFeedback = "";
    try {
      const prompt = `Avalie a seguinte redação sobre o tema "Como fazer exercícios físicos?".
      Seja cordial, gentil e encorajador.
      Apresente os pontos positivos e os pontos que podem melhorar.
      Deixe claro no início que este é um parecer gerado por Inteligência Artificial.
      
      Redação:
      "${text}"`;
      
      const response = await geminiService.generateText(prompt, "Você é um professor de redação gentil e encorajador.");
      aiFeedback = response || "Não foi possível gerar o feedback da IA no momento.";
    } catch (error) {
      console.error("Erro ao gerar feedback da IA:", error);
      aiFeedback = "Não foi possível gerar o feedback da IA no momento. Tente novamente mais tarde.";
    }

    setEvaluation({ score, criteria, message, aiFeedback });
    setIsEvaluating(false);
  };

  const handleDownload = () => {
    const element = document.createElement("a");
    const file = new Blob([text], {type: 'text/plain'});
    element.href = URL.createObjectURL(file);
    element.download = "minha-redacao.txt";
    document.body.appendChild(element);
    element.click();
    showToast("Baixando redação... 📄");
  };

  const handleShare = async () => {
    await share({ title: 'Minha Redação', text });
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="bg-white dark:bg-zinc-900 p-8 rounded-[2.5rem] border border-stone-200 dark:border-zinc-800 shadow-xl">
        <div className="flex items-center gap-4 mb-6">
          <div className="p-4 bg-emerald-600 text-white rounded-2xl shadow-lg shadow-emerald-600/20">
            <Pencil size={24} />
          </div>
          <div>
            <div className="flex items-center gap-3">
              <img 
                src="/logo.png" 
                alt="Logo" 
                className="w-6 h-6 object-contain"
                referrerPolicy="no-referrer"
              />
              <h2 className="text-2xl font-bold">Oficina de Redação</h2>
              <img 
                src="/logo.png" 
                alt="Logo" 
                className="w-6 h-6 object-contain"
                referrerPolicy="no-referrer"
              />
            </div>
            <p className="text-stone-500 text-sm">Tema: Como fazer exercícios físicos?</p>
          </div>
        </div>

        <div className="relative">
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            onPaste={handlePaste}
            placeholder="⚓ Escreva sua redação aqui... (Mínimo 200 palavras para nota máxima)"
            className={cn(
              "w-full min-h-[400px] p-8 bg-stone-50 dark:bg-zinc-800/50 border border-stone-200 dark:border-zinc-700 rounded-3xl outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all resize-none",
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
          <div className="absolute bottom-6 right-8 flex items-center gap-2 text-stone-400 text-xs font-mono">
            <FileText size={14} />
            {wordCount} palavras
          </div>
        </div>

        <div className="mt-8 flex flex-wrap items-center justify-between gap-4">
          <div className="flex gap-2">
            <button 
              onClick={saveDraft}
              className="p-4 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 rounded-2xl hover:bg-emerald-100 transition-colors"
              title="Salvar Rascunho"
            >
              <Save size={20} />
            </button>
            <button 
              onClick={handleDownload}
              className="p-4 bg-stone-100 dark:bg-zinc-800 text-stone-600 dark:text-zinc-300 rounded-2xl hover:bg-stone-200 transition-colors"
              title="Baixar"
            >
              <Download size={20} />
            </button>
            <button 
              onClick={handleShare}
              className="p-4 bg-stone-100 dark:bg-zinc-800 text-stone-600 dark:text-zinc-300 rounded-2xl hover:bg-stone-200 transition-colors"
              title="Compartilhar"
            >
              <Share2 size={20} />
            </button>
            <button 
              onClick={() => setText('')}
              className="p-4 bg-stone-100 dark:bg-zinc-800 text-red-500 rounded-2xl hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
              title="Limpar"
            >
              <Trash2 size={20} />
            </button>
          </div>

          <button 
            onClick={evaluateRedacao}
            disabled={isEvaluating}
            className="flex-1 md:flex-none px-12 py-4 bg-emerald-600 text-white font-bold rounded-2xl hover:bg-emerald-700 shadow-lg shadow-emerald-600/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {isEvaluating ? <Loader2 className="animate-spin" size={20} /> : <BarChart3 size={20} />}
            AVALIAR REDAÇÃO
          </button>
        </div>
      </div>

      <AnimatePresence>
        {evaluation && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="bg-white dark:bg-zinc-900 p-8 rounded-[2.5rem] border border-stone-200 dark:border-zinc-800 shadow-xl space-y-6"
          >
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-bold">Resultado da Avaliação</h3>
              <div className="flex items-center gap-2 px-6 py-2 bg-emerald-600 text-white rounded-full font-bold">
                Nota: {evaluation.score}/10
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {evaluation.criteria.map((c, i) => (
                <div key={i} className={`p-4 rounded-2xl border flex items-center justify-between ${c.met ? 'bg-emerald-50/50 border-emerald-100 text-emerald-700' : 'bg-red-50/50 border-red-100 text-red-700'}`}>
                  <span className="text-sm font-medium">{c.label}</span>
                  {c.met ? <CheckCircle size={18} /> : <div className="flex items-center gap-1 text-xs font-bold"><AlertCircle size={18} /> -{c.penalty}</div>}
                </div>
              ))}
            </div>

            <div className="p-6 bg-stone-50 dark:bg-zinc-800/50 rounded-2xl text-center">
              <p className="text-2xl font-serif italic text-emerald-600">"{evaluation.message}"</p>
            </div>

            {evaluation.aiFeedback && (
              <div className="mt-6 p-6 bg-blue-50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-800/30 rounded-2xl">
                <div className="flex items-center gap-2 mb-4 text-blue-700 dark:text-blue-400 font-bold">
                  <Sparkles size={20} />
                  <h4>Parecer da Inteligência Artificial</h4>
                </div>
                <div className="prose dark:prose-invert max-w-none text-stone-700 dark:text-zinc-300 text-sm leading-relaxed">
                  <MarkdownRenderer content={evaluation.aiFeedback} />
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {drafts.length > 0 && (
        <div className="bg-white dark:bg-zinc-900 p-8 rounded-[2.5rem] border border-stone-200 dark:border-zinc-800 shadow-xl">
          <div className="flex items-center gap-3 mb-6">
            <Clock className="text-emerald-600" size={24} />
            <h3 className="text-xl font-bold">Rascunhos Recentes</h3>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {drafts.map((draft) => (
              <div key={draft.id} className="p-4 bg-stone-50 dark:bg-zinc-800/50 border border-stone-100 dark:border-zinc-800 rounded-2xl flex flex-col gap-3">
                <div className="flex justify-between items-start">
                  <span className="text-[10px] text-stone-400 font-mono">{draft.date}</span>
                  <button 
                    onClick={() => deleteDraft(draft.id)}
                    className="p-1 text-stone-400 hover:text-red-500 transition-colors"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
                <p className="text-sm text-stone-600 dark:text-zinc-400 line-clamp-2 italic">
                  "{draft.text.slice(0, 100)}..."
                </p>
                <button 
                  onClick={() => loadDraft(draft.text)}
                  className="w-full py-2 bg-white dark:bg-zinc-800 border border-stone-200 dark:border-zinc-700 text-stone-600 dark:text-zinc-300 text-xs font-bold rounded-xl hover:bg-stone-100 transition-all"
                >
                  Carregar Rascunho
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
      <CreditInfoTip />
    </div>
  );
}
