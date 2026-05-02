import React, { useState, useEffect, useRef } from 'react';
import { 
  GraduationCap, 
  BookOpen, 
  CheckCircle, 
  CheckCircle2,
  Lock,
  ArrowLeft, 
  ArrowRight, 
  Save, 
  X, 
  Trophy, 
  Zap, 
  ChevronRight,
  FileText,
  User,
  Search,
  Loader2,
  Info,
  Play,
  Presentation,
  Mic,
  Book,
  Sparkles,
  Copy,
  Share2,
  Award,
  Download,
  Brain,
  Cross,
  Flame,
  Crown,
  AlertTriangle,
  ShieldAlert,
  Heart,
  Users,
  Hourglass,
  Feather,
  Key,
  Youtube,
  Volume2,
  MessageSquare,
  StickyNote,
  RefreshCw,
  Shield,
  ShieldCheck,
  Scale,
  Maximize,
  Minimize,
  RotateCw,
  ZoomIn,
  ZoomOut
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { copyToClipboard } from '../utils/clipboard';
import { useToast } from '../components/Toast';
import { geminiService } from '../services/geminiService';
import { MarkdownRenderer } from '../components/MarkdownRenderer';
import { cn } from '../types';
import { useAccessibility } from '../contexts/AccessibilityContext';
import TheologySearchPage from './TheologySearchPage';
import { useNotebook } from '../contexts/NotebookContext';
import { useAuth } from '../contexts/AuthContext';
import { AudioSearchButton } from '../components/AudioSearchButton';
import { SearchLoadingOverlay } from '../components/SearchLoadingOverlay';
import { useCredits } from '../contexts/CreditContext';
import jsPDF from 'jspdf';

import { auth, db } from '../lib/firebase';
import { playCompletedBeep } from '../lib/audioUtils';
import { doc, getDoc, setDoc, updateDoc, onSnapshot, collection, addDoc, increment } from 'firebase/firestore';

enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

import { FeedbackSection } from '../components/FeedbackSection';

import { AudioConfirmationModal } from '../components/AudioConfirmationModal';

const handleFirestoreError = (error: unknown, operationType: OperationType, path: string | null) => {
  const errInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData.map(provider => ({
        providerId: provider.providerId,
        displayName: provider.displayName,
        email: provider.email,
        photoUrl: provider.photoURL
      })) || []
    },
    operationType,
    path
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
};

import { THEOLOGY_SUBJECTS, getMaxChapters } from '../constants/theology';

import { useShare } from '../utils/share';

interface TheologyPageProps {
  onNavigate: (tab: string) => void;
}

export default function TheologyPage({ onNavigate }: TheologyPageProps) {
  const { fontFamily, fontSize, lineHeight } = useAccessibility();
  const [isReadingMode, setIsReadingMode] = useState(false);
  const [readingFontSize, setReadingFontSize] = useState(18);
  const [readingLineHeight, setReadingLineHeight] = useState(1.6);
  const { user, isInitialLoading } = useAuth();
  const { share } = useShare();
  const { showToast } = useToast();
  const { balance, consumeCredits } = useCredits();
  
  // Initial state from localStorage with safety
  const [isEnrolled, setIsEnrolled] = useState(() => {
    try {
      return localStorage.getItem('theology_enrolled') === 'true';
    } catch (e) {
      return false;
    }
  });
  const [showSummary, setShowSummary] = useState(!isEnrolled);
  const [selectedSubject, setSelectedSubject] = useState<string | null>(null);
  const [showSubjectModal, setShowSubjectModal] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentChapter, setCurrentChapter] = useState(1);
  const [chapterContent, setChapterContent] = useState<Record<number, string>>({});
  const [chapterQuiz, setChapterQuiz] = useState<any[] | null>(null);
  const [chapterQuizAnswers, setChapterQuizAnswers] = useState<number[]>([]);
  const [isChapterQuizSubmitted, setIsChapterQuizSubmitted] = useState(false);
  const [isGeneratingChapterQuiz, setIsGeneratingChapterQuiz] = useState(false);
  const [studyStartTime, setStudyStartTime] = useState<number | null>(null);
  const [sessionStudyTime, setSessionStudyTime] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [theologyProgress, setTheologyProgress] = useState<Record<string, any>>({});
  const [showConclusionModal, setShowConclusionModal] = useState(false);
  const [showCertificatePaymentModal, setShowCertificatePaymentModal] = useState(false);
  const [conclusionText, setConclusionText] = useState('');
  const [isGeneratingConclusion, setIsGeneratingConclusion] = useState(false);

  // Assessment State
  const [showAssessmentModal, setShowAssessmentModal] = useState(false);
  const [isGeneratingAssessment, setIsGeneratingAssessment] = useState(false);
  const [assessmentQuestions, setAssessmentQuestions] = useState<any[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState<number[]>([]);
  const [assessmentResult, setAssessmentResult] = useState<{ score: number, message: string } | null>(null);
  const [isGeneratingSpeech, setIsGeneratingSpeech] = useState(false);
  const [isAudioConfirmModalOpen, setIsAudioConfirmModalOpen] = useState(false);
  const [pendingSpeechText, setPendingSpeechText] = useState<string | null>(null);

  const handleListen = async (text: string) => {
    if (!text) return;
    setPendingSpeechText(text);
    setIsAudioConfirmModalOpen(true);
  };

  const confirmGenerateSpeech = async () => {
    if (!pendingSpeechText) return;
    setIsAudioConfirmModalOpen(false);
    setIsGeneratingSpeech(true);
    showToast("Preparando a voz da IA... 🔊📖", 'info');
    try {
      const audioUrl = await geminiService.generateSpeech(pendingSpeechText);
      if (audioUrl) {
        const audio = new Audio(audioUrl);
        audio.oncanplaythrough = () => {
          audio.play().catch(e => console.error("Error playing audio:", e));
        };
        showToast("Iniciando leitura... Ouça com atenção! 🔊✨", 'success');
      } else {
        showToast("Erro ao gerar áudio.", 'error');
      }
    } catch (error) {
      console.error(error);
      showToast("Erro ao gerar áudio.", 'error');
    } finally {
      setIsGeneratingSpeech(false);
      setPendingSpeechText(null);
    }
  };

  // Summary Evaluation State
  const [showSummaryModal, setShowSummaryModal] = useState(false);
  const [summaryType, setSummaryType] = useState('');
  const [summaryText, setSummaryText] = useState('');
  const [isEvaluatingSummary, setIsEvaluatingSummary] = useState(false);
  const [isEnrolling, setIsEnrolling] = useState(false);
  const [summaryEvaluation, setSummaryEvaluation] = useState<{
    score: number;
    criteria: { label: string, penalty: number, met: boolean }[];
    message: string;
    aiFeedback?: string;
  } | null>(null);

  const [showFeedback, setShowFeedback] = useState(false);

  // Debate State
  const [showDebateModal, setShowDebateModal] = useState(false);
  const [isGeneratingDebate, setIsGeneratingDebate] = useState(false);
  const [debateContent, setDebateContent] = useState('');

  // Slides and Infographic State
  const [showSlidesModal, setShowSlidesModal] = useState(false);
  const [showInfographicModal, setShowInfographicModal] = useState(false);
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [isZoomed, setIsZoomed] = useState(false);
  const { saveToNotebook: saveToNotebookGlobal } = useNotebook();
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [rotation, setRotation] = useState(0);

  // Section Tracking State
  const currentSectionRef = useRef('HOME');
  const sectionStartTimeRef = useRef(Date.now());
  const [hasAcceptedTerms, setHasAcceptedTerms] = useState<boolean | null>(null);

  useEffect(() => {
    if (user) {
      const checkTerms = async () => {
        try {
          const docRef = doc(db, 'theologyTermsAcceptance', user.id);
          const docSnap = await getDoc(docRef);
          setHasAcceptedTerms(docSnap.exists());
        } catch (error) {
          console.error("Error checking terms:", error);
          setHasAcceptedTerms(false);
        }
      };
      checkTerms();
    } else {
      setHasAcceptedTerms(true);
    }
  }, [user]);

  const handleAcceptTerms = async () => {
    if (!user) return;
    try {
      await setDoc(doc(db, 'theologyTermsAcceptance', user.id), {
        userId: user.id,
        acceptedAt: new Date().toISOString()
      });
      setHasAcceptedTerms(true);
      showToast("Termos aceitos com sucesso!", "success");
    } catch (error) {
      console.error("Error accepting terms:", error);
      showToast("Erro ao aceitar termos.", "error");
    }
  };

  const triggerFeedback = () => {
    playCompletedBeep();
    setShowFeedback(true);
    setTimeout(() => setShowFeedback(false), 2000);
  };

  const getActiveSection = () => {
    if (showSearch) return 'SEARCH';
    if (showSlidesModal) return `SLIDES_${selectedSubject || 'UNKNOWN'}`;
    if (showInfographicModal) return `INFOGRAPHIC_${selectedSubject || 'UNKNOWN'}`;
    if (showDebateModal) return `DEBATE_${selectedSubject || 'UNKNOWN'}`;
    if (showAssessmentModal) return `ASSESSMENT_${selectedSubject || 'UNKNOWN'}`;
    if (showSummaryModal) return `SUMMARY_${selectedSubject || 'UNKNOWN'}`;
    if (showSubjectModal) return `OVERVIEW_${selectedSubject || 'UNKNOWN'}`;
    if (selectedSubject) return `STUDY_${selectedSubject}`;
    return 'HOME';
  };

  const saveSectionTime = async (section: string, seconds: number) => {
    if (!user || seconds <= 0) return;
    try {
      const progressDocRef = doc(db, 'theologyProgress', user.id);
      
      const updates: any = {
        [`sectionMetrics.${section}`]: increment(seconds),
        lastActive: new Date().toISOString()
      };

      // If it's a study section, also update the main study time for points
      if (section.startsWith('STUDY_')) {
        const subject = section.replace('STUDY_', '');
        // Fetch latest data to ensure points are calculated correctly
        const docSnap = await getDoc(progressDocRef);
        const currentData = docSnap.exists() ? docSnap.data() : {};
        const subjectData = currentData[subject] || {};
        const totalSeconds = (subjectData.studyTime || 0) + seconds;
        
        let studyPoints = 0;
        const minutes = totalSeconds / 60;
        if (minutes > 0 && minutes <= 60) studyPoints = 5;
        else if (minutes > 60 && minutes <= 120) studyPoints = 10;
        else if (minutes > 120) studyPoints = 15;

        updates[subject] = {
          ...subjectData,
          studyTime: totalSeconds,
          studyPoints: studyPoints
        };
        
        // Sync to career will happen after update
        setTimeout(() => syncPointsToCareer(subject, updates[subject]), 1000);
      }

      await setDoc(progressDocRef, updates, { merge: true });
    } catch (error) {
      console.error("Error saving section time:", error);
    }
  };

  useEffect(() => {
    const newSection = getActiveSection();
    if (newSection !== currentSectionRef.current) {
      const duration = Math.floor((Date.now() - sectionStartTimeRef.current) / 1000);
      saveSectionTime(currentSectionRef.current, duration);
      currentSectionRef.current = newSection;
      sectionStartTimeRef.current = Date.now();
    }
  }, [
    showSearch, 
    showSlidesModal, 
    showInfographicModal, 
    showDebateModal, 
    showAssessmentModal, 
    showSummaryModal, 
    showSubjectModal, 
    selectedSubject
  ]);

  useEffect(() => {
    return () => {
      const duration = Math.floor((Date.now() - sectionStartTimeRef.current) / 1000);
      saveSectionTime(currentSectionRef.current, duration);
    };
  }, []);

  const BIBLIOLOGIA_SLIDES = [
    "https://i.postimg.cc/Y2fCsmnr/Slide1.png",
    "https://i.postimg.cc/BZcnV1Yq/Slide2.png",
    "https://i.postimg.cc/44bxShL4/Slide3.png",
    "https://i.postimg.cc/sf9gNZ63/Slide4.png",
    "https://i.postimg.cc/h4bt57yG/Slide5.png",
    "https://i.postimg.cc/1Rc3jNCX/Slide6.png",
    "https://i.postimg.cc/QNkdyW4t/Slide7.png",
    "https://i.postimg.cc/xjy14bxq/Slide8.png",
    "https://i.postimg.cc/Wp61HJWd/Slide9.png",
    "https://i.postimg.cc/HsYkDsRd/Slide10.png",
    "https://i.postimg.cc/wTqj8TZx/Slide11.png",
    "https://i.postimg.cc/hPDtWP6D/Slide12.png",
    "https://i.postimg.cc/28kSR8MS/Slide13.png",
    "https://i.postimg.cc/ncFhbcgL/Slide14.png",
    "https://i.postimg.cc/RVSZ5VyN/Slide15.png",
    "https://i.postimg.cc/WbN1LbCF/Slide16.png",
    "https://i.postimg.cc/wTqj8TZt/Slide17.png"
  ];

  const TEONTOLOGIA_SLIDES = [
    "https://i.postimg.cc/VLhvqPZm/Slide1.png",
    "https://i.postimg.cc/wTrMXY4T/Slide2.png",
    "https://i.postimg.cc/VLhvqPZY/Slide3.png",
    "https://i.postimg.cc/rFHs12Zq/Slide4.png",
    "https://i.postimg.cc/X7Pqf61X/Slide5.png",
    "https://i.postimg.cc/m2nkYWpk/Slide6.png",
    "https://i.postimg.cc/9Fk0dHgr/Slide7.png",
    "https://i.postimg.cc/fTPycQqV/Slide8.png",
    "https://i.postimg.cc/024jY1Xm/Slide9.png",
    "https://i.postimg.cc/YqP06BDQ/Slide10.png",
    "https://i.postimg.cc/hPYvLRZT/Slide11.png",
    "https://i.postimg.cc/15dXG17r/Slide12.png",
    "https://i.postimg.cc/8zr5wXxv/Slide13.png"
  ];

  const BIBLIOLOGIA_INFOGRAPHIC = "https://picsum.photos/seed/bibliologia-infographic/1200/1600";

  if (isInitialLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <Loader2 className="animate-spin text-emerald-600 mb-4" size={48} />
        <p className="text-stone-500 font-medium animate-pulse">Carregando seu perfil...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
        <div className="w-20 h-20 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 rounded-full flex items-center justify-center mb-6">
          <GraduationCap size={40} />
        </div>
        <h2 className="text-3xl font-display font-bold text-stone-900 dark:text-zinc-100 mb-4">
          Acesso Restrito
        </h2>
        <p className="text-stone-500 dark:text-zinc-400 max-w-md mb-8">
          Faça login para acessar o Curso de Teologia Básica e acompanhar seu progresso.
        </p>
      </div>
    );
  }

  useEffect(() => {
    if (!user) return;
    
    const progressDocRef = doc(db, 'theologyProgress', user.id);
    const unsubscribe = onSnapshot(progressDocRef, (doc) => {
      if (doc.exists()) {
        setTheologyProgress(doc.data());
      }
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, `theologyProgress/${user.id}`);
    });

    return () => unsubscribe();
  }, [user]);

  const syncPointsToCareer = async (subject: string, updatedProgress: any) => {
    if (!user) return;
    
    // Calculate total points for this subject
    const evalScore = updatedProgress.evaluation || 0;
    const redMateria = updatedProgress.redacaoMateria || 0;
    const redAprofundamento = updatedProgress.redacaoAprofundamento || 0;
    const redSlide = updatedProgress.redacaoSlide || 0;
    const redVideo = updatedProgress.redacaoVideo || 0;
    const redPodcast = updatedProgress.redacaoPodcast || 0;
    const quizPoints = updatedProgress.quizPoints || 0;
    const studyPoints = updatedProgress.studyPoints || 0;
    const subjectTotal = evalScore + redMateria + redAprofundamento + redSlide + redVideo + redPodcast + quizPoints + studyPoints;

    // We need to calculate the grand total across all subjects
    // Since theologyProgress might be stale in the state, we fetch the latest
    try {
      const progressDoc = await getDoc(doc(db, 'theologyProgress', user.id));
      if (progressDoc.exists()) {
        const allProgress = progressDoc.data();
        // Merge the current update
        allProgress[subject] = updatedProgress;
        
        const grandTotal = Object.keys(allProgress).reduce((acc, key) => {
          if (key === 'userId' || key === 'enrolled') return acc;
          const data = allProgress[key] || {};
          const sTotal = (data.evaluation || 0) + 
                         (data.redacaoMateria || 0) + 
                         (data.redacaoAprofundamento || 0) + 
                         (data.redacaoSlide || 0) + 
                         (data.redacaoVideo || 0) + 
                         (data.redacaoPodcast || 0) + 
                         (data.quizPoints || 0) + 
                         (data.studyPoints || 0);
          return acc + sTotal;
        }, 0);

        // Update careerProgress points
        const careerDocRef = doc(db, 'careerProgress', user.id);
        const careerDoc = await getDoc(careerDocRef);
        
        if (careerDoc.exists()) {
          const careerData = careerDoc.data();
          const bibleRacePoints = careerData.bibleRacePoints || 0;
          const evangelismPoints = careerData.evangelismPoints || 0;
          const storytellingPoints = careerData.storytellingPoints || 0;
          await updateDoc(careerDocRef, { 
            theologyPoints: grandTotal,
            points: grandTotal + bibleRacePoints + evangelismPoints + storytellingPoints,
            name: user.name,
            avatar: user.photoURL,
            updatedAt: new Date().toISOString()
          });
        } else {
          await setDoc(careerDocRef, {
            userId: user.id,
            name: user.name,
            avatar: user.photoURL,
            theologyPoints: grandTotal,
            bibleRacePoints: 0,
            evangelismPoints: 0,
            storytellingPoints: 0,
            points: grandTotal,
            rankId: 1,
            stars: 0,
            authorized: false,
            updatedAt: new Date().toISOString()
          });
        }
      }
    } catch (error) {
      console.error("Error syncing points to career:", error);
    }
  };

  const updateStudyTime = async (subject: string, seconds: number) => {
    if (!user) return;
    const current = theologyProgress[subject] || {};
    const totalSeconds = (current.studyTime || 0) + seconds;
    
    // Calculate study points
    // Até uma hora de estudo: 5 pontos. De 61 minutos até 120 minutos: 10 pontos. Acima de 121 minutos: 15 pontos.
    let studyPoints = 0;
    const minutes = totalSeconds / 60;
    if (minutes > 0 && minutes <= 60) studyPoints = 5;
    else if (minutes > 60 && minutes <= 120) studyPoints = 10;
    else if (minutes > 120) studyPoints = 15;

    const newSubjectProgress = {
      ...current,
      studyTime: totalSeconds,
      studyPoints: studyPoints
    };

    const progressDocRef = doc(db, 'theologyProgress', user.id);
    await updateDoc(progressDocRef, {
      [subject]: newSubjectProgress
    });
    
    await syncPointsToCareer(subject, newSubjectProgress);
  };

  const generateChapterQuiz = async (content: string) => {
    setIsGeneratingChapterQuiz(true);
    try {
      const prompt = `Com base no conteúdo deste capítulo de teologia, gere um questionário de 4 perguntas chaves de múltipla escolha.
      Cada questão deve ter exatamente 3 opções de resposta.
      O questionário é obrigatório para o aluno avançar para o próximo capítulo.
      Retorne APENAS um JSON válido no seguinte formato:
      {
        "questions": [
          {
            "question": "Texto da pergunta",
            "options": ["Opção 1", "Opção 2", "Opção 3"],
            "correctIndex": 0
          }
        ]
      }
      
      Conteúdo do capítulo:
      ${content.substring(0, 2000)}`;

      const response = await geminiService.generateText(prompt, "Você é um professor de teologia que cria questões precisas e didáticas.");
      const data = JSON.parse(response.replace(/```json|```/g, '').trim());
      setChapterQuiz(data.questions);
      setChapterQuizAnswers([]);
      setIsChapterQuizSubmitted(false);
    } catch (error) {
      console.error("Error generating chapter quiz:", error);
    } finally {
      setIsGeneratingChapterQuiz(false);
    }
  };

  const handleEnroll = async () => {
    if (!user) return;
    setIsEnrolling(true);
    try {
      setIsEnrolled(true);
      localStorage.setItem('theology_enrolled', 'true');
      
      // Initialize progress in Firestore if it doesn't exist
      const progressDocRef = doc(db, 'theologyProgress', user.id);
      const progressDoc = await getDoc(progressDocRef);
      if (!progressDoc.exists()) {
        await setDoc(progressDocRef, { userId: user.id, enrolled: true });
      }

      setShowSummary(false);
      showToast("Inscrição realizada com sucesso! Bem-vindo ao curso. 🎓", 'success');
      onNavigate('student-profile');
    } catch (error) {
      console.error("Error enrolling:", error);
      showToast("Erro ao realizar inscrição.", 'error');
    } finally {
      setIsEnrolling(false);
    }
  };

  const generateAndSaveAll = async () => {
    if (!user || user.email !== 'missoeselroi@gmail.com') return;
    showToast("Iniciando geração de todo o currículo... Isso pode demorar.", 'info');
    for (const subject of THEOLOGY_SUBJECTS) {
      const maxChapters = getMaxChapters(subject.title);
      for (let i = 1; i <= maxChapters; i++) {
        await loadChapter(subject.title, i);
      }
    }
    showToast("Currículo gerado com sucesso!", 'success');
  };

  const handleSubjectClick = (subject: string) => {
    const subjectData = THEOLOGY_SUBJECTS.find(s => s.title === subject);
    if (subjectData?.prereq && (!theologyProgress[subjectData.prereq] || !theologyProgress[subjectData.prereq].completed)) {
      showToast(`Você precisa concluir ${subjectData.prereq} primeiro! 🔒`, 'info');
      return;
    }
    setSelectedSubject(subject);
    setShowSubjectModal(true);
  };

  const updateDetailedProgress = async (subject: string, field: string) => {
    if (!user) return;
    const current = theologyProgress[subject] || {};
    const newSubjectProgress = {
      ...current,
      [field]: true
    };
    
    const progressDocRef = doc(db, 'theologyProgress', user.id);
    await updateDoc(progressDocRef, {
      [subject]: newSubjectProgress
    });

    triggerFeedback();
    showToast(`Atividade acessada! ✨`, 'success');
  };

  const handleSubjectSelect = async (subject: string) => {
    setSelectedSubject(subject);
    setShowSubjectModal(false);
    setCurrentChapter(1);
    setChapterContent({});
    loadChapter(subject, 1);
  };

  const loadChapter = async (subject: string, chapter: number) => {
    if (chapterContent[chapter]) return;
    
    setIsLoading(true);
    try {
      // 1. Check shared materials first
      const materialId = `${subject.replace(/\s+/g, '_')}_${chapter}`;
      const materialDocRef = doc(db, 'shared_theology_materials', materialId);
      const materialDoc = await getDoc(materialDocRef);
      
      if (materialDoc.exists()) {
        const data = materialDoc.data();
        setChapterContent(prev => ({ ...prev, [chapter]: data.content }));
        await generateChapterQuiz(data.content);
        setIsLoading(false);
        return;
      }

      let subjectSpecificPrompt = "";
      if (subject === 'Teologia Sistemática (Calvinista e Arminiana)') {
        subjectSpecificPrompt = "Apresente de forma equilibrada e profunda as perspectivas Calvinista e Arminiana sobre o tema do capítulo.";
      } else if (subject === 'Exegética') {
        subjectSpecificPrompt = "Foque na análise gramatical, sintática e no contexto histórico-cultural do texto bíblico. Inclua um passo a passo prático de exegese.";
      } else if (subject === 'Homilética') {
        subjectSpecificPrompt = "Inclua exemplos práticos de esboços de sermões e técnicas de oratória e comunicação.";
      } else if (subject === 'Evangelismo/Missões') {
        subjectSpecificPrompt = "Apresente estratégias práticas de evangelismo pessoal e transcultural, com foco em missões modernas.";
      } else if (subject === 'Liderança Cristã') {
        subjectSpecificPrompt = `Explore os modelos de liderança na Bíblia. Inclua obrigatoriamente um capítulo dedicado a "Autoridade e Submissão" (autoridades instituídas, submissão à luz da Palavra, mundo espiritual). Enfatize o papel do líder cristão: servir, amar, proteger e cuidar, seguindo o exemplo de Cristo com Seus discípulos. Aborde o conceito do Bom Pastor que dá a vida pelas ovelhas, a diferença entre autoridade e autoritarismo, e a corrupção do poder.`;
      } else if (subject === 'Filosofia') {
        subjectSpecificPrompt = `Gere o material baseado nas seguintes fontes:
        - Filosofia Essencial para Cristãos (Filipe Fontes, Jonas Madureira)
        - O Líder Cristão (A.W. Tozer)
        - O Custo do Discipulado (Dietrich Bonhoeffer)
        - Confissões (Santo Agostinho)
        - Filosofia Essencial para Cristãos (C.S. Lewis)
        
        Aborde os conceitos fundamentais da filosofia sob uma ótica cristã, explorando a relação entre fé e razão, ética, moral e a busca pela verdade.`;
      } else if (subject === 'Sociologia') {
        subjectSpecificPrompt = `Gere o material baseado nas seguintes fontes:
        - O Cristão e a Sociologia (David Lyon)
        - Cristianismo Puro e Simples (C.S. Lewis)
        - Sociedade e Espiritualidade (Ed. Vida Nova)
        - Antropologia Cultural: Uma Perspectiva Cristã (Paul G. Hiebert)
        - A Política de Jesus (John Howard Yoder)
        - Religião e Revolução (Wallace Cabral Ribeiro)
        - A Busca da Moral (Stanley Grenz)
        - Sociologia (Anthony Giddens)
        
        Aborde como a sociedade é estabelecida, conceitos de antropologia, etnocentrismo, cultura, luta de classes, sistemas políticos e os deveres do cidadão cristão na sociedade.`;
      } else if (subject === 'Apologética') {
        subjectSpecificPrompt = `Gere o material baseado nas fontes das Bíblias apologéticas. 
        Cite todas as religiões, seitas e igrejas heréticas presentes no Brasil. 
        
        DEFINIÇÃO DE SEITA (Use obrigatoriamente):
        Seitas são religiões e igrejas que não aceitam a Trindade (Deus Pai, Deus Filho e Deus Espírito Santo). Não reconhecem qualquer um como Deus e Pessoa. Seitas também acrescentam outras divindades ou atribuem os atributos incomunicáveis de Deus para os homens. Adição ou retirada de livros e ensinamentos inspirados além da Bíblia.

        SINAIS DE UMA SEITA (Aborde detalhadamente):
        1. Exclusivismo: Dizer ser a única igreja verdadeira.
        2. Falsas Profecias: Líderes que profetizam e não se cumpre.
        3. Escravidão Espiritual: Controle excessivo sobre a vida dos membros.
        4. Negação da Divindade de Cristo ou da Trindade.
        5. Fontes de autoridade além da Bíblia.

        CATEGORIAS A ABORDAR:
        - Religiões Orientais (Budismo, Hinduísmo, etc.)
        - Seitas Pseudo-Cristãs (Testemunhas de Jeová, Mórmons, Adventismo - analisar pontos doutrinários, etc.)
        - Espiritismo e suas vertentes.
        - Religiões de Matriz Africana.
        - Movimentos Heréticos Modernos.
        
        Apresente a defesa bíblica para cada ponto de heresia encontrado.`;
      } else if (subject === 'As Dispensações') {
        subjectSpecificPrompt = `Gere a matéria baseada na Bíblia Scofield e nas obras de C.I. Scofield, Zélio Cabral e Jacques André-Monard. Insira um capítulo para cada uma das sete dispensações (Inocência, Consciência, Governo Humano, Promessa, Lei, Graça e Reino). Explique detalhadamente cada período, a responsabilidade do homem, o fracasso e o julgamento divino em cada dispensação.`;
      }

      const maxChapters = getMaxChapters(subject);
      const prompt = `Gere o Capítulo ${chapter} de ${maxChapters} do estudo teológico sobre "${subject}". 
      O conteúdo deve ser profundo, acadêmico e bíblico.
      ${subjectSpecificPrompt}
      
      IMPORTANTE: Ao final do conteúdo, inclua uma seção chamada "--- EXERCÍCIO PRÁTICO ---" com uma atividade prática para o aluno realizar (ex: elaborar um esboço, analisar um versículo, planejar uma ação evangelística, etc).`;

      const response = await geminiService.generateText(prompt, "Você é um professor de teologia sistemática e prática, mestre em exegese e homilética.");
      
      // Save to shared ONLY if admin
      if (user?.email === 'missoeselroi@gmail.com') {
        await setDoc(materialDocRef, {
          content: response,
          subject,
          chapter,
          createdAt: new Date().toISOString()
        });
      }

      setChapterContent(prev => ({ ...prev, [chapter]: response }));
      await generateChapterQuiz(response);
    } catch (error) {
      console.error(error);
      showToast("Erro ao carregar capítulo.", 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const calculateQuizScore = () => {
    if (!chapterQuiz) return 0;
    let correct = 0;
    chapterQuiz.forEach((q, i) => {
      if (chapterQuizAnswers[i] === q.correctIndex) correct++;
    });
    return correct;
  };

  const submitChapterQuiz = async () => {
    if (!user || !selectedSubject || !chapterQuiz) return;
    
    const score = calculateQuizScore();
    setIsChapterQuizSubmitted(true);
    
    if (score < 4) {
      showToast(`Você acertou ${score} de 4. Revise o conteúdo e tente novamente!`, 'error');
      return;
    }

    showToast("Parabéns! Você acertou todas as questões e pode avançar! 🎉", 'success');
    triggerFeedback();

    // Update points in profile
    // Cada resposta certa vale um ponto
    const current = theologyProgress[selectedSubject] || {};
    
    // Track points per chapter to avoid farming
    const chapterKey = `chapter${currentChapter}QuizPoints`;
    const oldChapterPoints = current[chapterKey] || 0;
    
    // Only update if the new score is higher
    const newChapterPoints = Math.max(oldChapterPoints, score);
    
    // Calculate total quiz points for the subject
    let totalQuizPoints = 0;
    const maxChapters = getMaxChapters(selectedSubject);
    for (let i = 1; i <= maxChapters; i++) {
      if (i === currentChapter) {
        totalQuizPoints += newChapterPoints;
      } else {
        totalQuizPoints += (current[`chapter${i}QuizPoints`] || 0);
      }
    }
    
    const newSubjectProgress = {
      ...current,
      [chapterKey]: newChapterPoints,
      quizPoints: totalQuizPoints,
      [`chapter${currentChapter}Completed`]: true
    };

    const progressDocRef = doc(db, 'theologyProgress', user.id);
    await updateDoc(progressDocRef, {
      [selectedSubject]: newSubjectProgress
    });
    
    await syncPointsToCareer(selectedSubject, newSubjectProgress);
  };

  const handleNextChapter = () => {
    if (!isChapterQuizSubmitted || calculateQuizScore() < 4) {
      showToast("Você precisa acertar todas as 4 questões do questionário para avançar! 📖", 'info');
      return;
    }
    const maxChapters = getMaxChapters(selectedSubject!);
    if (currentChapter < maxChapters) {
      const next = currentChapter + 1;
      setCurrentChapter(next);
      loadChapter(selectedSubject!, next);
      window.scrollTo(0, 0);
    }
  };

  const handlePrevChapter = () => {
    if (currentChapter > 1) {
      setCurrentChapter(currentChapter - 1);
    }
  };

  const markSubjectAsCompleted = async (e: React.MouseEvent, subjectTitle: string) => {
    e.stopPropagation();
    if (!user) return;
    const current = theologyProgress[subjectTitle] || {};
    const newSubjectProgress = { ...current, completed: true };
    
    const progressDocRef = doc(db, 'theologyProgress', user.id);
    await updateDoc(progressDocRef, {
      [subjectTitle]: newSubjectProgress
    });
    
    showToast(`Matéria ${subjectTitle} marcada como concluída! ✅`, 'success');
  };

  const saveToNotebook = () => {
    const title = `Teologia: ${selectedSubject} - Cap ${currentChapter}`;
    const content = chapterContent[currentChapter];
    if (content) {
      saveToNotebookGlobal(title, content);
    }
  };

  const handleOpenConclusion = async () => {
    setShowConclusionModal(true);
    if (conclusionText) return;
    
    setIsGeneratingConclusion(true);
    try {
      const prompt = `Gere uma mensagem curta, mas muito vibrante e emocionante de parabenização para um aluno que acaba de terminar o Curso de Teologia Básica.
      Parabenize-o por toda a dedicação a conhecer mais de Deus e por aprender ferramentas para melhor servi-lo. 
      Seja inspirador, bíblico e encorajador.`;
      
      const response = await geminiService.generateText(prompt, "Você é um diretor de seminário teológico sábio e muito encorajador.");
      setConclusionText(response || "Parabéns por concluir o curso! Que Deus abençoe sua jornada.");
    } catch (error) {
      console.error(error);
      setConclusionText("Parabéns por concluir o curso de Teologia Básica! Que a Palavra de Deus continue sendo a lâmpada para os seus pés. Continue crescendo na graça e no conhecimento!");
    } finally {
      setIsGeneratingConclusion(false);
    }
  };

  const handleGenerateCertificate = async () => {
    if (!user) return;
    
    if (balance < 30) {
      showToast("Créditos insuficientes para o certificado do curso completo (30 créditos). 💎", "error");
      return;
    }

    showToast("Gerando certificado em PDF... 📄💎", 'info');
    
    try {
      // Consume credits
      await consumeCredits(30, 'theology_full_certificate');

      // Save to Firestore first
      const certData = {
        userId: user.id,
        subject: 'Curso de Teologia Básica (Completo)',
        type: 'FULL_COURSE',
        date: new Date().toLocaleDateString('pt-BR'),
        issuedAt: new Date().toISOString()
      };
      
      await addDoc(collection(db, 'theologyCertificates'), certData).catch(err => handleFirestoreError(err, OperationType.CREATE, 'theologyCertificates'));

      // Generate PDF
      const docPdf = new jsPDF('l', 'mm', 'a4');
      const width = docPdf.internal.pageSize.getWidth();
      const height = docPdf.internal.pageSize.getHeight();

      // Border
      docPdf.setLineWidth(2);
      docPdf.setDrawColor(29, 78, 216); // navy blue
      docPdf.rect(10, 10, width - 20, height - 20);
      docPdf.setLineWidth(0.5);
      docPdf.rect(12, 12, width - 24, height - 24);

      // Title
      docPdf.setFont('helvetica', 'bold');
      docPdf.setFontSize(36);
      docPdf.setTextColor(29, 78, 216);
      docPdf.text("CERTIFICADO DE CONCLUSÃO", width / 2, 40, { align: 'center' });

      // Subtitle
      docPdf.setFontSize(20);
      docPdf.setTextColor(100, 100, 100);
      docPdf.text("Curso de Teologia Básica", width / 2, 55, { align: 'center' });

      // Body
      docPdf.setFont('helvetica', 'normal');
      docPdf.setFontSize(14);
      docPdf.setTextColor(50, 50, 50);
      const studentName = user?.name || 'Aluno';
      const bodyText = `Certificamos que ${studentName} concluiu com êxito o Curso de Teologia Básica do App Imersão Bíblia IA.`;
      docPdf.text(bodyText, width / 2, 75, { align: 'center', maxWidth: width - 40 });

      // Subjects & Hours
      docPdf.setFontSize(12);
      docPdf.text("Matérias concluídas:", 20, 100);
      docPdf.setFontSize(10);
      const subjects = THEOLOGY_SUBJECTS.map(s => s.title).join(', ');
      docPdf.text(subjects, 20, 108, { maxWidth: width - 40 });
      
      docPdf.setFont('helvetica', 'bold');
      docPdf.text("Carga Horária Aproximada: 120 horas", 20, 125);

      // Verse
      docPdf.setFont('helvetica', 'italic');
      docPdf.setFontSize(12);
      docPdf.setTextColor(100, 100, 100);
      const verse = '"Procura apresentar-te a Deus aprovado, como obreiro que não tem de que se envergonhar, que maneja bem a palavra da verdade." (2 Timóteo 2:15)';
      docPdf.text(verse, width / 2, 145, { align: 'center', maxWidth: width - 60 });

      // Signatures
      docPdf.setFont('helvetica', 'normal');
      docPdf.setFontSize(10);
      docPdf.setTextColor(0, 0, 0);
      const sigY = 180;
      
      // Aluno
      docPdf.line(30, sigY, 90, sigY);
      docPdf.text("Assinatura do Aluno", 60, sigY + 5, { align: 'center' });
      docPdf.text(studentName, 60, sigY + 10, { align: 'center' });

      // Monitor
      docPdf.line(118, sigY, 178, sigY);
      docPdf.text("Monitor", 148, sigY + 5, { align: 'center' });
      docPdf.text("wreis29@gmail.com", 148, sigY + 10, { align: 'center' });

      // Coordenador
      docPdf.line(206, sigY, 266, sigY);
      docPdf.text("Coordenador Pedagógico", 236, sigY + 5, { align: 'center' });
      docPdf.text("imersaobiblicapp@gmail.com", 236, sigY + 10, { align: 'center' });

      docPdf.save("Certificado_Teologia_Basica.pdf");
      showToast("Certificado gerado com sucesso! 🎓✅", "success");
      setShowCertificatePaymentModal(false);

      // Open email client
      const emailBody = `Olá, ${studentName}!\n\nParabéns por toda a sua dedicação a conhecer mais de Deus e aprender ferramentas para melhor servi-lo! É uma alegria ver você concluir o Curso de Teologia Básica.\n\nSegue em anexo o seu certificado de conclusão (que você acabou de baixar no aplicativo).\n\nNota: O certificado estará sendo assinado pelo Monitor e pelo Coordenador Pedagógico.\n\nDeus abençoe sua jornada!`;
      const mailtoLink = `mailto:${user?.email || ''}?cc=wreis29@gmail.com,imersaobiblicapp@gmail.com&subject=Certificado de Conclusão - Teologia Básica&body=${encodeURIComponent(emailBody)}`;
      setTimeout(() => {
        window.location.href = mailtoLink;
      }, 500);
      
    } catch (error) {
      console.error("Error generating certificate:", error);
      showToast("Erro ao gerar certificado.", "error");
    }
  };

  const handleGenerateSubjectCertificate = async (subject: string) => {
    if (!user) return;
    
    if (balance < 5) {
      showToast("Créditos insuficientes para o certificado da matéria (5 créditos). 💎", "error");
      return;
    }

    showToast("Gerando certificado da matéria... 📄💎", 'info');
    
    try {
      // Consume credits
      await consumeCredits(5, 'theology_subject_certificate');

      // Save to Firestore
      const certData = {
        userId: user.id,
        subject: subject,
        type: 'SUBJECT',
        date: new Date().toLocaleDateString('pt-BR'),
        issuedAt: new Date().toISOString()
      };
      
      await addDoc(collection(db, 'theologyCertificates'), certData).catch(err => handleFirestoreError(err, OperationType.CREATE, 'theologyCertificates'));

      // Generate PDF
      const docPdf = new jsPDF('l', 'mm', 'a4');
      const width = docPdf.internal.pageSize.getWidth();
      const height = docPdf.internal.pageSize.getHeight();

      // Border
      docPdf.setLineWidth(2);
      docPdf.setDrawColor(16, 185, 129); // emerald-500
      docPdf.rect(10, 10, width - 20, height - 20);
      docPdf.setLineWidth(0.5);
      docPdf.rect(12, 12, width - 24, height - 24);

      // Title
      docPdf.setFont('helvetica', 'bold');
      docPdf.setFontSize(30);
      docPdf.setTextColor(16, 185, 129);
      docPdf.text("CERTIFICADO DE CONCLUSÃO DE MATÉRIA", width / 2, 45, { align: 'center' });

      // Subtitle
      docPdf.setFontSize(22);
      docPdf.setTextColor(100, 100, 100);
      docPdf.text(subject, width / 2, 60, { align: 'center' });

      // Body
      docPdf.setFont('helvetica', 'normal');
      docPdf.setFontSize(16);
      docPdf.setTextColor(50, 50, 50);
      const studentName = user?.name || 'Aluno';
      const bodyText = `Certificamos que ${studentName} concluiu com êxito a matéria de ${subject} no Curso de Teologia Básica do App Imersão Bíblia IA.`;
      docPdf.text(bodyText, width / 2, 85, { align: 'center', maxWidth: width - 60 });

      // Verse
      docPdf.setFont('helvetica', 'italic');
      docPdf.setFontSize(12);
      docPdf.setTextColor(100, 100, 100);
      const verse = '"Estuda para te apresentares a Deus aprovado..." (2 Timóteo 2:15)';
      docPdf.text(verse, width / 2, 140, { align: 'center', maxWidth: width - 60 });

      // Signatures
      docPdf.setFont('helvetica', 'normal');
      docPdf.setFontSize(10);
      docPdf.setTextColor(0, 0, 0);
      const sigY = 175;
      
      docPdf.line(width / 2 - 40, sigY, width / 2 + 40, sigY);
      docPdf.text("Coordenação Pedagógica", width / 2, sigY + 5, { align: 'center' });
      docPdf.text("Imersão Bíblica IA", width / 2, sigY + 10, { align: 'center' });

      docPdf.save(`Certificado_${subject.replace(/\s+/g, '_')}.pdf`);
      showToast("Certificado da matéria gerado com sucesso! 🎓✅", "success");
    } catch (error) {
      console.error("Error generating subject certificate:", error);
      showToast("Erro ao gerar certificado.", "error");
    }
  };

  const openSummaryModal = (type: string) => {
    if (selectedSubject === 'Bibliologia') {
      if (type === 'Vídeo-Aula') {
        window.open("https://youtu.be/P2YVpigLsCY", "_blank");
        return;
      }
      if (type === 'Videocast') {
        window.open("https://youtu.be/P2YVpigLsCY", "_blank");
        return;
      }
    }
    if (selectedSubject === 'Teontologia') {
      if (type === 'Videocast') {
        window.open("https://youtu.be/UJqaYmjdBEg?si=g-dccKDeZLPYhK-B", "_blank");
        return;
      }
    }
    setSummaryType(type);
    setSummaryText('');
    setSummaryEvaluation(null);
    setShowSummaryModal(true);
  };

  const evaluateSummary = async () => {
    const wordCount = summaryText.trim() ? summaryText.trim().split(/\s+/).length : 0;
    if (wordCount < 10) {
      showToast("Escreva um pouco mais antes de avaliar! ✍️", 'info');
      return;
    }

    setIsEvaluatingSummary(true);
    showToast("Avaliando seu resumo... 🤖", 'info');

    let score = 5;
    const criteria = [
      { label: 'Repetições excessivas', penalty: 0.5, met: true },
      { label: 'Palavras de baixo calão', penalty: 1, met: true },
      { label: 'Fuga do tema', penalty: 1, met: true },
      { label: 'Mínimo de 100 palavras', penalty: 0.5, met: true },
      { label: 'Coerência textual', penalty: 1, met: true },
    ];

    const words = (summaryText.toLowerCase().match(/\b\w+\b/g) || []) as string[];
    const wordFreq: Record<string, number> = {};
    words.forEach(w => { if(w.length > 3) wordFreq[w] = (wordFreq[w] || 0) + 1; });
    const hasExcessiveRepetition = Object.values(wordFreq).some(count => count > words.length * 0.1);
    if (hasExcessiveRepetition) { score -= 0.5; criteria[0].met = false; }

    const badWords = ['palavrão1', 'palavrão2'];
    const hasBadWords = words.some(w => badWords.includes(w));
    if (hasBadWords) { score -= 1; criteria[1].met = false; }

    const themeKeywords = ['deus', 'jesus', 'bíblia', 'teologia', 'espírito', 'igreja', 'fé', 'graça', 'pecado', 'salvação', 'cristo', 'senhor', 'palavra', 'ensino', 'estudo', 'resumo', 'doutrina', 'homem', 'anjos', 'escatologia', 'hermenêutica', 'homilética'];
    const hasThemeKeywords = themeKeywords.some(k => summaryText.toLowerCase().includes(k));
    if (!hasThemeKeywords) { score -= 1; criteria[2].met = false; }

    if (wordCount < 100) { score -= 0.5; criteria[3].met = false; }

    const sentences = summaryText.split(/[.!?]+/).filter(s => s.trim().length > 0);
    const isCoherent = sentences.length > 2 && sentences.every(s => s.trim().split(' ').length > 2);
    if (!isCoherent) { score -= 1; criteria[4].met = false; }

    let message = "";
    if (score <= 1.5) message = "Você pode fazer melhor! Acredite!";
    else if (score <= 2.5) message = "Vamos tentar de novo? Você vai conseguir!";
    else if (score === 3) message = "Foi por pouco! Na próxima vai dar certo!";
    else if (score <= 4) message = "Parabéns! Muito bom!";
    else if (score === 4.5) message = "Ótimo! Servo bom e fiel!";
    else message = "Excelente! Você é um exemplo para nós!";

    let aiFeedback = "";
    try {
      const prompt = `Avalie o seguinte resumo teológico sobre a matéria "${selectedSubject}" (Formato: ${summaryType}).\nSeja cordial, gentil e encorajador.\nApresente os pontos positivos e os pontos que podem melhorar.\nDeixe claro no início que este é um parecer gerado por Inteligência Artificial.\n\nResumo:\n"${summaryText}"`;
      
      const response = await geminiService.generateText(prompt, "Você é um professor de teologia gentil e encorajador.");
      aiFeedback = response || "Não foi possível gerar o feedback da IA no momento.";
    } catch (error) {
      console.error("Erro ao gerar feedback da IA:", error);
      aiFeedback = "Não foi possível gerar o feedback da IA no momento. Tente novamente mais tarde.";
    }

    setSummaryEvaluation({ score, criteria, message, aiFeedback });
    setIsEvaluatingSummary(false);

    if (user && selectedSubject) {
      const fieldMap: Record<string, string> = {
        'Matéria básica': 'redacaoMateria',
        'Debate teológico': 'redacaoAprofundamento',
        'Vídeo': 'redacaoVideo',
        'Slides': 'redacaoSlide',
        'Podcast': 'redacaoPodcast'
      };
      const field = fieldMap[summaryType];
      
      // Save summary to a dedicated collection for the student profile
      try {
        const summaryData = {
          userId: user.id,
          userName: user.name,
          subject: selectedSubject,
          type: summaryType,
          content: summaryText,
          score: score,
          aiFeedback: aiFeedback,
          createdAt: new Date().toISOString()
        };
        await addDoc(collection(db, 'theologySummaries'), summaryData);
      } catch (error) {
        console.error("Error saving summary to collection:", error);
      }

      if (field) {
        const current = theologyProgress[selectedSubject] || {};
        // Only update if the new score is higher
        if (score > (current[field] || 0)) {
          const newSubjectProgress = {
            ...current,
            [field]: score
          };
          const progressDocRef = doc(db, 'theologyProgress', user.id);
          updateDoc(progressDocRef, {
            [selectedSubject]: newSubjectProgress
          }).then(() => syncPointsToCareer(selectedSubject, newSubjectProgress)).catch(console.error);
        }
      }
    }
  };

  const handleGenerateDebate = async () => {
    if (!selectedSubject) return;
    
    setIsGeneratingDebate(true);
    setDebateContent('');
    setShowDebateModal(true);
    showToast("Iniciando Debate Teológico... ⚔️📖", 'info');

    try {
      const prompt = `Gere um debate teológico profundo sobre a matéria "${selectedSubject}".
      
      REQUISITOS DO DEBATE:
      1. Envolva dois ou três autores teológicos renomados que abordam este assunto com profundidade (ex: João Calvino, Armínio, Agostinho, Lutero, etc., dependendo do tema).
      2. Apresente pelo menos 8 temas polêmicos e divergentes dentro desta matéria.
      3. Para cada tema, inclua réplicas e tréplicas entre os autores.
      4. Insira argumentos bíblicos (com referências) e argumentos racionais/lógicos para cada posição.
      5. O debate deve ser respeitoso, mas intelectualmente rigoroso.
      6. No final, inclua a fala de um MODERADOR que busca um consenso sobre o que é mais importante: a fé em Cristo e uma mensagem de vida e esperança.
      
      Formate o texto em Markdown, usando negrito para os nomes dos autores e títulos claros para cada tema polêmico.`;

      const response = await geminiService.generateText(prompt);
      setDebateContent(response || "Não foi possível gerar o debate no momento.");
      showToast("Debate gerado com sucesso! 🎓✨", 'success');
    } catch (error) {
      console.error(error);
      showToast("Erro ao gerar debate.", 'error');
      setShowDebateModal(false);
    } finally {
      setIsGeneratingDebate(false);
    }
  };

  const startAssessment = async () => {
    if (!selectedSubject) return;
    
    setIsGeneratingAssessment(true);
    setShowAssessmentModal(true);
    setAssessmentResult(null);
    setCurrentQuestionIndex(0);
    setUserAnswers([]);

    try {
      const prompt = `Gere uma avaliação teológica profunda sobre "${selectedSubject}" com exatamente 10 questões de múltipla escolha.
      Distribuição de dificuldade: 4 fáceis, 3 intermediárias e 3 difíceis.
      Cada questão deve ter exatamente 3 opções de resposta.
      Retorne APENAS um JSON válido no seguinte formato:
      {
        "questions": [
          {
            "question": "Texto da pergunta",
            "options": ["Opção 1", "Opção 2", "Opção 3"],
            "correctIndex": 0,
            "difficulty": "easy" | "intermediate" | "hard"
          }
        ]
      }`;

      const response = await geminiService.generateText(prompt, "Você é um professor de teologia rigoroso e acadêmico.");
      
      let data;
      try {
        data = JSON.parse(response.replace(/```json|```/g, '').trim());
      } catch (parseError) {
        console.error("Failed to parse assessment JSON:", response);
        throw new Error("A IA retornou um formato inválido. Tente novamente.");
      }
      
      setAssessmentQuestions(data.questions);
    } catch (error: any) {
      console.error("Erro ao gerar avaliação:", error);
      showToast(error.message || "Erro ao gerar avaliação. Tente novamente.", 'error');
      setShowAssessmentModal(false);
    } finally {
      setIsGeneratingAssessment(false);
    }
  };

  const handleAnswer = (optionIndex: number) => {
    const newAnswers = [...userAnswers];
    newAnswers[currentQuestionIndex] = optionIndex;
    setUserAnswers(newAnswers);
  };

  const nextQuestion = () => {
    if (currentQuestionIndex < assessmentQuestions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else {
      finishAssessment();
    }
  };

  const finishAssessment = async () => {
    if (!user) return;
    let correctAnswers = 0;
    assessmentQuestions.forEach((q, i) => {
      if (userAnswers[i] === q.correctIndex) correctAnswers++;
    });
    
    const score = correctAnswers * 4;

    let message = "";
    if (score <= 10) message = "Tente novamente. Você é capaz!";
    else if (score <= 20) message = "Essa nota pode ser melhorada. Que tal estudar mais pouco?";
    else if (score <= 28) message = "Você pode fazer melhor. Eu confio em você!";
    else if (score <= 32) message = "Muito boa nota! Passou com louvor!";
    else if (score < 40) message = "Ótimo. Você me dá orgulho!";
    else message = "Sensacional! Você é um exemplo de dedicação! Continue assim...";

    setAssessmentResult({ score, message });

    // Save to student profile in Firestore
    const current = theologyProgress[selectedSubject!] || {};
    const newSubjectProgress = {
      ...current,
      evaluation: score,
      completed: score >= 28
    };
    
    const progressDocRef = doc(db, 'theologyProgress', user.id);
    await updateDoc(progressDocRef, {
      [selectedSubject!]: newSubjectProgress
    });
    
    showToast(`Avaliação concluída! Nota: ${score}/40`, 'success');
  };

  if (showSummary) {
    return (
      <div className="max-w-4xl mx-auto">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-zinc-900 p-10 rounded-[3rem] border border-stone-200 dark:border-zinc-800 shadow-2xl space-y-8"
        >
          <div className="text-center space-y-4">
            <div className="w-20 h-20 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 rounded-3xl flex items-center justify-center mx-auto mb-6">
              <GraduationCap size={40} />
            </div>
            <h2 className="text-3xl font-bold font-display">Curso de Teologia Básica</h2>
            <p className="text-stone-500 max-w-2xl mx-auto">
              Bem-vindo ao nosso programa de formação teológica. Este curso foi desenhado para fornecer uma base sólida nas doutrinas fundamentais da fé cristã, utilizando inteligência artificial para aprofundar cada tema.
            </p>
          </div>

          <div className="bg-stone-50 dark:bg-zinc-800/50 p-8 rounded-3xl space-y-6">
            <h3 className="font-bold flex items-center gap-2">
              <Info size={20} className="text-emerald-600" />
              Regras e Estrutura
            </h3>
            <ul className="space-y-4 text-sm text-stone-600 dark:text-zinc-400">
              <li className="flex gap-3">
                <div className="w-6 h-6 bg-emerald-500 text-white rounded-full flex items-center justify-center flex-shrink-0 text-[10px] font-bold">1</div>
                Cada matéria é dividida em 5 capítulos profundos.
              </li>
              <li className="flex gap-3">
                <div className="w-6 h-6 bg-emerald-500 text-white rounded-full flex items-center justify-center flex-shrink-0 text-[10px] font-bold">2</div>
                Existe uma ordem lógica (pré-requisitos) para o aprendizado.
              </li>
              <li className="flex gap-3">
                <div className="w-6 h-6 bg-emerald-500 text-white rounded-full flex items-center justify-center flex-shrink-0 text-[10px] font-bold">3</div>
                Ao concluir cada matéria, você ganha pontos de carreira ministerial.
              </li>
            </ul>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 pt-4">
            <button 
              onClick={handleEnroll}
              disabled={isEnrolling}
              className="flex-1 py-4 bg-emerald-600 text-white font-bold rounded-2xl hover:bg-emerald-700 shadow-lg shadow-emerald-600/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isEnrolling ? <Loader2 className="animate-spin" size={20} /> : <CheckCircle size={20} />}
              INSCREVER-SE AGORA
            </button>
            <button 
              onClick={() => onNavigate('home')}
              className="flex-1 py-4 bg-stone-100 dark:bg-zinc-800 text-stone-600 dark:text-zinc-300 font-bold rounded-2xl hover:bg-stone-200 transition-all"
            >
              CANCELAR
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  if (hasAcceptedTerms === null) {
    return <div className="flex justify-center items-center h-screen"><Loader2 className="animate-spin text-emerald-600" size={48} /></div>;
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-24">
      {showSearch ? (
        <div className="space-y-6">
          <button 
            onClick={() => {
              setShowSearch(false);
              setSearchQuery('');
            }}
            className="flex items-center gap-2 text-stone-500 hover:text-emerald-600 transition-colors font-bold"
          >
            <ArrowLeft size={20} /> VOLTAR PARA O CURSO
          </button>
          <TheologySearchPage initialQuery={searchQuery} />
        </div>
      ) : !selectedSubject || showSubjectModal ? (
        <>
          <div className="bg-emerald-600 p-10 rounded-[3rem] text-white shadow-xl shadow-emerald-600/20 flex flex-col md:flex-row justify-between items-center gap-8 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-12 opacity-10">
              <GraduationCap size={160} />
            </div>
            <div className="relative z-10">
              <div className="flex items-center gap-4 mb-2">
                <h2 className="text-4xl font-bold font-display">Teologia Básica</h2>
              </div>
              <p className="text-emerald-100 text-lg">Seu caminho de conhecimento bíblico profundo.</p>
            </div>
            <div className="flex flex-wrap gap-4 relative z-10 w-full md:w-auto">
              <div className="relative flex-1 md:w-80 group">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-emerald-200 group-focus-within:text-white transition-colors" size={18} />
                <input 
                  type="text"
                  placeholder="⚓ Busca Teológica..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && searchQuery.trim() && setShowSearch(true)}
                  className="w-full pl-12 pr-12 py-4 bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/20 rounded-2xl text-white placeholder:text-emerald-200 outline-none focus:ring-2 focus:ring-white/30 transition-all font-bold"
                />
                <div className="absolute right-2 top-1/2 -translate-y-1/2">
                  <AudioSearchButton 
                    onResult={(text) => {
                      setSearchQuery(text);
                      setShowSearch(true);
                    }}
                    size={18}
                    className="text-white hover:text-white hover:bg-white/10"
                  />
                </div>
              </div>
              <button 
                onClick={() => onNavigate('student-profile')}
                className="px-8 py-4 bg-white text-emerald-600 hover:bg-emerald-50 rounded-2xl font-bold flex items-center gap-2 transition-all"
              >
                <User size={20} />
                Minha Página de Aluno
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {THEOLOGY_SUBJECTS.map((subject, idx) => {
              const prereqProgress = subject.prereq ? theologyProgress[subject.prereq] : null;
              const isLocked = subject.prereq && (!prereqProgress || !prereqProgress.completed);
              const isCompleted = theologyProgress[subject.title]?.completed;
              const Icon = subject.icon;

              return (
                <div 
                  key={idx} 
                  onClick={() => handleSubjectClick(subject.title)}
                  className={cn(
                    "p-8 bg-white dark:bg-zinc-900 border rounded-[2.5rem] shadow-sm transition-all group text-left relative overflow-hidden flex flex-col cursor-pointer",
                    isLocked 
                      ? "opacity-60 border-stone-100 dark:border-zinc-800 cursor-not-allowed" 
                      : "border-stone-200 dark:border-zinc-800 hover:border-emerald-500 hover:shadow-xl"
                  )}
                >
                  {isCompleted && (
                    <div className="absolute top-0 right-0 p-3 bg-emerald-500 text-white rounded-bl-2xl">
                      <CheckCircle size={16} />
                    </div>
                  )}
                  <div className="flex justify-between items-start mb-6">
                    <div>
                      <h4 
                        onClick={(e) => {
                          if (subject.title === 'Bibliologia') {
                            e.stopPropagation();
                            setShowInfographicModal(true);
                          }
                        }}
                        className={cn(
                          "text-xl font-bold group-hover:text-emerald-600 transition-colors flex items-center gap-2",
                          subject.title === 'Bibliologia' && "cursor-pointer hover:underline decoration-emerald-500/30 underline-offset-4"
                        )}
                      >
                        <Icon size={24} className={cn("text-emerald-500", isLocked && "text-stone-400")} />
                        {subject.title}
                        {isLocked && <Zap size={16} className="text-stone-400 ml-auto" />}
                      </h4>
                      <p className="text-xs text-stone-400 uppercase tracking-widest mt-1 font-bold">{subject.desc}</p>
                    </div>
                  </div>
                  <ul className="space-y-3 flex-1">
                    {subject.topics.map((topic, tIdx) => (
                      <li key={tIdx} className="text-sm text-stone-500 dark:text-zinc-500 flex items-center gap-3">
                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500/50" />
                        {topic}
                      </li>
                    ))}
                  </ul>
                  <div className="mt-8 pt-6 border-t border-stone-50 dark:border-zinc-800 flex items-center justify-between text-xs font-bold text-emerald-600">
                    <span className="flex items-center gap-1">
                      {isLocked ? `REQUISITO: ${subject.prereq}` : 'OPÇÕES DE ESTUDO'} <ChevronRight size={16} />
                    </span>
                    {isCompleted && (
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          handleGenerateSubjectCertificate(subject.title);
                        }}
                        className="px-3 py-1 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 rounded-lg hover:bg-emerald-100 transition-colors flex items-center gap-1"
                      >
                        <Award size={14} /> Certificado (5💎)
                      </button>
                    )}
                  </div>
                </div>
              );
            })}

            {/* Conclusion Card */}
            {theologyProgress['Homilética']?.completed && (
              <button 
                onClick={handleOpenConclusion}
                className="p-8 bg-gradient-to-br from-amber-500 to-orange-600 border-none rounded-[2.5rem] shadow-xl shadow-amber-500/20 transition-all group text-left relative overflow-hidden md:col-span-2 lg:col-span-3"
              >
                <div className="absolute top-0 right-0 p-8 opacity-20 group-hover:scale-110 transition-transform duration-500">
                  <Award size={120} />
                </div>
                <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center gap-6">
                  <div className="p-4 bg-white/20 backdrop-blur-md text-white rounded-2xl">
                    <Award size={32} />
                  </div>
                  <div className="text-white flex-1">
                    <h4 className="text-2xl font-bold mb-2">Conclusão do Curso</h4>
                    <p className="text-amber-100">Área de formatura da Teologia Básica. Clique aqui para ver sua mensagem final e emitir seu certificado (30 créditos).</p>
                  </div>
                  <div className="mt-4 md:mt-0 px-6 py-3 bg-white text-amber-600 font-bold rounded-xl flex items-center gap-2 group-hover:bg-amber-50 transition-colors">
                    Acessar <ArrowRight size={18} />
                  </div>
                </div>
              </button>
            )}
          </div>

          {/* Termos de Uso Section at the bottom */}
          <div className="mt-20 p-10 bg-stone-50 dark:bg-zinc-800/50 rounded-[3rem] border border-stone-200 dark:border-zinc-800 space-y-6">
            <div className="flex items-center gap-3 text-emerald-900 dark:text-emerald-400">
              <ShieldAlert size={24} />
              <h2 className="text-2xl font-bold">Termo de Uso - Teologia</h2>
            </div>
            <div className="prose dark:prose-invert max-w-none text-sm text-stone-600 dark:text-zinc-400">
              <p>1. Este é um Curso Livre de Teologia Básica gerada por IA e sem nenhum vínculo com escolas, faculdades, seminários ou igrejas.</p>
              <p>2. As fontes, estruturas, atividades e avaliações são pré-estabelecidas por meio de prompts pelo desenvolvedor do App, mas que conferem certa liberdade de criação pela IA, o que pode gerar erros.</p>
              <h3 className="text-lg font-bold mt-4 mb-2">Observações Importantes:</h3>
              <p>3. Os cursos livres online no Brasil são amparados pela Lei nº 9.394/1996 (LDB - Diretrizes e Bases da Educação Nacional) e regulamentados pelo Decreto nº 5.154/2004.</p>
              <p>4. Esta modalidade não exige autorização do MEC, por serem cursos de capacitação e atualização, e possuírem natureza de educação não-formal. Como não intitulam nível superior ou técnico, não precisam de reconhecimento ou autorização do MEC.</p>
              <p>5. A Certificação: Os certificados têm valor meramente de comprovação de aprendizado, mas não conferem títulos acadêmicos ou eclesiásticos.</p>
            </div>
          </div>

          {/* Conclusion Modal */}
          <AnimatePresence>
            {showConclusionModal && (
              <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                <motion.div 
                  initial={{ opacity: 0, scale: 0.9, y: 20 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9, y: 20 }}
                  className="bg-white dark:bg-zinc-900 w-full max-w-2xl max-h-[90vh] rounded-[3rem] overflow-hidden shadow-2xl border border-stone-200 dark:border-zinc-800 flex flex-col"
                >
                  <div className="p-6 md:p-8 border-b border-stone-100 dark:border-zinc-800 flex justify-between items-center bg-gradient-to-r from-amber-500 to-orange-600 text-white shrink-0">
                    <div className="flex items-center gap-3">
                      <div className="p-3 bg-white/20 backdrop-blur-sm rounded-2xl">
                        <Award size={24} />
                      </div>
                      <div>
                        <h3 className="text-xl font-bold">Formatura</h3>
                        <p className="text-xs text-amber-100 uppercase tracking-widest font-bold">Teologia Básica</p>
                      </div>
                    </div>
                    <button 
                      onClick={() => setShowConclusionModal(false)}
                      className="p-2 hover:bg-white/20 rounded-full transition-colors"
                    >
                      <X size={24} />
                    </button>
                  </div>

                  <div className="p-6 md:p-8 overflow-y-auto custom-scrollbar flex-1">
                    {isGeneratingConclusion ? (
                      <div className="flex flex-col items-center justify-center py-12 space-y-4">
                        <Loader2 className="animate-spin text-amber-500" size={48} />
                        <p className="text-stone-500 font-medium animate-pulse text-center">Preparando sua mensagem de formatura...</p>
                      </div>
                    ) : (
                      <div className="prose dark:prose-invert max-w-none">
                        <MarkdownRenderer content={conclusionText} />
                      </div>
                    )}
                  </div>

                  <div className="p-6 md:p-8 border-t border-stone-100 dark:border-zinc-800 bg-stone-50 dark:bg-zinc-800/50 shrink-0 flex flex-col sm:flex-row gap-4 justify-end">
                    <button 
                      onClick={() => setShowConclusionModal(false)}
                      className="px-6 py-3 bg-stone-200 dark:bg-zinc-700 text-stone-700 dark:text-zinc-300 font-bold rounded-xl hover:bg-stone-300 dark:hover:bg-zinc-600 transition-colors"
                    >
                      FECHAR
                    </button>
                    <button 
                      onClick={() => {
                        setShowConclusionModal(false);
                        handleGenerateCertificate();
                      }}
                      disabled={isGeneratingConclusion}
                      className="px-6 py-3 bg-amber-500 text-white font-bold rounded-xl hover:bg-amber-600 shadow-lg shadow-amber-500/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                      <Download size={20} />
                      ENVIAR CERTIFICADO
                    </button>
                  </div>
                </motion.div>
              </div>
            )}
          </AnimatePresence>
          
          {/* Debate Modal */}
          <AnimatePresence>
            {showDebateModal && (
              <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                <motion.div 
                  initial={{ opacity: 0, scale: 0.9, y: 20 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9, y: 20 }}
                  className="bg-white dark:bg-zinc-900 w-full max-w-4xl max-h-[90vh] rounded-[3rem] overflow-hidden shadow-2xl border border-stone-200 dark:border-zinc-800 flex flex-col"
                >
                  <div className="p-6 md:p-8 border-b border-stone-100 dark:border-zinc-800 flex justify-between items-center bg-gradient-to-r from-blue-600 to-indigo-700 text-white shrink-0">
                    <div className="flex items-center gap-3">
                      <div className="p-3 bg-white/20 backdrop-blur-sm rounded-2xl">
                        <MessageSquare size={24} />
                      </div>
                      <div>
                        <h3 className="text-xl font-bold">Debate Teológico</h3>
                        <p className="text-xs text-blue-100 uppercase tracking-widest font-bold">{selectedSubject}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {debateContent && (
                        <button 
                          onClick={() => {
                            copyToClipboard(debateContent);
                            showToast("Debate copiado! 📋✨");
                          }}
                          className="p-2 hover:bg-white/20 rounded-full transition-colors"
                          title="Copiar Debate"
                        >
                          <Copy size={20} />
                        </button>
                      )}
                      <button 
                        onClick={() => setShowDebateModal(false)}
                        className="p-2 hover:bg-white/20 rounded-full transition-colors"
                      >
                        <X size={24} />
                      </button>
                    </div>
                  </div>

                  <div className="p-6 md:p-8 overflow-y-auto custom-scrollbar flex-1">
                    {isGeneratingDebate ? (
                      <div className="flex flex-col items-center justify-center py-20 space-y-6">
                        <div className="relative">
                          <div className="absolute inset-0 bg-blue-500/20 blur-2xl rounded-full animate-pulse" />
                          <Loader2 className="animate-spin text-blue-600 relative z-10" size={64} />
                        </div>
                        <div className="text-center space-y-2">
                          <p className="text-xl font-bold text-stone-800 dark:text-zinc-200">Convocando os Teólogos...</p>
                          <p className="text-stone-500 font-medium animate-pulse">Preparando os argumentos e temas polêmicos...</p>
                        </div>
                      </div>
                    ) : (
                      <div className="prose dark:prose-invert max-w-none">
                        <MarkdownRenderer content={debateContent} />
                      </div>
                    )}
                  </div>

                  <div className="p-6 md:p-8 border-t border-stone-100 dark:border-zinc-800 bg-stone-50 dark:bg-zinc-800/50 shrink-0 flex flex-col sm:flex-row gap-4 justify-end">
                    <button 
                      onClick={() => setShowDebateModal(false)}
                      className="px-8 py-3 bg-stone-200 dark:bg-zinc-700 text-stone-700 dark:text-zinc-300 font-bold rounded-xl hover:bg-stone-300 dark:hover:bg-zinc-600 transition-colors"
                    >
                      FECHAR
                    </button>
                    <button 
                      onClick={() => saveToNotebookGlobal(`Debate: ${selectedSubject}`, debateContent)}
                      disabled={!debateContent}
                      className="px-8 py-3 bg-amber-500 text-white font-bold rounded-xl hover:bg-amber-600 shadow-lg shadow-amber-500/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                      <StickyNote size={20} />
                      SALVAR NO CADERNO
                    </button>
                    <button 
                      onClick={handleGenerateDebate}
                      disabled={isGeneratingDebate}
                      className="px-8 py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 shadow-lg shadow-blue-600/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                      <RefreshCw size={20} className={isGeneratingDebate ? "animate-spin" : ""} />
                      REGERAR DEBATE
                    </button>
                  </div>
                </motion.div>
              </div>
            )}
          </AnimatePresence>

          {/* Certificate Payment Modal */}
          <AnimatePresence>
            {showCertificatePaymentModal && (
              <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                <motion.div 
                  initial={{ opacity: 0, scale: 0.9, y: 20 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9, y: 20 }}
                  className="bg-white dark:bg-zinc-900 w-full max-w-lg rounded-[3rem] overflow-hidden shadow-2xl border border-stone-200 dark:border-zinc-800 flex flex-col"
                >
                  <div className="p-6 md:p-8 border-b border-stone-100 dark:border-zinc-800 flex justify-between items-center bg-gradient-to-r from-emerald-600 to-emerald-700 text-white shrink-0">
                    <div className="flex items-center gap-3">
                      <div className="p-3 bg-white/20 backdrop-blur-sm rounded-2xl">
                        <Award size={24} />
                      </div>
                      <div>
                        <h3 className="text-xl font-bold">Emissão de Certificado</h3>
                        <p className="text-xs text-emerald-100 uppercase tracking-widest font-bold">Taxa Administrativa</p>
                      </div>
                    </div>
                    <button 
                      onClick={() => setShowCertificatePaymentModal(false)}
                      className="p-2 hover:bg-white/20 rounded-full transition-colors"
                    >
                      <X size={24} />
                    </button>
                  </div>

                  <div className="p-6 md:p-8 overflow-y-auto custom-scrollbar flex-1 space-y-6">
                    <div className="text-center space-y-2">
                      <p className="text-stone-500 dark:text-zinc-400">Valor do Certificado</p>
                      <h2 className="text-4xl font-black text-stone-900 dark:text-white">R$ 50,00</h2>
                    </div>

                    <div className="space-y-4">
                      <div className="p-4 bg-stone-50 dark:bg-zinc-800/50 rounded-2xl border border-stone-200 dark:border-zinc-700">
                        <h4 className="font-bold text-stone-900 dark:text-white mb-2">Pagar com PIX</h4>
                        <p className="text-sm text-stone-500 dark:text-zinc-400 mb-2">Chave PIX (E-mail):</p>
                        <div className="flex items-center gap-2">
                          <code className="flex-1 p-2 bg-white dark:bg-zinc-900 rounded-xl text-center font-mono text-sm border border-stone-200 dark:border-zinc-700">
                            imersaobiblicapp@gmail.com
                          </code>
                          <button 
                            onClick={() => { copyToClipboard('imersaobiblicapp@gmail.com'); showToast('Chave PIX copiada!'); }}
                            className="p-2 bg-emerald-100 text-emerald-600 rounded-xl hover:bg-emerald-200"
                          >
                            <Copy size={16} />
                          </button>
                        </div>
                      </div>

                      <div className="p-4 bg-stone-50 dark:bg-zinc-800/50 rounded-2xl border border-stone-200 dark:border-zinc-700">
                        <h4 className="font-bold text-stone-900 dark:text-white mb-2">Pagar com PayPal</h4>
                        <a 
                          href="https://paypal.me/missoeselroi" 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="block w-full py-3 bg-[#003087] text-white text-center font-bold rounded-xl hover:bg-[#001C64] transition-colors"
                        >
                          Pagar via PayPal
                        </a>
                      </div>
                    </div>

                    <div className="text-center">
                      <button 
                        onClick={() => {
                          setShowCertificatePaymentModal(false);
                          onNavigate?.('contact');
                        }}
                        className="text-sm text-stone-500 hover:text-emerald-600 underline font-medium"
                      >
                        Caso não possa pagar este valor fale conosco!
                      </button>
                    </div>
                  </div>

                  <div className="p-6 md:p-8 border-t border-stone-100 dark:border-zinc-800 bg-stone-50 dark:bg-zinc-800/50 shrink-0 flex flex-col sm:flex-row gap-4 justify-end">
                    <button 
                      onClick={() => setShowCertificatePaymentModal(false)}
                      className="px-6 py-3 bg-stone-200 dark:bg-zinc-700 text-stone-700 dark:text-zinc-300 font-bold rounded-xl hover:bg-stone-300 dark:hover:bg-zinc-600 transition-colors"
                    >
                      CANCELAR
                    </button>
                    <button 
                      onClick={handleGenerateCertificate}
                      className="px-6 py-3 bg-emerald-600 text-white font-bold rounded-xl hover:bg-emerald-700 shadow-lg shadow-emerald-600/20 transition-all flex items-center justify-center gap-2"
                    >
                      <CheckCircle size={20} />
                      JÁ PAGUEI / GERAR
                    </button>
                  </div>
                </motion.div>
              </div>
            )}
          </AnimatePresence>

          {/* Subject Options Modal */}
          <AnimatePresence>
            {showSubjectModal && selectedSubject && (
              <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                <motion.div 
                  initial={{ opacity: 0, scale: 0.9, y: 20 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9, y: 20 }}
                  className="bg-white dark:bg-zinc-900 w-full max-w-lg max-h-[90vh] rounded-[3rem] overflow-hidden shadow-2xl border border-stone-200 dark:border-zinc-800 flex flex-col"
                >
                  <div className="p-6 md:p-8 border-b border-stone-100 dark:border-zinc-800 flex justify-between items-center bg-stone-50 dark:bg-zinc-800/50 shrink-0">
                    <div className="flex items-center gap-3">
                      <div className="p-3 bg-emerald-600 text-white rounded-2xl">
                        {(() => {
                          const subjectData = THEOLOGY_SUBJECTS.find(s => s.title === selectedSubject);
                          const SubjectIcon = subjectData?.icon || GraduationCap;
                          return <SubjectIcon size={24} />;
                        })()}
                      </div>
                      <div>
                        <h3 className="text-xl font-bold">{selectedSubject}</h3>
                        <p className="text-xs text-stone-500 uppercase tracking-widest font-bold">Opções de Estudo</p>
                      </div>
                    </div>
                    <button 
                      onClick={() => setShowSubjectModal(false)}
                      className="p-2 hover:bg-stone-200 dark:hover:bg-zinc-700 rounded-full transition-colors"
                    >
                      <X size={24} />
                    </button>
                  </div>

                  <div className="p-6 md:p-8 grid grid-cols-1 gap-4 overflow-y-auto custom-scrollbar">
                    <div className="flex gap-2">
                      <button 
                        onClick={() => handleSubjectSelect(selectedSubject)}
                        className="flex-1 p-6 bg-stone-50 dark:bg-zinc-800/50 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 border border-stone-100 dark:border-zinc-700 rounded-3xl flex items-center gap-4 transition-all group"
                      >
                        <div className="p-3 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 rounded-xl group-hover:scale-110 transition-transform">
                          <Book size={24} />
                        </div>
                        <div className="text-left">
                          <div className="font-bold">Matéria básica</div>
                          <div className="text-xs text-stone-500">Estudo teórico fundamental</div>
                        </div>
                      </button>
                      <button
                        onClick={() => openSummaryModal('Matéria básica')}
                        className="p-4 bg-stone-50 dark:bg-zinc-800/50 hover:bg-stone-100 dark:hover:bg-zinc-700 border border-stone-100 dark:border-zinc-700 rounded-3xl flex flex-col items-center justify-center gap-2 transition-all text-stone-600 dark:text-zinc-400 w-24"
                      >
                        <FileText size={20} />
                        <span className="text-[10px] font-bold uppercase tracking-wider">Resumo<br/>(+5 pts)</span>
                      </button>
                    </div>

                    <div className="flex gap-2">
                      <button 
                        onClick={() => handleGenerateDebate()}
                        className="flex-1 p-6 bg-stone-50 dark:bg-zinc-800/50 hover:bg-blue-50 dark:hover:bg-blue-900/20 border border-stone-100 dark:border-zinc-700 rounded-3xl flex items-center gap-4 transition-all group"
                      >
                        <div className="p-3 bg-blue-100 dark:bg-blue-900/30 text-blue-600 rounded-xl group-hover:scale-110 transition-transform">
                          <Sparkles size={24} />
                        </div>
                        <div className="text-left">
                          <div className="font-bold">Debate teológico</div>
                          <div className="text-xs text-stone-500">Debate Profundo entre Autores</div>
                        </div>
                      </button>
                      <button
                        onClick={() => openSummaryModal('Debate teológico')}
                        className="p-4 bg-stone-50 dark:bg-zinc-800/50 hover:bg-stone-100 dark:hover:bg-zinc-700 border border-stone-100 dark:border-zinc-700 rounded-3xl flex flex-col items-center justify-center gap-2 transition-all text-stone-600 dark:text-zinc-400 w-24"
                      >
                        <FileText size={20} />
                        <span className="text-[10px] font-bold uppercase tracking-wider">Resumo<br/>(+5 pts)</span>
                      </button>
                    </div>

                    <div className="flex gap-2">
                      <button 
                        onClick={() => {
                          if (selectedSubject === 'Bibliologia') {
                            window.open('https://youtu.be/P2YVpigLsCY', '_blank');
                          } else if (selectedSubject === 'Teontologia') {
                            window.open('https://youtu.be/TInV9QMNB8M', '_blank');
                          } else {
                            updateDetailedProgress(selectedSubject, 'video');
                          }
                        }}
                        className="flex-1 p-6 bg-stone-50 dark:bg-zinc-800/50 hover:bg-red-50 dark:hover:bg-red-900/20 border border-stone-100 dark:border-zinc-700 rounded-3xl flex items-center gap-4 transition-all group"
                      >
                        <div className="p-3 bg-red-100 dark:bg-red-900/30 text-red-600 rounded-xl group-hover:scale-110 transition-transform">
                          <Play size={24} />
                        </div>
                        <div className="text-left">
                          <div className="font-bold">{selectedSubject === 'Bibliologia' ? 'Vídeo-Aula' : 'Vídeo'}</div>
                          <div className="text-xs text-stone-500">
                            {selectedSubject === 'Bibliologia' ? 'Assista à vídeo-aula no YouTube' : 'Assista à vídeo-aula'}
                          </div>
                        </div>
                      </button>
                      <button
                        onClick={() => openSummaryModal(selectedSubject === 'Bibliologia' ? 'Vídeo-Aula' : 'Vídeo')}
                        className="p-4 bg-stone-50 dark:bg-zinc-800/50 hover:bg-stone-100 dark:hover:bg-zinc-700 border border-stone-100 dark:border-zinc-700 rounded-3xl flex flex-col items-center justify-center gap-2 transition-all text-stone-600 dark:text-zinc-400 w-24"
                      >
                        <FileText size={20} />
                        <span className="text-[10px] font-bold uppercase tracking-wider">Resumo<br/>(+5 pts)</span>
                      </button>
                    </div>

                    <div className="flex gap-2">
                      <button 
                        onClick={() => {
                          if (selectedSubject === 'Bibliologia' || selectedSubject === 'Teontologia') {
                            setCurrentSlideIndex(0);
                            setShowSlidesModal(true);
                          } else {
                            updateDetailedProgress(selectedSubject, 'slides');
                          }
                        }}
                        className="flex-1 p-6 bg-stone-50 dark:bg-zinc-800/50 hover:bg-amber-50 dark:hover:bg-amber-900/20 border border-stone-100 dark:border-zinc-700 rounded-3xl flex items-center gap-4 transition-all group"
                      >
                        <div className="p-3 bg-amber-100 dark:bg-amber-900/30 text-amber-600 rounded-xl group-hover:scale-110 transition-transform">
                          <Presentation size={24} />
                        </div>
                        <div className="text-left">
                          <div className="font-bold">Slides</div>
                          <div className="text-xs text-stone-500">
                            {(selectedSubject === 'Bibliologia' || selectedSubject === 'Teontologia') ? 'Ver apresentação de slides' : 'Apresentação visual'}
                          </div>
                        </div>
                      </button>
                      <button
                        onClick={() => openSummaryModal('Slides')}
                        className="p-4 bg-stone-50 dark:bg-zinc-800/50 hover:bg-stone-100 dark:hover:bg-zinc-700 border border-stone-100 dark:border-zinc-700 rounded-3xl flex flex-col items-center justify-center gap-2 transition-all text-stone-600 dark:text-zinc-400 w-24"
                      >
                        <FileText size={20} />
                        <span className="text-[10px] font-bold uppercase tracking-wider">Resumo<br/>(+5 pts)</span>
                      </button>
                    </div>

                    <div className="flex gap-2">
                      <button 
                        onClick={() => {
                          if (selectedSubject === 'Bibliologia') {
                            window.open('https://youtu.be/pt-k0N8oD0I?si=mirl30ZNlFvO3fE-', '_blank');
                          } else if (selectedSubject === 'Teontologia') {
                            window.open('https://youtu.be/UJqaYmjdBEg?si=g-dccKDeZLPYhK-B', '_blank');
                          } else {
                            updateDetailedProgress(selectedSubject, 'podcast');
                          }
                        }}
                        className="flex-1 p-6 bg-stone-50 dark:bg-zinc-800/50 hover:bg-purple-50 dark:hover:bg-purple-900/20 border border-stone-100 dark:border-zinc-700 rounded-3xl flex items-center gap-4 transition-all group"
                      >
                        <div className="p-3 bg-purple-100 dark:bg-purple-900/30 text-purple-600 rounded-xl group-hover:scale-110 transition-transform">
                          {['Bibliologia', 'Teontologia'].includes(selectedSubject) ? <Youtube size={24} /> : <Mic size={24} />}
                        </div>
                        <div className="text-left">
                          <div className="font-bold">{['Bibliologia', 'Teontologia'].includes(selectedSubject) ? 'Videocast' : 'Podcast'}</div>
                          <div className="text-xs text-stone-500">
                            {['Bibliologia', 'Teontologia'].includes(selectedSubject) ? 'Assista ao vídeo no YouTube' : 'Ouça o resumo em áudio'}
                          </div>
                        </div>
                      </button>
                      <button
                        onClick={() => openSummaryModal(['Bibliologia', 'Teontologia'].includes(selectedSubject) ? 'Videocast' : 'Podcast')}
                        className="p-4 bg-stone-50 dark:bg-zinc-800/50 hover:bg-stone-100 dark:hover:bg-zinc-700 border border-stone-100 dark:border-zinc-700 rounded-3xl flex flex-col items-center justify-center gap-2 transition-all text-stone-600 dark:text-zinc-400 w-24"
                      >
                        <FileText size={20} />
                        <span className="text-[10px] font-bold uppercase tracking-wider">Resumo<br/>(+5 pts)</span>
                      </button>
                    </div>
                  </div>
                </motion.div>
              </div>
            )}
          </AnimatePresence>

          {/* Summary Evaluation Modal */}
          <AnimatePresence>
            {showSlidesModal && (
              <div className={cn(
                "fixed inset-0 z-[70] flex items-center justify-center bg-black/80 backdrop-blur-md transition-all",
                isFullscreen ? "p-0" : "p-4"
              )}>
                <motion.div 
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className={cn(
                    "bg-white dark:bg-zinc-900 overflow-hidden shadow-2xl flex flex-col transition-all",
                    isFullscreen ? "w-full h-full rounded-none" : "w-full max-w-5xl h-[90vh] rounded-[3rem]"
                  )}
                >
                  <div className="p-4 md:p-6 border-b border-stone-100 dark:border-zinc-800 flex justify-between items-center shrink-0 bg-white dark:bg-zinc-900 z-10">
                    <div className="flex items-center gap-3">
                      <div className="p-2 md:p-3 bg-amber-100 dark:bg-amber-900/30 text-amber-600 rounded-2xl">
                        <Presentation size={20} />
                      </div>
                      <div>
                        <h3 className="text-lg md:text-xl font-bold">Slides: {selectedSubject}</h3>
                        <p className="text-xs md:text-sm text-stone-500">Página {currentSlideIndex + 1} de {selectedSubject === 'Bibliologia' ? BIBLIOLOGIA_SLIDES.length : TEONTOLOGIA_SLIDES.length}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 md:gap-2">
                      <button 
                        onClick={() => setRotation(prev => (prev + 90) % 360)}
                        className="p-2 hover:bg-stone-100 dark:hover:bg-zinc-800 rounded-xl transition-colors text-stone-600 dark:text-zinc-400"
                        title="Girar"
                      >
                        <RotateCw size={20} />
                      </button>
                      <button 
                        onClick={() => setIsZoomed(!isZoomed)}
                        className="p-2 hover:bg-stone-100 dark:hover:bg-zinc-800 rounded-xl transition-colors text-stone-600 dark:text-zinc-400"
                        title={isZoomed ? "Reduzir" : "Ampliar"}
                      >
                        {isZoomed ? <ZoomOut size={20} /> : <ZoomIn size={20} />}
                      </button>
                      <button 
                        onClick={() => setIsFullscreen(!isFullscreen)}
                        className="p-2 hover:bg-stone-100 dark:hover:bg-zinc-800 rounded-xl transition-colors text-stone-600 dark:text-zinc-400"
                        title={isFullscreen ? "Sair da Tela Cheia" : "Tela Cheia"}
                      >
                        {isFullscreen ? <Minimize size={20} /> : <Maximize size={20} />}
                      </button>
                      <button 
                        onClick={() => {
                          setShowSlidesModal(false);
                          setIsFullscreen(false);
                          setIsZoomed(false);
                          setRotation(0);
                        }}
                        className="p-2 hover:bg-stone-100 dark:hover:bg-zinc-800 rounded-xl transition-colors text-stone-600 dark:text-zinc-400"
                      >
                        <X size={24} />
                      </button>
                    </div>
                  </div>
                  
                  <div className="flex-1 overflow-hidden relative bg-stone-100 dark:bg-zinc-950 flex items-center justify-center">
                    <motion.div
                      drag={!isZoomed ? "x" : false}
                      dragConstraints={{ left: 0, right: 0 }}
                      onDragEnd={(_, info) => {
                        const slides = selectedSubject === 'Bibliologia' ? BIBLIOLOGIA_SLIDES : TEONTOLOGIA_SLIDES;
                        if (info.offset.x > 100 && currentSlideIndex > 0) {
                          setCurrentSlideIndex(prev => prev - 1);
                        } else if (info.offset.x < -100 && currentSlideIndex < slides.length - 1) {
                          setCurrentSlideIndex(prev => prev + 1);
                        }
                      }}
                      className="w-full h-full flex items-center justify-center p-0 md:p-4"
                    >
                      <motion.img 
                        key={currentSlideIndex}
                        src={selectedSubject === 'Bibliologia' ? BIBLIOLOGIA_SLIDES[currentSlideIndex] : TEONTOLOGIA_SLIDES[currentSlideIndex]} 
                        alt={`Slide ${currentSlideIndex + 1}`}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ 
                          opacity: 1, 
                          x: 0,
                          scale: isZoomed ? 2 : 1,
                          rotate: rotation
                        }}
                        transition={{ type: "spring", stiffness: 300, damping: 30 }}
                        onDoubleClick={() => setIsZoomed(!isZoomed)}
                        className={cn(
                          "max-w-full max-h-full transition-all duration-300 cursor-zoom-in",
                          isZoomed ? "object-cover cursor-zoom-out" : "object-contain rounded-xl shadow-lg"
                        )}
                        referrerPolicy="no-referrer"
                      />
                    </motion.div>
                    
                    {!isZoomed && (
                      <>
                        <button 
                          onClick={() => setCurrentSlideIndex(prev => Math.max(0, prev - 1))}
                          disabled={currentSlideIndex === 0}
                          className="absolute left-4 p-3 md:p-4 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-sm rounded-full shadow-lg text-stone-800 dark:text-white disabled:opacity-30 transition-all opacity-0 group-hover:opacity-100 z-20 hidden md:block"
                        >
                          <ArrowLeft size={24} />
                        </button>
                        
                        <button 
                          onClick={() => {
                            const slides = selectedSubject === 'Bibliologia' ? BIBLIOLOGIA_SLIDES : TEONTOLOGIA_SLIDES;
                            setCurrentSlideIndex(prev => Math.min(slides.length - 1, prev + 1));
                          }}
                          disabled={currentSlideIndex === (selectedSubject === 'Bibliologia' ? BIBLIOLOGIA_SLIDES.length - 1 : TEONTOLOGIA_SLIDES.length - 1)}
                          className="absolute right-4 p-3 md:p-4 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-sm rounded-full shadow-lg text-stone-800 dark:text-white disabled:opacity-30 transition-all opacity-0 group-hover:opacity-100 z-20 hidden md:block"
                        >
                          <ArrowRight size={24} />
                        </button>
                      </>
                    )}

                    {/* Mobile Swipe Indicator */}
                    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/20 backdrop-blur-sm px-3 py-1 rounded-full text-[10px] text-white font-bold md:hidden">
                      DESLIZE PARA NAVEGAR
                    </div>
                  </div>

                  <div className="p-4 md:p-6 border-t border-stone-100 dark:border-zinc-800 flex justify-center gap-2 overflow-x-auto shrink-0 bg-white dark:bg-zinc-900">
                    {(selectedSubject === 'Bibliologia' ? BIBLIOLOGIA_SLIDES : TEONTOLOGIA_SLIDES).map((_, idx) => (
                      <button
                        key={idx}
                        onClick={() => setCurrentSlideIndex(idx)}
                        className={cn(
                          "w-2 h-2 md:w-3 md:h-3 rounded-full transition-all",
                          currentSlideIndex === idx ? "bg-emerald-500 w-6 md:w-8" : "bg-stone-200 dark:bg-zinc-700 hover:bg-stone-300"
                        )}
                      />
                    ))}
                  </div>
                </motion.div>
              </div>
            )}
          </AnimatePresence>

          <AnimatePresence>
            {showInfographicModal && (
              <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
                <motion.div 
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className="bg-white dark:bg-zinc-900 w-full max-w-4xl h-[90vh] rounded-[3rem] overflow-hidden shadow-2xl flex flex-col"
                >
                  <div className="p-6 border-b border-stone-100 dark:border-zinc-800 flex justify-between items-center shrink-0">
                    <div className="flex items-center gap-3">
                      <div className="p-3 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 rounded-2xl">
                        <FileText size={24} />
                      </div>
                      <div>
                        <h3 className="text-xl font-bold">Infográfico: Bibliologia</h3>
                        <p className="text-sm text-stone-500">Visão geral da matéria</p>
                      </div>
                    </div>
                    <button 
                      onClick={() => setShowInfographicModal(false)}
                      className="p-3 hover:bg-stone-100 dark:hover:bg-zinc-800 rounded-2xl transition-colors"
                    >
                      <X size={24} />
                    </button>
                  </div>
                  
                  <div className="flex-1 overflow-auto p-8 bg-stone-50 dark:bg-zinc-950 flex justify-center">
                    <img 
                      src={BIBLIOLOGIA_INFOGRAPHIC} 
                      alt="Infográfico Bibliologia"
                      className="max-w-full h-auto rounded-xl shadow-2xl"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                </motion.div>
              </div>
            )}
          </AnimatePresence>

          {/* Summary Evaluation Modal */}
          <AnimatePresence>
            {showSummaryModal && (
              <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                <motion.div 
                  initial={{ opacity: 0, scale: 0.9, y: 20 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9, y: 20 }}
                  className="bg-white dark:bg-zinc-900 w-full max-w-3xl max-h-[90vh] rounded-[3rem] overflow-hidden shadow-2xl border border-stone-200 dark:border-zinc-800 flex flex-col"
                >
                  <div className="p-6 md:p-8 border-b border-stone-100 dark:border-zinc-800 flex justify-between items-center bg-stone-50 dark:bg-zinc-800/50 shrink-0">
                    <div className="flex items-center gap-3">
                      <div className="p-3 bg-emerald-600 text-white rounded-2xl">
                        <FileText size={24} />
                      </div>
                      <div>
                        <h3 className="text-xl font-bold">Avaliação de Resumo</h3>
                        <p className="text-xs text-stone-500 uppercase tracking-widest font-bold">{selectedSubject} - {summaryType}</p>
                      </div>
                    </div>
                    <button 
                      onClick={() => setShowSummaryModal(false)}
                      className="p-2 hover:bg-stone-200 dark:hover:bg-zinc-700 rounded-full transition-colors"
                    >
                      <X size={24} />
                    </button>
                  </div>

                  <div className="p-6 md:p-8 overflow-y-auto custom-scrollbar flex-1 space-y-6">
                    {!summaryEvaluation ? (
                      <div className="space-y-4">
                        <div className="flex justify-between items-end">
                          <label className="block text-sm font-bold text-stone-700 dark:text-zinc-300">
                            Escreva seu resumo abaixo:
                          </label>
                          <span className="text-xs font-bold text-stone-400">
                            {summaryText.trim() ? summaryText.trim().split(/\s+/).length : 0} palavras
                          </span>
                        </div>
                        <textarea
                          value={summaryText}
                          onChange={(e) => setSummaryText(e.target.value)}
                          placeholder="⚓ Digite o resumo do que você aprendeu..."
                          className={cn(
                            "w-full h-64 p-6 bg-stone-50 dark:bg-zinc-800/50 border border-stone-200 dark:border-zinc-700 rounded-3xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none resize-none transition-all",
                            fontFamily === 'dyslexic' ? 'font-dyslexic' : 
                            fontFamily === 'serif' ? 'font-serif' : 
                            fontFamily === 'mono' ? 'font-mono' : 'font-sans',
                            fontSize === 'xs' ? 'text-xs' :
                            fontSize === 'sm' ? 'text-sm' :
                            fontSize === 'base' ? 'text-base' :
                            fontSize === 'lg' ? 'text-lg' :
                            fontSize === 'xl' ? 'text-xl' :
                            fontSize === '2xl' ? 'text-2xl' : 'text-3xl'
                          )}
                          style={{ lineHeight }}
                        />
                        <button
                          onClick={evaluateSummary}
                          disabled={isEvaluatingSummary || summaryText.trim().length === 0}
                          className="w-full py-4 bg-emerald-600 text-white font-bold rounded-2xl hover:bg-emerald-700 shadow-lg shadow-emerald-600/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                        >
                          {isEvaluatingSummary ? (
                            <><Loader2 size={20} className="animate-spin" /> Avaliando...</>
                          ) : (
                            <><Sparkles size={20} /> Avaliar Resumo</>
                          )}
                        </button>
                      </div>
                    ) : (
                      <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4">
                        <div className="text-center space-y-2">
                          <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 text-4xl font-bold mb-4">
                            {summaryEvaluation.score}
                          </div>
                          <h3 className="text-2xl font-bold">Nota Final</h3>
                          <p className="text-stone-500 font-medium">{summaryEvaluation.message}</p>
                        </div>

                        <div className="bg-stone-50 dark:bg-zinc-800/50 p-6 rounded-3xl space-y-4">
                          <h4 className="font-bold flex items-center gap-2">
                            <CheckCircle size={20} className="text-emerald-600" />
                            Critérios Avaliados
                          </h4>
                          <div className="space-y-3">
                            {summaryEvaluation.criteria.map((c, i) => (
                              <div key={i} className="flex items-center justify-between text-sm">
                                <span className={c.met ? "text-stone-700 dark:text-zinc-300" : "text-red-600 font-medium"}>
                                  {c.label}
                                </span>
                                <span className="font-bold">
                                  {c.met ? <span className="text-emerald-600">OK</span> : <span className="text-red-600">-{c.penalty} pts</span>}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>

                        {summaryEvaluation.aiFeedback && (
                          <div className="bg-blue-50 dark:bg-blue-900/20 p-6 rounded-3xl space-y-4 border border-blue-100 dark:border-blue-800/50">
                            <h4 className="font-bold flex items-center gap-2 text-blue-800 dark:text-blue-300">
                              <Sparkles size={20} />
                              Feedback do Professor (IA)
                            </h4>
                            <div className="prose prose-blue dark:prose-invert max-w-none text-sm">
                              <MarkdownRenderer content={summaryEvaluation.aiFeedback} />
                            </div>
                          </div>
                        )}

                        <button
                          onClick={() => setSummaryEvaluation(null)}
                          className="w-full py-4 bg-stone-200 dark:bg-zinc-800 text-stone-700 dark:text-zinc-300 font-bold rounded-2xl hover:bg-stone-300 dark:hover:bg-zinc-700 transition-all"
                        >
                          Fazer Novo Resumo
                        </button>
                      </div>
                    )}
                  </div>
                </motion.div>
              </div>
            )}
          </AnimatePresence>
        </>
      ) : (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="bg-white dark:bg-zinc-900 p-8 rounded-[2.5rem] border border-stone-200 dark:border-zinc-800 shadow-xl">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-emerald-600 text-white rounded-2xl">
                  <BookOpen size={24} />
                </div>
                <div>
                  <h3 className="text-2xl font-bold">{selectedSubject}</h3>
                  <p className="text-stone-500 text-sm">Capítulo {currentChapter} de {getMaxChapters(selectedSubject || '')}</p>
                </div>
              </div>
              <div className="flex gap-2">
                {user?.email === 'missoeselroi@gmail.com' && (
                  <button onClick={generateAndSaveAll} className="p-2 bg-red-600 text-white rounded-xl text-xs font-bold">
                    Gerar Tudo
                  </button>
                )}
                {Array.from({ length: getMaxChapters(selectedSubject || '') }, (_, i) => i + 1).map(i => (
                  <div 
                    key={i} 
                    className={cn(
                      "w-3 h-3 rounded-full transition-all",
                      currentChapter === i ? "bg-emerald-600 scale-125" : "bg-stone-200 dark:bg-zinc-800"
                    )}
                  />
                ))}
              </div>
            </div>

            <div className="min-h-[500px] relative">
              <div className="flex justify-end mb-4">
                <button 
                  onClick={() => setIsReadingMode(!isReadingMode)}
                  className={cn("p-2 rounded-full transition-colors", isReadingMode ? "bg-emerald-100 text-emerald-700" : "hover:bg-stone-200 dark:hover:bg-zinc-700")}
                  title="Modo Leitura"
                >
                  <BookOpen size={20} />
                </button>
              </div>
              {isLoading ? (
                <div className="absolute inset-0 flex flex-col items-center justify-center space-y-4">
                  <Loader2 className="animate-spin text-emerald-600" size={48} />
                  <p className="text-stone-500 font-medium animate-pulse">Buscando sabedoria teológica...</p>
                </div>
              ) : (
                <div 
                  className={cn("prose dark:prose-invert max-w-none", isReadingMode && "max-w-3xl mx-auto")}
                  style={isReadingMode ? { fontSize: `${readingFontSize}px`, lineHeight: readingLineHeight } : {}}
                >
                  <MarkdownRenderer content={chapterContent[currentChapter] || ''} />
                  <div className="mt-8 flex justify-end">
                    <button
                      onClick={() => handleListen(chapterContent[currentChapter])}
                      disabled={isGeneratingSpeech}
                      className="px-6 py-3 bg-stone-100 dark:bg-zinc-800 text-stone-600 dark:text-zinc-300 font-bold rounded-xl hover:bg-stone-200 flex items-center gap-2 disabled:opacity-50"
                    >
                      {isGeneratingSpeech ? <Loader2 size={18} className="animate-spin" /> : <Volume2 size={18} />}
                      Ouvir Capítulo
                    </button>
                  </div>
                </div>
              )}
            </div>

                  <div className="mt-12">
                    <FeedbackSection page="Teologia" context={selectedSubject || ''} />
                  </div>

            {/* Chapter Quiz Section */}
            {!isLoading && chapterQuiz && (
              <div className="mt-12 pt-12 border-t border-stone-100 dark:border-zinc-800 space-y-8">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-amber-100 dark:bg-amber-900/30 text-amber-600 rounded-2xl">
                    <Brain size={24} />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold">Questionário do Capítulo {currentChapter}</h3>
                    <p className="text-sm text-stone-500">Responda corretamente para avançar para o próximo capítulo.</p>
                  </div>
                </div>

                <div className="space-y-8">
                  {chapterQuiz.map((q, qIdx) => (
                    <div key={qIdx} className="space-y-4">
                      <h4 className="font-bold text-lg">{qIdx + 1}. {q.question}</h4>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        {q.options.map((option: string, oIdx: number) => (
                          <button
                            key={oIdx}
                            onClick={() => {
                              if (isChapterQuizSubmitted && calculateQuizScore() === 4) return;
                              const newAnswers = [...chapterQuizAnswers];
                              newAnswers[qIdx] = oIdx;
                              setChapterQuizAnswers(newAnswers);
                            }}
                            className={cn(
                              "p-4 text-left rounded-xl border-2 transition-all text-sm font-medium",
                              chapterQuizAnswers[qIdx] === oIdx
                                ? "border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-900 dark:text-emerald-300"
                                : "border-stone-100 dark:border-zinc-800 hover:border-emerald-200"
                            )}
                          >
                            {option}
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="flex justify-center pt-4">
                  <button
                    onClick={submitChapterQuiz}
                    disabled={chapterQuizAnswers.length < 4 || chapterQuizAnswers.includes(undefined as any)}
                    className="px-10 py-4 bg-emerald-600 text-white font-bold rounded-2xl hover:bg-emerald-700 shadow-lg shadow-emerald-600/20 transition-all flex items-center gap-2 disabled:opacity-50"
                  >
                    {isChapterQuizSubmitted && calculateQuizScore() === 4 ? (
                      <><CheckCircle size={20} /> QUESTIONÁRIO CONCLUÍDO</>
                    ) : (
                      <><Zap size={20} /> CORRIGIR QUESTIONÁRIO</>
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Footer Navigation Bar */}
          <div className="fixed bottom-4 md:bottom-8 left-1/2 -translate-x-1/2 w-full max-w-4xl px-4 z-50">
            <div className="bg-white/90 dark:bg-zinc-900/90 backdrop-blur-xl p-3 md:p-4 rounded-3xl border border-stone-200 dark:border-zinc-800 shadow-2xl flex flex-wrap md:flex-nowrap items-center justify-center md:justify-between gap-2">
              <div className="flex gap-2 w-full md:w-auto justify-center">
                <button 
                  onClick={handlePrevChapter}
                  disabled={currentChapter === 1}
                  className="p-3 md:p-4 bg-stone-100 dark:bg-zinc-800 text-stone-600 dark:text-zinc-300 rounded-2xl hover:bg-stone-200 disabled:opacity-30 transition-all"
                  title="Anterior"
                >
                  <ArrowLeft size={20} />
                </button>
                <button 
                  onClick={handleNextChapter}
                  disabled={currentChapter === 5 || !chapterContent[currentChapter]}
                  className="p-3 md:p-4 bg-stone-100 dark:bg-zinc-800 text-stone-600 dark:text-zinc-300 rounded-2xl hover:bg-stone-200 disabled:opacity-30 transition-all"
                  title="Próxima"
                >
                  <ArrowRight size={20} />
                </button>
              </div>

              <div className="flex-1 flex flex-wrap md:flex-nowrap gap-2 px-2 md:px-4 justify-center">
                <button 
                  onClick={() => {
                    if (chapterContent[currentChapter]) {
                      copyToClipboard(chapterContent[currentChapter]);
                      showToast("Conteúdo copiado! 📋✨");
                    }
                  }}
                  className="p-3 md:p-4 bg-stone-100 dark:bg-zinc-800 text-stone-600 dark:text-zinc-300 rounded-2xl hover:bg-stone-200 transition-all"
                  title="Copiar Texto"
                >
                  <Copy size={20} />
                </button>
                <button 
                  onClick={async () => {
                    if (chapterContent[currentChapter]) {
                      await share({
                        title: `Teologia: ${selectedSubject} - Cap ${currentChapter}`,
                        text: chapterContent[currentChapter],
                      });
                    }
                  }}
                  className="p-3 md:p-4 bg-stone-100 dark:bg-zinc-800 text-stone-600 dark:text-zinc-300 rounded-2xl hover:bg-stone-200 transition-all"
                  title="Compartilhar"
                >
                  <Share2 size={20} />
                </button>
                <button 
                  onClick={() => {
                    const isChapter5Passed = theologyProgress[selectedSubject!]?.chapter5Completed;
                    if (currentChapter === 5 && isChapter5Passed) {
                      startAssessment();
                    } else if (currentChapter === 5 && !isChapter5Passed) {
                      showToast("Você precisa concluir o questionário do capítulo 5 primeiro! 📖", 'info');
                    } else {
                      showToast("Conclua todos os 5 capítulos para liberar a avaliação final! 🎓", 'info');
                    }
                  }}
                  className="flex-1 min-w-[140px] py-3 md:py-4 bg-emerald-600 text-white font-bold rounded-2xl hover:bg-emerald-700 shadow-lg shadow-emerald-600/20 transition-all flex items-center justify-center gap-2 text-sm md:text-base"
                >
                  <Brain size={20} />
                  <span className="hidden sm:inline">AVALIAÇÃO (+40 pts)</span>
                  <span className="sm:hidden">AVALIAÇÃO (+40 pts)</span>
                </button>
                <button 
                  onClick={saveToNotebook}
                  className="p-3 md:p-4 bg-blue-600 text-white rounded-2xl hover:bg-blue-700 transition-all"
                  title="Salvar no Caderno"
                >
                  <Save size={20} />
                </button>
              </div>

              <button 
                onClick={() => setSelectedSubject(null)}
                className="p-3 md:p-4 bg-red-50 dark:bg-red-900/20 text-red-600 rounded-2xl hover:bg-red-100 transition-all w-full md:w-auto flex items-center justify-center"
                title="Fechar"
              >
                <X size={20} />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Removed Internal SaveToNotebookModal */}

      {/* Assessment Modal */}
      <AnimatePresence>
        {showAssessmentModal && (
          <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="bg-white dark:bg-zinc-900 w-full max-w-2xl max-h-[90vh] rounded-[3rem] overflow-hidden shadow-2xl border border-stone-200 dark:border-zinc-800 flex flex-col"
            >
              <div className="p-6 md:p-8 border-b border-stone-100 dark:border-zinc-800 flex justify-between items-center bg-stone-50 dark:bg-zinc-800/50 shrink-0">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-emerald-600 text-white rounded-2xl">
                    <Brain size={24} />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold">Avaliação: {selectedSubject}</h3>
                    <p className="text-xs text-stone-500 uppercase tracking-widest font-bold">Teste seus conhecimentos</p>
                  </div>
                </div>
                <button 
                  onClick={() => setShowAssessmentModal(false)}
                  className="p-2 hover:bg-stone-200 dark:hover:bg-zinc-700 rounded-full transition-colors"
                >
                  <X size={24} />
                </button>
              </div>

              <div className="p-6 md:p-8 overflow-y-auto custom-scrollbar flex-1">
                {isGeneratingAssessment ? (
                  <div className="flex flex-col items-center justify-center py-12 space-y-4">
                    <Loader2 className="animate-spin text-emerald-600" size={48} />
                    <p className="text-stone-500 font-medium animate-pulse text-center">Preparando as questões da avaliação...</p>
                  </div>
                ) : assessmentResult ? (
                  <div className="text-center space-y-8 py-6">
                    <div className="relative inline-block">
                      <div className={cn(
                        "w-32 h-32 rounded-full flex items-center justify-center text-4xl font-bold border-8",
                        assessmentResult.score >= 28 ? "border-emerald-500 text-emerald-600" : "border-amber-500 text-amber-600"
                      )}>
                        {assessmentResult.score}/40
                      </div>
                      {assessmentResult.score >= 28 && (
                        <div className="absolute -top-2 -right-2 bg-emerald-500 text-white p-2 rounded-full shadow-lg">
                          <Trophy size={20} />
                        </div>
                      )}
                    </div>
                    <div className="space-y-2">
                      <h4 className="text-2xl font-bold">Resultado Final</h4>
                      <p className="text-stone-500 text-lg italic">"{assessmentResult.message}"</p>
                    </div>
                    <div className="pt-6">
                      <button 
                        onClick={() => setShowAssessmentModal(false)}
                        className="px-10 py-4 bg-emerald-600 text-white font-bold rounded-2xl hover:bg-emerald-700 shadow-lg shadow-emerald-600/20 transition-all"
                      >
                        VOLTAR AO CURSO
                      </button>
                    </div>
                  </div>
                ) : assessmentQuestions.length > 0 ? (
                  <div className="space-y-8">
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-bold text-stone-400 uppercase tracking-widest">Questão {currentQuestionIndex + 1} de 10</span>
                      <span className={cn(
                        "px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest",
                        assessmentQuestions[currentQuestionIndex].difficulty === 'easy' ? "bg-emerald-100 text-emerald-700" :
                        assessmentQuestions[currentQuestionIndex].difficulty === 'intermediate' ? "bg-blue-100 text-blue-700" : "bg-red-100 text-red-700"
                      )}>
                        {assessmentQuestions[currentQuestionIndex].difficulty === 'easy' ? 'Fácil' :
                         assessmentQuestions[currentQuestionIndex].difficulty === 'intermediate' ? 'Intermediário' : 'Difícil'}
                      </span>
                    </div>
                    
                    <h4 className="text-xl font-bold leading-tight">{assessmentQuestions[currentQuestionIndex].question}</h4>
                    
                    <div className="space-y-3">
                      {assessmentQuestions[currentQuestionIndex].options.map((option: string, idx: number) => (
                        <button
                          key={idx}
                          onClick={() => handleAnswer(idx)}
                          className={cn(
                            "w-full p-5 text-left rounded-2xl border-2 transition-all flex items-center gap-4 group",
                            userAnswers[currentQuestionIndex] === idx 
                              ? "border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-900 dark:text-emerald-300" 
                              : "border-stone-100 dark:border-zinc-800 hover:border-emerald-200 dark:hover:border-emerald-800"
                          )}
                        >
                          <div className={cn(
                            "w-8 h-8 rounded-lg flex items-center justify-center font-bold shrink-0 transition-colors",
                            userAnswers[currentQuestionIndex] === idx ? "bg-emerald-500 text-white" : "bg-stone-100 dark:bg-zinc-800 text-stone-400 group-hover:bg-emerald-100 group-hover:text-emerald-600"
                          )}>
                            {String.fromCharCode(65 + idx)}
                          </div>
                          <span className="font-medium">{option}</span>
                        </button>
                      ))}
                    </div>

                    <div className="pt-6">
                      <button
                        onClick={nextQuestion}
                        disabled={userAnswers[currentQuestionIndex] === undefined}
                        className="w-full py-4 bg-emerald-600 text-white font-bold rounded-2xl hover:bg-emerald-700 shadow-lg shadow-emerald-600/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                      >
                        {currentQuestionIndex === 9 ? 'FINALIZAR AVALIAÇÃO' : 'PRÓXIMA QUESTÃO'}
                        <ArrowRight size={20} />
                      </button>
                    </div>
                  </div>
                ) : null}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
      {showFeedback && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.8, y: 20 }}
          className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none"
        >
          <motion.div 
            initial={{ rotate: -45, scale: 0 }}
            animate={{ rotate: 0, scale: 1 }}
            transition={{ type: "spring", stiffness: 200, damping: 15 }}
            className="bg-emerald-500 text-white p-6 rounded-full shadow-2xl"
          >
            <CheckCircle size={48} />
          </motion.div>
        </motion.div>
      )}
      <AudioConfirmationModal 
        isOpen={isAudioConfirmModalOpen}
        onClose={() => setIsAudioConfirmModalOpen(false)}
        onConfirm={confirmGenerateSpeech}
        isLoading={isGeneratingSpeech}
      />
    </div>
  );
}
