import React, { useState, useEffect } from 'react';
import { 
  Globe, 
  Calendar, 
  Sparkles, 
  Loader2, 
  CheckCircle, 
  Download, 
  Share2, 
  Save,
  ArrowRight,
  Heart,
  Users,
  MapPin,
  ArrowLeft
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { geminiService } from '../services/geminiService';
import { Type } from "@google/genai";
import { useToast } from '../components/Toast';
import MissionaryBulkResults from './MissionaryBulkResults';

interface MissionaryPageProps {
  onNavigate: (tab: string) => void;
}

export default function MissionaryPage({ onNavigate }: MissionaryPageProps) {
  const { showToast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [hasResults, setHasResults] = useState(false);
  const [showResults, setShowResults] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('missionary_bulk_devotionals');
    if (saved) setHasResults(true);
  }, []);

  const handleGenerateBulk = async () => {
    setIsLoading(true);
    showToast("Gerando devocionais para o mês inteiro... Isso pode levar um momento. 🌍✨", 'info');
    
    try {
      const prompt = `Gere 30 devocionais curtos para um mês missionário. Cada devocional deve ter: Título, Versículo Chave e uma Mensagem Impactante. Formate como um JSON array de objetos com as chaves: title, verse, message.`;
      const response = await geminiService.generateJSON(prompt, "Você é um estrategista de missões e evangelismo.", {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            verse: { type: Type.STRING },
            message: { type: Type.STRING }
          },
          required: ["title", "verse", "message"]
        }
      });
      
      localStorage.setItem('missionary_bulk_devotionals', JSON.stringify(response));
      setHasResults(true);
      showToast("Devocionais gerados com sucesso!", 'success');
      setShowResults(true);
    } catch (error) {
      console.error(error);
      showToast("Erro ao gerar devocionais em massa.", 'error');
    } finally {
      setIsLoading(false);
    }
  };

  if (showResults) {
    return (
      <div className="space-y-6">
        <button 
          onClick={() => setShowResults(false)}
          className="flex items-center gap-2 text-stone-500 hover:text-emerald-600 transition-colors font-bold"
        >
          <ArrowLeft size={20} /> VOLTAR PARA MISSÕES
        </button>
        <MissionaryBulkResults onBack={() => setShowResults(false)} />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div className="bg-emerald-600 p-12 rounded-[3rem] text-white shadow-xl shadow-emerald-600/20 relative overflow-hidden">
        <div className="absolute top-0 right-0 p-12 opacity-10">
          <Globe size={200} />
        </div>
        <div className="relative z-10 space-y-6 max-w-2xl">
          <div className="flex items-center gap-4">
            <img 
              src="https://i.postimg.cc/pd0P8t4L/1000097620_removebg_preview.png" 
              alt="Logo" 
              className="w-10 h-10 object-contain"
              referrerPolicy="no-referrer"
            />
            <h2 className="text-4xl font-bold font-display">Missões & Impacto</h2>
            <img 
              src="https://i.postimg.cc/pd0P8t4L/1000097620_removebg_preview.png" 
              alt="Logo" 
              className="w-10 h-10 object-contain"
              referrerPolicy="no-referrer"
            />
          </div>
          <p className="text-emerald-100 text-lg leading-relaxed">
            Ferramentas para impulsionar o evangelismo e o cuidado com o campo missionário. Gere conteúdos em massa para alimentar sua comunidade durante todo o mês.
          </p>
          <div className="flex flex-wrap gap-4 pt-4">
            <button 
              onClick={handleGenerateBulk}
              disabled={isLoading}
              className="px-8 py-4 bg-white text-emerald-600 font-bold rounded-2xl hover:bg-emerald-50 transition-all shadow-lg flex items-center gap-2 disabled:opacity-50"
            >
              {isLoading ? <Loader2 className="animate-spin" size={20} /> : <Sparkles size={20} />}
              GERAR DEVOCIONAIS DO MÊS
            </button>
            {hasResults && (
              <button 
                onClick={() => setShowResults(true)}
                className="px-8 py-4 bg-emerald-500 text-white font-bold rounded-2xl hover:bg-emerald-400 transition-all border border-emerald-400 flex items-center gap-2"
              >
                <Calendar size={20} />
                VER RESULTADOS DO MÊS
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {[
          { title: 'Cuidado Missionário', desc: 'Mensagens de apoio e encorajamento para quem está no campo.', icon: <Heart className="text-red-500" /> },
          { title: 'Estratégias Locais', desc: 'Planos de ação para evangelismo em bairros e comunidades.', icon: <MapPin className="text-blue-500" /> },
          { title: 'Treinamento', desc: 'Capacitação para novos obreiros e voluntários.', icon: <Users className="text-amber-500" /> },
        ].map((item, i) => (
          <div key={i} className="bg-white dark:bg-zinc-900 p-8 rounded-[2.5rem] border border-stone-200 dark:border-zinc-800 shadow-sm hover:shadow-md transition-all">
            <div className="p-4 bg-stone-50 dark:bg-zinc-800 rounded-2xl w-fit mb-6">
              {item.icon}
            </div>
            <h3 className="text-xl font-bold mb-2">{item.title}</h3>
            <p className="text-stone-500 text-sm leading-relaxed">{item.desc}</p>
            <button className="mt-6 text-emerald-600 font-bold text-sm flex items-center gap-2 hover:gap-3 transition-all">
              Explorar <ArrowRight size={16} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
