import React, { useState, useEffect } from 'react';
import { Play, Pause, Volume2 } from 'lucide-react';
import { cn } from '../types';

interface TextToSpeechButtonProps {
  text: string;
  className?: string;
}

export const TextToSpeechButton: React.FC<TextToSpeechButtonProps> = ({ text, className }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    return () => {
      window.speechSynthesis.cancel();
    };
  }, []);

  const handleToggle = () => {
    if (isPlaying) {
      if (isPaused) {
        window.speechSynthesis.resume();
        setIsPaused(false);
      } else {
        window.speechSynthesis.pause();
        setIsPaused(true);
      }
    } else {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'pt-BR';
      utterance.onend = () => {
        setIsPlaying(false);
        setIsPaused(false);
      };
      utterance.onpause = () => setIsPaused(true);
      utterance.onresume = () => setIsPaused(false);
      
      window.speechSynthesis.speak(utterance);
      setIsPlaying(true);
      setIsPaused(false);
    }
  };

  return (
    <button 
      onClick={handleToggle} 
      className={cn("flex items-center gap-2 px-3 py-2 rounded-xl transition-colors", className)}
      title={isPlaying ? (isPaused ? "Retomar" : "Pausar") : "Ouvir"}
    >
      {isPlaying && !isPaused ? <Pause size={18} /> : <Play size={18} />}
      <span className="text-xs font-bold uppercase">
        {isPlaying ? (isPaused ? "Retomar" : "Pausar") : "Ouvir"}
      </span>
    </button>
  );
};
