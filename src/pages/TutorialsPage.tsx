import React, { useState } from 'react';
import { 
  Play, 
  Pause, 
  BookOpen, 
  Search, 
  Sparkles, 
  Edit, 
  ChevronRight, 
  ChevronLeft,
  Volume2,
  Loader2,
  Info,
  GraduationCap,
  StickyNote
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { geminiService } from '../services/geminiService';
import { useToast } from '../components/Toast';

interface TutorialStep {
  title: string;
  description: string;
  icon: React.ReactNode;
  audioText: string;
}

const tutorialSteps: TutorialStep[] = [
  {
    title: "Navegação e Início",
    description: "A Página Inicial é o seu centro de comando. Aqui você encontra atalhos rápidos, a Mensagem da Semana, e o Quadro de Honra. Use a busca global para encontrar qualquer coisa no App ou no seu Caderno.",
    icon: <BookOpen className="text-blue-600" size={32} />,
    audioText: ""
  },
  {
    title: "Imersão Bíblica",
    description: "A ferramenta de Imersão permite pesquisar em mais de 30 fontes simultaneamente. Use o 'Pensamento Profundo' para análises exegéticas avançadas e hermenêutica profunda.",
    icon: <Search className="text-emerald-600" size={32} />,
    audioText: ""
  },
  {
    title: "Curso de Teologia",
    description: "Acesse o Curso de Teologia no menu superior. Cada matéria oferece estudos profundos de 5000+ palavras, diferentes pontos de vista e avaliações para conquistar certificados digitais.",
    icon: <GraduationCap className="text-amber-600" size={32} />,
    audioText: ""
  },
  {
    title: "Meu Caderno Espiritual",
    description: "Organize suas anotações em três categorias: Anotações, Pregações e Estudos. Exporte em PDF formatado para A4, pronto para impressão com cabeçalho personalizado.",
    icon: <StickyNote className="text-purple-600" size={32} />,
    audioText: ""
  },
  {
    title: "Criação de Conteúdo",
    description: "Gere esboços, lições e devocionais com IA. Salve rascunhos para continuar depois e organize seu ministério com ferramentas de produtividade espiritual.",
    icon: <Sparkles className="text-cyan-600" size={32} />,
    audioText: ""
  }
];

export default function TutorialsPage() {
  const [currentStep, setCurrentStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoadingAudio, setIsLoadingAudio] = useState(false);
  const { showToast } = useToast();

  const handlePlayAudio = async () => {
    if (isPlaying) return;
    
    setIsLoadingAudio(true);
    try {
      const response = await geminiService.generateSpeech(tutorialSteps[currentStep].audioText, 'Kore');
      const audio = new Audio(`data:audio/mp3;base64,${response}`);
      audio.onended = () => setIsPlaying(false);
      setIsPlaying(true);
      audio.play();
    } catch (error) {
      console.error(error);
      showToast("Erro ao gerar áudio do tutorial.", 'error');
    } finally {
      setIsLoadingAudio(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-12">
      <header className="text-center space-y-4">
        <div className="inline-block p-4 bg-emerald-100 dark:bg-emerald-900/30 rounded-3xl text-emerald-600 mb-2">
          <Info size={40} />
        </div>
        <h1 className="text-4xl font-display font-bold flex items-center justify-center gap-4">
          <img 
            src="https://i.postimg.cc/pd0P8t4L/1000097620_removebg_preview.png" 
            alt="Logo" 
            className="w-10 h-10 object-contain mix-blend-multiply dark:mix-blend-screen"
            referrerPolicy="no-referrer"
          />
          Tutoriais do App
          <img 
            src="https://i.postimg.cc/pd0P8t4L/1000097620_removebg_preview.png" 
            alt="Logo" 
            className="w-10 h-10 object-contain mix-blend-multiply dark:mix-blend-screen"
            referrerPolicy="no-referrer"
          />
        </h1>
        <p className="text-stone-500 dark:text-zinc-400 max-w-2xl mx-auto">
          Aprenda a dominar todas as ferramentas do Imersão Bíblica IA e potencialize seu estudo e ministério.
        </p>
      </header>

      <div className="relative bg-white dark:bg-zinc-900 rounded-[3rem] border border-stone-200 dark:border-zinc-800 shadow-2xl overflow-hidden min-h-[500px] flex flex-col">
        {/* Progress Bar */}
        <div className="absolute top-0 left-0 right-0 h-2 bg-stone-100 dark:bg-zinc-800">
          <motion.div 
            className="h-full bg-emerald-600"
            initial={{ width: 0 }}
            animate={{ width: `${((currentStep + 1) / tutorialSteps.length) * 100}%` }}
          />
        </div>

        <div className="flex-1 p-8 md:p-16 flex flex-col items-center justify-center text-center space-y-8">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: -20 }}
              className="space-y-8"
            >
              <div className="w-24 h-24 bg-stone-50 dark:bg-zinc-800 rounded-[2rem] flex items-center justify-center mx-auto shadow-inner">
                {tutorialSteps[currentStep].icon}
              </div>
              
              <div className="space-y-4">
                <h2 className="text-3xl font-bold text-emerald-900 dark:text-emerald-400">
                  {currentStep + 1}. {tutorialSteps[currentStep].title}
                </h2>
                <p className="text-xl text-stone-600 dark:text-zinc-300 leading-relaxed max-w-xl mx-auto">
                  {tutorialSteps[currentStep].description}
                </p>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Navigation Controls */}
        <div className="p-8 bg-stone-50 dark:bg-zinc-800/50 border-t border-stone-100 dark:border-zinc-800 flex justify-between items-center">
          <button 
            onClick={() => setCurrentStep(prev => Math.max(0, prev - 1))}
            disabled={currentStep === 0}
            className="flex items-center gap-2 px-6 py-3 bg-white dark:bg-zinc-900 text-stone-600 dark:text-zinc-300 font-bold rounded-xl hover:bg-stone-100 disabled:opacity-30 transition-all"
          >
            <ChevronLeft size={20} />
            Anterior
          </button>
          
          <div className="flex gap-2">
            {tutorialSteps.map((_, idx) => (
              <div 
                key={idx}
                className={cn(
                  "w-2 h-2 rounded-full transition-all",
                  currentStep === idx ? "w-8 bg-emerald-600" : "bg-stone-300 dark:bg-zinc-700"
                )}
              />
            ))}
          </div>

          <button 
            onClick={() => setCurrentStep(prev => Math.min(tutorialSteps.length - 1, prev + 1))}
            disabled={currentStep === tutorialSteps.length - 1}
            className="flex items-center gap-2 px-6 py-3 bg-emerald-600 text-white font-bold rounded-xl hover:bg-emerald-700 disabled:opacity-30 transition-all"
          >
            Próximo
            <ChevronRight size={20} />
          </button>
        </div>
      </div>

      <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-blue-50 dark:bg-blue-900/20 p-8 rounded-3xl border border-blue-100 dark:border-blue-800/30">
          <h4 className="text-lg font-bold text-blue-900 dark:text-blue-400 mb-2">Dica Pro: Pesquisa Wiki</h4>
          <p className="text-blue-800/70 dark:text-blue-300/70 text-sm">
            Ao ler qualquer resultado, você pode clicar em palavras sublinhadas para abrir uma pesquisa instantânea sobre aquele termo.
          </p>
        </div>
        <div className="bg-amber-50 dark:bg-amber-900/20 p-8 rounded-3xl border border-amber-100 dark:border-amber-800/30">
          <h4 className="text-lg font-bold text-amber-900 dark:text-amber-400 mb-2">Dica Pro: Pensamento Profundo</h4>
          <p className="text-amber-800/70 dark:text-amber-300/70 text-sm">
            Ative o 'Pensamento Profundo' na página de Imersão para obter respostas mais elaboradas e reflexivas da Inteligência Artificial.
          </p>
        </div>
      </section>
    </div>
  );
}

function cn(...classes: any[]) {
  return classes.filter(Boolean).join(' ');
}
