import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Play, 
  Pause, 
  X, 
  SkipForward, 
  SkipBack, 
  RotateCcw, 
  Headphones,
  ChevronRight,
  ChevronLeft
} from 'lucide-react';
import { useAudioBible } from '../contexts/AudioBibleContext';
import { cn } from '../types';

export function DraggableAudioPlayer() {
  const { 
    selectedBook, 
    selectedChapter, 
    isPlaying, 
    progress, 
    duration, 
    isLoadingAudio, 
    playbackRate,
    togglePlayPause, 
    setPlaybackRate,
    skipSeconds, 
    seekTo,
    nextChapter,
    prevChapter,
    closePlayer
  } = useAudioBible();

  if (!selectedBook || !selectedChapter) return null;

  const formatTime = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = Math.floor(seconds % 60);
    return `${h > 0 ? `${h}:` : ''}${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const handleRateChange = () => {
    const rates = [1, 1.25, 1.5, 2, 0.75];
    const nextIndex = (rates.indexOf(playbackRate) + 1) % rates.length;
    setPlaybackRate(rates[nextIndex]);
  };

  return (
    <AnimatePresence>
      <motion.div
        drag
        dragMomentum={false}
        initial={{ y: 200, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 200, opacity: 0 }}
        className="fixed bottom-20 md:bottom-10 md:right-10 z-[1000] w-[calc(100%-2rem)] md:w-[450px] cursor-move mx-4 md:mx-0"
        style={{ touchAction: 'none' }}
      >
        <div className="bg-stone-900 dark:bg-zinc-950 text-white rounded-[2.5rem] p-6 shadow-[0_20px_50px_rgba(0,0,0,0.5)] border border-white/10 backdrop-blur-xl">
          <div className="space-y-6">
            {/* Header Info */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-amber-600 flex items-center justify-center text-white shadow-lg shadow-amber-600/20">
                  {isLoadingAudio ? <span className="text-2xl animate-spin">⌛</span> : <Headphones size={24} />}
                </div>
                <div>
                  <h4 className="font-bold text-lg">{selectedBook.name}</h4>
                  <p className="text-xs text-stone-400 uppercase tracking-widest font-black">
                    Capítulo {selectedChapter} {isLoadingAudio && <span className="ml-1 text-amber-500 font-bold">Procurando...</span>}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button 
                  onMouseDown={(e) => e.stopPropagation()}
                  onClick={() => {
                    if (progress > 0) seekTo(0);
                  }}
                  className="p-3 text-stone-400 hover:text-white transition-colors"
                  title="Recomeçar"
                >
                  <RotateCcw size={20} />
                </button>
                <button 
                  onMouseDown={(e) => e.stopPropagation()}
                  onClick={closePlayer}
                  className="p-3 hover:bg-white/10 rounded-full transition-colors"
                  title="Fechar Player"
                >
                  <X size={24} />
                </button>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="space-y-2" onMouseDown={(e) => e.stopPropagation()}>
              <div className="relative h-2 bg-white/10 rounded-full overflow-hidden">
                <motion.div 
                  className="absolute inset-y-0 left-0 bg-amber-500 shadow-[0_0_10px_rgba(245,158,11,0.5)]"
                  style={{ width: `${(progress / (duration || 1)) * 100}%` }}
                />
                <input 
                  type="range"
                  min="0"
                  max={duration || 0}
                  step="0.1"
                  value={progress}
                  onChange={(e) => seekTo(parseFloat(e.target.value))}
                  className="absolute inset-0 opacity-0 cursor-pointer z-10"
                />
              </div>
              <div className="flex justify-between text-[10px] font-mono text-stone-400 font-bold uppercase tracking-widest">
                <span>{formatTime(progress)}</span>
                <span>{formatTime(duration)}</span>
              </div>
            </div>

            {/* Controls */}
            <div className="flex items-center justify-center gap-2 md:gap-6" onMouseDown={(e) => e.stopPropagation()}>
              <button 
                onClick={handleRateChange}
                className="px-2 py-1 bg-white/5 hover:bg-white/10 rounded-lg text-[10px] font-bold transition-colors"
                title="Velocidade"
              >
                {playbackRate}x
              </button>

              <button 
                  onClick={prevChapter}
                  className="p-2 text-stone-400 hover:text-white transition-colors"
                  title="Capítulo Anterior"
                >
                  <ChevronLeft size={20} />
                </button>

                <button 
                  onClick={() => skipSeconds(-15)}
                  className="p-2 text-stone-400 hover:text-white transition-colors"
                  title="Voltar 15s"
                >
                  <SkipBack size={20} />
                </button>
                
                <button 
                  onClick={togglePlayPause}
                  className="w-16 h-16 flex items-center justify-center bg-white text-stone-900 rounded-[2rem] hover:scale-105 transition-all shadow-xl active:scale-95"
                >
                  {isPlaying ? <Pause size={28} /> : <Play size={28} className="ml-0.5" />}
                </button>

                <button 
                  onClick={() => skipSeconds(15)}
                  className="p-2 text-stone-400 hover:text-white transition-colors"
                  title="Avançar 15s"
                >
                  <SkipForward size={20} />
                </button>

                <button 
                  onClick={nextChapter}
                  className="p-2 text-stone-400 hover:text-white transition-colors"
                  title="Próximo Capítulo"
                >
                  <ChevronRight size={20} />
                </button>
            </div>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
