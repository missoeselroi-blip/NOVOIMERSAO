import React, { useState, useEffect, useRef } from 'react';
import { 
  Trophy, 
  Map as MapIcon, 
  BookOpen, 
  ChevronRight, 
  ChevronLeft, 
  ZoomIn, 
  ZoomOut, 
  Highlighter, 
  StickyNote, 
  Share2, 
  Save,
  MessageSquare,
  Zap,
  Star,
  Clock,
  AlertCircle,
  CheckCircle2,
  XCircle,
  Send,
  User,
  Medal,
  Calendar,
  RefreshCw,
  Search,
  Loader2,
  Gift,
  Award,
  Sparkles,
  Crown,
  History,
  UserPlus,
  Edit3,
  Camera,
  Timer
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { useCredits } from '../contexts/CreditContext';
import { useToast } from '../components/Toast';
import { db, auth } from '../lib/firebase';
import { 
  doc, 
  getDoc, 
  setDoc, 
  updateDoc, 
  collection, 
  query, 
  orderBy, 
  limit, 
  onSnapshot,
  serverTimestamp,
  addDoc,
  where,
  getDocs
} from 'firebase/firestore';
import { GoogleGenAI, Type } from "@google/genai";
import Markdown from 'react-markdown';
import { cn } from '../types';

// Constants for Bible Books in order
const BIBLE_BOOKS = [
  "Gênesis", "Êxodo", "Levítico", "Números", "Deuteronômio",
  "Josué", "Juízes", "Rute", "1 Samuel", "2 Samuel",
  "1 Reis", "2 Reis", "1 Crônicas", "2 Crônicas",
  "Esdras", "Neemias", "Ester", "Jó", "Salmos",
  "Provérbios", "Eclesiastes", "Cantares", "Isaías",
  "Jeremias", "Lamentações", "Ezequiel", "Daniel",
  "Oseias", "Joel", "Amós", "Obadias", "Jonas",
  "Miqueias", "Naum", "Habacuque", "Sofonias",
  "Ageu", "Zacarias", "Malaquias",
  "Mateus", "Marcos", "Lucas", "João", "Atos",
  "Romanos", "1 Coríntios", "2 Coríntios", "Gálatas",
  "Efésios", "Filipenses", "Colossenses", "1 Tessalonicenses",
  "2 Tessalonicenses", "1 Timóteo", "2 Timóteo", "Tito",
  "Filemom", "Hebreus", "Tiago", "1 Pedro", "2 Pedro",
  "1 João", "2 João", "3 João", "Judas", "Apocalipse"
];

const BIBLE_BOOKS_EN: Record<string, string> = {
  "Gênesis": "Genesis", "Êxodo": "Exodus", "Levítico": "Leviticus", "Números": "Numbers", "Deuteronômio": "Deuteronomy",
  "Josué": "Joshua", "Juízes": "Judges", "Rute": "Ruth", "1 Samuel": "1 Samuel", "2 Samuel": "2 Samuel",
  "1 Reis": "1 Kings", "2 Reis": "2 Kings", "1 Crônicas": "1 Chronicles", "2 Crônicas": "2 Chronicles",
  "Esdras": "Ezra", "Neemias": "Nehemiah", "Ester": "Esther", "Jó": "Job", "Salmos": "Psalms",
  "Provérbios": "Proverbs", "Eclesiastes": "Ecclesiastes", "Cantares": "Song of Solomon", "Isaías": "Isaiah",
  "Jeremias": "Jeremiah", "Lamentações": "Lamentations", "Ezequiel": "Ezekiel", "Daniel": "Daniel",
  "Oseias": "Hosea", "Joel": "Joel", "Amós": "Amos", "Obadias": "Obadiah", "Jonas": "Jonah",
  "Miqueias": "Micah", "Naum": "Nahum", "Habacuque": "Habakkuk", "Sofonias": "Zephaniah",
  "Ageu": "Haggai", "Zacarias": "Zechariah", "Malaquias": "Malachi",
  "Mateus": "Matthew", "Marcos": "Mark", "Lucas": "Luke", "João": "John", "Atos": "Acts",
  "Romanos": "Romans", "1 Coríntios": "1 Corinthians", "2 Coríntios": "2 Corinthians", "Gálatas": "Galatians",
  "Efésios": "Ephesians", "Filipenses": "Philippians", "Colossenses": "Colossians", "1 Tessalonicenses": "1 Thessalonians",
  "2 Tessalonicenses": "2 Thessalonians", "1 Timóteo": "1 Timothy", "2 Timóteo": "2 Timothy", "Tito": "Titus",
  "Filemom": "Philemon", "Hebreus": "Hebrews", "Tiago": "James", "1 Pedro": "1 Peter", "2 Pedro": "2 Peter",
  "1 João": "1 John", "2 João": "2 John", "3 João": "3 John", "Judas": "Jude", "Apocalipse": "Revelation"
};

// Mock chapters count per book (simplified for now, ideally fetch from API)
const CHAPTERS_PER_BOOK: Record<string, number> = {
  "Gênesis": 50, "Êxodo": 40, "Levítico": 27, "Números": 36, "Deuteronômio": 34,
  "Josué": 24, "Juízes": 21, "Rute": 4, "1 Samuel": 31, "2 Samuel": 24,
  "1 Reis": 22, "2 Reis": 25, "1 Crônicas": 29, "2 Crônicas": 36,
  "Esdras": 10, "Neemias": 13, "Ester": 10, "Jó": 42, "Salmos": 150,
  "Provérbios": 31, "Eclesiastes": 12, "Cantares": 8, "Isaías": 66,
  "Jeremias": 52, "Lamentações": 5, "Ezequiel": 48, "Daniel": 12,
  "Oseias": 14, "Joel": 3, "Amós": 9, "Obadias": 1, "Jonas": 4,
  "Miqueias": 7, "Naum": 3, "Habacuque": 3, "Sofonias": 3,
  "Ageu": 2, "Zacarias": 14, "Malaquias": 4,
  "Mateus": 28, "Marcos": 16, "Lucas": 24, "João": 21, "Atos": 28,
  "Romanos": 16, "1 Coríntios": 16, "2 Coríntios": 13, "Gálatas": 6,
  "Efésios": 6, "Filipenses": 4, "Colossenses": 4, "1 Tessalonicenses": 5,
  "2 Tessalonicenses": 3, "1 Timóteo": 6, "2 Timóteo": 4, "Tito": 3,
  "Filemom": 1, "Hebreus": 13, "Tiago": 5, "1 Pedro": 5, "2 Pedro": 3,
  "1 João": 5, "2 João": 1, "3 João": 1, "Judas": 1, "Apocalipse": 22
};

interface UserProgress {
  userId: string;
  userName: string;
  userPhoto: string;
  currentBook: string;
  currentChapter: number;
  points: number;
  monthlyPoints: number;
  annualPoints: number;
  streakDays: number;
  medals: string[];
  finishedBooksCount?: number;
  lastReadDate?: any;
  publicMessage?: string;
  userJoinDate?: string;
}

interface BibleRaceChampion {
  userId: string;
  userName: string;
  userPhoto: string;
  points: number;
  period: string;
  type: 'monthly' | 'annual' | 'overall';
  wonAt: any;
}

interface QuizQuestion {
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
}

const MedalIcon = ({ type, count, className }: { type: string, count?: number, className?: string }) => {
  switch (type) {
    case 'book':
      return (
        <div className={cn("relative flex items-center gap-1", className)}>
          <Medal className="text-stone-400" size={20} />
          {count && count > 1 && <span className="text-[10px] font-black text-stone-500">x{count}</span>}
        </div>
      );
    case 'monthly':
      return (
        <div className={cn("relative", className)} title="Campeão Mensal">
          <Award className="text-amber-500 drop-shadow-md" size={24} />
          <div className="absolute -top-1 -right-1 bg-white dark:bg-zinc-800 rounded-full p-0.5 border border-amber-200">
            <Star size={8} className="text-amber-500 fill-amber-500" />
          </div>
        </div>
      );
    case 'quarterly':
      return (
        <div className={cn("relative", className)} title="Campeão Trimestral">
          <Trophy className="text-blue-500 drop-shadow-lg" size={28} />
          <motion.div 
            animate={{ rotate: [0, 10, -10, 0] }}
            transition={{ repeat: Infinity, duration: 2 }}
            className="absolute -top-2 -right-2"
          >
            <Sparkles size={12} className="text-blue-400" />
          </motion.div>
        </div>
      );
    case 'semiannual':
      return (
        <div className={cn("relative", className)} title="Campeão Semestral">
          <Trophy className="text-purple-500 drop-shadow-xl" size={32} />
          <motion.div 
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ repeat: Infinity, duration: 1.5 }}
            className="absolute -top-3 -right-3"
          >
            <Crown size={16} className="text-purple-400" />
          </motion.div>
        </div>
      );
    case 'annual':
      return (
        <div className={cn("relative", className)} title="Campeão Anual">
          <Trophy className="text-amber-600 drop-shadow-xl" size={36} />
          <motion.div 
            animate={{ rotate: [0, 360] }}
            transition={{ repeat: Infinity, duration: 4, ease: "linear" }}
            className="absolute -top-3 -right-3"
          >
            <Crown size={18} className="text-amber-400 fill-amber-400" />
          </motion.div>
        </div>
      );
    case 'grand':
      return (
        <div className={cn("relative", className)} title="Grande Campeão da Corrida">
          <Trophy className="text-emerald-500 drop-shadow-2xl" size={40} />
          <motion.div 
            animate={{ y: [-2, 2, -2] }}
            transition={{ repeat: Infinity, duration: 2 }}
            className="absolute -top-4 -right-4 flex flex-col items-center"
          >
            <Crown size={20} className="text-amber-500 fill-amber-500" />
            <Sparkles size={14} className="text-emerald-400" />
          </motion.div>
        </div>
      );
    default:
      return <Medal className="text-stone-300" size={20} />;
  }
};

const BibleRacePage: React.FC = () => {
  const { user, updateUser } = useAuth();
  const { consumeCredits } = useCredits();
  const { showToast } = useToast();
  const [view, setView] = useState<'circuit' | 'reading' | 'quiz'>('circuit');
  const [progress, setProgress] = useState<UserProgress | null>(null);
  const [leaderboard, setLeaderboard] = useState<UserProgress[]>([]);
  const [leaderboardView, setLeaderboardView] = useState<'monthly' | 'annual' | 'overall'>('overall');
  const [champions, setChampions] = useState<BibleRaceChampion[]>([]);
  const [currentChapterText, setCurrentChapterText] = useState<string>('');
  const [isLoadingText, setIsLoadingText] = useState(false);
  const [fontSize, setFontSize] = useState(18);
  const [isUnderlining, setIsUnderlining] = useState(false);
  const [annotations, setAnnotations] = useState<Record<string, string>>({});
  const [quizQuestions, setQuizQuestions] = useState<QuizQuestion[]>([]);
  const [currentQuizIndex, setCurrentQuizIndex] = useState(0);
  const [quizScore, setQuizScore] = useState(0);
  const [quizStartTime, setQuizStartTime] = useState<number>(0);
  const [quizTimer, setQuizTimer] = useState(60);
  const [isQuizFinished, setIsQuizFinished] = useState(false);
  const [selectedVersion, setSelectedVersion] = useState('almeida');
  const [messages, setMessages] = useState<any[]>([]);
  const [messageView, setMessageView] = useState<'received' | 'sent'>('received');
  const [isMessageModalOpen, setIsMessageModalOpen] = useState(false);
  const [selectedUserForMessage, setSelectedUserForMessage] = useState<UserProgress | null>(null);
  const [isChangingAvatar, setIsChangingAvatar] = useState(false);
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [newPublicMessage, setNewPublicMessage] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  // Initialize progress
  useEffect(() => {
    if (!user) return;

    const progressRef = doc(db, 'bibleRaceProgress', user.id);
    const unsubscribe = onSnapshot(progressRef, async (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data() as UserProgress;
        
        // Monthly Reset Check
        const now = new Date();
        const monthId = `${now.getFullYear()}-${(now.getMonth() + 1).toString().padStart(2, '0')}`;
        const lastUpdate = data.lastReadDate?.toDate() || new Date();
        const lastUpdateMonthId = `${lastUpdate.getFullYear()}-${(lastUpdate.getMonth() + 1).toString().padStart(2, '0')}`;

        if (monthId !== lastUpdateMonthId) {
          // Reset monthly points but keep total points
          // Also check for annual reset
          const isAnnualReset = now.getFullYear() !== lastUpdate.getFullYear();
          
          await updateDoc(progressRef, {
            monthlyPoints: 0,
            annualPoints: isAnnualReset ? 0 : data.annualPoints || 0,
            lastReadDate: serverTimestamp()
          });
        }

        setProgress(data);
      } else {
        // Create initial progress
        const initialProgress: UserProgress = {
          userId: user.id,
          userName: user.name || 'Membro',
          userPhoto: user.avatar || user.photoURL || '',
          currentBook: 'Gênesis',
          currentChapter: 1,
          points: 0,
          monthlyPoints: 0,
          annualPoints: 0,
          streakDays: 0,
          medals: [],
          userJoinDate: user.joinDate || new Date().toISOString()
        };
        setDoc(progressRef, initialProgress);
      }
    });

    return () => unsubscribe();
  }, [user]);

  // Fetch Leaderboard based on view
  useEffect(() => {
    const sortField = leaderboardView === 'monthly' ? 'monthlyPoints' : (leaderboardView === 'annual' ? 'annualPoints' : 'points');
    const q = query(collection(db, 'bibleRaceProgress'), orderBy(sortField, 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => doc.data() as UserProgress);
      setLeaderboard(data);
    });
    return () => unsubscribe();
  }, [leaderboardView]);

  // Fetch Champions
  useEffect(() => {
    const q = query(collection(db, 'bibleRaceChampions'), orderBy('wonAt', 'desc'), limit(20));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setChampions(snapshot.docs.map(doc => doc.data() as BibleRaceChampion));
    });
    return () => unsubscribe();
  }, []);

  // Fetch Messages
  useEffect(() => {
    if (!user) return;
    const q = query(
      collection(db, 'bibleRaceMessages'),
      where(messageView === 'received' ? 'toUserId' : 'fromUserId', '==', user.id),
      orderBy('createdAt', 'desc'),
      limit(20)
    );
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setMessages(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });
    return () => unsubscribe();
  }, [user, messageView]);

  // Quiz Timer
  useEffect(() => {
    if (view !== 'quiz' || isQuizFinished) return;

    const interval = setInterval(() => {
      setQuizTimer(prev => {
        if (prev <= 1) {
          handleQuizAnswer(-1); // Time's up
          return 60;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [view, isQuizFinished, currentQuizIndex]);

  const fetchChapterText = async (book: string, chapter: number) => {
    setIsLoadingText(true);
    try {
      const bookEn = BIBLE_BOOKS_EN[book] || book;
      const url = `https://bible-api.com/${encodeURIComponent(bookEn)}+${chapter}?translation=${selectedVersion}`;
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      if (data.text) {
        setCurrentChapterText(data.text);
      } else {
        showToast("Erro ao carregar o capítulo. Tente novamente.", "error");
      }
    } catch (error) {
      console.error("Error fetching Bible text:", error);
      showToast("Erro de conexão ao carregar a Bíblia. Verifique sua internet ou tente outra versão.", "error");
    } finally {
      setIsLoadingText(false);
    }
  };

  const startReading = () => {
    if (!progress) return;
    fetchChapterText(progress.currentBook, progress.currentChapter);
    setView('reading');
  };

  const generateQuiz = async () => {
    if (!progress || !currentChapterText) return;
    setIsLoadingText(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });
      const prompt = `Gere um quiz de 3 perguntas de múltipla escolha sobre o capítulo ${progress.currentBook} ${progress.currentChapter} da Bíblia. 
      O texto do capítulo é: ${currentChapterText.substring(0, 2000)}.
      Retorne APENAS um JSON no formato:
      [
        {
          "question": "pergunta",
          "options": ["opção 0", "opção 1", "opção 2", "opção 3"],
          "correctAnswer": 0,
          "explanation": "explicação curta"
        }
      ]`;

      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: prompt,
        config: { responseMimeType: "application/json" }
      });

      const questions = JSON.parse(response.text);
      setQuizQuestions(questions);
      setCurrentQuizIndex(0);
      setQuizScore(0);
      setQuizStartTime(Date.now());
      setIsQuizFinished(false);
      setView('quiz');
    } catch (error) {
      console.error("Error generating quiz:", error);
      showToast("Erro ao gerar o quiz com IA.", "error");
    } finally {
      setIsLoadingText(false);
    }
  };

  const handleQuizAnswer = (answerIndex: number) => {
    const isCorrect = answerIndex === quizQuestions[currentQuizIndex].correctAnswer;
    let pointsEarned = 0;
    
    if (isCorrect) {
      const elapsedTime = 60 - quizTimer;
      let multiplier = 1;
      if (elapsedTime <= 5) multiplier = 10;
      else if (elapsedTime <= 15) multiplier = 5;
      else if (elapsedTime <= 30) multiplier = 2;
      
      pointsEarned = 1 * multiplier;
      setQuizScore(prev => prev + pointsEarned);
      showToast(`Correto! +${pointsEarned} pontos (Tempo: ${elapsedTime}s)`, "success");
    } else if (answerIndex !== -1) {
      showToast(`Incorreto. A resposta certa era: ${quizQuestions[currentQuizIndex].options[quizQuestions[currentQuizIndex].correctAnswer]}`, "info");
    } else {
      showToast("Tempo esgotado!", "error");
    }

    if (currentQuizIndex < quizQuestions.length - 1) {
      setCurrentQuizIndex(prev => prev + 1);
      setQuizTimer(60);
    } else {
      // Calculate final score including the last answer's points
      const finalScore = quizScore + pointsEarned;
      finishQuiz(finalScore);
    }
  };

  const finishQuiz = async (finalScore: number) => {
    if (!progress || !user) return;
    setIsQuizFinished(true);
    
    const progressRef = doc(db, 'bibleRaceProgress', user.id);
    const newPoints = progress.points + finalScore;
    const newMonthlyPoints = progress.monthlyPoints + finalScore;
    const newAnnualPoints = (progress.annualPoints || 0) + finalScore;
    
    // Check for next chapter
    let nextBook = progress.currentBook;
    let nextChapter = progress.currentChapter + 1;
    let finishedBook = false;
    
    if (nextChapter > CHAPTERS_PER_BOOK[progress.currentBook]) {
      const bookIndex = BIBLE_BOOKS.indexOf(progress.currentBook);
      finishedBook = true;
      if (bookIndex < BIBLE_BOOKS.length - 1) {
        nextBook = BIBLE_BOOKS[bookIndex + 1];
        nextChapter = 1;
      } else {
        showToast("PARABÉNS! Você completou toda a Bíblia!", "success");
      }
    }

    // Streak and Medals logic
    const now = new Date();
    const lastRead = progress.lastReadDate?.toDate();
    let newStreak = progress.streakDays;
    
    if (lastRead) {
      const diffDays = Math.floor((now.getTime() - lastRead.getTime()) / (1000 * 60 * 60 * 24));
      if (diffDays === 1) newStreak += 1;
      else if (diffDays > 1) newStreak = 1;
    } else {
      newStreak = 1;
    }

    const newMedals = [...progress.medals];
    if (newStreak === 7 && !newMedals.includes('7-day-streak')) newMedals.push('7-day-streak');
    if (newStreak === 30 && !newMedals.includes('30-day-streak')) newMedals.push('30-day-streak');
    
    const newFinishedBooksCount = (progress.finishedBooksCount || 0) + (finishedBook ? 1 : 0);

    await updateDoc(progressRef, {
      points: newPoints,
      monthlyPoints: newMonthlyPoints,
      annualPoints: newAnnualPoints,
      currentBook: nextBook,
      currentChapter: nextChapter,
      streakDays: newStreak,
      medals: newMedals,
      finishedBooksCount: newFinishedBooksCount,
      lastReadDate: serverTimestamp()
    });

    // Sync Bible Race points to careerProgress
    const careerDocRef = doc(db, 'careerProgress', user.id);
    try {
      const careerDoc = await getDoc(careerDocRef);
      if (careerDoc.exists()) {
        const careerData = careerDoc.data();
        const theologyPoints = careerData.theologyPoints || 0;
        const evangelismPoints = careerData.evangelismPoints || 0;
        const storytellingPoints = careerData.storytellingPoints || 0;
        await updateDoc(careerDocRef, {
          bibleRacePoints: newPoints,
          points: newPoints + theologyPoints + evangelismPoints + storytellingPoints,
          updatedAt: new Date().toISOString()
        });
      } else {
        await setDoc(careerDocRef, {
          userId: user.id,
          name: user.name || 'Membro',
          avatar: user.avatar || user.photoURL || '',
          theologyPoints: 0,
          bibleRacePoints: newPoints,
          evangelismPoints: 0,
          storytellingPoints: 0,
          points: newPoints,
          rankId: 1,
          stars: 0,
          authorized: false,
          updatedAt: new Date().toISOString()
        }, { merge: true });
      }
    } catch (e) {
      console.error("Error syncing Bible Race points to career:", e);
    }
    
    showToast(`Quiz finalizado! Você ganhou ${finalScore} pontos.`, "success");
  };

  const changeAvatar = async () => {
    if (!user) return;
    const cost = 10;
    if (await consumeCredits(cost, "Troca de Avatar da Corrida")) {
      setIsChangingAvatar(true);
      try {
        const newAvatar = `https://api.dicebear.com/7.x/avataaars/svg?seed=${Date.now()}`;
        // Update global user profile
        await updateUser({ photoURL: newAvatar, avatar: newAvatar });
        
        // Update Bible Race progress for leaderboard sync
        if (progress) {
          await updateDoc(doc(db, 'bibleRaceProgress', user.id), {
            userPhoto: newAvatar
          });
        }
        
        // Update Career progress if it exists for leaderboard sync
        const careerDocRef = doc(db, 'careerProgress', user.id);
        try {
          await updateDoc(careerDocRef, { avatar: newAvatar });
        } catch (e) {
          // Career progress might not exist yet, ignore
        }

        // Sync with Bible Race Champions (Quadro de Honra/Galeria de Campeões)
        const championsRef = collection(db, 'bibleRaceChampions');
        const q = query(championsRef, where('userId', '==', user.id));
        const querySnapshot = await getDocs(q);
        const updatePromises = querySnapshot.docs.map(doc => 
          updateDoc(doc.ref, { userPhoto: newAvatar })
        );
        await Promise.all(updatePromises);
        
        showToast("Avatar atualizado com sucesso!", "success");
      } catch (error) {
        console.error("Error changing avatar:", error);
        showToast("Erro ao atualizar avatar.", "error");
      } finally {
        setIsChangingAvatar(false);
      }
    } else {
      showToast("Créditos insuficientes (Custo: 10 créditos).", "error");
    }
  };

  const updatePublicMessage = async () => {
    if (!user || !progress) return;
    try {
      await updateDoc(doc(db, 'bibleRaceProgress', user.id), {
        publicMessage: newPublicMessage
      });
      setIsEditingProfile(false);
      showToast("Mensagem atualizada!", "success");
    } catch (error) {
      showToast("Erro ao atualizar mensagem.", "error");
    }
  };

  const startTieBreaker = async () => {
    setIsLoadingText(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });
      const prompt = `Gere uma Avaliação Bíblica de desempate com 10 perguntas difíceis sobre a Bíblia inteira.
      Retorne APENAS um JSON no formato:
      [
        {
          "question": "pergunta",
          "options": ["opção 0", "opção 1", "opção 2", "opção 3"],
          "correctAnswer": 0,
          "explanation": "explicação curta"
        }
      ]`;

      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: prompt,
        config: { responseMimeType: "application/json" }
      });

      const questions = JSON.parse(response.text);
      setQuizQuestions(questions);
      setCurrentQuizIndex(0);
      setQuizScore(0);
      setQuizStartTime(Date.now());
      setIsQuizFinished(false);
      setView('quiz');
      showToast("Iniciando Avaliação de Desempate!", "info");
    } catch (error) {
      showToast("Erro ao gerar avaliação.", "error");
    } finally {
      setIsLoadingText(false);
    }
  };

  const sendMessage = async (message: string) => {
    if (!user || !selectedUserForMessage) return;
    try {
      await addDoc(collection(db, 'bibleRaceMessages'), {
        fromUserId: user.id,
        fromUserName: user.name,
        toUserId: selectedUserForMessage.userId,
        message,
        createdAt: serverTimestamp()
      });
      showToast("Mensagem enviada!", "success");
      setIsMessageModalOpen(false);
    } catch (error) {
      showToast("Erro ao enviar mensagem.", "error");
    }
  };

  const renderMyProfile = () => {
    if (!progress || !user) return null;
    return (
      <div className="bg-white dark:bg-zinc-900 p-8 rounded-[2.5rem] shadow-xl border border-stone-100 dark:border-zinc-800">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <div className="relative group">
              <img 
                src={user.avatar || user.photoURL || `https://ui-avatars.com/api/?name=${user.name}&background=random`} 
                alt={user.name || ''} 
                className="w-20 h-20 rounded-full border-4 border-emerald-500 shadow-lg object-cover"
                referrerPolicy="no-referrer"
              />
              <button 
                onClick={changeAvatar}
                disabled={isChangingAvatar}
                className="absolute bottom-0 right-0 p-2 bg-emerald-600 text-white rounded-full shadow-lg hover:bg-emerald-700 transition-all active:scale-95 disabled:opacity-50"
                title="Trocar Avatar (10 créditos)"
              >
                {isChangingAvatar ? <Loader2 size={16} className="animate-spin" /> : <Camera size={16} />}
              </button>
            </div>
            <div>
              <h2 className="text-2xl font-black tracking-tighter uppercase">{user.name}</h2>
              <p className="text-stone-500 text-xs font-bold uppercase tracking-widest">Membro desde: {new Date(progress.userJoinDate || '').toLocaleDateString()}</p>
            </div>
          </div>
          <button 
            onClick={() => {
              setNewPublicMessage(progress.publicMessage || '');
              setIsEditingProfile(!isEditingProfile);
            }}
            className="p-2 hover:bg-stone-100 dark:hover:bg-zinc-800 rounded-xl transition-colors"
          >
            <Edit3 size={20} className="text-stone-400" />
          </button>
        </div>

        {isEditingProfile ? (
          <div className="space-y-4 mb-8">
            <textarea 
              value={newPublicMessage}
              onChange={(e) => setNewPublicMessage(e.target.value)}
              placeholder="Sua mensagem pública..."
              className="w-full p-4 bg-stone-50 dark:bg-zinc-800 border-2 border-stone-100 dark:border-zinc-800 rounded-2xl text-sm focus:ring-2 ring-emerald-500 outline-none"
              rows={3}
            />
            <div className="flex justify-end gap-2">
              <button onClick={() => setIsEditingProfile(false)} className="px-4 py-2 text-xs font-bold uppercase text-stone-400">Cancelar</button>
              <button onClick={updatePublicMessage} className="px-4 py-2 bg-emerald-600 text-white text-xs font-black rounded-xl uppercase">Salvar</button>
            </div>
          </div>
        ) : (
          progress.publicMessage && (
            <div className="p-4 bg-emerald-50 dark:bg-emerald-900/20 rounded-2xl border border-emerald-100 dark:border-emerald-800 mb-8 italic text-sm text-emerald-800 dark:text-emerald-300">
              "{progress.publicMessage}"
            </div>
          )
        )}

        <div className="grid grid-cols-2 gap-4">
          <div className="p-4 bg-stone-50 dark:bg-zinc-800/50 rounded-2xl border border-stone-100 dark:border-zinc-800">
            <p className="text-[10px] font-black text-stone-400 uppercase tracking-widest mb-1">Total de Pontos</p>
            <p className="text-xl font-black text-emerald-600">{progress.points}</p>
          </div>
          <div className="p-4 bg-stone-50 dark:bg-zinc-800/50 rounded-2xl border border-stone-100 dark:border-zinc-800">
            <p className="text-[10px] font-black text-stone-400 uppercase tracking-widest mb-1">Livros Concluídos</p>
            <div className="flex items-center gap-2">
              <MedalIcon type="book" count={progress.finishedBooksCount} />
              <p className="text-xl font-black text-amber-600">{progress.finishedBooksCount || 0}</p>
            </div>
          </div>
          <div className="p-4 bg-stone-50 dark:bg-zinc-800/50 rounded-2xl border border-stone-100 dark:border-zinc-800">
            <p className="text-[10px] font-black text-stone-400 uppercase tracking-widest mb-1">Pontos Mensais</p>
            <p className="text-xl font-black text-blue-600">{progress.monthlyPoints}</p>
          </div>
          <div className="p-4 bg-stone-50 dark:bg-zinc-800/50 rounded-2xl border border-stone-100 dark:border-zinc-800">
            <p className="text-[10px] font-black text-stone-400 uppercase tracking-widest mb-1">Medalhas Especiais</p>
            <div className="flex flex-wrap gap-2 mt-1">
              {progress.medals.includes('monthly-1st') && <MedalIcon type="monthly" />}
              {progress.medals.includes('quarterly-1st') && <MedalIcon type="quarterly" />}
              {progress.medals.includes('semiannual-1st') && <MedalIcon type="semiannual" />}
              {progress.medals.includes('grand-champion') && <MedalIcon type="grand" />}
              {progress.medals.length === 0 && <span className="text-[10px] text-stone-400">Nenhuma ainda</span>}
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderRegulation = () => (
    <div className="bg-stone-50 dark:bg-zinc-800/50 p-8 rounded-[2.5rem] border border-stone-100 dark:border-zinc-800 mt-12">
      <h2 className="text-xl font-black uppercase tracking-tighter mb-6 flex items-center gap-3">
        <AlertCircle className="text-emerald-600" />
        Regulamento da Corrida Bíblica
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-sm text-stone-600 dark:text-zinc-400">
        <div className="space-y-4">
          <p><strong>1. Participação:</strong> Aberta a todos os membros ativos do App.</p>
          <p><strong>2. Pontuação:</strong> 1 ponto por acerto no quiz, multiplicado pelo tempo de resposta (até x10).</p>
          <p><strong>3. Progresso:</strong> A leitura deve ser sequencial, capítulo a capítulo.</p>
        </div>
        <div className="space-y-4">
          <p><strong>4. Desempate:</strong> Em caso de empate, o critério é quem se tornou membro do App por último.</p>
          <p><strong>5. Conduta:</strong> O uso de bots ou trapaças resultará em desclassificação imediata.</p>
        </div>
      </div>
    </div>
  );

  if (!user) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center p-8 bg-white dark:bg-zinc-900 rounded-[2.5rem] shadow-xl border border-stone-100 dark:border-zinc-800">
        <div className="p-6 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 rounded-full mb-6">
          <Trophy size={64} />
        </div>
        <h2 className="text-3xl font-black tracking-tighter uppercase mb-4 text-center">Entre na Corrida Bíblica!</h2>
        <p className="text-stone-500 dark:text-zinc-400 text-center max-w-md mb-8">
          Para participar da Corrida Bíblica, acompanhar seu progresso, ganhar medalhas e subir no pódio, você precisa estar logado.
        </p>
        <button 
          onClick={() => window.location.href = '/login'}
          className="px-12 py-4 bg-emerald-600 text-white font-black rounded-2xl hover:bg-emerald-700 shadow-xl shadow-emerald-600/20 transition-all active:scale-95 flex items-center gap-3"
        >
          <UserPlus size={20} />
          Entrar no Perfil
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-20">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 bg-white dark:bg-zinc-900 p-8 rounded-[2.5rem] shadow-xl border border-stone-100 dark:border-zinc-800">
        <div className="flex items-center gap-4">
          <div className="p-4 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 rounded-2xl">
            <Trophy size={32} />
          </div>
          <div>
            <h1 className="text-3xl font-black tracking-tighter uppercase">Corrida Bíblica</h1>
            <p className="text-stone-500 dark:text-zinc-400 text-sm font-bold uppercase tracking-widest">A Jornada da Palavra</p>
          </div>
        </div>

        {progress && (
          <div className="flex flex-wrap items-center gap-6 bg-stone-50 dark:bg-zinc-800/50 p-4 rounded-3xl border border-stone-100 dark:border-zinc-800">
            <div className="text-center">
              <p className="text-[10px] font-black text-stone-400 uppercase tracking-widest">Seus Pontos</p>
              <p className="text-2xl font-black text-emerald-600">{progress.points}</p>
            </div>
            <div className="w-px h-8 bg-stone-200 dark:bg-zinc-700" />
            <div className="text-center">
              <p className="text-[10px] font-black text-stone-400 uppercase tracking-widest">Progresso</p>
              <p className="text-sm font-bold">{progress.currentBook} {progress.currentChapter}</p>
            </div>
            <div className="w-px h-8 bg-stone-200 dark:bg-zinc-700" />
            <div className="flex items-center gap-2">
              {progress.medals.map(medal => (
                <div key={medal} className="p-2 bg-amber-100 dark:bg-amber-900/30 text-amber-600 rounded-full" title={medal}>
                  <Medal size={16} />
                </div>
              ))}
              {progress.medals.length === 0 && <p className="text-[10px] text-stone-400 font-bold uppercase">Sem medalhas</p>}
            </div>
          </div>
        )}
      </div>

      {/* Tie Breaker Alert */}
      {leaderboard.length > 1 && leaderboard[0].points === leaderboard[1].points && (
        <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 p-6 rounded-3xl flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <AlertCircle className="text-amber-600" size={32} />
            <div>
              <h3 className="text-lg font-black uppercase tracking-tighter">Empate Detectado!</h3>
              <p className="text-sm text-stone-600 dark:text-zinc-400">Há um empate no topo do pódio. Inicie a Avaliação Bíblica para desempatar.</p>
            </div>
          </div>
          <button 
            onClick={startTieBreaker}
            className="px-6 py-3 bg-[#E2725B] text-white font-black rounded-2xl hover:bg-[#D2624B] shadow-lg shadow-[#E2725B]/20 transition-all active:scale-95"
          >
            Iniciar Desempate
          </button>
        </div>
      )}

      {/* Main View Area */}
      <AnimatePresence mode="wait">
        {view === 'circuit' && (
          <motion.div
            key="circuit"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="grid grid-cols-1 lg:grid-cols-3 gap-8"
          >
            {/* Bible Circuit */}
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-white dark:bg-zinc-900 p-8 rounded-[2.5rem] shadow-xl border border-stone-100 dark:border-zinc-800">
                <div className="flex items-center justify-between mb-8">
                  <div className="flex items-center gap-3">
                    <MapIcon className="text-emerald-600" />
                    <h2 className="text-xl font-black uppercase tracking-tighter">Circuito Bíblico</h2>
                  </div>
                  <button 
                    onClick={startReading}
                    className="px-6 py-3 bg-[#8A9A5B] text-white font-black rounded-2xl hover:bg-[#7A8A4B] shadow-lg shadow-[#8A9A5B]/20 flex items-center gap-2 transition-all active:scale-95"
                  >
                    <BookOpen size={20} />
                    Continuar Leitura
                  </button>
                </div>

                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-4">
                  {BIBLE_BOOKS.map((book, index) => {
                    const isCompleted = progress ? BIBLE_BOOKS.indexOf(progress.currentBook) > index : false;
                    const isCurrent = progress ? progress.currentBook === book : false;
                    
                    return (
                      <div 
                        key={book}
                        className={cn(
                          "relative p-4 rounded-2xl border-2 transition-all flex flex-col items-center justify-center text-center gap-2",
                          isCompleted ? "bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-400" :
                          isCurrent ? "bg-white dark:bg-zinc-800 border-emerald-500 shadow-lg shadow-emerald-500/20 scale-105 z-10" :
                          "bg-stone-50 dark:bg-zinc-800/50 border-stone-100 dark:border-zinc-800 text-stone-400"
                        )}
                      >
                        {isCompleted && <MedalIcon type="book" className="absolute top-2 right-2 scale-75" />}
                        {isCurrent && <Zap size={16} className="absolute top-2 right-2 text-amber-500 animate-pulse" />}
                        <span className="text-[10px] font-black uppercase leading-tight">{book}</span>
                        <div className="w-full h-1 bg-stone-200 dark:bg-zinc-700 rounded-full overflow-hidden">
                          <div 
                            className={cn("h-full transition-all", isCompleted ? "w-full bg-emerald-500" : isCurrent ? "bg-emerald-500" : "w-0")} 
                            style={{ width: isCurrent ? `${(progress!.currentChapter / CHAPTERS_PER_BOOK[book]) * 100}%` : undefined }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Podium & Leaderboard */}
            <div className="space-y-6">
              {renderMyProfile()}

              <div className="bg-white dark:bg-zinc-900 p-8 rounded-[2.5rem] shadow-xl border border-stone-100 dark:border-zinc-800">
                <div className="flex flex-col gap-6 mb-8">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Trophy className="text-amber-500" />
                      <h2 className="text-xl font-black uppercase tracking-tighter">Pódio</h2>
                    </div>
                    <div className="flex bg-stone-100 dark:bg-zinc-800 p-1 rounded-xl">
                      {(['monthly', 'annual', 'overall'] as const).map((v) => (
                        <button
                          key={v}
                          onClick={() => setLeaderboardView(v)}
                          className={cn(
                            "px-4 py-2 text-[10px] font-black uppercase rounded-lg transition-all",
                            leaderboardView === v ? "bg-white dark:bg-zinc-700 text-emerald-600 shadow-sm" : "text-stone-400 hover:text-stone-600"
                          )}
                        >
                          {v === 'monthly' ? 'Mensal' : v === 'annual' ? 'Anual' : 'Geral'}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Search and My Location */}
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" size={16} />
                      <input 
                        type="text"
                        placeholder="Buscar participante..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 bg-stone-50 dark:bg-zinc-800 border border-stone-100 dark:border-zinc-700 rounded-xl text-xs outline-none focus:ring-2 ring-emerald-500/50 transition-all"
                      />
                    </div>
                    <button 
                      onClick={() => {
                        if (user) {
                          setSearchTerm(user.name || '');
                        }
                      }}
                      className="px-4 py-2 bg-[#5B8A9A]/10 text-[#5B8A9A] rounded-xl text-[10px] font-black uppercase flex items-center gap-2 hover:bg-[#5B8A9A]/20 transition-all active:scale-95"
                      title="Minha Localização"
                    >
                      <User size={14} />
                      <span className="hidden sm:inline">Minha Posição</span>
                    </button>
                  </div>

                  <div className="space-y-4">
                    {(() => {
                      const filtered = leaderboard.filter(u => u.userName.toLowerCase().includes(searchTerm.toLowerCase()));
                      
                      let displayList = filtered;
                      if (!searchTerm) {
                        displayList = leaderboard.slice(0, 5);
                        const currentUserIndex = leaderboard.findIndex(u => u.userId === auth.currentUser?.uid);
                        if (currentUserIndex >= 5) {
                          displayList.push(leaderboard[currentUserIndex]);
                        }
                      }

                      if (displayList.length === 0) {
                        return (
                          <div className="text-center py-8">
                            <p className="text-stone-400 text-xs italic">Nenhum participante encontrado.</p>
                          </div>
                        );
                      }

                      return displayList.map((user, index) => {
                        // Find actual rank in the full leaderboard
                        const actualRank = leaderboard.findIndex(l => l.userId === user.userId);
                        
                        return (
                          <motion.div 
                            key={user.userId}
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.05 }}
                            className={cn(
                              "flex items-center justify-between p-4 rounded-2xl border transition-all",
                              actualRank === 0 ? "bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800" :
                              actualRank === 1 ? "bg-stone-50 dark:bg-stone-800 border-stone-200 dark:border-stone-700" :
                              actualRank === 2 ? "bg-orange-50 dark:bg-orange-900/20 border-orange-200 dark:border-orange-800" :
                              "bg-white dark:bg-zinc-900 border-stone-100 dark:border-zinc-800",
                              user.userId === auth.currentUser?.uid && "ring-2 ring-emerald-500 ring-offset-2 dark:ring-offset-zinc-900"
                            )}
                          >
                            <div className="flex items-center gap-4">
                              <div className="relative">
                                <img 
                                  src={user.userPhoto || `https://ui-avatars.com/api/?name=${user.userName}&background=random`} 
                                  alt={user.userName}
                                  className="w-10 h-10 rounded-full border-2 border-white dark:border-zinc-800 shadow-sm object-cover"
                                  referrerPolicy="no-referrer"
                                />
                                <div className={cn(
                                  "absolute -top-2 -left-2 w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-black text-white shadow-lg",
                                  actualRank === 0 ? "bg-amber-500" : actualRank === 1 ? "bg-stone-400" : actualRank === 2 ? "bg-orange-500" : "bg-zinc-400"
                                )}>
                                  {actualRank + 1}
                                </div>
                              </div>
                              <div>
                                <p className="text-sm font-bold truncate max-w-[120px]">{user.userName}</p>
                                <div className="flex items-center gap-1">
                                  <p className="text-[10px] text-stone-400 uppercase font-black">{user.currentBook} {user.currentChapter}</p>
                                  {user.finishedBooksCount && user.finishedBooksCount > 0 && (
                                    <MedalIcon type="book" count={user.finishedBooksCount} className="scale-75 origin-left" />
                                  )}
                                  {user.medals.includes('monthly-1st') && <MedalIcon type="monthly" className="scale-50 origin-left" />}
                                  {user.medals.includes('quarterly-1st') && <MedalIcon type="quarterly" className="scale-50 origin-left" />}
                                  {user.medals.includes('semiannual-1st') && <MedalIcon type="semiannual" className="scale-50 origin-left" />}
                                  {user.medals.includes('grand-champion') && <MedalIcon type="grand" className="scale-50 origin-left" />}
                                </div>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="text-sm font-black text-emerald-600">
                                {leaderboardView === 'monthly' ? user.monthlyPoints : (leaderboardView === 'annual' ? user.annualPoints : user.points)} pts
                              </p>
                              <button 
                                onClick={() => {
                                  setSelectedUserForMessage(user);
                                  setIsMessageModalOpen(true);
                                }}
                                className="text-[10px] text-stone-400 hover:text-emerald-600 transition-colors uppercase font-black"
                              >
                                Enviar Mensagem
                              </button>
                            </div>
                          </motion.div>
                        );
                      });
                    })()}
                  </div>
                </div>

                {/* Champions Table */}
                {champions.length > 0 && (
                  <div className="mt-8 pt-8 border-t border-stone-100 dark:border-zinc-800">
                    <div className="flex items-center gap-3 mb-6">
                      <Award className="text-emerald-600" />
                      <h2 className="text-xl font-black uppercase tracking-tighter">Galeria de Campeões</h2>
                    </div>
                    <div className="overflow-x-auto">
                      <table className="w-full text-left">
                        <thead>
                          <tr className="text-[10px] font-black text-stone-400 uppercase tracking-widest border-b border-stone-100 dark:border-zinc-800">
                            <th className="pb-4">Avatar</th>
                            <th className="pb-4">Nome</th>
                            <th className="pb-4">Período</th>
                            <th className="pb-4">Pontos</th>
                          </tr>
                        </thead>
                        <tbody className="text-sm">
                          {champions.map((champ, idx) => (
                            <tr key={`champion-${champ.userId}-${idx}`} className="border-b border-stone-50 dark:border-zinc-800/50">
                              <td className="py-4">
                                <img src={champ.userPhoto} alt={champ.userName} className="w-8 h-8 rounded-full" referrerPolicy="no-referrer" />
                              </td>
                              <td className="py-4 font-bold flex items-center gap-2">
                                {champ.userName}
                                <MedalIcon type={champ.type} className="scale-50 origin-left" />
                              </td>
                              <td className="py-4 text-stone-500 uppercase text-[10px] font-black">{champ.period}</td>
                              <td className="py-4 font-black text-emerald-600">{champ.points}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>

              {/* Messages Section */}
              <div className="bg-white dark:bg-zinc-900 p-8 rounded-[2.5rem] shadow-xl border border-stone-100 dark:border-zinc-800">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <MessageSquare className="text-blue-500" />
                    <h2 className="text-xl font-black uppercase tracking-tighter">Mensagens</h2>
                  </div>
                  <div className="flex bg-stone-100 dark:bg-zinc-800 p-1 rounded-xl">
                    <button
                      onClick={() => setMessageView('received')}
                      className={cn(
                        "px-3 py-1 text-[10px] font-black uppercase rounded-lg transition-all",
                        messageView === 'received' ? "bg-white dark:bg-zinc-700 text-blue-600 shadow-sm" : "text-stone-400"
                      )}
                    >
                      Recebidas
                    </button>
                    <button
                      onClick={() => setMessageView('sent')}
                      className={cn(
                        "px-3 py-1 text-[10px] font-black uppercase rounded-lg transition-all",
                        messageView === 'sent' ? "bg-white dark:bg-zinc-700 text-blue-600 shadow-sm" : "text-stone-400"
                      )}
                    >
                      Enviadas
                    </button>
                  </div>
                </div>
                <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2 scrollbar-thin">
                  {messages.length === 0 ? (
                    <p className="text-center text-stone-400 text-xs py-8">Nenhuma mensagem {messageView === 'received' ? 'recebida' : 'enviada'}.</p>
                  ) : (
                    messages.map((msg) => (
                      <div key={`msg-${msg.id}`} className="p-3 bg-stone-50 dark:bg-zinc-800/50 rounded-xl border border-stone-100 dark:border-zinc-800">
                        <p className="text-[10px] font-black text-emerald-600 uppercase mb-1">
                          {messageView === 'received' ? `De: ${msg.fromUserName}` : `Para: ${msg.toUserName || 'Usuário'}`}
                        </p>
                        <p className="text-xs text-stone-600 dark:text-zinc-300">{msg.message}</p>
                      </div>
                    ))
                  )}
                </div>
              </div>

            </div>
          </motion.div>
        )}

        {view === 'reading' && (
          <motion.div
            key="reading"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="max-w-4xl mx-auto space-y-6"
          >
            {/* Reading Controls */}
            <div className="bg-white dark:bg-zinc-900 p-6 rounded-[2rem] shadow-xl border border-stone-100 dark:border-zinc-800 flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <button 
                  onClick={() => setView('circuit')}
                  className="p-2 hover:bg-stone-100 dark:hover:bg-zinc-800 rounded-full transition-colors"
                >
                  <ChevronLeft size={24} />
                </button>
                <h2 className="text-xl font-black uppercase tracking-tighter">
                  {progress?.currentBook} {progress?.currentChapter}
                </h2>
              </div>

              <div className="flex items-center gap-2">
                <button onClick={() => setFontSize(prev => Math.max(12, prev - 2))} className="p-2 hover:bg-stone-100 dark:hover:bg-zinc-800 rounded-xl transition-colors">
                  <ZoomOut size={20} />
                </button>
                <span className="text-xs font-bold w-8 text-center">{fontSize}</span>
                <button onClick={() => setFontSize(prev => Math.min(32, prev + 2))} className="p-2 hover:bg-stone-100 dark:hover:bg-zinc-800 rounded-xl transition-colors">
                  <ZoomIn size={20} />
                </button>
                <div className="w-px h-6 bg-stone-200 dark:bg-zinc-700 mx-2" />
                <button 
                  onClick={() => setIsUnderlining(!isUnderlining)}
                  className={cn("p-2 rounded-xl transition-colors", isUnderlining ? "bg-emerald-100 text-emerald-600" : "hover:bg-stone-100 dark:hover:bg-zinc-800")}
                >
                  <Highlighter size={20} />
                </button>
                <button className="p-2 hover:bg-stone-100 dark:hover:bg-zinc-800 rounded-xl transition-colors">
                  <StickyNote size={20} />
                </button>
                <button className="p-2 hover:bg-stone-100 dark:hover:bg-zinc-800 rounded-xl transition-colors">
                  <Share2 size={20} />
                </button>
              </div>

              <select 
                value={selectedVersion}
                onChange={(e) => setSelectedVersion(e.target.value)}
                className="bg-stone-50 dark:bg-zinc-800 border-none rounded-xl text-xs font-bold px-4 py-2 focus:ring-2 ring-emerald-500"
              >
                <option value="almeida">Almeida</option>
                <option value="kjv">KJV (Inglês)</option>
                <option value="web">WEB (Inglês)</option>
                <option value="cherokee">Cherokee</option>
              </select>
            </div>

            {/* Reading Content */}
            <div className="bg-white dark:bg-zinc-900 p-12 rounded-[3rem] shadow-2xl border border-stone-100 dark:border-zinc-800 min-h-[60vh] relative">
              {isLoadingText ? (
                <div className="absolute inset-0 flex items-center justify-center">
                  <Loader2 className="animate-spin text-emerald-600" size={48} />
                </div>
              ) : (
                <div 
                  className="prose dark:prose-invert max-w-none leading-relaxed"
                  style={{ fontSize: `${fontSize}px` }}
                >
                  <Markdown>{currentChapterText}</Markdown>
                </div>
              )}
            </div>

            {/* Action Footer */}
            <div className="flex justify-center">
              <button 
                onClick={generateQuiz}
                disabled={isLoadingText}
                className="px-12 py-5 bg-emerald-600 text-white text-xl font-black rounded-[2rem] hover:bg-emerald-700 shadow-2xl shadow-emerald-600/30 flex items-center gap-4 transition-all active:scale-95 disabled:opacity-50"
              >
                <Zap size={28} />
                Finalizar Leitura & Iniciar Quiz
              </button>
            </div>
          </motion.div>
        )}

        {view === 'quiz' && (
          <motion.div
            key="quiz"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="max-w-2xl mx-auto"
          >
            <div className="bg-white dark:bg-zinc-900 p-10 rounded-[3rem] shadow-2xl border border-stone-100 dark:border-zinc-800 space-y-8">
              {!isQuizFinished ? (
                <>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Zap className="text-amber-500" />
                      <span className="text-xs font-black uppercase tracking-widest text-stone-400">Pergunta {currentQuizIndex + 1} de 3</span>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-2 text-emerald-600 font-black">
                        <Timer size={16} />
                        <span className="text-sm">{quizTimer}s</span>
                      </div>
                      <div className="w-32 h-2 bg-stone-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                        <motion.div 
                          className="h-full bg-emerald-500"
                          initial={{ width: "100%" }}
                          animate={{ width: `${(quizTimer / 60) * 100}%` }}
                          transition={{ duration: 1, ease: "linear" }}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-2xl font-black tracking-tight leading-tight">
                      {quizQuestions[currentQuizIndex]?.question}
                    </h3>
                    <div className="grid grid-cols-1 gap-3">
                      {quizQuestions[currentQuizIndex]?.options.map((option, idx) => (
                        <button
                          key={`quiz-opt-${currentQuizIndex}-${idx}`}
                          onClick={() => handleQuizAnswer(idx)}
                          className="w-full text-left p-5 rounded-2xl border-2 border-stone-100 dark:border-zinc-800 hover:border-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 transition-all font-bold text-sm group flex items-center justify-between"
                        >
                          <span>{option}</span>
                          <ChevronRight size={16} className="opacity-0 group-hover:opacity-100 transition-all" />
                        </button>
                      ))}
                    </div>
                  </div>
                </>
              ) : (
                <div className="text-center space-y-8 py-8">
                  <div className="w-24 h-24 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
                    <Medal size={48} />
                  </div>
                  <div className="space-y-2">
                    <h2 className="text-4xl font-black tracking-tighter uppercase">Quiz Finalizado!</h2>
                    <p className="text-stone-500 dark:text-zinc-400 font-bold">Você acertou {quizScore} de 3 perguntas.</p>
                  </div>
                  
                  <div className="bg-stone-50 dark:bg-zinc-800/50 p-6 rounded-3xl border border-stone-100 dark:border-zinc-800">
                    <p className="text-[10px] font-black text-stone-400 uppercase tracking-widest mb-2">Aviso de IA</p>
                    <p className="text-xs text-stone-500 leading-relaxed">
                      As perguntas e pontuações são geradas por inteligência artificial e podem conter imprecisões. 
                      O objetivo é incentivar a leitura e o aprendizado.
                    </p>
                  </div>

                  <button 
                    onClick={() => setView('circuit')}
                    className="w-full py-5 bg-emerald-600 text-white font-black rounded-2xl hover:bg-emerald-700 shadow-xl shadow-emerald-600/20 transition-all active:scale-95"
                  >
                    Voltar ao Circuito
                  </button>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {renderRegulation()}

      {/* Message Modal */}
      <AnimatePresence>
        {isMessageModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMessageModalOpen(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-md bg-white dark:bg-zinc-900 rounded-[2.5rem] shadow-2xl overflow-hidden border border-stone-200 dark:border-zinc-800"
            >
              <div className="p-8">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-black tracking-tighter uppercase">Enviar Incentivo</h2>
                  <button onClick={() => setIsMessageModalOpen(false)} className="p-2 hover:bg-stone-100 dark:hover:bg-zinc-800 rounded-full">
                    <XCircle size={24} />
                  </button>
                </div>
                
                {selectedUserForMessage && (
                  <div className="flex items-center gap-3 mb-6 p-3 bg-stone-50 dark:bg-zinc-800/50 rounded-2xl">
                    <img src={selectedUserForMessage.userPhoto} className="w-10 h-10 rounded-full" referrerPolicy="no-referrer" />
                    <div>
                      <p className="text-sm font-bold">{selectedUserForMessage.userName}</p>
                      <p className="text-[10px] text-stone-400 uppercase font-black">Destinatário</p>
                    </div>
                  </div>
                )}

                <div className="space-y-3">
                  <p className="text-[10px] font-black text-stone-400 uppercase tracking-widest">Escolha uma mensagem:</p>
                  {[
                    "Parabéns pelo progresso! Continue firme!",
                    "Deus te abençoe nessa jornada!",
                    "Você está indo muito bem na corrida!",
                    "A Palavra de Deus é lâmpada para seus pés!",
                    "Vamos terminar essa Bíblia juntos!"
                  ].map((msg, idx) => (
                    <button
                      key={`incentive-msg-${idx}`}
                      onClick={() => sendMessage(msg)}
                      className="w-full text-left p-4 rounded-xl border border-stone-100 dark:border-zinc-800 hover:border-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 transition-all text-sm font-medium"
                    >
                      {msg}
                    </button>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default BibleRacePage;
