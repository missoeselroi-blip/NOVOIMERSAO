import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  HelpCircle, 
  CheckCircle2, 
  XCircle, 
  ArrowRight, 
  Trophy, 
  Zap,
  Star,
  Send,
  AlertCircle
} from 'lucide-react';
import { BIBLE_RIDDLES, Riddle } from '../../data/riddles';
import { cn } from '../../types';

interface RiddlesGameProps {
  onFinish: (score: number) => void;
  onClose: () => void;
}

const normalize = (str: string) => {
  return str
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^\w\s]/gi, '')
    .trim();
};

// Simple similarity check for orthographic errors
const isSimilar = (input: string, target: string) => {
  const normalizedInput = normalize(input);
  const normalizedTarget = normalize(target);
  
  if (normalizedInput === normalizedTarget) return true;
  
  // Check if input is a significant part of the target or vice versa for short answers
  if (normalizedTarget.length > 3 && (normalizedTarget.includes(normalizedInput) || normalizedInput.includes(normalizedTarget))) {
    if (Math.abs(normalizedInput.length - normalizedTarget.length) <= 2) return true;
  }

  return false;
};

const RiddlesGame: React.FC<RiddlesGameProps> = ({ onFinish, onClose }) => {
  const [gameRiddles, setGameRiddles] = useState<Riddle[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [gameState, setGameState] = useState<'intro' | 'playing' | 'feedback' | 'finished'>('intro');
  const [userInput, setUserInput] = useState('');
  const [attempts, setAttempts] = useState(0);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [totalGameScore, setTotalGameScore] = useState(0);
  const [feedbackMessage, setFeedbackMessage] = useState('');

  useEffect(() => {
    // Select 5 random riddles from the 50
    const shuffled = [...BIBLE_RIDDLES].sort(() => 0.5 - Math.random());
    setGameRiddles(shuffled.slice(0, 5));
  }, []);

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (gameState !== 'playing' || !userInput.trim()) return;

    const currentRiddle = gameRiddles[currentIndex];
    const normalizedInput = normalize(userInput);
    
    // Check main answer and keywords
    const correct = isSimilar(userInput, currentRiddle.answer) || 
                    currentRiddle.keywords.some(kw => isSimilar(userInput, kw));

    if (correct) {
      const points = attempts === 0 ? 20 : attempts === 1 ? 10 : 5;
      setTotalGameScore(prev => prev + points);
      setIsCorrect(true);
      setFeedbackMessage(`Excelente! Você acertou na ${attempts + 1}ª tentativa.`);
      setGameState('feedback');
    } else {
      const nextAttempt = attempts + 1;
      if (nextAttempt >= 3) {
        setIsCorrect(false);
        setFeedbackMessage("Suas chances acabaram.");
        setGameState('feedback');
      } else {
        setAttempts(nextAttempt);
        setUserInput('');
        setFeedbackMessage(`Resposta incorreta. Você tem mais ${3 - nextAttempt} ${3 - nextAttempt === 1 ? 'chance' : 'chances'}.`);
        // We stay in 'playing' state but show a temporary error
      }
    }
  };

  const nextRiddle = () => {
    if (currentIndex < 4) {
      setCurrentIndex(prev => prev + 1);
      setUserInput('');
      setAttempts(0);
      setIsCorrect(null);
      setFeedbackMessage('');
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
          Um desafio de sabedoria e interpretação! <br/>
          Você enfrentará <strong>5 enigmas</strong> aleatórios. <br/>
          Digite sua resposta. Você tem <strong>3 chances</strong> por enigma. <br/>
          <br/>
          <strong>Pontuação:</strong><br/>
          1ª tentativa: 20 pontos<br/>
          2ª tentativa: 10 pontos<br/>
          3ª tentativa: 5 pontos
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
          <div className="text-right">
            <p className="text-xs font-bold text-stone-400 uppercase tracking-widest">Chances</p>
            <div className="flex gap-1">
              {[0, 1, 2].map((i) => (
                <div 
                  key={i} 
                  className={cn(
                    "w-3 h-3 rounded-full",
                    i < 3 - attempts ? "bg-purple-500" : "bg-stone-200 dark:bg-zinc-800"
                  )} 
                />
              ))}
            </div>
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

          {gameState === 'playing' && (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="relative">
                <input
                  type="text"
                  value={userInput}
                  onChange={(e) => setUserInput(e.target.value)}
                  placeholder="Sua resposta..."
                  autoFocus
                  className="w-full p-6 bg-stone-50 dark:bg-zinc-800/50 border-2 border-stone-100 dark:border-zinc-800 rounded-3xl text-xl font-bold text-stone-800 dark:text-zinc-100 focus:border-purple-500 focus:outline-none transition-all pr-16"
                />
                <button
                  type="submit"
                  disabled={!userInput.trim()}
                  className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-purple-600 text-white rounded-2xl flex items-center justify-center hover:bg-purple-700 disabled:opacity-50 transition-all"
                >
                  <Send size={24} />
                </button>
              </div>

              {feedbackMessage && (
                <motion.div 
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-center gap-2 text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 px-6 py-3 rounded-2xl text-sm font-medium border border-red-100 dark:border-red-800"
                >
                  <AlertCircle size={18} />
                  {feedbackMessage}
                </motion.div>
              )}
            </form>
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
                {feedbackMessage}
              </div>
              
              {!isCorrect && (
                <div className="mb-8 p-6 bg-stone-50 dark:bg-zinc-800/50 rounded-3xl border border-stone-100 dark:border-zinc-800">
                  <p className="text-stone-500 text-sm uppercase tracking-widest font-bold mb-2">Resposta Correta</p>
                  <p className="text-2xl font-bold text-stone-800 dark:text-zinc-100">{currentRiddle.answer}</p>
                </div>
              )}

              <button
                onClick={nextRiddle}
                className="w-full py-4 bg-stone-900 dark:bg-zinc-100 text-white dark:text-stone-900 font-bold rounded-2xl hover:opacity-90 transition-all flex items-center justify-center gap-2"
              >
                {currentIndex < 4 ? "Próximo Enigma" : "Ver Resultado"} <ArrowRight size={20} />
              </button>
            </motion.div>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

export default RiddlesGame;
