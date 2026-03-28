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
  Gift
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../components/Toast';
import { db } from '../lib/firebase';
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
  updateDoc
} from 'firebase/firestore';
import { cn } from '../types';
import html2canvas from 'html2canvas';

interface Question {
  id: number;
  text: string;
  options: string[];
  correctAnswer: number;
  difficulty: 'easy' | 'medium' | 'hard' | 'challenge';
  testament: 'old' | 'new';
}

interface LeaderboardEntry {
  userId: string;
  name: string;
  avatar: string;
  score: number;
  lastScore: number;
  trend: 'up' | 'down' | 'same';
  rank?: number;
}

const QUESTIONS: Question[] = [
  {
    id: 1,
    text: "Quem foi o primeiro homem criado por Deus?",
    options: ["Noé", "Abraão", "Adão", "Moisés"],
    correctAnswer: 2,
    difficulty: 'easy',
    testament: 'old'
  },
  {
    id: 2,
    text: "Em qual cidade Jesus nasceu?",
    options: ["Nazaré", "Jerusalém", "Belém", "Jericó"],
    correctAnswer: 2,
    difficulty: 'easy',
    testament: 'new'
  },
  {
    id: 3,
    text: "Quantos dias e noites choveu durante o Dilúvio?",
    options: ["7 dias", "40 dias", "100 dias", "12 dias"],
    correctAnswer: 1,
    difficulty: 'easy',
    testament: 'old'
  },
  {
    id: 4,
    text: "Quem traiu Jesus por 30 moedas de prata?",
    options: ["Pedro", "João", "Judas Iscariotes", "Tomé"],
    correctAnswer: 2,
    difficulty: 'medium',
    testament: 'new'
  },
  {
    id: 5,
    text: "Qual era a profissão de Davi antes de ser rei?",
    options: ["Pescador", "Pastor de ovelhas", "Carpinteiro", "Soldado"],
    correctAnswer: 1,
    difficulty: 'medium',
    testament: 'old'
  },
  {
    id: 6,
    text: "Qual apóstolo escreveu a maioria das epístolas no Novo Testamento?",
    options: ["Pedro", "João", "Paulo", "Tiago"],
    correctAnswer: 2,
    difficulty: 'medium',
    testament: 'new'
  },
  {
    id: 7,
    text: "Quem foi o sucessor de Moisés na liderança de Israel?",
    options: ["Arão", "Calebe", "Josué", "Gideão"],
    correctAnswer: 2,
    difficulty: 'hard',
    testament: 'old'
  },
  {
    id: 8,
    text: "Qual é o livro mais curto do Novo Testamento?",
    options: ["Judas", "2 João", "3 João", "Filemom"],
    correctAnswer: 2,
    difficulty: 'hard',
    testament: 'new'
  },
  {
    id: 9,
    text: "Qual profeta foi engolido por um grande peixe?",
    options: ["Elias", "Eliseu", "Jonas", "Isaías"],
    correctAnswer: 2,
    difficulty: 'hard',
    testament: 'old'
  },
  {
    id: 10,
    text: "No Apocalipse, qual é o número das tribos de Israel seladas?",
    options: ["12.000", "144.000", "7.000", "10.000"],
    correctAnswer: 1,
    difficulty: 'challenge',
    testament: 'new'
  },
  {
    id: 11,
    text: "Qual era o nome da esposa de Abraão?",
    options: ["Rebeca", "Raquel", "Sara", "Lia"],
    correctAnswer: 2,
    difficulty: 'easy',
    testament: 'old'
  },
  {
    id: 12,
    text: "Quem foi o apóstolo que negou Jesus três vezes?",
    options: ["João", "Tiago", "Pedro", "André"],
    correctAnswer: 2,
    difficulty: 'easy',
    testament: 'new'
  },
  {
    id: 13,
    text: "Qual foi a primeira praga do Egito?",
    options: ["Rãs", "Piolhos", "Sangue no rio", "Gafanhotos"],
    correctAnswer: 2,
    difficulty: 'medium',
    testament: 'old'
  },
  {
    id: 14,
    text: "Quem subiu ao céu em um redemoinho com um carro de fogo?",
    options: ["Elias", "Eliseu", "Enoque", "Moisés"],
    correctAnswer: 0,
    difficulty: 'medium',
    testament: 'old'
  },
  {
    id: 15,
    text: "Qual é o 'Fruto do Espírito' mencionado em Gálatas?",
    options: ["Amor, alegria, paz...", "Fé, esperança, caridade...", "Ouro, prata, pedras preciosas...", "Sabedoria, entendimento, conselho..."],
    correctAnswer: 0,
    difficulty: 'medium',
    testament: 'new'
  },
  {
    id: 16,
    text: "Quem foi o homem mais velho mencionado na Bíblia?",
    options: ["Enoque", "Matusalém", "Noé", "Sete"],
    correctAnswer: 1,
    difficulty: 'hard',
    testament: 'old'
  },
  {
    id: 17,
    text: "Em qual ilha João estava quando recebeu a revelação do Apocalipse?",
    options: ["Creta", "Chipre", "Patmos", "Malta"],
    correctAnswer: 2,
    difficulty: 'hard',
    testament: 'new'
  },
  {
    id: 18,
    text: "Qual era o nome do gigante que Davi derrotou?",
    options: ["Golias", "Og", "Sif", "Ibi-Benobe"],
    correctAnswer: 0,
    difficulty: 'easy',
    testament: 'old'
  },
  {
    id: 19,
    text: "Quem foi a mulher que ungiu os pés de Jesus com perfume caro?",
    options: ["Marta", "Maria Madalena", "Maria, irmã de Lázaro", "Joana"],
    correctAnswer: 2,
    difficulty: 'medium',
    testament: 'new'
  },
  {
    id: 20,
    text: "Qual o nome do monte onde Moisés recebeu os Dez Mandamentos?",
    options: ["Monte Nebo", "Monte Carmelo", "Monte Sinai", "Monte das Oliveiras"],
    correctAnswer: 2,
    difficulty: 'easy',
    testament: 'old'
  },
  {
    id: 21,
    text: "Qual foi o primeiro milagre de Jesus?",
    options: ["Cura de um cego", "Multiplicação dos pães", "Transformação de água em vinho", "Caminhar sobre as águas"],
    correctAnswer: 2,
    difficulty: 'easy',
    testament: 'new'
  },
  {
    id: 22,
    text: "Quem foi o profeta que desafiou os profetas de Baal no Monte Carmelo?",
    options: ["Eliseu", "Elias", "Isaías", "Jeremias"],
    correctAnswer: 1,
    difficulty: 'medium',
    testament: 'old'
  },
  {
    id: 23,
    text: "Qual era o nome do jardim onde Jesus orou antes de ser preso?",
    options: ["Jardim do Éden", "Jardim de Getsêmani", "Jardim de Jericó", "Jardim de Sião"],
    correctAnswer: 1,
    difficulty: 'easy',
    testament: 'new'
  },
  {
    id: 24,
    text: "Quem foi a rainha que visitou Salomão para testar sua sabedoria?",
    options: ["Rainha de Sabá", "Rainha Ester", "Rainha Jezabel", "Rainha Vasti"],
    correctAnswer: 0,
    difficulty: 'medium',
    testament: 'old'
  },
  {
    id: 25,
    text: "Qual o nome do mar que Moisés abriu para o povo de Israel passar?",
    options: ["Mar Morto", "Mar da Galileia", "Mar Vermelho", "Mar Mediterrâneo"],
    correctAnswer: 2,
    difficulty: 'easy',
    testament: 'old'
  },
  {
    id: 26,
    text: "Quem foi o autor do livro de Atos dos Apóstolos?",
    options: ["Pedro", "Paulo", "Lucas", "João"],
    correctAnswer: 2,
    difficulty: 'medium',
    testament: 'new'
  },
  {
    id: 27,
    text: "Qual o nome do filho de Abraão com a serva Agar?",
    options: ["Isaque", "Ismael", "Jacó", "Esaú"],
    correctAnswer: 1,
    difficulty: 'medium',
    testament: 'old'
  },
  {
    id: 28,
    text: "Quem foi o rei que mandou jogar Daniel na cova dos leões?",
    options: ["Nabucodonosor", "Belsazar", "Dário", "Ciro"],
    correctAnswer: 2,
    difficulty: 'hard',
    testament: 'old'
  },
  {
    id: 29,
    text: "Qual o nome do anjo que anunciou o nascimento de Jesus a Maria?",
    options: ["Miguel", "Rafael", "Gabriel", "Uriel"],
    correctAnswer: 2,
    difficulty: 'easy',
    testament: 'new'
  },
  {
    id: 30,
    text: "Quantos discípulos Jesus escolheu inicialmente?",
    options: ["7", "10", "12", "70"],
    correctAnswer: 2,
    difficulty: 'easy',
    testament: 'new'
  }
];

const QuizPage: React.FC = () => {
  const { user } = useAuth();
  const { showToast } = useToast();
  
  const [isQuizStarted, setIsQuizStarted] = useState(false);
  const [currentQuestions, setCurrentQuestions] = useState<Question[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(60);
  const [isQuizFinished, setIsQuizFinished] = useState(false);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [userRank, setUserRank] = useState<LeaderboardEntry | null>(null);
  const [isLoadingLeaderboard, setIsLoadingLeaderboard] = useState(true);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [timerActive, setTimerActive] = useState(false);
  const [startTime, setStartTime] = useState(0);

  // Fetch Leaderboard
  useEffect(() => {
    const q = query(collection(db, 'quizLeaderboard'), orderBy('score', 'desc'), limit(10));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const entries = snapshot.docs.map(doc => ({
        ...doc.data(),
        userId: doc.id
      })) as LeaderboardEntry[];
      setLeaderboard(entries);
      setIsLoadingLeaderboard(false);

      if (user) {
        const userEntry = entries.find(e => e.userId === user.id);
        if (userEntry) {
          setUserRank({ ...userEntry, rank: entries.indexOf(userEntry) + 1 });
        } else {
          // Fetch user rank if not in top 10
          getDoc(doc(db, 'quizLeaderboard', user.id)).then(docSnap => {
            if (docSnap.exists()) {
              setUserRank(docSnap.data() as LeaderboardEntry);
            }
          });
        }
      }
    });

    return () => unsubscribe();
  }, [user]);

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

  const shuffleQuestions = () => {
    const shuffled = [...QUESTIONS].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, 10);
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
    if (isRight) {
      const timeTaken = (Date.now() - startTime) / 1000;
      // 1-5s = 10, 6-10s = 9, ..., >60s = 1
      pointsEarned = Math.max(1, 11 - Math.ceil(timeTaken / 5));
      setScore(prev => prev + pointsEarned);
      showToast(`Correto! +${pointsEarned} pontos`, "success");
    } else {
      setScore(prev => Math.max(0, prev - 10));
      showToast("Incorreto! -10 pontos", "error");
    }

    setTimeout(() => {
      if (currentQuestionIndex < currentQuestions.length - 1) {
        setCurrentQuestionIndex(prev => prev + 1);
        nextQuestion();
      } else {
        finishQuiz();
      }
    }, 1500);
  };

  const finishQuiz = async () => {
    setIsQuizFinished(true);
    setIsQuizStarted(false);
    setTimerActive(false);

    if (user) {
      const userRef = doc(db, 'quizLeaderboard', user.id);
      const userSnap = await getDoc(userRef);
      
      let trend: 'up' | 'down' | 'same' = 'same';
      let lastScore = 0;

      if (userSnap.exists()) {
        const data = userSnap.data() as LeaderboardEntry;
        lastScore = data.score;
        if (score > lastScore) trend = 'up';
        else if (score < lastScore) trend = 'down';
      }

      await setDoc(userRef, {
        name: user.name || 'Usuário',
        avatar: user.photoURL || user.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.id}`,
        score: score,
        lastScore: lastScore,
        trend: trend,
        updatedAt: serverTimestamp()
      }, { merge: true });
    }
  };

  const handleShare = async () => {
    const element = document.getElementById('quiz-result-card');
    if (!element) return;

    try {
      const canvas = await html2canvas(element);
      const image = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.href = image;
      link.download = 'meu-resultado-quiz-imersao.png';
      link.click();
      showToast("Resultado pronto para compartilhar!", "success");
    } catch (error) {
      showToast("Erro ao gerar imagem", "error");
    }
  };

  const challengeFriends = () => {
    const text = `Desafio você no Quiz da Imersão Bíblica! Minha pontuação foi ${score}. Consegue bater?`;
    const url = window.location.href;
    window.open(`https://wa.me/?text=${encodeURIComponent(text + ' ' + url)}`, '_blank');
  };

  return (
    <div className="min-h-screen pt-20 pb-12 px-4 bg-stone-50 dark:bg-zinc-950">
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
            
            {!isQuizStarted && !isQuizFinished ? (
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
                  <Play size={24} /> Começar Agora
                </button>
              </motion.div>
            ) : isQuizStarted ? (
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
            ) : (
              <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-white dark:bg-zinc-900 rounded-3xl p-8 shadow-xl border border-stone-200 dark:border-zinc-800 text-center"
                id="quiz-result-card"
              >
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
              <div className="flex items-center gap-3 mb-6">
                <Crown className="text-amber-500" size={24} />
                <h2 className="text-xl font-bold text-stone-800 dark:text-stone-200">Top 10 Mensal</h2>
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
                      <p className="text-sm font-bold text-emerald-600">{userRank?.score || 0}</p>
                      <div className="flex items-center justify-end gap-1">
                        {userRank?.trend === 'up' && <TrendingUp size={12} className="text-emerald-500" />}
                        {userRank?.trend === 'down' && <TrendingDown size={12} className="text-red-500" />}
                        {userRank?.trend === 'same' && <Minus size={12} className="text-stone-400" />}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <div className="space-y-4">
                {isLoadingLeaderboard ? (
                  <div className="flex flex-col items-center justify-center py-12 space-y-4">
                    <Loader2 className="animate-spin text-emerald-600" size={32} />
                    <p className="text-xs text-stone-500 uppercase tracking-widest">Carregando Ranking...</p>
                  </div>
                ) : leaderboard.length > 0 ? (
                  leaderboard.map((entry, index) => (
                    <div 
                      key={entry.userId}
                      className={cn(
                        "flex items-center justify-between p-3 rounded-2xl transition-all",
                        entry.userId === user?.id ? "bg-emerald-50 dark:bg-emerald-900/20 ring-1 ring-emerald-500/30" : "hover:bg-stone-50 dark:hover:bg-zinc-800"
                      )}
                    >
                      <div className="flex items-center gap-3">
                        <span className={cn(
                          "w-6 h-6 flex items-center justify-center rounded-full text-[10px] font-bold",
                          index === 0 ? "bg-amber-100 text-amber-600" :
                          index === 1 ? "bg-stone-200 text-stone-600" :
                          index === 2 ? "bg-orange-100 text-orange-600" : "bg-stone-100 text-stone-500"
                        )}>
                          {index + 1}
                        </span>
                        <img 
                          src={entry.avatar} 
                          alt={entry.name} 
                          className="w-8 h-8 rounded-full"
                          referrerPolicy="no-referrer"
                        />
                        <span className="text-sm font-medium text-stone-700 dark:text-stone-300 truncate max-w-[80px]">
                          {entry.name}
                        </span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-sm font-bold text-stone-900 dark:text-stone-100">{entry.score}</span>
                        {entry.trend === 'up' && <TrendingUp size={14} className="text-emerald-500" />}
                        {entry.trend === 'down' && <TrendingDown size={14} className="text-red-500" />}
                        {entry.trend === 'same' && <Minus size={14} className="text-stone-400" />}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-12">
                    <p className="text-sm text-stone-500">Nenhum registro ainda.</p>
                    <p className="text-xs text-stone-400 mt-1">Seja o primeiro a pontuar!</p>
                  </div>
                )}
              </div>
            </div>

            {/* Prize Card */}
            <div className="bg-gradient-to-br from-amber-500 to-orange-600 rounded-3xl p-6 text-white shadow-xl shadow-amber-500/20">
              <div className="flex items-center gap-3 mb-4">
                <Gift size={24} />
                <h3 className="font-bold">Prêmio do Mês</h3>
              </div>
              <p className="text-sm opacity-90 mb-4">
                O primeiro lugar no ranking mensal receberá um prêmio surpresa exclusivo!
              </p>
              <div className="bg-white/20 backdrop-blur-sm rounded-xl p-3 text-center">
                <p className="text-xs font-bold uppercase tracking-widest">Faltam 12 dias</p>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default QuizPage;
