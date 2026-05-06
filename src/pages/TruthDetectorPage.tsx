import React, { useState } from 'react';
import { 
  ShieldCheck, 
  Loader2, 
  ImageIcon,
  CheckCircle2,
  AlertTriangle,
  Sparkles,
  Maximize2,
  Minimize2
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { MarkdownRenderer } from '../components/MarkdownRenderer';
import { geminiService } from '../services/geminiService';
import { useToast } from '../components/Toast';
import { AudioSearchButton } from '../components/AudioSearchButton';
import { cn } from '../types';
import { useAccessibility } from '../contexts/AccessibilityContext';

export default function TruthDetectorPage() {
  const { fontFamily, fontSize, lineHeight } = useAccessibility();
  const { showToast } = useToast();
  const [factCheckInput, setFactCheckInput] = useState('');
  const [factCheckResult, setFactCheckResult] = useState('');
  const [isChecking, setIsChecking] = useState(false);
  const [isImageCheck, setIsImageCheck] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const handleFactCheck = async () => {
    if (!factCheckInput && !previewImage) return;
    setIsChecking(true);
    showToast("Analisando veracidade... O Espírito da Verdade nos guia! 🕊️🧠", 'info');
    try {
      const content = isImageCheck ? previewImage! : factCheckInput;
      const result = await geminiService.factCheck(content, isImageCheck);
      setFactCheckResult(result);
    } catch (error) {
      console.error(error);
      showToast("Erro ao verificar fatos.", 'error');
    } finally {
      setIsChecking(false);
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewImage(reader.result as string);
        setIsImageCheck(true);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className={cn(
      "mx-auto space-y-8 transition-all duration-500",
      isFullscreen ? "fixed inset-0 z-[100] bg-white dark:bg-zinc-950 p-6 md:p-12 overflow-y-auto max-w-none" : "max-w-4xl"
    )}>
      <header className="text-center space-y-4 relative">
        <div className="absolute right-0 top-0">
          <button 
            onClick={() => setIsFullscreen(!isFullscreen)}
            className="p-3 bg-stone-100 dark:bg-zinc-800 rounded-2xl hover:bg-blue-100 dark:hover:bg-blue-900/30 text-blue-600 transition-all shadow-sm"
            title={isFullscreen ? "Sair da Tela Cheia" : "Tela Cheia"}
          >
            {isFullscreen ? <Minimize2 size={24} /> : <Maximize2 size={24} />}
          </button>
        </div>
        <div className="inline-flex items-center justify-center w-20 h-20 bg-blue-600 text-white rounded-[2rem] shadow-xl mb-4">
          <ShieldCheck size={40} />
        </div>
        <h1 className="text-4xl font-display font-black tracking-tight">Fato ou Fake</h1>
        <p className="text-stone-500 dark:text-zinc-400 max-w-xl mx-auto">
          Utilize nossa inteligência artificial para verificar a veracidade de notícias, textos ou imagens. O Espírito da Verdade nos guia em toda a verdade.
        </p>
      </header>

      <div className="bg-white dark:bg-zinc-900 p-8 md:p-12 rounded-[3rem] border border-stone-200 dark:border-zinc-800 shadow-xl space-y-8">
        <div className="flex justify-center">
          <div className="flex p-1 bg-stone-100 dark:bg-zinc-800 rounded-2xl w-full max-w-md">
            <button 
              onClick={() => setIsImageCheck(false)}
              className={cn(
                "flex-1 py-3 rounded-xl text-sm font-bold transition-all",
                !isImageCheck ? "bg-white dark:bg-zinc-700 text-blue-600 shadow-sm" : "text-stone-500 dark:text-zinc-400"
              )}
            >
              Texto ou Notícia
            </button>
            <button 
              onClick={() => setIsImageCheck(true)}
              className={cn(
                "flex-1 py-3 rounded-xl text-sm font-bold transition-all",
                isImageCheck ? "bg-white dark:bg-zinc-700 text-blue-600 shadow-sm" : "text-stone-500 dark:text-zinc-400"
              )}
            >
              Análise de Imagem
            </button>
          </div>
        </div>

        <div className="space-y-6">
          {!isImageCheck ? (
            <div className="relative">
              <textarea 
                value={factCheckInput}
                onChange={(e) => setFactCheckInput(e.target.value)}
                placeholder="⚓ Cole aqui o texto ou notícia duvidosa que deseja verificar..."
                className={cn(
                  "w-full h-48 md:h-64 p-6 md:p-8 pr-16 bg-stone-50 dark:bg-zinc-800/50 border border-stone-200 dark:border-zinc-700 rounded-[2rem] outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all resize-none shadow-inner",
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
              <div className="absolute right-6 top-6">
                <AudioSearchButton onResult={(text) => setFactCheckInput(text)} size={24} />
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div 
                onClick={() => document.getElementById('fact-image-upload-full')?.click()}
                className="aspect-square md:aspect-video bg-stone-50 dark:bg-zinc-800/50 border-4 border-dashed border-stone-200 dark:border-zinc-700 rounded-[2rem] md:rounded-[2.5rem] flex flex-col items-center justify-center cursor-pointer hover:border-blue-500 hover:bg-blue-50/50 dark:hover:bg-blue-900/10 transition-all overflow-hidden group"
              >
                {previewImage ? (
                  <img src={previewImage} alt="Preview" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                ) : (
                  <>
                    <div className="w-20 h-20 bg-white dark:bg-zinc-800 rounded-3xl flex items-center justify-center shadow-sm mb-4 group-hover:scale-110 transition-transform">
                      <ImageIcon className="text-blue-600" size={40} />
                    </div>
                    <span className="text-lg font-bold text-stone-700 dark:text-zinc-300">Clique para enviar imagem</span>
                    <p className="text-sm text-stone-500">Arraste ou selecione um arquivo</p>
                  </>
                )}
              </div>
              <input 
                id="fact-image-upload-full"
                type="file" 
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
              />
            </div>
          )}

          <button 
            onClick={handleFactCheck}
            disabled={isChecking || (!factCheckInput && !previewImage)}
            className="w-full py-6 bg-blue-600 text-white font-black text-xl rounded-[2rem] hover:bg-blue-700 transition-all flex items-center justify-center gap-3 disabled:opacity-50 shadow-xl shadow-blue-600/20 active:scale-[0.98]"
          >
            {isChecking ? <Loader2 className="animate-spin" size={28} /> : <Sparkles size={28} />}
            Verificar Veracidade
          </button>
        </div>

        <AnimatePresence>
          {factCheckResult && (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-8 md:p-12 bg-stone-50 dark:bg-zinc-800/50 rounded-[2.5rem] border border-stone-200 dark:border-zinc-700 space-y-6"
            >
              <div className="flex items-center gap-4">
                {factCheckResult.toLowerCase().includes('fake') ? (
                  <div className="flex items-center gap-3 text-red-600 dark:text-red-400 font-black text-2xl">
                    <AlertTriangle size={32} />
                    Possível Fake News
                  </div>
                ) : (
                  <div className="flex items-center gap-3 text-emerald-600 dark:text-emerald-400 font-black text-2xl">
                    <CheckCircle2 size={32} />
                    Informação Verídica
                  </div>
                )}
              </div>
              <div className="text-stone-700 dark:text-zinc-300 prose prose-lg dark:prose-invert max-w-none">
                <MarkdownRenderer content={factCheckResult} />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
