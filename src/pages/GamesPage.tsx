import React, { useState, useEffect } from 'react';
import { AvatarManager } from '../components/AvatarManager';
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
  Swords,
  BookOpen,
  HelpCircle,
  Clock,
  Type,
  UserX,
  Target,
  Lock as LockIcon,
  Sparkles
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../components/Toast';
import { db } from '../lib/firebase';
import { Question, QUESTIONS } from '../data/questions';
import { PanoramaBiblico } from '../components/PanoramaBiblico';
import WhoAmIGame from '../components/games/WhoAmIGame';
import TimelineGame from '../components/games/TimelineGame';
import CrosswordGame from '../components/games/CrosswordGame';
import HangmanGame from '../components/games/HangmanGame';
import WordSearchGame from '../components/games/WordSearchGame';
import CryptogramGame from '../components/games/CryptogramGame';
import AnagramGame from '../components/games/AnagramGame';
import RiddlesGame from '../components/games/RiddlesGame';
import MemoryGame from '../components/games/MemoryGame';
import { ACHIEVEMENTS, Achievement } from '../data/achievements';
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
import { cn, LeaderboardEntry } from '../types';
import html2canvas from 'html2canvas';


// Force rebuild
const GamesPage: React.FC = () => {
  const { user, loginWithGoogle, addPoints } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  
  const handleBattleMode = () => {
    console.log("Quiz Mano a Mano button clicked");
    setIsBattleMode(true);
  };
  const [isQuizStarted, setIsQuizStarted] = useState(false);
  const [isBattleMode, setIsBattleMode] = useState(false);
  const [isCupMode, setIsCupMode] = useState(false);
  const [cupId, setCupId] = useState<string | null>(null);
  const [cupData, setCupData] = useState<any>(null);
  const [cupMaxPlayers, setCupMaxPlayers] = useState<number>(4);
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
  const [panoramaLeaderboard, setPanoramaLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [userRank, setUserRank] = useState<LeaderboardEntry | null>(null);
  const [isLoadingLeaderboard, setIsLoadingLeaderboard] = useState(true);
  const [isLoadingBattleLeaderboard, setIsLoadingBattleLeaderboard] = useState(true);
  const [isLoadingPanorama, setIsLoadingPanorama] = useState(true);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [timerActive, setTimerActive] = useState(false);
  const [startTime, setStartTime] = useState(0);
  const [showPanorama, setShowPanorama] = useState(false);
  const [showStorySelection, setShowStorySelection] = useState(false);
  const [activeGame, setActiveGame] = useState<string | null>(null);
  const [showAchievements, setShowAchievements] = useState(false);
  const [credits, setCredits] = useState(50);
  const [playerTitle, setPlayerTitle] = useState('Novo Convertido');

  useEffect(() => {
    if (userRank) {
      const score = userRank.totalScore || 0;
      setPlayerTitle(getRankTitle(score));
    }
  }, [userRank]);

  const getRankTitle = (score: number) => {
    if (score <= 100) return 'Novo Convertido';
    if (score <= 300) return 'Discípulo';
    if (score <= 500) return 'Evangelista';
    if (score <= 700) return 'Mestre';
    if (score <= 1000) return 'Profeta';
    if (score <= 1300) return 'Pastor';
    return 'Apóstolo';
  };

  const [showJoinModal, setShowJoinModal] = useState(false);
  const [joinRoomIdInput, setJoinRoomIdInput] = useState('');
  const [searchParams, setSearchParams] = useSearchParams();
  const processedRooms = React.useRef<Set<string>>(new Set());
  const processedCups = React.useRef<Set<string>>(new Set());

  useEffect(() => {
    const urlRoomId = searchParams.get('roomId') || new URLSearchParams(window.location.search).get('roomId');
    const urlCupId = searchParams.get('cupId') || new URLSearchParams(window.location.search).get('cupId');
    if (urlRoomId) {
      setJoinRoomIdInput(urlRoomId);
      setIsBattleMode(true);
      if (user) {
        setShowJoinModal(true);
      }
    } else if (urlCupId) {
      setCupId(urlCupId);
      setIsCupMode(true);
      if (user) {
        joinCup(urlCupId);
      }
    }
  }, [searchParams, user]);

  // Fetch Leaderboard
  useEffect(() => {
    let interval: any;
    const fetchLeaderboards = async () => {
      try {
        const resStats = await fetch('/api/games/leaderboard');
        if (resStats.ok) {
          const entries = await resStats.json();
          setLeaderboard(entries);
          setIsLoadingLeaderboard(false);
          
          if (user) {
            const userEntry = entries.find((e: any) => e.userId === user.id);
            if (userEntry) {
              setUserRank({ ...userEntry, rank: entries.indexOf(userEntry) + 1 });
              setCredits(userEntry.credits ?? 50);
            } else {
              const resUser = await fetch(`/api/games/leaderboard/${user.id}`);
              if (resUser.ok) {
                const uData = await resUser.json();
                if (uData) {
                  setUserRank(uData);
                  setCredits(uData.credits ?? 50);
                }
              }
            }
          }
        }

        const resBattles = await fetch('/api/games/leaderboard?type=battlesWon');
        if (resBattles.ok) {
          const entries = await resBattles.json();
          setBattleLeaderboard(entries);
          setIsLoadingBattleLeaderboard(false);
        }

        const resPanorama = await fetch('/api/games/leaderboard?type=panoramaScore');
        if (resPanorama.ok) {
          const entries = await resPanorama.json();
          const filtered = entries.filter((e: any) => (e.panoramaScore || 0) > 0);
          setPanoramaLeaderboard(filtered.slice(0, 10));
          if (typeof setIsLoadingPanorama === 'function') {
            setIsLoadingPanorama(false);
          } else {
            console.error("setIsLoadingPanorama is not a function");
          }
        } else {
            console.error("Failed to fetch panorama leaderboard. Status:", resPanorama.status);
            if (typeof setIsLoadingPanorama === 'function') setIsLoadingPanorama(false);
        }

      } catch (err: any) {
        console.error("Failed to fetch SQLite leaderboards:", err.message || err);
      }
    };

    fetchLeaderboards();
    interval = setInterval(fetchLeaderboards, 15000);
    return () => clearInterval(interval);
  }, [user]);

  // Fetch Total Users
  useEffect(() => {
    // simplified since we don't have a count endpoint
    setTotalUsers(1);
    return () => {};
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

  // Listen to cup updates
  useEffect(() => {
    if (!cupId) return;
    const cupRef = doc(db, 'quizCups', cupId);
    const unsubscribe = onSnapshot(cupRef, async (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        setCupData(data);
        
        // Handle cup logic here
        if (data.status === 'playing' && user) {
          const currentRound = data.rounds[data.currentRound];
          if (currentRound && currentRound.status === 'playing') {
            // Find user's match
            const myMatch = currentRound.matches.find((m: any) => m.player1.userId === user.id || m.player2.userId === user.id);
            if (myMatch && !isQuizStarted) {
              // Start quiz for this match
              setCurrentQuestions(myMatch.questions);
              setCurrentQuestionIndex(0);
              setScore(0);
              setStartTime(Date.now());
              setIsQuizStarted(true);
            }
          }
        }

        // Handle cup finished - reward winner
        if (data.status === 'finished' && user && data.winnerId === user.id) {
          if (!processedCups.current.has(cupId)) {
            processedCups.current.add(cupId);
            const userRef = doc(db, 'quizLeaderboard', user.id);
            getDoc(userRef).then((userSnap) => {
              if (userSnap.exists()) {
                const lData = userSnap.data() as any;
                // Update SQLite leaderboard
                fetch('/api/games/leaderboard', {
                  method: 'PUT',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({
                    userId: user.id,
                    name: user.name || 'Membro',
                    battlesWon: 5,
                    totalScore: 5
                  })
                }).catch(e => console.error(e));
              }
            });
          }
        }
      }
    });
    return () => unsubscribe();
  }, [cupId, isQuizStarted, user]);

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
          setCurrentQuestionIndex(0);
          setScore(0);
          setSelectedOption(null);
          setIsCorrect(null);
          setTimeLeft(60);
          setTimerActive(true);
          setStartTime(Date.now());
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
            fetch('/api/games/leaderboard', {
              method: 'PUT',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                userId: user.id,
                name: user.name || 'Membro',
                battlesWon: 1,
                totalScore: 1
              })
            }).catch(e => console.error(e));
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

  const createCup = async () => {
    if (!user) return;
    const cupRef = doc(collection(db, 'quizCups'));
    await setDoc(cupRef, {
      creatorId: user.id,
      maxPlayers: cupMaxPlayers,
      players: [{ userId: user.id, name: user.name, avatar: user.photoURL || user.avatar || '', score: 0, isEliminated: false }],
      status: 'waiting',
      currentRound: 0,
      rounds: [],
      createdAt: serverTimestamp()
    });
    setCupId(cupRef.id);
    showToast("Copa criada! Compartilhe o link para os jogadores entrarem.", "success");
  };

  const joinCup = async (id: string) => {
    if (!user) return;
    console.log("Joining cup:", id);
    const cupRef = doc(db, 'quizCups', id);
    try {
      const cupSnap = await getDoc(cupRef);
      if (cupSnap.exists()) {
        const data = cupSnap.data();
        if (data.status !== 'waiting') {
          showToast("Esta copa já começou ou foi finalizada.", "error");
          return;
        }
        if (data.players.length >= data.maxPlayers && !data.players.some((p: any) => p.userId === user.id)) {
          showToast("Esta copa já está cheia.", "error");
          return;
        }
        const players = data.players || [];
        if (!players.some((p: any) => p.userId === user.id)) {
          players.push({ userId: user.id, name: user.name, avatar: user.photoURL || user.avatar || '', score: 0, isEliminated: false });
          await updateDoc(cupRef, { players });
        }
        setCupId(id);
        setIsCupMode(true);
      } else {
        showToast("Copa não encontrada.", "error");
      }
    } catch (error) {
      console.error("Error joining cup:", error);
      showToast("Erro ao entrar na copa.", "error");
    }
  };

  const startCup = async () => {
    if (!cupId || !cupData) return;
    if (cupData.players.length !== cupData.maxPlayers) {
      showToast(`A copa precisa de exatamente ${cupData.maxPlayers} jogadores para iniciar.`, "error");
      return;
    }
    
    // Shuffle players
    const shuffledPlayers = [...cupData.players].sort(() => Math.random() - 0.5);
    
    // Create first round matches
    const matches = [];
    for (let i = 0; i < shuffledPlayers.length; i += 2) {
      matches.push({
        player1: { ...shuffledPlayers[i], score: 0, finished: false },
        player2: { ...shuffledPlayers[i+1], score: 0, finished: false },
        winnerId: null,
        questions: shuffleQuestions() // 10 questions per match
      });
    }
    
    const cupRef = doc(db, 'quizCups', cupId);
    await updateDoc(cupRef, {
      status: 'playing',
      currentRound: 0,
      rounds: [{ matches, status: 'playing' }]
    });
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

    // Sync score if in battle mode or cup mode
    if (isBattleMode && roomId && user) {
      const roomRef = doc(db, 'quizRooms', roomId);
      const players = roomData.players.map((p: any) => 
        p.userId === user.id ? { ...p, score: (p.score || 0) + pointsEarned } : p
      );
      await updateDoc(roomRef, { players });
    } else if (isCupMode && cupId && user && cupData) {
      const cupRef = doc(db, 'quizCups', cupId);
      const currentRound = cupData.rounds[cupData.currentRound];
      const matches = currentRound.matches.map((m: any) => {
        if (m.player1.userId === user.id) return { ...m, player1: { ...m.player1, score: (m.player1.score || 0) + pointsEarned } };
        if (m.player2.userId === user.id) return { ...m, player2: { ...m.player2, score: (m.player2.score || 0) + pointsEarned } };
        return m;
      });
      const rounds = [...cupData.rounds];
      rounds[cupData.currentRound] = { ...currentRound, matches };
      await updateDoc(cupRef, { rounds });
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
    } else if (isCupMode && cupId && user && cupData) {
      const cupRef = doc(db, 'quizCups', cupId);
      const currentRound = cupData.rounds[cupData.currentRound];
      let allFinished = true;
      const matches = currentRound.matches.map((m: any) => {
        if (m.player1.userId === user.id) {
          m.player1.finished = true;
        }
        if (m.player2.userId === user.id) {
          m.player2.finished = true;
        }
        if (!m.player1.finished || !m.player2.finished) {
          allFinished = false;
        } else if (!m.winnerId) {
          // Both finished, determine winner
          m.winnerId = m.player1.score > m.player2.score ? m.player1.userId : m.player2.userId;
          // If tie, random winner for now
          if (m.player1.score === m.player2.score) {
            m.winnerId = Math.random() > 0.5 ? m.player1.userId : m.player2.userId;
          }
        }
        return m;
      });
      
      const rounds = [...cupData.rounds];
      rounds[cupData.currentRound] = { ...currentRound, matches };
      
      if (allFinished) {
        rounds[cupData.currentRound].status = 'finished';
        
        // Prepare next round
        const winners = matches.map((m: any) => cupData.players.find((p: any) => p.userId === m.winnerId));
        
        if (winners.length === 1) {
          // Cup finished
          await updateDoc(cupRef, { 
            rounds, 
            status: 'finished', 
            winnerId: winners[0].userId 
          });
          
          // Add 5 points to the winner's Quiz ranking
          if (winners[0].userId === user.id && !processedCups.current.has(cupId)) {
            processedCups.current.add(cupId);
            fetch('/api/games/leaderboard', {
              method: 'PUT',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                userId: user.id,
                name: user.name || 'Membro',
                battlesWon: 5,
                totalScore: 5
              })
            }).catch(e => console.error(e));
          }
        } else {
          // Next round
          const shuffledWinners = [...winners].sort(() => Math.random() - 0.5);
          const nextMatches = [];
          for (let i = 0; i < shuffledWinners.length; i += 2) {
            nextMatches.push({
              player1: { ...shuffledWinners[i], score: 0, finished: false },
              player2: { ...shuffledWinners[i+1], score: 0, finished: false },
              winnerId: null,
              questions: shuffleQuestions().slice(0, 5)
            });
          }
          rounds.push({ matches: nextMatches, status: 'playing' });
          await updateDoc(cupRef, { rounds, currentRound: cupData.currentRound + 1 });
        }
      } else {
        await updateDoc(cupRef, { rounds });
      }
    }

    if (user) {
      await addPoints(5, 'quiz_finish');
      try {
        await fetch('/api/games/leaderboard', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId: user.id,
            name: user.name || 'Membro',
            totalScore: finalScore
          })
        });
      } catch(e) { console.error(e); }
    }
  };

  const handleOtherGameFinish = async (gameName: string, gameScore: number) => {
    setActiveGame(null);
    if (!user) return;
    
    await addPoints(5, `game_${gameName}`);
    
    // Calculate panorama specific score
    let panoramaIncrement = 0;
    if (gameName === 'panorama') panoramaIncrement = gameScore;
    
    try {
      await fetch('/api/games/leaderboard', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          name: user.name || 'Membro',
          totalScore: gameScore, // It will be incremented
          panoramaScore: panoramaIncrement
        })
      });
      showToast(`Pontuação salva no ranking geral!`, 'success');
    } catch (e) {
      console.error(e);
      showToast(`Erro ao salvar pontuação.`, 'error');
    }
  };

  const handleSpendCredits = async (amount: number) => {
    if (credits >= amount) {
      const newCredits = credits - amount;
      setCredits(newCredits);
      if (user) {
        const userRef = doc(db, 'quizLeaderboard', user.id);
        await updateDoc(userRef, { credits: newCredits });
      }
      return true;
    }
    return false;
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
      {showPanorama && (
        <PanoramaBiblico onClose={() => setShowPanorama(false)} />
      )}
      
      {showStorySelection && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-[100] flex items-center justify-center p-4">
          <motion.div 
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            className="bg-white dark:bg-zinc-900 rounded-[3rem] p-8 w-full max-w-4xl shadow-2xl border border-stone-200 dark:border-zinc-800 max-h-[90vh] overflow-y-auto"
          >
            <div className="flex justify-between items-center mb-8">
              <div>
                <h2 className="text-3xl font-display font-black text-stone-900 dark:text-white tracking-tight">Jogo das Histórias</h2>
                <p className="text-stone-500 dark:text-zinc-400">Escolha uma jornada para começar</p>
              </div>
              <button 
                onClick={() => setShowStorySelection(false)}
                className="p-3 hover:bg-stone-100 dark:hover:bg-zinc-800 rounded-full transition-colors"
              >
                <XCircle size={32} className="text-stone-400" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[
                { id: 'son-of-man', title: 'O Filho do Homem', desc: 'A vida de Jesus Cristo', img: 'https://images.unsplash.com/photo-1501705388883-4ed8a543392c?auto=format&fit=crop&q=80&w=800&h=600' },
                { id: 'david', title: 'Um Homem Segundo o Coração de Deus', desc: 'A jornada de Davi, do curral ao trono', img: 'https://images.unsplash.com/photo-1511216335778-7cb8f49fa7a3?auto=format&fit=crop&q=80&w=800&h=600' },
                { id: 'abraham', title: 'O Pai da Fé', desc: 'A história de Abraão e as promessas de Deus', img: 'https://images.unsplash.com/photo-1506318137071-a8e063b4975d?auto=format&fit=crop&q=80&w=800&h=600' },
                { id: 'moses', title: 'O Homem Mais Manso da Terra', desc: 'Moisés e a libertação do Egito', img: 'https://images.unsplash.com/photo-1508672019048-805c876b67e2?auto=format&fit=crop&q=80&w=800&h=600' },
                { id: 'paul', title: 'O Apóstolo dos Gentios', desc: 'A transformação e viagens de Paulo', img: 'https://images.unsplash.com/photo-1447069387593-a5de0862481e?auto=format&fit=crop&q=80&w=800&h=600' }
              ].map((story) => (
                <button
                  key={story.id}
                  onClick={() => navigate(`/greatest-story?id=${story.id}`)}
                  className="group relative h-48 rounded-[2rem] overflow-hidden shadow-lg hover:scale-[1.02] transition-all"
                >
                  <img src={story.img} alt={story.title} className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" referrerPolicy="no-referrer" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent p-6 flex flex-col justify-end text-left">
                    <h4 className="text-xl font-black text-white mb-1">{story.title}</h4>
                    <p className="text-white/70 text-sm line-clamp-1">{story.desc}</p>
                  </div>
                </button>
              ))}
            </div>
          </motion.div>
        </div>
      )}
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

      <div className={cn("mx-auto transition-all duration-500", activeGame !== null ? "max-w-full px-0" : "max-w-4xl px-4")}>
        
        {/* Header / User Profile */}
        {user && activeGame === null && (
          <div className="bg-white dark:bg-zinc-900 rounded-3xl p-6 shadow-xl border border-stone-200 dark:border-zinc-800 mb-8 flex flex-col md:flex-row items-center gap-6">
            <div className="relative">
              <AvatarManager size="w-24 h-24" />
              <div className="absolute -bottom-2 -right-2 bg-amber-500 text-white p-2 rounded-xl shadow-lg border-2 border-white dark:border-zinc-900">
                <Crown size={16} />
              </div>
            </div>
            <div className="flex-1 text-center md:text-left">
              <div className="flex flex-col md:flex-row md:items-center gap-2 mb-2">
                <h1 className="text-3xl font-display font-bold text-stone-800 dark:text-stone-200">{user.name || 'Usuário'}</h1>
                <span className="inline-block px-3 py-1 bg-amber-100 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400 rounded-full text-[10px] font-black uppercase tracking-widest w-fit mx-auto md:mx-0">
                  {playerTitle}
                </span>
              </div>
              <p className="text-stone-500 mb-4">Classificação: #{userRank?.rank || '?'}</p>
              <div className="flex flex-wrap justify-center md:justify-start gap-4">
                <div className="bg-emerald-50 dark:bg-emerald-900/20 px-4 py-2 rounded-xl border border-emerald-100 dark:border-emerald-800">
                  <p className="text-xs text-emerald-600 font-bold uppercase">Pontos Totais</p>
                  <p className="text-xl font-bold text-emerald-700">{userRank?.totalScore ?? (userRank?.score || 0)}</p>
                </div>
                <div className="bg-blue-50 dark:bg-blue-900/20 px-4 py-2 rounded-xl border border-blue-100 dark:border-blue-800">
                  <p className="text-xs text-blue-600 font-bold uppercase">Vitórias (Batalha)</p>
                  <p className="text-xl font-bold text-blue-700">{userRank?.battlesWon || 0}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeGame === null &&
          <div className="space-y-8">

            {/* Game Menu */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <button onClick={() => setActiveGame('quiz')} className="p-6 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-3xl text-white text-left hover:scale-105 transition-transform shadow-lg">
                <Zap size={32} className="mb-4 opacity-80" />
                <h3 className="text-xl font-bold mb-1">Quiz Bíblico</h3>
                <p className="text-emerald-100 text-sm">Teste seus conhecimentos gerais</p>
              </button>
              <button onClick={() => setActiveGame('whoami')} className="p-6 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-3xl text-white text-left hover:scale-105 transition-transform shadow-lg">
                <HelpCircle size={32} className="mb-4 opacity-80" />
                <h3 className="text-xl font-bold mb-1">Quem Sou Eu?</h3>
                <p className="text-blue-100 text-sm">Adivinhe com dicas progressivas</p>
              </button>
              <button onClick={() => setActiveGame('timeline')} className="p-6 bg-gradient-to-br from-purple-500 to-fuchsia-600 rounded-3xl text-white text-left hover:scale-105 transition-transform shadow-lg">
                <Clock size={32} className="mb-4 opacity-80" />
                <h3 className="text-xl font-bold mb-1">Linha do Tempo</h3>
                <p className="text-purple-100 text-sm">Ordene os eventos cronologicamente</p>
              </button>
              <button onClick={() => setActiveGame('crossword')} className="p-6 bg-gradient-to-br from-orange-500 to-red-600 rounded-3xl text-white text-left hover:scale-105 transition-transform shadow-lg">
                <Type size={32} className="mb-4 opacity-80" />
                <h3 className="text-xl font-bold mb-1">Palavras Cruzadas</h3>
                <p className="text-orange-100 text-sm">Desafio de 10 palavras bíblicas</p>
              </button>
              <button onClick={() => setActiveGame('hangman')} className="p-6 bg-gradient-to-br from-stone-700 to-stone-900 rounded-3xl text-white text-left hover:scale-105 transition-transform shadow-lg">
                <UserX size={32} className="mb-4 opacity-80" />
                <h3 className="text-xl font-bold mb-1">Jogo da Forca</h3>
                <p className="text-stone-300 text-sm">Descubra a palavra antes do fim</p>
              </button>
              <button onClick={() => setActiveGame('wordsearch')} className="p-6 bg-gradient-to-br from-emerald-700 to-emerald-900 rounded-3xl text-white text-left hover:scale-105 transition-transform shadow-lg">
                <HelpCircle size={32} className="mb-4 opacity-80" />
                <h3 className="text-xl font-bold mb-1">Caça Palavras</h3>
                <p className="text-emerald-100 text-sm">Encontre verdades bíblicas</p>
              </button>
              <button onClick={() => setActiveGame('cryptogram')} className="p-6 bg-gradient-to-br from-cyan-600 to-blue-800 rounded-3xl text-white text-left hover:scale-105 transition-transform shadow-lg">
                <LockIcon size={32} className="mb-4 opacity-80" />
                <h3 className="text-xl font-bold mb-1">Criptograma</h3>
                <p className="text-cyan-100 text-sm">Decifre frases bíblicas</p>
              </button>
              <button onClick={() => setActiveGame('anagram')} className="p-6 bg-gradient-to-br from-yellow-600 to-amber-800 rounded-3xl text-white text-left hover:scale-105 transition-transform shadow-lg">
                <RotateCcw size={32} className="mb-4 opacity-80" />
                <h3 className="text-xl font-bold mb-1">Anagrama</h3>
                <p className="text-yellow-100 text-sm">Ordene versículos bíblicos</p>
              </button>
              <button onClick={() => setShowPanorama(true)} className="p-6 bg-gradient-to-br from-pink-500 to-rose-600 rounded-3xl text-white text-left hover:scale-105 transition-transform shadow-lg">
                <BookOpen size={32} className="mb-4 opacity-80" />
                <h3 className="text-xl font-bold mb-1">Panorama Bíblico</h3>
                <p className="text-pink-100 text-sm">Visão geral dos livros</p>
              </button>
              <button onClick={() => setActiveGame('riddles')} className="p-6 bg-gradient-to-br from-purple-600 to-indigo-700 rounded-3xl text-white text-left hover:scale-105 transition-transform shadow-lg">
                <HelpCircle size={32} className="mb-4 opacity-80" />
                <h3 className="text-xl font-bold mb-1">Enigmas Bíblicos</h3>
                <p className="text-purple-100 text-sm">Desafio de sabedoria e lógica</p>
              </button>
              <button 
                onClick={() => setShowStorySelection(true)} 
                className="p-6 bg-gradient-to-br from-amber-500 to-orange-700 rounded-3xl text-white text-left hover:scale-105 transition-transform shadow-lg border-4 border-amber-300/30"
              >
                <Sparkles size={32} className="mb-4 opacity-80" />
                <h3 className="text-xl font-bold mb-1">Jogo das Histórias</h3>
                <p className="text-amber-100 text-sm">Jornada Imersiva e Narrada</p>
              </button>
            </div>

            {/* General Leaderboard */}
            <div className="bg-white dark:bg-zinc-900 rounded-3xl p-6 shadow-xl border border-stone-200 dark:border-zinc-800">
              <div className="flex items-center gap-3 mb-6">
                <Crown className="text-amber-500" size={24} />
                <h2 className="text-xl font-bold text-stone-800 dark:text-stone-200">Ranking Geral dos Jogos</h2>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="text-xs text-stone-500 uppercase bg-stone-50 dark:bg-zinc-800">
                    <tr>
                      <th className="px-3 py-2">#</th>
                      <th className="px-3 py-2">Nome</th>
                      <th className="px-3 py-2 text-center">Quiz</th>
                      <th className="px-3 py-2 text-center">Filho do Homem</th>
                      <th className="px-3 py-2 text-center">Davi</th>
                      <th className="px-3 py-2 text-center">Abraão</th>
                      <th className="px-3 py-2 text-center">Moisés</th>
                      <th className="px-3 py-2 text-center">Paulo</th>
                      <th className="px-3 py-2 text-center">Panorama</th>
                      <th className="px-3 py-2 text-center">Quem Sou Eu</th>
                      <th className="px-3 py-2 text-center">Linha do Tempo</th>
                      <th className="px-3 py-2 text-center">Palavras Cruzadas</th>
                      <th className="px-3 py-2 text-center">Forca</th>
                      <th className="px-3 py-2 text-center">Caça Palavras</th>
                      <th className="px-3 py-2 text-center">Criptograma</th>
                      <th className="px-3 py-2 text-center">Anagrama</th>
                      <th className="px-3 py-2 text-center">Enigmas</th>
                      <th className="px-3 py-2 text-center">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {leaderboard.map((entry, index) => {
                      const total = entry.totalScore ?? (
                        (entry.score || 0) + 
                        (entry.sonOfManScore || 0) + 
                        (entry.davidScore || 0) + 
                        (entry.abrahamScore || 0) + 
                        (entry.mosesScore || 0) + 
                        (entry.paulScore || 0) + 
                        (entry.panoramaScore || 0) + 
                        (entry.whoAmIScore || 0) + 
                        (entry.timelineScore || 0) + 
                        (entry.crosswordScore || 0) + 
                        (entry.hangmanScore || 0) +
                        ((entry as any).wordSearchScore || 0) +
                        ((entry as any).cryptogramScore || 0) +
                        ((entry as any).anagramScore || 0) +
                        ((entry as any).riddlesScore || 0)
                      );
                      return (
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
                            <div>
                              <span className="font-medium text-stone-700 dark:text-stone-300 truncate max-w-[150px] block">{entry.name}</span>
                              <span className="text-xs text-stone-400 block">{getRankTitle(total)}</span>
                            </div>
                          </td>
                          <td className="px-3 py-3 text-center text-stone-600 dark:text-stone-400">{entry.score || 0}</td>
                          <td className="px-3 py-3 text-center text-stone-600 dark:text-stone-400">{entry.sonOfManScore || 0}</td>
                          <td className="px-3 py-3 text-center text-stone-600 dark:text-stone-400">{entry.davidScore || 0}</td>
                          <td className="px-3 py-3 text-center text-stone-600 dark:text-stone-400">{entry.abrahamScore || 0}</td>
                          <td className="px-3 py-3 text-center text-stone-600 dark:text-stone-400">{entry.mosesScore || 0}</td>
                          <td className="px-3 py-3 text-center text-stone-600 dark:text-stone-400">{entry.paulScore || 0}</td>
                          <td className="px-3 py-3 text-center text-stone-600 dark:text-stone-400">{entry.panoramaScore || 0}</td>
                          <td className="px-3 py-3 text-center text-stone-600 dark:text-stone-400">{entry.whoAmIScore || 0}</td>
                          <td className="px-3 py-3 text-center text-stone-600 dark:text-stone-400">{entry.timelineScore || 0}</td>
                          <td className="px-3 py-3 text-center text-stone-600 dark:text-stone-400">{entry.crosswordScore || 0}</td>
                          <td className="px-3 py-3 text-center text-stone-600 dark:text-stone-400">{entry.hangmanScore || 0}</td>
                          <td className="px-3 py-3 text-center text-stone-600 dark:text-stone-400">{(entry as any).wordSearchScore || 0}</td>
                          <td className="px-3 py-3 text-center text-stone-600 dark:text-stone-400">{(entry as any).cryptogramScore || 0}</td>
                          <td className="px-3 py-3 text-center text-stone-600 dark:text-stone-400">{(entry as any).anagramScore || 0}</td>
                          <td className="px-3 py-3 text-center text-stone-600 dark:text-stone-400">{(entry as any).riddlesScore || 0}</td>
                          <td className="px-3 py-3 text-center font-bold text-emerald-600 dark:text-emerald-400">{total}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            {/* Scoring Rules Moved to Bottom */}
            <div className="bg-white dark:bg-zinc-900 rounded-3xl p-8 shadow-xl border border-stone-200 dark:border-zinc-800">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-emerald-100 dark:bg-emerald-900/20 text-emerald-600 rounded-xl">
                    <Target size={20} />
                  </div>
                  <h2 className="text-xl font-bold text-stone-800 dark:text-stone-100">Regras de Pontuação</h2>
                </div>
              </div>

              <div className="space-y-4">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-stone-500">
                      <th className="text-left py-2">Título</th>
                      <th className="text-right py-2">Intervalo de Pontos</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-100 dark:divide-zinc-800">
                    <tr><td className="py-2 text-stone-700 dark:text-stone-300">Novo Convertido</td><td className="py-2 text-right text-stone-700 dark:text-stone-300">Até 100</td></tr>
                    <tr><td className="py-2 text-stone-700 dark:text-stone-300">Discípulo</td><td className="py-2 text-right text-stone-700 dark:text-stone-300">101 a 300</td></tr>
                    <tr><td className="py-2 text-stone-700 dark:text-stone-300">Evangelista</td><td className="py-2 text-right text-stone-700 dark:text-stone-300">301 a 500</td></tr>
                    <tr><td className="py-2 text-stone-700 dark:text-stone-300">Mestre</td><td className="py-2 text-right text-stone-700 dark:text-stone-300">501 a 700</td></tr>
                    <tr><td className="py-2 text-stone-700 dark:text-stone-300">Profeta</td><td className="py-2 text-right text-stone-700 dark:text-stone-300">701 a 1000</td></tr>
                    <tr><td className="py-2 text-stone-700 dark:text-stone-300">Pastor</td><td className="py-2 text-right text-stone-700 dark:text-stone-300">1001 a 1300</td></tr>
                    <tr><td className="py-2 text-stone-700 dark:text-stone-300">Apóstolo</td><td className="py-2 text-right text-stone-700 dark:text-stone-300">Acima de 1300</td></tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      }

        {activeGame !== null && (
          <div className="fixed inset-0 z-[60] bg-stone-50 dark:bg-zinc-950 overflow-hidden flex flex-col">
            <div className="bg-white dark:bg-zinc-900 border-b border-stone-200 dark:border-zinc-800 p-4 flex items-center justify-between shadow-sm shrink-0">
              <button 
                onClick={() => setActiveGame(null)}
                className="flex items-center gap-2 px-4 py-2 bg-stone-100 dark:bg-zinc-800 rounded-xl text-stone-600 dark:text-stone-400 hover:bg-stone-200 dark:hover:bg-zinc-700 transition-all font-black text-[10px] uppercase tracking-widest"
              >
                <RotateCcw size={14} />
                Sair
              </button>
              <div className="text-center">
                <h2 className="text-sm font-black text-stone-800 dark:text-white uppercase tracking-tight">
                  {activeGame === 'whoami' && 'Quem Sou Eu?'}
                  {activeGame === 'timeline' && 'Linha do Tempo'}
                  {activeGame === 'crossword' && 'Palavras Cruzadas'}
                  {activeGame === 'hangman' && 'Jogo da Forca'}
                  {activeGame === 'wordsearch' && 'Caça Palavras'}
                  {activeGame === 'cryptogram' && 'Criptograma'}
                  {activeGame === 'anagram' && 'Anagrama'}
                  {activeGame === 'riddles' && 'Enigmas Bíblicos'}
                  {activeGame === 'quiz' && 'Quiz Bíblico'}
                </h2>
              </div>
              <div className="w-20" /> {/* Spacer */}
            </div>

            <div className="flex-1 overflow-y-auto p-4 md:p-8">
              <div className="max-w-7xl mx-auto">
                {activeGame === 'whoami' && <WhoAmIGame onFinish={(score) => handleOtherGameFinish('whoami', score)} onClose={() => setActiveGame(null)} />}
                {activeGame === 'timeline' && <TimelineGame onFinish={(score) => handleOtherGameFinish('timeline', score)} onClose={() => setActiveGame(null)} />}
                {activeGame === 'crossword' && <CrosswordGame onFinish={(score) => handleOtherGameFinish('crossword', score)} onClose={() => setActiveGame(null)} />}
                {activeGame === 'hangman' && <HangmanGame onFinish={(score) => handleOtherGameFinish('hangman', score)} onClose={() => setActiveGame(null)} />}
                {activeGame === 'wordsearch' && <WordSearchGame onFinish={(score) => handleOtherGameFinish('wordsearch', score)} onClose={() => setActiveGame(null)} />}
                {activeGame === 'cryptogram' && <CryptogramGame onFinish={(score) => handleOtherGameFinish('cryptogram', score)} onClose={() => setActiveGame(null)} />}
                {activeGame === 'anagram' && <AnagramGame onFinish={(score) => handleOtherGameFinish('anagram', score)} onClose={() => setActiveGame(null)} credits={credits} onSpendCredits={handleSpendCredits} />}
                {activeGame === 'riddles' && <RiddlesGame onFinish={(score) => handleOtherGameFinish('riddles', score)} onClose={() => setActiveGame(null)} />}
                {activeGame === 'memory' && <MemoryGame onFinish={(score) => handleOtherGameFinish('memory', score)} />}
                {activeGame === 'quiz' && (
                  <div className="space-y-6">
                    <div className="flex justify-between items-center mb-4">
                      <h2 className="text-2xl font-bold text-stone-800 dark:text-stone-200">Quiz Bíblico</h2>
                    </div>
            
                    {isQuizStarted && (
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
                          <img src={p.avatar} className="w-6 h-6 rounded-full" referrerPolicy="no-referrer" />
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
                      {selectedOption !== null && idx === currentQuestions[currentQuestionIndex].correctAnswer && (
                        <motion.div
                          initial={{ scale: 0, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          transition={{ type: "spring", stiffness: 300, damping: 20 }}
                        >
                          <CheckCircle2 size={20} />
                        </motion.div>
                      )}
                      {selectedOption === idx && idx !== currentQuestions[currentQuestionIndex].correctAnswer && (
                        <motion.div
                          initial={{ scale: 0, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          transition={{ type: "spring", stiffness: 300, damping: 20 }}
                        >
                          <XCircle size={20} />
                        </motion.div>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}
            {isQuizFinished && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-white dark:bg-zinc-900 rounded-3xl p-8 shadow-xl border border-stone-200 dark:border-zinc-800 text-center"
                id="quiz-result-card"
              >
                {isBattleMode && roomData && (
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
                              <img src={p.avatar} alt={p.name} className="w-10 h-10 rounded-full" referrerPolicy="no-referrer" />
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
                )}

                {isCupMode && cupData && (
                  <div className="py-12">
                    <Loader2 className="w-12 h-12 text-emerald-500 animate-spin mx-auto mb-4" />
                    <h2 className="text-2xl font-bold text-stone-800 dark:text-stone-200 mb-2">Aguardando Fim da Rodada</h2>
                    <p className="text-stone-600 dark:text-stone-400 mb-6">Sua pontuação: {score}</p>
                    <button
                      onClick={() => {
                        setIsQuizFinished(false);
                        setIsQuizStarted(false);
                      }}
                      className="w-full py-4 bg-stone-100 dark:bg-zinc-800 hover:bg-stone-200 dark:hover:bg-zinc-700 text-stone-700 dark:text-stone-300 rounded-2xl font-bold transition-all"
                    >
                      Ver Chaveamento
                    </button>
                  </div>
                )}

                {!isBattleMode && !isCupMode && (
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
            )}
            {isBattleMode && (
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
                            <img src={p.avatar} alt={p.name} className="w-10 h-10 rounded-full" referrerPolicy="no-referrer" />
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
            )}
            {isCupMode && (
              <div className="bg-white dark:bg-zinc-900 rounded-3xl p-8 shadow-xl border border-stone-200 dark:border-zinc-800 text-center">
                {cupId ? (
                  <>
                    <h2 className="text-2xl font-bold mb-2 text-stone-800 dark:text-stone-200">Copa Quiz</h2>
                    <p className="text-stone-500 mb-6 font-mono bg-stone-100 dark:bg-zinc-800 py-2 px-4 rounded-lg inline-block">ID: {cupId}</p>
                    
                    {cupData?.status === 'finished' ? (
                      <div className="mb-8">
                        <Trophy size={64} className="mx-auto text-amber-500 mb-4" />
                        <h3 className="text-3xl font-bold text-emerald-600 mb-2">Copa Finalizada!</h3>
                        <p className="text-xl font-medium text-stone-700 dark:text-stone-300">
                          Vencedor: {cupData.players.find((p: any) => p.userId === cupData.winnerId)?.name} 🎉
                        </p>
                        {cupData.winnerId === user?.id ? (
                          <p className="mt-4 text-emerald-600 font-bold">Parabéns! Você ganhou a copa e +5 pontos no ranking!</p>
                        ) : (
                          <p className="mt-4 text-stone-500">Não foi dessa vez. Continue tentando!</p>
                        )}
                        <button
                          onClick={() => {
                            setIsCupMode(false);
                            setCupId(null);
                            setCupData(null);
                          }}
                          className="mt-8 w-full py-4 bg-stone-100 dark:bg-zinc-800 hover:bg-stone-200 dark:hover:bg-zinc-700 text-stone-700 dark:text-stone-300 rounded-2xl font-bold transition-all"
                        >
                          Voltar ao Menu
                        </button>
                      </div>
                    ) : cupData?.status === 'playing' ? (
                      <div className="mb-8 text-left">
                        <h3 className="font-bold text-stone-700 dark:text-stone-300 mb-4">Fase Atual: Rodada {cupData.currentRound + 1}</h3>
                        <div className="space-y-4">
                          {cupData.rounds[cupData.currentRound]?.matches.map((match: any, index: number) => (
                            <div key={index} className="p-4 bg-stone-50 dark:bg-zinc-800/50 rounded-xl border border-stone-200 dark:border-zinc-700">
                              <div className="flex justify-between items-center mb-2">
                                <span className="font-medium text-stone-800 dark:text-stone-200">{match.player1.name}</span>
                                <span className="font-bold text-emerald-600">{match.player1.score}</span>
                              </div>
                              <div className="text-center text-xs text-stone-400 font-bold mb-2">VS</div>
                              <div className="flex justify-between items-center">
                                <span className="font-medium text-stone-800 dark:text-stone-200">{match.player2.name}</span>
                                <span className="font-bold text-emerald-600">{match.player2.score}</span>
                              </div>
                              {match.winnerId && (
                                <div className="mt-3 pt-3 border-t border-stone-200 dark:border-zinc-700 text-center text-sm font-bold text-emerald-600">
                                  Vencedor: {match.winnerId === match.player1.userId ? match.player1.name : match.player2.name}
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                        {cupData.rounds[cupData.currentRound]?.status === 'finished' && cupData.creatorId === user?.id && (
                          <button
                            onClick={startCup} // This will trigger next round logic in startCup? No, next round is automatic in finishQuiz.
                            className="mt-6 w-full py-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl font-bold transition-all"
                          >
                            Aguardando próxima rodada...
                          </button>
                        )}
                      </div>
                    ) : (
                      <>
                        <div className="mb-8 text-left">
                          <h3 className="font-bold text-stone-700 dark:text-stone-300 mb-4">Jogadores ({cupData?.players?.length}/{cupData?.maxPlayers}):</h3>
                          <div className="space-y-3">
                            {cupData?.players?.map((p: any, index: number) => (
                              <div key={`${p.userId}-${index}`} className="flex items-center gap-3 p-3 bg-stone-50 dark:bg-zinc-800/50 rounded-xl">
                                <img src={p.avatar} alt={p.name} className="w-10 h-10 rounded-full" referrerPolicy="no-referrer" />
                                <span className="font-medium text-stone-800 dark:text-stone-200">{p.name}</span>
                                {p.userId === cupData.creatorId && (
                                  <span className="ml-auto text-xs bg-emerald-100 text-emerald-700 px-2 py-1 rounded-full font-bold">Criador</span>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>

                        <div className="space-y-4">
                          {cupData?.creatorId === user?.id ? (
                            <button
                              onClick={startCup}
                              disabled={cupData?.players?.length !== cupData?.maxPlayers}
                              className="w-full py-4 bg-amber-500 hover:bg-amber-600 disabled:bg-stone-300 disabled:cursor-not-allowed text-white rounded-2xl font-bold text-lg shadow-lg flex items-center justify-center gap-2 transition-all"
                            >
                              <Trophy size={24} /> {cupData?.players?.length !== cupData?.maxPlayers ? `Aguardando ${cupData?.maxPlayers} jogadores...` : 'Iniciar Copa!'}
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
                              const url = `${baseUrl}/?cupId=${cupId}&v=${cacheBuster}#/quiz`;
                              const text = `🏆 Desafio você para a Copa Quiz!\n\nLink do App: ${baseUrl}/#/quiz\nID da Copa: ${cupId}\n\nOu clique no link direto abaixo para entrar na copa:`;
                              window.open(`https://wa.me/?text=${encodeURIComponent(text + '\n\n' + url)}`, '_blank');
                            }}
                            className="w-full py-4 bg-stone-100 dark:bg-zinc-800 hover:bg-stone-200 dark:hover:bg-zinc-700 text-stone-700 dark:text-stone-300 rounded-2xl font-bold flex items-center justify-center gap-2 transition-all"
                          >
                            <UserPlus size={20} /> Convidar via WhatsApp
                          </button>
                        </div>
                      </>
                    )}
                  </>
                ) : (
                  <>
                    <h2 className="text-2xl font-bold mb-6 text-stone-800 dark:text-stone-200">Copa Quiz</h2>
                    {(!user) ? (
                      <div className="space-y-4">
                        <p className="text-stone-600 dark:text-stone-400 mb-8">Faça login para participar da Copa.</p>
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
                          onClick={() => setIsCupMode(false)}
                          className="w-full py-4 text-stone-500 hover:text-stone-700 dark:text-stone-400 dark:hover:text-stone-200"
                        >
                          Voltar
                        </button>
                      </div>
                    ) : (
                      <>
                        <p className="text-stone-600 dark:text-stone-400 mb-8">Crie ou entre em uma Copa.</p>
                        <div className="space-y-4">
                          <div className="mb-4">
                            <label className="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-2">Número de Jogadores</label>
                            <select 
                              value={cupMaxPlayers}
                              onChange={(e) => setCupMaxPlayers(Number(e.target.value))}
                              className="w-full p-3 rounded-xl border border-stone-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-stone-800 dark:text-stone-200"
                            >
                              <option value={4}>4 Jogadores</option>
                              <option value={8}>8 Jogadores</option>
                              <option value={16}>16 Jogadores</option>
                              <option value={32}>32 Jogadores</option>
                              <option value={64}>64 Jogadores</option>
                              <option value={128}>128 Jogadores</option>
                            </select>
                          </div>
                          <button
                            onClick={createCup}
                            className="w-full py-4 bg-amber-500 hover:bg-amber-600 text-white rounded-2xl font-bold text-lg shadow-lg shadow-amber-500/20 flex items-center justify-center gap-2 transition-all"
                          >
                            Criar Copa
                          </button>
                          <div className="flex gap-2">
                            <input
                              type="text"
                              placeholder="ID da Copa"
                              value={joinRoomIdInput}
                              onChange={(e) => setJoinRoomIdInput(e.target.value)}
                              className="flex-1 p-4 rounded-2xl border border-stone-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-stone-800 dark:text-stone-200"
                            />
                            <button
                              onClick={() => joinCup(joinRoomIdInput)}
                              className="px-6 py-4 bg-stone-100 dark:bg-zinc-800 text-stone-600 dark:text-stone-400 rounded-2xl font-bold shadow-lg flex items-center justify-center transition-all"
                            >
                              Entrar
                            </button>
                          </div>
                          <button
                            onClick={() => setIsCupMode(false)}
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
            )}

            {!isQuizStarted && !isQuizFinished && !isBattleMode && !isCupMode && (
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
                    <HelpCircle className="text-purple-500 mt-1" size={20} />
                    <div>
                      <p className="font-bold text-sm">Enigmas</p>
                      <p className="text-xs text-stone-500">3 chances: 20, 10 ou 5 pts</p>
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
                <div className="mt-4">
                  <button
                    onClick={() => setIsCupMode(true)}
                    className="w-full py-4 bg-amber-500 hover:bg-amber-600 text-white rounded-2xl font-bold text-lg shadow-lg shadow-amber-500/20 flex items-center justify-center gap-2 transition-all"
                  >
                    <Trophy size={24} /> Copa Quiz
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
        )}

          {activeGame === 'quiz' && isQuizFinished && (
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
                        <th className="px-3 py-2">Outros Jogos</th>
                        <th className="px-3 py-2">Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      {leaderboard.map((entry, index) => {
                        const otherGamesScore = (entry.whoAmIScore || 0) + 
                          (entry.timelineScore || 0) + 
                          (entry.crosswordScore || 0) + 
                          (entry.hangmanScore || 0) + 
                          (entry.wordSearchScore || 0) + 
                          (entry.cryptogramScore || 0) + 
                          (entry.anagramScore || 0) + 
                          (entry.riddlesScore || 0) + 
                          (entry.sonOfManScore || 0) + 
                          (entry.davidScore || 0) + 
                          (entry.abrahamScore || 0) + 
                          (entry.mosesScore || 0) + 
                          (entry.paulScore || 0) +
                          (entry.panoramaScore || 0) +
                          (entry.battlesWon || 0);
                        return (
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
                          <td className="px-3 py-3 text-stone-900 dark:text-stone-100">{otherGamesScore}</td>
                          <td className="px-3 py-3 font-bold text-emerald-600 dark:text-emerald-400">{entry.score + otherGamesScore}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  </div>
  )}
    </div>
  </div>
  );
};



export default GamesPage;
