import React, { useState, useEffect, useRef } from 'react';
import { 
  Play, 
  Pause, 
  RotateCcw, 
  Trophy, 
  ChevronRight, 
  Volume2, 
  Star, 
  Heart, 
  ArrowLeft,
  Loader2,
  CheckCircle2,
  XCircle,
  Sparkles
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { cn } from '../types';
import { useToast } from '../components/Toast';
import { geminiService } from '../services/geminiService';
import { STORIES, StorySegment } from '../data/storyGames';
import { useSearchParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { db } from '../lib/firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';

const StoryGame: React.FC = () => {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const storyId = searchParams.get('id') || 'son-of-man';
  
  const currentStory = STORIES.find(s => s.id === storyId) || STORIES[0];
  const storySegments = currentStory.segments;

  const [gameState, setGameState] = useState<'intro' | 'playing' | 'question' | 'finished'>('intro');
  const [currentSegmentIndex, setCurrentSegmentIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [isAudioLoading, setIsAudioLoading] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [highlightedWordIndex, setHighlightedWordIndex] = useState(-1);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isAnswerCorrect, setIsAnswerCorrect] = useState<boolean | null>(null);
  const [audioCache, setAudioCache] = useState<Record<number, string>>({});
  const [preloadingIndices, setPreloadingIndices] = useState<Set<number>>(new Set());
  const [isPreloadingAll, setIsPreloadingAll] = useState(false);
  const [preloadProgress, setPreloadProgress] = useState(0);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const currentSegment = storySegments[currentSegmentIndex];

  useEffect(() => {
    if (gameState === 'playing') {
      if (audioCache[currentSegmentIndex]) {
        setAudioUrl(audioCache[currentSegmentIndex]);
        setIsPlaying(true);
      } else {
        loadAudioForSegment(currentSegmentIndex);
      }
      
      // Preload next segment
      if (currentSegmentIndex + 1 < storySegments.length) {
        preloadSegment(currentSegmentIndex + 1);
      }
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [gameState, currentSegmentIndex]);

  const preloadAll = async () => {
    setIsPreloadingAll(true);
    setPreloadProgress(0);
    
    for (let i = 0; i < storySegments.length; i++) {
      if (!audioCache[i]) {
        await preloadSegment(i);
      }
      setPreloadProgress(Math.round(((i + 1) / storySegments.length) * 100));
    }
    
    setIsPreloadingAll(false);
    showToast("Todas as narrações foram carregadas!", "success");
  };

  const preloadSegment = async (index: number) => {
    if (audioCache[index] || preloadingIndices.has(index)) return;

    setPreloadingIndices(prev => new Set(prev).add(index));
    try {
      const segment = storySegments[index];
      const textToSpeak = segment.text.replace(segment.hiddenWord, "...");
      const url = await geminiService.generateSpeech(textToSpeak, 'Charon', 'storytelling for youth');
      if (url) {
        setAudioCache(prev => ({ ...prev, [index]: url }));
      }
    } catch (error) {
      console.error(`Error preloading segment ${index}:`, error);
    } finally {
      setPreloadingIndices(prev => {
        const next = new Set(prev);
        next.delete(index);
        return next;
      });
    }
  };

  const loadAudioForSegment = async (index: number) => {
    setIsAudioLoading(true);
    setIsPlaying(false);
    setHighlightedWordIndex(-1);
    try {
      const segment = storySegments[index];
      // Replace hidden word with a pause/placeholder for audio
      const textToSpeak = segment.text.replace(segment.hiddenWord, "...");
      const url = await geminiService.generateSpeech(textToSpeak, 'Charon', 'storytelling for youth');
      if (url) {
        setAudioUrl(url);
        setAudioCache(prev => ({ ...prev, [index]: url }));
        setIsPlaying(true);
      }
    } catch (error) {
      console.error("Error generating speech:", error);
      showToast("Erro ao carregar narração.", "error");
    } finally {
      setIsAudioLoading(false);
    }
  };

  useEffect(() => {
    if (audioUrl && isPlaying && audioRef.current) {
      audioRef.current.play();
      startHighlighting();
    } else if (audioRef.current) {
      audioRef.current.pause();
      if (timerRef.current) clearInterval(timerRef.current);
    }
  }, [audioUrl, isPlaying]);

  const startHighlighting = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    
    const displayText = currentSegment.text.replace(currentSegment.hiddenWord, "_______");
    const words = displayText.split(' ');
    const duration = audioRef.current?.duration || (words.length * 0.4); // Fallback estimate
    const msPerWord = (duration * 1000) / words.length;
    
    let currentWord = 0;
    timerRef.current = setInterval(() => {
      if (currentWord < words.length) {
        setHighlightedWordIndex(currentWord);
        currentWord++;
      } else {
        if (timerRef.current) clearInterval(timerRef.current);
      }
    }, msPerWord);
  };

  const handleAudioEnded = () => {
    setIsPlaying(false);
    if (timerRef.current) clearInterval(timerRef.current);
    const displayText = currentSegment.text.replace(currentSegment.hiddenWord, "_______");
    setHighlightedWordIndex(displayText.split(' ').length);
    
    // After audio ends, show question
    setTimeout(() => {
      setGameState('question');
    }, 1000);
  };

  const handleAnswer = (optionIndex: number) => {
    if (selectedOption !== null) return;
    
    setSelectedOption(optionIndex);
    const correct = optionIndex === currentSegment.question?.correctAnswer;
    setIsAnswerCorrect(correct);
    
    const finalScore = correct ? score + 5 : Math.max(0, score - 5);

    if (correct) {
      setScore(prev => prev + 5);
      showToast("Correto! +5 pontos", "success");
    } else {
      setScore(prev => Math.max(0, prev - 5));
      showToast("Incorreto! -5 pontos", "error");
    }

    if (currentSegmentIndex === storySegments.length - 1) {
      saveScore(finalScore);
    }

    setTimeout(() => {
      if (currentSegmentIndex < storySegments.length - 1) {
        setCurrentSegmentIndex(prev => prev + 1);
        setAudioUrl(null);
        setSelectedOption(null);
        setIsAnswerCorrect(null);
        setGameState('playing');
      } else {
        setGameState('finished');
      }
    }, 2000);
  };

  const resetGame = () => {
    setCurrentSegmentIndex(0);
    setScore(0);
    setAudioUrl(null);
    setGameState('intro');
    setSelectedOption(null);
    setIsAnswerCorrect(null);
  };

  const saveScore = async (finalScore: number) => {
    if (!user) return;
    
    const fieldName = `${storyId.replace(/-/g, '')}Score`;
    const userRef = doc(db, 'quizLeaderboard', user.id);
    
    try {
      const docSnap = await getDoc(userRef);
      const currentData = docSnap.exists() ? docSnap.data() : {};
      const currentBest = currentData[fieldName] || 0;
      
      if (finalScore > currentBest) {
        const scoreDiff = finalScore - currentBest;
        await setDoc(userRef, {
          [fieldName]: finalScore,
          totalScore: (currentData.totalScore || 0) + scoreDiff,
          name: user.name,
          avatar: user.photoURL || user.avatar || '',
          updatedAt: new Date().toISOString()
        }, { merge: true });
        showToast(`Nova melhor pontuação em ${currentStory.title}!`, 'success');
      }
    } catch (error) {
      console.error("Error saving story score:", error);
    }
  };

  return (
    <div className="min-h-screen bg-stone-50 dark:bg-zinc-950 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <button 
            onClick={() => navigate('/quiz')}
            className="flex items-center gap-2 text-stone-500 hover:text-emerald-600 transition-colors font-bold uppercase tracking-widest text-xs"
          >
            <ArrowLeft size={16} />
            Voltar aos Jogos
          </button>
          
          <div className="flex items-center gap-4">
            <div className="px-4 py-2 bg-white dark:bg-zinc-900 rounded-2xl shadow-sm border border-stone-200 dark:border-zinc-800 flex items-center gap-2">
              <Trophy size={18} className="text-amber-500" />
              <span className="font-black text-lg">{score}</span>
            </div>
            <div className="px-4 py-2 bg-white dark:bg-zinc-900 rounded-2xl shadow-sm border border-stone-200 dark:border-zinc-800 flex items-center gap-2">
              <Star size={18} className="text-blue-500" />
              <span className="font-black text-lg">{currentSegmentIndex + 1}/{storySegments.length}</span>
            </div>
          </div>
        </div>

        <AnimatePresence mode="wait">
          {gameState === 'intro' && (
            <motion.div
              key="intro"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="bg-white dark:bg-zinc-900 rounded-[3rem] p-12 shadow-2xl border border-stone-100 dark:border-zinc-800 text-center"
            >
              <div className="w-24 h-24 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 rounded-[2rem] flex items-center justify-center mx-auto mb-8">
                <Sparkles size={48} />
              </div>
              <h1 className="text-5xl md:text-6xl font-display font-black text-stone-900 dark:text-white tracking-tighter mb-6">
                {currentStory.title}
              </h1>
              <p className="text-stone-500 dark:text-zinc-400 text-lg max-w-2xl mx-auto mb-12 leading-relaxed">
                {currentStory.description}
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button
                  onClick={() => setGameState('playing')}
                  className="px-12 py-5 bg-emerald-600 text-white rounded-2xl font-black text-xl hover:bg-emerald-700 transition-all shadow-xl shadow-emerald-600/20 active:scale-95 flex items-center gap-3"
                >
                  <Play size={24} fill="currentColor" />
                  COMEÇAR JORNADA
                </button>
                
                {!isPreloadingAll && Object.keys(audioCache).length < storySegments.length && (
                  <button
                    onClick={preloadAll}
                    className="px-8 py-5 bg-white dark:bg-zinc-800 text-stone-600 dark:text-zinc-300 rounded-2xl font-bold hover:bg-stone-100 dark:hover:bg-zinc-700 transition-all border border-stone-200 dark:border-zinc-700 flex items-center gap-2"
                  >
                    <Volume2 size={20} />
                    Pre-carregar Narrações
                  </button>
                )}
              </div>

              {isPreloadingAll && (
                <div className="mt-8 max-w-xs mx-auto">
                  <div className="flex justify-between text-xs font-bold text-stone-400 mb-2 uppercase tracking-widest">
                    <span>Carregando áudios...</span>
                    <span>{preloadProgress}%</span>
                  </div>
                  <div className="h-2 bg-stone-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${preloadProgress}%` }}
                      className="h-full bg-emerald-500"
                    />
                  </div>
                </div>
              )}
            </motion.div>
          )}

          {(gameState === 'playing' || gameState === 'question') && (
            <motion.div
              key="playing"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-8"
            >
              <div className="bg-white dark:bg-zinc-900 rounded-[3rem] p-12 shadow-2xl border border-stone-100 dark:border-zinc-800 relative overflow-hidden min-h-[400px] flex flex-col justify-center">
                {/* Background Decoration */}
                <div className="absolute top-0 right-0 p-8 opacity-5">
                  <Heart size={200} />
                </div>

                {isAudioLoading ? (
                  <div className="flex flex-col items-center justify-center space-y-4">
                    <Loader2 className="animate-spin text-emerald-600" size={48} />
                    <p className="text-stone-400 font-bold uppercase tracking-widest text-xs">Preparando narração...</p>
                  </div>
                ) : (
                  <div className="relative z-10">
                    <div className="flex flex-wrap justify-center gap-x-2 gap-y-3">
                      {currentSegment.text.replace(currentSegment.hiddenWord, "_______").split(' ').map((word, idx) => (
                        <motion.span
                          key={idx}
                          animate={{ 
                            color: idx <= highlightedWordIndex ? (idx === highlightedWordIndex ? '#059669' : '#10b981') : '#78716c',
                            scale: idx === highlightedWordIndex ? 1.1 : 1,
                            fontWeight: idx <= highlightedWordIndex ? 700 : 400
                          }}
                          className={cn(
                            "text-2xl md:text-3xl transition-colors duration-200",
                            word === "_______" && "text-amber-500 font-black"
                          )}
                        >
                          {word}
                        </motion.span>
                      ))}
                    </div>
                  </div>
                )}

                {audioUrl && (
                  <audio 
                    ref={audioRef}
                    src={audioUrl}
                    onEnded={handleAudioEnded}
                    className="hidden"
                  />
                )}
              </div>

              {gameState === 'question' && currentSegment.question && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-emerald-50 dark:bg-emerald-900/10 rounded-[2.5rem] p-8 border border-emerald-100 dark:border-emerald-800/30"
                >
                  <h3 className="text-xl font-black text-emerald-900 dark:text-emerald-400 mb-6 text-center uppercase tracking-tight">
                    {currentSegment.question.text}
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {currentSegment.question.options.map((option, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleAnswer(idx)}
                        disabled={selectedOption !== null}
                        className={cn(
                          "p-6 rounded-2xl font-bold transition-all border-2 text-center",
                          selectedOption === null 
                            ? "bg-white dark:bg-zinc-800 border-stone-100 dark:border-zinc-700 hover:border-emerald-500 hover:shadow-lg"
                            : idx === currentSegment.question?.correctAnswer
                              ? "bg-emerald-500 text-white border-emerald-500"
                              : selectedOption === idx
                                ? "bg-red-500 text-white border-red-500"
                                : "bg-white dark:bg-zinc-800 border-stone-100 dark:border-zinc-700 opacity-50"
                        )}
                      >
                        {option}
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}

              <div className="flex justify-center gap-4">
                <button
                  onClick={() => setIsPlaying(!isPlaying)}
                  disabled={isAudioLoading || gameState === 'question'}
                  className="p-4 bg-white dark:bg-zinc-900 rounded-full shadow-lg border border-stone-200 dark:border-zinc-800 text-stone-600 hover:text-emerald-600 transition-colors disabled:opacity-50"
                >
                  {isPlaying ? <Pause size={24} fill="currentColor" /> : <Play size={24} fill="currentColor" />}
                </button>
                <button
                  onClick={() => loadAudioForSegment(currentSegmentIndex)}
                  disabled={isAudioLoading}
                  className="p-4 bg-white dark:bg-zinc-900 rounded-full shadow-lg border border-stone-200 dark:border-zinc-800 text-stone-600 hover:text-blue-600 transition-colors disabled:opacity-50"
                >
                  <RotateCcw size={24} />
                </button>
              </div>
            </motion.div>
          )}

          {gameState === 'finished' && (
            <motion.div
              key="finished"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white dark:bg-zinc-900 rounded-[3rem] p-12 shadow-2xl border border-stone-100 dark:border-zinc-800 text-center"
            >
              <div className="w-24 h-24 bg-amber-100 dark:bg-amber-900/30 text-amber-600 rounded-[2rem] flex items-center justify-center mx-auto mb-8">
                <Trophy size={48} />
              </div>
              <h2 className="text-4xl font-black text-stone-900 dark:text-white mb-4">Jornada Concluída!</h2>
              <p className="text-stone-500 dark:text-zinc-400 mb-8">Você percorreu a maior história de todas.</p>
              
              <div className="bg-stone-50 dark:bg-zinc-800/50 p-8 rounded-[2rem] mb-12">
                <p className="text-[10px] font-black text-stone-400 uppercase tracking-[0.3em] mb-2">Sua Pontuação Final</p>
                <p className="text-6xl font-black text-emerald-600">{score}</p>
                <p className="text-sm font-bold text-stone-500 mt-4">
                  {score >= 90 ? "Incrível! Você conhece profundamente a história do Mestre." : 
                   score >= 70 ? "Muito bem! Sua fé e conhecimento são sólidos." : 
                   "Bom trabalho! Continue mergulhando na Palavra."}
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button
                  onClick={resetGame}
                  className="px-8 py-4 bg-stone-100 dark:bg-zinc-800 text-stone-600 dark:text-zinc-300 rounded-2xl font-bold hover:bg-stone-200 transition-all flex items-center justify-center gap-2"
                >
                  <RotateCcw size={20} />
                  Jogar Novamente
                </button>
                <button
                  onClick={() => navigate('/quiz')}
                  className="px-8 py-4 bg-emerald-600 text-white rounded-2xl font-bold hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-600/20 flex items-center justify-center gap-2"
                >
                  Voltar aos Jogos
                  <ChevronRight size={20} />
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default StoryGame;
