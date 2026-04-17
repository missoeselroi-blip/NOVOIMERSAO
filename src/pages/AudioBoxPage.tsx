import React, { useState, useRef, useEffect } from 'react';
import { 
  Volume2, 
  Play, 
  Pause, 
  Trash2, 
  Download, 
  Search, 
  Music, 
  Clock, 
  Calendar,
  Mic,
  FileText,
  ChevronRight,
  Loader2,
  X,
  Share2,
  Trophy,
  Medal,
  Star
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAudioBox } from '../contexts/AudioBoxContext';
import { useToast } from '../components/Toast';
import { cn } from '../types';
import { db } from '../lib/firebase';
import { query, collection, orderBy, limit, getDocs } from 'firebase/firestore';

import { useShare } from '../utils/share';

export default function AudioBoxPage() {
  const { tracks, deleteTrack, isLoading } = useAudioBox();
  const { share } = useShare();
  const { showToast } = useToast();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTrackId, setSelectedTrackId] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const filteredTracks = tracks.filter(track => 
    track.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    track.subject?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    track.style.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const selectedTrack = tracks.find(t => t.id === selectedTrackId);

  const handlePlay = (trackId: string) => {
    if (selectedTrackId === trackId) {
      if (isPlaying) {
        audioRef.current?.pause();
        setIsPlaying(false);
      } else {
        audioRef.current?.play();
        setIsPlaying(true);
      }
    } else {
      setSelectedTrackId(trackId);
      setIsPlaying(true);
      setProgress(0);
      // Audio will play via useEffect when selectedTrackId changes
    }
  };

  useEffect(() => {
    if (selectedTrackId && audioRef.current) {
      audioRef.current.play().catch(err => {
        console.error("Error playing audio:", err);
        setIsPlaying(false);
      });
    }
  }, [selectedTrackId]);

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    console.log('Attempting to delete track:', id);
    if (window.confirm('Deseja realmente excluir este áudio?')) {
      try {
        await deleteTrack(id);
        console.log('Track deleted successfully');
        showToast('Áudio excluído com sucesso!', 'success');
        if (selectedTrackId === id) {
          setSelectedTrackId(null);
          setIsPlaying(false);
        }
      } catch (error) {
        console.error('Error deleting track:', error);
        showToast('Erro ao excluir áudio.', 'error');
      }
    }
  };

  const handleDownload = (track: any, e: React.MouseEvent) => {
    e.stopPropagation();
    const a = document.createElement('a');
    a.href = track.audioUrl;
    a.download = `${track.title}.mp3`;
    a.click();
  };

  const handleShare = async (track: any, e: React.MouseEvent) => {
    e.stopPropagation();
    await share({
      title: track.title,
      text: track.text || track.subject,
    });
  };

  return (
    <div className="min-h-screen pb-32">
      <div className="max-w-6xl mx-auto px-4">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
          <div>
            <h1 className="text-4xl font-black text-stone-900 dark:text-white tracking-tighter uppercase flex items-center gap-4">
              <div className="p-3 bg-emerald-600 text-white rounded-2xl shadow-lg shadow-emerald-600/20">
                <Music size={32} />
              </div>
              Biblioteca de Áudios
            </h1>
            <p className="text-stone-500 dark:text-zinc-400 mt-2 font-medium">
              Sua biblioteca pessoal de meditações e estudos narrados.
            </p>
          </div>

          <div className="relative group max-w-md w-full">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400 group-focus-within:text-emerald-500 transition-colors" size={20} />
            <input 
              type="text"
              placeholder="Pesquisar áudios..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-4 bg-white dark:bg-zinc-900 border border-stone-200 dark:border-zinc-800 rounded-2xl focus:ring-2 focus:ring-emerald-500 outline-none transition-all shadow-sm"
            />
          </div>
        </div>

        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-32 space-y-4">
            <Loader2 className="animate-spin text-emerald-600" size={48} />
            <p className="text-stone-500 font-bold uppercase tracking-widest text-xs">Carregando sua biblioteca...</p>
          </div>
        ) : filteredTracks.length === 0 ? (
          <div className="bg-stone-50 dark:bg-zinc-900/50 rounded-[2.5rem] border-2 border-dashed border-stone-200 dark:border-zinc-800 p-20 text-center">
            <div className="w-20 h-20 bg-stone-100 dark:bg-zinc-800 rounded-full flex items-center justify-center mx-auto mb-6">
              <Mic size={40} className="text-stone-300" />
            </div>
            <h3 className="text-xl font-bold text-stone-900 dark:text-white mb-2">Nenhum áudio encontrado</h3>
            <p className="text-stone-500 dark:text-zinc-400 max-w-xs mx-auto">
              {searchQuery ? 'Tente uma busca diferente.' : 'Gere áudios no Devocional ou na Imersão para vê-los aqui.'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <AnimatePresence mode="popLayout">
              {filteredTracks.map((track) => (
                <motion.div
                  key={track.id}
                  layout
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  onClick={() => handlePlay(track.id)}
                  className={cn(
                    "group relative bg-white dark:bg-zinc-900 rounded-[2rem] border p-6 transition-all cursor-pointer hover:shadow-2xl hover:-translate-y-1",
                    selectedTrackId === track.id 
                      ? "border-emerald-500 shadow-xl shadow-emerald-500/10" 
                      : "border-stone-200 dark:border-zinc-800 shadow-sm"
                  )}
                >
                  <div className="flex justify-between items-start mb-4">
                    <div className={cn(
                      "p-3 rounded-2xl transition-colors",
                      selectedTrackId === track.id ? "bg-emerald-600 text-white" : "bg-stone-100 dark:bg-zinc-800 text-stone-500"
                    )}>
                      {selectedTrackId === track.id && isPlaying ? <Volume2 size={24} className="animate-pulse" /> : <Play size={24} />}
                    </div>
                    <div className="flex gap-1">
                      <button 
                        onClick={(e) => handleShare(track, e)}
                        className="p-2 hover:bg-stone-100 dark:hover:bg-zinc-800 rounded-full text-stone-400 hover:text-blue-500 transition-colors"
                        title="Compartilhar"
                      >
                        <Share2 size={18} />
                      </button>
                      <button 
                        onClick={(e) => handleDownload(track, e)}
                        className="p-2 hover:bg-stone-100 dark:hover:bg-zinc-800 rounded-full text-stone-400 hover:text-emerald-500 transition-colors"
                        title="Baixar"
                      >
                        <Download size={18} />
                      </button>
                      <button 
                        onClick={(e) => handleDelete(track.id, e)}
                        className="p-2 hover:bg-stone-100 dark:hover:bg-zinc-800 rounded-full text-stone-400 hover:text-red-500 transition-colors"
                        title="Excluir"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <h3 className="font-bold text-lg line-clamp-1 group-hover:text-emerald-600 transition-colors">{track.title}</h3>
                    <p className="text-xs text-stone-500 dark:text-zinc-400 line-clamp-2 leading-relaxed">
                      {track.subject}
                    </p>
                  </div>

                  <div className="mt-6 pt-6 border-t border-stone-50 dark:border-zinc-800 flex items-center justify-between text-[10px] font-bold text-stone-400 uppercase tracking-widest">
                    <div className="flex items-center gap-2">
                      <Clock size={12} />
                      {track.duration || '--:--'}
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar size={12} />
                      {new Date(track.createdAt?.seconds * 1000 || Date.now()).toLocaleDateString('pt-BR')}
                    </div>
                  </div>

                  {/* Active Indicator */}
                  {selectedTrackId === track.id && (
                    <div className="absolute top-4 right-4 flex gap-1">
                      <div className="w-1 h-3 bg-emerald-500 rounded-full animate-bounce [animation-delay:-0.3s]" />
                      <div className="w-1 h-3 bg-emerald-500 rounded-full animate-bounce [animation-delay:-0.15s]" />
                      <div className="w-1 h-3 bg-emerald-500 rounded-full animate-bounce" />
                    </div>
                  )}
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>

      {/* Persistent Player */}
      <AnimatePresence>
        {selectedTrack && (
          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            className="fixed bottom-20 md:bottom-6 left-4 right-4 md:left-1/2 md:-translate-x-1/2 md:max-w-2xl z-50"
          >
            <div className="bg-stone-900 dark:bg-zinc-900 text-white rounded-[2rem] p-4 md:p-6 shadow-2xl border border-white/10 backdrop-blur-xl">
              <div className="flex items-center gap-4 md:gap-6">
                <button 
                  onClick={() => setIsPlaying(!isPlaying)}
                  className="w-12 h-12 md:w-16 md:h-16 flex items-center justify-center bg-emerald-600 text-white rounded-2xl hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-600/20 active:scale-95"
                >
                  {isPlaying ? <Pause size={24} /> : <Play size={24} className="ml-1" />}
                </button>

                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-end mb-2">
                    <div className="min-w-0">
                      <h4 className="font-bold text-sm md:text-base truncate">{selectedTrack.title}</h4>
                      <p className="text-[10px] md:text-xs text-stone-400 uppercase tracking-widest font-bold truncate">
                        {selectedTrack.style} • {selectedTrack.emotion}
                      </p>
                    </div>
                    <button 
                      onClick={() => setSelectedTrackId(null)}
                      className="p-2 hover:bg-white/10 rounded-full transition-colors"
                    >
                      <X size={18} />
                    </button>
                  </div>

                  <div className="relative h-1.5 md:h-2 bg-white/10 rounded-full overflow-hidden group cursor-pointer">
                    <motion.div 
                      className="absolute inset-y-0 left-0 bg-emerald-500"
                      initial={{ width: 0 }}
                      animate={{ width: `${(progress / duration) * 100}%` }}
                    />
                    <input 
                      type="range"
                      min="0"
                      max={duration || 0}
                      value={progress}
                      onChange={(e) => {
                        const val = parseFloat(e.target.value);
                        setProgress(val);
                        if (audioRef.current) audioRef.current.currentTime = val;
                      }}
                      className="absolute inset-0 opacity-0 cursor-pointer"
                    />
                  </div>

                  <div className="flex justify-between mt-2 text-[10px] font-mono text-stone-400">
                    <span>{Math.floor(progress / 60)}:{Math.floor(progress % 60).toString().padStart(2, '0')}</span>
                    <span>{Math.floor(duration / 60)}:{Math.floor(duration % 60).toString().padStart(2, '0')}</span>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Hidden Audio Element */}
      <audio
        ref={audioRef}
        src={selectedTrack?.audioUrl}
        onTimeUpdate={(e) => setProgress(e.currentTarget.currentTime)}
        onLoadedMetadata={(e) => setDuration(e.currentTarget.duration)}
        onEnded={() => setIsPlaying(false)}
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
      />
      
    </div>
  );
}
