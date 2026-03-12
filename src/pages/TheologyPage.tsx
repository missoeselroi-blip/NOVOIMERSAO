import React, { useState, useEffect } from 'react';
import { 
  GraduationCap, 
  BookOpen, 
  CheckCircle, 
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
  Heart,
  Users,
  Hourglass,
  Feather,
  Key
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useToast } from '../components/Toast';
import { geminiService } from '../services/geminiService';
import { MarkdownRenderer } from '../components/MarkdownRenderer';
import { cn } from '../types';
import TheologySearchPage from './TheologySearchPage';
import { SaveToNotebookModal } from '../components/SaveToNotebookModal';
import { useAuth } from '../contexts/AuthContext';
import { AudioSearchButton } from '../components/AudioSearchButton';
import jsPDF from 'jspdf';

import { db } from '../lib/firebase';
import { doc, getDoc, setDoc, updateDoc, onSnapshot, collection, addDoc } from 'firebase/firestore';

const THEOLOGY_SUBJECTS = [
  { title: 'Bibliologia', desc: 'A Doutrina das Escrituras', topics: ['Origem e Natureza', 'Inspiração', 'Inerrância', 'Panorama'], prereq: null, icon: Book },
  { title: 'Teontologia', desc: 'A Doutrina de Deus', topics: ['Atributos', 'A Trindade', 'Panorama'], prereq: 'Bibliologia', icon: Crown },
  { title: 'Cristologia', desc: 'A Doutrina de Cristo', topics: ['Divindade e Humanidade', 'A Obra de Cristo', 'Panorama'], prereq: 'Teontologia', icon: Cross },
  { title: 'Pneumatologia', desc: 'A Doutrina do Espírito Santo', topics: ['A Pessoa do Espírito', 'Os Dons', 'Panorama'], prereq: 'Cristologia', icon: Flame },
  { title: 'Antropologia Bíblica', desc: 'O Estudo sobre o Homem', topics: ['Criação', 'Constituição', 'Panorama'], prereq: 'Pneumatologia', icon: User },
  { title: 'Hamartiologia', desc: 'O Estudo sobre o Pecado', topics: ['Natureza', 'Consequências', 'Panorama'], prereq: 'Antropologia Bíblica', icon: AlertTriangle },
  { title: 'Soteriologia', desc: 'A Doutrina da Salvação', topics: ['A Graça', 'Justificação', 'Panorama'], prereq: 'Hamartiologia', icon: Heart },
  { title: 'Eclesiologia', desc: 'A Doutrina da Igreja', topics: ['Missão', 'Ordenanças', 'Panorama'], prereq: 'Soteriologia', icon: Users },
  { title: 'Escatologia', desc: 'A Doutrina das Últimas Coisas', topics: ['Arrebatamento', 'Milênio', 'Panorama'], prereq: 'Eclesiologia', icon: Hourglass },
  { title: 'Angelologia', desc: 'Anjos e Demônios', topics: ['Os Anjos', 'A Queda', 'Panorama'], prereq: 'Escatologia', icon: Feather },
  { title: 'Hermenêutica Bíblica', desc: 'A Interpretação da Bíblia', topics: ['Princípios', 'Regras', 'Panorama'], prereq: 'Bibliologia', icon: Key },
  { title: 'Homilética', desc: 'A Arte da Pregação', topics: ['Estrutura', 'Entrega', 'Panorama'], prereq: 'Hermenêutica Bíblica', icon: Mic },
];

interface TheologyPageProps {
  onNavigate: (tab: string) => void;
}

export default function TheologyPage({ onNavigate }: TheologyPageProps) {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [isEnrolled, setIsEnrolled] = useState(() => localStorage.getItem('theology_enrolled') === 'true');
  const [showSummary, setShowSummary] = useState(!isEnrolled);
  const [selectedSubject, setSelectedSubject] = useState<string | null>(null);
  const [showSubjectModal, setShowSubjectModal] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentChapter, setCurrentChapter] = useState(1);
  const [chapterContent, setChapterContent] = useState<Record<number, string>>({});
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

  // Summary Evaluation State
  const [showSummaryModal, setShowSummaryModal] = useState(false);
  const [summaryType, setSummaryType] = useState('');
  const [summaryText, setSummaryText] = useState('');
  const [isEvaluatingSummary, setIsEvaluatingSummary] = useState(false);
  const [summaryEvaluation, setSummaryEvaluation] = useState<{
    score: number;
    criteria: { label: string, penalty: number, met: boolean }[];
    message: string;
    aiFeedback?: string;
  } | null>(null);

  const [isNotebookModalOpen, setIsNotebookModalOpen] = useState(false);
  const [pendingNote, setPendingNote] = useState<{ title: string, content: string } | null>(null);

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
    });

    return () => unsubscribe();
  }, [user]);

  const handleEnroll = async () => {
    if (!user) return;
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

    showToast(`Atividade acessada! ✨`, 'success');
  };

  const handleSubjectSelect = async (subject: string) => {
    setSelectedSubject(subject);
    setShowSubjectModal(false);
    setCurrentChapter(1);
    loadChapter(subject, 1);
  };

  const loadChapter = async (subject: string, chapter: number) => {
    if (chapterContent[chapter]) return;
    
    setIsLoading(true);
    try {
      const prompt = `Gere o Capítulo ${chapter} de 5 do estudo teológico sobre "${subject}". O conteúdo deve ser profundo, acadêmico e bíblico.`;
      const response = await geminiService.generateText(prompt, "Você é um professor de teologia sistemática.");
      setChapterContent(prev => ({ ...prev, [chapter]: response }));
    } catch (error) {
      console.error(error);
      showToast("Erro ao carregar capítulo.", 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleNextChapter = () => {
    if (currentChapter < 5) {
      const next = currentChapter + 1;
      setCurrentChapter(next);
      loadChapter(selectedSubject!, next);
    }
  };

  const handlePrevChapter = () => {
    if (currentChapter > 1) {
      setCurrentChapter(currentChapter - 1);
    }
  };

  const markAsRead = async () => {
    if (!user) return;
    if (currentChapter === 5) {
      const current = theologyProgress[selectedSubject!] || {};
      const newSubjectProgress = { ...current, completed: true };
      
      const progressDocRef = doc(db, 'theologyProgress', user.id);
      await updateDoc(progressDocRef, {
        [selectedSubject!]: newSubjectProgress
      });
      
      showToast(`Parabéns! Você concluiu ${selectedSubject}! 🎓✨`, 'success');
    } else {
      showToast(`Capítulo ${currentChapter} lido! Continue para o próximo. 📖`, 'info');
      handleNextChapter();
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
    setPendingNote({
      title: `Teologia: ${selectedSubject} - Cap ${currentChapter}`,
      content: chapterContent[currentChapter]
    });
    setIsNotebookModalOpen(true);
  };

  const confirmSaveToNotebook = async (category: 'Anotações' | 'Pregações' | 'Estudos') => {
    if (!pendingNote || !user) return;
    
    try {
      const notesCollectionRef = collection(db, 'notes');
      await addDoc(notesCollectionRef, {
        userId: user.id,
        title: pendingNote.title,
        content: pendingNote.content,
        category,
        createdAt: new Date().toISOString()
      });
      
      showToast(`Salvo em ${category}! 📖✅`, 'success');
      setIsNotebookModalOpen(false);
      setPendingNote(null);
    } catch (error) {
      console.error("Error saving note:", error);
      showToast("Erro ao salvar no caderno.", 'error');
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
    
    showToast("Gerando certificado em PDF e salvando no seu perfil...", 'info');
    
    try {
      // Save to Firestore first
      const certData = {
        userId: user.id,
        subject: selectedSubject,
        date: new Date().toLocaleDateString('pt-BR'),
        issuedAt: new Date().toISOString()
      };
      
      await addDoc(collection(db, 'theologyCertificates'), certData);

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
      docPdf.text("missoeselroi@gmail.com", 236, sigY + 10, { align: 'center' });

      docPdf.save("Certificado_Teologia_Basica.pdf");
      showToast("Certificado baixado e cliente de e-mail aberto!", 'success');
      setShowCertificatePaymentModal(false);

      // Open email client
      const emailBody = `Olá, ${studentName}!\n\nParabéns por toda a sua dedicação a conhecer mais de Deus e aprender ferramentas para melhor servi-lo! É uma alegria ver você concluir o Curso de Teologia Básica.\n\nSegue em anexo o seu certificado de conclusão (que você acabou de baixar no aplicativo).\n\nNota: O certificado estará sendo assinado pelo Monitor e pelo Coordenador Pedagógico.\n\nDeus abençoe sua jornada!`;
      const mailtoLink = `mailto:${user?.email || ''}?cc=wreis29@gmail.com,missoeselroi@gmail.com&subject=Certificado de Conclusão - Teologia Básica&body=${encodeURIComponent(emailBody)}`;
      setTimeout(() => {
        window.location.href = mailtoLink;
      }, 500);
      
    } catch (error) {
      console.error("Error generating PDF:", error);
      showToast("Erro ao gerar certificado.", 'error');
    }
  };

  const openSummaryModal = (type: string) => {
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

    let score = 10;
    const criteria = [
      { label: 'Repetições excessivas', penalty: 1, met: true },
      { label: 'Palavras de baixo calão', penalty: 2, met: true },
      { label: 'Fuga do tema', penalty: 2, met: true },
      { label: 'Mínimo de 100 palavras', penalty: 1, met: true },
      { label: 'Coerência textual', penalty: 2, met: true },
    ];

    const words = (summaryText.toLowerCase().match(/\b\w+\b/g) || []) as string[];
    const wordFreq: Record<string, number> = {};
    words.forEach(w => { if(w.length > 3) wordFreq[w] = (wordFreq[w] || 0) + 1; });
    const hasExcessiveRepetition = Object.values(wordFreq).some(count => count > words.length * 0.1);
    if (hasExcessiveRepetition) { score -= 1; criteria[0].met = false; }

    const badWords = ['palavrão1', 'palavrão2'];
    const hasBadWords = words.some(w => badWords.includes(w));
    if (hasBadWords) { score -= 2; criteria[1].met = false; }

    const themeKeywords = ['deus', 'jesus', 'bíblia', 'teologia', 'espírito', 'igreja', 'fé', 'graça', 'pecado', 'salvação', 'cristo', 'senhor', 'palavra', 'ensino', 'estudo', 'resumo', 'doutrina', 'homem', 'anjos', 'escatologia', 'hermenêutica', 'homilética'];
    const hasThemeKeywords = themeKeywords.some(k => summaryText.toLowerCase().includes(k));
    if (!hasThemeKeywords) { score -= 2; criteria[2].met = false; }

    if (wordCount < 100) { score -= 1; criteria[3].met = false; }

    const sentences = summaryText.split(/[.!?]+/).filter(s => s.trim().length > 0);
    const isCoherent = sentences.length > 2 && sentences.every(s => s.trim().split(' ').length > 2);
    if (!isCoherent) { score -= 2; criteria[4].met = false; }

    let message = "";
    if (score <= 3) message = "Você pode fazer melhor! Acredite!";
    else if (score <= 5) message = "Vamos tentar de novo? Você vai conseguir!";
    else if (score === 6) message = "Foi por pouco! Na próxima vai dar certo!";
    else if (score <= 8) message = "Parabéns! Muito bom!";
    else if (score === 9) message = "Ótimo! Servo bom e fiel!";
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
        'Aprofundamento': 'redacaoAprofundamento',
        'Vídeo': 'redacaoVideo',
        'Slides': 'redacaoSlide',
        'Podcast': 'redacaoPodcast'
      };
      const field = fieldMap[summaryType];
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
          }).catch(console.error);
        }
      }
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
    } catch (error) {
      console.error("Erro ao gerar avaliação:", error);
      showToast("Erro ao gerar avaliação. Tente novamente.", 'error');
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
    
    const score = correctAnswers * 5;

    let message = "";
    if (score <= 10) message = "Tente novamente. Você é capaz!";
    else if (score <= 20) message = "Essa nota pode ser melhorada. Que tal estudar mais pouco?";
    else if (score <= 30) message = "Você pode fazer melhor. Eu confio em você!";
    else if (score <= 40) message = "Muito boa nota! Passou com louvor!";
    else if (score < 50) message = "Ótimo. Você me dá orgulho!";
    else message = "Sensacional! Você é um exemplo de dedicação! Continue assim...";

    setAssessmentResult({ score, message });

    // Save to student profile in Firestore
    const current = theologyProgress[selectedSubject!] || {};
    const newSubjectProgress = {
      ...current,
      evaluation: score,
      completed: score >= 35
    };
    
    const progressDocRef = doc(db, 'theologyProgress', user.id);
    await updateDoc(progressDocRef, {
      [selectedSubject!]: newSubjectProgress
    });
    
    showToast(`Avaliação concluída! Nota: ${score}/50`, 'success');
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
              className="flex-1 py-4 bg-emerald-600 text-white font-bold rounded-2xl hover:bg-emerald-700 shadow-lg shadow-emerald-600/20 transition-all flex items-center justify-center gap-2"
            >
              <CheckCircle size={20} />
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
                  placeholder="Busca Teológica..."
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
              const isLocked = subject.prereq && (!theologyProgress[subject.prereq] || !theologyProgress[subject.prereq].completed);
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
                      <h4 className="text-xl font-bold group-hover:text-emerald-600 transition-colors flex items-center gap-2">
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
                    {!isLocked && !isCompleted && (
                      <button
                        onClick={(e) => markSubjectAsCompleted(e, subject.title)}
                        className="px-3 py-1.5 bg-emerald-50 text-emerald-600 hover:bg-emerald-100 hover:text-emerald-700 rounded-lg transition-colors flex items-center gap-1"
                      >
                        <CheckCircle size={14} />
                        Concluir
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
                    <p className="text-amber-100">Área de formatura da Teologia Básica. Clique aqui para ver sua mensagem final e emitir seu certificado.</p>
                  </div>
                  <div className="mt-4 md:mt-0 px-6 py-3 bg-white text-amber-600 font-bold rounded-xl flex items-center gap-2 group-hover:bg-amber-50 transition-colors">
                    Acessar <ArrowRight size={18} />
                  </div>
                </div>
              </button>
            )}
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
                            missoeselroi@gmail.com
                          </code>
                          <button 
                            onClick={() => { navigator.clipboard.writeText('missoeselroi@gmail.com'); showToast('Chave PIX copiada!'); }}
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
                        <span className="text-[10px] font-bold uppercase tracking-wider">Resumo<br/>(+10 pts)</span>
                      </button>
                    </div>

                    <div className="flex gap-2">
                      <button 
                        onClick={() => {
                          showToast("Iniciando Imersão Profunda... 🌊", 'info');
                          handleSubjectSelect(selectedSubject);
                        }}
                        className="flex-1 p-6 bg-stone-50 dark:bg-zinc-800/50 hover:bg-blue-50 dark:hover:bg-blue-900/20 border border-stone-100 dark:border-zinc-700 rounded-3xl flex items-center gap-4 transition-all group"
                      >
                        <div className="p-3 bg-blue-100 dark:bg-blue-900/30 text-blue-600 rounded-xl group-hover:scale-110 transition-transform">
                          <Sparkles size={24} />
                        </div>
                        <div className="text-left">
                          <div className="font-bold">Aprofundamento</div>
                          <div className="text-xs text-stone-500">Imersão Teológica Aprofundada</div>
                        </div>
                      </button>
                      <button
                        onClick={() => openSummaryModal('Aprofundamento')}
                        className="p-4 bg-stone-50 dark:bg-zinc-800/50 hover:bg-stone-100 dark:hover:bg-zinc-700 border border-stone-100 dark:border-zinc-700 rounded-3xl flex flex-col items-center justify-center gap-2 transition-all text-stone-600 dark:text-zinc-400 w-24"
                      >
                        <FileText size={20} />
                        <span className="text-[10px] font-bold uppercase tracking-wider">Resumo<br/>(+10 pts)</span>
                      </button>
                    </div>

                    <div className="flex gap-2">
                      <button 
                        onClick={() => updateDetailedProgress(selectedSubject, 'video')}
                        className="flex-1 p-6 bg-stone-50 dark:bg-zinc-800/50 hover:bg-red-50 dark:hover:bg-red-900/20 border border-stone-100 dark:border-zinc-700 rounded-3xl flex items-center gap-4 transition-all group"
                      >
                        <div className="p-3 bg-red-100 dark:bg-red-900/30 text-red-600 rounded-xl group-hover:scale-110 transition-transform">
                          <Play size={24} />
                        </div>
                        <div className="text-left">
                          <div className="font-bold">Vídeo</div>
                          <div className="text-xs text-stone-500">Assista à vídeo-aula</div>
                        </div>
                      </button>
                      <button
                        onClick={() => openSummaryModal('Vídeo')}
                        className="p-4 bg-stone-50 dark:bg-zinc-800/50 hover:bg-stone-100 dark:hover:bg-zinc-700 border border-stone-100 dark:border-zinc-700 rounded-3xl flex flex-col items-center justify-center gap-2 transition-all text-stone-600 dark:text-zinc-400 w-24"
                      >
                        <FileText size={20} />
                        <span className="text-[10px] font-bold uppercase tracking-wider">Resumo<br/>(+10 pts)</span>
                      </button>
                    </div>

                    <div className="flex gap-2">
                      <button 
                        onClick={() => updateDetailedProgress(selectedSubject, 'slides')}
                        className="flex-1 p-6 bg-stone-50 dark:bg-zinc-800/50 hover:bg-amber-50 dark:hover:bg-amber-900/20 border border-stone-100 dark:border-zinc-700 rounded-3xl flex items-center gap-4 transition-all group"
                      >
                        <div className="p-3 bg-amber-100 dark:bg-amber-900/30 text-amber-600 rounded-xl group-hover:scale-110 transition-transform">
                          <Presentation size={24} />
                        </div>
                        <div className="text-left">
                          <div className="font-bold">Slides</div>
                          <div className="text-xs text-stone-500">Apresentação visual</div>
                        </div>
                      </button>
                      <button
                        onClick={() => openSummaryModal('Slides')}
                        className="p-4 bg-stone-50 dark:bg-zinc-800/50 hover:bg-stone-100 dark:hover:bg-zinc-700 border border-stone-100 dark:border-zinc-700 rounded-3xl flex flex-col items-center justify-center gap-2 transition-all text-stone-600 dark:text-zinc-400 w-24"
                      >
                        <FileText size={20} />
                        <span className="text-[10px] font-bold uppercase tracking-wider">Resumo<br/>(+10 pts)</span>
                      </button>
                    </div>

                    <div className="flex gap-2">
                      <button 
                        onClick={() => updateDetailedProgress(selectedSubject, 'podcast')}
                        className="flex-1 p-6 bg-stone-50 dark:bg-zinc-800/50 hover:bg-purple-50 dark:hover:bg-purple-900/20 border border-stone-100 dark:border-zinc-700 rounded-3xl flex items-center gap-4 transition-all group"
                      >
                        <div className="p-3 bg-purple-100 dark:bg-purple-900/30 text-purple-600 rounded-xl group-hover:scale-110 transition-transform">
                          <Mic size={24} />
                        </div>
                        <div className="text-left">
                          <div className="font-bold">Podcast</div>
                          <div className="text-xs text-stone-500">Ouça o resumo em áudio</div>
                        </div>
                      </button>
                      <button
                        onClick={() => openSummaryModal('Podcast')}
                        className="p-4 bg-stone-50 dark:bg-zinc-800/50 hover:bg-stone-100 dark:hover:bg-zinc-700 border border-stone-100 dark:border-zinc-700 rounded-3xl flex flex-col items-center justify-center gap-2 transition-all text-stone-600 dark:text-zinc-400 w-24"
                      >
                        <FileText size={20} />
                        <span className="text-[10px] font-bold uppercase tracking-wider">Resumo<br/>(+10 pts)</span>
                      </button>
                    </div>
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
                          placeholder="Digite o resumo do que você aprendeu..."
                          className="w-full h-64 p-6 bg-stone-50 dark:bg-zinc-800/50 border border-stone-200 dark:border-zinc-700 rounded-3xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none resize-none transition-all"
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
                  <p className="text-stone-500 text-sm">Capítulo {currentChapter} de 5</p>
                </div>
              </div>
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map(i => (
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
              {isLoading ? (
                <div className="absolute inset-0 flex flex-col items-center justify-center space-y-4">
                  <Loader2 className="animate-spin text-emerald-600" size={48} />
                  <p className="text-stone-500 font-medium animate-pulse">Buscando sabedoria teológica...</p>
                </div>
              ) : (
                <div className="prose dark:prose-invert max-w-none">
                  <MarkdownRenderer content={chapterContent[currentChapter] || ''} />
                </div>
              )}
            </div>
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
                      navigator.clipboard.writeText(chapterContent[currentChapter]);
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
                    if (navigator.share && chapterContent[currentChapter]) {
                      try {
                        await navigator.share({
                          title: `Teologia: ${selectedSubject} - Cap ${currentChapter}`,
                          text: chapterContent[currentChapter],
                        });
                      } catch (err) { console.error(err); }
                    }
                  }}
                  className="p-3 md:p-4 bg-stone-100 dark:bg-zinc-800 text-stone-600 dark:text-zinc-300 rounded-2xl hover:bg-stone-200 transition-all"
                  title="Compartilhar"
                >
                  <Share2 size={20} />
                </button>
                <button 
                  onClick={startAssessment}
                  className="flex-1 min-w-[140px] py-3 md:py-4 bg-emerald-600 text-white font-bold rounded-2xl hover:bg-emerald-700 shadow-lg shadow-emerald-600/20 transition-all flex items-center justify-center gap-2 text-sm md:text-base"
                >
                  <Brain size={20} />
                  <span className="hidden sm:inline">AVALIAÇÃO (+50 pts)</span>
                  <span className="sm:hidden">AVALIAÇÃO (+50 pts)</span>
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

      <SaveToNotebookModal
        isOpen={isNotebookModalOpen}
        onClose={() => setIsNotebookModalOpen(false)}
        onConfirm={confirmSaveToNotebook}
      />

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
                        assessmentResult.score >= 35 ? "border-emerald-500 text-emerald-600" : "border-amber-500 text-amber-600"
                      )}>
                        {assessmentResult.score}/50
                      </div>
                      {assessmentResult.score >= 35 && (
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
    </div>
  );
}
