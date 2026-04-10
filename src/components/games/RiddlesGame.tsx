import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  HelpCircle, 
  Timer, 
  CheckCircle2, 
  XCircle, 
  ArrowRight, 
  RotateCcw, 
  Trophy, 
  Lightbulb,
  Zap,
  Star
} from 'lucide-react';
import { BIBLE_RIDDLES, Riddle } from '../../data/riddles';
import { cn } from '../../types';

interface RiddlesGameProps {
  onFinish: (score: number) => void;
  onClose: () => void;
}

const RiddlesGame: React.FC<RiddlesGameProps> = ({ onFinish, onClose }) => {
  const [gameRiddles, setGameRiddles] = useState<Riddle[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(100);
  const [gameState, setGameState] = useState<'intro' | 'playing' | 'feedback' | 'finished'>('intro');
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [showHint, setShowHint] = useState(false);
  const [totalGameScore, setTotalGameScore] = useState(0);
  
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // Select 5 random riddles
    const shuffled = [...BIBLE_RIDDLES].sort(() => 0.5 - Math.random());
    setGameRiddles(shuffled.slice(0, 5));
  }, []);

  useEffect(() => {
    if (gameState === 'playing') {
      setTimeLeft(100);
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(timerRef.current!);
            handleAnswer(null); // Timeout
            return 0;
          }
          return prev - 1;
        });
      }, 300); // Decrement every 300ms to make it feel like a countdown from 100
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [gameState, currentIndex]);

  const handleAnswer = (answer: string | null) => {
    if (gameState !== 'playing') return;
    if (timerRef.current) clearInterval(timerRef.current);

    const currentRiddle = gameRiddles[currentIndex];
    const correct = answer === currentRiddle.answer;
    
    setSelectedAnswer(answer);
    setIsCorrect(correct);
    
    if (correct) {
      const points = Math.max(10, timeLeft);
      setTotalGameScore(prev => prev + points);
    }

    setGameState('feedback');
  };

  const nextRiddle = () => {
    if (currentIndex < 4) {
      setCurrentIndex(prev => prev + 1);
      setSelectedAnswer(null);
      setIsCorrect(null);
      setShowHint(false);
      setGameState('playing');
    } else {
      setGameState('finished');
    }
  };

  const startGame = () => {
    setGameState('playing');
  };

  const currentRiddle = gameRiddles[currentIndex];

  if (gameState === 'intro') {
    return (
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-2xl mx-auto text-center p-8 bg-white dark:bg-zinc-900 rounded-[2.5rem] shadow-xl border border-stone-200 dark:border-zinc-800"
      >
        <div className="w-24 h-24 bg-purple-100 dark:bg-purple-900/30 text-purple-600 rounded-3xl flex items-center justify-center mx-auto mb-6">
          <HelpCircle size={48} />
        </div>
        <h2 className="text-3xl font-display font-bold mb-4 text-stone-900 dark:text-zinc-100">Enigmas Bíblicos</h2>
        <p className="text-stone-600 dark:text-zinc-400 mb-8 leading-relaxed">
          Prepare-se para um desafio de sabedoria! <br/>
          Você enfrentará <strong>5 enigmas</strong> metafóricos e ambíguos. <br/>
          A pontuação começa em <strong>100</strong> e cai com o tempo. <br/>
          Seja rápido e preciso!
        </p>
        <button 
          onClick={startGame}
          className="w-full py-4 bg-purple-600 text-white font-bold rounded-2xl hover:bg-purple-700 transition-all shadow-lg shadow-purple-600/20 text-lg flex items-center justify-center gap-2"
        >
          <Zap size={24} /> Iniciar Desafio
        </button>
      </motion.div>
    );
  }

  if (gameState === 'finished') {
    return (
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-2xl mx-auto text-center p-8 bg-white dark:bg-zinc-900 rounded-[2.5rem] shadow-xl border border-stone-200 dark:border-zinc-800"
      >
        <div className="w-24 h-24 bg-amber-100 dark:bg-amber-900/30 text-amber-600 rounded-3xl flex items-center justify-center mx-auto mb-6">
          <Trophy size={48} />
        </div>
        <h2 className="text-3xl font-display font-bold mb-2 text-stone-900 dark:text-zinc-100">Desafio Concluído!</h2>
        <p className="text-stone-500 mb-8">Sua sabedoria foi testada.</p>
        
        <div className="bg-stone-50 dark:bg-zinc-800/50 p-8 rounded-3xl mb-8 border border-stone-100 dark:border-zinc-700">
          <p className="text-sm uppercase tracking-widest text-stone-400 font-bold mb-2">Pontuação Total</p>
          <p className="text-6xl font-black text-purple-600">{totalGameScore}</p>
        </div>

        <div className="space-y-4">
          <button 
            onClick={() => onFinish(totalGameScore)}
            className="w-full py-4 bg-emerald-600 text-white font-bold rounded-2xl hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-600/20 text-lg"
          >
            Salvar Pontuação
          </button>
          <button 
            onClick={onClose}
            className="w-full py-4 bg-stone-100 dark:bg-zinc-800 text-stone-600 dark:text-zinc-400 font-bold rounded-2xl hover:bg-stone-200 dark:hover:bg-zinc-700 transition-all"
          >
            Voltar
          </button>
        </div>
      </motion.div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto">
      {/* Header Info */}
      <div className="flex items-center justify-between mb-8 px-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/30 text-purple-600 rounded-xl flex items-center justify-center">
            <HelpCircle size={20} />
          </div>
          <div>
            <p className="text-xs font-bold text-stone-400 uppercase tracking-widest">Enigma</p>
            <p className="text-lg font-bold text-stone-800 dark:text-zinc-200">{currentIndex + 1} de 5</p>
          </div>
        </div>

        <div className="flex items-center gap-6">
          <div className="text-right">
            <p className="text-xs font-bold text-stone-400 uppercase tracking-widest">Pontos</p>
            <p className="text-lg font-bold text-emerald-600">{totalGameScore}</p>
          </div>
          <div className="flex flex-col items-center">
            <Timer className={cn("transition-colors", timeLeft < 30 ? "text-red-500 animate-pulse" : "text-purple-500")} size={24} />
            <span className={cn("text-xl font-black font-mono", timeLeft < 30 ? "text-red-500" : "text-stone-800 dark:text-zinc-200")}>
              {timeLeft}
            </span>
          </div>
        </div>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={currentIndex}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          className="bg-white dark:bg-zinc-900 rounded-[2.5rem] p-8 md:p-12 shadow-xl border border-stone-200 dark:border-zinc-800"
        >
          <div className="text-center mb-10">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400 rounded-full text-xs font-bold uppercase tracking-widest mb-6">
              <Star size={14} /> Nível Difícil
            </div>
            <h3 className="text-2xl md:text-3xl font-display font-bold text-stone-800 dark:text-zinc-100 leading-relaxed italic">
              "{currentRiddle?.enigma}"
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            {currentRiddle?.options.map((option) => (
              <button
                key={option}
                disabled={gameState !== 'playing'}
                onClick={() => handleAnswer(option)}
                className={cn(
                  "p-6 rounded-3xl border-2 transition-all text-center font-bold text-lg",
                  gameState === 'playing' 
                    ? "border-stone-100 dark:border-zinc-800 bg-stone-50 dark:bg-zinc-800/50 hover:border-purple-500 hover:bg-purple-50 dark:hover:bg-purple-900/20"
                    : selectedAnswer === option
                      ? isCorrect ? "border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700" : "border-red-500 bg-red-50 dark:bg-red-900/20 text-red-700"
                      : option === currentRiddle.answer && !isCorrect
                        ? "border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700"
                        : "border-stone-100 dark:border-zinc-800 bg-stone-50 dark:bg-zinc-800/50 opacity-50"
                )}
              >
                {option}
              </button>
            ))}
          </div>

          <div className="flex flex-col items-center gap-4">
            {gameState === 'playing' && (
              <button
                onClick={() => setShowHint(true)}
                className="flex items-center gap-2 text-amber-600 font-bold hover:text-amber-700 transition-colors"
              >
                <Lightbulb size={20} /> Ver Dica
              </button>
            )}

            {showHint && gameState === 'playing' && (
              <motion.p 
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20 px-6 py-3 rounded-2xl text-sm font-medium border border-amber-100 dark:border-amber-800"
              >
                Dica: {currentRiddle.hint}
              </motion.p>
            )}

            {gameState === 'feedback' && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="w-full text-center"
              >
                <div className={cn(
                  "inline-flex items-center gap-3 px-8 py-4 rounded-2xl mb-6 font-bold text-lg",
                  isCorrect ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-700"
                )}>
                  {isCorrect ? <CheckCircle2 size={24} /> : <XCircle size={24} />}
                  {isCorrect ? "Sabedoria confirmada!" : "Ainda há o que aprender..."}
                </div>
                
                {!isCorrect && (
                  <p className="text-stone-500 mb-6">
                    A resposta correta era: <span className="font-bold text-stone-800 dark:text-zinc-200">{currentRiddle.answer}</span>
                  </p>
                )}

                <button
                  onClick={nextRiddle}
                  className="w-full py-4 bg-stone-900 dark:bg-zinc-100 text-white dark:text-stone-900 font-bold rounded-2xl hover:opacity-90 transition-all flex items-center justify-center gap-2"
                >
                  {currentIndex < 4 ? "Próximo Enigma" : "Ver Resultado"} <ArrowRight size={20} />
                </button>
              </motion.div>
            )}
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

export default RiddlesGame;
