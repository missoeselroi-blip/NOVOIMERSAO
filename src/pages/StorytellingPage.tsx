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
  ZoomOut,
  Palette,
  Theater,
  Music,
  UserPlus
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { copyToClipboard } from '../utils/clipboard';
import { useToast } from '../components/Toast';
import { geminiService } from '../services/geminiService';
import { MarkdownRenderer } from '../components/MarkdownRenderer';
import { cn } from '../types';
import { useAccessibility } from '../contexts/AccessibilityContext';
import { SaveToNotebookModal } from '../components/SaveToNotebookModal';
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
import { CreditInfoTip } from '../components/CreditInfoTip';
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

import { STORYTELLING_SUBJECTS, STORYTELLING_AUTHORS, getMaxChapters } from '../constants/storytellingCourse';
import StorytellingSearchPage from './StorytellingSearchPage';
import { useShare } from '../utils/share';

interface StorytellingPageProps {
  onNavigate: (tab: string) => void;
}

export default function StorytellingPage({ onNavigate }: StorytellingPageProps) {
  const { fontFamily, fontSize, lineHeight } = useAccessibility();
  const [isReadingMode, setIsReadingMode] = useState(false);
  const [readingFontSize, setReadingFontSize] = useState(18);
  const [readingLineHeight, setReadingLineHeight] = useState(1.6);
  const { user, isInitialLoading } = useAuth();
  const { share } = useShare();
  const { showToast } = useToast();
  const { balance, consumeCredits } = useCredits();
  
  const [isEnrolled, setIsEnrolled] = useState(() => {
    try {
      return localStorage.getItem('storytelling_enrolled') === 'true';
    } catch (e) {
      return false;
    }
  });
  const [showSummary, setShowSummary] = useState(!isEnrolled);
  const [selectedSubject, setSelectedSubject] = useState<string | null>(null);
  const [showSubjectModal, setShowSubjectModal] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedAuthor, setSelectedAuthor] = useState('Todos os autores');
  const [currentChapter, setCurrentChapter] = useState(1);
  const [chapterContent, setChapterContent] = useState<Record<number, string>>({});
  const [chapterQuiz, setChapterQuiz] = useState<any[] | null>(null);
  const [chapterQuizAnswers, setChapterQuizAnswers] = useState<number[]>([]);
  const [isChapterQuizSubmitted, setIsChapterQuizSubmitted] = useState(false);
  const [isGeneratingChapterQuiz, setIsGeneratingChapterQuiz] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [storytellingProgress, setStorytellingProgress] = useState<Record<string, any>>({});
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

  const [isNotebookModalOpen, setIsNotebookModalOpen] = useState(false);
  const [pendingNote, setPendingNote] = useState<{ title: string, content: string } | null>(null);
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
          const docRef = doc(db, 'storytellingTermsAcceptance', user.id);
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
      await setDoc(doc(db, 'storytellingTermsAcceptance', user.id), {
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
      const progressDocRef = doc(db, 'storytellingProgress', user.id);
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

      await updateDoc(progressDocRef, updates);
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
    const progressDocRef = doc(db, 'storytellingProgress', user.id);
    const unsubscribe = onSnapshot(progressDocRef, (doc) => {
      if (doc.exists()) {
        setStorytellingProgress(doc.data());
      }
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, `storytellingProgress/${user.id}`);
    });
    return () => unsubscribe();
  }, [user]);

  const syncPointsToCareer = async (subject: string, updatedProgress: any) => {
    if (!user) return;
    try {
      const progressDoc = await getDoc(doc(db, 'storytellingProgress', user.id));
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
                         (data.studyPoints || 0);
          return acc + sTotal;
        }, 0);

        const careerDocRef = doc(db, 'careerProgress', user.id);
        const careerDoc = await getDoc(careerDocRef);
        
        if (careerDoc.exists()) {
          const careerData = careerDoc.data();
          const currentTheologyPoints = careerData.theologyPoints || 0;
          const bibleRacePoints = careerData.bibleRacePoints || 0;
          const evangelismPoints = careerData.evangelismPoints || 0;
          await updateDoc(careerDocRef, { 
            storytellingPoints: grandTotal,
            points: grandTotal + currentTheologyPoints + bibleRacePoints + evangelismPoints,
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
      const materialId = `storytelling_${subject.replace(/\s+/g, '_')}_${chapter}`;
      const materialDocRef = doc(db, 'shared_storytelling_materials', materialId);
      const materialDoc = await getDoc(materialDocRef);
      
      if (materialDoc.exists()) {
        const data = materialDoc.data();
        setChapterContent(prev => ({ ...prev, [chapter]: data.content }));
        await generateChapterQuiz(data.content);
        setIsLoading(false);
        return;
      }

      const prompt = `Gere o Capítulo ${chapter} de 5 do estudo sobre "${subject}" para o Curso de A Arte de Contar Estórias. 
      O conteúdo deve ser prático, criativo e inspirador.
      Foque em técnicas de narrativa, expressão, recursos visuais e conexão emocional.
      Ao final, inclua uma seção "--- DESAFIO PRÁTICO ---" com uma ação para o aluno realizar no seu cotidiano.`;

      const response = await geminiService.generateText(prompt, "Você é um mestre na arte de contar histórias.");
      
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
      const prompt = `Com base no conteúdo deste capítulo de contação de histórias, gere um questionário de 4 perguntas de múltipla escolha (3 opções cada).
      Retorne APENAS um JSON: {"questions": [{"question": "...", "options": ["...", "...", "..."], "correctIndex": 0}]}`;
      const response = await geminiService.generateText(prompt, "Você é um professor de contação de histórias.");
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
    showToast("Excelente! Você pode avançar! ✨", 'success');
    triggerFeedback();

    const current = storytellingProgress[selectedSubject] || {};
    const chapterKey = `chapter${currentChapter}QuizPoints`;
    const newChapterPoints = Math.max(current[chapterKey] || 0, score);
    
    let totalQuizPoints = 0;
    for (let i = 1; i <= 5; i++) {
      totalQuizPoints += (i === currentChapter ? newChapterPoints : (current[`chapter${i}QuizPoints`] || 0));
    }
    
    const newProgress = { ...current, [chapterKey]: newChapterPoints, quizPoints: totalQuizPoints, [`chapter${currentChapter}Completed`]: true };
    await updateDoc(doc(db, 'storytellingProgress', user.id), { [selectedSubject]: newProgress });
    await syncPointsToCareer(selectedSubject, newProgress);
  };

  const calculateQuizScore = () => {
    if (!chapterQuiz) return 0;
    return chapterQuiz.reduce((acc, q, i) => acc + (chapterQuizAnswers[i] === q.correctIndex ? 1 : 0), 0);
  };

  const handleEnroll = async () => {
    if (!user) return;
    setIsEnrolling(true);
    try {
      setIsEnrolled(true);
      localStorage.setItem('storytelling_enrolled', 'true');
      const progressDocRef = doc(db, 'storytellingProgress', user.id);
      const progressDoc = await getDoc(progressDocRef);
      if (!progressDoc.exists()) await setDoc(progressDocRef, { userId: user.id, enrolled: true });
      setShowSummary(false);
      showToast("Inscrição no Curso de Contação de Estórias realizada! ✨", 'success');
    } catch (error) {
      console.error(error);
      showToast("Erro ao realizar inscrição.", 'error');
    } finally {
      setIsEnrolling(false);
    }
  };

  const handleSubjectClick = (subject: string) => {
    const subjectData = STORYTELLING_SUBJECTS.find(s => s.title === subject);
    if (subjectData?.prereq && (!storytellingProgress[subjectData.prereq] || !storytellingProgress[subjectData.prereq].completed)) {
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
    if (!isChapterQuizSubmitted || calculateQuizScore() < 4) {
      showToast("Conclua o questionário com 100% para avançar! ✨", 'info');
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
      const prompt = `Gere 10 questões de avaliação final para a matéria "${selectedSubject}" do curso de contação de histórias.
      Retorne APENAS JSON: {"questions": [{"question": "...", "options": ["...", "...", "..."], "correctIndex": 0, "difficulty": "easy|intermediate|hard"}]}`;
      const response = await geminiService.generateText(prompt, "Você é um avaliador de pedagogia e artes.");
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
    
    const message = normalizedScore >= 28 ? "Parabéns! Você foi aprovado com excelência! ✨" : "Você não atingiu a nota mínima. Revise o conteúdo e tente novamente.";
    setAssessmentResult({ score: normalizedScore, message });

    if (normalizedScore >= 28) {
      triggerFeedback();
      const current = storytellingProgress[selectedSubject] || {};
      const newProgress = { ...current, evaluation: normalizedScore, completed: true };
      await updateDoc(doc(db, 'storytellingProgress', user.id), { [selectedSubject]: newProgress });
      await syncPointsToCareer(selectedSubject, newProgress);
    }
  };

  const evaluateSummary = async (text: string, type: string) => {
    if (!selectedSubject || !user) return;
    setIsEvaluatingSummary(true);
    try {
      const prompt = `Avalie este resumo sobre "${selectedSubject}" (${type}): "${text}".
      Retorne JSON: {"score": 0-10, "message": "...", "aiFeedback": "...", "criteria": [{"label": "...", "penalty": 0, "met": true}]}`;
      const response = await geminiService.generateText(prompt, "Você é um tutor de contação de histórias.");
      const evaluation = JSON.parse(response.replace(/```json|```/g, '').trim());
      setSummaryEvaluation(evaluation);
      
      const field = type === 'Matéria básica' ? 'redacaoMateria' : type === 'Debate teológico' ? 'redacaoAprofundamento' : type === 'Slides' ? 'redacaoSlide' : type === 'Vídeo' ? 'redacaoVideo' : 'redacaoPodcast';
      const current = storytellingProgress[selectedSubject] || {};
      const newProgress = { ...current, [field]: evaluation.score };
      await updateDoc(doc(db, 'storytellingProgress', user.id), { [selectedSubject]: newProgress });
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
    const allCompleted = STORYTELLING_SUBJECTS.every(s => storytellingProgress?.[s.title]?.completed);
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
      await consumeCredits(10, "Certificado Final de Contação de Estórias");
      const doc = new jsPDF('l', 'mm', 'a4');
      doc.setFillColor(255, 248, 240);
      doc.rect(0, 0, 297, 210, 'F');
      doc.setDrawColor(147, 51, 234);
      doc.setLineWidth(5);
      doc.rect(10, 10, 277, 190);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(40);
      doc.setTextColor(147, 51, 234);
      doc.text('CERTIFICADO DE CONCLUSÃO', 148.5, 50, { align: 'center' });
      doc.setFontSize(20);
      doc.setTextColor(60, 60, 60);
      doc.text('Certificamos que', 148.5, 75, { align: 'center' });
      doc.setFontSize(35);
      doc.text(user.name.toUpperCase(), 148.5, 95, { align: 'center' });
      doc.setFontSize(20);
      doc.text('concluiu com êxito o curso de', 148.5, 115, { align: 'center' });
      doc.setFontSize(30);
      doc.text('A ARTE DE CONTAR ESTÓRIAS', 148.5, 135, { align: 'center' });
      doc.setFontSize(15);
      doc.text(`Data: ${new Date().toLocaleDateString('pt-BR')}`, 148.5, 155, { align: 'center' });
      doc.save(`Certificado_Final_Storytelling_${user.name}.pdf`);
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
      doc.setDrawColor(168, 85, 247);
      doc.setLineWidth(3);
      doc.rect(15, 15, 267, 180);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(30);
      doc.setTextColor(168, 85, 247);
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
      doc.text(`Curso de Contação de Estórias - ${new Date().toLocaleDateString('pt-BR')}`, 148.5, 170, { align: 'center' });
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
        category: 'Contação de Estórias',
        createdAt: new Date().toISOString()
      });
      showToast("Salvo no seu caderno! 📓", 'success');
    } catch (error) {
      console.error(error);
      showToast("Erro ao salvar no caderno.", 'error');
    }
  };

  const handleSearchAuthor = () => {
    if (!searchQuery.trim() && selectedAuthor === 'Todos os autores') {
      showToast("Digite algo ou selecione um autor para pesquisar.", "info");
      return;
    }
    setShowSearch(true);
  };

  if (showSearch) {
    return (
      <div className="max-w-7xl mx-auto px-4 pb-32">
        <button 
          onClick={() => setShowSearch(false)}
          className="flex items-center gap-2 text-stone-500 hover:text-purple-600 transition-colors mb-8"
        >
          <ArrowLeft size={20} />
          Voltar para o Curso
        </button>
        <StorytellingSearchPage initialQuery={searchQuery} />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 pb-32">
      {!isEnrolled ? (
        <div className="max-w-4xl mx-auto text-center space-y-12 py-12">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
            <div className="inline-flex p-4 bg-purple-100 dark:bg-purple-900/30 text-purple-600 rounded-3xl mb-4">
              <Sparkles size={48} />
            </div>
            <h1 className="text-5xl md:text-6xl font-display font-bold text-stone-900 dark:text-zinc-100 leading-tight">
              A Arte de Contar <span className="text-purple-600">Estórias</span>
            </h1>
            <p className="text-xl text-stone-500 dark:text-zinc-400 max-w-2xl mx-auto leading-relaxed">
              Descubra o poder das narrativas para transformar vidas. Aprenda técnicas, recursos e a magia de encantar através das palavras.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { icon: <Theater />, title: "Expressivo", desc: "Domine voz, corpo e emoção." },
              { icon: <Palette />, title: "Criativo", desc: "Crie ambientes e recursos mágicos." },
              { icon: <Award />, title: "Certificado", desc: "Reconhecimento de conclusão." }
            ].map((item, i) => (
              <div key={`storytelling-feature-${item.title}-${i}`} className="p-8 bg-white dark:bg-zinc-900 rounded-[2.5rem] border border-stone-200 dark:border-zinc-800 shadow-sm">
                <div className="w-12 h-12 bg-purple-50 dark:bg-purple-900/20 text-purple-600 rounded-2xl flex items-center justify-center mb-4 mx-auto">
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
            className="px-12 py-6 bg-purple-600 text-white font-bold rounded-3xl hover:bg-purple-700 shadow-xl shadow-purple-600/20 transition-all text-xl flex items-center gap-3 mx-auto disabled:opacity-50"
          >
            {isEnrolling ? <Loader2 className="animate-spin" /> : <><Zap /> INICIAR CURSO AGORA</>}
          </button>
        </div>
      ) : !selectedSubject ? (
        <div className="space-y-12 py-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <h2 className="text-4xl font-display font-bold">Meu Progresso</h2>
              <p className="text-stone-500">Continue sua jornada na arte de narrar.</p>
            </div>
            <div className="flex items-center gap-4">
              <button onClick={handleGenerateCertificate} className="px-6 py-4 bg-purple-600 text-white font-bold rounded-2xl hover:bg-purple-700 transition-all shadow-lg shadow-purple-600/20 flex items-center gap-2">
                <Award size={20} /> CERTIFICADO FINAL
              </button>
            </div>
          </div>

          {/* Ask the Author Section */}
          <div className="bg-white dark:bg-zinc-900 p-8 rounded-[2.5rem] border border-stone-100 dark:border-zinc-800 shadow-sm space-y-6">
            <div className="flex items-center gap-3 text-purple-600">
              <MessageSquare size={24} />
              <h3 className="text-2xl font-bold">Pergunte ao autor</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="md:col-span-2 relative">
                <input 
                  type="text"
                  placeholder="O que você deseja perguntar ou pesquisar?"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-12 pr-4 py-4 bg-stone-50 dark:bg-zinc-800 border border-stone-200 dark:border-zinc-700 rounded-2xl focus:ring-2 focus:ring-purple-500 outline-none transition-all"
                />
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400" size={20} />
              </div>
              <div className="relative">
                <select 
                  value={selectedAuthor}
                  onChange={(e) => setSelectedAuthor(e.target.value)}
                  className="w-full px-4 py-4 bg-stone-50 dark:bg-zinc-800 border border-stone-200 dark:border-zinc-700 rounded-2xl focus:ring-2 focus:ring-purple-500 outline-none transition-all appearance-none cursor-pointer"
                >
                  {STORYTELLING_AUTHORS.map(author => (
                    <option key={author} value={author}>{author}</option>
                  ))}
                </select>
                <ChevronRight className="absolute right-4 top-1/2 -translate-y-1/2 text-stone-400 rotate-90" size={20} />
              </div>
            </div>
            <button 
              onClick={handleSearchAuthor}
              className="w-full md:w-auto px-8 py-4 bg-purple-600 text-white font-bold rounded-2xl hover:bg-purple-700 transition-all shadow-lg shadow-purple-600/20 flex items-center justify-center gap-2"
            >
              <Search size={20} /> PESQUISAR
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {STORYTELLING_SUBJECTS.map((subject, i) => {
              const progress = storytellingProgress[subject.title] || {};
              const isLocked = subject.prereq && (!storytellingProgress[subject.prereq] || !storytellingProgress[subject.prereq].completed);
              
              return (
                <motion.div 
                  key={`storytelling-subject-${subject.title}-${i}`}
                  whileHover={!isLocked ? { y: -5 } : {}}
                  onClick={() => handleSubjectClick(subject.title)}
                  className={cn(
                    "p-8 rounded-[2.5rem] border-2 transition-all cursor-pointer relative overflow-hidden group",
                    isLocked ? "bg-stone-50 dark:bg-zinc-900/50 border-stone-100 dark:border-zinc-800 opacity-60" : 
                    progress.completed ? "bg-purple-50 dark:bg-purple-900/10 border-purple-200 dark:border-purple-800" :
                    "bg-white dark:bg-zinc-900 border-stone-100 dark:border-zinc-800 hover:border-purple-200"
                  )}
                >
                  <div className="flex justify-between items-start mb-6">
                    <div className={cn(
                      "p-4 rounded-2xl",
                      isLocked ? "bg-stone-200 text-stone-400" : "bg-purple-600 text-white shadow-lg shadow-purple-600/20"
                    )}>
                      <subject.icon size={28} />
                    </div>
                    {progress.completed ? (
                      <div className="bg-purple-500 text-white p-2 rounded-full"><CheckCircle2 size={20} /></div>
                    ) : isLocked && (
                      <Lock size={20} className="text-stone-400" />
                    )}
                  </div>
                  <h3 className="text-xl font-bold mb-2">{subject.title}</h3>
                  <p className="text-sm text-stone-500 line-clamp-2 mb-4">{subject.desc}</p>
                  <div className="w-full bg-stone-100 dark:bg-zinc-800 h-2 rounded-full overflow-hidden">
                    <div 
                      className="bg-purple-600 h-full transition-all duration-1000" 
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
                      className="mt-4 w-full py-2 bg-purple-100 dark:bg-purple-900/30 text-purple-600 rounded-xl font-bold text-xs flex items-center justify-center gap-2 hover:bg-purple-200 transition-all"
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
        <div className="py-8 space-y-8">
          {/* Study Content Rendering (similar to EvangelismPage) */}
          <div className="flex items-center justify-between">
            <button 
              onClick={() => setSelectedSubject(null)}
              className="flex items-center gap-2 text-stone-500 hover:text-purple-600 transition-colors font-bold"
            >
              <ArrowLeft size={20} /> VOLTAR AOS MÓDULOS
            </button>
            <div className="flex items-center gap-4">
              <span className="text-sm font-bold text-stone-400">CAPÍTULO {currentChapter} DE 5</span>
              <div className="flex gap-1">
                {[1,2,3,4,5].map(i => (
                  <div key={i} className={cn("w-8 h-1.5 rounded-full", i <= currentChapter ? "bg-purple-600" : "bg-stone-200")} />
                ))}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-8">
              <div className="bg-white dark:bg-zinc-900 rounded-[2.5rem] border border-stone-100 dark:border-zinc-800 shadow-sm overflow-hidden min-h-[600px] flex flex-col">
                <div className="p-8 border-b border-stone-100 dark:border-zinc-800 flex items-center justify-between bg-stone-50/50 dark:bg-zinc-800/50">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-purple-600 text-white rounded-2xl shadow-lg shadow-purple-600/20">
                      <BookOpen size={24} />
                    </div>
                    <div>
                      <h3 className="font-bold text-lg">{selectedSubject}</h3>
                      <p className="text-xs text-stone-400 uppercase tracking-widest">Estudo Imersivo</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button 
                      onClick={() => handleDownloadChapter(selectedSubject!, currentChapter, chapterContent[currentChapter])}
                      className="p-3 hover:bg-stone-200 dark:hover:bg-zinc-700 rounded-xl transition-colors text-stone-500"
                      title="Baixar Capítulo"
                    >
                      <Download size={20} />
                    </button>
                    <button 
                      onClick={() => handleSaveToNotebook(selectedSubject!, currentChapter, chapterContent[currentChapter] || '')}
                      className="p-3 hover:bg-stone-200 dark:hover:bg-zinc-700 rounded-xl transition-colors text-stone-500"
                      title="Salvar no Caderno"
                    >
                      <StickyNote size={20} />
                    </button>
                  </div>
                </div>

                <div className="p-8 flex-grow">
                  {isLoading ? (
                    <div className="h-full flex flex-col items-center justify-center space-y-4">
                      <Loader2 className="animate-spin text-purple-600" size={48} />
                      <p className="text-stone-500 font-medium animate-pulse">Preparando seu material de estudo...</p>
                    </div>
                  ) : (
                    <motion.div 
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="prose prose-stone dark:prose-invert max-w-none"
                    >
                      <MarkdownRenderer content={chapterContent[currentChapter] || ''} />
                    </motion.div>
                  )}
                </div>

                <div className="p-8 bg-stone-50/50 dark:bg-zinc-800/50 border-t border-stone-100 dark:border-zinc-800 flex items-center justify-between">
                  <button 
                    onClick={handlePrevChapter}
                    disabled={currentChapter === 1}
                    className="px-6 py-3 flex items-center gap-2 font-bold text-stone-500 hover:text-purple-600 disabled:opacity-30 transition-colors"
                  >
                    <ArrowLeft size={20} /> ANTERIOR
                  </button>
                  <button 
                    onClick={handleNextChapter}
                    className="px-8 py-3 bg-purple-600 text-white font-bold rounded-2xl hover:bg-purple-700 transition-all shadow-lg shadow-purple-600/20 flex items-center gap-2"
                  >
                    {currentChapter === 5 ? 'CONCLUIR MÓDULO' : 'PRÓXIMO'} <ArrowRight size={20} />
                  </button>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              {/* Quiz Card */}
              <div className="bg-white dark:bg-zinc-900 rounded-[2.5rem] border border-stone-100 dark:border-zinc-800 shadow-sm p-8">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2 bg-orange-100 text-orange-600 rounded-lg">
                    <Zap size={20} />
                  </div>
                  <h4 className="font-bold">Verificação de Aprendizado</h4>
                </div>

                {isGeneratingChapterQuiz ? (
                  <div className="py-12 flex flex-col items-center justify-center space-y-4">
                    <Loader2 className="animate-spin text-orange-600" size={32} />
                    <p className="text-xs text-stone-400 text-center">Gerando questões personalizadas...</p>
                  </div>
                ) : chapterQuiz ? (
                  <div className="space-y-8">
                    {chapterQuiz.map((q, qIdx) => (
                      <div key={qIdx} className="space-y-4">
                        <p className="text-sm font-bold leading-relaxed">{qIdx + 1}. {q.question}</p>
                        <div className="space-y-2">
                          {q.options.map((opt: string, oIdx: number) => {
                            const isSelected = chapterQuizAnswers[qIdx] === oIdx;
                            const isCorrect = q.correctIndex === oIdx;
                            const showResult = isChapterQuizSubmitted;

                            return (
                              <button
                                key={oIdx}
                                onClick={() => !isChapterQuizSubmitted && setChapterQuizAnswers(prev => {
                                  const next = [...prev];
                                  next[qIdx] = oIdx;
                                  return next;
                                })}
                                className={cn(
                                  "w-full p-4 rounded-xl text-left text-sm transition-all border-2",
                                  isSelected ? "border-purple-600 bg-purple-50 dark:bg-purple-900/20" : "border-stone-100 dark:border-zinc-800 hover:border-purple-200",
                                  showResult && isCorrect && "border-green-500 bg-green-50 dark:bg-green-900/20",
                                  showResult && isSelected && !isCorrect && "border-red-500 bg-red-50 dark:bg-red-900/20"
                                )}
                              >
                                {opt}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    ))}
                    <button
                      onClick={submitChapterQuiz}
                      disabled={isChapterQuizSubmitted || chapterQuizAnswers.length < 4}
                      className="w-full py-4 bg-orange-600 text-white font-bold rounded-2xl hover:bg-orange-700 disabled:opacity-50 transition-all shadow-lg shadow-orange-600/20"
                    >
                      {isChapterQuizSubmitted ? 'QUESTIONÁRIO ENVIADO' : 'ENVIAR RESPOSTAS'}
                    </button>
                  </div>
                ) : null}
              </div>

              {/* Tools Card */}
              <div className="bg-stone-900 text-white rounded-[2.5rem] p-8 space-y-6">
                <h4 className="font-bold flex items-center gap-2">
                  <Sparkles size={20} className="text-purple-400" />
                  Ferramentas de Estudo
                </h4>
                <div className="grid grid-cols-2 gap-4">
                  <button onClick={() => setShowSummaryModal(true)} className="p-4 bg-white/10 hover:bg-white/20 rounded-2xl transition-all flex flex-col items-center gap-2 text-center">
                    <FileText size={24} className="text-purple-400" />
                    <span className="text-[10px] font-bold uppercase tracking-wider">Resumo</span>
                  </button>
                  <button onClick={() => setShowDebateModal(true)} className="p-4 bg-white/10 hover:bg-white/20 rounded-2xl transition-all flex flex-col items-center gap-2 text-center">
                    <MessageSquare size={24} className="text-blue-400" />
                    <span className="text-[10px] font-bold uppercase tracking-wider">Debate</span>
                  </button>
                  <button onClick={startAssessment} className="p-4 bg-white/10 hover:bg-white/20 rounded-2xl transition-all flex flex-col items-center gap-2 text-center">
                    <Award size={24} className="text-green-400" />
                    <span className="text-[10px] font-bold uppercase tracking-wider">Avaliação</span>
                  </button>
                  <button onClick={() => setShowSearch(true)} className="p-4 bg-white/10 hover:bg-white/20 rounded-2xl transition-all flex flex-col items-center gap-2 text-center">
                    <Search size={24} className="text-orange-400" />
                    <span className="text-[10px] font-bold uppercase tracking-wider">Pesquisa</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
