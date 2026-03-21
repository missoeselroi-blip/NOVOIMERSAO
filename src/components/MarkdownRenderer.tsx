import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import rehypeRaw from 'rehype-raw';
import { Sparkles, Volume2, Mic, Send, AlertCircle, Loader2, X, CheckCircle2 } from 'lucide-react';
import { useAccessibility } from '../contexts/AccessibilityContext';
import { cn } from '../types';
import { geminiService } from '../services/geminiService';
import { useToast } from './Toast';
import { useAudioBox } from '../contexts/AudioBoxContext';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

interface MarkdownRendererProps {
  content: string;
  onSearch?: (query: string) => void;
  highlight?: string;
  title?: string;
}

export const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({ content, onSearch, highlight, title }) => {
  const { fontFamily, fontSize, lineHeight } = useAccessibility();
  const { showToast } = useToast();
  const { saveTrack } = useAudioBox();
  const navigate = useNavigate();
  
  const [isGenerating, setIsGenerating] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [confirmAction, setConfirmAction] = useState<'reading' | 'emotive' | 'send' | null>(null);

  const fontClasses = {
    sans: 'font-sans',
    serif: 'font-serif',
    mono: 'font-mono',
    dyslexic: 'font-dyslexic',
  };

  const sizeClasses = {
    xs: 'text-xs',
    sm: 'text-sm',
    base: 'text-base',
    lg: 'text-lg',
    xl: 'text-xl',
    '2xl': 'text-2xl',
    '3xl': 'text-3xl',
  };

  const handleAudioAction = async (action: 'reading' | 'emotive' | 'send') => {
    setConfirmAction(action);
    setShowConfirm(true);
  };

  const executeAudioAction = async () => {
    if (!confirmAction) return;
    
    setShowConfirm(false);
    setIsGenerating(true);
    
    try {
      const cleanText = content.replace(/#+\s/g, '').replace(/\*\*/g, '').replace(/\*/g, '').trim();
      const voice = 'mulher'; // Default
      const emotion = confirmAction === 'emotive' ? 'emocional e inspirador' : 'neutro e claro';
      
      if (confirmAction === 'send') {
        showToast('Enviando para geração de narração completa...', 'info');
        // Navigate to devotional with text
        navigate('/devotional', { state: { text: content, title: title || 'Resultado de Pesquisa' } });
        return;
      }

      showToast('Gerando áudio... Isso pode levar alguns instantes.', 'info');
      
      const audioUrl = await geminiService.generateSpeech(
        cleanText, 
        confirmAction === 'emotive' ? 'Zephyr' : 'Kore'
      );

      if (audioUrl) {
        await saveTrack(
          title || 'Áudio de Pesquisa',
          'Resultado de Pesquisa',
          audioUrl,
          confirmAction === 'emotive' ? 'Narração Emotiva' : 'Leitura Simples',
          confirmAction === 'emotive' ? 'Inspirador' : 'Neutro',
          cleanText
        );
        showToast('Áudio gerado e salvo no Audio Box! 🎧', 'success');
      } else {
        throw new Error('Falha ao gerar áudio');
      }
    } catch (error) {
      console.error('Error generating audio:', error);
      showToast('Erro ao gerar áudio. Tente novamente.', 'error');
    } finally {
      setIsGenerating(false);
      setConfirmAction(null);
    }
  };

  const uriTransformer = (uri: string) => {
    if (uri.startsWith('search:') || uri.startsWith('theology-search:')) return uri;
    const protocols = ['http', 'https', 'mailto', 'tel'];
    const protocol = uri.split(':')[0].toLowerCase();
    if (protocols.includes(protocol)) return uri;
    return '';
  };

  return (
    <div className="relative group/markdown">
      {/* Audio Toolbar */}
      <div className="absolute -top-4 right-0 flex items-center gap-1 opacity-0 group-hover/markdown:opacity-100 transition-opacity z-10 no-print">
        <div className="bg-white dark:bg-zinc-900 border border-stone-200 dark:border-zinc-800 rounded-full shadow-lg p-1 flex items-center gap-1">
          <button
            onClick={() => handleAudioAction('reading')}
            disabled={isGenerating}
            className="p-2 hover:bg-stone-100 dark:hover:bg-zinc-800 rounded-full text-stone-500 hover:text-emerald-600 transition-colors disabled:opacity-50"
            title="Gerar Áudio de Leitura"
          >
            {isGenerating && confirmAction === 'reading' ? <Loader2 className="animate-spin" size={16} /> : <Volume2 size={16} />}
          </button>
          <button
            onClick={() => handleAudioAction('emotive')}
            disabled={isGenerating}
            className="p-2 hover:bg-stone-100 dark:hover:bg-zinc-800 rounded-full text-stone-500 hover:text-emerald-600 transition-colors disabled:opacity-50"
            title="Narração Emotiva"
          >
            {isGenerating && confirmAction === 'emotive' ? <Loader2 className="animate-spin" size={16} /> : <Mic size={16} />}
          </button>
          <button
            onClick={() => handleAudioAction('send')}
            disabled={isGenerating}
            className="p-2 hover:bg-stone-100 dark:hover:bg-zinc-800 rounded-full text-stone-500 hover:text-emerald-600 transition-colors disabled:opacity-50"
            title="Enviar para Narração Completa"
          >
            <Send size={16} />
          </button>
        </div>
      </div>

      {/* Confirmation Modal */}
      <AnimatePresence>
        {showConfirm && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-white dark:bg-zinc-900 rounded-3xl p-8 max-w-md w-full shadow-2xl border border-stone-200 dark:border-zinc-800"
            >
              <div className="flex items-center gap-4 mb-6 text-amber-500">
                <AlertCircle size={32} />
                <h3 className="text-xl font-black uppercase tracking-tight text-stone-900 dark:text-white">Atenção</h3>
              </div>
              
              <p className="text-stone-600 dark:text-zinc-400 mb-8 leading-relaxed">
                Esta ação pode demorar um tempo mais longo dependendo do tamanho do texto. 
                Deseja continuar com a geração do áudio?
              </p>

              <div className="flex gap-3">
                <button
                  onClick={() => setShowConfirm(false)}
                  className="flex-1 px-6 py-3 rounded-2xl font-bold text-stone-500 hover:bg-stone-100 dark:hover:bg-zinc-800 transition-all uppercase text-xs tracking-widest"
                >
                  Cancelar
                </button>
                <button
                  onClick={executeAudioAction}
                  className="flex-1 px-6 py-3 rounded-2xl font-bold bg-emerald-600 text-white hover:bg-emerald-700 shadow-lg shadow-emerald-600/20 transition-all uppercase text-xs tracking-widest flex items-center justify-center gap-2"
                >
                  Continuar
                  <CheckCircle2 size={16} />
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <div 
        className={cn(
          "markdown-content prose dark:prose-invert max-w-none transition-all duration-300",
          fontClasses[fontFamily],
          sizeClasses[fontSize]
        )}
        style={{ lineHeight }}
      >
        <ReactMarkdown
          urlTransform={uriTransformer}
          rehypePlugins={[rehypeRaw]}
          components={{
        a: ({ node, ...props }) => {
          const isSearch = props.href?.startsWith('search:');
          const isTheologySearch = props.href?.startsWith('theology-search:');
          
          if ((isSearch || isTheologySearch) && onSearch) {
            const query = decodeURIComponent(props.href!.replace(/^(search:|theology-search:)/, ''));
            const fullQuery = isTheologySearch ? `theology-search:${query}` : query;
            return (
              <button
                onClick={() => onSearch(fullQuery)}
                className="text-emerald-600 font-bold hover:underline cursor-pointer inline-flex items-center gap-1"
              >
                {props.children}
              </button>
            );
          }
          return <a target="_blank" rel="noopener noreferrer" {...props} />;
        },
        img: ({ node, ...props }) => (
          <img 
            {...props} 
            referrerPolicy="no-referrer" 
            className="rounded-2xl shadow-lg max-w-full h-auto my-6 mx-auto block" 
          />
        ),
        div: ({ node, ...props }) => {
          if (props.className === 'outline-divider-v2') {
            return (
              <div className="my-16 space-y-4 no-print">
                <div className="flex items-center gap-4">
                  <div className="flex-1 h-px bg-gradient-to-r from-transparent via-emerald-500 to-transparent" />
                  <div className="flex gap-2">
                    <Sparkles className="text-emerald-500 animate-pulse" size={18} />
                    <Sparkles className="text-emerald-500 animate-pulse delay-75" size={24} />
                    <Sparkles className="text-emerald-500 animate-pulse delay-150" size={18} />
                  </div>
                  <div className="flex-1 h-px bg-gradient-to-l from-transparent via-emerald-500 to-transparent" />
                </div>
                <div className="flex items-center gap-4 opacity-50">
                  <div className="flex-1 h-px bg-gradient-to-r from-transparent via-blue-500 to-transparent" />
                  <div className="flex-1 h-px bg-gradient-to-l from-transparent via-blue-500 to-transparent" />
                </div>
              </div>
            );
          }
          return <div {...props} />;
        }
      }}
    >
      {content}
    </ReactMarkdown>
      </div>
    </div>
  );
};

export default MarkdownRenderer;
