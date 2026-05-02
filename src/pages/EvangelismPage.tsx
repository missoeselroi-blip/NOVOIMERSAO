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
  Globe,
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
import EvangelismSearchPage from './EvangelismSearchPage';
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

import { EVANGELISM_SUBJECTS, getMaxChapters } from '../constants/evangelismCourse';
import { useShare } from '../utils/share';

interface EvangelismPageProps {
  onNavigate: (tab: string) => void;
}

export default function EvangelismPage({ onNavigate }: EvangelismPageProps) {
  const { fontFamily, fontSize, lineHeight } = useAccessibility();
  const [isReadingMode, setIsReadingMode] = useState(false);
  const [readingFontSize, setReadingFontSize] = useState(18);
  const [readingLineHeight, setReadingLineHeight] = useState(1.6);
  const { user, isInitialLoading } = useAuth();
  const { saveToNotebook: saveToNotebookGlobal } = useNotebook();
  const { share } = useShare();
  const { showToast } = useToast();
  const { balance, consumeCredits } = useCredits();
  
  const [isEnrolled, setIsEnrolled] = useState(() => {
    try {
      return localStorage.getItem('evangelism_enrolled') === 'true';
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
  const [isLoading, setIsLoading] = useState(false);
  const [evangelismProgress, setEvangelismProgress] = useState<Record<string, any>>({});
  const [showConclusionModal, setShowConclusionModal] = useState(false);
  const [showCertificatePaymentModal, setShowCertificatePaymentModal] = useState(false);
  const [conclusionText, setConclusionText] = useState('');
  const [isGeneratingConclusion, setIsGeneratingConclusion] = useState(false);
  const [isGeneratingModuleCertificate, setIsGeneratingModuleCertificate] = useState(false);
  const [isSaveModalOpen, setIsSaveModalOpen] = useState(false);
  const [contentToSave, setContentToSave] = useState('');

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

  const currentSectionRef = useRef('HOME');
  const sectionStartTimeRef = useRef(Date.now());
  const [hasAcceptedTerms, setHasAcceptedTerms] = useState<boolean | null>(null);

  useEffect(() => {
    if (user) {
      const checkTerms = async () => {
        try {
          const docRef = doc(db, 'evangelismTermsAcceptance', user.id);
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
      await setDoc(doc(db, 'evangelismTermsAcceptance', user.id), {
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
      const progressDocRef = doc(db, 'evangelismProgress', user.id);
      const updates: any = {
        [`sectionMetrics.${section}`]: increment(seconds),
        lastActive: new Date().toISOString()
      };

      if (section.startsWith('STUDY_')) {
        const subject = section.replace('STUDY_', '');
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
  }, [showSearch, showDebateModal, showAssessmentModal, showSummaryModal, showSubjectModal, selectedSubject]);

  useEffect(() => {
    return () => {
      const duration = Math.floor((Date.now() - sectionStartTimeRef.current) / 1000);
      saveSectionTime(currentSectionRef.current, duration);
    };
  }, []);

  useEffect(() => {
    if (!user) return;
    const progressDocRef = doc(db, 'evangelismProgress', user.id);
    const unsubscribe = onSnapshot(progressDocRef, (doc) => {
      if (doc.exists()) {
        setEvangelismProgress(doc.data());
      }
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, `evangelismProgress/${user.id}`);
    });
    return () => unsubscribe();
  }, [user]);

  const syncPointsToCareer = async (subject: string, updatedProgress: any) => {
    if (!user) return;
    try {
      const progressDoc = await getDoc(doc(db, 'evangelismProgress', user.id));
      if (progressDoc.exists()) {
        const allProgress = progressDoc.data();
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
                         (data.studyPoints || 0) +
                         (data.readingPoints || 0);
          return acc + sTotal;
        }, 0);

        const careerDocRef = doc(db, 'careerProgress', user.id);
        const careerDoc = await getDoc(careerDocRef);
        
        if (careerDoc.exists()) {
          const careerData = careerDoc.data();
          const currentTheologyPoints = careerData.theologyPoints || 0;
          const bibleRacePoints = careerData.bibleRacePoints || 0;
          const storytellingPoints = careerData.storytellingPoints || 0;
          await updateDoc(careerDocRef, { 
            evangelismPoints: grandTotal,
            points: grandTotal + currentTheologyPoints + bibleRacePoints + storytellingPoints,
            updatedAt: new Date().toISOString()
          });
        }
      }
    } catch (error) {
      console.error("Error syncing points to career:", error);
    }
  };

  const loadChapter = async (subject: string, chapter: number) => {
    if (chapterContent[chapter]) return;
    setIsLoading(true);
    try {
      const materialId = `evangelism_${subject.replace(/\s+/g, '_')}_${chapter}`;
      const materialDocRef = doc(db, 'shared_evangelism_materials', materialId);
      const materialDoc = await getDoc(materialDocRef);
      
      if (materialDoc.exists()) {
        const data = materialDoc.data();
        setChapterContent(prev => ({ ...prev, [chapter]: data.content }));
        await generateChapterQuiz(data.content);
        setIsLoading(false);
        return;
      }

      const prompt = `Gere o Capítulo ${chapter} de 5 do estudo sobre "${subject}" para o Curso de Evangelismo Imersão. 
      O conteúdo deve ser prático, bíblico e inspirador.
      Foque em estratégias reais, exemplos de grandes evangelistas e ferramentas modernas.
      Ao final, inclua uma seção "--- DESAFIO PRÁTICO ---" com uma ação para o aluno realizar no seu cotidiano.`;

      const response = await geminiService.generateText(prompt, "Você é um mestre em evangelismo e missiologia.");
      
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

  const generateChapterQuiz = async (content: string) => {
    setIsGeneratingChapterQuiz(true);
    try {
      const prompt = `Com base no conteúdo deste capítulo de evangelismo, gere um questionário de 4 perguntas de múltipla escolha (3 opções cada).
      Retorne APENAS um JSON: {"questions": [{"question": "...", "options": ["...", "...", "..."], "correctIndex": 0}]}`;
      const response = await geminiService.generateText(prompt, "Você é um professor de evangelismo.");
      const data = JSON.parse(response.replace(/```json|```/g, '').trim());
      setChapterQuiz(data.questions);
      setChapterQuizAnswers([]);
      setIsChapterQuizSubmitted(false);
    } catch (error) {
      console.error(error);
    } finally {
      setIsGeneratingChapterQuiz(false);
    }
  };

  const submitChapterQuiz = async () => {
    if (!user || !selectedSubject || !chapterQuiz) return;
    const score = calculateQuizScore();
    setIsChapterQuizSubmitted(true);
    if (score < 4) {
      showToast(`Você acertou ${score} de 4. Revise e tente novamente!`, 'error');
      return;
    }
    showToast("Excelente! Você pode avançar! 🔥", 'success');
    triggerFeedback();

    const current = evangelismProgress[selectedSubject] || {};
    const chapterKey = `chapter${currentChapter}QuizPoints`;
    const newChapterPoints = Math.max(current[chapterKey] || 0, score);
    
    let totalQuizPoints = 0;
    for (let i = 1; i <= 5; i++) {
      totalQuizPoints += (i === currentChapter ? newChapterPoints : (current[`chapter${i}QuizPoints`] || 0));
    }
    
    const newProgress = { ...current, [chapterKey]: newChapterPoints, quizPoints: totalQuizPoints, [`chapter${currentChapter}Completed`]: true };
    await updateDoc(doc(db, 'evangelismProgress', user.id), { [selectedSubject]: newProgress });
    await syncPointsToCareer(selectedSubject, newProgress);
  };

  const calculateQuizScore = () => {
    if (!chapterQuiz) return 0;
    return chapterQuiz.reduce((acc, q, i) => acc + (chapterQuizAnswers[i] === q.correctIndex ? 1 : 0), 0);
  };

  const calculateTotalEvangelismPoints = () => {
    return Object.keys(evangelismProgress).reduce((acc, key) => {
      if (key === 'userId' || key === 'enrolled') return acc;
      const data = evangelismProgress[key] || {};
      return acc + (data.evaluation || 0) + 
             (data.redacaoMateria || 0) + 
             (data.redacaoAprofundamento || 0) + 
             (data.redacaoSlide || 0) + 
             (data.redacaoVideo || 0) + 
             (data.redacaoPodcast || 0) + 
             (data.quizPoints || 0) + 
             (data.studyPoints || 0) +
             (data.readingPoints || 0);
    }, 0);
  };

  const markChapterAsCompleted = async () => {
    if (!user || !selectedSubject) return;
    
    const current = evangelismProgress[selectedSubject] || {};
    if (current[`chapter${currentChapter}Completed`]) return;

    const newReadingPoints = (current.readingPoints || 0) + 10;
    const newProgress = { 
      ...current, 
      [`chapter${currentChapter}Completed`]: true,
      readingPoints: newReadingPoints
    };
    
    await updateDoc(doc(db, 'evangelismProgress', user.id), { [selectedSubject]: newProgress });
    await syncPointsToCareer(selectedSubject, newProgress);
    
    showToast("Capítulo concluído! +10 pontos 🔥", 'success');
    triggerFeedback();
  };

  const handleEnroll = async () => {
    if (!user) return;
    setIsEnrolling(true);
    try {
      setIsEnrolled(true);
      localStorage.setItem('evangelism_enrolled', 'true');
      const progressDocRef = doc(db, 'evangelismProgress', user.id);
      const progressDoc = await getDoc(progressDocRef);
      if (!progressDoc.exists()) await setDoc(progressDocRef, { userId: user.id, enrolled: true });
      setShowSummary(false);
      showToast("Inscrição no Curso de Evangelismo realizada! 🔥", 'success');
    } catch (error) {
      console.error(error);
      showToast("Erro ao realizar inscrição.", 'error');
    } finally {
      setIsEnrolling(false);
    }
  };

  const handleSubjectClick = (subject: string) => {
    const subjectData = EVANGELISM_SUBJECTS.find(s => s.title === subject);
    if (subjectData?.prereq && (!evangelismProgress[subjectData.prereq] || !evangelismProgress[subjectData.prereq].completed)) {
      showToast(`Conclua ${subjectData.prereq} primeiro! 🔒`, 'info');
      return;
    }
    setSelectedSubject(subject);
    setCurrentChapter(1);
    setChapterContent({});
    loadChapter(subject, 1);
  };

  const handleSubjectSelect = (subject: string) => {
    setSelectedSubject(subject);
    setShowSubjectModal(false);
    setCurrentChapter(1);
    setChapterContent({});
    loadChapter(subject, 1);
  };

  const handlePrevChapter = () => {
    if (currentChapter > 1) {
      const prev = currentChapter - 1;
      setCurrentChapter(prev);
      loadChapter(selectedSubject!, prev);
    }
  };

  const handleNextChapter = () => {
    const isCompleted = evangelismProgress[selectedSubject!]?.[`chapter${currentChapter}Completed`];
    if (!isCompleted && (!isChapterQuizSubmitted || calculateQuizScore() < 4)) {
      showToast("Conclua o questionário ou marque como concluído para avançar! 🔥", 'info');
      return;
    }
    if (currentChapter < 5) {
      const next = currentChapter + 1;
      setCurrentChapter(next);
      loadChapter(selectedSubject!, next);
    }
  };

  const startAssessment = async () => {
    if (!selectedSubject) return;
    setIsGeneratingAssessment(true);
    setShowAssessmentModal(true);
    setAssessmentResult(null);
    setUserAnswers([]);
    setCurrentQuestionIndex(0);
    try {
      const prompt = `Gere 10 questões de avaliação final para a matéria "${selectedSubject}" do curso de evangelismo.
      Retorne APENAS JSON: {"questions": [{"question": "...", "options": ["...", "...", "..."], "correctIndex": 0, "difficulty": "easy|intermediate|hard"}]}`;
      const response = await geminiService.generateText(prompt, "Você é um avaliador de missiologia.");
      const data = JSON.parse(response.replace(/```json|```/g, '').trim());
      setAssessmentQuestions(data.questions);
    } catch (error) {
      console.error(error);
      showToast("Erro ao gerar avaliação.", 'error');
    } finally {
      setIsGeneratingAssessment(false);
    }
  };

  const handleAnswer = (idx: number) => {
    const newAnswers = [...userAnswers];
    newAnswers[currentQuestionIndex] = idx;
    setUserAnswers(newAnswers);
  };

  const nextQuestion = () => {
    if (currentQuestionIndex < 9) {
      setCurrentQuestionIndex(prev => prev + 1);
    } else {
      finishAssessment();
    }
  };

  const finishAssessment = async () => {
    if (!selectedSubject || !user) return;
    let score = 0;
    assessmentQuestions.forEach((q, i) => {
      if (userAnswers[i] === q.correctIndex) {
        score += (q.difficulty === 'hard' ? 6 : q.difficulty === 'intermediate' ? 4 : 2);
      }
    });

    const maxScore = assessmentQuestions.reduce((acc, q) => acc + (q.difficulty === 'hard' ? 6 : q.difficulty === 'intermediate' ? 4 : 2), 0);
    const normalizedScore = Math.round((score / maxScore) * 40);
    
    const message = normalizedScore >= 28 ? "Parabéns! Você foi aprovado com excelência! 🔥" : "Você não atingiu a nota mínima. Revise o conteúdo e tente novamente.";
    setAssessmentResult({ score: normalizedScore, message });

    if (normalizedScore >= 28) {
      triggerFeedback();
      const current = evangelismProgress[selectedSubject] || {};
      const newProgress = { ...current, evaluation: normalizedScore, completed: true };
      await updateDoc(doc(db, 'evangelismProgress', user.id), { [selectedSubject]: newProgress });
      await syncPointsToCareer(selectedSubject, newProgress);
    }
  };

  const evaluateSummary = async (text: string, type: string) => {
    if (!selectedSubject || !user) return;
    setIsEvaluatingSummary(true);
    try {
      const prompt = `Avalie este resumo sobre "${selectedSubject}" (${type}): "${text}".
      Retorne JSON: {"score": 0-10, "message": "...", "aiFeedback": "...", "criteria": [{"label": "...", "penalty": 0, "met": true}]}`;
      const response = await geminiService.generateText(prompt, "Você é um tutor de evangelismo.");
      const evaluation = JSON.parse(response.replace(/```json|```/g, '').trim());
      setSummaryEvaluation(evaluation);
      
      const field = type === 'Matéria básica' ? 'redacaoMateria' : type === 'Debate teológico' ? 'redacaoAprofundamento' : type === 'Slides' ? 'redacaoSlide' : type === 'Vídeo' ? 'redacaoVideo' : 'redacaoPodcast';
      const current = evangelismProgress[selectedSubject] || {};
      const newProgress = { ...current, [field]: evaluation.score };
      await updateDoc(doc(db, 'evangelismProgress', user.id), { [selectedSubject]: newProgress });
      await syncPointsToCareer(selectedSubject, newProgress);
      triggerFeedback();
    } catch (error) {
      console.error(error);
    } finally {
      setIsEvaluatingSummary(false);
    }
  };

  const handleGenerateCertificate = async () => {
    if (!user) return;
    
    // Check if all subjects are completed
    const allCompleted = EVANGELISM_SUBJECTS.every(s => evangelismProgress?.[s.title]?.completed);
    if (!allCompleted) {
      showToast("Conclua todos os módulos para gerar o certificado final! 🎓", 'info');
      return;
    }

    if (balance < 10) {
      setShowCertificatePaymentModal(true);
      return;
    }
    setIsLoading(true);
    try {
      await consumeCredits(10, "Certificado Final de Evangelismo");
      const doc = new jsPDF('l', 'mm', 'a4');
      doc.setFillColor(255, 248, 240);
      doc.rect(0, 0, 297, 210, 'F');
      doc.setDrawColor(234, 88, 12);
      doc.setLineWidth(5);
      doc.rect(10, 10, 277, 190);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(40);
      doc.setTextColor(234, 88, 12);
      doc.text('CERTIFICADO DE CONCLUSÃO', 148.5, 50, { align: 'center' });
      doc.setFontSize(20);
      doc.setTextColor(60, 60, 60);
      doc.text('Certificamos que', 148.5, 75, { align: 'center' });
      doc.setFontSize(35);
      doc.text(user.name.toUpperCase(), 148.5, 95, { align: 'center' });
      doc.setFontSize(20);
      doc.text('concluiu com êxito o curso de', 148.5, 115, { align: 'center' });
      doc.setFontSize(30);
      doc.text('EVANGELISMO IMERSÃO', 148.5, 135, { align: 'center' });
      doc.setFontSize(15);
      doc.text(`Data: ${new Date().toLocaleDateString('pt-BR')}`, 148.5, 155, { align: 'center' });
      doc.save(`Certificado_Final_Evangelismo_${user.name}.pdf`);
      showToast("Certificado final gerado com sucesso! 🎓", 'success');
    } catch (error) {
      console.error(error);
      showToast("Erro ao gerar certificado.", 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGenerateModuleCertificate = async (subject: string) => {
    if (!user) return;
    if (balance < 5) {
      showToast("Créditos insuficientes (5 créditos necessários).", 'error');
      return;
    }
    setIsGeneratingModuleCertificate(true);
    try {
      await consumeCredits(5, `Certificado do Módulo: ${subject}`);
      const doc = new jsPDF('l', 'mm', 'a4');
      doc.setFillColor(255, 252, 245);
      doc.rect(0, 0, 297, 210, 'F');
      doc.setDrawColor(249, 115, 22);
      doc.setLineWidth(3);
      doc.rect(15, 15, 267, 180);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(30);
      doc.setTextColor(249, 115, 22);
      doc.text('CERTIFICADO DE MÓDULO', 148.5, 60, { align: 'center' });
      doc.setFontSize(18);
      doc.setTextColor(80, 80, 80);
      doc.text('Este documento certifica que', 148.5, 85, { align: 'center' });
      doc.setFontSize(28);
      doc.text(user.name.toUpperCase(), 148.5, 105, { align: 'center' });
      doc.setFontSize(18);
      doc.text('concluiu o módulo de', 148.5, 125, { align: 'center' });
      doc.setFontSize(24);
      doc.text(subject.toUpperCase(), 148.5, 145, { align: 'center' });
      doc.setFontSize(14);
      doc.text(`Curso de Evangelismo Imersão - ${new Date().toLocaleDateString('pt-BR')}`, 148.5, 170, { align: 'center' });
      doc.save(`Certificado_${subject.replace(/\s+/g, '_')}_${user.name}.pdf`);
      showToast("Certificado do módulo gerado com sucesso! 📜", 'success');
    } catch (error) {
      console.error(error);
      showToast("Erro ao gerar certificado do módulo.", 'error');
    } finally {
      setIsGeneratingModuleCertificate(false);
    }
  };

  const handleDownloadChapter = (subject: string, chapter: number, content: string) => {
    const element = document.createElement("a");
    const file = new Blob([`# ${subject} - Capítulo ${chapter}\n\n${content}`], {type: 'text/plain'});
    element.href = URL.createObjectURL(file);
    element.download = `${subject}_Capitulo_${chapter}.txt`;
    document.body.appendChild(element);
    element.click();
    showToast("Capítulo baixado com sucesso! 📥", 'success');
  };

  const handleSaveToNotebook = async (subject: string, chapter: number, content: string) => {
    if (!user) return;
    if (!content) {
      showToast("Conteúdo não disponível para salvar.", "error");
      return;
    }
    try {
      await addDoc(collection(db, 'notes'), {
        userId: user.id,
        title: `${subject} - Cap. ${chapter}`,
        content: content,
        category: 'Evangelismo',
        createdAt: new Date().toISOString()
      });
      showToast("Salvo no seu caderno! 📓", 'success');
    } catch (error) {
      console.error(error);
      showToast("Erro ao salvar no caderno.", 'error');
    }
  };

  if (showSearch) return <EvangelismSearchPage initialQuery={searchQuery} />;

  return (
    <div className="max-w-7xl mx-auto px-4 pb-32">
      {!isEnrolled ? (
        <div className="max-w-4xl mx-auto text-center space-y-12 py-12">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
            <div className="inline-flex p-4 bg-orange-100 dark:bg-orange-900/30 text-orange-600 rounded-3xl mb-4">
              <Flame size={48} />
            </div>
            <h1 className="text-5xl md:text-6xl font-display font-bold text-stone-900 dark:text-zinc-100 leading-tight">
              Curso de Evangelismo <span className="text-orange-600">Imersão</span>
            </h1>
            <p className="text-xl text-stone-500 dark:text-zinc-400 max-w-2xl mx-auto leading-relaxed">
              Prepare-se para cumprir o IDE com excelência. Aprenda estratégias, base bíblica e ferramentas para alcançar o mundo.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { icon: <Zap />, title: "Prático", desc: "Estratégias reais para o dia a dia." },
              { icon: <Globe />, title: "Global", desc: "Visão missionária transcultural." },
              { icon: <Award />, title: "Certificado", desc: "Reconhecimento de conclusão." }
            ].map((item, i) => (
              <div key={`evangelism-feature-${item.title}-${i}`} className="p-8 bg-white dark:bg-zinc-900 rounded-[2.5rem] border border-stone-200 dark:border-zinc-800 shadow-sm">
                <div className="w-12 h-12 bg-orange-50 dark:bg-orange-900/20 text-orange-600 rounded-2xl flex items-center justify-center mb-4 mx-auto">
                  {item.icon}
                </div>
                <h3 className="font-bold text-lg mb-2">{item.title}</h3>
                <p className="text-sm text-stone-500">{item.desc}</p>
              </div>
            ))}
          </div>

          <button 
            onClick={handleEnroll}
            disabled={isEnrolling}
            className="px-12 py-6 bg-orange-600 text-white font-bold rounded-3xl hover:bg-orange-700 shadow-xl shadow-orange-600/20 transition-all text-xl flex items-center gap-3 mx-auto disabled:opacity-50"
          >
            {isEnrolling ? <Loader2 className="animate-spin" /> : <><Zap /> INICIAR CURSO AGORA</>}
          </button>
        </div>
      ) : !selectedSubject ? (
        <div className="space-y-12 py-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <h2 className="text-4xl font-display font-bold">Meu Progresso</h2>
              <p className="text-stone-500">Continue sua jornada de aprendizado.</p>
            </div>
            <div className="flex items-center gap-4">
              <div className="px-4 py-2 bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300 rounded-xl font-bold flex items-center gap-2 shadow-sm">
                <Trophy size={20} />
                {calculateTotalEvangelismPoints()} pts
              </div>
              <button onClick={() => setShowSearch(true)} className="p-4 bg-white dark:bg-zinc-900 border border-stone-200 dark:border-zinc-800 rounded-2xl hover:bg-stone-50 transition-all shadow-sm">
                <Search size={24} className="text-orange-600" />
              </button>
              <button onClick={handleGenerateCertificate} className="px-6 py-4 bg-orange-600 text-white font-bold rounded-2xl hover:bg-orange-700 transition-all shadow-lg shadow-orange-600/20 flex items-center gap-2">
                <Award size={20} /> CERTIFICADO FINAL
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {EVANGELISM_SUBJECTS.map((subject, i) => {
              const progress = evangelismProgress[subject.title] || {};
              const isLocked = subject.prereq && (!evangelismProgress[subject.prereq] || !evangelismProgress[subject.prereq].completed);
              
              return (
                <motion.div 
                  key={`evangelism-subject-${subject.title}-${i}`}
                  whileHover={!isLocked ? { y: -5 } : {}}
                  onClick={() => handleSubjectClick(subject.title)}
                  className={cn(
                    "p-8 rounded-[2.5rem] border-2 transition-all cursor-pointer relative overflow-hidden group",
                    isLocked ? "bg-stone-50 dark:bg-zinc-900/50 border-stone-100 dark:border-zinc-800 opacity-60" : 
                    progress.completed ? "bg-orange-50 dark:bg-orange-900/10 border-orange-200 dark:border-orange-800" :
                    "bg-white dark:bg-zinc-900 border-stone-100 dark:border-zinc-800 hover:border-orange-200"
                  )}
                >
                  <div className="flex justify-between items-start mb-6">
                    <div className={cn(
                      "p-4 rounded-2xl",
                      isLocked ? "bg-stone-200 text-stone-400" : "bg-orange-600 text-white shadow-lg shadow-orange-600/20"
                    )}>
                      <subject.icon size={28} />
                    </div>
                    {progress.completed ? (
                      <div className="bg-orange-500 text-white p-2 rounded-full"><CheckCircle2 size={20} /></div>
                    ) : isLocked && (
                      <Lock size={20} className="text-stone-400" />
                    )}
                  </div>
                  <h3 className="text-xl font-bold mb-2">{subject.title}</h3>
                  <p className="text-sm text-stone-500 line-clamp-2 mb-4">{subject.desc}</p>
                  <div className="w-full bg-stone-100 dark:bg-zinc-800 h-2 rounded-full overflow-hidden">
                    <div 
                      className="bg-orange-600 h-full transition-all duration-1000" 
                      style={{ width: `${progress.completed ? 100 : (Object.keys(progress).filter(k => k.endsWith('Completed')).length / 5) * 100}%` }}
                    />
                  </div>
                  {progress.completed && (
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        handleGenerateModuleCertificate(subject.title);
                      }}
                      disabled={isGeneratingModuleCertificate}
                      className="mt-4 w-full py-2 bg-orange-100 dark:bg-orange-900/30 text-orange-600 rounded-xl font-bold text-xs flex items-center justify-center gap-2 hover:bg-orange-200 transition-all"
                    >
                      <Award size={14} /> GERAR CERTIFICADO (5 CR)
                    </button>
                  )}
                </motion.div>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="space-y-8 py-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="flex items-center justify-between bg-white dark:bg-zinc-900 p-6 rounded-[2rem] border border-stone-200 dark:border-zinc-800 shadow-sm">
            <button onClick={() => setSelectedSubject(null)} className="flex items-center gap-2 text-stone-500 hover:text-orange-600 font-bold transition-colors">
              <ArrowLeft size={20} /> VOLTAR
            </button>
            <div className="text-center">
              <h2 className="text-xl font-bold">{selectedSubject}</h2>
              <p className="text-xs text-stone-400 uppercase tracking-widest font-bold">Capítulo {currentChapter} de 5</p>
            </div>
            <div className="w-10" />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            <div className="space-y-6">
              <div className="bg-white dark:bg-zinc-900 p-6 rounded-[2rem] border border-stone-200 dark:border-zinc-800 shadow-sm">
                <h3 className="font-bold mb-4 flex items-center gap-2"><BookOpen size={20} className="text-orange-600" /> Capítulos</h3>
                <div className="space-y-2">
                  {[1, 2, 3, 4, 5].map(cap => (
                    <button 
                      key={cap}
                      disabled={cap > 1 && (!evangelismProgress[selectedSubject!]?.[`chapter${cap-1}Completed`])}
                      onClick={() => { setCurrentChapter(cap); loadChapter(selectedSubject!, cap); }}
                      className={cn(
                        "w-full p-4 rounded-xl text-left flex items-center justify-between transition-all",
                        currentChapter === cap ? "bg-orange-600 text-white" : "hover:bg-stone-50 dark:hover:bg-zinc-800",
                        cap > 1 && (!evangelismProgress[selectedSubject!]?.[`chapter${cap-1}Completed`]) && "opacity-30 cursor-not-allowed"
                      )}
                    >
                      <span className="font-bold">Capítulo {cap}</span>
                      {evangelismProgress[selectedSubject!]?.[`chapter${cap}Completed`] && <CheckCircle size={16} />}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="lg:col-span-3 space-y-8">
              <div className="bg-white dark:bg-zinc-900 p-8 md:p-12 rounded-[3rem] border border-stone-200 dark:border-zinc-800 shadow-xl min-h-[600px]">
                {isLoading ? (
                  <div className="flex flex-col items-center justify-center h-[400px] space-y-6">
                    <div className="relative">
                      <Loader2 className="animate-spin text-orange-600" size={64} />
                      <Flame className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-orange-400" size={24} />
                    </div>
                    <p className="text-stone-500 font-medium animate-pulse text-center">Preparando conteúdo exclusivo para você...</p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    <div className="flex flex-wrap gap-2 mb-6 p-4 bg-stone-50 dark:bg-zinc-800/50 rounded-2xl border border-stone-100 dark:border-zinc-800">
                      <button 
                        onClick={() => {
                          copyToClipboard(chapterContent[currentChapter] || '');
                          showToast("Conteúdo copiado! 📋", 'success');
                        }}
                        className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-zinc-900 text-stone-600 dark:text-zinc-400 rounded-xl text-sm font-bold hover:text-orange-600 transition-all shadow-sm"
                      >
                        <Copy size={16} /> COPIAR
                      </button>
                      <button 
                        onClick={() => handleDownloadChapter(selectedSubject!, currentChapter, chapterContent[currentChapter] || '')}
                        className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-zinc-900 text-stone-600 dark:text-zinc-400 rounded-xl text-sm font-bold hover:text-orange-600 transition-all shadow-sm"
                      >
                        <Download size={16} /> BAIXAR
                      </button>
                      <button 
                        onClick={() => {
                          if (navigator.share) {
                            navigator.share({
                              title: `${selectedSubject} - Cap. ${currentChapter}`,
                              text: chapterContent[currentChapter] || '',
                              url: window.location.href
                            });
                          } else {
                            copyToClipboard(window.location.href);
                            showToast("Link copiado para compartilhar! 🔗", 'success');
                          }
                        }}
                        className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-zinc-900 text-stone-600 dark:text-zinc-400 rounded-xl text-sm font-bold hover:text-orange-600 transition-all shadow-sm"
                      >
                        <Share2 size={16} /> COMPARTILHAR
                      </button>
                      <button 
                        onClick={() => handleSaveToNotebook(selectedSubject!, currentChapter, chapterContent[currentChapter] || '')}
                        className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-zinc-900 text-stone-600 dark:text-zinc-400 rounded-xl text-sm font-bold hover:text-orange-600 transition-all shadow-sm"
                      >
                        <StickyNote size={16} /> SALVAR NO CADERNO
                      </button>
                    </div>
                    <div className="prose dark:prose-invert max-w-none" style={{ fontFamily, fontSize: `${readingFontSize}px`, lineHeight: readingLineHeight }}>
                      <MarkdownRenderer content={chapterContent[currentChapter] || ''} />
                    </div>
                    <div className="mt-8 pt-8 border-t border-stone-100 dark:border-zinc-800 flex justify-end">
                      <button
                        onClick={markChapterAsCompleted}
                        disabled={evangelismProgress[selectedSubject!]?.[`chapter${currentChapter}Completed`]}
                        className={cn(
                          "px-6 py-3 rounded-2xl font-bold flex items-center gap-2 transition-all",
                          evangelismProgress[selectedSubject!]?.[`chapter${currentChapter}Completed`]
                            ? "bg-stone-100 dark:bg-zinc-800 text-stone-400 cursor-not-allowed"
                            : "bg-orange-100 dark:bg-orange-900/30 text-orange-600 hover:bg-orange-200 shadow-sm"
                        )}
                      >
                        {evangelismProgress[selectedSubject!]?.[`chapter${currentChapter}Completed`] ? (
                          <><CheckCircle2 size={20} /> Capítulo Concluído</>
                        ) : (
                          <><CheckCircle size={20} /> Marcar como Concluído (+10 pts)</>
                        )}
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {chapterQuiz && !isLoading && (
                <div className="bg-orange-50 dark:bg-orange-900/10 p-8 md:p-12 rounded-[3rem] border-2 border-orange-200 dark:border-orange-800 space-y-8">
                  <div className="flex items-center gap-4 mb-8">
                    <div className="p-3 bg-orange-600 text-white rounded-2xl shadow-lg shadow-orange-600/20">
                      <Brain size={24} />
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold">Questionário de Fixação</h3>
                      <p className="text-stone-500">Acerte todas as questões para avançar.</p>
                    </div>
                  </div>
                  <div className="space-y-8">
                    {chapterQuiz.map((q, i) => (
                      <div key={`chapter-quiz-q-${i}`} className="space-y-4">
                        <h4 className="text-lg font-bold flex gap-3"><span className="text-orange-600">{i + 1}.</span> {q.question}</h4>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          {q.options.map((opt: string, idx: number) => (
                            <button 
                              key={`chapter-quiz-q-${i}-opt-${idx}`} 
                              onClick={() => {
                                const newAnswers = [...chapterQuizAnswers];
                                newAnswers[i] = idx;
                                setChapterQuizAnswers(newAnswers);
                              }}
                              className={cn(
                                "p-4 text-left rounded-2xl border-2 transition-all font-medium",
                                chapterQuizAnswers[i] === idx ? "border-orange-500 bg-orange-100 dark:bg-orange-900/30 text-orange-900 dark:text-orange-100" : "bg-white dark:bg-zinc-800 border-stone-100 dark:border-zinc-700 hover:border-orange-200"
                              )}
                            >
                              {opt}
                            </button>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                  <button 
                    onClick={submitChapterQuiz}
                    disabled={chapterQuizAnswers.length < 4}
                    className="w-full py-6 bg-orange-600 text-white font-bold rounded-3xl hover:bg-orange-700 shadow-xl shadow-orange-600/20 transition-all flex items-center justify-center gap-3 disabled:opacity-50"
                  >
                    <CheckCircle size={24} /> FINALIZAR CAPÍTULO
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Footer Navigation Bar */}
      {selectedSubject && isEnrolled && (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 w-full max-w-4xl px-4 z-50">
          <div className="bg-white/90 dark:bg-zinc-900/90 backdrop-blur-xl p-4 rounded-3xl border border-stone-200 dark:border-zinc-800 shadow-2xl flex items-center justify-between gap-4">
            <div className="flex gap-2">
              <button onClick={handlePrevChapter} disabled={currentChapter === 1} className="p-4 bg-stone-100 dark:bg-zinc-800 rounded-2xl hover:bg-stone-200 disabled:opacity-30 transition-all"><ArrowLeft size={20} /></button>
              <button onClick={handleNextChapter} disabled={currentChapter === 5 || !chapterContent[currentChapter]} className="p-4 bg-stone-100 dark:bg-zinc-800 rounded-2xl hover:bg-stone-200 disabled:opacity-30 transition-all"><ArrowRight size={20} /></button>
            </div>
            <button 
              onClick={() => {
                if (currentChapter === 5 && evangelismProgress[selectedSubject!]?.chapter5Completed) startAssessment();
                else showToast("Conclua o capítulo 5 primeiro! 🔥", 'info');
              }}
              className="flex-1 py-4 bg-orange-600 text-white font-bold rounded-2xl hover:bg-orange-700 shadow-lg shadow-orange-600/20 transition-all flex items-center justify-center gap-2"
            >
              <Brain size={20} /> AVALIAÇÃO FINAL
            </button>
            <button onClick={() => setSelectedSubject(null)} className="p-4 bg-red-50 dark:bg-red-900/20 text-red-600 rounded-2xl hover:bg-red-100 transition-all"><X size={20} /></button>
          </div>
        </div>
      )}

      <AnimatePresence>
        {showAssessmentModal && (
          <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="bg-white dark:bg-zinc-900 w-full max-w-2xl max-h-[90vh] rounded-[3rem] overflow-hidden shadow-2xl flex flex-col">
              <div className="p-8 border-b border-stone-100 dark:border-zinc-800 flex justify-between items-center bg-stone-50 dark:bg-zinc-800/50">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-orange-600 text-white rounded-2xl"><Brain size={24} /></div>
                  <h3 className="text-xl font-bold">Avaliação: {selectedSubject}</h3>
                </div>
                <button onClick={() => setShowAssessmentModal(false)} className="p-2 hover:bg-stone-200 rounded-full"><X size={24} /></button>
              </div>
              <div className="p-8 overflow-y-auto flex-1">
                {isGeneratingAssessment ? (
                  <div className="flex flex-col items-center justify-center py-12 space-y-4">
                    <Loader2 className="animate-spin text-orange-600" size={48} />
                    <p className="text-stone-500 font-medium">Preparando avaliação...</p>
                  </div>
                ) : assessmentResult ? (
                  <div className="text-center space-y-8 py-6">
                    <div className={cn("w-32 h-32 rounded-full mx-auto flex items-center justify-center text-4xl font-bold border-8", assessmentResult.score >= 28 ? "border-orange-500 text-orange-600" : "border-amber-500 text-amber-600")}>
                      {assessmentResult.score}/40
                    </div>
                    <h4 className="text-2xl font-bold">{assessmentResult.message}</h4>
                    <button onClick={() => setShowAssessmentModal(false)} className="px-10 py-4 bg-orange-600 text-white font-bold rounded-2xl hover:bg-orange-700 transition-all">VOLTAR AO CURSO</button>
                  </div>
                ) : assessmentQuestions.length > 0 && (
                    <div className="space-y-8">
                      <h4 className="text-xl font-bold">{assessmentQuestions[currentQuestionIndex].question}</h4>
                      <div className="space-y-3">
                        {assessmentQuestions[currentQuestionIndex].options.map((opt: string, idx: number) => (
                          <button key={`assessment-q-${currentQuestionIndex}-opt-${idx}`} onClick={() => handleAnswer(idx)} className={cn("w-full p-5 text-left rounded-2xl border-2 transition-all", userAnswers[currentQuestionIndex] === idx ? "border-orange-500 bg-orange-50 text-orange-900" : "border-stone-100 hover:border-orange-200")}>
                            {opt}
                          </button>
                        ))}
                      </div>
                    <button onClick={nextQuestion} disabled={userAnswers[currentQuestionIndex] === undefined} className="w-full py-4 bg-orange-600 text-white font-bold rounded-2xl hover:bg-orange-700 transition-all">
                      {currentQuestionIndex === 9 ? 'FINALIZAR' : 'PRÓXIMA'}
                    </button>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
