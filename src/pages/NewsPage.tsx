import React, { useState, useEffect } from 'react';
import { 
  Newspaper, 
  Globe, 
  ShieldCheck, 
  ShieldAlert, 
  Search, 
  Loader2, 
  Volume2, 
  Upload, 
  Image as ImageIcon,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Sparkles
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { MarkdownRenderer } from '../components/MarkdownRenderer';
import { geminiService } from '../services/geminiService';
import { useToast } from '../components/Toast';
import { AudioSearchButton } from '../components/AudioSearchButton';
import { cn } from '../types';
import { useAccessibility } from '../contexts/AccessibilityContext';
import { CreditInfoTip } from '../components/CreditInfoTip';

export default function NewsPage() {
  const { fontFamily, fontSize, lineHeight } = useAccessibility();
  const { showToast } = useToast();
  const [news, setNews] = useState('');
  const [isLoadingNews, setIsLoadingNews] = useState(false);
  const [factCheckInput, setFactCheckInput] = useState('');
  const [factCheckResult, setFactCheckResult] = useState('');
  const [isChecking, setIsChecking] = useState(false);
  const [isImageCheck, setIsImageCheck] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);

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

  const handleSpeak = async (text: string) => {
    showToast("Preparando áudio... 🔊✨", 'info');
    try {
      const audio = await geminiService.generateSpeech(text.slice(0, 1000));
      if (audio) {
        const audioObj = new Audio(audio);
        audioObj.oncanplaythrough = () => {
          audioObj.play().catch(e => console.error("Error playing audio:", e));
        };
      } else {
        showToast("Erro ao gerar áudio.", 'error');
      }
    } catch (error) {
      console.error(error);
      showToast("Erro ao gerar áudio.", 'error');
    }
  };

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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        {/* News Feed */}
        <div className="lg:col-span-2 space-y-8">
          <div className="bg-white dark:bg-zinc-900 p-8 rounded-[2.5rem] border border-stone-200 dark:border-zinc-800 shadow-sm min-h-[600px]">
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

        {/* Fact Checker */}
        <div className="space-y-8">
          <div className="bg-zinc-900 text-white p-8 rounded-[2.5rem] shadow-xl space-y-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center shadow-lg">
                <ShieldCheck size={24} />
              </div>
              <div>
                <h3 className="font-bold text-lg">Detector de Verdade</h3>
                <p className="text-xs text-zinc-400">Verifique se é Verdade ou Fake</p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex gap-2">
                <button 
                  onClick={() => setIsImageCheck(false)}
                  className={cn(
                    "flex-1 py-2 rounded-xl text-xs font-bold transition-all",
                    !isImageCheck ? "bg-blue-600 text-white" : "bg-zinc-800 text-zinc-400"
                  )}
                >
                  Texto
                </button>
                <button 
                  onClick={() => setIsImageCheck(true)}
                  className={cn(
                    "flex-1 py-2 rounded-xl text-xs font-bold transition-all",
                    isImageCheck ? "bg-blue-600 text-white" : "bg-zinc-800 text-zinc-400"
                  )}
                >
                  Imagem
                </button>
              </div>

              {!isImageCheck && (
                <div className="relative">
                  <textarea 
                    value={factCheckInput}
                    onChange={(e) => setFactCheckInput(e.target.value)}
                    placeholder="⚓ Cole aqui o texto ou notícia duvidosa..."
                    className={cn(
                      "w-full h-32 p-4 pr-12 bg-zinc-800 border border-zinc-700 rounded-2xl outline-none focus:border-blue-500 resize-none",
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
                  <div className="absolute right-3 top-3">
                    <AudioSearchButton onResult={(text) => setFactCheckInput(text)} size={18} />
                  </div>
                </div>
              )}

              {isImageCheck && (
                <div className="space-y-4">
                  <div 
                    onClick={() => document.getElementById('fact-image-upload')?.click()}
                    className="aspect-video bg-zinc-800 border-2 border-dashed border-zinc-700 rounded-2xl flex flex-col items-center justify-center cursor-pointer hover:border-blue-500 transition-all overflow-hidden"
                  >
                    {previewImage ? (
                      <img src={previewImage} alt="Preview" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                    ) : (
                      <>
                        <ImageIcon className="text-zinc-500 mb-2" size={32} />
                        <span className="text-xs text-zinc-500">Clique para enviar imagem</span>
                      </>
                    )}
                  </div>
                  <input 
                    id="fact-image-upload"
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
                className="w-full py-4 bg-blue-600 text-white font-bold rounded-2xl hover:bg-blue-700 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isChecking ? <Loader2 className="animate-spin" size={20} /> : <Sparkles size={20} />}
                Verificar Agora
              </button>
            </div>

            <AnimatePresence>
              {factCheckResult && (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-6 bg-zinc-800 rounded-2xl border border-zinc-700 space-y-4"
                >
                  <div className="flex items-center gap-2">
                    {factCheckResult.toLowerCase().includes('fake') ? (
                      <div className="flex items-center gap-2 text-red-400 font-bold">
                        <AlertTriangle size={20} />
                        Possível Fake News
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 text-emerald-400 font-bold">
                        <CheckCircle2 size={20} />
                        Informação Verídica
                      </div>
                    )}
                  </div>
                  <div className="text-zinc-300 prose prose-invert max-w-none">
                    <MarkdownRenderer content={factCheckResult} />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className="bg-emerald-50 dark:bg-emerald-900/10 p-8 rounded-[2.5rem] border border-emerald-100 dark:border-emerald-900/20 space-y-4">
            <h4 className="font-bold text-emerald-800 dark:text-emerald-400 flex items-center gap-2">
              <Sparkles size={20} />
              Campo Missionário
            </h4>
            <p className="text-sm text-emerald-700 dark:text-emerald-300/70 leading-relaxed">
              "Ide por todo o mundo e pregai o evangelho a toda criatura." - Marcos 16:15
            </p>
            <div className="pt-2">
              <button 
                onClick={() => {
                  setNews('');
                  setIsLoadingNews(true);
                  geminiService.searchNews("notícias campo missionário missões evangelismo obras sociais cristãs").then(setNews).finally(() => setIsLoadingNews(false));
                }}
                className="text-xs font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1 hover:underline"
              >
                Ver apenas missões <ArrowRight size={14} />
              </button>
            </div>
          </div>
        </div>
        <CreditInfoTip />
      </div>
    </div>
  );
}
