import React, { useState, useRef } from 'react';
import { 
  Volume2, 
  Loader2, 
  Download, 
  Save, 
  Share2, 
  Play, 
  Pause, 
  Trash2,
  Music,
  Mic2,
  Sparkles,
  Zap,
  StickyNote,
  Pencil
} from 'lucide-react';
import { useAudioBox } from '../contexts/AudioBoxContext';
import { useToast } from './Toast';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '../types';

interface SpeechGeneratorProps {
  initialText?: string;
  onSaveToNotebook?: (title: string, content: string) => void;
}

export const SpeechGenerator: React.FC<SpeechGeneratorProps> = ({ initialText = '', onSaveToNotebook }) => {
  const { generateAudio, saveTrack } = useAudioBox();
  const { showToast } = useToast();
  
  const [text, setText] = useState(initialText);
  const [voice, setVoice] = useState('mulher');
  const [emotion, setEmotion] = useState('calma');
  const [title, setTitle] = useState('');
  const [subject, setSubject] = useState('');
  
  const [isGenerating, setIsGenerating] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  
  const audioRef = useRef<HTMLAudioElement>(null);

  const voices = [
    { id: 'criança', label: 'Criança' },
    { id: 'adolescente rapaz', label: 'Adolescente (Rapaz)' },
    { id: 'adolescente moça', label: 'Adolescente (Moça)' },
    { id: 'jovem', label: 'Jovem' },
    { id: 'homem', label: 'Homem' },
    { id: 'mulher', label: 'Mulher' },
    { id: 'idoso', label: 'Idoso' },
    { id: 'idosa', label: 'Idosa' },
    { id: 'ninar', label: 'Voz de Ninar' }
  ];

  const emotions = [
    { id: 'calma', label: 'Calma' },
    { id: 'carinhoso', label: 'Carinhoso' },
    { id: 'alegre', label: 'Alegre' },
    { id: 'animado', label: 'Animado' },
    { id: 'inspirador', label: 'Inspirador' },
    { id: 'motivadora', label: 'Motivadora' },
    { id: 'pensativo', label: 'Pensativo' },
    { id: 'duvidoso', label: 'Duvidoso' },
    { id: 'triste', label: 'Triste' },
    { id: 'raiva', label: 'Raiva' },
    { id: 'narrador esportivo', label: 'Narrador Esportivo' },
    { id: 'professor', label: 'Professor' },
    { id: 'pastor', label: 'Pastor' },
    { id: 'maternal', label: 'Maternal' }
  ];

  const handleGenerate = async () => {
    if (!text.trim()) {
      showToast("Digite um texto para gerar o áudio.", "error");
      return;
    }
    
    setIsGenerating(true);
    try {
      const url = await generateAudio(text, voice, emotion);
      setAudioUrl(url);
      showToast("Áudio gerado com sucesso! 🎙️✨");
    } catch (error) {
      showToast("Erro ao gerar áudio. Verifique sua chave API.", "error");
    } finally {
      setIsGenerating(false);
    }
  };

  const handlePlayPause = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleDownload = () => {
    if (audioUrl) {
      const a = document.createElement('a');
      a.href = audioUrl;
      a.download = `${title || 'audio'}.mp3`;
      a.click();
      showToast("Baixando áudio... 📄💎");
    }
  };

  const handleSave = async () => {
    if (!audioUrl) return;
    if (!title.trim()) {
      showToast("Dê um título ao seu áudio.", "error");
      return;
    }

    try {
      const minutes = Math.floor(duration / 60);
      const seconds = Math.floor(duration % 60).toString().padStart(2, '0');
      const durationStr = `${minutes}:${seconds}`;
      
      await saveTrack(title, subject || 'Narração', audioUrl, voice, emotion, durationStr);
      showToast("Áudio salvo na Caixa de Áudios! 📦✨");
    } catch (error) {
      showToast("Erro ao salvar áudio.", "error");
    }
  };

  const handleShare = async () => {
    if (!audioUrl) return;
    try {
      await navigator.share({
        title: title || 'Áudio Gerado',
        text: text.substring(0, 100) + '...',
        url: window.location.href
      });
    } catch (error) {
      if ((error as Error).name !== 'AbortError') {
        showToast("Erro ao compartilhar.", "error");
      }
    }
  };

  return (
    <div className="bg-white dark:bg-zinc-900 p-8 rounded-[3rem] border border-stone-200 dark:border-zinc-800 shadow-sm space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex flex-col sm:flex-row gap-6 flex-1">
          <div className="flex-1 space-y-2">
            <label className="block text-xs font-bold uppercase tracking-widest text-stone-400 ml-1">Tipo de Voz</label>
            <select 
              value={voice}
              onChange={(e) => setVoice(e.target.value)}
              className="w-full px-4 py-3 bg-stone-50 dark:bg-zinc-800 border border-stone-200 dark:border-zinc-700 rounded-xl outline-none text-xs font-bold"
            >
              {voices.map(v => (
                <option key={v.id} value={v.id}>{v.label}</option>
              ))}
            </select>
          </div>
          <div className="flex-1 space-y-2">
            <label className="block text-xs font-bold uppercase tracking-widest text-stone-400 ml-1">Emoção / Tom</label>
            <select 
              value={emotion}
              onChange={(e) => setEmotion(e.target.value)}
              className="w-full px-4 py-3 bg-stone-50 dark:bg-zinc-800 border border-stone-200 dark:border-zinc-700 rounded-xl outline-none text-xs font-bold"
            >
              {emotions.map(e => (
                <option key={e.id} value={e.id}>{e.label}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex items-center gap-2 self-end">
          {onSaveToNotebook && (
            <button 
              onClick={() => onSaveToNotebook(title || 'Narração', text)}
              className="p-3 bg-amber-100 dark:bg-amber-900/30 text-amber-600 rounded-xl hover:bg-amber-200 transition-colors"
              title="Salvar no Caderno"
            >
              <StickyNote size={20} />
            </button>
          )}
          <button
            onClick={handleGenerate}
            disabled={isGenerating || !text.trim()}
            className="px-8 py-3 bg-emerald-600 text-white font-bold rounded-xl hover:bg-emerald-700 disabled:opacity-50 flex items-center gap-2 transition-all shadow-lg shadow-emerald-600/20"
          >
            {isGenerating ? <Loader2 className="animate-spin" size={18} /> : <Zap size={18} />}
            GERAR NARRAÇÃO
          </button>
        </div>
      </div>

      <div className="space-y-4">
        <div className="relative group">
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="⚓ Digite ou cole aqui o texto que deseja transformar em áudio..."
            className="w-full h-64 p-6 bg-stone-50 dark:bg-zinc-800 border border-stone-200 dark:border-zinc-700 rounded-[2rem] focus:ring-2 focus:ring-emerald-500 outline-none resize-none text-sm leading-relaxed"
          />
          <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
            <button 
              onClick={() => setText('')}
              className="p-2 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-sm text-stone-400 hover:text-red-500 rounded-lg shadow-sm"
              title="Limpar texto"
            >
              <Trash2 size={16} />
            </button>
          </div>
        </div>

        <AnimatePresence>
          {audioUrl && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="pt-6 space-y-6"
            >
              <div className="bg-blue-600 p-6 rounded-[2.5rem] shadow-xl text-white">
                <div className="flex items-center gap-6">
                  <button 
                    onClick={handlePlayPause}
                    className="w-16 h-16 flex items-center justify-center bg-white text-blue-600 rounded-full hover:scale-105 transition-transform shadow-lg"
                  >
                    {isPlaying ? <Pause size={32} /> : <Play size={32} className="ml-1" />}
                  </button>
                  <div className="flex-1 space-y-2">
                    <div className="flex justify-between items-end mb-1">
                      <div>
                        <h4 className="font-bold uppercase tracking-widest text-[10px] opacity-70">Reproduzindo</h4>
                        <p className="font-display font-bold text-lg leading-tight">Narração Gerada</p>
                      </div>
                      <div className="text-[10px] font-mono opacity-70">
                        {Math.floor(progress / 60)}:{Math.floor(progress % 60).toString().padStart(2, '0')} / {Math.floor(duration / 60)}:{Math.floor(duration % 60).toString().padStart(2, '0')}
                      </div>
                    </div>
                    <div className="h-2 bg-white/20 rounded-full overflow-hidden">
                      <motion.div 
                        className="h-full bg-white"
                        initial={{ width: 0 }}
                        animate={{ width: `${(progress / duration) * 100}%` }}
                      />
                    </div>
                  </div>
                </div>
                {audioUrl && (
                  <audio 
                    ref={audioRef}
                    src={audioUrl}
                    onTimeUpdate={(e) => setProgress(e.currentTarget.currentTime)}
                    onLoadedMetadata={(e) => setDuration(e.currentTarget.duration)}
                    onEnded={() => setIsPlaying(false)}
                    className="hidden"
                  />
                )}
              </div>

              <div className="bg-stone-50 dark:bg-zinc-800 p-6 rounded-[2rem] border border-stone-200 dark:border-zinc-700 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-widest text-stone-400 ml-2">Título do Áudio</label>
                    <input
                      type="text"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="Ex: Narração da Lição 01"
                      className="w-full px-6 py-3 bg-white dark:bg-zinc-900 border border-stone-200 dark:border-zinc-800 rounded-xl outline-none text-sm"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-widest text-stone-400 ml-2">Assunto / Categoria</label>
                    <input
                      type="text"
                      value={subject}
                      onChange={(e) => setSubject(e.target.value)}
                      placeholder="Ex: Estudo Bíblico"
                      className="w-full px-6 py-3 bg-white dark:bg-zinc-900 border border-stone-200 dark:border-zinc-800 rounded-xl outline-none text-sm"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <button 
                    onClick={handleDownload}
                    className="py-3 bg-white dark:bg-zinc-900 border border-stone-200 dark:border-zinc-800 text-stone-600 dark:text-zinc-300 rounded-xl font-bold text-xs flex items-center justify-center gap-2 hover:bg-stone-50 transition-colors"
                  >
                    <Download size={16} /> Baixar
                  </button>
                  <button 
                    onClick={handleShare}
                    className="py-3 bg-white dark:bg-zinc-900 border border-stone-200 dark:border-zinc-800 text-stone-600 dark:text-zinc-300 rounded-xl font-bold text-xs flex items-center justify-center gap-2 hover:bg-stone-50 transition-colors"
                  >
                    <Share2 size={16} /> Compartilhar
                  </button>
                  <button 
                    onClick={handleSave}
                    className="py-3 bg-blue-600 text-white rounded-xl font-bold text-xs flex items-center justify-center gap-2 hover:bg-blue-700 transition-colors"
                  >
                    <Save size={16} /> Salvar
                  </button>
                  {onSaveToNotebook && (
                    <button 
                      onClick={() => onSaveToNotebook(title || 'Narração', text)}
                      className="py-3 bg-emerald-600 text-white rounded-xl font-bold text-xs flex items-center justify-center gap-2 hover:bg-emerald-700 transition-colors"
                    >
                      <Save size={16} /> No Caderno
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};
