import React, { useState, useRef } from 'react';
import { 
  Image as ImageIcon, 
  Type, 
  Download, 
  Share2, 
  Maximize2,
  Palette,
  Layout,
  Sparkles,
  Volume2,
  Loader2,
  Pencil
} from 'lucide-react';
import { motion } from 'framer-motion';
import { useAccessibility } from '../contexts/AccessibilityContext';
import { geminiService } from '../services/geminiService';
import { useToast } from '../components/Toast';
import { cn } from '../types';
import { getRandomWaitingMessage } from '../constants/waitingMessages';
import { SaveToNotebookModal } from '../components/SaveToNotebookModal';
import { Save, Coins } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { db } from '../lib/firebase';
import { collection, addDoc } from 'firebase/firestore';
import { useCredits } from '../contexts/CreditContext';
import html2canvas from 'html2canvas';
import { multiAiService } from '../services/multiAiService';

export default function PostsPage() {
  const { fontFamily: accFontFamily, fontSize: accFontSize, lineHeight: accLineHeight } = useAccessibility();
  const { user } = useAuth();
  const { showToast } = useToast();
  const { balance, consumeCredits, estimateCredits } = useCredits();
  const [isNotebookModalOpen, setIsNotebookModalOpen] = useState(false);
  const [isSavingToNotebook, setIsSavingToNotebook] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [pendingNote, setPendingNote] = useState<{ title: string, content: string } | null>(null);
  const [verse, setVerse] = useState("Pois eu bem sei os planos que tenho para vocês...");
  const [reference, setReference] = useState("Jeremias 29:11");
  const [bgImage, setBgImage] = useState("https://picsum.photos/seed/bible/1080/1080");
  const [fontSize, setFontSize] = useState(32);
  const [fontFamily, setFontFamily] = useState('serif');
  const [textColor, setTextColor] = useState('#ffffff');
  const [aspectRatio, setAspectRatio] = useState('1:1'); // 1:1, 9:16, 4:5
  const [isGeneratingBg, setIsGeneratingBg] = useState(false);
  const [imageDescription, setImageDescription] = useState("");
  const [aiProvider, setAiProvider] = useState<'gemini' | 'openai' | 'stability'>('gemini');

  const postRef = useRef<HTMLDivElement>(null);

  const changeRandomBg = () => {
    setBgImage(`https://picsum.photos/seed/${Math.random()}/1080/1080`);
  };

  const generateAiBg = async () => {
    const cost = estimateCredits('image');
    
    if (balance < cost) {
      showToast(`Créditos insuficientes. Você precisa de ${cost} créditos.`, 'error');
      return;
    }

    setIsGeneratingBg(true);
    showToast(getRandomWaitingMessage(), 'info');
    try {
      const prompt = imageDescription 
        ? `A high-quality, professional image for a Christian post. Description: ${imageDescription}. Style: cinematic, peaceful, spiritual.`
        : `A beautiful, high-quality, spiritual and inspiring background image for a Christian quote about: ${verse}. Style: professional photography, cinematic lighting, peaceful atmosphere.`;
      
      let response: string | null = null;
      
      if (aiProvider === 'gemini') {
        response = await geminiService.generateImage(prompt);
      } else if (aiProvider === 'openai') {
        response = await multiAiService.generateOpenAiImage(prompt);
      } else if (aiProvider === 'stability') {
        response = await multiAiService.generateStabilityImage(prompt);
      }

      if (response) {
        consumeCredits(cost, `Geração de imagem IA (${aiProvider}): ${imageDescription || verse.substring(0, 20)}...`);
        setBgImage(response);
        showToast(`Imagem gerada com sucesso via ${aiProvider.toUpperCase()}! Glória a Deus! 🙌✨`);
      } else {
        showToast(`Não conseguimos gerar a imagem com ${aiProvider.toUpperCase()} agora. Tente novamente ou mude o provedor.`, 'error');
      }
    } catch (error) {
      console.error('Error generating image:', error);
      showToast("Erro ao gerar imagem. Verifique sua conexão.", 'error');
    } finally {
      setIsGeneratingBg(false);
    }
  };

  const handleDownload = async () => {
    if (!postRef.current) return;
    
    setIsDownloading(true);
    showToast("Preparando sua imagem... 🎨", 'info');
    
    try {
      const canvas = await html2canvas(postRef.current, {
        useCORS: true,
        scale: 2, // Higher quality
        backgroundColor: '#000000'
      });
      
      const link = document.createElement('a');
      link.download = `imersao-biblica-post-${Date.now()}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
      showToast("Download concluído! 📥✨");
    } catch (error) {
      console.error('Error downloading image:', error);
      showToast("Erro ao baixar imagem.", 'error');
    } finally {
      setIsDownloading(false);
    }
  };

  const aspectRatios = [
    { id: '1:1', label: 'Instagram Post', class: 'aspect-square' },
    { id: '9:16', label: 'Stories / Reels', class: 'aspect-[9/16]' },
    { id: '4:5', label: 'Facebook / Portrait', class: 'aspect-[4/5]' },
  ];

  const handleSaveDraft = () => {
    const draft = {
      id: Date.now().toString(),
      type: 'post',
      verse,
      reference,
      bgImage,
      fontSize,
      fontFamily,
      textColor,
      aspectRatio,
      date: new Date().toLocaleDateString('pt-BR')
    };

    const savedDrafts = localStorage.getItem('app_drafts');
    const drafts = savedDrafts ? JSON.parse(savedDrafts) : [];
    drafts.push(draft);
    localStorage.setItem('app_drafts', JSON.stringify(drafts));
    showToast("Rascunho do post salvo! 🎨✨");
  };

  const handleSaveToNotebook = () => {
    setPendingNote({
      title: `Post: ${reference}`,
      content: `Versículo: ${verse}\nReferência: ${reference}\nImagem: ${bgImage}`
    });
    setIsNotebookModalOpen(true);
  };

  const confirmSaveToNotebook = async (category: 'Anotações' | 'Esboços' | 'Estudos') => {
    if (!pendingNote) return;
    
    setIsSavingToNotebook(true);
    try {
      if (user) {
        await addDoc(collection(db, 'notes'), {
          userId: user.id,
          title: pendingNote.title,
          content: pendingNote.content,
          category,
          createdAt: new Date().toISOString()
        });
      } else {
        const savedNotes = JSON.parse(localStorage.getItem('preacher_notes') || '[]');
        const newNote = {
          id: Date.now().toString(),
          title: pendingNote.title,
          content: pendingNote.content,
          category,
          date: new Date().toLocaleDateString('pt-BR')
        };
        localStorage.setItem('preacher_notes', JSON.stringify([newNote, ...savedNotes]));
      }
      showToast(`Salvo em ${category}! 📓✨`);
      setIsNotebookModalOpen(false);
      setPendingNote(null);
    } catch (error) {
      console.error("Error saving to notebook:", error);
      showToast("Erro ao salvar no caderno.", 'error');
    } finally {
      setIsSavingToNotebook(false);
    }
  };

  return (
    <div className="space-y-8">
      <header>
        <div className="flex items-center gap-4">
          <img 
            src="https://i.postimg.cc/pd0P8t4L/1000097620_removebg_preview.png" 
            alt="Logo" 
            className="w-8 h-8 object-contain"
            referrerPolicy="no-referrer"
          />
          <h2 className="text-3xl font-display font-bold">Post</h2>
          <img 
            src="https://i.postimg.cc/pd0P8t4L/1000097620_removebg_preview.png" 
            alt="Logo" 
            className="w-8 h-8 object-contain"
            referrerPolicy="no-referrer"
          />
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* Preview Area */}
        <div className="space-y-6">
          <div className="sticky top-24">
            <div 
              ref={postRef}
              className={cn(
                "relative w-full rounded-3xl overflow-hidden shadow-2xl bg-zinc-900 flex items-center justify-center p-12 text-center",
                aspectRatios.find(a => a.id === aspectRatio)?.class
              )}
            >
              <img 
                src={bgImage} 
                alt="Background" 
                className="absolute inset-0 w-full h-full object-cover opacity-60"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-black/20" />
              
              <div className="relative z-10 space-y-4">
                <p 
                  style={{ 
                    fontSize: `${fontSize}px`, 
                    fontFamily: fontFamily === 'serif' ? 'Georgia, serif' : 'Inter, sans-serif',
                    color: textColor
                  }}
                  className="font-medium leading-tight italic drop-shadow-lg"
                >
                  "{verse}"
                </p>
                <p 
                  style={{ color: textColor }}
                  className="text-lg font-bold opacity-80 uppercase tracking-widest"
                >
                  — {reference}
                </p>
              </div>

              <div className="absolute bottom-6 left-1/2 -translate-x-1/2 text-[10px] text-white/40 uppercase tracking-[0.3em] font-bold">
                Imersão Bíblica
              </div>
            </div>

            <div className="mt-6 flex flex-col gap-4">
              <button 
                onClick={handleDownload}
                disabled={isDownloading}
                className="w-full py-4 bg-emerald-600 text-white font-bold rounded-2xl hover:bg-emerald-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isDownloading ? <Loader2 className="animate-spin" size={20} /> : <Download size={20} />}
                Baixar Imagem
              </button>
              <button className="w-full py-4 bg-stone-100 dark:bg-zinc-800 rounded-2xl hover:bg-stone-200 transition-colors flex items-center justify-center gap-2 font-bold text-stone-600 dark:text-zinc-300">
                <Share2 size={20} /> Compartilhar Post
              </button>
              <button 
                onClick={handleSaveDraft}
                className="w-full py-4 bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400 font-bold rounded-2xl hover:bg-amber-100 transition-colors flex items-center justify-center gap-2"
              >
                <Pencil size={20} /> Salvar Rascunho
              </button>
              <button 
                onClick={handleSaveToNotebook}
                className="w-full py-4 bg-emerald-600 text-white font-bold rounded-2xl hover:bg-emerald-700 transition-colors flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/20"
              >
                <Save size={20} /> Salvar no Caderno
              </button>
            </div>
          </div>
        </div>

        {/* Controls Area */}
        <div className="space-y-8">
          <div className="bg-white dark:bg-zinc-900 p-8 rounded-3xl border border-stone-200 dark:border-zinc-800 shadow-sm space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-bold text-stone-500 uppercase tracking-wider">Texto do Versículo</label>
              <textarea 
                value={verse}
                onChange={(e) => setVerse(e.target.value)}
                className={cn(
                  "w-full p-4 bg-stone-50 dark:bg-zinc-800 border border-stone-200 dark:border-zinc-700 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none h-24 resize-none",
                  accFontFamily === 'dyslexic' ? 'font-dyslexic' : 
                  accFontFamily === 'serif' ? 'font-serif' : 
                  accFontFamily === 'mono' ? 'font-mono' : 'font-sans',
                  accFontSize === 'xs' ? 'text-xs' :
                  accFontSize === 'sm' ? 'text-sm' :
                  accFontSize === 'base' ? 'text-base' :
                  accFontSize === 'lg' ? 'text-lg' :
                  accFontSize === 'xl' ? 'text-xl' :
                  accFontSize === '2xl' ? 'text-2xl' : 'text-3xl'
                )}
                style={{ lineHeight: accLineHeight }}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold text-stone-500 uppercase tracking-wider">Referência</label>
              <input 
                type="text"
                value={reference}
                onChange={(e) => setReference(e.target.value)}
                className="w-full p-4 bg-stone-50 dark:bg-zinc-800 border border-stone-200 dark:border-zinc-700 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-bold text-stone-500 uppercase tracking-wider">Tamanho da Fonte</label>
                <input 
                  type="range" min="16" max="64" 
                  value={fontSize}
                  onChange={(e) => setFontSize(parseInt(e.target.value))}
                  className="w-full accent-emerald-600"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-stone-500 uppercase tracking-wider">Cor do Texto</label>
                <input 
                  type="color" 
                  value={textColor}
                  onChange={(e) => setTextColor(e.target.value)}
                  className="w-full h-10 rounded-lg cursor-pointer"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold text-stone-500 uppercase tracking-wider">Formato</label>
              <div className="grid grid-cols-3 gap-2">
                {aspectRatios.map((ratio) => (
                  <button
                    key={ratio.id}
                    onClick={() => setAspectRatio(ratio.id)}
                    className={cn(
                      "p-2 rounded-lg text-[10px] font-bold border transition-all flex flex-col items-center gap-1",
                      aspectRatio === ratio.id 
                        ? "bg-emerald-600 text-white border-emerald-600" 
                        : "border-stone-200 dark:border-zinc-700 hover:bg-stone-50 dark:hover:bg-zinc-800"
                    )}
                  >
                    <Layout size={16} />
                    {ratio.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold text-stone-500 uppercase tracking-wider">Provedor de IA</label>
              <div className="grid grid-cols-3 gap-2">
                {(['gemini', 'openai', 'stability'] as const).map((provider) => (
                  <button
                    key={provider}
                    onClick={() => setAiProvider(provider)}
                    className={cn(
                      "p-2 rounded-lg text-[10px] font-bold border transition-all capitalize",
                      aiProvider === provider 
                        ? "bg-zinc-900 text-white border-zinc-900 dark:bg-zinc-100 dark:text-zinc-900" 
                        : "border-stone-200 dark:border-zinc-700 hover:bg-stone-50 dark:hover:bg-zinc-800"
                    )}
                  >
                    {provider}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold text-stone-500 uppercase tracking-wider">Descreva a Imagem (IA)</label>
              <textarea 
                value={imageDescription}
                onChange={(e) => setImageDescription(e.target.value)}
                placeholder="⚓ Ex: Uma bíblia aberta em uma mesa de madeira com luz suave do sol..."
                className={cn(
                  "w-full p-4 bg-stone-50 dark:bg-zinc-800 border border-stone-200 dark:border-zinc-700 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none h-20 resize-none",
                  accFontFamily === 'dyslexic' ? 'font-dyslexic' : 
                  accFontFamily === 'serif' ? 'font-serif' : 
                  accFontFamily === 'mono' ? 'font-mono' : 'font-sans',
                  accFontSize === 'xs' ? 'text-xs' :
                  accFontSize === 'sm' ? 'text-sm' :
                  accFontSize === 'base' ? 'text-base' :
                  accFontSize === 'lg' ? 'text-lg' :
                  accFontSize === 'xl' ? 'text-xl' :
                  accFontSize === '2xl' ? 'text-2xl' : 'text-3xl'
                )}
                style={{ lineHeight: accLineHeight }}
              />
            </div>

            <button
              onClick={generateAiBg}
              disabled={isGeneratingBg}
              className="w-full py-4 bg-zinc-900 dark:bg-zinc-100 dark:text-zinc-900 text-white font-bold rounded-2xl hover:opacity-90 flex flex-col items-center justify-center gap-1 transition-all disabled:opacity-50"
            >
              <div className="flex items-center gap-2">
                {isGeneratingBg ? <Loader2 className="animate-spin" size={20} /> : <Sparkles size={20} />}
                Gerar Fundo com IA
              </div>
              <div className="flex items-center gap-1 text-[10px] opacity-70">
                <Coins size={10} />
                Custo: {estimateCredits('image')} créditos
              </div>
            </button>
          </div>
        </div>
      </div>
      <SaveToNotebookModal
        isOpen={isNotebookModalOpen}
        isLoading={isSavingToNotebook}
        onClose={() => setIsNotebookModalOpen(false)}
        onConfirm={confirmSaveToNotebook}
      />
    </div>
  );
}
