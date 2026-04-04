import React, { useState } from 'react';
import { Play, Video } from 'lucide-react';
import { motion } from 'framer-motion';

const mockSermons = [
  { 
    id: 1, 
    title: 'A Importância da Leitura Bíblica', 
    speaker: 'Imersão Bíblica', 
    type: 'video', 
    videoId: '69BBSmFiHOc',
    summary: 'Descubra como a leitura diária da Palavra de Deus pode transformar sua vida e fortalecer sua fé. Uma reflexão profunda sobre o poder das Escrituras.'
  },
  { 
    id: 2, 
    title: 'Como Entender a Bíblia', 
    speaker: 'Imersão Bíblica', 
    type: 'video', 
    videoId: 'aiizOFTscsY',
    summary: 'Dicas práticas e princípios fundamentais para interpretar e compreender os textos sagrados com mais clareza e profundidade.'
  },
  { 
    id: 3, 
    title: 'O Poder da Oração', 
    speaker: 'Imersão Bíblica', 
    type: 'video', 
    videoId: 'O4bvWuoMmkA',
    summary: 'Uma mensagem inspiradora sobre a importância da oração constante e como ela nos conecta diretamente com o coração de Deus.'
  },
];

const SermonsPage = () => {
  const [sermons] = useState(mockSermons);
  const [activeVideo, setActiveVideo] = useState<string | null>(null);

  return (
    <div className="p-8 max-w-6xl mx-auto pb-32">
      <h1 className="text-4xl font-black tracking-tighter uppercase mb-8 text-stone-900 dark:text-zinc-100">Sermões e Estudos</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {sermons.map((sermon, index) => (
          <motion.div 
            key={sermon.id} 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-white dark:bg-zinc-900 rounded-3xl border border-stone-200 dark:border-zinc-800 overflow-hidden shadow-sm hover:shadow-xl transition-all flex flex-col"
          >
            {activeVideo === sermon.videoId ? (
              <div className="aspect-video w-full">
                <iframe 
                  width="100%" 
                  height="100%" 
                  src={`https://www.youtube.com/embed/${sermon.videoId}?autoplay=1`} 
                  title={sermon.title} 
                  frameBorder="0" 
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                  allowFullScreen
                ></iframe>
              </div>
            ) : (
              <div 
                className="aspect-video w-full relative group cursor-pointer"
                onClick={() => setActiveVideo(sermon.videoId)}
              >
                <img 
                  src={`https://img.youtube.com/vi/${sermon.videoId}/maxresdefault.jpg`} 
                  alt={sermon.title}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    // Fallback se maxresdefault não existir
                    (e.target as HTMLImageElement).src = `https://img.youtube.com/vi/${sermon.videoId}/hqdefault.jpg`;
                  }}
                />
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="w-16 h-16 bg-red-600 rounded-full flex items-center justify-center text-white shadow-lg transform scale-90 group-hover:scale-100 transition-transform">
                    <Play size={32} className="ml-2" />
                  </div>
                </div>
              </div>
            )}
            
            <div className="p-6 flex-1 flex flex-col">
              <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 mb-3">
                <Video size={16} />
                <span className="text-xs font-bold uppercase tracking-wider">Vídeo</span>
              </div>
              <h3 className="text-xl font-bold text-stone-900 dark:text-zinc-100 mb-2 leading-tight">{sermon.title}</h3>
              <p className="text-sm text-stone-500 dark:text-zinc-400 mb-4 flex-1">{sermon.summary}</p>
              
              {!activeVideo || activeVideo !== sermon.videoId ? (
                <button 
                  onClick={() => setActiveVideo(sermon.videoId)}
                  className="w-full py-3 bg-stone-100 dark:bg-zinc-800 hover:bg-stone-200 dark:hover:bg-zinc-700 text-stone-900 dark:text-zinc-100 rounded-xl font-bold flex items-center justify-center gap-2 transition-colors"
                >
                  <Play size={18} /> Assistir Agora
                </button>
              ) : (
                <button 
                  onClick={() => setActiveVideo(null)}
                  className="w-full py-3 bg-stone-100 dark:bg-zinc-800 hover:bg-stone-200 dark:hover:bg-zinc-700 text-stone-900 dark:text-zinc-100 rounded-xl font-bold flex items-center justify-center gap-2 transition-colors"
                >
                  Fechar Vídeo
                </button>
              )}
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default SermonsPage;
