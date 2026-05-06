import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, Medal, AlertCircle, CheckCircle2, XCircle, Clock, ArrowLeft, ArrowRight, RotateCcw, BookOpen } from 'lucide-react';
import { booksList, getDivisionForBook, getRandomQuestionForBook, Question } from '../data/panoramaQuestions';
import { useAuth } from '../contexts/AuthContext';
import { db } from '../lib/firebase';
import { doc, updateDoc, getDoc, setDoc, serverTimestamp, collection, query, orderBy, limit, onSnapshot } from 'firebase/firestore';
import { cn, LeaderboardEntry } from '../types';

interface PanoramaBiblicoProps {
  onClose: () => void;
}

export const PanoramaBiblico: React.FC<PanoramaBiblicoProps> = ({ onClose }) => {
  const { user, updateUser, addPoints } = useAuth();
  const [currentBookIndex, setCurrentBookIndex] = useState(0);
  const [consecutiveCorrect, setConsecutiveCorrect] = useState(0);
  const [timeLeft, setTimeLeft] = useState(9);
  const [gameState, setGameState] = useState<'intro' | 'playing' | 'correct' | 'wrong' | 'timeout' | 'finished' | 'division_completed'>('intro');
  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [startTime, setStartTime] = useState<number>(0);
  const [panoramaScore, setPanoramaScore] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const currentBook = booksList[currentBookIndex];
  const currentDivision = getDivisionForBook(currentBookIndex);

  useEffect(() => {
    const loadUserData = async () => {
      if (user) {
        try {
          const userRef = doc(db, 'quizLeaderboard', user.id);
          const userSnap = await getDoc(userRef);
          if (userSnap.exists()) {
            const data = userSnap.data();
            if (data.panoramaScore !== undefined) {
              setPanoramaScore(data.panoramaScore);
            }
            if (data.panoramaSavedBookIndex !== undefined) {
              const division = getDivisionForBook(data.panoramaSavedBookIndex);
              setCurrentBookIndex(division.startIndex);
            }
          }
        } catch (error) {
          console.error("Erro ao carregar dados do panorama:", error);
        }
      }
      setIsLoading(false);
    };
    loadUserData();
  }, [user]);

  useEffect(() => {
    if (gameState === 'playing') {
      setTimeLeft(9);
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

  useEffect(() => {
    const q = query(collection(db, 'quizLeaderboard'), orderBy('panoramaScore', 'desc'), limit(10));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const entries = snapshot.docs.map(doc => ({
        ...doc.data(),
        userId: doc.id
      })) as LeaderboardEntry[];
      setLeaderboard(entries);
    });

    return () => unsubscribe();
  }, []);

  const saveProgress = async (newScore: number, bookIndex: number, isFinished: boolean = false) => {
    if (!user) return;
    try {
      const division = getDivisionForBook(bookIndex);
      const savedIndex = isFinished ? 0 : division.startIndex;

      const userRef = doc(db, 'quizLeaderboard', user.id);
      const userSnap = await getDoc(userRef);
      
      if (userSnap.exists()) {
        const data = userSnap.data() as any;
        const currentScore = Math.min(data.score || 0, 100);
        const battlesWon = data.battlesWon || 0;
        const whoAmIScore = data.whoAmIScore || 0;
        const timelineScore = data.timelineScore || 0;
        const crosswordScore = data.crosswordScore || 0;
        const hangmanScore = data.hangmanScore || 0;
        const wordSearchScore = data.wordSearchScore || 0;
        const cryptogramScore = data.cryptogramScore || 0;
        const anagramScore = data.anagramScore || 0;
        
        const newTotalScore = currentScore + newScore + whoAmIScore + timelineScore + crosswordScore + hangmanScore + wordSearchScore + cryptogramScore + anagramScore;
        
        await updateDoc(userRef, {
          panoramaScore: newScore,
          panoramaSavedBookIndex: savedIndex,
          totalScore: newTotalScore
        });
      } else {
        await setDoc(userRef, {
          name: user.name || 'Usuário',
          avatar: user.photoURL || user.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.id}`,
          score: 0,
          battlesWon: 0,
          panoramaScore: newScore,
          panoramaSavedBookIndex: savedIndex,
          totalScore: newScore,
          updatedAt: serverTimestamp()
        });
      }
    } catch (error) {
      console.error("Erro ao salvar progresso do panorama:", error);
    }
  };

  const handleTimeout = async () => {
    setGameState('timeout');
    const newScore = panoramaScore - 1;
    setPanoramaScore(newScore);
    setConsecutiveCorrect(0);
    await saveProgress(newScore, currentBookIndex);
  };

  const handleAnswer = async (answer: string) => {
    if (gameState !== 'playing' || !currentQuestion) return;
    
    if (timerRef.current) clearInterval(timerRef.current);
    setSelectedAnswer(answer);

    let newScore = panoramaScore;
    let nextState: 'intro' | 'playing' | 'correct' | 'wrong' | 'timeout' | 'finished' | 'division_completed' = gameState;
    let isFinished = false;

    if (answer === currentQuestion.correctAnswer) {
      const isLastBookOfDivision = currentBookIndex === currentDivision.endIndex;
      if (isLastBookOfDivision && currentBookIndex < booksList.length - 1) {
         nextState = 'division_completed';
         newScore += 10;
         await addPoints(50, 'panorama_division');
      } else if (currentBookIndex === booksList.length - 1) {
         nextState = 'finished';
         newScore += 10;
         isFinished = true;
         await addPoints(200, 'panorama_finished');
      } else {
         nextState = 'correct';
         await addPoints(2, 'panorama_correct');
      }
      const newConsecutive = consecutiveCorrect + 1;
      setConsecutiveCorrect(newConsecutive);
      checkMedals(newConsecutive);
    } else {
      nextState = 'wrong';
      newScore -= 2;
      setConsecutiveCorrect(0);
    }

    setPanoramaScore(newScore);
    setGameState(nextState as any);
    await saveProgress(newScore, currentBookIndex, isFinished);
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
          
          await updateUser({ panoramaMedals: medals });
        }
      } catch (error) {
        console.error("Erro ao salvar medalha:", error);
      }
    }
  };

  const nextStep = () => {
    if (gameState === 'correct' || gameState === 'division_completed') {
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
    setConsecutiveCorrect(0);
    setStartTime(Date.now());
    setGameState('playing');
  };

  const handleClose = () => {
    onClose();
  };

  if (isLoading) {
    return (
      <div className="fixed inset-0 z-50 bg-stone-50 dark:bg-zinc-950 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
      </div>
    );
  }

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
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setShowLeaderboard(!showLeaderboard)}
            className="p-2 text-stone-500 hover:text-amber-600 transition-colors"
          >
            <Trophy size={24} />
          </button>
          <div className="flex items-center gap-2 text-blue-600 font-bold bg-blue-50 dark:bg-blue-900/20 px-3 py-1.5 rounded-xl">
            <span>{panoramaScore} pts</span>
          </div>
          <div className="flex items-center gap-2 text-emerald-600 font-bold bg-emerald-50 dark:bg-emerald-900/20 px-3 py-1.5 rounded-xl">
            <Trophy size={16} />
            {consecutiveCorrect}
          </div>
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
          {showLeaderboard ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="max-w-2xl mx-auto bg-white dark:bg-zinc-900 rounded-[2.5rem] p-8 shadow-xl border border-stone-200 dark:border-zinc-800"
            >
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-3">
                  <BookOpen className="text-pink-500" size={32} />
                  <h2 className="text-2xl font-bold text-stone-800 dark:text-stone-200">Ranking Panorama</h2>
                </div>
                <button 
                  onClick={() => setShowLeaderboard(false)}
                  className="p-2 hover:bg-stone-100 dark:hover:bg-zinc-800 rounded-full transition-colors"
                >
                  <RotateCcw size={20} className="text-stone-500" />
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="text-xs text-stone-500 uppercase bg-stone-50 dark:bg-zinc-800">
                    <tr>
                      <th className="px-4 py-3">#</th>
                      <th className="px-4 py-3">Nome</th>
                      <th className="px-4 py-3 text-right">Pontos</th>
                    </tr>
                  </thead>
                  <tbody>
                    {leaderboard.filter(e => e.panoramaScore && e.panoramaScore > 0).map((entry, index) => (
                      <tr 
                        key={entry.userId}
                        className={cn(
                          "border-b border-stone-100 dark:border-zinc-800",
                          entry.userId === user?.id ? "bg-pink-50 dark:bg-pink-900/20" : ""
                        )}
                      >
                        <td className="px-4 py-4 font-bold text-stone-500">{index + 1}</td>
                        <td className="px-4 py-4 flex items-center gap-3">
                          <img src={entry.avatar} alt={entry.name} className="w-8 h-8 rounded-full" referrerPolicy="no-referrer" />
                          <span className="font-medium text-stone-700 dark:text-stone-300">{entry.name}</span>
                        </td>
                        <td className="px-4 py-4 text-right font-bold text-pink-600 dark:text-pink-400">
                          {entry.panoramaScore}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              
              <button
                onClick={() => setShowLeaderboard(false)}
                className="w-full mt-8 py-4 bg-stone-100 dark:bg-zinc-800 text-stone-600 dark:text-stone-400 font-bold rounded-2xl hover:bg-stone-200 dark:hover:bg-zinc-700 transition-all"
              >
                Voltar ao Jogo
              </button>
            </motion.div>
          ) : (
            <div className="min-h-full flex flex-col items-center justify-center">
            <AnimatePresence mode="wait">
              {gameState === 'intro' && (
              <motion.div 
                key="panorama_intro"
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
                  Viaje por todos os 66 livros da Bíblia! Você tem agora <strong>9 segundos</strong> para responder a cada desafio bíblico.
                  <br/><br/>
                  Acertou? Avança um livro.<br/>
                  Tempo esgotou? Volta um livro e perde 1 ponto.<br/>
                  Errou? Volta para o início da divisão atual e perde 2 pontos!<br/>
                  Completou a divisão? Ganha 10 pontos!
                  <br/><br/>
                  <strong>Atenção:</strong> Seu progresso é salvo automaticamente. Boa sorte nessa jornada!
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
                key="panorama_playing"
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
                key="panorama_correct"
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

            {gameState === 'division_completed' && (
              <motion.div 
                key="panorama_division_completed"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center max-w-md"
              >
                <div className="w-32 h-32 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Trophy size={64} />
                </div>
                <h2 className="text-3xl font-display font-bold text-emerald-600 mb-4">Parabéns!</h2>
                <p className="text-stone-600 dark:text-zinc-400 mb-6 font-medium text-lg">
                  Você irá para a próxima divisão da Bíblia.
                </p>
                <div className="mb-8 p-4 bg-emerald-50 dark:bg-emerald-900/20 rounded-2xl border border-emerald-200 dark:border-emerald-800">
                  <p className="text-emerald-800 dark:text-emerald-300 font-bold">+10 Pontos!</p>
                </div>
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
                key="panorama_wrong"
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
                  Você perdeu 2 pontos e voltou para o início da divisão: <strong>{currentDivision.name}</strong>.
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
                key="panorama_timeout"
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
                  Você perdeu 1 ponto e voltou um livro.
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
                key="panorama_finished"
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
        )}
        </div>
      </div>
    </div>
  );
};

