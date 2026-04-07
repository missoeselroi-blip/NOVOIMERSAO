import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, Medal, AlertCircle, CheckCircle2, XCircle, Clock, ArrowLeft, ArrowRight, RotateCcw } from 'lucide-react';
import { booksList, getDivisionForBook, getRandomQuestionForBook, Question } from '../data/panoramaQuestions';
import { useAuth } from '../contexts/AuthContext';
import { db } from '../lib/firebase';
import { doc, updateDoc, getDoc } from 'firebase/firestore';
import { cn } from '../types';

interface PanoramaBiblicoProps {
  onClose: () => void;
}

export const PanoramaBiblico: React.FC<PanoramaBiblicoProps> = ({ onClose }) => {
  const { user, setUser } = useAuth();
  const [currentBookIndex, setCurrentBookIndex] = useState(0);
  const [consecutiveCorrect, setConsecutiveCorrect] = useState(0);
  const [timeLeft, setTimeLeft] = useState(5);
  const [gameState, setGameState] = useState<'intro' | 'playing' | 'correct' | 'wrong' | 'timeout' | 'finished'>('intro');
  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const currentBook = booksList[currentBookIndex];
  const currentDivision = getDivisionForBook(currentBookIndex);

  useEffect(() => {
    if (gameState === 'playing') {
      setTimeLeft(5);
      const q = getRandomQuestionForBook(currentBook);
      setCurrentQuestion(q);
      setSelectedAnswer(null);

      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(timerRef.current!);
            handleTimeout();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [gameState, currentBookIndex]);

  const handleTimeout = () => {
    setGameState('timeout');
    setConsecutiveCorrect(0);
  };

  const handleAnswer = (answer: string) => {
    if (gameState !== 'playing' || !currentQuestion) return;
    
    if (timerRef.current) clearInterval(timerRef.current);
    setSelectedAnswer(answer);

    if (answer === currentQuestion.correctAnswer) {
      setGameState('correct');
      const newConsecutive = consecutiveCorrect + 1;
      setConsecutiveCorrect(newConsecutive);
      checkMedals(newConsecutive);
    } else {
      setGameState('wrong');
      setConsecutiveCorrect(0);
    }
  };

  const checkMedals = async (consecutive: number) => {
    if (!user) return;
    
    let medalEarned = '';
    if (consecutive === 10) medalEarned = 'bronze';
    else if (consecutive === 20) medalEarned = 'silver';
    else if (consecutive === 30) medalEarned = 'gold';
    else if (consecutive === 66) medalEarned = 'trophy';

    if (medalEarned) {
      try {
        const userRef = doc(db, 'users', user.id);
        const userDoc = await getDoc(userRef);
        if (userDoc.exists()) {
          const userData = userDoc.data();
          const medals = userData.panoramaMedals || { bronze: 0, silver: 0, gold: 0, trophy: 0 };
          medals[medalEarned] += 1;
          
          await updateDoc(userRef, { panoramaMedals: medals });
          if (setUser) {
            setUser({ ...user, panoramaMedals: medals } as any);
          }
        }
      } catch (error) {
        console.error("Erro ao salvar medalha:", error);
      }
    }
  };

  const nextStep = () => {
    if (gameState === 'correct') {
      if (currentBookIndex < booksList.length - 1) {
        setCurrentBookIndex(prev => prev + 1);
        setGameState('playing');
      } else {
        setGameState('finished');
      }
    } else if (gameState === 'timeout') {
      if (currentBookIndex > 0) {
        setCurrentBookIndex(prev => prev - 1);
      }
      setGameState('playing');
    } else if (gameState === 'wrong') {
      setCurrentBookIndex(currentDivision.startIndex);
      setGameState('playing');
    }
  };

  const startGame = () => {
    setCurrentBookIndex(0);
    setConsecutiveCorrect(0);
    setGameState('playing');
  };

  const handleClose = async () => {
    if (user && gameState !== 'intro') {
      try {
        const score = gameState === 'finished' ? 10 : Math.round((currentBookIndex / 66) * 10);
        const userRef = doc(db, 'quizLeaderboard', user.id);
        const userSnap = await getDoc(userRef);
        
        if (userSnap.exists()) {
          const data = userSnap.data() as any;
          const currentScore = Math.min(data.score || 0, 100);
          const battlesWon = data.battlesWon || 0;
          await updateDoc(userRef, {
            panoramaScore: score,
            totalScore: currentScore + battlesWon + score
          });
        } else {
          // If user doesn't exist in leaderboard yet
          const { serverTimestamp } = await import('firebase/firestore');
          await updateDoc(userRef, {
            name: user.name || 'Usuário',
            avatar: user.photoURL || user.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.id}`,
            score: 0,
            battlesWon: 0,
            panoramaScore: score,
            totalScore: score,
            updatedAt: serverTimestamp()
          }).catch(async () => {
             const { setDoc } = await import('firebase/firestore');
             await setDoc(userRef, {
                name: user.name || 'Usuário',
                avatar: user.photoURL || user.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.id}`,
                score: 0,
                battlesWon: 0,
                panoramaScore: score,
                totalScore: score,
                updatedAt: serverTimestamp()
             });
          });
        }
      } catch (error) {
        console.error("Erro ao salvar pontuação do panorama:", error);
      }
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-stone-50 dark:bg-zinc-950 flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-stone-200 dark:border-zinc-800 flex items-center justify-between bg-white dark:bg-zinc-900">
        <button onClick={handleClose} className="p-2 text-stone-500 hover:text-emerald-600 transition-colors">
          <ArrowLeft size={24} />
        </button>
        <div className="text-center">
          <h1 className="font-display font-bold text-xl text-stone-900 dark:text-zinc-100">Panorama Bíblico</h1>
          <p className="text-xs text-stone-500 uppercase tracking-widest">{currentDivision.name}</p>
        </div>
        <div className="flex items-center gap-2 text-emerald-600 font-bold bg-emerald-50 dark:bg-emerald-900/20 px-3 py-1.5 rounded-xl">
          <Trophy size={16} />
          {consecutiveCorrect}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-hidden flex flex-col md:flex-row">
        {/* Sidebar - Books List */}
        <div className="hidden md:block w-64 border-r border-stone-200 dark:border-zinc-800 bg-white/50 dark:bg-zinc-900/50 overflow-y-auto p-4">
          <h3 className="text-xs font-bold uppercase tracking-widest text-stone-400 mb-4">Progresso</h3>
          <div className="space-y-1">
            {booksList.map((book, idx) => (
              <div 
                key={book}
                className={cn(
                  "px-3 py-2 rounded-lg text-sm transition-all",
                  idx === currentBookIndex ? "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 font-bold" :
                  idx < currentBookIndex ? "text-stone-400 dark:text-zinc-500" : "text-stone-600 dark:text-zinc-400"
                )}
              >
                {idx + 1}. {book}
              </div>
            ))}
          </div>
        </div>

        {/* Game Area */}
        <div className="flex-1 overflow-y-auto p-6 relative">
          <div className="min-h-full flex flex-col items-center justify-center">
            <AnimatePresence mode="wait">
              {gameState === 'intro' && (
              <motion.div 
                key="intro"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="text-center max-w-md"
              >
                <div className="w-24 h-24 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 rounded-3xl flex items-center justify-center mx-auto mb-6">
                  <Trophy size={48} />
                </div>
                <h2 className="text-3xl font-display font-bold mb-4">Panorama Bíblico</h2>
                <p className="text-stone-600 dark:text-zinc-400 mb-8 leading-relaxed">
                  Viaje por todos os 66 livros da Bíblia! Você tem apenas <strong>5 segundos</strong> para responder cada pergunta.
                  <br/><br/>
                  Acertou? Avança um livro.<br/>
                  Tempo esgotou? Volta um livro.<br/>
                  Errou? Volta para o início da divisão atual!
                  <br/><br/>
                  <strong>Atenção:</strong> A sua pontuação (de 0 a 10) será salva no Ranking Quiz Geral com base no seu último progresso alcançado, e não será somada a cada tentativa.
                </p>
                <button 
                  onClick={startGame}
                  className="w-full py-4 bg-emerald-600 text-white font-bold rounded-2xl hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-600/20 text-lg"
                >
                  Começar Jornada
                </button>
              </motion.div>
            )}

            {gameState === 'playing' && currentQuestion && (
              <motion.div 
                key="playing"
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -50 }}
                className="w-full max-w-2xl"
              >
                <div className="text-center mb-8">
                  <span className="inline-block px-4 py-1.5 bg-stone-100 dark:bg-zinc-800 text-stone-600 dark:text-zinc-400 rounded-full text-sm font-bold uppercase tracking-widest mb-4">
                    Livro {currentBookIndex + 1} de 66
                  </span>
                  <h2 className="text-4xl font-display font-bold text-emerald-600 dark:text-emerald-400 mb-2">
                    {currentBook}
                  </h2>
                  
                  {/* Timer */}
                  <div className="flex items-center justify-center gap-3 mt-6">
                    <Clock className={cn("transition-colors", timeLeft <= 1 ? "text-red-500 animate-pulse" : "text-stone-400")} size={24} />
                    <span className={cn(
                      "text-5xl font-black font-mono transition-colors",
                      timeLeft <= 1 ? "text-red-500" : "text-stone-800 dark:text-zinc-200"
                    )}>
                      {timeLeft}
                    </span>
                  </div>
                </div>

                <div className="bg-white dark:bg-zinc-900 p-8 rounded-[2.5rem] shadow-xl border border-stone-200 dark:border-zinc-800 mb-8">
                  <h3 className="text-xl md:text-2xl font-medium text-center mb-8 leading-relaxed">
                    {currentQuestion.question}
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {currentQuestion.options.map((option, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleAnswer(option)}
                        className="p-4 rounded-2xl border-2 border-stone-100 dark:border-zinc-800 bg-stone-50 dark:bg-zinc-800/50 hover:border-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 transition-all text-left font-medium"
                      >
                        {option}
                      </button>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}

            {gameState === 'correct' && (
              <motion.div 
                key="correct"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center max-w-md"
              >
                <div className="w-32 h-32 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6">
                  <CheckCircle2 size={64} />
                </div>
                <h2 className="text-3xl font-display font-bold text-emerald-600 mb-4">Correto!</h2>
                <p className="text-stone-600 dark:text-zinc-400 mb-8">
                  Você avançou para o próximo livro.
                </p>
                <button 
                  onClick={nextStep}
                  className="w-full py-4 bg-emerald-600 text-white font-bold rounded-2xl hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-600/20 flex items-center justify-center gap-2"
                >
                  Continuar <ArrowRight size={20} />
                </button>
              </motion.div>
            )}

            {gameState === 'wrong' && (
              <motion.div 
                key="wrong"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center max-w-md"
              >
                <div className="w-32 h-32 bg-red-100 dark:bg-red-900/30 text-red-600 rounded-full flex items-center justify-center mx-auto mb-6">
                  <XCircle size={64} />
                </div>
                <h2 className="text-3xl font-display font-bold text-red-600 mb-4">Incorreto!</h2>
                <p className="text-stone-600 dark:text-zinc-400 mb-8">
                  A resposta correta era: <strong>{currentQuestion?.correctAnswer}</strong>.
                  <br/><br/>
                  Você voltou para o início da divisão: <strong>{currentDivision.name}</strong>.
                </p>
                <button 
                  onClick={nextStep}
                  className="w-full py-4 bg-red-600 text-white font-bold rounded-2xl hover:bg-red-700 transition-all shadow-lg shadow-red-600/20 flex items-center justify-center gap-2"
                >
                  Tentar Novamente <RotateCcw size={20} />
                </button>
              </motion.div>
            )}

            {gameState === 'timeout' && (
              <motion.div 
                key="timeout"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center max-w-md"
              >
                <div className="w-32 h-32 bg-amber-100 dark:bg-amber-900/30 text-amber-600 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Clock size={64} />
                </div>
                <h2 className="text-3xl font-display font-bold text-amber-600 mb-4">Tempo Esgotado!</h2>
                <p className="text-stone-600 dark:text-zinc-400 mb-8">
                  Você demorou mais de 5 segundos.
                  <br/><br/>
                  Você voltou um livro.
                </p>
                <button 
                  onClick={nextStep}
                  className="w-full py-4 bg-amber-600 text-white font-bold rounded-2xl hover:bg-amber-700 transition-all shadow-lg shadow-amber-600/20 flex items-center justify-center gap-2"
                >
                  Continuar <ArrowRight size={20} />
                </button>
              </motion.div>
            )}

            {gameState === 'finished' && (
              <motion.div 
                key="finished"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center max-w-md"
              >
                <div className="w-32 h-32 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Trophy size={64} />
                </div>
                <h2 className="text-4xl font-display font-bold text-yellow-600 mb-4">Parabéns!</h2>
                <p className="text-stone-600 dark:text-zinc-400 mb-8">
                  Você completou o Panorama Bíblico! Uma jornada incrível por toda a Palavra de Deus.
                </p>
                <button 
                  onClick={handleClose}
                  className="w-full py-4 bg-emerald-600 text-white font-bold rounded-2xl hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-600/20"
                >
                  Voltar ao Quiz
                </button>
              </motion.div>
            )}
          </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
};
