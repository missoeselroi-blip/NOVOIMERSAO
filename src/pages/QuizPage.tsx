import React, { useState, useEffect } from 'react';
import { 
  Trophy, 
  Timer, 
  CheckCircle2, 
  XCircle, 
  ChevronRight, 
  Share2, 
  UserPlus, 
  MessageSquare,
  Award,
  TrendingUp,
  TrendingDown,
  Minus,
  Loader2,
  Play,
  RotateCcw,
  Star,
  Zap,
  Medal,
  Crown,
  Gift,
  LogIn,
  Plus,
  Swords
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSearchParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../components/Toast';
import { db } from '../lib/firebase';
import { Question, QUESTIONS } from '../data/questions';
import { 
  collection, 
  query, 
  orderBy, 
  limit, 
  onSnapshot,
  setDoc,
  doc,
  getDoc,
  serverTimestamp,
  updateDoc,
  where
} from 'firebase/firestore';
import { cn } from '../types';
import html2canvas from 'html2canvas';


interface LeaderboardEntry {
  userId: string;
  name: string;
  avatar: string;
  score: number;
  totalScore?: number;
  battlesWon: number;
  lastScore: number;
  month: number;
  trend: 'up' | 'down' | 'same';
  rank?: number;
}


// Force rebuild
const QuizPage: React.FC = () => {
  const { user, loginWithGoogle } = useAuth();
  const { showToast } = useToast();
  
  const handleBattleMode = () => {
    console.log("Quiz Mano a Mano button clicked");
    setIsBattleMode(true);
  };
  const [isQuizStarted, setIsQuizStarted] = useState(false);
  const [isBattleMode, setIsBattleMode] = useState(false);
  const [roomId, setRoomId] = useState<string | null>(null);
  const [roomData, setRoomData] = useState<any>(null);
  const [currentQuestions, setCurrentQuestions] = useState<Question[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(60);
  const [isQuizFinished, setIsQuizFinished] = useState(false);
  const [totalUsers, setTotalUsers] = useState(0);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [battleLeaderboard, setBattleLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [userRank, setUserRank] = useState<LeaderboardEntry | null>(null);
  const [isLoadingLeaderboard, setIsLoadingLeaderboard] = useState(true);
  const [isLoadingBattleLeaderboard, setIsLoadingBattleLeaderboard] = useState(true);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [timerActive, setTimerActive] = useState(false);
  const [startTime, setStartTime] = useState(0);

  const [showJoinModal, setShowJoinModal] = useState(false);
  const [joinRoomIdInput, setJoinRoomIdInput] = useState('');
  const [searchParams, setSearchParams] = useSearchParams();
  const processedRooms = React.useRef<Set<string>>(new Set());

  useEffect(() => {
    const urlRoomId = searchParams.get('roomId') || new URLSearchParams(window.location.search).get('roomId');
    if (urlRoomId) {
      setJoinRoomIdInput(urlRoomId);
      setIsBattleMode(true);
      if (user) {
        setShowJoinModal(true);
      }
    }
  }, [searchParams, user]);

  // Fetch Leaderboard
  useEffect(() => {
    const q = query(collection(db, 'quizLeaderboard'), orderBy('totalScore', 'desc'), limit(10));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const entries = snapshot.docs.map(doc => ({
        ...doc.data(),
        userId: doc.id,
        battlesWon: (doc.data() as any).battlesWon || 0
      })) as LeaderboardEntry[];
      setLeaderboard(entries);
      setIsLoadingLeaderboard(false);

      if (user) {
        const userEntry = entries.find(e => e.userId === user.id);
        if (userEntry) {
          setUserRank({ ...userEntry, rank: entries.indexOf(userEntry) + 1 });
          if ((userEntry as any).totalScore === undefined || userEntry.score > 100) {
            const cappedScore = Math.min(userEntry.score || 0, 100);
            updateDoc(doc(db, 'quizLeaderboard', user.id), {
              score: cappedScore,
              totalScore: cappedScore + (userEntry.battlesWon || 0)
            });
          }
        } else {
          // Fetch user rank if not in top 10
          getDoc(doc(db, 'quizLeaderboard', user.id)).then(docSnap => {
            if (docSnap.exists()) {
              const data = docSnap.data() as any;
              setUserRank(data as LeaderboardEntry);
              if (data.totalScore === undefined || data.score > 100) {
                const cappedScore = Math.min(data.score || 0, 100);
                updateDoc(doc(db, 'quizLeaderboard', user.id), {
                  score: cappedScore,
                  totalScore: cappedScore + (data.battlesWon || 0)
                });
              }
            }
          });
        }
      }
    });

    return () => unsubscribe();
  }, [user]);

  // Fetch Total Users
  useEffect(() => {
    const q = query(collection(db, 'users'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setTotalUsers(snapshot.size);
    });
    return () => unsubscribe();
  }, []);

  // Fetch Battle Leaderboard
  useEffect(() => {
    const q = query(collection(db, 'quizLeaderboard'), orderBy('battlesWon', 'desc'), limit(10));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const entries = snapshot.docs.map(doc => ({
        ...doc.data(),
        userId: doc.id,
        battlesWon: (doc.data() as any).battlesWon || 0
      })) as LeaderboardEntry[];
      setBattleLeaderboard(entries);
      setIsLoadingBattleLeaderboard(false);
    });
    return () => unsubscribe();
  }, []);

  // Timer Logic
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (timerActive && timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft(prev => prev - 1);
      }, 1000);
    } else if (timeLeft === 0 && timerActive) {
      handleAnswer(-1); // Time out
    }
    return () => clearInterval(timer);
  }, [timerActive, timeLeft]);

  // Listen to room updates
  useEffect(() => {
    if (!roomId) return;
    const roomRef = doc(db, 'quizRooms', roomId);
    const unsubscribe = onSnapshot(roomRef, async (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        setRoomData(data);
        
        if (data.status === 'started' && !isQuizStarted && !isQuizFinished) {
          setCurrentQuestions(data.questions || shuffleQuestions());
          setIsQuizStarted(true);
        }

        // Check if all players finished
        if (data.status === 'started' && data.players.length > 0 && data.players.every((p: any) => p.finished)) {
          // Only the creator updates the room to finished to avoid race conditions
          if (user && data.players[0].userId === user.id) {
            let maxScore = -1;
            let winners: string[] = [];
            data.players.forEach((p: any) => {
              if (p.score > maxScore) {
                maxScore = p.score;
                winners = [p.userId];
              } else if (p.score === maxScore) {
                winners.push(p.userId);
              }
            });

            await updateDoc(roomRef, { 
              status: 'finished',
              winners: winners
            });
          }
        }

        // If room is finished, update local battlesWon if current user is a winner
        if (data.status === 'finished' && user && data.winners?.includes(user.id)) {
          if (!processedRooms.current.has(roomId)) {
            processedRooms.current.add(roomId);
            const userRef = doc(db, 'quizLeaderboard', user.id);
            getDoc(userRef).then((userSnap) => {
              if (userSnap.exists()) {
                const data = userSnap.data() as any;
                const battlesWon = data.battlesWon || 0;
                const currentScore = Math.min(data.score || 0, 100);
                updateDoc(userRef, { 
                  score: currentScore,
                  battlesWon: battlesWon + 1,
                  totalScore: currentScore + battlesWon + 1
                });
              }
            });
          }
        }
        
        // Handle next room transition
        if (data.nextRoomId && data.status === 'finished' && roomId !== data.nextRoomId) {
          // We will show a button to join the next room instead of auto-joining
        }
      }
    });
    return () => unsubscribe();
  }, [roomId, isQuizStarted, isQuizFinished, user]);

  const shuffleQuestions = () => {
    // Obter IDs das questões já respondidas
    const seenQuestionsStr = localStorage.getItem('seenQuizQuestions');
    let seenQuestions: number[] = seenQuestionsStr ? JSON.parse(seenQuestionsStr) : [];
    
    // Filtrar questões que ainda não foram vistas
    let unseenQuestions = QUESTIONS.filter(q => !seenQuestions.includes(q.id));
    
    // Se não houver questões não vistas suficientes (menos de 10), resetar o histórico
    if (unseenQuestions.length < 10) {
      seenQuestions = [];
      unseenQuestions = [...QUESTIONS];
    }
    
    // Embaralhar as questões não vistas usando Fisher-Yates
    const shuffled = [...unseenQuestions];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    const selected = shuffled.slice(0, 10);
    
    // Atualizar o histórico com as novas questões selecionadas
    const newSeenQuestions = [...seenQuestions, ...selected.map(q => q.id)];
    localStorage.setItem('seenQuizQuestions', JSON.stringify(newSeenQuestions));
    
    return selected;
  };

  const startQuiz = () => {
    const selectedQuestions = shuffleQuestions();
    setCurrentQuestions(selectedQuestions);
    setIsQuizStarted(true);
    setCurrentQuestionIndex(0);
    setScore(0);
    setIsQuizFinished(false);
    
    // Reset states for first question
    setSelectedOption(null);
    setIsCorrect(null);
    setTimeLeft(60);
    setTimerActive(true);
    setStartTime(Date.now());
  };

  const createRoom = async () => {
    if (!user) return;
    const roomRef = doc(collection(db, 'quizRooms'));
    const selectedQuestions = shuffleQuestions();
    await setDoc(roomRef, {
      players: [{ userId: user.id, name: user.name, avatar: user.photoURL || user.avatar || '', score: 0, finished: false }],
      currentQuestionIndex: 0,
      status: 'waiting',
      questions: selectedQuestions,
      createdAt: serverTimestamp()
    });
    setRoomId(roomRef.id);
    setIsBattleMode(true);
    showToast("Sala criada! Compartilhe o ID: " + roomRef.id, "success");
  };

  const handleJoinRoomSubmit = async () => {
    if (!user) {
      showToast("Você precisa estar logado para entrar em uma sala.", "error");
      return;
    }
    const id = joinRoomIdInput.trim();
    if (!id) {
      showToast("Por favor, digite o ID da sala.", "error");
      return;
    }
    console.log("Joining room:", id);
    const roomRef = doc(db, 'quizRooms', id);
    try {
      const roomSnap = await getDoc(roomRef);
      if (roomSnap.exists()) {
        console.log("Room exists:", roomSnap.data());
        const data = roomSnap.data();
        const isAlreadyInRoom = data.players.some((p: any) => p.userId === user.id);
        if (!isAlreadyInRoom) {
          const players = [...data.players, { userId: user.id, name: user.name, avatar: user.photoURL || user.avatar || '', score: 0, finished: false }];
          await updateDoc(roomRef, { players });
        }
        setRoomId(id);
        setIsBattleMode(true);
        setShowJoinModal(false);
        setJoinRoomIdInput('');
      } else {
        console.log("Room not found:", id);
        showToast("Sala não encontrada.", "error");
      }
    } catch (error) {
      console.error("Error joining room:", error);
      showToast("Erro ao entrar na sala. Verifique as permissões.", "error");
    }
  };

  const joinRoom = () => {
    if (!user) {
      showToast("Você precisa estar logado para entrar em uma sala.", "error");
      return;
    }
    setShowJoinModal(true);
  };

  const startBattle = async () => {
    if (!roomId) return;
    const roomRef = doc(db, 'quizRooms', roomId);
    await updateDoc(roomRef, { status: 'started' });
  };

  const nextQuestion = () => {
    setSelectedOption(null);
    setIsCorrect(null);
    setTimeLeft(60);
    setTimerActive(true);
    setStartTime(Date.now());
  };

  const handleAnswer = async (optionIndex: number) => {
    if (selectedOption !== null || currentQuestions.length === 0) return;
    
    setTimerActive(false);
    setSelectedOption(optionIndex);
    
    const question = currentQuestions[currentQuestionIndex];
    const isRight = optionIndex === question.correctAnswer;
    setIsCorrect(isRight);

    let pointsEarned = 0;
    let newScore = score;
    if (isRight) {
      const timeTaken = (Date.now() - startTime) / 1000;
      pointsEarned = Math.max(1, 11 - Math.ceil(timeTaken / 5));
      newScore = score + pointsEarned;
      setScore(newScore);
      showToast(`Correto! +${pointsEarned} pontos`, "success");
    } else {
      newScore = Math.max(0, score - 10);
      setScore(newScore);
      showToast("Incorreto! -10 pontos", "error");
    }

    // Sync score if in battle mode
    if (isBattleMode && roomId && user) {
      const roomRef = doc(db, 'quizRooms', roomId);
      const players = roomData.players.map((p: any) => 
        p.userId === user.id ? { ...p, score: (p.score || 0) + pointsEarned } : p
      );
      await updateDoc(roomRef, { players });
    }

    setTimeout(() => {
      if (currentQuestionIndex < currentQuestions.length - 1) {
        setCurrentQuestionIndex(prev => prev + 1);
        nextQuestion();
      } else {
        finishQuiz(newScore);
      }
    }, 1500);
  };

  const finishQuiz = async (finalScore: number) => {
    setIsQuizFinished(true);
    setIsQuizStarted(false);
    setTimerActive(false);

    if (isBattleMode && roomId && user && roomData) {
      const roomRef = doc(db, 'quizRooms', roomId);
      const players = roomData.players.map((p: any) => 
        p.userId === user.id ? { ...p, finished: true } : p
      );
      await updateDoc(roomRef, { players });
    }

    if (user) {
      const userRef = doc(db, 'quizLeaderboard', user.id);
      const userSnap = await getDoc(userRef);
      
      let trend: 'up' | 'down' | 'same' = 'same';
      let previousScore = 0;
      let battlesWon = 0;

      if (userSnap.exists()) {
        const data = userSnap.data() as LeaderboardEntry;
        previousScore = data.score || 0;
        battlesWon = data.battlesWon || 0;
        if (finalScore > previousScore) trend = 'up';
        else if (finalScore < previousScore) trend = 'down';
      } else {
        if (finalScore > 0) trend = 'up';
      }

      const newTotalScore = finalScore + battlesWon;

      await setDoc(userRef, {
        name: user.name || 'Usuário',
        avatar: user.photoURL || user.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.id}`,
        score: finalScore,
        totalScore: newTotalScore,
        lastScore: finalScore,
        trend: trend,
        updatedAt: serverTimestamp()
      }, { merge: true });
    }
  };

  const handleShare = async () => {
    const element = document.getElementById('quiz-result-card');
    if (!element) return;

    try {
      const canvas = await html2canvas(element, {
        width: 1080,
        height: 1920,
        scale: 1,
        backgroundColor: null, // Transparent if needed
      });
      
      canvas.toBlob(async (blob) => {
        if (!blob) return;
        const file = new File([blob], 'meu-resultado-quiz-imersao.png', { type: 'image/png' });
        
        if (navigator.share && navigator.canShare({ files: [file] })) {
          await navigator.share({
            files: [file],
            title: 'Meu resultado no Quiz da Imersão Bíblica',
            text: 'Confira meu resultado!',
          });
          showToast("Resultado compartilhado!", "success");
        } else {
          // Fallback to download
          const link = document.createElement('a');
          link.href = URL.createObjectURL(blob);
          link.download = 'meu-resultado-quiz-imersao.png';
          link.click();
          showToast("Resultado baixado!", "success");
        }
      }, 'image/png');
    } catch (error) {
      showToast("Erro ao gerar imagem", "error");
    }
  };

  const challengeFriends = () => {
    let text = `Desafio você no Quiz da Imersão Bíblica! Minha pontuação foi ${score}. Consegue bater?`;
    let baseUrl = window.location.href.split('/#/')[0];
    if (baseUrl.endsWith('/')) {
      baseUrl = baseUrl.slice(0, -1);
    }
    // Se estiver no ambiente de desenvolvimento (ais-dev), troca para o link público (ais-pre)
    baseUrl = baseUrl.replace('ais-dev', 'ais-pre');
    let url = baseUrl + '/#/';
    
    if (isBattleMode && roomId) {
      const cacheBuster = Date.now();
      url = `${baseUrl}/?roomId=${roomId}&v=${cacheBuster}#/quiz`;
      text = `⚔️ Desafio você para uma Batalha no Quiz da Imersão Bíblica! ⚔️\n\nLink do App: ${baseUrl}/#/quiz\nID da Sala: ${roomId}\n\nOu clique no link direto abaixo para entrar na sala:`;
    }
    
    window.open(`https://wa.me/?text=${encodeURIComponent(text + '\n\n' + url)}`, '_blank');
  };

  return (
    <div className="min-h-screen pt-20 pb-12 px-4 bg-stone-50 dark:bg-zinc-950">
      {showJoinModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white dark:bg-zinc-900 rounded-3xl p-6 w-full max-w-sm shadow-2xl border border-stone-200 dark:border-zinc-800"
          >
            <h3 className="text-xl font-bold mb-4 text-stone-800 dark:text-stone-200">Entrar na Sala</h3>
            <input 
              type="text" 
              value={joinRoomIdInput}
              onChange={(e) => setJoinRoomIdInput(e.target.value)}
              placeholder="Digite o ID da sala"
              className="w-full p-3 rounded-xl border border-stone-300 dark:border-zinc-700 bg-stone-50 dark:bg-zinc-800 mb-4 text-stone-800 dark:text-stone-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
            <div className="flex gap-3">
              <button 
                onClick={() => setShowJoinModal(false)}
                className="flex-1 py-3 rounded-xl font-bold text-stone-600 dark:text-stone-400 bg-stone-100 dark:bg-zinc-800 hover:bg-stone-200 dark:hover:bg-zinc-700 transition-colors"
              >
                Cancelar
              </button>
              <button 
                onClick={handleJoinRoomSubmit}
                className="flex-1 py-3 rounded-xl font-bold text-white bg-blue-600 hover:bg-blue-700 transition-colors"
              >
                Entrar
              </button>
            </div>
          </motion.div>
        </div>
      )}

      <div className="max-w-4xl mx-auto">
        
        {/* Header */}
        <div className="text-center mb-8">
          <motion.div 
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="inline-flex p-4 bg-emerald-100 dark:bg-emerald-900/30 rounded-full text-emerald-600 dark:text-emerald-400 mb-4"
          >
            <Trophy size={48} />
          </motion.div>
          <h1 className="text-4xl font-display font-bold text-emerald-900 dark:text-emerald-400 mb-2">Quiz Bíblico</h1>
          <p className="text-stone-600 dark:text-stone-400">Teste seus conhecimentos e suba no ranking!</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Main Content Area */}
          <div className="lg:col-span-2 space-y-6">
            
            {isQuizStarted ? (
              <div className="bg-white dark:bg-zinc-900 rounded-3xl p-8 shadow-xl border border-stone-200 dark:border-zinc-800 relative overflow-hidden">
                {/* Progress Bar */}
                <div className="absolute top-0 left-0 w-full h-1.5 bg-stone-100 dark:bg-zinc-800">
                  <motion.div 
                    className="h-full bg-emerald-500"
                    initial={{ width: 0 }}
                    animate={{ width: `${((currentQuestionIndex + 1) / currentQuestions.length) * 100}%` }}
                  />
                </div>

                <div className="flex justify-between items-center mb-8">
                  <span className="px-4 py-1 bg-stone-100 dark:bg-zinc-800 rounded-full text-xs font-bold text-stone-500">
                    QUESTÃO {currentQuestionIndex + 1} DE {currentQuestions.length}
                  </span>
                  {isBattleMode && roomData && (
                    <div className="flex gap-4">
                      {roomData.players.map((p: any, index: number) => (
                        <div key={`${p.userId}-${index}`} className="flex items-center gap-2 text-sm font-bold">
                          <img src={p.avatar} className="w-6 h-6 rounded-full" />
                          <span className={p.userId === user?.id ? "text-emerald-600" : "text-blue-600"}>
                            {p.score}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                  <div className="flex items-center gap-2 text-emerald-600 font-mono font-bold">
                    <Timer size={20} />
                    <span className={cn(timeLeft <= 10 ? "text-red-500 animate-pulse" : "")}>
                      {timeLeft}s
                    </span>
                  </div>
                </div>

                <h3 className="text-2xl font-bold text-stone-800 dark:text-stone-200 mb-8 leading-tight">
                  {currentQuestions[currentQuestionIndex].text}
                </h3>

                <div className="grid grid-cols-1 gap-4">
                  {currentQuestions[currentQuestionIndex].options.map((option, idx) => (
                    <button
                      key={idx}
                      disabled={selectedOption !== null}
                      onClick={() => handleAnswer(idx)}
                      className={cn(
                        "w-full p-5 rounded-2xl text-left font-medium transition-all border-2 flex justify-between items-center group",
                        selectedOption === null 
                          ? "border-stone-100 dark:border-zinc-800 hover:border-emerald-500 bg-stone-50 dark:bg-zinc-800/50" 
                          : idx === currentQuestions[currentQuestionIndex].correctAnswer
                            ? "border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400"
                            : selectedOption === idx
                              ? "border-red-500 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400"
                              : "border-stone-100 dark:border-zinc-800 opacity-50"
                      )}
                    >
                      <span>{option}</span>
                      {selectedOption !== null && idx === currentQuestions[currentQuestionIndex].correctAnswer && <CheckCircle2 size={20} />}
                      {selectedOption === idx && idx !== currentQuestions[currentQuestionIndex].correctAnswer && <XCircle size={20} />}
                    </button>
                  ))}
                </div>
              </div>
            ) : isQuizFinished ? (
              <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-white dark:bg-zinc-900 rounded-3xl p-8 shadow-xl border border-stone-200 dark:border-zinc-800 text-center"
                id="quiz-result-card"
              >
                {isBattleMode && roomData ? (
                  <>
                    {roomData.status !== 'finished' ? (
                      <div className="py-12">
                        <Loader2 className="w-12 h-12 text-emerald-500 animate-spin mx-auto mb-4" />
                        <h2 className="text-2xl font-bold text-stone-800 dark:text-stone-200 mb-2">Aguardando Oponentes</h2>
                        <p className="text-stone-600 dark:text-stone-400">Sua pontuação: {score}</p>
                      </div>
                    ) : (
                      <>
                        <div className="mb-6">
                          <div className="w-24 h-24 bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Crown className="text-emerald-600 dark:text-emerald-400" size={48} />
                          </div>
                          <h2 className="text-3xl font-display font-bold text-emerald-900 dark:text-emerald-400 mb-2">Batalha Encerrada!</h2>
                          {roomData.winners?.includes(user?.id) ? (
                            <p className="text-xl font-bold text-emerald-600">Você Venceu! 🎉</p>
                          ) : (
                            <p className="text-xl font-bold text-stone-600 dark:text-stone-400">
                              Vencedor: {roomData.players.find((p: any) => roomData.winners?.includes(p.userId))?.name}
                            </p>
                          )}
                        </div>

                        <div className="space-y-3 mb-8 text-left">
                          <h3 className="font-bold text-stone-700 dark:text-stone-300 mb-4">Placar Final:</h3>
                          {[...roomData.players].sort((a: any, b: any) => b.score - a.score).map((p: any, index: number) => (
                            <div key={`${p.userId}-${index}`} className={cn(
                              "flex items-center gap-3 p-4 rounded-xl border-2",
                              roomData.winners?.includes(p.userId) 
                                ? "bg-emerald-50 border-emerald-200 dark:bg-emerald-900/20 dark:border-emerald-800" 
                                : "bg-stone-50 border-transparent dark:bg-zinc-800/50"
                            )}>
                              <div className="font-bold text-lg w-6 text-stone-400">#{index + 1}</div>
                              <img src={p.avatar} alt={p.name} className="w-10 h-10 rounded-full" />
                              <span className="font-medium text-stone-800 dark:text-stone-200 flex-1">{p.name}</span>
                              <span className="font-bold text-xl text-emerald-600">{p.score} pts</span>
                            </div>
                          ))}
                        </div>

                        <div className="space-y-4">
                          {roomData.nextRoomId ? (
                            <button
                              onClick={async () => {
                                if (!user) return;
                                const newRoomId = roomData.nextRoomId;
                                const newRoomRef = doc(db, 'quizRooms', newRoomId);
                                const roomSnap = await getDoc(newRoomRef);
                                if (roomSnap.exists()) {
                                  const data = roomSnap.data();
                                  const isAlreadyInRoom = data.players.some((p: any) => p.userId === user.id);
                                  if (!isAlreadyInRoom) {
                                    const players = [...data.players, { userId: user.id, name: user.name, avatar: user.photoURL || user.avatar || '', score: 0, finished: false }];
                                    await updateDoc(newRoomRef, { players });
                                  }
                                }
                                setRoomId(newRoomId);
                                setIsQuizFinished(false);
                                setIsQuizStarted(false);
                              }}
                              className="w-full py-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl font-bold flex items-center justify-center gap-2 transition-all"
                            >
                              <Zap size={20} /> Aceitar Novo Desafio
                            </button>
                          ) : (
                            <button
                              onClick={async () => {
                                if (!user) return;
                                const newRoomRef = doc(collection(db, 'quizRooms'));
                                const selectedQuestions = shuffleQuestions();
                                await setDoc(newRoomRef, {
                                  players: [{ userId: user.id, name: user.name, avatar: user.photoURL || user.avatar || '', score: 0, finished: false }],
                                  currentQuestionIndex: 0,
                                  status: 'waiting',
                                  questions: selectedQuestions,
                                  createdAt: serverTimestamp()
                                });
                                await updateDoc(doc(db, 'quizRooms', roomId!), { nextRoomId: newRoomRef.id });
                                setRoomId(newRoomRef.id);
                                setIsQuizFinished(false);
                                setIsQuizStarted(false);
                              }}
                              className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-bold flex items-center justify-center gap-2 transition-all"
                            >
                              <RotateCcw size={20} /> Desafiar Novamente
                            </button>
                          )}
                          <button
                            onClick={() => {
                              setIsBattleMode(false);
                              setRoomId(null);
                              setIsQuizFinished(false);
                            }}
                            className="w-full py-4 bg-stone-100 dark:bg-zinc-800 text-stone-600 dark:text-stone-400 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-stone-200 dark:hover:bg-zinc-700 transition-all"
                          >
                            Sair da Batalha
                          </button>
                        </div>
                      </>
                    )}
                  </>
                ) : (
                  <>
                    <div className="mb-6">
                      <div className="w-24 h-24 bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Medal className="text-emerald-600 dark:text-emerald-400" size={48} />
                      </div>
                      <h2 className="text-3xl font-display font-bold text-emerald-900 dark:text-emerald-400">Parabéns!</h2>
                      <p className="text-stone-600 dark:text-stone-400 mt-2">Você concluiu o Quiz com excelência.</p>
                    </div>

                    <div className="grid grid-cols-2 gap-4 mb-8">
                      <div className="p-6 bg-stone-50 dark:bg-zinc-800/50 rounded-2xl">
                        <p className="text-xs text-stone-500 uppercase tracking-widest mb-1">Pontuação Final</p>
                        <p className="text-4xl font-display font-bold text-emerald-600">{score}</p>
                      </div>
                      <div className="p-6 bg-stone-50 dark:bg-zinc-800/50 rounded-2xl">
                        <p className="text-xs text-stone-500 uppercase tracking-widest mb-1">Sua Posição</p>
                        <p className="text-4xl font-display font-bold text-blue-600">#{userRank?.rank || '?'}</p>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div className="flex flex-col sm:flex-row gap-3">
                        <button
                          onClick={handleShare}
                          className="flex-1 py-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl font-bold flex items-center justify-center gap-2 transition-all"
                        >
                          <Share2 size={20} /> Criar Post
                        </button>
                        <button
                          onClick={challengeFriends}
                          className="flex-1 py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-bold flex items-center justify-center gap-2 transition-all"
                        >
                          <UserPlus size={20} /> Desafiar Amigos
                        </button>
                      </div>
                      <button
                        onClick={startQuiz}
                        className="w-full py-4 bg-stone-100 dark:bg-zinc-800 text-stone-600 dark:text-stone-400 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-stone-200 dark:hover:bg-zinc-700 transition-all"
                      >
                        <RotateCcw size={20} /> Tentar Novamente
                      </button>
                    </div>
                  </>
                )}
              </motion.div>
            ) : isBattleMode ? (
              <div className="bg-white dark:bg-zinc-900 rounded-3xl p-8 shadow-xl border border-stone-200 dark:border-zinc-800 text-center">
                {roomId ? (
                  <>
                    <h2 className="text-2xl font-bold mb-2 text-stone-800 dark:text-stone-200">Sala de Batalha</h2>
                    <p className="text-stone-500 mb-6 font-mono bg-stone-100 dark:bg-zinc-800 py-2 px-4 rounded-lg inline-block">ID: {roomId}</p>
                    
                    <div className="mb-8 text-left">
                      <h3 className="font-bold text-stone-700 dark:text-stone-300 mb-4">Jogadores na sala:</h3>
                      <div className="space-y-3">
                        {roomData?.players?.map((p: any, index: number) => (
                          <div key={`${p.userId}-${index}`} className="flex items-center gap-3 p-3 bg-stone-50 dark:bg-zinc-800/50 rounded-xl">
                            <img src={p.avatar} alt={p.name} className="w-10 h-10 rounded-full" />
                            <span className="font-medium text-stone-800 dark:text-stone-200">{p.name}</span>
                            {p.userId === roomData.players[0].userId && (
                              <span className="ml-auto text-xs bg-emerald-100 text-emerald-700 px-2 py-1 rounded-full font-bold">Criador</span>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-4">
                      {roomData?.players?.[0]?.userId === user?.id ? (
                        <button
                          onClick={startBattle}
                          disabled={roomData?.players?.length < 2}
                          className="w-full py-4 bg-emerald-600 hover:bg-emerald-700 disabled:bg-stone-300 disabled:cursor-not-allowed text-white rounded-2xl font-bold text-lg shadow-lg flex items-center justify-center gap-2 transition-all"
                        >
                          <Zap size={24} /> {roomData?.players?.length < 2 ? 'Aguardando oponentes...' : 'Iniciar Batalha!'}
                        </button>
                      ) : (
                        <div className="p-4 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 rounded-xl font-medium flex items-center justify-center gap-2">
                          <Timer className="animate-spin" size={20} /> Aguardando o criador iniciar...
                        </div>
                      )}
                      
                      <button
                        onClick={() => {
                          let baseUrl = window.location.href.split('/#/')[0];
                          if (baseUrl.endsWith('/')) {
                            baseUrl = baseUrl.slice(0, -1);
                          }
                          baseUrl = baseUrl.replace('ais-dev', 'ais-pre');
                          const cacheBuster = Date.now();
                          const url = `${baseUrl}/?roomId=${roomId}&v=${cacheBuster}#/quiz`;
                          const text = `Paz... Desafio você para um Quiz Mano a Mano!\n\nLink do App: ${baseUrl}/#/quiz\nID da Sala: ${roomId}\n\nOu clique no link direto abaixo para entrar na sala:`;
                          window.open(`https://wa.me/?text=${encodeURIComponent(text + '\n\n' + url)}`, '_blank');
                        }}
                        className="w-full py-4 bg-stone-100 dark:bg-zinc-800 hover:bg-stone-200 dark:hover:bg-zinc-700 text-stone-700 dark:text-stone-300 rounded-2xl font-bold flex items-center justify-center gap-2 transition-all"
                      >
                        <UserPlus size={20} /> Convidar via WhatsApp
                      </button>
                    </div>
                  </>
                ) : (
                  <>
                    <h2 className="text-2xl font-bold mb-6 text-stone-800 dark:text-stone-200">Quiz Mano a Mano</h2>
                    {(!user && joinRoomIdInput) ? (
                      <div className="space-y-4">
                        <p className="text-stone-600 dark:text-stone-400 mb-8">Você foi convidado para uma batalha! Faça login para participar.</p>
                        <button
                          onClick={async () => {
                            try {
                              await loginWithGoogle();
                            } catch (err: any) {
                              if (err.code === 'auth/popup-closed-by-user' || err.code === 'auth/cancelled-popup-request') {
                                console.log("Login popup closed by user");
                                return;
                              }
                              console.error("Erro ao fazer login com Google:", err);
                            }
                          }}
                          className="w-full py-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl font-bold text-lg shadow-lg shadow-emerald-600/20 flex items-center justify-center gap-2 transition-all"
                        >
                          <LogIn size={24} /> Fazer Login com Google
                        </button>
                        <button
                          onClick={() => setIsBattleMode(false)}
                          className="w-full py-4 text-stone-500 hover:text-stone-700 dark:text-stone-400 dark:hover:text-stone-200"
                        >
                          Voltar
                        </button>
                      </div>
                    ) : (
                      <>
                        <p className="text-stone-600 dark:text-stone-400 mb-8">Crie ou entre em uma sala de batalha.</p>
                        <div className="space-y-4">
                          <button
                            onClick={createRoom}
                            className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-bold text-lg shadow-lg shadow-blue-600/20 flex items-center justify-center gap-2 transition-all"
                          >
                            Criar Sala
                          </button>
                          <button
                            onClick={joinRoom}
                            className="w-full py-4 bg-stone-100 dark:bg-zinc-800 text-stone-600 dark:text-stone-400 rounded-2xl font-bold text-lg shadow-lg flex items-center justify-center gap-2 transition-all"
                          >
                            Entrar em Sala
                          </button>
                          <button
                            onClick={() => setIsBattleMode(false)}
                            className="w-full py-4 text-stone-500 hover:text-stone-700 dark:text-stone-400 dark:hover:text-stone-200"
                          >
                            Voltar
                          </button>
                        </div>
                      </>
                    )}
                  </>
                )}
              </div>
            ) : (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white dark:bg-zinc-900 rounded-3xl p-8 shadow-xl border border-stone-200 dark:border-zinc-800 text-center"
              >
                <h2 className="text-2xl font-bold mb-6 text-stone-800 dark:text-stone-200">Regras do Quiz</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8 text-left">
                  <div className="flex items-start gap-3 p-4 bg-stone-50 dark:bg-zinc-800/50 rounded-2xl">
                    <Star className="text-amber-500 mt-1" size={20} />
                    <div>
                      <p className="font-bold text-sm">10 Perguntas</p>
                      <p className="text-xs text-stone-500">Níveis: Fácil a Desafio</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 p-4 bg-stone-50 dark:bg-zinc-800/50 rounded-2xl">
                    <Timer className="text-blue-500 mt-1" size={20} />
                    <div>
                      <p className="font-bold text-sm">Velocidade</p>
                      <p className="text-xs text-stone-500">Mais rápido = Mais pontos</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 p-4 bg-stone-50 dark:bg-zinc-800/50 rounded-2xl">
                    <Zap className="text-emerald-500 mt-1" size={20} />
                    <div>
                      <p className="font-bold text-sm">Pontuação</p>
                      <p className="text-xs text-stone-500">Max 10 pts por questão</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 p-4 bg-stone-50 dark:bg-zinc-800/50 rounded-2xl">
                    <Award className="text-purple-500 mt-1" size={20} />
                    <div>
                      <p className="font-bold text-sm">Prêmio Mensal</p>
                      <p className="text-xs text-stone-500">1º lugar ganha prêmio surpresa</p>
                    </div>
                  </div>
                </div>
                <button
                  onClick={startQuiz}
                  className="w-full py-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl font-bold text-lg shadow-lg shadow-emerald-600/20 flex items-center justify-center gap-2 transition-all"
                >
                  <Play size={24} /> Quiz Individual
                </button>
                <div className="mt-4">
                  <button
                    onClick={handleBattleMode}
                    className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-bold text-lg shadow-lg shadow-blue-600/20 flex items-center justify-center gap-2 transition-all"
                  >
                    <UserPlus size={24} /> Quiz Mano a Mano
                  </button>
                </div>
              </motion.div>
            )}

            {/* Encouragement Message */}
            {isQuizFinished && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-6 bg-emerald-50 dark:bg-emerald-900/20 rounded-2xl border border-emerald-100 dark:border-emerald-800 text-center"
              >
                <p className="text-emerald-800 dark:text-emerald-300 italic">
                  "Lâmpada para os meus pés é tua palavra e luz, para o meu caminho." - Salmos 119:105
                </p>
                <p className="mt-2 text-sm text-emerald-600 dark:text-emerald-400 font-medium">
                  Continue estudando e mergulhando na Palavra! Seu progresso é inspirador.
                </p>
              </motion.div>
            )}
          </div>

          {/* Sidebar - Leaderboard */}
          <div className="space-y-6">
            <div className="bg-white dark:bg-zinc-900 rounded-3xl p-6 shadow-xl border border-stone-200 dark:border-zinc-800">
              {/* Stats */}
              <div className="grid grid-cols-2 gap-4 mb-8">
                <div className="bg-stone-100 dark:bg-zinc-800 p-4 rounded-2xl text-center">
                  <p className="text-2xl font-bold text-stone-800 dark:text-stone-200">{totalUsers}</p>
                  <p className="text-xs text-stone-500">Inscritos</p>
                </div>
                <div className="bg-stone-100 dark:bg-zinc-800 p-4 rounded-2xl text-center">
                  <p className="text-2xl font-bold text-stone-800 dark:text-stone-200">0</p>
                  <p className="text-xs text-stone-500">Online</p>
                </div>
              </div>

              {/* General Leaderboard */}
              <div className="mb-8">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <Crown className="text-amber-500" size={24} />
                    <h2 className="text-xl font-bold text-stone-800 dark:text-stone-200">Ranking Quiz Geral</h2>
                  </div>
                </div>
                {/* Current User Rank */}
                {user && (
                  <div className="mb-6 p-4 bg-emerald-50 dark:bg-emerald-900/20 rounded-2xl border border-emerald-100 dark:border-emerald-800">
                    <p className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest mb-2">Sua Classificação</p>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <img 
                          src={user.photoURL || user.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.id}`} 
                          alt="Avatar" 
                          className="w-10 h-10 rounded-full border-2 border-emerald-500"
                          referrerPolicy="no-referrer"
                        />
                        <div>
                          <p className="text-sm font-bold text-stone-800 dark:text-stone-200 truncate max-w-[100px]">
                            {user.name || 'Você'}
                          </p>
                          <p className="text-xs text-stone-500">#{userRank?.rank || '?'}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-bold text-emerald-600">{userRank?.totalScore ?? (userRank?.score || 0)}</p>
                      </div>
                    </div>
                  </div>
                )}

                <div className="overflow-x-auto">
                  <table className="w-full text-sm text-left">
                    <thead className="text-xs text-stone-500 uppercase bg-stone-50 dark:bg-zinc-800">
                      <tr>
                        <th className="px-3 py-2">#</th>
                        <th className="px-3 py-2">Nome</th>
                        <th className="px-3 py-2">Quiz</th>
                        <th className="px-3 py-2">Vitórias</th>
                        <th className="px-3 py-2">Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      {leaderboard.map((entry, index) => (
                        <tr 
                          key={entry.userId}
                          className={cn(
                            "border-b border-stone-100 dark:border-zinc-800",
                            entry.userId === user?.id ? "bg-emerald-50 dark:bg-emerald-900/20" : ""
                          )}
                        >
                          <td className="px-3 py-3 font-bold text-stone-500">{index + 1}</td>
                          <td className="px-3 py-3 flex items-center gap-2">
                            <img src={entry.avatar} alt={entry.name} className="w-6 h-6 rounded-full" referrerPolicy="no-referrer" />
                            <span className="font-medium text-stone-700 dark:text-stone-300 truncate max-w-[80px]">{entry.name}</span>
                          </td>
                          <td className="px-3 py-3 text-stone-900 dark:text-stone-100">{entry.score}</td>
                          <td className="px-3 py-3 text-stone-900 dark:text-stone-100">{entry.battlesWon || 0}</td>
                          <td className="px-3 py-3 font-bold text-emerald-600 dark:text-emerald-400">{entry.totalScore ?? (entry.score + (entry.battlesWon || 0))}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Battle Leaderboard */}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default QuizPage;
